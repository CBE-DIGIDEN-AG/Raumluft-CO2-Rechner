import EventHandler from "../eventhandler";

export default class base {
    eventhandler = null

    //singleton interface
    constructor() {
        this.eventhandler = new EventHandler()
    }

    parseFloat = (str) => {
        if (!str) {
            return 0
        }

        if (typeof str === 'string') {
            return parseFloat(str.replace(',', '.'))
        }

        return str
    }

    parseInt = (str) => {
        if (!str) {
            return 0
        }

        if (typeof str === 'string') {
            return parseInt(str)
        }

        return str
    }

    //CO2 -Konzentration im Raum am Ende des betrachteten Zeitintervalls in ppm
    //t in sekunden
    cRAL_t = ({roomkey, room_entity, intervalkey, interval_entity, t, t0, cRAL_t0}) => {
        try {
            if (!cRAL_t0) {
                throw new Error('cRAL_t0 is not defined');
            }

            //ppm + (einheitslos)*1e6 - (ppm - ppm + einheitslos) * exp(ℓ/h * (s) / m3 / 3600)
            //cAUL + (sum(N_t_j*VmE_j)/VAUL_t) * 1e6 - (cAUL-cRAL_t0+(sum(N_t_j*VmE_j)/VAUL_t)*1e6)*exp(-VAUL_t*(t-t0)/VR/3600)

            let cAUL = this.cAUL()
            let VAUL_t = this.VAUL_t(roomkey, intervalkey, interval_entity, room_entity)
            let VR = this.VR(roomkey)

            let exp = Math.exp((VAUL_t * -1 / 1000) * ((t - t0) / 60) / VR)

            //l/person je h
            let VmE_N_t = this.VmE_N_t(roomkey, intervalkey)

            //einheitslos
            let part2 = ((VmE_N_t / VAUL_t) * 1e6)
            let part3 = (cAUL - cRAL_t0 + part2) * exp

            this.eventhandler.log('exp ' , exp)
            this.eventhandler.log('cAUL (CO2 -Konzentration der Außenluft) ' , cAUL)
            this.eventhandler.log('VR (Raumvolumen in m3)', VR)
            this.eventhandler.log('VmE_N_t (personenbezogener CO2-Volumenstrom in ℓ/(h·Person) aller Personen im Raum)', VmE_N_t)
            this.eventhandler.log('VAUL_t (Außenluftvolumenstrom in ℓ/h)', VAUL_t)
            this.eventhandler.log('VAUL_t (Außenluftvolumenstrom in ℓ/h)', VAUL_t)
            this.eventhandler.log('cRAL_t0', cRAL_t0)
            this.eventhandler.log('part2', part2)
            this.eventhandler.log('part3', part3)
            this.eventhandler.log('cRAL_t: ' , (cAUL + part2 - part3))

            return cAUL + part2 - part3
        } catch (e) {
            const [, filename, line, column ] = e.stack.match(/\/([\/\w-_\.]+\.js):(\d*):(\d*)/)

            this.eventhandler.log(e, filename.replace(/^.*[\\/]/, '') + ' Line: ' + line, 'error')
        }
    }

    //Anzahl der Personen im Raum zum Zeitpunkt t
    N_t = (roomkey, interval) => {
        var count = 0

        if (this.eventhandler.projectdata['dayprofile']['usageprofiles'][roomkey] && this.eventhandler.projectdata['dayprofile']['usageprofiles'][roomkey].intervals[interval]) {
            var interval = this.eventhandler.projectdata['dayprofile']['usageprofiles'][roomkey].intervals[interval]
            count += parseInt(interval.count_teacher)
            count += parseInt(interval.count_students)
            count += parseInt(interval.count_prestudents)
        }

        return count
    }

    VmE = () => {

    }

