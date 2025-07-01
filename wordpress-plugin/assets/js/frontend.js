jQuery(document).ready(function($) {
    let cart = [];
    let menuData = null;
    
    // Initialize menu
    function initMenu() {
        const qrCode = $('#qmp-menu-container').data('qr');
        
        if (!qrCode) {
            showError('QR kod bulunamadı');
            return;
        }
        
        loadMenuData(qrCode);
    }
    
    // Load menu data via AJAX
    function loadMenuData(qrCode) {
        $.ajax({
            url: qmp_ajax.ajax_url,
            type: 'GET',
            data: {
                action: 'qmp_get_menu',
                qr: qrCode
            },
            success: function(response) {
                if (response.success) {
                    menuData = response.data;
                    renderMenu();
                } else {
                    showError(response.data || 'Menü yüklenemedi');
                }
            },
            error: function() {
                showError('Bağlantı hatası');
            }
        });
    }
    
    // Render menu content
    function renderMenu() {
        if (!menuData) return;
        
        // Restaurant info
        $('#qmp-restaurant-name').text(menuData.restaurant.name);
        $('#qmp-restaurant-description').text(menuData.restaurant.description);
        $('#qmp-table-name').text(menuData.table.name);
        
        // Categories
        renderCategories();
        
        // Products
        renderProducts();
        
        // Show menu
        $('#qmp-loading').hide();
        $('#qmp-menu-content').show();
    }
    
    // Render categories
    function renderCategories() {
        const $categories = $('#qmp-categories');
        $categories.empty();
        
        menuData.categories.forEach(function(category) {
            const $btn = $('<button>')
                .addClass('qmp-category-btn')
                .attr('data-category', category.id)
                .text(category.name);
            
            $categories.append($btn);
        });
    }
    
    // Render products
    function renderProducts(categoryFilter = null) {
        const $grid = $('#qmp-products-grid');
        $grid.empty();
        
        let filteredProducts = menuData.products;
        if (categoryFilter && categoryFilter !== 'all') {
            filteredProducts = menuData.products.filter(p => p.category_id == categoryFilter);
        }
        
        filteredProducts.forEach(function(product) {
            const $card = createProductCard(product);
            $grid.append($card);
        });
    }
    
    // Create product card
    function createProductCard(product) {
        const $card = $('<div>').addClass('qmp-product-card');
        
        // Product image
        const $image = $('<div>').addClass('qmp-product-image');
        if (product.image_url) {
            $image.html(`<img src="${product.image_url}" alt="${product.name}">`);
        } else {
            $image.html('<div class="qmp-no-image">🍽️</div>');
        }
        
        // Product info
        const $info = $('<div>').addClass('qmp-product-info');
        
        const $name = $('<h3>').addClass('qmp-product-name').text(product.name);
        $info.append($name);
        
        if (product.description) {
            const $desc = $('<p>').addClass('qmp-product-description').text(product.description);
            $info.append($desc);
        }
        
        // Product footer
        const $footer = $('<div>').addClass('qmp-product-footer');
        const $price = $('<span>').addClass('qmp-product-price').text(`₺${parseFloat(product.price).toFixed(2)}`);
        
        const $addBtn = $('<button>')
            .addClass('qmp-add-to-cart')
            .text('Sepete Ekle')
            .data('product-id', product.id)
            .prop('disabled', !product.is_available);
        
        if (!product.is_available) {
            $addBtn.text('Tükendi');
        }
        
        $footer.append($price, $addBtn);
        $info.append($footer);
        
        $card.append($image, $info);
        return $card;
    }
    
    // Add to cart
    function addToCart(productId) {
        const product = menuData.products.find(p => p.id == productId);
        if (!product) return;
        
        const existingItem = cart.find(item => item.id == productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: productId,
                name: product.name,
                price: parseFloat(product.price),
                quantity: 1
            });
        }
        
        updateCartUI();
    }
    
    // Remove from cart
    function removeFromCart(productId) {
        const itemIndex = cart.findIndex(item => item.id == productId);
        if (itemIndex > -1) {
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity--;
            } else {
                cart.splice(itemIndex, 1);
            }
        }
        
        updateCartUI();
    }
    
    // Update cart UI
    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Update cart count
        $('#qmp-cart-count').text(totalItems);
        
        // Show/hide cart toggle
        if (totalItems > 0) {
            $('#qmp-cart-toggle').show();
        } else {
            $('#qmp-cart-toggle').hide();
            $('#qmp-cart').hide();
        }
        
        // Update cart items
        const $cartItems = $('#qmp-cart-items');
        $cartItems.empty();
        
        cart.forEach(function(item) {
            const $item = createCartItem(item);
            $cartItems.append($item);
        });
        
        // Update total
        $('#qmp-cart-total-amount').text(`₺${totalAmount.toFixed(2)}`);
    }
    
    // Create cart item
    function createCartItem(item) {
        const $item = $('<div>').addClass('qmp-cart-item');
        
        const $info = $('<div>').addClass('qmp-cart-item-info');
        const $name = $('<div>').addClass('qmp-cart-item-name').text(item.name);
        const $price = $('<div>').addClass('qmp-cart-item-price').text(`₺${item.price.toFixed(2)}`);
        $info.append($name, $price);
        
        const $controls = $('<div>').addClass('qmp-quantity-controls');
        const $minusBtn = $('<button>')
            .addClass('qmp-quantity-btn')
            .text('-')
            .data('product-id', item.id)
            .data('action', 'minus');
        
        const $quantity = $('<span>').text(item.quantity);
        
        const $plusBtn = $('<button>')
            .addClass('qmp-quantity-btn')
            .text('+')
            .data('product-id', item.id)
            .data('action', 'plus');
        
        $controls.append($minusBtn, $quantity, $plusBtn);
        $item.append($info, $controls);
        
        return $item;
    }
    
    // Show error
    function showError(message) {
        $('#qmp-loading').hide();
        $('#qmp-menu-content').hide();
        $('#qmp-error-message').text(message);
        $('#qmp-error').show();
    }
    
    // Event handlers
    $(document).on('click', '.qmp-category-btn', function() {
        $('.qmp-category-btn').removeClass('active');
        $(this).addClass('active');
        
        const categoryId = $(this).data('category');
        renderProducts(categoryId);
    });
    
    $(document).on('click', '.qmp-add-to-cart', function() {
        const productId = $(this).data('product-id');
        addToCart(productId);
    });
    
    $(document).on('click', '#qmp-cart-toggle', function() {
        $('#qmp-cart').show();
    });
    
    $(document).on('click', '#qmp-cart-close', function() {
        $('#qmp-cart').hide();
    });
    
    $(document).on('click', '.qmp-quantity-btn', function() {
        const productId = $(this).data('product-id');
        const action = $(this).data('action');
        
        if (action === 'plus') {
            addToCart(productId);
        } else {
            removeFromCart(productId);
        }
    });
    
    $(document).on('click', '#qmp-order-btn', function() {
        if (cart.length === 0) {
            alert('Sepetiniz boş');
            return;
        }
        
        // Here you would typically send the order to your backend
        alert('Siparişiniz alındı! En kısa sürede hazırlanacak.');
        cart = [];
        updateCartUI();
        $('#qmp-cart').hide();
    });
    
    $(document).on('click', '#qmp-call-waiter-btn', function() {
        // Here you would typically send a waiter call to your backend
        alert('Garson çağrınız iletildi!');
    });
    
    // Initialize on page load
    if ($('#qmp-menu-container').length) {
        initMenu();
    }
});