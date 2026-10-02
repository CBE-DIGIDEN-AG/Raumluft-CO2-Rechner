import React, { useState, useRef } from "react";
import Highcharts from 'highcharts'
import addMore from 'highcharts/highcharts-more'
import addExporting from 'highcharts/modules/exporting'
import addOfflineExporting from 'highcharts/modules/offline-exporting'
import addOSeriesLabels from 'highcharts/modules/series-label'
import EventHandler from "../eventhandler";
import Calculator from "../calculator";
import {Formsfield} from "../../Forms/formsfield";
import {Form} from "../../Forms/form";
import moment from "moment/moment";

export default function Mittelwert({highcharts, rooms}) {
    const eventhandler = new EventHandler()
    const calculator = new Calculator()
    const globalTicks = []
    const mittelwertdata = []
    let optionsHour = []
    let optionsMinutes = []

    if (!eventhandler.projectdata.results) {
        eventhandler.projectdata.results = {
            mittelwert: {
                timeranges: []
            }
        }
    }

    const format = (string) => {
        if (string.toString().length === 1) {
            return '0' + string
        }

        return string
    }

    highcharts.map((highchart, highchartkey) => {
        for (const tick of highchart.tickPositions) {
            globalTicks.push(tick)
        }
    })

    globalTicks.sort()

    for (var ti = globalTicks[0]; ti <= globalTicks[globalTicks.length - 1]; ti++)
    {
        if ((ti % (60*60)) === 0) {
            var date = new Date(ti * 1000)
            var hours = date.getHours()

            let display = hours.toString()
            if (display.length === 1) {
                display = '0' + display
            }

            optionsHour.push({key: hours, label: display},)
        }
    }

    for (var mi = 0; mi <= 55; mi++)
    {
        if ((mi % (5)) === 0) {
            let display = mi.toString()
            if (display.length === 1) {
                display = '0' + display
            }

            optionsMinutes.push({key: mi, label: display},)
        }
    }

    const [timeranges, setTimeranges] = useState(() => {
        if (eventhandler.projectdata.results.mittelwert.timeranges) {
            let out = []
            for (const item of Object.values(eventhandler.projectdata.results.mittelwert.timeranges)) {
                if (item) {
                    if (!item.start_hour) { item.start_hour = optionsHour[0].key }
                    if (!item.start_minute) { item.start_minute = optionsMinutes[0].key }
                    if (!item.end_hour) { item.end_hour = optionsHour[0].key }
                    if (!item.end_minute) { item.end_minute = optionsMinutes[0].key }

                    out.push({
                        id: out.length,
                        start_hour: item.start_hour,
                        start_minute: item.start_minute,
                        end_hour: item.end_hour,
                        end_minute: item.end_minute
                    })
                }
            }

            if (out.length === 0) {
                let startDate = moment.unix(highcharts[0].IntervaltickPositions[0])
                let endate = moment.unix(highcharts[0].IntervaltickPositions[1])

                /*out.push({
                    id: 0,
                    start_hour: startDate.format('hh'),
                    start_minute: startDate.format('mm'),
                    end_hour: endate.format('hh'),
                    end_minute: endate.format('mm')
                })*/
            }

            return out
        }

        return []
    });

    for (let j = 0; j < highcharts.length; j++) {
        timeranges.map((timerange, timerangecounter) => {
            let startDate = moment(new Date('2023-01-01T'+format(timerange.start_hour) + ':' + format(parseInt(timerange.start_minute) + 1)+':00'))
            let endDate = moment(new Date('2023-01-01T'+format(timerange.end_hour) + ':' + format(timerange.end_minute)+':00'))

            let avarage = 0
            let avarage_count = 0

            let check = ((endDate.unix() - startDate.unix()) / 60) + 1

            let data_has_count = []
            for (let i = 0; i < highcharts[j].data.length; i++) {
                if (highcharts[j].data[i].x >= startDate.unix() && highcharts[j].data[i].x <= endDate.unix()) {
                    //avoid dublicates
                    if (data_has_count.includes(highcharts[j].data[i].x) === true) {
                        continue
                    }

                    data_has_count.push(highcharts[j].data[i].x)

                    avarage += highcharts[j].data[i].y
                    avarage_count++
                }
            }

            if (avarage_count > 0 && (check === avarage_count)) {
                mittelwertdata.push({
                    value: avarage / avarage_count,
                    x: j,
                    y: timerangecounter
                })
            }
        })
    }

    function generateMittelwertChartData(data) {
        const length = data.length
        const chartData = [];

        // Loop through and populate with temperature and dates from the dataset
        for (let day = 1; day <= length; day++) {
            const xCoordinate = data[day - 1].x;
            const yCoordinate = data[day - 1].y;

            chartData.push({
                x: xCoordinate,
                y: yCoordinate,
                value: data[day - 1].value,
            });
        }

        return chartData;
    }

    const mittelwertChartData = generateMittelwertChartData(mittelwertdata);

    //y Achse
    const intervals = [];
    timeranges.map((timerange) => {
        intervals.push(format(timerange.start_hour) + ':' + format(timerange.start_minute) + ' - ' + format(timerange.end_hour) + ':' + format(timerange.end_minute) + ' Uhr')
    })

    //x-Achse
    //categories = räume
    let categories = []
    rooms.map((highchart) => {
        categories.push(highchart.legend)
    })

    React.useEffect(() => {
        const chart = Highcharts.chart('mittelwert_container', {
            chart: {
                type: 'heatmap',
                events: {
                    load: function() {
                        const chart = this;
                        const mainSVG = chart.container.children[0];
                        const colorAxis = chart.colorAxis[0].axisParent.element;

                        mainSVG.appendChild(colorAxis);
                        colorAxis.setAttribute('transform', 'translate(0,3)')
                    }
                },
            },

            title: {
                text: '',

            },

            credits: {
                enabled: false
            },

            exporting: {
                enabled: false
            },

            tooltip: {
                enabled: false,
            },

            xAxis: {
                categories: categories,
                opposite: false,
                lineWidth: 26,
                offset: 13,
                lineColor: 'rgba(27, 26, 37, 0.0)',
                labels: {
                    rotation: 0,
                    y: 20,
                    style: {
                        //textTransform: 'uppercase',
                        fontWeight: 'light',
                        fontSize: '14px'
                    }
                }
            },

            yAxis: [{
                categories: intervals,
                min: 0,
                max: intervals.length - 1,
                title: '',
                labels: {
                    text: ''
                },
                visible: true,
                align: 'right',
                opposite:true
            }],

            legend: {
                align: 'left',
                layout: 'vertical',
                verticalAlign: 'middle',
                margin: -20,
                symbolHeight: 350
            },

            colorAxis: {
                min: parseInt(eventhandler.projectdata.dayprofile.cAUL),
                max: 3500,
                reversed:false,
                useHTML: true,
                margin: 0,
                stops: [
                    [0.10, 'rgba(208,240,195, 0.49)'],
                    [0.28, 'rgba(149,221,118,0.49)'],
                    [0.3, 'rgba(238,106,12, 0.74)'],
                    [0.9, '#e60101'],
                ],
                labels: {
                    formatter: function (e) {
                        if (this.value) {
                            return this.value
                        }
                    },
                    align: 'left'
                }
            },

            series: [{
                keys: ['x', 'y', 'value', 'date', 'id'],
                data: mittelwertChartData,
                nullColor: 'rgba(196, 196, 196, 0.2)',
                borderWidth: 2,
                borderColor: 'rgba(196, 196, 196, 0.2)',
                dataLabels: [{
                    enabled: true,
                    format: '{#unless point.custom.empty}{point.value:.0f}{/unless}',
                    style: {
                        textOutline: 'none',
                        fontWeight: 'normal',
                        fontSize: '1rem'
                    }
                }]
            }]
        }, function(highchart) {

        });

        //export chart
        eventhandler.highchartsSVGtoImage(chart, function(image) {
            const hiddenfield = document.querySelector('input[type="hidden"][name="mitelwertchart"]')
            hiddenfield.setAttribute('value', image)
        })
    }, []);

    const handleTimeRangeAdd = (e) => {
        e.preventDefault()

        const newelement = {
            id: timeranges.length,
            start_hour: optionsHour[0].key,
            start_minute: optionsMinutes[0].key,
            end_hour: optionsHour[0].key,
            end_minute: optionsMinutes[0].key
        }

        eventhandler.projectdata.results.mittelwert.timeranges[newelement.id] = {
            start_hour : newelement.start_hour,
            start_minute : newelement.start_minute,
            end_hour : newelement.end_hour,
            end_minute : newelement.end_minute
        }

        const timerangesnew = timeranges.concat(newelement)

        setTimeranges(timerangesnew)

        eventhandler.store()
        eventhandler.forceUpdate()
    }

    const handleTimeRangeRemove = (e, id) => {
        e.preventDefault()

        const timerangesnew = timeranges.filter(item => item.id !== id)
        setTimeranges(timerangesnew)

        delete eventhandler.projectdata.results.mittelwert.timeranges[id]

        eventhandler.store()
        eventhandler.forceUpdate()
    }

    const handleTimeRangeChangeEvent = (e,name, type, value) => {
       timeranges.map((timerange) => {
           let changed = false

           if (name === 'results.mittelwert.timeranges.'+timerange.id+'.start_hour') {
               timerange.start_hour = value
               changed = true
           }

           if (name === 'results.mittelwert.timeranges.'+timerange.id+'.start_minute') {
               timerange.start_minute = value
               changed = true
           }

           if (name === 'results.mittelwert.timeranges.'+timerange.id+'.end_hour') {
               timerange.end_hour = value
               changed = true
           }

           if (name === 'results.mittelwert.timeranges.'+timerange.id+'.end_minute') {
               timerange.end_minute = value
               changed = true
           }

           if (changed === true) {
               //validate starttime must be before endtime
               let startDate = moment(new Date('2023-01-01T'+format(timerange.start_hour) + ':' + format(timerange.start_minute)+':00'))
               let endDate = moment(new Date('2023-01-01T'+format(timerange.end_hour) + ':' + format(timerange.end_minute)+':00'))

               if (!(endDate.diff(startDate) >= 0)) {
                    e.target.closest('td').classList.add('invalid')
               }
               else {
                   e.target.closest('td').classList.remove('invalid')
                   eventhandler.store()
                   eventhandler.forceUpdate()
               }
           }
       })
    }

    return (
        <div className={"m-highcharts__average"}>
            <h2 className={"m-page__title"}>Mittelwert CO<sub>2</sub>-Konzentration in ppm</h2>
            <div className={"m-highcharts__mittelwert_navigation"}>
                <Form name={"results.mittelwert"}>
                    <table>
                        <thead>
                        <tr>
                            <th>&nbsp;</th>
                            <th>Von</th>
                            <th>Bis</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {timeranges && timeranges.map((timerange) => (
                            (
                                <tr key={eventhandler.uuid()}>
                                    <td>{timerange.id + 1}</td>
                                    <td>
                                        <Formsfield type={"select"} name={"results.mittelwert.timeranges."+timerange.id+".start_hour"} options={optionsHour} callback={handleTimeRangeChangeEvent} />
                                        <Formsfield type={"select"} name={"results.mittelwert.timeranges."+timerange.id+".start_minute"} options={optionsMinutes} callback={handleTimeRangeChangeEvent} />
                                    </td>
                                    <td>
                                        <Formsfield type={"select"} name={"results.mittelwert.timeranges."+timerange.id+".end_hour"} options={optionsHour} callback={handleTimeRangeChangeEvent} />
                                        <Formsfield type={"select"} name={"results.mittelwert.timeranges."+timerange.id+".end_minute"} options={optionsMinutes} callback={handleTimeRangeChangeEvent} />
                                    </td>
                                    <td><a href={"#"} className={"m-highcharts__mittelwert_remove"}
                                           onClick={(e) => handleTimeRangeRemove(e,timerange.id)}></a>
                                    </td>
                                </tr>
                            )
                        ))}

                        </tbody>
                    </table>
                </Form>
                <a href={"#"} className={"m-highcharts__mittelwert_add"} onClick={handleTimeRangeAdd}>neuen Zeitraum hinzufügen</a>

            </div>
            <div id={"mittelwert_container"}></div>
        </div>
    )
}