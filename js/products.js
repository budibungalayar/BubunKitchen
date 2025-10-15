// ==========================================
// BUBUN KITCHEN - PRODUCTS DATA & RENDERING
// Data produk dan fungsi render catalog
// ==========================================

// Product data dengan 2 gambar per produk
const PRODUCTS = [
    {
        id: 1,
        name: 'Nutri Chicken Bites Frozen 150gr',
        slug: 'frozen-150gr',
        price: 17000,
        weight: '150gr',
        type: 'frozen',
        images: [
            'images/product1-img1.jpg',
            'images/product1-img2.jpg',
            'images/product1-img3.jpg'
        ],
        description: 'Nugget ayam premium tanpa pengawet. Cocok untuk porsi personal atau mencoba produk kami.',
        nutrition: {
            calories: '180 kcal',
            protein: '15g',
            fat: '7g',
            carbs: '8g'
        },
        serving: 'Goreng 3-5 menit atau airfrayer 10 menit hingga keemasan',
        badge: null
    },
    {
        id: 2,
        name: 'Nutri Chicken Bites Frozen 300gr',
        slug: 'frozen-300gr',
        price: 37000,
        weight: '300gr',
        type: 'frozen',
        images: [
            'images/product2-img1.jpg',
            'images/product2-img2.jpg',
            'images/product2-img3.jpg'
        ],
        description: 'Nugget ayam premium tanpa pengawet. Hemat untuk keluarga! Best seller kami.',
        nutrition: {
            calories: '180 kcal / 100gr',
            protein: '15g / 100gr',
            fat: '7g / 100gr',
            carbs: '8g / 100gr'
        },
        serving: 'Goreng 3-5 menit atau airfrayer 10 menit hingga keemasan',
        badge: 'Best Seller'
    },
    {
        id: 3,
        name: 'Nutri Chicken Bites Matang',
        slug: 'ready-to-eat isi 8',
        price: 12000,
        weight: 'Matang siap makan',
        type: 'ready',
        images: [
            'images/product3-mp1.mp4',
            'images/product3-img1.jpg',
            'images/product3-img2.jpg'
        ],
        description: 'Nugget ayam sudah matang, siap santap. Praktis untuk camilan atau bekal instant.',
        nutrition: {
            calories: '44 kcal / potong',
            protein: '2.5g / potong',
            fat: '1.5g / potong',
            carbs: '2.2g / potong'
        },
        serving: 'Siap dimakan langsung atau dihangatkan sebentar',
        badge: null
    }
];

// Render products to grid
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    PRODUCTS.forEach(product => {
        const card = createProductCard(product);
        grid.appendChild(card);
    });
    
    // Initialize sliders after render
    setTimeout(() => {
        initializeProductSliders();
    }, 100);
}

// Create product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-product-id', product.id);
    
    card.innerHTML = `
        ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
        
            <div class="product-slider" data-slider-id="${product.id}">
                <div class="slider-track">
                    ${product.images.map(img => {
                        const ext = img.split('.').pop().toLowerCase();
                        if (['mp4', 'webm', 'ogg'].includes(ext)) {
                            return `<video src="${img}" controls class="slider-media" preload="metadata"></video>`;
                        } else {
                            return `<img src="${img}" alt="${product.name}" class="slider-media">`;
                        }
                    }).join('')}
                </div>
            <div class="slider-arrow slider-arrow-left" onclick="previousSlide(${product.id})">‹</div>
            <div class="slider-arrow slider-arrow-right" onclick="nextSlide(${product.id})">›</div>
            <div class="slider-controls">
                ${product.images.map((_, index) => `
                    <span class="slider-dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${product.id}, ${index})"></span>
                `).join('')}
            </div>
        </div>
        
        <div class="product-content">
            <div class="product-header">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-weight">${product.weight}</p>
            </div>
            
            <p class="product-description">${product.description}</p>
            
            <div class="product-price">${formatRupiah(product.price)}</div>
            
            <div class="product-actions">
                <button class="btn btn-primary btn-block" onclick="addToCart(${product.id})">
                    Tambah ke Keranjang
                </button>
            </div>
            
            <details class="nutrition-toggle">
                <summary>Informasi Nutrisi</summary>
                <div class="nutrition-info">
                    <p><strong>Nilai Gizi:</strong></p>
                    <div class="nutrition-grid">
                        <div class="nutrition-item">
                            <span>Kalori</span>
                            <strong>${product.nutrition.calories}</strong>
                        </div>
                        <div class="nutrition-item">
                            <span>Protein</span>
                            <strong>${product.nutrition.protein}</strong>
                        </div>
                        <div class="nutrition-item">
                            <span>Lemak</span>
                            <strong>${product.nutrition.fat}</strong>
                        </div>
                        <div class="nutrition-item">
                            <span>Karbohidrat</span>
                            <strong>${product.nutrition.carbs}</strong>
                        </div>
                    </div>
                    <p style="margin-top: 1rem;"><strong>Cara Penyajian:</strong></p>
                    <p style="margin: 0;">${product.serving}</p>
                </div>
            </details>
        </div>
    `;
    
    return card;
}

