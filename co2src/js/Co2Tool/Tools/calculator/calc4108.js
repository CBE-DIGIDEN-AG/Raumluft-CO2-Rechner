import base from "./base"
import roomtype from "../../Page/Pages/Dayprofile/Detailpages/roomtype";
import eventHandler from "bootstrap/js/src/dom/event-handler";
export default class calc4108 extends base {
    //max(q_v_Fe_Fas1_i + q_v_Fe_Fas2_i ; q_v_Fe_12_i)
    //Gesamtluftvolumenstrom über das geöffnete Fenster im Raum i in m³/h
    q_v_Fe_i = (roomkey, intervalkey, interval_entity, room_entity) => {
        let maxvalues = [0]
        let einseitig = this.einseitig(roomkey)
        let dT = this.dT(roomkey)

        let q_v_Fe_Fas1_i = 0
        let q_v_Fe_Fas2_i = 0
        let q_v_Fe_Fas12_i = 0
        let A_Fe_Fas1_i = 0
        let A_Fe_Fas2_i = 0
        let y_a_i = 0
        let y_b_i = 0

        //bei einseitiger lüftungen haben wir keine Himmelrichtung
        //also nur 1ne Fassade
        var facade = {}
        
        //gehe durch alle fenstergruppen und schaue nach der Himmelsrichtung
        for (const windowgroup of Object.entries(room_entity.windowgroups)) {
            if (!windowgroup[1]) {
                continue;
            }

            let varname_no = 'no_Fe'
            let varname_oz = 'oz_Fe'
            var awk = ''

            if (einseitig === false) {
                switch(windowgroup[1].aw_k) {
                    case ('0'):
                        varname_no += '_S'
                        varname_oz += '_S'
                        awk = 'S'
                        break
                    case ('90'):
                        varname_no += '_W'
                        varname_oz += '_W'
                        awk = 'W'
                        break
                    case ('180'):
                        varname_no += '_N'
                        varname_oz += '_N'
                        awk = 'N'
                        break
                    case ('270'):
                        varname_no += '_O'
                        varname_oz += '_O'
                        awk = 'O'
                        break
                }
            }
            varname_no += '_k'

            this.eventhandler.log('varname_no', varname_no)
            this.eventhandler.log('varname_oz', varname_oz)

            if (windowgroup[1] && windowgroup[1].windowtypes) {
                //fenster daten
                var window = this.eventhandler.projectdata.dayprofile.windowtypes[windowgroup[1].windowtypes]
                var windowdata = windowgroup[1].windowdata[0]

                //öffnungszustände
                if (interval_entity.windows && interval_entity.windows[0]) {
                    Object.entries(interval_entity.windows[0].group).map((group, groupkey) => {
                        //geöffnete Fenster in fasaden packen
                        if (group[1][varname_no] > 0) {
                            if (!facade[varname_no]) {
                                facade[varname_no] = []
                            }

                            //TODO problem
                            //let hashCompareValue = group[1]
                            let hashCompareValue = windowgroup[1]
                            hashCompareValue['windowgroup'] = windowgroup[0]
                            

                            if (windowgroup[0] === (parseInt(group[0])).toString()) {
                                let groupHash = this.eventhandler.createHash(JSON.stringify(hashCompareValue))

                                const found = facade[varname_no].find((element) => {
                                    return (element.grouphash === groupHash)
                                })

                                if (!found) {
                                    facade[varname_no].push({
                                        grouphash: groupHash,
                                        window: window,
                                        windowdata: windowdata,
                                        openwindow: parseInt(group[1][varname_no]),
                                        awk: awk,
                                        room_entity: room_entity,
                                        oz_Fe: group[1][varname_oz],
                                        alpha_k: this.parseFloat(group[1].alpha_k),
                                        x_k: this.parseFloat(group[1].x_k)
                                    })
                                }
                            }
                        }
                    })
                }
            }
        }

        //console.log(facade)

        if (Object.keys(facade).length === 0) {
            //kein fenster geöffnet
            return 0
        }

        Object.entries(facade).map((facadeitem) => {
            let A_facade = 0
            let y_fascade = 0
            let y_a_i_fascade = 0

            for (const window_in_facade of facadeitem[1]) {

                let A_Fe_k = this.A_Fe_k(window_in_facade)
                //Schwerpunkthöhe der Öffnungsfläche des Fensters k, in m
                let y_Fe_k = this.y_Fe_k(window_in_facade)
                let no_Fe_k = parseInt(window_in_facade.openwindow)

                this.eventhandler.log('A_Fe_k', A_Fe_k)
                this.eventhandler.log('no_Fe_k', no_Fe_k)
                this.eventhandler.log('y_Fe_k', y_Fe_k)

                //öffnungsfläche eines Fensters * Anzahl der Fenster (vom selben Typ)
                let A = A_Fe_k * no_Fe_k
                A_facade += A
                //TODO ka ob das stimmt
                y_fascade += y_Fe_k
                y_a_i_fascade += (A * y_Fe_k)
            }

            facade[facadeitem[0]].A = A_facade
            facade[facadeitem[0]].y = y_fascade
            facade[facadeitem[0]].y_a_i = y_a_i_fascade
        })

        //zuerst brauche ich die information welche fasada "a" ist
        //facade_a = die Fassade mit der größten Öffnungsweite
        let [facade_a] = Object.keys(facade) // key für Fassade "a"
        let A_compare = 0
        Object.entries(facade).map((facadeitem) => {
            if (facadeitem[1].A > A_compare) {
                A_compare = facadeitem[1].A
                facade_a = facadeitem[0]
            }
        })

        //korrekt auch bei mehrseitiger lüftung
        //console.log(facade)
        this.eventhandler.log('Fascade A', facade_a)

        // (Die Fassaden werden im Uhrzeigersinn, beginnend mit der Fassade mit der größten Öffnungsfläche (Fassade „a“) indiziert.
        // Sollten hierfür mehrere Fassaden mit gleich großer Öffnungsfläche infrage kommen, ist „a“ derjenigen zuzuordnen,
        // welcher der Hauptwindrichtung am nächsten liegt — d.h. deren Winkel zu ihr am kleinsten ist.
        // Als Hauptwindrichtung kann in Deutschland „West“ angenommen werden.)

        //TODO
        //this.eventhandler.log(facade)
        //für fassada a, fassade b und fassade 1-2-quer
        Object.entries(facade).map((facadeitem) => {
            if (facadeitem[0] === facade_a) {
                let q_v_Fe_Fas1_th_i = this.q_v_Fe_FasX_th_i(facadeitem, dT)
                let q_v_Fe_Fas1_w_i = this.q_v_Fe_FasX_w_i(facadeitem, dT)
                q_v_Fe_Fas1_i = this.q_v_Fe_Fas1_i(q_v_Fe_Fas1_th_i, q_v_Fe_Fas1_w_i)
                A_Fe_Fas1_i = facadeitem[1].A
                y_a_i = facadeitem[1].y_a_i

                this.eventhandler.log('q_v_Fe_Fas1_th_i (thermisch  induzierte  Luftvolumenstrom:): ' , q_v_Fe_Fas1_th_i)
                this.eventhandler.log('q_v_Fe_Fas1_w_i (windinduzierte Luftvolumenstrom): ' , q_v_Fe_Fas1_w_i)
                this.eventhandler.log('q_v_Fe_Fas1_i: ' , q_v_Fe_Fas1_i)
            }
            else {
                let q_v_Fe_Fas2_th_i = this.q_v_Fe_FasX_th_i(facadeitem, dT)
                let q_v_Fe_Fas2_w_i = this.q_v_Fe_FasX_w_i(facadeitem, dT)
                q_v_Fe_Fas2_i += this.q_v_Fe_Fas1_i(q_v_Fe_Fas2_th_i, q_v_Fe_Fas2_w_i)
                A_Fe_Fas2_i += facadeitem[1].A
                y_b_i += facadeitem[1].y_a_i

                this.eventhandler.log('q_v_Fe_Fas2_th_i (thermisch  induzierte  Luftvolumenstrom:): ' , q_v_Fe_Fas2_th_i)
                this.eventhandler.log('q_v_Fe_Fas2_w_i (windinduzierte Luftvolumenstrom): ' , q_v_Fe_Fas2_w_i)
            }
        })

        this.eventhandler.log('y_a_i: ' , y_a_i)
        this.eventhandler.log('y_b_i: ' , y_b_i)

        //if user has selected "querlüftung" but there is only 1 fascade -> simulate "einsetig"
        if (Object.values(facade).length < 2) {
            einseitig = true;
        }

        if (einseitig === false) {
            let y_1_i = y_a_i / A_Fe_Fas1_i
            let y_2_i = y_b_i / A_Fe_Fas2_i

            this.eventhandler.log('y_1_i: ' , y_1_i)
            this.eventhandler.log('y_2_i: ' , y_2_i)

            let q_v_Fe_12_th_i = this.q_v_Fe_12_th_i(roomkey, A_Fe_Fas1_i, A_Fe_Fas2_i, y_1_i, y_2_i)
            let q_v_Fe_12_w_i = this.q_v_Fe_12_w_i(roomkey, room_entity, A_Fe_Fas1_i, A_Fe_Fas2_i)

            q_v_Fe_Fas12_i = this.q_v_Fe_Fas12_i(q_v_Fe_12_th_i, q_v_Fe_12_w_i)

            this.eventhandler.log('q_v_Fe_12_th_i (thermisch  induzierte  Luftvolumenstrom:)' , q_v_Fe_12_th_i)
            this.eventhandler.log('q_v_Fe_12_w_i (Bei gemeinsamer Durchströmung (zweiseitiger Lüftung) wird der windinduzierte Luftvolumenstrom bestimmt mit)' , q_v_Fe_Fas12_i)
        }

        this.eventhandler.log('q_v_Fe_Fas1_i: ' , q_v_Fe_Fas1_i)
        this.eventhandler.log('q_v_Fe_Fas2_i: ' , q_v_Fe_Fas2_i)
        this.eventhandler.log('q_v_Fe_Fas12_i: ' , q_v_Fe_Fas12_i)

        maxvalues.push(q_v_Fe_Fas1_i)
        maxvalues.push(q_v_Fe_Fas2_i)
        maxvalues.push(q_v_Fe_Fas12_i)

        this.eventhandler.log('q_v_Fe_i maxvalues ()', maxvalues)

        return Math.max(...maxvalues)
    }

