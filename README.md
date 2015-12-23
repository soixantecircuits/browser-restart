# Browser restart

A script to restart your browser on a certain url when it crash. Only Chrome supported for now.

# Installation
* `npm i`

# Build
To build the app in electron, we use [electron packager](https://github.com/maxogden/electron-packager). Here is an example of command to build the app: 
`electron-packager . BrowserRestart --platform=win32 --arch=x64 --version=0.36.1`

It will build the app for windows 64 bits, with version 0.36.1 of electron. Find more infos to know how to build for your wanted system in [electron packager docs](https://github.com/maxogden/electron-packager#programmatic-api).

#Config the app
After you've built the app, run it, and fill the form with your infos.
* `port`: the port on wich the app should be running
* `startURL`: the url the app must look to know when browser crash.
* `autostart`: if true, the app will, at launch, open the startURL in your browser
* `browser args`: the arguments to launch browser with

#Setup the website
To know when to restart the browser, we need to know when the website is down. To do so, you need to load a script on your website, which is: `http://localhost:YOUR_PORT/restart.js`, where `YOUR_PORT` is the port you have define in the config view of the app, generally `3000`.