// script.js - Global Script for AniMoPH Application

// Global Page Navigation Logic
const pageContentContainer = document.getElementById('page-content-container');
const allNavLinks = document.querySelectorAll('.nav-link, .nav-popup-link');
const userIconsDiv = document.getElementById('user-icons');
const sellLink = document.getElementById('sell-link');
const profileIcon = document.getElementById('profile-icon');
const profilePopupMenu = document.getElementById('profile-popup-menu');

// Initialize user role from local storage, default to 'guest'
let currentUserRole = localStorage.getItem('currentUserRole') || 'guest';
window.currentUserRole = currentUserRole; // Expose globally

// Map friendly page IDs to actual file names
const pageMap = {
    'home': '/pages/HomePage.html',
    'about': '/pages/aboutPage.html',
    'weather': '/pages/weatherPage.html',
    'loan': '/pages/loanPage.html',
    'marketplace': '/pages/MarketplacePage.html',
    'sell': '/pages/sellPage.html',
    'profile': '/pages/profilePage.html',
    'my-activity': '/pages/MyActivityPage.html',
    'government-updates': '/pages/GovernmentUpdatePage.html',
    'animo-services': '/pages/AniMoServicesPage.html',
    'learning-hub': '/pages/LearningHubPage.html'
};

// Map friendly page IDs to their corresponding CSS file names
const cssMap = {
    'home': '/css/homepage.css',
    'about': '/css/aboutPage.css',
    'weather': '/css/weatherPage.css',
    'loan': '/css/loanPage.css',
    'marketplace': '/css/MarketplacePage.css',
    'sell': '/css/sellPage.css',
    'profile': '/css/profilePage.css',
    'my-activity': '/css/myActivityPage.css',
    'government-updates': '/css/governmentUpdatePage.css',
    'animo-services': '/css/animoServicesPage.css',
    'learning-hub': '/css/learningHubPage.css',
};

let currentLoadedCss = null; // To keep track of the currently loaded CSS file

/**
 * Corrects image `src` attributes that might be using the 'uploaded:' scheme.
 * Replaces them with a placeholder to prevent `ERR_UNKNOWN_URL_SCHEME` errors.
 * @param {HTMLElement} container - The DOM element to search within for images.
 */
function correctImageSources(container) {
    container.querySelectorAll('img').forEach(img => {
        if (img.src.startsWith('uploaded:')) {
            const originalSrc = img.src;
            // Replace with a generic placeholder. In a real app, you'd re-upload or link to proper assets.
            img.src = 'https://placehold.co/400x250/A0A0A0/FFF?text=Image+Placeholder';
            console.warn(`[Image Correction] Corrected problematic image src: ${originalSrc} to ${img.src}`);
        }
    });
}

/**
 * Loads the content and associated CSS for a given page ID.
 * @param {string} pageId - The ID of the page to load (e.g., 'home', 'marketplace').
 */
async function loadPage(pageId) {
    console.log(`[loadPage] Attempting to load page: ${pageId}`);
    let targetPageId = pageId;

    let pageUrl = pageMap[targetPageId];
    let cssUrl = cssMap[targetPageId];

    if (!pageUrl) {
        console.warn(`[loadPage] Page URL not found in pageMap for ID: ${pageId}. Falling back to 'home'.`);
        targetPageId = 'home';
        pageUrl = pageMap[targetPageId];
        cssUrl = cssMap[targetPageId];
        if (!pageUrl) {
             console.error(`[loadPage] Critical Error: 'home' page also not configured.`);
             pageContentContainer.innerHTML = `<div class="text-center text-red-500 py-20">Critical Error: Main navigation pages are not configured.</div>`;
             return;
        }
    }

    try {
        // 1. Remove previous page's CSS if it exists and is different
        console.log(`[loadPage] Current loaded CSS: ${currentLoadedCss}, New CSS: ${cssUrl}`);
        if (currentLoadedCss && currentLoadedCss !== cssUrl) {
            const oldLink = document.querySelector(`link[href="${currentLoadedCss}"]`);
            if (oldLink) {
                oldLink.remove();
                console.log(`[loadPage] Removed old CSS: ${currentLoadedCss}`);
            }
        }

        // 2. Load new page's CSS if it exists and is not already loaded
        if (cssUrl && currentLoadedCss !== cssUrl) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssUrl;
            link.onload = () => console.log(`[loadPage] Successfully loaded CSS: ${cssUrl}`);
            link.onerror = (e) => console.error(`[loadPage] Failed to load CSS: ${cssUrl}. Check path and MIME type.`, e);
            document.head.prepend(link);
            currentLoadedCss = cssUrl;
        } else if (!cssUrl) {
            currentLoadedCss = null;
            console.log(`[loadPage] No specific CSS for page: ${targetPageId}`);
        }

        // 3. Fetch and load page HTML
        console.log(`[loadPage] Fetching HTML from: ${pageUrl}`);
        const response = await fetch(pageUrl);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} for ${pageUrl}. Response body: ${errorText.substring(0, 200)}...`);
        }
        let html = await response.text();

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Correct image sources within the fetched content before injecting
        correctImageSources(tempDiv);

        // Extract and remove script tags from the loaded content (most JS is in script.js)
        const scriptsToExecute = Array.from(tempDiv.querySelectorAll('script'));
        scriptsToExecute.forEach(script => script.remove());

        // Hide all current page sections before loading new content
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active'); // Remove active class
        });

        // Inject the remaining HTML (without scripts) into the pageContentContainer
        // Find the specific page-section div within index.html and update its content
        const targetSection = document.getElementById(`${targetPageId}-page-section`); // Use the new naming convention
        if (targetSection) {
            targetSection.innerHTML = tempDiv.innerHTML; // Update content within the existing div
            targetSection.classList.remove('hidden'); // Show the target section
            targetSection.classList.add('active'); // Mark as active
            console.log(`[loadPage] Loaded HTML for page: ${targetPageId} into its existing div.`);
        } else {
            // Fallback if the target section is not found (shouldn't happen with updated index.html)
            pageContentContainer.innerHTML = tempDiv.innerHTML; // Inject directly if no specific section
            console.warn(`[loadPage] Target section #${targetPageId}-page-section not found in index.html. Injected directly into container.`);
        }

        // Execute the extracted scripts (if any, though page-specific-listeners handles most)
        scriptsToExecute.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            if (oldScript.textContent) {
                newScript.textContent = oldScript.textContent;
            }
            if (oldScript.src) {
                newScript.src = oldScript.src;
            }
            document.body.appendChild(newScript);
            console.log(`[loadPage] Executing script for ${targetPageId}: ${oldScript.src || 'inline script'}`);
        });

        // 4. Update active link in navigation
        document.querySelectorAll('.nav-link, .nav-popup-link').forEach(link => {
            link.classList.remove('font-bold', 'text-green-200');
            if (link.dataset.target === pageId) {
                link.classList.add('font-bold', 'text-green-200');
            }
        });

        // 5. Scroll to top of the page when navigating
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 6. Execute page-specific JavaScript after HTML is loaded and its scripts run
        executePageSpecificJS(targetPageId);

    } catch (error) {
        console.error(`[loadPage] Failed to load page: ${targetPageId}`, error);
        pageContentContainer.innerHTML = `<div class="text-center text-red-500 py-20">Failed to load ${targetPageId} page. Please check console for errors. Details: ${error.message}</div>`;
    }
}

/**
 * Executes JavaScript specific to the loaded page.
 * This function should be called after the page's HTML is injected into the DOM.
 * @param {string} pageId - The ID of the page whose JS should be executed.
 */
