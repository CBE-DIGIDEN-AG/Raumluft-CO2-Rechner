import React, { useState, useRef } from "react";
import EventHandler from "../Tools/eventhandler";

export default function Hidden({label, handler, name, value, required, helptext, unit, readonly, setFocus}) {
    const eventhandler = new EventHandler()
    const id = eventhandler.uuid()
    let initialized = useRef(false)

    let className = 'm-form__text'
    if (eventhandler.formerrors[name]) {
        className += ' hasError'
    }

    React.useEffect(() => {
        if (setFocus) {
            const element = document.getElementById(id)
            element.focus()
        }
    })

    return (<input type={"hidden"} autoComplete={"off"} defaultValue={value} name={name} readOnly={readonly}
                   onChange={(e) => handler(e, 'change', name)} id={id}/>)
}
