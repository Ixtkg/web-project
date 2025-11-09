// ✅ ตรวจสอบให้แน่ใจว่า Firebase ถูกโหลดก่อน
window.addEventListener("DOMContentLoaded", () => {
  // ดึงฟังก์ชัน Firebase Auth จาก window ที่เรากำหนดไว้ใน <script type="module"> ของ HTML
  const auth = window.auth;
  const {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged,
  } = window.firebaseAuthFunctions;

  // ----------------------------------------------------------------------
  // 🚨 Modal / Alert
  // ----------------------------------------------------------------------
  const modalOverlay = document.getElementById("modal-overlay");
  const modalMessage = document.getElementById("modal-message");

  function showModal(message) {
    modalMessage.textContent = message;
    modalOverlay.style.display = "flex";
  }

  window.closeModal = function () {
    modalOverlay.style.display = "none";
  };

  // ----------------------------------------------------------------------
  // 🧭 การจัดการ UI / การสลับหน้า
  // ----------------------------------------------------------------------
  const mainPage = document.getElementById("main-page");
  const authPage = document.getElementById("auth-page");
  const authTitle = document.getElementById("auth-title");
  const authForm = document.getElementById("auth-form");
  const userInfoDiv = document.getElementById("user-info");
  const userEmailDisplay = document.getElementById("user-email-display");
  const loginIcon = document.getElementById("login-icon");

  window.navigateTo = function (pageId) {
    if (pageId === "main") {
      mainPage.style.display = "block";
      authPage.style.display = "none";
    } else if (pageId === "login") {
      mainPage.style.display = "none";
      authPage.style.display = "flex";
      updateAuthUI(auth.currentUser);
    }
  };

  window.goBackFromAuth = function () {
    navigateTo("main");
  };

  function updateAuthUI(user) {
    if (user) {
      // ผู้ใช้ล็อกอินแล้ว
      authTitle.textContent = "ข้อมูลผู้ใช้";
      userEmailDisplay.textContent = user.email;
      authForm.style.display = "none";
      userInfoDiv.style.display = "block";
      loginIcon.textContent = "👋";
      loginIcon.onclick = () => navigateTo("login");
    } else {
      // ผู้ใช้ยังไม่ล็อกอิน
      authTitle.textContent = "เข้าสู่ระบบ / สมัครสมาชิก";
      authForm.style.display = "block";
      userInfoDiv.style.display = "none";
      loginIcon.textContent = "👤";
      loginIcon.onclick = (e) => {
        e.preventDefault();
        navigateTo("login");
      };
    }
  }

  // ----------------------------------------------------------------------
  // 🔥 ฟังก์ชัน Firebase Authentication
  // ----------------------------------------------------------------------
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  function getAuthCredentials() {
    return {
      email: emailInput.value.trim(),
      password: passwordInput.value.trim(),
    };
  }

  window.signup = async function () {
    const { email, password } = getAuthCredentials();
    if (!email || !password) {
      showModal("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      showModal("สมัครสมาชิกสำเร็จ! ยินดีต้อนรับ 🎉");
    } catch (error) {
      let msg = "เกิดข้อผิดพลาดในการสมัครสมาชิก: ";
      if (error.code === "auth/email-already-in-use")
        msg = "อีเมลนี้ถูกใช้แล้ว ลองเข้าสู่ระบบ";
      else if (error.code === "auth/weak-password")
        msg = "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
      else msg += error.message;
      showModal(msg);
      console.error("Signup Error:", error);
    }
  };

  window.login = async function () {
    const { email, password } = getAuthCredentials();
    if (!email || !password) {
      showModal("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showModal("เข้าสู่ระบบสำเร็จ!");
      navigateTo("main");
    } catch (error) {
      let msg = "เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ";
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      )
        msg = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
      else msg += error.message;
      showModal(msg);
      console.error("Login Error:", error);
    }
  };

  window.logout = async function () {
    try {
      await signOut(auth);
      showModal("ออกจากระบบสำเร็จแล้ว 👋");
      navigateTo("main");
    } catch (error) {
      showModal("เกิดข้อผิดพลาดในการออกจากระบบ: " + error.message);
      console.error("Logout Error:", error);
    }
  };

  window.resetPassword = async function () {
    const email = emailInput.value.trim();
    if (!email) {
      showModal("กรุณากรอกอีเมลที่ต้องการรีเซ็ตรหัสผ่าน");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      showModal(`ส่งลิงก์รีเซ็ตรหัสผ่านไปยัง ${email} แล้ว`);
    } catch (error) {
      let msg = "เกิดข้อผิดพลาดในการส่งอีเมลรีเซ็ตรหัสผ่าน: ";
      if (error.code === "auth/user-not-found") msg = "ไม่พบผู้ใช้นี้";
      else msg += error.message;
      showModal(msg);
      console.error("Reset Password Error:", error);
    }
  };

  // ----------------------------------------------------------------------
  // 👂 ตัวฟังสถานะการล็อกอินของ Firebase
  // ----------------------------------------------------------------------
  onAuthStateChanged(auth, (user) => {
    updateAuthUI(user);
  });
});