function executePageSpecificJS(pageId) {
    console.log(`[executePageSpecificJS] Executing JS for page: ${pageId}`);
    switch (pageId) {
        case 'home':
            if (typeof initHomePageSwipers === 'function') {
                initHomePageSwipers();
                console.log("[executePageSpecificJS] Called initHomePageSwipers.");
            }
            break;
        case 'about':
            if (typeof initAboutUsSwiper === 'function') {
                initAboutUsSwiper();
                console.log("[executePageSpecificJS] Called initAboutUsSwiper.");
            }
            break;
        case 'weather':
            // Weather page functions (assuming they are in weather.js and exposed globally)
            if (typeof initWeatherTypesSwiper === 'function') initWeatherTypesSwiper();
            if (typeof initHourlyForecastSwiper === 'function') initHourlyForecastSwiper();
            if (typeof setupLocationInputListener === 'function') setupLocationInputListener();
            // Initial calls for weather page when loaded
            if (typeof updateWeatherBannerBackground === 'function') updateWeatherBannerBackground('sunny'); // Default to sunny background
            if (typeof updateLocationAndDate === 'function') updateLocationAndDate('Manila, Philippines'); // Default location and current date
            console.log("[executePageSpecificJS] Called weather page init functions.");
            break;
        case 'marketplace':
            if (typeof attachMarketplaceProductListeners === 'function') {
                attachMarketplaceProductListeners();
                console.log("[executePageSpecificJS] Called attachMarketplaceProductListeners.");
            } else {
                console.warn("[executePageSpecificJS] attachMarketplaceProductListeners not found for marketplace page. This might indicate an issue with MarketplacePage.html not providing this function.");
            }
            break;
        case 'government-updates':
            console.log("[executePageSpecificJS] Government updates page loaded.");
            break;
        case 'animo-services':
            if (typeof attachAniMoServicesPageListeners === 'function') {
                attachAniMoServicesPageListeners();
                console.log("[executePageSpecificJS] Called attachAniMoServicesPageListeners for AniMo Services page.");
            } else {
                console.warn("[executePageSpecificJS] attachAniMoServicesPageListeners not found for AniMo Services page.");
            }
            break;
        case 'learning-hub':
            if (typeof initLearningHub === 'function') {
                initLearningHub();
                console.log("[executePageSpecificJS] Called initLearningHub for Learning Hub page.");
            } else {
                console.warn("[executePageSpecificJS] initLearningHub not found for Learning Hub page.");
            }
            break;
        case 'loan': // Added for loan page
            // If loan page has specific JS, add it here
            console.log("[executePageSpecificJS] Loan page loaded.");
            break;
        case 'sell': // Added for sell page
            // If sell page has specific JS, add it here
            console.log("[executePageSpecificJS] Sell page loaded.");
            break;
        case 'profile': // Added for profile page
            // If profile page has specific JS, add it here
            console.log("[executePageSpecificJS] Profile page loaded.");
            break;
        case 'my-activity': // Added for my-activity page
            // If my-activity page has specific JS, add it here
            console.log("[executePageSpecificJS] My Activity page loaded.");
            break;
        default:
            console.log(`[executePageSpecificJS] No specific JS functions for ${pageId}`);
            break;
    }
}

/**
 * Updates the visibility of navigation links based on the current user role.
 */
function updateNavBar() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.add('hidden');
    });
    if (sellLink) sellLink.classList.add('hidden');
    if (userIconsDiv) userIconsDiv.classList.add('hidden');

    const alwaysVisibleLinks = ['home', 'about', 'weather', 'loan', 'marketplace', 'government-updates', 'animo-services', 'learning-hub'];

    alwaysVisibleLinks.forEach(target => {
        const linkElement = document.querySelector(`.nav-link[data-target="${target}"]`);
        if (linkElement) {
            linkElement.classList.remove('hidden');
        }
    });

    if (currentUserRole === 'farmer') {
        if (sellLink) sellLink.classList.remove('hidden');
        if (userIconsDiv) userIconsDiv.classList.remove('hidden');
    } else if (currentUserRole === 'buyer') {
        if (userIconsDiv) userIconsDiv.classList.remove('hidden');
    }
    console.log(`[updateNavBar] Navigation bar updated for role: ${currentUserRole}`);
}

// Add event listeners to all navigation links (main and popup)
allNavLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetPageId = event.target.dataset.target;
        
        if (event.target.dataset.action === 'logout') {
            currentUserRole = 'guest';
            localStorage.setItem('currentUserRole', 'guest');
            window.currentUserRole = 'guest';
            updateNavBar();
            loadPage('home');
            if (profilePopupMenu) {
                profilePopupMenu.classList.add('hidden');
            }
            console.log("[Logout] User logged out, redirected to home page.");
            return;
        }

        history.pushState({ page: targetPageId }, '', `#${targetPageId}`);
        loadPage(targetPageId);
        if (profilePopupMenu && !profilePopupMenu.classList.contains('hidden')) {
            profilePopupMenu.classList.add('hidden');
        }
    });
});

// Event listener for the profile icon to toggle the popup menu
if (profileIcon) {
    profileIcon.addEventListener('click', (event) => {
        event.stopPropagation();
        if (profilePopupMenu) {
            profilePopupMenu.classList.toggle('hidden');
            console.log(`[Profile Icon] Toggled profile popup visibility to: ${!profilePopupMenu.classList.contains('hidden')}`);
        }
    });
}

// Event listener for clicking outside the profile popup to close it
document.addEventListener('click', (event) => {
    if (profilePopupMenu && !profilePopupMenu.classList.contains('hidden') && !profilePopupMenu.contains(event.target) && event.target !== profileIcon) {
        profilePopupMenu.classList.add('hidden');
        console.log("[Document Click] Closed profile popup because click was outside.");
    }
});

// Handle browser back/forward buttons (popstate event)
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.page) {
        loadPage(event.state.page);
    } else {
        loadPage('home');
    }
});

// --- MODAL LOGIC (Authentication & Checkout) ---
const appModal = document.getElementById('app-modal');
const appModalContent = document.getElementById('app-modal-content');
const appModalBody = document.getElementById('app-modal-body');
const closeAppModalBtn = document.getElementById('close-app-modal');

// References to the main containers within app-modal-body (already in index.html)
const authFormsContainer = document.getElementById('auth-forms-container');
const checkoutProcessContainer = document.getElementById('checkout-process-container');

// References for Auth Forms (now static within index.html)
let loginForm, signupForm, roleSelection, rsbsaLoginForm;
let showSignupBtn, showLoginBtn, selectFarmerRoleBtn, selectBuyerRoleBtn;
let generalLoginBtn, generalSignupBtn, rsbsaLoginBtn;
let forgotPasswordLink, learnMoreRsbsaLink; // Defined in the user's script.js
let authMessageBox; // Added for general auth messages

// References for Checkout Process (now static within index.html)
let checkoutHeader, itemsCountElement, cartBackArrow;
let cartStep, addressStep, summaryStep, paymentStep;
let cartAddressLine, addressSummaryLine, summaryPaymentLine;
let cartItemsContainer, summaryItemsContainer;
let checkoutStepsElements; // Initialized in DOMContentLoaded
let checkoutContinueBtns, checkoutBackBtns, checkoutFinalBtn; // Initialized in DOMContentLoaded

// Checkout Process Logic
const steps = [
    { id: 'step-0-cart', header: 'Your Cart', showItemsCount: true },
    { id: 'step-1-address', header: 'Check Out 1/3', showItemsCount: false },
    { id: 'step-2-summary', header: 'Check Out 2/3', showItemsCount: false },
    { id: 'step-3-payment', header: 'Check Out 3/3', showItemsCount: false }
];
let currentStepIndex = 0;
let cartItems = [];
const DELIVERY_CHARGE = 50.00;

// Custom Message Modal elements
const messageModal = document.createElement('div');
messageModal.id = 'message-modal';
messageModal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 hidden z-50';
messageModal.innerHTML = `
    <div class="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-auto text-center">
        <h2 id="message-modal-title" class="text-xl font-semibold text-gray-800 mb-4"></h2>
        <p id="message-modal-body" class="text-gray-700 mb-6"></p>
        <button id="message-modal-close-btn" class="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors duration-200">OK</button>
    </div>
`;
document.body.appendChild(messageModal);
const messageModalTitle = document.getElementById('message-modal-title');
const messageModalBody = document.getElementById('message-modal-body');
const messageModalCloseBtn = document.getElementById('message-modal-close-btn');

if (messageModalCloseBtn) {
    messageModalCloseBtn.addEventListener('click', () => {
        messageModal.classList.add('hidden');
    });
}

/**
 * Displays a custom message modal.
 * @param {string} title - The title of the message.
 * @param {string} message - The message content.
 */
function showMessageModal(title, message) {
    if (messageModalTitle) messageModalTitle.textContent = title;
    if (messageModalBody) messageModalBody.textContent = message;
    messageModal.classList.remove('hidden');
}

