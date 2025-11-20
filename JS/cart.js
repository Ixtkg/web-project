// cart.js - จัดการตะกร้าสินค้า

// เปิด/ปิด Cart Sidebar
function toggleCart() {
  const cartSidebar = document.getElementById("cart-sidebar");
  if (!cartSidebar) return;

  cartSidebar.classList.toggle("open");
  
  // โหลดข้อมูลตะกร้าเมื่อเปิด
  if (cartSidebar.classList.contains("open")) {
    displayCart();
  }
}

// แสดงสินค้าในตะกร้า
function displayCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartItemsDiv = document.getElementById("cart-items");
  const cartSummary = document.getElementById("cart-summary");
  const cartTotalPrice = document.getElementById("cart-total-price");

  if (!cartItemsDiv) return;

  // ถ้าตะกร้าว่าง
  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<div class="empty-cart">ตะกร้าสินค้าว่างเปล่า</div>';
    cartSummary.style.display = "none";
    return;
  }

  // คำนวณราคารวม
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // แสดงรายการสินค้า
  cartItemsDiv.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-image" />
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <p class="item-price">฿${(item.price * item.quantity).toLocaleString()}</p>
        <div class="cart-item-quantity">
          <button onclick="updateQuantity(${item.id}, -1)">-</button>
          <span>${item.quantity}</span>
          <button onclick="updateQuantity(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="remove-item-btn" onclick="removeFromCart(${item.id})">×</button>
    </div>
  `
    )
    .join("");

  // แสดงยอดรวม
  cartTotalPrice.textContent = `฿${totalPrice.toLocaleString()}`;
  cartSummary.style.display = "block";
}

// อัปเดตจำนวนสินค้า
  function updateQuantity(productId, change) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const item = cart.find((i) => i.id === productId);

  if (!item) return;

  item.quantity += change;

  // ถ้าจำนวนเป็น 0 หรือน้อยกว่า ให้ลบออก
  if (item.quantity <= 0) {
    cart = cart.filter((i) => i.id !== productId);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
  updateCartBadge();
}

// ลบสินค้าออกจากตะกร้า
function removeFromCart(productId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter((item) => item.id !== productId);
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
  updateCartBadge();
  showModal("ลบสินค้าออกจากตะกร้าแล้ว");
}

// ชำระเงิน
function checkout() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    showModal("ตะกร้าสินค้าว่างเปล่า");
    return;
  }

  // ตรวจสอบว่าผู้ใช้ล็อกอินหรือยัง
  const auth = window.auth;
  if (!auth || !auth.currentUser) {
    showModal("กรุณาเข้าสู่ระบบก่อนชำระเงิน");
    // เปลี่ยนไปหน้า login
    setTimeout(() => {
      closeModal();
      navigateTo("login");
    }, 2000);
    return;
  }

  // คำนวณราคารวม
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // จำลองการชำระเงิน (ในการใช้งานจริงควรเชื่อมต่อกับ Payment Gateway)
  const confirmCheckout = confirm(
    `ยืนยันการชำระเงิน\n\nจำนวนสินค้า: ${cart.length} รายการ\nยอดรวม: ฿${totalPrice.toLocaleString()}\n\nกด OK เพื่อยืนยัน`
  );

  if (confirmCheckout) {
    // ล้างตะกร้า
    localStorage.removeItem("cart");
    displayCart();
    updateCartBadge();
    toggleCart();
    
    showModal("🎉 สั่งซื้อสำเร็จ! ขอบคุณที่ใช้บริการ");

    // บันทึกคำสั่งซื้อลง Firebase (ถ้าต้องการ)
    // saveOrderToFirebase(cart, totalPrice);
  }
}

// บันทึกคำสั่งซื้อลง Firebase Firestore (ตัวอย่าง - ต้องเพิ่ม Firestore ก่อน)

async function saveOrderToFirebase(cart, totalPrice) {
  const auth = window.auth;
  if (!auth || !auth.currentUser) return;

  try {
    // ใช้ Firestore เพื่อบันทึกคำสั่งซื้อ
    const db = firebase.firestore();
    await db.collection("orders").add({
      userId: auth.currentUser.uid,
      email: auth.currentUser.email,
      items: cart,
      totalPrice: totalPrice,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      status: "pending"
    });
    console.log("บันทึกคำสั่งซื้อสำเร็จ");
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อ:", error);
  }
}


// Export ฟังก์ชัน
window.toggleCart = toggleCart;
window.displayCart = displayCart;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.checkout = checkout;

// อัปเดต badge เมื่อโหลดหน้า
window.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
});