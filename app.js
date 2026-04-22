// --- DOM Elements ---
const tabs = document.querySelectorAll('.sidebar nav ul li');
const tabContents = document.querySelectorAll('.tab-content');
const themeToggle = document.getElementById('themeToggle');

// Modals & Titles
const companyModal = document.getElementById('companyModal');
const saleModal = document.getElementById('saleModal');
const productModal = document.getElementById('productModal');
const exportModal = document.getElementById('exportModal');
const companyModalTitle = document.getElementById('companyModalTitle');
const saleModalTitle = document.getElementById('saleModalTitle');
const productModalTitle = document.getElementById('productModalTitle');

// Forms & Inputs
const companyEditIdInput = document.getElementById('companyEditId');
const companyNameInput = document.getElementById('companyName');
const saleEditIdInput = document.getElementById('saleEditId');
const saleCompanySelect = document.getElementById('saleCompany');
const saleAmountInput = document.getElementById('saleAmount');
const saleMonthSelect = document.getElementById('saleMonth');
const saleYearInput = document.getElementById('saleYear');
const saleDescriptionInput = document.getElementById('saleDescription');
const productEditIdInput = document.getElementById('productEditId');
const productCompanySelect = document.getElementById('productCompany');
const productNameInput = document.getElementById('productName');
const productPriceInput = document.getElementById('productPrice');
const productDiscountInput = document.getElementById('productDiscount');
const productStockInput = document.getElementById('productStock');
const productImageInput = document.getElementById('productImage');
const productImagePreview = document.getElementById('product-image-preview');

// Export Inputs
const exportDataType = document.getElementById('exportDataType');
const exportCompanyGroup = document.getElementById('exportCompanyGroup');
const exportCompanySelect = document.getElementById('exportCompany');
const exportFileName = document.getElementById('exportFileName');

// Filters
const searchCompanyInput = document.getElementById('searchCompany');
const searchSaleInput = document.getElementById('searchSale');
const searchProductInput = document.getElementById('searchProduct');
const filterSaleCompany = document.getElementById('filterSaleCompany');
const filterProductCompany = document.getElementById('filterProductCompany');

// Notes
const noteInput = document.getElementById('noteInput');
const notesList = document.getElementById('notesList');
const notesTitle = document.getElementById('notesTitle');
const noteButtons = document.getElementById('note-buttons');

// Lists & Stats
const companyList = document.getElementById('companyList');
const saleList = document.getElementById('saleList');
const productList = document.getElementById('productList');
const totalCompaniesEl = document.getElementById('totalCompanies');
const totalSalesEl = document.getElementById('totalSales');
const totalProductsEl = document.getElementById('totalProducts');

// Chart Elements
const canvas = document.getElementById('dashboardChart');
const ctx = canvas.getContext('2d');
const chartTooltip = document.getElementById('chartTooltip');
const chartYearFilter = document.getElementById('chartYearFilter');

// --- State Management ---
let data = JSON.parse(localStorage.getItem('adminData')) || {
    companies: [], sales: [], products: [], notes: [] 
};
let currentTheme = localStorage.getItem('theme') || 'light';
let tempBase64Image = "";
let currentEditNoteId = null;

// --- Initialization ---
function init() {
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.checked = true;
    }
    updateFilters();
    updateUI();
    drawChart();
}

function saveData() {
    localStorage.setItem('adminData', JSON.stringify(data));
    updateFilters();
    updateUI();
    if (!document.getElementById('dashboard').classList.contains('hidden')) {
        drawChart();
    }
}

function updateFilters() {
    const currentSaleFilter = filterSaleCompany.value;
    const currentProdFilter = filterProductCompany.value;
    
    filterSaleCompany.innerHTML = '<option value="all">همه شرکت‌ها</option>';
    filterProductCompany.innerHTML = '<option value="all">همه شرکت‌ها</option>';
    
    data.companies.forEach(company => {
        filterSaleCompany.innerHTML += `<option value="${company.id}">${company.name}</option>`;
        filterProductCompany.innerHTML += `<option value="${company.id}">${company.name}</option>`;
    });
    
    if(data.companies.find(c => c.id == currentSaleFilter)) filterSaleCompany.value = currentSaleFilter;
    if(data.companies.find(c => c.id == currentProdFilter)) filterProductCompany.value = currentProdFilter;
}

