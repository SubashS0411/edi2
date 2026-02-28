// supabase/functions/update-user-credentials/index.ts
// Supabase Edge Function — Admin-only user credential management
// Uses SUPABASE_SERVICE_ROLE_KEY to call auth.admin.updateUserById / deleteUser

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

// ─── CORS ────────────────────────────────────────────────────────────
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ─── Handler ─────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
    // Preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // ── 1. Build admin client (service-role key) ──
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

        const adminClient = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        // ── 2. Verify the caller is an admin ──
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return jsonError("Missing Authorization header", 401);
        }

        // Build a "user-scoped" client using the anon key to verify JWT
        const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const userClient = createClient(supabaseUrl, anonKey, {
            global: { headers: { Authorization: authHeader } },
            auth: { autoRefreshToken: false, persistSession: false },
        });

        const {
            data: { user: caller },
            error: callerError,
        } = await userClient.auth.getUser();

        if (callerError || !caller) {
            return jsonError("Invalid or expired token", 401);
        }

        // Check caller role in profiles table
        const { data: profile } = await adminClient
            .from("profiles")
            .select("role")
            .eq("id", caller.id)
            .maybeSingle();

        if (profile?.role !== "admin") {
            return jsonError("Forbidden — admin role required", 403);
        }

        // ── 3. Parse request body ──
        const body = await req.json();
        const { userId, action, email, password, user_metadata } = body;

        if (!userId) {
            return jsonError("userId is required", 400);
        }

        // ── 4. Delete user ──
        if (action === "delete") {
            const { error: deleteError } =
                await adminClient.auth.admin.deleteUser(userId);

            if (deleteError) {
                return jsonError(deleteError.message, 400);
            }
            return jsonOk({ success: true, message: "User deleted from auth" });
        }

        // ── 5. Update user credentials ──
        const updates: Record<string, unknown> = {};
        if (email) updates.email = email;
        if (password) updates.password = password;
        if (user_metadata) updates.user_metadata = user_metadata;

        if (Object.keys(updates).length === 0) {
            return jsonError("No updates provided (email, password, or user_metadata required)", 400);
        }

        const { data, error: updateError } =
            await adminClient.auth.admin.updateUserById(userId, updates);

        if (updateError) {
            return jsonError(updateError.message, 400);
        }

        return jsonOk({
            success: true,
            user: {
                id: data.user.id,
                email: data.user.email,
                updated_at: data.user.updated_at,
            },
        });
    } catch (err) {
        console.error("Edge Function error:", err);
        return jsonError(err.message ?? "Internal server error", 500);
    }
});

// ─── Helpers ─────────────────────────────────────────────────────────
function jsonOk(data: unknown) {
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}

function jsonError(message: string, status: number) {
    return new Response(JSON.stringify({ success: false, error: message }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}
