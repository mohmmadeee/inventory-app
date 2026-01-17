/**
 * Shared Form Component Generator
 * Generates reusable form groups without breaking form IDs
 */

/**
 * Create a text input field
 * @param {string} id - Element ID
 * @param {string} label - Arabic label
 * @param {string} placeholder - Arabic placeholder
 * @param {boolean} required - Is field required
 * @returns {string} HTML string
 */
function createInput(id, label, placeholder, required = true) {
  const requiredAttr = required ? "required" : "";
  return `
    <div class="form-group">
      <label for="${id}">${label}</label>
      <input id="${id}" placeholder="${placeholder}" ${requiredAttr} />
    </div>
  `;
}

/**
 * Create a select dropdown field
 * @param {string} id - Element ID
 * @param {string} label - Arabic label
 * @param {Array} options - Array of {value, label} objects
 * @param {boolean} required - Is field required
 * @returns {string} HTML string
 */
function createSelect(id, label, options, required = true) {
  const requiredAttr = required ? "required" : "";
  const optionsHtml = options
    .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
    .join("\n                  ");

  return `
    <div class="form-group">
      <label for="${id}">${label}</label>
      <select id="${id}" ${requiredAttr}>
        ${optionsHtml}
      </select>
    </div>
  `;
}

/**
 * Location Type options (Directorate vs Health Centers)
 */
const LOCATION_TYPE_OPTIONS = [
  { value: "", label: "اختر نوع الموقع" },
  { value: "directorate", label: "مديرية الصحة" },
  { value: "health_center", label: "مركز صحي" },
];

/**
 * Location options - Health Centers only (shared across forms)
 */
const LOCATION_OPTIONS = [
  { value: "", label: "اختر الموقع" },
  { value: "الزرقاء الشامل الجديد", label: "الزرقاء الشامل الجديد" },
  { value: "الامير حمزة الشامل", label: "الامير حمزة الشامل" },
  { value: "الرصيفة الجديد", label: "الرصيفة الجديد" },
  { value: "اسكان الهاشمية", label: "اسكان الهاشمية" },
  { value: "الازرق الشامل", label: "الازرق الشامل" },
  { value: "الضليل الشامل", label: "الضليل الشامل" },
  { value: "المشيرفة الشامل", label: "المشيرفة الشامل" },
  { value: "حي الرشيد الشامل", label: "حي الرشيد الشامل" },
  { value: "بيرين الشامل", label: "بيرين الشامل" },
  { value: "وادي الحجر الشامل", label: "وادي الحجر الشامل" },
  { value: "خادم الحرمين الاولي", label: "خادم الحرمين الاولي" },
  { value: "ابو الزيغان الاولي", label: "ابو الزيغان الاولي" },
  { value: "الامير طلال الاولي", label: "الامير طلال الاولي" },
  { value: "البتراوي الاولي", label: "البتراوي الاولي" },
  { value: "ياجوز الاولي", label: "ياجوز الاولي" },
  { value: "الحلابات الشرقي الاولي", label: "الحلابات الشرقي الاولي" },
  { value: "الزواهرة الاولي", label: "الزواهرة الاولي" },
  { value: "السخنة الاولي", label: "السخنة الاولي" },
  { value: "العالوك الاولي", label: "العالوك الاولي" },
  { value: "الكمشة الاولي", label: "الكمشة الاولي" },
  { value: "النقب الاولي", label: "النقب الاولي" },
  { value: "الهاشمية الاولي", label: "الهاشمية الاولي" },
  { value: "جبل طارق الاولي", label: "جبل طارق الاولي" },
  { value: "الفلاح الاولي", label: "الفلاح الاولي" },
  { value: "عوجان الاولي", label: "عوجان الاولي" },
  { value: "اصلاح وتأهيل بيرين", label: "اصلاح وتأهيل بيرين" },
  { value: "اصلاح وتأهيل الهاشميه", label: "اصلاح وتأهيل الهاشميه" },
  { value: "صروت الاولي", label: "صروت الاولي" },
  { value: "حي الجندي الاولي", label: "حي الجندي الاولي" },
  { value: "ام الصليح الاولي", label: "ام الصليح الاولي" },
  { value: "ام رمانة الاولي", label: "ام رمانة الاولي" },
  { value: "جريبا الاولي", label: "جريبا الاولي" },
  { value: "العمري الاولي", label: "العمري الاولي" },
];

/**
 * Special locations (Warehouse, Damage)
 */
const SPECIAL_LOCATIONS = [
  { value: "المستودع", label: "المستودع" },
  { value: "اتلاف", label: "اتلاف" },
];