    q_v_Fe_Fas12_i = (q_v_Fe_12_th_i, q_v_Fe_12_w_i) => {
        return Math.sqrt(Math.pow(q_v_Fe_12_th_i,2) + Math.pow(q_v_Fe_12_w_i ,2))
    }


    //Bei  gemeinsamer  Durchströmung  (zweiseitiger  Lüftung)  wird  der  thermisch  induzierte  Luftvolumenstrom  bestimmt mit:
    q_v_Fe_12_th_i = (roomkey, A_Fe_Fas1_i, A_Fe_Fas2_i, y_1_i, y_2_i) => {
        let C_D = this.C_D()
        let A_eff_i = this.A_eff_i(A_Fe_Fas1_i, A_Fe_Fas2_i)
        let g = this.g()
        let h_12_i = this.h_12_i(y_1_i, y_2_i)
        let dT = this.dT(roomkey)
        let T_e = this.T_e()

        this.eventhandler.log('A_Fe_Fas1_i ' , A_Fe_Fas1_i)
        this.eventhandler.log('A_Fe_Fas2_i ' , A_Fe_Fas2_i)
        this.eventhandler.log('y_1_i ' , y_1_i)
        this.eventhandler.log('y_2_i ' , y_2_i)
        this.eventhandler.log('C_D ' , C_D)
        this.eventhandler.log('A_eff_i' , A_eff_i)
        this.eventhandler.log('g ' , g)
        this.eventhandler.log('h_12_i' , h_12_i)
        this.eventhandler.log('y_1_i' , y_1_i)
        this.eventhandler.log('y_2_i' , y_2_i)
        this.eventhandler.log('dT ' , dT)
        this.eventhandler.log('T_e ' , T_e)

        return 3600 * C_D * A_eff_i * Math.sqrt(2 * g * h_12_i * dT / T_e)
    }

