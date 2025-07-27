document.addEventListener('DOMContentLoaded', () => {

    // ==================================================
    // STATE & CONFIG
    // ==================================================
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let lastFocusedElement; // For accessibility
    const products = [
        { id: 1, name: 'Ceramic Vase', price: 3999, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrKmnO8DQe8E3Ii2c-WqSR3ou-rJQbbk0YlA&s' },
        { id: 2, name: 'Wooden Chair', price: 9999, image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8ZnVybml0dXJlfHx8fHx8MTYxNzY1NTY1OA&ixlib=rb-1.2.1&q=80&w=1080' },
        { id: 3, name: 'Minimalist Lamp', price: 6499, image: 'https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8ZGVjb3J8fHx8fHwxNjE3NjU1NjU4&ixlib=rb-1.2.1&q=80&w=1080' },
        { id: 4, name: 'Woven Basket', price: 2999, image: 'https://m.media-amazon.com/images/I/81m36SsnBAL._UF350,350_QL80_.jpg' },
        { id: 5, name: 'Scented Candle', price: 1999, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiahoVSiEizwd3B_BwJJsL6Nf6eyjSnk3KSw&s' },
        { id: 6, name: 'Linen Throw Pillow', price: 3799, image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8aG9tZSUyMGRlY29yfHx8fHx8MTYxNzY1NTY1OA&ixlib=rb-1.2.1&q=80&w=1080' },
        { id: 7, name: 'Marble Coasters', price: 2499, image: 'https://m.media-amazon.com/images/I/8137TvwLSRL.jpg' },
        { id: 8, name: 'Wall Art Print', price: 5499, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqOFwMepG302WWfdZpXOfUD81XtNlJhW8kxQ&s' },
        { id: 9, name: 'Floating Shelves', price: 4599, image: 'https://m.media-amazon.com/images/I/71dkL0GxoCL.jpg' },
    ];

    // ==================================================
    // DOM ELEMENTS
    // ==================================================
    const productList = document.getElementById('product-list');
    const cartCount = document.querySelector('.cart-count');
    const cartIcon = document.querySelector('.cart a');
    const cartPanel = document.querySelector('.cart-panel');
    const cartPanelOverlay = document.querySelector('.cart-panel-overlay');
    const closeCartBtn = document.querySelector('.close-cart-btn');
    const backToTopBtn = document.querySelector('.back-to-top-btn');
    const cartItemsList = document.getElementById('cart-items');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const toastContainer = document.getElementById('toast-container');
    const contactForm = document.getElementById('contact-form');

    // ==================================================
    // CORE FUNCTIONS
    // ==================================================

    // --- Product & UI Rendering ---
    const displayProducts = () => {
        if (!productList) return;
        productList.innerHTML = products.map(product => `
            <div class="product-card fade-in-up">
                <div class="product-image">
                    <img class="lazy" data-src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="price">₹${product.price.toFixed(2)}</p>
                    <button class="btn add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                </div>
            </div>`).join('');
        setupObservers();
    };

    // --- Cart Management ---
    const addToCart = (productId) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            cart.push(product);
            updateCartDisplay();
            showToast(`${product.name} has been added to your cart.`);
        }
    };

    const removeFromCart = (itemIndex) => {
        const removedItem = cart[itemIndex];
        cart.splice(itemIndex, 1);
        updateCartDisplay();
        showToast(`${removedItem.name} has been removed from your cart.`);
    };

    const updateCartDisplay = () => {
        renderCartItems();
        updateCartCount();
        updateSubtotal();
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    const renderCartItems = () => {
        if (cart.length === 0) {
            cartItemsList.innerHTML = '<div class="cart-empty"><p>Your cart is empty.</p><p>Explore our collection and find something you love.</p></div>';
            return;
        }
        cartItemsList.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="price">₹${item.price.toFixed(2)}</p>
                    <button class="remove-item-btn" data-index="${index}">Remove</button>
                </div>
            </div>`).join('');
    };

    const updateCartCount = () => {
        cartCount.textContent = cart.length;
    };

    const updateSubtotal = () => {
        const subtotal = cart.reduce((total, item) => total + item.price, 0);
        cartSubtotal.textContent = `₹${subtotal.toFixed(2)}`;
    };

    // --- Cart Panel & Accessibility ---
    const openCartPanel = () => {
        lastFocusedElement = document.activeElement;
        cartPanel.classList.add('active');
        cartPanelOverlay.classList.add('active');
        cartPanel.setAttribute('aria-hidden', 'false');
        closeCartBtn.focus();
        trapFocus(cartPanel);
    };

    const closeCartPanel = () => {
        cartPanel.classList.remove('active');
        cartPanelOverlay.classList.remove('active');
        cartPanel.setAttribute('aria-hidden', 'true');
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    };

    const trapFocus = (element) => {
        const focusableEls = element.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])');
        if (focusableEls.length === 0) return;
        const firstFocusableEl = focusableEls[0];
        const lastFocusableEl = focusableEls[focusableEls.length - 1];
        const KEYCODE_TAB = 9;

        element.addEventListener('keydown', function(e) {
            if (e.key !== 'Tab' && e.keyCode !== KEYCODE_TAB) return;

            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstFocusableEl) {
                    lastFocusableEl.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastFocusableEl) {
                    firstFocusableEl.focus();
                    e.preventDefault();
                }
            }
        });
    };

    // --- UI Feedback ---
    const showToast = (message) => {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toastContainer.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100); // Animate in

        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    };

    // --- Observers for Animations & Lazy Loading ---
    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    const setupObservers = () => {
        document.querySelectorAll('.fade-in-up').forEach(el => animationObserver.observe(el));
        document.querySelectorAll('img.lazy').forEach(img => lazyLoadObserver.observe(img));
    };

    // ==================================================
    // EVENT LISTENERS
    // ==================================================

    // --- Product & Cart Interactions ---
    if (productList) {
        productList.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                addToCart(parseInt(e.target.dataset.id));
            }
        });
    }

    cartItemsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item-btn')) {
            removeFromCart(parseInt(e.target.dataset.index));
        }
    });

    // --- Cart Panel Toggling ---
    cartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        openCartPanel();
    });

    closeCartBtn.addEventListener('click', closeCartPanel);
    cartPanelOverlay.addEventListener('click', closeCartPanel);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cartPanel.classList.contains('active')) {
            closeCartPanel();
        }
    });

    // --- Back to Top Button ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('active');
        } else {
            backToTopBtn.classList.remove('active');
        }
    });

    backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // --- Form Submissions ---
    if (contactForm) {
        const formStatus = document.getElementById('form-status');
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = contactForm.querySelector('#name').value.trim();
            const email = contactForm.querySelector('#email').value.trim();
            const message = contactForm.querySelector('#message').value.trim();
            const emailRegex = /^\S+@\S+\.\S+$/;

            if (!name || !email || !message) {
                formStatus.textContent = 'Please fill out all fields.';
                formStatus.className = 'error';
            } else if (!emailRegex.test(email)) {
                formStatus.textContent = 'Please enter a valid email address.';
                formStatus.className = 'error';
            } else {
                formStatus.textContent = 'Thank you! Your message has been sent.';
                formStatus.className = 'success';
                contactForm.reset();
            }
        });
    }

    document.querySelectorAll('.newsletter-form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = form.querySelector('input');
            const button = form.querySelector('button');
            if (input.value && /\S+@\S+\.\S+/.test(input.value)) {
                showToast('Thank you for subscribing!');
                button.textContent = 'Subscribed';
                input.disabled = true;
                button.disabled = true;
            }
        });
    });

    // ==================================================
    // SCROLL ANIMATIONS
    // ==================================================
    const setupAnimationObserver = () => {
        const animatedElements = document.querySelectorAll('.fade-in-up');
        if (!animatedElements.length) return;

        const animationObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(el => {
            animationObserver.observe(el);
        });
    };

    // ==================================================
    // INITIALIZATION
    // ==================================================
    const init = () => {
        displayProducts();
        updateCartDisplay();
        setupAnimationObserver();
    };

    init();

});