// --- Theme Toggle ---
themeToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
    drawChart();
});

// --- Tab Management ---
function switchTab(tabId) {
    tabs.forEach(tab => tab.classList.remove('active'));
    tabContents.forEach(content => content.classList.add('hidden'));

    document.querySelector(`[onclick="switchTab('${tabId}')"]`).parentElement.classList.add('active');
    document.getElementById(tabId).classList.remove('hidden');

    if (tabId === 'dashboard') drawChart();
}

// --- Modals Management ---
function openModal(modalId) {
    clearForms();
    if (modalId === 'saleModal') {
        populateCompanySelect(saleCompanySelect);
        saleYearInput.value = new Date().toLocaleDateString('fa-IR-u-nu-latn').split('/')[0];
        saleModalTitle.textContent = 'ثبت فروش جدید';
    }
    if (modalId === 'companyModal') companyModalTitle.textContent = 'افزودن شرکت جدید';
    if (modalId === 'productModal') {
        populateCompanySelect(productCompanySelect);
        productModalTitle.textContent = 'افزودن محصول جدید';
    }
    
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    clearForms();
}

function clearForms() {
    companyEditIdInput.value = '';
    companyNameInput.value = '';
    saleEditIdInput.value = '';
    saleAmountInput.value = '';
    saleDescriptionInput.value = '';
    saleYearInput.value = '';
    productEditIdInput.value = '';
    productNameInput.value = '';
    productPriceInput.value = '';
    productDiscountInput.value = '';
    productStockInput.value = '';
    productImageInput.value = '';
    productImagePreview.style.display = 'none';
    productImagePreview.src = '';
    tempBase64Image = "";
}

// --- Companies Management ---
function saveCompany() {
    const name = companyNameInput.value.trim();
    const editId = parseInt(companyEditIdInput.value);
    if (!name) return alert('لطفا نام شرکت را وارد کنید.');

    if (editId) {
        const company = data.companies.find(c => c.id === editId);
        if (company) company.name = name;
        data.sales.forEach(s => { if(s.companyId === editId) s.companyName = name; });
        data.products.forEach(p => { if(p.companyId === editId) p.companyName = name; });
    } else {
        data.companies.push({ id: Date.now(), name });
    }
    saveData();
    closeModal('companyModal');
}

function editCompany(id) {
    const company = data.companies.find(c => c.id === id);
    if (!company) return;
    clearForms();
    companyEditIdInput.value = id;
    companyNameInput.value = company.name;
    companyModalTitle.textContent = 'ویرایش شرکت';
    document.getElementById('companyModal').style.display = 'flex';
}

function deleteCompany(id) {
    if (confirm('آیا از حذف این شرکت مطمئن هستید؟ تمام فروش‌ها و محصولات مربوط به آن نیز حذف می‌شود.')) {
        data.companies = data.companies.filter(c => c.id !== id);
        data.sales = data.sales.filter(s => s.companyId !== id);
        data.products = data.products.filter(p => p.companyId !== id);
        saveData();
    }
}

// --- Helper Select Populator ---
function populateCompanySelect(selectElement, selectedId = null) {
    selectElement.innerHTML = '';
    if (data.companies.length === 0) {
        selectElement.innerHTML = '<option disabled>ابتدا یک شرکت اضافه کنید</option>';
        return;
    }
    data.companies.forEach(company => {
        const option = document.createElement('option');
        option.value = company.id;
        option.textContent = company.name;
        if (selectedId && company.id === selectedId) option.selected = true;
        selectElement.appendChild(option);
    });
}

// --- Sales Management ---
function saveSale() {
    const companyId = parseInt(saleCompanySelect.value);
    const amount = parseFloat(saleAmountInput.value);
    const month = parseInt(saleMonthSelect.value);
    const year = parseInt(saleYearInput.value);
    const description = saleDescriptionInput.value.trim();
    const editId = parseInt(saleEditIdInput.value);
    
    if (!companyId || isNaN(amount) || amount <= 0 || !year || year < 1300) {
        return alert('اطلاعات نامعتبر است.');
    }

    const companyName = data.companies.find(c => c.id === companyId).name;
    const monthNames = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
    
    if (editId) {
        const sale = data.sales.find(s => s.id === editId);
        if (sale) {
            sale.companyId = companyId; sale.companyName = companyName; sale.amount = amount;
            sale.month = month; sale.year = year; sale.monthName = monthNames[month]; sale.description = description;
        }
    } else {
        const currentDate = new Date().toLocaleDateString('fa-IR-u-nu-latn');
        data.sales.push({ 
            id: Date.now(), companyId, companyName, amount, month, year,
            monthName: monthNames[month], description: description, date: currentDate
        });
    }
    saveData();
    closeModal('saleModal');
}