    //personenbezogener CO2-Volumenstrom in ℓ/(h·Person) aller Personen im Raum
    // TODO scheint korrekt zu arbeiten
    VmE_N_t = (roomkey, intervalkey) => {
        //personenbezogener CO2-Volumenstrom in ℓ/(h·Person)
        //Tabelle 1 bzw. freie Angabe
        //freie Eingabe fehlt hier noch in der Erfassung

        if (this.eventhandler.projectdata['dayprofile']['usageprofiles'][roomkey] && this.eventhandler.projectdata['dayprofile']['usageprofiles'][roomkey].intervals[intervalkey]) {
            var interval = this.eventhandler.projectdata['dayprofile']['usageprofiles'][roomkey].intervals[intervalkey]

            let count_students = 0
            if (interval.count_students) {
                count_students = parseInt(interval.count_students)
            }

            let count_teacher = 0
            if (interval.count_teacher) {
                count_teacher = parseInt(interval.count_teacher)
            }

            let count_prestudents = 0
            if (interval.count_prestudents) {
                count_prestudents = parseInt(interval.count_prestudents)
            }

            let emissionrateTeacher = 0
            let emissionrateStudents = 0
            let emissionratePrestudents = 0

            if (interval.emissionrate_teacher) {
                emissionrateTeacher = this.parseFloat(interval.emissionrate_teacher)
                emissionrateTeacher = emissionrateTeacher * parseInt(count_teacher)
            }

            if (interval.emissionrate_students) {
                emissionrateStudents = this.parseFloat(interval.emissionrate_students)
                emissionrateStudents = emissionrateStudents * parseInt(count_students)
            }

            if (interval.emissionrate_prestudents) {
                emissionratePrestudents = this.parseFloat(interval.emissionrate_prestudents)
                emissionratePrestudents = emissionratePrestudents * parseInt(count_prestudents)
            }

            return emissionrateTeacher + emissionrateStudents + emissionratePrestudents
        }

        return 0
    }


    //TODO muss in 4108
    //Höhe der Öffnungen von Unter- bis Oberkante der Fassadengruppe 1 (Fensteröffnung), in m
    h_1_i = (facade) => {
        let h_1_i_max = [0]

        for (const window_in_facade of facade) {
            h_1_i_max.push(this.parseFloat(window_in_facade.window.h_k))
        }

        return Math.max(...h_1_i_max)
    }

    Win_Typ = (window) => {
        return window.win_Typ
    }

    //Außenluftvolumenstrom in ℓ/h
    VAUL_t = (roomkey, intervalkey, interval_entity, room_entity) => {
        let q_v_Fe_i = this.q_v_Fe_i(roomkey, intervalkey, interval_entity, room_entity)
        let q_v_mech = this.q_v_mech(roomkey, intervalkey)
        let q_v_inf_i = this.q_v_inf_i(roomkey, interval_entity)

        this.eventhandler.log('q_v_Fe_i (Luftvolumenstrom durch Fensteröffnung im Raum i in m³/h)' , q_v_Fe_i)
        this.eventhandler.log('q_v_mech (Luftvolumenstrom der Lüftungsanlageim Raum i in m³/h)' , q_v_mech)
        this.eventhandler.log('q_v_inf_i (Luftvolumenstrom aufgrund der Undichtheiten in der Gebäudehülle in m³/h)' , q_v_inf_i)

        //return ℓ/h
        return (q_v_Fe_i + q_v_mech + q_v_inf_i) * 1000
    }

    //Luftvolumenstrom aufgrund der Undichtheiten in der Gebäudehülle in m³/h
    q_v_inf_i = (roomkey, interval_entity) => {
        let ninf = this.ninf(roomkey, interval_entity)
        let VR = this.VR(roomkey)

        this.eventhandler.log('ninf (Tagesmittelwert des Infiltrationsluftwechsels in 1/h): ' + ninf)
        this.eventhandler.log('VR (Raumvolumen in m3): ' + VR)

        return ninf * VR
    }

