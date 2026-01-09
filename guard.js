// ===== Basic anti-save / anti-copy (soft deterrent) =====
document.addEventListener("contextmenu", (e) => e.preventDefault());

document.addEventListener("dragstart", (e) => {
  if (e.target && e.target.tagName === "IMG") e.preventDefault();
});

// บล็อกคีย์ลัดที่ใช้บ่อย (กันได้ระดับหนึ่ง)
document.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();

  // Print / Save / View source / DevTools (soft block)
  if ((e.ctrlKey || e.metaKey) && ["p","s","u"].includes(k)) {
    e.preventDefault();
  }
  if (e.key === "PrintScreen") {
    e.preventDefault();
  }
  // DevTools shortcuts (Chrome/Edge)
  if (e.ctrlKey && e.shiftKey && ["i","j","c"].includes(k)) {
    e.preventDefault();
  }
  if (e.key === "F12") e.preventDefault();
});
