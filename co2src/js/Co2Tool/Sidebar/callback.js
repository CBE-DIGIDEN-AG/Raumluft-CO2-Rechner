import React, { useState, useRef } from "react";
import EventHandler from "../Tools/eventhandler";

export default function Callback({page}) {
    if (!page.callback) {
        return ''
    }

    const eventhandler = new EventHandler()

    switch (page.callback) {
        case ('project.bnb_projektnummer'):
            if (eventhandler.projectdata && eventhandler.projectdata.project && eventhandler.projectdata.project.bnb_projektnummer) {
                return (<div className={"sidebarMenuSubline"}>Projektnummer: {eventhandler.projectdata.project.bnb_projektnummer}</div>)
            }

            break;
        default:
            //fehlt noch
            return ''
    }

    return ''
}
