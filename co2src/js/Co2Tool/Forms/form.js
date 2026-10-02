import React, { useState, useRef } from "react";
import EventHandler from "../Tools/eventhandler";

export const Form = ({children, name, name_alt}) => {
    const eventhandler = new EventHandler()

    let formChilds = []
    let formChildsReact = []

    const isIterable = object =>
        object != null && typeof object[Symbol.iterator] === 'function'

    const parseChildElements = (children) => {
        let childs;
        try {
            if (children && isIterable(children)) {
                for (const child of children) {
                    if (!child) {
                        continue;
                    }

                    if (Array.isArray(child) === true) {
                        parseChildElements(child);
                    }
                    //das das problem
                    else if (child.type && child.type.customname && child.type.customname === 'Formsfield') {
                        formChilds.push(child.props);
                        formChildsReact.push({name: child.props.name, obj: child});

                        if (child.props.children) {
                            if (Array.isArray(child.props.children) === false) {
                                parseChildElements([child.props.children]);
                            }
                            else {
                                parseChildElements(child.props.children);
                            }
                        }
                    }
                    else if (child.type && child.type.customname && child.type.customname === 'Listbuilder') {
                        const beforeListData = child.props.beforeList();
                        if (typeof beforeListData === 'object') {
                            childs = beforeListData.props.children;

                            if (Array.isArray(child.props.children) === false) {
                                childs = [childs];
                            }
                            parseChildElements(childs);
                        }
                    }
                    else if (child.props && child.props.children) {
                        if (typeof child.props.children === 'object') {
                            childs = child.props.children;

                            if (Array.isArray(child.props.children) === false) {
                                childs = [childs];
                            }
                            parseChildElements(childs);
                        }
                    }
                    else {
                        //console.log(child)
                    }
                }
            }
        }
        catch(e) {
            console.log(e);
        }
    }

    if (children.type && children.type.name === 'Listbuilder') {
        //formChilds.push(children);
        formChildsReact.push(children);
    }
    else {
        parseChildElements(children);
    }

    //register childs
    eventhandler.forms[name] = formChilds
    eventhandler.formsReact[name] = formChildsReact

    //add cleanuped form to sidebartree for global validation
    let sidebarelement = eventhandler.find_set_in_sidebartree(name)
    if (sidebarelement && formChilds.length > 0) {
        try {
            let cleanedFormChilds = []
            for (const formChild of formChilds) {
                let cleanedFormChild = {}
                Object.keys(formChild).map((field, key) => {
                    if (field !== 'children' && field !== 'callback' && field !== 'helptext') {
                        cleanedFormChild[field] = formChild[field]
                    }
                })

                cleanedFormChilds.push(cleanedFormChild)
            }

            JSON.stringify(cleanedFormChilds)
            sidebarelement.form = cleanedFormChilds
            eventhandler.find_set_in_sidebartree(name,sidebarelement)
        }
        catch(e) {
            console.log(e)
        }
    }

    return (<div className={"m-page__form"} data-form-name={name} data-form-name-alt={name_alt}>{children}</div>)
};
