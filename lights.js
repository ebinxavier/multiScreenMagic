// Adding spotlight in Three.js
// You can see the position and the cone of light in this example

// sizes
let width = window.innerWidth;
let height = window.innerHeight;
// scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
console.log(scene.children);
// camera
const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
camera.position.set(0, 50, 0);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// spotlight

function setLightProps(light) {
  light.distance = 200;
  light.angle = Math.PI / 8;
  light.penumbra = 0.5;
  light.decay = 1.5;
  light.intensity = 8;
  // for shadow
  light.castShadow = true;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 100;
}

window.scene = scene;
const light = new THREE.SpotLight();
light.position.set(0, 0, 0);
light.name = "light";
setLightProps(light);
scene.add(light);

// plane
const planeGeometry = new THREE.PlaneGeometry(500, 500);
const plane = new THREE.Mesh(
  planeGeometry,
  new THREE.MeshPhongMaterial({ color: 0xffffff })
);
plane.rotateX(-Math.PI / 2);
plane.position.y = -1.75;
plane.receiveShadow = true;
scene.add(plane);
// cube
const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshStandardMaterial({
  color: 0x87ceeb,
});

const cube = new THREE.Mesh(geometry, material);
cube.position.set(10, 0.5, 0);
cube.castShadow = true;
cube.receiveShadow = true;
cube.visible = false;
scene.add(cube);
window.cube = cube;

light.target = cube;
// responsiveness
window.addEventListener("resize", () => {
  width = window.innerWidth;
  height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
});
// renderer
const renderer = new THREE.WebGL1Renderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// animation
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
// rendering the scene
const container = document.querySelector("#container");
container.append(renderer.domElement);
renderer.render(scene, camera);
animate();

//   Mouse tracking
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
// document.addEventListener("mousemove", onDocumentMouseMove, false);
window.addEventListener("resize", onWindowResize, false);
document.addEventListener("mousedown", onMouseDown, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function manageRaycasterIntersections(scene, camera, obj = cube) {
  camera.updateMatrixWorld();
  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {
    const { x, z } = intersects[0].point;
    obj.position.set(x, 0, z);
  } else {
  }
}

function onMouseDown(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  manageRaycasterIntersections(scene, camera, light);
  console.log("mouse position: (" + mouse.x + ", " + mouse.y + ")");
}

function triggerMouseClick(x, y) {
  mouse.x = (x / window.innerWidth) * 2 - 1;
  mouse.y = -(y / window.innerHeight) * 2 + 1;
  manageRaycasterIntersections(scene, camera, cube);
  // console.log("mouse position: (" + mouse.x + ", " + mouse.y + ")");
}

function updateLightAndCenter(uuid, x, y, color, centerX, centerY) {
  console.log("center: ", centerX, centerY);
  // finding coordinate

  camera.updateMatrixWorld();
  mouse.x = (x / window.innerWidth) * 2 - 1;
  mouse.y = -(y / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  let intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {
    var { x: lightX, z: lightZ } = intersects[0].point;
  }

  // update position if exists
  if (window.scene.getObjectByName(uuid)) {
    const light = window.scene.getObjectByName(uuid);
    // update light
    console.log("Update light...", lightX, 0, lightZ);
    light.position.set(lightX, 0, lightZ);
    // update center position
    const center = window.scene.getObjectByName(uuid + "-center");
    camera.updateMatrixWorld();
    mouse.x = (centerX / window.innerWidth) * 2 - 1;
    mouse.y = -(centerY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
      var { x, z } = intersects[0].point;
      center.position.set(x, 0, z);
    }
  } else {
    const light = new THREE.SpotLight();
    const cube = new THREE.Mesh(geometry, material);

    // spotlight
    light.position.set(lightX, 0, lightZ);
    // spotlight properties
    light.name = uuid;

    setLightProps(light);
    scene.add(light);
    light.color.setHex(color);

    // Adding center
    cube.position.set(0, 0, 0);

    cube.visible = false;
    scene.add(cube);

    light.target = cube;
    cube.name = uuid + "-center";
  }
}

function updateRemoteLights(centerX, centerY) {
  for (uuid in clientsDimensionMap) {
    const { x, y, w, h, color } = clientsDimensionMap[uuid];
    if (window.UUID !== uuid) {
      console.log(
        // uuid,
        x + w / 2 - window.screenX,
        y + h / 2 - window.screenY,
        color
      );
      updateLightAndCenter(
        uuid,
        x + w / 2 - window.screenX,
        y + h / 2 - window.screenY,
        color,
        centerX,
        centerY
      );
    }
  }
}

function cleanupOrphanLight(uuid) {
  const center = window.scene.getObjectByName(uuid + "-center");
  const light = window.scene.getObjectByName(uuid);
  scene.remove(center);
  scene.remove(light);
}
