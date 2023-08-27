// set up basic variables for app
const recordBtn = document.querySelector('.record');
const stopBtn = document.querySelector('.stop');
const soundClips = document.querySelector('.sound-clips');
const visualizer = document.querySelector('.visualizer');
const mainControls = document.querySelector('.main-controls');
const elemVersion = document.getElementById('version');
const elemMimeType = document.getElementById('mime-type');
// Register service worker
let newWorker;
let refreshing;
if ('serviceWorker' in navigator) {
  console.log('Found ServiceWorker from App.')
  navigator.serviceWorker.register('./service-worker.js').then(reg => {
    // Register update found.
    console.log('Registered ServiceWorker');
    const channel = new BroadcastChannel('metadata');
    channel.postMessage({});
    reg.addEventListener('updatefound', () => {
      console.log('ServiceWorker Update found!')
      // An updated service worker has appeared in reg.installing!
      newWorker = reg.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state == 'installed') {
          // There is a new service worker available, show the notification
          if (navigator.serviceWorker.controller) {
            let reload = document.getElementById('reload');
            reload.className = 'show';
          }
        }
      });
    });
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    window.location.reload();
    refreshing = true;
  });

  const channel = new BroadcastChannel('metadata');
  channel.addEventListener('message', e => {
    if (e.data.action === 'version') {
      elemVersion.innerHTML = e.data.version
    }
  });
}

// The click event on the pop up notification
document.getElementById('reload').addEventListener('click', function(){
  newWorker.postMessage({ action: 'skipWaiting' });
});

// disable stop button while not recording
stopBtn.disabled = true;

// visualiser setup - create web audio api context and canvas
let audioCtx;
const canvasCtx = visualizer.getContext('2d');

//main block for doing the audio recording
if (navigator?.mediaDevices?.getUserMedia) {
  console.log('getUserMedia supported.');

  const constraints = { audio: true, video: false };
  let chunks = [];

  let onSuccess = function(stream) {
    const mimeTypes = [
      { mimeType: 'audio/mpeg', fileType: 'mp3' },
      { mimeType: 'audio/mp4', fileType: 'mp4' }, // Apple, probably
      { mimeType: 'audio/webm', fileType: 'webm' } // Android, probably
    ];

    const isSupportedMimeType = ({ mimeType }) => MediaRecorder.isTypeSupported(mimeType);
    const defaultMime = { mimeType: 'audio/mpeg', fileType: 'mp3' };

    const { mimeType, fileType } = 'isTypeSupported' in MediaRecorder ? mimeTypes.find(isSupportedMimeType) ?? defaultMime : defaultMime;
    console.log('Using mimetype', mimeType);
    elemMimeType.innerHTML = mimeType;
    const mediaRecorder = new MediaRecorder(stream, { mimeType });

    visualize(stream);

    recordBtn.onclick = function() {
      mediaRecorder.start();
      console.log(mediaRecorder.state);
      console.log('recorder started');
      recordBtn.style.background = 'red';

      stopBtn.disabled = false;
      recordBtn.disabled = true;
    }

    stopBtn.onclick = function() {
      mediaRecorder.stop();
      console.log(mediaRecorder.state);
      console.log('recorder stopped');
      recordBtn.style.background = '';
      recordBtn.style.color = '';
      // mediaRecorder.requestData();

      stopBtn.disabled = true;
      recordBtn.disabled = false;
    }

    mediaRecorder.onstop = function(e) {
      console.log('data available after MediaRecorder.stop() called.');

      const clipName = prompt('Enter a name for your sound clip?', 'clip');

      const clipContainer = document.createElement('article');
      const clipLabel = document.createElement('p');
      const audio = document.createElement('audio');
      const deleteButton = document.createElement('button');
      const downloadButton = document.createElement('button');

      clipContainer.classList.add('clip');
      audio.setAttribute('controls', '');
      deleteButton.textContent = 'Delete';
      deleteButton.className = 'delete';
      downloadButton.textContent = 'Download';
      downloadButton.className = 'download';
      clipLabel.textContent = clipName ?? 'clip';

      clipContainer.appendChild(audio);
      clipContainer.appendChild(clipLabel);
      clipContainer.appendChild(deleteButton);
      clipContainer.appendChild(downloadButton);
      soundClips.appendChild(clipContainer);

      audio.controls = true;
      const blob = new Blob(chunks, { type: mimeType });
      chunks = [];
      const audioURL = window.URL.createObjectURL(blob);
      audio.src = audioURL;
      console.log('recorder stopped');

      deleteButton.onclick = function(e) {
        e.target.closest('.clip').remove();
      }

      downloadButton.onclick = function(e) {
        const anchor = document.createElement('a');
        anchor.href = audioURL;
        anchor.download = clipLabel.textContent + '.' + fileType;
        anchor.click();
      }

      clipLabel.onclick = function() {
        const existingName = clipLabel.textContent;
        const newClipName = prompt('Enter a new name for your sound clip?');
        clipLabel.textContent = newClipName ?? existingName;
      }
    }

    mediaRecorder.ondataavailable = function(e) {
      chunks.push(e.data);
    }
  }

  let onError = function(err) {
    console.log('The following error occured: ' + err);
  }

  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

} else {
   console.error('getUserMedia not supported on your browser!');
}

function visualize(stream) {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }

  const source = audioCtx.createMediaStreamSource(stream);

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  //analyser.connect(audioCtx.destination);

  draw()

  function draw() {
    const WIDTH = visualizer.width
    const HEIGHT = visualizer.height;

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    let sliceWidth = WIDTH * 1.0 / bufferLength;
    let x = 0;


    for(let i = 0; i < bufferLength; i++) {

      let v = dataArray[i] / 128.0;
      let y = v * HEIGHT/2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(visualizer.width, visualizer.height/2);
    canvasCtx.stroke();

  }
}

window.onresize = function() {
  visualizer.width = mainControls.offsetWidth;
}

window.onresize();