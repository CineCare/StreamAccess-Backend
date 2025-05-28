import {
  BadRequestException,
  Controller,
  Get,
  Header,
  Headers,
  HttpStatus,
  Logger,
  Res,
  StreamableFile,
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
  getStream(@Headers() headers, @Res({ passthrough: true }) res: Response) {
    this.logger.log('stream begins');
    const videoPath = `${process.env.ASSETS_PATH}/movies_streams/Freaks_La_Monstrueuse_Parade_1932_VOSTFR.mp4`;
    const { size } = statSync(videoPath);
    const videoRange = headers.range;
    if (videoRange) {
      const parts = videoRange.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      let end = parts[1] ? parseInt(parts[1], 10) : size - 1;
      let status = HttpStatus.PARTIAL_CONTENT;
      // what if end is greater than size?
      if (start >= size || start > end) {
        throw new BadRequestException(
          'Requested range not satisfiable. Start is greater than size or end is less than start.',
        );
      }
      if (end >= size) {
        end = size - 1; // Adjust end to the last byte of the file
        status = HttpStatus.OK;
      }
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
      res.writeHead(status, head); //206
      return new StreamableFile(readStreamfile);
    } else {
      const head = {
        'Content-Length': size,
      };
      res.writeHead(HttpStatus.OK, head); //200
      return new StreamableFile(createReadStream(videoPath));
    }
  }
}
