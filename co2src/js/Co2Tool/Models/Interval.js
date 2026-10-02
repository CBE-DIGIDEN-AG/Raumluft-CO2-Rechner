import EventHandler from "../Tools/eventhandler";
import React from "react";
import Usageprofile from "./Usageprofile";
export default class Interval {
    constructor ({name, key}) {
        const eventhandler = new EventHandler()

        if (!key) {
            key = 0
        }

        this.isnew = false
        this.name = name
        this.uuid = eventhandler.uuid()
        this.key = key
    }
}
