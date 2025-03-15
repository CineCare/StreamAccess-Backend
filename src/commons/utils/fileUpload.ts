import { extname } from 'path';
import { PrismaService } from '../../prisma/prisma.service';
import { MoviesService } from '../../movies/movies.service';
import { castNumParam } from './castNumParam';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sanitize = require('sanitize-filename');

export const editFileName = async (req, file, callback) => {
  let movieTitle = '';

  if (req.route.stack[0].method === 'put') {
    try {
      const movieId = castNumParam(
        'movieId',
        req.url.substring(req.url.lastIndexOf('/') + 1),
      );
      const moviesSevice = new MoviesService(new PrismaService());
      movieTitle = (await moviesSevice.getOne(movieId)).title;
    } catch (e) {
      //callback(null, false);
      return callback(e, false);
    }
  } else {
    movieTitle = req.body.title;
  }

  const name = sanitize(movieTitle.replaceAll(' ', '_'));
  const fileExtName = extname(file.originalname);
  callback(null, `${name}${fileExtName}`);
};
