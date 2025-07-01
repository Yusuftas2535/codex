<?php
/**
 * Plugin Name: QR Menü Pro
 * Plugin URI: https://qr-menu-pro.com
 * Description: QR kod ile dijital menü sistemi. Restoran masalarına QR kod yerleştirin, müşteriler QR kodu okutarak menüyü görüntüleyebilsin ve sipariş verebilsin.
 * Version: 1.0.0
 * Author: QR Menü Pro
 * Author URI: https://qr-menu-pro.com
 * License: GPL v2 or later
 * Text Domain: qr-menu-pro
 */

// Doğrudan erişimi engelle
if (!defined('ABSPATH')) {
    exit;
}

// Plugin sabitleri
define('QMP_PLUGIN_URL', plugin_dir_url(__FILE__));
define('QMP_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('QMP_VERSION', '1.0.0');

class QRMenuPro {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_menu', array($this, 'admin_menu'));
        add_action('wp_ajax_qmp_upload_image', array($this, 'handle_image_upload'));
        add_action('wp_ajax_qmp_save_product', array($this, 'save_product'));
        add_action('wp_ajax_qmp_delete_product', array($this, 'delete_product'));
        add_action('wp_ajax_nopriv_qmp_get_menu', array($this, 'get_menu_data'));
        add_shortcode('qr_menu', array($this, 'qr_menu_shortcode'));
        
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
    
    public function init() {
        load_plugin_textdomain('qr-menu-pro', false, dirname(plugin_basename(__FILE__)) . '/languages');
        $this->create_tables();
    }
    
    public function enqueue_scripts() {
        wp_enqueue_script('qmp-frontend', QMP_PLUGIN_URL . 'assets/js/frontend.js', array('jquery'), QMP_VERSION);
        wp_enqueue_style('qmp-frontend', QMP_PLUGIN_URL . 'assets/css/frontend.css', array(), QMP_VERSION);
        
        wp_localize_script('qmp-frontend', 'qmp_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('qmp_nonce')
        ));
    }
    
    public function admin_menu() {
        add_menu_page(
            __('QR Menü Pro', 'qr-menu-pro'),
            __('QR Menü Pro', 'qr-menu-pro'),
            'manage_options',
            'qr-menu-pro',
            array($this, 'admin_page'),
            'dashicons-food',
            25
        );
        
        add_submenu_page(
            'qr-menu-pro',
            __('Ürünler', 'qr-menu-pro'),
            __('Ürünler', 'qr-menu-pro'),
            'manage_options',
            'qr-menu-products',
            array($this, 'products_page')
        );
        
        add_submenu_page(
            'qr-menu-pro',
            __('Kategoriler', 'qr-menu-pro'),
            __('Kategoriler', 'qr-menu-pro'),
            'manage_options',
            'qr-menu-categories',
            array($this, 'categories_page')
        );
        
        add_submenu_page(
            'qr-menu-pro',
            __('QR Kodlar', 'qr-menu-pro'),
            __('QR Kodlar', 'qr-menu-pro'),
            'manage_options',
            'qr-menu-qrcodes',
            array($this, 'qrcodes_page')
        );
    }
    
    public function admin_page() {
        include QMP_PLUGIN_PATH . 'templates/admin/dashboard.php';
    }
    
    public function products_page() {
        include QMP_PLUGIN_PATH . 'templates/admin/products.php';
    }
    
    public function categories_page() {
        include QMP_PLUGIN_PATH . 'templates/admin/categories.php';
    }
    
    public function qrcodes_page() {
        include QMP_PLUGIN_PATH . 'templates/admin/qrcodes.php';
    }
    
    public function create_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Kategoriler tablosu
        $categories_table = $wpdb->prefix . 'qmp_categories';
        $categories_sql = "CREATE TABLE $categories_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            description text,
            sort_order int(11) DEFAULT 0,
            is_active tinyint(1) DEFAULT 1,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        // Ürünler tablosu
        $products_table = $wpdb->prefix . 'qmp_products';
        $products_sql = "CREATE TABLE $products_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            category_id mediumint(9),
            name varchar(255) NOT NULL,
            description text,
            price decimal(10,2) NOT NULL,
            image_url varchar(500),
            is_available tinyint(1) DEFAULT 1,
            sort_order int(11) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY category_id (category_id)
        ) $charset_collate;";
        
        // Masalar tablosu
        $tables_table = $wpdb->prefix . 'qmp_tables';
        $tables_sql = "CREATE TABLE $tables_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            name varchar(100) NOT NULL,
            qr_code varchar(255) UNIQUE NOT NULL,
            is_active tinyint(1) DEFAULT 1,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY qr_code (qr_code)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($categories_sql);
        dbDelta($products_sql);
        dbDelta($tables_sql);
    }
    
    public function handle_image_upload() {
        check_ajax_referer('qmp_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Yetkiniz yok.', 'qr-menu-pro'));
        }
        
        if (!isset($_FILES['image'])) {
            wp_send_json_error('Dosya yüklenmedi');
        }
        
        $file = $_FILES['image'];
        
        // Dosya türü kontrolü
        $allowed_types = array('image/jpeg', 'image/jpg', 'image/png', 'image/gif');
        if (!in_array($file['type'], $allowed_types)) {
            wp_send_json_error('Sadece resim dosyaları yüklenebilir');
        }
        
        // Boyut kontrolü (5MB)
        if ($file['size'] > 5 * 1024 * 1024) {
            wp_send_json_error('Dosya boyutu 5MB\'dan küçük olmalıdır');
        }
        
        $upload_result = wp_handle_upload($file, array('test_form' => false));
        
        if (isset($upload_result['error'])) {
            wp_send_json_error($upload_result['error']);
        }
        
        wp_send_json_success(array('url' => $upload_result['url']));
    }
    
    public function save_product() {
        check_ajax_referer('qmp_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Yetkiniz yok.', 'qr-menu-pro'));
        }
        
        global $wpdb;
        
        $product_data = array(
            'name' => sanitize_text_field($_POST['name']),
            'description' => sanitize_textarea_field($_POST['description']),
            'price' => floatval($_POST['price']),
            'category_id' => intval($_POST['category_id']) ?: null,
            'image_url' => esc_url_raw($_POST['image_url']),
            'is_available' => isset($_POST['is_available']) ? 1 : 0,
            'sort_order' => intval($_POST['sort_order'])
        );
        
        $table_name = $wpdb->prefix . 'qmp_products';
        
        if (isset($_POST['product_id']) && $_POST['product_id']) {
            // Güncelleme
            $result = $wpdb->update(
                $table_name,
                $product_data,
                array('id' => intval($_POST['product_id']))
            );
        } else {
            // Yeni ekleme
            $result = $wpdb->insert($table_name, $product_data);
        }
        
        if ($result !== false) {
            wp_send_json_success('Ürün başarıyla kaydedildi');
        } else {
            wp_send_json_error('Ürün kaydedilemedi');
        }
    }
    
    public function delete_product() {
        check_ajax_referer('qmp_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Yetkiniz yok.', 'qr-menu-pro'));
        }
        
        global $wpdb;
        
        $product_id = intval($_POST['product_id']);
        $table_name = $wpdb->prefix . 'qmp_products';
        
        $result = $wpdb->delete($table_name, array('id' => $product_id));
        
        if ($result !== false) {
            wp_send_json_success('Ürün silindi');
        } else {
            wp_send_json_error('Ürün silinemedi');
        }
    }
    
    public function get_menu_data() {
        global $wpdb;
        
        $qr_code = sanitize_text_field($_GET['qr']);
        
        // Masa bilgisini al
        $table = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}qmp_tables WHERE qr_code = %s AND is_active = 1",
            $qr_code
        ));
        
        if (!$table) {
            wp_send_json_error('Geçersiz QR kod');
        }
        
        // Kategorileri al
        $categories = $wpdb->get_results(
            "SELECT * FROM {$wpdb->prefix}qmp_categories WHERE is_active = 1 ORDER BY sort_order, name"
        );
        
        // Ürünleri al
        $products = $wpdb->get_results(
            "SELECT * FROM {$wpdb->prefix}qmp_products WHERE is_available = 1 ORDER BY sort_order, name"
        );
        
        wp_send_json_success(array(
            'table' => $table,
            'categories' => $categories,
            'products' => $products,
            'restaurant' => array(
                'name' => get_bloginfo('name'),
                'description' => get_bloginfo('description')
            )
        ));
    }
    
    public function qr_menu_shortcode($atts) {
        $atts = shortcode_atts(array(
            'qr' => ''
        ), $atts);
        
        if (empty($atts['qr'])) {
            return '<p>QR kod belirtilmedi.</p>';
        }
        
        ob_start();
        include QMP_PLUGIN_PATH . 'templates/frontend/menu.php';
        return ob_get_clean();
    }
    
    public function activate() {
        $this->create_tables();
        flush_rewrite_rules();
    }
    
    public function deactivate() {
        flush_rewrite_rules();
    }
}

// Plugin'i başlat
new QRMenuPro();
?>