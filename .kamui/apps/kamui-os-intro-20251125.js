const slides = Array.from(document.querySelectorAll(".slide"));
const totalSlides = slides.length;
let currentSlide = 0;

const slideNumberEl = document.getElementById("slideNumber");
const slideListEl = document.getElementById("slideList");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const sidebarEl = document.getElementById("sidebar");
const toggleSidebarBtn = document.getElementById("toggleSidebar");
const downloadAllBtn = document.getElementById("downloadAllBtn");
const chevronEl = toggleSidebarBtn.querySelector(".chevron");
const slideContainer = document.querySelector(".slide-container");
const slideListButtons = [];

function showToast(message, variant = "neutral") {
  const palette = {
    neutral: { bg: "#111827", text: "#ffffff" },
    success: { bg: "#065f46", text: "#ecfdf5" },
    warning: { bg: "#92400e", text: "#fff7ed" },
  };

  const colors = palette[variant] || palette.neutral;
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 24px;
        background: ${colors.bg};
        color: ${colors.text};
        padding: 12px 20px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.25s ease;
    `;

  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 2200);
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function getImageDimensions(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function getDataUrlType(dataUrl) {
  const match = /^data:image\/([a-zA-Z0-9+]+);/i.exec(dataUrl);
  return match ? match[1].toUpperCase() : "PNG";
}

function formatTimestamp() {
  return new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .replace("Z", "");
}

function renderSlideList() {
  slides.forEach((slide, index) => {
    const label = slide.querySelector("img")?.alt || `スライド ${index + 1}`;
    const listItem = document.createElement("li");
    const button = document.createElement("button");

    button.className = "slide-list-item";
    button.type = "button";
    button.setAttribute("data-index", index);
    button.title = label;
    button.innerHTML = `
            <span class="slide-number">${index + 1}</span>
            <span class="slide-label">${label}</span>
        `;
    button.addEventListener("click", () => showSlide(index));

    listItem.appendChild(button);
    slideListEl.appendChild(listItem);
    slideListButtons.push(button);
  });
}

function updateActiveIndicator() {
  slideListButtons.forEach((button, index) => {
    button.classList.toggle("active", index === currentSlide);
  });

  const activeButton = slideListButtons[currentSlide];
  if (activeButton) {
    activeButton.scrollIntoView({ block: "nearest" });
  }
}

function showSlide(nextIndex) {
  slides[currentSlide].classList.remove("active");
  currentSlide = (nextIndex + totalSlides) % totalSlides;
  slides[currentSlide].classList.add("active");
  slideNumberEl.textContent = `${currentSlide + 1} / ${totalSlides}`;
  updateActiveIndicator();
}

function changeSlide(direction) {
  showSlide(currentSlide + direction);
}

function setSidebarCollapsed(collapsed) {
  sidebarEl.classList.toggle("collapsed", collapsed);
  toggleSidebarBtn.setAttribute("aria-expanded", (!collapsed).toString());
  chevronEl.textContent = collapsed ? "▶" : "◀";
}

function toggleSidebar() {
  setSidebarCollapsed(!sidebarEl.classList.contains("collapsed"));
}

function initializeSidebarState() {
  const shouldCollapse = window.innerWidth < 1100;
  setSidebarCollapsed(shouldCollapse);
}

renderSlideList();
initializeSidebarState();
showSlide(0);

prevBtn.addEventListener("click", () => changeSlide(-1));
nextBtn.addEventListener("click", () => changeSlide(1));
toggleSidebarBtn.addEventListener("click", toggleSidebar);

window.addEventListener("resize", () => {
  if (window.innerWidth < 1100 && !sidebarEl.classList.contains("collapsed")) {
    setSidebarCollapsed(true);
  }
});

// キーボードナビゲーション
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") changeSlide(-1);
  if (event.key === "ArrowRight") changeSlide(1);
});

// クリックナビゲーション（右半分をクリックで次へ、左半分で前へ）
slideContainer.addEventListener("click", (event) => {
  if (event.target.closest(".navigation")) return;
  const clickX = event.clientX;
  const { innerWidth } = window;

  if (clickX > innerWidth / 2) {
    changeSlide(1);
  } else {
    changeSlide(-1);
  }
});

// 全スライドダウンロード機能
if (downloadAllBtn) {
  downloadAllBtn.addEventListener("click", async () => {
    const jspdfNamespace = window.jspdf || {};
    const jsPDF = jspdfNamespace.jsPDF;

    if (typeof jsPDF === "undefined") {
      showToast("PDFライブラリの読み込みに失敗しました", "warning");
      return;
    }

    downloadAllBtn.disabled = true;
    downloadAllBtn.setAttribute("aria-busy", "true");

    let pdfDoc = null;
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < slides.length; i++) {
      const img = slides[i].querySelector("img");
      if (!img) continue;

      const imgUrl = img.src;

      try {
        const response = await fetch(imgUrl, { mode: "cors" });
        if (!response.ok) throw new Error(`status ${response.status}`);
        const blob = await response.blob();
        const dataUrl = await blobToDataUrl(blob);
        const { width, height } = await getImageDimensions(dataUrl);

        const orientation = width >= height ? "landscape" : "portrait";

        if (!pdfDoc) {
          pdfDoc = new jsPDF({
            orientation,
            unit: "px",
            format: [width, height],
          });
        } else {
          pdfDoc.addPage([width, height], orientation);
        }

        pdfDoc.addImage(dataUrl, getDataUrlType(dataUrl), 0, 0, width, height);

        successCount += 1;
      } catch (error) {
        console.error(`スライド ${i + 1} のダウンロードに失敗しました:`, error);
        failureCount += 1;
      }
    }

    if (successCount > 0 && pdfDoc) {
      const timestamp = formatTimestamp();
      pdfDoc.save(`kamui-slides_${timestamp}.pdf`);
      showToast(`${successCount}ページのPDFを保存しました`, "success");
    } else {
      showToast("ダウンロードできるスライドがありません", "warning");
    }

    if (failureCount > 0) {
      showToast(`${failureCount}枚の取得に失敗しました`, "warning");
    }

    downloadAllBtn.disabled = false;
    downloadAllBtn.removeAttribute("aria-busy");
  });
}

// 画像右クリックでフルパスをコピー
slides.forEach((slide) => {
  const img = slide.querySelector("img");
  if (!img) return;

  img.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    const imgUrl = img.src;

    if (!navigator.clipboard) {
      showToast("クリップボード非対応のブラウザです", "warning");
      return;
    }

    navigator.clipboard
      .writeText(imgUrl)
      .then(() => {
        img.style.outline = "3px solid #4ade80";
        setTimeout(() => {
          img.style.outline = "";
        }, 400);
        showToast("パスをコピーしました！", "success");
      })
      .catch((error) => {
        console.error("クリップボードへのコピーに失敗しました:", error);
        showToast("パスのコピーに失敗しました", "warning");
      });
  });
});
