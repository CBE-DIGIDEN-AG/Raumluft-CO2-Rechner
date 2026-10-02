import React, {useState, useRef} from "react";
import {Form} from "../../../Forms/form";
import {Formsfield} from "../../../Forms/formsfield";
import EventHandler from "../../../Tools/eventhandler";
import Formdata from "../../../Tools/formdata";
import Bnb from "../../../Tools/bnb";

export default function buildingdetails({page}) {
    const eventhandler = new EventHandler()
    const formdata = new Formdata()
    const bnbhandler = new Bnb()

    let handleluftdichtheit = ''
    let handleNettovolumen = 0.0

    bnbhandler.handleBuildingdetailsFields()

    if (eventhandler.projectdata.buildingdetails && eventhandler.projectdata.buildingdetails.LDH && eventhandler.projectdata.buildingdetails.LDH.base) {
        handleluftdichtheit = eventhandler.projectdata.buildingdetails.LDH.base
    }

    if (eventhandler.projectdata.buildingdetails && eventhandler.projectdata.buildingdetails.VB) {
        handleNettovolumen = eventhandler.projectdata.buildingdetails.VB
    }

    const [elementtofocus, setElementtofocus] = useState(() => {
        return null
    });

    const onLuftdichtheit = (e, name, type, value) => {
        if (type === 'onchange') {
            if (name === 'buildingdetails.LDH.base') {
                handleluftdichtheit = value

                eventhandler.store()
                eventhandler.forceUpdate()
            }
        }
    }

    const onNettovolumen = (e, name, type, value) => {
        if (type === 'onchange') {
            setElementtofocus(name)

            if (name === 'buildingdetails.VB') {
                handleNettovolumen = parseFloat(value)

                //check all roooms for validation
                if (handleNettovolumen > 1500) {
                    let one_room_is_invalid = false
                    eventhandler.projectdata.dayprofile.rooms.map((room, roomkey) => {
                        if (!room) {
                            return
                        }

                        if (!room.Ae) {
                            eventhandler.sidebartree.dayprofile.childs.rooms.childs['room' + room.key].form = null
                            eventhandler.sidebartree.dayprofile.childs.rooms.childs['room' + room.key].valid = false
                            one_room_is_invalid = true
                        }
                    })

                    if (one_room_is_invalid === true) {
                        eventhandler.sidebartree.dayprofile.childs.rooms.valid = false
                    }
                }

                eventhandler.store()
                eventhandler.forceUpdate()
            }
        }
    }

    const fATD_helptext = 'Außenluftdurchlässe sind Einrichtungen, die das geplante Durchströmen von Luft durch die Gebäudehülle ermöglichen.'

    const VB_helptext = (<div className={"m-helptext"}>
        <div className={"m-helptext__legend"}>n50<sup>*</sup> und q50<sup>**</sup> - Bemessungswerte (Standardwerte für
            ungeprüfte Gebäude)
        </div>
        <table>
            <thead>
            <tr>
                <th><p>Kategorien zur pauschalen Einschätzung der Gebäudedichtheit</p></th>
                <th><p>Gebäude mit einem Nettoraumvolumen ≤ 1500 m3 n50 h-1</p></th>
                <th><p>Gebäude mit einem Nettoraumvolumen > 1 500 m3 q50 m3/m2h</p></th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td><p>I</p></td>
                <td><p>a) 2; b) 1</p></td>
                <td><p>a) 3; b) 2</p></td>
            </tr>
            <tr>
                <td><p>II</p></td>
                <td><p>4</p></td>
                <td><p>6</p></td>
            </tr>
            <tr>
                <td><p>III</p></td>
                <td><p>6</p></td>
                <td><p>9</p></td>
            </tr>
            <tr>
                <td><p>IV</p></td>
                <td><p>10</p></td>
                <td><p>15</p></td>
            </tr>
            </tbody>
        </table>
        <div className={"m-helptext__description"}>
            <p>Kategorie I: Einhaltung der Anforderung an die Gebäudedichtheit nach DIN 4108-7 (d. h., die
                Dichtheits-prüfung wird entsprechend den Kriterien dieser Norm nach Fertigstellung durchgeführt);</p>
            <p>&nbsp;</p>
            <p>a) Gebäude ohne raumlufttechnische Anlage,</p>
            <p>&nbsp;</p>
            <p>b) Gebäude mit raumlufttechnischer Anlage (auch Wohnungslüftungsanlagen);</p>
            <p>&nbsp;</p>
            <p>Kategorie II: zu errichtende Gebäude oder Gebäudeteile, bei denen keine Dichtheitsprüfung vorgesehen
                ist;</p>
            <p>&nbsp;</p>
            <p>Kategorie III: Fälle, die nicht den Kategorien I, II oder IV entsprechen;</p>
            <p>&nbsp;</p>
            <p>Kategorie IV: Vorhandensein offensichtlicher Undichtheiten, wie z. B. offene Fugen in der
                Luftdichtheits-schicht der wärmeübertragenden Umfassungsfläche.</p>
            <p>&nbsp;</p>
            <p>Kann die Einstufung in o.g. Kategorien nicht eindeutig qualifiziert vorgenommen werden, muss eine
                Dichtheitsprüfung zur Bestimmung des n50-Wertes erfolgen.</p>
            <p>&nbsp;</p>
            <p><sup>*</sup> n50 = Luftwechsel bei 50 Pa Druckdifferenz in 1/h</p>
            <p><sup>**</sup> q50 = hüllflächenbezogene Luftdurchlässigkeit bei 50 Pa Druckdifferenz in m3/(m2h)</p>
            <p>&nbsp;</p>
            <p>Dieser Infotext basiert auf den Vorgaben und Anforderungen der DIN V 18599-2:2018-09</p>
        </div>
    </div>)

    return (<div className={"m-page"}>
        <Form name={"dayprofile.buildingdetails"}>
            <div className={"m-page__fields"} key={eventhandler.uuid()}>
                <h1>Projektrandbedingungen</h1>
                <h2>Gebäude</h2>

                <Formsfield type={"select"} name={"buildingdetails.VB"} options={formdata.buildingdetails.VB}
                            label={"Nettovolumen des Gebäudes (in m³)"} validator={"required,float"}
                            callback={onNettovolumen}
                            setFocus={elementtofocus === "buildingdetails.VB"} readonly={bnbhandler.readonly()}/>

                {(handleNettovolumen <= 1500) && <Formsfield type={"select"} name={"buildingdetails.LDH.base"}
                                                             options={formdata.buildingdetails.luftdichtheit}
                                                             label={"Luftdichtheit"} validator={"required"}
                                                             callback={onLuftdichtheit} helptext={VB_helptext}>
                    {handleluftdichtheit === 'messasure' && (handleNettovolumen <= 1500) &&
                        <Formsfield type={"text"} name={"buildingdetails.n50"}
                                    options={formdata.buildingdetails.luftwechsel}
                                    label={"Luftwechsel bei 50 Pa Druckdifferenz - n50 (in 1/h)"}
                                    validator={"required,float"}>
                        </Formsfield>}

                    {handleluftdichtheit === 'defaultvalue' && (handleNettovolumen <= 1500) &&
                        <Formsfield type={"select"} name={"buildingdetails.n50"}
                                    options={formdata.buildingdetails.luftwechseln50}
                                    label={"Luftwechsel bei 50 Pa Druckdifferenz - n50 (in 1/h)"}
                                    validator={"required"}>
                        </Formsfield>}
                </Formsfield>}

                {(handleNettovolumen > 1500) && <Formsfield type={"select"} name={"buildingdetails.LDH.base"}
                                                            options={formdata.buildingdetails.luftdichtheit}
                                                            label={"Luftdichtheit"} validator={"required"}
                                                            callback={onLuftdichtheit} helptext={VB_helptext} readonly={bnbhandler.readonly()}>
                    {handleluftdichtheit === 'messasure' && (handleNettovolumen > 1500) &&
                        <Formsfield type={"text"} name={"buildingdetails.q50"}
                                    options={formdata.buildingdetails.luftwechsel}
                                    label={"hüllflächenbezogene Luftdurchlässigkeit bei 50 Pa Druckdifferenz - q50 (in m³/(m²h))"}
                                    validator={"required,float"}>
                        </Formsfield>}

                    {handleluftdichtheit === 'defaultvalue' && (handleNettovolumen > 1500) &&
                        <Formsfield type={"select"} name={"buildingdetails.q50"}
                                    options={formdata.buildingdetails.luftwechselq50}
                                    label={"hüllflächenbezogene Luftdurchlässigkeit bei 50 Pa Druckdifferenz - q50 (in m³/(m²h))"}
                                    validator={"required,float"} readonly={bnbhandler.readonly()}></Formsfield>}
                </Formsfield>}

                <Formsfield type={"select"} name={"buildingdetails.fATD"} options={formdata.buildingdetails.fATD}
                            label={"Sind Außenluftdurchlässe vorhanden?"} validator={"required"}
                            helptext={fATD_helptext} readonly={bnbhandler.readonly()}>
                </Formsfield>

                <Formsfield type={"select"} name={"buildingdetails.abschirmung"}
                            options={formdata.buildingdetails.abschirmung} label={"Abschirmung"} validator={"required"}>
                </Formsfield>
            </div>

            {eventhandler.requireddisclaimer()}

            <div className={"actions"}>
                <Formsfield type={"submit"} name={"page.dayprofile.climaticconditions"} value={"back"}
                            label={"zurück"}/>
                <Formsfield type={"submit"} name={"page.dayprofile.rooms"} value={"next"}
                            label={"Übernehmen und weiter"}/>
            </div>
        </Form>
    </div>)
}
