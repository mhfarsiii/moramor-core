import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  url: string;
  key: string;
  size: number;
}

@Injectable()
export class UploadService {
  private s3Client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('S3_ENDPOINT') || 'http://localhost:9000';
    const region = this.configService.get<string>('S3_REGION') || 'us-east-1';
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY') || 'minioadmin';
    const secretAccessKey = this.configService.get<string>('S3_SECRET_KEY') || 'minioadmin';
    const forcePathStyle = !this.configService.get<string>('S3_USE_SSL');

    this.bucket = this.configService.get<string>('S3_BUCKET') || 'moramor-products';
    this.publicUrl =
      this.configService.get<string>('S3_PUBLIC_URL') || 'http://localhost:9000/moramor-products';

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

  async uploadImage(file: Express.Multer.File, folder: string = 'uploads'): Promise<UploadResult> {
    // Process image with Sharp
    const processedImage = await sharp(file.buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    const key = `${folder}/${uuidv4()}.jpg`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: processedImage,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
      }),
    );

    return {
      url: `${this.publicUrl}/${key}`,
      key,
      size: processedImage.length,
    };
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = 'uploads',
  ): Promise<UploadResult[]> {
    return Promise.all(files.map((file) => this.uploadImage(file, folder)));
  }

  async deleteImage(key: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async deleteMultipleImages(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.deleteImage(key)));
  }
}
