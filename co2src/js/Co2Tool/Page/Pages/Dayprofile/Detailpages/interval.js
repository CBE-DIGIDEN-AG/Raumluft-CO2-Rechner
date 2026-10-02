import React, { useState, useRef } from "react";
import {Form} from "../../../../Forms/form";
import {Formsfield} from "../../../../Forms/formsfield";
import EventHandler from "../../../../Tools/eventhandler";
import Raumtyp from "../../../../Models/Raumtyp";
import Interval from "../../../../Models/Interval";
import Formdata from "../../../../Tools/formdata";
import Bnb from "../../../../Tools/bnb";
import roomtype from "./roomtype";

export default function interval({entity, editCallback, page, parameter}) {
    const eventhandler = new EventHandler()
    const formdata = new Formdata()
    const bnbhandler = new Bnb()

    var parts = page.split('.')

    var parentkey = parts[2].replace('usageprofile', '')
    var parent = eventhandler.projectdata['dayprofile']['usageprofiles'][parentkey]

    var elements_to_trigger_for_default = []

    if (!entity) {
        var lastkey = parent.intervals[parent.intervals.length-1]

        entity = new Interval({
            name: '',
            key: parseInt(lastkey),
        })
        entity.isnew = true
    }

    const [elementtofocus, setElementtofocus] = useState(() => {
        return null
    });

    const [countTeacher, setCountTeacher] = useState(() => {
        if (eventhandler.projectdata.dayprofile.usageprofiles[parentkey].intervals[entity.key]) {
            if (eventhandler.projectdata.dayprofile.usageprofiles[parentkey].intervals[entity.key].count_teacher) {
                return eventhandler.projectdata.dayprofile.usageprofiles[parentkey].intervals[entity.key].count_teacher
            }
        }

        return 0
    });

    const [countStudents, setCountStudents] = useState(() => {
        if (eventhandler.projectdata.dayprofile.usageprofiles[parentkey].intervals[entity.key]) {
            if (eventhandler.projectdata.dayprofile.usageprofiles[parentkey].intervals[entity.key].count_students) {
                return eventhandler.projectdata.dayprofile.usageprofiles[parentkey].intervals[entity.key].count_students
            }
        }

        return 0
    });

    const [countPrestudents, setCountPrestudents] = useState(() => {
        if (eventhandler.projectdata.dayprofile.usageprofiles[parentkey].intervals[entity.key]) {
            if (eventhandler.projectdata.dayprofile.usageprofiles[parentkey].intervals[entity.key].count_prestudents) {
                return eventhandler.projectdata.dayprofile.usageprofiles[parentkey].intervals[entity.key].count_prestudents
            }
        }

        return 0
    });

    let emissionrateTeacher = 0
    let emissionrateStudents = 0
    let emissionratePrestudents = 0

    if (eventhandler.projectdata.dayprofile.usageprofiles[parentkey].intervals[entity.key]) {
        if (eventhandler.projectdata.dayprofile.usageprofiles[parentkey].intervals[entity.key].emissionrate_teacher) {
            emissionrateTeacher = parseFloat(eventhandler.projectdata.dayprofile.usageprofiles[parentkey].intervals[entity.key].emissionrate_teacher.replace(',', '.'))
            emissionrateTeacher = new Intl.NumberFormat("de-DE", {maximumFractionDigits: 2, minimumFractionDigits:2}).format(emissionrateTeacher * countTeacher)
        }

        if (eventhandler.projectdata.dayprofile.usageprofiles[parentkey].intervals[entity.key].emissionrate_students) {
            emissionrateStudents = parseFloat(eventhandler.projectdata.dayprofile.usageprofiles[parentkey].intervals[entity.key].emissionrate_students.replace(',', '.'))
            emissionrateStudents = new Intl.NumberFormat("de-DE", {maximumFractionDigits: 2, minimumFractionDigits:2}).format(emissionrateStudents * countStudents)
        }

        if (eventhandler.projectdata.dayprofile.usageprofiles[parentkey].intervals[entity.key].emissionrate_prestudents) {
            emissionratePrestudents = parseFloat(eventhandler.projectdata.dayprofile.usageprofiles[parentkey].intervals[entity.key].emissionrate_prestudents.replace(',', '.'))
            emissionratePrestudents = new Intl.NumberFormat("de-DE", {maximumFractionDigits: 2, minimumFractionDigits:2}).format(emissionratePrestudents * countPrestudents)
        }
    }

    const windowsgroupstodisplay = []

    for (const windowgroup of Object.entries(eventhandler.projectdata.dayprofile.roomtypes[parameter.roomtype].windowgroups)) {
        let windowstodisplay = []

        if (windowgroup[1] && windowgroup[1].windowdata) {
            const windowdata = windowgroup[1].windowdata[0]
            let window = eventhandler.projectdata.dayprofile.windowtypes[windowgroup[1].windowtypes]

            let openwindowcount = 0

            let optionsOpeningstate = [ {key: '',label: 'Bitte wählen'}]
            let optionsWindowcount = []
            for (var i = 0;i <= parseInt(windowdata.windowcount);i++) {
                optionsWindowcount.push(
                    {key: i,label: i}
                )
            }

            let count = parseInt(windowdata.windowcount)
            if (count) {
                openwindowcount += count
            }

            let varname_no = 'no_Fe'
            let varname_oz = 'oz_Fe'

            //einseitig
            if (eventhandler.projectdata.dayprofile.relwindowroomtypes[parameter.roomtype] && eventhandler.projectdata.dayprofile.relwindowroomtypes[parameter.roomtype].einseitig !== 'ja') {
                switch(windowgroup[1].aw_k) {
                    case ('0'):
                        varname_no += '_S'
                        varname_oz += '_S'
                        break
                    case ('90'):
                        varname_no += '_W'
                        varname_oz += '_W'
                        break
                    case ('180'):
                        varname_no += '_N'
                        varname_oz += '_N'
                        break
                    case ('270'):
                        varname_no += '_O'
                        varname_oz += '_O'
                        break
                }
            }

            varname_no += '_k'

            try {
                if (!eventhandler.projectdata.dayprofile.usageprofiles[parentkey].intervals[entity.key].windows) {
                    openwindowcount = 0
                }
                else if (!eventhandler.projectdata.dayprofile.usageprofiles[parentkey].intervals[entity.key].windows[0]) {
                    openwindowcount = 0
                }
                else if (!eventhandler.projectdata.dayprofile.usageprofiles[parentkey].intervals[entity.key].windows[0].group[windowgroup[0]]) {
                    openwindowcount = 0
                }
                else if (eventhandler.method() === '4108') {
                    openwindowcount = eventhandler.projectdata.dayprofile.usageprofiles[parentkey].intervals[entity.key].windows[0].group[windowgroup[0]][varname_no]
                }
                else {
                    openwindowcount = eventhandler.projectdata.dayprofile.usageprofiles[parentkey].intervals[entity.key].windows[0].group[windowgroup[0]]['Nw']
                }
            }
            catch(e) {
                openwindowcount = 0
            }

            const onOpenWindowChange = (e,name, type, value) => {
                openwindowcount = value

                eventhandler.store()
                eventhandler.forceUpdate()
            }

            let closedWindows = windowdata.windowcount - openwindowcount
            let ozvalue = eventhandler.getValue("dayprofile.usageprofiles."+parentkey+".intervals."+entity.key+".windows.0.group."+windowgroup[0] + "." + varname_oz)

            const onOZChange = (e,name, type, value) => {
                if (type === 'onchange') {
                    if (name === "dayprofile.usageprofiles."+parentkey+".intervals."+entity.key+".windows.0.group."+windowgroup[0] + "." + varname_oz) {
                        ozvalue = value
                        eventhandler.store()
                        eventhandler.forceUpdate()
                    }
                }
            }

            const x_k_schwing_helptext = 'Bei Auswahl des Schwingfensters wird bei der Berechnung der Fensteröffnungsflächen die Rahmendicke d nicht berücksichtigt (d=O).'
            const x_k_lamelle_helptext = 'Bei Auswahl des Lamellenfensters kann die Öffnungsweite nicht größer als die Lamellenhöhe sein.'

            switch (window.win_Typ) {
                case ('Schiebefenster'):
                    optionsOpeningstate.push({key: 'komplett',label: 'komplett geöffnet'})
                    optionsOpeningstate.push({key: 'schiebopened',label: 'Schiebefenster geöffnet'})
                    break;
                case ('Kipp-/Drehfenster'):
                    optionsOpeningstate.push({key: 'komplett',label: 'komplett geöffnet'})
                    optionsOpeningstate.push({key: 'kippopened',label: 'gekippt'})
                    optionsOpeningstate.push({key: 'drehopened',label: 'gedreht'})
                    break;
                case ('Schwingfenster'):
                    optionsOpeningstate.push({key: 'komplett',label: 'komplett geöffnet'})
                    optionsOpeningstate.push({key: 'schwingopened',label: 'Schwingflügel geöffnet'})
                    break;
                case ('Parallelabstellfenster'):
                    //optionsOpeningstate.push({key: 'komplett',label: 'komplett geöffnet'})
                    optionsOpeningstate.push({key: 'parallel',label: 'Parallelabstellung'})
                    //optionsOpeningstate.push({key: 'tilted',label: 'Parallelabstellfenster gekippt'})
                    //optionsOpeningstate.push({key: 'rotated',label: 'Parallelabstellfenster gedreht'})
                    break;
                case ('Lamellenfenster'):
                    optionsOpeningstate.push({key: 'komplett',label: 'komplett geöffnet'})
                    optionsOpeningstate.push({key: 'lamellopened',label: 'Lamellenfenster geöffnet'})
                    break;
                default:
            }

            //we have to set the default value
            if (eventhandler.getValue("dayprofile.usageprofiles."+parentkey+".intervals."+entity.key+".windows.0.group."+windowgroup[0]+".Nw") === undefined) {
                elements_to_trigger_for_default.push("dayprofile.usageprofiles."+parentkey+".intervals."+entity.key+".windows.0.group."+windowgroup[0]+".Nw")
            }

            windowstodisplay.push(
                <div className={"m-page__fieldsetinner"} key={eventhandler.uuid()}>
                    <h5 className={"m-form__legend"}>{window.name} - {window.win_Typ}</h5>

                    {eventhandler.method() === '4108' && (<Formsfield type={"select"} name={"dayprofile.usageprofiles."+parentkey+".intervals."+entity.key+".windows.0.group."+windowgroup[0] + "." + varname_no} options={optionsWindowcount} label={"Anzahl geöffneter Fenster"} value={openwindowcount} readonly={bnbhandler.readonly('no_editable', null, parameter.roomtype)} callback={onOpenWindowChange} />)}
                    {eventhandler.method() === '16798' && (<Formsfield type={"select"} name={"dayprofile.usageprofiles."+parentkey+".intervals."+entity.key+".windows.0.group."+windowgroup[0]+".Nw"} options={optionsWindowcount} label={"Anzahl geöffneter Fenster"} validator={"required"} callback={onOpenWindowChange} />)}

                    <div className={"m-form__subline"}>(geschlossene Fenster : {closedWindows})</div>

                    {openwindowcount > 0 && eventhandler.method() === '4108' && (<Formsfield type={"select"} name={"dayprofile.usageprofiles."+parentkey+".intervals."+entity.key+".windows.0.group."+windowgroup[0] + "." + varname_oz} options={optionsOpeningstate} label={"Öffnungszustand der geöffneten Fenster"} validator={"required"} readonly={bnbhandler.readonly('oz_editable', entity.windows[0].group[windowgroup[0]], parameter.roomtype)} callback={onOZChange} />)}

                    {ozvalue !== 'komplett' && openwindowcount > 0 && eventhandler.method() === '16798' && window.win_Typ ==='Klappfenster' && <Formsfield type={"text"} name={"dayprofile.usageprofiles."+parentkey+".intervals."+entity.key+".windows.0.group."+windowgroup[0]+".alpha_k"} label={"Öffnungswinkel des Fensters (zwischen 0 und 90 in °)"} readonly={bnbhandler.readonly('oz_editable', entity.windows[0].group[windowgroup[0]], parameter.roomtype)} validator={"required,floatrange(0|90)"} />}

                    {ozvalue !== 'komplett' && openwindowcount > 0 && eventhandler.method() === '4108' && window.win_Typ ==='Kipp-/Drehfenster' && <Formsfield type={"text"} name={"dayprofile.usageprofiles."+parentkey+".intervals."+entity.key+".windows.0.group."+windowgroup[0]+".alpha_k"} label={"Öffnungswinkel des Fensters (zwischen 0 und 90 in °)"} readonly={bnbhandler.readonly('oz_editable', entity.windows[0].group[windowgroup[0]], parameter.roomtype)} validator={"required,floatrange(0|90)"} />}
                    {ozvalue !== 'komplett' && openwindowcount > 0 && eventhandler.method() === '4108' && window.win_Typ ==='Schwingfenster' && <Formsfield type={"text"} name={"dayprofile.usageprofiles."+parentkey+".intervals."+entity.key+".windows.0.group."+windowgroup[0]+".x_k"} label={"Öffnungsweite des Schwingflügelfensters (in m)"} readonly={bnbhandler.readonly('oz_editable', entity.windows[0].group[windowgroup[0]], parameter.roomtype)} helptext={x_k_schwing_helptext}/>}
                    {ozvalue !== 'komplett' && openwindowcount > 0 && eventhandler.method() === '4108' && window.win_Typ ==='Lamellenfenster' && <Formsfield type={"text"} name={"dayprofile.usageprofiles."+parentkey+".intervals."+entity.key+".windows.0.group."+windowgroup[0]+".x_k"} label={"Öffnungsweite der Lamellen (in m)"} readonly={bnbhandler.readonly('oz_editable', entity.windows[0].group[windowgroup[0]],parameter.roomtype)} validator={"required"} helptext={x_k_lamelle_helptext}/>}
                    {ozvalue !== 'komplett' && openwindowcount > 0 && eventhandler.method() === '4108' && window.win_Typ ==='Schiebefenster' && <Formsfield type={"text"} name={"dayprofile.usageprofiles."+parentkey+".intervals."+entity.key+".windows.0.group."+windowgroup[0]+".x_k"} label={"Öffnungsweite des Schiebefensters (in m)"} readonly={bnbhandler.readonly('oz_editable', entity.windows[0].group[windowgroup[0]], parameter.roomtype)} validator={"required"} />}
                </div>
            )
        }

        windowsgroupstodisplay.push(
            <div className={"m-page__fieldsetinner"} key={eventhandler.uuid()}>
                <div className={"m-page__fieldset"}>
                    {(windowstodisplay.length > 0) && (<h2>Fenstergruppe {parseInt(windowgroup[0])}</h2>)}

                    {windowstodisplay.map((window) => {
                        return window
                    })}
                </div>
            </div>
        )
    }

    let Bal = eventhandler.getValue("dayprofile.usageprofiles." + parentkey + ".intervals." + entity.key + ".Bal")

    const handleBal = (e,name, type, value) => {
        if (type === 'onchange') {
            if (name === 'dayprofile.usageprofiles.'+parentkey+'.intervals.'+entity.key+'.Bal') {
                Bal = parseFloat(value)
                eventhandler.store()
                eventhandler.forceUpdate()
            }
        }
    }

    const onChange = (e,name, type, value) => {
        var expected_name = 'dayprofile.usageprofiles.'+parentkey+'.intervals.'+entity.key
        var expected_names = [
            expected_name+'.emissionrate_teacher',
            expected_name+'.emissionrate_students',
            expected_name+'.emissionrate_prestudents',
            expected_name+'.count_teacher',
            expected_name+'.count_students',
            expected_name+'.count_prestudents',
            expected_name+'.type_teacher',
            expected_name+'.type_students',
            expected_name+'.type_prestudents'
        ]

        if (type === 'onblur') {
            if (expected_names.includes(name)) {
                //eventhandler.forceUpdate()
            }
        }

        if (type === 'onchange') {
            //setElementtofocus(name)

            if (expected_names.includes(name)) {
                eventhandler.store()
            }

            if (name === 'dayprofile.usageprofiles.'+parentkey+'.intervals.'+entity.key+'.count_teacher') {
                setCountTeacher(value)
                setElementtofocus(name)
            }

            if (name === 'dayprofile.usageprofiles.'+parentkey+'.intervals.'+entity.key+'.count_students') {
                setCountStudents(value)
                setElementtofocus(name)
            }

            if (name === 'dayprofile.usageprofiles.'+parentkey+'.intervals.'+entity.key+'.count_prestudents') {
                setCountPrestudents(value)
                setElementtofocus(name)
            }

            if (name === 'dayprofile.usageprofiles.'+parentkey+'.intervals.'+entity.key+'.type_teacher') {
                entity.type_teacher = value

                if (value === 'low') {
                    entity.emissionrate_teacher = '21,6'
                }
                else if (value === 'medium') {
                    entity.emissionrate_teacher = '21,6'
                }
                else if (value === 'high') {
                    entity.emissionrate_teacher = '21,6'
                }
                else {
                    entity.emissionrate_teacher = '20'
                }

                eventhandler.store()
                eventhandler.forceUpdate()
            }

            if (name === 'dayprofile.usageprofiles.'+parentkey+'.intervals.'+entity.key+'.type_students') {
                entity.type_students = value

                if (value === 'low') {
                    entity.emissionrate_students = '18,9'
                }
                else if (value === 'medium') {
                    entity.emissionrate_students = '22,0'
                }
                else if (value === 'high') {
                    entity.emissionrate_students = '43,5'
                }
                else {
                    entity.emissionrate_students = '20'
                }

                eventhandler.store()
                eventhandler.forceUpdate()
            }

            if (name === 'dayprofile.usageprofiles.'+parentkey+'.intervals.'+entity.key+'.type_prestudents') {
                entity.type_presstudents = value

                if (value === 'low') {
                    entity.emissionrate_prestudents = '15,6'
                }
                else if (value === 'medium') {
                    entity.emissionrate_prestudents = '19,4'
                }
                else if (value === 'high') {
                    entity.emissionrate_prestudents = '33,6'
                }
                else {
                    entity.emissionrate_prestudents = '20'
                }

                eventhandler.store()
                eventhandler.forceUpdate()
            }
        }
    }

    //4108 gelb
    //16798 rot

    const type_helptext = (<div className={"m-helptext"}>
        <div className={"m-helptext__legend"}>CO<sub>2</sub>-Volumenstrom in l/(h Person) nach Jahrgangsstufe und Raumnutzung</div>
        <table>
            <thead>
                <tr>
                    <th><p>Aktivitätsstufe</p></th>
                    <th><p>Raumnutzung, regulär</p></th>
                    <th><p>Jahrgangsstufe 1 bis 4<span>CO<sub>2</sub> Volumenstrom in l/(h Person)</span></p></th>
                    <th><p>Jahrgangsstufe 5 bis 13<span>CO<sub>2</sub> Volumenstrom in l/(h Person)</span></p></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><p>Gering, stehend/ sitzend</p></td>
                    <td><p>Unterrichtsraum</p></td>
                    <td><p>15,6</p></td>
                    <td><p>18,9</p></td>
                </tr>
                <tr>
                    <td><p>mittel, stehend/ sitzend</p></td>
                    <td><p>Aufenthaltsraum</p></td>
                    <td><p>19,4</p></td>
                    <td><p>22,0</p></td>
                </tr>
                <tr>
                    <td><p>Erhöht, stehend</p></td>
                    <td><p>Bewegungsraum</p></td>
                    <td><p>33,6</p></td>
                    <td><p>43,5</p></td>
                </tr>
            </tbody>
        </table>
    </div>)

    if (eventhandler.getValue("dayprofile.usageprofiles."+parentkey+".intervals."+entity.key+".count_teacher") === undefined) {
        elements_to_trigger_for_default.push("dayprofile.usageprofiles."+parentkey+".intervals."+entity.key+".count_teacher")
    }
    if (eventhandler.getValue("dayprofile.usageprofiles."+parentkey+".intervals."+entity.key+".count_students") === undefined) {
        elements_to_trigger_for_default.push("dayprofile.usageprofiles."+parentkey+".intervals."+entity.key+".count_students")
    }
    if (eventhandler.getValue("dayprofile.usageprofiles."+parentkey+".intervals."+entity.key+".count_prestudents") === undefined) {
        elements_to_trigger_for_default.push("dayprofile.usageprofiles."+parentkey+".intervals."+entity.key+".count_prestudents")
    }

    React.useEffect(() => {
        elements_to_trigger_for_default.map((selector) => {
            const element = document.querySelector('select[name="'+selector+'"]');
            if (element) {
                element.value=element.selectedOptions[0].getAttribute('value')
                var event = document.createEvent("HTMLEvents");
                event.initEvent("change", true, true);
                element.dispatchEvent(event);
            }

            const inputelement = document.querySelector('input[name="'+selector+'"]');
            if (inputelement) {
                var inputevent = document.createEvent("HTMLEvents");
                inputevent.initEvent("focusout", true, true);
                inputelement.dispatchEvent(inputevent);
            }
        })
    })

    return (<div className={"m-page"} key={eventhandler.uuid()}>
        <Form name={"dayprofile.usageprofiles." + parentkey + "." + entity.key}>
            <div className={"m-page__fields"}>
                <Formsfield type={"text"} value={entity.name} name={"dayprofile.usageprofiles."+parentkey+".intervals."+entity.key+".name"} label={"Bezeichnung/Name"} validator={"required"}/>
                <Formsfield type={"text"} value={entity.duration} name={"dayprofile.usageprofiles."+parentkey+".intervals."+entity.key+".duration"} label={"Dauer (in Minuten)"} validator={"required,integer,integersteps(1)"}/>

                <div className={"m-form__helpcontainer"}>
                    <legend className={"m-form__legend"} data-has-help={"true"}>Raumbelegung und CO₂-Emission</legend>

                </div>

                <div className={"m-form__intervallcountcontainer"}>
                    <Formsfield type={"text"} defalutValue={entity.count_teacher}
                                name={"dayprofile.usageprofiles." + parentkey + ".intervals." + entity.key + ".count_teacher"}
                                label={"Anzahl der Personen (Erwachsene)"} callback={onChange}
                                value={"0"}
                                validator={"integer"}
                                setFocus={elementtofocus === "dayprofile.usageprofiles." + parentkey + ".intervals." + entity.key + ".count_teacher"}
                                readonly={bnbhandler.readonly('persons_editable',  null, parameter.roomtype)}
                            >
                        {(countTeacher > 0)  && (
                            <div>
                                <Formsfield type={"select"} value={entity.type_teacher} name={"dayprofile.usageprofiles."+parentkey+".intervals."+entity.key+".type_teacher"} options={formdata.interval.type} label={"Aktivitätsstufe"} validator={"required"} callback={onChange} readonly={bnbhandler.readonly()} helptext={type_helptext} />
                                <Formsfield type={"text"} defalutValue={entity.emissionrate_teacher}
                                            name={"dayprofile.usageprofiles." + parentkey + ".intervals." + entity.key + ".emissionrate_teacher"}
                                            label={"Emissionsrate Atemluft je Person (in l/h)"}
                                            validator={"required,float"} callback={onChange}
                                            readonly={(entity.type_teacher !== 'custom' || bnbhandler.readonly())}/>
                            </div>
                        )}
                    </Formsfield>
                    {(countTeacher > 0)  && (<span className={"m-form__description"}>CO₂-Volumenstrom: {emissionrateTeacher} (in l) für {countTeacher} Lehrkräfte/Erwachsene</span>)}
                </div>

                <div className={"m-form__intervallcountcontainer"}>
                    <Formsfield type={"text"} defalutValue={entity.count_students}
                                name={"dayprofile.usageprofiles." + parentkey + ".intervals." + entity.key + ".count_students"}
                                label={"Anzahl der Personen der Jahrgangsstufe 5-13"} callback={onChange}
                                value={"0"}
                                validator={"integer"}
                                setFocus={elementtofocus === "dayprofile.usageprofiles." + parentkey + ".intervals." + entity.key + ".count_students"}
                                readonly={bnbhandler.readonly('persons_editable', null, parameter.roomtype)}
                            >
                        {(countStudents > 0)  && (<div>
                                <Formsfield type={"select"} value={entity.type_students} name={"dayprofile.usageprofiles."+parentkey+".intervals."+entity.key+".type_students"} options={formdata.interval.type} label={"Aktivitätsstufe"} validator={"required"} callback={onChange} readonly={bnbhandler.readonly()} helptext={type_helptext} />
                                <Formsfield type={"text"} defalutValue={entity.emissionrate_students}
                                            name={"dayprofile.usageprofiles." + parentkey + ".intervals." + entity.key + ".emissionrate_students"}
                                            label={"Emissionsrate Atemluft je Person (in l/h)"}
                                            validator={"required,float"}
                                            callback={onChange}
                                            readonly={(entity.type_students !== 'custom'  || bnbhandler.readonly())}/>
                            </div>)}
                    </Formsfield>
                    {(countStudents > 0)  && (<span className={"m-form__description"}>CO₂-Volumenstrom: {emissionrateStudents} (in l) für {countStudents} Schüler/Studenten</span>)}
                </div>



                <div className={"m-form__intervallcountcontainer"}>
                    <Formsfield type={"text"} defalutValue={entity.duration}
                                name={"dayprofile.usageprofiles." + parentkey + ".intervals." + entity.key + ".count_prestudents"}
                                label={"Anzahl der Personen der Jahrgangsstufe 1-4"} callback={onChange}
                                value={"0"}
                                validator={"integer"}
                                setFocus={elementtofocus === "dayprofile.usageprofiles." + parentkey + ".intervals." + entity.key + ".count_prestudents"}
                                readonly={bnbhandler.readonly('persons_editable', null, parameter.roomtype)}
                            >
                        {(countPrestudents > 0)  && (<div>
                            <Formsfield type={"select"} value={entity.type_prestudents} name={"dayprofile.usageprofiles."+parentkey+".intervals."+entity.key+".type_prestudents"} options={formdata.interval.type} label={"Aktivitätsstufe"} validator={"required"} callback={onChange} readonly={bnbhandler.readonly()} helptext={type_helptext} />
                            <Formsfield type={"text"} defalutValue={entity.name}
                                        name={"dayprofile.usageprofiles." + parentkey + ".intervals." + entity.key + ".emissionrate_prestudents"}
                                        label={"Emissionsrate Atemluft je Person (in l/h)"}
                                        validator={"required,float"}
                                        callback={onChange}
                                        readonly={(entity.type_prestudents !== 'custom'  || bnbhandler.readonly())}/>
                        </div>)}
                    </Formsfield>
                    {(countPrestudents > 0)  && (<span className={"m-form__description"}>CO₂-Volumenstrom: {emissionratePrestudents} (in l) für {countPrestudents} Schüler/Studenten</span>)}
                </div>

                {(
                    eventhandler.projectdata.dayprofile.roomtypes[parameter.roomtype].Anl === 'mechanical' ||
                    eventhandler.projectdata.dayprofile.roomtypes[parameter.roomtype].Anl === 'hybrid'
                ) && (
                    <div>
                        <legend className={"m-form__legend"}>Mechanische Lüftung</legend>
                        <Formsfield type={"text"} defalutValue={entity.name}
                                    value={"0"}
                                    name={"dayprofile.usageprofiles." + parentkey + ".intervals." + entity.key + ".q_v_mech"}
                                    label={"Luftvolumenstrom der Lüftungsanlage (in m³/h)"}
                                    validator={"required,float"}/>
                        <Formsfield type={"select"} defalutValue={entity.name}
                                    name={"dayprofile.usageprofiles." + parentkey + ".intervals." + entity.key + ".Bal"}
                                    options={formdata.interval.Bal}
                                    label={"Ist die mechanische Lüftungsanlage balanciert (Zuluft = Abluft)?"}
                                    validator={"required"} callback={handleBal} />

                        {Bal !== 'ja' && <Formsfield type={"text"} defalutValue={entity.name}
                                    name={"dayprofile.usageprofiles." + parentkey + ".intervals." + entity.key + ".nETA"}
                                    label={"Die Summe über die Zuluftwechsel der mechanischen Lüftung und der aus benachbarten Zonen überströmenden Luft (in 1/h)"} validator={"required,float"} value={"0"}/>}
                        {Bal !== 'ja' && <Formsfield type={"text"} defalutValue={entity.name} name={"dayprofile.usageprofiles."+parentkey+".intervals."+entity.key+".nSUP"} label={"Die Summe über die Abluftwechsel der mechanischen Lüftung und der aus benachbarten Zonen abgesaugten Luft (in 1/h)"} validator={"required,float"} value={"0"}/>}
                        {Bal !== 'ja' && <Formsfield type={"text"} defalutValue={entity.name} name={"dayprofile.usageprofiles."+parentkey+".intervals."+entity.key+".tv_mech"} label={"Die tägliche Betriebsdauer der Lüftungsanlage (in h)"} validator={"required,float"} value={"0"}/>}
                    </div>
                )}

                {eventhandler.projectdata.dayprofile.roomtypes[parameter.roomtype].Anl !== 'mechanical' &&
                    <div>
                        <legend className={"m-form__legend"}>Öffnungszustände der geöffneten Fenster</legend>
                        <div className={"m-page__description"}>Geschlossene Fenster müssen nicht extra angegeben werden. Fenster deren Eingabe hier nicht erfolgt ist, sind immer automatisch als geschlossen anzusehen.</div>

                        {windowsgroupstodisplay.map((windowgroup) => {
                            return windowgroup
                        })}
                    </div>
                }
            </div>

            <div className={"actions"}>
                <Formsfield type={"submit"} name={"page.dayprofile.usageprofiles." + parts[2]} value={"next"} label={"Übernehmen"} callback={editCallback} />
            </div>
        </Form>
    </div>)
}
