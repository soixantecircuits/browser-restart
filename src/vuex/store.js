import Vue from 'vue'
import Vuex from 'vuex'
var config = require('../../settings/new_data.json')

// Variable used
var port = config.port
var startURL = config.startURL
var autostart = config.autostart
var socketIOServerPort = config.socketIOServerPort
var browserArgs = config['browser args']
var certPath = config.certPath
var httpsPort = config.httpsPort

Vue.use(Vuex)

const state = {

  allValue: {
    'port': port,
    'startURL': startURL,
    'autostart': autostart,
    'socketIOServerPort': socketIOServerPort,
    'browserArgs': browserArgs,
    'certPath': certPath,
    'httpsPort': httpsPort
  },
  port: port,
  startURL: startURL,
  autostart: autostart,
  socketIOServerPort: socketIOServerPort,
  browserArgs: browserArgs,
  certPath: certPath,
  httpsPort: httpsPort
}

const mutations = {

  BUTCLICK (state) {
    //IPC RENDERER HERE
    const {ipcRenderer} = require('electron')
    console.log('buttonpressed')

    state.httpsPort = document.getElementById('httpsPort').value
    state.port = document.getElementById('socketIOServerPort').value
    state.certPath = document.getElementById('certPath').value
    state.autostart = document.getElementById('autostart').value
    state.startURL = document.getElementById('startURL').value
    state.socketIOServerPort = document.getElementById('socketIOServerPort').value
    state.browserArgs = document.getElementById('browserArgs').value
    print_value()
    ipcRenderer.send('butpressed')
  }
}

function print_value () {
  console.log('-----------------------------')
  console.log('UPDATED VALUE')
  console.log('port: ' + state.port)
  console.log('startURL: ' + state.startURL)
  console.log('autostart: ' + state.autostart)
  console.log('socketIOServerPort: ' + state.socketIOServerPort)
  console.log('browser args: ' + state.browserArgs)
  console.log('certPath: ' + state.certPath)
  console.log('httpsPort: ' + state.httpsPort)
}

export default new Vuex.Store({
  state,
  mutations
})
