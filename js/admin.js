// ==========================================
// BUBUN KITCHEN - ADMIN PANEL
// Admin dashboard & order management
// ==========================================
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const ADMIN_PASSWORD = 'bubun25705';
let currentFilter = 'all';
let allOrders = [];

// Initialize admin page
document.addEventListener('DOMContentLoaded', async function() {
    if (!document.querySelector('.admin-body')) return;
    
    await checkAdminAuth(); // 👈 Tambahkan await
    setupLoginForm();
});

// Check if admin is authenticated
async function checkAdminAuth() {
    const isAuthenticated = sessionStorage.getItem('admin_authenticated');
    
    if (isAuthenticated === 'true') {
        await showDashboard(); // 👈 Tambahkan await
    } else {
        showLogin();
    }
}

// Show login screen
function showLogin() {
    const loginScreen = document.getElementById('adminLogin');
    const dashboard = document.getElementById('adminDashboard');
    
    if (loginScreen) loginScreen.style.display = 'flex';
    if (dashboard) dashboard.style.display = 'none';
}

// Show dashboard
// Show dashboard
async function showDashboard() {
    const loginScreen = document.getElementById('adminLogin');
    const dashboard = document.getElementById('adminDashboard');
    
    if (loginScreen) loginScreen.style.display = 'none';
    if (dashboard) dashboard.style.display = 'grid';
    
    await initializeDashboard(); // 👈 Tambahkan await
}

// Setup login form
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const password = document.getElementById('adminPassword').value;
        
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('admin_authenticated', 'true');
            showToast('Login berhasil!', 'success');
            showDashboard();
        } else {
            showToast('Password salah!', 'error');
            document.getElementById('adminPassword').value = '';
        }
    });
}

// Initialize dashboard
// Initialize dashboard
async function initializeDashboard() {
    updateDateTime();
    
    // Load orders dari Firebase (async!)
    await loadOrders();
    
    setupNavigation();
    setupOrderFilters();
    
    // Update stats
    updateDashboardStats();
    renderRecentOrders();
}

// Update current date/time
function updateDateTime() {
    const dateEl = document.getElementById('currentDate');
    if (!dateEl) return;
    
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    dateEl.textContent = now.toLocaleDateString('id-ID', options);
}

// Load orders from storage
// Load orders from Firebase
async function loadOrders() {
    try {
        const db = getFirestore();
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        allOrders = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            allOrders.push({
                id: doc.id,
                code: data.code,
                customer: data.customer,
                items: data.items,
                total: data.total,
                payment: data.payment,
                status: data.status,
                // Convert Firestore Timestamp to milliseconds
                createdAt: data.createdAt?.toMillis() || Date.now(),
                updatedAt: data.updatedAt?.toMillis() || Date.now()
            });
        });
        
        console.log('✅ Loaded', allOrders.length, 'orders from Firebase');
        
        // Juga simpan ke localStorage sebagai backup
        Storage.saveOrders(allOrders);
        
        return allOrders;
    } catch (error) {
        console.error('❌ Error loading from Firebase:', error);
        // Fallback ke localStorage jika Firebase error
        allOrders = Storage.getOrders();
        console.log('⚠️ Fallback to localStorage:', allOrders.length, 'orders');
        return allOrders;
    }
}

// Setup page navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const page = this.dataset.page;
            
            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show page
            showPage(page);
        });
    });
}

// Show specific page
function showPage(pageName) {
    // Hide all pages
    const pages = document.querySelectorAll('.admin-page');
    pages.forEach(page => page.style.display = 'none');
    
    // Show selected page
    const selectedPage = document.getElementById(`${pageName}Page`);
    if (selectedPage) selectedPage.style.display = 'block';
    
    // Update title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        const titles = {
            dashboard: 'Dashboard',
            orders: 'Manajemen Pesanan',
            products: 'Produk',
            customers: 'Pelanggan',
            settings: 'Pengaturan'
        };
        pageTitle.textContent = titles[pageName] || 'Dashboard';
    }
    
    // Page-specific actions
    if (pageName === 'orders') {
        renderOrdersTable();
    } else if (pageName === 'customers') {
        renderCustomersList();
    }
}

