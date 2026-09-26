let cart = [];

  function updateCartUI(){
    document.getElementById('cartCount').textContent = cart.reduce((s,i)=>s+1,0);
    const itemsEl = document.getElementById('drawerItems');
    itemsEl.innerHTML = '';
    let total = 0;
    cart.forEach((item, idx)=>{
      total += item.price;
      const row = document.createElement('div');
      row.className = 'drawer-item';
      row.innerHTML = `<span>${item.name}</span><span>${item.price.toFixed(2).replace('.',',')} € <button onclick="removeItem(${idx})">&times;</button></span>`;
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
    openCart();
  }
  function removeItem(idx){ cart.splice(idx,1); updateCartUI(); }

  function openCart(){ document.getElementById('overlay').classList.add('open'); document.getElementById('drawer').classList.add('open'); updateCartUI(); }
  function closeCart(){ document.getElementById('overlay').classList.remove('open'); document.getElementById('drawer').classList.remove('open'); }

  function goToCheckout(){
    if(cart.length===0) return;
    document.getElementById('checkoutFields').classList.add('open');
  }

  function fakePay(){
    const name = document.getElementById('custName').value.trim() || 'Client';
    const phone = document.getElementById('custPhone').value.trim();
    const time = document.getElementById('custTime').value;
    if(cart.length===0) return;
    const total = cart.reduce((s,i)=>s+i.price,0);
    const order = {
      id: 'CMD-' + Math.floor(1000+Math.random()*9000),
      name, phone, time,
      items: cart.map(i=>i.name),
      total: total.toFixed(2),
      status: 'new',
      created: new Date().toLocaleString('fr-FR'),
      timestamp: new Date().toISOString()
    };
    let orders = JSON.parse(localStorage.getItem('andiamo_orders') || '[]');
    orders.push(order);
    localStorage.setItem('andiamo_orders', JSON.stringify(orders));
    cart = [];
    updateCartUI();
    closeCart();
    alert('Paiement (démo) accepté !\nVotre commande ' + order.id + ' a été envoyée à la pizzeria.');
  }

  // ADMIN
  function showAdminLogin(){
    document.getElementById('siteView').classList.add('hidden');
    document.getElementById('adminView').classList.add('open');
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
  }
  function hideAdmin(){
    document.getElementById('siteView').classList.remove('hidden');
    document.getElementById('adminView').classList.remove('open');
  }
  function tryAdminLogin(){
    const pass = document.getElementById('adminPass').value;
    if(pass === 'andiamo'){
      document.getElementById('adminLogin').style.display = 'none';
      document.getElementById('adminPanel').style.display = 'block';
      renderOrders();
      populateInvoiceSelects();
    } else {
      alert('Mot de passe incorrect (démo : "andiamo")');
    }
  }

  function renderOrders(){
    let orders = JSON.parse(localStorage.getItem('andiamo_orders') || '[]');
    const cols = {new: document.getElementById('col-new'), progress: document.getElementById('col-progress'), done: document.getElementById('col-done')};
    Object.values(cols).forEach(c=>c.innerHTML='');
    const counts = {new:0, progress:0, done:0};
    orders.forEach((o, idx)=>{
      counts[o.status]++;
      const card = document.createElement('div');
      card.className = 'order-card';
      let moveBtns = '';
      if(o.status==='new') moveBtns += `<button class="mv" onclick="setStatus(${idx},'progress')">En préparation</button>`;
      if(o.status==='progress') moveBtns += `<button class="mv" onclick="setStatus(${idx},'done')">Marquer prête</button>`;
      if(o.status==='done') moveBtns += `<button class="mv" onclick="setStatus(${idx},'progress')">Rouvrir</button>`;
      card.innerHTML = `
        <div class="oid">${o.id} — ${o.total} €</div>
        <div style="font-size:0.8rem; opacity:.7;">${o.name}${o.phone? ' · '+o.phone:''}</div>
        <ul>${o.items.map(i=>'<li>'+i+'</li>').join('')}</ul>
        <div style="font-size:0.78rem;">Retrait souhaité : <strong>${o.time || 'non précisé'}</strong></div>
        <div class="oactions">${moveBtns}<button class="del" onclick="deleteOrder(${idx})">Supprimer</button></div>
      `;
      cols[o.status].appendChild(card);
    });
    Object.entries(cols).forEach(([key,el])=>{
      if(counts[key]===0){ el.innerHTML = '<div class="empty-col">Aucune commande</div>'; }
    });
  }
  function setStatus(idx, status){
    let orders = JSON.parse(localStorage.getItem('andiamo_orders') || '[]');
    orders[idx].status = status;
    localStorage.setItem('andiamo_orders', JSON.stringify(orders));
    renderOrders();
  }
  function deleteOrder(idx){
    let orders = JSON.parse(localStorage.getItem('andiamo_orders') || '[]');
    orders.splice(idx,1);
    localStorage.setItem('andiamo_orders', JSON.stringify(orders));
    renderOrders();
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

  function downloadInvoice(kind){
    const orders = JSON.parse(localStorage.getItem('andiamo_orders') || '[]').filter(o=>o.timestamp);
    let filtered, label, slug;
    if(kind === 'month'){
      const val = document.getElementById('monthSelect').value; // YYYY-MM
      const [y,m] = val.split('-');
      filtered = orders.filter(o=>{
        const d = new Date(o.timestamp);
        return d.getFullYear()===parseInt(y) && (d.getMonth()+1)===parseInt(m);
      });
      const monthIdx = parseInt(m)-1;
      label = FR_MONTHS[monthIdx] + ' ' + y;
      slug = val;
    } else {
      const y = document.getElementById('yearSelect').value;
      filtered = orders.filter(o=> new Date(o.timestamp).getFullYear()===parseInt(y));
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
    filtered.sort((a,b)=> new Date(a.timestamp) - new Date(b.timestamp));
    filtered.forEach(o=>{
      if(y > 275){ doc.addPage(); y = 20; }
      doc.text(o.id, 14, y);
      doc.text(new Date(o.timestamp).toLocaleDateString('fr-FR'), 90, y);
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

    doc.save('factures-andiamo-' + slug + '.pdf');
  }

  updateCartUI();
