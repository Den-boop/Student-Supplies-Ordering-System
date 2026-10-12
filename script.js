
// ===================================
// 1. PRODUCT DATA
// ===================================

// Six available school supplies
const products = [
    { id: 1, name: "Ballpen", price: 12 },
    { id: 2, name: "Pencil", price: 10 },
    { id: 3, name: "Notebook", price: 35 },
    { id: 4, name: "Yellow Pad", price: 45 },
    { id: 5, name: "Eraser", price: 8 },
    { id: 6, name: "Ruler", price: 15 }
];

// Stores selected products
let cart = [];


// ===================================
// 2. FORMAT PRICE
// ===================================

function formatPrice(amount) {
    return "₱" + amount.toFixed(2);
}


// ===================================
// 3. DISPLAY PRODUCTS
// ===================================

function displayProducts() {

    const productList = document.getElementById("product-list");

    productList.innerHTML = "";

    products.forEach(function(product) {

        productList.innerHTML += `
            <div class="product-card">
                <h3>${product.name}</h3>

                <p class="price">
                    ${formatPrice(product.price)}
                </p>

                <button onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        `;
    });
}


// ===================================
// 4. ADD TO CART
// ===================================

function addToCart(productId) {

    // Find the selected product
    const product = products.find(function(item) {
        return item.id === productId;
    });

    if (!product) {
        return;
    }

    // Check if product already exists in cart
    const existingItem = cart.find(function(item) {
        return item.id === productId;
    });

    if (existingItem) {

        // Increase quantity if already added
        existingItem.quantity++;

    } else {

        // Add new product with quantity 1
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    displayCart();
}


// ===================================
// 5. INCREASE QUANTITY
// ===================================

function increaseQuantity(productId) {

    const item = cart.find(function(item) {
        return item.id === productId;
    });

    if (item) {
        item.quantity++;
    }

    displayCart();
}


// ===================================
// 6. DECREASE QUANTITY
// ===================================

function decreaseQuantity(productId) {

    const item = cart.find(function(item) {
        return item.id === productId;
    });

    // Quantity cannot go below 1
    if (item && item.quantity > 1) {
        item.quantity--;
    }

    displayCart();
}


// ===================================
// 7. REMOVE ITEM
// ===================================

function removeItem(productId) {

    // Remove the selected product from cart
    cart = cart.filter(function(item) {
        return item.id !== productId;
    });

    displayCart();
}


// ===================================
// 8. DISPLAY SHOPPING CART
// ===================================

function displayCart() {

    const cartItems = document.getElementById("cart-items");

    // Show message when cart is empty
    if (cart.length === 0) {

        cartItems.innerHTML = "<p>Your cart is empty.</p>";

        updateSummary();
        return;
    }

    let cartHTML = `
        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Unit Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    cart.forEach(function(item) {

        // Calculate subtotal
        const subtotal = item.price * item.quantity;

        cartHTML += `
            <tr>
                <td>${item.name}</td>

                <td>${formatPrice(item.price)}</td>

                <td>
                    <button
                        class="quantity-btn"
                        onclick="decreaseQuantity(${item.id})"
                        ${item.quantity === 1 ? "disabled" : ""}>
                        -
                    </button>

                    ${item.quantity}

                    <button
                        class="quantity-btn"
                        onclick="increaseQuantity(${item.id})">
                        +
                    </button>
                </td>

                <td>${formatPrice(subtotal)}</td>

                <td>
                    <button
                        class="remove-btn"
                        onclick="removeItem(${item.id})">
                        Remove
                    </button>
                </td>
            </tr>
        `;
    });

    cartHTML += `
            </tbody>
        </table>
    `;

    cartItems.innerHTML = cartHTML;

    updateSummary();
}


// ===================================
// 9. UPDATE ORDER SUMMARY
// ===================================

function updateSummary() {

    let totalItems = 0;
    let totalAmount = 0;

    cart.forEach(function(item) {

        // Add quantities
        totalItems += item.quantity;

        // Subtotal = Price x Quantity
        const subtotal = item.price * item.quantity;

        // Add all subtotals
        totalAmount += subtotal;
    });

    // Display total items
    document.getElementById("total-items").textContent =
        totalItems;

    // Display total amount
    document.getElementById("total-amount").textContent =
        formatPrice(totalAmount);
}


// ===================================
// 10. START APPLICATION
// ===================================

displayProducts();
displayCart();
