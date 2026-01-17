// Render Laptop Summary
function renderLaptopSummary(items, containerId) {
  if (items.length === 0) {
    document.getElementById(containerId).innerHTML =
      "<p>لا توجد أجهزة كمبيوتر</p>";
    return;
  }

  // Group by brand and status
  const summary = {};
  let totalAvailable = 0;
  let totalUsed = 0;

  items.forEach((item) => {
    if (!summary[item.brand]) {
      summary[item.brand] = { متاح: 0, مستخدم: 0 };
    }
    if (item.status === "Available") {
      summary[item.brand]["متاح"]++;
      totalAvailable++;
    } else {
      summary[item.brand]["مستخدم"]++;
      totalUsed++;
    }
  });

  let html = `
    <div class="summary">
      <h3>📊 الملخص</h3>
      <div class="summary-cards">
        <div class="card">
          <h4>إجمالي أجهزة الكمبيوتر</h4>
          <p class="big-number">${items.length}</p>
        </div>
        <div class="card">
          <h4>متاح</h4>
          <p class="big-number">${totalAvailable}</p>
        </div>
        <div class="card">
          <h4>مستخدم</h4>
          <p class="big-number">${totalUsed}</p>
        </div>
      </div>
    </div>
  `;
  document.getElementById(containerId).innerHTML = html;
}

// Render Laptop Table
function renderLaptopTable(items, containerId) {
  if (items.length === 0) {
    document.getElementById(containerId).innerHTML = "";
    return;
  }

  let html = `
    <table>
      <tr>
        <th>الموقع</th>
        <th>العلامة التجارية</th>
        <th>الموديل</th>
        <th>المعالج</th>
        <th>رقم التسلسل - الكمبيوتر</th>
        <th>رقم التسلسل - الشاشة</th>
        <th>الحالة</th>
        <th>الإجراءات</th>
      </tr>
  `;

  items.forEach((item) => {
    const statusClass =
      item.status === "Available" ? "status-available" : "status-used";
    const statusText = item.status === "Available" ? "متاح" : "مستخدم";
    html += `
      <tr>
        <td>${item.location}</td>
        <td>${item.brand}</td>
        <td>${item.model}</td>
        <td>${item.processor}</td>
        <td>${item.pc_serial}</td>
        <td>${item.screen_serial}</td>
        <td><span class="status ${statusClass}">${statusText}</span></td>
        <td>
          <button class="btn-sm edit-laptop-btn" data-id="${item.id}">تعديل</button>
          <button class="btn-sm btn-danger delete-laptop-btn" data-id="${item.id}">حذف</button>
        </td>
      </tr>
    `;
  });

  html += `</table>`;
  document.getElementById(containerId).innerHTML = html;
}

// Render Printer Summary
function renderPrinterSummary(items, containerId) {
  if (items.length === 0) {
    document.getElementById(containerId).innerHTML = "<p>لا توجد طابعات</p>";
    return;
  }

  // Group by brand and status
  const summary = {};
  let totalAvailable = 0;
  let totalUsed = 0;

  items.forEach((item) => {
    if (!summary[item.brand]) {
      summary[item.brand] = { متاح: 0, مستخدم: 0 };
    }
    if (item.status === "Available") {
      summary[item.brand]["متاح"]++;
      totalAvailable++;
    } else {
      summary[item.brand]["مستخدم"]++;
      totalUsed++;
    }
  });

  let html = `
    <div class="summary">
      <h3>📊 الملخص</h3>
      <div class="summary-cards">
        <div class="card">
          <h4>إجمالي الطابعات</h4>
          <p class="big-number">${items.length}</p>
        </div>
        <div class="card">
          <h4>متاح</h4>
          <p class="big-number">${totalAvailable}</p>
        </div>
        <div class="card">
          <h4>مستخدم</h4>
          <p class="big-number">${totalUsed}</p>
        </div>
      </div>
    </div>
  `;
  document.getElementById(containerId).innerHTML = html;
}

// Render Printer Table
function renderPrinterTable(items, containerId) {
  if (items.length === 0) {
    document.getElementById(containerId).innerHTML = "";
    return;
  }

  let html = `
    <table>
      <tr>
        <th>الموقع</th>
        <th>العلامة التجارية</th>
        <th>الموديل</th>
        <th>رقم التسلسل</th>
        <th>الحالة</th>
        <th>الإجراءات</th>
      </tr>
  `;

  items.forEach((item) => {
    const statusClass =
      item.status === "Available" ? "status-available" : "status-used";
    const statusText = item.status === "Available" ? "متاح" : "مستخدم";
    html += `
      <tr>
        <td>${item.location}</td>
        <td>${item.brand}</td>
        <td>${item.model}</td>
        <td>${item.serial}</td>
        <td><span class="status ${statusClass}">${statusText}</span></td>
        <td>
          <button class="btn-sm edit-printer-btn" data-id="${item.id}">تعديل</button>
          <button class="btn-sm btn-danger delete-printer-btn" data-id="${item.id}">حذف</button>
        </td>
      </tr>
    `;
  });

  html += `</table>`;
  document.getElementById(containerId).innerHTML = html;
}

module.exports = {
  renderLaptopTable,
  renderLaptopSummary,
  renderPrinterTable,
  renderPrinterSummary,
};
