import {
  Controller,
  Body,
  Post,
  Query,
  UseGuards,
  BadRequestException,
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
  @ApiOkResponse({ type: AuthEntity })
  login(@Body() { email, password }: LoginDTO) {
    return this.authService.login(email, password);
  }

  @Post('register')
  @ApiOkResponse({ type: AuthEntity })
  register(@Body() { pseudo, email, password }: RegisterDTO) {
    return this.authService.register(pseudo, email, password);
  }

  @Post('validate')
  @ApiOkResponse()
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  validate(@Query() query) {
    let ids: number[];
    try {
      ids = JSON.parse(`[${query.ids}]`);
    } catch {
      throw new BadRequestException('invalid Id array');
    }
    return this.authService.validate(ids);
  }

  @Post('reject')
  @ApiOkResponse()
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  reject(@Query() query) {
    let ids: number[];
    try {
      ids = JSON.parse(query.ids);
    } catch {
      throw new BadRequestException('invalid Id array');
    }
    return this.authService.reject(ids);
  }
}
