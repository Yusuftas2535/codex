<?php
if (!defined('ABSPATH')) {
    exit;
}

global $wpdb;

// Kategorileri al
$categories = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}qmp_categories WHERE is_active = 1 ORDER BY sort_order, name");

// Ürünleri al
$products = $wpdb->get_results("SELECT p.*, c.name as category_name FROM {$wpdb->prefix}qmp_products p LEFT JOIN {$wpdb->prefix}qmp_categories c ON p.category_id = c.id ORDER BY p.sort_order, p.name");
?>

<div class="wrap">
    <h1><?php _e('Ürünler', 'qr-menu-pro'); ?></h1>
    
    <div class="qmp-admin-container">
        <div class="qmp-header">
            <button id="add-product-btn" class="button button-primary">
                <?php _e('Yeni Ürün Ekle', 'qr-menu-pro'); ?>
            </button>
        </div>
        
        <div class="qmp-products-grid">
            <?php if (empty($products)): ?>
                <div class="qmp-empty-state">
                    <h3><?php _e('Henüz ürün yok', 'qr-menu-pro'); ?></h3>
                    <p><?php _e('İlk ürününüzü ekleyerek başlayın', 'qr-menu-pro'); ?></p>
                </div>
            <?php else: ?>
                <?php foreach ($products as $product): ?>
                    <div class="qmp-product-card" data-id="<?php echo $product->id; ?>">
                        <div class="qmp-product-image">
                            <?php if ($product->image_url): ?>
                                <img src="<?php echo esc_url($product->image_url); ?>" alt="<?php echo esc_attr($product->name); ?>">
                            <?php else: ?>
                                <div class="qmp-no-image">
                                    <span class="dashicons dashicons-format-image"></span>
                                </div>
                            <?php endif; ?>
                            <?php if (!$product->is_available): ?>
                                <div class="qmp-unavailable-overlay">
                                    <span><?php _e('Tükendi', 'qr-menu-pro'); ?></span>
                                </div>
                            <?php endif; ?>
                        </div>
                        
                        <div class="qmp-product-info">
                            <h4><?php echo esc_html($product->name); ?></h4>
                            <p class="qmp-product-description"><?php echo esc_html($product->description); ?></p>
                            <div class="qmp-product-meta">
                                <span class="qmp-price">₺<?php echo number_format($product->price, 2); ?></span>
                                <?php if ($product->category_name): ?>
                                    <span class="qmp-category"><?php echo esc_html($product->category_name); ?></span>
                                <?php endif; ?>
                            </div>
                        </div>
                        
                        <div class="qmp-product-actions">
                            <button class="button edit-product" data-id="<?php echo $product->id; ?>">
                                <?php _e('Düzenle', 'qr-menu-pro'); ?>
                            </button>
                            <button class="button button-link-delete delete-product" data-id="<?php echo $product->id; ?>">
                                <?php _e('Sil', 'qr-menu-pro'); ?>
                            </button>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>
</div>

<!-- Ürün Modal -->
<div id="product-modal" class="qmp-modal" style="display: none;">
    <div class="qmp-modal-content">
        <div class="qmp-modal-header">
            <h2 id="modal-title"><?php _e('Yeni Ürün Ekle', 'qr-menu-pro'); ?></h2>
            <button class="qmp-modal-close">&times;</button>
        </div>
        
        <form id="product-form">
            <input type="hidden" id="product-id" name="product_id">
            
            <div class="qmp-form-group">
                <label for="product-name"><?php _e('Ürün Adı', 'qr-menu-pro'); ?> *</label>
                <input type="text" id="product-name" name="name" required>
            </div>
            
            <div class="qmp-form-group">
                <label for="product-description"><?php _e('Açıklama', 'qr-menu-pro'); ?></label>
                <textarea id="product-description" name="description" rows="3"></textarea>
            </div>
            
            <div class="qmp-form-row">
                <div class="qmp-form-group">
                    <label for="product-price"><?php _e('Fiyat', 'qr-menu-pro'); ?> *</label>
                    <input type="number" id="product-price" name="price" step="0.01" min="0" required>
                </div>
                
                <div class="qmp-form-group">
                    <label for="product-category"><?php _e('Kategori', 'qr-menu-pro'); ?></label>
                    <select id="product-category" name="category_id">
                        <option value=""><?php _e('Kategori Seç', 'qr-menu-pro'); ?></option>
                        <?php foreach ($categories as $category): ?>
                            <option value="<?php echo $category->id; ?>">
                                <?php echo esc_html($category->name); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>
            
            <div class="qmp-form-group">
                <label for="product-image"><?php _e('Ürün Görseli', 'qr-menu-pro'); ?></label>
                <div class="qmp-image-upload">
                    <input type="hidden" id="product-image-url" name="image_url">
                    <div id="image-preview" class="qmp-image-preview" style="display: none;">
                        <img id="preview-img" src="" alt="">
                        <button type="button" class="qmp-remove-image">&times;</button>
                    </div>
                    <div id="upload-area" class="qmp-upload-area">
                        <input type="file" id="image-file" accept="image/*" style="display: none;">
                        <button type="button" id="upload-btn" class="button">
                            <?php _e('Görsel Yükle', 'qr-menu-pro'); ?>
                        </button>
                        <p><?php _e('veya URL girin:', 'qr-menu-pro'); ?></p>
                        <input type="url" id="image-url-input" placeholder="https://example.com/image.jpg">
                    </div>
                </div>
            </div>
            
            <div class="qmp-form-row">
                <div class="qmp-form-group">
                    <label for="product-sort-order"><?php _e('Sıralama', 'qr-menu-pro'); ?></label>
                    <input type="number" id="product-sort-order" name="sort_order" value="0">
                </div>
                
                <div class="qmp-form-group">
                    <label>
                        <input type="checkbox" id="product-available" name="is_available" checked>
                        <?php _e('Müsait', 'qr-menu-pro'); ?>
                    </label>
                </div>
            </div>
            
            <div class="qmp-form-actions">
                <button type="button" class="button cancel-btn"><?php _e('İptal', 'qr-menu-pro'); ?></button>
                <button type="submit" class="button button-primary"><?php _e('Kaydet', 'qr-menu-pro'); ?></button>
            </div>
        </form>
    </div>
