// --- GLOBAL NAVIGATION LOGIC ---
const allNavLinks = document.querySelectorAll('.nav-link, .nav-popup-link');
const userIconsDiv = document.getElementById('user-icons');
const sellLink = document.getElementById('sell-link');
const profileIcon = document.getElementById('profile-icon');
const profilePopupMenu = document.getElementById('profile-popup-menu');

let currentUserRole = localStorage.getItem('currentUserRole') || 'guest';
window.currentUserRole = currentUserRole;

// --- NAVBAR LOGIC ---
function updateNavBar() {
    // Hide all nav links and icons first
    document.querySelectorAll('.nav-link').forEach(link => link.classList.add('hidden'));
    const sellLink = document.getElementById('sell-link');
    const userIcons = document.getElementById('user-icons');
    if (sellLink) sellLink.classList.add('hidden');
    if (userIcons) userIcons.classList.add('hidden');

    // Always show these for all roles
    ['home', 'about', 'weather', 'loan', 'marketplace'].forEach(target => {
        const link = document.querySelector(`.nav-link[data-target="${target}"]`);
        if (link) link.classList.remove('hidden');
    });

    if (window.currentUserRole === 'farmer') {
        if (sellLink) sellLink.classList.remove('hidden');
        if (userIcons) userIcons.classList.remove('hidden');
    } else if (window.currentUserRole === 'buyer') {
        if (userIcons) userIcons.classList.remove('hidden');
    }
    // For guest, only the always-visible links are shown
}
window.updateNavBar = updateNavBar;

// --- PAGE SECTION LOGIC ---
function showPageSection(pageId) {
    document.querySelectorAll('.page-section').forEach(section => section.classList.add('hidden'));
    const pageSection = document.getElementById(`${pageId}-page-section`);
    if (pageSection) pageSection.classList.remove('hidden');
}
window.showPageSection = showPageSection;

function loadPage(pageId) {
    showPageSection(pageId);
    // Optionally update nav active state here
}
window.loadPage = loadPage;

// --- AUTH MODAL LOGIC (for completeness, matches marketplacePage.js) ---
function showRoleSelection() {
    document.getElementById('role-selection').style.display = '';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'none';
}
window.showRoleSelection = showRoleSelection;

function showLoginForm() {
    document.getElementById('role-selection').style.display = 'none';
    document.getElementById('login-form').style.display = '';
    document.getElementById('signup-form').style.display = 'none';
}
window.showLoginForm = showLoginForm;

function showSignupForm() {
    document.getElementById('role-selection').style.display = 'none';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = '';
}
window.showSignupForm = showSignupForm;

// --- CHECKOUT MODAL LOGIC ---
function startCheckout(productDetails) {
    console.log("startCheckout called", productDetails);
    document.getElementById('app-modal').classList.remove('hidden');
    document.getElementById('checkout-process-container').classList.remove('hidden');
    document.getElementById('auth-forms-container').classList.add('hidden');

    const checkoutContainer = document.getElementById('checkout-process-container');
    checkoutContainer.innerHTML = `
        <div class="p-6">
            <h2 class="text-xl font-bold mb-4">Checkout</h2>
            <div class="mb-4 flex items-center">
                <img src="${productDetails.image}" alt="${productDetails.name}" class="w-16 h-16 rounded mr-4">
                <div>
                    <div class="font-semibold">${productDetails.name}</div>
                    <div class="text-gray-600">${productDetails.unit} - ₱${productDetails.price}</div>
                    <div class="text-gray-500">${productDetails.location}</div>
                </div>
            </div>
            <label class="block mb-2">Quantity:</label>
            <input id="checkout-qty" type="number" min="1" value="${productDetails.quantity || 1}" class="border rounded p-2 w-20 mb-4">
            <button id="checkout-final-btn" class="bg-green-600 text-white px-4 py-2 rounded w-full">Place Order</button>
        </div>
    `;

    document.getElementById('checkout-final-btn').onclick = function() {
        document.getElementById('app-modal').classList.add('hidden');
        document.getElementById('checkout-process-container').classList.add('hidden');
        if (typeof loadPage === 'function') loadPage('my-activity');
    };
}
window.startCheckout = startCheckout;

// --- MODAL CLOSE BUTTON LOGIC ---
document.addEventListener('DOMContentLoaded', function() {
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) {
        closeBtn.onclick = function() {
            document.getElementById('app-modal').classList.add('hidden');
            document.getElementById('checkout-process-container').classList.add('hidden');
            document.getElementById('auth-forms-container').classList.add('hidden');
        };
    }
});

// --- INITIAL USER ROLE SETUP ---
window.currentUserRole = localStorage.getItem('currentUserRole') || 'guest';
updateNavBar();

function showPageSection(pageId) {
    document.querySelectorAll('.page-section').forEach(section => section.classList.add('hidden'));
    const pageSection = document.getElementById(`${pageId}-page-section`);
    if (pageSection) pageSection.classList.remove('hidden');
}
window.showPageSection = showPageSection; // Make available to other scripts

function loadPage(pageId) {
    const pageMap = {
        home: 'pages/HomePage.html',
        about: 'pages/aboutPage.html',
        weather: 'pages/weatherPage.html',
        loan: 'pages/loanPage.html',
        marketplace: 'pages/marketplacePage.html',
        sell: 'pages/sellPage.html',
        profile: 'pages/profilePage.html',
        'my-activity': 'pages/MyActivityPage.html',
        'government-updates': 'pages/GovernmentUpdatePage.html',
        'animo-services': 'pages/AnimoServicesPage.html',
        'learning-hub': 'pages/LearningHubPage.html'
    };
    const container = document.getElementById('page-content-container');
    if (!container) return;
    const url = pageMap[pageId] || pageMap['home'];
    fetch(url)
        .then(res => res.text())
        .then(html => {
            container.innerHTML = html;
            window.scrollTo(0, 0);
        })
        .catch(() => {
            container.innerHTML = '<div class="p-8 text-center text-red-600">Page not found.</div>';
        });
}

