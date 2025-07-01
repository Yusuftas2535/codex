import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import NavigationHeader from "@/components/navigation-header";
import UpgradeModal from "@/components/upgrade-modal";
import QRGenerator from "@/components/qr-generator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  Utensils, 
  Users, 
  ShoppingCart, 
  Bell, 
  Tags, 
  QrCode,
  Eye,
  Download,
  Crown
} from "lucide-react";
import { Link } from "wouter";

interface DashboardStats {
  totalProducts: number;
  activeTables: number;
  todayOrders: number;
  pendingWaiterCalls: number;
}

interface Restaurant {
  id: number;
  name: string;
  plan: string;
  maxProducts: number;
  primaryColor: string;
  secondaryColor: string;
}

interface Order {
  id: number;
  tableId: number | null;
  customerName: string | null;
  status: string;
  totalAmount: string;
  createdAt: string;
}

interface WaiterCall {
  id: number;
  tableId: number | null;
  message: string | null;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch restaurant data
  const { data: restaurant, isLoading: restaurantLoading } = useQuery<Restaurant>({
    queryKey: ["/api/restaurant"],
    enabled: isAuthenticated,
  });

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!restaurant,
  });

  // Fetch recent orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders", { limit: 5 }],
    enabled: !!restaurant,
  });

  // Fetch waiter calls
  const { data: waiterCalls = [], isLoading: callsLoading } = useQuery<WaiterCall[]>({
    queryKey: ["/api/waiter-calls", { status: "pending" }],
    enabled: !!restaurant,
  });

  // Create restaurant mutation
  const createRestaurantMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      await apiRequest("POST", "/api/restaurant", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurant"] });
      toast({
        title: "Success",
        description: "Restaurant created successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create restaurant",
        variant: "destructive",
      });
    },
  });

  // Show restaurant setup if no restaurant
  if (!restaurantLoading && !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationHeader user={null} restaurant={null} onUpgrade={() => setShowUpgradeModal(true)} />
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Restoranınızı Oluşturun</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Restoran Adı</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Örn: Lezzet Durağı"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement;
                        if (target.value.trim()) {
                          createRestaurantMutation.mutate({ name: target.value.trim() });
                        }
                      }
                    }}
                  />
                </div>
                <Button
                  className="w-full"
                  disabled={createRestaurantMutation.isPending}
                  onClick={() => {
                    const input = document.querySelector('input') as HTMLInputElement;
                    if (input?.value.trim()) {
                      createRestaurantMutation.mutate({ name: input.value.trim() });
                    }
                  }}
                >
                  {createRestaurantMutation.isPending ? "Oluşturuluyor..." : "Restoran Oluştur"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (authLoading || restaurantLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-16 bg-white border-b border-gray-200">
          <Skeleton className="h-full" />
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800';
      case 'preparing': return 'bg-amber-100 text-amber-800';
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Yeni';
      case 'preparing': return 'Hazırlanıyor';
      case 'ready': return 'Hazır';
      case 'completed': return 'Tamamlandı';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader 
        user={{ name: restaurant?.name || "User" }} 
        restaurant={restaurant || null} 
        onUpgrade={() => setShowUpgradeModal(true)} 
      />

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Ürün</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-neutral-dark">
                      {stats?.totalProducts || 0}
                    </p>
                  )}
                  {restaurant?.plan === 'free' && (
                    <p className="text-xs text-gray-500 mt-1">/ {restaurant.maxProducts} limit</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Utensils className="text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aktif Masalar</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-neutral-dark">
                      {stats?.activeTables || 0}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <Users className="text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bugünkü Siparişler</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-neutral-dark">
                      {stats?.todayOrders || 0}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Garson Çağrıları</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-neutral-dark">
                      {stats?.pendingWaiterCalls || 0}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Bell className="text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Link href="/products">
                    <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
                      <Plus className="text-2xl text-primary mb-2" />
                      <span className="text-sm font-medium">Ürün Ekle</span>
                    </Button>
                  </Link>
                  
                  <Link href="/categories">
                    <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
                      <Tags className="text-2xl text-success mb-2" />
                      <span className="text-sm font-medium">Kategori Ekle</span>
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center p-6 h-auto"
                    onClick={() => setShowQRModal(true)}
                  >
                    <QrCode className="text-2xl text-secondary mb-2" />
                    <span className="text-sm font-medium">QR Kod Oluştur</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Son Siparişler</CardTitle>
                  <Link href="/orders">
                    <Button variant="ghost" size="sm">
                      Tümünü Görüntüle
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Henüz sipariş bulunmuyor
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {order.tableId ? `M${order.tableId}` : "?"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {order.tableId ? `Masa ${order.tableId}` : "Takeaway"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.customerName || "Anonim"} • {new Date(order.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                          <span className="font-semibold text-gray-900">₺{order.totalAmount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Plan Status */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Planım</CardTitle>
                  <Users className="text-2xl text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Mevcut Plan</p>
                  <p className="text-xl font-bold text-neutral-dark">
                    {restaurant?.plan === 'free' ? 'Normal Üyelik' : 'Elite Üyelik'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {restaurant?.plan === 'free' ? 'Ücretsiz Plan' : '₺99/ay'}
                  </p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm">
                    <span className="text-success mr-2">✓</span>
                    <span className="text-gray-600">
                      {restaurant?.plan === 'free' ? `${restaurant.maxProducts} ürün limiti` : 'Sınırsız ürün'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className={restaurant?.plan === 'free' ? 'text-red-500 mr-2' : 'text-success mr-2'}>
                      {restaurant?.plan === 'free' ? '×' : '✓'}
                    </span>
                    <span className={restaurant?.plan === 'free' ? 'text-gray-400 line-through' : 'text-gray-600'}>
                      Garson çağırma
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className={restaurant?.plan === 'free' ? 'text-red-500 mr-2' : 'text-success mr-2'}>
                      {restaurant?.plan === 'free' ? '×' : '✓'}
                    </span>
                    <span className={restaurant?.plan === 'free' ? 'text-gray-400 line-through' : 'text-gray-600'}>
                      Özelleştirme
                    </span>
                  </div>
                </div>

                {restaurant?.plan === 'free' && (
                  <Button 
                    className="w-full bg-secondary hover:bg-amber-600 text-white"
                    onClick={() => setShowUpgradeModal(true)}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Elite Üyeliğe Geç
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* QR Code Preview */}
            <Card>
              <CardHeader>
                <CardTitle>QR Kodum</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="inline-block p-4 bg-gray-50 rounded-lg">
                    <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <QrCode className="text-4xl text-gray-400" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Menü QR Kodu</p>
                </div>

                <div className="space-y-2">
                  <Button 
                    className="w-full bg-primary hover:bg-blue-700 text-white"
                    onClick={() => setShowQRModal(true)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    QR Kodu İndir
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open('/menu/demo', '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Menüyü Önizle
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Waiter Calls */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Garson Çağrıları</CardTitle>
                  {waiterCalls.length > 0 && (
                    <Badge className="bg-red-100 text-red-800">
                      {waiterCalls.length} Yeni
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {callsLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : waiterCalls.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    Yeni çağrı bulunmuyor
                  </div>
                ) : (
                  <div className="space-y-3">
                    {waiterCalls.slice(0, 3).map((call) => (
                      <div key={call.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {call.tableId ? `M${call.tableId}` : "?"}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {call.tableId ? `Masa ${call.tableId}` : "Bilinmeyen"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(call.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-800">
                          Yanıtla
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {restaurant?.plan === 'free' && (
                  <p className="text-xs text-gray-500 mt-4 text-center">
                    <span className="inline-block w-3 h-3 bg-gray-300 rounded mr-1"></span>
                    Elite üyelikle garson çağırma aktif olur
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={restaurant?.plan || 'free'}
      />
      
      <QRGenerator
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        restaurantId={restaurant?.id}
      />
    </div>
  );
}
