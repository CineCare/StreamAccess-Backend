import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AdminAuthGuard } from '../auth/guard/admin-auth.guard';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UserEntity } from './entities/user.entity';
import { MineUserEntity } from './entities/mineUser.etity';
import { CandidateEntity } from './entities/candidate.entity';
import { handleErrorResponse } from '../commons/utils/handleErrorResponse';
import { UpdateUserDTO } from './DTO/userUpdate.dto';
import { bodyValidationPipe } from '../commons/validationPipes/bodyValidation.pipe';
import { ParseQueryIdPipe } from '../commons/validationPipes/parseQueryId.pipe';

const userValidationPipe = new ParseQueryIdPipe('user');

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('')
  @ApiOkResponse({ type: Array<UserEntity> })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getList() {
    return this.usersService.getList();
  }

  @Get('me')
  @ApiOkResponse({ type: MineUserEntity })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req) {
    return this.usersService.getOne(req.user.id, {
      email: true,
      isActive: true,
    });
  }

  @Get('candidates')
  @ApiOkResponse({ type: Array<CandidateEntity> })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  getCandidates() {
    return this.usersService.getCandidates();
  }

  @ApiOkResponse({ type: UserEntity })
  @ApiBadRequestResponse({ type: BadRequestException })
  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateMe(
    @Request() req,
    @Body(bodyValidationPipe) body: UpdateUserDTO,
  ): Promise<UserEntity> {
    return await this.usersService.updateMe(req.user.id, body);
  }

  @Get(':id')
  @ApiOkResponse({ type: UserEntity })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse({ type: BadRequestException })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getOne(
    @Param('id', userValidationPipe) id: number,
  ): Promise<UserEntity> {
    try {
      return await this.usersService.getOne(id);
    } catch (e) {
      handleErrorResponse(e, 'id', id);
    }
  }
}
