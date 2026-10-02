import React, { useState, useRef } from "react";
import {Form} from "../../../Forms/form";
import {Formsfield} from "../../../Forms/formsfield";
import EventHandler from "../../../Tools/eventhandler";
import Bnb from "../../../Tools/bnb";

export default function climaticconditions({page}) {
    const eventhandler = new EventHandler()
    const bnbhandler = new Bnb()

    const v_meteo_helptext = 'Gemessen in 10 m Höhe in offener Lage, z.B. aus Test Reference Year (TRY) bzw. Datensätze des deutschen Wetterdienstes (DWD). Standardwert = 4 m/s als Heizperiodenmedianwert (von September bis Mai) für TRY 04'
    const cAUL_helptext = ' Die CO₂-Konzentration der Außenluft variiert je nach Standort. In ländlichen Gebieten ist sie in der Regel niedriger als in städtischen Gebieten. Wenn keine genauen Informationen vorliegen, kann 420 ppm als Näherungswert verwendet werden.'

    bnbhandler.handleClimaticconditionsFields()

    return (<div className={"m-page"}>
        <Form name={"dayprofile.climaticconditions"}>
            <div className={"m-page__fields"}>
                <h1>Projektrandbedingungen</h1>
                <h2>Klimarandbedingungen</h2>

                <Formsfield type={"text"} readonly={bnbhandler.readonly()} name={"dayprofile.t_e"} label={"Außentemperatur (in °C)"} validator={"required,floatrange(-50|50)"}/>
                <Formsfield type={"text"} readonly={bnbhandler.readonly()} name={"dayprofile.cAUL"} label={"Kohlendioxidkonzentration der Außenluft (in ppm)"} validator={"required,float"} helptext={cAUL_helptext} />
                <Formsfield type={"text"} readonly={bnbhandler.readonly()} name={"dayprofile.v_meteo"} label={"Meteorologische Windgeschwindigkeit (in m/s)"} validator={"required,float"} helptext={v_meteo_helptext}/>
            </div>

            {eventhandler.requireddisclaimer()}

            <div className={"actions"}>
                <Formsfield type={"submit"} name={"page.projektangaben"} value={"back"} label={"zurück"} />
                <Formsfield type={"submit"} name={"page.dayprofile.buildingdetails"} value={"next"} label={"Übernehmen und weiter"} />
            </div>
        </Form>
    </div>)
}
