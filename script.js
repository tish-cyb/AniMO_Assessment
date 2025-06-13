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
// IMPORTANT: These paths must EXACTLY match your local file structure's directories and filenames.
// All paths now begin with '/' to resolve from the server root.
const pageMap = {
    'home': '/pages/HomePage.html',
    'about': '/pages/aboutPage.html',
    'weather': '/pages/weatherPage.html',
    'loan': '/pages/loanPage.html',
    'marketplace': '/pages/MarketplacePage.html',
    'sell': '/pages/sellPage.html',
    'profile': '/pages/profilePage.html',
    'checkout-process': '/pages/checkoutProcess.html', // NEW: Your checkout page
    // Add new page mappings here as you create the HTML files for them:
    // 'my-activity': '/pages/myActivityPage.html',
    // 'govt-updates': '/pages/govtUpdatesPage.html',
    // 'animo-services': '/pages/animoServicesPage.html',
    // 'learning-hub': '/pages/learningHubPage.html',
};

// Map friendly page IDs to their corresponding CSS file names (matching your exact directory structure)
// IMPORTANT: These paths must EXACTLY match your local file structure's directories and filenames.
// All paths now begin with '/' to resolve from the server root.
const cssMap = {
    'home': '/css/homepage.css',
    'about': '/css/aboutPage.css',
    'weather': '/css/weatherPage.css',
    'loan': '/css/loanPage.css',
    'marketplace': '/css/MarketplacePage.css',
    'sell': '/css/sellPage.css',
    // The checkoutProcess.html already contains inline styles, so no external CSS is strictly needed for it right now.
    // However, including it here for consistency if you decide to move its styles to an external file later.
    'checkout-process': '/css/checkoutProcess.css', // NEW: Placeholder for checkout CSS
    'profile': '/css/profilePage.css',
    // Add new CSS mappings here as you create the CSS files for them:
    // 'my-activity': '/css/myActivityPage.css',
    // 'govt-updates': '/css/govtUpdatesPage.css',
    // 'animo-services': '/css/animoServicesPage.css',
    // 'learning-hub': '/css/learningHubPage.css',
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
        const html = await response.text();
        pageContentContainer.innerHTML = html;
        console.log(`[loadPage] Loaded HTML for page: ${targetPageId}`);

        // 4. Update active link in navigation
        navLinks.forEach(link => {
            link.classList.remove('font-bold', 'text-green-200');
            // Check original pageId, not fallback, to highlight correct nav item
            if (link.dataset.target === pageId) {
                link.classList.add('font-bold', 'text-green-200');
            }
        });

        // 5. Scroll to top of the page when navigating
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 6. Execute page-specific JavaScript after HTML is loaded
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
            if (typeof initHomePageSwipers === 'function') initHomePageSwipers();
            break;
        case 'about':
            // Check if the functions exist before calling them, as about.html includes its own script
            if (typeof initAboutUsSwiper === 'function') initAboutUsSwiper();
            break;
        case 'weather':
            // Weather page functions (assuming they are in weather.js and exposed globally)
            if (typeof initWeatherTypesSwiper === 'function') initWeatherTypesSwiper();
            if (typeof initHourlyForecastSwiper === 'function') initHourlyForecastSwiper();
            if (typeof setupLocationInputListener === 'function') setupLocationInputListener();
            // Initial calls for weather page when loaded
            if (typeof updateWeatherBannerBackground === 'function') updateWeatherBannerBackground('sunny'); // Default to sunny background
            if (typeof updateLocationAndDate === 'function') updateLocationAndDate('Manila, Philippines'); // Default location and current date
            break;
        case 'marketplace':
            attachMarketplaceProductListeners();
            break;
        case 'checkout-process': // NEW: Add this case
            if (typeof attachCheckoutListeners === 'function') { // Check if the function exists globally
                attachCheckoutListeners(); // Call the function from checkoutProcess.html
            } else {
                console.warn("attachCheckoutListeners function not found for checkout-process page.");
            }
            break;
        // No specific JS for loan, sell, profile, or new pages yet
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
    navLinks.forEach(link => {
        link.classList.add('hidden'); // Hide all by default
    });
    sellLink.classList.add('hidden'); // Explicitly hide sell link
    userIconsDiv.classList.add('hidden'); // Explicitly hide user icons

    // Define links always visible to guests and logged-in users
    const alwaysVisibleLinks = ['home', 'about', 'weather', 'loan', 'marketplace'];

    // Show always visible links
    alwaysVisibleLinks.forEach(target => {
        const linkElement = document.querySelector(`.nav-link[data-target="${target}"]`);
        if (linkElement) {
            linkElement.classList.remove('hidden');
        }
    });

    // Show specific links/icons based on role
    if (currentUserRole === 'farmer') {
        sellLink.classList.remove('hidden');
        userIconsDiv.classList.remove('hidden');
    } else if (currentUserRole === 'buyer') {
        userIconsDiv.classList.remove('hidden');
    }
}

