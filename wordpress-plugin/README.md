# QR Menü Pro - WordPress Eklentisi

QR kod ile dijital menü sistemi WordPress eklentisi. Restoran masalarına QR kod yerleştirin, müşteriler QR kodu okutarak menüyü görüntüleyebilsin ve sipariş verebilsin.

## Özellikler

- ✅ **Ürün Yönetimi**: Sürükle-bırak dosya yükleme ile görsel ekleme
- ✅ **Kategori Sistemi**: Menü kategorileri ve filtreleme
- ✅ **QR Kod Üretimi**: Her masa için benzersiz QR kodlar
- ✅ **Mobil Uyumlu Menü**: Responsive tasarım
- ✅ **Sepet Sistemi**: Müşteri sipariş yönetimi
- ✅ **Garson Çağrı Sistemi**: Anlık servis talepleri
- ✅ **WordPress Entegrasyonu**: Shortcode ve widget desteği

## Kurulum

### 1. Manuel Kurulum
1. `qr-menu-pro` klasörünü `/wp-content/plugins/` dizinine yükleyin
2. WordPress yönetim panelinden eklentiyi etkinleştirin
3. **QR Menü Pro** menüsünden ayarları yapılandırın

### 2. Zip Dosyası ile Kurulum
1. Eklenti klasörünü zip olarak sıkıştırın
2. WordPress yönetim paneli > Eklentiler > Yeni Ekle > Eklenti Yükle
3. Zip dosyasını seçin ve yükleyin

## Kullanım

### Ürün Ekleme
1. **QR Menü Pro > Ürünler** sayfasına gidin
2. **Yeni Ürün Ekle** butonuna tıklayın
3. Ürün bilgilerini doldurun:
   - Ürün adı (zorunlu)
   - Açıklama
   - Fiyat (zorunlu) 
   - Kategori
   - Görsel (sürükle-bırak veya URL)
   - Müsaitlik durumu

### Görsel Yükleme
Eklenti iki yöntemle görsel yüklemeyi destekler:

#### Dosya Yükleme
- Görseli sürükleyip modal üzerine bırakın
- Veya "Görsel Yükle" butonuna tıklayın
- Desteklenen formatlar: JPG, PNG, GIF
- Maksimum boyut: 5MB

#### URL ile Ekleme
- "URL girin" alanına görsel linkini yapıştırın
- Harici görseller de desteklenir

### Kategori Yönetimi
1. **QR Menü Pro > Kategoriler** sayfasına gidin
2. Yeni kategori ekleyin veya mevcut kategorileri düzenleyin
3. Sıralama düzenini ayarlayın

### QR Kod Oluşturma
1. **QR Menü Pro > QR Kodlar** sayfasına gidin
2. Masa adı girin ve QR kod oluşturun
3. QR kodu yazdırın ve masaya yerleştirin

### Shortcode Kullanımı
Menüyü herhangi bir sayfada göstermek için:

```php
[qr_menu qr="masa-001"]
```

### Template Özelleştirme
Menü görünümünü özelleştirmek için tema dosyalarını kullanın:

```php
// themes/your-theme/qr-menu-pro/menu.php
// Bu dosya eklenti template'ini override eder
```

## Teknik Özellikler

### Veritabanı Tabloları
- `wp_qmp_products` - Ürün bilgileri
- `wp_qmp_categories` - Kategori bilgileri  
- `wp_qmp_tables` - Masa ve QR kod bilgileri

### AJAX Endpoints
- `wp_ajax_qmp_upload_image` - Görsel yükleme
- `wp_ajax_qmp_save_product` - Ürün kaydetme
- `wp_ajax_qmp_delete_product` - Ürün silme
- `wp_ajax_nopriv_qmp_get_menu` - Menü verilerini alma (public)

### Hooks ve Filterlar

#### Action Hooks
```php
// Ürün kaydedildiğinde çalışır
do_action('qmp_product_saved', $product_id, $product_data);

// Ürün silindiğinde çalışır  
do_action('qmp_product_deleted', $product_id);

// Sipariş verildiğinde çalışır
do_action('qmp_order_placed', $order_data);
```

