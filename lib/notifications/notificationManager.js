const clients = new Map(); // Map<userId, Set<controller>>
const encoder = new TextEncoder();

export function addClient(userId, controller) {
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }

  clients.get(userId).add(controller);
}

export function removeClient(userId, controller) {
  const userClients = clients.get(userId);
  if (!userClients) return;

  userClients.delete(controller);

  // Cleanup empty sets
  if (userClients.size === 0) {
    clients.delete(userId);
  }
}

export function sendNotification(userId, payload) {
  const userClients = clients.get(userId);
  if (!userClients) return;

  for (const controller of userClients) {
    try {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(payload)}\n\n`),
      );
    } catch (err) {
      console.error("Failed to send SSE", err);

      // Remove dead connection
      userClients.delete(controller);
    }
  }

  // Cleanup if empty
  if (userClients.size === 0) {
    clients.delete(userId);
  }
}
