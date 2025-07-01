import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ShoppingCart, 
  Hand, 
  Plus, 
  Minus, 
  Lock,
  AlertCircle
} from "lucide-react";

interface MenuData {
  restaurant: {
    id: number;
    name: string;
    description: string | null;
    plan: string;
    primaryColor: string;
    secondaryColor: string;
  };
  table: {
    id: number;
    name: string;
    qrCode: string;
  };
  categories: Array<{
    id: number;
    name: string;
    description: string | null;
  }>;
  products: Array<{
    id: number;
    categoryId: number | null;
    name: string;
    description: string | null;
    price: string;
    imageUrl: string | null;
    isAvailable: boolean;
  }>;
}

interface CartItem {
  productId: number;
  name: string;
  price: string;
  quantity: number;
}

export default function MenuView() {
  const { qrCode } = useParams<{ qrCode: string }>();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");

  // Fetch menu data
  const { data: menuData, isLoading, error } = useQuery<MenuData>({
    queryKey: ["/api/menu", qrCode],
    retry: false,
  });

  // Create waiter call mutation
  const waiterCallMutation = useMutation({
    mutationFn: async () => {
      if (!menuData) return;
      
      await apiRequest("POST", "/api/waiter-calls", {
        restaurantId: menuData.restaurant.id,
        tableId: menuData.table.id,
        message: "Müşteri garson çağırdı",
      });
    },
    onSuccess: () => {
      toast({
        title: "Garson Çağrıldı",
        description: "Garsonunuz en kısa sürede gelecek.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Garson çağırma işlemi başarısız oldu.",
        variant: "destructive",
      });
    },
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (items: CartItem[]) => {
      if (!menuData || items.length === 0) return;

      const totalAmount = items.reduce((sum, item) => 
        sum + (parseFloat(item.price) * item.quantity), 0
      ).toFixed(2);

      const order = await apiRequest("POST", "/api/orders", {
        restaurantId: menuData.restaurant.id,
        tableId: menuData.table.id,
        customerName: customerName || null,
        totalAmount,
        status: "pending",
      });

      // Add order items (this would need additional API endpoint)
      // For now, we'll just create the order
      return order;
    },
    onSuccess: () => {
      setCart([]);
      setCustomerName("");
      toast({
        title: "Sipariş Alındı",
        description: "Siparişiniz mutfağa iletildi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Sipariş gönderilemedi.",
        variant: "destructive",
      });
    },
  });

  const addToCart = (product: MenuData['products'][0]) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.productId === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.productId === productId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter(item => item.productId !== productId);
    });
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-sm mx-auto bg-white min-h-screen">
          <Skeleton className="h-32 w-full" />
          <div className="p-4 space-y-4">
            <div className="flex space-x-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-10 w-20" />
              ))}
            </div>
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !menuData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Menü Bulunamadı</h1>
            <p className="text-gray-600">
              Bu QR kod geçerli değil veya menü aktif değil.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { restaurant, table, categories, products } = menuData;
  
  const filteredProducts = selectedCategory
    ? products.filter(p => p.categoryId === selectedCategory)
    : products;

  const isPremiumFeature = restaurant.plan === 'free';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-sm mx-auto bg-white min-h-screen relative">
        {/* Header */}
        <div 
          className="p-6 text-white text-center"
          style={{ backgroundColor: restaurant.primaryColor }}
        >
          <h1 className="text-xl font-bold">{restaurant.name}</h1>
          <p className="text-blue-100 text-sm mt-1">
            {table.name} - Hoş geldiniz!
          </p>
        </div>

        {/* Categories */}
        <div className="p-4">
          <div className="flex space-x-2 mb-4 overflow-x-auto">
            <Button
              variant={selectedCategory === null ? "default" : "secondary"}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => setSelectedCategory(null)}
              style={{ 
                backgroundColor: selectedCategory === null ? restaurant.primaryColor : undefined 
              }}
            >
              Tümü
            </Button>
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "secondary"}
                size="sm"
                className="whitespace-nowrap"
                onClick={() => setSelectedCategory(category.id)}
                style={{ 
                  backgroundColor: selectedCategory === category.id ? restaurant.primaryColor : undefined 
                }}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Products */}
          <div className="space-y-3 pb-24">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Bu kategoride ürün bulunmuyor</p>
              </div>
            ) : (
              filteredProducts.map(product => {
                const cartItem = cart.find(item => item.productId === product.id);
                return (
                  <Card key={product.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">Fotoğraf</span>
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{product.name}</h3>
                          {product.description && (
                            <p className="text-xs text-gray-500 mt-1">{product.description}</p>
                          )}
                          <p 
                            className="text-sm font-bold mt-1"
                            style={{ color: restaurant.primaryColor }}
                          >
                            ₺{product.price}
                          </p>
                        </div>

                        {/* Add to cart controls */}
                        {product.isAvailable ? (
                          cartItem ? (
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-8 h-8 p-0"
                                onClick={() => removeFromCart(product.id)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="text-sm font-medium w-6 text-center">
                                {cartItem.quantity}
                              </span>
                              <Button
                                size="sm"
                                className="w-8 h-8 p-0"
                                onClick={() => addToCart(product)}
                                style={{ backgroundColor: restaurant.primaryColor }}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => addToCart(product)}
                              style={{ backgroundColor: restaurant.primaryColor }}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          )
                        ) : (
                          <Badge variant="secondary">Tükendi</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-100 p-4">
          {/* Cart Summary */}
          {cart.length > 0 && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Sepet ({getCartItemCount()} ürün)</span>
                <span className="font-bold">₺{getCartTotal().toFixed(2)}</span>
              </div>
              
              {!isPremiumFeature && (
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Adınız (isteğe bağlı)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex space-x-2">
            {/* Order Button */}
            <Button
              className="flex-1"
              disabled={cart.length === 0 || isPremiumFeature || createOrderMutation.isPending}
              onClick={() => createOrderMutation.mutate(cart)}
              style={{ 
                backgroundColor: isPremiumFeature ? undefined : restaurant.secondaryColor 
              }}
            >
              {isPremiumFeature ? (
                <>
                  <Lock className="w-4 h-4 mr-1" />
                  Sipariş Ver
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  {createOrderMutation.isPending ? "Gönderiliyor..." : "Sipariş Ver"}
                </>
              )}
            </Button>

            {/* Waiter Call Button */}
            <Button
              variant="outline"
              disabled={isPremiumFeature || waiterCallMutation.isPending}
              onClick={() => waiterCallMutation.mutate()}
              style={{ 
                borderColor: isPremiumFeature ? undefined : restaurant.secondaryColor,
                color: isPremiumFeature ? undefined : restaurant.secondaryColor 
              }}
            >
              {isPremiumFeature ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Hand className="w-4 h-4" />
              )}
            </Button>
          </div>

          {isPremiumFeature && (
            <p className="text-xs text-gray-500 text-center mt-2">
              <Lock className="w-3 h-3 inline mr-1" />
              Premium özellikler - Restoran sahibi Elite üyelik gerektirir
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