// Product slider functionality
let sliderStates = {};

function initializeProductSliders() {
    PRODUCTS.forEach(product => {
        sliderStates[product.id] = {
            currentIndex: 0,
            totalSlides: product.images.length,
            autoplayInterval: null
        };
        
        // Start autoplay
        startAutoplay(product.id);
        
        // Pause on hover
        const slider = document.querySelector(`[data-slider-id="${product.id}"]`);
        if (slider) {
            slider.addEventListener('mouseenter', () => stopAutoplay(product.id));
            slider.addEventListener('mouseleave', () => startAutoplay(product.id));
        }
    });
}

function updateSlider(productId) {
    const slider = document.querySelector(`[data-slider-id="${productId}"]`);
    if (!slider) return;
    
    const track = slider.querySelector('.slider-track');
    const dots = slider.querySelectorAll('.slider-dot');
    const state = sliderStates[productId];
    
    if (track) {
        track.style.transform = `translateX(-${state.currentIndex * 100}%)`;
    }
    
    dots.forEach((dot, index) => {
        if (index === state.currentIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function nextSlide(productId) {
    const state = sliderStates[productId];
    if (!state) return;
    
    state.currentIndex = (state.currentIndex + 1) % state.totalSlides;
    updateSlider(productId);
    
    // Reset autoplay
    stopAutoplay(productId);
    startAutoplay(productId);
}

function previousSlide(productId) {
    const state = sliderStates[productId];
    if (!state) return;
    
    state.currentIndex = (state.currentIndex - 1 + state.totalSlides) % state.totalSlides;
    updateSlider(productId);
    
    // Reset autoplay
    stopAutoplay(productId);
    startAutoplay(productId);
}

function goToSlide(productId, index) {
    const state = sliderStates[productId];
    if (!state) return;
    
    state.currentIndex = index;
    updateSlider(productId);
    
    // Reset autoplay
    stopAutoplay(productId);
    startAutoplay(productId);
}

function startAutoplay(productId) {
    const state = sliderStates[productId];
    if (!state) return;
    
    stopAutoplay(productId); // Clear existing interval
    
    state.autoplayInterval = setInterval(() => {
        nextSlide(productId);
    }, 4000); // Change slide every 4 seconds
}

function stopAutoplay(productId) {
    const state = sliderStates[productId];
    if (!state) return;
    
    if (state.autoplayInterval) {
        clearInterval(state.autoplayInterval);
        state.autoplayInterval = null;
    }
}

// Get product by ID
function getProductById(id) {
    return PRODUCTS.find(product => product.id === parseInt(id));
}

// Get product by slug
function getProductBySlug(slug) {
    return PRODUCTS.find(product => product.slug === slug);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PRODUCTS,
        renderProducts,
        getProductById,
        getProductBySlug
    };

}





