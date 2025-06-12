// script.js

// Global Page Navigation Logic
const pageContentContainer = document.getElementById('page-content-container');
const navLinks = document.querySelectorAll('.nav-link');
const mainNavLinksDiv = document.getElementById('main-nav-links');
const userIconsDiv = document.getElementById('user-icons');
const sellLink = document.getElementById('sell-link');

// Initialize user role from local storage, default to 'guest'
let currentUserRole = localStorage.getItem('currentUserRole') || 'guest'; // Persist role across sessions

// Map friendly page IDs to actual file names (matching your exact directory structure)
const pageMap = {
    'home': 'HomePage.html',       // Matches your 'HomePage.html'
    'about': 'aboutPage.html',     // Matches your 'aboutPage.html'
    'weather': 'weatherPage.html', // Matches your 'weatherPage.html'
    'loan': 'loanPage.html',       // Matches your 'loanPage.html'
    'marketplace': 'MarkertplacePage.html', // CORRECTED TYPO: Now uses 'MarkertplacePage.html'
    'sell': 'sellPage.html'        // Matches your 'sellPage.html'
};

// Map friendly page IDs to their corresponding CSS file names (matching your exact directory structure)
const cssMap = {
    'home': 'homepage.css',       // Matches your 'homepage.css'
    'about': 'aboutPage.css',     // Matches your 'aboutPage.css'
    'weather': 'weatherPage.css', // Matches your 'weatherPage.css'
    'loan': 'loanPage.css',       // Matches your 'loanPage.css'
    'marketplace': 'MarkertplacePage.css', // CORRECTED TYPO: Assumes 'MarkertplacePage.css'
    'sell': 'sellPage.css'            // Matches your 'sellPage.css'
};

let currentLoadedCss = null; // To keep track of the currently loaded CSS file

/**
 * Loads the content and associated CSS for a given page ID.
 * @param {string} pageId - The ID of the page to load (e.g., 'home', 'marketplace').
 */
async function loadPage(pageId) {
    const pageUrl = pageMap[pageId];
    const cssUrl = cssMap[pageId]; // Get the CSS file path for the requested page

    if (!pageUrl) {
        console.error('Page URL not found in pageMap for ID:', pageId);
        pageContentContainer.innerHTML = `<div class="text-center text-red-500 py-20">Error: Page configuration missing for ${pageId}.</div>`;
        return;
    }

    try {
        // 1. Remove previous page's CSS if it exists and is different
        if (currentLoadedCss && currentLoadedCss !== cssUrl) {
            const oldLink = document.querySelector(`link[href="${currentLoadedCss}"]`);
            if (oldLink) {
                oldLink.remove();
                console.log(`Removed old CSS: ${currentLoadedCss}`);
            }
        }

        // 2. Load new page's CSS if it exists and is not already loaded
        if (cssUrl && currentLoadedCss !== cssUrl) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssUrl;
            // Append to head so styles apply correctly
            document.head.appendChild(link);
            currentLoadedCss = cssUrl; // Update tracking variable
            console.log(`Loaded new CSS: ${cssUrl}`);
        } else if (!cssUrl) {
            currentLoadedCss = null; // No specific CSS for this page
            console.log(`No specific CSS for page: ${pageId}`);
        }

        // 3. Fetch and load page HTML
        const response = await fetch(pageUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for ${pageUrl}`);
        }
        const html = await response.text();
        pageContentContainer.innerHTML = html;
        console.log(`Loaded HTML for page: ${pageId}`);

        // Update active link in navigation
        navLinks.forEach(link => {
            link.classList.remove('font-bold', 'text-green-200');
            if (link.dataset.target === pageId) {
                link.classList.add('font-bold', 'text-green-200');
            }
        });

        // Scroll to top of the page when navigating
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Special handling for Marketplace page after loading its HTML
        if (pageId === 'marketplace') {
            attachMarketplaceProductListeners();
        }

    } catch (error) {
        console.error('Failed to load page:', pageId, error);
        pageContentContainer.innerHTML = `<div class="text-center text-red-500 py-20">Failed to load ${pageId} page. Please check console for errors.</div>`;
    }
}

/**
 * Updates the visibility of navigation links based on the current user role.
 */
function updateNavBar() {
    // Hide all nav links initially for a clean slate
    navLinks.forEach(link => {
        link.classList.add('hidden');
    });
    sellLink.classList.add('hidden'); // Ensure sell link is hidden by default
    userIconsDiv.classList.add('hidden'); // Hide user icons by default

    // Define common links that all roles (guest, farmer, buyer) can see
    const commonLinks = ['home', 'about', 'weather', 'loan', 'marketplace'];

    // Show common links for all roles
    commonLinks.forEach(target => {
        const linkElement = document.querySelector(`.nav-link[data-target="${target}"]`);
        if (linkElement) {
            linkElement.classList.remove('hidden');
        }
    });

    if (currentUserRole === 'farmer') {
        sellLink.classList.remove('hidden');
        userIconsDiv.classList.remove('hidden');
    } else if (currentUserRole === 'buyer') {
        userIconsDiv.classList.remove('hidden');
    }
    // 'guest' role implies only common links are shown, which is the default state
}

// Add event listeners to main navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default anchor behavior (page refresh)
        const targetPageId = event.target.dataset.target;
        history.pushState({ page: targetPageId }, '', `#${targetPageId}`); // Update URL hash for bookmarking/back button
        loadPage(targetPageId); // Load the new page
    });
});

