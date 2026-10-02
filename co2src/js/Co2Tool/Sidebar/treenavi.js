import React, { useState, useRef } from "react";
import EventHandler from "../Tools/eventhandler";
import PageCallback from "./callback"

export default function Treenavi({tree, level=0}) {
    const eventhandler = new EventHandler()
    let show_footer = false

    if (!tree) {
        tree = eventhandler.sidebartree
        show_footer = true
    }

    return (
        <div className={"sidebarProject"}>
            <ul className={"sidebarProjectMenu"}>
                <TreenaviItems tree={tree} level={level} />
            </ul>

            <ul className={"sidebarLegend"}>
                <li data-type={"blue"}>Bitte Daten eingeben</li>
                <li data-type={"green"}>Erfolgreich validiert</li>
                <li data-type={"red"}>Bitte Eingabe übernehmen</li>
            </ul>

            {show_footer === true && <ul className={"sidebarProjectFooterMenu"}>
                <li data-is-active={'toolbeschreibung' === eventhandler.activemenu}>
                    <a href={"#"}
                       onClick={(e) => eventhandler.handleSidebarEvent(e, {page: 'toolbeschreibung'})}>Toolbeschreibung</a>
                </li>
                <li data-is-active={'impressum' === eventhandler.activemenu}>
                    <a href={"#"} onClick={(e) => eventhandler.handleSidebarEvent(e, {page: 'impressum'})}>Impressum</a>
                </li>
                <li data-is-active={'datenschutz' === eventhandler.activemenu}>
                    <a href={"#"}
                       onClick={(e) => eventhandler.handleSidebarEvent(e, {page: 'datenschutz'})}>Datenschutz</a>
                </li>
                <li data-is-active={'barrierefreiheit' === eventhandler.activemenu}>
                    <a href={"#"}
                       onClick={(e) => eventhandler.handleSidebarEvent(e, {page: 'barrierefreiheit'})}>Erklärung zur Barrierefreiheit</a>
                </li>
                <li data-is-active={'barrieremelden' === eventhandler.activemenu}>
                    <a href={"#"}
                       onClick={(e) => eventhandler.handleSidebarEvent(e, {page: 'barrieremelden'})}>Barriere melden</a>
                </li>
                <li data-is-active={'gebaerdensprache' === eventhandler.activemenu}>
                    <a href={"#"} className={"handicon"}
                       onClick={(e) => eventhandler.handleSidebarEvent(e, {page: 'gebaerdensprache'})}></a>
                </li>
                <li data-is-active={'easyspeech' === eventhandler.activemenu}>
                    <a href={"#"} className={"easyspeechicon"}
                       onClick={(e) => eventhandler.handleSidebarEvent(e, {page: 'easyspeech'})}></a>
                </li>
            </ul>}
        </div>
    )
}

function TreenaviItems({tree, level = 0}) {
    const eventhandler = new EventHandler()

    let items = []

    Object.entries(tree).map((page) => (
        items.push(<TreenaviItem page={page} level={level} key={eventhandler.uuid()}></TreenaviItem>)
    ))

    return items
}

function TreenaviItem({page,level}) {
    const eventhandler = new EventHandler()

    if (!page[1]) {
        return
    }

    let sidebaritem = eventhandler.find_set_in_sidebartree(page[1].id, null, 'usageprofile')

    const [isopen, setIsopen] = useState(() => {
        if (sidebaritem) {
            return sidebaritem.submenu_isopen
        }
        return false
    });

    const handleChevron = (e) => {
        if (isopen === true) {
            setIsopen(false)

            if (sidebaritem) {
                sidebaritem.submenu_isopen = false
            }
        }
        else {
            setIsopen(true)

            if (sidebaritem) {
                sidebaritem.submenu_isopen = true
            }
        }
    }

    let valid = page[1].valid
    let unsaved = page[1].unsaved

    //wenn eine seite kein Formualr dafür aber Kinder hat
    if (page[1].has_childs === true && (page[1].form === null || typeof page[1].form === 'undefined')) {
        valid = false
    }

    if (page[1].form) {
        valid = eventhandler.validateForm(page[1].form, null, true)
    }
    else if (page[1].has_childs === true && typeof page[1].childs === 'undefined') {
        valid = false
    }
    else if (page[1].has_childs === true && page[1].childs && Object.entries(page[1].childs).length < 1) {
        valid = false
    }
    else if (page[1].form === null) {
        valid = false
    }

    if (page[1].has_childs === true && page[1].childs && Object.entries(page[1].childs).length > 0) {
        //has subpages
        let validitem = true
        let unsaveditem = false

        Object.entries(page[1].childs).map((child) => {
            validitem = child[1].valid

            if (child[1].form) {
                let validitemdump= eventhandler.validateForm(child[1].form, null, true)

                if (validitemdump === false) {
                    validitem = false
                }
            } else if (child[1].form === null) {
                validitem = false
            }

            if (child[1].unsaved === true) {
                unsaveditem = true
            }
        })


        //all subpages are valid
        if (validitem === true) {
            valid = true
        }
        else {
            valid = false
        }

        if (unsaveditem === false) {
            unsaved = false
        }
    }

    //console.log(page[1].title + ' - ' + valid + ' - ' + page[1].unsaved)
    //console.log(page[1])

    return (
        <li data-is-active={page[1].id === eventhandler.activemenu} data-path={page[1].id} data-hide-subtree={page[1].hide_subtree} data-is-valid={valid} data-level={level} key={page[1].id} data-submenu-isopen={isopen} data-is-unsaved={unsaved}>
            <a href={"#"} onClick={(e) => eventhandler.handleSidebarEvent(e,{page: page[1].id})}>
                {page[1].title}
                {(page[1].childs && (level === 0 || level === 1 || level === 2)) && (<span className={"chevron"} onClick={handleChevron}></span>)}
                <PageCallback page={page[1]}></PageCallback>
            </a>
            {page[1].childs && <ul className={"sidebarProjectMenu"} data-level={level+1}><TreenaviItems tree={page[1].childs} level={level+1} /></ul>}
        </li>
    )
}

