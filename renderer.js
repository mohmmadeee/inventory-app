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
  DEPARTMENT_OPTIONS,
  STATUS_OPTIONS,
  LAPTOP_BRAND_OPTIONS,
  PRINTER_BRAND_OPTIONS,
} = require("./ui/formComponent");

const laptopForm = document.getElementById("laptopForm");
const printerForm = document.getElementById("printerForm");

// Store handler references to properly remove listeners
const formHandlers = {
  laptop: {
    handleLocationTypeChange: null,
    handleStatusChange: null,
  },
  printer: {
    handleLocationTypeChange: null,
    handleStatusChange: null,
  },
};

// Helper function to simulate Alt+Tab effect (reset Electron focus)
function resetWindowFocus() {
  window.blur();
  setTimeout(() => {
    window.focus();
  }, 10);
}

// Custom confirmation dialog using Electron's native dialog
async function showConfirmDialog(message) {
  const { ipcRenderer } = require("electron");
  return await ipcRenderer.invoke("show-confirm-dialog", message);
}

let currentLaptopLocation = "";
let currentLaptopLocationType = "directorate";
let currentLaptopStatus = "";
let currentLaptopSearch = "";
let currentPrinterLocation = "";
let currentPrinterLocationType = "directorate";
let currentPrinterStatus = "";
let currentPrinterSearch = "";

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
  const statusFilter = document.getElementById("laptop-status-filter");

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

  // Populate status filter
  statusFilter.innerHTML = "";
  STATUS_OPTIONS.forEach((option) => {
    const optElement = document.createElement("option");
    optElement.value = option.value;
    optElement.textContent = option.label;
    statusFilter.appendChild(optElement);
  });
  statusFilter.value = currentLaptopStatus;
}

function restorePrinterFilters() {
  const typeFilter = document.getElementById("printer-location-type-filter");
  const locationFilter = document.getElementById("printer-location-filter");
  const statusFilter = document.getElementById("printer-status-filter");

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

  // Populate status filter
  statusFilter.innerHTML = "";
  STATUS_OPTIONS.forEach((option) => {
    const optElement = document.createElement("option");
    optElement.value = option.value;
    optElement.textContent = option.label;
    statusFilter.appendChild(optElement);
  });
  statusFilter.value = currentPrinterStatus;
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
function loadLaptops(location, locationType, status, search) {
  // Save current filter state
  if (locationType) currentLaptopLocationType = locationType;
  if (location !== undefined) currentLaptopLocation = location;
  if (status !== undefined) currentLaptopStatus = status;
  if (search !== undefined) currentLaptopSearch = search;

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

    // If status filter is selected, filter by status
    if (currentLaptopStatus) {
      filteredRows = filteredRows.filter(
        (r) => r.status === currentLaptopStatus,
      );
    }

    // If search term is entered, filter by device name or employee name
    if (currentLaptopSearch.trim()) {
      const searchLower = currentLaptopSearch.toLowerCase();
      filteredRows = filteredRows.filter(
        (r) =>
          (r.device_name &&
            r.device_name.toLowerCase().includes(searchLower)) ||
          (r.employee_name &&
            r.employee_name.toLowerCase().includes(searchLower)),
      );
    }

    // Store filtered data for export
    currentFilteredLaptops = filteredRows;

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

    // Re-attach form listeners to ensure they work properly
    attachLaptopFormListeners();

    document.getElementById("laptopId").value = laptop.id;
    document.getElementById("lap-employee-name").value =
      laptop.employee_name || "";
    document.getElementById("lap-device-name").value = laptop.device_name || "";

    // Set location type and update dropdown
    const locationType = laptop.location_type || "";
    document.getElementById("lap-location-type").value = locationType;
    updateLocationDropdown("lap-location", locationType);

    // Trigger location type change to ensure location field is visible
    const locationTypeSelect = document.getElementById("lap-location-type");
    locationTypeSelect.dispatchEvent(new Event("change", { bubbles: true }));

    // Set location value AFTER triggering change event
    document.getElementById("lap-location").value = laptop.location;

    document.getElementById("lap-brand").value = laptop.brand;
    document.getElementById("lap-model").value = laptop.model;
    document.getElementById("lap-processor").value = laptop.processor;
    document.getElementById("lap-pc-serial").value = laptop.pc_serial;
    document.getElementById("lap-screen-serial").value = laptop.screen_serial;
    document.getElementById("lap-status").value = laptop.status;
    document.getElementById("lap-notes").value = laptop.notes || "";

    // Trigger visibility update based on loaded status
    const statusSelect = document.getElementById("lap-status");
    statusSelect.dispatchEvent(new Event("change", { bubbles: true }));

    // Reset window focus to fix event handling
    resetWindowFocus();
  });
};

