// script.js

// Global Page Navigation Logic
const pageContentContainer = document.getElementById('page-content-container');
// Select both nav-link and nav-popup-link elements
const allNavLinks = document.querySelectorAll('.nav-link, .nav-popup-link');
const mainNavLinksDiv = document.getElementById('main-nav-links'); // This seems unused in the provided HTML but kept for reference
const userIconsDiv = document.getElementById('user-icons');
const sellLink = document.getElementById('sell-link');
const profileIcon = document.getElementById('profile-icon'); // Get the profile icon
const profilePopupMenu = document.getElementById('profile-popup-menu'); // Get the profile popup menu

// Initialize user role from local storage, default to 'guest'
let currentUserRole = localStorage.getItem('currentUserRole') || 'guest'; // Persist role across sessions
// Expose currentUserRole globally so marketplace.html script can access it
window.currentUserRole = currentUserRole;

// Map friendly page IDs to actual file names (matching your exact directory structure)
// IMPORTANT: These paths must EXACTLY match your local file structure's directories and filenames.
// All paths now begin with '/' to resolve from the server root.
const pageMap = {
    'home': '/pages/HomePage.html', // Corrected to HomePage.html
    'about': '/pages/aboutPage.html', // Corrected to aboutPage.html
    'weather': '/pages/weatherPage.html', // Corrected to weatherPage.html
    'loan': '/pages/loanPage.html', // Corrected to loanPage.html
    'marketplace': '/pages/MarketplacePage.html', // Corrected to MarketplacePage.html as per user's latest provided path
    'sell': '/pages/sellPage.html', // Corrected to sellPage.html
    'profile': '/pages/profilePage.html', // Assuming this is correct
    'my-activity': '/pages/MyActivityPage.html', // Added mapping for My Activity page
    'government-updates': '/pages/GovernmentUpdatePage.html', // <--- ADDED THIS FOR GOVERNMENT UPDATE PAGE
};

// Map friendly page IDs to their corresponding CSS file names (matching your exact directory structure)
// IMPORTANT: These paths must EXACTLY match your local file structure's directories and filenames.
// All paths now begin with '/' to resolve from the server root.
const cssMap = {
    'home': '/css/homepage.css', // Corrected to homepage.css
    'about': '/css/aboutPage.css', // Corrected to aboutPage.css
    'weather': '/css/weatherPage.css', // Corrected to weatherPage.css
    'loan': '/css/loanPage.css', // Corrected to loanPage.css
    'marketplace': '/css/MarketplacePage.css', // Corrected to marketplace.css
    'sell': '/css/sellPage.css', // Corrected to sellPage.css
    'profile': '/css/profilePage.css', // Assuming this is correct
    'my-activity': '/css/myActivityPage.css', // Added mapping for My Activity page CSS
    'government-updates': '/css/governmentUpdatePage.css', // <--- ADDED THIS FOR GOVERNMENT UPDATE PAGE CSS
};

let currentLoadedCss = null; // To keep track of the currently loaded CSS file

/**
 * Loads the content and associated CSS for a given page ID.
 * @param {string} pageId - The ID of the page to load (e.g., 'home', 'marketplace').
 */
