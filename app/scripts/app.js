module.exports = function app () {
  'use strict'

  let self = {}

  const config = require('./config')
  const router = require('./lib/router')

  self.sendDatas = function (url, data, callback) {
    function onLoad (e) {
      callback(undefined, req.response)
    }
    function onError (err) {
      console.log('Api error on request: ', req, ' || Error: ', err)
      callback(err, undefined)
    }

    var req = new XMLHttpRequest()
    req.open('POST', url, true)
    req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    req.onload = onLoad
    req.onerror = onError
    req.send(JSON.stringify(data))
  }
  self.initEvents = function () {
    var updateConfigBtn = document.getElementById('update-config')
    updateConfigBtn.addEventListener('click', function (e) {
      e.preventDefault()
      var configList = document.getElementById('config-data').querySelectorAll('input')
      var newConfig = {}
      for (var i = 0; i < configList.length; i++) {
        var item = configList[i]
        console.log(item)
        if (item.type == 'checkbox') {
          newConfig[item.dataset.config] = item.checked
        } else {
          newConfig[item.dataset.config] = item.value
        }
      }
      console.log(newConfig)
      self.sendDatas('http://localhost:3000/update-conf', newConfig, function (err, data) {
        if (err) {
          console.log('error')
          return
        }
        console.log(data + ' Update config :)')
      })
    })
  }
  self.init = function () {
    console.log('init')
    self.initEvents()
    router.init()
  }

  return self
}()
