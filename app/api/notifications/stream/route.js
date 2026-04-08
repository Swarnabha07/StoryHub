import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  addClient,
  removeClient,
} from "@/lib/notifications/notificationManager";

export const runtime = "nodejs"; // IMPORTANT

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Store this user's stream controller
      addClient(userId, controller);

      // Send initial connected message
      try {
        controller.enqueue(
          encoder.encode(
            `event: connected\ndata: ${JSON.stringify({
              type: "connected",
            })}\n\n`,
          ),
        );
      } catch (err) {
        console.error("Initial enqueue failed", err);
      }

      // Keep-alive ping every 25 seconds
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`:\n\n`));
        } catch (err) {
          console.error("SSE enqueue failed", err);
        }
      }, 25000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        removeClient(userId, controller);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
