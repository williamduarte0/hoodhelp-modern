export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/hoodhelp',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
});
