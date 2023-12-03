const WebSocket = require("ws");
const uuid = require("uuid");

// Create a WebSocket server on port 3000
const wss = new WebSocket.Server({ port: 3000 });
const clients = new Set();

function* generateColor() {
  const colors = [
    0xff0000, 0x00ff00, 0xffa500, 0x7bcc23, 0xff7d00, 0x0000ff, 0xffe040,
    0xff00ff,
  ];
  let i = 0;
  while (true) {
    if (i >= colors.length) i = 0;
    yield colors[i++];
  }
}

const colors = generateColor();

// Event listener for when a client connects to the server
wss.on("connection", (ws) => {
  console.log("Client connected");
  // Send a uuid back to the client
  const UUID = uuid.v4();
  ws.send(
    JSON.stringify({ type: "setUUID", UUID, color: colors.next().value })
  );

  // if already some clients, refresh client info across after 1 sec
  if (clients.size) {
    setTimeout(() => {
      // Considering first client as master
      try {
        clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({ type: "sendRefreshDataAcrossClients" })
            );
            throw "exiting loop";
          }
        });
      } catch (_) {
        console.log("Refreshed all clients");
      }
    });
  }
  // Add the new client to the set
  clients.add(ws);

  // Event listener for when the server receives a message from a client
  ws.on("message", (message) => {
    // console.log(`Received message: ${message}`);
    broadcast(message);
  });

  // Event listener for when a client disconnects
  ws.on("close", () => {
    console.log("Client disconnected");
    // Remove the disconnected client from the set
    clients.delete(ws);
    broadcast(JSON.stringify({ type: "disconnect", UUID }));
  });
});

function broadcast(message) {
  // Send the message to all connected clients
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

console.log("WebSocket server is running on port 3000");
