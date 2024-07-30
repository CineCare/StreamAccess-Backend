import { Controller, Body, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthEntity } from './entities/auth.entity';
import { LoginDTO } from './DTO/login.dto';
import { RegisterDTO } from './DTO/register.dto';

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
}
