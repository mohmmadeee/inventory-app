const db = require("./db/database");
const {
  renderLaptopTable,
  renderLaptopSummary,
  renderPrinterTable,
  renderPrinterSummary,
} = require("./ui/table");

const laptopForm = document.getElementById("laptopForm");
const printerForm = document.getElementById("printerForm");

let currentLaptopLocation = "";
let currentPrinterLocation = "";

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
    document.getElementById("laptopId").value = laptop.id;
    document.getElementById("lap-location").value = laptop.location;
    document.getElementById("lap-brand").value = laptop.brand;
    document.getElementById("lap-model").value = laptop.model;
    document.getElementById("lap-processor").value = laptop.processor;
    document.getElementById("lap-pc-serial").value = laptop.pc_serial;
    document.getElementById("lap-screen-serial").value = laptop.screen_serial;
    document.getElementById("lap-status").value = laptop.status;

    // Switch to add laptop section
    document.querySelector('[data-section="add-laptop"]').click();
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
    location: document.getElementById("lap-location").value,
    brand: document.getElementById("lap-brand").value,
    model: document.getElementById("lap-model").value,
    processor: document.getElementById("lap-processor").value,
    pc_serial: document.getElementById("lap-pc-serial").value,
    screen_serial: document.getElementById("lap-screen-serial").value,
    status: document.getElementById("lap-status").value,
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
    document.getElementById("printerId").value = printer.id;
    document.getElementById("pr-location").value = printer.location;
    document.getElementById("pr-brand").value = printer.brand;
    document.getElementById("pr-model").value = printer.model;
    document.getElementById("pr-serial").value = printer.serial;
    document.getElementById("pr-status").value = printer.status;

    // Switch to add printer section
    document.querySelector('[data-section="add-printer"]').click();
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
    location: document.getElementById("pr-location").value,
    brand: document.getElementById("pr-brand").value,
    model: document.getElementById("pr-model").value,
    serial: document.getElementById("pr-serial").value,
    status: document.getElementById("pr-status").value,
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

// Initialize after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  loadLaptops("");
});
