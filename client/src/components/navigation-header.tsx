import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  QrCode, 
  Crown, 
  ChevronDown, 
  User, 
  LogOut,
  Home,
  Package,
  Tags,
  ShoppingCart
} from "lucide-react";
import { Link, useLocation } from "wouter";

interface NavigationHeaderProps {
  user: { name: string } | null;
  restaurant: { 
    id: number; 
    name: string; 
    plan: string; 
  } | null;
  onUpgrade: () => void;
}

export default function NavigationHeader({ user, restaurant, onUpgrade }: NavigationHeaderProps) {
  const [location] = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/products", label: "Ürünler", icon: Package },
    { path: "/categories", label: "Kategoriler", icon: Tags },
    { path: "/orders", label: "Siparişler", icon: ShoppingCart },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <QrCode className="text-white text-sm" />
                </div>
                <h1 className="text-xl font-bold text-neutral-dark">QR Menü Pro</h1>
              </div>
            </Link>

            {/* Navigation */}
            {restaurant && (
              <nav className="hidden md:flex items-center space-x-6">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  
                  return (
                    <Link key={item.path} href={item.path}>
                      <button
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive 
                            ? 'bg-primary text-white' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Plan Badge */}
            {restaurant && (
              <Badge 
                variant="outline" 
                className={`px-3 py-1 text-xs font-medium ${
                  restaurant.plan === 'elite' 
                    ? 'bg-amber-50 text-amber-700 border-amber-200' 
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}
              >
                {restaurant.plan === 'elite' ? (
                  <>
                    <Crown className="w-3 h-3 mr-1" />
                    Elite Üyelik
                  </>
                ) : (
                  'Normal Üyelik'
                )}
              </Badge>
            )}
            
            {/* Upgrade Button */}
            {restaurant?.plan === 'free' && (
              <Button 
                className="bg-secondary hover:bg-amber-600 text-white text-sm font-medium"
                onClick={onUpgrade}
              >
                <Crown className="w-4 h-4 mr-2" />
                Planı Yükselt
              </Button>
            )}
            
            {/* User Menu */}
            {user && (
              <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {getInitials(user.name)}
                      </span>
                    </div>
                    <span className="hidden md:block font-medium">{user.name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    {restaurant && (
                      <p className="text-xs text-gray-500">{restaurant.name}</p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  
                  {/* Mobile Navigation */}
                  <div className="md:hidden">
                    {navItems.map(item => {
                      const Icon = item.icon;
                      const isActive = location === item.path;
                      
                      return (
                        <DropdownMenuItem key={item.path} asChild>
                          <Link href={item.path}>
                            <button
                              className={`w-full flex items-center space-x-2 px-2 py-2 text-sm ${
                                isActive ? 'text-primary font-medium' : 'text-gray-700'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </button>
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                    <DropdownMenuSeparator />
                  </div>
                  
                  <DropdownMenuItem asChild>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-2 py-2 text-sm text-gray-700 hover:text-gray-900"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Çıkış Yap</span>
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
