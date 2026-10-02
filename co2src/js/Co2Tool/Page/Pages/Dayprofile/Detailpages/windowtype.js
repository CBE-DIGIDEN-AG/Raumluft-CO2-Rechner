import React, { useState, useRef } from "react";
import {Form} from "../../../../Forms/form";
import {Formsfield} from "../../../../Forms/formsfield";
import EventHandler from "../../../../Tools/eventhandler";
import Windowtyp from "../../../../Models/Windowtyp";
import Formdata from "../../../../Tools/formdata";

export default function windowtype({entity, editCallback}) {
    const eventhandler = new EventHandler()
    const formdata = new Formdata()

    if (!entity) {
        const windowtypes = Object.keys(eventhandler.projectdata.dayprofile.windowtypes);
        const lastkey = windowtypes[windowtypes.length - 1] + 1;

        entity = new Windowtyp({
            name: '',
            key: parseInt(lastkey),
            uuid: eventhandler.uuid()}
        )
        entity.isnew = false
    }

    const onChange = (e,name, type, value) => {
        if (type === 'onchange') {
            if (name === 'dayprofile.windowtypes.'+entity.key+'.win_Typ') {
                entity.type = value

                eventhandler.store()
                eventhandler.forceUpdate()
            }
        }
    }

    //4108 gelb
    //16798 rot
    const windowtyp_helptext_4108 = '<table>' +
        '<thead><tr><th>Fensterart</th><th>Grafische Darstellung</th></tr></thead>' +
        '<tbody>' +
        '<tr><td><strong>Kipp-/Drehfenster</strong></td><td><img src="' + eventhandler.manifest("images/content/Kippdrehfenster.svg") + '" style="height:60px;" /></td></tr>' +
        '<tr><td><strong>Schwingfenster</strong></td><td><img src="' + eventhandler.manifest("images/content/Schwingfluegelfenster.svg") + '" style="height:60px;" /></td></tr>' +
        '<tr><td><strong>Parallelabstellfenster</strong></td><td style="text-align: left;"><img src="' + eventhandler.manifest("images/content/Parallelabstellfenster.svg") + '" style="height:60px;" /><br>Fugenlänge = 2b+2h</td></tr>' +
        '<tr><td><strong>Lamellenfenster</strong></td><td><img src="' + eventhandler.manifest("images/content/Lamellenfenster.svg") + '" style="height:60px;" /></td></tr>' +
        '<tr><td><strong>Schiebefenster</strong></td><td><img src="' + eventhandler.manifest("images/content/Schiebefenster.svg") + '" style="height:60px;" /></td></tr>' +
        '<tr><td colspan="2" class="small">b: lichte Öffnungsbreite des Fensters, in m<br>' +
        'h: lichte Öffnungshöhe des Fensters, in m<br>' +
        'α: Öffnungswinkel des gekippten Fensters, in °<br>' +
        'd: Rahmendicke des Schwingfensters, in m<br>' +
        'x: Öffnungsweite des Schwingflügelfensters, in m<br>' +
        'y: Öffnungsweite der Lamellen (gemessen als Flächennormale zur geöffneten Lamelle), in m<br>' +
        'z: Öffnungsweite des Schiebefensters, in m</td></tr>' +
        '</tbody>' +
        '</table>'

    const windowtyp_helptext_16798 = '<table>' +
        '<thead><tr><th>Fensterart</th><th>Grafische Darstellung</th><th>Koeffizient je nach Fenstertyp</th></tr></thead>' +
        '<tbody>' +
        '<tr><td><strong>Drehfenster</strong></td><td><img src="' + eventhandler.manifest("images/content/nurDrehfenster.svg") + '" style="height:60px;" /></td><td>1</td></tr>' +
        '<tr><td><strong>Schiebefenster</strong></td><td><img src="' + eventhandler.manifest("images/content/nurSchiebefenster.svg") + '" style="height:60px;" /></td><td>0,5</td></tr>' +
        '<tr><td><strong>Klappfenster</strong></td><td><img src="' + eventhandler.manifest("images/content/nurKippfenster.svg") + '" style="height:60px;" /></td><td>Koeffizient = 2,6⋅10 − 7⋅α3 − 1,19⋅10 − 4⋅α2 + 1,86⋅10 − 2⋅α</td></tr>' +
        '<tr><td><strong>andere</strong></td><td>&nbsp;</td><td>0,3</td></tr>' +
        '</tbody>' +
        '</table>'


    return (<div className={"m-page"} key={eventhandler.uuid()}>
        <Form name={"dayprofile.windowtypes.window" + entity.key}>
            <div className={"m-page__fields"}>
                <h2>Fenstertyp anlegen / bearbeiten</h2>

                <Formsfield type={"text"} value={entity.name} name={"dayprofile.windowtypes."+entity.key+".name"} label={"Name Fenstertyp"} validator={"required"}/>

                {eventhandler.method() === '4108' && <Formsfield type={"select"} value={entity.type} name={"dayprofile.windowtypes."+entity.key+".win_Typ"} options={formdata.windowtypes.type4108} label={"Fensterart"} validator={"required"} callback={onChange} helptext={windowtyp_helptext_4108} />}
                {eventhandler.method() === '16798' && <Formsfield type={"select"} value={entity.type} name={"dayprofile.windowtypes."+entity.key+".win_Typ"} options={formdata.windowtypes.type16798} label={"Fensterart"} validator={"required"} callback={onChange} helptext={windowtyp_helptext_16798} />}

                {eventhandler.method() === '4108' && <Formsfield type={"text"} value={entity.b_k} name={"dayprofile.windowtypes."+entity.key+".b_k"} label={"Lichte Öffnungsbreite des Fensters (in m)"} validator={"required,float"}/>}
                {eventhandler.method() === '4108' && <Formsfield type={"text"} value={entity.h_k} name={"dayprofile.windowtypes."+entity.key+".h_k"} label={"Lichte Öffnungshöhe des Fensters (in m)"} validator={"required,float"}/>}

                {eventhandler.method() === '4108' && entity.type === 'Parallelabstellfenster' && <Formsfield type={"text"} defalutValue={entity.l_Fuge_k} name={"dayprofile.windowtypes."+entity.key+".l_Fuge_k"} label={"Fugenlänge des Fensters in Parallelabstellung (in m)"}/>}
                {eventhandler.method() === '4108' && entity.type === 'Schwingfenster' && <Formsfield type={"text"} defalutValue={entity.d_k} name={"dayprofile.windowtypes."+entity.key+".d_k"} label={"Rahmendicke des Schwingfensters (in m)"} validator={"required,float"}/>}
                {eventhandler.method() === '4108' && entity.type === 'Lamellenfenster' && <Formsfield type={"text"} defalutValue={entity.n_k} name={"dayprofile.windowtypes."+entity.key+".n_k"} label={"Lamellenanzahl"} validator={"required,integer"}/>}

                {eventhandler.method() === '16798' && <Formsfield type={"text"} defalutValue={entity.AW_max_k} name={"dayprofile.windowtypes."+entity.key+".AW_max_k"} label={"Maximale Öffnungsfläche des Fensters (in m²)"} validator={"required,float"}/>}
                {eventhandler.method() === '16798' && <Formsfield type={"text"} defalutValue={entity.h_k} name={"dayprofile.windowtypes."+entity.key+".h_k"} label={"Höhe der freien Fläche des Fensters (in m)"} validator={"required,float"}/>}

            </div>

            {eventhandler.requireddisclaimer()}

            <div className={"actions"}>
                <Formsfield type={"submit"} name={"page.dayprofile.windowtypes"} value={"next"} label={"Übernehmen"} callback={editCallback} entity={entity} />
            </div>
        </Form>
    </div>)
}
