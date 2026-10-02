import climaticconditions from "../Page/Pages/Dayprofile/climaticconditions";
import EventHandler from "./eventhandler";
import Interval from "../Models/Interval";
import {Form} from "../Forms/form";
import {Formsfield} from "../Forms/formsfield";
import BnbConfirm from "../Page/Pages/Bnb/Confirm"
import React, { useState, useRef } from "react";

let bnb_instance = null;

export default class Bnb {
    eventhandler = null

    //singleton interface
    constructor() {
        this.eventhandler = new EventHandler()

        if (bnb_instance) {
            return bnb_instance
        }
        bnb_instance = this;
    }

    setProfile(profile, roomtype) {
        if (!this.eventhandler.projectdata.bnbprofile) {
            this.eventhandler.projectdata.bnbprofile = {}
        }

        this.eventhandler.projectdata.bnbprofile[roomtype] = profile
        this.eventhandler.store()
    }

    getProfile(roomtype) {
        if (roomtype === '_all') {
            return this.eventhandler.projectdata.bnbprofile
        }

        if (this.eventhandler.projectdata.bnbprofile && this.eventhandler.projectdata.bnbprofile[roomtype]) {
            return this.eventhandler.projectdata.bnbprofile[roomtype]
        }
    }

    validator(validator) {
        if (this.eventhandler.projectdata && this.eventhandler.projectdata.method === 'bnb') {
            return validator
        }

        return ''
    }

    readonly(field='', object = null, roomtype) {
        //readonly only in bnb
        if (this.eventhandler.projectdata && this.eventhandler.projectdata.method !== 'bnb') {
            return false;
        }

        if (field !== '' && object !== null && object.hasOwnProperty(field)) {
            if (object[field] === true) {
                return false
            }

            return true
        }
        else if (field !== '' && this.getProfile(roomtype) && this.getProfile(roomtype).hasOwnProperty(field)) {
            if (this.getProfile(roomtype)[field] === true) {
                return false
            }

            return true
        }
        else if (field !== '') {
            return false
        }

        if (this.eventhandler.projectdata && this.eventhandler.projectdata.method === 'bnb') {
            return true
        }

        return false
    }

    handleClimaticconditionsFields() {
        if (this.eventhandler.projectdata && this.eventhandler.projectdata.method === 'bnb') {
            if (!this.eventhandler.projectdata['dayprofile']) {
                this.eventhandler.projectdata.dayprofile = {}
            }

            this.eventhandler.projectdata.dayprofile.t_e = '13'
            this.eventhandler.projectdata.dayprofile.cAUL = '420'
            this.eventhandler.projectdata.dayprofile.v_meteo = '3'
        }
    }

    handleBuildingdetailsFields() {
        if (this.eventhandler.projectdata && this.eventhandler.projectdata.method === 'bnb') {
            if (!this.eventhandler.projectdata['buildingdetails']) {
                this.eventhandler.projectdata.buildingdetails = {}
            }

            if (!this.eventhandler.projectdata.buildingdetails['LDH']) {
                this.eventhandler.projectdata.buildingdetails.LDH = {}
            }

            this.eventhandler.projectdata.buildingdetails.VB = '1600'
            this.eventhandler.projectdata.buildingdetails.LDH.base = 'defaultvalue'
            this.eventhandler.projectdata.buildingdetails.q50 = '2'
            this.eventhandler.projectdata.buildingdetails.fATD = 'nein'
            this.eventhandler.projectdata.buildingdetails.abschirmung = 'regular'
        }
    }

    handleRoomtypeFields(RoomTypeId) {
        if (this.eventhandler.projectdata && this.eventhandler.projectdata.method === 'bnb') {
            if (!this.eventhandler.projectdata.dayprofile.roomtypes[RoomTypeId]) {
                this.eventhandler.projectdata.dayprofile.roomtypes[RoomTypeId] = {}
            }

            //this.eventhandler.projectdata.dayprofile.roomtypes[RoomTypeId].Anl = 'window'
        }
    }