// Add event listeners to main navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default anchor behavior (page refresh)
        const targetPageId = event.target.dataset.target;
        history.pushState({ page: targetPageId }, '', `#${targetPageId}`); // Update URL hash for bookmarking/back button
        loadPage(targetPageId); // Load the new page
        // Close profile popup if open
        const profilePopupMenu = document.getElementById('profile-popup-menu');
        if (profilePopupMenu && !profilePopupMenu.classList.contains('hidden')) {
            profilePopupMenu.classList.add('hidden');
        }
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
let closeModalBtn, loginForm, signupForm, roleSelection, rsbsaLoginForm,
    showSignupBtn, showLoginBtn, selectFarmerRoleBtn, selectBuyerRoleBtn,
    generalLoginBtn, generalSignupBtn, rsbsaLoginBtn;


// Function to show specific form/view within the modal
function showModalView(viewId) {
    if (!loginSignupModal) {
        console.error("Login/Signup Modal (ID: 'login-signup-modal') not found. Cannot show modal view.");
        return;
    }
    // Re-assign references to ensure they are current (important if modal content is dynamically replaced)
    closeModalBtn = document.getElementById('close-modal');
    loginForm = document.getElementById('login-form');
    signupForm = document.getElementById('signup-form');
    roleSelection = document.getElementById('role-selection');
    rsbsaLoginForm = document.getElementById('rsbsa-login-form');

    if (!loginForm || !signupForm || !roleSelection || !rsbsaLoginForm) {
        console.error("One or more modal forms (login-form, signup-form, role-selection, rsbsa-login-form) not found. Cannot show modal view.");
        return;
    }

    // Hide all possible views first
    loginForm.classList.add('hidden');
    signupForm.classList.add('hidden');
    roleSelection.classList.add('hidden');
    rsbsaLoginForm.classList.add('hidden');

    // Show the requested view
    document.getElementById(viewId).classList.remove('hidden');
    loginSignupModal.classList.remove('hidden'); // Ensure modal is visible
}

