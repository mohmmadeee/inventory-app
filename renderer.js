const db = require("./db/database");
const {
  renderLaptopTable,
  renderLaptopSummary,
  renderPrinterTable,
  renderPrinterSummary,
} = require("./ui/table");
const {
  createInput,
  createSelect,
  LOCATION_TYPE_OPTIONS,
  LOCATION_OPTIONS,
  SPECIAL_LOCATIONS,
  DEPARTMENT_OPTIONS,
  STATUS_OPTIONS,
  LAPTOP_BRAND_OPTIONS,
  PRINTER_BRAND_OPTIONS,
} = require("./ui/formComponent");

const laptopForm = document.getElementById("laptopForm");
const printerForm = document.getElementById("printerForm");

let currentLaptopLocation = "";
let currentPrinterLocation = "";

// Update location dropdown based on selected location type
function updateLocationDropdown(selectId, locationType) {
  const select = document.getElementById(selectId);
  select.innerHTML = ""; // Clear existing options

  let optionsToUse = [];

  if (locationType === "directorate") {
    optionsToUse = DEPARTMENT_OPTIONS;
  } else if (locationType === "health_center") {
    optionsToUse = [...LOCATION_OPTIONS];
  } else {
    optionsToUse = [{ value: "", label: "اختر الموقع" }];
  }

  // Add special locations (warehouse, damage) for both types
  if (locationType !== "") {
    optionsToUse = [...optionsToUse, ...SPECIAL_LOCATIONS];
  }

  // Populate dropdown
  optionsToUse.forEach((option) => {
    const optElement = document.createElement("option");
    optElement.value = option.value;
    optElement.textContent = option.label;
    select.appendChild(optElement);
  });
}

// Navigation
function initNavigation() {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const sectionId = item.getAttribute("data-section");

      // Update active nav item
      navItems.forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");

      // Update active section
      const sections = document.querySelectorAll(".section");
      sections.forEach((section) => section.classList.remove("active"));
      document.getElementById(sectionId).classList.add("active");

      // Load data when viewing
      if (sectionId === "view-laptops") {
        loadLaptops("");
      } else if (sectionId === "view-printers") {
        loadPrinters("");
      }
    });
  });
}

// Event delegation for laptop buttons
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("edit-laptop-btn")) {
    const id = parseInt(e.target.getAttribute("data-id"));
    editLaptop(id);
  }
  if (e.target.classList.contains("delete-laptop-btn")) {
    const id = parseInt(e.target.getAttribute("data-id"));
    deleteLaptop(id);
  }
  if (e.target.classList.contains("edit-printer-btn")) {
    const id = parseInt(e.target.getAttribute("data-id"));
    editPrinter(id);
  }
  if (e.target.classList.contains("delete-printer-btn")) {
    const id = parseInt(e.target.getAttribute("data-id"));
    deletePrinter(id);
  }
});

// Laptop Functions
function loadLaptops(location) {
  currentLaptopLocation = location;
  db.getAllLaptops((err, rows) => {
    if (err) console.error(err);
    const filteredRows = location
      ? rows.filter((r) => r.location === location)
      : rows;
    renderLaptopSummary(filteredRows, "laptopSummary");
    renderLaptopTable(filteredRows, "laptopTableContainer");
  });
}

window.editLaptop = function (id) {
  db.getAllLaptops((err, rows) => {
    if (err) console.error(err);
    const laptop = rows.find((i) => i.id === id);

    // Switch to add laptop section first
    const navItem = document.querySelector('[data-section="add-laptop"]');
    const sectionId = navItem.getAttribute("data-section");

    // Update active nav item
    document
      .querySelectorAll(".nav-item")
      .forEach((nav) => nav.classList.remove("active"));
    navItem.classList.add("active");

    // Update active section
    document
      .querySelectorAll(".section")
      .forEach((section) => section.classList.remove("active"));
    document.getElementById(sectionId).classList.add("active");

    // Reset form and populate values
    laptopForm.reset();
    document.getElementById("laptopId").value = laptop.id;
    document.getElementById("lap-employee-name").value =
      laptop.employee_name || "";
    document.getElementById("lap-device-name").value = laptop.device_name || "";

    // Set location type and update dropdown
    const locationType = laptop.location_type || "";
    document.getElementById("lap-location-type").value = locationType;
    updateLocationDropdown("lap-location", locationType);
    document.getElementById("lap-location").value = laptop.location;

    document.getElementById("lap-brand").value = laptop.brand;
    document.getElementById("lap-model").value = laptop.model;
    document.getElementById("lap-processor").value = laptop.processor;
    document.getElementById("lap-pc-serial").value = laptop.pc_serial;
    document.getElementById("lap-screen-serial").value = laptop.screen_serial;
    document.getElementById("lap-status").value = laptop.status;
    document.getElementById("lap-notes").value = laptop.notes || "";
  });
};

