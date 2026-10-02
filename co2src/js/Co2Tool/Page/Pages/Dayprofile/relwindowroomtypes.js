import React, { useState, useRef } from "react";
import {Form} from "../../../Forms/form";
import {Formsfield} from "../../../Forms/formsfield";
import EventHandler from "../../../Tools/eventhandler";
import Formdata from "../../../Tools/formdata";

export default function relwindowroomtypes({page}) {
    const eventhandler = new EventHandler()
    const formdata = new Formdata()

    const roomtypes = []
    //const windowgroups = []

    const onWindowtypes = (e,name, type, value) => {
        if (type === 'onchange') {
            eventhandler.projectdata.dayprofile.roomtypes.map((roomtype, key) => {
                if (roomtype) {
                    for (const windowgroup of Object.entries(roomtype.windowgroups)) {
                        if (roomtype && name === "dayprofile.roomtypes." + roomtype.key + ".windowgroups."+ windowgroup[0] +".windowtypes") {
                            //console.log(roomtype)
                            //console.log(eventhandler.projectdata.dayprofile.roomtypes[roomtype.key].windowgroups[windowgroup[0]].windowdata)
                            eventhandler.store()
                            eventhandler.forceUpdate()
                        }
                    }
                }
            })
        }
    }

    const einseitig_helptext = 'Bei Querlüftung (zweiseitiger Lüftung) gilt, dass keine wesentlichen inneren Strömungshindernisse (das heißt z.B. Innentüren sind offen bei vollständig geöffneten Fenstern oder Innentüren sind schwellenlos mit Unterschnitt bei gekippten Fenstern) vorhanden sind; andernfalls können nur einzelne Räume berechnet werden.'

    const addWindowGroupHandler = (e, roomtype) => {
        if (!eventhandler.projectdata.dayprofile.roomtypes[roomtype.key].windowgroups) {
            eventhandler.projectdata.dayprofile.roomtypes[roomtype.key].windowgroups = {}
        }

        var windowgroupsexists = Object.keys(eventhandler.projectdata.dayprofile.roomtypes[roomtype.key].windowgroups)
        var lastkey = parseInt(windowgroupsexists[windowgroupsexists.length-1])

        if (!lastkey) {
            lastkey = 0
        }

        //console.log(eventhandler.projectdata.dayprofile.roomtypes[roomtype.key].windowgroups)

        eventhandler.projectdata.dayprofile.roomtypes[roomtype.key].windowgroups[lastkey+1] = {
            name: 'Fenstergruppe ' + (lastkey + 1),
            windowtypes: ''
        }

        eventhandler.store()
        eventhandler.forceUpdate()
    }

    const removeWindowGroupHandler = (e, roomtype, windowgroup) => {
        console.log(eventhandler.projectdata.dayprofile.roomtypes[roomtype.key].windowgroups)


        delete eventhandler.projectdata.dayprofile.roomtypes[roomtype.key].windowgroups[windowgroup]

        console.log(eventhandler.projectdata.dayprofile.roomtypes[roomtype.key].windowgroups)
        eventhandler.store()
        eventhandler.forceUpdate()
    }

    //console.log(eventhandler.projectdata.project.method)
    //4108 gelb
    //16798 rot

    let windowoptions = []
    windowoptions.push({key: '', label: 'Bitte wählen'})
    if (eventhandler.projectdata.dayprofile.windowtypes) {
        eventhandler.projectdata.dayprofile.windowtypes.map((window) => {
            if (window) {
                windowoptions.push({key: window.key, label: window.name})
            }
        })
    }

    eventhandler.projectdata.dayprofile.roomtypes.map((roomtype, key) => {
        if (!roomtype) {
            return
        }

        let einseitig = eventhandler.getValue("dayprofile.relwindowroomtypes."+roomtype.key+".einseitig")
        const windowgroupstodisplay = []

        if (windowoptions) {
            for (const windowgroup of Object.entries(roomtype.windowgroups)) {
                if (windowgroup && windowgroup[1] && (typeof windowgroup[1].windowtypes === 'string')) {
                    let windowtypes = windowgroup[1].windowtypes
                    if (typeof windowtypes === 'string') {
                        windowtypes = [parseInt(windowgroup[1].windowtypes)]
                    }

                    windowgroupstodisplay.push(
                        <div className={"m-page__fieldsetinner"} key={eventhandler.uuid()}>
                            <h5 className={"m-form__legend"}>Fenstergruppe {parseInt(windowgroup[0])}
                                {windowgroup[0] > 0 && <span className={"m-intervalllist__removewindowtype"} onClick={(e) => removeWindowGroupHandler(e, roomtype, windowgroup[0])}></span>}
                            </h5>

                            <div key={eventhandler.uuid()} className={"m-page__windowfieldset"}>
                                <h4>{window.name}</h4>

                                <Formsfield type={"select"} name={"dayprofile.roomtypes." + roomtype.key + ".windowgroups."+windowgroup[0]+".windowtypes"} options={windowoptions} callback={onWindowtypes} label={"Vorhandene Fenstertypen in Fenstergruppe"} validator={"required"} />
                                {einseitig === 'nein' && (<Formsfield type={"select"} name={"dayprofile.roomtypes." + roomtype.key + ".windowgroups."+windowgroup[0]+".aw_k"} options={formdata.relwindowroomtypes.aw_k} label={"Himmelsrichtung der Fenstergruppe"} validator={"required"} />)}

                                {
                                    windowtypes.map((windowkey) => {
                                        var window = eventhandler.projectdata.dayprofile.windowtypes[windowkey]

                                        if (window && window.hasOwnProperty('key')) {
                                            return (
                                                <div key={eventhandler.uuid()} className={"m-page__windowfieldset"}>
                                                    <h4>{window.name}</h4>

                                                    {einseitig !== 'ja' && eventhandler.method() === '16798' && <Formsfield type={"select"} options={formdata.relwindowroomtypes.Bw_k} name={"dayprofile.roomtypes." + roomtype.key + ".windowgroups."+windowgroup[0]+".windowdata.0.Bw_k"} label={"Winkel des Fensters"} validator={"required,float"} />}
                                                    {eventhandler.method() === '16798' && <Formsfield type={"text"} name={"dayprofile.roomtypes." + roomtype.key + ".windowgroups."+windowgroup[0]+".windowdata.0.hw_path_k"} label={"Mittlere Höhe des Fensters in Bezug auf die Bodenhöhe der Lüftungszone in m"} validator={"required,float"} />}

                                                    {eventhandler.method() === '4108' && <Formsfield type={"text"} name={"dayprofile.roomtypes." + roomtype.key + ".windowgroups."+windowgroup[0]+".windowdata.0.h_Bruest_k"} label={"Brüstungshöhe (in m)"} validator={"required,float"} />}

                                                    <Formsfield type={"text"} name={"dayprofile.roomtypes." + roomtype.key + ".windowgroups."+windowgroup[0]+".windowdata.0.windowcount"} label={"Anzahl der Fenster"} validator={"required,integer"} />
                                                </div>
                                            )
                                        }
                                    })
                                }
                            </div>
                        </div>
                    )
                }
            }

            const onEinseitigChange = (e,name, type, value) => {
                einseitig = value

                eventhandler.store()
                eventhandler.forceUpdate()
            }

            if (roomtype.Anl !== 'mechanical') {
                roomtypes.push(<div key={eventhandler.uuid()} className={"m-page__fieldset"}>
                    <legend>
                        {roomtype.name} – Fenster zuweisen
                        {roomtype.Anl === 'mechanical' && (<span> - mechanische Lüftung</span>)}
                    </legend>

                    {eventhandler.method() === '4108' && <Formsfield type={"text"} name={"dayprofile.relwindowroomtypes." + roomtype.key + ".H_Grund_Zone"} label={"mittlere Höhe der Lüftungszone über Erdreichniveau (in m)"} validator={"required,float"}/>}

                    <Formsfield type={"select"} name={"dayprofile.relwindowroomtypes." + roomtype.key + ".einseitig"} options={formdata.relwindowroomtypes.einseitig} label={"Tritt einseitige Lüftung auf?"} validator={"required"} helptext={einseitig_helptext} callback={onEinseitigChange} />

                    {windowgroupstodisplay.map((windowgrouptodisplay) => {
                        return windowgrouptodisplay
                    })}

                    {roomtype.Anl !== 'mechanical' && (<span className={"m-intervalllist__addwindowtype"} key={eventhandler.uuid()} onClick={(e) => addWindowGroupHandler(e, roomtype)}>Fenstergruppe hinzufügen</span>)}
                </div>)
            }
        }

        if (windowgroupstodisplay.length === 0) {
            addWindowGroupHandler(null, roomtype)
        }
    })

    return (<div className={"m-page"}>
        <Form name={"dayprofile.relwindowroomtypes"}>
            <div className={"m-page__fields"}>
                <h2>Fensterangaben im Raum</h2>

                {roomtypes.map((roomtype) => {
                    return roomtype
                })}
            </div>

            {eventhandler.requireddisclaimer()}

            <div className={"actions"}>
                <Formsfield type={"submit"} name={"page.dayprofile.roomtypes"} value={"back"} label={"zurück"} />
                <Formsfield type={"submit"} name={"page.dayprofile.usageprofiles"} value={"next"} label={"Übernehmen und weiter"} />
            </div>
        </Form>
    </div>)
}
