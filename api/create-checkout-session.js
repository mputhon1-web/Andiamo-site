// Crée une session de paiement Stripe pour le panier du client.
// IMPORTANT : les prix sont définis ICI, côté serveur. Le navigateur n'envoie que les noms
// des articles ; il est donc impossible de modifier le montant à payer depuis le site.
import Stripe from 'stripe';

// Prix en centimes d'euro. Si la carte change, modifiez ici ET dans index.html.
const MENU = {
  'Margherita': 950,
  'Reine': 1150,
  'Végétarienne': 1150,
  '4 Fromages': 1250,
  'Chèvre miel': 1290,
  'Mortadelle & olives': 1250,
  'Calzone': 1200,
  'Kebab frites': 900,
  'Boisson 33cl': 250,
};

const json = (body, status = 200) => Response.json(body, { status });

// Nettoie un texte saisi par le client (retire caractères de contrôle et < >).
const clean = (value, max) =>
  String(value ?? '').replace(/[\u0000-\u001F\u007F<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

export async function POST(request) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'Requête invalide.' }, 400);
  }

  // 1) Panier : uniquement des articles connus, quantité raisonnable.
  const items = Array.isArray(data?.items) ? data.items : null;
  if (!items || items.length === 0 || items.length > 50) {
    return json({ error: 'Panier invalide.' }, 400);
  }
  const counts = new Map();
  for (const name of items) {
    if (typeof name !== 'string' || !Object.hasOwn(MENU, name)) {
      return json({ error: 'Article inconnu dans le panier.' }, 400);
    }
    counts.set(name, (counts.get(name) || 0) + 1);
  }

  // 2) Coordonnées du client.
  const c = data?.customer || {};
  const name = clean(c.name, 80);
  const phone = clean(c.phone, 30);
  const orderType = c.orderType === 'delivery' ? 'delivery' : 'pickup';
  const address = orderType === 'delivery' ? clean(c.address, 200) : '';
  const time = /^\d{2}:\d{2}$/.test(String(c.time || '')) ? String(c.time) : '';

  if (!name) return json({ error: 'Le nom est obligatoire.' }, 400);
  if (phone.replace(/\D/g, '').length < 8) return json({ error: 'Le numéro de téléphone est invalide.' }, 400);
  if (orderType === 'delivery' && address.length < 8) {
    return json({ error: "L'adresse de livraison est incomplète." }, 400);
  }

  // 3) Session Stripe (montants issus de MENU, jamais du navigateur).
  const line_items = [...counts].map(([itemName, quantity]) => ({
    quantity,
    price_data: {
      currency: 'eur',
      unit_amount: MENU[itemName],
      product_data: { name: itemName },
    },
  }));

  const displayId = 'CMD-' + Math.floor(10000 + Math.random() * 90000);
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const base = process.env.SITE_URL || `${proto}://${host}`;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'fr',
      line_items,
      success_url: `${base}/?paid=1&ref=${displayId}`,
      cancel_url: `${base}/?canceled=1`,
      metadata: { displayId, name, phone, time, orderType, address },
      payment_intent_data: { description: `Commande ${displayId} - Pizzeria Andiamo` },
    });
    return json({ url: session.url });
  } catch (err) {
    console.error('Erreur Stripe (création de session) :', err?.message || err);
    return json({ error: 'Paiement momentanément indisponible. Réessayez dans un instant.' }, 500);
  }
}
