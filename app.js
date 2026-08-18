// ========== 資料管理 ==========
const DataManager = {
    STORAGE_KEY_ORDERS: 'orders',
    STORAGE_KEY_CUSTOMERS: 'customers',

    init() {
        if (!localStorage.getItem(this.STORAGE_KEY_ORDERS)) {
            localStorage.setItem(this.STORAGE_KEY_ORDERS, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.STORAGE_KEY_CUSTOMERS)) {
            localStorage.setItem(this.STORAGE_KEY_CUSTOMERS, JSON.stringify([]));
        }
    },

    getOrders() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY_ORDERS)) || [];
    },

    saveOrder(order) {
        const orders = this.getOrders();
        const index = orders.findIndex(o => o.id === order.id);
        if (index > -1) {
            orders[index] = order;
        } else {
            order.id = Date.now().toString();
            order.createdAt = new Date().toISOString();
            orders.push(order);
        }
        localStorage.setItem(this.STORAGE_KEY_ORDERS, JSON.stringify(orders));
        return order;
    },

    deleteOrder(orderId) {
        const orders = this.getOrders();
        const filtered = orders.filter(o => o.id !== orderId);
        localStorage.setItem(this.STORAGE_KEY_ORDERS, JSON.stringify(filtered));
    },

    getCustomers() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY_CUSTOMERS)) || [];
    },

    saveCustomer(customer) {
        const customers = this.getCustomers();
        const index = customers.findIndex(c => c.id === customer.id);
        if (index > -1) {
            customers[index] = customer;
        } else {
            customer.id = Date.now().toString();
            customers.push(customer);
        }
        localStorage.setItem(this.STORAGE_KEY_CUSTOMERS, JSON.stringify(customers));
        return customer;
    },

    deleteCustomer(customerId) {
        const customers = this.getCustomers();
        const filtered = customers.filter(c => c.id !== customerId);
        localStorage.setItem(this.STORAGE_KEY_CUSTOMERS, JSON.stringify(filtered));
    }
};

