import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import Text from "./text"
import Hidden from "./hidden"
import Time from "./time"
import Group from "./group"
import Select from "./select"
import Radios from "./radios"
import Button from "./button"
import Submit from "./submit"
import EventHandler from "../Tools/eventhandler";
import ValidateHandler from "../Validators/validateHandler";

export const Formsfield = ({type, label, name, value, validator, helptext, unit, options, children, callback, multiple, readonly, entity,setFocus}) => {
    const eventhandler = new EventHandler()

    if (!validator) {
        validator = ''
    }

    const validators = validator.split(',')
    const validateHandler = new ValidateHandler()

    const handleFormHasChangesEvent = (e) => {
        try {
            const form = ReactDOM.findDOMNode(e.target).closest('.m-page__form').getAttribute('data-form-name')

            let sidebarelement = eventhandler.getSidebarByForm(form)
            if (sidebarelement) {
                sidebarelement.unsaved = true
            }
        }
        catch(e) {

        }
    }

    const handleFormFieldEvent = (e, type, name) => {
        switch (type) {
            case ('change'):
                handleChangeEvent(e, name)
                handleFormHasChangesEvent(e)
                //set form as not saved
                break;
            case ('blur'):
                handleBlurEvent(e, name)
                break;
            case ('click'):
                handleClickEvent(e, name)
                handleFormHasChangesEvent(e)
                break;
            case ('submit'):
                handleFormFieldEventSubmit(e, name)
                break;
        }
    }

    const handleFormFieldEventSubmit = (e, name) => {
        const form = ReactDOM.findDOMNode(e.target).closest('.m-page__form').getAttribute('data-form-name')
        const form_alt = ReactDOM.findDOMNode(e.target).closest('.m-page__form').getAttribute('data-form-name-alt')

        //reset form errors
        eventhandler.formerrors = []

        let form_is_valid = eventhandler.validateForm(eventhandler.forms[form], entity)

        eventhandler.forceUpdate()

        let sidebarelement = eventhandler.getSidebarByForm(form)

        if (!sidebarelement && form_alt) {
            sidebarelement = eventhandler.getSidebarByForm(form_alt)
        }

        if (form_is_valid === false) {
            if (sidebarelement) {
                sidebarelement.valid = false
            }

            //store only if entity (listelement) and entity is not new
            //otherwise the entity should store itself in sucess
            if (!entity || entity.isnew === false) {
                eventhandler.store()
            }

            //scroll to first error
            let first = Object.keys(eventhandler.formerrors)[0]
            if (first) {
                const firstElement = document.querySelector('[name="' + first + '"]');
                if (firstElement) {
                    window.scrollTo(0, firstElement.getBoundingClientRect().top + 100);
                }
            }

            if (callback) {
                //need for unsaveing enitiys
                //callback(e, entity, 'is_invalid', form_is_valid)
            }

            return false
        }
        else {
            if (sidebarelement) {
                sidebarelement.valid = true
                sidebarelement.unsaved = false
                eventhandler.find_set_in_sidebartree(sidebarelement.id, sidebarelement)
            }
            eventhandler.store()
        }

        //switch to target from the button
        const parts = name.split('.');

        if (parts[0] === 'page') {
            eventhandler.handleChangeContentEvent(e, name)
        }

        if (callback) {
            callback(e, entity, 'editend', form_is_valid)
        }
    }

    const handleChangeEvent = (e, name) => {
        handleChangeEventRecursive(name.split('.'), eventhandler.projectdata, e.target.value)

        if (callback) {
            callback(e,name, 'onchange', e.target.value)
        }
    }

    const handleBlurEvent = (e, name) => {
        handleChangeEventRecursive(name.split('.'), eventhandler.projectdata, e.target.value)

        if (callback) {
            callback(e,name, 'onblur', e.target.value)
        }
    }

    const handleChangeEventRecursive = (parts, storage, value) => {
        if (!storage) {
            storage = {}
        }

        const part = parts[0];
        parts.shift()

        if (parts.length > 0) {
            if (!storage[part]) {
                storage[part] = {}
            }

            handleChangeEventRecursive(parts, storage[part], value)
        }
        else {
            storage[part] = value
        }
    }

    const getValue = (name) => {
        return eventhandler.getValue(name, entity)
    }

    const value_from_storage = getValue(name);
    if (value_from_storage) {
        value = value_from_storage
    }

    switch(type) {
        case ('group'):
            value = getValue(name)
            return (
                <div className={"m-form__element"}>
                    <Group label={label} name={name} value={value} helptext={helptext} unit={unit} required={validators.includes('required')} handler={handleFormFieldEvent}></Group>
                    {children && (<div className={"m-form__subgroupelements"}>{children}</div>)}
                </div>
            )
            break;
        case ('text'):

            return (
                <div className={"m-form__element"}>
                    <Text label={label} name={name} value={value} helptext={helptext} readonly={readonly} unit={unit} required={validators.includes('required')} handler={handleFormFieldEvent} setFocus={setFocus}></Text>
                    {children && (<div className={"m-form__subelements"}>{children}</div>)}
                </div>
            )
            break;
        case ('hidden'):

            return (
                <div className={"m-form__element"}>
                    <Hidden label={label} name={name} value={value} helptext={helptext} readonly={readonly} unit={unit} required={validators.includes('required')} handler={handleFormFieldEvent} setFocus={setFocus}></Hidden>
                    {children && (<div className={"m-form__subelements"}>{children}</div>)}
                </div>
            )
            break;
        case ('time'):

            return (
                <div className={"m-form__element"}>
                    <Time label={label} name={name} value={value} helptext={helptext} unit={unit} readonly={readonly} required={validators.includes('required')} handler={handleFormFieldEvent}></Time>
                </div>
            )
            break;
        case ('select'):
            value = getValue(name)
            return (
                <div className={"m-form__element"}>
                    <Select label={label} name={name} value={value} helptext={helptext} multiple={multiple} options={options} unit={unit} readonly={readonly} required={validators.includes('required')} handler={handleFormFieldEvent}></Select>
                    {children && (<div className={"m-form__subelements"}>{children}</div>)}
                </div>)
            break;
        case ('radios'):
            return (
                <div className={"m-form__element"}>
                    <Radios label={label} name={name} value={value} helptext={helptext} multiple={multiple} options={options} unit={unit} readonly={readonly} required={validators.includes('required')} handler={handleFormFieldEvent}></Radios>
                    {children && (<div className={"m-form__subelements"}>{children}</div>)}
                </div>)
            break;
        case ('button'):
            return (<Button label={label} name={name} value={value} handler={handleFormFieldEvent}></Button>)
            break;
        case ('submit'):
            return (<Submit label={label} name={name} value={value} handler={handleFormFieldEvent}></Submit>)
            break;
        default:
            //do nothing
    }
}

Formsfield.customname = 'Formsfield'