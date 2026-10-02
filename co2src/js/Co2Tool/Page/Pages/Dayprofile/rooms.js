import React, { useState, useRef } from "react";
import {Form} from "../../../Forms/form";
import {Formsfield} from "../../../Forms/formsfield";
import EventHandler from "../../../Tools/eventhandler";
import Raum from "../../../Models/Raum";
import Listbuilder from "../../../Tools/listbuilder";
import Room from "../Dayprofile/Detailpages/room";

export default function rooms({page}) {
    const eventhandler = new EventHandler()

    const [internalpage, setInternalpage] = useState(() => {
        return page
    });

    const getEntityByRoomKey = () => {
        var parts = page.split('.')
        var dump = null

        eventhandler.projectdata['dayprofile']['rooms'].map((entity, key) => {
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
        if (page !== 'dayprofile.rooms') {
            return getEntityByRoomKey()
        }

        return null
    });

    const [show, setShow] = useState(() => {
        if (page !== 'dayprofile.rooms') {
            return 'edit'
        }

        return 'list'
    });

    if (!eventhandler.projectdata['dayprofile']['rooms']) {
        eventhandler.projectdata['dayprofile']['rooms'] = []
    }

    const handleSubmitCallback = (e,entityfromcall, type, form_is_valid=false) => {
        if (type === 'editstart') {
            eventhandler.handleSidebarEvent(e,{page: 'dayprofile.rooms.room' + entityfromcall.key})
        }

        else if (type === 'editend') {
            if (entityfromcall.isnew === true) {
                var rooms = Object.keys(eventhandler.projectdata.dayprofile.rooms)
                var lastkey = parseInt(rooms[rooms.length-1])

                entityfromcall.key = parseInt(lastkey)
                entityfromcall.uuid = eventhandler.uuid()

                if (eventhandler.projectdata['dayprofile']['rooms'][lastkey])  {
                    eventhandler.projectdata['dayprofile']['rooms'][lastkey].key = parseInt(lastkey)
                    eventhandler.projectdata['dayprofile']['rooms'][lastkey].uuid = eventhandler.uuid()
                }

                eventhandler.store()
            }

            //sicherstellen das nach dem edit wieder die Liste angezeigt wird
            setShow('list')
            eventhandler.forceUpdate()

            //change sidebar navi (add)
            {eventhandler.projectdata['dayprofile']['rooms'].map((entity, key) => {
                if (entity && entity.key !== null) {
                    var key = 'room'+ entity.key

                    var valid = form_is_valid
                    var submenu_isopen = false

                    if (eventhandler.sidebartree.dayprofile.childs.rooms.childs && eventhandler.sidebartree.dayprofile.childs.rooms.childs['room'+entity.key]) {
                        valid = eventhandler.sidebartree.dayprofile.childs.rooms.childs['room'+entity.key].valid
                        submenu_isopen = eventhandler.sidebartree.dayprofile.childs.rooms.childs['room'+entity.key].submenu_isopen
                    }

                    let map = {};
                    map[key] = {
                        id: 'dayprofile.rooms.room' + entity.key,
                        title: entity.name,
                        valid: valid,
                        submenu_isopen: submenu_isopen
                    }

                    eventhandler.expandSidebarTree('dayprofile.rooms', map, true)
                }
            })}
        }
        else if (type === 'removeitem') {
            setShow('list')
            eventhandler.forceUpdate()

            var key = 'room'+ entityfromcall.key

            let map = {};
            map[key] = {
                id: 'dayprofile.rooms.room' + entityfromcall.key,
            }

            //remove item self
            eventhandler.removeFromSidebarTree('dayprofile.rooms', map, true)

            eventhandler.store()
        }
    }


    if (page !== 'dayprofile.rooms') {
        let entityByRoomKey = getEntityByRoomKey()
        if (entityByRoomKey && entityByRoomKey !== entitytoedit) {
            setEntitytoedit(entityByRoomKey)
            setShow('edit')
            setInternalpage(page)
        }
    }
    else {
        switch(true) {
            case (page === 'dayprofile.rooms' && show === 'new'):
            case (page === 'dayprofile.rooms' && show === 'edit'):
            case (internalpage !== 'edit' && entitytoedit):
                setEntitytoedit(null)
                setShow('list')
                setInternalpage(page)
                break
        }
    }

    const beforeList = () => {
        return (<div className={"m-page__description"}>Fügen Sie der Liste Räume hinzu und definieren Sie diese über den „Edit“-Befehl. Sie können vorhandene Räume duplizieren oder löschen.</div>)
    }

    return (<div className={"m-page"} key={eventhandler.uuid()}>
        <Form name={"dayprofile.rooms"}>
            <Listbuilder
                key={eventhandler.uuid()}
                addlabel={"Raum hinzufügen"}
                title={"Räume"}
                beforeList={beforeList}
                detailpage={Room}
                storage={eventhandler.projectdata['dayprofile']['rooms']}
                model={Raum}
                next={"page.dayprofile.windowtypes"}
                prev={"page.dayprofile.buildingdetails"}
                show={show}
                setShow={setShow}
                editCallback={handleSubmitCallback}
                entity={entitytoedit}
                contextmenu={['delete', 'clone']}
                createlabel={"neuer Raum"}
            />
        </Form>
    </div>)
}