// Helper to toggle password visibility
window.togglePasswordVisibility = function(id) {
    const input = document.getElementById(id);
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
        const icon = input.nextElementSibling; // Assuming the eye icon is the next sibling
        if (icon) {
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        }
    }
};

/**
 * Displays a specific modal view (Auth or Checkout).
 * @param {string} viewType - 'auth' or 'checkout'.
 * @param {string} [initialAuthFormId='role-selection'] - For 'auth' view, specifies which form to show initially.
 */
window.showModalView = function(viewType, initialAuthFormId = 'role-selection') { // Default to role-selection
    if (!appModal || !authFormsContainer || !checkoutProcessContainer) {
        console.error("Modal or its content containers not found. Cannot show modal view.");
        return;
    }

    // Hide all main modal view containers first
    authFormsContainer.classList.add('hidden');
    checkoutProcessContainer.classList.add('hidden');
    appModalContent.classList.remove('checkout-modal-width');

    // Hide all specific auth forms initially
    // These elements should be present in the DOM by now (DOMContentLoaded)
    if (loginForm) loginForm.classList.add('hidden');
    if (signupForm) signupForm.classList.add('hidden');
    if (roleSelection) roleSelection.classList.add('hidden');
    if (rsbsaLoginForm) rsbsaLoginForm.classList.add('hidden');

    if (viewType === 'auth') {
        authFormsContainer.classList.remove('hidden');
        const targetForm = document.getElementById(initialAuthFormId);
        if (targetForm) {
            targetForm.classList.remove('hidden');
            console.log(`[showModalView] Displaying auth form: ${initialAuthFormId}`);
        } else {
            console.error(`[showModalView] Auth form with ID '${initialAuthFormId}' not found.`);
            // Fallback to role selection if target form not found
            if (roleSelection) roleSelection.classList.remove('hidden');
        }
    } else if (viewType === 'checkout') {
        checkoutProcessContainer.classList.remove('hidden');
        appModalContent.classList.add('checkout-modal-width');
        showStep(0); // Always start checkout from the first step (cart)
    } else {
        console.error(`[showModalView] Unknown viewType: ${viewType}`);
        return;
    }

    appModal.classList.remove('hidden');
    console.log(`[showModalView] Displaying modal view: ${viewType}`);
};


// Function to close the generic modal
window.closeModal = () => {
    console.log("[script.js] Closing modal.");
    appModal.classList.add('hidden');
    // Important: Reset current step index when closing the checkout modal
    currentStepIndex = 0;
    appModalContent.classList.remove('checkout-modal-width');
    // Optional: Clear cart items or other state if a complete reset is desired on close
    // cartItems = [];
    // renderCartItems(); // Re-render empty cart
};

// Event listener for the generic modal close button
if (closeAppModalBtn) {
    closeAppModalBtn.addEventListener('click', window.closeModal);
}

// Function to start the checkout process with a specific product
window.startCheckout = (productDetails) => {
    console.log("[script.js] startCheckout called with product:", productDetails);
    // Check if the user is a guest before starting checkout
    if (window.currentUserRole === 'guest') {
        // Store product details temporarily if you want to proceed with checkout after login
        window.tempProductForCheckout = productDetails;
        window.showModalView('auth', 'role-selection'); // Show auth modal if guest
        showMessageModal("Login Required", "Please log in or sign up to continue with your purchase."); // Inform the user
        return; // Stop checkout process here
    }
    
    // If user is logged in, proceed with checkout
    cartItems = []; // Clear any previous items in cart for a new checkout flow
    addProductToCart(productDetails); // Add the initial product to cart
    window.showModalView('checkout'); // Show the checkout modal, which will display step0
};


// --- CHECKOUT FUNCTIONS ---

// Function to update header and progress indicators for checkout
function updateUIForStep(index) {
    console.log(`[script.js] updateUIForStep called for index: ${index}`);
    // Ensure elements are available (they should be after DOMContentLoaded or modal open)
    if (!checkoutHeader) checkoutHeader = document.getElementById('checkout-header');
    if (!itemsCountElement) itemsCountElement = document.getElementById('items-count');
    if (!cartBackArrow) cartBackArrow = document.getElementById('cart-back-arrow');
    if (!cartStep) cartStep = document.getElementById('cart-step');
    if (!addressStep) addressStep = document.getElementById('address-step');
    if (!summaryStep) summaryStep = document.getElementById('summary-step');
    if (!paymentStep) paymentStep = document.getElementById('payment-step');
    if (!cartAddressLine) cartAddressLine = document.getElementById('cart-address-line');
    if (!addressSummaryLine) addressSummaryLine = document.getElementById('address-summary-line');
    if (!summaryPaymentLine) summaryPaymentLine = document.getElementById('summary-payment-line');

    if (!checkoutHeader || !itemsCountElement || !cartStep || !addressStep || !summaryStep || !paymentStep || !cartAddressLine || !addressSummaryLine || !summaryPaymentLine || !cartBackArrow) {
        console.error("[script.js] One or more checkout UI elements not found in updateUIForStep.");
        // This indicates a problem with the HTML IDs or timing of element selection.
        return;
    }

    // Update header text
    checkoutHeader.querySelector('h1').textContent = steps[index].header;

    // Show/hide back arrow and items count
    if (index === 0) { // On the cart step
        cartBackArrow.classList.remove('hidden');
        itemsCountElement.textContent = `${cartItems.length} Item${cartItems.length !== 1 ? 's' : ''}`;
        itemsCountElement.classList.remove('hidden');
    } else { // On other steps
        cartBackArrow.classList.add('hidden');
        itemsCountElement.classList.add('hidden');
    }

    // Reset all progress indicators to gray
    [cartStep, addressStep, summaryStep, paymentStep].forEach(el => {
        el.classList.remove('text-green-600');
        el.classList.add('text-gray-400');
    });
    [cartAddressLine, addressSummaryLine, summaryPaymentLine].forEach(el => {
        el.classList.remove('border-green-400');
        el.classList.add('border-gray-300');
    });

    // Apply active styles based on current step
    if (index >= 0) {
        cartStep.classList.remove('text-gray-400');
        cartStep.classList.add('text-green-600');
    }
    if (index >= 1) {
        cartAddressLine.classList.remove('border-gray-300');
        cartAddressLine.classList.add('border-green-400');
        addressStep.classList.remove('text-gray-400');
        addressStep.classList.add('text-green-600');
    }
    if (index >= 2) {
        addressSummaryLine.classList.remove('border-gray-300');
        addressSummaryLine.classList.add('border-green-400');
        summaryStep.classList.remove('text-gray-400');
        summaryStep.classList.add('text-green-600');
    }
    if (index >= 3) {
        summaryPaymentLine.classList.remove('border-gray-300');
        summaryPaymentLine.classList.add('border-green-400');
        paymentStep.classList.remove('text-gray-400');
        paymentStep.classList.add('text-green-600');
    }
}

// Function to show the current step's content for checkout
function showStep(index) {
    console.log(`[script.js] showStep called for index: ${index}. Attempting to show step with id: ${steps[index].id}`);
    if (!checkoutStepsElements || checkoutStepsElements.length === 0) {
        console.warn("[script.js] No checkout step sections found. Cannot show step.");
        return;
    }

    checkoutStepsElements.forEach((stepEl, i) => {
        if (i === index) {
            stepEl.classList.remove('hidden');
        } else {
            stepEl.classList.add('hidden');
        }
    });
    currentStepIndex = index;
    updateUIForStep(index);
    updateOrderSummaryDisplays(); // Update summary always when step changes
}

