describe('isDev', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('should be true when NODE_ENV is "dev"', () => {
    process.env.NODE_ENV = 'dev';
    const { isDev } = require('./isDev');
    expect(isDev).toBe(true);
  });

  it('should be false when NODE_ENV is not "dev"', () => {
    process.env.NODE_ENV = 'production';
    const { isDev } = require('./isDev');
    expect(isDev).toBe(false);
  });

  it('should be false when NODE_ENV is undefined', () => {
    delete process.env.NODE_ENV;
    const { isDev } = require('./isDev');
    expect(isDev).toBe(false);
  });
});
