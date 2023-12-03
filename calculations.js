const makeCoordinates = (clientsDimensionMap) => {
  const coordinates = [];
  for (uuid in clientsDimensionMap) {
    const { x, y, w, h } = clientsDimensionMap[uuid];
    coordinates.push([x + w / 2, y + h / 2]);
  }
  console.log({ coordinates });
  return coordinates;
};

function lookAtCenter(clientsDimensionMap) {
  const coordinates = makeCoordinates(clientsDimensionMap);
  if (coordinates.length === 0) {
    return null; // Return null for an empty set of coordinates
  }

  // Initialize variables to store the sum of x and y coordinates
  let sumX = 0;
  let sumY = 0;

  // Calculate the sum of x and y coordinates
  for (let i = 0; i < coordinates.length; i++) {
    sumX += coordinates[i][0]; // Add x-coordinate
    sumY += coordinates[i][1]; // Add y-coordinate
  }

  // Calculate the average of x and y coordinates
  const centerX = sumX / coordinates.length;
  const centerY = sumY / coordinates.length;

  // Return the center point as an array [centerX, centerY]

  // console.log("Center Point:", centerX - x, centerY - y);
  const x = window.screenX;
  const y = window.screenY;
  triggerMouseClick(centerX - x, centerY - y);
  updateRemoteLights(centerX - x, centerY - y);
}
