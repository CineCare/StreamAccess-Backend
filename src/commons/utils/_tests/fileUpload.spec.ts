import { editAvatarFileName, editMovieFileName } from '../fileUpload';

describe('fileUpload', () => {
  it('should prepare a movie file upload', async () => {
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

    editMovieFileName(params.req, params.file, params.callback);
    expect(params.callback).toHaveBeenCalledWith(null, 'some_movie_title.mp4');
  });

  it('should prepare a user avatar file upload', async () => {
    const params = {
      file: {
        originalname: 'somefile.png',
      },
      callback: jest.fn(),
    };

    editAvatarFileName(null, params.file, params.callback);
    expect(params.callback).toHaveBeenCalledWith(null, 'somefile.png');
  });
});
