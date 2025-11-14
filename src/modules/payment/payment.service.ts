import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZarinpalService } from './services/zarinpal.service';
import { PaymentMethod } from '@prisma/client';

export interface PaymentRequestDto {
  amount: number;
  orderId: string;
  userEmail: string;
  description?: string;
}

export interface PaymentResponse {
  success: boolean;
  authority?: string;
  paymentUrl?: string;
  message?: string;
}

export interface PaymentVerifyDto {
  authority: string;
  amount: number;
}

export interface PaymentVerifyResponse {
  success: boolean;
  refId?: string;
  message?: string;
}

@Injectable()
export class PaymentService {
  constructor(
    private configService: ConfigService,
    private zarinpalService: ZarinpalService,
  ) {}

  async requestPayment(method: PaymentMethod, data: PaymentRequestDto): Promise<PaymentResponse> {
    switch (method) {
      case PaymentMethod.ZARINPAL:
        return this.zarinpalService.request(data);
      case PaymentMethod.NEXTPAY:
        // Implement NextPay integration
        throw new Error('NextPay not implemented yet');
      case PaymentMethod.CASH_ON_DELIVERY:
      case PaymentMethod.BANK_TRANSFER:
        return {
          success: true,
          message: 'پرداخت در محل یا واریز بانکی - نیازی به درگاه نیست',
        };
      default:
        throw new Error('روش پرداخت نامعتبر');
    }
  }

  async verifyPayment(
    method: PaymentMethod,
    data: PaymentVerifyDto,
  ): Promise<PaymentVerifyResponse> {
    switch (method) {
      case PaymentMethod.ZARINPAL:
        return this.zarinpalService.verify(data);
      case PaymentMethod.NEXTPAY:
        throw new Error('NextPay not implemented yet');
      default:
        throw new Error('روش پرداخت نامعتبر');
    }
  }
}