// Handle browser back/forward buttons (popstate event)
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.page) {
        loadPage(event.state.page);
    } else {
        // Default to home page if no state is found (e.g., initial load without hash)
        loadPage('home');
    }
});


// --- Login/Signup Modal Logic (Global, as modal HTML is in index.html) ---
const loginSignupModal = document.getElementById('login-signup-modal');
const closeModalBtn = document.getElementById('close-modal');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const roleSelection = document.getElementById('role-selection');
const showSignupBtn = document.getElementById('show-signup');
const showLoginBtn = document.getElementById('show-login');
const selectFarmerRoleBtn = document.getElementById('select-farmer-role');
const selectBuyerRoleBtn = document.getElementById('select-buyer-role');

// Add event listeners for modal elements on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            loginSignupModal.classList.add('hidden');
        });
    }
    if (showSignupBtn) {
        showSignupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
        });
    }
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            signupForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        });
    }
    document.querySelectorAll('.login-btn, .signup-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Simulate successful login/signup, then show role selection
            loginForm.classList.add('hidden');
            signupForm.classList.add('hidden');
            roleSelection.classList.remove('hidden');
        });
    });
    if (selectFarmerRoleBtn) {
        selectFarmerRoleBtn.addEventListener('click', () => {
            currentUserRole = 'farmer';
            localStorage.setItem('currentUserRole', 'farmer'); // Persist role
            loginSignupModal.classList.add('hidden');
            updateNavBar();
            loadPage('home'); // Redirect to home page after role selection
        });
    }
    if (selectBuyerRoleBtn) {
        selectBuyerRoleBtn.addEventListener('click', () => {
            currentUserRole = 'buyer';
            localStorage.setItem('currentUserRole', 'buyer'); // Persist role
            loginSignupModal.classList.add('hidden');
            updateNavBar();
            loadPage('home'); // Redirect to home page after role selection
        });
    }
});


/**
 * Attaches event listeners to product cards on the Marketplace page.
 * This function is called every time the marketplace page is loaded.
 */
function attachMarketplaceProductListeners() {
    // Select product cards within the currently loaded marketplace page
    const productCards = pageContentContainer.querySelectorAll('.product-card');
    productCards.forEach(card => {
        // Important: Use cloneNode(true) and replaceChild to ensure listeners are clean
        // This prevents multiple listeners from accumulating if the page is reloaded multiple times
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);

        newCard.addEventListener('click', () => {
            if (currentUserRole === 'guest') {
                // If the user is a guest, show the login/signup modal
                if (loginSignupModal) {
                    loginSignupModal.classList.remove('hidden');
                    loginForm.classList.remove('hidden'); // Show login form first
                    signupForm.classList.add('hidden');
                    roleSelection.classList.add('hidden');
                }
            } else {
                // If user is logged in, simulate product details view or add to cart
                console.log('Product clicked by logged-in user. (Simulate product details/add to cart)');
                // In a real app, this would navigate to a product detail page or add to cart
            }
        });
    });
}


// Initial load logic when script.js first runs
// Get initial page from URL hash (e.g., #about) or default to 'home'
const initialPage = window.location.hash ? window.location.hash.substring(1) : 'home';
updateNavBar(); // Set initial nav bar state based on currentUserRole
loadPage(initialPage); // Load the initial page content and CSS