window.deleteLaptop = function (id) {
  showConfirmDialog("هل تريد حذف هذا الجهاز؟").then((confirmed) => {
    if (confirmed) {
      db.removeLaptop(id, () => {
        loadLaptops(currentLaptopLocation);
      });
    }
  });
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
function loadPrinters(location, locationType, status, search) {
  // Save current filter state
  if (locationType) currentPrinterLocationType = locationType;
  if (location !== undefined) currentPrinterLocation = location;
  if (status !== undefined) currentPrinterStatus = status;
  if (search !== undefined) currentPrinterSearch = search;

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

    // If status filter is selected, filter by status
    if (currentPrinterStatus) {
      filteredRows = filteredRows.filter(
        (r) => r.status === currentPrinterStatus,
      );
    }

    // If search term is entered, filter by device name or employee name
    if (currentPrinterSearch.trim()) {
      const searchLower = currentPrinterSearch.toLowerCase();
      filteredRows = filteredRows.filter(
        (r) =>
          (r.device_name &&
            r.device_name.toLowerCase().includes(searchLower)) ||
          (r.employee_name &&
            r.employee_name.toLowerCase().includes(searchLower)),
      );
    }

    // Store filtered data for export
    currentFilteredPrinters = filteredRows;

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

    // Re-attach form listeners to ensure they work properly
    attachPrinterFormListeners();

    document.getElementById("printerId").value = printer.id;
    document.getElementById("pr-employee-name").value =
      printer.employee_name || "";
    document.getElementById("pr-device-name").value = printer.device_name || "";

    // Set location type and update dropdown
    const locationType = printer.location_type || "";
    document.getElementById("pr-location-type").value = locationType;
    updateLocationDropdown("pr-location", locationType);

    // Trigger location type change to ensure location field is visible
    const locationTypeSelect = document.getElementById("pr-location-type");
    locationTypeSelect.dispatchEvent(new Event("change", { bubbles: true }));

    // Set location value AFTER triggering change event
    document.getElementById("pr-location").value = printer.location;

    document.getElementById("pr-brand").value = printer.brand;
    document.getElementById("pr-model").value = printer.model;
    document.getElementById("pr-serial").value = printer.serial;
    document.getElementById("pr-scanner-type").value =
      printer.scanner_type || "";
    document.getElementById("pr-status").value = printer.status;
    document.getElementById("pr-notes").value = printer.notes || "";

    // Trigger visibility update based on loaded status
    const statusSelect = document.getElementById("pr-status");
    statusSelect.dispatchEvent(new Event("change", { bubbles: true }));

    // Reset window focus to fix event handling
    resetWindowFocus();
  });
};