    // wenn Anl = Fensterlüftung: n50*e*fATD
    // wenn Anl = Mechanische Lüftung oder Hybridlüftung: n50*e*fATD*(1+(fe-1)*tv_mech/24)
    // Rückgabe in l/h
    ninf = (roomkey, interval_entity) => {
        let Anl = this.Anl(roomkey)
        let n50 = this.n50(roomkey)
        let fATD = this.fATD(roomkey)
        let e = this.e()

        this.eventhandler.log('Anl (Wie wird der Raum belüftet?): ' , Anl)
        this.eventhandler.log('n50 (Luftwechsel bei 50 Pa Druckdifferenz in 1/h LDH) : ' , n50)
        this.eventhandler.log('fATD: (einheitenlos)' , fATD)

        //TODO Einheiten prüfen

        if (Anl === 'window') {
            return n50 * fATD * e
        } else {
            let fe = this.fe(interval_entity, roomkey)
            let tv_mech = this.tv_mech(interval_entity)
            let e = this.e()

            this.eventhandler.log('fe (einheitenlos) : ' , fe)
            this.eventhandler.log('tv_mech (Die tägliche Betriebsdauer der Lüftungsanlage (in h)): ' , tv_mech)

            //TODO / 24 scheint nicht korrekt zu sein
            return n50 * e * fATD * (1 + (fe - 1) * tv_mech / 24)
        }
    }

    // wenn ADL = Außenluftdurchlässe vorhanden: min(16;(n50+1,5)/n50)
    // wenn ADL = Außenluftdurchlässe nicht vorhanden: 1
    fATD = (roomkey) => {
        if (this.eventhandler.projectdata.buildingdetails.fATD && this.eventhandler.projectdata.buildingdetails.fATD === 'ja') {
            let n50 = this.n50(roomkey)

            return Math.min(16, ((n50 + 1.5) / n50))
        }

        return 1
    }

    //Wie wird der Raum belüftet?
    Anl = (roomtypekey) => {
        if (this.eventhandler.projectdata.dayprofile.roomtypes[roomtypekey]) {
            return this.eventhandler.projectdata.dayprofile.roomtypes[roomtypekey].Anl
        }
    }

    //Faktor zur Bewertung der durch die mechanische Lüftungsanlage vermehrten oder verminderten Infiltration in -
    // wenn Bal = Ja: 1
    // wenn Bal = Nein: 1/(1+f/e*((nETA-nSUP)/n50/fATD)^2)
    fe = (interval_entity, roomkey) => {
        let Bal = this.Bal(interval_entity)

        if (Bal === true) {
            return 1
        } else {
            let f = this.f()
            let e = this.e()
            let nETA = this.nETA(interval_entity)
            let nSUP = this.nSUP(interval_entity)
            let n50 = this.n50(roomkey)
            let fATD = this.fATD()

            this.eventhandler.log('nETA: ' + nETA)
            this.eventhandler.log('nSUP: ' + nSUP)
            this.eventhandler.log('n50: ' + n50)
            this.eventhandler.log('fATD: ' + fATD)

            return 1 / (1 + f / e * Math.pow(((nETA - nSUP) / n50 / fATD), 2))
        }
    }

    //Ist die mechanische Lüftungsanlage balanciert (Zuluft = Abluft)?
    Bal = (interval_entity) => {
        if (interval_entity.Bal === 'ja') {
            return true
        }

        return false
    }

    //Die Summe über die Zuluftwechsel der mechanischen Lüftung und der aus benachbarten Zonen überströmenden Luft in 1/h
    nETA = (interval_entity) => {
        if (interval_entity.nETA) {
            return this.parseFloat(interval_entity.nETA)
        }

        return 0
    }

    //Die Summe über die Abluftwechsel der mechanischen Lüftung
    nSUP = (interval_entity) => {
        if (interval_entity.nSUP) {
            return this.parseFloat(interval_entity.nSUP)
        }

        return 0
    }

    tv_mech = (interval_entity) => {
        if (interval_entity.tv_mech) {
            return this.parseFloat(interval_entity.tv_mech)
        }

        return 0
    }

