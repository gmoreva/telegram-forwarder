import * as path from 'path';
import * as fs from 'fs';

let dataDirectory = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDirectory)){
  fs.mkdirSync(dataDirectory);
}
let filename = dataDirectory + '/storage.sqlite';

export const settings = {
  sqlitePath: filename
}