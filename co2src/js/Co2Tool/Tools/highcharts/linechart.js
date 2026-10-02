import React, { useState, useRef } from "react";
import Highcharts from 'highcharts'
import addMore from 'highcharts/highcharts-more'
import addExporting from 'highcharts/modules/exporting'
import addOfflineExporting from 'highcharts/modules/offline-exporting'
import addOSeriesLabels from 'highcharts/modules/series-label'
import EventHandler from "../eventhandler";
import Calculator from "../calculator";

addMore(Highcharts)
addExporting(Highcharts)
addOfflineExporting(Highcharts)
addOSeriesLabels(Highcharts)

require("highcharts/modules/accessibility")(Highcharts);

export default function Linechart({highcharts, rooms}) {
    const eventhandler = new EventHandler()
    const calculator = new Calculator()
    const globalTicks = []

    const [roomselect, setRoomselect] = useState(() => {
        const dump = [];
        if (eventhandler.projectdata.dayprofile.roomtypes) {
            eventhandler.projectdata.dayprofile.roomtypes.map((room, roomkey) => {
                if (room) {
                    const id = 'highchart_chart_' + room.key;

                    dump.push(id)
                }
            })
        }

        return dump
    });

    const handleRoomselect = (e) => {
        const options = [];

        for(const option of e.target.childNodes) {
            var legenditem = document.querySelector(".highcharts-legend-item." + option.value)

            switch (true) {
                case (option.selected === true && legenditem.classList.contains('highcharts-legend-item-hidden') === true):
                case (option.selected === false && legenditem.classList.contains('highcharts-legend-item-hidden') === false):
                    var mittelwert_legenditem = option.value.replace('highchart_chart_','')

                    Highcharts.charts.map((chart, chartkey) => {
                        if (Highcharts.charts[chartkey]) {
                            if (Highcharts.charts[chartkey].renderTo.id === highcharts[0].id) {
                                Highcharts.charts[chartkey].series.map((series, key) => {
                                    if (Highcharts.charts[chartkey].series[key].options.id) {
                                        /*if (Highcharts.charts[chartkey].series[key].options.id === 'mittelwert_' + mittelwert_legenditem) {
                                            if (Highcharts.charts[chartkey].series[key].visible === true) {
                                                Highcharts.charts[chartkey].series[key].update({
                                                    visible: false
                                                })
                                            }
                                            else {
                                                Highcharts.charts[chartkey].series[key].update({
                                                    visible: true
                                                })
                                            }
                                        }*/

                                        if (Highcharts.charts[chartkey].series[key].options.id === 'regular_' + mittelwert_legenditem) {
                                            if (Highcharts.charts[chartkey].series[key].visible === true) {
                                                Highcharts.charts[chartkey].series[key].update({
                                                    visible: false
                                                })
                                            }
                                            else {
                                                Highcharts.charts[chartkey].series[key].update({
                                                    visible: true
                                                })
                                            }
                                        }
                                    }
                                })
                            }
                        }
                    })

                    //Highcharts.fireEvent(legenditem, 'click')
                    break
            }
        }

        setRoomselect(options)
    }

    const seriesdata = [];
    const colorPallette = ['#0a5a5a','#ea3131', '#4f871a']

    let MinutesToShowMax = 0

    //recalculte tickPositions
    highcharts.map((highchart, highchartkey) => {
        let MinutesToShow = highchart.data.length

        if (MinutesToShow > MinutesToShowMax) {
            MinutesToShowMax = MinutesToShow
        }

        seriesdata.push({
                data: highchart.data,
                name: highchart.legend,
                className: highchart.id,
                color: colorPallette[highchartkey],
                lineWidth: 3,
                id: 'regular_' + highchart.id.replace('highchart_chart_',''),
                marker:{
                    enabled:false
                }
            },
        )

        /*Object.values(highchart.mittelwertdata_chartdata).map((intervalldata, intervalldatakey) => {
            seriesdata.push({
                    data: intervalldata,
                    name: '',
                    className: 'highcharts-legend-item-hidden',
                    color: colorPallette[highchartkey],
                    showInLegend: false,
                    lineWidth: 2,
                    dashStyle: 'ShortDot',
                    id: 'mittelwert_' + highchartkey,
                    marker:{
                        enabled:false
                    }
                },
            )
        })*/

        for (const tick of highchart.tickPositions) {
            globalTicks.push(tick)
        }
    })

    globalTicks.sort()

    //experimental
    let globalTicksGlobal = []

    let TickTestInterval = 10
    if (MinutesToShowMax > 240) {
        TickTestInterval = 40
    }
    if (MinutesToShowMax > 320) {
        TickTestInterval = 60
    }

    for (var ti = globalTicks[0]; ti <= globalTicks[globalTicks.length - 1]; ti++)
    {
        //show only 30minutes steps
        if ((ti % (30*TickTestInterval)) === 0) {
            globalTicksGlobal.push(ti)
        }
    }

    //make sure all date are in the chart for example (chart ends 13:00, but data includes 13:15
    if (globalTicks[globalTicks.length - 1] > globalTicksGlobal[globalTicksGlobal.length - 1]) {
        globalTicksGlobal.push(globalTicksGlobal[globalTicksGlobal.length - 1] + (30 * 60))
    }


    React.useEffect(() => {
        let i;
        const select = document.querySelector('#chartselection')
        let vanillaSelect = new window.vanillaSelectBox('#chartselection', {
            'search': false,
            'placeHolder': 'Bitte wählen',
            'disableSelectAll': true
        })

        const highchartstodraw = [highcharts[0]]
        let charts = []

        highchartstodraw.map((highchart) => {
            let chart = Highcharts.chart(highchart.id, {
                chart: {
                    scrollablePlotArea: {
                        //minWidth: 700
                    },

                    style: {
                        fontFamily: 'OpenSans',
                        fontSize: 14
                    }
                },

                exporting: {
                    enabled: false
                },

                time: {
                    timzone: 'Europe/Berlin'
                },

                title: {
                    text: ''
                },

                credits: {
                    enabled: false
                },

                xAxis: [
                    {
                        labels: {
                            formatter: function (e) {
                                return eventhandler.getTimeFromTS(this.value)
                            },
                            inside: false,
                            rotation: -35
                        },
                        startOnTick: true,
                        endOnTick:true,
                        tickPositions: globalTicksGlobal,
                        step: 1
                    },
                ],

                yAxis: [{
                    title: {
                        text: null
                    },
                    reversed: false,
                    labels: {
                        inside: false
                    },
                    showFirstLabel: true,
                    plotBands: [
                        {
                            from: 0,
                            to: 10000,
                            color: '#f2f5f7'
                        },
                        {
                            from: 0,
                            to: 1000,
                            color: 'rgba(149, 221, 118, 0.49)'
                        }
                    ]
                }, {
                    linkedTo: 0,
                    gridLineWidth: 0,
                    opposite: true,
                    title: {
                        text: null
                    },
                    labels: {
                        align: 'right',
                        x: -3,
                        y: 16,
                        format: '{value:.,0f}'
                    },
                    showFirstLabel: true
                }],

                legend: {
                    align: 'right',
                    verticalAlign: 'top',
                    borderWidth: 0,
                    useHTML: false,
                    layout: 'vertical',
                    itemStyle: {
                        color: '#000000',
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }
                },

                tooltip: {
                    shared: false,
                    outside: true,
                    backgroundColor: '#ffffff',
                    crosshairs: false,
                    formatter: function (tooltip) {
                        let date = new Date(this.point.x * 1000)
                        let hours = date.getHours();
                        let minutes = "0" + date.getMinutes();

                        return '<strong style="font-size: 0.8em">' + hours + ':' + minutes.substr(-2) + ' Uhr</strong><br>' +
                            '<span style="font-size: 0.9em">' + new Intl.NumberFormat("de-DE", {maximumFractionDigits: 0, minimumFractionDigits:0}).format(this.point.y) + ' ppm</span>'
                    },
                    format: function() {

                    },
                    format1: '<strong style="font-size: 0.8em">{key:.0f}</strong><br/>' +
                        '{#each points}' +
                        '<span style="color:{color}">\u25CF</span> ' +
                        '{series.name}: <b>{y}</b><br/>' +
                        '{/each}',
                },

                plotOptions: {
                    series: {
                        cursor: 'pointer',
                        className: '',
                        marker: {
                            lineWidth: 1
                        },
                        events: {
                            legendItemClick: function () {
                                //disable legendItemClick
                                return false
                            }
                        }
                    }
                },

                series: seriesdata
            }, function (chart) {
                let i;
                for (i = 0; i < highchart.breaks.length; i++) {
                    this.xAxis[0].addPlotBand({
                        from:highchart.breaks[i].start,
                        to: highchart.breaks[i].end,
                        color: 'rgba(0,0,0,0.15)',
                        zIndex: 3333
                    })
                }
            });

            charts.push(chart)
        })

        //Mittelwert
        const mittelwertdata = [];

        for (let j = 0; j < highcharts.length; j++) {
            for (let i = 0; i < highcharts[j].plotintervals.length; i++) {
                var cmp_key = highcharts[j].plotintervals[i].end

                rooms.map((room) => {
                    if (rooms.id) {
                        if (highcharts[room.id.split('_')[2]].mittelwertdata[cmp_key]) {
                            var x = parseInt(room.id.split('_')[2])

                            mittelwertdata.push({
                                value: highcharts[x].mittelwertdata[cmp_key],
                                x: x,
                                y: i
                            })
                        }
                    }
                })
            }
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

        //y Achse
        const intervals = [];
        Object.values(highcharts[0].IntervaltickLabels).map((intervalitem) => {
            intervals.push(intervalitem)
        })

        //x-Achse
        //categories = räume
        let categories = []
        rooms.map((highchart) => {
            categories.push(highchart.legend)
        })

        //export chart
        eventhandler.highchartsSVGtoImage(charts[0], function(image) {
            const hiddenfield = document.querySelector('input[type="hidden"][name="linechart"]')
            hiddenfield.setAttribute('value', image)
        })
    }, []);

    return (
        <div className={"m-highcharts__linechart"}>
            <div className={"m-page__fields"}>
                <div className={"m-page__description"}>
                    <p>Hier können Sie (maximal) vier Lüftungsvarianten innerhalb einer Grafik miteinander vergleichen.</p>
                </div>

                <select autoComplete={"off"} defaultValue={roomselect} multiple={"multiple"} id={"chartselection"} className={"m-highcharts__select"} onChange={handleRoomselect}>
                    {rooms.map((highchart) => {
                        return (<option key={highchart.id} value={highchart.id}>{highchart.legend}</option>)
                    })}
                </select>

                <p>&nbsp;</p>
                <p>&nbsp;</p>
                <h2 className={"m-page__title"}>Momentanwert CO<sub>2</sub>-Konzentration in ppm</h2>
            </div>

            {highcharts[0].container}
        </div>
    )
}