window.deleteLaptop = function (id) {
  if (confirm("هل تريد حذف هذا الجهاز؟")) {
    db.removeLaptop(id, () => loadLaptops(currentLaptopLocation));
  }
};

laptopForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const laptop = {
    employee_name: document.getElementById("lap-employee-name").value,
    device_name: document.getElementById("lap-device-name").value,
    location_type: document.getElementById("lap-location-type").value,
    location: document.getElementById("lap-location").value,
    brand: document.getElementById("lap-brand").value,
    model: document.getElementById("lap-model").value,
    processor: document.getElementById("lap-processor").value,
    pc_serial: document.getElementById("lap-pc-serial").value,
    screen_serial: document.getElementById("lap-screen-serial").value,
    status: document.getElementById("lap-status").value,
    notes: document.getElementById("lap-notes").value,
  };

  const id = document.getElementById("laptopId").value;

  if (id) {
    db.updateLaptop(id, laptop, () => {
      loadLaptops(currentLaptopLocation);
      laptopForm.reset();
      document.getElementById("laptopId").value = "";
    });
  } else {
    db.addLaptop(laptop, () => {
      loadLaptops("");
      laptopForm.reset();
    });
  }
});

// Printer Functions
function loadPrinters(location) {
  currentPrinterLocation = location;
  db.getAllPrinters((err, rows) => {
    if (err) console.error(err);
    const filteredRows = location
      ? rows.filter((r) => r.location === location)
      : rows;
    renderPrinterSummary(filteredRows, "printerSummary");
    renderPrinterTable(filteredRows, "printerTableContainer");
  });
}

window.editPrinter = function (id) {
  db.getAllPrinters((err, rows) => {
    if (err) console.error(err);
    const printer = rows.find((i) => i.id === id);

    // Switch to add printer section first
    const navItem = document.querySelector('[data-section="add-printer"]');
    const sectionId = navItem.getAttribute("data-section");

    // Update active nav item
    document
      .querySelectorAll(".nav-item")
      .forEach((nav) => nav.classList.remove("active"));
    navItem.classList.add("active");

    // Update active section
    document
      .querySelectorAll(".section")
      .forEach((section) => section.classList.remove("active"));
    document.getElementById(sectionId).classList.add("active");

    // Reset form and populate values
    printerForm.reset();
    document.getElementById("printerId").value = printer.id;
    document.getElementById("pr-employee-name").value =
      printer.employee_name || "";
    document.getElementById("pr-device-name").value = printer.device_name || "";

    // Set location type and update dropdown
    const locationType = printer.location_type || "";
    document.getElementById("pr-location-type").value = locationType;
    updateLocationDropdown("pr-location", locationType);
    document.getElementById("pr-location").value = printer.location;

    document.getElementById("pr-brand").value = printer.brand;
    document.getElementById("pr-model").value = printer.model;
    document.getElementById("pr-serial").value = printer.serial;
    document.getElementById("pr-scanner-type").value =
      printer.scanner_type || "";
    document.getElementById("pr-status").value = printer.status;
    document.getElementById("pr-notes").value = printer.notes || "";
  });
};

window.deletePrinter = function (id) {
  if (confirm("هل تريد حذف هذه الطابعة؟")) {
    db.removePrinter(id, () => loadPrinters(currentPrinterLocation));
  }
};

printerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const printer = {
    employee_name: document.getElementById("pr-employee-name").value,
    device_name: document.getElementById("pr-device-name").value,
    location_type: document.getElementById("pr-location-type").value,
    location: document.getElementById("pr-location").value,
    brand: document.getElementById("pr-brand").value,
    model: document.getElementById("pr-model").value,
    serial: document.getElementById("pr-serial").value,
    scanner_type: document.getElementById("pr-scanner-type").value,
    status: document.getElementById("pr-status").value,
    notes: document.getElementById("pr-notes").value,
  };

  const id = document.getElementById("printerId").value;

  if (id) {
    db.updatePrinter(id, printer, () => {
      loadPrinters(currentPrinterLocation);
      printerForm.reset();
      document.getElementById("printerId").value = "";
    });
  } else {
    db.addPrinter(printer, () => {
      loadPrinters("");
      printerForm.reset();
    });
  }
});

// Location Filter Listeners
document
  .getElementById("laptop-location-filter")
  .addEventListener("change", (e) => {
    loadLaptops(e.target.value);
  });

