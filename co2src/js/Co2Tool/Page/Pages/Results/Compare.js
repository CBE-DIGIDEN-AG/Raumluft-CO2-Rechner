import React, { useState, useRef } from "react";
import Highcharts from 'highcharts'
import addMore from 'highcharts/highcharts-more'
import addExporting from 'highcharts/modules/exporting'
import addOfflineExporting from 'highcharts/modules/offline-exporting'
import addOSeriesLabels from 'highcharts/modules/series-label'
import addHeatmap from 'highcharts/modules/heatmap'
import moment from "moment";
import EventHandler from "../../../Tools/eventhandler";
import Calculator from "../../../Tools/calculator";
import Mittelwert from '../../../Tools/highcharts/mittelwert'
import Linechart from '../../../Tools/highcharts/linechart'
import Bnb from "../../../Tools/bnb";

addMore(Highcharts)
addExporting(Highcharts)
addOfflineExporting(Highcharts)
addOSeriesLabels(Highcharts)
addHeatmap(Highcharts)

export default function Compare({page}) {
    const eventhandler = new EventHandler()
    const calculator = new Calculator()
    eventhandler.debugMode = true
    const bnbhandler = new Bnb()

    let [legend, setLegend] = useState(() => {
        return '';
    });

    let seriesdata = []

    //für jeden Raum
    //für jedes intervall
    //für jede 5 Minuten
    //berechne: CO2 -Konzentration im Raum am Ende des betrachteten Zeitintervalls in ppm

    let highcharts = []
    let breaks = []
    let rooms = []
    let plotintervals = []

    if (eventhandler.projectdata.dayprofile && eventhandler.projectdata.dayprofile.roomtypes) {
        eventhandler.projectdata.dayprofile.roomtypes.map((room, roomkey) => {
            if (!room) {
                return
            }

            const id = 'highchart_chart_' + room.key;

            rooms.push({
                legend: room.name,
                id: id,
            })

            if (!eventhandler.projectdata['dayprofile']['usageprofiles'][room.key]) {
                return
            }

            /*if (!roomselect.includes((id))) {
                return
            }*/

            let chartdata = []
            let mittelwertdata_chartdata = {}
            let mittelwertdata_chartdata_interval = []
            let mittelwertdata = {}
            let startDate = moment(new Date('2023-01-01T'+eventhandler.projectdata['dayprofile']['usageprofiles'][room.key].start+':00'))
            let startDateTS = startDate.unix()
            let startDateIntervalTS = startDateTS
            let i_total = 0
            let tickPositions = []
            let IntervaltickPositions = []
            let IntervaltickLabels = {}
            let VAUL_t = 0

            if (eventhandler.projectdata['dayprofile']['usageprofiles'][room.key]) {
                let cRAL_t0 = calculator.cAUL();

                eventhandler.projectdata['dayprofile']['usageprofiles'][room.key].intervals.map((interval, intervalkey) => {
                    if (!interval) {
                        return
                    }

                    //clear for every interval
                    mittelwertdata_chartdata_interval = [{
                        x: startDateIntervalTS,
                        y: cRAL_t0,
                        y_orig: cRAL_t0,
                        time: eventhandler.getTimeFromTS(startDateIntervalTS)
                    }]

                    chartdata.push({
                        x: startDateIntervalTS,
                        y: cRAL_t0,
                        time: eventhandler.getTimeFromTS(startDateIntervalTS),
                        interval: intervalkey,
                    })

                    tickPositions.push(startDateIntervalTS)

                    plotintervals.push({
                        start: startDateIntervalTS,
                        end: startDateIntervalTS + (parseInt(interval.duration) * 60),
                        name: interval.name,
                        interval: interval,
                        time_start: eventhandler.getTimeFromTS(startDateIntervalTS),
                        time_end: eventhandler.getTimeFromTS(startDateIntervalTS + (parseInt(interval.duration) * 60))
                    })

                    //border between intervals
                    breaks.push({
                        start: startDateIntervalTS,
                        end: startDateIntervalTS + 1,
                        name: interval.name,
                        interval: interval,
                        time_start: eventhandler.getTimeFromTS(startDateIntervalTS),
                        time_end: eventhandler.getTimeFromTS(startDateIntervalTS + (parseInt(interval.duration) * 60))
                    })

                    let tickpos = startDateIntervalTS + (parseInt(interval.duration) / 2 * 60)
                    IntervaltickPositions.push(tickpos)
                    IntervaltickLabels[tickpos] = interval.name

                    //außenluftvolumenstrom je intervall
                    if (intervalkey === 1) {
                        VAUL_t = calculator.VAUL_t(room.key, intervalkey, interval, room)
                    }

                    //minutenweise
                    let mittelwertdata_interval = 0
                    for (let i= 1; i <= parseInt(interval.duration); i++) {
                        i_total++

                        eventhandler.log('Minute: ' + i_total + ' ('+i+')')

                        cRAL_t0 = calculator.cRAL_t({
                            roomkey: room.key,
                            room_entity: room,
                            intervalkey: intervalkey,
                            interval_entity: interval,
                            t: i_total * 1,
                            t0: (i_total - 1) * 1,
                            cRAL_t0: cRAL_t0
                        })

                        startDateIntervalTS = startDateIntervalTS + 60

                        if ((startDateIntervalTS % (30*60)) === 0) {
                            tickPositions.push(startDateIntervalTS)
                        }

                        mittelwertdata_interval += cRAL_t0

                        chartdata.push({
                            x: startDateIntervalTS,
                            y: cRAL_t0,
                            time: eventhandler.getTimeFromTS(startDateIntervalTS),
                            interval: intervalkey,
                            intervalname : interval.name
                        })

                        //gleitender durchschnitt
                        /*if (mittelwertdata_chartdata_interval[i-1]) {
                            mittelwertdata_chartdata_interval.push({
                                x: startDateIntervalTS,
                                y: ((mittelwertdata_chartdata_interval[i-1].y + cRAL_t0)/2),
                                time: eventhandler.getTimeFromTS(startDateIntervalTS)
                            })
                        }*/

                        //arythmetischer durchschnitt
                        let average = cRAL_t0
                        for (var j= 0; j < mittelwertdata_chartdata_interval.length; j++) {
                            average += mittelwertdata_chartdata_interval[j].y_orig
                        }

                        mittelwertdata_chartdata_interval.push({
                            x: startDateIntervalTS,
                            y: (average / (mittelwertdata_chartdata_interval.length + 1)),
                            y_orig: cRAL_t0,
                            time: eventhandler.getTimeFromTS(startDateIntervalTS)
                        })
                    }

                    //TODO mittelwertberechnung nicht korrekt (nur zum testen)
                    mittelwertdata[startDateIntervalTS] = mittelwertdata_interval / interval.duration
                    mittelwertdata_chartdata[startDateIntervalTS] = mittelwertdata_chartdata_interval

                    //add last item
                    tickPositions.push(startDateIntervalTS)
                })

                highcharts.push({
                    legend: room.name,
                    id: id,
                    data: chartdata,
                    mittelwertdata: mittelwertdata,
                    mittelwertdata_chartdata: mittelwertdata_chartdata,
                    breaks: breaks,
                    plotintervals:plotintervals,
                    tickPositions: tickPositions,
                    IntervaltickPositions: IntervaltickPositions,
                    IntervaltickLabels: IntervaltickLabels,
                    container: (<div className={"m-page__chart"} key={id}>
                        <div id={id} className={"m-page__highchart"}></div>
                    </div>),
                    VAUL_t: VAUL_t
                })
            }

            console.log('----new room------')
        })
    }

    const exportdata = []
    const cumulated = []
    const cumulated_data = []
    const vault = []
    const vault_data = []

    if (eventhandler.projectdata.project && eventhandler.projectdata.method === 'bnb') {
        cumulated.push((
            <div className={"m-highcharts__cumulatedrow"} key={eventhandler.uuid()}>
                <strong>Maximale mittlere CO<sub>2</sub>-Konzentration innerhalb des Tagesprofils in ppm</strong>
            </div>
        ))

        vault.push((
            <div className={"m-highcharts__cumulatedrow"} key={eventhandler.uuid()}>
                <strong>Außenluftvolumenstrom in m3/h<span>Gesamtvolumenstrom während der Lüftungsintervalle: Volumenstrom Fenster + mechanische Lüftung (falls vorhanden)</span></strong>
            </div>
        ))
    }

    highcharts.map((highchart, highchartkey) => {
        exportdata.push({
                data: highchart.data,
                legend: highchart.legend
            }
        )

        let export_mittelwertdata_chartdata = []
        Object.values(highchart.mittelwertdata_chartdata).map((mittelwertdata_chartdata) => {
            export_mittelwertdata_chartdata.push(...mittelwertdata_chartdata)
        })

        /*exportdata.push({
                data: export_mittelwertdata_chartdata,
                legend: 'Mittelwert ' + highchart.legend
            }
        )*/

        let avarage = 0.0
        let avarage_length = 0
        let avarage_per_interval = {}
        let avarage_length_per_interval = {}
        let cumulative_exceeded = 0
        let index_check = []
        let max = 0
        let max_cumulated_interval_name = []
        let max_cumulated_interval_name_display = ''
        let current_interval = -1


        highchart.data.map((item, index) => {
            //skip first of each intervall
            if (index > 0 && !index_check.includes(item.time)) {
                index_check.push(item.time)
                avarage += item.y
                avarage_length++
                cumulative_exceeded += Math.max((item.y - 1000), 0)

                if (current_interval !== item.interval) {
                    current_interval = item.interval

                    avarage_per_interval[current_interval] = 0.0
                    avarage_length_per_interval[current_interval] = 0
                    max_cumulated_interval_name[current_interval] = item.intervalname
                }

                avarage_per_interval[current_interval] += item.y
                avarage_length_per_interval[current_interval]++
            }
        })

        Object.values(avarage_per_interval).map((avg_per_interval,avg_per_interval_key) => {
            if (max < avg_per_interval / avarage_length_per_interval[avg_per_interval_key]) {
                max = avg_per_interval / avarage_length_per_interval[avg_per_interval_key]
                max_cumulated_interval_name_display =  max_cumulated_interval_name[avg_per_interval_key]
            }
        })

        let avarage_display = new Intl.NumberFormat("de-DE", {maximumFractionDigits: 0, minimumFractionDigits:0}).format((avarage / avarage_length))
        let cumulative_exceeded_display = new Intl.NumberFormat("de-DE", {maximumFractionDigits: 0, minimumFractionDigits:0}).format(cumulative_exceeded / 60)
        let max_display = new Intl.NumberFormat("de-DE", {maximumFractionDigits: 0, minimumFractionDigits:0}).format(max)
        let vault_display = new Intl.NumberFormat("de-DE", {maximumFractionDigits: 2, minimumFractionDigits:0}).format(highchart.VAUL_t / 1000)

        if (eventhandler.projectdata.project && eventhandler.projectdata.method === 'bnb') {
            cumulated.push((
                <div className={"m-highcharts__cumulatedrow"} key={eventhandler.uuid()}>
                    <span> für {highchart.legend} <i>({max_cumulated_interval_name_display})</i></span><span>{max_display}</span>
                </div>
            ))

            vault.push((
                <div className={"m-highcharts__cumulatedrow"} key={eventhandler.uuid()}>
                    <span> für {highchart.legend}</span><span>{vault_display}</span>
                </div>
            ))

            vault_data.push({
                name: highchart.legend,
                avarage: vault_display
            })
        }
        else {
            cumulated.push((
                <div className={"m-highcharts__cumulated_roomtype"} key={eventhandler.uuid()}>
                    <div className={"m-highcharts__cumulatedrow"}>
                        <strong>Mittelwerte für den gesamten Betrachtungszeitraum für {highchart.legend}</strong>
                    </div>
                    <div className={"m-highcharts__cumulatedrow"}>
                        <span>Mittelwert der CO<sub>2</sub>-Konzentration in ppm</span><span>{avarage_display}</span>
                    </div>
                    <div className={"m-highcharts__cumulatedrow"}>
                        <span>Kumulierte Grenzwertüberschreitung der CO<sub>2</sub>-Konzentration in ppmh (Leitwert: 1000 ppm)</span><span>{cumulative_exceeded_display}</span>
                    </div>
                </div>
            ))
        }

        cumulated_data.push({
            name: highchart.legend,
            avarage: avarage_display,
            cumulative_exceeded: cumulative_exceeded_display,
            max: max_display,
            max_interval_name: max_cumulated_interval_name_display
        })
    })

    const handleExportSubmit = (e) => {

    }

    let all_valid = true
    //check if every page is valid
    const checkTreeIsValid = (tree) => {
        Object.entries(tree).map((page) => {
            if (page[1].id === 'results') {
                return
            }

            if (page[1].id === 'dayprofile') {
                checkTreeIsValid(page[1].childs)

                return
            }

            let valid = page[1].valid

            //wenn eine seite kein Formualr dafür aber Kinder hat
            if (page[1].has_childs === true && page[1].form === null || typeof page[1].form === 'undefined') {
                valid = true
            }

            //seite hat form, also überrpüfe das form
            if (page[1].form) {
                valid = eventhandler.validateForm(page[1].form, null, true)
            }
            //seite hat kinder, es muss aber mindestens 1 Kind vorhanden sein
            else if (page[1].has_childs === true && page[1].childs && Object.entries(page[1].childs).length < 1) {
                valid = false
            }

            //überprüfe kinder
            if (page[1].childs) {
                //has subpages
                checkTreeIsValid(page[1].childs)
            }

            if (valid === false) {
                console.log(page[1])

                all_valid = false
            }
        })
    }

    const tree = eventhandler.sidebartree
    checkTreeIsValid(tree)

    if (all_valid === false) {
        return (<div className={"m-page__importantnotice"}><strong>Bitte prüfen Sie Ihre Eingaben.</strong><br />
            Die Zusammenfassung kann erst eingesehen werden, wenn alle  Eingaben gespeichert und gültig sind.<br /></div>)
    }

    return (<div className={"m-page"}>
            <h1>CO<sub>2</sub>-Konzentrationsverlauf vergleichen</h1>

            <Linechart highcharts={highcharts} rooms={rooms}></Linechart>

            <div className={"m-page__chart_row2"} key={eventhandler.uuid()}>
                {eventhandler.projectdata.method && eventhandler.projectdata.method !== 'bnb' &&(<Mittelwert highcharts={highcharts} rooms={rooms}></Mittelwert>)}

                <div className={"m-highcharts__cumulated"} key={eventhandler.uuid()}>
                    {cumulated.map((markup) => {
                        return markup
                    })}
                </div>
            </div>

            <div className={"m-page__chart_row3"} key={eventhandler.uuid()}>
                <form action={"export"} encType={"multipart/form-data"} method={"POST"} onSubmit={handleExportSubmit}>
                    <input type={"hidden"} value={JSON.stringify(exportdata)} name={"exportdata"}/>
                    <input type={"hidden"} value={"xls"} name={"type"}/>
                    <div className={"m-form__button"}>
                        <button name={"exportaction"} value={"excel"}>Export als Excel</button>
                    </div>
                </form>

                <form action={"export"} encType={"multipart/form-data"} method={"POST"} onSubmit={handleExportSubmit}>
                    <input type={"hidden"} value={JSON.stringify(exportdata)} name={"exportdata"}/>
                    <input type={"hidden"} value={JSON.stringify(eventhandler.projectdata)} name={"projectdata"}/>
                    <input type={"hidden"} value={"pdf"} name={"type"}/>
                    <input type={"hidden"} value={""} name={"linechart"}/>
                    <input type={"hidden"} value={""} name={"mitelwertchart"}/>
                    <input type={"hidden"} value={JSON.stringify(eventhandler.formdata)} name={"formdata"}/>
                    <input type={"hidden"} value={JSON.stringify(cumulated_data)} name={"cumulated"}/>
                    <input type={"hidden"} value={JSON.stringify(vault_data)} name={"vault"}/>

                    {eventhandler.projectdata.method === 'bnb' && (<input type={"hidden"} value={JSON.stringify(bnbhandler.getProfile('_all'))} name={"bnbprofile"}/>)}

                    <div className={"m-form__button"}>
                        <button name={"exportaction"} value={"pdf"}>Export als PDF</button>
                    </div>
                </form>
            </div>
        </div>
    )
}