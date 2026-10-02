import base from "./base"

export default class calc16798 extends base {
    q_v_Fe_i = (roomkey, intervalkey, interval_entity, room_entity) => {
        let einseitig = this.einseitig(roomkey)

        var facade = []

        if (room_entity.windowgroups) {
            let hw_path_k_max = 0
            let hw_path_k_min = 99999999
            let h_k = 0
            let AW_k_tot = 0
            let openwindow = 0
            let Aw_ori_j = 0
            let hashes_included = []
            let Aw_cros = 99999999

            for (const windowgroup of Object.entries(room_entity.windowgroups)) {
                if (windowgroup[1].windowtypes) {
                    //fenster daten
                    var window = this.eventhandler.projectdata.dayprofile.windowtypes[windowgroup[1].windowtypes]
                    var windowdata = windowgroup[1].windowdata[0]

                    if (interval_entity.windows && interval_entity.windows[0]) {
                        Object.entries(interval_entity.windows[0].group).map((group, groupkey) => {
                            if (this.parseInt(group[1].Nw) > 0) {
                                if (windowgroup[0] !== group[0]) {
                                    return
                                }

                                let hashCompareValue = Object.keys(group[1]).sort().reduce(
                                    (obj, key) => {
                                        obj[key] = group[1][key]
                                        return obj
                                    },
                                    {}
                                )
                                hashCompareValue['windowgroup'] = windowgroup[0]

                                let groupHash = this.eventhandler.createHash(JSON.stringify(hashCompareValue))

                                if (hashes_included.includes(groupHash) === true) {
                                    return
                                }

                                hashes_included.push(groupHash)

                                let AW_k = this.AW_k(room_entity, window, group[1])

                                hw_path_k_max = Math.max(hw_path_k_max, (this.parseFloat(windowdata.hw_path_k)  + this.parseFloat(window.h_k) / 2))
                                hw_path_k_min = Math.min(hw_path_k_min, (this.parseFloat(windowdata.hw_path_k) - this.parseFloat(window.h_k) / 2))

                                this.eventhandler.log('hw_path_k_max', hw_path_k_max)
                                this.eventhandler.log('hw_path_k_min', hw_path_k_min)
                                this.eventhandler.log('AW_k', AW_k)

                                AW_k_tot += (AW_k * this.parseInt(group[1].Nw))
                                openwindow += this.parseInt(group[1].Nw)
                                h_k += this.parseFloat(window.h_k)
                            }
                        })
                    }
                }
            }

            let Aw_cros_k = {
                1: 0,
                2: 0
            }

            let Aw_cros_based_on_aref = {}

            for (const windowgroup of Object.entries(room_entity.windowgroups)) {
                if (windowgroup[1].windowtypes) {
                    //fenster daten
                    var window = this.eventhandler.projectdata.dayprofile.windowtypes[windowgroup[1].windowtypes]
                    var windowdata = windowgroup[1].windowdata[0]

                    if (interval_entity.windows && interval_entity.windows[0]) {
                        Object.entries(interval_entity.windows[0].group).map((group, groupkey) => {
                            if (this.parseInt(group[1].Nw) > 0) {
                                let hashCompareValue = Object.keys(group[1]).sort().reduce(
                                    (obj, key) => {
                                        obj[key] = group[1][key]
                                        return obj
                                    },
                                    {}
                                )

                                hashCompareValue['windowgroup'] = group[0]
                                let groupHash = this.eventhandler.createHash(JSON.stringify(hashCompareValue))

                                if (windowgroup[0] === group[0] && hashes_included.includes(groupHash) === true) {
                                    hashes_included.splice(hashes_included.indexOf(groupHash),1)

                                    let AW_k = this.AW_k(room_entity, window, group[1])
                                    let Bw_k = this.parseInt(windowdata.Bw_k)

                                    for (var i=1;i<=2;i++) {
                                        for (var j=1;j<=4;j++) {
                                            let aref = (i - 1) * 45 + (j - 1) * 90
                                            let amax = aref + 45
                                            let amin = aref - 45

                                            Aw_ori_j = 0
                                            if ((amin <= windowgroup[1].aw_k) && (windowgroup[1].aw_k) < amax && (Bw_k >= 60)) {
                                                Aw_ori_j = AW_k * this.parseInt(group[1].Nw)
                                            }

                                            this.eventhandler.log('Aw_ori_j (' + windowgroup[1].aw_k + ' - ' + i + ' - ' + j + ')', Aw_ori_j)
                                            this.eventhandler.log('AW_k (' + windowgroup[1].aw_k + ' - ' + i + ' - ' + j + ')', AW_k)

                                            if (!Aw_cros_based_on_aref[aref]) {
                                                Aw_cros_based_on_aref[aref] = 0
                                            }

                                            Aw_cros_based_on_aref[aref] += Aw_ori_j
                                        }
                                    }
                                }
                            }
                        })
                    }
                }
            }

            for (const skydirection of Object.entries(Aw_cros_based_on_aref)) {
                let index = 2
                if ((parseInt(skydirection[0]) % 90) === 0) {
                    index = 1
                }

                Aw_cros_k[index] += 1 / Math.pow(Math.pow(skydirection[1], -2) + (Math.pow((AW_k_tot - skydirection[1]), -2)), 0.5)
            }

            this.eventhandler.log('Aw_cros_1', Aw_cros_k[1] * 0.25)
            this.eventhandler.log('Aw_cros_2', Aw_cros_k[2] * 0.25)

            Aw_cros = Math.min(Aw_cros_k[1] * 0.25, Aw_cros_k[2] * 0.25)

            let hw_st = hw_path_k_max - hw_path_k_min

            if (Aw_cros === 99999999) {
                Aw_cros = 0
            }

            this.eventhandler.log('hw_path_k_max', hw_path_k_max)
            this.eventhandler.log('hw_path_k_min', hw_path_k_min)
            this.eventhandler.log('hw_st', hw_st)
            this.eventhandler.log('AW_k_tot', AW_k_tot)
            this.eventhandler.log('Aw_cros', Aw_cros)

            //aktuell ist das noch im intervall????
            facade.push({
                window: window,
                windowdata: windowdata,
                openwindow: openwindow,
                awk: AW_k_tot,
                hw_st: hw_st,
                room_entity: room_entity,
                Aw_cros: Aw_cros
            })
        }

        if (einseitig=== true) {
            var qV_arg_in_einseitig = this.qV_arg_in_einseitig(roomkey, room_entity, interval_entity, facade[0])

            this.eventhandler.log('qV_arg_in_einseitig: ' , qV_arg_in_einseitig)

            return qV_arg_in_einseitig
        }
        else {
            var qV_arg_in_Quer = this.qV_arg_in_Quer(roomkey, interval_entity, facade[0])

            this.eventhandler.log('qV_arg_in_Quer' , qV_arg_in_Quer)

            return qV_arg_in_Quer
        }
    }

