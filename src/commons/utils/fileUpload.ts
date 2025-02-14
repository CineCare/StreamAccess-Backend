import { extname } from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sanitize = require('sanitize-filename');

export const editFileName = (req, file, callback) => {
  const name = sanitize(req.body.title.replaceAll(' ', '_'));
  const fileExtName = extname(file.originalname);
  callback(null, `${name}${fileExtName}`);
};
