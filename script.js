/* =========================================================
   PIZZERIA ANDIAMO
   MAIN JAVASCRIPT
   ========================================================= */


/* =========================================================
   CART
   ========================================================= */

let cart = [];


const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");

const openCartButton = document.getElementById("openCart");
const closeCartButton = document.getElementById("closeCart");

const cartItemsElement = document.getElementById("cartItems");
const cartCountElement = document.getElementById("cartCount");
const cartTotalElement = document.getElementById("cartTotal");


/* Open cart */

openCartButton.addEventListener("click", () => {

    cartDrawer.classList.add("open");

    cartOverlay.classList.add("visible");

    cartDrawer.setAttribute("aria-hidden", "false");

});


/* Close cart */

function closeCart() {

    cartDrawer.classList.remove("open");

    cartOverlay.classList.remove("visible");

    cartDrawer.setAttribute("aria-hidden", "true");

}


closeCartButton.addEventListener(
    "click",
    closeCart
);


cartOverlay.addEventListener(
    "click",
    closeCart
);


/* =========================================================
   ADD PRODUCT
   ========================================================= */

function addToCart(name, price) {

    const existingProduct = cart.find(
        product => product.name === name
    );


    if (existingProduct) {

        existingProduct.quantity += 1;

    } else {

        cart.push({
            name: name,
            price: price,
            quantity: 1
        });

    }


    updateCart();

    cartDrawer.classList.add("open");

    cartOverlay.classList.add("visible");

}


/* =========================================================
   REMOVE PRODUCT
   ========================================================= */

function removeFromCart(index) {

    cart.splice(index, 1);

    updateCart();

}


/* =========================================================
   UPDATE CART
   ========================================================= */

function updateCart() {

    cartItemsElement.innerHTML = "";


    if (cart.length === 0) {

        cartItemsElement.innerHTML = `
            <p class="empty-cart">
                Votre panier est vide.
            </p>
        `;

    }


    let total = 0;
    let count = 0;


    cart.forEach((product, index) => {

        const productTotal =
            product.price *
            product.quantity;


        total += productTotal;

        count += product.quantity;


        const item = document.createElement("div");

        item.className = "cart-item";


        item.innerHTML = `

            <div>

                <div class="cart-item-name">
                    ${product.name}
                </div>

                <small>
                    ${product.quantity} ?
                    ${product.price.toFixed(2).replace(".", ",")} €
                </small>

            </div>


            <div>

                <div class="cart-item-price">
                    ${productTotal.toFixed(2).replace(".", ",")} €
                </div>

                <button
                    class="remove-item"
                    type="button"
                    onclick="removeFromCart(${index})"
                >
                    Supprimer
                </button>

            </div>

        `;


        cartItemsElement.appendChild(item);

    });


    cartCountElement.textContent = count;


    cartTotalElement.textContent =
        total.toFixed(2).replace(".", ",") +
        " €";

}


/* =========================================================
   CHECKOUT DEMO
   ========================================================= */

const checkoutButton =
    document.getElementById("checkoutButton");


checkoutButton.addEventListener(
    "click",
    () => {

        if (cart.length === 0) {

            alert(
                "Votre panier est vide."
            );

            return;
        }


        const name =
            document.getElementById(
                "customerName"
            ).value.trim();


        const phone =
            document.getElementById(
                "customerPhone"
            ).value.trim();


        const pickupTime =
            document.getElementById(
                "pickupTime"
            ).value;


        if (!name || !phone || !pickupTime) {

            alert(
                "Merci de remplir votre nom, votre telephone et l'heure souhaitee."
            );

            return;
        }


        const total = cart.reduce(
            (sum, product) =>
                sum +
                product.price *
                product.quantity,
            0
        );


        const order = {

            id:
                Date.now(),

            name:
                name,

            phone:
                phone,

            pickupTime:
                pickupTime,

            products:
                [...cart],

            total:
                total,

            status:
                "new",

            createdAt:
                new Date().toISOString()

        };


        const savedOrders =
            JSON.parse(
                localStorage.getItem(
                    "andiamoOrders"
                )
            ) || [];


        savedOrders.push(order);


        localStorage.setItem(
            "andiamoOrders",
            JSON.stringify(savedOrders)
        );


        alert(
            "Commande enregistree dans la demonstration. Aucun paiement reel n'a ete effectue."
        );


        cart = [];

        updateCart();

        closeCart();

    }
);


