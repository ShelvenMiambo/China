import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package } from "lucide-react";
import { Product } from "@shared/schema";
import { formatMZN, formatUSD, convertMZNToUSD } from "@/lib/currency";
import { useCart } from "@/hooks/use-cart";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, getItemCount } = useCart();
  const itemCount = getItemCount(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
  };

  const getBadgeColor = (stock: number) => {
    if (stock > 100) return "bg-green-500";
    if (stock > 10) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStockText = (stock: number) => {
    if (stock > 100) return "Em Estoque";
    if (stock > 10) return "Baixo Estoque";
    return "Último Estoque";
  };

  return (
    <Card className="product-card bg-white rounded-xl shadow-md overflow-hidden">
      <div className="relative">
        <img 
          src={product.images?.[0] || "https://via.placeholder.com/400x300?text=Sem+Imagem"} 
          alt={product.name} 
          className="w-full h-48 object-cover"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3">
          <Badge className={`${getBadgeColor(product.stock)} text-white px-3 py-1 text-xs font-semibold`}>
            {getStockText(product.stock)}
          </Badge>
        </div>
        
        {product.stock < 50 && (
          <Badge className="absolute top-3 right-3 bg-maputo-warning text-gray-900 px-3 py-1 text-xs font-semibold">
            <i className="fas fa-fire mr-1"></i>PROMO
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <span className="text-xs text-gray-500 uppercase">{product.category}</span>
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-baseline space-x-2 mb-3">
          <span className="text-2xl font-bold text-maputo-primary">
            {formatMZN(product.price_mzn)}
          </span>
          <span className="text-sm text-gray-500">
            / {formatUSD(convertMZNToUSD(product.price_mzn))}
          </span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <Package className="w-4 h-4 mr-2 text-maputo-primary" />
          <span data-testid={`stock-${product.id}`}>
            {product.stock.toLocaleString()} unidades disponíveis
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Link href={`/product/${product.id}`}>
            <Button 
              variant="default" 
              className="bg-maputo-primary hover:bg-maputo-primary-dark text-white px-4 py-2 text-sm font-medium w-full"
              data-testid={`view-product-${product.id}`}
            >
              Ver Detalhes
            </Button>
          </Link>
          
          <Button
            onClick={handleAddToCart}
            className="bg-maputo-warning hover:bg-maputo-warning-dark text-gray-900 px-4 py-2 text-sm font-medium relative"
            data-testid={`add-to-cart-${product.id}`}
          >
            <ShoppingCart className="w-4 h-4" />
            {itemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-maputo-accent text-white text-xs w-5 h-5 rounded-full p-0 flex items-center justify-center">
                {itemCount}
              </Badge>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
