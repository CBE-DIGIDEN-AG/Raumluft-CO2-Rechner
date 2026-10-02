import React from "react";
import EventHandler from "./eventhandler";
import eventHandler from "bootstrap/js/src/dom/event-handler";
import calc4108 from "./calculator/calc4108"
import calc16798 from "./calculator/calc16798"

let calculator_instance = null;

export default class Calculator {
    eventhandler = null

    //singleton interface
    constructor() {
        this.eventhandler = new EventHandler()

        if (calculator_instance) {
            return calculator_instance
        }

        if (this.eventhandler.method() === '16798') {
            calculator_instance = new calc16798();
        }
        else {
            calculator_instance = new calc4108();
        }

        return calculator_instance
    }
}
