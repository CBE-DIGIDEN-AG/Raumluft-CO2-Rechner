import React, { useState, useRef } from "react";
import {Formsfield} from "../../Forms/formsfield"
import {Form} from "../../Forms/form"
import EventHandler from "../../Tools/eventhandler";
import projectresume from "./projectresume";
import Bnb from "../../Tools/bnb";

export default function projektangaben() {
    const eventhandler = new EventHandler()
    const bnbhandler = new Bnb()

    const handleContinueProject = (e) => {
        eventhandler.handleSidebarEvent(e,{page: 'projectresume'})
    }

    const [confirm, setConfirm] = useState(() => {
        return ''
    });

    const [methodbefore, setMethodbefore] = useState(() => {
        return eventhandler.getValue('project.method')
    });

    const handleOnMethodChangeConfirm = (e, value) => {
        setConfirm(null)

        const resetValidOnTree = (tree) => {
            Object.entries(tree).map((page) => {
                page[1].valid = false
                page[1].unsaved = true
                //page[1].form = null //TODO sinnvoll?
                //console.log(page[1].form )

                if (page[1].childs) {
                    //has subpages
                    resetValidOnTree(page[1].childs)
                }
            })
        }

        resetValidOnTree(eventhandler.sidebartree)
        setMethodbefore(value)

        if (eventhandler.projectdata.dayprofile && eventhandler.projectdata.dayprofile.windowtypes) {
            eventhandler.projectdata.dayprofile.windowtypes.map((window, windowkey) => {
                if (window) {
                    eventhandler.projectdata.dayprofile.windowtypes[windowkey].h_k = ''
                }
            })
        }
        
        eventhandler.store()
        eventhandler.forceUpdate()
    }
    const handleOnMethodChangeCancel = (e, value) => {
        setConfirm(null)

        //rest changes
        eventhandler.projectdata.project.method = methodbefore
        eventhandler.store()
        eventhandler.forceUpdate()
    }

    const onMethodChange = (e,name, type, value) => {
        if (type === 'onchange' && methodbefore) {
            if (name === 'project.method') {
                setConfirm((<div className={"m-list__confirm"}>
                    <div className={"m-list__confirminner"}>
                        <strong></strong>
                        <div className={"m-list__confirmactions"}>
                            <a href={"#"} data-type={"create"} onClick={(e) => handleOnMethodChangeConfirm(e, value)}>Berechnungsmethode wechseln</a>
                            <a href={"#"} data-type={"cancel"} onClick={(e) => handleOnMethodChangeCancel(e, value)}>Abbrechen</a>
                        </div>

                        <strong></strong>

                        <strong>Ein nachträglicher Wechsel der DIN-Norm führt zu fehlerhaften Berechnungen. Bei einem Wechsel müssen alle bestehenden Einträge erneut übernommen und validiert werden.
                        </strong>
                    </div>
                </div>))
            }
        }
    }

    const options = []
    let projectdescroption = 'Beschreibung'
    let projektname_fieldnotice = 'Maximal 30 Zeichen'

    if (eventhandler.projectdata.method === 'free') {
        options.push({key: '',label: 'Bitte wählen'})
        options.push({key: '4108',label: 'DIN/TS 4108-8'})
        options.push({key: '16798',label: 'DIN EN 16798'})
    }
    else {
        options.push({key: '4108',label: 'DIN/TS 4108-8'})

        if (!eventhandler.projectdata.project) {
            eventhandler.projectdata.project = {}
        }

        eventhandler.projectdata.project.method = '4108'
        projectdescroption = 'BNB Projektnummer und Bearbeiter/in'
        projektname_fieldnotice = 'Maximal 30 Zeichen, wird als Dateiname beim speichern benutzt.'
    }

    return (<div className={"m-page"}>
        {confirm}
        <Form name={"projektangaben"}>
            <div className={"m-page__fields"}>
                <h1>Projektangaben</h1>

                <Formsfield type={"text"} name={"project.projektname"} label={"Projektbezeichnung"} validator={"required,length(30)"} />
                <span className={"m-page__fieldnotice"}>{projektname_fieldnotice}</span>
                <Formsfield type={"text"} name={"project.building"} label={"Gebäudebezeichnung"} required={false}/>
                <Formsfield type={"text"} name={"project.projectdescroption"} label={projectdescroption} validator={bnbhandler.validator('required')} />
                <Formsfield type={"text"} name={"project.date"} label={"Datum"} />
                <Formsfield type={"text"} name={"project.zipcode"} label={"Postleitzahl"} />
                <Formsfield type={"text"} name={"project.city"} label={"Ort"} required={false}/>

                <div className={"m-page__fieldgroup"}>
                    <Formsfield type={"select"} name={"project.method"} options={options} label={"Berechnungsmethode"} validator={"required"} callback={onMethodChange}>
                    </Formsfield>
                </div>
            </div>

            {eventhandler.requireddisclaimer()}

            <div className={"actions"}>
                <div className={"m-form__button"}>
                   <input type={"button"} name={"page.projectresume"} value={"Gespeichertes Projekt fortsetzen"} onClick={(e) => handleContinueProject(e)} id={eventhandler.uuid()} />
                </div>

                <Formsfield type={"submit"} name={"page.dayprofile.climaticconditions"} value={"next"} label={"Übernehmen und weiter"} />
            </div>
        </Form>
    </div>)
}
