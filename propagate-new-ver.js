const _CONTINUE = "_compose_CONTINUE"
const _STOP = "_compose_STOP"
const _CHAIN = "_compose_CURRY"

function CONTINUE() {
  return { key: _CONTINUE, val: undefined }  
}

function CHAIN(value) {
  return { key: _CHAIN, val: value }
}

function STOP(errorMsg) {
  if (errorMsg) {
    return { key: _STOP, func: () => { throw new Error(errorMsg) }}
  } else {
    return { key: _STOP, func: () => {} }
  }
}
function compose(...funcs) { 
  let prevResult = undefined
  for (let i = 0; i < funcs.length; i++) {
    let ret = funcs[i](prevResult)
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
const helpTxt = 
`Arguments: 
  --help, --h, help   : help
  --ver               : new version to propagate with
  --scripts           : scripts to upload to servers, seperated by ','
  --exclude           : [optional] hosts to exclude
`
/** @param {import(".").NS } ns */
function help(ns) {
  if (ns.args.length == 0 || ns.args[0] === "--help" || ns.args[0] === "--h" || ns.args[0] === "help") {
    return STOP(helpTxt)  
  }
  return CONTINUE()
}
function getArg(args, key, isOptional) {
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

const propagationScriptName = "propagate-new-ver.js"
const verFileName = "ver.txt"
const verFlag = "--ver"
const scriptsFlag = "--scripts"
const excludeHostsFlag = "--exclude"

/** @param {import(".").NS } ns */
function sendToServers(ns, scripts, hosts) {
  const extendedScripts = scripts.concat([propagationScriptName])
  hosts.forEach(host => ns.scp(extendedScripts, host, "home"))
  return CONTINUE()
}
/** @param {import(".").NS } ns */
function saveNewVersion(ns, ver) {
  ns.write(verFileName, ver, "w")
  return CONTINUE()
}
/** @param {import(".").NS } ns */
function checkVer(ns, ver) {
  const currentVer = ns.read(verFileName)
  return currentVer == ver ? STOP("No new version to apply") : CONTINUE()
}
/** @param {import(".").NS } ns */
function nuke(ns, hosts) {
  hosts.forEach(host => {
    ns.nuke(host)
  })
  return CONTINUE()
}
/** @param {import(".").NS } ns */
function executePropagationScript(ns, hosts, scriptsToCopyArg, excludeHostsArg, ver) {
  hosts.forEach(host => 
    ns.exec(
      propagationScriptName,
      host,
      1,
      excludeHostsFlag, excludeHostsArg,
      scriptsFlag, scriptsToCopyArg, 
      verFlag, 
      ver
    )
  )
  return CONTINUE()
}

/** @param {import(".").NS } ns */
export async function main(ns) {
  const ver = getArg(ns.args, verFlag)
  const currentHost = ns.getHostname()
  const connectedHosts = ns.scan(currentHost)
  const scripts = getArg(ns.args, scriptsFlag).split(",")
  const excludeHosts = getArg(ns.args, excludeHostsFlag, true)
  const eligibleHosts = connectedHosts.filter(host => !excludeHosts.includes(host))
  const extendedExcludeHostsString = (excludeHosts.toString() ? excludeHosts.toString() + "," : "") + eligibleHosts.toString() + "," + currentHost
  
  compose(
    () => help(ns),
    () => checkVer(ns, ver),
    () => sendToServers(ns, scripts, eligibleHosts),
    () => executePropagationScript(ns, eligibleHosts, scripts.toString(), extendedExcludeHostsString, ver),
    () => nuke(ns, eligibleHosts),
    () => saveNewVersion(ns, ver),
  )
}