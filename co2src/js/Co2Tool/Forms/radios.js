import React, { useState, useRef } from "react";
import EventHandler from "../Tools/eventhandler";
import filter from '../Tools/vanillaSelectBox.js'

export default function Radois({label, handler, name, value, required, helptext, unit, options, multiple, readonly}) {
    const eventhandler = new EventHandler()
    let initialized = useRef(false)
    let vanillaSelect = null

    let className = 'm-form__radios'
    if (eventhandler.formerrors[name]) {
        className += ' hasError'
    }

    const handleChangeEvent = (e, type, name) => {
        handler(e, type, name)
    }

    React.useEffect(() => {
        if (helptext) {
            if (initialized.current === false) {
                initialized.current = true

                const element = document.getElementById(id)
                const helptextelement = element.closest('.m-form__select').querySelector('.m-form__helpicon')
                const helptextcloser = element.closest('.m-form__select').querySelector('.m-form__helpcloser')

                const handleHelp = (e) => {
                    e.stopPropagation()
                    e.preventDefault()

                    //eventhandler.handleHelp(e,name)

                    for (const helpitem of Object.entries(eventhandler.shophelp)) {
                        if (helpitem[0] !== name) {
                            const other_elements = document.querySelectorAll('[name="'+helpitem[0]+'"]')
                            for (const other_element of other_elements) {
                                other_element.closest('.m-form__select').querySelector('.m-form__helpinner').setAttribute('aria-expanded', 'false')
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

    return (<div className={className} data-has-help={Boolean(helptext)} data-name={name} data-label={label}>
        <h2>{label}</h2>
        {options && options.map((option) => {
            let id = 'select' + eventhandler.uuid()

            return (<label htmlFor={id} data-is-required={required} key={eventhandler.uuid()}>
                <span className={"label"}>{option.label}
                    {option.label_additional && (<span dangerouslySetInnerHTML={{ __html: option.label_additional }}></span>)}
                </span>
                <input type={"radio"} autoComplete={"off"} defaultValue={option.key} name={name}
                       checked={option.key === value}
                       onChange={(e) => handleChangeEvent(e, 'change', name)}
                       onClick={(e) => handleChangeEvent(e, 'change', name)}
                       id={id} key={eventhandler.uuid()}
                       disabled={readonly}>
                </input>
                <span></span>
            </label>)
        })}


        {Boolean(helptext) === true && (
            <div className={"m-form__help"}>
                <div className={"m-form__helpicon"}></div>
                <div className={"m-form__helpinner"} aria-expanded={eventhandler.shophelp[name]}>
                    <h3>{label}</h3>
                    {helptext}
                    <span className={"m-form__helpcloser"} onClick={(e) => eventhandler.handleHelp(e, name)}></span>
                </div>
            </div>)
        }
    </div>)
}