async function loadPage(pageId) {
    console.log(`[loadPage] Attempting to load page: ${pageId}`);
    let targetPageId = pageId; // Use a mutable variable for potential fallback

    let pageUrl = pageMap[targetPageId];
    let cssUrl = cssMap[targetPageId]; // Get the CSS file path for the requested page

    if (!pageUrl) {
        console.warn(`[loadPage] Page URL not found in pageMap for ID: ${pageId}. Falling back to 'home'.`);
        targetPageId = 'home'; // Fallback to home page
        pageUrl = pageMap[targetPageId];
        cssUrl = cssMap[targetPageId];
        // If 'home' also isn't defined, there's a serious configuration error.
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
            document.head.prepend(link); // Prepend to head so styles apply correctly, before any inline styles
            currentLoadedCss = cssUrl; // Update tracking variable
        } else if (!cssUrl) {
            currentLoadedCss = null; // No specific CSS for this page
            console.log(`[loadPage] No specific CSS for page: ${targetPageId}`);
        }

        // 3. Fetch and load page HTML
        console.log(`[loadPage] Fetching HTML from: ${pageUrl}`);
        const response = await fetch(pageUrl);
        if (!response.ok) {
            const errorText = await response.text(); // Get response body for more detail
            throw new Error(`HTTP error! status: ${response.status} for ${pageUrl}. Response body: ${errorText.substring(0, 200)}...`);
        }
        let html = await response.text(); // Use let instead of const here

        // Create a temporary div to handle scripts within the loaded HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Extract and remove script tags from the loaded content
        const scriptsToExecute = Array.from(tempDiv.querySelectorAll('script'));
        scriptsToExecute.forEach(script => script.remove()); // Remove from tempDiv HTML

        // Inject the remaining HTML (without scripts) into the pageContentContainer
        pageContentContainer.innerHTML = tempDiv.innerHTML;
        console.log(`[loadPage] Loaded HTML for page: ${targetPageId} (scripts will be executed separately).`);

        // Execute the extracted scripts
        scriptsToExecute.forEach(oldScript => {
            const newScript = document.createElement('script');
            // Copy attributes (like src, type)
            Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            // Copy content for inline scripts
            if (oldScript.textContent) {
                newScript.textContent = oldScript.textContent;
            }
            // If it's an external script, set src
            if (oldScript.src) {
                newScript.src = oldScript.src;
            }
            // Append to the document body or head, which triggers execution
            document.body.appendChild(newScript); // Append to body to ensure it runs after DOM is ready
            console.log(`[loadPage] Executing script for ${targetPageId}: ${oldScript.src || 'inline script'}`);
            // Remove the script after execution to avoid duplicates if page is reloaded
            // newScript.remove(); // Removed this line, as removing it immediately might prevent execution for some complex scripts. Let browser manage.
        });


        // 4. Update active link in navigation
        document.querySelectorAll('.nav-link, .nav-popup-link').forEach(link => { // Changed navLinks to allNavLinks
            link.classList.remove('font-bold', 'text-green-200');
            // Check original pageId, not fallback, to highlight correct nav item
            if (link.dataset.target === pageId) {
                link.classList.add('font-bold', 'text-green-200');
            }
        });

        // 5. Scroll to top of the page when navigating
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 6. Execute page-specific JavaScript after HTML is loaded and its scripts run
        executePageSpecificJS(targetPageId); // Use the (potentially fallback) targetPageId for JS execution
        

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
            // Check if the functions exist before calling them, as home.html includes its own script
            if (typeof initHomePageSwipers === 'function') {
                initHomePageSwipers();
                console.log("[executePageSpecificJS] Called initHomePageSwipers.");
            }
            break;
        case 'about':
            // Check if the functions exist before calling them, as about.html includes its own script
            if (typeof initAboutUsSwiper === 'function') {
                initAboutUsSwiper();
                console.log("[executePageSpecificJS] Called initAboutUsSwiper.");
            }
            break;
        case 'weather':
            // Weather page functions (assuming they are in weather.js and exposed globally)
            if (typeof initWeatherTypesSwipers === 'function') initWeatherTypesSwipers(); // Corrected function name
            if (typeof initHourlyForecastSwiper === 'function') initHourlyForecastSwipers(); // Corrected function name
            if (typeof setupLocationInputListener === 'function') setupLocationInputListener();
            // Initial calls for weather page when loaded
            if (typeof updateWeatherBannerBackground === 'function') updateWeatherBannerBackground('sunny'); // Default to sunny background
            if (typeof updateLocationAndDate === 'function') updateLocationAndDate('Manila, Philippines'); // Default location and current date
            console.log("[executePageSpecificJS] Called weather page init functions.");
            break;
        case 'marketplace':
            // This will call the attachMarketplaceProductListeners function which is exposed globally by marketplace.html's script
            if (typeof attachMarketplaceProductListeners === 'function') {
                attachMarketplaceProductListeners();
                console.log("[executePageSpecificJS] Called attachMarketplaceProductListeners.");
            } else {
                console.warn("[executePageSpecificJS] attachMarketplaceProductListeners not found.");
            }
            break;
        case 'government-updates': // <--- ADDED THIS CASE FOR GOVERNMENT UPDATE PAGE
            // No specific JS functions for this page yet, but it's ready if you add any.
            console.log("[executePageSpecificJS] Government updates page loaded.");
            break;
        // The checkout-process page's script is now handled directly within script.js and activated by startCheckout
        default:
            console.log(`[executePageSpecificJS] No specific JS functions for ${pageId}`);
            break;
    }
}


/**
 * Updates the visibility of navigation links based on the current user role.
 */