    //Bei gemeinsamer Durchströmung (zweiseitiger Lüftung) wird der windinduzierte Luftvolumenstrom bestimmt mit
    q_v_Fe_12_w_i = (roomkey, room_entity, A_Fe_Fas1_i, A_Fe_Fas2_i) => {
        let C_D = this.C_D()
        let A_eff_i = this.A_eff_i(A_Fe_Fas1_i, A_Fe_Fas2_i)
        let dC_p = this.dC_p(room_entity)
        let v_Fas = this.v_Fas(room_entity)

        this.eventhandler.log('C_D ' , C_D)
        this.eventhandler.log('A_eff_i (wirksame Öffnungsfläche bei gemeinsamer Durchströmung (zweiseitiger Lüftung))' , A_eff_i)
        this.eventhandler.log('dC_p ' , dC_p)
        this.eventhandler.log('v_Fas ' , v_Fas)

        return 3600 * C_D * A_eff_i * Math.sqrt(dC_p) * v_Fas
    }

    A_eff_i = (A_Fe_Fas1_i, A_Fe_Fas2_i) => {
        if (A_Fe_Fas2_i > 0) {
            return 1 / Math.sqrt(Math.pow(A_Fe_Fas1_i, -2) + Math.pow(A_Fe_Fas2_i, -2))
        }

        return 0
    }

