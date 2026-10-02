import React, { useState, useRef } from "react";
import EventHandler from "../../Tools/eventhandler";

import Usageprofile from "../../Models/Usageprofile";
import moment from "moment/moment";
import Climaticconditions from "./Dayprofile/climaticconditions";
import Compare from "./Results/Compare";

export default function Results({page}) {
    const eventhandler = new EventHandler()

    if (!eventhandler.projectdata.dayprofile) {
        return (<div></div>);
    }

    switch(true) {
        default:
            return (<Compare></Compare>)
            break;
    }




}