document
  .getElementById("printer-location-filter")
  .addEventListener("change", (e) => {
    loadPrinters(e.target.value);
  });

// Initialize filter dropdowns
function initializeFilters() {
  const laptopFilter = document.getElementById("laptop-location-filter");
  const printerFilter = document.getElementById("printer-location-filter");

  // Populate location filters
  LOCATION_OPTIONS.forEach((option) => {
    const optElement = document.createElement("option");
    optElement.value = option.value;
    optElement.textContent = option.label;
    laptopFilter.appendChild(optElement);

    const optElement2 = document.createElement("option");
    optElement2.value = option.value;
    optElement2.textContent = option.label;
    printerFilter.appendChild(optElement2);
  });
}

// Initialize form fields dynamically
function initializeLaptopForm() {
  const container = document.getElementById("laptopFormFields");
  container.innerHTML =
    createInput("lap-employee-name", "اسم الموظف", "أدخل اسم الموظف", false) +
    createInput("lap-device-name", "اسم الجهاز", "أدخل اسم الجهاز", false) +
    createSelect("lap-location-type", "نوع الموقع", LOCATION_TYPE_OPTIONS) +
    `<div id="lap-location-wrapper" style="display: none;">` +
    createSelect("lap-location", "الموقع", [
      { value: "", label: "اختر الموقع" },
    ]) +
    `</div>` +
    createSelect("lap-brand", "العلامة التجارية", LAPTOP_BRAND_OPTIONS) +
    createInput("lap-model", "الموديل", "أدخل الموديل") +
    createInput("lap-processor", "المعالج", "أدخل المعالج") +
    createInput("lap-pc-serial", "رقم تسلسل الكمبيوتر", "أدخل رقم التسلسل") +
    createInput("lap-screen-serial", "رقم تسلسل الشاشة", "أدخل رقم التسلسل") +
    createSelect("lap-status", "الحالة", STATUS_OPTIONS) +
    createInput("lap-notes", "ملاحظات", "أدخل أي ملاحظات", false);

  // Set up location visibility logic
  const setupLocationVisibility = () => {
    const typeSelect = document.getElementById("lap-location-type");
    const wrapper = document.getElementById("lap-location-wrapper");

    const updateVisibility = () => {
      if (typeSelect.value === "") {
        wrapper.style.display = "none";
      } else {
        wrapper.style.display = "block";
        updateLocationDropdown("lap-location", typeSelect.value);
      }
    };

    // Check initial state
    updateVisibility();

    // Listen for changes
    typeSelect.addEventListener("change", updateVisibility);
  };

  setupLocationVisibility();
}

function initializePrinterForm() {
  const container = document.getElementById("printerFormFields");
  container.innerHTML =
    createInput("pr-employee-name", "اسم الموظف", "أدخل اسم الموظف", false) +
    createInput("pr-device-name", "اسم الجهاز", "أدخل اسم الجهاز", false) +
    createSelect("pr-location-type", "نوع الموقع", LOCATION_TYPE_OPTIONS) +
    `<div id="pr-location-wrapper" style="display: none;">` +
    createSelect("pr-location", "الموقع", [
      { value: "", label: "اختر الموقع" },
    ]) +
    `</div>` +
    createSelect("pr-brand", "العلامة التجارية", PRINTER_BRAND_OPTIONS) +
    createInput("pr-model", "الموديل", "أدخل الموديل") +
    createInput("pr-serial", "رقم التسلسل", "أدخل رقم التسلسل") +
    createInput(
      "pr-scanner-type",
      "نوع السكانر والرقم التسلسلي",
      "أدخل نوع السكانر والرقم",
      false,
    ) +
    createSelect("pr-status", "الحالة", STATUS_OPTIONS) +
    createInput("pr-notes", "ملاحظات", "أدخل أي ملاحظات", false);

  // Set up location visibility logic
  const setupLocationVisibility = () => {
    const typeSelect = document.getElementById("pr-location-type");
    const wrapper = document.getElementById("pr-location-wrapper");

    const updateVisibility = () => {
      if (typeSelect.value === "") {
        wrapper.style.display = "none";
      } else {
        wrapper.style.display = "block";
        updateLocationDropdown("pr-location", typeSelect.value);
      }
    };

    // Check initial state
    updateVisibility();

    // Listen for changes
    typeSelect.addEventListener("change", updateVisibility);
  };

  setupLocationVisibility();
}

// Initialize after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initializeLaptopForm();
  initializePrinterForm();
  initializeFilters();
  initNavigation();
  loadLaptops("");
});
