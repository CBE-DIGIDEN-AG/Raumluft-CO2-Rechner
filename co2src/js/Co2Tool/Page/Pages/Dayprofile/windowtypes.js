import React, { useState, useRef } from "react";
import {Form} from "../../../Forms/form";
import {Formsfield} from "../../../Forms/formsfield";
import EventHandler from "../../../Tools/eventhandler";
import Windowtyp from "../../../Models/Windowtyp";
import Listbuilder from "../../../Tools/listbuilder";
import Windowdetailpage from "../Dayprofile/Detailpages/windowtype";

export default function windowtypes({page}) {
    const eventhandler = new EventHandler()

    const [internalpage, setInternalpage] = useState(() => {
        return page
    });

    const getEntityByWindowKey = () => {
        var parts = page.split('.')
        var dump = null

        if (eventhandler.projectdata['dayprofile']['windowtypes']) {
            eventhandler.projectdata['dayprofile']['windowtypes'].map((entity, key) => {
                if (entity && entity.key !== null) {
                    var key = 'window'+ entity.key

                    if (key === parts[2]) {
                        dump = entity
                    }
                }
            })
        }

        return dump
    }

    const [entitytoedit, setEntitytoedit] = useState(() => {
        if (page !== 'dayprofile.windowtypes') {
            return getEntityByWindowKey()
        }

        return null
    });

    const [show, setShow] = useState(() => {
        if (page !== 'dayprofile.windowtypes') {
            return 'edit'
        }

        return 'list'
    });

    if (!eventhandler.projectdata['dayprofile']['windowtypes']) {
        eventhandler.projectdata['dayprofile']['windowtypes'] = []
    }

    const handleSubmitCallback = (e,entityfromcall, type, form_is_valid=false) => {
        if (type === 'editstart') {
            eventhandler.handleSidebarEvent(e,{page: 'dayprofile.windowtypes.window' + entityfromcall.key})
        }
        else if (type === 'editend') {
            //create element if is new
            if (entityfromcall.isnew === true) {
                var windowtypes = Object.keys(eventhandler.projectdata.dayprofile.windowtypes)
                var lastkey = parseInt(windowtypes[windowtypes.length-1])

                entityfromcall.key = parseInt(lastkey)
                entityfromcall.uuid = eventhandler.uuid()

                if (eventhandler.projectdata['dayprofile']['windowtypes'][lastkey])  {
                    eventhandler.projectdata['dayprofile']['windowtypes'][lastkey].key = parseInt(lastkey)
                    eventhandler.projectdata['dayprofile']['windowtypes'][lastkey].uuid = eventhandler.uuid()
                }

                eventhandler.store()
            }

            //sicherstellen das nach dem edit wieder die Liste angezeigt wird
            setShow('list')
            eventhandler.forceUpdate()

            //change sidebar navi (add)
            {eventhandler.projectdata['dayprofile']['windowtypes'].map((entity, key) => {
                if (entity && entity.key !== null) {
                    var key = 'window'+ entity.key

                    var valid = form_is_valid
                    var submenu_isopen = false

                    if (eventhandler.sidebartree.dayprofile.childs.windowtypes.childs && eventhandler.sidebartree.dayprofile.childs.windowtypes.childs['window'+entity.key]) {
                        valid = eventhandler.sidebartree.dayprofile.childs.windowtypes.childs['window'+entity.key].valid
                        submenu_isopen = eventhandler.sidebartree.dayprofile.childs.windowtypes.childs['window'+entity.key].submenu_isopen
                    }

                    let map = {};
                    map[key] = {
                        id: 'dayprofile.windowtypes.window' + entity.key,
                        title: entity.name,
                        valid: valid,
                        submenu_isopen: submenu_isopen
                    }

                    eventhandler.expandSidebarTree('dayprofile.windowtypes', map, true)
                }
            })}
        }
        else if (type === 'removeitem') {
            setShow('list')
            eventhandler.forceUpdate()

            var key = 'window'+ entityfromcall.key

            let map = {};
            map[key] = {
                id: 'dayprofile.windowtypes.window' + entityfromcall.key,
            }

            eventhandler.removeFromSidebarTree('dayprofile.windowtypes', map, true)

            //remove from relwindowroomtypes
            if (eventhandler.projectdata.dayprofile.relwindowroomtypes) {
                Object.entries(eventhandler.projectdata.dayprofile.relwindowroomtypes).map((rooms, key) => {
                    if (rooms[1].windowtypes[entityfromcall.key]) {
                        delete rooms[1].windowtypes[entityfromcall.key]
                    }
                })

                eventhandler.store()
            }

            //remove from usageprofiles
            if (eventhandler.projectdata.dayprofile.usageprofiles) {
                Object.entries(eventhandler.projectdata.dayprofile.usageprofiles).map((rooms, key) => {
                    if (rooms[1] && rooms[1].intervals) {
                        Object.entries(rooms[1].intervals).map((interval, key) => {
                            if (interval[1] && interval[1].windows && interval[1].windows[entityfromcall.key]) {
                                delete interval[1].windows[entityfromcall.key]
                            }
                        })
                    }

                    eventhandler.store()
                })
            }
        }
    }

    if (page !== 'dayprofile.windowtypes') {
        let entityByWindowKey = getEntityByWindowKey()
        if (entityByWindowKey && entityByWindowKey !== entitytoedit) {
            setEntitytoedit(entityByWindowKey)
            setShow('edit')
            setInternalpage(page)
        }
    }
    else {
        switch(true) {
            case (page === 'dayprofile.windowtypes' && show === 'new'):
            case (page === 'dayprofile.windowtypes' && show === 'edit'):
            case (internalpage !== 'edit' && entitytoedit):
                setEntitytoedit(null)
                setShow('list')
                setInternalpage(page)
                break
        }
    }

    const beforeList = () => {
        return (<div className={"m-page__description"}>Fügen Sie der Liste Fenstertypen hinzu und definieren Sie diese über den „Edit“-Befehl. Sie können vorhandene Fenstertypen duplizieren oder löschen.</div>)
    }

    let messages = {
        delete: {
            title: 'Wollen Sie wirklich %name% löschen?',
            description: 'Ihre angelegten zeitlichen Nutzungs- und Lüftungsintervalle für die %name% werden dadurch ebenfalls gelöscht.'
        }
    }

    return (<div className={"m-page"} key={eventhandler.uuid()}>
        <Form name={"dayprofile.windowtypes"}>
            <Listbuilder
                key={eventhandler.uuid()}
                addlabel={"Fenstertyp hinzufügen"}
                title={"Fenstertypen"}
                beforeList={beforeList}
                detailpage={Windowdetailpage}
                storage={eventhandler.projectdata['dayprofile']['windowtypes']}
                model={Windowtyp}
                next={"page.dayprofile.roomtypes"}
                prev={"page.dayprofile.rooms"}
                show={show}
                setShow={setShow}
                editCallback={handleSubmitCallback}
                entity={entitytoedit}
                contextmenu={['delete', 'clone']}
                messages={messages}
                createlabel={"neuer Fenstertyp"}
            />
        </Form>
    </div>)
}
