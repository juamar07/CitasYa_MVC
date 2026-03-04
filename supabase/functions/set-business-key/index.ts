// supabase/functions/set-business-key/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ ok: false, message: "Method not allowed" }), { status: 405 });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ ok: false, message: "No auth" }), { status: 401 });
    }

    const { negocio_id, clave } = await req.json();
    const negocioId = Number(negocio_id);
    const plain = String(clave ?? "").trim();

    if (!negocioId || !plain) {
      return new Response(JSON.stringify({ ok: false, message: "Datos inválidos" }), { status: 400 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Cliente con JWT del usuario para saber quién es
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: u, error: uErr } = await userClient.auth.getUser();
    if (uErr || !u?.user?.id) {
      return new Response(JSON.stringify({ ok: false, message: "Auth inválida" }), { status: 401 });
    }
    const authUid = u.user.id;

    // Admin client para DB (bypass RLS) + checks manuales
    const admin = createClient(supabaseUrl, serviceKey);

    // 1) Resolver usuario interno + rol
    const { data: usuarioRow, error: usuarioErr } = await admin
      .from("usuarios")
      .select("id, rol_id")
      .eq("auth_user_id", authUid)
      .maybeSingle();

    if (usuarioErr || !usuarioRow) {
      return new Response(JSON.stringify({ ok: false, message: "Usuario no encontrado" }), { status: 403 });
    }

    const isAdmin = Number(usuarioRow.rol_id) === 3;

    // 2) Validar dueño del negocio (o admin)
    const { data: negocioRow, error: negErr } = await admin
      .from("negocios")
      .select("id, owner_auth_user_id")
      .eq("id", negocioId)
      .maybeSingle();

    if (negErr || !negocioRow) {
      return new Response(JSON.stringify({ ok: false, message: "Negocio no existe" }), { status: 404 });
    }

    const isOwner = String(negocioRow.owner_auth_user_id ?? "") === authUid;
    if (!isAdmin && !isOwner) {
      return new Response(JSON.stringify({ ok: false, message: "Sin permisos" }), { status: 403 });
    }

    // 3) Hash bcrypt y update
    const hash = await bcrypt.hash(plain);

    const { error: upErr } = await admin
      .from("negocios")
      .update({ clave_hash: hash })
      .eq("id", negocioId);

    if (upErr) {
      return new Response(JSON.stringify({ ok: false, message: "No se pudo guardar" }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, message: String(e?.message ?? e) }), { status: 500 });
  }
});