    /*
    Der durch Fensteröffnungen in die Lüftungszone eintretende Luftvolumenstrom (einseitige Lüftung) in m³/h
     */
    qV_arg_in_einseitig = (roomkey, room_entity, interval_entity, facade) => {
        //3600*rhoa_ref/rhoa_z*Aw_tot/2*max(Cwnd*u10_site^2;Cst*hw_st*abs(Ti−Te))^0,5

        var rhoa_e = this.rhoa_e(roomkey)
        var rhoa_ref = this.rhoa_ref()
        var Aw_tot = facade.awk
        var Cwnd = this.Cwnd()
        var u10_site = this.u10_site()
        var Cst = this.Cst()
        var hw_st = facade.hw_st
        var T_in = this.T_in(roomkey)
        var T_e = this.T_e()

        this.eventhandler.log('rhoa_e: (richtig)' , rhoa_e)
        this.eventhandler.log('rhoa_ref: (richtig)' , rhoa_ref)
        this.eventhandler.log('Aw_tot: (richtig)' , Aw_tot)
        this.eventhandler.log('Cwnd: (richtig)' , Cwnd)
        this.eventhandler.log('u10_site: (richtig)' , u10_site)
        this.eventhandler.log('Cst: (richtig)' , Cst)
        this.eventhandler.log('hw_st: (richtig)' , hw_st)

        return 3600 * rhoa_ref / rhoa_e * Aw_tot / 2 * Math.sqrt(Math.max((Cwnd * u10_site * u10_site), (Cst * hw_st * Math.abs(T_in - T_e))))
    }

