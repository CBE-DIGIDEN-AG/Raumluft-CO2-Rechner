import React, { useState, useRef } from "react";
import {Form} from "../../../../Forms/form";
import {Formsfield} from "../../../../Forms/formsfield";
import EventHandler from "../../../../Tools/eventhandler";
import Raumtyp from "../../../../Models/Raumtyp";
import Formdata from "../../../../Tools/formdata";
import Bnb from "../../../../Tools/bnb";

export default function room({entity, editCallback}) {
    const eventhandler = new EventHandler()
    const bnbhandler = new Bnb()

    let handleNettovolumen = 0.0

    if (eventhandler.projectdata.buildingdetails && eventhandler.projectdata.buildingdetails.VB) {
        handleNettovolumen = eventhandler.projectdata.buildingdetails.VB
    }

    bnbhandler.handleRoomFields(entity.key)

    if (!entity) {
        var roomtypes = Object.keys(eventhandler.projectdata.dayprofile.roomtypes)
        var lastkey = parseInt(roomtypes[roomtypes.length-1]) + 1

        entity = new Raumtyp({
            key: parseInt(lastkey),
            uuid: eventhandler.uuid()
            }
        )
        entity.isnew = false
        //entity.name = 'neuer Raum'
    }
    else if (entity && entity.isnew === true) {

    }
    else {
        entity.isnew = false
    }

    const onChange = (e,name, type, value) => {
        var expected_name = 'dayprofile.rooms.'+ entity.key
        var expected_names = [
            expected_name+'.name',
            expected_name+'.usetype',
            expected_name+'.t_in',
            expected_name+'.A',
            expected_name+'.H',
            expected_name+'.Ae',
            expected_name+'.Anl'
        ]

        if (type === 'onchange' || type === 'onblur') {
            if (expected_names.includes(name)) {
                var varnames = name.split('.')
                var varname = varnames[varnames.length-1]

                entity[varname] = value
            }

            //remove stored element in memory
            if (entity.isnew === true && eventhandler.projectdata.dayprofile.roomtypes[entity.key]) {
                //eventhandler.projectdata.dayprofile.roomtypes.splice(entity.key,1)
            }
        }
    }

    const Ae_helptext = 'Die wärmeübertragende Umfassungsfläche ist die Grenze zwischen konditionierten Räumen und der Außenluft, dem Erdreich oder nicht konditionierten Räumen. Über diese Fläche verliert oder gewinnt der gekühlte/beheizte Raum Wärme, daher auch „wärmeübertragende Umfassungsfläche“. (DIN V 18599-1-2018)'

    return (<div className={"m-page"} key={eventhandler.uuid()}>
        <Form name={"dayprofile.rooms.room" + entity.key}>
            <div className={"m-page__fields"}>
                <h2>Raum anlegen / bearbeiten</h2>

                <Formsfield type={"text"} defalutValue={entity.name} name={"dayprofile.rooms."+entity.key+".name"} label={"Name des Raums"} validator={"required"} callback={onChange} entity={entity} />
                <Formsfield type={"text"} defalutValue={entity.usetype} name={"dayprofile.rooms."+entity.key+".usetype"} label={"Raumnutzungstyp"} callback={onChange} entity={entity} />

                <Formsfield type={"text"} defalutValue={entity.t_in} name={"dayprofile.rooms."+entity.key+".t_in"} readonly={bnbhandler.readonly()} label={"Innentemperatur (in °C)"} validator={"required,floatrange(-50|50)"} callback={onChange} entity={entity} />

                <Formsfield type={"text"} defalutValue={entity.A} name={"dayprofile.rooms."+entity.key+".A"} label={"Nutzfläche des Raums (in m²)"} validator={"required,float"} callback={onChange} entity={entity}/>

                <Formsfield type={"text"} defalutValue={entity.H} name={"dayprofile.rooms."+entity.key+".H"} label={"Lichte Raumhöhe (in m)"} validator={"required,float"} callback={onChange} entity={entity}/>

                {(handleNettovolumen > 1500) && <Formsfield type={"text"} defalutValue={entity.Ae} name={"dayprofile.rooms."+entity.key+".Ae"} label={"Wärmeübertragende Umfassungsfläche des Raums in m²"} validator={"required,float,notnull"} helptext={Ae_helptext} callback={onChange} entity={entity} />}
            </div>

            {eventhandler.requireddisclaimer()}

            <div className={"actions"}>
                <Formsfield type={"submit"} name={"page.dayprofile.rooms"} value={"next"} label={"Übernehmen"} callback={editCallback} entity={entity} />
            </div>
        </Form>
    </div>)
}
