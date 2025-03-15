import { editFileName } from '../fileUpload';
import { NotFoundException } from '@nestjs/common';

describe('fileUpload', () => {
  it('should prepare a file upload', async () => {
    const params = {
      req: {
        body: {
          title: 'some movie title',
        },
        route: {
          stack: [
            {
              method: 'post',
            },
          ],
        },
      },
      file: {
        originalname: 'somefile.mp4',
      },
      callback: jest.fn(),
    };

    editFileName(params.req, params.file, params.callback);
    expect(params.callback).toHaveBeenCalledWith(null, 'some_movie_title.mp4');
  });

  it('should prepare a file upload ( put )', async () => {
    const params = {
      req: {
        body: {
          title: 'some movie title',
        },
        route: {
          stack: [
            {
              method: 'put',
            },
          ],
        },
        url: '/movies/1',
      },
      file: {
        originalname: 'somefile.mp4',
      },
      callback: jest.fn(),
    };

    await editFileName(params.req, params.file, params.callback);
    expect(params.callback).not.toThrow();
  });

  it('should handle error when movie service fails', async () => {
    const params = {
      req: {
        body: {
          title: 'some movie title',
        },
        route: {
          stack: [
            {
              method: 'put',
            },
          ],
        },
        url: '/movies/0',
      },
      file: {
        originalname: 'somefile.mp4',
      },
      callback: jest.fn(),
    };

    await editFileName(params.req, params.file, params.callback);
    expect(params.callback).toHaveBeenCalledWith(
      new NotFoundException('movieId 0'),
      false,
    );
  });
});
