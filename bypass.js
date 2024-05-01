import * as U from "utils"

const propagationScriptName = "propagate-new-ver.js"
const verFileName = "ver.txt"
const verFlag = "--ver"
const scriptsFlag = "--scripts"
const excludeHostsFlag = "--exclude"

/** @param {import(".").NS } ns */
function runPropagationScript(ns, scripts, ver, excludedHosts) {
    ns.run(
        
    )
}

/** @param {import(".").NS } ns */
export async function main(ns) {
    const ver = U.getArg(ns.args, verFlag)
    const scripts = U.getArg(ns.args, scriptsFlag)
    const excludedHosts = U.getArg(ns.args, excludeHostsFlag)
    U.compose(

    )
}