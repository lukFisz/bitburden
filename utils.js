const _CONTINUE = "_compose_CONTINUE"
const _STOP = "_compose_STOP"
const _CHAIN = "_compose_CURRY"

export function CONTINUE() {
  return { key: _CONTINUE, val: undefined }  
}

export function CHAIN(value) {
  return { key: _CHAIN, val: value }
}

export function STOP(errorMsg) {
  if (errorMsg) {
    return { key: _STOP, func: () => { throw new Error(errorMsg) }}
  } else {
    return { key: _STOP, func: () => {} }
  }
}
export function compose(...funcs) { 
  let prevResult = undefined
  for (let i = 0; i < funcs.length; i++) {
    let ret = funcs[i](prevResult)
    if (ret == undefined || ret.key == undefined) {
        throw new Error("No proper ComposeType was returned by function")
    }
    switch (ret.key) {
      case _STOP: 
        ret.func()
        return
      case _CONTINUE:
      case _CHAIN:
        prevResult = ret.val
        break
      default: 
        throw new Error("what the fuck of ComposeType is this")
    }
  }
}
/** @param {import(".").NS } ns */
export function help(ns, helpTxt) {
  if (ns.args.length == 0 || ns.args[0] === "--help" || ns.args[0] === "--h" || ns.args[0] === "help") {
    return STOP(helpTxt)  
  }
  return CONTINUE()
}
export function getArg(args, key, isOptional) {
  for(let i=0; i<args.length; i++){
    if (key === args[i]) {
      return args[i+1]
    }
  }
  if (isOptional !== true) {
    throw new Error("Didn't find the arg " + key)
  }
  return []
}