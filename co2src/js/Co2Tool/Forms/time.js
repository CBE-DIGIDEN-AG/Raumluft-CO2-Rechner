import React, { useState, useRef } from "react";
import EventHandler from "../Tools/eventhandler";

export default function Time({label, handler, name, value, required, helptext, unit,readonly}) {
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

    let className = 'm-form__time'
    if (eventhandler.formerrors[name]) {
        className += ' hasError'
    }

    return (<div className={className} data-has-help={Boolean(helptext)}>
        <label htmlFor={id} data-is-required={required}>
            <span className={"label"}>{label}</span>
            <input type={"time"} autoComplete={"off"} defaultValue={value} readOnly={readonly} name={name} onChange={(e) => handler(e, 'change', name)} id={id} />
        </label>

        {Boolean(helptext) === true && (
            <div className={"m-form__help"}>
                <div className={"m-form__helpicon"} onClick={handleHelp}></div>
                <div className={"m-form__helpinner"} aria-expanded={shophelp}>
                    <h3>{label}</h3>
                    {helptext}
                    <span className={"m-form__helpcloser"} onClick={handleHelp}></span>
                </div>
            </div>)
        }
    </div>)
}