window.deletePrinter = function (id) {
  showConfirmDialog("هل تريد حذف هذه الطابعة؟").then((confirmed) => {
    if (confirmed) {
      db.removePrinter(id, () => {
        loadPrinters(currentPrinterLocation);
      });
    }
  });
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

// Status Filter Listeners
document
  .getElementById("laptop-status-filter")
  .addEventListener("change", (e) => {
    loadLaptops(
      currentLaptopLocation,
      currentLaptopLocationType,
      e.target.value,
    );
  });

document
  .getElementById("printer-status-filter")
  .addEventListener("change", (e) => {
    loadPrinters(
      currentPrinterLocation,
      currentPrinterLocationType,
      e.target.value,
    );
  });

// Search Input Listeners
document.getElementById("laptop-search").addEventListener("input", (e) => {
  loadLaptops(
    currentLaptopLocation,
    currentLaptopLocationType,
    currentLaptopStatus,
    e.target.value,
  );
});

document.getElementById("printer-search").addEventListener("input", (e) => {
  loadPrinters(
    currentPrinterLocation,
    currentPrinterLocationType,
    currentPrinterStatus,
    e.target.value,
  );
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

  // Attach event listeners for visibility
  attachLaptopFormListeners();

  // Initialize visibility on initial load
  setTimeout(() => {
    if (formHandlers.laptop.handleLocationTypeChange) {
      formHandlers.laptop.handleLocationTypeChange();
    }
    if (formHandlers.laptop.handleStatusChange) {
      formHandlers.laptop.handleStatusChange();
    }
  }, 0);
}

// Separate function to attach/reattach form listeners
function attachLaptopFormListeners() {
  const typeSelect = document.getElementById("lap-location-type");
  const locationWrapper = document.getElementById("lap-location-wrapper");
  const statusSelect = document.getElementById("lap-status");
  const employeeWrapper = document.getElementById("lap-employee-wrapper");
  const employeeInput = document.getElementById("lap-employee-name");

  if (!typeSelect || !statusSelect) return; // Safety check

  // Remove old listeners if they exist
  if (formHandlers.laptop.handleLocationTypeChange) {
    typeSelect.removeEventListener(
      "change",
      formHandlers.laptop.handleLocationTypeChange,
    );
  }
  if (formHandlers.laptop.handleStatusChange) {
    statusSelect.removeEventListener(
      "change",
      formHandlers.laptop.handleStatusChange,
    );
  }

  // Location visibility handler
  formHandlers.laptop.handleLocationTypeChange = () => {
    if (typeSelect.value === "") {
      locationWrapper.style.display = "none";
    } else {
      locationWrapper.style.display = "block";
      updateLocationDropdown("lap-location", typeSelect.value);
    }
  };

  // Employee visibility handler
  formHandlers.laptop.handleStatusChange = () => {
    if (statusSelect.value === "في الخدمة") {
      employeeWrapper.style.display = "block";
      employeeInput.setAttribute("required", "required");
    } else {
      employeeWrapper.style.display = "none";
      employeeInput.removeAttribute("required");
      employeeInput.value = "";
    }
  };

  // Attach new listeners
  typeSelect.addEventListener(
    "change",
    formHandlers.laptop.handleLocationTypeChange,
  );
  statusSelect.addEventListener(
    "change",
    formHandlers.laptop.handleStatusChange,
  );

  // DON'T initialize visibility here - let the change events after setting values handle it
  // formHandlers.laptop.handleLocationTypeChange();
  // formHandlers.laptop.handleStatusChange();
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

  // Attach event listeners for visibility
  attachPrinterFormListeners();

  // Initialize visibility on initial load
  setTimeout(() => {
    if (formHandlers.printer.handleLocationTypeChange) {
      formHandlers.printer.handleLocationTypeChange();
    }
    if (formHandlers.printer.handleStatusChange) {
      formHandlers.printer.handleStatusChange();
    }
  }, 0);
}

// Separate function to attach/reattach printer form listeners
function attachPrinterFormListeners() {
  const typeSelect = document.getElementById("pr-location-type");
  const locationWrapper = document.getElementById("pr-location-wrapper");
  const statusSelect = document.getElementById("pr-status");
  const employeeWrapper = document.getElementById("pr-employee-wrapper");
  const employeeInput = document.getElementById("pr-employee-name");

  if (!typeSelect || !statusSelect) return; // Safety check

  // Remove old listeners if they exist
  if (formHandlers.printer.handleLocationTypeChange) {
    typeSelect.removeEventListener(
      "change",
      formHandlers.printer.handleLocationTypeChange,
    );
  }
  if (formHandlers.printer.handleStatusChange) {
    statusSelect.removeEventListener(
      "change",
      formHandlers.printer.handleStatusChange,
    );
  }

  // Location visibility handler
  formHandlers.printer.handleLocationTypeChange = () => {
    if (typeSelect.value === "") {
      locationWrapper.style.display = "none";
    } else {
      locationWrapper.style.display = "block";
      updateLocationDropdown("pr-location", typeSelect.value);
    }
  };

  // Employee visibility handler
  formHandlers.printer.handleStatusChange = () => {
    if (statusSelect.value === "في الخدمة") {
      employeeWrapper.style.display = "block";
      employeeInput.setAttribute("required", "required");
    } else {
      employeeWrapper.style.display = "none";
      employeeInput.removeAttribute("required");
      employeeInput.value = "";
    }
  };

  // Attach new listeners
  typeSelect.addEventListener(
    "change",
    formHandlers.printer.handleLocationTypeChange,
  );
  statusSelect.addEventListener(
    "change",
    formHandlers.printer.handleStatusChange,
  );

  // DON'T initialize visibility here - let the change events after setting values handle it
  // formHandlers.printer.handleLocationTypeChange();
  // formHandlers.printer.handleStatusChange();
}

// Print functionality
function setupPrintButtons() {
  const printLaptopsBtn = document.getElementById("print-laptops-btn");
  const printPrintersBtn = document.getElementById("print-printers-btn");

  if (printLaptopsBtn) {
    printLaptopsBtn.addEventListener("click", () => {
      window.print();
    });
  }

  if (printPrintersBtn) {
    printPrintersBtn.addEventListener("click", () => {
      window.print();
    });
  }
}

// Excel Export functionality
function setupExportButtons() {
  const exportLaptopsBtn = document.getElementById("export-laptops-btn");
  const exportPrintersBtn = document.getElementById("export-printers-btn");

  if (exportLaptopsBtn) {
    exportLaptopsBtn.addEventListener("click", () => {
      exportToExcel(currentFilteredLaptops, "أجهزة_الكمبيوتر");
    });
  }

  if (exportPrintersBtn) {
    exportPrintersBtn.addEventListener("click", () => {
      exportToExcel(currentFilteredPrinters, "الطابعات");
    });
  }
}

// Store filtered data for export
let currentFilteredLaptops = [];
let currentFilteredPrinters = [];

// Export data to Excel
function exportToExcel(data, sheetName) {
  if (data.length === 0) {
    alert("لا توجد بيانات للتصدير!");
    return;
  }

  try {
    // Use dynamic require for xlsx
    const XLSX = require("xlsx");
    const path = require("path");
    const os = require("os");
    const fs = require("fs");

    // Transform data for Excel export
    const exportData = data.map((item, index) => ({
      "#": index + 1,
      "اسم الجهاز": item.device_name || "-",
      الموقع: item.location || "-",
      "العلامة التجارية": item.brand || "-",
      الموديل: item.model || "-",
      المعالج: item.processor || "-",
      "اسم الموظف": item.employee_name || "-",
      الحالة: item.status || "-",
      ملاحظات: item.notes || "-",
    }));

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Set column widths for better readability
    const colWidths = [5, 15, 15, 15, 15, 15, 15, 15, 25];
    ws["!cols"] = colWidths.map((width) => ({ wch: width }));

    // Generate filename with current date
    const now = new Date();
    const dateStr = now.toLocaleDateString("ar-EG").replace(/\//g, "-");
    const filename = `${sheetName}_${dateStr}.xlsx`;

    // Save to Desktop
    const desktopPath = path.join(os.homedir(), "Desktop", filename);

    // Create buffer and write to file
    XLSX.writeFile(wb, desktopPath);

    // Show success message with file location
    const message = `✅ تم التصدير بنجاح!\n\n📁 الملف: ${filename}\n📍 الموقع: Desktop\n\n💡 ابحث عن الملف على سطح المكتب`;
    alert(message);

    console.log(`File saved to: ${desktopPath}`);
  } catch (err) {
    console.error("Export error:", err);
    alert(`❌ حدث خطأ أثناء التصدير: ${err.message}`);
  }
}

// Initialize after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initializeLaptopForm();
  initializePrinterForm();
  initializeFilters();
  initNavigation();
  setupPrintButtons();
  setupExportButtons();
});
