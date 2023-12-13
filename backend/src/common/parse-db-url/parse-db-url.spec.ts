import { parseDbUrl } from '@common/parse-db-url/index';

describe('db url parsing', () => {
  it('should parse db url with query string', async () => {
    const url = 'postgres://root:password@localhost:5432/database?sync=1';
    const data = parseDbUrl(url);
    expect(data).toEqual({
      query: {
        sync: true,
      },
      driver: 'postgres',
      user: 'root',
      password: 'password',
      host: 'localhost',
      port: 5432,
      database: 'database',
    });
    console.log(data);
  });
});
