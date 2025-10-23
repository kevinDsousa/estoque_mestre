import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    try {
      const stripeKey = this.configService.get('stripe.secretKey') || 'sk_test_dummy';
      
      if (!stripeKey || stripeKey === 'sk_test_dummy') {
        console.warn('[STRIPE] Stripe API key not configured. Payment functionality will be limited.');
      }
      
      this.stripe = new Stripe(stripeKey, {
        apiVersion: '2024-06-20',
      });
      
      if (stripeKey && stripeKey !== 'sk_test_dummy') {
        console.log('[STRIPE] Stripe client initialized successfully');
      }
    } catch (error) {
      console.error('[STRIPE] Error initializing Stripe:', error.message);
      console.warn('[STRIPE] Stripe service is not available. Payment functionality will be limited.');
      // Initialize with dummy key to prevent crashes
      this.stripe = new Stripe('sk_test_dummy', {
        apiVersion: '2024-06-20',
      });
    }
  }

  // Customer Management
  async createCustomer(customerData: {
    email: string;
    name: string;
    companyId: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email: customerData.email,
        name: customerData.name,
        metadata: {
          companyId: customerData.companyId,
          ...customerData.metadata,
        },
      });

      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new InternalServerErrorException('Failed to create customer');
    }
  }

  async updateCustomer(customerId: string, updateData: {
    email?: string;
    name?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.update(customerId, updateData);
      return customer;
    } catch (error) {
      console.error('Error updating Stripe customer:', error);
      throw new InternalServerErrorException('Failed to update customer');
    }
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      if (customer.deleted) {
        throw new BadRequestException('Customer has been deleted');
      }
      return customer as Stripe.Customer;
    } catch (error) {
      console.error('Error retrieving Stripe customer:', error);
      throw new InternalServerErrorException('Failed to retrieve customer');
    }
  }

  async deleteCustomer(customerId: string): Promise<Stripe.DeletedCustomer> {
    try {
      const deletedCustomer = await this.stripe.customers.del(customerId);
      return deletedCustomer;
    } catch (error) {
      console.error('Error deleting Stripe customer:', error);
      throw new InternalServerErrorException('Failed to delete customer');
    }
  }

  // Payment Methods
  async createPaymentMethod(paymentMethodData: {
    type: 'card';
    card: {
      number: string;
      exp_month: number;
      exp_year: number;
      cvc: string;
    };
  }): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.create(paymentMethodData);
      return paymentMethod;
    } catch (error) {
      console.error('Error creating payment method:', error);
      throw new InternalServerErrorException('Failed to create payment method');
    }
  }

  async attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      return paymentMethod;
    } catch (error) {
      console.error('Error attaching payment method:', error);
      throw new InternalServerErrorException('Failed to attach payment method');
    }
  }

  async detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.detach(paymentMethodId);
      return paymentMethod;
    } catch (error) {
      console.error('Error detaching payment method:', error);
      throw new InternalServerErrorException('Failed to detach payment method');
    }
  }

  async getCustomerPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });
      return paymentMethods.data;
    } catch (error) {
      console.error('Error retrieving payment methods:', error);
      throw new InternalServerErrorException('Failed to retrieve payment methods');
    }
  }

  // Payment Intents
  async createPaymentIntent(paymentData: {
    amount: number; // in cents
    currency: string;
    customerId: string;
    paymentMethodId?: string;
    metadata?: Record<string, string>;
    description?: string;
  }): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: paymentData.amount,
        currency: paymentData.currency,
        customer: paymentData.customerId,
        payment_method: paymentData.paymentMethodId,
        metadata: paymentData.metadata,
        description: paymentData.description,
        confirmation_method: 'manual',
        confirm: true,
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new InternalServerErrorException('Failed to create payment intent');
    }
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error confirming payment intent:', error);
      throw new InternalServerErrorException('Failed to confirm payment intent');
    }
  }

  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      throw new InternalServerErrorException('Failed to retrieve payment intent');
    }
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.cancel(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error canceling payment intent:', error);
      throw new InternalServerErrorException('Failed to cancel payment intent');
    }
  }

  // Subscriptions
  async createSubscription(subscriptionData: {
    customerId: string;
    priceId: string;
    paymentMethodId?: string;
    trialPeriodDays?: number;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: subscriptionData.customerId,
        items: [{ price: subscriptionData.priceId }],
        default_payment_method: subscriptionData.paymentMethodId,
        trial_period_days: subscriptionData.trialPeriodDays,
        metadata: subscriptionData.metadata,
        expand: ['latest_invoice.payment_intent'],
      });

      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new InternalServerErrorException('Failed to create subscription');
    }
  }

  async updateSubscription(subscriptionId: string, updateData: {
    priceId?: string;
    paymentMethodId?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      
      const updateParams: Stripe.SubscriptionUpdateParams = {
        metadata: updateData.metadata,
      };

      if (updateData.priceId) {
        updateParams.items = [{
          id: subscription.items.data[0].id,
          price: updateData.priceId,
        }];
      }

      if (updateData.paymentMethodId) {
        updateParams.default_payment_method = updateData.paymentMethodId;
      }

      const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, updateParams);
      return updatedSubscription;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw new InternalServerErrorException('Failed to update subscription');
    }
  }

  async cancelSubscription(subscriptionId: string, immediately: boolean = false): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: !immediately,
      });

      if (immediately) {
        return await this.stripe.subscriptions.cancel(subscriptionId);
      }

      return subscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new InternalServerErrorException('Failed to cancel subscription');
    }
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      throw new InternalServerErrorException('Failed to retrieve subscription');
    }
  }

  async getCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
    try {
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
      });
      return subscriptions.data;
    } catch (error) {
      console.error('Error retrieving customer subscriptions:', error);
      throw new InternalServerErrorException('Failed to retrieve customer subscriptions');
    }
  }

  // Refunds
  async createRefund(refundData: {
    paymentIntentId: string;
    amount?: number; // in cents, if not provided, full refund
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
    metadata?: Record<string, string>;
  }): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: refundData.paymentIntentId,
        amount: refundData.amount,
        reason: refundData.reason,
        metadata: refundData.metadata,
      });

      return refund;
    } catch (error) {
      console.error('Error creating refund:', error);
      throw new InternalServerErrorException('Failed to create refund');
    }
  }

  async getRefund(refundId: string): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.retrieve(refundId);
      return refund;
    } catch (error) {
      console.error('Error retrieving refund:', error);
      throw new InternalServerErrorException('Failed to retrieve refund');
    }
  }

  // Webhooks
  async constructWebhookEvent(payload: string | Buffer, signature: string): Promise<Stripe.Event> {
    try {
      const webhookSecret = this.configService.get('stripe.webhookSecret');
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      return event;
    } catch (error) {
      console.error('Error constructing webhook event:', error);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  // Products and Prices
  async createProduct(productData: {
    name: string;
    description?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Product> {
    try {
      const product = await this.stripe.products.create(productData);
      return product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async createPrice(priceData: {
    productId: string;
    unitAmount: number; // in cents
    currency: string;
    recurring?: {
      interval: 'day' | 'week' | 'month' | 'year';
      intervalCount?: number;
    };
    metadata?: Record<string, string>;
  }): Promise<Stripe.Price> {
    try {
      const price = await this.stripe.prices.create(priceData);
      return price;
    } catch (error) {
      console.error('Error creating price:', error);
      throw new InternalServerErrorException('Failed to create price');
    }
  }

  async getPrice(priceId: string): Promise<Stripe.Price> {
    try {
      const price = await this.stripe.prices.retrieve(priceId);
      return price;
    } catch (error) {
      console.error('Error retrieving price:', error);
      throw new InternalServerErrorException('Failed to retrieve price');
    }
  }

  // Utility methods
  async validateWebhookSignature(payload: string | Buffer, signature: string): Promise<boolean> {
    try {
      await this.constructWebhookEvent(payload, signature);
      return true;
    } catch {
      return false;
    }
  }

  formatAmount(amount: number, currency: string = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  }

  parseAmount(amount: string): number {
    // Convert "R$ 150,00" to 15000 cents
    const numericValue = amount.replace(/[^\d,]/g, '').replace(',', '.');
    return Math.round(parseFloat(numericValue) * 100);
  }
}
