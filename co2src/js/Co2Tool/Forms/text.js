import React, { useState, useRef } from "react";
import EventHandler from "../Tools/eventhandler";

export default function Text({label, handler, name, value, required, helptext, unit, readonly, setFocus}) {
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

    React.useEffect(() => {
        if (helptext) {
            if (initialized.current === false) {
                initialized.current = true

                const element = document.getElementById(id)
                const helptextelement = element.closest('.m-form__text').querySelector('.m-form__helpicon')
                const helptextcloser = element.closest('.m-form__text').querySelector('.m-form__helpcloser')

                const handleHelp = (e) => {
                    e.stopPropagation()
                    e.preventDefault()

                    //eventhandler.handleHelp(e,name)

                    for (const helpitem of Object.entries(eventhandler.shophelp)) {
                        if (helpitem[0] !== name) {
                            const other_elements = document.querySelectorAll('[name="'+helpitem[0]+'"]')
                            for (const other_element of other_elements) {
                                other_element.closest('.m-form__text').querySelector('.m-form__helpinner').setAttribute('aria-expanded', 'false')
                            }
                        }
                    }

                    const helpinner = helptextelement.closest('.m-form__help').querySelector('.m-form__helpinner')

                    if (helpinner.getAttribute('aria-expanded') === 'true') {
                        helpinner.setAttribute('aria-expanded', 'false')
                        eventhandler.shophelp[name] = false
                    }
                    else {
                        helpinner.setAttribute('aria-expanded', 'true')
                        eventhandler.shophelp[name] = true
                    }

                    return false
                }

                if (helptextelement) {
                    helptextelement.addEventListener('click', handleHelp)
                }

                if (helptextcloser) {
                    helptextcloser.addEventListener('click', handleHelp)
                }
            }
        }
    })

    return (<div className={className} data-has-help={Boolean(helptext)}>
        <label htmlFor={id} data-is-required={required}>
            <span className={"label"}>{label}</span>
            <input type={"text"} autoComplete={"off"} defaultValue={value} name={name} readOnly={readonly} onChange={(e) => handler(e, 'change', name)} onBlur={(e) => handler(e, 'blur', name)} id={id} />
        </label>

        {Boolean(helptext) === true && (
            <div className={"m-form__help"}>
                <div className={"m-form__helpicon"}></div>
                <div className={"m-form__helpinner"} aria-expanded={eventhandler.shophelp[name]}>
                    <h3>{label}</h3>
                    <div className={"m-form__helpinnertext"} dangerouslySetInnerHTML={{__html: helptext}}></div>
                    <span className={"m-form__helpcloser"}></span>
                </div>
            </div>)
        }
    </div>)
}
