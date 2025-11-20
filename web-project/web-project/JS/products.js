// products.js - จัดการข้อมูลสินค้า

let products = [];

async function loadProducts() {
  const res = await fetch('../JS/products.json');
  products = await res.json();
  return products;
}

window.addEventListener("DOMContentLoaded", async () => {
  await loadProducts();
  displayProducts();
  updateCartBadge();
});

window.addEventListener("DOMContentLoaded", async () => {
  await loadProducts();   // ← โหลด JSON ก่อน

  const currentPage = window.location.pathname;

  if (currentPage.includes("2all_product_showing_page2.html")) {
    displayProducts();
  } else if (currentPage.includes("3cookequip.html")) {
    displayProducts("CookingEquipment");
  } else if (currentPage.includes("4preparetool.html")) {
    displayProducts("PreparationTools");
  } else if (currentPage.includes("5tableware.html")) {
    displayProducts("Tableware");
  } else if (currentPage.includes("6cleaningtool.html")) {
    displayProducts("CleaningTools");
  } else if (currentPage.includes("7storageequip.html")) {
    displayProducts("StorageEquipment");
  }

  updateCartBadge();
});




// แสดงสินค้าทั้งหมดในหน้า
function displayProducts(filterCategory = null) {
  const productGrid = document.getElementById("product-grid");
  if (!productGrid) return;

  // กรองสินค้าตามหมวดหมู่ถ้ามีการระบุ
  const filteredProducts = filterCategory
    ? products.filter((p) => p.category === filterCategory)
    : products;

  // สร้าง HTML สำหรับแต่ละสินค้า
  productGrid.innerHTML = filteredProducts
    .map(
      (product) => `
    <div class="product-card" onclick="viewProduct(${product.id})">
      <img src="${product.image}" alt="${product.name}" class="product-image" />
      <h3>${product.name}</h3>
      <p class="product-category">${getCategoryName(product.category)}</p>
      <p class="product-price">฿${product.price.toLocaleString()}</p>
      <button class="add-to-cart-btn" onclick="addToCart(${product.id}, event)">
        เพิ่มลงตะกร้า
      </button>
    </div>
  `
    )
    .join("");
}

// แปลงชื่อหมวดหมู่เป็นภาษาไทย
function getCategoryName(category) {
  const categoryNames = {
    CookingEquipment: "อุปกรณ์ปรุงอาหาร",
    PreparationTools: "อุปกรณ์เตรียมอาหาร",
    Tableware: "ชุดรับประทานอาหาร",
    CleaningTools: "อุปกรณ์ทำความสะอาด",
    StorageEquipment: "อุปกรณ์จัดเก็บ"
  };
  return categoryNames[category] || category;
}

// ดูรายละเอียดสินค้า (เปิดในแท็บใหม่)
function viewProduct(productId) {
  // เปิดหน้ารายละเอียดในแท็บใหม่
  window.open(`product-detail.html?id=${productId}`, "_blank");
}

// เพิ่มสินค้าลงตะกร้า
function addToCart(productId, event) {
  // ป้องกันไม่ให้คลิกผ่านไปที่ card
  if (event) {
    event.stopPropagation();
  }

  const product = products.find((p) => p.id === productId);
  if (!product) return;

  // ดึงตะกร้าจาก localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // ตรวจสอบว่ามีสินค้านี้อยู่แล้วหรือไม่
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  // บันทึกกลับไปที่ localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  // อัปเดตจำนวนในตะกร้า
  updateCartBadge();

  // แสดงข้อความแจ้งเตือน
  showModal(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว`);
}

// อัปเดตตัวเลขจำนวนสินค้าในตะกร้า
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const badge = document.getElementById("cart-badge");
  
  if (!badge) return;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (totalItems > 0) {
    badge.textContent = totalItems;
    badge.style.display = "flex";
  } else {
    badge.style.display = "none";
  }
}

// เรียกใช้เมื่อโหลดหน้า
window.addEventListener("DOMContentLoaded", () => {
  // ตรวจสอบว่าอยู่ในหน้าไหน
  const currentPage = window.location.pathname;

  if (currentPage.includes("2all_product_showing_page2.html")) {
    displayProducts();
  } else if (currentPage.includes("3cookequip.html")) {
    displayProducts("CookingEquipment");
  } else if (currentPage.includes("4preparetool.html")) {
    displayProducts("PreparationTools");
  } else if (currentPage.includes("5tableware.html")) {
    displayProducts("Tableware");
  } else if (currentPage.includes("6cleaningtool.html")) {
    displayProducts("CleaningTools");
  } else if (currentPage.includes("7storageequip.html")) {
    displayProducts("StorageEquipment");
  }

  // อัปเดต badge เมื่อโหลดหน้า
  updateCartBadge();
});

// Export ฟังก์ชันให้ใช้ได้ทั่วทั้งเว็บ
window.viewProduct = viewProduct;
window.addToCart = addToCart;
window.products = products;
// ฟังก์ชันค้นหาสินค้า
function searchProduct() {
  const query = document.getElementById("search-input").value.toLowerCase();

  if (!query) {
    displayProducts(); 
    return;
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query)
  );

  displayProductsList(filtered);
}

// ฟังก์ชันแสดงสินค้าที่ค้นหา
function displayProductsList(list) {
  const container = document.getElementById("product-grid");

  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `
      <p style="text-align:center; padding:20px; font-size:20px;">
        ❌ ไม่พบสินค้าที่ค้นหา
      </p>`;
    return;
  }

  container.innerHTML = list
    .map(product => `
      <div class="product-card">
        <div class="product-image" onclick="viewProduct(${product.id})">
          <img src="${product.image}" alt="${product.name}" />
        </div>
        <h3>${product.name}</h3>
        <p class="product-category">${getCategoryName(product.category)}</p>
        <p class="product-price">฿${product.price.toLocaleString()}</p>
        <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
          เพิ่มลงตะกร้า
        </button>
      </div>
    `)
    .join("");
}

// export ฟังก์ชัน
window.searchProduct = searchProduct;
