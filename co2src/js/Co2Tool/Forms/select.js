import React, { useState, useRef } from "react";
import EventHandler from "../Tools/eventhandler";
import filter from '../Tools/vanillaSelectBox.js'

export default function Select({label, handler, name, value, required, helptext, unit, options, multiple, readonly}) {
    const eventhandler = new EventHandler()
    const id = 'select' + eventhandler.uuid()
    let initialized = useRef(false)
    let vanillaSelect = null

    let className = 'm-form__select'
    if (eventhandler.formerrors[name]) {
        className += ' hasError'
    }

    const handleChangeEvent = (e, type, name) => {
        if (multiple === 'multiple') {
            let value = []
            for (let option of e.target.selectedOptions) {
                value.push(option.value)
            }

            //simulate new target object
            e.target = {
                value: value
            }
        }

        handler(e, type, name)
    }

    React.useEffect(() => {
        if (multiple === 'multiple') {
            const select = document.querySelector('#'+id)

            if (!vanillaSelect) {
                vanillaSelect = new window.vanillaSelectBox('#'+id, {
                    'search': false,
                    'placeHolder': 'Bitte wählen',
                    'disableSelectAll': true
                })
            }
        }

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
        <label htmlFor={id} data-is-required={required}>
            <span className={"label"}>{label}</span>
            <select autoComplete={"off"} multiple={multiple} defaultValue={value} name={name}
                    onBlur={(e) => handleChangeEvent(e, 'focusout', name)}
                    onChange={(e) => handleChangeEvent(e, 'change', name)}
                    id={id} key={eventhandler.uuid()}
                    disabled={readonly}>
                {options && options.map((option) => (
                    (<option key={eventhandler.uuid()} value={option.key}>{option.label}</option>)
                ))}
            </select>
            {multiple === 'multiple' && (<ul className={"m-form__selections"}>
                {options && options.map((option) => {
                    if (value && option && option.hasOwnProperty('key') && value.includes(option.key.toString())===true) {
                        return (<li key={eventhandler.uuid()} data-value={option.key}>{option.label}</li>)
                    }
                })}
            </ul>)}
        </label>

        {Boolean(helptext) === true && (
            <div className={"m-form__help"}>
                <div className={"m-form__helpicon"}></div>
                <div className={"m-form__helpinner"} aria-expanded={eventhandler.shophelp[name]}>
                    <h3>{label}</h3>
                    {typeof helptext === 'object' && <div className={"m-form__helpinnertext"}>{helptext}</div>}
                    {typeof helptext === 'string' && <div className={"m-form__helpinnertext"} dangerouslySetInnerHTML={{__html: helptext}}></div>}
                    <span className={"m-form__helpcloser"} onClick={(e) => eventhandler.handleHelp(e, name)}></span>
                </div>
            </div>)
        }
    </div>)
}