    //Nettovolumen des Gebäudes in m³
    VB = () => {
        if (this.eventhandler.projectdata.buildingdetails.VB) {
            return this.parseFloat(this.eventhandler.projectdata.buildingdetails.VB)
        }

        return 0
    }

    //Hüllflächenbezogene Luftdurchlässigkeit bei 50 Pa Druckdifferenz in m³/(m²h) (q50)
    q50 = () => {
        if (this.eventhandler.projectdata.buildingdetails) {
            return this.parseFloat(this.eventhandler.projectdata.buildingdetails.q50)
        }
    }

    //Luftwechsel bei 50 Pa Druckdifferenz in 1/h LDH
    n50 = (roomkey) => {
        if (this.eventhandler.projectdata.buildingdetails) {
            let nettovolumen = this.VB()

            this.eventhandler.log('nettovolumen: ' , nettovolumen)

            if (nettovolumen <= 1500) {
                if (this.eventhandler.projectdata.buildingdetails.LDH.base === 'messasure') {
                    return this.parseFloat(this.eventhandler.projectdata.buildingdetails.n50)
                } else {
                    //vorgabewert
                    return this.parseFloat(this.eventhandler.projectdata.buildingdetails.n50)
                }
            } else {
                let q50 = this.q50()
                let Ae = this.Ae(roomkey)
                let VR = this.VR(roomkey)

                this.eventhandler.log('q50: ' , q50)
                this.eventhandler.log('Ae: ' , Ae)
                this.eventhandler.log('VR: ' , VR)
                this.eventhandler.log('q50 * Ae / VR ' , (q50 * Ae / VR))

                return q50 * Ae / VR
            }
        }

        return 0
    }