    handleRoomFields(RoomId) {
        if (this.eventhandler.projectdata.method === 'bnb') {
            if (!this.eventhandler.projectdata.dayprofile.rooms[RoomId]) {
                this.eventhandler.projectdata.dayprofile.rooms[RoomId] = {}
            }

            this.eventhandler.projectdata.dayprofile.rooms[RoomId].t_in = '20'
        }

        //dayprofile.usageprofiles.1.intervals.0.Bal
    }

    renderDayProfilForm(profile,onChangeDayProfilesCancel, onChangeDayProfilesConfirm, roomtype) {
        return (
            <BnbConfirm profile={profile} onChangeDayProfilesConfirm={onChangeDayProfilesConfirm} onChangeDayProfilesCancel={onChangeDayProfilesCancel} roomtype={roomtype}></BnbConfirm>
        )
    }

    calculateWindows(parameter, parentkey, interval, profile) {
        const windows_to_out = {}
        windows_to_out[0] = {
            group: {}
        }

        //console.log(parameter.roomtype)
        //console.log(interval)

        for (const windowgroup of Object.entries(this.eventhandler.projectdata.dayprofile.roomtypes[parameter.roomtype].windowgroups)) {
            windows_to_out[0].group[windowgroup[0]] = {}

            if (windowgroup[1] && windowgroup[1].windowdata) {
                const windowdata = windowgroup[1].windowdata[0]
                let window = this.eventhandler.projectdata.dayprofile.windowtypes[windowgroup[1].windowtypes]

                let varname_no = 'no_Fe'
                let varname_oz = 'oz_Fe'

                //einseitig
                if (this.eventhandler.projectdata.dayprofile.relwindowroomtypes[parameter.roomtype] && this.eventhandler.projectdata.dayprofile.relwindowroomtypes[parameter.roomtype].einseitig !== 'ja') {
                    switch(windowgroup[1].aw_k) {
                        case ('0'):
                            varname_no += '_S'
                            varname_oz += '_S'
                            break
                        case ('90'):
                            varname_no += '_W'
                            varname_oz += '_W'
                            break
                        case ('180'):
                            varname_no += '_N'
                            varname_oz += '_N'
                            break
                        case ('270'):
                            varname_no += '_O'
                            varname_oz += '_O'
                            break
                    }
                }

                varname_no += '_k'

                if (interval.oz === 'free') {
                    //TODO
                    windows_to_out[0].group[windowgroup[0]][varname_oz] = profile.windowdefinitions[parameter.roomtype][windowgroup[0]][window.key].oz

                    if (profile.windowdefinitions[parameter.roomtype][windowgroup[0]][window.key].alpha_k) {
                        windows_to_out[0].group[windowgroup[0]]['alpha_k'] = profile.windowdefinitions[parameter.roomtype][windowgroup[0]][window.key].alpha_k
                    }

                    if (profile.windowdefinitions[parameter.roomtype][windowgroup[0]][window.key].x_k) {
                        windows_to_out[0].group[windowgroup[0]]['x_k'] = profile.windowdefinitions[parameter.roomtype][windowgroup[0]][window.key].x_k
                    }

                    //immer alle fenster die es gibt
                    windows_to_out[0].group[windowgroup[0]][varname_no] = profile.windowdefinitions[parameter.roomtype][windowgroup[0]][window.key].no
                }
                else if (interval.oz === '') {
                    if (!interval.no) {
                        interval.no = '0'
                    }
                    windows_to_out[0].group[windowgroup[0]][varname_no] = interval.no
                    windows_to_out[0].group[windowgroup[0]][varname_oz] = ''
                    windows_to_out[0].group[windowgroup[0]]['alpha_k'] = ''
                    windows_to_out[0].group[windowgroup[0]]['x_k'] = ''
                }

                windows_to_out[0].group[windowgroup[0]]['oz_editable'] = interval.oz_editable
                windows_to_out[0].group[windowgroup[0]]['windowgroup'] = windowgroup[0]

                if (profile.no_in_percent === true) {
                    //windows_to_out[0].group[windowgroup[0]][varname_no] = (Math.ceil(windowdata.windowcount / 100 * interval.no)).toString()
                }
            }
        }

        return windows_to_out
    }