function editSale(id) {
    const sale = data.sales.find(s => s.id === id);
    if (!sale) return;
    clearForms();
    saleEditIdInput.value = id;
    populateCompanySelect(saleCompanySelect, sale.companyId);
    saleAmountInput.value = sale.amount;
    saleMonthSelect.value = sale.month;
    saleYearInput.value = sale.year;
    saleDescriptionInput.value = sale.description;
    saleModalTitle.textContent = 'ویرایش فروش';
    document.getElementById('saleModal').style.display = 'flex';
}

function deleteSale(id) {
    if (confirm('آیا از حذف این فروش مطمئن هستید؟')) {
        data.sales = data.sales.filter(s => s.id !== id);
        saveData();
    }
}

// --- Products Management ---
productImageInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            tempBase64Image = e.target.result;
            productImagePreview.src = tempBase64Image;
            productImagePreview.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
});

function saveProduct() {
    const companyId = parseInt(productCompanySelect.value);
    const name = productNameInput.value.trim();
    const price = parseFloat(productPriceInput.value);
    const discount = parseFloat(productDiscountInput.value) || 0;
    const stock = parseInt(productStockInput.value) || 0;
    const editId = parseInt(productEditIdInput.value);

    if (!companyId) return alert('لطفا یک شرکت انتخاب کنید.');
    if (!name || isNaN(price) || price <= 0) return alert('نام و قیمت الزامی است.');

    const companyName = data.companies.find(c => c.id === companyId).name;

    if(editId) {
        const product = data.products.find(p => p.id === editId);
        if(product) {
            product.companyId = companyId; product.companyName = companyName; 
            product.name = name; product.price = price; product.discount = discount; product.stock = stock;
            if (tempBase64Image) product.image = tempBase64Image;
        }
    } else {
        data.products.push({ id: Date.now(), companyId, companyName, name, price, discount, stock, image: tempBase64Image });
    }
    saveData();
    closeModal('productModal');
}

function editProduct(id) {
    const product = data.products.find(p => p.id === id);
    if (!product) return;
    clearForms();
    productEditIdInput.value = id;
    populateCompanySelect(productCompanySelect, product.companyId);
    productNameInput.value = product.name;
    productPriceInput.value = product.price;
    productDiscountInput.value = product.discount;
    productStockInput.value = product.stock;
    if (product.image) {
        productImagePreview.src = product.image;
        productImagePreview.style.display = 'block';
    }
    productModalTitle.textContent = 'ویرایش محصول';
    document.getElementById('productModal').style.display = 'flex';
}

function deleteProduct(id) {
    if (confirm('آیا از حذف این محصول مطمئن هستید؟')) {
        data.products = data.products.filter(p => p.id !== id);
        saveData();
    }
}

// --- Notes Management ---
function saveNote() {
    const text = noteInput.value.trim();
    if (!text) return;
    if (currentEditNoteId) {
        const note = data.notes.find(n => n.id === currentEditNoteId);
        if (note) note.text = text;
        cancelEditNote();
    } else {
        data.notes.push({ id: Date.now(), text });
    }
    noteInput.value = '';
    saveData();
}

function editNote(id) {
    const note = data.notes.find(n => n.id === id);
    if (!note) return;
    currentEditNoteId = id;
    noteInput.value = note.text;
    noteInput.focus();
    notesTitle.textContent = "در حال ویرایش یادداشت...";
    noteButtons.innerHTML = `<button class="btn btn-edit" onclick="saveNote()">ذخیره</button> <button class="btn btn-warning" onclick="cancelEditNote()">انصراف</button>`;
}

