import EventHandler from "../Tools/eventhandler";
import React from "react";

export default class Raumtyp {
    constructor ({name, key, A, H, ventilation, Ae, usetype, t_in}) {
        const eventhandler = new EventHandler()

        this.isnew = false
        this.name = name
        this.uuid = eventhandler.uuid()
        this.key = key


        this.ventilation = ventilation
        this.usetype = usetype
        this.windowgroups = {}
    }
}
