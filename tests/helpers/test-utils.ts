import type { Page } from "@playwright/test";

// --- Constants ---
export const TEST_PASSWORD = "TestE2E_Pass123!";
export const STRIPE_TEST_CARD = "4242424242424242";
export const STRIPE_TEST_EXPIRY = "1228";
export const STRIPE_TEST_CVC = "123";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

// --- Test User Management ---

export async function createTestUser(prefix: string) {
  const email = `e2e-${prefix}-${Date.now()}@test.example.com`;

  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: `E2E ${prefix}` },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to create test user: ${res.status} ${body}`);
  }

  const data = await res.json();
  return { id: data.id as string, email };
}

export async function deleteTestUser(userId: string) {
  const res = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/users/${userId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
      },
    },
  );

  if (!res.ok) {
    console.warn(`Failed to delete test user ${userId}: ${res.status}`);
  }
}

// --- Auth Helpers ---

export async function loginViaUI(
  page: Page,
  email: string,
  password = TEST_PASSWORD,
) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/dashboard**", { timeout: 15_000 });
}

export async function loginViaAPI(
  page: Page,
  email: string,
  password = TEST_PASSWORD,
) {
  // Get tokens from Supabase Auth API
  const res = await fetch(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    },
  );

  if (!res.ok) throw new Error(`Login API failed: ${res.status}`);

  const tokens = await res.json();
  const baseURL =
    process.env.TEST_BASE_URL ||
    "https://app-05-proposal-generator.vercel.app";

  // Set auth cookies on the browser context
  const domain = new URL(baseURL).hostname;
  await page.context().addCookies([
    {
      name: "sb-syxigltjyqqlpzsrersb-auth-token",
      value: JSON.stringify([
        tokens.access_token,
        tokens.refresh_token,
        null,
        null,
        null,
      ]),
      domain,
      path: "/",
    },
  ]);

  await page.goto("/dashboard");
  await page.waitForURL("**/dashboard**", { timeout: 10_000 });
}

// --- Plan Management ---

export async function setUserPlan(
  userId: string,
  plan: "free" | "pro" | "business",
) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        subscription_plan: plan,
        subscription_status: plan === "free" ? "free" : "active",
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to set plan: ${res.status} ${body}`);
  }
}

// --- Data Helpers ---

export async function createTestClient(userId: string, name: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/clients`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      user_id: userId,
      name,
      email: `${name.toLowerCase().replace(/\s/g, "")}@example.com`,
      company: `${name} Inc.`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to create test client: ${res.status} ${body}`);
  }

  const data = await res.json();
  return data[0] as { id: string; name: string };
}

export async function deleteTestClient(clientId: string) {
  await fetch(`${SUPABASE_URL}/rest/v1/clients?id=eq.${clientId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
    },
  });
}
