import configuration from './configuration';

describe('configuration', () => {
  beforeAll(() => {
    process.env.DB_USERNAME = 'user';
    process.env.DB_PASSWORD = 'password';
    process.env.DB_PORT = '1234';
    process.env.DB_NAME = 'sample';
    process.env.DB_SERVER = 'localhost';
    process.env.TRACKER_BASE_URL = 'http://sample.com';
    process.env.TRACKER_API_KEY = 'apiKey';
  });

  it('Should return a configuration', () => {
    const response = configuration();

    expect(response).toEqual({
      dbUsername: 'user',
      dbPassword: 'password',
      dbPort: 1234,
      dbName: 'sample',
      dbServer: 'localhost',
      trackerBaseUrl: 'http://sample.com',
      trackerApiKey: 'apiKey',
    });
  });
});
