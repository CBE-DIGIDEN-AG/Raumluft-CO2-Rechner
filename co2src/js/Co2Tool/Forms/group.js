import React, { useState, useRef } from "react";
import EventHandler from "../Tools/eventhandler";

export default function Group({label, handler, name, value, required, helptext, unit}) {
    const eventhandler = new EventHandler()
    const id = eventhandler.uuid()

    const [shophelp, setShophelp] = useState(() => {
        return false
    });

    const handleHelp = (e, type) => {
        if (shophelp === false) {
            setShophelp(true)
        }
        else {
            setShophelp(false)
        }
    }

    let className = 'm-form__group'
    if (eventhandler.formerrors[name]) {
        className += ' hasError'
    }

    return (<div className={className} data-has-help={Boolean(helptext)} data-name={name} data-label={label}>

    </div>)
}
