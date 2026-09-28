// ====== CONFIGURATION FIREBASE (à remplacer) ======
  // Récupérez ces valeurs dans la console Firebase :
  // Paramètres du projet > Vos applications > icône Web (config du SDK).
  const firebaseConfig = {
    apiKey: "AIzaSyD6H-qk1jB7WMXNZtwn4xmADjrXqEa-Y2M",
    authDomain: "andiamo-58744.firebaseapp.com",
    projectId: "andiamo-58744",
    storageBucket: "andiamo-58744.firebasestorage.app",
    messagingSenderId: "638709781858",
    appId: "1:638709781858:web:49f94340ec838c22efc83b"
  };
  // E-mail du compte qui doit voir le panneau complet (gérante).
  // Tout autre compte connecté verra le panneau "cuisine" limité.
  const OWNER_EMAIL = "m.puton1@gmail.com";

  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const auth = firebase.auth();
  const ordersRef = db.collection('orders');
  // ====================================================

  // Échappe le texte saisi par les clients avant de l'afficher (empêche l'injection de code dans l'espace pro).
  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // Mettre à false quand Stripe passe en mode réel (supprime le message "carte de test").
  const TEST_MODE = true;

  // Le panier survit à un aller-retour vers la page de paiement Stripe (bouton "retour").
  let cart = [];
  try{
    const saved = JSON.parse(sessionStorage.getItem('andiamo_cart') || '[]');
    if(Array.isArray(saved)) cart = saved.filter(i => i && typeof i.name === 'string' && typeof i.price === 'number');
  } catch(err){}

  function updateCartUI(){
    try{ sessionStorage.setItem('andiamo_cart', JSON.stringify(cart)); } catch(err){}
    document.getElementById('cartCount').textContent = cart.reduce((s,i)=>s+1,0);
    const itemsEl = document.getElementById('drawerItems');
    itemsEl.innerHTML = '';
    let total = 0;
    cart.forEach((item, idx)=>{
      total += item.price;
      const row = document.createElement('div');
      row.className = 'drawer-item';
      row.innerHTML = `<span>${esc(item.name)}</span><span>${item.price.toFixed(2).replace('.',',')} € <button onclick="removeItem(${idx})">&times;</button></span>`;
      itemsEl.appendChild(row);
    });
    if(cart.length===0){ itemsEl.innerHTML = '<p style="opacity:.6; font-size:0.88rem;">Votre panier est vide.</p>'; }
    document.getElementById('drawerTotal').textContent = total.toFixed(2).replace('.',',') + ' €';
    document.getElementById('checkoutFields').classList.remove('open');
    document.getElementById('toCheckoutBtn').style.display = cart.length ? 'block' : 'none';
  }

  function addToCart(name, price){
    cart.push({name, price});
    updateCartUI();
    const fab = document.getElementById('cartFab');
    fab.classList.remove('bump');
    void fab.offsetWidth;
    fab.classList.add('bump');
  }
  function removeItem(idx){ cart.splice(idx,1); updateCartUI(); }

  function openCart(){ document.getElementById('overlay').classList.add('open'); document.getElementById('drawer').classList.add('open'); updateCartUI(); }
  function closeCart(){ document.getElementById('overlay').classList.remove('open'); document.getElementById('drawer').classList.remove('open'); }

  function toggleAddressFields(){
    const isDelivery = document.querySelector('input[name="orderType"]:checked').value === 'delivery';
    document.getElementById('addressFields').classList.toggle('open', isDelivery);
  }

  // Suggestions d'adresse (API Adresse - data.gouv.fr, gratuite, sans clé).
  // Fonctionne une fois le site hébergé sur votre propre domaine (GitHub Pages) ;
  // peut être bloqué dans certains aperçus (ex. artefact claude.ai).
  let addrTimer = null;
  function onAddressInput(){
    clearTimeout(addrTimer);
    const q = document.getElementById('custAddress').value.trim();
    const box = document.getElementById('addrSuggestions');
    if(q.length < 3){ box.classList.remove('open'); box.innerHTML=''; return; }
    addrTimer = setTimeout(async ()=>{
      try{
        const res = await fetch('https://api-adresse.data.gouv.fr/search/?q=' + encodeURIComponent(q) + '&limit=5');
        const data = await res.json();
        box.innerHTML = '';
        (data.features || []).forEach(f=>{
          const p = f.properties;
          const div = document.createElement('div');
          div.textContent = p.label;
          div.onclick = ()=>{
            document.getElementById('custAddress').value = p.name || p.label;
            document.getElementById('custPostal').value = p.postcode || '';
            document.getElementById('custCity').value = p.city || '';
            box.classList.remove('open');
            box.innerHTML = '';
          };
          box.appendChild(div);
        });
        box.classList.toggle('open', (data.features||[]).length > 0);
      } catch(err){
        box.classList.remove('open');
      }
    }, 300);
  }
  document.addEventListener('click', function(e){
    if(!e.target.closest('.addr-wrap')){
      document.getElementById('addrSuggestions').classList.remove('open');
    }
  });

  // Profil client mémorisé sur cet appareil (nom, téléphone, adresse) - jamais les commandes ni le paiement.
  function saveCustomerProfile(){
    const profile = {
      name: document.getElementById('custName').value.trim(),
      phone: document.getElementById('custPhone').value.trim(),
      address: document.getElementById('custAddress').value.trim(),
      postal: document.getElementById('custPostal').value.trim(),
      city: document.getElementById('custCity').value.trim(),
    };
    localStorage.setItem('andiamo_customer', JSON.stringify(profile));
  }
  function loadCustomerProfile(){
    try{
      const p = JSON.parse(localStorage.getItem('andiamo_customer') || 'null');
      if(!p) return;
      document.getElementById('custName').value = p.name || '';
      document.getElementById('custPhone').value = p.phone || '';
      document.getElementById('custAddress').value = p.address || '';
      document.getElementById('custPostal').value = p.postal || '';
      document.getElementById('custCity').value = p.city || '';
    } catch(err){}
  }

  function goToCheckout(){
    if(cart.length===0) return;
    document.getElementById('checkoutFields').classList.add('open');
    loadCustomerProfile();
    setTimeout(()=> document.getElementById('checkoutFields').scrollIntoView({behavior:'smooth', block:'start'}), 50);
  }

  // Paiement : le navigateur n'envoie QUE les noms des articles et les coordonnées du client.
  // Les prix et le total sont recalculés par le serveur (impossible de tricher sur le montant).
  const PAY_LABEL = 'Commander avec obligation de paiement';
  async function checkout(){
    if(cart.length === 0) return;
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const time = document.getElementById('custTime').value;
    const orderType = document.querySelector('input[name="orderType"]:checked').value;
    if(!name){ alert('Merci d\'indiquer votre nom.'); return; }
    if(phone.replace(/\D/g,'').length < 8){ alert('Merci d\'indiquer un numéro de téléphone valide.'); return; }
    let address = '';
    if(orderType === 'delivery'){
      const a = document.getElementById('custAddress').value.trim();
      const p = document.getElementById('custPostal').value.trim();
      const c = document.getElementById('custCity').value.trim();
      if(!a || !p || !c){ alert('Merci de compléter l\'adresse de livraison (rue, code postal, ville).'); return; }
      address = [a, p, c].join(', ');
    }
    const payBtn = document.getElementById('payBtn');
    payBtn.disabled = true;
    payBtn.textContent = 'Redirection vers le paiement…';
    try{
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          items: cart.map(i => i.name),
          customer: {name, phone, time, orderType, address}
        })
      });
      let data = null;
      try{ data = await res.json(); } catch(err){}
      if(!res.ok || !data || !data.url){
        throw new Error((data && data.error) || 'Le paiement en ligne n\'est pas disponible sur cette adresse.');
      }
      saveCustomerProfile();
      window.location.href = data.url;
    } catch(err){
      alert('Le paiement n\'a pas pu démarrer.\n' + err.message);
      payBtn.disabled = false;
      payBtn.textContent = PAY_LABEL;
    }
  }

  // Message affiché au retour de la page de paiement Stripe.
  function showBanner(text, kind){
    const b = document.getElementById('banner');
    b.textContent = text;
    b.classList.toggle('warn', kind === 'warn');
    b.classList.add('show');
    setTimeout(()=> b.classList.remove('show'), 12000);
  }
  (function handleReturnFromStripe(){
    const p = new URLSearchParams(location.search);
    if(p.get('paid') === '1'){
      const ref = (p.get('ref') || '').replace(/[^A-Za-z0-9-]/g, '').slice(0, 20);
      cart = [];
      try{ sessionStorage.removeItem('andiamo_cart'); } catch(err){}
      showBanner('✅ Paiement reçu, merci ! ' + (ref ? 'Votre commande ' + ref + ' est transmise à la pizzeria.' : 'Votre commande est transmise à la pizzeria.'));
    } else if(p.get('canceled') === '1'){
      showBanner('Paiement annulé : vous n\'avez pas été débité. Votre panier est conservé.', 'warn');
    } else {
      return;
    }
    history.replaceState(null, '', location.pathname);
  })();

  if(TEST_MODE){
    const h = document.getElementById('testHint');
    h.style.display = 'block';
    h.textContent = 'Mode démonstration : payez avec la carte de test 4242 4242 4242 4242, une date future et un code CVC au choix. Aucun prélèvement réel.';
  }

  // ADMIN
  let currentRole = null; // 'admin' (gérante) ou 'staff' (cuisine)
  function showAdminLogin(){
    document.getElementById('siteView').classList.add('hidden');
    document.getElementById('adminView').classList.add('open');
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
  }
  function hideAdmin(){
    document.getElementById('siteView').classList.remove('hidden');
    document.getElementById('adminView').classList.remove('open');
    if(unsubscribeOrders){ unsubscribeOrders(); unsubscribeOrders = null; }
    currentRole = null;
    document.getElementById('adminPanel').classList.remove('staff-mode');
    auth.signOut();
  }
  async function tryAdminLogin(){
    const email = document.getElementById('adminEmail').value.trim();
    const pass = document.getElementById('adminPass').value;
    const loginBtn = document.querySelector('#adminLogin .btn-primary');
    if(loginBtn){ loginBtn.disabled = true; loginBtn.textContent = 'Connexion...'; }
    try{
      const cred = await auth.signInWithEmailAndPassword(email, pass);
      currentRole = (cred.user.email === OWNER_EMAIL) ? 'admin' : 'staff';
      const panel = document.getElementById('adminPanel');
      panel.classList.toggle('staff-mode', currentRole === 'staff');
      document.getElementById('adminBarTitle').textContent =
        currentRole === 'admin' ? 'Commandes — Pizzeria Andiamo' : 'Cuisine — Pizzeria Andiamo';
      document.getElementById('adminLogin').style.display = 'none';
      panel.style.display = 'block';
      startOrdersListener();
      if(currentRole === 'admin') populateInvoiceSelects();
    } catch(err){
      alert("Adresse e-mail ou mot de passe incorrect.");
    }
    if(loginBtn){ loginBtn.disabled = false; loginBtn.textContent = 'Se connecter'; }
  }

  // Écoute en temps réel : chaque changement (nouvelle commande, statut, suppression)
  // est reçu instantanément sur tous les appareils connectés, grâce à Firestore.
  let unsubscribeOrders = null;
  let latestOrders = [];
  function startOrdersListener(){
    if(unsubscribeOrders) unsubscribeOrders();
    unsubscribeOrders = ordersRef.orderBy('createdAt', 'desc').onSnapshot(snapshot => {
      latestOrders = [];
      snapshot.forEach(doc => latestOrders.push({...doc.data(), _docId: doc.id}));
      renderOrders();
    }, err => {
      console.error(err);
    });
  }

  function renderOrders(){
    const cols = {new: document.getElementById('col-new'), progress: document.getElementById('col-progress'), done: document.getElementById('col-done')};
    Object.values(cols).forEach(c=>c.innerHTML='');
    const counts = {new:0, progress:0, done:0};
    latestOrders.forEach(o=>{
      if(!cols[o.status]) return;
      counts[o.status]++;
      const card = document.createElement('div');
      card.className = 'order-card';
      let moveBtns = '';
      if(o.status==='new') moveBtns += `<button class="mv" onclick="setStatus('${o._docId}','progress')">En préparation</button>`;
      if(o.status==='progress') moveBtns += `<button class="mv" onclick="setStatus('${o._docId}','done')">Marquer prête</button>`;
      if(o.status==='done') moveBtns += `<button class="mv" onclick="setStatus('${o._docId}','progress')">Rouvrir</button>`;
      const deleteBtn = currentRole === 'admin'
        ? `<button class="del" onclick="deleteOrder('${o._docId}')">Supprimer</button>` : '';
      const typeLabel = o.orderType === 'delivery'
        ? '🚴 Livraison — ' + (esc(o.address) || 'adresse non précisée')
        : '🏠 Retrait sur place';
      const paidTag = o.paid ? '<div style="font-size:0.8rem; font-weight:700; color:#2f6b2f;">✅ Payée en ligne</div>' : '';
      card.innerHTML = `
        <div class="oid">${esc(o.displayId || o._docId)} — ${esc(o.total)} €</div>
        ${paidTag}
        <div style="font-size:0.8rem; opacity:.7;">${esc(o.name)}${o.phone? ' · '+esc(o.phone):''}</div>
        <div style="font-size:0.78rem; margin-top:4px;">${typeLabel}</div>
        <ul>${(o.items||[]).map(i=>'<li>'+esc(i)+'</li>').join('')}</ul>
        <div style="font-size:0.78rem;">Heure souhaitée : <strong>${esc(o.time) || 'non précisée'}</strong></div>
        <div class="oactions">${moveBtns}${deleteBtn}</div>
      `;
      cols[o.status].appendChild(card);
    });
    Object.entries(cols).forEach(([key,el])=>{
      if(counts[key]===0){ el.innerHTML = '<div class="empty-col">Aucune commande</div>'; }
    });
  }
  function setStatus(docId, status){
    ordersRef.doc(docId).update({status});
    // Pas besoin d'appeler renderOrders() : l'écoute en temps réel (onSnapshot) le fait automatiquement.
  }
  function deleteOrder(docId){
    ordersRef.doc(docId).delete();
  }

  // FACTURES / PDF
  const FR_MONTHS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

  function populateInvoiceSelects(){
    const monthSel = document.getElementById('monthSelect');
    const yearSel = document.getElementById('yearSelect');
    monthSel.innerHTML = ''; yearSel.innerHTML = '';
    const now = new Date();
    for(let i=0; i<12; i++){
      const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
      const value = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
      const label = FR_MONTHS[d.getMonth()] + ' ' + d.getFullYear();
      monthSel.innerHTML += `<option value="${value}">${label}</option>`;
    }
    const curYear = now.getFullYear();
    for(let y = curYear; y >= curYear-3; y--){
      yearSel.innerHTML += `<option value="${y}">${y}</option>`;
    }
  }

  async function downloadInvoice(kind){
    if(!window.jspdf || !window.jspdf.jsPDF){
      alert('La bibliothèque PDF n\'a pas pu se charger (vérifiez la connexion internet), puis rechargez la page et réessayez.');
      return;
    }
    const snapshot = await ordersRef.get();
    const parseDate = o => o.createdAtISO ? new Date(o.createdAtISO) : (o.createdAt && o.createdAt.toDate ? o.createdAt.toDate() : null);
    const orders = [];
    snapshot.forEach(doc=>{
      const o = doc.data();
      const d = parseDate(o);
      if(d && !isNaN(d)) orders.push({...o, _docId: doc.id, _date: d});
    });
    let filtered, label, slug;
    if(kind === 'month'){
      const val = document.getElementById('monthSelect').value; // YYYY-MM
      const [y,m] = val.split('-');
      filtered = orders.filter(o=> o._date.getFullYear()===parseInt(y) && (o._date.getMonth()+1)===parseInt(m));
      const monthIdx = parseInt(m)-1;
      label = FR_MONTHS[monthIdx] + ' ' + y;
      slug = val;
    } else {
      const y = document.getElementById('yearSelect').value;
      filtered = orders.filter(o=> o._date.getFullYear()===parseInt(y));
      label = 'Année ' + y;
      slug = y;
    }

    if(filtered.length === 0){
      alert('Aucune commande enregistrée sur cette période.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Pizzeria Andiamo', 14, 20);
    doc.setFontSize(11);
    doc.text('Récapitulatif des commandes en ligne', 14, 28);
    doc.text('Période : ' + label, 14, 36);

    let y = 50;
    doc.setFontSize(10);
    doc.text('N° commande', 14, y);
    doc.text('Date', 90, y);
    doc.text('Montant', 165, y);
    y += 4;
    doc.line(14, y, 196, y);
    y += 8;

    let total = 0;
    filtered.sort((a,b)=> a._date - b._date);
    filtered.forEach(o=>{
      if(y > 275){ doc.addPage(); y = 20; }
      doc.text(o.displayId || o._docId, 14, y);
      doc.text(o._date.toLocaleDateString('fr-FR'), 90, y);
      doc.text(o.total.replace('.',',') + ' €', 165, y);
      total += parseFloat(o.total);
      y += 7;
    });

    y += 4;
    doc.line(14, y, 196, y);
    y += 10;
    doc.setFontSize(12);
    doc.text('Nombre de commandes : ' + filtered.length, 14, y);
    y += 8;
    doc.text('Chiffre d\'affaires : ' + total.toFixed(2).replace('.',',') + ' €', 14, y);

    y += 16;
    doc.setFontSize(8);
    doc.text('Document généré automatiquement à partir des commandes passées en ligne (site de démonstration).', 14, y);

    triggerDownload(doc, 'factures-andiamo-' + slug + '.pdf');
  }

  // Déclenche un vrai téléchargement (dossier Téléchargements sur ordinateur, stockage sur téléphone).
  async function triggerDownload(doc, filename){
    const blob = doc.output('blob');
    try{
      if(window.claude && window.claude.use){
        const downloads = await window.claude.use('downloads');
        if(downloads){
          await downloads.save({filename, data: blob});
          return;
        }
      }
    } catch(err){
      // pas grave, on retombe sur le téléchargement navigateur classique ci-dessous
    }
    try{
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(()=> URL.revokeObjectURL(url), 4000);
    } catch(err){
      // Repli : ouvre le PDF dans un nouvel onglet pour un enregistrement manuel.
      doc.output('dataurlnewwindow');
    }
  }

  function populateTimeOptions(){
    const sel = document.getElementById('custTime');
    sel.innerHTML = '<option value="">-- Choisir une heure --</option>';
    for(let h = 11; h <= 21; h++){
      for(let m = 0; m < 60; m += 15){
        if(h === 21 && m > 45) continue;
        const val = String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0');
        sel.innerHTML += `<option value="${val}">${val}</option>`;
      }
    }
  }

  updateCartUI();
  populateTimeOptions();
