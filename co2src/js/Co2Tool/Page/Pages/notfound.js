import React, { useState, useRef } from "react";
import EventHandler from "../../Tools/eventhandler";

export default function notfound() {
    return (<div className={"m-pagecenter"}>
        <h1>404 Not found</h1>
        <div className={"m-page__text"}>
            <p>404 Not found</p>
        </div>
    </div>)
}
