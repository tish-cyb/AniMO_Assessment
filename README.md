# AniMoPH: Agricultural Innovation & Modern Opportunities for the Philippines

The AniMoPH system is a web application primarily designed to empower Filipino farmers and connect them with buyers, facilitating agricultural trade and information exchange. It leverages a Single Page Application (SPA) architecture for a smooth user experience.

## Pages & Features

This system features several dynamically loaded pages and interactive modal interfaces, catering to different user needs.

### Pages

-   **Landing Page** (Home)
-   **About Us Page**
-   **Weather Page** (Agricultural weather forecasts - placeholder)
-   **Loan Information Page** (Details on agricultural loans - placeholder)
-   **Agricultural Marketplace Page** (Buy and sell produce/products)
-   **Sell Product Page** (Farmer-specific access for listing items)
-   **User Profile Page**
-   **My Activity Page** (User-specific history/records)
-   **Government Updates Page** (Announcements and policies - placeholder)
-   **AniMo Services Page** (Overview of services offered by AniMoPH)
-   **Learning Hub Page** (Educational resources and guides)

#### Modal Interfaces
-   **Authentication System:** Comprehensive modal for role selection (Farmer, Buyer), user Login, Signup, and specialized RSBSA Farmer Login.
-   **Multi-Step Checkout Process:** An interactive modal guiding users through Cart review, Address selection, Order Summary, and Payment.

### Features

-   **Single Page Application (SPA) Architecture:** Dynamic page loading ensures seamless navigation without full page reloads.
-   **Role-Based User Experience:** Adapts navigation and features based on `Guest`, `Buyer`, or `Farmer` roles.
-   **Authentication System:** Includes dummy login/signup for general users and an RSBSA ID-based login for farmers.
-   **Product Marketplace:** Browse, add to cart, and manage agricultural products.
-   **Interactive Checkout Process:** A guided multi-stage checkout for placing orders.
-   **Responsive Design:** Optimized for various screen sizes (320px and above) using Tailwind CSS.
-   **Custom Modals:** Utilizes custom modal dialogs for authentication, checkout, and general messages, providing a consistent user interface.
-   **Page-Specific Interactions:** Integrates JavaScript for interactive elements such as content sliders (swipers) and dynamic form behaviors on relevant pages.
-   **Placeholder Content:** Various sections include clear placeholder content for future expansion (e.g., weather data, government updates, loan details).

## Technologies Used
-   **HTML5:** For content structuring.
-   **CSS3 (with Tailwind CSS):** For modern styling and responsive layout.
-   **JavaScript (Vanilla JS):** Drives all dynamic behavior, content loading, and user interactions.
-   **FontAwesome:** For rich iconography.
-   **Placeholder.co:** For dynamic image placeholders during development.

## Project Structure

AniMo_Assessment/
├── css/
│   ├── ... (individual page CSS files)
│   └── global.css            # Global/base styles
├── pages/
│   ├── about.html
│   ├── animoServicesPage.html
│   ├── governmentUpdatePage.html
│   ├── home.html
│   ├── learningHubPage.html
│   ├── loan.html
│   ├── MarketplacePage.html
│   ├── myActivityPage.html  
│   ├── profilePage.html
│   ├── sell.html
│   └── weather.html
├── images/                   # (Optional: for static image assets)
├── index.html                # The main entry point of the application
└── script.js                 # The global JavaScript file handling all application logic

## Getting Started

To get a local copy of this project up and running, follow these simple steps.

### Prerequisites
You only need a modern web browser (e.g., Chrome, Firefox, Edge, Safari). No specific server environment is required as it's a client-side application.

### Installation
1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/AniMoPH.git](https://github.com/your-username/AniMoPH.git)
    ```
    (Replace `your-username/AniMoPH.git` with the actual path to your repository)
2.  **Navigate to the project directory:**
    ```bash
    cd AniMoPH
    ```
3.  **Open `index.html`:**
    Simply open the `index.html` file in your web browser. You can usually do this by double-clicking the file or dragging it into a browser window.

## Usage

* **Navigate the Website:** Use the main navigation bar at the top to explore different sections. Observe how content loads dynamically.
* **Explore User Roles:**
    * Click the user icon in the top right to open the authentication modal.
    * **Farmer Login (Dummy):** Select "I'm a Farmer" and enter RSBSA ID: `11-024-03-0000-0000`.
    * **Buyer Login (Dummy):** Select "I'm a Buyer" and use Email: `buyer@example.com`, Password: `password123`.
    * Observe how the "SELL" link appears/disappears based on your role.
* **Simulate Checkout:** Click on a product (if available in the Marketplace) or the shopping cart icon to enter the multi-step checkout modal.
* **Test Responsiveness:** Resize your browser window or view on different devices to see the responsive layout in action.

## Contributing
We welcome contributions! If you have ideas for new features, bug fixes, or improvements, please feel free to:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Make your changes and commit them (`git commit -m 'Add Your Feature'`).
4.  Push to the branch (`git push origin feature/YourFeature`).
5.  Open a Pull Request.

## License
Distributed under the MIT License. See the `LICENSE` file in the repository for more details.


