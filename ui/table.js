// Render Laptop Summary
function renderLaptopSummary(items, containerId) {
  if (items.length === 0) {
    document.getElementById(containerId).innerHTML =
      "<p>لا توجد أجهزة كمبيوتر</p>";
    return;
  }

  // Count by status
  let inService = 0;
  let warehouse = 0;
  let destruction = 0;

  items.forEach((item) => {
    if (item.status === "في الخدمة") {
      inService++;
    } else if (item.status === "مستودع") {
      warehouse++;
    } else if (item.status === "قيد الاتلاف") {
      destruction++;
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
          <h4>في الخدمة</h4>
          <p class="big-number">${inService}</p>
        </div>
        <div class="card">
          <h4>مستودع</h4>
          <p class="big-number">${warehouse}</p>
        </div>
        <div class="card">
          <h4>قيد الاتلاف</h4>
          <p class="big-number">${destruction}</p>
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
        <th>#</th>
        <th>اسم الجهاز</th>
        <th>الموقع</th>
        <th>العلامة التجارية</th>
        <th>الموديل</th>
        <th>المعالج</th>
        <th>اسم الموظف</th>
        <th>الحالة</th>
        <th>ملاحظات</th>
        <th>الإجراءات</th>
      </tr>
  `;

  items.forEach((item, index) => {
    let statusClass = "status-default";
    let statusText = item.status;

    if (item.status === "في الخدمة") {
      statusClass = "status-active";
    } else if (item.status === "مستودع") {
      statusClass = "status-warehouse";
    } else if (item.status === "قيد الاتلاف") {
      statusClass = "status-destruction";
    }

    const employeeName = item.employee_name || "-";

    html += `
      <tr>
        <td class="row-number">${index + 1}</td>
        <td>${item.device_name || "-"}</td>
        <td>${item.location}</td>
        <td>${item.brand}</td>
        <td>${item.model}</td>
        <td>${item.processor}</td>
        <td>${employeeName}</td>
        <td><span class="status ${statusClass}">${statusText}</span></td>
        <td>${item.notes || "-"}</td>
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

  // Count by status
  let inService = 0;
  let warehouse = 0;
  let destruction = 0;

  items.forEach((item) => {
    if (item.status === "في الخدمة") {
      inService++;
    } else if (item.status === "مستودع") {
      warehouse++;
    } else if (item.status === "قيد الاتلاف") {
      destruction++;
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
          <h4>في الخدمة</h4>
          <p class="big-number">${inService}</p>
        </div>
        <div class="card">
          <h4>مستودع</h4>
          <p class="big-number">${warehouse}</p>
        </div>
        <div class="card">
          <h4>قيد الاتلاف</h4>
          <p class="big-number">${destruction}</p>
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
        <th>#</th>
        <th>اسم الجهاز</th>
        <th>الموقع</th>
        <th>العلامة التجارية</th>
        <th>الموديل</th>
        <th>اسم الموظف</th>
        <th>الحالة</th>
        <th>ملاحظات</th>
        <th>الإجراءات</th>
      </tr>
  `;

  items.forEach((item, index) => {
    let statusClass = "status-default";
    let statusText = item.status;

    if (item.status === "في الخدمة") {
      statusClass = "status-active";
    } else if (item.status === "مستودع") {
      statusClass = "status-warehouse";
    } else if (item.status === "قيد الاتلاف") {
      statusClass = "status-destruction";
    }

    const employeeName = item.employee_name || "-";

    html += `
      <tr>
        <td class="row-number">${index + 1}</td>
        <td>${item.device_name || "-"}</td>
        <td>${item.location}</td>
        <td>${item.brand}</td>
        <td>${item.model}</td>
        <td>${employeeName}</td>
        <td><span class="status ${statusClass}">${statusText}</span></td>
        <td>${item.notes || "-"}</td>
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
