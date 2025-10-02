import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle, 
  Package, 
  ShoppingCart, 
  Info, 
  Plus, 
  Minus, 
  ArrowLeft,
  ExternalLink 
} from "lucide-react";
import { formatMZN, formatUSD, convertMZNToUSD, generateWhatsAppMessage, getWhatsAppURL } from "@/lib/currency";
import { useCart } from "@/hooks/use-cart";
import { EXCHANGE_RATE } from "@/lib/constants";

export default function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(100);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem } = useCart();

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", id],
  });

  if (isLoading) {
    return (
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="animate-pulse">
                <div className="bg-gray-300 rounded-2xl h-96 mb-4"></div>
                <div className="grid grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-300 rounded-lg h-16"></div>
                  ))}
                </div>
              </div>
              <div className="animate-pulse space-y-4">
                <div className="bg-gray-300 h-8 rounded w-3/4"></div>
                <div className="bg-gray-300 h-12 rounded"></div>
                <div className="bg-gray-300 h-24 rounded"></div>
                <div className="bg-gray-300 h-32 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-16 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produto não encontrado</h1>
          <Link href="/catalog">
            <Button className="bg-maputo-primary hover:bg-maputo-primary-dark text-white">
              Voltar ao Catálogo
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const whatsappMessage = generateWhatsAppMessage([{
    product_name: product.name,
    quantity,
    total_mzn: product.price_mzn * quantity,
    product_id: product.id,
    price_mzn: product.price_mzn,
    price_usd: convertMZNToUSD(product.price_mzn)
  }]);

  const stockStatus = product.stock > 100 ? "high" : product.stock > 10 ? "medium" : "low";
  const stockColor = stockStatus === "high" ? "text-green-600" : stockStatus === "medium" ? "text-yellow-600" : "text-red-600";
  const stockText = stockStatus === "high" ? "Em Estoque" : stockStatus === "medium" ? "Estoque Baixo" : "Últimas Unidades";

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm" data-testid="breadcrumb">
            <Link href="/">
              <a className="text-gray-600 hover:text-maputo-primary">Início</a>
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link href="/catalog">
              <a className="text-gray-600 hover:text-maputo-primary">Catálogo</a>
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>

          {/* Back Button */}
          <div className="mb-6">
            <Link href="/catalog">
              <Button variant="ghost" className="text-maputo-primary hover:bg-maputo-primary/10" data-testid="back-button">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Catálogo
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Product Images */}
            <div>
              <div className="bg-gray-100 rounded-2xl overflow-hidden mb-4">
                <img 
                  src={product.images?.[selectedImage] || product.images?.[0] || "https://via.placeholder.com/800x600?text=Sem+Imagem"} 
                  alt={product.name}
                  className="w-full h-auto"
                  data-testid="product-main-image"
                />
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((image, index) => (
                    <img 
                      key={index}
                      src={image} 
                      alt={`${product.name} - ${index + 1}`}
                      className={`rounded-lg cursor-pointer hover:opacity-75 transition border-2 ${
                        selectedImage === index ? 'border-maputo-primary' : 'border-transparent'
                      }`}
                      onClick={() => setSelectedImage(index)}
                      data-testid={`product-thumbnail-${index}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <Badge className="bg-maputo-primary text-white mb-3">
                {product.category}
              </Badge>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="product-title">
                {product.name}
              </h1>

              {/* Price */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-baseline space-x-3 mb-2">
                    <span className="text-4xl font-bold text-maputo-primary" data-testid="product-price-mzn">
                      {formatMZN(product.price_mzn)}
                    </span>
                    <span className="text-xl text-gray-500" data-testid="product-price-usd">
                      / {formatUSD(convertMZNToUSD(product.price_mzn))}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Preço por unidade | Câmbio: 1 USD = {EXCHANGE_RATE} MZN</p>
                </CardContent>
              </Card>

              {/* Stock Status */}
              <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
                <div className={`flex items-center ${stockColor}`}>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-semibold" data-testid="stock-status">{stockText}</span>
                </div>
                <div className="text-gray-600">
                  <Package className="w-4 h-4 mr-2 inline" />
                  <span data-testid="stock-quantity">
                    {product.stock.toLocaleString()} unidades disponíveis
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Descrição do Produto</h3>
                <p className="text-gray-700 leading-relaxed" data-testid="product-description">
                  {product.description}
                </p>
              </div>

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">Especificações</h3>
                  <ul className="space-y-2 text-gray-700">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <li key={key} className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-maputo-primary mr-3" />
                        <span><strong>{key}:</strong> {value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block font-semibold mb-2">Quantidade</label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      data-testid="decrease-quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      min="1"
                      max={product.stock}
                      className="w-20 text-center border-0 focus-visible:ring-0"
                      data-testid="quantity-input"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                      data-testid="increase-quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <span className="text-gray-600">
                    Total: <span className="font-semibold text-maputo-primary">
                      {formatMZN(product.price_mzn * quantity)}
                    </span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Button
                  onClick={handleAddToCart}
                  className="bg-maputo-warning hover:bg-maputo-warning-dark text-gray-900 px-6 py-4 font-semibold"
                  data-testid="add-to-cart-button"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Adicionar ao Carrinho
                </Button>
                
                <Button asChild className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 font-semibold">
                  <a
                    href={getWhatsAppURL(whatsappMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="whatsapp-quote-button"
                  >
                    <i className="fab fa-whatsapp mr-2"></i>
                    Solicitar Cotação B2B
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>

              {/* Additional Info */}
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <Info className="text-maputo-primary text-xl mr-3 mt-1 flex-shrink-0" />
                    <div className="text-sm text-gray-700">
                      <p className="font-semibold mb-1">Compras em Grandes Quantidades</p>
                      <p>
                        Para pedidos acima de 1.000 unidades, entre em contato para preços especiais B2B 
                        e condições de entrega diferenciadas.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