// Update dashboard statistics
async function updateDashboardStats() {
    const orders = loadOrders();
    
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(o => o.status === 'PENDING').length;
    const processingOrders = allOrders.filter(o => o.status === 'DIPROSES').length;
    const completedOrders = allOrders.filter(o => o.status === 'SELESAI').length;
    
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('processingOrders').textContent = processingOrders;
    document.getElementById('completedOrders').textContent = completedOrders;
    document.getElementById('ordersBadge').textContent = pendingOrders;
    
    // Calculate revenue
    const revenue = allOrders
        .filter(o => o.status === 'SELESAI')
        .reduce((sum, o) => sum + o.total, 0);
    
    document.getElementById('totalRevenue').textContent = formatRupiah(revenue);
}

// Render recent orders
async function renderRecentOrders() {
    const orders = loadOrders();
    const recentOrders = allOrders
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5);
    
    const listEl = document.getElementById('recentOrdersList');
    if (!listEl) return;
    
    if (recentOrders.length === 0) {
        listEl.innerHTML = '<p style="text-align: center; color: var(--gray-500); padding: 2rem;">Belum ada pesanan</p>';
        return;
    }
    
    listEl.innerHTML = recentOrders.map(order => `
        <div class="cart-item" style="margin-bottom: 0.75rem;">
            <div class="cart-item-details" style="flex: 1;">
                <div class="cart-item-name">${order.code}</div>
                <div class="cart-item-price">${order.customer.name}</div>
                <div style="font-size: 0.875rem; color: var(--gray-500);">${formatDateShort(order.createdAt)}</div>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 700; color: var(--gold); margin-bottom: 0.5rem;">${formatRupiah(order.total)}</div>
                ${getStatusBadge(order.status)}
            </div>
        </div>
    `).join('');
}

// Setup order filters
function setupOrderFilters() {
    updateFilterCounts();
}

// Update filter counts
async function updateFilterCounts() {
    const orders = loadOrders();
    
    document.getElementById('countAll').textContent = allOrders.length;
    document.getElementById('countPending').textContent = allOrders.filter(o => o.status === 'PENDING').length;
    document.getElementById('countProcessing').textContent = allOrders.filter(o => o.status === 'DIPROSES').length;
    document.getElementById('countCompleted').textContent = allOrders.filter(o => o.status === 'SELESAI').length;
}

// Filter orders
function filterOrders(filter) {
    currentFilter = filter;
    
    // Update active tab
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
        if (tab.dataset.filter === filter) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    renderOrdersTable();
}

