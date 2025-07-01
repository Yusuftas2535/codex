import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  QrCode, 
  Download, 
  Eye, 
  Plus, 
  Trash2,
  ExternalLink
} from "lucide-react";

interface QRGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId?: number;
}

interface Table {
  id: number;
  name: string;
  qrCode: string;
  isActive: boolean;
}

export default function QRGenerator({ isOpen, onClose, restaurantId }: QRGeneratorProps) {
  const { toast } = useToast();
  const [tableName, setTableName] = useState("");
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  // Fetch tables
  const { data: tables = [], isLoading } = useQuery<Table[]>({
    queryKey: ["/api/tables"],
    enabled: isOpen && !!restaurantId,
  });

  // Create table mutation
  const createTableMutation = useMutation({
    mutationFn: async (name: string) => {
      await apiRequest("POST", "/api/tables", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
      setTableName("");
      toast({
        title: "Success",
        description: "Table created successfully!",
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
        description: "Failed to create table",
        variant: "destructive",
      });
    },
  });

  // Delete table mutation
  const deleteTableMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tables/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
      toast({
        title: "Success",
        description: "Table deleted successfully!",
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
        description: "Failed to delete table",
        variant: "destructive",
      });
    },
  });

  const handleCreateTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableName.trim()) {
      toast({
        title: "Error",
        description: "Table name is required",
        variant: "destructive",
      });
      return;
    }
    createTableMutation.mutate(tableName.trim());
  };

  const generateQRCodeURL = (qrCode: string) => {
    // Using a simple QR code generator service
    const menuUrl = `${window.location.origin}/menu/${qrCode}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}`;
  };

  const downloadQRCode = async (table: Table) => {
    try {
      const qrUrl = generateQRCodeURL(table.qrCode);
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${table.name}-qr-code.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "QR code downloaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      });
    }
  };

  const previewMenu = (table: Table) => {
    const menuUrl = `${window.location.origin}/menu/${table.qrCode}`;
    window.open(menuUrl, '_blank');
  };

  // Reset selected table when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedTable(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            QR Kod Yönetimi
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Create New Table */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Yeni Masa Oluştur</h3>
              <form onSubmit={handleCreateTable} className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="tableName">Masa Adı</Label>
                  <Input
                    id="tableName"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="Örn: Masa 1, Balkon A, Pencere Kenarı"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    type="submit"
                    disabled={createTableMutation.isPending}
                    className="bg-primary hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {createTableMutation.isPending ? "Oluşturuluyor..." : "Oluştur"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Tables Grid */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Mevcut Masalar</h3>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : tables.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Henüz masa yok
                  </h4>
                  <p className="text-gray-500">
                    İlk masanızı oluşturarak QR kod sistemini başlatın
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map(table => (
                  <Card key={table.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="text-center mb-4">
                        <h4 className="font-semibold text-lg mb-2">{table.name}</h4>
                        
                        {/* QR Code */}
                        <div className="bg-white p-4 rounded-lg border inline-block">
                          <img
                            src={generateQRCodeURL(table.qrCode)}
                            alt={`${table.name} QR Code`}
                            className="w-32 h-32"
                          />
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-2">
                          QR Kod: {table.qrCode.slice(0, 12)}...
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-primary hover:bg-blue-700"
                            onClick={() => downloadQRCode(table)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            İndir
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => previewMenu(table)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Önizle
                          </Button>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            const menuUrl = `${window.location.origin}/menu/${table.qrCode}`;
                            navigator.clipboard.writeText(menuUrl);
                            toast({
                              title: "Link kopyalandı",
                              description: "Menü linki panoya kopyalandı",
                            });
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Link Kopyala
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-red-600 hover:text-red-700"
                          onClick={() => {
                            if (confirm(`${table.name} masasını silmek istediğinizden emin misiniz?`)) {
                              deleteTableMutation.mutate(table.id);
                            }
                          }}
                          disabled={deleteTableMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Sil
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h4 className="font-semibold text-blue-900 mb-2">Nasıl Kullanılır?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>1. Masalarınız için QR kodlar oluşturun</li>
                <li>2. QR kodları indirip yazdırın</li>
                <li>3. Her masaya kendi QR kodunu yerleştirin</li>
                <li>4. Müşteriler QR kodu okutarak menüye erişebilir</li>
                <li>5. Elite üyelikle müşteriler sipariş verebilir ve garson çağırabilir</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
