export default () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'change-me',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-too',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  },
  cors: {
    allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173')
      .split(',')
      .map((o) => o.trim()),
  },
  seed: {
    defaultPassword: process.env.SEED_DEFAULT_PASSWORD || 'Test@1234',
  },
});