// Function to calculate and update order summary displays
function updateOrderSummaryDisplays() {
    const subTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderTotal = subTotal + DELIVERY_CHARGE;

    // References for step 0 summary
    const subTotalDisplay0 = document.getElementById('subtotal');
    const deliveryChargesDisplay0 = document.getElementById('shipping-cost');
    const orderTotalDisplay0 = document.getElementById('cart-total');

    if (subTotalDisplay0) subTotalDisplay0.textContent = `₱ ${subTotal.toFixed(2)}`;
    if (deliveryChargesDisplay0) deliveryChargesDisplay0.textContent = `₱ ${DELIVERY_CHARGE.toFixed(2)}`;
    if (orderTotalDisplay0) orderTotalDisplay0.textContent = `₱ ${orderTotal.toFixed(2)}`;

    // Update product summary in step2
    if (!summaryItemsContainer) summaryItemsContainer = document.getElementById('summary-items-container');
    if (summaryItemsContainer) {
        summaryItemsContainer.innerHTML = ''; // Clear previous items
        if (cartItems.length === 0) {
            summaryItemsContainer.innerHTML = '<p class="text-center text-gray-500 p-4">No items in summary.</p>';
        } else {
            cartItems.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('flex', 'items-center', 'space-x-4', 'p-3', 'bg-white', 'rounded-xl', 'shadow-sm', 'border', 'border-gray-200');
                itemDiv.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-lg shadow-sm">
                    <div class="flex-1">
                        <h3 class="text-lg font-medium text-gray-900">${item.name}</h3>
                        <p class="text-sm text-gray-600">₱ ${item.price.toFixed(2)} ${item.unit}</p>
                        <p class="text-xs text-gray-500">${item.location}</p>
                        <p class="text-sm text-gray-700 mt-1">Quantity: ${item.quantity}</p>
                    </div>
                `;
                summaryItemsContainer.appendChild(itemDiv);
            });
        }
        // Update summary totals within step-2-summary
        const subtotalSummary = document.getElementById('subtotal-summary');
        const shippingCostSummary = document.getElementById('shipping-cost-summary');
        const totalCostSummary = document.getElementById('total-cost-summary');
        if (subtotalSummary) subtotalSummary.textContent = `₱ ${subTotal.toFixed(2)}`;
        if (shippingCostSummary) shippingCostSummary.textContent = `₱ ${DELIVERY_CHARGE.toFixed(2)}`;
        if (totalCostSummary) totalCostSummary.textContent = `₱ ${orderTotal.toFixed(2)}`;
    }
}

// Function to render cart items in step0
function renderCartItems() {
    console.log("[script.js] renderCartItems called.");
    if (!cartItemsContainer) cartItemsContainer = document.getElementById('cart-items-container');
    if (!cartItemsContainer) {
        console.error("Cart items container not found!");
        return;
    }

    cartItemsContainer.innerHTML = ''; // Clear existing items

    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-center text-gray-500 py-4">Your cart is empty.</p>';
    } else {
        cartItems.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('flex', 'items-center', 'space-x-4', 'p-3', 'bg-white', 'rounded-xl', 'shadow-sm', 'border', 'border-gray-200');
            itemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-lg shadow-sm">
                <div class="flex-1">
                    <h3 class="text-lg font-medium text-gray-900">${item.name}</h3>
                    <p class="text-sm text-gray-600">₱ ${item.price.toFixed(2)} ${item.unit}</p>
                    <p class="text-xs text-gray-500">${item.location}</p>
                    <div class="flex items-center mt-2 space-x-4">
                        <div class="flex items-center bg-gray-100 rounded-full px-2 py-1">
                            <button class="text-red-500 hover:text-red-600 p-1 rounded-full quantity-minus" data-index="${index}"><i class="fas fa-minus text-sm"></i></button>
                            <span class="mx-2 text-gray-800 font-medium quantity-display">${item.quantity}</span>
                            <button class="text-green-500 hover:text-green-600 p-1 rounded-full quantity-plus" data-index="${index}"><i class="fas fa-plus text-sm"></i></button>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col items-center justify-end h-full space-y-1">
                    <button class="text-blue-500 hover:text-blue-600 text-sm flex items-center space-x-1 edit-item-btn" data-index="${index}">
                        <i class="fas fa-edit text-xs"></i><span>Edit</span>
                    </button>
                    <button class="text-red-500 hover:text-red-600 text-sm flex items-center space-x-1 remove-item-btn" data-index="${index}">
                        <i class="fas fa-trash-alt text-xs"></i><span>Remove</span>
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });

        // Re-attach listeners to newly rendered quantity controls and item actions
        cartItemsContainer.querySelectorAll('.quantity-minus').forEach(button => {
            // Ensure no duplicate listeners by cloning and replacing
            const oldButton = button;
            const newButton = oldButton.cloneNode(true);
            oldButton.parentNode.replaceChild(newButton, oldButton);
            newButton.addEventListener('click', (event) => {
                const index = parseInt(event.currentTarget.dataset.index);
                if (cartItems[index].quantity > 1) {
                    cartItems[index].quantity--;
                    renderCartItems();
                    updateOrderSummaryDisplays();
                } else {
                    removeItem(index); // Remove item if quantity goes to 0
                }
            });
        });

        cartItemsContainer.querySelectorAll('.quantity-plus').forEach(button => {
            const oldButton = button;
            const newButton = oldButton.cloneNode(true);
            oldButton.parentNode.replaceChild(newButton, oldButton);
            newButton.addEventListener('click', (event) => {
                const index = parseInt(event.currentTarget.dataset.index);
                cartItems[index].quantity++;
                renderCartItems();
                updateOrderSummaryDisplays();
            });
        });

        cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(button => {
            const oldButton = button;
            const newButton = oldButton.cloneNode(true);
            oldButton.parentNode.replaceChild(newButton, oldButton);
            newButton.addEventListener('click', (event) => {
                const index = parseInt(event.currentTarget.dataset.index);
                removeItem(index);
            });
        });

        cartItemsContainer.querySelectorAll('.edit-item-btn').forEach(button => {
            const oldButton = button;
            const newButton = oldButton.cloneNode(true);
            oldButton.parentNode.replaceChild(newButton, oldButton);
            newButton.addEventListener('click', (event) => {
                const index = parseInt(event.currentTarget.dataset.index);
                console.log(`Edit item at index: ${index}`, cartItems[index]);
                // Implement logic to open a modal for editing quantity/details if needed
                showMessageModal("Edit Item", `Editing feature for '${cartItems[index].name}' is not yet implemented.`);
            });
        });
    }
    updateOrderSummaryDisplays(); // Always update summary after rendering cart items
}

// Function to add a product to the cart
function addProductToCart(product) {
    console.log("[script.js] addProductToCart called with:", product);
    // Check if the product is already in the cart. If so, increment quantity.
    const existingItemIndex = cartItems.findIndex(item => item.name === product.name);
    if (existingItemIndex > -1) {
        cartItems[existingItemIndex].quantity += product.quantity || 1;
    } else {
        // Correct the image source before adding to cart if it's 'uploaded:' scheme
        let correctedProduct = { ...product, quantity: product.quantity || 1 };
        if (correctedProduct.image && correctedProduct.image.startsWith('uploaded:')) {
            correctedProduct.image = 'https://placehold.co/80x80/A0A0A0/FFF?text=Product'; // Generic placeholder
            console.warn(`[addProductToCart] Corrected problematic product image src for ${correctedProduct.name}.`);
        }
        cartItems.push(correctedProduct);
    }
    renderCartItems();
    updateOrderSummaryDisplays();
    console.log("Current cart:", cartItems);
}

// Function to remove a product from the cart by index
function removeItem(index) {
    if (index > -1 && index < cartItems.length) {
        const removedItem = cartItems.splice(index, 1);
        console.log(`Removed item: ${removedItem[0].name}. Current cart:`, cartItems);
        renderCartItems();
        updateOrderSummaryDisplays();
        if (cartItems.length === 0 && currentStepIndex === 0) {
            // If cart becomes empty on cart page, maybe close modal or show empty cart message
            // For now, just show empty cart message within the modal
            showMessageModal("Cart Empty", "Your shopping cart is now empty.");
        }
    }
}

// Function to attach event listeners to checkout page elements
function attachCheckoutListeners() {
    console.log("[script.js] attachCheckoutListeners called. Attaching listeners for checkout page.");

    // Checkout Nav Arrows/Buttons
    if (!cartBackArrow) cartBackArrow = document.getElementById('cart-back-arrow');
    if (cartBackArrow) {
        const oldArrow = cartBackArrow;
        const newArrow = oldArrow.cloneNode(true);
        oldArrow.parentNode.replaceChild(newArrow, oldArrow);
        newArrow.addEventListener('click', () => {
            console.log("[script.js] Cart back arrow clicked. Closing modal.");
            window.closeModal(); // Close the modal
        });
    }

    // Address/Payment card selection logic
    document.querySelectorAll('#checkout-process-container .address-card, #checkout-process-container .payment-option-card').forEach(card => {
        const oldCard = card;
        const newCard = oldCard.cloneNode(true);
        oldCard.parentNode.replaceChild(newCard, oldCard);
        newCard.addEventListener('click', (event) => {
            console.log(`[script.js] Card clicked: ${event.currentTarget.id || event.currentTarget.dataset.paymentType}`);
            const parentContent = event.currentTarget.closest('.content');
            if (parentContent) {
                parentContent.querySelectorAll('.address-card, .payment-option-card').forEach(d => {
                    d.classList.remove('active', 'bg-green-100', 'border-green-300');
                    d.classList.add('bg-white', 'border-gray-200');
                    const checkmark = d.querySelector('.fa-check-circle');
                    if (checkmark) {
                        checkmark.remove();
                    }
                });
                event.currentTarget.classList.add('active', 'bg-green-100', 'border-green-300');
                event.currentTarget.classList.remove('bg-white', 'border-gray-200');
                const checkmarkDiv = document.createElement('div');
                checkmarkDiv.className = 'absolute top-3 right-3 text-green-500';
                checkmarkDiv.innerHTML = '<i class="fas fa-check-circle text-xl"></i>';
                event.currentTarget.prepend(checkmarkDiv);
            }
        });
    });

    // Continue button logic
    if (!checkoutContinueBtns) checkoutContinueBtns = document.querySelectorAll('#checkout-process-container .checkout-continue-btn');
    checkoutContinueBtns.forEach(btn => {
        const oldBtn = btn;
        const newBtn = oldBtn.cloneNode(true);
        oldBtn.parentNode.replaceChild(newBtn, oldBtn);
        newBtn.addEventListener('click', () => {
            console.log("[script.js] Continue button clicked.");
            if (currentStepIndex === 0 && cartItems.length === 0) {
                showMessageModal("Cart Empty", "Your cart is empty. Please add items before proceeding to checkout.");
                return;
            }
            if (currentStepIndex < steps.length - 1) {
                showStep(currentStepIndex + 1);
            }
        });
    });

    // Back button logic
    if (!checkoutBackBtns) checkoutBackBtns = document.querySelectorAll('#checkout-process-container .checkout-back-btn');
    checkoutBackBtns.forEach(btn => {
        const oldBtn = btn;
        const newBtn = oldBtn.cloneNode(true);
        oldBtn.parentNode.replaceChild(newBtn, oldBtn);
        newBtn.addEventListener('click', () => {
            console.log("[script.js] Back button clicked.");
            if (currentStepIndex > 0) {
                showStep(currentStepIndex - 1);
            }
        });
    });

    // Checkout button logic (for final step)
    if (!checkoutFinalBtn) checkoutFinalBtn = document.querySelector('#checkout-process-container .checkout-final-btn');
    if (checkoutFinalBtn) {
        const oldFinalBtn = checkoutFinalBtn;
        const newFinalBtn = oldFinalBtn.cloneNode(true);
        oldFinalBtn.parentNode.replaceChild(newFinalBtn, oldFinalBtn);
        newFinalBtn.addEventListener('click', () => {
            console.log('[script.js] Final Checkout Complete! Order Placed Successfully! Navigating to My Activity page.');
            showMessageModal("Order Placed!", "Your order has been placed successfully!");
            window.closeModal();
            loadPage('my-activity');
        });
    }
}


// --- AUTHENTICATION FUNCTIONS ---
function attachAuthModalListeners() {
    console.log("[script.js] Attaching auth modal listeners.");
    // Re-select elements as they might be re-rendered or become available after DOMContentLoaded
    loginForm = document.getElementById('login-form');
    signupForm = document.getElementById('signup-form');
    roleSelection = document.getElementById('role-selection');
    rsbsaLoginForm = document.getElementById('rsbsa-login-form');
    forgotPasswordLink = document.getElementById('forgot-password-link'); // Corrected ID
    learnMoreRsbsaLink = document.getElementById('learn-more-rsbsa-link'); // Corrected ID

    // Ensure authMessageBox is also selected for messages
    const authMessageBoxElement = document.getElementById('auth-message-box');
    if (authMessageBoxElement) {
        authMessageBox = authMessageBoxElement;
    } else {
        console.warn("[script.js] Auth message box not found. showAuthMessage will not work.");
    }

    if (!loginForm || !signupForm || !roleSelection || !rsbsaLoginForm) {
        console.warn("[script.js] One or more auth modal form elements not found. Functionality may be limited.");
    }

    // Select buttons based on their new IDs or classes
    showSignupBtn = document.getElementById('show-signup-form-btn'); // Corrected ID
    showLoginBtn = document.getElementById('show-login-form-btn'); // Corrected ID
    selectFarmerRoleBtn = document.getElementById('select-farmer-role-btn');
    selectBuyerRoleBtn = document.getElementById('select-buyer-role-btn');
    
    generalLoginBtn = document.getElementById('general-login-btn');
    generalSignupBtn = document.getElementById('general-signup-btn');
    rsbsaLoginBtn = document.getElementById('rsbsa-login-btn');

    // Combine all clickable elements for listener re-attachment
    const clickableElements = [
        showSignupBtn, showLoginBtn, selectFarmerRoleBtn, selectBuyerRoleBtn,
        generalLoginBtn, generalSignupBtn, rsbsaLoginBtn,
        forgotPasswordLink, learnMoreRsbsaLink
    ].filter(Boolean); // Filter out nulls

    clickableElements.forEach(btn => {
        // Clone and replace to remove old event listeners
        const oldBtn = btn;
        const newBtn = oldBtn.cloneNode(true);
        oldBtn.parentNode.replaceChild(newBtn, oldBtn);

        // Attach new event listeners
        if (newBtn.id === 'show-signup-form-btn') {
            newBtn.addEventListener('click', (e) => { e.preventDefault(); showModalView('auth', 'signup-form'); });
        } else if (newBtn.id === 'show-login-form-btn') {
            newBtn.addEventListener('click', (e) => { e.preventDefault(); showModalView('auth', 'login-form'); });
        } else if (newBtn.id === 'general-login-btn') {
            newBtn.addEventListener('click', () => {
                currentUserRole = 'buyer'; // Default to buyer for general login
                localStorage.setItem('currentUserRole', 'buyer');
                window.currentUserRole = 'buyer';
                closeModal();
                updateNavBar();
                if (window.tempProductForCheckout) {
                    addProductToCart(window.tempProductForCheckout);
                    showModalView('checkout');
                    window.tempProductForCheckout = null; // Clear pending product
                } else {
                    loadPage('marketplace');
                }
                showMessageModal("Login Successful", "You are now logged in as a Buyer!");
            });
        } else if (newBtn.id === 'general-signup-btn') {
            newBtn.addEventListener('click', () => {
                currentUserRole = 'buyer'; // Default to buyer for general signup
                localStorage.setItem('currentUserRole', 'buyer');
                window.currentUserRole = 'buyer';
                closeModal();
                updateNavBar();
                if (window.tempProductForCheckout) {
                    addProductToCart(window.tempProductForCheckout);
                    showModalView('checkout');
                    window.tempProductForCheckout = null; // Clear pending product
                } else {
                    loadPage('marketplace');
                }
                showMessageModal("Sign Up Successful", "Your account has been created. You are now logged in as a Buyer!");
            });
        } else if (newBtn.id === 'select-farmer-role-btn') {
            newBtn.addEventListener('click', () => {
                showModalView('auth', 'rsbsa-login-form');
            });
        } else if (newBtn.id === 'select-buyer-role-btn') {
            newBtn.addEventListener('click', () => {
                showModalView('auth', 'login-form');
            });
        } else if (newBtn.id === 'rsbsa-login-btn') {
            newBtn.addEventListener('click', () => {
                currentUserRole = 'farmer';
                localStorage.setItem('currentUserRole', 'farmer');
                window.currentUserRole = 'farmer';
                closeModal();
                updateNavBar();
                if (window.tempProductForCheckout) {
                    addProductToCart(window.tempProductForCheckout);
                    showModalView('checkout');
                    window.tempProductForCheckout = null; // Clear pending product
                } else {
                    loadPage('sell');
                }
                showMessageModal("Login Successful", "You are now logged in as a Farmer!");
            });
        } else if (newBtn.id === 'forgot-password-link') { // Use ID for forgot password
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showMessageModal("Password Reset", "Password reset functionality will be implemented here. Please contact support for assistance.");
            });
        } else if (newBtn.id === 'learn-more-rsbsa-link') { // Use ID for learn more RSBSA
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showMessageModal("RSBSA Information", "Information on how to obtain an RSBSA ID will be provided here, linking to relevant government resources.");
            });
        }
    });

    // Toggle password visibility icons
    document.querySelectorAll('.auth-modal-content [id$="-password"] + i.fa-eye').forEach(icon => {
        const inputId = icon.previousElementSibling.id;
        const oldIcon = icon;
        const newIcon = oldIcon.cloneNode(true);
        oldIcon.parentNode.replaceChild(newIcon, oldIcon);
        newIcon.addEventListener('click', () => togglePasswordVisibility(inputId));
    });
}

// --- Page-Specific JavaScript Functions (Inlined from individual HTML files or for the main script) ---

// Home Page Specific Logic
function initHomePageSwipers() {
    console.log("[initHomePageSwipers] Initializing Home Page swipers.");
    const homePageSection = document.getElementById('home-page-section');
    if (!homePageSection) {
        console.log("[initHomePageSwipers] Home page section not found, skipping swiper init.");
        return;
    }
    const homeEasyRegisterSwiperWrapper = homePageSection.querySelector('#home-easy-register-swiper-wrapper');
    if (homeEasyRegisterSwiperWrapper) {
        const homeEasyRegisterSlides = homeEasyRegisterSwiperWrapper.querySelectorAll('.swiper-slide');
        const homePrevEasyRegisterBtn = homePageSection.querySelector('#home-prev-easy-register');
        const homeNextEasyRegisterBtn = homePageSection.querySelector('#home-next-easy-register');
        let currentHomeEasyRegisterSlide = 0;

        function updateHomeEasyRegisterSwiper() {
            if (!homeEasyRegisterSwiperWrapper || !homeEasyRegisterSlides.length) return;
            let slidesInView = 1;
            if (window.innerWidth >= 640) slidesInView = 2;
            if (window.innerWidth >= 1024) slidesInView = 3;
            if (window.innerWidth >= 1280) slidesInView = 5;
            const containerWidth = homeEasyRegisterSwiperWrapper.offsetWidth;
            const transformX = - (currentHomeEasyRegisterSlide * (containerWidth / slidesInView));
            homeEasyRegisterSwiperWrapper.style.transform = `translateX(${transformX}px)`;
            if (homePrevEasyRegisterBtn) homePrevEasyRegisterBtn.disabled = currentHomeEasyRegisterSlide === 0;
            if (homeNextEasyRegisterBtn) homeNextEasyRegisterBtn.disabled = currentHomeEasyRegisterSlide >= (homeEasyRegisterSlides.length - slidesInView);
        }
        if (homePrevEasyRegisterBtn) {
            // Clone and replace to avoid duplicate listeners
            const oldBtn = homePrevEasyRegisterBtn;
            const newBtn = oldBtn.cloneNode(true);
            oldBtn.parentNode.replaceChild(newBtn, oldBtn);
            newBtn.addEventListener('click', () => {
                if (currentHomeEasyRegisterSlide > 0) {
                    currentHomeEasyRegisterSlide--;
                    updateHomeEasyRegisterSwiper();
                }
            });
        }
        if (homeNextEasyRegisterBtn) {
            // Clone and replace to avoid duplicate listeners
            const oldBtn = homeNextEasyRegisterBtn;
            const newBtn = oldBtn.cloneNode(true);
            oldBtn.parentNode.replaceChild(newBtn, oldBtn);
            newBtn.addEventListener('click', () => {
                const slidesInView = (window.innerWidth >= 1280) ? 5 : (window.innerWidth >= 1024) ? 3 : (window.innerWidth >= 640) ? 2 : 1;
                if (currentHomeEasyRegisterSlide < (homeEasyRegisterSlides.length - slidesInView)) {
                    currentHomeEasyRegisterSlide++;
                    updateHomeEasyRegisterSwiper();
                }
            });
        }
        window.removeEventListener('resize', updateHomeEasyRegisterSwiper); // Remove potential old listener
        window.addEventListener('resize', updateHomeEasyRegisterSwiper);
        updateHomeEasyRegisterSwiper();
    }
}
window.initHomePageSwipers = initHomePageSwipers;


// About Us Page Specific Logic
function initAboutUsSwiper() {
    console.log("[initAboutUsSwiper] Initializing About Us swiper.");
    const aboutPageSection = document.getElementById('about-page-section');
    if (!aboutPageSection) {
        console.log("[initAboutUsSwiper] About page section not found, skipping swiper init.");
        return;
    }
    const visionSwiperContainer = aboutPageSection.querySelector('#vision-swiper-container');
    if (visionSwiperContainer) {
        const visionSwiperWrapper = visionSwiperContainer.querySelector('.swiper-wrapper');
        const visionSlides = visionSwiperWrapper.querySelectorAll('.swiper-slide');
        const prevVisionBtn = aboutPageSection.querySelector('#about-us-prev-vision-card'); // Corrected ID
        const nextVisionBtn = aboutPageSection.querySelector('#about-us-next-vision-card'); // Corrected ID
        let currentVisionSlide = 0;

        function updateVisionSwiper() {
            if (!visionSwiperWrapper || !visionSlides.length) return;
            const slidesInView = 1;
            const containerWidth = visionSwiperContainer.offsetWidth;
            const slideWidth = containerWidth / slidesInView;
            visionSwiperWrapper.style.transform = `translateX(-${currentVisionSlide * slideWidth}px)`;

            if (prevVisionBtn) prevVisionBtn.disabled = currentVisionSlide === 0;
            if (nextVisionBtn) nextVisionBtn.disabled = currentVisionSlide >= (visionSlides.length - slidesInView);
        }
        if (prevVisionBtn) {
            const oldBtn = prevVisionBtn;
            const newBtn = oldBtn.cloneNode(true);
            oldBtn.parentNode.replaceChild(newBtn, oldBtn);
            newBtn.addEventListener('click', () => {
                if (currentVisionSlide > 0) {
                    currentVisionSlide--;
                    updateVisionSwiper();
                }
            });
        }
        if (nextVisionBtn) {
            const oldBtn = nextVisionBtn;
            const newBtn = oldBtn.cloneNode(true);
            oldBtn.parentNode.replaceChild(newBtn, oldBtn);
            newBtn.addEventListener('click', () => {
                if (currentVisionSlide < (visionSlides.length - 1)) { // Adjusted for single slide view
                    currentVisionSlide++;
                    updateVisionSwiper();
                }
            });
        }
        window.removeEventListener('resize', updateVisionSwiper); // Remove potential old listener
        window.addEventListener('resize', updateVisionSwiper);
        updateVisionSwiper();
    }
}
window.initAboutUsSwiper = initAboutUsSwiper;


// Weather Page Specific Logic
const weatherBackgrounds = {
    'sunny': 'https://placehold.co/1200x500/FFD700/000?text=Sunny',
    'cloudy': 'https://placehold.co/1200x500/808080/FFF?text=Cloudy',
    'rainy': 'https://placehold.co/1200x500/4682B4/FFF?text=Rainy',
    'stormy': 'https://placehold.co/1200x500/000000/FFF?text=Stormy'
};

function updateWeatherBannerBackground(weatherType) {
    const weatherPageSection = document.getElementById('weather-page-section');
    if (!weatherPageSection) return;
    const banner = weatherPageSection.querySelector('.weather-banner');
    if (banner && weatherBackgrounds[weatherType]) {
        banner.style.backgroundImage = `url('${weatherBackgrounds[weatherType]}')`;
    }
}
window.updateWeatherBannerBackground = updateWeatherBannerBackground;

function initWeatherTypesSwiper() {
    const weatherPageSection = document.getElementById('weather-page-section');
    if (!weatherPageSection) return;
    const weatherTypesSwiperContainer = weatherPageSection.querySelector('#weather-types-swiper-container');
    if (weatherTypesSwiperContainer) {
        const weatherTypesSwiperWrapper = weatherTypesSwiperContainer.querySelector('.swiper-wrapper');
        const weatherTypesSlides = weatherTypesSwiperWrapper.querySelectorAll('.swiper-slide');
        const prevWeatherTypeBtn = weatherPageSection.querySelector('#weather-prev-weather-type-card');
        const nextWeatherTypeBtn = weatherPageSection.querySelector('#weather-next-weather-type-card');
        let currentWeatherTypeSlide = 0;

        function updateWeatherTypesSwiper() {
            let slidesInView = 1;
            if (window.innerWidth >= 640) slidesInView = 2;
            if (window.innerWidth >= 1024) slidesInView = 4;
            const slideWidth = weatherTypesSwiperContainer.offsetWidth / slidesInView;
            weatherTypesSwiperWrapper.style.transform = `translateX(-${currentWeatherTypeSlide * slideWidth}px)`;
            if (prevWeatherTypeBtn) prevWeatherTypeBtn.disabled = currentWeatherTypeSlide === 0;
            if (nextWeatherTypeBtn) nextWeatherTypeBtn.disabled = currentWeatherTypeSlide >= (weatherTypesSlides.length - slidesInView);
        }
        if (prevWeatherTypeBtn) {
            const oldBtn = prevWeatherTypeBtn;
            const newBtn = oldBtn.cloneNode(true);
            oldBtn.parentNode.replaceChild(newBtn, oldBtn);
            newBtn.addEventListener('click', () => {
                if (currentWeatherTypeSlide > 0) {
                    currentWeatherTypeSlide--;
                    updateWeatherTypesSwiper();
                }
            });
        }
        if (nextWeatherTypeBtn) {
            const oldBtn = nextWeatherTypeBtn;
            const newBtn = oldBtn.cloneNode(true);
            oldBtn.parentNode.replaceChild(newBtn, oldBtn);
            newBtn.addEventListener('click', () => {
                const slidesInView = (window.innerWidth >= 1024) ? 4 : (window.innerWidth >= 640) ? 2 : 1;
                if (currentWeatherTypeSlide < (weatherTypesSlides.length - slidesInView)) {
                    currentWeatherTypeSlide++;
                    updateWeatherTypesSwiper();
                }
            });
        }
        window.removeEventListener('resize', updateWeatherTypesSwiper); // Remove potential old listener
        window.addEventListener('resize', updateWeatherTypesSwiper);
        updateWeatherTypesSwiper();
    }
}
window.initWeatherTypesSwiper = initWeatherTypesSwiper;

function initHourlyForecastSwiper() {
    const weatherPageSection = document.getElementById('weather-page-section');
    if (!weatherPageSection) return;
    const hourlyScrollArea = weatherPageSection.querySelector('#hourly-forecast-scroll-area');
    const hourlyCardsFlexWrapper = weatherPageSection.querySelector('#hourly-cards-flex-wrapper');
    const hourlyPrevBtn = weatherPageSection.querySelector('#hourly-prev-btn');
    const hourlyNextBtn = weatherPageSection.querySelector('#hourly-next-btn');

    if (hourlyScrollArea && hourlyCardsFlexWrapper) {
        // Clear previous content before generating new cards
        hourlyCardsFlexWrapper.innerHTML = '';

        const weatherIcons = [
            'fas fa-sun', 'fas fa-cloud-sun', 'fas fa-cloud', 'fas fa-cloud-rain',
            'fas fa-bolt', 'fas fa-snowflake', 'fas fa-smog'
        ];
        const now = new Date();
        const currentHour = now.getHours();

        for (let i = 0; i < 24; i++) {
            const hour = (currentHour + i) % 24;
            const displayHour = `${String(hour).padStart(2, '0')}:00`;
            const randomTemp = Math.floor(Math.random() * (32 - 20 + 1)) + 20;
            const randomIcon = weatherIcons[Math.floor(Math.random() * weatherIcons.length)];
            const card = document.createElement('div');
            card.classList.add('hourly-card', 'flex-shrink-0', 'w-[100px]', 'mr-4', 'bg-white', 'bg-opacity-20', 'rounded-xl', 'p-3', 'flex', 'flex-col', 'items-center', 'justify-center', 'shadow-sm', 'text-white'); // Added Tailwind classes
            card.innerHTML = `
                <p class="text-sm">${displayHour}</p>
                <i class="${randomIcon} text-xl my-1"></i>
                <p class="text-base font-semibold">${randomTemp}°</p>
            `;
            hourlyCardsFlexWrapper.appendChild(card);
        }

        // Clone and replace buttons to clear old listeners
        const updateButtons = () => {
             if (hourlyPrevBtn) hourlyPrevBtn.disabled = hourlyScrollArea.scrollLeft <= 0;
             if (hourlyNextBtn) hourlyNextBtn.disabled = (hourlyScrollArea.scrollLeft + hourlyScrollArea.clientWidth + 1) >= hourlyScrollArea.scrollWidth;
        };

        if (hourlyPrevBtn) {
            const oldPrev = hourlyPrevBtn;
            const newPrev = oldPrev.cloneNode(true);
            oldPrev.parentNode.replaceChild(newPrev, oldPrev);
            newPrev.addEventListener('click', () => {
                hourlyScrollArea.scrollBy({ left: -200, behavior: 'smooth' }); // Adjusted scroll amount
            });
        }
        if (hourlyNextBtn) {
            const oldNext = hourlyNextBtn;
            const newNext = oldNext.cloneNode(true);
            oldNext.parentNode.replaceChild(newNext, oldNext);
            newNext.addEventListener('click', () => {
                hourlyScrollArea.scrollBy({ left: 200, behavior: 'smooth' }); // Adjusted scroll amount
            });
        }
        hourlyScrollArea.removeEventListener('scroll', updateButtons); // Remove potential old listener
        hourlyScrollArea.addEventListener('scroll', updateButtons);
        window.removeEventListener('resize', updateButtons); // Remove potential old listener
        window.addEventListener('resize', updateButtons);

        // Initial update for button states
        updateButtons();
    }
}
window.initHourlyForecastSwiper = initHourlyForecastSwiper;

function updateLocationAndDate(location = '') {
    const weatherPageSection = document.getElementById('weather-page-section');
    if (!weatherPageSection) return;
    const displayLocationElement = weatherPageSection.querySelector('#display-location');
    const displayDateElement = weatherPageSection.querySelector('#display-date');

    if (displayLocationElement) {
        if (location) {
            displayLocationElement.textContent = location;
            displayLocationElement.classList.remove('hidden');
        } else {
            displayLocationElement.textContent = '';
            displayLocationElement.classList.add('hidden');
        }
    }
    if (displayDateElement) {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        displayDateElement.textContent = now.toLocaleDateString('en-US', options);
    }
}
window.updateLocationAndDate = updateLocationAndDate;

function setupLocationInputListener() {
    const weatherPageSection = document.getElementById('weather-page-section');
    if (!weatherPageSection) return;
    const locationInput = weatherPageSection.querySelector('#location-input');
    const locationDisplay = weatherPageSection.querySelector('#display-location'); // Ensure this element is accessible
    const dateDisplay = weatherPageSection.querySelector('#display-date'); // Ensure this element is accessible

    if (locationInput) {
        // Clone and replace to avoid duplicate listeners
        const oldInput = locationInput;
        const newInput = oldInput.cloneNode(true);
        oldInput.parentNode.replaceChild(newInput, oldInput);

        newInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const enteredLocation = newInput.value.trim();
                if (enteredLocation) {
                    updateLocationAndDate(enteredLocation);
                    const weatherTypes = Object.keys(weatherBackgrounds);
                    const randomWeatherType = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
                    updateWeatherBannerBackground(randomWeatherType);
                } else {
                    updateLocationAndDate('Manila, Philippines'); // Default back to Manila if input is empty
                    updateWeatherBannerBackground('sunny');
                }
                newInput.blur(); // Remove focus from input
            }
        });
        // Initial state
        updateWeatherBannerBackground('sunny');
        updateLocationAndDate('Manila, Philippines'); // Set initial location on load
    }
}
window.setupLocationInputListener = setupLocationInputListener;


// Marketplace Page Specific Logic
function attachMarketplaceProductListeners() {
    console.log("[MarketplaceLogic] Attaching product card listeners.");
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        // Clone and replace to ensure fresh listeners, avoiding duplicates
        const oldCard = card;
        const newCard = oldCard.cloneNode(true);
        oldCard.parentNode.replaceChild(newCard, oldCard);

        newCard.addEventListener('click', () => {
            const productDetails = {
                id: newCard.dataset.productId || `prod-${Math.random().toString(36).substring(7)}`, // Add unique ID
                name: newCard.dataset.productName,
                price: parseFloat(newCard.dataset.productPrice),
                unit: newCard.dataset.productUnit,
                location: newCard.dataset.productLocation,
                image: newCard.dataset.productImage,
                quantity: 1
            };
            console.log('Product clicked:', productDetails);

            if (window.startCheckout) {
                window.startCheckout(productDetails);
            } else {
                console.error("window.startCheckout is not defined. Ensure script.js is loaded correctly.");
            }
        });
    });
}
window.attachMarketplaceProductListeners = attachMarketplaceProductListeners;

// AniMo Services Page Specific Logic (New function)
function attachAniMoServicesPageListeners() {
    console.log("[AniMoServicesPage] Attaching listeners for Services page.");
    // Example: If you have accordion or tab logic for services
    const serviceItems = document.querySelectorAll('.service-item');
    serviceItems.forEach(item => {
        const oldItem = item;
        const newItem = oldItem.cloneNode(true);
        oldItem.parentNode.replaceChild(newItem, oldItem);

        newItem.addEventListener('click', () => {
            console.log(`Service item clicked: ${newItem.dataset.service}`);
            // Implement reveal/hide details or navigate to a service-specific page
            showMessageModal("Service Details", `Details for '${newItem.dataset.service}' will be displayed here.`);
        });
    });
}
window.attachAniMoServicesPageListeners = attachAniMoServicesPageListeners;


// Learning Hub Page Specific Logic (New function)
function initLearningHub() {
    console.log("[LearningHub] Initializing Learning Hub page.");
    // Example: If you have interactive elements like video players, quizzes, etc.
    const learningHubSection = document.getElementById('learning-hub-page-section');
    if (!learningHubSection) {
        console.warn("[initLearningHub] Learning Hub page section not found, skipping interactivity.");
        return;
    }
    
    const videoModal = document.getElementById('video-modal');
    const closeVideoModalBtn = document.getElementById('close-video-modal');
    const youtubeIframe = document.getElementById('youtube-iframe');

    if (!videoModal || !closeVideoModalBtn || !youtubeIframe) {
        console.warn("[initLearningHub] Required elements for video modal not found. Skipping video interactivity.");
        // Continue to attach other listeners if possible
    }

    // Event listeners for YouTube video cards
    learningHubSection.querySelectorAll('.learning-video-card').forEach(card => {
        // Ensure listeners are not duplicated
        const oldCard = card;
        const newCard = oldCard.cloneNode(true);
        oldCard.parentNode.replaceChild(newCard, oldCard);
        newCard.addEventListener('click', function() { // Use a traditional function to keep 'this' context
            const youtubeId = this.dataset.youtubeId; // 'this' refers to the clicked card
            if (youtubeId && youtubeIframe && videoModal) {
                const videoSrc = `https://www.youtube.com/embed/${youtubeId}?autoplay=1`;
                youtubeIframe.src = videoSrc;
                videoModal.classList.add('active');
                videoModal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
                console.log(`[initLearningHub] Opened video: ${youtubeId}`);
            } else {
                console.warn("[initLearningHub] No YouTube ID found for video card or modal elements missing.");
            }
        });
    });

    // Event listener for closing the video modal
    if (closeVideoModalBtn) {
        // Clone and replace to avoid duplicate listeners
        const oldBtn = closeVideoModalBtn;
        const newBtn = oldBtn.cloneNode(true);
        oldBtn.parentNode.replaceChild(newBtn, oldBtn);
        newBtn.addEventListener('click', () => {
            if (youtubeIframe && videoModal) {
                youtubeIframe.src = ''; // Stop video playback
                videoModal.classList.remove('active');
                videoModal.addEventListener('transitionend', function handler() {
                    videoModal.classList.add('hidden');
                    videoModal.removeEventListener('transitionend', handler);
                }, { once: true });
                document.body.style.overflow = '';
                console.log("[initLearningHub] Closed video modal.");
            }
        });
    }

    // Close modal if clicking outside the video content
    if (videoModal) {
        // Clone and replace to avoid duplicate listeners
        const oldModal = videoModal;
        const newModal = oldModal.cloneNode(true);
        oldModal.parentNode.replaceChild(newModal, oldModal);
        newModal.addEventListener('click', (event) => {
            if (event.target === newModal && youtubeIframe) { // Ensure click is directly on the overlay
                youtubeIframe.src = '';
                newModal.classList.remove('active');
                newModal.addEventListener('transitionend', function handler() {
                    newModal.classList.add('hidden');
                    newModal.removeEventListener('transitionend', handler);
                }, { once: true });
                document.body.style.overflow = '';
                console.log("[initLearningHub] Closed video modal by clicking outside.");
            }
        });
    }

    // Event listeners for general article links (opening in new tab)
    learningHubSection.querySelectorAll('.learn-more-link').forEach(link => {
        // Clone and replace to avoid duplicate listeners
        const oldLink = link;
        const newLink = oldLink.cloneNode(true);
        oldLink.parentNode.replaceChild(newLink, oldLink);
        newLink.addEventListener('click', (event) => {
            event.preventDefault();
            const articleUrl = event.currentTarget.dataset.articleUrl; // 'this' refers to the clicked link
            if (articleUrl) {
                window.open(articleUrl, '_blank');
                console.log(`[initLearningHub] Opened article link: ${articleUrl}`);
            } else {
                console.warn("[initLearningHub] No article URL found for link.");
            }
        });
    });

    // Event listener for the "JOIN NOW" button for seminars (example)
    const seminarJoinBtn = learningHubSection.querySelector('.seminar-join-btn');
    if (seminarJoinBtn) {
        // Clone and replace to avoid duplicate listeners
        const oldBtn = seminarJoinBtn;
        const newBtn = oldBtn.cloneNode(true);
        oldBtn.parentNode.replaceChild(newBtn, oldBtn);
        newBtn.addEventListener('click', () => {
            showMessageModal('Seminar Registration', 'Thank you for your interest in our seminars! Details on upcoming seminars will be sent to your registered email.');
            console.log("[initLearningHub] Seminar Join button clicked.");
        });
    }
}
window.initLearningHub = initLearningHub; // Expose globally

