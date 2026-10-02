import React, { useState, useRef } from "react";
import Projectangaben from "./Pages/projektangaben"
import Method from "./Pages/method"
import Results from "./Pages/Results"
import Dayprofile from "./Pages/dayprofile"
import Dashboard from "./Pages/dashboard"
import Notfound from "./Pages/notfound"
import Projectresume from "./Pages/projectresume"
import EventHandler from "../Tools/eventhandler";
import Ajaxpage from "./Pages/Ajaxpage";

export default function page({page}) {
    const eventhandler = new EventHandler()

    if (!page) {
        return
    }

    var parts = page.split('.')
    var pageselector = ''

    if (parts.length === 1) {
        pageselector = page
    }
    else {
        pageselector = parts[0]
    }

    try {
        switch(pageselector) {
            case ('impressum'):
            case ('barrierefreiheit'):
            case ('barrieremelden'):
            case ('gebaerdensprache'):
            case ('easyspeech'):
            case ('datenschutz'):
            case ('toolbeschreibung'):
                return (<Ajaxpage slug={pageselector}></Ajaxpage>)
                break;
            case ('projektangaben'):
                return (<Projectangaben></Projectangaben>)
                break;
            case ('method'):
                return (<Method></Method>)
                break;
            case ('dayprofile'):
                return (<Dayprofile page={page}></Dayprofile>)
                break;
            case ('results'):
                return (<Results page={page}></Results>)
                break;
            case('projectresume'):
                return (<Projectresume></Projectresume>)
            case('dashboard'):
                return (<Dashboard></Dashboard>)
            default:
                //throw new Error('404 not found');
                return (<Notfound></Notfound>)
                break;
        }
    }
    catch(e) {
        //console.log(e)
    }
}
