export type PaymentProvider = "stripe" | "wechat_pay" | "alipay";
export type CheckoutRequest = { orderId: string; amount: number; currency: "CNY" | "USD"; provider: PaymentProvider };
export interface PaymentGateway {
  createCheckout(input: CheckoutRequest): Promise<{ redirectUrl: string }>;
  verifyWebhook(payload: string, signature?: string): Promise<{ orderId: string; paid: boolean }>;
}
// Providers implement this contract; secrets stay in server-only environment variables.
