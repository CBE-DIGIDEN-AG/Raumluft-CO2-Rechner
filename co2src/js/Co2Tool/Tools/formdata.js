import React from "react";
import buildingdetails from "../Page/Pages/Dayprofile/buildingdetails";

let formdata_instance = null;

export default class Formdata {
    //singleton interface
    constructor() {
        if (formdata_instance) {
            return formdata_instance
        }
        formdata_instance = this;
    }

    pageswithoutsidebar = [
        'projectresume',
        'dashboard',
        'toolbeschreibung',
        'impressum',
        'easyspeech',
        'barrierefreiheit',
        'barrieremelden',
        'datenschutz',
        'gebaerdensprache'
    ]

    sidebartreebase = {
        method: {
            id: 'method',
            title: 'Anwendungsfall',
            valid: false,
            submenu_isopen: false
        },
        projektangaben: {
            id: 'projektangaben',
            title: 'Projektangaben',
            valid: false,
            callback: 'project.bnb_projektnummer',
            submenu_isopen: false
        },
        dayprofile: {
            id: 'dayprofile',
            title: 'Projektrandbedingungen',
            valid: false,
            submenu_isopen: false
        },
        results: {
            id: 'results',
            title: 'Zusammenfassung der Ergebnisse',
            valid: false,
            submenu_isopen: false
        }
    }

    project = {
        method: [
            {key: '',label: 'Bitte wählen'},
            {key: '4108',label: 'DIN/TS 4108-8'},
            {key: '16798',label: 'DIN EN 16798'}
        ]
    }

    buildingdetails = {
        VB: [
            {key: '',label: 'Bitte wählen'},
            {key: '1400',label: '<= 1.500 m³'},
            {key: '1600',label: '> 1.500 m³'},
        ],
        abschirmung: [
            {key: '',label: 'Bitte wählen'},
            {key: 'open',label: 'keine Abschirmung (Offenes Gelände)'},
            {key: 'regular',label: 'mittlere Abschirmung (Ländlicher Bereich)'},
            {key: 'closed',label: 'starke Abschirmung (Städtisch/Stadt)'},
        ],
        luftdichtheit: [
            {key: '',label: 'Bitte wählen'},
            {key: 'messasure',label: 'Messwert'},
            {key: 'defaultvalue',label: 'Vorgabewert'}
        ],
        fATD: [
            {key: '',label: 'Bitte wählen'},
            {key: 'ja',label: 'Ja'},
            {key: 'nein',label: 'Nein'},
        ],
        luftwechseln50 : [
            {key: '',label: 'Bitte wählen'},
            {key: '0.6',label: '0,6'},
            {key: '1',label: '1,0'},
            {key: '2',label: '2,0'},
            {key: '4',label: '4,0'},
            {key: '6',label: '6,0'},
            {key: '10',label: '10,0'},
        ],
        luftwechselq50 : [
            {key: '',label: 'Bitte wählen'},
            {key: '2',label: '2,0'},
            {key: '3',label: '3,0'},
            {key: '6',label: '6,0'},
            {key: '9',label: '9,0'},
            {key: '15',label: '15,0'},
        ]
    }

    windowtypes= {
        type4108: [
            {key: '',label: 'Bitte wählen'},
            {key: 'Kipp-/Drehfenster',label: 'Kipp-/Drehfenster'},
            {key: 'Schwingfenster',label: 'Schwingfenster'},
            {key: 'Parallelabstellfenster',label: 'Parallelabstellfenster'},
            {key: 'Lamellenfenster',label: 'Lamellenfenster'},
            {key: 'Schiebefenster',label: 'Schiebefenster'}
        ],
        type16798: [
            {key: '',label: 'Bitte wählen'},
            {key: 'Drehfenster',label: 'Drehfenster'},
            {key: 'Schiebefenster',label: 'Schiebefenster'},
            {key: 'Klappfenster',label: 'Klappfenster'},
            {key: 'Andere',label: 'Andere'}
        ],
        size: [
            {key: '',label: 'Bitte wählen'},
            {key: 'fensteroeffnungsmass',label: 'Fensteröffnungsmaß'},
            {key: 'Rohbaumass',label: 'Rohbaumaß'}
        ]
    }

    roomtypes = {
        ventilation : [
            {key: '',label: 'Bitte wählen'},
            {key: 'window',label: 'Fensterlüftung'},
            {key: 'mechanical',label: 'mechanische Lüftung'},
            {key: 'hybrid',label: 'Hybridlüftung'},
        ]
    }

    interval = {
        type : [
            {key: '',label: 'Bitte wählen'},
            {key: 'low',label: 'gering stehend/sitzend'},
            {key: 'medium',label: 'mittel stehend/sitzend'},
            {key: 'high',label: 'erhöht stehend'},
            {key: 'custom',label: 'Freie Eingabe'},
        ],
        Bal: [
            {key: '',label: 'Bitte wählen'},
            {key: 'ja',label: 'Ja'},
            {key: 'nein',label: 'Nein'}
        ],
        oz4108: [
            {key: '',label: 'Bitte wählen'},
            {key: 'komplett',label: 'komplett geöffnet'},
            {key: 'gekippt',label: 'gekippt'},
            {key: 'high',label: 'gedreht'},
            {key: 'parallelabstellung',label: 'Parallelabstellung'},
            {key: 'schwingfluegel',label: 'Schwingflügel geöffnet'},
            {key: 'lamellenfenster',label: 'Lamellenfenster geöffnet'},
            {key: 'schiebefenster',label: 'Schiebefenster geöffnet'},
        ],
        oz16798: [
            {key: '',label: 'Bitte wählen'},
            {key: 'komplett',label: 'komplett geöffnet'},
            {key: 'teilweise',label: 'Teilweise geöffnet'},
        ],
    }

    relwindowroomtypes = {
        einseitig: [
            {key: '',label: 'Bitte wählen'},
            {key: 'ja',label: 'Ja'},
            {key: 'nein',label: 'Nein'}
        ],
        facadepart: [
            {key: '',label: 'Bitte wählen'},
            {key: 'bottom',label: 'unterer Fassadenteil (H <= 15 m)'},
            {key: 'middle',label: 'mittlerer Fassadenteil (15 m < H <= 50m)'},
            {key: 'top',label: 'oberer Fassadenteil (H > 50 m)'},
        ],
        aw_k: [
            {key: '',label: 'Bitte wählen'},
            {key: '180',label: 'Nord'},
            {key: '270',label: 'Ost'},
            {key: '0',label: 'Süd'},
            {key: '90',label: 'West'},
        ],
        Bw_k: [
            {key: '',label: 'Bitte wählen'},
            {key: '0',label: 'horizontal'},
            {key: '90',label: 'vertikal'},
        ],
        installationsituation: [
            {key: '',label: 'Bitte wählen'},
            {key: 'normal',label: 'Normale Einbausituation'},
            {key: 'eng',label: 'Enge Einbausituation'},
            {key: 'sehreng',label: 'Sehr enge Einbausituation'},
        ]
    }
}
