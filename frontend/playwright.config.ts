import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
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
      env: {
        ASPNETCORE_ENVIRONMENT: 'E2E',
        ConnectionStrings__RepoFluent: 'Data Source=repofluent.e2e.db',
      },
      url: 'http://127.0.0.1:5080/api/health',
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command:
        'npm run start -- --configuration production --host 127.0.0.1 --port 4217 --proxy-config proxy.conf.json',
      url: 'http://127.0.0.1:4217',
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
