import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MailService } from './mail.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockUser = {
    id: 'user-1',
    phoneNumber: '09123456789',
    email: null,
    name: '09123456789',
    role: 'USER',
    isActive: true,
    phoneVerified: true,
    emailVerified: false,
    password: null,
    googleId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-token'),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        JWT_SECRET: 'test-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_ACCESS_EXPIRATION: '24h',
        JWT_REFRESH_EXPIRATION: '30d',
        PASSWORD_RESET_EXPIRATION: '2h',
      };
      return config[key];
    }),
  };

  const mockMailService = {
    sendPasswordResetEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendOtp', () => {
    it('should return success message for valid phone number', async () => {
      const result = await service.sendOtp({ phoneNumber: '09123456789' });
      expect(result).toEqual({ message: 'کد تأیید ارسال شد' });
    });
  });

  describe('verifyOtp', () => {
    it('should reject invalid OTP', async () => {
      await expect(service.verifyOtp({ phoneNumber: '09123456789', otp: '99999' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should authenticate existing user with valid mock OTP', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        phoneVerified: true,
      });
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.verifyOtp({ phoneNumber: '09123456789', otp: '12345' });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.isNewUser).toBe(false);
    });

    it('should create new user with valid mock OTP', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.verifyOtp({ phoneNumber: '09123456789', otp: '12345' });

      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(result.isNewUser).toBe(true);
    });
  });
});
