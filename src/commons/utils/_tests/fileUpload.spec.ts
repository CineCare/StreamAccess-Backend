import { editFileName } from '../fileUpload';

describe('fileUpload', () => {
  it('should prepare a file upload', async () => {
    const params = {
      req: {
        body: {
          title: 'some movie title',
        },
      },
      file: {
        originalname: 'ssomefile.mp4',
      },
      callback: jest.fn(),
    };

    editFileName(params.req, params.file, params.callback);
    expect(params.callback).toHaveBeenCalledWith(null, 'some_movie_title.mp4');
  });
});