// Event Listeners for modal elements on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    if (loginSignupModal) {
        closeModalBtn = document.getElementById('close-modal');
        loginForm = document.getElementById('login-form');
        signupForm = document.getElementById('signup-form');
        roleSelection = document.getElementById('role-selection');
        rsbsaLoginForm = document.getElementById('rsbsa-login-form');

        // Only proceed if all essential modal components are found
        if (closeModalBtn && loginForm && signupForm && roleSelection && rsbsaLoginForm) {
            showSignupBtn = document.getElementById('show-signup');
            showLoginBtn = document.getElementById('show-login');
            selectFarmerRoleBtn = document.getElementById('select-farmer-role');
            selectBuyerRoleBtn = document.getElementById('select-buyer-role');

            generalLoginBtn = loginForm.querySelector('.login-btn');
            generalSignupBtn = signupForm.querySelector('.signup-btn');
            rsbsaLoginBtn = rsbsaLoginForm.querySelector('.rsbsa-login-btn');

            closeModalBtn.addEventListener('click', () => {
                loginSignupModal.classList.add('hidden');
                showModalView('login-form'); // Reset to login form when closing modal
            });

            if (showSignupBtn) {
                showSignupBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    showModalView('signup-form');
                });
            }

            if (showLoginBtn) {
                showLoginBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    showModalView('login-form');
                });
            }

            // General Login button functionality - now goes to role selection
            if (generalLoginBtn) {
                generalLoginBtn.addEventListener('click', () => {
                    showModalView('role-selection');
                });
            }

            // General Signup button functionality - now goes to role selection
            if (generalSignupBtn) {
                generalSignupBtn.addEventListener('click', () => {
                    showModalView('role-selection');
                });
            }

            // Role selection functionality
            if (selectFarmerRoleBtn) {
                selectFarmerRoleBtn.addEventListener('click', () => {
                    showModalView('rsbsa-login-form'); // Show RSBSA login form for farmers
                });
            }

            if (selectBuyerRoleBtn) {
                selectBuyerRoleBtn.addEventListener('click', () => {
                    currentUserRole = 'buyer';
                    localStorage.setItem('currentUserRole', 'buyer'); // Persist role
                    loginSignupModal.classList.add('hidden');
                    updateNavBar();
                    loadPage('marketplace'); // Redirect to marketplace for buyers
                });
            }

            // RSBSA Login button functionality (for farmers after selecting role, or direct login)
            if (rsbsaLoginBtn) {
                rsbsaLoginBtn.addEventListener('click', () => {
                    // Simulate successful RSBSA login
                    currentUserRole = 'farmer'; // Assume successful RSBSA login implies farmer
                    localStorage.setItem('currentUserRole', 'farmer'); // Persist role
                    loginSignupModal.classList.add('hidden');
                    updateNavBar();
                    loadPage('sell'); // Redirect to sell page for farmers after RSBSA login
                });
            }

            // --- Profile Popup Menu Logic ---
            const profileIcon = document.getElementById('profile-icon');
            const profilePopupMenu = document.getElementById('profile-popup-menu');
            const navPopupLinks = document.querySelectorAll('.nav-popup-link');

            if (profileIcon && profilePopupMenu) {
                profileIcon.addEventListener('click', (event) => {
                    event.stopPropagation(); // Prevent document click from closing it immediately
                    profilePopupMenu.classList.toggle('hidden');
                });

                navPopupLinks.forEach(link => {
                    link.addEventListener('click', (event) => {
                        event.preventDefault();
                        event.stopPropagation(); // Prevent document click from closing it immediately

                        profilePopupMenu.classList.add('hidden'); // Close popup after click

                        const targetPageId = event.target.dataset.target;
                        const action = event.target.dataset.action;

                        if (action === 'logout') {
                            currentUserRole = 'guest';
                            localStorage.removeItem('currentUserRole');
                            updateNavBar();
                            loadPage('home');
                            console.log("Logged out. User role reset to guest.");
                        } else if (targetPageId) {
                            history.pushState({ page: targetPageId }, '', `#${targetPageId}`);
                            loadPage(targetPageId); // This will now handle the fallback if pageMap doesn't have it
                            console.log(`Navigating to ${targetPageId} page.`);
                        } else {
                            console.log(`Clicked on: ${event.target.textContent}`);
                            // Implement specific logic for other menu items here
                        }
                    });
                });

                // Close the popup when clicking outside of it (but not on the icon itself)
                document.body.addEventListener('click', (event) => {
                    if (profilePopupMenu && !profilePopupMenu.contains(event.target) && event.target !== profileIcon) {
                        profilePopupMenu.classList.add('hidden');
                    }
                });
            }


        } else {
            console.error("Not all essential modal components found. Check index.html for correct IDs.");
        }
    } else {
        console.warn("Login/Signup Modal (ID: 'login-signup-modal') not found in the DOM.");
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
                // If the user is a guest, show the login/signup modal starting with login form
                showModalView('login-form');
            } else {
                // If user is logged in, redirect to the checkout process page
                console.log('Product clicked by logged-in user. Redirecting to checkout process.');
                loadPage('checkout-process'); // NEW: Load the checkout process page
            }
        });
    });
}


