import React, { useState, useRef } from "react";
import {Form} from "../../../../Forms/form";
import {Formsfield} from "../../../../Forms/formsfield";
import EventHandler from "../../../../Tools/eventhandler";
import Usageprofile from "../../../../Models/Usageprofile";
import Listbuilder from "../../../../Tools/listbuilder";
import Intervaldetailpage from "./interval";
import Interval from "../../../../Models/Interval";
import Formdata from "../../../../Tools/formdata";
import moment from 'moment'
import 'moment/locale/de'
import roomtype from "./roomtype";
import Bnb from "../../../../Tools/bnb";

export default function usageprofile({entity, editCallback, page}) {
    const eventhandler = new EventHandler()
    const formdata = new Formdata()
    const bnbhandler = new Bnb()

    let startDate = moment(new Date('2023-01-01T'+eventhandler.projectdata.dayprofile.usageprofiles[entity.roomtype].start+':00'))
    let endDate = startDate
    let processedElements = []
    const dayprofiles = {}

    if (!eventhandler.projectdata['dayprofile']['usageprofiles']) {
        eventhandler.projectdata['dayprofile']['usageprofiles'] = []
    }

    const getEntityByIntervalKey = () => {
        var parts = page.split('.')
        var dump = null

        eventhandler.projectdata['dayprofile']['usageprofiles'][entity.roomtype].intervals.map((entity, roomtype) => {
            if (entity && entity.key !== null) {
                var key = 'interval'+ entity.key

                if (key === parts[3]) {
                    dump = entity
                }
            }
        })

        return dump
    }

    //cleanup intervals in case of gaps and wrong order
    const cleanUpIntervals = []
    eventhandler.projectdata.dayprofile.usageprofiles[entity.roomtype].intervals.map((interval, intervalkey) => {
        if (interval) {
            interval.key = cleanUpIntervals.length
            cleanUpIntervals.push(interval)
        }
    })

    if (eventhandler.projectdata.dayprofile.usageprofiles[entity.roomtype].intervals.toString() !== cleanUpIntervals.toString()) {
        //set new cleanUpIntervals
        eventhandler.projectdata.dayprofile.usageprofiles[entity.roomtype].intervals = cleanUpIntervals

        //set new tree navigation
        eventhandler.removeAllChildsFromSidebarTree('dayprofile.usageprofiles.'+entity.roomtype)
        let map = {};
        eventhandler.projectdata.dayprofile.usageprofiles[entity.roomtype].intervals.map((interval, intervalkey) => {
            map[interval.key] = {
                id: 'dayprofile.usageprofiles.usageprofile' + entity.roomtype + '.interval' + interval.key,
                title: interval.name,
                valid: false,
                submenu_isopen: false
            }
        })

        eventhandler.expandSidebarTree('dayprofile.usageprofiles.'+entity.roomtype, map, true)

        eventhandler.store()
        eventhandler.forceUpdate()
    }
    //end cleanup

    const onChange = (e,name, type, value) => {
        if (type === 'onchange') {
            if (name === 'dayprofile.usageprofiles.'+entity.key+'.type') {
                entity.type = value

                eventhandler.store()
                eventhandler.forceUpdate()
            }
        }
    }

    const onChangeDayProfilesConfirm = (e, profile, datastorage) => {
        setConfirm(null)

        profile.count_teacher = '0'
        profile.count_students = '0'
        profile.count_prestudents = '0'

        if (datastorage['bnb.' + entity.roomtype + '.count_teacher']) {
            profile.count_teacher = datastorage['bnb.' + entity.roomtype + '.count_teacher']
        }

        if (datastorage['bnb.' + entity.roomtype + '.count_students']) {
            profile.count_students = datastorage['bnb.' + entity.roomtype + '.count_students']
        }

        if (datastorage['bnb.' + entity.roomtype + '.count_prestudents']) {
            profile.count_prestudents = datastorage['bnb.' + entity.roomtype + '.count_prestudents']
        }
        
        if (datastorage['bnb.' + entity.roomtype + '.emissionrate_teacher']) {
            profile.emissionrate_teacher = datastorage['bnb.' + entity.roomtype + '.emissionrate_teacher']
        }

        if (datastorage['bnb.' + entity.roomtype + '.emissionrate_students']) {
            profile.emissionrate_students = datastorage['bnb.' + entity.roomtype + '.emissionrate_students']
        }

        if (datastorage['bnb.' + entity.roomtype + '.emissionrate_prestudents']) {
            profile.emissionrate_prestudents = datastorage['bnb.' + entity.roomtype + '.emissionrate_prestudents']
        }

        if (!profile.windowdefinitions) {
            profile.windowdefinitions = {}
        }

        let roomtype = eventhandler.projectdata.dayprofile.roomtypes[entity.roomtype]


        if (!profile.windowdefinitions[roomtype.key]) {
            profile.windowdefinitions[roomtype.key] = {}
        }

        const anl = roomtype.Anl
        if (anl === 'mechanical' || anl === 'hybrid') {
            profile.windowdefinitions[roomtype.key].q_v_mech = eventhandler.projectdata.bnb[roomtype.key].q_v_mech
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
                        //let prefix = roomtype.key + '.' + windowgroup[0] + '.' + window.key
                        profile.windowdefinitions[roomtype.key] = eventhandler.projectdata.bnb[roomtype.key]
                    }
                })
            }
        }

        bnbhandler.changeDayProfile(profile, entity.roomtype)
    }

    const onChangeDayProfilesCancel = (e, value) => {
        setConfirm(null)

        //rest changes
        eventhandler.store()
        eventhandler.forceUpdate()
    }

    const handleBnbSetButton = (e) => {
        setConfirm(bnbhandler.renderDayProfilForm(bnbhandler.getProfile(entity.roomtype), onChangeDayProfilesCancel, onChangeDayProfilesConfirm, eventhandler.projectdata.dayprofile.roomtypes[entity.roomtype]))
    }

    const [confirm, setConfirm] = useState(() => {
        if (eventhandler.activeEntityForPopups) {
            let hashToCompareLeft = eventhandler.createHash(JSON.stringify(eventhandler.activeEntityForPopups))
            let hashToCompareRight = eventhandler.createHash(JSON.stringify(eventhandler.projectdata.dayprofile.roomtypes[entity.roomtype]))

            if (hashToCompareLeft === hashToCompareRight) {
                return bnbhandler.renderDayProfilForm(bnbhandler.getProfile(entity.roomtype), onChangeDayProfilesCancel, onChangeDayProfilesConfirm, eventhandler.projectdata.dayprofile.roomtypes[entity.roomtype])
            }
        }

        return ''
    });

    const onChangeDayProfiles = (e,name, type, value) => {
        if (type === 'onchange') {
            if (name === 'bnbprofile_id_'+entity.roomtype && dayprofiles[e.target.value]) {
                const profile = dayprofiles[e.target.value]

                //store profile
                bnbhandler.setProfile(profile, entity.roomtype)
                
                setConfirm(bnbhandler.renderDayProfilForm(bnbhandler.getProfile(entity.roomtype), onChangeDayProfilesCancel, onChangeDayProfilesConfirm, eventhandler.projectdata.dayprofile.roomtypes[entity.roomtype]))
            }
        }
    }

    const handleSubmitCallback = (e,entityfromcall, type, form_is_valid=false) => {
        if (type === 'editstart') {
            eventhandler.handleSidebarEvent(e,{page: 'dayprofile.usageprofiles.usageprofile' + entity.roomtype + '.interval' + entityfromcall.key})
        }
        else if (type === 'editend') {
            //sicherstellen das nach dem edit wieder die Liste angezeigt wird
            setShow('list')

            //change sidebar navi (add)
            {eventhandler.projectdata['dayprofile']['usageprofiles'][entity.roomtype]['intervals'].map((interval, key) => {
                if (interval && interval.key !== null) {
                    var valid = form_is_valid
                    var submenu_isopen = false

                    if (
                        eventhandler.sidebartree.dayprofile.childs.usageprofiles.childs
                        && eventhandler.sidebartree.dayprofile.childs.usageprofiles.childs[entity.roomtype]
                        && eventhandler.sidebartree.dayprofile.childs.usageprofiles.childs[entity.roomtype].childs
                        && eventhandler.sidebartree.dayprofile.childs.usageprofiles.childs[entity.roomtype].childs[key]
                    ) {
                        valid = eventhandler.sidebartree.dayprofile.childs.usageprofiles.childs[entity.roomtype].childs[key].valid
                        submenu_isopen = eventhandler.sidebartree.dayprofile.childs.usageprofiles.childs[entity.roomtype].childs[key].submenu_isopen
                    }

                    let map = {};

                    //4th level intervall itself
                    //map = {};
                    map[key] = {
                        id: 'dayprofile.usageprofiles.usageprofile' + entity.roomtype + '.interval' + interval.key,
                        title: interval.name,
                        valid: valid,
                        submenu_isopen: submenu_isopen
                    }

                    eventhandler.expandSidebarTree('dayprofile.usageprofiles.'+entity.roomtype, map, true)
                }
            })}

            eventhandler.forceUpdate()
        }
        else if (type === 'removeitem') {
            setShow('list')
            eventhandler.forceUpdate()

            var key = entityfromcall.key

            let map = {};
            map[key] = {
                id: 'dayprofile.usageprofiles.usageprofile' + entity.roomtype + '.interval.' + entityfromcall.key,
            }

            eventhandler.removeFromSidebarTree('dayprofile.usageprofiles.'+entity.roomtype, map, true)
        }
        else if (type === 'afterdragdrop') {
            {eventhandler.projectdata['dayprofile']['usageprofiles'][entity.roomtype]['intervals'].map((interval, key) => {
                if (interval.key !== null) {
                    var valid = form_is_valid
                    var submenu_isopen = false

                    if (
                        eventhandler.sidebartree.dayprofile.childs.usageprofiles.childs
                        && eventhandler.sidebartree.dayprofile.childs.usageprofiles.childs[entity.roomtype]
                        && eventhandler.sidebartree.dayprofile.childs.usageprofiles.childs[entity.roomtype].childs
                        && eventhandler.sidebartree.dayprofile.childs.usageprofiles.childs[entity.roomtype].childs[key]
                    ) {
                        valid = eventhandler.sidebartree.dayprofile.childs.usageprofiles.childs[entity.roomtype].childs[key].valid
                        submenu_isopen = eventhandler.sidebartree.dayprofile.childs.usageprofiles.childs[entity.roomtype].childs[key].submenu_isopen
                    }

                    let map = {};


                    //4th level intervall itself
                    //map = {};
                    map[key] = {
                        id: 'dayprofile.usageprofiles.usageprofile' + entity.roomtype + '.interval' + interval.key,
                        title: interval.name,
                        valid: valid,
                        submenu_isopen: submenu_isopen
                    }

                    eventhandler.expandSidebarTree('dayprofile.usageprofiles.'+entity.roomtype, map, true)
                }
            })}

            eventhandler.store()
            eventhandler.forceUpdate()
        }
    }

    const [entitytoedit, setEntitytoedit] = useState(() => {
        if (page !== 'dayprofile.usageprofiles.usageprofile' + entity.roomtype) {
            return getEntityByIntervalKey()
        }

        return null
    });

    const [show, setShow] = useState(() => {
        if (page !== 'dayprofile.usageprofiles.usageprofile' + entity.roomtype) {
            let entityByIntervalKey = getEntityByIntervalKey()

            if (entityByIntervalKey && entityByIntervalKey !== entitytoedit) {
                setEntitytoedit(entityByIntervalKey)
                setShow('edit')
                setInternalpage(page)
            }

            return 'edit'
        }

        return 'list'
    });

    const [shophelp, setShophelp] = useState(() => {
        return false
    });

    const handleHelp = (e, type) => {
        if (shophelp === false) {
            setShophelp(true)
        }
        else {
            setShophelp(false)
        }
    }

    const beforeList = () => {
        const eventhandler = new EventHandler()
        const formdata = new Formdata()

        let nutzungstypdisplay = ''
        let windowdisplay = []

        formdata.roomtypes.ventilation.map((item) => {
            if (item.key === eventhandler.projectdata.dayprofile.roomtypes[entity.roomtype].ventilation) {
                nutzungstypdisplay = item.label
            }
        })

        for (const windowgroup of Object.entries(eventhandler.projectdata.dayprofile.roomtypes[entity.roomtype].windowgroups)) {
            if (!windowgroup[1]) {
                continue
            }

            let window = eventhandler.projectdata.dayprofile.windowtypes[windowgroup[1].windowtypes]
            if (window) {
                windowdisplay.push(window.name)
            }
        }

        return (
            <div className={"m-intervalllist__before"}>
                {nutzungstypdisplay &&
                    <div className={"m-intervalllist__nutzungstype"}>Art der Lüftung: {nutzungstypdisplay}</div>}
                <div className={"m-intervalllist__co2concentration"}>Kohlendioxidkonzentration außen: {eventhandler.projectdata.dayprofile.cAUL} ppm
                </div>
                {windowdisplay != '' && (<div className={"m-intervalllist__co2concentration"}>zugewiesene Fenstertypen: {windowdisplay.join(', ')}</div>)}

                <h3 className={"m-intervalllist__subtitle"}>
                    <div>Zeitliche Nutzungs- und Lüftungsintervalle
                        <div className={"m-form__help"}>
                            <div className={"m-form__helpicon"} onClick={handleHelp}></div>
                            <div className={"m-form__helpinner"} aria-expanded={shophelp}>
                                <h3>Zeitliche Nutzungs- und Lüftungsintervalle</h3>
                                Unter einem zeitlichen Nutzungs- und Lüftungsintervall werden Zeitintervalle verstanden, bei denen sich weder die Personenzahl, die Emissionsraten noch die Öffnungszustände der Fenster ändern (z. B. eine Unterrichtsstunde oder Pause). Die Änderung einer der genannten Größen definiert ein neues zeitlichen Nutzungs- und Lüftungsintervall.
                                <span className={"m-form__helpcloser"} onClick={handleHelp}></span>
                            </div>
                        </div>
                    </div>

                </h3>

                <div className={"m-page__description"}>Fügen Sie der Liste Lüftungsintervalle hinzu definieren Sie diese
                    über den "Edit"-Befehl. Außerdem können Sie vorhandene Intervalle duplizieren, löschen oder neu
                    anordnen.
                </div>

                <Formsfield type={"time"} name={"dayprofile.usageprofiles." + entity.roomtype + ".start"}
                            value={"00:00"} label={"Startuhrzeit"} validator={"required,time"}/>
            </div>
        )
    }

    const afterList = () => {
        return (
            <div className={"m-intervalllist__after"}>
                <Formsfield type={"time"} name={"dayprofile.usageprofiles." + entity.roomtype + ".end"} readonly={true} value={endDate.format('HH:mm')} label={"Endzeit"} validator={"required,integer"}/>
            </div>
        )
    }

    let Anl = eventhandler.getValue("dayprofile.roomtypes."+[entity.roomtype]+".Anl")

    const itemCallback = (entityfromcall) => {
        let count_teacher = 0
        let count_students = 0
        let count_prestudents = 0

        if (entityfromcall.count_teacher) {
            count_teacher = entityfromcall.count_teacher
        }

        if (entityfromcall.count_students) {
            count_students = entityfromcall.count_students
        }

        if (entityfromcall.count_prestudents) {
            count_prestudents = entityfromcall.count_prestudents
        }

        let people = parseInt(count_students)+parseInt(count_teacher)+parseInt(count_prestudents)
        let date = startDate.format('HH:mm')

        if (processedElements.includes(entityfromcall.key) === true) {
            startDate = startDate.add(entityfromcall.duration, 'minutes')
        }
        else {
            processedElements.push(entityfromcall.key)
            endDate = endDate.add(entityfromcall.duration, 'minutes')
        }

        let opencount = 0
        if (Anl !== 'mechanical' && entityfromcall.windows) {
            let windowgroup = entityfromcall.windows[0]
            
            if (windowgroup) {
                for (const window of Object.entries(eventhandler.projectdata.dayprofile.roomtypes[entity.roomtype].windowgroups)) {
                    let varname_no = 'no_Fe'
                    let varname_oz = 'oz_Fe'
                    
                    if (window[1] && window[1].aw_k  && eventhandler.projectdata.dayprofile.relwindowroomtypes[entity.roomtype].einseitig !== 'ja') {
                        switch (window[1].aw_k) {
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

                    if (eventhandler.method() === '16798') {
                        varname_no = 'Nw'
                    }

                    Object.entries(windowgroup.group).map((windowsinglegroup, windowsinglegroupkey) => {
                        if (windowsinglegroup[0] === window[0] && windowsinglegroup[1][varname_no]) {
                            opencount += parseInt(windowsinglegroup[1][varname_no])
                        }
                    })
                }
            }
        }
        
        return (<ul className={"m-intervalllist__item"}>
            {date && (<li>ab {date} Uhr</li>)}
            {entityfromcall.duration && (<li>{entityfromcall.duration} min</li>)}
            {Anl !== 'mechanical' && (<li>{opencount} Fenster geöffnet</li>)}
            {(<li>{people} Personen</li>)}
        </ul>)
    }

    const dayprofilesOptions = []

    if (eventhandler.projectdata.method === 'bnb') {
        //get all nutzungsprofile from file
        function importUsageProfiles (r) {
            r.keys().forEach(key => {
                const profile = r(key)

                dayprofiles[profile.id] = profile

                dayprofilesOptions.push(
                    {
                        key: profile.id,
                        label: profile.name,
                        label_additional: profile.description
                    })
            })
        }

        importUsageProfiles(require.context('../../../../Usageprofiles/', true, /\.json$/))
    }

    return (<div className={"m-page"} key={eventhandler.uuid()}>
        {confirm}

        {eventhandler.projectdata.method === 'bnb' && (
            <div className={"m-page__container"}><div className={"m-page__fields"}>
                <div className={"m-page__description"}>
                    <div className={"m-page__block"}>
                        <Formsfield type={"radios"} name={"bnbprofile_id_" + entity.roomtype} options={dayprofilesOptions} label={"Tagesprofile auswählen"} callback={onChangeDayProfiles} />
                        {bnbhandler.getProfile(entity.roomtype) && bnbhandler.getProfile(entity.roomtype)['name'] && (
                            <div className={"m-list__bnbsetprofile"}>
                                <span>Sie haben das Tagesprofil "{bnbhandler.getProfile(entity.roomtype)['name']}" ausgewählt.</span>
                                <a href={"#"} onClick={handleBnbSetButton}>Profil erneut vervollständigen</a>
                            </div>
                        )}
                    </div></div>
            </div></div>
        )}

        {eventhandler.projectdata.method !== 'bnb' && (<Form name={"dayprofile.usageprofiles.usageprofile." + entity.roomtype} name_alt={"dayprofile.usageprofiles." + entity.roomtype}>
            <h1>Lüftungsintervall</h1>

            <Listbuilder
                key={eventhandler.uuid()}
                page={page}
                title={entity.name}
                layout={"large"}
                detailpage={Intervaldetailpage}
                beforeList={beforeList}
                afterList={afterList}
                itemCallback={itemCallback}
                storage={eventhandler.projectdata['dayprofile']['usageprofiles'][entity.roomtype]['intervals']}
                parameter={{roomtype: entity.roomtype}}
                model={Interval}
                //next={"page.dayprofile.usageprofiles"}
                show={show}
                setShow={setShow}
                addlabel={"Intervall hinzufügen"}
                contextmenu={['delete', 'clone']}
                editCallback={handleSubmitCallback}
                entity={entitytoedit}
                dragdrop={true}
                classNames={{listimtem: 'm-list__itemusageprofile'}}
                createlabel={"neues Intervall"}
            />

            <br />
            {eventhandler.requireddisclaimer()}

            <div className={"actions"}>
                {show === 'list' && (<Formsfield type={"submit"} name={"page.dayprofile.usageprofiles"} value={"next"} label={"Übernehmen"} callback={editCallback} />)}
            </div>
        </Form>)}
    </div>)
}
