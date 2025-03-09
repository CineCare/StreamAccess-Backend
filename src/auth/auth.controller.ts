import {
  Controller,
  Body,
  Post,
  Query,
  UseGuards,
  HttpCode,
  ValidationPipe,
  ParseArrayPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthEntity } from './entities/auth.entity';
import { LoginDTO } from './DTO/login.dto';
import { RegisterDTO } from './DTO/register.dto';
import { AdminAuthGuard } from './guard/admin-auth.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOkResponse({ type: AuthEntity })
  login(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: LoginDTO,
  ) {
    return this.authService.login(body);
  }

  @Post('register')
  @ApiOkResponse({ type: AuthEntity })
  register(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: RegisterDTO,
  ) {
    return this.authService.register(body);
  }

  @Post('validate')
  @ApiOkResponse()
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  validate(
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: number[],
  ) {
    return this.authService.validate(ids);
  }

  @Post('reject')
  @ApiOkResponse()
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  reject(
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: number[],
  ) {
    return this.authService.reject(ids);
  }
}
