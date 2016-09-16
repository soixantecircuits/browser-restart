// With ES6 you can also write it as:
// export const getCount = state => state.count

export function getstartURL (states) {
  return states.startURL
}

export function getport (states) {
  return states.port
}

export function getautostart (states) {
  return states.autostart
}

export function getsocketIOServerPort (states) {
  return states.socketIOServerPort
}

export function getbrowserArgs (states) {
  return states.browserArgs
}

export function getcertPath (states) {
  return states.certPath
}

export function gethttpsPort (states) {
  return states.httpsPort
}
