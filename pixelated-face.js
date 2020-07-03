//getting DOM elements
const video = document.querySelector(".webcam"); //users webcam
const canvas = document.querySelector(".video"); // where we dump the video
const ctx = canvas.getContext("2d");
const controls = document.querySelector(".controls");

let SIZE = 10;

let SCALE = 1.5;

function handleInput(e) {
  e.target.name === "SIZE" ? (SIZE = e.target.value) : (SCALE = e.target.value);
}
controls.addEventListener("input", handleInput);
console.log(controls);

ctx.lineWidth = 2;
const faceCanvas = document.querySelector(".face"); // for face detecting and censorship
const faceCtx = faceCanvas.getContext("2d");

//creat new facedetector
const faceDetector = new window.FaceDetector();

//function that will get the user webcam video then dump it in video
async function populateVideo() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 1280, height: 720 },
  });
  // store stream on video
  video.srcObject = stream;
  await video.play();
  //size the canvas to fit video
  console.log(video.videoWidth, video.videoHeight);
  canvas.height = video.videoHeight;
  canvas.width = video.videoWidth;
  faceCanvas.height = video.videoHeight;
  faceCanvas.width = video.videoWidth;
}
//function that will detect face
async function detectUserFace() {
  const face = await faceDetector.detect(video);

  face.forEach(drawFace);
  face.forEach(censor);

  //create animation frame
  requestAnimationFrame(detectUserFace);
}
//draw the face in canvas
function drawFace(singleFace) {
  console.log(singleFace.boundingBox);
  const { x, y, width, height } = singleFace.boundingBox;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "red";

  ctx.strokeRect(x, y, width, height);
}
function censor({ boundingBox: face }) {
  faceCtx.imageSmoothingEnabled = false;
  faceCtx.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
  //drawimage to stretch
  faceCtx.drawImage(
    video, //src
    face.x, //strting point
    face.y,
    face.width,
    face.height,
    face.x,
    face.y,
    SIZE,
    SIZE
  );
  const width = face.width * SCALE;
  const height = face.height * SCALE;
  faceCtx.drawImage(
    faceCanvas,
    face.x,
    face.y,
    SIZE,
    SIZE,
    face.x - (width - face.width) / 2,
    face.y - (height - face.height) / 2,
    width,
    height
  );
}

populateVideo().then(detectUserFace);
