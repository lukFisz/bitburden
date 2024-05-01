import * as U from "utils"

const helpTxt = 
`
Arguments: 
  --help, --h, help   : help
  --ver               : new version to propagate with
  --scripts           : scripts to upload to servers, seperated by ','
  --exclude           : [optional] hosts to exclude
`
const propagationScriptName = "propagate-new-ver.js"
const bypassScriptName = "bypass.js"
const fuckProcessesScriptName = "fuck-processes.js"
const fuckProcessesArgFlag = "--hostToPurge"
const verFileName = "ver.txt"
const verFlag = "--ver"
const scriptsFlag = "--scripts"
const excludeHostsFlag = "--exclude"

/** @param {import(".").NS } ns */
function sendToServers(ns, scripts, hosts) {
  const extendedScripts = scripts.concat([propagationScriptName, fuckProcessesScriptName])
  hosts.forEach(host => ns.scp(extendedScripts, host, "home"))
  return U.CONTINUE()
}
/** @param {import(".").NS } ns */
function saveNewVersion(ns, ver) {
  ns.write(verFileName, ver, "w")
  return U.CONTINUE()
}
/** @param {import(".").NS } ns */
function checkVer(ns, ver) {
  const currentVer = ns.read(verFileName)
  return currentVer == ver ? U.STOP("No new version to apply") : U.CONTINUE()
}
/** @param {import(".").NS } ns */
function fuckProcesses(ns, hosts) {
  hosts.forEach(host => 
    ns.killall(host)
  )
  return U.CONTINUE()
}
/** @param {import(".").NS } ns */
function propagate(ns, hosts, scriptsToCopyArg, excludeHostsArg, ver) {
  hosts.forEach(host => 
    ns.exec(
      propagationScriptName,
      host,
      1,
      excludeHostsFlag, excludeHostsArg,
      scriptsFlag, scriptsToCopyArg, 
      verFlag, ver
    )
  )
  return U.CONTINUE()
}

/** @param {import(".").NS } ns */
export async function main(ns) {
  const ver = U.getArg(ns.args, verFlag)
  const currentHost = ns.getHostname()
  const connectedHosts = ns.scan(currentHost)
  const scripts = U.getArg(ns.args, scriptsFlag).split(",")
  const excludeHosts = U.getArg(ns.args, excludeHostsFlag, true)
  const eligibleHosts = connectedHosts.filter(host => !excludeHosts.includes(host))
  const extendedExcludeHostsString = (excludeHosts.toString() ? excludeHosts.toString() + "," : "") + eligibleHosts.toString() + "," + currentHost
  
  U.compose(
    () => U.help(ns, helpTxt),
    () => checkVer(ns, ver),
    () => sendToServers(ns, scripts, eligibleHosts),
    () => fuckProcesses(ns, eligibleHosts),
    () => propagate(ns, eligibleHosts, scripts.toString(), extendedExcludeHostsString, ver),
    () => saveNewVersion(ns, ver),
  )
}