function cancelEditNote() {
    currentEditNoteId = null;
    noteInput.value = '';
    notesTitle.textContent = "یادداشت‌های سریع";
    noteButtons.innerHTML = `<button class="btn btn-primary" onclick="saveNote()">افزودن یادداشت</button>`;
}

function deleteNote(id) {
    data.notes = data.notes.filter(n => n.id !== id);
    saveData();
}

noteInput.addEventListener('keypress', function (e) { if (e.key === 'Enter') saveNote(); });

// --- Update UI ---
function updateUI() {
    totalCompaniesEl.textContent = data.companies.length;
    totalProductsEl.textContent = data.products.length;
    const totalS = data.sales.reduce((sum, sale) => sum + sale.amount, 0);
    totalSalesEl.textContent = totalS.toLocaleString() + ' تومان';

    // Notes
    notesList.innerHTML = '';
    if (data.notes.length === 0) {
        notesList.innerHTML = '<p style="text-align:center; opacity: 0.6; padding: 10px;">یادداشتی وجود ندارد.</p>';
    } else {
        [...data.notes].reverse().forEach(note => {
            notesList.innerHTML += `
                <div class="note-item">
                    <span>${note.text}</span>
                    <div class="note-actions">
                        <button class="btn btn-edit" onclick="editNote(${note.id})">ویرایش</button>
                        <button class="btn btn-warning" onclick="deleteNote(${note.id})">حذف</button>
                    </div>
                </div>
            `;
        });
    }

    // Companies
    const searchCompanyVal = searchCompanyInput.value.trim().toLowerCase();
    companyList.innerHTML = '';
    data.companies.filter(c => c.name.toLowerCase().includes(searchCompanyVal)).forEach(company => {
        companyList.innerHTML += `
            <div class="list-item">
                <div class="item-info">${company.name}</div>
                <div class="item-actions">
                    <button class="btn btn-edit" onclick="editCompany(${company.id})">ویرایش</button>
                    <button class="btn btn-warning" onclick="deleteCompany(${company.id})">حذف</button>
                </div>
            </div>
        `;
    });

    // Sales
    const searchSaleVal = searchSaleInput.value.trim().toLowerCase();
    const filterSaleCompId = filterSaleCompany.value;
    saleList.innerHTML = '';
    [...data.sales].reverse().filter(s => {
        const matchSearch = s.companyName.toLowerCase().includes(searchSaleVal) || (s.description && s.description.toLowerCase().includes(searchSaleVal));
        const matchCompany = filterSaleCompId === 'all' || s.companyId == filterSaleCompId;
        return matchSearch && matchCompany;
    }).forEach(sale => {
        const descHtml = sale.description ? `<br><small style="opacity:0.8;">توضیحات: ${sale.description}</small>` : '';
        saleList.innerHTML += `
            <div class="list-item">
                <div class="item-info">
                    <strong>${sale.companyName}</strong> - ${sale.amount.toLocaleString()} تومان<br>
                    <small>سال و ماه: ${sale.year}/${sale.monthName} | تاریخ ثبت: ${sale.date || 'نامشخص'}</small>
                    ${descHtml}
                </div>
                <div class="item-actions">
                    <button class="btn btn-edit" onclick="editSale(${sale.id})">ویرایش</button>
                    <button class="btn btn-warning" onclick="deleteSale(${sale.id})">حذف</button>
                </div>
            </div>
        `;
    });

    // Products
    const searchProductVal = searchProductInput.value.trim().toLowerCase();
    const filterProductCompId = filterProductCompany.value;
    productList.innerHTML = '';
    
    data.products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchProductVal);
        const matchCompany = filterProductCompId === 'all' || p.companyId == filterProductCompId;
        return matchSearch && matchCompany;
    }).forEach(product => {
        // ایجاد تگ تصویر یا یک باکس جایگزین اگر عکسی وجود نداشت
        let imageHtml = '';
        if (product.image) {
            imageHtml = `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'">`;
        } else {
            imageHtml = `<div style="height: 120px; background-color: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; color: #888; font-size: 0.85em;">بدون تصویر</div>`;
        }

        const companyLabel = product.companyName ? `<small style="display:block; color:#aaa; margin-bottom:5px;">شرکت: ${product.companyName}</small>` : '';
        
        productList.innerHTML += `
            <div class="product-card">
                <div class="product-card-content">
                    ${imageHtml}
                    <h4 style="margin-top: 10px;">${product.name}</h4>
                    ${companyLabel}
                    <p>موجودی: ${product.stock}</p>
                    ${product.discount > 0 ? `<div class="price">${product.price.toLocaleString()} تومان</div>` : ''}
                    <div class="discount-price">${(product.price - product.discount).toLocaleString()} تومان</div>
                </div>
                <div class="product-actions">
                    <button class="btn btn-edit" onclick="editProduct(${product.id})">ویرایش</button>
                    <button class="btn btn-warning" onclick="deleteProduct(${product.id})">حذف</button>
                </div>
            </div>
        `;
    });
}


