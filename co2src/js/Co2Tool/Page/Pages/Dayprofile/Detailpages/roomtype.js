import React, { useState, useRef } from "react";
import {Form} from "../../../../Forms/form";
import {Formsfield} from "../../../../Forms/formsfield";
import EventHandler from "../../../../Tools/eventhandler";
import Raumtyp from "../../../../Models/Raumtyp";
import Formdata from "../../../../Tools/formdata";
import Bnb from "../../../../Tools/bnb";

export default function roomtype({entity, editCallback}) {
    const eventhandler = new EventHandler()
    const formdata = new Formdata()
    const bnbhandler = new Bnb()

    bnbhandler.handleRoomtypeFields(entity.key)

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
        var expected_name = 'dayprofile.roomtypes.'+ entity.key
        var expected_names = [
            expected_name+'.name',
            expected_name+'.usetype',
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

    const rooms = [{key: '',label: 'Bitte wählen'}]
    eventhandler.projectdata.dayprofile.rooms.map((room, key) => {
        if (!room) {
            return
        }

        rooms.push({
            key: key,
            label: room.name
        })
    })

    return (<div className={"m-page"} key={eventhandler.uuid()}>
        <Form name={"dayprofile.roomtypes.room" + entity.key}>
            <div className={"m-page__fields"}>
                <h2>Variante anlegen / bearbeiten</h2>

                <Formsfield type={"text"} defalutValue={entity.name} name={"dayprofile.roomtypes."+entity.key+".name"} label={"Name der Variante"} validator={"required,length(34)"} callback={onChange} entity={entity} />
                <Formsfield type={"select"} options={rooms} name={"dayprofile.roomtypes."+entity.key+".room"} label={"Raum"} validator={"required"} callback={onChange}/>
                <Formsfield type={"select"} options={formdata.roomtypes.ventilation} name={"dayprofile.roomtypes."+entity.key+".Anl"} label={"Wie wird der Raum belüftet?"} validator={"required"} callback={onChange} />
            </div>

            {eventhandler.requireddisclaimer()}

            <div className={"actions"}>
                <Formsfield type={"submit"} name={"page.dayprofile.roomtypes"} value={"next"} label={"Übernehmen"} callback={editCallback} entity={entity} />
            </div>
        </Form>
    </div>)
}
