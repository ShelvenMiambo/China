import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft, 
  ShieldCheck,
  ExternalLink 
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatMZN, formatUSD, generateWhatsAppMessage, getWhatsAppURL } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";

export default function Cart() {
  const { items, updateQuantity, removeItem, getTotalMZN, getTotalUSD, getTotalItems } = useCart();
  const { toast } = useToast();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      toast({
        title: "Item removido",
        description: "O produto foi removido do seu carrinho.",
      });
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    removeItem(productId);
    toast({
      title: "Item removido",
      description: `${productName} foi removido do seu carrinho.`,
    });
  };

  const whatsappMessage = generateWhatsAppMessage(
    items.map(item => ({
      product_name: item.product.name,
      quantity: item.quantity,
      total_mzn: item.product.price_mzn * item.quantity,
      product_id: item.product.id,
      price_mzn: item.product.price_mzn,
      price_usd: parseFloat(item.product.price_usd),
    }))
  );

  if (items.length === 0) {
    return (
      <section className="py-16 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <ShoppingCart className="w-24 h-24 mx-auto text-gray-400 mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Seu carrinho está vazio</h1>
              <p className="text-gray-600 mb-8">
                Adicione produtos ao seu carrinho para continuar com a compra
              </p>
              <Link href="/catalog">
                <Button 
                  className="bg-maputo-primary hover:bg-maputo-primary-dark text-white px-8 py-3"
                  data-testid="continue-shopping-button"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continuar Comprando
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8" data-testid="cart-title">
            Carrinho de Compras ({getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'})
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <CardContent key={item.id} className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={item.product.images?.[0] || "https://via.placeholder.com/200x200?text=Sem+Imagem"} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-grow">
                          <h3 className="font-semibold text-gray-900 mb-1" data-testid={`cart-item-name-${item.product.id}`}>
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Categoria: {item.product.category}
                          </p>
                          <p className="text-sm text-maputo-primary font-medium mb-2">
                            {formatMZN(item.product.price_mzn)} / {formatUSD(parseFloat(item.product.price_usd))}
                          </p>
                          
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center border border-gray-300 rounded">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                                data-testid={`decrease-quantity-${item.product.id}`}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.product.id, parseInt(e.target.value) || 1)}
                                className="w-16 text-center border-0 focus-visible:ring-0"
                                min="1"
                                data-testid={`quantity-input-${item.product.id}`}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                                data-testid={`increase-quantity-${item.product.id}`}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.product.id, item.product.name)}
                              className="text-maputo-accent hover:text-maputo-accent-dark hover:bg-red-50"
                              data-testid={`remove-item-${item.product.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Remover
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-lg text-maputo-primary" data-testid={`item-total-mzn-${item.product.id}`}>
                            {formatMZN(item.product.price_mzn * item.quantity)}
                          </p>
                          <p className="text-sm text-gray-500" data-testid={`item-total-usd-${item.product.id}`}>
                            {formatUSD(parseFloat(item.product.price_usd) * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  ))}
                </div>
              </Card>

              {/* Continue Shopping */}
              <div className="mt-6">
                <Link href="/catalog">
                  <Button variant="ghost" className="text-maputo-primary hover:bg-maputo-primary/10">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Continuar Comprando
                  </Button>
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-6">Resumo do Pedido</h3>

                  <div className="space-y-3 mb-6 pb-6 border-b">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal (MZN)</span>
                      <span className="font-semibold" data-testid="subtotal-mzn">
                        {formatMZN(getTotalMZN())}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal (USD)</span>
                      <span className="font-semibold" data-testid="subtotal-usd">
                        {formatUSD(getTotalUSD())}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Taxa de Entrega</span>
                      <span className="font-semibold text-green-600">GRÁTIS</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 pb-6 border-b">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total (MZN)</span>
                      <span className="text-maputo-primary" data-testid="total-mzn">
                        {formatMZN(getTotalMZN())}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Total (USD)</span>
                      <span data-testid="total-usd">{formatUSD(getTotalUSD())}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Link href="/checkout">
                    <Button 
                      className="w-full bg-maputo-warning hover:bg-maputo-warning-dark text-gray-900 py-3 font-semibold mb-3"
                      data-testid="checkout-button"
                    >
                      Finalizar Pedido
                    </Button>
                  </Link>

                  {/* WhatsApp Quote */}
                  <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white py-3 font-semibold">
                    <a
                      href={getWhatsAppURL(whatsappMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="whatsapp-order-button"
                    >
                      <i className="fab fa-whatsapp mr-2"></i>
                      Pedir via WhatsApp
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>

                  <div className="mt-6 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                    <ShieldCheck className="w-4 h-4 text-maputo-primary mr-2 inline" />
                    Compra 100% segura e garantida
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