/**
 * Department/Section options (internal directorate departments)
 */
const DEPARTMENT_OPTIONS = [
  { value: "", label: "اختر القسم" },
  { value: "قسم تكنولوجيا المعلومات", label: "قسم تكنولوجيا المعلومات" },
  { value: "قسم التأمين الصحي", label: "قسم التأمين الصحي" },
  { value: "قسم الأبنية والصيانة", label: "قسم الأبنية والصيانة" },
  { value: "قسم رقابة الامراض", label: "قسم رقابة الامراض" },
  { value: "قسم الشؤون الفنية", label: "قسم الشؤون الفنية" },
  { value: "قسم صحة المراة والطفل", label: "قسم صحة المراة والطفل" },
  { value: "قسم التمريض", label: "قسم التمريض" },
  { value: "قسم الخدمات الفندقية", label: "قسم الخدمات الفندقية" },
  { value: "قسم المشتريات والتزويد", label: "قسم المشتريات والتزويد" },
  { value: "قسم الصحة المدرسية", label: "قسم الصحة المدرسية" },
  { value: "قسم المختبرات", label: "قسم المختبرات" },
  { value: "قسم المالية", label: "قسم المالية" },
  { value: "قسم الصحة السنية", label: "قسم الصحة السنية" },
  { value: "قسم صحة البيئة والغذاء", label: "قسم صحة البيئة والغذاء" },
  { value: "قسم شؤون الموظفين", label: "قسم شؤون الموظفين" },
  { value: "وحدة اللجان الطبية", label: "وحدة اللجان الطبية" },
  { value: "وحدة المتابعة والاشراف", label: "وحدة المتابعة والاشراف" },
  {
    value: "وحدة ترخيص المهن والمؤسسات الصحية",
    label: "وحدة ترخيص المهن والمؤسسات الصحية",
  },
  { value: "وحدة ضبط العدوى", label: "وحدة ضبط العدوى" },
  {
    value: "وحدة التوعية والاعلام الصحي",
    label: "وحدة التوعية والاعلام الصحي",
  },
  { value: "وحدة التطوير المهني", label: "وحدة التطوير المهني" },
  { value: "وحدة الديوان", label: "وحدة الديوان" },
  { value: "وحدة الجودة", label: "وحدة الجودة" },
  { value: "شعبة النقل", label: "شعبة النقل" },
  { value: "شعبة الصيدلة", label: "شعبة الصيدلة" },
  {
    value: "شعبة الغازات واللوازم الطبية وغير الطبية",
    label: "شعبة الغازات واللوازم الطبية وغير الطبية",
  },
  { value: "المساعد الإداري", label: "المساعد الإداري" },
  { value: "المساعد الفني", label: "المساعد الفني" },
  { value: "قاعة الاجتماعات", label: "قاعة الاجتماعات" },
];

/**
 * Status options (shared across forms)
 */
const STATUS_OPTIONS = [
  { value: "", label: "اختر الحالة" },
  { value: "Available", label: "متاح" },
  { value: "Used", label: "مستخدم" },
];

/**
 * Laptop brand options
 */
const LAPTOP_BRAND_OPTIONS = [
  { value: "", label: "اختر العلامة التجارية" },
  { value: "Dell", label: "Dell" },
  { value: "Lenovo", label: "Lenovo" },
  { value: "HP", label: "HP" },
  { value: "Acer", label: "Acer" },
  { value: "Fujitsu", label: "Fujitsu" },
  { value: "Toshiba", label: "Toshiba" },
];

/**
 * Printer brand options
 */
const PRINTER_BRAND_OPTIONS = [
  { value: "", label: "اختر العلامة التجارية" },
  { value: "CANON", label: "CANON" },
  { value: "Kyocera", label: "Kyocera" },
  { value: "Brother", label: "Brother" },
  { value: "HP", label: "HP" },
  { value: "Samsung", label: "Samsung" },
  { value: "Epson", label: "Epson" },
  { value: "Lexmark", label: "Lexmark" },
  { value: "Xerox Phaser", label: "Xerox Phaser" },
  { value: "Olivetti", label: "Olivetti" },
  { value: "Avision", label: "Avision" },
];

module.exports = {
  createInput,
  createSelect,
  LOCATION_TYPE_OPTIONS,
  LOCATION_OPTIONS,
  SPECIAL_LOCATIONS,
  DEPARTMENT_OPTIONS,
  STATUS_OPTIONS,
  LAPTOP_BRAND_OPTIONS,
  PRINTER_BRAND_OPTIONS,
};
