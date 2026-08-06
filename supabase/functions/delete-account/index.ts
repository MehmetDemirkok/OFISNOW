// OfisNow / İkram X: delete-account Edge Function
//
// İstemci önce auth.reauthenticate() ile mevcut send-auth-email / Resend
// üzerinden kod gönderir; ardından bu fonksiyon body'deki kodu GoTrue
// `reauthentication` verify ile doğrular ve hesabı siler.
// Özel tablo / ekstra e-posta altyapısı yok.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface DeleteBody {
  code?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "METHOD_NOT_ALLOWED" }, 405);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "UNAUTHORIZED" }, 401);
  }

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user?.email) {
    return jsonResponse({ error: "UNAUTHORIZED" }, 401);
  }

  let payload: DeleteBody = {};
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "INVALID_BODY" }, 400);
  }

  const code = (payload.code ?? "").trim();
  if (!/^\d{6,8}$/.test(code)) {
    return jsonResponse({ error: "INVALID_CODE" }, 400);
  }

  // Mevcut Auth OTP'sini doğrula (send-auth-email → Resend ile giden reauthentication kodu).
  const verifyResponse = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "reauthentication",
      token: code,
      email: user.email,
    }),
  });

  if (!verifyResponse.ok) {
    const body = await verifyResponse.text();
    console.error("delete-account: reauthentication doğrulanamadı", verifyResponse.status, body);
    if (verifyResponse.status === 401 || verifyResponse.status === 403 || verifyResponse.status === 422) {
      return jsonResponse({ error: "INVALID_CODE" }, 400);
    }
    return jsonResponse({ error: "DELETE_FAILED" }, 500);
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  await admin
    .from("profiles")
    .update({ push_token: null, web_push_subscription: null, is_active: false })
    .eq("id", user.id);

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("delete-account: auth.users silinemedi", error);
    return jsonResponse({ error: "DELETE_FAILED" }, 500);
  }

  return jsonResponse({ ok: true }, 200);
});

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}
