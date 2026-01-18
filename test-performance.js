const db = require("./db/database");
const fs = require("fs");
const path = require("path");
const os = require("os");

// Test data generators
const LOCATIONS = [
  "مقر الإدارة",
  "فرع شمال",
  "فرع جنوب",
  "فرع شرق",
  "مركز صحي أول",
];
const BRANDS = ["Dell", "HP", "Lenovo", "ASUS", "Apple"];
const PROCESSORS = ["Intel i7", "Intel i5", "AMD Ryzen 7", "AMD Ryzen 5"];
const STATUSES = ["في الخدمة", "مستودع", "قيد الاتلاف"];

function generateLaptopData(index) {
  return {
    device_name: `جهاز كمبيوتر ${index + 1}`,
    location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
    brand: BRANDS[Math.floor(Math.random() * BRANDS.length)],
    model: `Model-${Math.floor(Math.random() * 1000)}`,
    processor: PROCESSORS[Math.floor(Math.random() * PROCESSORS.length)],
    employee_name: index % 3 === 0 ? `موظف ${index + 1}` : "",
    status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
    notes: `ملاحظات الجهاز رقم ${index + 1}`,
  };
}

// Performance tracking
const stats = {
  startTime: Date.now(),
  laptopsAdded: 0,
  errors: 0,
  timePerLaptop: [],
};

console.log("🚀 Starting Performance Test: Adding 200 Laptops...\n");

// Add 200 laptops with performance tracking
function addLaptopsSequentially(count, index = 0) {
  if (index >= count) {
    // Test complete
    const totalTime = Date.now() - stats.startTime;
    const avgTime =
      stats.timePerLaptop.reduce((a, b) => a + b, 0) /
      stats.timePerLaptop.length;

    console.log("\n" + "=".repeat(60));
    console.log("📊 PERFORMANCE TEST RESULTS");
    console.log("=".repeat(60));
    console.log(`✅ Total Laptops Added: ${stats.laptopsAdded}`);
    console.log(`❌ Errors: ${stats.errors}`);
    console.log(
      `⏱️  Total Time: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`,
    );
    console.log(`⏱️  Average Time per Laptop: ${avgTime.toFixed(2)}ms`);
    console.log(`📈 Min Time: ${Math.min(...stats.timePerLaptop)}ms`);
    console.log(`📈 Max Time: ${Math.max(...stats.timePerLaptop)}ms`);

    // Get database file size
    const dataDir = path.join(os.homedir(), "Desktop", "InventoryData");
    const dataFile = path.join(dataDir, "maune_mohammadData.json");

    try {
      const stats_file = fs.statSync(dataFile);
      const fileSizeKB = (stats_file.size / 1024).toFixed(2);
      const fileSizeMB = (stats_file.size / (1024 * 1024)).toFixed(4);
      console.log(`💾 Database File Size: ${fileSizeKB} KB (${fileSizeMB} MB)`);
    } catch (err) {
      console.log("❌ Could not read file size");
    }

    console.log("=".repeat(60) + "\n");
    return;
  }

  const itemTime = Date.now();
  const laptopData = generateLaptopData(index);

  db.addLaptop(laptopData, (err) => {
    if (err) {
      stats.errors++;
      console.error(`❌ Error adding laptop ${index + 1}:`, err.message);
    } else {
      stats.laptopsAdded++;
      const time = Date.now() - itemTime;
      stats.timePerLaptop.push(time);

      if ((index + 1) % 50 === 0) {
        console.log(`✅ Added ${index + 1} laptops...`);
      }
    }

    // Continue with next laptop
    setImmediate(() => addLaptopsSequentially(count, index + 1));
  });
}

// Start the test
addLaptopsSequentially(200);

// Memory monitoring (optional)
console.log("💻 System Information:");
console.log(`   Platform: ${os.platform()}`);
console.log(`   Arch: ${os.arch()}`);
console.log(`   CPUs: ${os.cpus().length}`);
console.log(
  `   Total Memory: ${(os.totalmem() / (1024 * 1024 * 1024)).toFixed(2)} GB`,
);
console.log(
  `   Free Memory: ${(os.freemem() / (1024 * 1024 * 1024)).toFixed(2)} GB\n`,
);
