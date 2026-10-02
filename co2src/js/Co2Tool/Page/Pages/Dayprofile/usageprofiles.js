import React, { useState, useRef } from "react";
import {Form} from "../../../Forms/form";
import {Formsfield} from "../../../Forms/formsfield";
import EventHandler from "../../../Tools/eventhandler";
import Usageprofile from "../../../Models/Usageprofile";
import Listbuilder from "../../../Tools/listbuilder";
import Usageprofiledetailpage from "../Dayprofile/Detailpages/usageprofile";
import Interval from "../../../Models/Interval";
import usageprofile from "../Dayprofile/Detailpages/usageprofile";
import Bnb from "../../../Tools/bnb";

export default function usageprofiles({page}) {
    const eventhandler = new EventHandler()
    const dayprofiles = {}

    const [internalpage, setInternalpage] = useState(() => {
        return page
    });

    ///abbgleich raumtypen mit storage
    if (!eventhandler.projectdata['dayprofile']['usageprofiles']) {
        eventhandler.projectdata['dayprofile']['usageprofiles'] = []
    }

    if (eventhandler.projectdata.dayprofile.roomtypes) {
        eventhandler.projectdata.dayprofile.roomtypes.map((roomtype, key) => {
            if (roomtype && !eventhandler.projectdata['dayprofile']['usageprofiles'][roomtype.key]) {
                const entity = new Usageprofile({name: 'Lüftungskonzept für ' + roomtype.name, roomtype: roomtype.key});
                eventhandler.projectdata['dayprofile']['usageprofiles'][roomtype.key] = entity

                const valid = false;

                let map = {};
                map[key] = {
                    id: 'dayprofile.usageprofiles.usageprofile' + entity.roomtype,
                    title: entity.name,
                    valid: valid,
                    submenu_isopen: false
                }

                eventhandler.expandSidebarTree('dayprofile.usageprofiles', map, true)
            }
        })
    }

    const storageItemValidate = (entity) => {
        if (eventhandler.projectdata['dayprofile']['roomtypes'][entity.roomtype]) {
            return true
        }

        return false
    }

    const getEntityByIntervalKey = () => {
        const parts = page.split('.')
        let dump = null

        eventhandler.projectdata['dayprofile']['usageprofiles'].map((entity, roomtype) => {
            if (entity && entity.roomtype !== null) {
                const roomtype = 'usageprofile'+ entity.roomtype

                if (roomtype === parts[2]) {
                    dump = entity
                }
            }
        })

        return dump
    }

    const [entitytoedit, setEntitytoedit] = useState(() => {
        if (page !== 'dayprofile.usageprofiles') {
            return getEntityByIntervalKey()
        }

        return null
    });

    const [show, setShow] = useState(() => {
        if (page !== 'dayprofile.usageprofiles') {
            return 'edit'
        }

        return 'list'
    });

    if (!eventhandler.projectdata['dayprofile']['usageprofiles']) {
        eventhandler.projectdata['dayprofile']['usageprofiles'] = []
    }

    const handleSubmitCallback = (e,entityfromcall, type, form_is_valid) => {
        if (type === 'editstart') {
            eventhandler.handleSidebarEvent(e,{page: 'dayprofile.usageprofiles.usageprofile' + entityfromcall.roomtype})
        }
        else if (type === 'editend') {
            //sicherstellen das nach dem edit wieder die Liste angezeigt wird
            setShow('list')
            eventhandler.forceUpdate()

            //need custom validation
            //no time elapses, all childs must be valid

            //change sidebar navi
            {eventhandler.projectdata['dayprofile']['usageprofiles'].map((entity, key) => {
                if (entity && entity.key !== null) {
                    if (entitytoedit && entity.key === entitytoedit.key) {
                        try {
                            if (!eventhandler.sidebartree.dayprofile.childs.usageprofiles.childs[entity.roomtype].childs) {
                                //has to be minimum 1 intervall
                                form_is_valid = false
                            }

                            let all_intervals_are_valid = true;
                            for (const entry in eventhandler.sidebartree.dayprofile.childs.usageprofiles.childs[entity.roomtype].childs) {
                                if (eventhandler.sidebartree.dayprofile.childs.usageprofiles.childs[entity.roomtype].childs[entry].valid === false) {
                                    all_intervals_are_valid = false
                                }
                            }

                            if (all_intervals_are_valid === false) {
                                form_is_valid = false
                            }
                            else {
                                form_is_valid = true
                            }

                            eventhandler.sidebartree.dayprofile.childs.usageprofiles.childs[entity.roomtype].valid = form_is_valid
                        }
                        catch (e) {

                        }
                    }
                }
            })}
        }
    }

    if (page !== 'dayprofile.usageprofiles') {
        let entityByIntervalKey = getEntityByIntervalKey()
        if (entityByIntervalKey && entityByIntervalKey !== entitytoedit) {
            setEntitytoedit(entityByIntervalKey)
            setShow('edit')
            setInternalpage(page)
        }
    }
    else {
       if (internalpage !== 'edit' && entitytoedit) {
           setEntitytoedit(null)
           setShow('list')
           setInternalpage(page)
       }
    }

    const beforeList = () => {
        return (<div className={"m-page__description"}>
            <p>Definieren Sie die Lüftungskonzepte über den "Edit"-Befehl.</p>
            <p>&nbsp;</p>
            <p>Vorhandene Intervalle innerhalb der Lüftungskonzepte können geleert werden. Außerdem lassen sich Intervalle von einem Lüftungskonzept kopieren und in ein anderes einfügen. Bereits angelegte Intervalle werden dann überschrieben.
                Bitte beachten Sie: Die Öffnungszustände der betroffenen Fenster werden nicht übernommen.</p>

            {eventhandler.getCopyPaste('intervall') && (<div className={"m-page__importantnotice"}>Bitte überprüfen Sie bei allen eingefügten Intervallen alle Eingaben und übernehmen diesen erneut!</div>)}
        </div>)
    }

    return (<div className={"m-page"} key={eventhandler.uuid()}>
        <Form name={"dayprofile.usageprofiles"}>
            <Listbuilder
                key={eventhandler.uuid()}
                title={"Lüftungskonzept"}
                detailpage={Usageprofiledetailpage}
                storage={eventhandler.projectdata['dayprofile']['usageprofiles']}
                storageItemValidate={storageItemValidate}
                model={Usageprofile}
                next={"page.results"}
                prev={"page.dayprofile.relwindowroomtypes"}
                show={show}
                beforeList={beforeList}
                page={internalpage}
                contextmenu={eventhandler.projectdata.method !== 'bnb' && ['clearintervall','copyintervall', 'pasteintervall']}
                editCallback={handleSubmitCallback}
                entity={entitytoedit}
            />
        </Form>
    </div>)
}