// --- Page-Specific JavaScript Functions (Moved from individual HTML files) ---

// Home Page Specific Logic
function initHomePageSwipers() {
    console.log("[initHomePageSwipers] Initializing Home Page swipers.");
    // Check if the home page section is actually in the DOM
    if (!document.getElementById('home-page-section')) {
        console.log("[initHomePageSwipers] Home page section not found, skipping swiper init.");
        return;
    }

    // Swiper for "It's Easy To Get Registered!"
    const homeEasyRegisterSwiperWrapper = document.getElementById('home-easy-register-swiper-wrapper');
    if (homeEasyRegisterSwiperWrapper) {
        const homeEasyRegisterSlides = homeEasyRegisterSwiperWrapper.querySelectorAll('.swiper-slide');
        const homePrevEasyRegisterBtn = document.getElementById('home-prev-easy-register');
        const homeNextEasyRegisterBtn = document.getElementById('home-next-easy-register');
        let currentHomeEasyRegisterSlide = 0;

        function updateHomeEasyRegisterSwiper() {
            if (!homeEasyRegisterSwiperWrapper || !homeEasyRegisterSlides.length) return;

            // Calculate slides in view based on window width for responsiveness
            let slidesInView = 1; // Default for mobile
            if (window.innerWidth >= 640) slidesInView = 2; // sm breakpoint
            if (window.innerWidth >= 1024) slidesInView = 3; // lg breakpoint
            if (window.innerWidth >= 1280) slidesInView = 5; // xl breakpoint (if applicable)

            const containerWidth = homeEasyRegisterSwiperWrapper.offsetWidth;
            const totalSlideWidth = homeEasyRegisterSlides[0].offsetWidth + parseFloat(getComputedStyle(homeEasyRegisterSlides[0]).marginRight || 0); // Assuming consistent slide width + margin
            // If slides don't have uniform width, this needs to be more complex. For now, assuming similar width.

            // Calculate transform value based on percentage of container width
            // Instead of multiplying by slideWidth, calculate percentage based on first slide's width
            // This is a simpler way when slides have padding/margin within container, assuming flex-shrink: 0 and uniform slides.
            // If slides have variable width/margin, a more robust calculation is needed.
            const transformX = - (currentHomeEasyRegisterSlide * (containerWidth / slidesInView)); // Scroll by one "virtual" slide unit

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

// About Us Page Specific Logic
function initAboutUsSwiper() {
    console.log("[initAboutUsSwiper] Initializing About Us swiper.");
    // Check if the about page section is actually in the DOM
    if (!document.getElementById('about-page-section')) {
        console.log("[initAboutUsSwiper] About page section not found, skipping swiper init.");
        return;
    }

    const visionSwiperContainer = document.getElementById('vision-swiper-container');
    if (visionSwiperContainer) {
        const visionSwiperWrapper = visionSwiperContainer.querySelector('.swiper-wrapper');
        const visionSlides = visionSwiperWrapper.querySelectorAll('.swiper-slide');
        const prevVisionBtn = document.getElementById('about-us-prev-vision-card');
        const nextVisionBtn = document.getElementById('about-us-next-vision-card');
        let currentVisionSlide = 0;

        function updateVisionSwiper() {
            if (!visionSwiperWrapper || !visionSlides.length) return;
            const slidesInView = 1; // Always 1 slide in view for this swiper based on design
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

// Weather Page Specific Logic
// These functions are assumed to be present in weather.js and exposed globally (e.g., window.initWeatherTypesSwiper = initWeatherTypesSwiper;)
// so script.js can call them after the weather.html content is loaded.
// If weather.js is not loaded, these calls will safely do nothing.


// Initial load logic when script.js first runs
// Get initial page from URL hash (e.g., #about) or default to 'home'
const initialPage = window.location.hash ? window.location.hash.substring(1) : 'home';
updateNavBar(); // Set initial nav bar state based on currentUserRole
loadPage(initialPage); // Load the initial page content and CSS