/* =========================================================
   ADMIN LOGIN
   ========================================================= */

const adminLoginButton =
    document.getElementById(
        "adminLoginButton"
    );


const adminPanel =
    document.getElementById(
        "adminPanel"
    );


adminLoginButton.addEventListener(
    "click",
    () => {

        const email =
            document.getElementById(
                "adminEmail"
            ).value.trim();


        const password =
            document.getElementById(
                "adminPassword"
            ).value;


        /*
            DEMO ONLY

            Email:
            admin@andiamo.fr

            Password:
            andiamo
        */

        if (
            email === "admin@andiamo.fr" &&
            password === "andiamo"
        ) {

            adminPanel.hidden = false;

            loadOrders();

        } else {

            alert(
                "Identifiants incorrects."
            );

        }

    }
);


/* =========================================================
   LOAD ORDERS
   ========================================================= */

function loadOrders() {

    const orders =
        JSON.parse(
            localStorage.getItem(
                "andiamoOrders"
            )
        ) || [];


    const newOrders =
        document.getElementById(
            "newOrders"
        );


    const preparingOrders =
        document.getElementById(
            "preparingOrders"
        );


    const readyOrders =
        document.getElementById(
            "readyOrders"
        );


    newOrders.innerHTML = "";
    preparingOrders.innerHTML = "";
    readyOrders.innerHTML = "";


    orders.forEach(order => {

        const card =
            createOrderCard(order);


        if (order.status === "new") {

            newOrders.appendChild(card);

        }


        if (order.status === "preparing") {

            preparingOrders.appendChild(card);

        }


        if (order.status === "ready") {

            readyOrders.appendChild(card);

        }

    });

}


/* =========================================================
   ORDER CARD
   ========================================================= */

function createOrderCard(order) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "order-card";


    const productsText =
        order.products
            .map(
                product =>
                    `${product.quantity}? ${product.name}`
            )
            .join(", ");


    card.innerHTML = `

        <strong>
            Commande #${order.id}
        </strong>

        <small>
            ${order.name}
        </small>

        <small>
            ${order.phone}
        </small>

        <small>
            Retrait : ${order.pickupTime}
        </small>

        <small>
            ${productsText}
        </small>

        <strong>
            ${order.total.toFixed(2).replace(".", ",")} €
        </strong>

        <br>

        <button
            type="button"
            onclick="changeOrderStatus(${order.id})"
        >
            Changer le statut
        </button>

    `;


    return card;

}


/* =========================================================
   CHANGE ORDER STATUS
   ========================================================= */

function changeOrderStatus(orderId) {

    const orders =
        JSON.parse(
            localStorage.getItem(
                "andiamoOrders"
            )
        ) || [];


    const order =
        orders.find(
            item =>
                item.id === orderId
        );


    if (!order) {
        return;
    }


    if (order.status === "new") {

        order.status = "preparing";

    } else if (
        order.status === "preparing"
    ) {

        order.status = "ready";

    } else {

        order.status = "new";

    }


    localStorage.setItem(
        "andiamoOrders",
        JSON.stringify(orders)
    );


    loadOrders();

}


/* =========================================================
   INVOICE DEMO
   ========================================================= */

document
    .getElementById("monthlyInvoice")
    .addEventListener(
        "click",
        () => {

            alert(
                "La generation de facture mensuelle sera connectee au vrai systeme plus tard."
            );

        }
    );


document
    .getElementById("yearlyInvoice")
    .addEventListener(
        "click",
        () => {

            alert(
                "La generation de facture annuelle sera connectee au vrai systeme plus tard."
            );

        }
    );


/* =========================================================
   INITIALIZATION
   ========================================================= */

updateCart();
