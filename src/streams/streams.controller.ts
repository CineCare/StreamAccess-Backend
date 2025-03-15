import {
  BadRequestException,
  Controller,
  Get,
  Header,
  Headers,
  HttpStatus,
  Logger,
  Res,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { createReadStream, statSync } from 'fs';
import { Response } from 'express';

@Controller('streams')
@ApiTags('streams')
export class StreamsController {
  private readonly logger = new Logger(StreamsController.name);
  @ApiOkResponse()
  @ApiBadRequestResponse({ type: BadRequestException })
  @Get()
  @Header('Accept-Ranges', 'bytes')
  @Header('Content-Type', 'video/mp4')
  getStream(@Headers() headers, @Res() res: Response) {
    this.logger.log('stream begins');
    const videoPath = `${process.env.ASSETS_PATH}/Freaks_La_Monstrueuse_Parade_1932_VOSTFR.mp4`;
    const { size } = statSync(videoPath);
    const videoRange = headers.range;
    if (videoRange) {
      const parts = videoRange.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : size - 1;
      const chunkSize = end - start + 1;
      const readStreamfile = createReadStream(videoPath, {
        start,
        end,
        highWaterMark: 60,
      });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Content-Length': chunkSize,
      };
      res.writeHead(HttpStatus.PARTIAL_CONTENT, head); //206
      readStreamfile.pipe(res);
    } else {
      const head = {
        'Content-Length': size,
      };
      res.writeHead(HttpStatus.OK, head); //200
      createReadStream(videoPath).pipe(res);
    }
  }
}
