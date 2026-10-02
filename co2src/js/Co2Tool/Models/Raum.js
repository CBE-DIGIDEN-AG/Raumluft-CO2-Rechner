import EventHandler from "../Tools/eventhandler";
import React from "react";

export default class Raum {
    constructor ({name, key, A, H, ventilation, Ae, usetype, t_in}) {
        const eventhandler = new EventHandler()

        this.isnew = false
        this.name = name
        this.uuid = eventhandler.uuid()
        this.key = key

        this.A = A
        this.H = H
        this.Ae = Ae
        this.usetype = usetype
        this.t_in = t_in
    }
}
