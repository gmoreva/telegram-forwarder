import * as url from 'url';
import * as querystring from 'querystring';
import { parseBool } from '../parse-bool.fn';

type Created = {
  query?: {
    sync: boolean;
    runMigrate: boolean;
    log: boolean;
  };
  driver: string;
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
};

export function parseDbUrl(databaseUrl: string): Created {
  var parsedUrl = url.parse(databaseUrl, false, true);

  // Query parameters end up directly in the configuration.
  var config: any = {
    query: querystring.parse(parsedUrl.query),
  };
  if (config.query.sync) {
    config.query.sync = parseBool(config.query.sync);
  }

  config.driver = (parsedUrl.protocol || 'sqlite3:')
    // The protocol coming from url.parse() has a trailing :
    .replace(/\:$/, '');

  // Cloud Foundry will sometimes set a 'mysql2' scheme instead of 'mysql'.
  if (config.driver == 'mysql2') config.driver = 'mysql';

  // url.parse() produces an "auth" that looks like "user:password". No
  // individual fields, unfortunately.
  if (parsedUrl.auth) {
    var userPassword = parsedUrl.auth.split(':', 2);
    config.user = userPassword[0];
    if (userPassword.length > 1) {
      config.password = userPassword[1];
    }
  }

  if (config.driver === 'sqlite3') {
    if (parsedUrl.hostname) {
      if (parsedUrl.pathname) {
        // Relative path.
        config.filename = parsedUrl.hostname + parsedUrl.pathname;
      } else {
        // Just a filename.
        config.filename = parsedUrl.hostname;
      }
    } else {
      // Absolute path.
      config.filename = parsedUrl.pathname;
    }
  } else {
    if (parsedUrl.pathname) config.database = parsedUrl.pathname.slice(1);
    if (parsedUrl.hostname) config.host = parsedUrl.hostname;
    if (parsedUrl.port) config.port = parseInt(parsedUrl.port, 10);
  }
  return config;
}