// ========== 訂單管理 ==========
const OrderManager = {
    currentOrderId: null,

    initForm() {
        const form = document.getElementById('orderForm');
        const addItemBtn = document.getElementById('addItemBtn');
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('orderDate').value = today;

        addItemBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.addOrderItem();
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveOrder();
        });

        this.addOrderItem();
    },

    addOrderItem() {
        const container = document.getElementById('itemsContainer');
        const itemHTML = `
            <div class="order-item">
                <div class="form-row">
                    <div class="form-group">
                        <label>商品 *</label>
                        <select class="product-select" required>
                            <option value="">請選擇商品</option>
                            <option value="咖啡豆">咖啡豆</option>
                            <option value="冷萃包">冷萃包</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>單價 (元) *</label>
                        <input type="number" class="product-price" required placeholder="0" step="0.01">
                    </div>
                    <div class="form-group">
                        <label>數量 *</label>
                        <input type="number" class="product-quantity" required placeholder="0" min="1">
                    </div>
                    <div class="form-group">
                        <label>小計 (元)</label>
                        <input type="number" class="product-subtotal" readonly>
                    </div>
                    <button type="button" class="btn-remove-item">🗑️</button>
                </div>
            </div>
        `;

        const newItem = document.createElement('div');
        newItem.innerHTML = itemHTML;
        container.appendChild(newItem);

        const priceInput = newItem.querySelector('.product-price');
        const quantityInput = newItem.querySelector('.product-quantity');
        const subtotalInput = newItem.querySelector('.product-subtotal');
        const removeBtn = newItem.querySelector('.btn-remove-item');

        const updateSubtotal = () => {
            const price = parseFloat(priceInput.value) || 0;
            const quantity = parseFloat(quantityInput.value) || 0;
            const subtotal = price * quantity;
            subtotalInput.value = subtotal.toFixed(2);
            this.updateOrderTotal();
        };

        priceInput.addEventListener('change', updateSubtotal);
        quantityInput.addEventListener('change', updateSubtotal);
        priceInput.addEventListener('input', updateSubtotal);
        quantityInput.addEventListener('input', updateSubtotal);

        removeBtn.addEventListener('click', () => {
            if (container.children.length > 1) {
                newItem.remove();
                this.updateOrderTotal();
            } else {
                showAlert('至少需要一個商品', 'warning');
            }
        });
    },

    updateOrderTotal() {
        const subtotals = Array.from(document.querySelectorAll('.product-subtotal'))
            .map(input => parseFloat(input.value) || 0);
        const total = subtotals.reduce((sum, val) => sum + val, 0);
        const commission = total * 0.1;

        document.getElementById('totalAmount').textContent = '$' + total.toFixed(2);
        document.getElementById('commissionAmount').textContent = '$' + commission.toFixed(2);
    },

    saveOrder() {
        const items = Array.from(document.querySelectorAll('.order-item')).map(item => ({
            product: item.querySelector('.product-select').value,
            price: parseFloat(item.querySelector('.product-price').value),
            quantity: parseInt(item.querySelector('.product-quantity').value),
            subtotal: parseFloat(item.querySelector('.product-subtotal').value)
        }));

        if (items.some(item => !item.product || !item.price || !item.quantity)) {
            showAlert('請填入所有商品資訊', 'error');
            return;
        }

        const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
        const commission = totalAmount * 0.1;

        const order = {
            id: this.currentOrderId || Date.now().toString(),
            orderNumber: 'ORD-' + new Date().getTime(),
            salesmanName: document.getElementById('salesmanName').value,
            customerName: document.getElementById('customerName').value,
            customerEmail: document.getElementById('customerEmail').value,
            customerPhone: document.getElementById('customerPhone').value,
            orderDate: document.getElementById('orderDate').value,
            items: items,
            totalAmount: totalAmount.toFixed(2),
            commission: commission.toFixed(2),
            status: '待處理',
            notes: document.getElementById('notes').value,
            updatedAt: new Date().toISOString()
        };

        DataManager.saveOrder(order);
        showAlert('訂單已保存！', 'success');
        document.getElementById('orderForm').reset();
        this.currentOrderId = null;

        setTimeout(() => {
            this.initForm();
            UIManager.switchTab('orders');
            OrderListUI.render();
        }, 500);
    },

    editOrder(orderId) {
        const orders = DataManager.getOrders();
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        this.currentOrderId = orderId;
        document.getElementById('salesmanName').value = order.salesmanName;
        document.getElementById('customerName').value = order.customerName;
        document.getElementById('customerEmail').value = order.customerEmail;
        document.getElementById('customerPhone').value = order.customerPhone;
        document.getElementById('orderDate').value = order.orderDate;
        document.getElementById('notes').value = order.notes;

        document.getElementById('itemsContainer').innerHTML = '';
        order.items.forEach(item => {
            this.addOrderItem();
            const lastItem = document.querySelector('.order-item:last-child');
            lastItem.querySelector('.product-select').value = item.product;
            lastItem.querySelector('.product-price').value = item.price;
            lastItem.querySelector('.product-quantity').value = item.quantity;
            lastItem.querySelector('.product-subtotal').value = item.subtotal;
        });

        this.updateOrderTotal();
        UIManager.switchTab('create');
    }
};

// ========== UI 管理 ==========
const UIManager = {
    switchTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        if (tabName === 'orders') OrderListUI.render();
        if (tabName === 'customers') CustomerListUI.render();
        if (tabName === 'report') ReportUI.render();
    },

    initEventListeners() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                closeBtn.closest('.modal').classList.remove('show');
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('show');
            }
        });
    }
};