</div>

<style>
.qmp-admin-container {
    max-width: 1200px;
    margin: 20px 0;
}

.qmp-header {
    margin-bottom: 20px;
}

.qmp-products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.qmp-product-card {
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.2s;
}

.qmp-product-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.qmp-product-image {
    height: 200px;
    position: relative;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
}

.qmp-product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.qmp-no-image {
    color: #999;
    font-size: 48px;
}

.qmp-unavailable-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
}

.qmp-product-info {
    padding: 15px;
}

.qmp-product-info h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
}

.qmp-product-description {
    color: #666;
    font-size: 14px;
    margin: 0 0 10px 0;
    line-height: 1.4;
}

.qmp-product-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.qmp-price {
    font-size: 18px;
    font-weight: bold;
    color: #2271b1;
}

.qmp-category {
    background: #f0f0f1;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    color: #666;
}

.qmp-product-actions {
    padding: 15px;
    border-top: 1px solid #eee;
    display: flex;
    gap: 10px;
}

.qmp-empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px 20px;
    color: #666;
}

/* Modal Styles */
.qmp-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.qmp-modal-content {
    background: white;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    border-radius: 8px;
}

.qmp-modal-header {
    padding: 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.qmp-modal-header h2 {
    margin: 0;
}

.qmp-modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
}

.qmp-form-group {
    margin-bottom: 20px;
}

.qmp-form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
}

.qmp-form-group input,
.qmp-form-group textarea,
.qmp-form-group select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.qmp-form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.qmp-image-upload {
    border: 2px dashed #ddd;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
}

.qmp-image-preview {
    position: relative;
    display: inline-block;
}

.qmp-image-preview img {
    max-width: 200px;
    max-height: 150px;
    border-radius: 4px;
}

.qmp-remove-image {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #dc3232;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
}

.qmp-form-actions {
    padding: 20px;
    border-top: 1px solid #eee;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

#product-form {
    padding: 20px;
}
</style>

<script>
jQuery(document).ready(function($) {
    // Modal açma/kapama
    $('#add-product-btn').click(function() {
        $('#modal-title').text('<?php _e('Yeni Ürün Ekle', 'qr-menu-pro'); ?>');
        $('#product-form')[0].reset();
        $('#product-id').val('');
        $('#image-preview').hide();
        $('#upload-area').show();
        $('#product-modal').show();
    });
    
    $('.qmp-modal-close, .cancel-btn').click(function() {
        $('#product-modal').hide();
    });
    
    // Ürün düzenleme
    $('.edit-product').click(function() {
        var productId = $(this).data('id');
        // AJAX ile ürün bilgilerini al ve formu doldur
        // Bu kısım gerçek implementasyonda AJAX çağrısı olacak
        $('#modal-title').text('<?php _e('Ürün Düzenle', 'qr-menu-pro'); ?>');
        $('#product-modal').show();
    });
    
    // Görsel yükleme
    $('#upload-btn').click(function() {
        $('#image-file').click();
    });
    
    $('#image-file').change(function() {
        var file = this.files[0];
        if (file) {
            var formData = new FormData();
            formData.append('action', 'qmp_upload_image');
            formData.append('image', file);
            formData.append('nonce', '<?php echo wp_create_nonce('qmp_nonce'); ?>');
            
            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    if (response.success) {
                        $('#product-image-url').val(response.data.url);
                        $('#preview-img').attr('src', response.data.url);
                        $('#image-preview').show();
                        $('#upload-area').hide();
                    } else {
                        alert(response.data);
                    }
                }
            });
        }
    });
    
    // URL ile görsel ekleme
    $('#image-url-input').change(function() {
        var url = $(this).val();
        if (url) {
            $('#product-image-url').val(url);
            $('#preview-img').attr('src', url);
            $('#image-preview').show();
            $('#upload-area').hide();
        }
    });
    
    // Görseli kaldır
    $('.qmp-remove-image').click(function() {
        $('#product-image-url').val('');
        $('#image-url-input').val('');
        $('#image-preview').hide();
        $('#upload-area').show();
    });
    
    // Form gönderimi
    $('#product-form').submit(function(e) {
        e.preventDefault();
        
        var formData = $(this).serialize();
        formData += '&action=qmp_save_product&nonce=<?php echo wp_create_nonce('qmp_nonce'); ?>';
        
        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: formData,
            success: function(response) {
                if (response.success) {
                    location.reload();
                } else {
                    alert(response.data);
                }
            }
        });
    });
    
    // Ürün silme
    $('.delete-product').click(function() {
        if (confirm('<?php _e('Bu ürünü silmek istediğinizden emin misiniz?', 'qr-menu-pro'); ?>')) {
            var productId = $(this).data('id');
            
            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'qmp_delete_product',
                    product_id: productId,
                    nonce: '<?php echo wp_create_nonce('qmp_nonce'); ?>'
                },
                success: function(response) {
                    if (response.success) {
                        location.reload();
                    } else {
                        alert(response.data);
                    }
                }
            });
        }
    });
});
</script>