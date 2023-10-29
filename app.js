// set up basic variables for app
const elemVersion = document.getElementById('version');
const reload = document.getElementById('reload');

// Initializations
elemVersion.innerHTML = 'Live';
stopBtn.disabled = true;

// Register service worker
let newWorker, refreshing;
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
            reload.className = 'd-block';
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

window.onresize = function() {
  visualizer.width = mainControls.offsetWidth;
}

recorder.startRecording();
window.onresize();