// marketplace.js

// --- Product Click Listener ---
function attachMarketplaceProductListeners() {
    const cards = document.querySelectorAll('.product-card');
    console.log("Found product cards:", cards.length);
    cards.forEach(card => {
        // Remove any previous click listeners
        card.onclick = null;
        card.addEventListener('click', () => {
            console.log("Product card clicked:", card.dataset.productName);
            if (!window.currentUserRole || window.currentUserRole === 'guest') {
                window.showAuthModal();
            } else {
                const productDetails = {
                    name: card.dataset.productName,
                    price: parseFloat(card.dataset.productPrice),
                    unit: card.dataset.productUnit,
                    location: card.dataset.productLocation,
                    image: card.dataset.productImage,
                    quantity: 1
                };
                console.log("Calling startCheckout with:", productDetails);
                window.startCheckout(productDetails);
            }
        });
    });
}

// --- Show Auth Modal ---
function showAuthModal() {
    document.getElementById('app-modal').classList.remove('hidden');
    document.getElementById('auth-forms-container').classList.remove('hidden');
    document.getElementById('checkout-process-container').classList.add('hidden');
    showLoginForm();
}
window.showAuthModal = showAuthModal;

// --- Role Selection ---
function showRoleSelection() {
    document.getElementById('role-selection').style.display = '';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'none';
}
window.showRoleSelection = showRoleSelection;

// --- Show Login Form ---
function showLoginForm() {
    document.getElementById('role-selection').style.display = 'none';
    document.getElementById('login-form').style.display = '';
    document.getElementById('signup-form').style.display = 'none';
}
window.showLoginForm = showLoginForm;

// --- Show Signup Form ---
function showSignupForm() {
    document.getElementById('role-selection').style.display = 'none';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = '';
}
window.showSignupForm = showSignupForm;

// After login/signup, show role selection
function afterAuthSuccess() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('role-selection').style.display = '';
}
window.afterAuthSuccess = afterAuthSuccess;

// --- Auth Modal Event Listeners ---
function attachAuthModalListeners() {
    // Show signup
    document.getElementById('show-signup-form').onclick = function(e) {
        e.preventDefault();
        showSignupForm();
    };
    // Show login
    document.getElementById('show-login-form').onclick = function(e) {
        e.preventDefault();
        showLoginForm();
    };

    // After signup, go to login
    document.getElementById('general-signup-btn').onclick = function(e) {
        e.preventDefault();
        showLoginForm();
    };

    // After login, show role selection
    document.getElementById('general-login-btn').onclick = function(e) {
        e.preventDefault();
        showRoleSelection();
    };

    // Role selection
    document.getElementById('select-farmer-role').onclick = function() {
        setUserRole('farmer');
    };
    document.getElementById('select-buyer-role').onclick = function() {
        setUserRole('buyer');
    };
}
window.attachAuthModalListeners = attachAuthModalListeners;

// --- Set User Role and Update Nav ---
function setUserRole(role) {
    window.currentUserRole = role;
    localStorage.setItem('currentUserRole', role);
    document.getElementById('app-modal').classList.add('hidden');
    document.getElementById('auth-forms-container').classList.add('hidden');
    if (typeof updateNavBar === 'function') updateNavBar();
    if (role === 'farmer') {
        if (typeof loadPage === 'function') loadPage('sell');
    } else {
        if (typeof loadPage === 'function') loadPage('marketplace');
    }
}
window.setUserRole = setUserRole;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', function() {
    attachMarketplaceProductListeners();
    attachAuthModalListeners();
});