// ==========================================
// BUBUN KITCHEN - UTILITY FUNCTIONS
// Helper functions untuk formatting & storage
// ==========================================

// Format currency to Rupiah
function formatRupiah(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
}

// Format date to Indonesian
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('id-ID', options);
}

// Format date for admin (shorter)
function formatDateShort(timestamp) {
    const date = new Date(timestamp);
    const options = { 
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    };
    return date.toLocaleDateString('id-ID', options);
}

// Generate unique order code
function generateOrderCode(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Show toast notification
function showToast(message, type = 'success', duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// LocalStorage helpers
const Storage = {
    // Get cart from localStorage
    getCart() {
        try {
            const cart = localStorage.getItem('bubun_cart');
            return cart ? JSON.parse(cart) : [];
        } catch (error) {
            console.error('Error adding order:', error);
            return false;
        }
    },
    
    // Save cart to localStorage
    saveCart(cart) {
        try {
            localStorage.setItem('bubun_cart', JSON.stringify(cart));
            return true;
        } catch (error) {
            console.error('Error saving cart:', error);
            return false;
        }
    },
    
    // Clear cart
    clearCart() {
        try {
            localStorage.removeItem('bubun_cart');
            return true;
        } catch (error) {
            console.error('Error clearing cart:', error);
            return false;
        }
    },
    
    // Get orders from localStorage
    getOrders() {
        try {
            const orders = localStorage.getItem('bubun_orders');
            return orders ? JSON.parse(orders) : [];
        } catch (error) {
            console.error('Error reading orders:', error);
            return [];
        }
    },
    
    // Save orders to localStorage
    saveOrders(orders) {
        try {
            localStorage.setItem('bubun_orders', JSON.stringify(orders));
            return true;
        } catch (error) {
            console.error('Error saving orders:', error);
            return false;
        }
    },
    
    // Add new order
    addOrder(order) {
        try {
            const orders = this.getOrders();
            orders.push(order);
            return this.saveOrders(orders);
        } catch (error) {
            console.error('Error reading cart:', error);
            return [];
        }
    },
    
    
    // Get order by code
    getOrderByCode(code) {
        try {
            const orders = this.getOrders();
            return orders.find(order => order.code === code.toUpperCase());
        } catch (error) {
            console.error('Error finding order:', error);
            return null;
        }
    },
    
    // Update order status
    updateOrderStatus(code, newStatus) {
        try {
            const orders = this.getOrders();
            const orderIndex = orders.findIndex(order => order.code === code);
            
            if (orderIndex !== -1) {
                orders[orderIndex].status = newStatus;
                orders[orderIndex].updatedAt = Date.now();
                return this.saveOrders(orders);
            }
            return false;
        } catch (error) {
            console.error('Error updating order:', error);
            return false;
        }
    },
    
    // Get settings
    getSettings() {
        try {
            const settings = localStorage.getItem('bubun_settings');
            return settings ? JSON.parse(settings) : {
                danaNumber: '085737772377',
                bniNumber: '1457438130',
                danaHolder: 'Bubun Kitchen',
                bniHolder: 'PT Bubun Kitchen'
            };
        } catch (error) {
            console.error('Error reading settings:', error);
            return null;
        }
    },
    
    // Save settings
    saveSettings(settings) {
        try {
            localStorage.setItem('bubun_settings', JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    },
    
    // Clear all data (for admin)
    clearAll() {
        try {
            localStorage.removeItem('bubun_cart');
            localStorage.removeItem('bubun_orders');
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }
};

// Smooth scroll to element
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId) || document.querySelector(elementId);
    if (element) {
        const offset = 80; // navbar height
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Update cart badge
function updateCartBadge() {
    const cart = Storage.getCart();
    const badge = document.getElementById('cartBadge');
    
    if (badge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalItems;
        
        if (totalItems > 0) {
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Validate email format
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validate phone number (Indonesian)
function isValidPhone(phone) {
    const regex = /^(\+62|62|0)[0-9]{9,12}$/;
    return regex.test(phone.replace(/[\s-]/g, ''));
}

// Copy text to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text)
            .then(() => {
                showToast('Berhasil disalin!', 'success');
                return true;
            })
            .catch(() => {
                fallbackCopyToClipboard(text);
                return false;
            });
    } else {
        return fallbackCopyToClipboard(text);
    }
}

// Fallback copy method for older browsers
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast('Berhasil disalin!', 'success');
        return true;
    } catch (err) {
        showToast('Gagal menyalin', 'error');
        return false;
    } finally {
        document.body.removeChild(textArea);
    }
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Show/hide modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Close modal on background click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        hideModal(e.target.id);
    }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatRupiah,
        formatDate,
        formatDateShort,
        generateOrderCode,
        showToast,
        Storage,
        smoothScrollTo,
        updateCartBadge,
        isValidEmail,
        isValidPhone,
        copyToClipboard,
        debounce,
        showModal,
        hideModal
    };
}

// Tambahkan export ES Module agar bisa diimport dari checkout.js & cart.js
export { 
    formatRupiah,
    formatDate,
    formatDateShort,
    generateOrderCode,
    showToast,
    Storage,
    smoothScrollTo,
    updateCartBadge,
    isValidEmail,
    isValidPhone,
    copyToClipboard,
    debounce,
    showModal,
    hideModal
};


