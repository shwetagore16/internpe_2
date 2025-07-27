document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('summary-cart-items');
    const cartTotalElement = document.getElementById('summary-total');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const shippingForm = document.getElementById('shipping-form');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const renderOrderSummary = () => {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            return;
        }

        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="price">₹${item.price.toFixed(2)}</p>
                </div>
            </div>
        `).join('');

        const total = cart.reduce((sum, item) => sum + item.price, 0);
        cartTotalElement.textContent = `₹${total.toFixed(2)}`;
    };

    const placeOrder = () => {
        if (shippingForm.checkValidity()) {
            alert('Thank you for your order! It has been placed successfully.');
            localStorage.removeItem('cart');
            window.location.href = 'index.html';
        } else {
            shippingForm.reportValidity();
        }
    };

    placeOrderBtn.addEventListener('click', placeOrder);

    renderOrderSummary();
});
