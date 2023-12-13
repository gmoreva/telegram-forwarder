import { parseDbUrl } from '@common/parse-db-url';
import { DataSourceOptions } from 'typeorm';
import * as path from 'path';

export const databaseConfig = () => {
  let parsedDb = parseDbUrl(process.env.DATABASE_URL);
  let options: DataSourceOptions = {
    type: 'postgres',
    database: parsedDb.database,
    username: parsedDb.user,
    password: parsedDb.password,
    host: parsedDb.host,
    port: parsedDb.port,
    entities: [
      path.resolve(
        `${__dirname}/../../**/*.entity.{js,ts}`,
      ),
    ],
    migrations: [
      path.resolve(`${__dirname}/../../migrations/*.{js,ts}`),
    ],
    migrationsRun: parsedDb.query?.runMigrate,
    synchronize: parsedDb.query?.sync,
    logging: parsedDb.query.log,
  };
  return {
    database: options
  };
};