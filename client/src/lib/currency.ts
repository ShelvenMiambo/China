import { EXCHANGE_RATE } from "./constants";

export function formatMZN(amount: number): string {
  return `${amount.toLocaleString()} MZN`;
}

export function formatUSD(amount: number): string {
  return `${amount.toFixed(2)} USD`;
}

export function convertMZNToUSD(mzn: number): number {
  return Number((mzn / EXCHANGE_RATE).toFixed(2));
}

export function convertUSDToMZN(usd: number): number {
  return Math.round(usd * EXCHANGE_RATE);
}

export function generateWhatsAppMessage(items: any[], customerInfo?: any): string {
  let message = "Olá! Gostaria de fazer um pedido:%0A%0A";
  
  items.forEach(item => {
    message += `${item.product_name}: ${item.quantity} unidades%0A`;
  });
  
  const total = items.reduce((sum, item) => sum + item.total_mzn, 0);
  message += `%0ATotal: ${formatMZN(total)} (${formatUSD(convertMZNToUSD(total))})`;
  
  if (customerInfo) {
    message += `%0A%0ANome: ${customerInfo.name}`;
    message += `%0ATelefone: ${customerInfo.phone}`;
    if (customerInfo.address) {
      message += `%0AEndereço: ${customerInfo.address}`;
    }
  }
  
  return message;
}

export function getWhatsAppURL(message: string, phone: string = "258843210987"): string {
  return `https://wa.me/${phone}?text=${message}`;
}
