// ==========================================
// BUBUN KITCHEN - CHECKOUT PROCESS
// Multi-step checkout flow & order creation
// ==========================================

let currentStep = 1;
let customerData = {};
let paymentData = {};

// Initialize checkout page
document.addEventListener('DOMContentLoaded', function() {
    if (!document.querySelector('.checkout-page')) return;
    
    updateCartBadge();
    renderCartItems();
    setupEventListeners();
});

// Setup all event listeners
function setupEventListeners() {
    // Payment method change
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', handlePaymentMethodChange);
    });
    
    // Customer form submit
    const customerForm = document.getElementById('customerForm');
    if (customerForm) {
        customerForm.addEventListener('submit', handleCustomerFormSubmit);
    }
    
    // Transfer provider change
    const transferRadios = document.querySelectorAll('input[name="transferMethod"]');
    transferRadios.forEach(radio => {
        radio.addEventListener('change', hideAccountInfo);
    });
}

// Render cart items in checkout
function renderCartItems() {
    const cart = Storage.getCart();
    const cartEmpty = document.getElementById('cartEmpty');
    const cartItems = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    
    if (cart.length === 0) {
        if (cartEmpty) cartEmpty.style.display = 'block';
        if (cartItems) cartItems.style.display = 'none';
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }
    
    if (cartEmpty) cartEmpty.style.display = 'none';
    if (cartItems) cartItems.style.display = 'block';
    if (cartSummary) cartSummary.style.display = 'block';
    
    // Render items
    if (cartItems) {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item" data-product-id="${item.productId}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatRupiah(item.price)} / ${item.weight}</div>
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="decreaseQuantity(${item.productId})">−</button>
                        <input type="number" class="qty-input" value="${item.quantity}" 
                            onchange="updateCartQuantity(${item.productId}, this.value)" min="1">
                        <button class="qty-btn" onclick="increaseQuantity(${item.productId})">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.productId})" title="Hapus">
                    ✕
                </button>
            </div>
        `).join('');
    }
    
    // Update summary
    updateCartSummary();
}

// Update cart summary
function updateCartSummary() {
    const cart = Storage.getCart();
    const subtotal = getCartTotal();
    const shipping = 0; // Free shipping
    const total = subtotal + shipping;
    
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const totalEl = document.getElementById('totalAmount');
    
    if (subtotalEl) subtotalEl.textContent = formatRupiah(subtotal);
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Gratis' : formatRupiah(shipping);
    if (totalEl) totalEl.textContent = formatRupiah(total);
}

// Go to specific step
function goToStep(step) {
    // Validate before moving forward
    if (step > currentStep) {
        if (currentStep === 1) {
            const cart = Storage.getCart();
            if (cart.length === 0) {
                showToast('Keranjang masih kosong', 'error');
                return;
            }
        }
    }
    
    // Hide all steps
    for (let i = 1; i <= 4; i++) {
        const stepEl = document.getElementById(`step${i}`);
        if (stepEl) stepEl.style.display = 'none';
    }
    
    // Show current step
    const currentStepEl = document.getElementById(`step${step}`);
    if (currentStepEl) currentStepEl.style.display = 'block';
    
    // Update progress
    updateProgressBar(step);
    currentStep = step;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Step-specific actions
    if (step === 3) {
        renderOrderSummary();
    }
}

// Update progress bar
function updateProgressBar(step) {
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps.forEach((el, index) => {
        if (index < step) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

// Handle payment method change
function handlePaymentMethodChange(e) {
    const method = e.target.value;
    const transferDetails = document.getElementById('transferDetails');
    const codDetails = document.getElementById('codDetails');
    
    if (method === 'transfer') {
        if (transferDetails) transferDetails.style.display = 'block';
        if (codDetails) codDetails.style.display = 'none';
    } else {
        if (transferDetails) transferDetails.style.display = 'none';
        if (codDetails) codDetails.style.display = 'block';
    }
    
    hideAccountInfo();
}

// Handle customer form submit
function handleCustomerFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const email = document.getElementById('customerEmail').value.trim();
    const address = document.getElementById('customerAddress').value.trim();
    const notes = document.getElementById('customerNotes').value.trim();
    
    // Validation
    if (!name || !phone || !address) {
        showToast('Mohon lengkapi data yang wajib diisi', 'error');
        return;
    }
    
    if (!isValidPhone(phone)) {
        showToast('Format nomor WhatsApp tidak valid', 'error');
        return;
    }
    
    if (email && !isValidEmail(email)) {
        showToast('Format email tidak valid', 'error');
        return;
    }
    
    // Save customer data
    customerData = { name, phone, email, address, notes };
    
    // Move to payment step
    goToStep(3);
}

// Show account details
function showAccountDetails() {
    const provider = document.querySelector('input[name="transferMethod"]:checked').value;
    const settings = Storage.getSettings();
    const accountBox = document.getElementById('accountInfoBox');
    const accountDetails = document.getElementById('accountDetails');
    
    if (!accountBox || !accountDetails) return;
    
    let accountInfo = {};
    if (provider === 'dana') {
        accountInfo = {
            label: 'DANA',
            number: settings.danaNumber,
            holder: settings.danaHolder
        };
    } else {
        accountInfo = {
            label: 'BNI',
            number: settings.bniNumber,
            holder: settings.bniHolder
        };
    }
    
    accountDetails.innerHTML = `
        <div class="account-detail">
            <label>Bank/E-wallet</label>
            <strong>${accountInfo.label}</strong>
        </div>
        <div class="account-detail">
            <label>Nomor Rekening</label>
            <strong>${accountInfo.number}</strong>
        </div>
        <div class="account-detail">
            <label>Atas Nama</label>
            <strong>${accountInfo.holder}</strong>
        </div>
        <div class="account-detail">
            <label>Jumlah Transfer</label>
            <strong style="color: var(--gold); font-size: 1.5rem;">${formatRupiah(getCartTotal())}</strong>
        </div>
    `;
    
    accountBox.style.display = 'block';
    
    // Save payment data
    paymentData = {
        method: 'transfer',
        provider: provider,
        accountNumber: accountInfo.number
    };
}

// Hide account info
function hideAccountInfo() {
    const accountBox = document.getElementById('accountInfoBox');
    if (accountBox) {
        accountBox.style.display = 'none';
    }
}

// Render order summary
function renderOrderSummary() {
    const cart = Storage.getCart();
    const summaryEl = document.getElementById('orderSummary');
    const finalTotalEl = document.getElementById('finalTotal');
    
    if (!summaryEl) return;
    
    summaryEl.innerHTML = cart.map(item => `
        <div class="summary-item">
            <span>${item.name} x ${item.quantity}</span>
            <strong>${formatRupiah(item.price * item.quantity)}</strong>
        </div>
    `).join('');
    
    if (finalTotalEl) {
        finalTotalEl.textContent = formatRupiah(getCartTotal());
    }
}

// Confirm order
function confirmOrder() {
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    // Validate
    if (paymentMethod === 'transfer') {
        const accountBox = document.getElementById('accountInfoBox');
        if (!accountBox || accountBox.style.display === 'none') {
            showToast('Silakan klik "Tampilkan Nomor Rekening" terlebih dahulu', 'error');
            return;
        }
        
        const provider = document.querySelector('input[name="transferMethod"]:checked').value;
        paymentData = {
            method: 'transfer',
            provider: provider,
            status: 'AWAITING_TRANSFER'
        };
    } else {
        paymentData = {
            method: 'cod',
            provider: 'cod',
            status: 'COD_PENDING'
        };
    }
    
    // Create order
    const cart = Storage.getCart();
    const orderCode = generateOrderCode();
    const order = {
        code: orderCode,
        customer: customerData,
        items: cart,
        total: getCartTotal(),
        payment: paymentData,
        status: 'PENDING',
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    
    // Save order
    if (Storage.addOrder(order)) {
        // Simpan ke Firebase juga
        if (typeof saveOrderToFirebase === 'function') {
            saveOrderToFirebase(order);
        // Clear cart
        Storage.clearCart();
        updateCartBadge();
        
        // Show success page
        displayOrderSuccess(order);
        goToStep(4);
    } else {
        showToast('Gagal membuat pesanan. Silakan coba lagi.', 'error');
    }
}

// Display order success
function displayOrderSuccess(order) {
    const orderCodeDisplay = document.getElementById('orderCodeDisplay');
    const orderInfoBox = document.getElementById('orderInfoBox');
    const nextStep1 = document.getElementById('nextStep1');
    
    if (orderCodeDisplay) {
        orderCodeDisplay.textContent = order.code;
    }
    
    if (orderInfoBox) {
        orderInfoBox.innerHTML = `
            <div class="account-detail">
                <label>Nama</label>
                <strong>${order.customer.name}</strong>
            </div>
            <div class="account-detail">
                <label>WhatsApp</label>
                <strong>${order.customer.phone}</strong>
            </div>
            <div class="account-detail">
                <label>Alamat</label>
                <strong>${order.customer.address}</strong>
            </div>
            <div class="account-detail">
                <label>Total Pembayaran</label>
                <strong style="color: var(--gold); font-size: 1.5rem;">${formatRupiah(order.total)}</strong>
            </div>
            <div class="account-detail">
                <label>Metode Pembayaran</label>
                <strong>${order.payment.method === 'transfer' ? 'Transfer ' + order.payment.provider.toUpperCase() : 'COD (Bayar di Tempat)'}</strong>
            </div>
        `;
    }
    
    if (nextStep1) {
        if (order.payment.method === 'transfer') {
            nextStep1.textContent = `Transfer ke rekening ${order.payment.provider.toUpperCase()} yang sudah ditampilkan`;
        } else {
            nextStep1.textContent = 'Siapkan uang tunai saat kurir tiba';
        }
    }
}

// Copy order code
function copyOrderCode() {
    const orderCode = document.getElementById('orderCodeDisplay').textContent;
    copyToClipboard(orderCode);
}

// Check order status (from success page)
function checkOrderStatus() {
    const orderCode = document.getElementById('orderCodeDisplay').textContent;
    showModal('statusModal');
    document.getElementById('orderCodeInput').value = orderCode;
    searchOrder();
}

// Search order by code
function searchOrder() {
    const code = document.getElementById('orderCodeInput').value.trim();
    const resultEl = document.getElementById('statusResult');
    
    if (!code) {
        showToast('Masukkan kode pesanan', 'error');
        return;
    }
    
    const order = Storage.getOrderByCode(code);
    
    if (!order) {
        resultEl.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--gray-500);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
                <p>Pesanan tidak ditemukan</p>
                <small>Pastikan kode pesanan sudah benar</small>
            </div>
        `;
        return;
    }
    
    const statusBadge = getStatusBadge(order.status);
    const paymentBadge = order.payment.method === 'transfer' 
        ? `<span class="status-badge pending">Transfer ${order.payment.provider.toUpperCase()}</span>`
        : `<span class="status-badge pending">COD</span>`;
    
    resultEl.innerHTML = `
        <div style="margin-top: 1.5rem; padding: 1rem; background-color: var(--cream); border-radius: var(--radius-lg);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <strong style="font-size: 1.25rem; color: var(--primary);">${order.code}</strong>
                ${statusBadge}
            </div>
            <div style="display: grid; gap: 0.75rem; font-size: 0.9375rem;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--gray-600);">Nama:</span>
                    <strong>${order.customer.name}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--gray-600);">Total:</span>
                    <strong style="color: var(--gold);">${formatRupiah(order.total)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--gray-600);">Pembayaran:</span>
                    ${paymentBadge}
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--gray-600);">Tanggal:</span>
                    <strong>${formatDateShort(order.createdAt)}</strong>
                </div>
                <div style="margin-top: 0.5rem; padding-top: 0.75rem; border-top: 1px solid var(--gray-300);">
                    <strong style="color: var(--primary);">Items:</strong>
                    <ul style="list-style: none; padding-left: 0; margin-top: 0.5rem;">
                        ${order.items.map(item => `
                            <li style="padding: 0.25rem 0;">• ${item.name} x ${item.quantity}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// Get status badge HTML
function getStatusBadge(status) {
    const badges = {
        'PENDING': '<span class="status-badge pending">Menunggu</span>',
        'DIPROSES': '<span class="status-badge processing">Diproses</span>',
        'SELESAI': '<span class="status-badge completed">Selesai</span>'
    };
    return badges[status] || '<span class="status-badge pending">Unknown</span>';
}

// Close status modal
function closeStatusModal() {
    hideModal('statusModal');
}

// Export functions for global use
window.goToStep = goToStep;
window.showAccountDetails = showAccountDetails;
window.confirmOrder = confirmOrder;
window.copyOrderCode = copyOrderCode;
window.checkOrderStatus = checkOrderStatus;
window.searchOrder = searchOrder;

window.closeStatusModal = closeStatusModal;

