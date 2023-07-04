const recordBtn = document.querySelector('.record');
const stopBtn = document.querySelector('.stop');
const soundClips = document.querySelector('.sound-clips');
const visualizer = document.querySelector('.visualizer');
const controls = document.querySelector('.main-controls');

// disable stop button while not recording

stopBtn.disabled = true;

// visualiser setup - create web audio api context and canvas

let audioCtx;
const canvasCtx = visualizer.getContext('2d');

function initialize() {
    if (!navigator.mediaDevices.getUserMedia) {
        console.log('getUserMedia not supported.');
        return;
    }
    console.log('getUserMedia supported.');
  
    navigator.mediaDevices.getUserMedia(constraints).then(onMediaSuccess, onMediaFailure);
}

function onMediaSuccess(stream) {

}

function onMediaFailure(error) {
    console.error('getUserMedia failure', error);
}

function visualize(stream) {
    //Magic
}


window.onresize = function() {
    canvas.width = mainSection.offsetWidth;
}
  
window.onresize();
