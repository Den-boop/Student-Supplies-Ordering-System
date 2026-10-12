// 1. Product data and cart state
const products = [
  { id: 1, name: "Ballpen", price: 12 },
  { id: 2, name: "Pencil", price: 10 },
  { id: 3, name: "Notebook", price: 35 },
  { id: 4, name: "Yellow Pad", price: 45 },
  { id: 5, name: "Eraser", price: 8 },
  { id: 6, name: "Ruler", price: 15 }
];
let cart = [];
let paymentCompleted = false;

function formatPrice(amount) {
  return "₱" + amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// 2. Show all six products
function displayProducts() {
  document.getElementById("product-list").innerHTML = products.map(product => `
    <div class="product-card">
      <h3>${product.name}</h3>
      <p class="price">${formatPrice(product.price)}</p>
      <button onclick="addToCart(${product.id})" ${paymentCompleted ? "disabled" : ""}>Add to Cart</button>
    </div>
  `).join("");
}

// 3. Shopping cart operations
function addToCart(productId) {
  if (paymentCompleted) return;
  const product = products.find(item => item.id === productId);
  if (!product) return;
  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) existingItem.quantity++;
  else cart.push({ ...product, quantity: 1 });
  displayCart();
  clearPendingPaymentMessage();
}

function increaseQuantity(productId) {
  if (paymentCompleted) return;
  const item = cart.find(item => item.id === productId);
  if (item) item.quantity++;
  displayCart();
  clearPendingPaymentMessage();
}

function decreaseQuantity(productId) {
  if (paymentCompleted) return;
  const item = cart.find(item => item.id === productId);
  if (item && item.quantity > 1) item.quantity--;
  displayCart();
  clearPendingPaymentMessage();
}

function removeItem(productId) {
  if (paymentCompleted) return;
  cart = cart.filter(item => item.id !== productId);
  displayCart();
  clearPendingPaymentMessage();
}

// 4. Calculate totals from the cart (never from displayed text)
function calculateTotals() {
  let totalItems = 0;
  let totalAmount = 0;
  cart.forEach(item => {
    totalItems += item.quantity;
    totalAmount += item.price * item.quantity;
  });
  return { totalItems, totalAmount };
}

function updateSummary() {
  const totals = calculateTotals();
  document.getElementById("total-items").textContent = totals.totalItems;
  document.getElementById("total-amount").textContent = formatPrice(totals.totalAmount);
}

function displayCart() {
  const cartItems = document.getElementById("cart-items");
  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
  } else {
    let html = `<table><thead><tr><th>Product</th><th>Unit Price</th><th>Quantity</th><th>Subtotal</th><th>Action</th></tr></thead><tbody>`;
    cart.forEach(item => {
      html += `<tr>
        <td>${item.name}</td>
        <td>${formatPrice(item.price)}</td>
        <td>
          <button class="quantity-btn" onclick="decreaseQuantity(${item.id})" ${item.quantity === 1 || paymentCompleted ? "disabled" : ""}>-</button>
          ${item.quantity}
          <button class="quantity-btn" onclick="increaseQuantity(${item.id})" ${paymentCompleted ? "disabled" : ""}>+</button>
        </td>
        <td>${formatPrice(item.price * item.quantity)}</td>
        <td><button class="remove-btn" onclick="removeItem(${item.id})" ${paymentCompleted ? "disabled" : ""}>Remove</button></td>
      </tr>`;
    });
    cartItems.innerHTML = html + "</tbody></table>";
  }
  updateSummary();
}

// 5. Cash payment: validate before confirming
function clearPendingPaymentMessage() {
  if (!paymentCompleted) showPaymentMessage("", "");
}

function showPaymentMessage(message, type) {
  const element = document.getElementById("payment-message");
  element.textContent = message;
  element.className = type;
}

function confirmPayment() {
  if (paymentCompleted) return;
  const paymentInput = document.getElementById("payment-amount");
  const rawPayment = paymentInput.value.trim();
  const { totalAmount } = calculateTotals();

  if (cart.length === 0) {
    showPaymentMessage("Your cart is empty. Please add products first.", "error");
    return;
  }
  if (rawPayment === "") {
    showPaymentMessage("Please enter the payment amount.", "error");
    return;
  }
  // Require a plain non-negative decimal with at most 2 decimal places.
  // This rejects text, negative values, and amounts with extra decimals.
  if (/^-/.test(rawPayment)) {
    showPaymentMessage("Payment amount cannot be negative.", "error");
    return;
  }
  if (!/^\d+(\.\d{1,2})?$/.test(rawPayment) || !Number.isFinite(Number(rawPayment))) {
    showPaymentMessage("Please enter a valid number with up to 2 decimal places.", "error");
    return;
  }

  // Work in centavos to avoid floating-point change errors.
  const paidCentavos = Math.round(Number(rawPayment) * 100);
  const dueCentavos = Math.round(totalAmount * 100);
  if (!Number.isSafeInteger(paidCentavos) || paidCentavos < 0) {
    showPaymentMessage("Payment amount is too large.", "error");
    return;
  }
  if (paidCentavos < dueCentavos) {
    showPaymentMessage("Insufficient payment. Total due: " + formatPrice(totalAmount), "error");
    return;
  }

  const amountPaid = paidCentavos / 100;
  const changeCentavos = paidCentavos - dueCentavos;
  const change = changeCentavos / 100;
  paymentCompleted = true;
  paymentInput.disabled = true;
  document.getElementById("confirm-payment").disabled = true;
  showPaymentMessage("Payment successful! Change: " + formatPrice(change), "success");
  displayProducts();
  displayCart();
  generateReceipt(amountPaid, change);
}

// 6. Create a receipt only after a successful payment
function generateReceipt(amountPaid, change) {
  if (!paymentCompleted) return;
  const reference = "SS-" + Date.now() + "-" + Math.floor(Math.random() * 100000); // Local demo reference; not a database ID
  const dateTime = new Date().toLocaleString("en-PH");
  const { totalAmount } = calculateTotals();
  let rows = "";
  cart.forEach(item => {
    rows += `<tr><td>${item.name}</td><td>${item.quantity}</td><td>${formatPrice(item.price)}</td><td>${formatPrice(item.price * item.quantity)}</td></tr>`;
  });
  document.getElementById("receipt").innerHTML = `
    <h3>Student Supplies Ordering System</h3>
    <p><strong>Transaction Reference:</strong> ${reference}</p>
    <p><strong>Date and Time:</strong> ${dateTime}</p>
    <table><thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead><tbody>${rows}</tbody></table>
    <p class="receipt-total">Total Amount Due: ${formatPrice(totalAmount)}</p>
    <p><strong>Amount Paid:</strong> ${formatPrice(amountPaid)}</p>
    <p><strong>Change:</strong> ${formatPrice(change)}</p>
    <p class="receipt-confirmation">Payment Confirmed Successfully!</p>
    <p class="receipt-confirmation">Thank you for your purchase!</p>`;
  document.getElementById("new-transaction-btn").hidden = false;
}

// 7. Reset the entire transaction for the next customer
function newTransaction() {
  cart = [];
  paymentCompleted = false;
  const input = document.getElementById("payment-amount");
  input.value = "";
  input.disabled = false;
  document.getElementById("confirm-payment").disabled = false;
  showPaymentMessage("", "");
  document.getElementById("receipt").innerHTML = "<p>No receipt generated yet.</p>";
  document.getElementById("new-transaction-btn").hidden = true;
  displayProducts();
  displayCart();
}

// 8. Start the application
displayProducts();
displayCart();
