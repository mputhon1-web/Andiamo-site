// Reçoit la confirmation de paiement envoyée par Stripe et enregistre la commande
// (déjà payée) dans Firestore, où l'espace professionnel la voit aussitôt.
import Stripe from 'stripe';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

function getDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Les retours à la ligne de la clé privée sont souvent collés sous la forme "\n".
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

async function saveOrder(stripe, session) {
  const m = session.metadata || {};

  // Le détail des articles vient de Stripe (fiable), pas du navigateur.
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
  const items = [];
  for (const li of lineItems.data) {
    for (let i = 0; i < (li.quantity || 1); i++) items.push(li.description);
  }

  const order = {
    displayId: m.displayId || session.id.slice(-8).toUpperCase(),
    name: m.name || 'Client',
    phone: m.phone || '',
    time: m.time || '',
    orderType: m.orderType === 'delivery' ? 'delivery' : 'pickup',
    address: m.address || '',
    items,
    total: (session.amount_total / 100).toFixed(2),
    status: 'new',
    paid: true,
    paymentStatus: 'paid',
    stripeSessionId: session.id,
    stripePaymentIntent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    customerEmail: session.customer_details?.email || null,
    createdAtISO: new Date().toISOString(),
    createdAt: FieldValue.serverTimestamp(),
  };

  try {
    // L'identifiant du document = celui de la session Stripe :
    // si Stripe renvoie deux fois le même événement, la commande n'est enregistrée qu'une fois.
    await getDb().collection('orders').doc(session.id).create(order);
  } catch (err) {
    if (err?.code === 6 || /ALREADY_EXISTS/.test(String(err?.message))) return;
    throw err;
  }
}

export async function POST(request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = request.headers.get('stripe-signature');
  const rawBody = await request.text(); // le corps brut est indispensable pour vérifier la signature

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Signature Stripe invalide :', err?.message || err);
    return new Response('Signature invalide', { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object;
      if (session.payment_status === 'paid') {
        await saveOrder(stripe, session);
      }
    }
  } catch (err) {
    console.error('Erreur enregistrement commande :', err?.message || err);
    return new Response('Erreur serveur', { status: 500 }); // Stripe réessaiera automatiquement
  }

  return Response.json({ received: true });
}
