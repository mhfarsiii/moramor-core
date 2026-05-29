import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  PaymentRequestDto,
  PaymentResponse,
  PaymentVerifyDto,
  PaymentVerifyResponse,
} from '../payment.service';

@Injectable()
export class ZarinpalService {
  private readonly merchantId: string;
  private readonly sandbox: boolean;
  private readonly callbackUrl: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.merchantId = this.configService.get<string>('ZARINPAL_MERCHANT_ID') || '';
    this.sandbox = this.configService.get<string>('ZARINPAL_SANDBOX') === 'true';
    this.callbackUrl = this.resolveCallbackUrl();
    this.baseUrl = this.sandbox ? 'https://sandbox.zarinpal.com' : 'https://payment.zarinpal.com';
  }

  /**
   * Zarinpal redirects the user to the frontend verify page, not the backend API.
   * The frontend then calls GET /api/v1/checkout/verify with Authority and Status.
   */
  private resolveCallbackUrl(): string {
    const frontendUrl = (
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'
    ).replace(/\/$/, '');
    const frontendCallback = `${frontendUrl}/checkout/verify`;

    const envCallback = this.configService.get<string>('ZARINPAL_CALLBACK_URL')?.trim();
    if (envCallback && envCallback.includes('/checkout/verify') && !envCallback.includes('/api/')) {
      return envCallback;
    }

    return frontendCallback;
  }

  async request(data: PaymentRequestDto): Promise<PaymentResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/pg/v4/payment/request.json`, {
        merchant_id: this.merchantId,
        amount: data.amount,
        description: data.description || `پرداخت سفارش ${data.orderId}`,
        callback_url: this.callbackUrl,
        metadata: {
          email: data.userEmail,
          order_id: data.orderId,
        },
      });

      const result = response.data;

      if (result.data && result.data.code === 100) {
        return {
          success: true,
          authority: result.data.authority,
          paymentUrl: `${this.baseUrl}/pg/StartPay/${result.data.authority}`,
        };
      }

      return {
        success: false,
        message: result.errors?.message || 'خطا در ایجاد درخواست پرداخت',
      };
    } catch (error) {
      return {
        success: false,
        message: 'خطا در اتصال به درگاه پرداخت',
      };
    }
  }

  async verify(data: PaymentVerifyDto): Promise<PaymentVerifyResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/pg/v4/payment/verify.json`, {
        merchant_id: this.merchantId,
        amount: data.amount,
        authority: data.authority,
      });

      const result = response.data;

      if (result.data && (result.data.code === 100 || result.data.code === 101)) {
        return {
          success: true,
          refId: result.data.ref_id?.toString(),
          message: 'پرداخت با موفقیت انجام شد',
        };
      }

      return {
        success: false,
        message: result.errors?.message || 'پرداخت ناموفق بود',
      };
    } catch (error) {
      return {
        success: false,
        message: 'خطا در تایید پرداخت',
      };
    }
  }
}
