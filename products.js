/**
 * 產品資料管理 - 從 viebucks-coffee 儲存庫自動導入
 * 支持多語言：越南文(vi), 中文(zh), 英文(en)
 */

const ProductManager = {
    VIEBUCKS_REPO_URL: 'https://raw.githubusercontent.com/rick0960590177/viebucks-coffee/main/index.html',
    CACHE_KEY: 'viebucks_products_cache',
    CACHE_DURATION: 24 * 60 * 60 * 1000, // 24小時

    // 本地備用產品資料
    defaultProducts: [
        { id: "p1", type: "bean", name: { vi: "Cà phê hạt Arabica 100% (250g)", zh: "Arabica 100% 單品豆 (250g)", en: "Arabica 100% Beans (250g)" }, price: 145000, wholesale: 125000 },
        { id: "p2", type: "bean", name: { vi: "Cà phê hạt Arabica 100% (500g)", zh: "Arabica 100% 單品豆 (500g)", en: "Arabica 100% Beans (500g)" }, price: 280000, wholesale: 240000 },
        { id: "p5", type: "cold", name: { vi: "Cà phê ủ lạnh Arabica 100% (10 túi/túi)", zh: "Arabica 100% 冷萃包 (10包/袋)", en: "Arabica 100% Cold Brew (10 pkts/bag)" }, price: 155000, wholesale: 135000 },
        { id: "p5_30", type: "cold", name: { vi: "Cà phê ủ lạnh Arabica 100% (30 túi/túi)", zh: "Arabica 100% 冷萃包 (30包/袋)", en: "Arabica 100% Cold Brew (30 pkts/bag)" }, price: 430000, wholesale: 380000 },
        { id: "p_ah_250", type: "bean", name: { vi: "Cà phê hạt Arabica Honey chế biến mật (250g)", zh: "Arabica Honey 蜜處理單品豆 (250g)", en: "Arabica Honey Process Beans (250g)" }, price: 155000, wholesale: 135000 },
        { id: "p_ah_500", type: "bean", name: { vi: "Cà phê hạt Arabica Honey chế biến mật (500g)", zh: "Arabica Honey 蜜處理單品豆 (500g)", en: "Arabica Honey Process Beans (500g)" }, price: 295000, wholesale: 255000 },
        { id: "p_ah_cb10", type: "cold", name: { vi: "Cà phê ủ lạnh Arabica Honey (10 túi/túi)", zh: "Arabica Honey 蜜處理冷萃包 (10包/袋)", en: "Arabica Honey Cold Brew (10 pkts/bag)" }, price: 165000, wholesale: 145000 },
        { id: "p_ah_cb30", type: "cold", name: { vi: "Cà phê ủ lạnh Arabica Honey (30 túi/túi)", zh: "Arabica Honey 蜜處理冷萃包 (30包/袋)", en: "Arabica Honey Cold Brew (30 pkts/bag)" }, price: 450000, wholesale: 400000 },
        { id: "p6", type: "bean", name: { vi: "Cà phê hạt Robusta 100% (250g)", zh: "Robusta 100% 單品豆 (250g)", en: "Robusta 100% Beans (250g)" }, price: 91000, wholesale: 78000 },
        { id: "p7", type: "bean", name: { vi: "Cà phê hạt Robusta 100% (500g)", zh: "Robusta 100% 單品豆 (500g)", en: "Robusta 100% Beans (500g)" }, price: 172000, wholesale: 148000 },
        { id: "p10", type: "cold", name: { vi: "Cà phê ủ lạnh Robusta 100% (10 túi/túi)", zh: "Robusta 100% 冷萃包 (10包/袋)", en: "Robusta 100% Cold Brew (10 pkts/bag)" }, price: 105000, wholesale: 90000 },
        { id: "p10_30", type: "cold", name: { vi: "Cà phê ủ lạnh Robusta 100% (30 túi/túi)", zh: "Robusta 100% 冷萃包 (30包/袋)", en: "Robusta 100% Cold Brew (30 pkts/bag)" }, price: 300000, wholesale: 260000 },
        { id: "p10_jas", type: "cold", name: { vi: "Cà phê ủ lạnh Robusta - Hương hoa nhài (10 túi/túi)", zh: "Robusta 冷萃包 - 茉莉花風味 (10包/袋)", en: "Robusta Cold Brew - Jasmine (10 pkts/bag)" }, price: 115000, wholesale: 100000 },
        { id: "p10_jas_30", type: "cold", name: { vi: "Cà phê ủ lạnh Robusta - Hương hoa nhài (30 túi/túi)", zh: "Robusta 冷萃包 - 茉莉花風味 (30包/袋)", en: "Robusta Cold Brew - Jasmine (30 pkts/bag)" }, price: 320000, wholesale: 280000 },
        { id: "p_rh_250", type: "bean", name: { vi: "Cà phê hạt Robusta Honey chế biến mật (250g)", zh: "Robusta Honey 蜜處理單品豆 (250g)", en: "Robusta Honey Process Beans (250g)" }, price: 105000, wholesale: 90000 },
        { id: "p_rh_500", type: "bean", name: { vi: "Cà phê hạt Robusta Honey chế biến mật (500g)", zh: "Robusta Honey 蜜處理單品豆 (500g)", en: "Robusta Honey Process Beans (500g)" }, price: 198000, wholesale: 170000 },
        { id: "p_rh_cb10", type: "cold", name: { vi: "Cà phê ủ lạnh Robusta Honey (10 túi/túi)", zh: "Robusta Honey 蜜處理冷萃包 (10包/袋)", en: "Robusta Honey Cold Brew (10 pkts/bag)" }, price: 120000, wholesale: 105000 },
        { id: "p_rh_cb30", type: "cold", name: { vi: "Cà phê ủ lạnh Robusta Honey (30 túi/túi)", zh: "Robusta Honey 蜜處理冷萃包 (30包/袋)", en: "Robusta Honey Cold Brew (30 pkts/bag)" }, price: 330000, wholesale: 290000 },
        { id: "p16", type: "blend", name: { vi: "Cà phê phối trộn Blend 80/20 Espresso (250g)", zh: "經典精品義式拼配 80/20 (250g)", en: "Specialty Espresso Blend 80/20 (250g)" }, price: 135000, wholesale: 115000 },
        { id: "p17", type: "blend", name: { vi: "Cà phê phối trộn Blend 80/20 Espresso (500g)", zh: "經典精品義式拼配 80/20 (500g)", en: "Specialty Espresso Blend 80/20 (500g)" }, price: 260000, wholesale: 225000 },
        { id: "p20", type: "blend", name: { vi: "Cà phê phối trộn Blend 70/30 Thương mại (250g)", zh: "商業義式平衡拼配 70/30 (250g)", en: "Commercial Espresso Blend 70/30 (250g)" }, price: 120000, wholesale: 105000 },
        { id: "p21", type: "blend", name: { vi: "Cà phê phối trộn Blend 70/30 Thương mại (500g)", zh: "商業義式平衡拼配 70/30 (500g)", en: "Commercial Espresso Blend 70/30 (500g)" }, price: 230000, wholesale: 200000 },
        { id: "p24", type: "blend", name: { vi: "Cà phê phối trộn Blend 50/50 Phong cách Nam Ý (250g)", zh: "南義風格醇厚拼配 50/50 (250g)", en: "Southern Italian Blend 50/50 (250g)" }, price: 110000, wholesale: 95000 },
        { id: "p25", type: "blend", name: { vi: "Cà phê phối trộn Blend 50/50 Phong cách Nam Ý (500g)", zh: "南義風格醇厚拼配 50/50 (500g)", en: "Southern Italian Blend 50/50 (500g)" }, price: 215000, wholesale: 185000 },
    ],

    /**
     * 從 viebucks-coffee 儲存庫提取產品資料
     */
    async fetchProductsFromGitHub() {
        try {
            // 先檢查快取
            const cached = this.getCachedProducts();
            if (cached) {
                console.log('✅ 使用快取的產品資料');
                return cached;
            }

            console.log('🔄 正在從 GitHub 導入產品資料...');
            const response = await fetch(this.VIEBUCKS_REPO_URL);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const html = await response.text();
            const products = this.extractProductsFromHTML(html);

            if (products && products.length > 0) {
                // 保存到快取
                this.cacheProducts(products);
                console.log(`✅ 成功導入 ${products.length} 項商品`);
                return products;
            } else {
                console.warn('⚠️ 無法從 HTML 提取產品，使用本地備用資料');
                return this.defaultProducts;
            }
        } catch (error) {
            console.error('❌ 導入失敗:', error);
            console.log('📦 使用本地備用產品資料');
            return this.defaultProducts;
        }
    },

    /**
     * 從 HTML 中提取 productsData
     */
    extractProductsFromHTML(html) {
        try {
            // 使用正則表達式找到 productsData 的內容
            const match = html.match(/const\s+productsData\s*=\s*\[([\s\S]*?)\];/);
            
            if (!match) {
                console.warn('⚠️ 無法在 HTML 中找到 productsData');
                return null;
            }

            // 將 JavaScript 物件轉換為 JSON
            const productsStr = '[' + match[1] + ']';
            
            // 安全地評估 JavaScript 物件字面量
            const products = eval(productsStr);
            
            return products;
        } catch (error) {
            console.error('❌ 解析產品資料失敗:', error);
            return null;
        }
    },

    /**
     * 取得快取的產品
     */
    getCachedProducts() {
        const cached = localStorage.getItem(this.CACHE_KEY);
        if (!cached) return null;

        try {
            const data = JSON.parse(cached);
            const now = Date.now();
            
            // 檢查快取是否過期
            if (now - data.timestamp > this.CACHE_DURATION) {
                localStorage.removeItem(this.CACHE_KEY);
                return null;
            }

            return data.products;
        } catch (error) {
            console.error('❌ 讀取快取失敗:', error);
            return null;
        }
    },

    /**
     * 保存產品到快取
     */
    cacheProducts(products) {
        try {
            const data = {
                products: products,
                timestamp: Date.now()
            };
            localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
            console.log('✅ 產品資料已快取');
        } catch (error) {
            console.error('❌ 快取失敗:', error);
        }
    },

    /**
     * 清除快取
     */
    clearCache() {
        localStorage.removeItem(this.CACHE_KEY);
        console.log('✅ 快取已清除');
    },

    /**
     * 獲取特定語言的產品名稱
     */
    getProductName(product, lang = 'vi') {
        if (!product.name) return '未知商品';
        return product.name[lang] || product.name.vi || '未知商品';
    },

    /**
     * 按類別篩選產品
     */
    filterByType(products, type) {
        if (!type || type === 'all') return products;
        return products.filter(p => p.type === type);
    },

    /**
     * 獲取批發價
     */
    getPrice(product, quantity = 1) {
        if (quantity >= 10 && product.wholesale) {
            return product.wholesale;
        }
        return product.price;
    },

    /**
     * 計算折扣
     */
    calculateDiscount(product, quantity) {
        if (quantity < 10) {
            return 0; // 無折扣
        }
        const originalPrice = product.price;
        const wholesalePrice = product.wholesale || product.price;
        const discountPercent = Math.round(((originalPrice - wholesalePrice) / originalPrice) * 100);
        return discountPercent;
    }
};

// 初始化時自動加載產品
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 初始化產品管理系統...');
    const products = await ProductManager.fetchProductsFromGitHub();
    console.log('📦 產品資料已加載:', products.length, '項');
});
