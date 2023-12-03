const socket = new WebSocket("ws://localhost:3000");

// Event listener for when the connection is established
socket.addEventListener("open", (event) => {
  console.log("Connected to WebSocket server");

  // Send a message to the server
  sendMessageToServer({ message: "From Client: Hello Server!" });
});

// Event listener for when the client receives a message from the server
let clientsDimensionMap = {};
socket.addEventListener("message", async (event) => {
  const data = await getData(event.data);

  switch (data.type) {
    case "setUUID":
      console.log("Setting UUID");
      window.UUID = data.UUID;
      window.color = data.color;
      window.scene.getObjectByName("light").color.setHex(data.color);
      document.getElementById("UUID").innerText = ""; //data.UUID;
      checkWindowDimensions((dim) => {
        // Set to client itself
        clientsDimensionMap[window.UUID] = {
          UUID: window.UUID,
          ...dim,
          color: data.color,
        };
        // Broadcast to other clients
        sendMessageToServer({
          type: "dimensionChange",
          UUID: window.UUID,
          ...dim,
          color: data.color,
        });
      });
      break;
    case "dimensionChange":
      console.log("UUID", UUID);
      if (!clientsDimensionMap[data.UUID]) {
        console.log("New window added", data);
      }
      clientsDimensionMap[data.UUID] = { ...data };
      delete clientsDimensionMap[data.UUID].UUID;
      delete clientsDimensionMap[data.UUID].type;
      break;
    case "disconnect":
      delete clientsDimensionMap[data.UUID];
      cleanupOrphanLight(data.UUID);
      break;
    case "sendRefreshDataAcrossClients":
      sendMessageToServer({
        type: "refreshAllClientMasterData",
        map: clientsDimensionMap,
      });
      break;
    case "refreshAllClientMasterData":
      clientsDimensionMap = data.map;
      break;
  }

  // console.log(`From Server: `, data);
  lookAtCenter(clientsDimensionMap);
});

// Event listener for when the connection is closed
socket.addEventListener("close", (event) => {
  console.log("Connection closed");
  sendMessageToServer({
    type: "disconnect",
    UUID: window.UUID,
  });
});

function sendMessageToServer(msg) {
  const str = JSON.stringify(msg);
  socket.send(str);
}

async function getData(BlobData) {
  const text = (await BlobData?.text?.()) || (await Promise.resolve(BlobData));
  const data = JSON.parse(text);
  return data;
}

function shallowEqual(objA, objB) {
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (let key of keysA) {
    if (objA[key] !== objB[key]) {
      return false;
    }
  }

  return true;
}
function checkWindowDimensions(onChange) {
  let dim = {};

  const intervalId = setInterval(() => {
    const newDim = {
      x: window.screenX,
      y: window.screenY,
      w: window.innerWidth,
      h: window.innerHeight,
    };
    if (!shallowEqual(newDim, dim)) {
      dim = newDim;
      onChange(dim);
    }
  }, 50);
  // Cancel interval
  return () => {
    clearInterval(intervalId);
  };
}
