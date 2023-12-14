import { DataSource } from 'typeorm';
import { databaseConfig } from '@infrastructure/config/database';

const datasource = new DataSource(databaseConfig().database);
datasource.initialize();
export default datasource;