function updateNavBar() {
    // Hide all nav links initially for a clean slate
    document.querySelectorAll('.nav-link').forEach(link => { // Only hide main nav links, popup menu visibility handled by CSS
        link.classList.add('hidden'); // Hide all by default
    });
    if (sellLink) sellLink.classList.add('hidden'); // Explicitly hide sell link
    if (userIconsDiv) userIconsDiv.classList.add('hidden'); // Explicitly hide user icons

    // Define links always visible to guests and logged-in users
    const alwaysVisibleLinks = ['home', 'about', 'weather', 'loan', 'marketplace', 'government-updates']; // <--- ADDED 'government-updates' HERE

    // Show always visible links
    alwaysVisibleLinks.forEach(target => {
        const linkElement = document.querySelector(`.nav-link[data-target="${target}"]`);
        if (linkElement) {
            linkElement.classList.remove('hidden');
        }
    });

    // Show specific links/icons based on role
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
        event.preventDefault(); // Prevent default anchor behavior (page refresh)
        const targetPageId = event.target.dataset.target;
        history.pushState({ page: targetPageId }, '', `#${targetPageId}`); // Update URL hash for bookmarking/back button
        loadPage(targetPageId); // Load the new page
        // Close profile popup if open
        if (profilePopupMenu && !profilePopupMenu.classList.contains('hidden')) {
            profilePopupMenu.classList.add('hidden');
        }
    });
});

// Event listener for the profile icon to toggle the popup menu
if (profileIcon) {
    profileIcon.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent click from bubbling up to document and immediately closing
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
        // Default to home page if no state is found (e.g., initial load without hash)
        loadPage('home');
    }
});


// --- MODAL LOGIC (Authentication & Checkout) ---
const appModal = document.getElementById('app-modal');
const appModalContent = document.getElementById('app-modal-content');
const appModalBody = document.getElementById('app-modal-body');
const closeAppModalBtn = document.getElementById('close-app-modal');

// References to the main containers within app-modal-body
const authFormsContainer = document.getElementById('auth-forms-container');
const checkoutProcessContainer = document.getElementById('checkout-process-container');


// References for Auth Forms (assuming they are now static within index.html)
let loginForm, signupForm, roleSelection, rsbsaLoginForm,
    showSignupBtn, showLoginBtn, selectFarmerRoleBtn, selectBuyerRoleBtn,
    generalLoginBtn, generalSignupBtn, rsbsaLoginBtn;

// References for Checkout Process
let checkoutHeader, itemsCountElement, cartBackArrow;
let cartStep, addressStep, summaryStep, paymentStep;
let cartAddressLine, addressSummaryLine, summaryPaymentLine;
let cartItemsContainer, summaryItemsContainer;
const checkoutStepsElements = document.querySelectorAll('#checkout-process-container .checkout'); // All step divs within checkout
const checkoutContinueBtns = document.querySelectorAll('#checkout-process-container .continue-btn');
const checkoutBackBtns = document.querySelectorAll('#checkout-process-container .back-btn');
const checkoutFinalBtn = document.querySelector('#checkout-process-container .checkout-btn');


// Checkout Process Logic (Moved from checkoutProcess.html)
const steps = [
    { id: 'step0', header: 'Your Cart', showItemsCount: true },
    { id: 'step1', header: 'Check Out 1/3', showItemsCount: false },
    { id: 'step2', header: 'Check Out 2/3', showItemsCount: false },
    { id: 'step3', header: 'Check Out 3/3', showItemsCount: false }
];
let currentStepIndex = 0;
let cartItems = [];
const DELIVERY_CHARGE = 50.00;

// Helper to toggle password visibility
function togglePasswordVisibility(id) {
    const input = document.getElementById(id);
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
        const icon = input.nextElementSibling; // Assuming the eye icon is the next sibling
        if (icon) {
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        }
    }
}
window.togglePasswordVisibility = togglePasswordVisibility; // Make it global for inline onclick


