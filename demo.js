function isMobile() {
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  return isAndroid || isiOS;
}
  
const mobile = isMobile();
  
let renderer,camera,scene, cube, cubeList, plane, darkMat, planemat, bacteriaList ;
  
//state variables (1) dirty hands, (2) clock coundownd, (3) clened hands
let state = 1; // user start with dirty hands


// this utility function allows you to use any three.js
// loader with promises and async/await
const loader = new THREE.GLTFLoader();
function modelLoader(url) {
  return new Promise((resolve, reject) => {
    loader.load(url, data=> resolve(data), null, reject);
  });
}

//asyncronously load bacteria model
let bacteria_A,bacteria_B,bacteria_C,bacteria_D,bacteria_E,bacteria_F 
async function loadBacterias() {
  bacteria_A = await modelLoader('models/BacteriaPack_GLTF/bacteria_A.gltf');
  bacteria_B = await modelLoader('models/BacteriaPack_GLTF/bacteria_B.gltf');
  bacteria_C = await modelLoader('models/BacteriaPack_GLTF/bacteria_C.gltf');
  bacteria_D = await modelLoader('models/BacteriaPack_GLTF/bacteria_D.gltf');
  bacteria_E = await modelLoader('models/BacteriaPack_GLTF/bacteria_E.gltf');
  bacteria_F = await modelLoader('models/BacteriaPack_GLTF/bacteria_F.gltf');
} loadBacterias().catch(error => { console.error(error); });

function randomAngle(){
    return (Math.random() * 360 ) / 180 * Math.PI ;
}

//Shuffle array to get random bacteria arragment
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function initScene() {

  let canvas2 = document.getElementById("three-canvas");
  canvas2.width = videoWidth;
  canvas2.height = videoHeight;

  renderer = new THREE.WebGLRenderer({
    canvas: canvas2,
    preserveDrawingBuffer: true,
    antialias: true,
    outputEncoding: THREE.sRGBEncoding,
  });

  scene = new THREE.Scene();

  // ##### Create camera #####
  camera = new THREE.PerspectiveCamera(45, canvas2.width / canvas2.height, 1, 2000);

  //Set camera position based on video reslution
  const maxDim = Math.min(canvas2.width, canvas2.height);
  const fov = (camera.fov/2) * ( Math.PI / 180 );
  const cameraZ = (maxDim / 2) / (Math.tan(fov));
  camera.position.set(0, 0, cameraZ);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // ############ PLANE with a video texture ###########
  //Set plane size based on video resolution
  let planegeom = new THREE.PlaneGeometry((cameraZ + 250 * Math.tan(fov)) * (canvas2.width / canvas2.height) , (cameraZ + 250 * Math.tan(fov)));
  planegeom.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI)); // Mirror rotation due to webcam
  planegeom.applyMatrix4(new THREE.Matrix4().makeTranslation(0,0,-250)); // Move plane to the foreground
  planemat = new THREE.MeshStandardMaterial({
    map: videoTexture, side: THREE.DoubleSide
  });
  plane = new THREE.Mesh(planegeom, planemat);
  plane.material.linewidth = 1;
  scene.add(plane);

  //dark material to stop showing the video
  darkMat =  new THREE.MeshLambertMaterial( { color: 0x000000} );

  // ################ ADD BACTERIAS TO SCENE AND RANDOMLY ARRANGE THEM
  bacteriaList = [bacteria_A.scene, bacteria_B.scene, bacteria_C.scene, bacteria_D.scene, bacteria_E.scene, bacteria_F.scene,
                  bacteria_A.scene.clone(), bacteria_B.scene.clone(), bacteria_C.scene.clone(), bacteria_D.scene.clone(), bacteria_E.scene.clone(), bacteria_F.scene.clone(),
                  bacteria_A.scene.clone(), bacteria_B.scene.clone(), bacteria_C.scene.clone(), bacteria_D.scene.clone(), bacteria_E.scene.clone(), bacteria_F.scene.clone(),
                  bacteria_A.scene.clone(), bacteria_B.scene.clone(), bacteria_C.scene.clone()];

  shuffle(bacteriaList);

  for (let index = 0; index < bacteriaList.length; index++) {
      bacteriaList[index].scale.set(0.30,0.30,0.30);
      bacteriaList[index].rotation.set(0,0,randomAngle());
      plane.add(bacteriaList[index]) ;
    }
 
  // ##### Add lights to the scene #####
  let ambientLight = new THREE.AmbientLight(0xffffff);
  let bacteriaLight1 = new THREE.DirectionalLight(0xffffff,2);
  let bacteriaLight2 = new THREE.DirectionalLight(0xffffff,2);

  bacteriaLight2.position.set(0,-1,0);

  scene.add(ambientLight);
  scene.add(bacteriaLight1);
  scene.add(bacteriaLight2);
}
  
