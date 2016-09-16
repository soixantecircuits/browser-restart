<template>
  <div class= "display">
    <h1>Config - Brower Restart{{fileName}}</h1>
      <p>Socket.io server actually running on : localhost:{{port}}</p>
      <p>socketIOServerPort: <input id="socketIOServerPort"  value={{port}}></p>
      <p>startURL: <input id="startURL"  value={{startURL}}></p>
      <p>autostart: <input type="checkbox" id="autostart">{{autostart}}</p>
      <p>certPath: <input id="certPath"  value={{certPath}}></p>
      <p>httpsPort: <input id="httpsPort"  value={{httpsPort}}></p>
      <p>browser args: <input id="browserArgs"  value={{browserArgs}}></p>
      <button v-on:click="buttonclick" id="update-config">Update</button>
  </div>
</template>
<script>
import { getstartURL, getport, getautostart,
  getsocketIOServerPort, gethttpsPort, getcertPath, getbrowserArgs, getallValue } from '../vuex/getters'
import { butclick } from '../vuex/actions'
/*
function butclick() {
  console.log('im here boys')
}*/
export default {
  vuex: {
    getters: {
      startURL: getstartURL,
      port: getport,
      autostart: getautostart,
      socketIOServerPort: getsocketIOServerPort,
      httpsPort: gethttpsPort,
      certPath: getcertPath,
      browserArgs: getbrowserArgs
    },
    actions: {
      buttonclick: butclick
    }
  }
}
</script>
