export const CATEGORIES = [
  { id: "Construção", name: "Construção", icon: "fas fa-hard-hat" },
  { id: "Móveis", name: "Móveis", icon: "fas fa-couch" },
  { id: "Eletrônicos", name: "Eletrônicos", icon: "fas fa-mobile-alt" },
] as const;

export const EXCHANGE_RATE = 64; // 1 USD = 64 MZN

export const WHATSAPP_NUMBER = "258843210987";

export const CONTACT_INFO = {
  phone: "+258 84 321 0987",
  email: "info@maputoimporthub.mz",
  address: "Av. Julius Nyerere, Maputo, Moçambique",
} as const;

export const DELIVERY_OPTIONS = [
  { id: "standard", name: "Entrega Padrão", description: "2-3 dias úteis - GRÁTIS", price: 0 },
  { id: "pickup", name: "Retirada no Depósito", description: "Disponível em 24h - Maputo", price: 0 },
] as const;

export const PAYMENT_METHODS = [
  { id: "cash", name: "Dinheiro na Entrega", description: "Pague em MZN ao receber", icon: "fas fa-money-bill-wave" },
  { id: "transfer", name: "Transferência Bancária", description: "Dados enviados por email", icon: "fas fa-university" },
  { id: "mpesa", name: "M-Pesa", description: "Pagamento móvel (Em breve)", icon: "fas fa-mobile-alt" },
] as const;
