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
let currentLaptopLocationType = "directorate";
let currentPrinterLocation = "";
let currentPrinterLocationType = "directorate";

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

// Restore filter UI state
function restoreLaptopFilters() {
  const typeFilter = document.getElementById("laptop-location-type-filter");
  const locationFilter = document.getElementById("laptop-location-filter");

  // Set type filter to current value
  typeFilter.value = currentLaptopLocationType;

  // Populate location filter based on type
  locationFilter.innerHTML = "";
  if (currentLaptopLocationType === "directorate") {
    DEPARTMENT_OPTIONS.forEach((option) => {
      const optElement = document.createElement("option");
      optElement.value = option.value;
      optElement.textContent = option.label;
      locationFilter.appendChild(optElement);
    });
  } else if (currentLaptopLocationType === "health_center") {
    LOCATION_OPTIONS.forEach((option) => {
      const optElement = document.createElement("option");
      optElement.value = option.value;
      optElement.textContent = option.label;
      locationFilter.appendChild(optElement);
    });
  }

  // Set location filter to current value
  locationFilter.value = currentLaptopLocation;
}

function restorePrinterFilters() {
  const typeFilter = document.getElementById("printer-location-type-filter");
  const locationFilter = document.getElementById("printer-location-filter");

  // Set type filter to current value
  typeFilter.value = currentPrinterLocationType;

  // Populate location filter based on type
  locationFilter.innerHTML = "";
  if (currentPrinterLocationType === "directorate") {
    DEPARTMENT_OPTIONS.forEach((option) => {
      const optElement = document.createElement("option");
      optElement.value = option.value;
      optElement.textContent = option.label;
      locationFilter.appendChild(optElement);
    });
  } else if (currentPrinterLocationType === "health_center") {
    LOCATION_OPTIONS.forEach((option) => {
      const optElement = document.createElement("option");
      optElement.value = option.value;
      optElement.textContent = option.label;
      locationFilter.appendChild(optElement);
    });
  }

  // Set location filter to current value
  locationFilter.value = currentPrinterLocation;
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

      // Clear form IDs when switching to add sections
      if (sectionId === "add-laptop") {
        document.getElementById("laptopId").value = "";
      } else if (sectionId === "add-printer") {
        document.getElementById("printerId").value = "";
      }

      // Load data when viewing and restore filters
      if (sectionId === "view-laptops") {
        restoreLaptopFilters();
        loadLaptops();
      } else if (sectionId === "view-printers") {
        restorePrinterFilters();
        loadPrinters();
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
function loadLaptops(location, locationType) {
  // Save current filter state
  if (locationType) currentLaptopLocationType = locationType;
  if (location !== undefined) currentLaptopLocation = location;

  db.getAllLaptops((err, rows) => {
    if (err) console.error(err);

    let filteredRows = rows;

    // If location is specified, filter by location
    if (currentLaptopLocation) {
      filteredRows = rows.filter((r) => r.location === currentLaptopLocation);
    } else if (currentLaptopLocationType === "directorate") {
      // If directorate type with no specific location, show all directorate devices
      filteredRows = rows.filter((r) => r.location_type === "directorate");
    } else if (currentLaptopLocationType === "health_center") {
      // If health center type but no specific location selected, show nothing
      filteredRows = [];
    } else {
      // Default: show directorate devices
      filteredRows = rows.filter((r) => r.location_type === "directorate");
    }

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

  // Validate required fields
  const locationTypeValue = document.getElementById("lap-location-type").value;
  const locationValue = document.getElementById("lap-location").value;
  const statusValue = document.getElementById("lap-status").value;
  const employeeNameValue = document.getElementById("lap-employee-name").value;

  // Check if location type is selected
  if (!locationTypeValue) {
    alert("يجب اختيار نوع الموقع");
    return;
  }

  // Check if location is selected
  if (!locationValue) {
    alert("يجب اختيار الموقع");
    return;
  }

  // Check if status is selected
  if (!statusValue) {
    alert("يجب اختيار حالة الجهاز");
    return;
  }

  // Check if employee name is filled when status is "في الخدمة"
  if (statusValue === "في الخدمة" && !employeeNameValue) {
    alert("يجب إدخال اسم الموظف عندما تكون الحالة 'في الخدمة'");
    return;
  }

  const laptop = {
    employee_name: statusValue === "في الخدمة" ? employeeNameValue : "",
    device_name: document.getElementById("lap-device-name").value,
    location_type: locationTypeValue,
    location: locationValue,
    brand: document.getElementById("lap-brand").value,
    model: document.getElementById("lap-model").value,
    processor: document.getElementById("lap-processor").value,
    pc_serial: document.getElementById("lap-pc-serial").value,
    screen_serial: document.getElementById("lap-screen-serial").value,
    status: statusValue,
    notes: document.getElementById("lap-notes").value,
  };

  const id = document.getElementById("laptopId").value;

  if (id) {
    db.updateLaptop(parseInt(id), laptop, () => {
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
function loadPrinters(location, locationType) {
  // Save current filter state
  if (locationType) currentPrinterLocationType = locationType;
  if (location !== undefined) currentPrinterLocation = location;

  db.getAllPrinters((err, rows) => {
    if (err) console.error(err);

    let filteredRows = rows;

    // If location is specified, filter by location
    if (currentPrinterLocation) {
      filteredRows = rows.filter((r) => r.location === currentPrinterLocation);
    } else if (currentPrinterLocationType === "directorate") {
      // If directorate type with no specific location, show all directorate devices
      filteredRows = rows.filter((r) => r.location_type === "directorate");
    } else if (currentPrinterLocationType === "health_center") {
      // If health center type but no specific location selected, show nothing
      filteredRows = [];
    } else {
      // Default: show directorate devices
      filteredRows = rows.filter((r) => r.location_type === "directorate");
    }

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

  // Validate required fields
  const locationTypeValue = document.getElementById("pr-location-type").value;
  const locationValue = document.getElementById("pr-location").value;
  const statusValue = document.getElementById("pr-status").value;
  const employeeNameValue = document.getElementById("pr-employee-name").value;

  // Check if location type is selected
  if (!locationTypeValue) {
    alert("يجب اختيار نوع الموقع");
    return;
  }

  // Check if location is selected
  if (!locationValue) {
    alert("يجب اختيار الموقع");
    return;
  }

  // Check if status is selected
  if (!statusValue) {
    alert("يجب اختيار حالة الجهاز");
    return;
  }

  // Check if employee name is filled when status is "في الخدمة"
  if (statusValue === "في الخدمة" && !employeeNameValue) {
    alert("يجب إدخال اسم الموظف عندما تكون الحالة 'في الخدمة'");
    return;
  }

  const printer = {
    employee_name: statusValue === "في الخدمة" ? employeeNameValue : "",
    device_name: document.getElementById("pr-device-name").value,
    location_type: locationTypeValue,
    location: locationValue,
    brand: document.getElementById("pr-brand").value,
    model: document.getElementById("pr-model").value,
    serial: document.getElementById("pr-serial").value,
    scanner_type: document.getElementById("pr-scanner-type").value,
    status: statusValue,
    notes: document.getElementById("pr-notes").value,
  };

  const id = document.getElementById("printerId").value;

  if (id) {
    db.updatePrinter(parseInt(id), printer, () => {
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

// Location Type Filter Listeners
document
  .getElementById("laptop-location-type-filter")
  .addEventListener("change", (e) => {
    const typeFilter = document.getElementById("laptop-location-filter");
    const selectedType = e.target.value;

    if (selectedType === "") {
      // Empty selection - show directorate by default
      typeFilter.innerHTML = "";
      DEPARTMENT_OPTIONS.forEach((option) => {
        const optElement = document.createElement("option");
        optElement.value = option.value;
        optElement.textContent = option.label;
        typeFilter.appendChild(optElement);
      });
      currentLaptopLocationType = "directorate";
      currentLaptopLocation = "";
      loadLaptops("", "directorate");
    } else if (selectedType === "directorate") {
      // Directorate selected - populate with departments
      typeFilter.innerHTML = "";
      DEPARTMENT_OPTIONS.forEach((option) => {
        const optElement = document.createElement("option");
        optElement.value = option.value;
        optElement.textContent = option.label;
        typeFilter.appendChild(optElement);
      });
      currentLaptopLocationType = "directorate";
      currentLaptopLocation = "";
      loadLaptops("", "directorate");
    } else if (selectedType === "health_center") {
      // Health center selected - populate with health centers
      typeFilter.innerHTML = "";
      LOCATION_OPTIONS.forEach((option) => {
        const optElement = document.createElement("option");
        optElement.value = option.value;
        optElement.textContent = option.label;
        typeFilter.appendChild(optElement);
      });
      currentLaptopLocationType = "health_center";
      currentLaptopLocation = "";
      loadLaptops("", "health_center");
    }
  });

document
  .getElementById("printer-location-type-filter")
  .addEventListener("change", (e) => {
    const typeFilter = document.getElementById("printer-location-filter");
    const selectedType = e.target.value;

    if (selectedType === "") {
      // Empty selection - show directorate by default
      typeFilter.innerHTML = "";
      DEPARTMENT_OPTIONS.forEach((option) => {
        const optElement = document.createElement("option");
        optElement.value = option.value;
        optElement.textContent = option.label;
        typeFilter.appendChild(optElement);
      });
      currentPrinterLocationType = "directorate";
      currentPrinterLocation = "";
      loadPrinters("", "directorate");
    } else if (selectedType === "directorate") {
      // Directorate selected - populate with departments
      typeFilter.innerHTML = "";
      DEPARTMENT_OPTIONS.forEach((option) => {
        const optElement = document.createElement("option");
        optElement.value = option.value;
        optElement.textContent = option.label;
        typeFilter.appendChild(optElement);
      });
      currentPrinterLocationType = "directorate";
      currentPrinterLocation = "";
      loadPrinters("", "directorate");
    } else if (selectedType === "health_center") {
      // Health center selected - populate with health centers
      typeFilter.innerHTML = "";
      LOCATION_OPTIONS.forEach((option) => {
        const optElement = document.createElement("option");
        optElement.value = option.value;
        optElement.textContent = option.label;
        typeFilter.appendChild(optElement);
      });
      currentPrinterLocationType = "health_center";
      currentPrinterLocation = "";
      loadPrinters("", "health_center");
    }
  });

// Location Filter Listeners
document
  .getElementById("laptop-location-filter")
  .addEventListener("change", (e) => {
    const locationType = document.getElementById(
      "laptop-location-type-filter",
    ).value;
    loadLaptops(e.target.value, locationType);
  });

document
  .getElementById("printer-location-filter")
  .addEventListener("change", (e) => {
    const locationType = document.getElementById(
      "printer-location-type-filter",
    ).value;
    loadPrinters(e.target.value, locationType);
  });

// Initialize filter dropdowns
function initializeFilters() {
  const laptopTypeFilter = document.getElementById(
    "laptop-location-type-filter",
  );
  const printerTypeFilter = document.getElementById(
    "printer-location-type-filter",
  );

  // Populate location type filters
  LOCATION_TYPE_OPTIONS.forEach((option) => {
    const laptopOpt = document.createElement("option");
    laptopOpt.value = option.value;
    laptopOpt.textContent = option.label;
    laptopTypeFilter.appendChild(laptopOpt);

    const printerOpt = document.createElement("option");
    printerOpt.value = option.value;
    printerOpt.textContent = option.label;
    printerTypeFilter.appendChild(printerOpt);
  });

  // Set default to "directorate"
  laptopTypeFilter.value = "directorate";
  printerTypeFilter.value = "directorate";
}

// Initialize form fields dynamically
function initializeLaptopForm() {
  const container = document.getElementById("laptopFormFields");
  container.innerHTML =
    createInput("lap-device-name", "اسم الجهاز", "أدخل اسم الجهاز", true) +
    createSelect(
      "lap-location-type",
      "نوع الموقع",
      LOCATION_TYPE_OPTIONS,
      true,
    ) +
    `<div id="lap-location-wrapper" style="display: none;">` +
    createSelect(
      "lap-location",
      "الموقع",
      [{ value: "", label: "اختر الموقع" }],
      true,
    ) +
    `</div>` +
    createSelect("lap-status", "حالة الجهاز", STATUS_OPTIONS, true) +
    `<div id="lap-employee-wrapper" style="display: none;">` +
    createInput("lap-employee-name", "اسم الموظف", "أدخل اسم الموظف", false) +
    `</div>` +
    createSelect("lap-brand", "العلامة التجارية", LAPTOP_BRAND_OPTIONS, true) +
    createInput("lap-model", "الموديل", "أدخل الموديل", true) +
    createInput("lap-processor", "المعالج", "أدخل المعالج", true) +
    createInput(
      "lap-pc-serial",
      "رقم تسلسل الكمبيوتر",
      "أدخل رقم التسلسل",
      true,
    ) +
    createInput(
      "lap-screen-serial",
      "رقم تسلسل الشاشة",
      "أدخل رقم التسلسل",
      true,
    ) +
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

  // Set up employee name visibility logic (only show if status = "في الخدمة")
  const setupEmployeeVisibility = () => {
    const statusSelect = document.getElementById("lap-status");
    const wrapper = document.getElementById("lap-employee-wrapper");
    const employeeInput = document.getElementById("lap-employee-name");

    const updateVisibility = () => {
      if (statusSelect.value === "في الخدمة") {
        wrapper.style.display = "block";
        employeeInput.setAttribute("required", "required");
      } else {
        wrapper.style.display = "none";
        employeeInput.removeAttribute("required");
        employeeInput.value = ""; // Clear the value when hiding
      }
    };

    // Check initial state
    updateVisibility();

    // Listen for changes
    statusSelect.addEventListener("change", updateVisibility);
  };

  setupEmployeeVisibility();
}

function initializePrinterForm() {
  const container = document.getElementById("printerFormFields");
  container.innerHTML =
    createInput("pr-device-name", "اسم الجهاز", "أدخل اسم الجهاز", true) +
    createSelect(
      "pr-location-type",
      "نوع الموقع",
      LOCATION_TYPE_OPTIONS,
      true,
    ) +
    `<div id="pr-location-wrapper" style="display: none;">` +
    createSelect(
      "pr-location",
      "الموقع",
      [{ value: "", label: "اختر الموقع" }],
      true,
    ) +
    `</div>` +
    createSelect("pr-status", "حالة الجهاز", STATUS_OPTIONS, true) +
    `<div id="pr-employee-wrapper" style="display: none;">` +
    createInput("pr-employee-name", "اسم الموظف", "أدخل اسم الموظف", false) +
    `</div>` +
    createSelect("pr-brand", "العلامة التجارية", PRINTER_BRAND_OPTIONS, true) +
    createInput("pr-model", "الموديل", "أدخل الموديل", true) +
    createInput("pr-serial", "رقم التسلسل", "أدخل رقم التسلسل", true) +
    createInput(
      "pr-scanner-type",
      "نوع السكانر والرقم التسلسلي",
      "أدخل نوع السكانر والرقم",
      false,
    ) +
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

  // Set up employee name visibility logic (only show if status = "في الخدمة")
  const setupEmployeeVisibility = () => {
    const statusSelect = document.getElementById("pr-status");
    const wrapper = document.getElementById("pr-employee-wrapper");
    const employeeInput = document.getElementById("pr-employee-name");

    const updateVisibility = () => {
      if (statusSelect.value === "في الخدمة") {
        wrapper.style.display = "block";
        employeeInput.setAttribute("required", "required");
      } else {
        wrapper.style.display = "none";
        employeeInput.removeAttribute("required");
        employeeInput.value = ""; // Clear the value when hiding
      }
    };

    // Check initial state
    updateVisibility();

    // Listen for changes
    statusSelect.addEventListener("change", updateVisibility);
  };

  setupEmployeeVisibility();
}

// Initialize after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initializeLaptopForm();
  initializePrinterForm();
  initializeFilters();
  initNavigation();
  loadLaptops("", "directorate");
  loadPrinters("", "directorate");
});
