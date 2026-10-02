import EventHandler from "../Tools/eventhandler";
import React from "react";
export default class Windowtyp {
    constructor ({name, key, t_k,type}) {
        const eventhandler = new EventHandler()

        this.isnew = false
        this.name = name
        this.uuid = eventhandler.uuid()
        this.key = key
        this.t_k = t_k
        this.type = type
    }
}
