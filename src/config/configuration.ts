type Configuration = {
  appUrl: string;
  port: number;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  jwtSecret: string;
  jwtExp: string;
  mail: {
    user: string;
    pass: string;
  };
};

export default (): Configuration => ({
  appUrl: process.env.APP_URL || 'http://localhost:4000/',
  port: parseInt(process.env.APP_PORT, 10) || 4000,
  database: {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  },
  jwtSecret: process.env.JWT_SECRET,
  jwtExp: process.env.JWT_EXP,
  mail: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});
