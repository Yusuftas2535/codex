import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Utensils, Smartphone, Crown, Check, ArrowRight } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <QrCode className="text-white text-xl" />
            </div>
            <h1 className="text-4xl font-bold text-neutral-dark">QR Menü Pro</h1>
          </div>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Modern NFC/QR menü sistemi ile restoran yönetimini kolaylaştırın. 
            Müşterilerinize dijital menü deneyimi sunun.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleLogin}
              size="lg" 
              className="bg-primary hover:bg-blue-700 text-white px-8 py-3"
            >
              Hemen Başlayın
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-3"
            >
              Canlı Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <QrCode className="text-primary text-2xl" />
              </div>
              <CardTitle>QR Kod ile Erişim</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Müşterileriniz masa QR kodunu okutarak anında menüye erişebilir. 
                Fiziksel menü ihtiyacı kalmaz.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Utensils className="text-success text-2xl" />
              </div>
              <CardTitle>Kolay Yönetim</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Ürünlerinizi kategorize edin, fiyatları güncelleyin ve 
                siparişleri tek panelden takip edin.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-amber-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Smartphone className="text-secondary text-2xl" />
              </div>
              <CardTitle>Mobil Uyumlu</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Tüm cihazlarda mükemmel görünüm. Müşterileriniz telefonlarından 
                kolayca sipariş verebilir.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Plans */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-neutral-dark mb-8">
            Size Uygun Planı Seçin
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <Card className="border-2 border-gray-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Normal Üyelik</CardTitle>
                <div className="text-4xl font-bold text-gray-600 mt-4">
                  Ücretsiz
                </div>
                <CardDescription>Başlamak için ideal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="text-success w-5 h-5 mr-3" />
                    <span>Max 10 ürün</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="text-success w-5 h-5 mr-3" />
                    <span>QR kod oluşturma</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="text-success w-5 h-5 mr-3" />
                    <span>Temel menü görünümü</span>
                  </div>
                  <div className="flex items-center opacity-50">
                    <span className="w-5 h-5 mr-3">×</span>
                    <span>Garson çağırma</span>
                  </div>
                  <div className="flex items-center opacity-50">
                    <span className="w-5 h-5 mr-3">×</span>
                    <span>Sipariş toplama</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleLogin}
                  className="w-full mt-6"
                  variant="outline"
                >
                  Ücretsiz Başlayın
                </Button>
              </CardContent>
            </Card>

            {/* Elite Plan */}
            <Card className="border-2 border-secondary relative bg-gradient-to-b from-amber-50 to-white">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-secondary text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                  <Crown className="w-4 h-4 mr-1" />
                  Önerilen
                </span>
              </div>
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Elite Üyelik</CardTitle>
                <div className="text-4xl font-bold text-secondary mt-4">
                  ₺99
                  <span className="text-lg font-normal text-gray-500">/ay</span>
                </div>
                <CardDescription>Tam özellikli çözüm</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="text-success w-5 h-5 mr-3" />
                    <span>Sınırsız ürün</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="text-success w-5 h-5 mr-3" />
                    <span>Garson çağırma sistemi</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="text-success w-5 h-5 mr-3" />
                    <span>Sipariş toplama</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="text-success w-5 h-5 mr-3" />
                    <span>Logo & renk özelleştirmesi</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="text-success w-5 h-5 mr-3" />
                    <span>Premium destek</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleLogin}
                  className="w-full mt-6 bg-secondary hover:bg-amber-600 text-white"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Elite'ye Geç
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary to-blue-700 text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                Hemen Başlayın, Ücretsiz Deneyin
              </h3>
              <p className="text-blue-100 mb-6">
                Kredi kartı gerektirmez. Anında kurulum, 2 dakikada hazır.
              </p>
              <Button 
                onClick={handleLogin}
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-gray-100"
              >
                Şimdi Kayıt Olun
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