// ========== 訂單列表 UI ==========
const OrderListUI = {
    render() {
        const orders = DataManager.getOrders();
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;

        const filtered = orders.filter(order => {
            const matchSearch = order.customerName.toLowerCase().includes(searchTerm) ||
                              order.orderNumber.toLowerCase().includes(searchTerm);
            const matchStatus = !statusFilter || order.status === statusFilter;
            return matchSearch && matchStatus;
        });

        const html = filtered.length ? filtered.map(order => `
            <div class="order-card" onclick="OrderListUI.showOrderDetail('${order.id}')">
                <div class="order-card-header">
                    <div>
                        <div class="order-card-title">${order.customerName}</div>
                        <div class="order-card-id">訂單編號: ${order.orderNumber}</div>
                    </div>
                    <span class="status-badge status-${order.status}">${order.status}</span>
                </div>
                <div class="order-card-info">
                    <p>業務: ${order.salesmanName}</p>
                    <p>日期: ${order.orderDate}</p>
                    <p>聯絡: ${order.customerPhone}</p>
                </div>
                <div class="order-card-amount">總金額: $${order.totalAmount}</div>
            </div>
        `).join('') : '<p style="text-align: center; color: #999; padding: 40px;">暫無訂單</p>';

        document.getElementById('ordersList').innerHTML = html;
    },

    showOrderDetail(orderId) {
        const orders = DataManager.getOrders();
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        const itemsHTML = order.items.map(item => `
            <div class="detail-row">
                <span class="detail-label">${item.product} × ${item.quantity}</span>
                <span class="detail-value">$${item.subtotal}</span>
            </div>
        `).join('');

        const detailHTML = `
            <div class="detail-row"><span class="detail-label">訂單編號:</span><span class="detail-value">${order.orderNumber}</span></div>
            <div class="detail-row"><span class="detail-label">業務人員:</span><span class="detail-value">${order.salesmanName}</span></div>
            <div class="detail-row"><span class="detail-label">客戶名稱:</span><span class="detail-value">${order.customerName}</span></div>
            <div class="detail-row"><span class="detail-label">客戶郵箱:</span><span class="detail-value">${order.customerEmail}</span></div>
            <div class="detail-row"><span class="detail-label">客戶電話:</span><span class="detail-value">${order.customerPhone}</span></div>
            <div class="detail-row"><span class="detail-label">訂單日期:</span><span class="detail-value">${order.orderDate}</span></div>
            <div class="detail-row"><span class="detail-label">訂單狀態:</span><span class="detail-value"><span class="status-badge status-${order.status}">${order.status}</span></span></div>
            <h3 style="margin-top: 20px;">商品明細</h3>
            ${itemsHTML}
            <div class="detail-row" style="font-weight: bold; font-size: 1.1rem; color: #667eea; border-top: 2px solid #667eea; margin-top: 10px;">
                <span class="detail-label">訂單總金額:</span><span class="detail-value">$${order.totalAmount}</span>
            </div>
            <div class="detail-row" style="font-weight: bold; color: #667eea;">
                <span class="detail-label">佣金 (10%):</span><span class="detail-value">$${order.commission}</span>
            </div>
            ${order.notes ? `<div class="detail-row"><span class="detail-label">備註:</span><span class="detail-value">${order.notes}</span></div>` : ''}
        `;

        document.getElementById('orderDetail').innerHTML = detailHTML;

        document.getElementById('editOrderBtn').onclick = () => {
            OrderManager.editOrder(orderId);
            document.getElementById('orderModal').classList.remove('show');
        };

        document.getElementById('changeStatusBtn').onclick = () => {
            document.getElementById('statusModal').classList.add('show');
            document.getElementById('newStatus').value = order.status;
            document.getElementById('confirmStatusBtn').onclick = () => {
                order.status = document.getElementById('newStatus').value;
                DataManager.saveOrder(order);
                document.getElementById('statusModal').classList.remove('show');
                OrderListUI.render();
                this.showOrderDetail(orderId);
                showAlert('訂單狀態已更新', 'success');
            };
        };

        document.getElementById('sendEmailBtn').onclick = () => {
            showAlert('郵件功能需要配置 Google Apps Script', 'warning');
        };

        document.getElementById('deleteOrderBtn').onclick = () => {
            if (confirm('確定要刪除此訂單嗎？')) {
                DataManager.deleteOrder(orderId);
                document.getElementById('orderModal').classList.remove('show');
                OrderListUI.render();
                showAlert('訂單已刪除', 'success');
            }
        };

        document.getElementById('orderModal').classList.add('show');
    }
};