    //Wärmeübertragende Umfassungsfläche des Raums in m²
    Ae = (roomtypekey) => {
        if (this.eventhandler.projectdata.dayprofile.roomtypes[roomtypekey]) {
            let roomkey = this.eventhandler.projectdata.dayprofile.roomtypes[roomtypekey].room

            return this.parseFloat(this.eventhandler.projectdata.dayprofile.rooms[roomkey].Ae)
        }

        return 0
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

    //scheint plausible zu funktionieren

    relwindowdetail = (roomkey, window) => {
        if (!this.eventhandler.projectdata.dayprofile.relwindowroomtypes[roomkey]) {
            return false
        }

        if (!this.eventhandler.projectdata.dayprofile.relwindowroomtypes[roomkey].detaildata[window.key]) {
            return false
        }

        return this.eventhandler.projectdata.dayprofile.relwindowroomtypes[roomkey].detaildata[window.key]
    }

    h_Bruest_k = (relwindowdetail) => {
        if (relwindowdetail.h_Bruest_k) {
            return relwindowdetail.h_Bruest_k
        }

        return 0
    }


    alpha_k = (windowgroup) => {
        if (!windowgroup.alpha_k) {
            return 0
        }

        return this.parseFloat(windowgroup.alpha_k)
        //alpha_k Öffnungswinkel des gekippten Fensters k, in °
    }


    q_v_mech = (roomkey, interval) => {
        //"Luftvolumenstrom der Lüftungsanlage (in m³/h) *[nur bei mechanischer oder hybrider Lüftung]"
        if (this.eventhandler.projectdata['dayprofile']['usageprofiles'][roomkey] && this.eventhandler.projectdata['dayprofile']['usageprofiles'][roomkey].intervals[interval]) {
            var interval = this.eventhandler.projectdata['dayprofile']['usageprofiles'][roomkey].intervals[interval]

            if (interval.q_v_mech) {
                return this.parseFloat(interval.q_v_mech)
            }
        }

        return 0
    }

    //CO2 -Konzentration der Außenluft in ppm (Nutzereingabe)
    cAUL = () => {
        return this.parseFloat(this.eventhandler.projectdata.dayprofile.cAUL)
    }

    VR = (roomkey) => {
        //A*H
        return this.A(roomkey) * this.H(roomkey)
    }

    A = (roomtypekey) => {
        //Nutzfläche des Raums in m²
        if (this.eventhandler.projectdata.dayprofile.roomtypes[roomtypekey]) {
            let roomkey = this.eventhandler.projectdata.dayprofile.roomtypes[roomtypekey].room

            return this.parseFloat(this.eventhandler.projectdata.dayprofile.rooms[roomkey].A)
        }

        return 0
    }

    H = (roomtypekey) => {
        //Lichte Raumhöhe in m
        if (this.eventhandler.projectdata.dayprofile.roomtypes[roomtypekey]) {
            let roomkey = this.eventhandler.projectdata.dayprofile.roomtypes[roomtypekey].room

            return this.parseFloat(this.eventhandler.projectdata.dayprofile.rooms[roomkey].H)
        }

        return 0
    }

    v_meteo = () => {
        return this.parseFloat(this.eventhandler.projectdata.dayprofile.v_meteo)
    }

    C_D = () => {
        return 0.61
    }


    //Außentemperatur
    T_e = () => {
        let t_e = 0
        if (this.eventhandler.projectdata['dayprofile'] && this.eventhandler.projectdata['dayprofile'].t_e) {
            t_e = parseInt(this.eventhandler.projectdata['dayprofile'].t_e)
        }

        return t_e + 273
    }

    //Innentemperatur
    T_in = (roomtypekey) => {
        let t_in = 0

        if (this.eventhandler.projectdata.dayprofile.roomtypes[roomtypekey].room) {
            let roomkey = this.eventhandler.projectdata.dayprofile.roomtypes[roomtypekey].room

            if (this.eventhandler.projectdata['dayprofile']['rooms'][roomkey].t_in) {
                t_in = parseInt(this.eventhandler.projectdata['dayprofile']['rooms'][roomkey].t_in)
            }
        }

        return t_in + 273
    }

    H_Grund_Zone = (room_entity) => {
        //mittlere Höhe der Lüftungszone über Erdreichniveau (in m)
        if (room_entity && room_entity.hasOwnProperty('key') && this.eventhandler.projectdata.dayprofile.relwindowroomtypes[room_entity.key]) {
            return this.parseFloat(this.eventhandler.projectdata.dayprofile.relwindowroomtypes[room_entity.key].H_Grund_Zone)
        }
        
        return 0
    }

    dC_p = (room_entity) => {
        //f_Abschirmung * f_Höhe
        this.eventhandler.log('f_Abschirmung', this.f_Abschirmung(room_entity))
        this.eventhandler.log('f_Hoehe', this.f_Hoehe(room_entity))

        return this.f_Abschirmung(room_entity) * this.f_Hoehe(room_entity)
    }

    f_Hoehe = (room_entity) => {
        var H_Grund_Zone = this.parseFloat(this.H_Grund_Zone(room_entity))

        switch (true) {
            case (H_Grund_Zone <= 15):
                return 0.75
                break
            case (H_Grund_Zone <= 50):
                return 0.9
                break
            case (H_Grund_Zone > 50):
                return 1.0
        }
    }

    b_k = (window) => {
        //Fensterbreite (in m)*

        return window.b_k
    }

    x_k = (windowgroup) => {
        //Fensterbreite (in m)*
        return windowgroup.x_k
    }

    d_k = (window) => {
        //Rahmendicker Schingfenster (in cm)*

        return this.parseFloat(window.d_k)
    }

    //Lamellenanzahl
    n_k = (window) => {
        return window.n_k
    }

    h_k = (window) => {
        //Fensterhöhe (in m)*

        return window.h_k
    }

    einseitig = (roomkey) => {
        if (
            this.eventhandler.projectdata.dayprofile.relwindowroomtypes[roomkey] &&
            this.eventhandler.projectdata.dayprofile.relwindowroomtypes[roomkey].einseitig &&
            this.eventhandler.projectdata.dayprofile.relwindowroomtypes[roomkey].einseitig === 'ja'
        ) {
            return true
        }

        return false
    }

    f = () => {
        return 15
    }

    e = () => {
        return 0.07
    }
}
