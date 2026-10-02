import React, { useState, useRef } from "react";
import {Form} from "../../../Forms/form";
import {Formsfield} from "../../../Forms/formsfield";
import EventHandler from "../../../Tools/eventhandler";
import Raumtyp from "../../../Models/Raumtyp";
import Listbuilder from "../../../Tools/listbuilder";
import Roomtype from "../Dayprofile/Detailpages/roomtype";

export default function roomtypes({page}) {
    const eventhandler = new EventHandler()

    const [internalpage, setInternalpage] = useState(() => {
        return page
    });

    const getEntityByRoomKey = () => {
        var parts = page.split('.')
        var dump = null

        eventhandler.projectdata['dayprofile']['roomtypes'].map((entity, key) => {
            if (entity && entity.key !== null) {
                var key = 'room'+ entity.key

                if (key === parts[2]) {
                    dump = entity
                }
            }
        })

        return dump
    }

    const [entitytoedit, setEntitytoedit] = useState(() => {
        if (page !== 'dayprofile.roomtypes') {
            return getEntityByRoomKey()
        }

        return null
    });

    const [show, setShow] = useState(() => {
        if (page !== 'dayprofile.roomtypes') {
            return 'edit'
        }

        return 'list'
    });

    if (!eventhandler.projectdata['dayprofile']['roomtypes']) {
        eventhandler.projectdata['dayprofile']['roomtypes'] = []
    }

    const setRelWindowRoomtypesInValid = () => {
        eventhandler.sidebartree.dayprofile.childs.relwindowroomtypes.valid = false
        eventhandler.sidebartree.dayprofile.childs.relwindowroomtypes.unsaved = true

        eventhandler.store()
    }

    setRelWindowRoomtypesInValid()

    const handleSubmitCallback = (e,entityfromcall, type, form_is_valid=false) => {
        if (type === 'editstart') {
            eventhandler.handleSidebarEvent(e,{page: 'dayprofile.roomtypes.room' + entityfromcall.key})
        }
        else if (type === 'is_invalid') {
            //setEntitytoedit(entityfromcall)
        }
        else if (type === 'editend') {
            //create element if is new
            if (entityfromcall.isnew === true) {
                var roomtypes = Object.keys(eventhandler.projectdata.dayprofile.roomtypes)
                var lastkey = parseInt(roomtypes[roomtypes.length-1])

                if (!lastkey) {
                    lastkey = 0
                }

                entityfromcall.key = parseInt(lastkey)
                entityfromcall.uuid = eventhandler.uuid()

                //projectdata sind leer wenn man eine neuanlage macht
                if (eventhandler.projectdata['dayprofile']['roomtypes'][lastkey])  {
                    eventhandler.projectdata['dayprofile']['roomtypes'][lastkey].key = parseInt(lastkey)
                    eventhandler.projectdata['dayprofile']['roomtypes'][lastkey].uuid = eventhandler.uuid()
                }
                else {
                    eventhandler.projectdata['dayprofile']['roomtypes'][lastkey] = entityfromcall
                }

                eventhandler.store()
            }

            //sicherstellen das nach dem edit wieder die Liste angezeigt wird
            setShow('list')
            eventhandler.forceUpdate()

            //change sidebar navi (add)
            {eventhandler.projectdata['dayprofile']['roomtypes'].map((entity, key) => {
                if (entity && entity.key !== null) {
                    var key = 'room'+ entity.key
                    var valid = form_is_valid
                    var submenu_isopen = false

                    if (
                        eventhandler.sidebartree.dayprofile.childs.roomtypes.childs
                        && eventhandler.sidebartree.dayprofile.childs.roomtypes.childs['room'+entity.key]) {
                            valid = eventhandler.sidebartree.dayprofile.childs.roomtypes.childs['room'+entity.key].valid
                            submenu_isopen = eventhandler.sidebartree.dayprofile.childs.roomtypes.childs['room'+entity.key].submenu_isopen
                    }

                    let map = {};
                    map[key] = {
                        id: 'dayprofile.roomtypes.room' + entity.key,
                        title: entity.name,
                        valid: valid,
                        submenu_isopen: submenu_isopen
                    }
                    eventhandler.expandSidebarTree('dayprofile.roomtypes', map, true)

                    //need to change other depending sidebar entrys
                    if (eventhandler.sidebartree.dayprofile.childs) {
                        for (const entry in eventhandler.sidebartree.dayprofile.childs.usageprofiles.childs) {
                            if (eventhandler.sidebartree.dayprofile.childs.usageprofiles.childs[entry].id === 'dayprofile.usageprofiles.usageprofile' + entity.key) {
                                eventhandler.sidebartree.dayprofile.childs.usageprofiles.childs[entry].title = 'Lüftungskonzept für ' + entity.name
                            }
                        }
                    }
                    //need to change other depending titles
                    if (eventhandler.projectdata.dayprofile.usageprofiles && eventhandler.projectdata.dayprofile.usageprofiles[entity.key]) {
                        eventhandler.projectdata.dayprofile.usageprofiles[entity.key].name = 'Lüftungskonzept für ' + entity.name
                        eventhandler.store()
                    }

                    eventhandler.store()
                }
            })}
        }
        else if (type === 'removeitem') {
            setShow('list')
            eventhandler.forceUpdate()

            var key = 'room'+ entityfromcall.key

            let map = {};
            map[key] = {
                id: 'dayprofile.roomtypes.room' + entityfromcall.key,
            }

            //remove item self
            eventhandler.removeFromSidebarTree('dayprofile.roomtypes', map, true)

            //remove usageprofil (Lüftungsregime für ...) from sidebar
            map = {};
            map[entityfromcall.key] = {
                id: 'dayprofile.usageprofiles.' + entityfromcall.key,
            }
            eventhandler.removeFromSidebarTree('dayprofile.usageprofiles', map, true)

            eventhandler.projectdata.dayprofile.roomtypes.map((roomtype, key) => {
                if (roomtype) {
                    roomtype.key = key
                }
            })
            eventhandler.store()

            //remove all relations with rooms in usageprofiles
            if (eventhandler.projectdata.dayprofile.usageprofiles && eventhandler.projectdata.dayprofile.usageprofiles[entityfromcall.key]) {
                //funzt noch nicht wenn man nicht das erste element löscht
                eventhandler.projectdata.dayprofile.usageprofiles.splice(entityfromcall.key,1)

                //need to correct key for the rest of items
                eventhandler.projectdata.dayprofile.usageprofiles.map((roomtype, key) => {
                  roomtype.roomtype = key
                })

                eventhandler.store()
            }

            //remove from relwindowroomtypes
            if (eventhandler.projectdata.dayprofile.relwindowroomtypes && eventhandler.projectdata.dayprofile.relwindowroomtypes[entityfromcall.key]) {
                delete eventhandler.projectdata.dayprofile.relwindowroomtypes[entityfromcall.key]
            }
        }
        else if (type === 'clone') {
            entityfromcall.windowgroups = []

            setRelWindowRoomtypesInValid()
        }
    }

    if (page !== 'dayprofile.roomtypes') {
        let entityByRoomKey = getEntityByRoomKey()
        if (entityByRoomKey && entityByRoomKey !== entitytoedit) {
            setEntitytoedit(entityByRoomKey)
            setShow('edit')
            setInternalpage(page)
        }
    }
    else {
        switch(true) {
            case (page === 'dayprofile.roomtypes' && show === 'new'):
                setRelWindowRoomtypesInValid()
            case (page === 'dayprofile.roomtypes' && show === 'edit'):
            case (internalpage !== 'edit' && entitytoedit):
                setEntitytoedit(null)
                setShow('list')
                setInternalpage(page)
                break
        }
    }

    const beforeList = () => {
        return (<div className={"m-page__description"}>Fügen Sie Varianten hinzu und legen Sie die jeweilige Lüftungsart des Raumes fest.</div>)
    }

    return (<div className={"m-page"} key={eventhandler.uuid()}>
        <Form name={"dayprofile.roomtypes"}>
            <Listbuilder
                key={eventhandler.uuid()}
                addlabel={"Variante hinzufügen"}
                limit={4}
                title={"Varianten"}
                beforeList={beforeList}
                detailpage={Roomtype}
                storage={eventhandler.projectdata['dayprofile']['roomtypes']}
                model={Raumtyp}
                next={"page.dayprofile.relwindowroomtypes"}
                prev={"page.dayprofile.windowtypes"}
                show={show}
                setShow={setShow}
                editCallback={handleSubmitCallback}
                entity={entitytoedit}
                contextmenu={['delete', 'clone']}
                createlabel={"neue Variante"}
            />
        </Form>
    </div>)
}