// --- Custom Canvas Chart ---
let animationFrameId;
function populateYearFilter() {
    const years = [...new Set(data.sales.map(s => s.year))].sort((a, b) => b - a);
    const currentSelectedYear = chartYearFilter.value;
    chartYearFilter.innerHTML = '<option value="all">همه سال‌ها</option>';
    years.forEach(year => { chartYearFilter.innerHTML += `<option value="${year}">${year}</option>`; });
    if (years.includes(parseInt(currentSelectedYear))) chartYearFilter.value = currentSelectedYear;
    else if (years.length > 0) chartYearFilter.value = years[0];
}

function drawChart() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (document.getElementById('dashboard').classList.contains('hidden')) return;

    populateYearFilter();
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = Math.max(rect.width, 300); 
    canvas.height = Math.max(rect.height - 80, 200);

    const monthNames = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
    const monthlyData = new Array(12).fill(0);
    const selectedYear = chartYearFilter.value;
    const salesForChart = selectedYear === 'all' ? data.sales : data.sales.filter(s => s.year == selectedYear);

    salesForChart.forEach(sale => { if(sale.month >= 0 && sale.month <= 11) monthlyData[sale.month] += sale.amount; });

    let animationProgress = 0;
    const animate = () => {
        if (animationProgress < 1) {
            animationProgress += 0.05;
            renderCanvasFrame(monthlyData, monthNames, animationProgress);
            animationFrameId = requestAnimationFrame(animate);
        } else {
            renderCanvasFrame(monthlyData, monthNames, 1);
            setupChartHover(monthlyData, monthNames);
        }
    };
    animate();
}

function renderCanvasFrame(monthlyData, monthNames, progress) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const padding = canvas.width < 500 ? 30 : 50; 
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    const maxData = Math.max(...monthlyData, 1) * 1.2;
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    ctx.fillStyle = isDarkMode ? '#f1f1f1' : '#333';
    ctx.strokeStyle = isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';
    ctx.font = canvas.width < 500 ? '9px Anjoman' : '12px Anjoman';
    ctx.textAlign = 'center';

    ctx.beginPath(); ctx.moveTo(padding, padding); ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding); ctx.stroke();

    const barWidth = (chartWidth / 12) * 0.7; const barMargin = (chartWidth / 12) * 0.3;

    for (let i = 0; i < 12; i++) {
        const barHeight = (monthlyData[i] / maxData) * chartHeight * progress;
        const x = padding + (i * (barWidth + barMargin)) + barMargin/2;
        const y = canvas.height - padding - barHeight;

        const gradient = ctx.createLinearGradient(x, y, x, canvas.height - padding);
        if (isDarkMode) { gradient.addColorStop(0, '#2ecc71'); gradient.addColorStop(1, 'rgba(46, 204, 113, 0.2)'); }
        else { gradient.addColorStop(0, '#27ae60'); gradient.addColorStop(1, 'rgba(39, 174, 96, 0.2)'); }
        ctx.fillStyle = gradient; ctx.fillRect(x, y, barWidth, barHeight);

        ctx.fillStyle = isDarkMode ? '#aaa' : '#666';
        ctx.fillText(monthNames[i], x + barWidth / 2, canvas.height - padding + (canvas.width < 500 ? 15 : 20));
    }

    ctx.textAlign = 'right';
    for(let i=0; i<=5; i++) {
        let val = (maxData / 5) * i; let y = canvas.height - padding - (val / maxData) * chartHeight;
        if(y < padding) continue;
        ctx.fillText(Math.round(val/1000).toLocaleString() + 'k', padding - 10, y + 5);
    }
}

