import { Controller, Body, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthEntity } from './entities/auth.entity';
import { LoginDTO } from './DTO/login.dto';
import { RegisterDTO } from './DTO/register.dto';
import { AdminAuthGuard } from './guard/admin-auth.guard';
import { castNumParam } from '../commons/utils/castNumParam';

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
    return this.authService.validate(castNumParam('id', query.id));
  }

  @Post('reject')
  @ApiOkResponse()
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  reject(@Query() query) {
    return this.authService.reject(castNumParam('id', query.id));
  }
}
