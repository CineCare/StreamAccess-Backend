import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AdminAuthGuard } from '../auth/guard/admin-auth.guard';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('')
  @ApiOkResponse()
  getList() {
    return this.usersService.getList();
  }

  @Get('me')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req) {
    console.log(req.user.id);
    return this.usersService.getOne(req.user.id, { email: true, isActive: true });
  }

  @Get('candidates')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  getCandidates() {
    return this.usersService.getCandidates();
  }
}