    h_12_i = (y_1_i, y_2_i) => {
        return Math.abs(y_1_i - y_2_i)
    }

    q_v_Fe_FasX_th_i = (facadeitem, dT) => {
        //eigenschaften der fasengruppe
        var h_1_i = this.h_1_i(facadeitem[1]) // falsch
        var C_D = this.C_D()
        var A_Fe_Fas1_i = 0
        var g = this.g()
        var T_e = this.T_e()
        let A_Fe_FasX_i = 0

        this.eventhandler.log('h_1_i (Höhe der Öffnungen von Unter- bis Oberkante der Fassadengruppe) ' , h_1_i)
        this.eventhandler.log('T_e (Absoluttemperatur der Außenluft) ' , T_e)

        this.eventhandler.log('h_1_i (Höhe der Öffnungen von Unter- bis Oberkante der Fassadengruppe 1, in m): ' , h_1_i)
        this.eventhandler.log('C_D (Durchflusszahl): '   , C_D)
        this.eventhandler.log('g (Beschleunigung m/s2): ' , g)
        this.eventhandler.log('dT (Lufttemperaturdifferenz zwischen innen und außen in K): ' , dT)
        this.eventhandler.log('T_e (K): ' , T_e)

        //wirksame Öffnungsfläche berechnen (Öffnungsfläche der Fenster im Raum i, in m²)
        A_Fe_FasX_i = facadeitem[1].A

        this.eventhandler.log('A_Fe_FasX_i', A_Fe_FasX_i)

        //TODO gleichunganpassen
        //thermisch induzierte Luftvolumenstrom durch Fenster der Fassadengruppe1
        //1200 * C_D * A_Fe_Fas1_i * (g * h_1_i * dT / T_e)^0,5
        //einheitslos * einheitslos * m2 * Wurzel(m/s2 * m * K / K)
        //s -> h mal 1200
        var q_v_Fe_FasX_th_i = 1200 * C_D * A_Fe_FasX_i * Math.pow((g * h_1_i * dT / T_e),0.5)

        this.eventhandler.log('A_Fe_FasX_i (wirksame Öffnungsfläche Fassadengruppe) ' , A_Fe_FasX_i)
        this.eventhandler.log('q_v_Fe_FasX_th_i (thermisch induzierte Luftvolumenstrom durch Fenster der Fassadengruppe): ' , q_v_Fe_FasX_th_i)

        return q_v_Fe_FasX_th_i
    }

    q_v_Fe_FasX_w_i = (facadeitem, dT) => {
        //3600 * b * A_Fe_Fas1_i * v_Fas

        let A_Fe_FasX_i = 0
        let v_Fas = this.v_Fas(facadeitem[1][0].room_entity)
        let b = this.b()

        //wirksame Öffnungsfläche berechnen (Öffnungsfläche der Fenster im Raum i, in m²)
        A_Fe_FasX_i = facadeitem[1].A

        return 3600 * b * A_Fe_FasX_i * v_Fas
    }