function countdown(){
  if (state === 1){ //if hands are dirty
    document.getElementById("wash").style.visibility = "hidden"; //hide wash button
    state = 2; //change state to washing hands
    document.getElementById("counterText").style.visibility = "visible"; //show coundown text
    // Set the date we're counting down to
    var countDownDate = new Date();
    countDownDate.setSeconds(countDownDate.getSeconds() + 27);

    // Update the count down every 1 second
    var x = setInterval(function() {
      // Get today's date and time
      var now = new Date().getTime();
        
      // Find the distance between now and the count down date
      var distance = countDownDate - now;
        
      // Time calculations for seconds
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
      // Output the result in an element with id="demo"
      document.getElementById("counterText").innerHTML = "Keep washing your hands for " + seconds + "s!";
        
      // If the count down is over set state to clean hands.
      if (distance < 0) {
        clearInterval(x);
        document.getElementById("wash").style.visibility = "visible";
        document.getElementById("counterText").innerHTML = "";
        document.getElementById("counterText").style.visibility = "hidden";
        document.getElementById("wash").innerHTML = "Reset Hands";
        plane.material = planemat;
        state = 3;
      }

    }, 1000);
  } else if (state === 3){ // if hands are clean, change to dirty hands
    state = 1;
    document.getElementById("wash").innerHTML = "Wash Hands!";
  }
}
  
//Add html elements on top of the canvas to functions as UI elements.
function initUI(){
    document.getElementById("wash").style.left = (videoWidth/2).toString().concat("px");
    document.getElementById("wash").style.top = (videoHeight * .80).toString().concat("px");
  
    document.getElementById("who").style.left = (videoWidth/2).toString().concat("px");
    document.getElementById("who").style.top = (videoHeight * .80 + 40).toString().concat("px");
  
    document.getElementById("wash").style.visibility = "visible";
    document.getElementById("who").style.visibility = "visible";
  
    document.getElementById("wash").addEventListener( "click", countdown);

    document.getElementById("counterText").style.left = ((videoWidth/2)).toString().concat("px");
    document.getElementById("counterText").style.top = (videoHeight /2).toString().concat("px");
}

let model, videoTexture, videoWidth, videoHeight, ThreeInit = false,
  fingerLookupIndices = {
    thumb: [0, 1, 2, 3, 4],
    indexFinger: [0, 5, 6, 7, 8],
    middleFinger: [0, 9, 10, 11, 12],
    ringFinger: [0, 13, 14, 15, 16],
    pinky: [0, 17, 18, 19, 20]};
  
async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      'Browser API navigator.mediaDevices.getUserMedia not available');
  }

  const video = document.getElementById('video');
  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': {
      facingMode: 'user',
    },
  });
  
  video.srcObject = stream;
  videoTexture = new THREE.VideoTexture(video);
  
  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}
  
async function loadVideo() {
  const video = await setupCamera();
  video.play();
  return video;
}
  
const main = async () => {
  model = await handpose.load();
  let video;

  try {
    video = await loadVideo();
  } catch (e) {
    let info = document.getElementById('info');
    info.textContent = e.message;
    info.style.display = 'block';
    throw e;
  }

  landmarksRealTime(video);
}
  
  
const landmarksRealTime = async (video) => {

  const stats = new Stats();
  stats.showPanel(0);

  document.body.appendChild(stats.dom);
  videoWidth = video.videoWidth;
  videoHeight = video.videoHeight;

  if (!ThreeInit) {
    await loadBacterias();
    initScene();
    initUI();
    ThreeInit = true;
  } 

  async function frameLandmarks() {
    stats.begin();
    const predictions = await model.estimateHands(video);

    let no_point = false;

    if(state != 2){ // if not washing hands modify model

      if (predictions.length > 0 && state != 3) { // if theres predictions, update model

        no_point = true;
        const result = predictions[0].landmarks;

        const pointsData = result.map(point => {
          return [-point[0], -point[1], -point[2]];
        });

        for (let i = 0; i < plane.children.length; i++) { // set bacteria to the detected keypoins
          const zero = pointsData[0];
          const x = pointsData[i][0];
          const y = pointsData[i][1];
          const z = pointsData[i][2];

          if (((i) % 4 ) == 0 && i != 0){ // ignore the the finger tip key point in each finger, add those bacterias to the middle of the palm.
            plane.children[i].position.set(((zero[0] + pointsData[i-3][0])/ 2) + 325, ((zero[1] + pointsData[i-3][1])/ 2) + 230, ((zero[2] + pointsData[i-3][2])/ 2) * 2.5) ;

          }else{
            plane.children[i].position.set(x + 325, y + 230, z * 2.5);
          }
        }
        
      }else if(!no_point){ //If no keypoint visible, send bacterias out of view
        for (let i = 0; i < plane.children.length; i++) {
          plane.children[i].position.set(10000,10000,10000);
          }
          no_point = true;
      }
    } else if(!no_point){ // if washing hands, change scene to remove bacteria and video texture
      plane.material = darkMat;
      for (let i = 0; i < plane.children.length; i++) {
        plane.children[i].position.set(10000,10000,10000);
        }
    }

    renderer.render(scene, camera);
    stats.end();
    requestAnimationFrame(frameLandmarks);
  };

  frameLandmarks();
};

navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  
  main();