:root{
    --cream:#F6EFE0; --cream-2:#EEE2C8; --ink:#241A12;
    --tomato:#B23A2E; --tomato-dark:#8A2C22; --basil:#4C6B3F; --gold:#D9A441;
    --paper:#FFFCF6;
    padding-top:env(safe-area-inset-top,0px); padding-bottom:env(safe-area-inset-bottom,0px);
  }
  html{scroll-behavior:smooth; scroll-padding-top:70px;}
  *{box-sizing:border-box;}
  body{margin:0; background:var(--cream); color:var(--ink); font-family:'Work Sans',system-ui,sans-serif; line-height:1.55;}
  @media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--cream:#1C1712; --cream-2:#262019; --ink:#F1E7D6; --paper:#241C15;}}
  :root[data-theme="dark"]{--cream:#1C1712; --cream-2:#262019; --ink:#F1E7D6; --paper:#241C15;}
  h1,h2,h3{font-family:'DM Serif Display',serif; font-weight:400; margin:0;}
  a{color:inherit;} img{max-width:100%; display:block;}
  .wrap{max-width:1040px; margin:0 auto; padding:0 22px;}
  header{position:sticky; top:0; z-index:30; background:color-mix(in srgb, var(--paper) 93%, transparent); backdrop-filter:blur(6px); border-bottom:1px solid color-mix(in srgb, var(--ink) 12%, transparent); padding-top:env(safe-area-inset-top,0px);}
  .headbar{display:flex; align-items:center; justify-content:space-between; gap:14px; padding:12px 0;}
  .brand{font-family:'DM Serif Display',serif; font-size:1.3rem;}
  .brand span{color:var(--tomato);}
  nav{display:flex; gap:20px; font-size:0.92rem;}
  nav a{text-decoration:none; opacity:.8;}
  @media (max-width:680px){nav{display:none;}}
  .call-btn{background:var(--tomato); color:#fff; padding:9px 16px; border-radius:20px; text-decoration:none; font-weight:600; font-size:0.88rem; white-space:nowrap;}
  .cart-btn{position:relative; background:var(--ink); color:var(--cream); border:none; padding:9px 14px; border-radius:20px; font-weight:600; font-size:0.88rem; cursor:pointer; margin-left:8px;}
  .cart-count{position:absolute; top:-6px; right:-6px; background:var(--gold); color:var(--ink); font-size:0.7rem; font-weight:700; border-radius:50%; width:18px; height:18px; display:flex; align-items:center; justify-content:center;}

  .hero{padding:52px 0 40px;}
  .hero-grid{display:grid; grid-template-columns:1.1fr 1fr; gap:36px; align-items:center;}
  @media (max-width:800px){.hero-grid{grid-template-columns:1fr;}}
  .hero h1{font-size:clamp(2rem,5vw,3.1rem); line-height:1.05; max-width:12ch;}
  .hero p{margin-top:16px; max-width:42ch; opacity:.82; font-size:1.02rem;}
  .hero-cta{display:flex; gap:12px; margin-top:24px; flex-wrap:wrap;}
  .btn{display:inline-block; padding:12px 22px; border-radius:24px; text-decoration:none; font-weight:600; font-size:0.94rem; border:none; cursor:pointer; font-family:inherit;}
  .btn-primary{background:var(--tomato); color:#fff;}
  .btn-ghost{background:transparent; color:var(--ink); border:1.5px solid color-mix(in srgb, var(--ink) 40%, transparent);}
  .hero-img{border-radius:6px; overflow:hidden; background:var(--cream-2);}
  .hero-img img{width:100%; height:auto;}

  section{padding:52px 0;}
  .eyebrow{text-transform:uppercase; letter-spacing:.14em; font-size:0.72rem; font-weight:700; color:var(--tomato);}
  .section-title{font-size:clamp(1.6rem,3.4vw,2.3rem); margin-top:6px;}

  .about-grid{display:grid; grid-template-columns:1fr 1.1fr; gap:36px; align-items:center; margin-top:30px;}
  @media (max-width:760px){.about-grid{grid-template-columns:1fr;}}
  .about-grid img{border-radius:6px;}
  .about-grid p{opacity:.85; margin-top:12px;}

  .menu-cat{margin-top:36px;}
  .menu-cat h3{font-size:1.3rem; color:var(--tomato-dark); border-bottom:2px solid var(--gold); display:inline-block; padding-bottom:4px; margin-bottom:14px;}
  .menu-item{display:flex; justify-content:space-between; align-items:flex-start; gap:14px; padding:12px 0; border-bottom:1px dashed color-mix(in srgb, var(--ink) 18%, transparent);}
  .menu-item:last-child{border-bottom:none;}
  .mi-left{flex:1;}
  .mi-name{font-weight:600; font-size:1rem;}
  .mi-desc{font-size:0.85rem; opacity:.7; margin-top:3px;}
  .mi-right{display:flex; align-items:center; gap:10px; white-space:nowrap;}
  .mi-price{font-weight:700; font-family:'DM Serif Display',serif; font-size:1.1rem;}
  .add-btn{background:var(--basil); color:#fff; border:none; width:30px; height:30px; border-radius:50%; font-size:1.1rem; cursor:pointer; line-height:1;}

  .gallery-strip{display:flex; gap:14px; overflow-x:auto; margin-top:30px; padding-bottom:8px; scroll-snap-type:x proximity;}
  .g-card{flex:0 0 auto; width:220px; scroll-snap-align:start;}
  .g-card img{width:220px; height:260px; object-fit:cover; border-radius:5px;}
  .g-card figcaption{font-size:0.8rem; margin-top:7px; opacity:.72;}
  figure{margin:0;}

  .contact-grid{display:grid; grid-template-columns:1fr 1fr; gap:30px; margin-top:30px;}
  @media (max-width:700px){.contact-grid{grid-template-columns:1fr;}}
  .info-block{background:var(--cream-2); padding:24px; border-radius:6px;}
  .info-block a.phone{font-family:'DM Serif Display',serif; font-size:1.4rem; color:var(--tomato); text-decoration:none; display:block; margin:6px 0 14px;}
  .info-block dt{font-weight:700; margin-top:12px; font-size:0.85rem; text-transform:uppercase; letter-spacing:.05em; opacity:.7;}
  .info-block dd{margin:2px 0 0;}

  footer{padding:26px 0 calc(26px + env(safe-area-inset-bottom,0px)); border-top:1px solid color-mix(in srgb, var(--ink) 12%, transparent); font-size:0.8rem; opacity:.65;}
  footer .wrap{display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px; align-items:center;}
  footer a{text-decoration:underline;}

  /* cart drawer */
  .overlay{position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:90; display:none;}
  .overlay.open{display:block;}
  .drawer{position:fixed; top:0; right:0; height:100%; width:min(380px,92vw); background:var(--paper); z-index:91; transform:translateX(100%); transition:transform .25s ease; display:flex; flex-direction:column; padding:calc(18px + env(safe-area-inset-top,0px)) 18px 18px;}
  .drawer.open{transform:translateX(0);}
  .drawer h3{font-size:1.3rem;}
  .drawer-items{flex:1; overflow-y:auto; margin:16px 0;}
  .drawer-item{display:flex; justify-content:space-between; padding:9px 0; border-bottom:1px solid color-mix(in srgb, var(--ink) 10%, transparent); font-size:0.92rem; gap:8px;}
  .drawer-item button{background:none; border:none; color:var(--tomato); cursor:pointer; font-size:1rem;}
  .drawer-total{display:flex; justify-content:space-between; font-weight:700; font-size:1.1rem; padding:12px 0;}
  .close-x{align-self:flex-end; background:none; border:none; font-size:1.4rem; cursor:pointer; color:var(--ink);}

  /* checkout form (inside drawer step 2) */
  .checkout-fields{display:none; flex-direction:column; gap:10px; margin-top:8px;}
  .checkout-fields.open{display:flex;}
  .checkout-fields input{width:100%; font:inherit; padding:10px 11px; border:1.5px solid color-mix(in srgb, var(--ink) 22%, transparent); border-radius:4px; background:var(--paper); color:var(--ink);}
  .checkout-fields label{font-size:0.82rem; font-weight:600;}

  .demo-tag{display:inline-block; background:var(--gold); color:var(--ink); font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; padding:2px 8px; border-radius:10px; margin-left:8px; vertical-align:middle;}

  /* admin */
  #adminView{display:none;}
  #adminView.open{display:block;}
  #siteView.hidden{display:none;}
  .admin-login{max-width:340px; margin:80px auto; background:var(--paper); padding:28px; border-radius:8px; text-align:center;}
  .admin-login input{width:100%; padding:11px; margin:10px 0; border-radius:4px; border:1.5px solid color-mix(in srgb, var(--ink) 22%, transparent); font:inherit; background:var(--cream); color:var(--ink);}
  .admin-bar{display:flex; justify-content:space-between; align-items:center; padding:14px 22px; background:var(--ink); color:var(--cream);}
  .admin-bar a{color:var(--cream); text-decoration:underline; font-size:0.88rem;}
  .kanban{display:grid; grid-template-columns:repeat(3,1fr); gap:16px; padding:22px; max-width:1100px; margin:0 auto;}
  @media (max-width:800px){.kanban{grid-template-columns:1fr;}}
  .col{background:var(--paper); border-radius:8px; padding:14px; min-height:120px;}
  .col h4{margin:0 0 10px; font-family:'Work Sans',sans-serif; font-weight:700; font-size:0.9rem; text-transform:uppercase; letter-spacing:.05em;}
  .col.new h4{color:var(--tomato);}
  .col.progress h4{color:#B8860B;}
  .col.done h4{color:var(--basil);}
  .order-card{background:var(--cream-2); border-radius:6px; padding:12px; margin-bottom:10px; font-size:0.86rem;}
  .order-card .oid{font-weight:700;}
  .order-card ul{margin:6px 0; padding-left:18px;}
  .order-card .oactions{display:flex; gap:6px; margin-top:8px; flex-wrap:wrap;}
  .order-card button{font-size:0.75rem; padding:5px 9px; border-radius:12px; border:none; cursor:pointer; font-family:inherit;}
  .oactions .mv{background:var(--ink); color:var(--cream);}
  .oactions .del{background:transparent; color:var(--tomato); border:1px solid var(--tomato) !important;}
  .order-card input[type=time]{margin-top:6px; width:100%; font:inherit; padding:4px; border-radius:4px; border:1px solid color-mix(in srgb, var(--ink) 20%, transparent);}
  .empty-col{opacity:.5; font-size:0.82rem; text-align:center; padding:20px 0;}

  .invoices-bar{max-width:1100px; margin:0 auto; padding:0 22px 6px; display:flex; gap:26px; flex-wrap:wrap;}
  .invoices-box{background:var(--paper); border-radius:8px; padding:16px 18px; flex:1; min-width:250px;}
  .invoices-box h4{margin:0 0 10px; font-size:0.9rem; text-transform:uppercase; letter-spacing:.05em;}
  .invoices-box .row{display:flex; gap:8px; flex-wrap:wrap;}
  .invoices-box select{font:inherit; padding:8px 10px; border-radius:5px; border:1.5px solid color-mix(in srgb, var(--ink) 22%, transparent); background:var(--cream); color:var(--ink);}
  .invoices-box button{font:inherit; font-size:0.85rem; padding:8px 14px; border-radius:16px; border:none; background:var(--tomato); color:#fff; cursor:pointer;}

/* =========================================================
   INITIALIZATION
   ========================================================= */

updateCart();