    //Öffnungsfläche für einzelne Fenster k in m²
    A_Fe_k = (window_in_facade) => {
        var b_k = this.parseFloat(window_in_facade.window.b_k)
        var h_k = this.parseFloat(window_in_facade.window.h_k)
        var d_k = this.d_k(window_in_facade.window)
        var x_k = this.x_k(window_in_facade)
        var n_k = this.n_k(window_in_facade.window)
        let C_korr = 0
        this.eventhandler.log(window_in_facade.oz_Fe, '', 'notice')

        switch (window_in_facade.oz_Fe) {
            case('komplett'):
                switch (window_in_facade.window.type) {
                    case('Schwingfenster'):
                        //(h_k - d_k) * b_k
                        return (h_k - d_k) * b_k
                        break
                    case('Parallelabstellfenster'):
                        let l_Fuge_k = this.parseFloat(window_in_facade.window.l_Fuge_k)
                        C_korr = 0.016 * l_Fuge_k / b_k / h_k / 3.3

                        return C_korr * b_k * h_k
                        break
                    case('Lamellenfenster'):
                        //b_k * (h_k-n_k*0,002 + h_k/n_k-0,002)/2
                        return b_k * (h_k-n_k * 0.002 + h_k / n_k - 0.002)/2

                        break
                    case('Schiebefenster'):
                        //0,5*b_k*h_k
                        return b_k * h_k * 0.5
                        break
                    default:
                        return b_k * h_k
                }

                break;

            case('gekippt'):
            case('kippopened'):
                var alpha_k = this.alpha_k(window_in_facade)

                //2,6e-7 * alpha_k^3 - 1,19e-4 * alpha_k^2 + 1,86e-2 * alpha_k
                C_korr = ((2.6 * Math.pow(10, -7)) * Math.pow(alpha_k, 3)) - (1.19 * Math.pow(10, -4) * Math.pow(alpha_k, 2)) + ((1.86 * Math.pow(10,-2)) * alpha_k)

                this.eventhandler.log('C_korr', C_korr)

                return C_korr * b_k * h_k
                break;

            case('drehopened'):
            case('high'): //gedreht
                //sqrt(1/((b_k * h_k)^-2 + (2 * b_k * h_k * sin(alpha_k/2) + b_k^2 * sin(alpha_k))^-2))
                //alpha_k in Bogenmass
                var alpha_k = this.alpha_k(window_in_facade) * Math.PI / 180

                return Math.sqrt(1 / (Math.pow((b_k * h_k),-2) + Math.pow((2 * b_k * h_k * Math.sin(alpha_k/2) + (Math.pow(b_k,2) * Math.sin(alpha_k))), -2)))
                break;

            case ('parallel'):
            case ('parallelabstellung'):
                let l_Fuge_k = this.parseFloat(window_in_facade.window.l_Fuge_k)
                C_korr = 0.016 * l_Fuge_k / b_k / h_k / 3.3
                
                return C_korr * b_k * h_k
                break;

            case('schwingopened'):
            case('schwingfluegel'):
                //min(2*(x_k * (b_k -2 * d_k) + x_k * sqrt((h_k/2/(1+d_k/x_k))^2 - 0,25 * x_k^2));(h_k - d_k) * b_k)
                this.eventhandler.log(window_in_facade)

                this.eventhandler.log('b_k', b_k)
                this.eventhandler.log('h_k', h_k)
                this.eventhandler.log('x_k', x_k)
                this.eventhandler.log('d_k', d_k)

                return Math.min(2 * (x_k * (b_k - 2 * d_k) + x_k * Math.sqrt(Math.pow(h_k/2/(1+d_k/x_k),2) - 0.25 * Math.pow(x_k,2))), (h_k - d_k) * b_k)

                break;

            case('lamellopened'):
            case('lamellenfenster'):
                this.eventhandler.log('b_k', b_k)
                this.eventhandler.log('h_k', h_k)
                this.eventhandler.log('x_k', x_k)
                this.eventhandler.log('n_k', n_k)

                //wenn mit Öffnungsweite x_k geöffnet: max(0;min(b_k*(h_k-n_k*0,002 + h_k/n_k-0,002)/2)/2;b_k*x_k*2*n_k))
                return Math.max(0, Math.min((b_k * (h_k - n_k * 0.002 + h_k / n_k - 0.002) / 2), (b_k*x_k*2*n_k) ))
                break;

            case('schiebopened'):
            case('schiebefenster'):
                var x_k = this.x_k(window_in_facade)

                this.eventhandler.log('x_k', x_k)
                this.eventhandler.log('h_k', h_k)

                return x_k * h_k
                break;
        }

        return 1;
    }

