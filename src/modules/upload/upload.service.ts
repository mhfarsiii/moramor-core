import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  url: string;
  key: string;
  size: number;
}

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly logger = new Logger(UploadService.name);
  private s3Client: S3Client;
  private bucket: string;
  private publicUrl: string;
  private bucketChecked: boolean = false;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('S3_ENDPOINT') || 'http://localhost:9000';
    const region = this.configService.get<string>('S3_REGION') || 'us-east-1';
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY') || 'minioadmin';
    const secretAccessKey = this.configService.get<string>('S3_SECRET_KEY') || 'minioadmin';

    const s3UseSsl = this.configService.get<string>('S3_USE_SSL') === 'true';
    // MinIO usually requires path style access (http://host/bucket) instead of virtual host style (http://bucket.host)
    // We force path style if SSL is disabled (typical for local/MinIO) or if explicitly requested
    const forcePathStyle =
      this.configService.get<string>('S3_FORCE_PATH_STYLE') === 'true' || !s3UseSsl;

    this.bucket = this.configService.get<string>('S3_BUCKET') || 'moramor-products';
    this.publicUrl =
      this.configService.get<string>('S3_PUBLIC_URL') || 'http://localhost:9000/moramor-products';

    this.logger.log(`Initializing S3 Client:
      Endpoint: ${endpoint}
      Region: ${region}
      Bucket: ${this.bucket}
      Use SSL: ${s3UseSsl}
      Force Path Style: ${forcePathStyle}
    `);

    this.s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle,
    });
  }

  async onModuleInit(): Promise<void> {
    // Try to check bucket, but don't fail if MinIO is not available
    // This allows the app to start even if MinIO is not running
    try {
      await this.ensureBucketExists();
    } catch (error: any) {
      this.logger.warn(
        `MinIO/S3 connection check failed during startup: ${error.message}. ` +
          `The app will continue to start, but uploads will fail until MinIO is available.`,
      );
      // Don't throw - allow app to start
    }
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      // Check if bucket exists
      await this.s3Client.send(
        new HeadBucketCommand({
          Bucket: this.bucket,
        }),
      );
      this.logger.log(`Bucket '${this.bucket}' exists and is accessible`);
      this.bucketChecked = true;
    } catch (error: any) {
      // If bucket doesn't exist, create it
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        try {
          this.logger.log(`Bucket '${this.bucket}' not found. Creating...`);
          await this.s3Client.send(
            new CreateBucketCommand({
              Bucket: this.bucket,
            }),
          );
          this.logger.log(`Bucket '${this.bucket}' created successfully`);
          this.bucketChecked = true;
        } catch (createError: any) {
          this.logger.error(
            `Failed to create bucket '${this.bucket}': ${createError.message}`,
            createError.stack,
          );
          throw new Error(
            `خطا در ایجاد bucket. لطفاً اتصال به MinIO/S3 را بررسی کنید: ${createError.message}`,
          );
        }
      } else {
        // Other connection errors
        this.logger.error(`Failed to connect to S3/MinIO: ${error.message}`, error.stack);
        throw new Error(
          `خطا در اتصال به MinIO/S3. لطفاً بررسی کنید که سرویس در حال اجرا است: ${error.message}`,
        );
      }
    }
  }

  async uploadImage(file: Express.Multer.File, folder: string = 'uploads'): Promise<UploadResult> {
    try {
      // Validate file input
      if (!file) {
        throw new InternalServerErrorException('فایل ارسال نشده است');
      }

      if (!file.buffer || file.buffer.length === 0) {
        this.logger.error('File buffer is empty or undefined', {
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        });
        throw new InternalServerErrorException('فایل خالی است یا به درستی ارسال نشده است');
      }

      this.logger.debug(
        `Processing image: ${file.originalname}, size: ${file.buffer.length} bytes`,
      );

      // Ensure bucket exists before upload (lazy check)
      if (!this.bucketChecked) {
        await this.ensureBucketExists();
      }

      // Process image with Sharp
      let processedImage: Buffer;
      try {
        processedImage = await sharp(file.buffer)
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 85 })
          .toBuffer();
      } catch (sharpError: any) {
        this.logger.error(`Sharp processing failed: ${sharpError.message}`, {
          filename: file.originalname,
          mimetype: file.mimetype,
          error: sharpError,
        });

        if (sharpError.message?.includes('Input buffer contains unsupported image format')) {
          throw new InternalServerErrorException('فرمت تصویر پشتیبانی نمی‌شود');
        }

        if (sharpError.message?.includes('Input file is missing')) {
          throw new InternalServerErrorException('فایل تصویر یافت نشد');
        }

        throw new InternalServerErrorException(
          `خطا در پردازش تصویر: ${sharpError.message || 'خطای نامشخص'}`,
        );
      }

      const key = `${folder}/${uuidv4()}.jpg`;

      try {
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: processedImage,
            ContentType: 'image/jpeg',
            ACL: 'public-read',
          }),
        );
        this.logger.debug(`Successfully uploaded image to S3: ${key}`);
      } catch (s3Error: any) {
        this.logger.error(`S3 upload failed: ${s3Error.message}`, {
          key,
          bucket: this.bucket,
          error: s3Error,
          stack: s3Error.stack,
        });

        // Provide more specific error messages
        if (s3Error.name === 'NetworkingError' || s3Error.code === 'ECONNREFUSED') {
          throw new InternalServerErrorException(
            'خطا در اتصال به MinIO. لطفاً بررسی کنید که MinIO در حال اجرا است و آدرس endpoint صحیح است',
          );
        }

        if (s3Error.name === 'NoSuchBucket') {
          throw new InternalServerErrorException(
            `Bucket '${this.bucket}' وجود ندارد. لطفاً bucket را ایجاد کنید`,
          );
        }

        if (s3Error.name === 'InvalidAccessKeyId' || s3Error.name === 'SignatureDoesNotMatch') {
          throw new InternalServerErrorException(
            'خطا در احراز هویت. لطفاً S3_ACCESS_KEY و S3_SECRET_KEY را بررسی کنید',
          );
        }

        throw new InternalServerErrorException(
          `خطا در آپلود فایل: ${s3Error.message || 'خطای نامشخص'}`,
        );
      }

      return {
        url: `${this.publicUrl}/${key}`,
        key,
        size: processedImage.length,
      };
    } catch (error: any) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      this.logger.error(`Image upload failed: ${error.message}`, {
        error: error.message,
        stack: error.stack,
        filename: file?.originalname,
        mimetype: file?.mimetype,
      });

      // Re-throw if it's already an InternalServerErrorException
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      // Handle specific error cases
      if (error.message?.includes('Input buffer contains unsupported image format')) {
        throw new InternalServerErrorException('فرمت تصویر پشتیبانی نمی‌شود');
      }

      // Generic error fallback
      throw new InternalServerErrorException(
        `خطا در پردازش تصویر: ${error.message || 'لطفاً دوباره تلاش کنید'}`,
      );
    }
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = 'uploads',
  ): Promise<UploadResult[]> {
    try {
      return await Promise.all(files.map((file) => this.uploadImage(file, folder)));
    } catch (error: any) {
      this.logger.error(`Multiple image upload failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteImage(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error: any) {
      this.logger.error(`S3 delete failed for key ${key}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('خطا در حذف فایل از سرویس ذخیره‌سازی');
    }
  }

  async deleteMultipleImages(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map((key) => this.deleteImage(key)));
    } catch (error: any) {
      this.logger.error(`Multiple image delete failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}
