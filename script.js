let cart = {};
let productData = {};

// Fetch product data from the data2.json file
function fetchProductData() {
  fetch("data2.json") // Make sure the file path is correct
    .then((response) => response.json())
    .then((data) => {
      productData = data;
      renderProducts(); // Render products after fetching data
    })
    .catch((error) => console.error("Error fetching data:", error));
}

// Render all products on the page
function renderProducts() {
  const productContainer = document.getElementById("products");
  productContainer.innerHTML = "";

  productData.categories.forEach((category) => {
    // Create a category header
    const categoryHeader = document.createElement("h2");
    categoryHeader.classList.add("categoryHeader");
    categoryHeader.innerText = category.name;
    productContainer.appendChild(categoryHeader);

    const productWrapper = document.createElement("div");
    productWrapper.classList.add("product-wrapper");

    category.items.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.classList.add("product-card");
      productCard.innerHTML = `
      <div class="image">Product image</div>
      <h3 class="productName">${product.name}</h3>
      <p class="unit">${product.unit}</p>
      
      <div class="quantity-controls-wrapper">
        <p>₹${product.price}</p>
        <div class="quantity-controls" id="controls-${product.id}">
         ${
           !cart[product.id]
             ? `<button onclick="addToCart(${product.id})" class="addBtn" id="add-${product.id}">Add</button>`
             : ""
         }
        </div>
      </div>
      `;
      productWrapper.appendChild(productCard);
    });

    // Append the product wrapper after all products in the category are rendered
    productContainer.appendChild(productWrapper);
  });
}

function addToCart(productId) {
  const product = findProduct(productId);
  if (!product) return;

  // Add product to the cart with initial quantity of 1
  cart[productId] = { quantity: 1, product: product };

  // Update the quantity display and replace the "Add" button with the increment/decrement buttons
  const controlsDiv = document.getElementById(`controls-${productId}`);
  controlsDiv.innerHTML = `
    <div class="quantityBtn">
      <button onclick="decrementQuantity(${productId})">-</button>
      <span id="quantity-${productId}">1</span>
      <button onclick="incrementQuantity(${productId})">+</button>
    </div>
    `;
}

function incrementQuantity(productId) {
  const product = findProduct(productId);
  if (!product) return;

  if (!cart[productId]) {
    cart[productId] = { quantity: 0, product: product };
  }
  cart[productId].quantity += 1;
  document.getElementById(`quantity-${productId}`).innerText =
    cart[productId].quantity;
}

function decrementQuantity(productId) {
  if (cart[productId]) {
    cart[productId].quantity -= 1;
    if (cart[productId].quantity <= 0) {
      delete cart[productId];
      const controlsDiv = document.getElementById(`controls-${productId}`);
      controlsDiv.innerHTML = `<button onclick="addToCart(${productId})" class="addBtn" id="add-${productId}">Add</button>`;
    } else {
      document.getElementById(`quantity-${productId}`).innerText =
        cart[productId].quantity;
    }
  }
}

// Find product by its ID
function findProduct(productId) {
  for (let category of productData.categories) {
    for (let product of category.items) {
      if (product.id === productId) {
        return product;
      }
    }
  }
  return null;
}

// Show the cart modal and display all cart items
function showCart() {
  const cartItemsContainer = document.getElementById("cartItems");
  cartItemsContainer.innerHTML = "";

  let totalBill = 0;

  if (Object.keys(cart).length === 0) {
    cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
  } else {
    Object.values(cart).forEach((cartItem) => {
      const itemTotal = cartItem.product.price * cartItem.quantity;
      totalBill += itemTotal;

      const cartItemDiv = document.createElement("div");
      cartItemDiv.classList.add("cart-item");
      cartItemDiv.innerHTML = `
          <img src="${cartItem.product.image}" alt="${cartItem.product.name}">
          <p>${cartItem.product.name}</p>
          
          <p class="itemTotal">₹${itemTotal}</p>
        `;
      cartItemsContainer.appendChild(cartItemDiv);
    });

    // Update total
    document.getElementById("totalBill").innerText = `₹${totalBill + 27}`; // 27 = Delivery + Handling
    document.getElementById("grandTotal").innerText = `${totalBill + 27}`;
  }

  document.getElementById("cartModal").style.display = "block"; // Show the modal
}

// Close the cart modal
function closeModal() {
  document.getElementById("cartModal").style.display = "none";
}


// Show confirmation modal
function showConfirmationModal() {
  // Set the total amount in confirmation modal
  closeModal()
  const grandTotal = document.getElementById("grandTotal").innerText;
  document.getElementById("orderTotal").innerText = grandTotal;

  // Show the confirmation modal
  document.getElementById("confirmationModal").style.display = "block";
}

// Close confirmation modal
function closeConfirmationModal() {
  document.getElementById("confirmationModal").style.display = "none";
}

// Attach event listeners
document.getElementById("openCartBtn").addEventListener("click", showCart);
document.querySelector(".close-btn").addEventListener("click", closeModal);
document.getElementById("proceedButton").addEventListener("click", showConfirmationModal);
document.querySelector(".close-btn-confirmation").addEventListener("click", closeConfirmationModal);
document.getElementById("closeConfirmationButton").addEventListener("click", closeConfirmationModal);



// Filter products based on the search query
function searchProducts(query) {
  const searchResults = document.getElementById("searchResults");
  searchResults.innerHTML = ""; // Clear previous search results

  if (!query) {
    searchResults.style.display = "none"; // Hide results if query is empty
    return;
  }

  const lowercaseQuery = query.toLowerCase();
  let foundProducts = [];

  productData.categories.forEach((category) => {
    const matchedItems = category.items.filter((product) =>
      product.name.toLowerCase().includes(lowercaseQuery)
    );

    if (matchedItems.length > 0) {
      foundProducts = [...foundProducts, ...matchedItems];
    }
  });

  if (foundProducts.length === 0) {
    searchResults.innerHTML = "<p>No products found</p>";
    searchResults.style.display = "block";
  } else {
    foundProducts.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.classList.add("product-card");
      productCard.innerHTML = `
      <div class="image">Product image</div>
      
      <h3 class="productName">${product.name}</h3>
      <p class="unit">${product.unit}</p>
      
      <div class="quantity-controls-wrapper">
        <p>₹${product.price}</p>
        <div class="quantity-controls" id="controls-${product.id}">
         ${
           !cart[product.id]
             ? `<button onclick="addToCart(${product.id})" class="addBtn" id="add-${product.id}">Add</button>`
             : ""
         }
        </div>

      </div>
      `;
      searchResults.appendChild(productCard);
    });

    searchResults.style.display = "flex"; // Show results if products found
  }
}

// Event listener for search input
document.getElementById("searchInput").addEventListener("input", (event) => {
  const query = event.target.value;
  searchProducts(query);
});



// Fetch data and render products on page load
fetchProductData();