function setupChartHover(monthlyData, monthNames) {
    canvas.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect(); const mouseX = e.clientX - rect.left;
        const padding = canvas.width < 500 ? 30 : 50; const chartWidth = canvas.width - padding * 2;
        const barWidth = (chartWidth / 12) * 0.7; const barMargin = (chartWidth / 12) * 0.3;

        let found = false;
        for (let i = 0; i < 12; i++) {
            const x = padding + (i * (barWidth + barMargin)) + barMargin/2;
            if (mouseX >= x && mouseX <= x + barWidth) {
                chartTooltip.style.opacity = 1; chartTooltip.style.left = e.clientX + 'px'; chartTooltip.style.top = e.clientY - 10 + 'px';
                chartTooltip.innerHTML = `${monthNames[i]}<br/>${monthlyData[i].toLocaleString()} تومان`;
                found = true; break;
            }
        }
        if (!found) chartTooltip.style.opacity = 0;
    };
    canvas.onmouseout = () => chartTooltip.style.opacity = 0;
}

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (!document.getElementById('dashboard').classList.contains('hidden')) drawChart();
    }, 200);
});

// --- بخش تنظیمات خروجی CSV ---
function openExportModal() {
    exportDataType.value = 'sales';
    exportFileName.value = '';
    
    // پر کردن لیست شرکت‌ها
    exportCompanySelect.innerHTML = '<option value="all">همه شرکت‌ها</option>';
    data.companies.forEach(company => {
        exportCompanySelect.innerHTML += `<option value="${company.id}">${company.name}</option>`;
    });
    
    toggleExportCompany();
    document.getElementById('exportModal').style.display = 'flex';
}

function toggleExportCompany() {
    if (exportDataType.value === 'products') {
        exportCompanyGroup.style.display = 'block'; 
    } else {
        exportCompanyGroup.style.display = 'block';
    }
}

function executeExport() {
    const type = exportDataType.value;
    const companyId = exportCompanySelect.value;
    let fileName = exportFileName.value.trim();
    
    if (!fileName) {
        fileName = type === 'sales' ? 'Sales_Export' : 'Products_Export';
    }
    if (!fileName.endsWith('.csv')) {
        fileName += '.csv';
    }

    let csvContent = '\uFEFF'; // BOM برای فارسی

    if (type === 'sales') {
        csvContent += "شناسه,شرکت,مبلغ (تومان),سال,ماه,توضیحات\n";
        
        let salesToExport = data.sales;
        if (companyId !== 'all') {
            salesToExport = data.sales.filter(s => s.companyId == companyId);
        }

        salesToExport.forEach(s => {
            csvContent += `"${s.id}","${(s.companyName || '').replace(/"/g, '""')}","${s.amount}","${s.year}","${s.monthName}","${(s.description || '').replace(/"/g, '""')}"\n`;
        });
    } else if (type === 'products') {
        csvContent += "شناسه,شرکت,نام محصول,قیمت اصلی (تومان),تخفیف (تومان),موجودی\n";
        
        let productsToExport = data.products;
        if (companyId !== 'all') {
            productsToExport = data.products.filter(p => p.companyId == companyId);
        }

        productsToExport.forEach(p => {
            csvContent += `"${p.id}","${(p.companyName || '').replace(/"/g, '""')}","${(p.name || '').replace(/"/g, '""')}","${p.price}","${p.discount}","${p.stock}"\n`;
        });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert("فایل با موفقیت در پوشه دانلودها ذخیره شد.");
    closeModal('exportModal');
}

// --- بخش توابع بکاپ و بازیابی اطلاعات (جدید) ---
function exportBackup() {
    const allData = JSON.stringify(localStorage);
    const blob = new Blob([allData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my_panel_backup.json'; 
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            localStorage.clear();
            for (let key in importedData) {
                localStorage.setItem(key, importedData[key]);
            }
            alert('بکاپ با موفقیت بازیابی شد! صفحه برای اعمال تغییرات رفرش می‌شود.');
            location.reload(); 
        } catch (error) {
            alert('خطا: فایل انتخاب شده نامعتبر است یا فرمت درستی ندارد.');
        }
        event.target.value = ''; 
    };
    reader.readAsText(file);
}

window.onload = init;