// Render orders table
async function renderOrdersTable() {
    const orders = loadOrders();
    let filteredOrders = orders;
    
    if (currentFilter !== 'all') {
        filteredOrders = allOrders.filter(o => o.status === currentFilter);
    }
    
    // Sort by date (newest first)
    filteredOrders.sort((a, b) => b.createdAt - a.createdAt);
    
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    
    if (filteredOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">Tidak ada pesanan</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredOrders.map(order => `
        <tr>
            <td><strong>${order.code}</strong></td>
            <td>${formatDateShort(order.createdAt)}</td>
            <td>
                <div>${order.customer.name}</div>
                <small style="color: var(--gray-500);">${order.customer.phone}</small>
            </td>
            <td>
                <small>${order.items.length} item</small>
            </td>
            <td><strong>${formatRupiah(order.total)}</strong></td>
            <td>
                <span class="status-badge ${order.payment.method === 'transfer' ? 'pending' : 'processing'}">
                    ${order.payment.method === 'transfer' ? order.payment.provider.toUpperCase() : 'COD'}
                </span>
            </td>
            <td>${getStatusBadge(order.status)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewOrderDetail('${order.code}')" title="Lihat Detail">👁️</button>
                    ${order.status !== 'DIPROSES' ? `<button class="btn-icon" onclick="updateStatus('${order.code}', 'DIPROSES')" title="Proses">⏳</button>` : ''}
                    ${order.status !== 'SELESAI' ? `<button class="btn-icon" onclick="updateStatus('${order.code}', 'SELESAI')" title="Selesai">✓</button>` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// Search orders
async function searchOrders() {
    const searchTerm = document.getElementById('searchOrder').value.toLowerCase();
    const orders = loadOrders();
    
    let filteredOrders = orders;
    
    if (currentFilter !== 'all') {
        filteredOrders = allOrders.filter(o => o.status === currentFilter);
    }
    
    if (searchTerm) {
        filteredOrders = filteredOrders.filter(order => 
            order.code.toLowerCase().includes(searchTerm) ||
            order.customer.name.toLowerCase().includes(searchTerm) ||
            order.customer.phone.includes(searchTerm)
        );
    }
    
    // Render filtered results
    filteredOrders.sort((a, b) => b.createdAt - a.createdAt);
    
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    
    if (filteredOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">Tidak ada hasil pencarian</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredOrders.map(order => `
        <tr>
            <td><strong>${order.code}</strong></td>
            <td>${formatDateShort(order.createdAt)}</td>
            <td>
                <div>${order.customer.name}</div>
                <small style="color: var(--gray-500);">${order.customer.phone}</small>
            </td>
            <td><small>${order.items.length} item</small></td>
            <td><strong>${formatRupiah(order.total)}</strong></td>
            <td>
                <span class="status-badge ${order.payment.method === 'transfer' ? 'pending' : 'processing'}">
                    ${order.payment.method === 'transfer' ? order.payment.provider.toUpperCase() : 'COD'}
                </span>
            </td>
            <td>${getStatusBadge(order.status)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewOrderDetail('${order.code}')" title="Lihat Detail">👁️</button>
                    ${order.status !== 'DIPROSES' ? `<button class="btn-icon" onclick="updateStatus('${order.code}', 'DIPROSES')" title="Proses">⏳</button>` : ''}
                    ${order.status !== 'SELESAI' ? `<button class="btn-icon" onclick="updateStatus('${order.code}', 'SELESAI')" title="Selesai">✓</button>` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// View order detail
function viewOrderDetail(orderCode) {
    const order = Storage.getOrderByCode(orderCode);
    if (!order) return;
    
    const modalContent = document.getElementById('orderDetailContent');
    if (!modalContent) return;
    
    modalContent.innerHTML = `
        <div style="display: grid; gap: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="margin: 0; color: var(--primary);">${order.code}</h3>
                    <small style="color: var(--gray-500);">${formatDate(order.createdAt)}</small>
                </div>
                ${getStatusBadge(order.status)}
            </div>
            
            <div style="padding: 1rem; background-color: var(--cream); border-radius: var(--radius-lg);">
                <h4 style="margin: 0 0 1rem 0; color: var(--primary);">Informasi Pelanggan</h4>
                <div style="display: grid; gap: 0.75rem; font-size: 0.9375rem;">
                    <div style="display: grid; grid-template-columns: 120px 1fr;">
                        <strong>Nama:</strong>
                        <span>${order.customer.name}</span>
                    </div>
                    <div style="display: grid; grid-template-columns: 120px 1fr;">
                        <strong>WhatsApp:</strong>
                        <span>${order.customer.phone}</span>
                    </div>
                    ${order.customer.email ? `
                    <div style="display: grid; grid-template-columns: 120px 1fr;">
                        <strong>Email:</strong>
                        <span>${order.customer.email}</span>
                    </div>
                    ` : ''}
                    <div style="display: grid; grid-template-columns: 120px 1fr;">
                        <strong>Alamat:</strong>
                        <span>${order.customer.address}</span>
                    </div>
                    ${order.customer.notes ? `
                    <div style="display: grid; grid-template-columns: 120px 1fr;">
                        <strong>Catatan:</strong>
                        <span>${order.customer.notes}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <div style="padding: 1rem; background-color: var(--cream); border-radius: var(--radius-lg);">
                <h4 style="margin: 0 0 1rem 0; color: var(--primary);">Produk</h4>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${order.items.map(item => `
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem; background-color: var(--white); border-radius: var(--radius-md);">
                            <div>
                                <strong>${item.name}</strong>
                                <div style="font-size: 0.875rem; color: var(--gray-500);">${item.weight} × ${item.quantity}</div>
                            </div>
                            <strong style="color: var(--gold);">${formatRupiah(item.price * item.quantity)}</strong>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="padding: 1rem; background-color: var(--cream); border-radius: var(--radius-lg);">
                <h4 style="margin: 0 0 1rem 0; color: var(--primary);">Pembayaran</h4>
                <div style="display: grid; gap: 0.75rem; font-size: 0.9375rem;">
                    <div style="display: flex; justify-content: space-between;">
                        <strong>Metode:</strong>
                        <span>${order.payment.method === 'transfer' ? 'Transfer ' + order.payment.provider.toUpperCase() : 'COD (Bayar di Tempat)'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <strong>Status:</strong>
                        <span>${order.payment.status}</span>
                    </div>
                    <div style="height: 1px; background-color: var(--gray-300);"></div>
                    <div style="display: flex; justify-content: space-between; font-size: 1.25rem;">
                        <strong style="color: var(--primary);">Total:</strong>
                        <strong style="color: var(--gold);">${formatRupiah(order.total)}</strong>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 0.75rem;">
                ${order.status !== 'DIPROSES' ? `
                <button class="btn btn-secondary" onclick="updateStatus('${order.code}', 'DIPROSES'); closeOrderModal();">
                    Set Diproses
                </button>
                ` : ''}
                ${order.status !== 'SELESAI' ? `
                <button class="btn btn-primary" onclick="updateStatus('${order.code}', 'SELESAI'); closeOrderModal();">
                    Set Selesai
                </button>
                ` : ''}
            </div>
        </div>
    `;
    
    showModal('orderDetailModal');
}

// Update order status
async function updateStatus(orderCode, newStatus) {
    if (Storage.updateOrderStatus(orderCode, newStatus)) {
        showToast(`Status pesanan ${orderCode} diubah menjadi ${newStatus}`, 'success');
        
        // Refresh displays
        updateDashboardStats();
        renderRecentOrders();
        renderOrdersTable();
        updateFilterCounts();
    } else {
        showToast('Gagal mengubah status pesanan', 'error');
    }
}

// Close order modal
function closeOrderModal() {
    hideModal('orderDetailModal');
}

// Render customers list
async function renderCustomersList() {
    const orders = loadOrders();
    const customersMap = new Map();
    
    // Group orders by customer
    allOrders.forEach(order => {
        const phone = order.customer.phone;
        if (!customersMap.has(phone)) {
            customersMap.set(phone, {
                name: order.customer.name,
                phone: order.customer.phone,
                email: order.customer.email,
                orders: [],
                totalSpent: 0
            });
        }
        const customer = customersMap.get(phone);
        customer.orders.push(order);
        customer.totalSpent += order.total;
    });
    
    const customersList = document.getElementById('customersList');
    if (!customersList) return;
    
    if (customersMap.size === 0) {
        customersList.innerHTML = '<p style="text-align: center; color: var(--gray-500); padding: 2rem;">Belum ada pelanggan</p>';
        return;
    }
    
    const customersArray = Array.from(customersMap.values())
        .sort((a, b) => b.totalSpent - a.totalSpent);
    
    customersList.innerHTML = customersArray.map(customer => `
        <div class="cart-item" style="margin-bottom: 0.75rem;">
            <div class="author-avatar" style="flex-shrink: 0;">${customer.name.charAt(0).toUpperCase()}</div>
            <div class="cart-item-details" style="flex: 1;">
                <div class="cart-item-name">${customer.name}</div>
                <div class="cart-item-price">${customer.phone}</div>
                ${customer.email ? `<small style="color: var(--gray-500);">${customer.email}</small>` : ''}
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 700; color: var(--gold); margin-bottom: 0.25rem;">${formatRupiah(customer.totalSpent)}</div>
                <small style="color: var(--gray-500);">${customer.orders.length} pesanan</small>
            </div>
        </div>
    `).join('');
}

// Save settings
function saveSettings() {
    const danaNumber = document.getElementById('danaNumber').value;
    const bniNumber = document.getElementById('bniNumber').value;
    
    const settings = {
        danaNumber: danaNumber,
        bniNumber: bniNumber,
        danaHolder: 'Bubun Kitchen',
        bniHolder: 'PT Bubun Kitchen'
    };
    
    if (Storage.saveSettings(settings)) {
        showToast('Pengaturan berhasil disimpan', 'success');
    } else {
        showToast('Gagal menyimpan pengaturan', 'error');
    }
}

// Export orders data
async function exportOrders() {
    const orders = loadOrders();
    
    if (allOrders.length === 0) {
        showToast('Tidak ada data untuk diekspor', 'error');
        return;
    }
    
    // Convert to CSV
    const headers = ['Kode', 'Tanggal', 'Nama', 'Phone', 'Total', 'Pembayaran', 'Status'];
    const rows = allOrdersmap(order => [
        order.code,
        formatDate(order.createdAt),
        order.customer.name,
        order.customer.phone,
        order.total,
        order.payment.method,
        order.status
    ]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.join(',') + '\n';
    });
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bubun-kitchen-orders-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showToast('Data berhasil diekspor', 'success');
}

// Clear all data
function clearAllData() {
    if (!confirm('⚠️ PERINGATAN!\n\nApakah Anda yakin ingin menghapus SEMUA data pesanan?\n\nTindakan ini TIDAK DAPAT dibatalkan!')) {
        return;
    }
    
    if (!confirm('Konfirmasi sekali lagi: Hapus semua data?')) {
        return;
    }
    
    if (Storage.clearAll()) {
        showToast('Semua data berhasil dihapus', 'success');
        
        // Refresh dashboard
        allOrders = [];
        updateDashboardStats();
        renderRecentOrders();
        renderOrdersTable();
        updateFilterCounts();
    } else {
        showToast('Gagal menghapus data', 'error');
    }
}

// Refresh data
async function refreshData() {
    showToast('Memuat data...', 'info');
    
    await loadOrders(); // 👈 Tambahkan await
    
    updateDashboardStats();
    renderRecentOrders();
    renderOrdersTable();
    updateFilterCounts();
    
    showToast('Data berhasil diperbarui', 'success');
}
// Logout
function logout() {
    if (confirm('Yakin ingin logout?')) {
        sessionStorage.removeItem('admin_authenticated');
        showToast('Logout berhasil', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

// Get status badge
function getStatusBadge(status) {
    const badges = {
        'PENDING': '<span class="status-badge pending">Pending</span>',
        'DIPROSES': '<span class="status-badge processing">Diproses</span>',
        'SELESAI': '<span class="status-badge completed">Selesai</span>'
    };
    return badges[status] || '<span class="status-badge pending">Unknown</span>';
}

// Export functions for global use
window.filterOrders = filterOrders;
window.searchOrders = searchOrders;
window.viewOrderDetail = viewOrderDetail;
window.updateStatus = updateStatus;
window.closeOrderModal = closeOrderModal;
window.saveSettings = saveSettings;
window.exportOrders = exportOrders;
window.clearAllData = clearAllData;
window.refreshData = refreshData;
window.logout = logout;