// Function to show a specific modal view (Auth or Checkout)
window.showModalView = function(viewType, initialAuthFormId = 'login-form') {
    if (!appModal || !authFormsContainer || !checkoutProcessContainer) {
        console.error("Modal or its content containers not found. Cannot show modal view.");
        return;
    }

    // Hide all main modal view containers first
    authFormsContainer.classList.add('hidden');
    checkoutProcessContainer.classList.add('hidden');
    appModalContent.classList.remove('checkout-modal-width'); // Remove wider class by default

    // Hide all specific auth forms initially
    if (loginForm) loginForm.classList.add('hidden');
    if (signupForm) signupForm.classList.add('hidden');
    if (roleSelection) roleSelection.classList.add('hidden');
    if (rsbsaLoginForm) rsbsaLoginForm.classList.add('hidden');

    if (viewType === 'auth') {
        authFormsContainer.classList.remove('hidden');
        const targetForm = document.getElementById(initialAuthFormId);
        if (targetForm) {
            targetForm.classList.remove('hidden'); // Show specific auth form
        } else {
            console.error(`[showModalView] Auth form with ID '${initialAuthFormId}' not found.`);
        }
    } else if (viewType === 'checkout') {
        checkoutProcessContainer.classList.remove('hidden');
        appModalContent.classList.add('checkout-modal-width'); // Add wider class for checkout
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
    appModalContent.classList.remove('checkout-modal-width'); // Reset width on close
    // Optional: Clear cart items or other state if a complete reset is desired on close
    // cartItems = [];
    // renderCartItems();
};

// Event listener for the generic modal close button
if (closeAppModalBtn) {
    closeAppModalBtn.addEventListener('click', window.closeModal);
}

// Function to start the checkout process with a specific product
window.startCheckout = (productDetails) => {
    console.log("[script.js] startCheckout called with product:", productDetails);
    cartItems = []; // Clear any previous items in cart
    addProductToCart(productDetails); // Add the initial product to cart
    window.showModalView('checkout'); // Show the checkout modal, which will display step0
};


// --- CHECKOUT FUNCTIONS (MOVED FROM checkoutProcess.html) ---

// Function to update header and progress indicators for checkout
function updateUIForStep(index) {
    console.log(`[script.js] updateUIForStep called for index: ${index}`);
    // Re-select elements inside the checkout container as they are now static
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
        console.error("[script.js] One or more checkout UI elements not found in updateUIForStep. This may be a DOMContentLoaded timing issue or incorrect IDs.");
        return;
    }

    // Update header text
    checkoutHeader.querySelector('h1').textContent = steps[index].header;

    // Show/hide back arrow and items count
    if (index === 0) { // On the cart step
        cartBackArrow.style.display = 'block'; // Show back arrow explicitly
        itemsCountElement.textContent = `${cartItems.length} Item${cartItems.length !== 1 ? 's' : ''}`;
        itemsCountElement.style.display = 'block'; // Show items count explicitly
    } else { // On other steps
        cartBackArrow.style.display = 'none'; // Hide back arrow explicitly
        itemsCountElement.style.display = 'none'; // Hide items count explicitly
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
    if (checkoutStepsElements.length === 0) {
        console.warn("[script.js] No checkout step sections found. Skipping showStep.");
        return;
    }
    console.log(`[script.js] Found ${checkoutStepsElements.length} checkout sections.`);

    checkoutStepsElements.forEach((stepEl, i) => {
        console.log(`[script.js] showStep: Processing step ${stepEl.id} (index ${i}). Current target index: ${index}.`);
        if (i === index) {
            stepEl.style.display = 'block'; // Explicitly set display to block for the active step
            console.log(`[script.js] showStep: ${stepEl.id} display set to 'block'.`);
        } else {
            stepEl.style.display = 'none'; // Explicitly set display to none for inactive steps
            console.log(`[script.js] showStep: ${stepEl.id} display set to 'none'.`);
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

    const subTotalDisplay = document.getElementById('sub-total-display');
    const deliveryChargesDisplay = document.getElementById('delivery-charges-display');
    const orderTotalDisplay = document.getElementById('order-total-display');
    const itemsCountDisplay = document.getElementById('items-count');

    if (subTotalDisplay) subTotalDisplay.textContent = `₱ ${subTotal.toFixed(2)}`;
    if (deliveryChargesDisplay) deliveryChargesDisplay.textContent = `₱ ${DELIVERY_CHARGE.toFixed(2)}`;
    if (orderTotalDisplay) orderTotalDisplay.textContent = `₱ ${orderTotal.toFixed(2)}`;
    // Update the items count in the header as well
    if (itemsCountDisplay) itemsCountDisplay.textContent = `${cartItems.length} Item${cartItems.length !== 1 ? 's' : ''}`;


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
        cartItemsContainer.innerHTML = '<p class="text-center text-gray-500">Your cart is empty.</p>';
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

        // Re-attach listeners to newly rendered quantity controls and remove buttons
        cartItemsContainer.querySelectorAll('.quantity-minus').forEach(button => {
            button.addEventListener('click', (event) => {
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
            button.addEventListener('click', (event) => {
                const index = parseInt(event.currentTarget.dataset.index);
                cartItems[index].quantity++;
                renderCartItems();
                updateOrderSummaryDisplays();
            });
        });

        cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const index = parseInt(event.currentTarget.dataset.index);
                removeItem(index);
            });
        });

        cartItemsContainer.querySelectorAll('.edit-item-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const index = parseInt(event.currentTarget.dataset.index);
                console.log(`Edit item at index: ${index}`, cartItems[index]);
                // Implement logic to open a modal for editing quantity/details if needed
            });
        });
    }
    updateOrderSummaryDisplays(); // Always update summary after rendering cart items
}

