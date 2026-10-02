import React, { useState, useRef } from "react";
import {Formsfield} from "../../Forms/formsfield"
import {Form} from "../../Forms/form"
import EventHandler from "../../Tools/eventhandler";
import projectresume from "./projectresume";

export default function method() {
    const eventhandler = new EventHandler()

    const dayprofilesOptions = [
        {
            key: 'free',
            label: 'Berechnung mit freien Randbedingungen',
            label_additional: 'Gestalten Sie Ihr Projekt flexibel nach Ihren Anforderungen, von Klimabedingungen bis hin zu Raumspezifikationen und Tagesnutzungsprofilen, um das optimale Lüftungskonzept zu ermitteln.'
        },
        {
            key: 'bnb',
            label: 'Berechnung mit festen Randbedingungen gemäß BNB',
            label_additional: 'Nutzen Sie vorkonfigurierten Klima- und Gebäudeparameter sowie hinterlegten Tagesprofile verschiedener Raumnutzungsarten für eine schnelle Berechnung BNB-relevanter Werte.'
        }
    ]

    const [method, setMethod] = useState(() => {
        if (!eventhandler.projectdata.method) {
            eventhandler.projectdata.method = 'free'

            eventhandler.store()
        }

        return 'free'
    });

    const onChangeMethod = (e,name, type, value) => {
        if (type === 'onchange') {
            if (name === 'method') {
                eventhandler.projectdata.method = value
                setMethod(value)
                eventhandler.store()
                eventhandler.forceUpdate()
            }
        }
    }

    return (<div className={"m-page"}>
        <Form name={"method"}>
            <div className={"m-page__fields"}>
                <h1>Anwendungsfall</h1>

                <Formsfield type={"radios"} name={"method"} value={method} options={dayprofilesOptions} label={"Tagesprofile auswählen"} callback={onChangeMethod} />
            </div>


            <div className={"actions"}>
                <Formsfield type={"submit"} name={"page.projektangaben"} value={"next"} label={"Übernehmen und weiter"} />
            </div>
        </Form>
    </div>)
}
