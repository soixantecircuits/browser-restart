import 'gsap'

import Vue from 'vue'
import router from './router'
import './transitions'
var config = require('../settings/new_data.json')
var port = config.port
var startURL = config.startURL
var autostart = config.autostart
var socketIOServerPort = config.socketIOServerPort
var browserArgs = config['browser args']
var certPath = config.certPath
var httpsPort = config.httpsPort
var checkDelay = config.checkDelay

console.log('-----------------------------')
console.log('port: ' + port)
console.log('startURL: ' + startURL)
console.log('autostart: ' + autostart)
console.log('socketIOServerPort: ' + socketIOServerPort)
console.log('browser args: ' + browserArgs)
console.log('certPath: ' + certPath)
console.log('httpsPort: ' + httpsPort)
console.log('checkDelay' + checkDelay)

const App = Vue.extend({})

router.start(App, 'body')
