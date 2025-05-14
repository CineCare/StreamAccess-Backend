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
  UseInterceptors,
  UploadedFile,
  Delete,
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
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors';
import { diskStorage } from 'multer';
import { editAvatarFileName } from '../commons/utils/fileUpload';
import * as path from 'path';
import * as fs from 'fs';

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
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: {
        fileSize: 8000000, // Compliant: 8MB
      },
      storage: diskStorage({
        destination: './assets/user_avatars',
        filename: editAvatarFileName,
      }),
    }),
  )
  async updateMe(
    @Request() req,
    @Body(bodyValidationPipe) body: UpdateUserDTO,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MappedUserDTO> {
    body.avatar = file ? file.filename : undefined;
    if (body.prefs && typeof body.prefs === 'string') {
      body.prefs = JSON.parse(body.prefs);
    }
    return await this.usersService.updateMe(req.user.id, body);
  }

  @Delete('me/avatar')
  @ApiOkResponse({ description: 'Avatar removed successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async deleteAvatar(@Request() req): Promise<{ message: string }> {
    const userId = req.user.id;

    // Récupérer l'utilisateur pour obtenir le chemin de l'avatar
    const user = await this.usersService.getOne(userId, { avatar: true });

    if (user.avatar) {
      const avatarPath = path.join(
        __dirname,
        '../../assets/user_avatars',
        user.avatar,
      );

      // Supprimer le fichier du système de fichiers
      fs.unlink(avatarPath, (err) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.error('Error deleting avatar file:', err);
          throw new BadRequestException('Failed to delete avatar file');
        }
      });

      // Mettre à jour la base de données pour vider la propriété avatar
      await this.usersService.updateMe(userId, { avatar: null });
    }

    return { message: 'Avatar removed successfully' };
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
