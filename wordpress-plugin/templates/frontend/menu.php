<?php
if (!defined('ABSPATH')) {
    exit;
}

$qr_code = isset($_GET['qr']) ? sanitize_text_field($_GET['qr']) : $atts['qr'];
?>

<div id="qmp-menu-container" data-qr="<?php echo esc_attr($qr_code); ?>">
    <div id="qmp-loading" class="qmp-loading">
        <div class="qmp-spinner"></div>
        <p><?php _e('Menü yükleniyor...', 'qr-menu-pro'); ?></p>
    </div>
    
    <div id="qmp-menu-content" style="display: none;">
        <!-- Restaurant Header -->
        <div class="qmp-restaurant-header">
            <h1 id="qmp-restaurant-name"></h1>
            <p id="qmp-restaurant-description"></p>
            <div class="qmp-table-info">
                <span><?php _e('Masa:', 'qr-menu-pro'); ?> <strong id="qmp-table-name"></strong></span>
            </div>
        </div>
        
        <!-- Category Filter -->
        <div class="qmp-category-filter">
            <button class="qmp-category-btn active" data-category="all">
                <?php _e('Tümü', 'qr-menu-pro'); ?>
            </button>
            <div id="qmp-categories"></div>
        </div>
        
        <!-- Products Grid -->
        <div id="qmp-products-grid" class="qmp-products-grid">
            <!-- Products will be loaded here -->
        </div>
        
        <!-- Cart -->
        <div id="qmp-cart" class="qmp-cart" style="display: none;">
            <div class="qmp-cart-header">
                <h3><?php _e('Sepet', 'qr-menu-pro'); ?></h3>
                <button id="qmp-cart-close">&times;</button>
            </div>
            <div id="qmp-cart-items"></div>
            <div class="qmp-cart-total">
                <span><?php _e('Toplam:', 'qr-menu-pro'); ?> </span>
                <strong id="qmp-cart-total-amount">₺0.00</strong>
            </div>
            <div class="qmp-cart-actions">
                <button id="qmp-order-btn" class="qmp-btn qmp-btn-primary">
                    <?php _e('Sipariş Ver', 'qr-menu-pro'); ?>
                </button>
                <button id="qmp-call-waiter-btn" class="qmp-btn qmp-btn-secondary">
                    <?php _e('Garson Çağır', 'qr-menu-pro'); ?>
                </button>
            </div>
        </div>
        
        <!-- Floating Cart Button -->
        <button id="qmp-cart-toggle" class="qmp-cart-toggle" style="display: none;">
            <span class="qmp-cart-icon">🛒</span>
            <span id="qmp-cart-count" class="qmp-cart-count">0</span>
        </button>
    </div>
    
    <div id="qmp-error" class="qmp-error" style="display: none;">
        <h3><?php _e('Hata', 'qr-menu-pro'); ?></h3>
        <p id="qmp-error-message"></p>
    </div>
</div>

<style>
.qmp-menu-container {
    max-width: 600px;
    margin: 0 auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.qmp-loading {
    text-align: center;
    padding: 60px 20px;
}

.qmp-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #2271b1;
    border-radius: 50%;
    animation: qmp-spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes qmp-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.qmp-restaurant-header {
    background: linear-gradient(135deg, #2271b1, #135e96);
    color: white;
    padding: 30px 20px;
    text-align: center;
    margin-bottom: 20px;
}

.qmp-restaurant-header h1 {
    margin: 0 0 10px 0;
    font-size: 28px;
    font-weight: 700;
}

.qmp-restaurant-header p {
    margin: 0 0 15px 0;
    opacity: 0.9;
    font-size: 16px;
}

.qmp-table-info {
    background: rgba(255,255,255,0.1);
    padding: 10px 15px;
    border-radius: 8px;
    display: inline-block;
}

.qmp-category-filter {
    padding: 0 20px 20px;
    display: flex;
    gap: 10px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.qmp-category-btn {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    color: #495057;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s;
}

.qmp-category-btn:hover,
.qmp-category-btn.active {
    background: #2271b1;
    color: white;
    border-color: #2271b1;
}

.qmp-products-grid {
    padding: 0 20px;
}

.qmp-product-card {
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    margin-bottom: 15px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    transition: transform 0.2s;
}

.qmp-product-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.qmp-product-image {
    height: 150px;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.qmp-product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.qmp-no-image {
    color: #adb5bd;
    font-size: 36px;
}

.qmp-product-info {
    padding: 15px;
}

.qmp-product-name {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: #212529;
}

.qmp-product-description {
    color: #6c757d;
    font-size: 14px;
    line-height: 1.4;
    margin: 0 0 12px 0;
}

.qmp-product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.qmp-product-price {
    font-size: 20px;
    font-weight: 700;
    color: #2271b1;
}

.qmp-add-to-cart {
    background: #2271b1;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.qmp-add-to-cart:hover {
    background: #135e96;
}

.qmp-add-to-cart:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

/* Cart Styles */
.qmp-cart {
    position: fixed;
    top: 0;
    right: 0;
    width: 100%;
    max-width: 400px;
    height: 100vh;
    background: white;
    box-shadow: -4px 0 12px rgba(0,0,0,0.15);
    z-index: 1000;
    display: flex;
    flex-direction: column;
}

.qmp-cart-header {
    background: #2271b1;
    color: white;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.qmp-cart-header h3 {
    margin: 0;
    font-size: 20px;
}

.qmp-cart-close {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
}

.qmp-cart-items {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}

.qmp-cart-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #e9ecef;
}

.qmp-cart-item:last-child {
    border-bottom: none;
}

.qmp-cart-item-info {
    flex: 1;
}

.qmp-cart-item-name {
    font-weight: 600;
    margin: 0 0 4px 0;
}

.qmp-cart-item-price {
    color: #6c757d;
    font-size: 14px;
}

.qmp-quantity-controls {
    display: flex;
    align-items: center;
    gap: 10px;
}

.qmp-quantity-btn {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-weight: bold;
}

.qmp-quantity-btn:hover {
    background: #e9ecef;
}

.qmp-cart-total {
    padding: 20px;
    border-top: 1px solid #e9ecef;
    background: #f8f9fa;
    font-size: 18px;
}

.qmp-cart-actions {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.qmp-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.qmp-btn-primary {
    background: #2271b1;
    color: white;
}

.qmp-btn-primary:hover {
    background: #135e96;
}

.qmp-btn-secondary {
    background: #6c757d;
    color: white;
}

.qmp-btn-secondary:hover {
    background: #545862;
}

.qmp-cart-toggle {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #2271b1;
    color: white;
    border: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    z-index: 999;
}

.qmp-cart-count {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #dc3545;
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
}

.qmp-error {
    text-align: center;
    padding: 60px 20px;
    color: #dc3545;
}

/* Responsive */
@media (max-width: 768px) {
    .qmp-cart {
        width: 100%;
        max-width: none;
    }
}
</style>