    /*
    /hDer durch Fensteröffnungen aus der Lüftungszone austretende Luftvolumenstrom (einseitige Lüftung)  in m³
     */

    qV_arg_in_Quer = (roomkey, interval_entity, facade) => {
        var rhoa_ref = this.rhoa_ref()
        var rhoa_e = this.rhoa_e()
        var CD_w = this.CD_w()
        var Aw_tot = facade.awk
        var Aw_cros = facade.Aw_cros
        var u10_site = this.u10_site()
        var u10_site_max = this.u10_site_max()
        var dCp = this.dCp()
        var Cst = this.Cst()
        var hw_st = facade.hw_st
        var T_in = this.T_in(roomkey)
        var T_e = this.T_e()

        this.eventhandler.log('rhoa_ref', rhoa_ref)
        this.eventhandler.log('rhoa_e', rhoa_e)
        this.eventhandler.log('CD_w', CD_w)
        this.eventhandler.log('Aw_cros', Aw_cros)
        this.eventhandler.log('u10_site', u10_site)
        this.eventhandler.log('u10_site_max', u10_site_max)
        this.eventhandler.log('dCp', dCp)
        this.eventhandler.log('Aw_tot', Aw_tot)
        this.eventhandler.log('Cst', Cst)
        this.eventhandler.log('hw_st', hw_st)
        this.eventhandler.log('T_in', T_in)
        this.eventhandler.log('T_e', T_e)

        let qV_arg_in_Quer = 3600 * rhoa_ref / rhoa_e * Math.max((CD_w * Aw_cros * Math.min(u10_site, u10_site_max) * Math.pow(dCp, 0.5)), (Aw_tot / 2 * Math.pow(Cst * hw_st * Math.abs(T_in - T_e),0.5)))

        if (qV_arg_in_Quer) {
            return qV_arg_in_Quer
        }

        return 0
        //3600*rhoa_ref/rhoa_e*max(CD_w*Aw_cros*min(u10_site;u10_site_max)*(dCp)^0,5;Aw_tot/2*(Cst*hw_st*abs(Ti−Te))^0,5)
    }
    

    Ce_k = (room_entity) => {
        var u10_site = this.u10_site(room_entity)
        var T_e = this.T_e()

        this.eventhandler.log('u10_site (richtig)', u10_site)
        this.eventhandler.log('T_e (richtig)', T_e)

        return 1;
        //return Math.min(1, Math.max(0 , ((1 - 0.1 * u10_site) * (((T_e - 273.15) / 25) + 0.2))))
    }


    Aw_tot = (room_entity, interval_entity) => {
        var Aw_tot = 0

        if (room_entity.windowgroups) {
            for (const windowgroup of Object.entries(room_entity.windowgroups)) {
                if (windowgroup[1].windowtypes) {
                    //fenster daten
                    var window = this.eventhandler.projectdata.dayprofile.windowtypes[windowgroup[1].windowtypes]
                    //var windowdata = windowgroup[1].windowdata[0]

                    if (interval_entity.windows && interval_entity.windows[0]) {
                        Object.entries(interval_entity.windows[0].group).map((group, groupkey) => {
                            var AW_k = this.AW_k(room_entity, window, group[1])

                            this.eventhandler.log('AW_k: (richtig)' , AW_k)

                            if (group[1].Nw) {
                                Aw_tot += AW_k * this.parseFloat(group[1].Nw)
                            }
                        })
                    }
                }
            }
        }

        return Aw_tot
    }

    //Himmelsrichtung
    AW_k = (room_entity, window, windowgroup) => {
        var RW_arg_k = this.RW_arg_k(room_entity, window, windowgroup)
        var AW_max_k = this.AW_max_k(window)

        this.eventhandler.log('RW_arg_k: (richtig)' , RW_arg_k)
        this.eventhandler.log('AW_max_k: (richtig)' , AW_max_k)

        return RW_arg_k * AW_max_k
    }

    RW_arg_k = (room_entity, window, windowgroup) => {
        var Ce_k = this.Ce_k(room_entity)
        var Cw_kind_k = this.Cw_kind_k(window, windowgroup)

        this.eventhandler.log('Ce_k: (richtig)' , Ce_k)
        this.eventhandler.log('Cw_kind_k: (richtig)' , Cw_kind_k)

        return Cw_kind_k * Ce_k
    }

