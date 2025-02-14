import { extname } from 'path';
const sanitize = require('sanitize-filename');

export const editFileName = (req, file, callback) => {
  const name = sanitize(req.body.title.replaceAll(' ', '_'));
  const fileExtName = extname(file.originalname);
  callback(null, `${name}${fileExtName}`);
};
