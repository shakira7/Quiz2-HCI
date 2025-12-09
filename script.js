/* =========================================
   1. CATEGORY FILTER LOGIC
   ========================================= */

filterSelection("totebag");

function filterSelection(c) {
  var x, i;
  x = document.getElementsByClassName("lookbook-item");
  
  for (i = 0; i < x.length; i++) {
    removeClass(x[i], "show");
    
    if (x[i].className.indexOf(c) > -1) {
      addClass(x[i], "show");
    }
  }
}

function addClass(element, name) {
  var i, arr1, arr2;
  arr1 = element.className.split(" ");
  arr2 = name.split(" ");
  for (i = 0; i < arr2.length; i++) {
    if (arr1.indexOf(arr2[i]) == -1) {element.className += " " + arr2[i];}
  }
}

function removeClass(element, name) {
  var i, arr1, arr2;
  arr1 = element.className.split(" ");
  arr2 = name.split(" ");
  for (i = 0; i < arr2.length; i++) {
    while (arr1.indexOf(arr2[i]) > -1) {
      arr1.splice(arr1.indexOf(arr2[i]), 1);     
    }
  }
  element.className = arr1.join(" ");
}

var btnContainer = document.querySelector(".category-nav");
if (btnContainer) {
    var btns = btnContainer.getElementsByClassName("filter-btn");
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function(){
        var current = btnContainer.getElementsByClassName("active");
        if (current.length > 0) {
            current[0].className = current[0].className.replace(" active", "");
        }
        this.className += " active";
      });
    }
}


/* =========================================
   2. PAGE FADE-IN EFFECT
   ========================================= */

document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
        document.body.style.opacity = '1';
    }, 400); 
    updateCartDisplay();
});

document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === 'visible') {
        const body = document.body;
        body.style.animation = 'none';
        body.offsetHeight; 
        body.style.animation = 'fadeInPage 0.4s ease-out forwards';
    }
});


/* =========================================
   3. PRODUCT POPUP LOGIC (+ Quantity)
   ========================================= */

let currentPopupQty = 1; 

function openPopup(element) {
    var popup = document.getElementById("miniPopup");
    
    // Reset Quantity to 1
    currentPopupQty = 1;
    document.getElementById("popupQty").innerText = "1";

    // Get data
    var imgSrc = element.querySelector("img").src;
    var title = element.querySelector("h3").innerText;
    var price = element.querySelector(".price-data").innerText;
    var desc = element.querySelector(".desc-data").innerHTML;
    
    // Inject data
    document.getElementById("popupImg").src = imgSrc;
    document.getElementById("popupTitle").innerText = title;
    document.getElementById("popupPrice").innerText = price;
    document.getElementById("popupDetails").innerHTML = desc;
    
    // Show popup
    popup.style.display = "block";
}

function closePopup() {
    document.getElementById("miniPopup").style.display = "none";
}

function changePopupQty(change) {
    currentPopupQty += change;
    if (currentPopupQty < 1) currentPopupQty = 1; 
    document.getElementById("popupQty").innerText = currentPopupQty;
}


/* =========================================
   4. SHOPPING CART LOGIC (With Storage)
   ========================================= */

// Load from Storage or start empty
let cart = JSON.parse(sessionStorage.getItem("shoppingCart")) || [];

// Save to Storage Helper
function saveCart() {
    sessionStorage.setItem("shoppingCart", JSON.stringify(cart));
}

function openCart() {
    document.getElementById("cartSidebar").classList.add("open");
    document.querySelector(".cart-overlay").style.display = "block";
    document.body.style.overflow = "hidden"; 
}

function closeCart() {
    document.getElementById("cartSidebar").classList.remove("open");
    document.querySelector(".cart-overlay").style.display = "none";
    document.body.style.overflow = "auto"; 
}

function addToCart() {
    let title = document.getElementById("popupTitle").innerText;
    let priceText = document.getElementById("popupPrice").innerText;
    let imgSrc = document.getElementById("popupImg").src;

    let existingItem = cart.find(item => item.title === title);

    if (existingItem) {
        existingItem.qty += currentPopupQty;
    } else {
        let product = {
            title: title,
            price: priceText,
            img: imgSrc,
            qty: currentPopupQty, 
            id: Date.now() 
        };
        cart.push(product);
    }

    saveCart(); // <--- SAVE
    updateCartDisplay();
    closePopup(); 
    openCart();   
}

