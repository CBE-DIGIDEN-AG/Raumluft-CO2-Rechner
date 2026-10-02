import EventHandler from "../Tools/eventhandler";
import React from "react";
export default class Usageprofile {
    constructor ({name, roomtype}) {
        const eventhandler = new EventHandler()

        this.isnew = false
        this.name = name
        this.uuid = eventhandler.uuid()
        this.roomtype = roomtype
        this.intervals = []
    }
}