// Navigation event listeners
document.querySelectorAll('.nav-link, .nav-popup-link').forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetPageId = event.target.dataset.target;
        history.pushState({ page: targetPageId }, '', `#${targetPageId}`);
        loadPage(targetPageId);
        // Hide profile popup if open
        const profilePopupMenu = document.getElementById('profile-popup-menu');
        if (profilePopupMenu) profilePopupMenu.classList.add('hidden');
    });
});

// Handle browser back/forward
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.page) {
        loadPage(event.state.page);
    } else {
        loadPage('home');
    }
});

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    const initialPage = window.location.hash ? window.location.hash.substring(1) : 'home';
    loadPage(initialPage);
    updateNavBar();
    showPageSection(initialPage);
    attachMarketplaceProductListeners();
    attachAuthModalListeners();
    attachCheckoutListeners();
});

// --- PAGE-SPECIFIC LOGIC (Home/About/Weather/Services/Learning Hub) ---
// (Copy your functions like initHomePageSwipers, initAboutUsSwiper, updateWeatherBannerBackground, etc. here.)
// Example:
function initHomePageSwipers() { /* ... */ }
window.initHomePageSwipers = initHomePageSwipers;
// ...etc for other non-marketplace pages...

// Profile popup logic
if (profileIcon) {
    profileIcon.addEventListener('click', (event) => {
        event.stopPropagation();
        if (profilePopupMenu) {
            profilePopupMenu.classList.toggle('hidden');
        }
    });
}
document.addEventListener('click', (event) => {
    if (
        profilePopupMenu &&
        !profilePopupMenu.classList.contains('hidden') &&
        !profilePopupMenu.contains(event.target) &&
        event.target !== profileIcon
    ) {
        profilePopupMenu.classList.add('hidden');
    }
});

function showCheckoutModal(productId) {
    // Show modal and start checkout process for the selected product
    document.getElementById('app-modal').classList.remove('hidden');
    document.getElementById('checkout-process-container').classList.remove('hidden');
    // ...populate checkout with product info...
    // ...attach checkout step listeners...
}

function attachCheckoutListeners() {
    // On final checkout button click:
    document.querySelectorAll('.checkout-final-btn').forEach(btn => {
        btn.onclick = function() {
            // ...process order...
            document.getElementById('app-modal').classList.add('hidden');
            document.getElementById('checkout-process-container').classList.add('hidden');
            loadPage('my-activity');
        };
    });
}

function showAuthModal() {
    // Remove 'hidden' class to show modal and auth forms container
    document.getElementById('app-modal').classList.remove('hidden');
    document.getElementById('auth-forms-container').classList.remove('hidden');
    // Hide checkout container if visible
    document.getElementById('checkout-process-container').classList.add('hidden');
    showRoleSelection();
}
function showAuthModal() {
    // Remove 'hidden' class to show modal and auth forms container
    document.getElementById('app-modal').classList.remove('hidden');
    document.getElementById('auth-forms-container').classList.remove('hidden');
    // Hide checkout container if visible
    document.getElementById('checkout-process-container').classList.add('hidden');
    showRoleSelection();
}

function showRoleSelection() {
    document.getElementById('role-selection').style.display = '';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'none';
}
function showLoginForm() {
    document.getElementById('role-selection').style.display = 'none';
    document.getElementById('login-form').style.display = '';
    document.getElementById('signup-form').style.display = 'none';
}
function showSignupForm() {
    document.getElementById('role-selection').style.display = 'none';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = '';
}

window.updateNavBar = updateNavBar;
window.loadPage = loadPage;

// 1. Make sure this is global so marketplacePage.js can call it
function startCheckout(productDetails) {
    document.getElementById('app-modal').classList.remove('hidden');
    document.getElementById('checkout-process-container').classList.remove('hidden');
    document.getElementById('auth-forms-container').classList.add('hidden');

    const checkoutContainer = document.getElementById('checkout-process-container');
    checkoutContainer.innerHTML = `
        <div class="p-6">
            <h2 class="text-xl font-bold mb-4">Checkout</h2>
            <div class="mb-4 flex items-center">
                <img src="${productDetails.image}" alt="${productDetails.name}" class="w-16 h-16 rounded mr-4">
                <div>
                    <div class="font-semibold">${productDetails.name}</div>
                    <div class="text-gray-600">${productDetails.unit} - ₱${productDetails.price}</div>
                    <div class="text-gray-500">${productDetails.location}</div>
                </div>
            </div>
            <label class="block mb-2">Quantity:</label>
            <input id="checkout-qty" type="number" min="1" value="${productDetails.quantity || 1}" class="border rounded p-2 w-20 mb-4">
            <button id="checkout-final-btn" class="bg-green-600 text-white px-4 py-2 rounded w-full">Place Order</button>
        </div>
    `;

    document.getElementById('checkout-final-btn').onclick = function() {
        document.getElementById('app-modal').classList.add('hidden');
        document.getElementById('checkout-process-container').classList.add('hidden');
        if (typeof loadPage === 'function') loadPage('my-activity');
    };
}
window.startCheckout = startCheckout;

// 2. Modal close button logic (if not already present)
document.addEventListener('DOMContentLoaded', function() {
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) {
        closeBtn.onclick = function() {
            document.getElementById('app-modal').classList.add('hidden');
            document.getElementById('checkout-process-container').classList.add('hidden');
            document.getElementById('auth-forms-container').classList.add('hidden');
        };
    }
});