// ========== 客戶列表 UI ==========
const CustomerListUI = {
    render() {
        const customers = DataManager.getCustomers();
        const html = customers.length ? customers.map(customer => `
            <div class="customer-card" onclick="CustomerListUI.showCustomerForm('${customer.id}')">
                <div class="customer-card-name">${customer.name}</div>
                <div class="customer-card-info">📧 ${customer.email}</div>
                <div class="customer-card-info">📱 ${customer.phone}</div>
            </div>
        `).join('') : '<p style="text-align: center; color: #999; padding: 40px;">暫無客戶</p>';
        document.getElementById('customersList').innerHTML = html;
    },

    showCustomerForm(customerId = null) {
        const modal = document.getElementById('customerModal');
        const form = document.getElementById('customerForm');

        if (customerId) {
            const customers = DataManager.getCustomers();
            const customer = customers.find(c => c.id === customerId);
            if (!customer) return;
            document.getElementById('customerId').value = customerId;
            document.getElementById('customerFormName').value = customer.name;
            document.getElementById('customerFormEmail').value = customer.email;
            document.getElementById('customerFormPhone').value = customer.phone;
        } else {
            form.reset();
            document.getElementById('customerId').value = '';
        }

        form.onsubmit = (e) => {
            e.preventDefault();
            const customer = {
                id: document.getElementById('customerId').value || null,
                name: document.getElementById('customerFormName').value,
                email: document.getElementById('customerFormEmail').value,
                phone: document.getElementById('customerFormPhone').value
            };
            DataManager.saveCustomer(customer);
            modal.classList.remove('show');
            CustomerListUI.render();
            showAlert('客戶已保存', 'success');
        };

        document.getElementById('deleteCustomerBtn').onclick = () => {
            if (customerId && confirm('確定要刪除此客戶嗎？')) {
                DataManager.deleteCustomer(customerId);
                modal.classList.remove('show');
                CustomerListUI.render();
                showAlert('客戶已刪除', 'success');
            }
        };

        modal.classList.add('show');
    }
};

// ========== 報表 UI ==========
const ReportUI = {
    render() {
        const orders = DataManager.getOrders();
        const totalSales = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
        const totalCommission = orders.reduce((sum, o) => sum + parseFloat(o.commission), 0);
        const totalOrders = orders.length;
        const completedOrders = orders.filter(o => o.status === '已完成').length;

        const performanceMap = {};
        orders.forEach(order => {
            if (!performanceMap[order.salesmanName]) {
                performanceMap[order.salesmanName] = {
                    name: order.salesmanName,
                    sales: 0,
                    commission: 0,
                    orders: 0
                };
            }
            performanceMap[order.salesmanName].sales += parseFloat(order.totalAmount);
            performanceMap[order.salesmanName].commission += parseFloat(order.commission);
            performanceMap[order.salesmanName].orders += 1;
        });

        const performance = Object.values(performanceMap).sort((a, b) => b.sales - a.sales);
        const statusMap = {};
        ['待處理', '已確認', '已發貨', '已完成', '已取消'].forEach(status => {
            statusMap[status] = {
                status: status,
                count: orders.filter(o => o.status === status).length,
                sales: orders.filter(o => o.status === status).reduce((sum, o) => sum + parseFloat(o.totalAmount), 0)
            };
        });

        document.getElementById('totalSales').textContent = '$' + totalSales.toFixed(2);
        document.getElementById('totalCommission').textContent = '$' + totalCommission.toFixed(2);
        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('completedOrders').textContent = completedOrders;

        const performanceHTML = performance.map(p => `
            <tr><td>${p.name}</td><td>$${p.sales.toFixed(2)}</td><td>$${p.commission.toFixed(2)}</td><td>${p.orders}</td></tr>
        `).join('');
        document.getElementById('performanceBody').innerHTML = performanceHTML || '<tr><td colspan="4" style="text-align:center; color:#999;">暫無資料</td></tr>';

        const statusHTML = Object.values(statusMap).map(s => `
            <tr><td><span class="status-badge status-${s.status}">${s.status}</span></td><td>${s.count}</td><td>$${s.sales.toFixed(2)}</td></tr>
        `).join('');
        document.getElementById('statusBody').innerHTML = statusHTML;
    }
};

// ========== 工具函數 ==========
function showAlert(message, type = 'success') {
    const alertHTML = `
        <div class="alert alert-${type}" style="position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;">
            ${message}
        </div>
    `;
    const alertEl = document.createElement('div');
    alertEl.innerHTML = alertHTML;
    document.body.appendChild(alertEl);
    setTimeout(() => alertEl.remove(), 3000);
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    DataManager.init();
    OrderManager.initForm();
    UIManager.initEventListeners();
    document.getElementById('searchInput').addEventListener('input', () => OrderListUI.render());
    document.getElementById('statusFilter').addEventListener('change', () => OrderListUI.render());
    document.getElementById('addCustomerBtn').addEventListener('click', () => CustomerListUI.showCustomerForm());
    OrderListUI.render();
    showAlert('訂單系統已就緒！', 'success');
});