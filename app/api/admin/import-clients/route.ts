import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { importAllClients } from "@/lib/sync/import-all-clients";

export const maxDuration = 300; // 5 min timeout for Vercel

export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(line: string) {
        controller.enqueue(encoder.encode(`data: ${line}\n\n`));
      }

      try {
        await importAllClients((msg) => send(msg));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[import-clients]", message);
        send(`ERROR:${message}`);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
