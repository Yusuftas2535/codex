import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, X, Shield } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
}

export default function UpgradeModal({ isOpen, onClose, currentPlan }: UpgradeModalProps) {
  const handleUpgrade = () => {
    // TODO: Implement payment integration (PayTR or iyzico)
    // For now, just show a message
    alert("Ödeme sistemi entegrasyonu yakında!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Planınızı Yükseltin
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Current Plan */}
            <div className="border-2 border-gray-200 rounded-xl p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-600">Normal Üyelik</h3>
                <p className="text-3xl font-bold text-gray-600 mt-2">Ücretsiz</p>
                {currentPlan === 'free' && (
                  <Badge className="mt-2 bg-blue-100 text-blue-800">
                    Mevcut Planınız
                  </Badge>
                )}
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm">
                  <Check className="text-success w-4 h-4 mr-3" />
                  <span>Max 10 ürün</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="text-success w-4 h-4 mr-3" />
                  <span>QR kod oluşturma</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="text-success w-4 h-4 mr-3" />
                  <span>Temel menü görünümü</span>
                </li>
                <li className="flex items-center text-sm">
                  <X className="text-red-500 w-4 h-4 mr-3" />
                  <span className="text-gray-400">Garson çağırma</span>
                </li>
                <li className="flex items-center text-sm">
                  <X className="text-red-500 w-4 h-4 mr-3" />
                  <span className="text-gray-400">Sipariş toplama</span>
                </li>
                <li className="flex items-center text-sm">
                  <X className="text-red-500 w-4 h-4 mr-3" />
                  <span className="text-gray-400">Özelleştirme</span>
                </li>
              </ul>
              
              <Button 
                className="w-full" 
                variant="outline"
                disabled
              >
                {currentPlan === 'free' ? 'Mevcut Plan' : 'Downgrades Not Available'}
              </Button>
            </div>
            
            {/* Elite Plan */}
            <div className="border-2 border-secondary rounded-xl p-6 relative bg-gradient-to-b from-amber-50 to-white">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-secondary text-white px-4 py-1 text-xs font-medium">
                  <Crown className="w-3 h-3 mr-1" />
                  Önerilen
                </Badge>
              </div>
              
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-neutral-dark">Elite Üyelik</h3>
                <p className="text-3xl font-bold text-secondary mt-2">
                  ₺99
                  <span className="text-sm font-normal text-gray-500">/ay</span>
                </p>
                {currentPlan === 'elite' && (
                  <Badge className="mt-2 bg-amber-100 text-amber-800">
                    Mevcut Planınız
                  </Badge>
                )}
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm">
                  <Check className="text-success w-4 h-4 mr-3" />
                  <span>Sınırsız ürün</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="text-success w-4 h-4 mr-3" />
                  <span>QR kod oluşturma</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="text-success w-4 h-4 mr-3" />
                  <span>Gelişmiş menü görünümü</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="text-success w-4 h-4 mr-3" />
                  <span>Garson çağırma sistemi</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="text-success w-4 h-4 mr-3" />
                  <span>Sipariş toplama</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="text-success w-4 h-4 mr-3" />
                  <span>Logo & renk özelleştirmesi</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="text-success w-4 h-4 mr-3" />
                  <span>Premium destek</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="text-success w-4 h-4 mr-3" />
                  <span>Detaylı raporlar</span>
                </li>
              </ul>
              
              <Button 
                className="w-full bg-secondary hover:bg-amber-600 text-white font-medium"
                onClick={handleUpgrade}
                disabled={currentPlan === 'elite'}
              >
                {currentPlan === 'elite' ? (
                  'Mevcut Plan'
                ) : (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Elite'ye Geç
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Features Comparison */}
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-center mb-6">Özellik Karşılaştırması</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="font-medium text-gray-900">Temel Özellikler</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Ürün Sayısı</span>
                    <div className="text-right">
                      <div>Normal: 10</div>
                      <div className="text-secondary font-medium">Elite: Sınırsız</div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>QR Kod</span>
                    <div className="text-right">
                      <div>Normal: ✓</div>
                      <div className="text-secondary font-medium">Elite: ✓</div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Kategori Yönetimi</span>
                    <div className="text-right">
                      <div>Normal: ✓</div>
                      <div className="text-secondary font-medium">Elite: ✓</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h5 className="font-medium text-gray-900">Premium Özellikler</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Garson Çağırma</span>
                    <div className="text-right">
                      <div>Normal: ✗</div>
                      <div className="text-secondary font-medium">Elite: ✓</div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Sipariş Sistemi</span>
                    <div className="text-right">
                      <div>Normal: ✗</div>
                      <div className="text-secondary font-medium">Elite: ✓</div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Özelleştirme</span>
                    <div className="text-right">
                      <div>Normal: ✗</div>
                      <div className="text-secondary font-medium">Elite: ✓</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 flex items-center justify-center">
              <Shield className="w-4 h-4 mr-1" />
              Güvenli ödeme - İstediğiniz zaman iptal edebilirsiniz
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