    y_Fe_k = (window_in_facade) => {
        let b_k = this.parseFloat(window_in_facade.window.b_k)
        let h_k = this.parseFloat(window_in_facade.window.h_k)
        let h_Bruest_k = this.parseFloat(window_in_facade.windowdata.h_Bruest_k)

        this.eventhandler.log(window_in_facade.oz_Fe, '', 'notice')

        switch (window_in_facade.oz_Fe) {
            case('komplett'):
                return h_k / 2 + h_Bruest_k
                break;

            case('gekippt'):
            case('kippopened'):
                let alpha_k = this.alpha_k(window_in_facade) * Math.PI / 180

                //((2*b_k * h_k * sin(alpha_k/2) + 0,5 * h_k^2 * sin(alpha_k))/2/tan(alpha_k))^0,5 + h_Brüst_k
                return Math.pow((2 * b_k * h_k * Math.sin(alpha_k/2) + 0.5 * Math.pow(h_k,2) * Math.sin(alpha_k))/2/Math.tan(alpha_k), 0.5) + h_Bruest_k
                break;

            case('drehopened'):
            case('high'): //gedreht
                return h_k / 2 + h_Bruest_k
                break;

            case ('parallel'):
            case ('parallelabstellung'):
                return h_k / 2 + h_Bruest_k
                break;

            case('schwingopened'):
            case('schwingfluegel'):
                return h_k / 2 + h_Bruest_k

                break;

            case('lamellopened'):
            case('lamellenfenster'):
                return h_k / 2 + h_Bruest_k
                break;

            case('schiebopened'):
            case('schiebefenster'):
                return h_k / 2 + h_Bruest_k

                break;
        }

        return 1;
    }


    //Luftstrom über geöffnete Fenster der Fassadengruppe 1 in m³/h
    q_v_Fe_Fas1_i = (q_v_Fe_Fas1_th_i, q_v_Fe_Fas1_w_i) => {
        return Math.pow(Math.pow(q_v_Fe_Fas1_th_i,2) + Math.pow(q_v_Fe_Fas1_w_i, 2), 0.5)
    }

    Win_Typ = (window) => {
        return window.win_Typ
    }

    dT = (roomkey) => {
        //T_in - T_e
        return Math.abs(this.T_in(roomkey) - this.T_e(roomkey))
    }

    //lokale Windgeschwindigkeit an der Fassade, in m/s
    v_Fas = (room_entity) => {
        //max(0 ; 1,36 * v_meteo * ln(H_Grund_Zone/z_0_Standort)/ln(H_Grund_80/z_0_Standort))
        var z_0_Standort = this.z_0_Standort(room_entity)
        var v_meteo = this.v_meteo()
        var H_Grund_Zone = this.H_Grund_Zone(room_entity)
        var H_Grund_80 = this.H_Grund_80()

        this.eventhandler.log('z_0_Standort ' , z_0_Standort)
        this.eventhandler.log('v_meteo ' , v_meteo)
        this.eventhandler.log('H_Grund_Zone' , H_Grund_Zone)

        return Math.max(0, (1.36 * v_meteo * Math.log(H_Grund_Zone /z_0_Standort ) / Math.log(H_Grund_80 / z_0_Standort)))
    }

    z_0_Standort = (room_entity) => {
        var H_Grund_Zone = this.H_Grund_Zone(room_entity)
        var abschirmung = this.eventhandler.projectdata.buildingdetails.abschirmung

        //keine Abschirmung (offene Lage) 0.03
        //mittler Abschirmung (normla lage) 0.25
        //strake Abschirmung 0.5

        switch(true) {
            case (H_Grund_Zone <= 80 && abschirmung === 'open'):
                return 0.03
                break
            case (H_Grund_Zone <= 80 && abschirmung === 'regular'):
                return 0.25
                break
            case (H_Grund_Zone <= 80 && abschirmung === 'closed'):
                return 0.5
                break
            case (H_Grund_Zone > 80):
                return 0.03
        }
    }

    H_Grund_80 = () => {
        return 80
    }

    f_Abschirmung = (room_entity) => {
        var H_Grund_Zone = this.parseFloat(this.H_Grund_Zone(room_entity))
        var abschirmung = this.eventhandler.projectdata.buildingdetails.abschirmung

        this.eventhandler.log('H_Grund_Zone', H_Grund_Zone)
        this.eventhandler.log('abschirmung', abschirmung)

        switch(true) {
            case (H_Grund_Zone <= 15 && abschirmung === 'open'):
                return 1.5
                break
            case (H_Grund_Zone <= 15 && abschirmung === 'regular'):
                return 1.0
                break
            case (H_Grund_Zone <= 15 && abschirmung === 'closed'):
                return 0.5
                break
            case (H_Grund_Zone <= 50 && abschirmung === 'open'):
                return 1.5
                break
            case (H_Grund_Zone <= 50 && abschirmung === 'regular'):
                return 1.0
                break
            case (H_Grund_Zone <= 50 && abschirmung === 'closed'):
                return 0.5
                break
            case (H_Grund_Zone > 50):
                return 1.5
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

    g = () => {
        return 9.81
    }

    b = () => {
        return 0.05
    }
}
