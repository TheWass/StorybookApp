# Storybook Project App
This app uploads recordings to a target endpoint

## Features
- Audio recording (done)
- Offline (done)
- Mobile friendly (done)
- Upload to endpoint
- Cache audio files on upload failure. - Should persist through restart.

## Design
This is an HTML web app designed to be an offline progressive web app.  
The `manifest.json` defines the attributes for the progressive web app, and the `service-worker.js` dictates how the app acts when offline.  
The rest of the files make up a standard HTML/CSS/JS website.

## Deployment
To deploy this web app, upload all files in this directory to a webserver, and serve them using HTTPS.  In order for PWA to function, the server must be fully configured for HTTPS/SSL.

When viewing the site, you are able to install it by setting it to the home screen.  Loading it once from the home screen will install the files to the disk, and allow offline usage.

### Staging is on GitHub pages
https://thewass.github.io/StorybookApp
