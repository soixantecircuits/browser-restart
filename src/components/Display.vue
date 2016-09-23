<template>
  <style>
  p{
    font-family: Arial, sans-serif;
  }
  </style>
  <div class= "display">
    <h1>Brower Restart</h1></center>
    <p>Socket.io server actually running on : localhost:{{port}}</p>
      <p>socketIOServerPort:</br><input id="socketIOServerPort"  value={{port}}></p>
      <p>startURL:</br><input id="startURL"  value={{startURL}}></p>
      <!--<p>autostart:</br><input type="checkbox" id="autostart">{{autostart}}</p>-->
      <p>certPath:</br><input id="certPath"  value={{certPath}}></p>
      <p>httpsPort:</br><input id="httpsPort"  value={{httpsPort}}></p>
    <!--  <p>browser args: </br><input id="browserArgs"  value={{browserArgs}}></p>-->
      <p>Check Delay: </br><input id="checkDelay" value= {{checkDelay}}></p>
      <button v-on:click="buttonclick" id="update-config">Update</button>
  </div>
</template>
<script>
import { getstartURL, getport, getautostart, getcheckDelay,
  getsocketIOServerPort, gethttpsPort, getcertPath, getbrowserArgs, getallValue } from '../vuex/getters'
import { butclick } from '../vuex/actions'

export default {
  vuex: {
    getters: {
      startURL: getstartURL,
      port: getport,
    //  autostart: getautostart,
      socketIOServerPort: getsocketIOServerPort,
      httpsPort: gethttpsPort,
      certPath: getcertPath,
      checkDelay: getcheckDelay,
    //  browserArgs: getbrowserArgs
    },
    actions: {
      buttonclick: butclick
    }
  }
}
</script>