    changeDayProfile(profile, roomtype) {
        this.eventhandler.projectdata.dayprofile.usageprofiles.map((usageprofile, key) => {
            if (!usageprofile || usageprofile.roomtype !== roomtype) {
                return
            }

            usageprofile.start = profile.data.start
            usageprofile.intervals = []

            //create intervals
            let map = {};

            Object.values(profile.data.intervals).map((interval, ikey) => {
                if (interval.base) {
                    interval = Object.assign({}, profile.data.intervals[interval.base], interval);
                }

                const newinterval = new Interval({name: interval.name, key: key})
                newinterval.duration = interval.duration

                if (profile.persons_in_percent === true) {
                    newinterval.count_teacher = Math.ceil(interval.count_teacher / 100 * parseInt(profile.count_teacher)).toString()
                    newinterval.count_students = Math.ceil(interval.count_students / 100 * parseInt(profile.count_students)).toString()
                    newinterval.count_prestudents = Math.ceil(interval.count_prestudents / 100 * parseInt(profile.count_prestudents)).toString()
                }
                else {
                    newinterval.count_teacher = interval.count_teacher
                    newinterval.count_students = interval.count_students
                    newinterval.count_prestudents = interval.count_prestudents
                }

                newinterval.type_teacher = 'custom'
                newinterval.type_students = 'custom'
                newinterval.type_prestudents = 'custom'

                if (profile.emissionrate_editable === true) {
                    newinterval.emissionrate_teacher = profile.emissionrate_teacher
                    newinterval.emissionrate_students = profile.emissionrate_students
                    newinterval.emissionrate_prestudents = profile.emissionrate_prestudents
                }
                else {
                    newinterval.emissionrate_teacher = interval.emissionrate_teacher
                    newinterval.emissionrate_students = interval.emissionrate_students
                    newinterval.emissionrate_prestudents = interval.emissionrate_prestudents
                }

                //fenster öffnungszustände festlegen
                newinterval.windows = this.calculateWindows(usageprofile, key, interval, profile)

                //mechanische lüftung???
                const anl = this.eventhandler.projectdata.dayprofile.roomtypes[usageprofile.roomtype].Anl
                if (anl === 'mechanical' || anl === 'hybrid') {

                   //console.log(profile.windowdefinitions)

                    if (profile.windowdefinitions[usageprofile.roomtype] && profile.windowdefinitions[usageprofile.roomtype].q_v_mech) {
                        newinterval.q_v_mech = profile.windowdefinitions[usageprofile.roomtype].q_v_mech
                        newinterval.Bal = 'ja'
                    }
                }

                //insert entity
                usageprofile.intervals[ikey] = newinterval

                //insert into treenavi
                /*map[ikey] = {
                    id: 'dayprofile.usageprofiles.usageprofile' + usageprofile.roomtype + '.interval' + ikey,
                    key: ikey,
                    title: newinterval.name,
                    valid: true,
                    submenu_isopen: false
                }*/
            })

            //cleanup tree before
            this.eventhandler.removeAllChildsFromSidebarTree('dayprofile.usageprofiles.'+usageprofile.roomtype, true)

            //saved
            this.eventhandler.sidebartree.dayprofile.childs.usageprofiles.childs[usageprofile.roomtype].unsaved = false
            this.eventhandler.sidebartree.dayprofile.childs.usageprofiles.childs[usageprofile.roomtype].valid = true

            //insert into treenavi
            this.eventhandler.expandSidebarTree('dayprofile.usageprofiles.'+usageprofile.roomtype, map, true)

            //store
            this.eventhandler.store()
            this.eventhandler.forceUpdate()
        })
    }
}