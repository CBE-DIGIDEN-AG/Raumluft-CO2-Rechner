import React, { useState, useRef } from "react";
import {Form} from "../../../Forms/form";
import {Formsfield} from "../../../Forms/formsfield";
import EventHandler from "../../../Tools/eventhandler";
import Bnb from "../../../Tools/bnb";
export default function confirm({profile, onChangeDayProfilesConfirm, onChangeDayProfilesCancel, roomtype}) {
    const eventhandler = new EventHandler()
    const bnbhandler = new Bnb()
    let maxSteps = 0
    let currentStep = 1
    let StepOffset = 0
    const fieldsToValidate = [
        'bnb.' + roomtype.key + '.count_teacher',
        'bnb.' + roomtype.key + '.count_students',
        'bnb.' + roomtype.key + '.count_prestudents'
    ]

    if (!profile) {
        return
    }

    if (!eventhandler.projectdata.bnb) {
        eventhandler.projectdata.bnb = {}
    }

    if (!eventhandler.projectdata.bnb[roomtype.key]) {
        eventhandler.projectdata.bnb[roomtype.key] = {}
    }

    let hasToStored = false
    if (!eventhandler.projectdata.bnb[roomtype.key].count_prestudents) {
        eventhandler.projectdata.bnb[roomtype.key].count_prestudents = 0
        hasToStored = true
    }

    if (!eventhandler.projectdata.bnb[roomtype.key].count_teacher) {
        eventhandler.projectdata.bnb[roomtype.key].count_teacher = 0
        hasToStored = true
    }

    if (!eventhandler.projectdata.bnb[roomtype.key].count_students) {
        eventhandler.projectdata.bnb[roomtype.key].count_students = 0
        hasToStored = true
    }

    if (!eventhandler.projectdata.bnb[roomtype.key].emissionrate_teacher) {
        eventhandler.projectdata.bnb[roomtype.key].emissionrate_teacher = 0
        hasToStored = true
    }

    if (!eventhandler.projectdata.bnb[roomtype.key].emissionrate_students) {
        eventhandler.projectdata.bnb[roomtype.key].emissionrate_students = 0
        hasToStored = true
    }

    if (!eventhandler.projectdata.bnb[roomtype.key].emissionrate_prestudents) {
        eventhandler.projectdata.bnb[roomtype.key].emissionrate_prestudents = 0
        hasToStored = true
    }

    if (hasToStored === true) {
        eventhandler.store()
    }

    const [storage, setStorage] = useState(() => {
        var count_teacher = 'bnb.' + roomtype.key + '.count_teacher'
        var count_students = 'bnb.' + roomtype.key + '.count_students'
        var count_prestudents = 'bnb.' + roomtype.key + '.count_prestudents'

        var emissionrate_teacher = 'bnb.' + roomtype.key + '.emissionrate_teacher'
        var emissionrate_students = 'bnb.' + roomtype.key + '.emissionrate_students'
        var emissionrate_prestudents = 'bnb.' + roomtype.key + '.emissionrate_prestudents'

        let out = {}

        out[count_teacher] = eventhandler.getValue(count_teacher)
        out[count_students] = eventhandler.getValue(count_students)
        out[count_prestudents] = eventhandler.getValue(count_prestudents)
        out[emissionrate_teacher] = eventhandler.getValue(emissionrate_teacher)
        out[emissionrate_students] = eventhandler.getValue(emissionrate_students)
        out[emissionrate_prestudents] = eventhandler.getValue(emissionrate_prestudents)

        return out
    });

    const [step, setStep] = useState(() => {
        if (eventhandler.projectdata.bnb && eventhandler.projectdata.bnb.currentStep) {
            return eventhandler.projectdata.bnb.currentStep
        }

        return 0
    });

    const [formerrors, setFormerrors] = useState(() => {
        return {}
    });

    const [ozvalue, setOzvalue] = useState(() => {
        const defaultValue = {}

        for (const windowgroup of Object.entries(roomtype.windowgroups)) {
            if (windowgroup && windowgroup[1] && (typeof windowgroup[1].windowtypes === 'string')) {
                let windowtypes = windowgroup[1].windowtypes
                if (typeof windowtypes === 'string') {
                    windowtypes = [parseInt(windowgroup[1].windowtypes)]
                }

                windowtypes.map((windowkey) => {
                    var window = eventhandler.projectdata.dayprofile.windowtypes[windowkey]

                    if (window && window.hasOwnProperty('key')) {
                        let prefix = roomtype.key + '.' + windowgroup[0] + '.' + window.key

                        if (eventhandler.projectdata.bnb[roomtype.key] &&
                            eventhandler.projectdata.bnb[roomtype.key][windowgroup[0]] &&
                            eventhandler.projectdata.bnb[roomtype.key][windowgroup[0]][window.key]) {
                            defaultValue["bnb."+prefix+".oz"] = eventhandler.projectdata.bnb[roomtype.key][windowgroup[0]][window.key].oz
                        }
                        else {
                            defaultValue["bnb."+prefix+".oz"] = ''
                        }
                    }
                })
            }
        }

        return defaultValue
    });

    const StepMarkups = []

    const changeStep = (step) => {
        setStep(step)
    }

    const onChangeDayProfilesCancelIntern = (e, value) => {
        eventhandler.projectdata.bnb.currentStep = 0

        onChangeDayProfilesCancel(e, value)
    }

    const onChangeDayProfilesConfirmIntern = (e, profile, storage) => {
        //clear
        eventhandler.projectdata.bnb.currentStep = 0

        const form = eventhandler.forms['dayprofile.usageprofiles.daypprofiles.editor']

        //validate every field
        let all_fields_are_valid = true
        fieldsToValidate.map((field) => {
            if (form) {
                Object.values(form).map(formfield => {
                    if (formfield.name === field) {
                        const field_is_valid = eventhandler.validateForm([formfield])

                        if (field_is_valid === false) {
                            //show error
                            all_fields_are_valid = false

                            eventhandler.formerrors[field] = 'Feld ' + formfield.label
                            formerrors[field] = 'Feld ' + formfield.label
                            setFormerrors(formerrors)
                        }
                        else {
                            //delete eventhandler.formerrors[field]
                            if (formerrors[field]) {
                                delete formerrors[field]
                            }
                            if (eventhandler.formerrors[field]) {
                                delete eventhandler.formerrors[field]
                            }
                        }
                    }
                })
            }
        })

        setFormerrors(formerrors)
        eventhandler.store()
        eventhandler.forceUpdate()

        if (Object.keys(formerrors).length === 0) {
            eventhandler.setActiveEntityForPopups(null)

            onChangeDayProfilesConfirm(e, profile, storage)
        }
        else {
            eventhandler.setActiveEntityForPopups(roomtype)
        }
    }

    if (!storage['bnb.windows']) {
        storage['bnb.windows'] = []
    }

    if (!eventhandler.projectdata.bnb[roomtype.key]) {
        eventhandler.projectdata.bnb[roomtype.key] = {}
    }

    if (roomtype.Anl === 'mechanical' || roomtype.Anl === 'hybrid') {
        maxSteps++
        fieldsToValidate.push('bnb.'+roomtype.key+'.q_v_mech')

        eventhandler.projectdata.bnb[roomtype.key].q_v_mech = eventhandler.getValue('bnb.'+roomtype.key+'.q_v_mech')
    }

    for (const windowgroup of Object.entries(roomtype.windowgroups)) {
        if (windowgroup && windowgroup[1] && (typeof windowgroup[1].windowtypes === 'string')) {
            let windowtypes = windowgroup[1].windowtypes
            if (typeof windowtypes === 'string') {
                windowtypes = [parseInt(windowgroup[1].windowtypes)]
            }

            windowtypes.map((windowkey) => {
                var window = eventhandler.projectdata.dayprofile.windowtypes[windowkey]

                if (window && window.hasOwnProperty('key')) {
                    maxSteps++
                    let prefix = roomtype.key + '.' + windowgroup[0] + '.' + window.key

                    storage['bnb.'+prefix+'.oz'] =  eventhandler.getValue('bnb.'+prefix+'.oz')
                    storage['bnb.'+prefix+'.alpha_k'] = eventhandler.getValue('bnb.'+prefix+'.alpha_k')
                    storage['bnb.'+prefix+'.x_k'] = eventhandler.getValue('bnb.'+prefix+'.x_k')

                    if (!eventhandler.projectdata.bnb[roomtype.key][windowgroup[0]]) {
                        eventhandler.projectdata.bnb[roomtype.key][windowgroup[0]] = {}
                    }

                    if (!eventhandler.projectdata.bnb[roomtype.key][windowgroup[0]][window.key]) {
                        eventhandler.projectdata.bnb[roomtype.key][windowgroup[0]][window.key] = {}
                    }

                    if (fieldsToValidate.includes('bnb.'+prefix+'.oz') === false) {
                        fieldsToValidate.push('bnb.'+prefix+'.oz')
                    }

                    if (fieldsToValidate.includes('bnb.'+prefix+'.alpha_k') === false && window.win_Typ === 'Kipp-/Drehfenster') {
                        fieldsToValidate.push('bnb.'+prefix+'.alpha_k')
                    }
                    else if (fieldsToValidate.includes('bnb.'+prefix+'.x_k') === false) {
                        fieldsToValidate.push('bnb.'+prefix+'.x_k')
                    }
                }
            })
        }
    }


    //hat eine variante eine hybride oder mechanische lüftung?
    let hasMechanical = false
    if (roomtype.Anl === 'mechanical' || roomtype.Anl === 'hybrid') {
        hasMechanical = true
    }

    if (profile.emissionrate_editable === true) {
        fieldsToValidate.push('bnb.' + roomtype.key + '.emissionrate_teacher')
        fieldsToValidate.push('bnb.' + roomtype.key + '.emissionrate_students')
        fieldsToValidate.push('bnb.' + roomtype.key + '.emissionrate_prestudents')
        maxSteps++
        StepOffset = 1
    }


    const onChange = (e, name, type, value) => {
        //eventhandler.projectdata
        storage[name] = value
        setStorage(storage)

        eventhandler.store()
    }

    const onChangeOZ =  (e, name, type, value) => {
        //eventhandler.projectdata
        storage[name] = value
        setStorage(storage)

        ozvalue[name] = value
        setOzvalue(ozvalue)

        currentStep = step

        //we need here to know the current dstep for display othe right tab on reload
        eventhandler.projectdata.bnb.currentStep = currentStep

        eventhandler.store()
        eventhandler.setActiveEntityForPopups(roomtype)
        eventhandler.forceUpdate()
    }

    maxSteps++
    StepMarkups.push((<div key={eventhandler.uuid()} className={"m-list__confirmstep"} data-is-show={step===0}>
        <h2>Schritt {step + 1} / {maxSteps} - Personenanzahl</h2>
        <strong>Legen Sie im ersten Schritt die Personen in den Räumen fest</strong>
            {profile.show_teacher === true && (
                <Formsfield type={"text"} name={"bnb."+roomtype.key+".count_teacher"} label={"Anzahl der Personen (Erwachsene / Altersstufe 13-18 Jahre)"} value={"0"} validator={"integer"} callback={onChange}></Formsfield>
            )}
            {profile.show_students === true && (
                <Formsfield type={"text"} name={"bnb."+roomtype.key+".count_students"} label={"Anzahl der Personen der Altersstufe 6-12 Jahre"} value={"0"} validator={"integer"} callback={onChange}></Formsfield>
            )}
            {profile.show_prestudents === true && (
                <Formsfield type={"text"} name={"bnb."+roomtype.key+".count_prestudents"} label={"Anzahl der Personen der Altersstufe 1-5 Jahre"} value={"0"} validator={"integer"} callback={onChange}></Formsfield>
            )}
        </div>
    ))

    //alle fenster holen
    if (roomtype.Anl === 'mechanical' || roomtype.Anl === 'hybrid') {
        StepMarkups.push((<div key={eventhandler.uuid()} className={"m-list__confirmstep"} data-is-show={step===(currentStep+StepOffset)}>
                <h2>Schritt {step + 1} / {maxSteps} - Lüftungsanlage</h2>
                <strong>Variante: {roomtype.name} (mechanische Lüftung)</strong>
                <strong>Legen Sie hier die Werte der Lüftungsanlage fest</strong>

                <Formsfield type={"text"}
                            value={"0"}
                            name={"bnb."+roomtype.key+".q_v_mech"}
                            label={"Luftvolumenstrom der Lüftungsanlage (in m³/h)"}
                            validator={"required,float"} callback={onChange} />
            </div>
        ))

        currentStep++
    }

    for (const windowgroup of Object.entries(roomtype.windowgroups)) {
        if (windowgroup && windowgroup[1] && (typeof windowgroup[1].windowtypes === 'string')) {
            let windowtypes = windowgroup[1].windowtypes
            if (typeof windowtypes === 'string') {
                windowtypes = [parseInt(windowgroup[1].windowtypes)]
            }

            windowtypes.map((windowkey) => {
                var window = eventhandler.projectdata.dayprofile.windowtypes[windowkey]

                if (window && window.hasOwnProperty('key')) {
                    const optionsOpeningstate = []

                    optionsOpeningstate.push({key: '', label: 'Bitte wählen'})

                    switch (window.win_Typ) {
                        case ('Schiebefenster'):
                            optionsOpeningstate.push({key: 'komplett', label: 'komplett geöffnet'})
                            optionsOpeningstate.push({key: 'schiebopened', label: 'Schiebefenster geöffnet'})
                            break;
                        case ('Kipp-/Drehfenster'):
                            optionsOpeningstate.push({key: 'komplett', label: 'komplett geöffnet'})
                            optionsOpeningstate.push({key: 'kippopened', label: 'gekippt'})
                            optionsOpeningstate.push({key: 'drehopened', label: 'gedreht'})
                            break;
                        case ('Schwingfenster'):
                            optionsOpeningstate.push({key: 'komplett', label: 'komplett geöffnet'})
                            optionsOpeningstate.push({key: 'schwingopened', label: 'Schwingflügel geöffnet'})
                            break;
                        case ('Parallelabstellfenster'):
                            optionsOpeningstate.push({key: 'parallel', label: 'Parallelabstellung'})
                            break;
                        case ('Lamellenfenster'):
                            optionsOpeningstate.push({key: 'komplett', label: 'komplett geöffnet'})
                            optionsOpeningstate.push({key: 'lamellopened', label: 'Lamellenfenster geöffnet'})
                            break;
                        default:
                    }

                    let optionsWindowcount = []
                    const windowdata = windowgroup[1].windowdata[0]
                    for (var i = 0;i <= parseInt(windowdata.windowcount);i++) {
                        optionsWindowcount.push(
                            {key: i,label: i}
                        )
                    }

                    //hier muss rein roomtype / groupid
                    let prefix = roomtype.key + '.' + windowgroup[0] + '.'+window.key

                    StepMarkups.push((
                        <div key={eventhandler.uuid()} className={"m-list__confirmstep"} data-is-show={step===(currentStep+StepOffset)}>
                            <h2>Schritt {step + 1} / {maxSteps} - Öffnungszustände</h2>
                            <strong>Variante: {roomtype.name} / Fenstergruppe {parseInt(windowgroup[0])}</strong>
                            <strong>{window.name} ({window.type})</strong>

                            <Formsfield type={"select"} name={"bnb."+prefix+".oz"} options={optionsOpeningstate}
                                        label={"Öffnungszustand der geöffneten Fenster"} validator={"required"} callback={onChangeOZ} />
                            {window.win_Typ === 'Kipp-/Drehfenster' && ozvalue["bnb."+prefix+".oz"] !== 'komplett' &&
                                <Formsfield type={"text"} name={"bnb."+prefix+".alpha_k"} label={"Öffnungswinkel des Fensters (zwischen 0 und 90 in °)"} validator={"required,floatrange(0|90)"} callback={onChange} />}
                            {window.win_Typ === 'Schwingfenster' && ozvalue["bnb."+prefix+".oz"] !== 'komplett' &&
                                <Formsfield type={"text"} name={"bnb."+prefix+".x_k"} label={"Öffnungsweite des Schwingflügelfensters (in m)"}
                                            validator={"required"} callback={onChange} />}
                            {window.win_Typ === 'Lamellenfenster' && ozvalue["bnb."+prefix+".oz"] !== 'komplett' &&
                                <Formsfield type={"text"} name={"bnb."+prefix+".x_k"} label={"Öffnungsweite der Lamellen (in m)"}
                                            validator={"required"} callback={onChange} />}
                            {window.win_Typ === 'Schiebefenster' && ozvalue["bnb."+prefix+".oz"] !== 'komplett' &&
                                <Formsfield type={"text"} name={"bnb."+prefix+".x_k"} label={"Öffnungsweite des Schiebefensters (in m)"}
                                            validator={"required"} callback={onChange} />}

                            <Formsfield type={"select"} name={"bnb."+prefix+".no"} options={optionsWindowcount} label={"Anzahl geöffneter Fenster"} callback={onChange} />
                        </div>
                    ))

                    currentStep++
                }
            })
        }
    }



    if (profile.emissionrate_editable === true) {
        let teacher_helptext = ''
        let students_helptext = ''
        let prestudents_helptext = ''

        if (profile.helptext_emissionrate_teacher) {
            teacher_helptext = profile.helptext_emissionrate_teacher
        }

        if (profile.helptext_emissionrate_students) {
            students_helptext = profile.helptext_emissionrate_students
        }

        if (profile.helptext_emissionrate_prestudents) {
            prestudents_helptext = profile.helptext_emissionrate_prestudents
        }

        StepMarkups.push((<div key={eventhandler.uuid()} className={"m-list__confirmstep"} data-is-show={step===1}>
                <h2>Schritt {step + 1} / {maxSteps} - Emissionsrate</h2>
                <strong>Legen Sie hier die Emissionsrate Atemluft je Person fest</strong>

                {profile.show_teacher === true && (
                    <Formsfield type={"text"} name={"bnb."+roomtype.key+".emissionrate_teacher"} label={"Emissionsrate (Erwachsene / Altersstufe 13-18 Jahre) je Person (in l/h)"} value={"0"} validator={"float"} callback={onChange} helptext={teacher_helptext}></Formsfield>
                )}
                {profile.show_students === true && (
                    <Formsfield type={"text"} name={"bnb."+roomtype.key+".emissionrate_students"} label={"Emissionsrate (Altersstufe 6-12 Jahre) je Person (in l/h)"} value={"0"} validator={"float"} callback={onChange} helptext={students_helptext}></Formsfield>
                )}
                {profile.show_prestudents === true && (
                    <Formsfield type={"text"} name={"bnb."+roomtype.key+".emissionrate_prestudents"} label={"Emissionsrate (Altersstufe 1-5 Jahre) je Person (in l/h)"} value={"0"} validator={"float"} callback={onChange} helptext={prestudents_helptext}></Formsfield>
                )}
            </div>
        ))
    }

    return (<div className={"m-list__confirm"} key={eventhandler.uuid()}>
        <div className={"m-list__confirminner"} key={eventhandler.uuid()}>
            <div key={eventhandler.uuid()} className={"m-list__confirmerrors"}>
                {Object.values(eventhandler.formerrors).length > 0 && (<strong>Eingabe in den folgenden Feldern prüfen und neu zuweisen:</strong>)}
                {Object.values(eventhandler.formerrors).map(error => {
                    return (<div key={eventhandler.uuid()}>{error}</div>)
                })}
            </div>

            <h1>{profile.name}</h1>
            
            <Form name={"dayprofile.usageprofiles.daypprofiles.editor"}>
                {StepMarkups}
            </Form>

            <div className={"m-list__confirmactions"} data-type={"bnb"}>
                {step > 0 && (<a href={"#"} data-type={"back"} onClick={(e) => changeStep((step - 1))}>zurück</a>)}
                {step < (maxSteps - 1) && (
                    <a href={"#"} data-type={"forward"} onClick={(e) => changeStep((step + 1))}>weiter</a>)}
                {step === maxSteps || <a href={"#"} data-type={"set"}
                                         onClick={(e) => onChangeDayProfilesConfirmIntern(e, profile, storage)}>Tagesprofil
                    zuweisen</a>}
            </div>

            <a href={"#"} className={"m-list__confirmcloser"} data-type={"cancel"}
               onClick={(e) => onChangeDayProfilesCancelIntern(e)}>Abbrechen</a>
        </div>
    </div>)
}