    //coefficient depending on the kind of window
    Cw_kind_k = (window, windowgroup) => {
        switch(true) {
            case(window.type === 'Drehfenster'):
                return 1

            case(window.type === 'Schiebefenster'):
                return 0.5

            case(window.type === 'Klappfenster'):
                var alpha_k = this.alpha_k(windowgroup) // * Math.PI / 180 ??

                return ((2.6 * Math.pow(10, -7)) * Math.pow(alpha_k, 3)) - (1.19 * Math.pow(10, -4) * Math.pow(alpha_k, 2)) + ((1.86 * Math.pow(10,-2)) * alpha_k)
            default:
                return 0.3
        }
    }

    //Maximale Öffnungsfläche des Fensters (in m²)
    AW_max_k = (window) => {
        return this.parseFloat(window.AW_max_k)
    }

    u10_site = (room_entity) => {
        var Crgh_10_site = this.Crgh_10_site(room_entity)
        var Ctop_10_site = this.Ctop_10_site()
        var v_meteo = this.v_meteo()
        var Crgh_met = this.Crgh_met()
        var Ctop_met = this.Ctop_met()

        this.eventhandler.log('Crgh_10_site: ' , Crgh_10_site)
        this.eventhandler.log('Ctop_10_site: ' , Ctop_10_site)
        this.eventhandler.log('v_meteo: ' , v_meteo)
        this.eventhandler.log('Crgh_met: ' , Crgh_met)
        this.eventhandler.log('Ctop_met: ' , Ctop_met)

        //Crgh_10_site*Ctop_10_site/Crgh_met/Ctop_met*v_meteo

        return Crgh_10_site * Ctop_10_site / Crgh_met / Ctop_met * v_meteo
    }

    Crgh_met = () => {
        return 1
    }

    Ctop_met = () => {
        return 1
    }

    f_Abschirmung = (room_entity) => {
        return this.eventhandler.projectdata.buildingdetails.abschirmung
    }

    Crgh_10_site = (room_entity) => {
        var Abs = this.f_Abschirmung(room_entity)

        switch(true) {
            case (Abs === 'open'):
                return 1.0
                break
            case (Abs === 'regular'):
                return 0.9
                break
            case (Abs === 'closed'):
                return 0.8
                break
        }

        return 1
    }

    Ctop_10_site = () => {
        return 1
    }

    Aw_cros = (facade, Aw_tot) => {
        let Aw_cros_1 = 1
        let Aw_cros_2 = 1
        let Aw_ori_j = 0

        //0,25*sum(1/(1/Aw_ori_j^2+1/(Aw_tot-Aw_ori_j)^2)^0,5)
        //0,25*sum(1/(1/Aw_ori_j^2+1/(Aw_tot-Aw_ori_j)^2)^0,5)

        //Äquivalente Fensterfläche in Bezug auf die betreffende Orientierung in m²

        return Math.min(Aw_cros_1, Aw_cros_2)
    }

    dCp = () => {
        //Standardwert = 0,75 oder von der Tabelle B.7 bezogen auf H_Grund_Zone, Abschirmung und Orientierung der Fenster
        return 0.75
    }


    /*
         _________
        / ======= \
       / __________\
      | ___________ |
      | | -       | |
      | |         | |
      | |_________| |________________________________________
      \=____________/   scheint plausible zu funktionieren   )
      / """"""""""" \                                       /
     / ::::::::::::: \                                   =D-'
    (_________________)
     */

    Cwnd = () => {
        return 0.001
    }

    rhoa_ref = () => {
        return 1.204
    }

    Cst = () => {
        return 0.0035
    }

    Te_ref = () => {
        return 293.15
    }

    rhoa_z = (roomkey) => {
        var Te_ref = this.Te_ref()
        var rhoa_ref = this.rhoa_ref()
        var T_in = this.T_in(roomkey)

        return Te_ref * rhoa_ref / T_in
    }


    rhoa_e = (roomkey) => {
        var Te_ref = this.Te_ref()
        var rhoa_ref = this.rhoa_ref()
        var T_e = this.T_e()

        return Te_ref * rhoa_ref / T_e
    }

    CD_w = () => {
        return 0.67
    }

    u10_site_max = () => {
        return 3
    }
}
