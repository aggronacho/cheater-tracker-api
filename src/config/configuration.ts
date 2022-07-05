export default () => ({
  dbUsername: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,
  dbPort: parseInt(process.env.DB_PORT),
  dbName: process.env.DB_NAME,
  dbServer: process.env.DB_SERVER,
  trackerBaseUrl: process.env.TRACKER_BASE_URL,
  trackerApiKey: process.env.TRACKER_API_KEY,
});