// Function to add a product to the cart
window.addProductToCart = (product) => { // Expose to global scope for marketplace.html
    console.log("[script.js] addProductToCart called with:", product);
    const existingItemIndex = cartItems.findIndex(item => item.name === product.name);
    if (existingItemIndex > -1) {
        cartItems[existingItemIndex].quantity += product.quantity || 1;
    } else {
        cartItems.push({ ...product, quantity: product.quantity || 1 });
    }
    renderCartItems();
    updateOrderSummaryDisplays();
    console.log("Current cart:", cartItems);
}

// Function to remove a product from the cart by index
function removeItem(index) {
    if (index > -1 && index < cartItems.length) {
        cartItems.splice(index, 1);
        renderCartItems();
        updateOrderSummaryDisplays();
        console.log("Item removed. Current cart:", cartItems);
    }
}

// Function to attach event listeners to checkout page elements (non-cart specific)
function attachCheckoutListeners() {
    console.log("[script.js] attachCheckoutListeners called. Attaching listeners for checkout page.");

    // Back arrow in header
    if (cartBackArrow) {
        // Remove existing listener to prevent duplicates before adding
        const oldArrow = cartBackArrow;
        const newArrow = oldArrow.cloneNode(true);
        oldArrow.parentNode.replaceChild(newArrow, oldArrow);
        newArrow.addEventListener('click', () => {
            console.log("[script.js] Cart back arrow clicked. Closing modal.");
            window.closeModal(); // Close the modal
        });
    }

    // Event listeners for address/payment card selection
    document.querySelectorAll('#checkout-process-container .address-card, #checkout-process-container .payment-option-card').forEach(card => {
        // Remove existing event listener to prevent duplicates
        const oldCard = card;
        const newCard = oldCard.cloneNode(true);
        oldCard.parentNode.replaceChild(newCard, oldCard); // Replace to clean listeners

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
    checkoutContinueBtns.forEach(btn => {
        // Remove existing listener to prevent duplicates
        const oldBtn = btn;
        const newBtn = oldBtn.cloneNode(true);
        oldBtn.parentNode.replaceChild(newBtn, oldBtn); // Replace to clean listeners

        newBtn.addEventListener('click', () => {
            console.log("[script.js] Continue button clicked.");
            // Ensure cart is not empty before proceeding from step0
            if (currentStepIndex === 0 && cartItems.length === 0) {
                console.warn("Cart is empty! Cannot proceed to checkout.");
                // You might want to display a message to the user here in the UI
                return; // Prevent continuing
            }

            if (currentStepIndex < steps.length - 1) {
                showStep(currentStepIndex + 1);
            } else {
                console.log("[script.js] Already at the last step (or next step beyond bounds).");
            }
        });
    });

    // Back button logic
    checkoutBackBtns.forEach(btn => {
        // Remove existing listener to prevent duplicates
        const oldBtn = btn;
        const newBtn = oldBtn.cloneNode(true);
        oldBtn.parentNode.replaceChild(newBtn, oldBtn); // Replace to clean listeners

        newBtn.addEventListener('click', () => {
            console.log("[script.js] Back button clicked.");
            if (currentStepIndex > 0) {
                showStep(currentStepIndex - 1);
            } else {
                console.log("[script.js] Already at the first step.");
            }
        });
    });

    // Checkout button logic (for final step)
    if (checkoutFinalBtn) {
        // Remove existing listener to prevent duplicates
        const oldFinalBtn = checkoutFinalBtn;
        const newFinalBtn = oldFinalBtn.cloneNode(true);
        oldFinalBtn.parentNode.replaceChild(newFinalBtn, oldFinalBtn); // Replace to clean listeners

        newFinalBtn.addEventListener('click', () => {
            console.log('[script.js] Final Checkout Complete! Order Placed Successfully! Navigating to My Activity page.');
            window.closeModal(); // Close the modal
            loadPage('my-activity'); // Navigate to the "My Activity" page
        });
    }
}


// --- AUTHENTICATION FUNCTIONS (REFACTORED TO USE showModalView) ---
function attachAuthModalListeners() {
    console.log("[script.js] Attaching auth modal listeners.");
    // Re-select elements within the appModalBody as they are now static
    loginForm = document.getElementById('login-form');
    signupForm = document.getElementById('signup-form');
    roleSelection = document.getElementById('role-selection');
    rsbsaLoginForm = document.getElementById('rsbsa-login-form');

    if (!loginForm || !signupForm || !roleSelection || !rsbsaLoginForm) {
        console.warn("[script.js] One or more auth modal forms not found. This might be a timing issue or incorrect IDs. Attempting to proceed but functionality may be limited.");
        // Try to attach listeners only if the elements exist
    }

    // Assign dynamic buttons (and ensure they exist before trying to attach listeners)
    showSignupBtn = document.getElementById('show-signup');
    showLoginBtn = document.getElementById('show-login');
    selectFarmerRoleBtn = document.getElementById('select-farmer-role');
    selectBuyerRoleBtn = document.getElementById('select-buyer-role');
    
    // Query selectors for login/signup/rsbsa buttons, checking existence of parent forms first
    generalLoginBtn = loginForm ? loginForm.querySelector('.login-btn') : null;
    generalSignupBtn = signupForm ? signupForm.querySelector('.signup-btn') : null;
    rsbsaLoginBtn = rsbsaLoginForm ? rsbsaLoginForm.querySelector('.rsbsa-login-btn') : null;


    // Re-attach listeners (using cloneNode to prevent duplicates)
    [showSignupBtn, showLoginBtn, generalLoginBtn, generalSignupBtn, selectFarmerRoleBtn, selectBuyerRoleBtn, rsbsaLoginBtn].forEach(btn => {
        if (btn) {
            const oldBtn = btn;
            const newBtn = oldBtn.cloneNode(true);
            oldBtn.parentNode.replaceChild(newBtn, oldBtn);

            // Specific listeners for new buttons
            if (newBtn.id === 'show-signup') {
                newBtn.addEventListener('click', (e) => { e.preventDefault(); window.showModalView('auth', 'signup-form'); });
            } else if (newBtn.id === 'show-login') {
                newBtn.addEventListener('click', (e) => { e.preventDefault(); window.showModalView('auth', 'login-form'); });
            } else if (newBtn.classList.contains('login-btn') && newBtn.closest('#login-form')) {
                newBtn.addEventListener('click', () => { window.showModalView('auth', 'role-selection'); });
            } else if (newBtn.classList.contains('signup-btn') && newBtn.closest('#signup-form')) {
                newBtn.addEventListener('click', () => { window.showModalView('auth', 'role-selection'); });
            } else if (newBtn.id === 'select-farmer-role') {
                newBtn.addEventListener('click', () => { window.showModalView('auth', 'rsbsa-login-form'); });
            } else if (newBtn.id === 'select-buyer-role') {
                newBtn.addEventListener('click', () => {
                    currentUserRole = 'buyer';
                    localStorage.setItem('currentUserRole', 'buyer');
                    window.currentUserRole = 'buyer';
                    window.closeModal();
                    updateNavBar();
                    loadPage('marketplace');
                });
            } else if (newBtn.classList.contains('rsbsa-login-btn')) {
                newBtn.addEventListener('click', () => {
                    currentUserRole = 'farmer';
                    localStorage.setItem('currentUserRole', 'farmer');
                    window.currentUserRole = 'farmer';
                    window.closeModal();
                    updateNavBar();
                    loadPage('sell');
                });
            }
        }
    });

    // Password visibility toggles
    document.querySelectorAll('.modal-view-container [id$="-password"] + i.fa-eye').forEach(icon => {
        const inputId = icon.previousElementSibling.id;
        // Clone and re-attach to prevent duplicates
        const oldIcon = icon;
        const newIcon = oldIcon.cloneNode(true);
        oldIcon.parentNode.replaceChild(newIcon, oldIcon);
        newIcon.addEventListener('click', () => togglePasswordVisibility(inputId));
    });
}


// --- Page-Specific JavaScript Functions (Moved from individual HTML files) ---

// Home Page Specific Logic
function initHomePageSwipers() {
    console.log("[initHomePageSwipers] Initializing Home Page swipers.");
    // Check if the home page section is actually in the DOM
    const homePageSection = document.getElementById('home-page-section');
    if (!homePageSection) {
        console.log("[initHomePageSwipers] Home page section not found, skipping swiper init.");
        return;
    }

    // Swiper for "It's Easy To Get Registered!"
    const homeEasyRegisterSwiperWrapper = homePageSection.querySelector('#home-easy-register-swiper-wrapper');
    if (homeEasyRegisterSwiperWrapper) {
        const homeEasyRegisterSlides = homeEasyRegisterSwiperWrapper.querySelectorAll('.swiper-slide');
        const homePrevEasyRegisterBtn = homePageSection.querySelector('#home-prev-easy-register');
        const homeNextEasyRegisterBtn = homePageSection.querySelector('#home-next-easy-register');
        let currentHomeEasyRegisterSlide = 0;

        function updateHomeEasyRegisterSwiper() {
            if (!homeEasyRegisterSwiperWrapper || !homeEasyRegisterSlides.length) return;

            let slidesInView = 1; // Default for mobile
            if (window.innerWidth >= 640) slidesInView = 2; // sm breakpoint
            if (window.innerWidth >= 1024) slidesInView = 3; // lg breakpoint
            if (window.innerWidth >= 1280) slidesInView = 5; // xl breakpoint (if applicable)

            const containerWidth = homeEasyRegisterSwiperWrapper.offsetWidth;
            const totalSlideWidth = homeEasyRegisterSlides[0].offsetWidth + parseFloat(getComputedStyle(homeEasyRegisterSlides[0]).marginRight || 0);

            const transformX = - (currentHomeEasyRegisterSlide * (containerWidth / slidesInView));

            homeEasyRegisterSwiperWrapper.style.transform = `translateX(${transformX}px)`;

            if (homePrevEasyRegisterBtn) homePrevEasyRegisterBtn.disabled = currentHomeEasyRegisterSlide === 0;
            if (homeNextEasyRegisterBtn) homeNextEasyRegisterBtn.disabled = currentHomeEasyRegisterSlide >= (homeEasyRegisterSlides.length - slidesInView);
        }

        if (homePrevEasyRegisterBtn) homePrevEasyRegisterBtn.addEventListener('click', () => {
            if (currentHomeEasyRegisterSlide > 0) {
                currentHomeEasyRegisterSlide--;
                updateHomeEasyRegisterSwiper();
            }
        });
        if (homeNextEasyRegisterBtn) homeNextEasyRegisterBtn.addEventListener('click', () => {
            const slidesInView = (window.innerWidth >= 1280) ? 5 : (window.innerWidth >= 1024) ? 3 : (window.innerWidth >= 640) ? 2 : 1;
            if (currentHomeEasyRegisterSlide < (homeEasyRegisterSlides.length - slidesInView)) {
                currentHomeEasyRegisterSlide++;
                updateHomeEasyRegisterSwiper();
            }
        });
        window.addEventListener('resize', updateHomeEasyRegisterSwiper); // Listen for resize
        updateHomeEasyRegisterSwiper(); // Initialize
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
        const prevVisionBtn = aboutPageSection.querySelector('#about-us-prev-vision-card');
        const nextVisionBtn = aboutPageSection.querySelector('#about-us-next-vision-card');
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

        if (prevVisionBtn) prevVisionBtn.addEventListener('click', () => {
            if (currentVisionSlide > 0) {
                currentVisionSlide--;
                updateVisionSwiper();
            }
        });
        if (nextVisionBtn) nextVisionBtn.addEventListener('click', () => {
            if (currentVisionSlide < (visionSlides.length - 1)) {
                currentVisionSlide++;
                updateVisionSwiper();
            }
        });
        window.addEventListener('resize', updateVisionSwiper);
        updateVisionSwiper(); // Initialize
    }
}
window.initAboutUsSwiper = initAboutUsSwiper;


// Weather Page Specific Logic (assuming these functions are now defined globally by weather.js or inline in weather.html)
// Function to update the weather banner background
const weatherBackgrounds = { // Moved from weather.js to script.js global scope
    'sunny': 'https://placehold.co/1200x500/FFD700/000?text=Sunny',
    'cloudy': 'https://placehold.co/1200x500/808080/FFF?text=Cloudy',
    'rainy': 'https://placehold.co/1200x500/4682B4/FFF?text=Rainy',
    'stormy': 'https://placehold.co/1200x500/000000/FFF?text=Stormy'
};

function updateWeatherBannerBackground(weatherType) {
    const weatherPageSection = document.getElementById('weather-page-section');
    if (!weatherPageSection) return;
    const banner = weatherPageSection.querySelector('.weather-banner'); // Select within the section
    if (banner && weatherBackgrounds[weatherType]) {
        banner.style.backgroundImage = `url('${weatherBackgrounds[weatherType]}')`;
    }
}
window.updateWeatherBannerBackground = updateWeatherBannerBackground;


function initWeatherTypesSwipers() { // Corrected function name
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

        if (prevWeatherTypeBtn) prevWeatherTypeBtn.addEventListener('click', () => {
            if (currentWeatherTypeSlide > 0) {
                currentWeatherTypeSlide--;
                updateWeatherTypesSwiper();
            }
        });
        if (nextWeatherTypeBtn) nextWeatherTypeBtn.addEventListener('click', () => {
            const slidesInView = (window.innerWidth >= 1024) ? 4 : (window.innerWidth >= 640) ? 2 : 1;
            if (currentWeatherTypeSlide < (weatherTypesSlides.length - slidesInView)) {
                currentWeatherTypeSlide++;
                updateWeatherTypesSwiper();
            }
        });
        window.addEventListener('resize', updateWeatherTypesSwiper);
        updateWeatherTypesSwiper(); // Initialize
    }
}
window.initWeatherTypesSwipers = initWeatherTypesSwipers; // Corrected to initWeatherTypesSwipers


function initHourlyForecastSwiper() {
    const weatherPageSection = document.getElementById('weather-page-section');
    if (!weatherPageSection) return;
    const hourlyScrollArea = weatherPageSection.querySelector('#hourly-forecast-scroll-area');
    const hourlyCardsFlexWrapper = weatherPageSection.querySelector('#hourly-cards-flex-wrapper');
    const hourlyPrevBtn = weatherPageSection.querySelector('#hourly-prev-btn');
    const hourlyNextBtn = weatherPageSection.querySelector('#hourly-next-btn');

    if (hourlyScrollArea && hourlyCardsFlexWrapper) {
        const weatherIcons = [
            'fas fa-sun', 'fas fa-cloud-sun', 'fas fa-cloud', 'fas fa-cloud-rain',
            'fas fa-bolt', 'fas fa-snowflake', 'fas fa-smog'
        ];

        hourlyCardsFlexWrapper.innerHTML = '';
        const now = new Date();
        const currentHour = now.getHours();

        for (let i = 0; i < 24; i++) {
            const hour = (currentHour + i) % 24;
            const displayHour = `${String(hour).padStart(2, '0')}:00`;

            const randomTemp = Math.floor(Math.random() * (32 - 20 + 1)) + 20;
            const randomIcon = weatherIcons[Math.floor(Math.random() * weatherIcons.length)];

            const card = document.createElement('div');
            card.classList.add('hourly-card');
            card.innerHTML = `
                <p class="text-sm">${displayHour}</p>
                <i class="${randomIcon} text-xl my-1"></i>
                <p class="text-base font-semibold">${randomTemp}°</p>
            `;
            hourlyCardsFlexWrapper.appendChild(card);
        }

        const cardWidth = 100;
        const cardMarginRight = 16;
        const scrollStep = 3 * (cardWidth + cardMarginRight);

        function updateHourlyButtons() {
            if (!hourlyScrollArea) return; // Defensive check
            hourlyPrevBtn.disabled = hourlyScrollArea.scrollLeft <= 0;
            hourlyNextBtn.disabled = (hourlyScrollArea.scrollLeft + hourlyScrollArea.clientWidth + 1) >= hourlyScrollArea.scrollWidth;
        }

        if (hourlyPrevBtn) hourlyPrevBtn.addEventListener('click', () => {
            hourlyScrollArea.scrollBy({ left: -scrollStep, behavior: 'smooth' });
        });

        if (hourlyNextBtn) hourlyNextArea.addEventListener('click', () => {
            hourlyScrollArea.scrollBy({ left: scrollStep, behavior: 'smooth' });
        });

        hourlyScrollArea.addEventListener('scroll', updateHourlyButtons);
        window.addEventListener('resize', updateHourlyButtons);
        updateHourlyButtons();
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
    if (locationInput) {
        locationInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const enteredLocation = locationInput.value.trim();
                if (enteredLocation) {
                    updateLocationAndDate(enteredLocation);
                    const weatherTypes = Object.keys(weatherBackgrounds);
                    const randomWeatherType = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
                    updateWeatherBannerBackground(randomWeatherType);
                } else {
                    updateLocationAndDate('');
                    updateWeatherBannerBackground('sunny');
                }
                locationInput.blur();
            }
        });
        updateWeatherBannerBackground('sunny');
        updateLocationAndDate('');
    }
}
window.setupLocationInputListener = setupLocationInputListener;


// Initial load logic when script.js first runs
document.addEventListener('DOMContentLoaded', () => {
    // Get initial references for all static modal elements
    loginForm = document.getElementById('login-form');
    signupForm = document.getElementById('signup-form');
    roleSelection = document.getElementById('role-selection');
    rsbsaLoginForm = document.getElementById('rsbsa-login-form');
    cartItemsContainer = document.getElementById('cart-items-container');
    summaryItemsContainer = document.getElementById('summary-items-container');
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

    attachAuthModalListeners(); // Attach listeners for login/signup/role forms
    attachCheckoutListeners(); // Attach listeners for checkout buttons

    // Initial page load
    const initialPage = window.location.hash ? window.location.hash.substring(1) : 'home';
    updateNavBar(); // Set initial nav bar state based on currentUserRole
    loadPage(initialPage); // Load the initial page content and CSS
});
