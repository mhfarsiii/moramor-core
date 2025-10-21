import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for email verification
 * @description Contains the verification token sent to user's email
 */
export class VerifyEmailDto {
  @ApiProperty({
    description: 'توکن تأیید ایمیل',
    example: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
    minLength: 32,
    maxLength: 64
  })
  @IsString({ message: 'توکن باید رشته باشد' })
  @IsNotEmpty({ message: 'توکن تأیید الزامی است' })
  @Length(32, 64, { message: 'توکن باید بین ۳۲ تا ۶۴ کاراکتر باشد' })
  token: string;
}
