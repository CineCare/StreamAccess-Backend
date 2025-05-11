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
  Post,
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
import { MappedUserDTO } from './DTO/userMapped.dto';
import { CandidateEntity } from './entities/candidate.entity';
import { handleErrorResponse } from '../commons/utils/handleErrorResponse';
import { UpdateUserDTO } from './DTO/userUpdate.dto';
import { bodyValidationPipe } from '../commons/validationPipes/bodyValidation.pipe';
import { ParseQueryIdPipe } from '../commons/validationPipes/parseQueryId.pipe';
import { PrefTypeDTO } from '../commons/utils/prefsHandler';
import { PrefType } from '@prisma/client';

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
  @ApiOkResponse({ type: MappedUserDTO })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req): Promise<MappedUserDTO> {
    return this.usersService.getOne(req.user.id, {
      email: true,
      prefs: { select: { name: true, value: true, profileName: true } },
    });
  }

  @Get('candidates')
  @ApiOkResponse({ type: Array<CandidateEntity> })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  getCandidates() {
    return this.usersService.getCandidates();
  }

  @ApiOkResponse({ type: MappedUserDTO })
  @ApiBadRequestResponse({ type: BadRequestException })
  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateMe(
    @Request() req,
    @Body(bodyValidationPipe) body: UpdateUserDTO,
  ): Promise<MappedUserDTO> {
    return await this.usersService.updateMe(req.user.id, body);
  }

  @Get(':id')
  @ApiOkResponse({ type: MappedUserDTO })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse({ type: BadRequestException })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getOne(
    @Param('id', userValidationPipe) id: number,
  ): Promise<MappedUserDTO> {
    try {
      return await this.usersService.getOne(id);
    } catch (e) {
      handleErrorResponse(e, 'id', id);
    }
  }

  @Post('prefType')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  async postPrefType(
    @Body(bodyValidationPipe) body: PrefTypeDTO,
  ): Promise<PrefType> {
    return await this.usersService.addPrefType(body);
  }
}