#### Filter Hooks
```php
// Menü verilerini filtreleme
$menu_data = apply_filters('qmp_menu_data', $menu_data, $qr_code);

// Ürün kartı HTML'ini filtreleme
$product_html = apply_filters('qmp_product_card_html', $html, $product);

// Sepet verilerini filtreleme
$cart_data = apply_filters('qmp_cart_data', $cart_data);
```

## Özelleştirme Örnekleri

### CSS Özelleştirme
```css
/* Menü renk şemasını değiştirme */
.qmp-restaurant-header {
    background: linear-gradient(135deg, #ff6b6b, #ee5a24) !important;
}

.qmp-category-btn.active,
.qmp-add-to-cart {
    background: #ff6b6b !important;
}
```

### JavaScript Hook'ları
```javascript
// Sepete ekleme olayını dinleme
jQuery(document).on('qmp_product_added_to_cart', function(e, productId, quantity) {
    console.log('Ürün sepete eklendi:', productId);
});

// Sipariş tamamlama olayını dinleme
jQuery(document).on('qmp_order_completed', function(e, orderData) {
    // Google Analytics tracking vs.
});
```

### PHP Özelleştirme
```php
// functions.php dosyasına ekleyin

// Özel ürün alanları ekleme
add_filter('qmp_product_fields', function($fields) {
    $fields['allergens'] = 'Alerjenler';
    $fields['calories'] = 'Kalori';
    return $fields;
});

// Menü verilerini özelleştirme
add_filter('qmp_menu_data', function($data, $qr_code) {
    // Özel restoran bilgileri ekleme
    $data['restaurant']['phone'] = '+90 555 123 4567';
    $data['restaurant']['address'] = 'İstanbul, Türkiye';
    return $data;
}, 10, 2);
```

## Performans İpuçları

### Görsel Optimizasyonu
- Görselleri yüklemeden önce sıkıştırın
- WebP formatını tercih edin
- CDN kullanımını düşünün

### Önbellek Optimizasyonu
```php
// Menü verilerini önbellekte tutma
add_filter('qmp_menu_cache_duration', function($duration) {
    return 3600; // 1 saat
});
```

### Veritabanı Optimizasyonu
- Büyük menüler için sayfalama kullanın
- İndeks optimizasyonlarını kontrol edin

## Güvenlik

### Dosya Yükleme Güvenliği
- Sadece resim dosyaları kabul edilir
- Dosya boyutu 5MB ile sınırlı
- WordPress media security kuralları uygulanır

### Nonce Koruması
Tüm AJAX işlemleri nonce ile korunur:
```php
wp_verify_nonce($_POST['nonce'], 'qmp_nonce');
```

### Yetki Kontrolü
Admin işlemleri için yetki kontrolü:
```php
if (!current_user_can('manage_options')) {
    wp_die('Yetkiniz yok.');
}
```

## Sorun Giderme

### Yaygın Sorunlar

**Görseller yüklenmiyor**
- Upload klasörü yazma izinlerini kontrol edin
- PHP max_upload_size ayarını kontrol edin
- WordPress media ayarlarını kontrol edin

**QR kod çalışmıyor**
- URL rewrite kurallarını kontrol edin
- .htaccess dosyasını yenileyin
- Permalink ayarlarını kaydedin

**AJAX çalışmıyor**
- JavaScript konsol hatalarını kontrol edin
- Plugin çakışması olup olmadığını test edin
- WordPress AJAX URL'ini kontrol edin

### Debug Modu
```php
// wp-config.php dosyasına ekleyin
define('QMP_DEBUG', true);

// Debug logları
if (defined('QMP_DEBUG') && QMP_DEBUG) {
    error_log('QMP Debug: ' . $message);
}
```

## Lisans

Bu eklenti GPL v2 veya üstü lisansı altında dağıtılmaktadır.

## Destek

Teknik destek ve özellik istekleri için:
- GitHub Issues
- WordPress.org destek forumu
- Email: support@qr-menu-pro.com

## Değişiklik Geçmişi

### v1.0.0
- İlk sürüm
- Temel ürün yönetimi
- QR kod sistemi
- Mobil menü arayüzü
- Dosya yükleme sistemi