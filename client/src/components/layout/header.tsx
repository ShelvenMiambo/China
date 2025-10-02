import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, Phone, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/hooks/use-cart";
import { CONTACT_INFO, EXCHANGE_RATE } from "@/lib/constants";

export default function Header() {
  const [location] = useLocation();
  const { getTotalItems } = useCart();

  const navigation = [
    { name: "Início", href: "/", icon: "fas fa-home" },
    { name: "Catálogo", href: "/catalog", icon: "fas fa-th-large" },
    { name: "Sobre", href: "/about", icon: "fas fa-info-circle" },
    { name: "Contacto", href: "#contact", icon: "fas fa-envelope" },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top bar */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-2">
          <div className="flex flex-wrap justify-between items-center text-sm">
            <div className="flex items-center space-x-4 text-gray-600">
              <a 
                href={`tel:${CONTACT_INFO.phone}`} 
                className="hover:text-maputo-primary flex items-center"
                data-testid="header-phone-link"
              >
                <Phone className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{CONTACT_INFO.phone}</span>
              </a>
              <a 
                href={`mailto:${CONTACT_INFO.email}`} 
                className="hover:text-maputo-primary flex items-center"
                data-testid="header-email-link"
              >
                <Mail className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{CONTACT_INFO.email}</span>
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-gray-600 text-xs">
                Câmbio: 1 USD = {EXCHANGE_RATE} MZN
              </span>
              <Link href="/admin/login">
                <a className="text-gray-600 hover:text-maputo-primary text-xs" data-testid="admin-login-link">
                  <User className="w-3 h-3 mr-1 inline" />
                  Admin
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center space-x-3" data-testid="logo-link">
              <div className="bg-maputo-primary text-white rounded-lg p-2">
                <i className="fas fa-shipping-fast text-2xl"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-maputo-primary">Maputo Import Hub</h1>
                <p className="text-xs text-gray-600">Importação Direta da China</p>
              </div>
            </a>
          </Link>

          {/* Desktop menu */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                <a 
                  className={`text-gray-700 hover:text-maputo-primary font-medium transition ${
                    location === item.href ? 'text-maputo-primary' : ''
                  }`}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                >
                  {item.name}
                </a>
              </Link>
            ))}
          </nav>

          {/* Cart and mobile menu */}
          <div className="flex items-center space-x-4">
            <Link href="/cart">
              <a className="relative text-gray-700 hover:text-maputo-primary transition" data-testid="cart-link">
                <ShoppingCart className="w-6 h-6" />
                {getTotalItems() > 0 && (
                  <span 
                    className="absolute -top-2 -right-2 bg-maputo-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    data-testid="cart-count"
                  >
                    {getTotalItems()}
                  </span>
                )}
              </a>
            </Link>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" data-testid="mobile-menu-button">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-6">
                  {navigation.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <a 
                        className="flex items-center space-x-3 text-lg font-medium text-gray-700 hover:text-maputo-primary transition"
                        data-testid={`mobile-nav-${item.name.toLowerCase()}`}
                      >
                        <i className={`${item.icon} w-5`}></i>
                        <span>{item.name}</span>
                      </a>
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
