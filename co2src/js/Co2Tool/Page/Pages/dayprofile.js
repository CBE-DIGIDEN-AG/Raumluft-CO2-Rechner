import React, { useState, useRef } from "react";
import EventHandler from "../../Tools/eventhandler";
import Climaticconditions from "../Pages/Dayprofile/climaticconditions"
import Buildingdetails from "../Pages/Dayprofile/buildingdetails"
import Roomtypes from "./Dayprofile/roomtypes"
import Rooms from "./Dayprofile/rooms"
import Windowtypes from "./Dayprofile/windowtypes"
import Relwindowroomtypes from "./Dayprofile/relwindowroomtypes"
import Usageprofiles from "./Dayprofile/usageprofiles"

export default function dayprofile({page}) {
    const eventhandler = new EventHandler()

    //set subtree in treenavi
    eventhandler.expandSidebarTree('dayprofile', {
        climaticconditions: {
            id: 'dayprofile.climaticconditions',
            title: 'Klimarandbedingungen',
            valid: false,
            submenu_isopen: false
        },
        buildingdetails: {
            id: 'dayprofile.buildingdetails',
            title: 'Gebäude',
            valid: false,
            submenu_isopen: false
        },
        rooms: {
            id: 'dayprofile.rooms',
            title: 'Räume',
            valid: false,
            submenu_isopen: true,
            has_childs: true,
        },
        windowtypes: {
            id: 'dayprofile.windowtypes',
            title: 'Fenstertypen',
            valid: false,
            submenu_isopen: true,
            has_childs: true,
        },
        roomtypes: {
            id: 'dayprofile.roomtypes',
            title: 'Varianten',
            valid: false,
            submenu_isopen: true,
            has_childs: true,
        },
        relwindowroomtypes: {
            id: 'dayprofile.relwindowroomtypes',
            title: 'Fensterangaben im Raum',
            valid: false,
            submenu_isopen: false
        },
        usageprofiles: {
            id: 'dayprofile.usageprofiles',
            title: 'Lüftungskonzept',
            valid: false,
            submenu_isopen: true,
            has_childs: true,
            hide_subtree: true
        },
    })

    switch(true) {
        case (page === 'dayprofile'):
            return (<Climaticconditions page={page}></Climaticconditions>)
            break;
        case (page === 'dayprofile.climaticconditions'):
            return (<Climaticconditions page={page}></Climaticconditions>)
            break;
        case (page === 'dayprofile.buildingdetails'):
            return (<Buildingdetails page={page}></Buildingdetails>)
            break;
        case (page.indexOf('dayprofile.rooms') === 0):
            return (<Rooms page={page}></Rooms>)
            break;
        case (page.indexOf('dayprofile.roomtypes') === 0):
            return (<Roomtypes page={page}></Roomtypes>)
            break;
        case (page.indexOf('dayprofile.relwindowroomtypes') === 0):
            return (<Relwindowroomtypes page={page}></Relwindowroomtypes>)
            break;
        case (page.indexOf('dayprofile.windowtypes') === 0):
            return (<Windowtypes page={page}></Windowtypes>)
            break;
        case (page.indexOf('dayprofile.usageprofiles') === 0):
            return (<Usageprofiles page={page}></Usageprofiles>)
            break;
    }
}
