const camera = (function camera() {
  function startCamera() {
    if (navigator?.mediaDevices?.getUserMedia == null) {
      console.error('getUserMedia not supported on your browser!');
      return;
    }
    console.log('getUserMedia supported.');
    const constraints = { audio: false, video: true };
    let onSuccess = function (stream) {

    };

    let onError = function (err) {
      console.log('The following error occurred while recording: ' + err);
    };

    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
  }
  return {
    startCamera: () => startCamera(),
  };
})();