function changeCartQty(id, change) {
    let item = cart.find(x => x.id === id);
    if (item) {
        item.qty += change;
        if (item.qty <= 0) {
            removeFromCart(id);
        } else {
            saveCart(); // <--- SAVE
            updateCartDisplay();
        }
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart(); // <--- SAVE
    updateCartDisplay();
}

function updateCartDisplay() {
    let cartItemsContainer = document.querySelector(".cart-items");
    let totalElement = document.querySelector(".cart-footer .total span:last-child");
    let countElement = document.querySelector(".cart-header h2");

    // Safety check if cart HTML doesn't exist on page
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";
    let totalPrice = 0;
    let totalCount = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
        countElement.innerText = "Your Cart (0)";
        totalElement.innerText = "IDR 0";
        return;
    }

    cart.forEach(item => {
        let cleanPrice = parseInt(item.price.replace(/[^0-9]/g, ''));
        totalPrice += (cleanPrice * item.qty);
        totalCount += item.qty;

        let cartItem = document.createElement("div");
        cartItem.classList.add("cart-item-card");
        
        cartItem.innerHTML = `
            <img src="${item.img}" alt="product">
            <div class="cart-item-info">
                <h4>${item.title}</h4>
                <p>${item.price}</p>
                <div class="qty-selector" style="margin-top: 5px; transform: scale(0.8); transform-origin: left;">
                    <button onclick="changeCartQty(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button onclick="changeCartQty(${item.id}, 1)">+</button>
                </div>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">
                <i class='bx bx-trash'></i>
            </button>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    let formattedTotal = totalPrice.toLocaleString('en-US'); 
    totalElement.innerText = "IDR " + formattedTotal;
    countElement.innerText = `Your Cart (${totalCount})`;
}


/* =========================================
   5. HORIZONTAL SCROLL WITH MOUSE WHEEL
   ========================================= */

const scrollContainer = document.querySelector(".product-grid");

if (scrollContainer) {
    scrollContainer.addEventListener("wheel", (evt) => {
        evt.preventDefault();
        scrollContainer.scrollLeft += evt.deltaY;
    });
}


/* =========================================
   6. CHECKOUT LOGIC
   ========================================= */

function checkout() {
    // Safety Check: Is the cart empty?
    if (cart.length === 0) {
        alert("Your cart is empty! Add some cute stuff first. :3");
        return; 
    }
    
    // Go to Payment Page
    window.location.href = 'payment.html';
}



/* =========================================
   7. SEND ORDER TO GOOGLE SHEETS (GET METHOD)
   ========================================= */

function processOrder(event) {
    event.preventDefault(); 
    
    // YOUR URL
    const scriptURL = 'https://script.google.com/macros/s/AKfycbz5zNxM41vYmey7FLQ3J_B4BGVQA19pPB94EUMz-FX3vSKTByM1JyWUKJgGspAn1DAC/exec';

    const form = document.getElementById('paymentForm');
    const submitBtn = document.querySelector('.pay-btn');

    // Show Loading
    submitBtn.innerText = "Processing...";
    submitBtn.disabled = true;

    // Create Data
    let data = new FormData(form);

    // Add Cart Details
    let orderDetails = cart.map(item => `${item.title} (x${item.qty})`).join(", ");
    
    // SAFETY CHECK: If summaryTotal doesn't exist, calculate it now
    let totalElement = document.getElementById("summaryTotal");
    let totalPriceString = "IDR 0";
    
    if (totalElement) {
        totalPriceString = totalElement.innerText;
    } else {
        // Fallback calculation
        let calcTotal = 0;
        cart.forEach(item => {
            let cleanPrice = parseInt(item.price.replace(/[^0-9]/g, ''));
            calcTotal += (cleanPrice * item.qty);
        });
        totalPriceString = "IDR " + calcTotal.toLocaleString('en-US');
    }

    data.append("Order Details", orderDetails);
    data.append("Total Price", totalPriceString);

    // Send Data
    const queryString = new URLSearchParams(data).toString();

    fetch(`${scriptURL}?${queryString}`, { method: "GET", mode: "no-cors" })
        .then(() => {
            alert("Success! Your order has been recorded. :3");
            cart = [];
            saveCart();
            window.location.href = "index.html";
        })
        .catch(error => {
            console.error('Error!', error.message);
            alert("Something went wrong.");
            submitBtn.innerText = "Confirm Payment";
            submitBtn.disabled = false;
        });
}



/* =========================================
   8. HELPER: CALCULATE TOTAL FOR PAYMENT PAGE
   ========================================= */

function calculateHiddenTotal() {
    let totalPrice = 0;
    
    // Loop through cart to calculate total
    cart.forEach(item => {
        let cleanPrice = parseInt(item.price.replace(/[^0-9]/g, ''));
        totalPrice += (cleanPrice * item.qty);
    });

    // Update the hidden HTML element
    let totalElement = document.getElementById("summaryTotal");
    if (totalElement) {
        totalElement.innerText = "IDR " + totalPrice.toLocaleString('en-US');
    }
}




/* =========================================
   9. HAMBURGER MENU LOGIC (Fixed)
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-links");
    
    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            // 1. Toggle Menu
            navMenu.classList.toggle("active");

            // 2. Toggle Icon
            const icon = hamburger.querySelector("i");
            if (navMenu.classList.contains("active")) {
                icon.classList.remove("bx-menu");
                icon.classList.add("bx-x");
            } else {
                icon.classList.remove("bx-x");
                icon.classList.add("bx-menu");
            }
        });

        // 3. Close when clicking a link
        document.querySelectorAll(".nav-links a").forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("active");
                const icon = hamburger.querySelector("i");
                icon.classList.remove("bx-x");
                icon.classList.add("bx-menu");
            });
        });
    }
});