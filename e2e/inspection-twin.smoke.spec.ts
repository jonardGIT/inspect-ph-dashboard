import { expect, test } from "@playwright/test";

const apiOrigin = process.env.E2E_API_ORIGIN || "http://localhost:4000";

const adminEmail =
  process.env.E2E_ADMIN_EMAIL || "admin-role-scenario@inspectph.dev";
const adminPassword = process.env.E2E_ADMIN_PASSWORD || "password123";

test.setTimeout(60_000);

test("admin can open the inspection twin simulator", async ({ page, request }) => {
  const loginResponse = await request.post(`${apiOrigin}/api/v1/auth/login`, {
    data: {
      email: adminEmail,
      password: adminPassword,
    },
  });
  expect(loginResponse.ok()).toBeTruthy();

  const payload = (await loginResponse.json()) as {
    data: Record<string, unknown>;
  };

  await page.goto("/login", {
    waitUntil: "domcontentloaded",
  });
  await page.evaluate((session) => {
    window.localStorage.setItem(
      "inspect-ph-dashboard-session",
      JSON.stringify(session),
    );
  }, payload.data);
  await page.goto("/reports/inspection-twin", {
    waitUntil: "domcontentloaded",
  });

  await expect(
    page.getByRole("heading", { name: "Inspection Twin Simulator" }),
  ).toBeVisible({ timeout: 45_000 });
  await expect(page).toHaveURL(/\/reports\/inspection-twin/);
  await expect(page.getByText("Inspections evaluated")).toBeVisible();
  await expect(page.getByText("Riverside Food Hub")).toBeVisible();
});