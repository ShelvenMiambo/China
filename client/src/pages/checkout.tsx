import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  MapPin, 
  Phone, 
  Mail,
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatMZN, formatUSD, generateWhatsAppMessage, getWhatsAppURL } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InsertOrder } from "@shared/schema";

const checkoutSchema = z.object({
  customer_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  customer_email: z.string().email("Email inválido"),
  customer_phone: z.string().min(8, "Telefone deve ter pelo menos 8 caracteres"),
  customer_company: z.string().optional(),
  delivery_address: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  delivery_city: z.string().min(2, "Cidade é obrigatória"),
  delivery_postal_code: z.string().optional(),
  delivery_option: z.enum(["standard", "pickup"]),
  payment_method: z.enum(["cash", "transfer", "mpesa"]),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, getTotalMZN, getTotalUSD, clearCart } = useCart();
  const { toast } = useToast();

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      customer_company: "",
      delivery_address: "",
      delivery_city: "Maputo",
      delivery_postal_code: "",
      delivery_option: "standard",
      payment_method: "cash",
      notes: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: InsertOrder) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (order) => {
      clearCart();
      toast({
        title: "Pedido criado com sucesso!",
        description: `Seu pedido #${order.id.slice(0, 8)} foi registrado.`,
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar pedido",
        description: "Ocorreu um erro. Tente novamente ou use o WhatsApp.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutForm) => {
    const orderItems = items.map(item => ({
      product_id: item.product.id,
      product_name: item.product.name,
      price_mzn: item.product.price_mzn,
      price_usd: parseFloat(item.product.price_usd),
      quantity: item.quantity,
      total_mzn: item.product.price_mzn * item.quantity,
      total_usd: parseFloat(item.product.price_usd) * item.quantity,
    }));

    const orderData: InsertOrder = {
      ...data,
      items: orderItems,
      total_mzn: getTotalMZN(),
      total_usd: getTotalUSD().toString(),
    };

    createOrderMutation.mutate(orderData);
  };

  const whatsappMessage = generateWhatsAppMessage(
    items.map(item => ({
      product_name: item.product.name,
      quantity: item.quantity,
      total_mzn: item.product.price_mzn * item.quantity,
      product_id: item.product.id,
      price_mzn: item.product.price_mzn,
      price_usd: parseFloat(item.product.price_usd),
    })),
    {
      name: form.watch("customer_name"),
      phone: form.watch("customer_phone"),
      address: form.watch("delivery_address"),
    }
  );

  if (items.length === 0) {
    return (
      <section className="py-16 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Carrinho vazio
            </h1>
            <p className="text-gray-600 mb-8">
              Adicione produtos ao carrinho antes de finalizar o pedido.
            </p>
            <Link href="/catalog">
              <Button className="bg-maputo-primary hover:bg-maputo-primary-dark text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ir ao Catálogo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/cart">
              <Button variant="ghost" className="text-maputo-primary hover:bg-maputo-primary/10 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Carrinho
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900" data-testid="checkout-title">
              Finalizar Pedido
            </h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                  <CardContent className="p-8">
                    {/* Customer Information */}
                    <div className="mb-8">
                      <h3 className="font-bold text-xl mb-4 flex items-center">
                        <Mail className="w-5 h-5 mr-2 text-maputo-primary" />
                        Informações de Contato
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="customer_name">Nome Completo *</Label>
                          <Input
                            id="customer_name"
                            {...form.register("customer_name")}
                            placeholder="João Silva"
                            data-testid="customer-name-input"
                          />
                          {form.formState.errors.customer_name && (
                            <p className="text-sm text-red-600 mt-1">
                              {form.formState.errors.customer_name.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="customer_email">Email *</Label>
                          <Input
                            id="customer_email"
                            type="email"
                            {...form.register("customer_email")}
                            placeholder="joao@email.com"
                            data-testid="customer-email-input"
                          />
                          {form.formState.errors.customer_email && (
                            <p className="text-sm text-red-600 mt-1">
                              {form.formState.errors.customer_email.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="customer_phone">Telefone *</Label>
                          <Input
                            id="customer_phone"
                            type="tel"
                            {...form.register("customer_phone")}
                            placeholder="+258 84 123 4567"
                            data-testid="customer-phone-input"
                          />
                          {form.formState.errors.customer_phone && (
                            <p className="text-sm text-red-600 mt-1">
                              {form.formState.errors.customer_phone.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="customer_company">Empresa (Opcional)</Label>
                          <Input
                            id="customer_company"
                            {...form.register("customer_company")}
                            placeholder="Nome da empresa"
                            data-testid="customer-company-input"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Delivery Information */}
                    <div className="mb-8 pb-8 border-b">
                      <h3 className="font-bold text-xl mb-4 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-maputo-primary" />
                        Informações de Entrega
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="delivery_address">Endereço Completo *</Label>
                          <Input
                            id="delivery_address"
                            {...form.register("delivery_address")}
                            placeholder="Rua, Número, Bairro"
                            data-testid="delivery-address-input"
                          />
                          {form.formState.errors.delivery_address && (
                            <p className="text-sm text-red-600 mt-1">
                              {form.formState.errors.delivery_address.message}
                            </p>
                          )}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="delivery_city">Cidade *</Label>
                            <Input
                              id="delivery_city"
                              {...form.register("delivery_city")}
                              data-testid="delivery-city-input"
                            />
                            {form.formState.errors.delivery_city && (
                              <p className="text-sm text-red-600 mt-1">
                                {form.formState.errors.delivery_city.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="delivery_postal_code">Código Postal</Label>
                            <Input
                              id="delivery_postal_code"
                              {...form.register("delivery_postal_code")}
                              placeholder="1100"
                              data-testid="delivery-postal-input"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Options */}
                    <div className="mb-8">
                      <h3 className="font-bold text-xl mb-4 flex items-center">
                        <Truck className="w-5 h-5 mr-2 text-maputo-primary" />
                        Opções de Entrega
                      </h3>
                      <RadioGroup
                        value={form.watch("delivery_option")}
                        onValueChange={(value) => form.setValue("delivery_option", value as "standard" | "pickup")}
                        className="space-y-3"
                      >
                        <div className="flex items-center p-4 border-2 border-gray-300 rounded-lg hover:border-maputo-primary transition">
                          <RadioGroupItem value="standard" id="standard" className="mr-3" />
                          <Label htmlFor="standard" className="flex-grow cursor-pointer">
                            <div className="font-semibold">Entrega Padrão</div>
                            <div className="text-sm text-gray-600">2-3 dias úteis - GRÁTIS</div>
                          </Label>
                          <span className="text-green-600 font-bold">GRÁTIS</span>
                        </div>
                        <div className="flex items-center p-4 border-2 border-gray-300 rounded-lg hover:border-maputo-primary transition">
                          <RadioGroupItem value="pickup" id="pickup" className="mr-3" />
                          <Label htmlFor="pickup" className="flex-grow cursor-pointer">
                            <div className="font-semibold">Retirada no Depósito</div>
                            <div className="text-sm text-gray-600">Disponível em 24h - Maputo</div>
                          </Label>
                          <span className="text-green-600 font-bold">GRÁTIS</span>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Payment Method */}
                    <div className="mb-8">
                      <h3 className="font-bold text-xl mb-4 flex items-center">
                        <CreditCard className="w-5 h-5 mr-2 text-maputo-primary" />
                        Método de Pagamento
                      </h3>
                      <RadioGroup
                        value={form.watch("payment_method")}
                        onValueChange={(value) => form.setValue("payment_method", value as "cash" | "transfer" | "mpesa")}
                        className="space-y-3"
                      >
                        <div className="flex items-center p-4 border-2 border-gray-300 rounded-lg hover:border-maputo-primary transition">
                          <RadioGroupItem value="cash" id="cash" className="mr-3" />
                          <Label htmlFor="cash" className="flex-grow cursor-pointer">
                            <div className="font-semibold">Dinheiro na Entrega</div>
                            <div className="text-sm text-gray-600">Pague em MZN ao receber</div>
                          </Label>
                          <i className="fas fa-money-bill-wave text-2xl text-green-600"></i>
                        </div>
                        <div className="flex items-center p-4 border-2 border-gray-300 rounded-lg hover:border-maputo-primary transition">
                          <RadioGroupItem value="transfer" id="transfer" className="mr-3" />
                          <Label htmlFor="transfer" className="flex-grow cursor-pointer">
                            <div className="font-semibold">Transferência Bancária</div>
                            <div className="text-sm text-gray-600">Dados enviados por email</div>
                          </Label>
                          <i className="fas fa-university text-2xl text-maputo-primary"></i>
                        </div>
                        <div className="flex items-center p-4 border-2 border-gray-300 rounded-lg hover:border-maputo-primary transition opacity-60">
                          <RadioGroupItem value="mpesa" id="mpesa" className="mr-3" disabled />
                          <Label htmlFor="mpesa" className="flex-grow cursor-pointer">
                            <div className="font-semibold">M-Pesa</div>
                            <div className="text-sm text-gray-600">Pagamento móvel (Em breve)</div>
                          </Label>
                          <i className="fas fa-mobile-alt text-2xl text-maputo-accent"></i>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Additional Notes */}
                    <div className="mb-8">
                      <Label htmlFor="notes">Observações (Opcional)</Label>
                      <Textarea
                        id="notes"
                        {...form.register("notes")}
                        placeholder="Informações adicionais sobre o pedido..."
                        rows={3}
                        data-testid="order-notes-input"
                      />
                    </div>

                    {/* Submit Buttons */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <Button
                        type="submit"
                        disabled={createOrderMutation.isPending}
                        className="bg-maputo-warning hover:bg-maputo-warning-dark text-gray-900 py-4 font-semibold"
                        data-testid="confirm-order-button"
                      >
                        {createOrderMutation.isPending ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-900 border-t-transparent mr-2"></div>
                            Processando...
                          </div>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            Confirmar Pedido
                          </>
                        )}
                      </Button>
                      
                      <Button asChild type="button" className="bg-green-600 hover:bg-green-700 text-white py-4 font-semibold">
                        <a
                          href={getWhatsAppURL(whatsappMessage)}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid="whatsapp-checkout-button"
                        >
                          <i className="fab fa-whatsapp mr-2"></i>
                          Finalizar via WhatsApp
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-4">Resumo do Pedido</h3>

                  <div className="space-y-3 mb-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.product.name} ({item.quantity}x)
                        </span>
                        <span className="font-medium">
                          {formatMZN(item.product.price_mzn * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal</span>
                      <span>{formatMZN(getTotalMZN())}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Entrega</span>
                      <span className="text-green-600">GRÁTIS</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold pt-2 border-t">
                      <span>Total</span>
                      <span className="text-maputo-primary">{formatMZN(getTotalMZN())}</span>
                    </div>
                    <div className="text-right text-gray-600 text-sm">
                      ({formatUSD(getTotalUSD())})
                    </div>
                  </div>

                  <div className="mt-6 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                    <ShieldCheck className="w-4 h-4 text-maputo-primary mr-2 inline" />
                    Todos os dados são protegidos e seguros
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
