const fs = require("fs");
const path = require("path");
const os = require("os");

// Create data folder on Desktop for easy access
const dataDir = path.join(os.homedir(), "Desktop", "InventoryData");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dataFile = path.join(dataDir, "maune_mohammadData.json");

// Initialize data file if it doesn't exist
function initializeDataFile() {
  if (!fs.existsSync(dataFile)) {
    const initialData = {
      laptops: [],
      printers: []
    };
    fs.writeFileSync(dataFile, JSON.stringify(initialData, null, 2));
  }
}

// Read all data
function readData() {
  try {
    const data = fs.readFileSync(dataFile, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading data file:", err);
    return { laptops: [], printers: [] };
  }
}

// Write all data
function writeData(data) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing data file:", err);
  }
}

// Get next ID
function getNextId(arr) {
  if (arr.length === 0) return 1;
  return Math.max(...arr.map(item => item.id)) + 1;
}

initializeDataFile();

module.exports = {
  // Laptop functions
  addLaptop(laptop, cb) {
    try {
      const data = readData();
      laptop.id = getNextId(data.laptops);
      data.laptops.push(laptop);
      writeData(data);
      cb(null);
    } catch (err) {
      cb(err);
    }
  },

  getAllLaptops(cb) {
    try {
      const data = readData();
      cb(null, data.laptops);
    } catch (err) {
      cb(err);
    }
  },

  getLaptopsByLocation(location, cb) {
    try {
      const data = readData();
      const filtered = data.laptops.filter(l => l.location === location);
      cb(null, filtered);
    } catch (err) {
      cb(err);
    }
  },

  updateLaptop(id, laptop, cb) {
    try {
      const data = readData();
      const index = data.laptops.findIndex(l => l.id === id);
      if (index !== -1) {
        data.laptops[index] = { ...laptop, id };
        writeData(data);
      }
      cb(null);
    } catch (err) {
      cb(err);
    }
  },

  removeLaptop(id, cb) {
    try {
      const data = readData();
      data.laptops = data.laptops.filter(l => l.id !== id);
      writeData(data);
      cb(null);
    } catch (err) {
      cb(err);
    }
  },

  // Printer functions
  addPrinter(printer, cb) {
    try {
      const data = readData();
      printer.id = getNextId(data.printers);
      data.printers.push(printer);
      writeData(data);
      cb(null);
    } catch (err) {
      cb(err);
    }
  },

  getAllPrinters(cb) {
    try {
      const data = readData();
      cb(null, data.printers);
    } catch (err) {
      cb(err);
    }
  },

  getPrintersByLocation(location, cb) {
    try {
      const data = readData();
      const filtered = data.printers.filter(p => p.location === location);
      cb(null, filtered);
    } catch (err) {
      cb(err);
    }
  },

  updatePrinter(id, printer, cb) {
    try {
      const data = readData();
      const index = data.printers.findIndex(p => p.id === id);
      if (index !== -1) {
        data.printers[index] = { ...printer, id };
        writeData(data);
      }
      cb(null);
    } catch (err) {
      cb(err);
    }
  },

  removePrinter(id, cb) {
    try {
      const data = readData();
      data.printers = data.printers.filter(p => p.id !== id);
      writeData(data);
      cb(null);
    } catch (err) {
      cb(err);
    }
  },
};
