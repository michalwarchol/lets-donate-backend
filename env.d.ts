declare namespace NodeJS {
  interface ProcessEnv extends Env {}
}

interface Env {
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
  POSTGRES_PORT: string;
  POSTGRES_HOST: string;
  PGADMIN_DEFAULT_EMAIL: string;
  PGADMIN_DEFAULT_PASSWORD: string;
  APP_URL: string;
  APP_PORT: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXP: string;
  MAIL_USER: string;
  MAIL_PASS: string;
}
