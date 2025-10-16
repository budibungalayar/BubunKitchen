// ==========================================
// BUBUN KITCHEN - CART MANAGEMENT
// Shopping cart logic dan operations
// ==========================================

const Storage = {
    getCart() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    },
    saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    },
    clearCart() {
        localStorage.removeItem('cart');
    }
};

// Add product to cart
function addToCart(productId) {
    const product = getProductById(productId);
    if (!product) {
        showToast('Produk tidak ditemukan', 'error');
        return;
    }
    
    const cart = Storage.getCart();
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showToast(`${product.name} ditambahkan (${existingItem.quantity})`, 'success');
    } else {
        cart.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0],
            weight: product.weight,
            quantity: 1
        });
        showToast(`${product.name} ditambahkan ke keranjang`, 'success');
    }
    
    Storage.saveCart(cart);
    updateCartBadge();
    
    // Animate cart icon
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.style.animation = 'none';
        setTimeout(() => {
            cartIcon.style.animation = 'bounce 0.5s ease';
        }, 10);
    }
}

// Remove product from cart
function removeFromCart(productId) {
    const cart = Storage.getCart();
    const filteredCart = cart.filter(item => item.productId !== productId);
    
    Storage.saveCart(filteredCart);
    updateCartBadge();
    showToast('Item dihapus dari keranjang', 'success');
    
    // Re-render cart if on checkout page
    if (typeof renderCartItems === 'function') {
        renderCartItems();
    }
}

// Update cart item quantity
function updateCartQuantity(productId, quantity) {
    if (quantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    const cart = Storage.getCart();
    const item = cart.find(item => item.productId === productId);
    
    if (item) {
        item.quantity = parseInt(quantity);
        Storage.saveCart(cart);
        updateCartBadge();
        
        // Re-render cart if on checkout page
        if (typeof renderCartItems === 'function') {
            renderCartItems();
        }
    }
}

// Increase quantity
function increaseQuantity(productId) {
    const cart = Storage.getCart();
    const item = cart.find(item => item.productId === productId);
    
    if (item) {
        item.quantity += 1;
        Storage.saveCart(cart);
        updateCartBadge();
        
        if (typeof renderCartItems === 'function') {
            renderCartItems();
        }
    }
}

// Decrease quantity
function decreaseQuantity(productId) {
    const cart = Storage.getCart();
    const item = cart.find(item => item.productId === productId);
    
    if (item) {
        if (item.quantity > 1) {
            item.quantity -= 1;
            Storage.saveCart(cart);
            updateCartBadge();
            
            if (typeof renderCartItems === 'function') {
                renderCartItems();
            }
        } else {
            removeFromCart(productId);
        }
    }
}

// Get cart total
function getCartTotal() {
    const cart = Storage.getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Get cart items count
function getCartCount() {
    const cart = Storage.getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
}

// Clear entire cart
function clearCart() {
    if (confirm('Yakin ingin mengosongkan keranjang?')) {
        Storage.clearCart();
        updateCartBadge();
        showToast('Keranjang dikosongkan', 'success');
        
        if (typeof renderCartItems === 'function') {
            renderCartItems();
        }
    }
}
// ==========================================
// FIREBASE ORDER SUBMISSION
// ==========================================

// Pastikan Firebase sudah diinisialisasi (firebase.js sudah di-load di HTML)
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

async function checkoutOrder(customerName, customerPhone, customerAddress) {
    const db = getFirestore();

    const cart = Storage.getCart();
    if (cart.length === 0) {
        showToast('Keranjang masih kosong!', 'error');
        return;
    }

    const orderData = {
        customerName,
        customerPhone,
        customerAddress,
        items: cart,
        total: getCartTotal(),
        status: 'pending',
        createdAt: serverTimestamp()
    };

    try {
        await addDoc(collection(db, "orders"), orderData);
        showToast('Pesanan berhasil dikirim!', 'success');
        Storage.clearCart();
        updateCartBadge();
    } catch (e) {
        console.error("Error menambahkan pesanan: ", e);
        showToast('Gagal mengirim pesanan', 'error');
    }
}

// Export ke global scope agar bisa dipakai di main.js atau inline HTML
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.getCartTotal = getCartTotal;
window.getCartCount = getCartCount;
window.clearCart = clearCart;

export {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  increaseQuantity,
  decreaseQuantity,
  getCartTotal,
  getCartCount,
  clearCart
};