// Initial load logic when script.js first runs
document.addEventListener('DOMContentLoaded', () => {
    // Get initial references for all static modal elements
    loginForm = document.getElementById('login-form');
    signupForm = document.getElementById('signup-form');
    roleSelection = document.getElementById('role-selection');
    rsbsaLoginForm = document.getElementById('rsbsa-login-form');
    // Ensure authMessageBox is also selected for messages within the auth modal
    authMessageBox = document.getElementById('auth-message-box'); // Ensure this ID is in index.html
    forgotPasswordLink = document.getElementById('forgot-password-link');
    learnMoreRsbsaLink = document.getElementById('learn-more-rsbsa-link');

    // Checkout UI element references (now static in index.html)
    checkoutHeader = document.getElementById('checkout-header');
    itemsCountElement = document.getElementById('items-count');
    cartBackArrow = document.getElementById('cart-back-arrow');
    cartStep = document.getElementById('cart-step');
    addressStep = document.getElementById('address-step');
    summaryStep = document.getElementById('summary-step');
    paymentStep = document.getElementById('payment-step');
    cartAddressLine = document.getElementById('cart-address-line');
    addressSummaryLine = document.getElementById('address-summary-line');
    summaryPaymentLine = document.getElementById('summary-payment-line');
    cartItemsContainer = document.getElementById('cart-items-container');
    summaryItemsContainer = document.getElementById('summary-items-container');
    
    // Select the NodeList for steps and buttons (for consistent re-attachment)
    checkoutStepsElements = document.querySelectorAll('#checkout-process-container .checkout-step'); 
    checkoutContinueBtns = document.querySelectorAll('#checkout-process-container .checkout-continue-btn');
    checkoutBackBtns = document.querySelectorAll('#checkout-process-container .checkout-back-btn');
    checkoutFinalBtn = document.querySelector('#checkout-process-container .checkout-final-btn');


    // Attach listeners for the auth modal forms and checkout elements.
    // This needs to be called after the HTML for these is ensured to be in the DOM.
    attachAuthModalListeners();
    attachCheckoutListeners(); // Also attach checkout listeners here

    const initialPage = window.location.hash ? window.location.hash.substring(1) : 'home';
    updateNavBar();
    loadPage(initialPage);
});

