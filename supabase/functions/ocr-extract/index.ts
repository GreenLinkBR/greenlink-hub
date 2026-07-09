import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

type DocType = "cnh" | "energy_bill" | "starlink_label";

const PROMPTS: Record<DocType, string> = {
  cnh:
    "Extraia da CNH (Carteira Nacional de Habilitação brasileira) exatamente os campos: nome completo, CPF (somente números), data de nascimento (YYYY-MM-DD). Retorne null se o campo não estiver visível. Não invente dados.",
  energy_bill:
    "Extraia da conta de energia elétrica brasileira exatamente: nome do titular, endereço completo (logradouro e número), bairro, cidade, UF (sigla de 2 letras), CEP (somente números). Retorne null quando não for possível ler. Não invente dados.",
  starlink_label:
    "Extraia da etiqueta/caixa do kit Starlink exatamente: modelo (ex.: 'Standard', 'Mini'), número de série (SN), KIT ID e Part Number (PN). Retorne null se algum campo não estiver visível. Não invente dados.",
};

const SCHEMAS: Record<DocType, Record<string, unknown>> = {
  cnh: {
    type: "object",
    additionalProperties: false,
    properties: {
      full_name: { type: ["string", "null"] },
      cpf: { type: ["string", "null"] },
      birth_date: { type: ["string", "null"] },
    },
    required: ["full_name", "cpf", "birth_date"],
  },
  energy_bill: {
    type: "object",
    additionalProperties: false,
    properties: {
      holder_name: { type: ["string", "null"] },
      street: { type: ["string", "null"] },
      district: { type: ["string", "null"] },
      city: { type: ["string", "null"] },
      state: { type: ["string", "null"] },
      zip_code: { type: ["string", "null"] },
    },
    required: ["holder_name", "street", "district", "city", "state", "zip_code"],
  },
  starlink_label: {
    type: "object",
    additionalProperties: false,
    properties: {
      model: { type: ["string", "null"] },
      serial_number: { type: ["string", "null"] },
      kit_id: { type: ["string", "null"] },
      pn: { type: ["string", "null"] },
    },
    required: ["model", "serial_number", "kit_id", "pn"],
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const auth = req.headers.get("Authorization");
    if (!auth?.toLowerCase().startsWith("bearer ")) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json().catch(() => ({}))) as {
      file_url?: string;
      doc_type?: DocType;
    };
    const { file_url, doc_type } = body;
    if (!file_url || !doc_type || !(doc_type in PROMPTS)) {
      return new Response(JSON.stringify({ error: "file_url e doc_type válidos são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Baixa o arquivo (signed URL do bucket privado)
    const fileRes = await fetch(file_url);
    if (!fileRes.ok) {
      return new Response(
        JSON.stringify({ error: "Falha ao baixar arquivo", status: fileRes.status }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const mime = fileRes.headers.get("content-type") || "image/jpeg";
    const buf = new Uint8Array(await fileRes.arrayBuffer());
    let bin = "";
    for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
    const b64 = btoa(bin);
    const dataUrl = `data:${mime};base64,${b64}`;

    const gatewayRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": LOVABLE_API_KEY,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Você é um extrator de dados de documentos brasileiros. Responda somente com JSON válido conforme o schema. Se um campo não estiver visível, use null. Nunca invente dados.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: PROMPTS[doc_type] },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_extraction",
              description: "Retorna os dados extraídos do documento.",
              parameters: SCHEMAS[doc_type],
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_extraction" } },
      }),
    });

    if (!gatewayRes.ok) {
      const text = await gatewayRes.text();
      console.error(`Gateway ${gatewayRes.status}: ${text}`);
      const status = gatewayRes.status;
      let userMsg = "Falha na leitura do documento";
      if (status === 429) userMsg = "Muitas requisições. Tente novamente em instantes.";
      if (status === 402) userMsg = "Créditos de IA esgotados. Adicione créditos no workspace.";
      return new Response(JSON.stringify({ error: userMsg, status, details: text }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await gatewayRes.json();
    const toolCall = json?.choices?.[0]?.message?.tool_calls?.[0];
    let extracted: Record<string, unknown> = {};
    if (toolCall?.function?.arguments) {
      try {
        extracted = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        console.error("Falha ao parsear tool_call:", e);
      }
    } else {
      const raw = json?.choices?.[0]?.message?.content;
      if (typeof raw === "string") {
        try {
          extracted = JSON.parse(raw);
        } catch {
          extracted = { raw_text: raw };
        }
      }
    }

    return new Response(JSON.stringify({ data: extracted }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("ocr-extract error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});