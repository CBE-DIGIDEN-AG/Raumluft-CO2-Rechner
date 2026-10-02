import React, { useState, useRef } from "react";
import EventHandler from "../Tools/eventhandler";
export default function Submit({label, handler, name, value}) {
    const eventhandler = new EventHandler()
    const id = eventhandler.uuid()

    return (<div className={"m-form__button"}>
        <input type={"button"} name={name} value={label} onClick={(e) => handler(e, 'submit', name)} id={id} />
    </div>)
}
