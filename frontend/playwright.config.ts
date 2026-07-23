import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:4217',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command:
        'dotnet run --no-launch-profile --urls http://127.0.0.1:5080 --project backend/src/RepoFluent.Api/RepoFluent.Api.csproj',
      cwd: '..',
      url: 'http://127.0.0.1:5080/api/health',
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: 'npm run start -- --host 127.0.0.1 --port 4217 --proxy-config proxy.conf.json',
      url: 'http://127.0.0.1:4217',
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
