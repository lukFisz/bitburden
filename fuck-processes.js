import * as U from "utils"
/** @param {import(".").NS } ns */
export async function main(ns) {
    const hostToPurge = U.getArg(ns.args, "--hostToPurge")
    ns.killall(hostToPurge)
}