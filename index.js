'use strict';
const electron = require('electron');
const server = require('./server/main.js')
const app = electron.app;

// report crashes to the Electron project
require('crash-reporter').start()

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')()

// add some command line arguments
app.commandLine.appendArgument('--disable-pinch')

// prevent window being garbage collected
let mainWindow

// Init server
server.init()

function onClosed () {
  // dereference the window
  // for multiple windows store them in an array
  mainWindow = null
  server.closeChrome()
}

function createMainWindow () {
  var winOptions = {
    width: 1024, 
    height: 720,
    minWidth: 800,
    title: 'Browser Restart'
  }
  if (process.env['NODE_ENV'] !== 'dev') {
    winOptions.kiosk = true
    winOptions.frame = false
    winOptions.resizable = false
    winOptions.fullScreen = true
    winOptions.alwaysOnTop = true
  }
  const win = new electron.BrowserWindow(winOptions)

  if (process.env['NODE_ENV'] === 'dev') {
    win.loadURL('http://locahost:'+server.port+'/')
    win.openDevTools()
  } else {
    win.loadURL('file://' + __dirname + '/dist/index.html')
  }
  win.on('closed', onClosed)

  return win
}

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (!mainWindow) {
    mainWindow = createMainWindow()
  }
})

app.on('ready', () => {
	mainWindow = createMainWindow();
});