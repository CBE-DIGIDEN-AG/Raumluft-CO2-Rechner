import React, { useState, useRef } from "react";
import EventHandler from "../../Tools/eventhandler";

export default function dashboard() {
    const eventhandler = new EventHandler()

    const [confirm, setConfirm] = useState(() => {
        return ''
    });

    const handleNewProject = (e) => {
        if (eventhandler.projectdata) {

        }

        var description = ''

        setConfirm((<div className={"m-list__confirm"}>
            <div className={"m-list__confirminner"}>
                <strong></strong>
                <div className={"m-list__confirmactions"}>
                    <a href={"#"} data-type={"create"} onClick={(e) => handleNewProjectConfirm(e)}>Neues Projekt beginnen</a>
                    <a href={"#"} data-type={"cancel"} onClick={(e) => handleNewProjectCancel(e)}>Abbrechen</a>
                </div>

                <strong></strong>

                <strong>Bereits eingegebene Projektdaten werden zurückgesetzt.<span> Bitte speichern Sie Ihre Eingaben regelmäßig.</span>
                </strong>
            </div>
        </div>))
    }

    const handleNewProjectConfirm = (e, entity, key, editCallback) => {
        eventhandler.destroyProject()
        setConfirm(null)
        eventhandler.store()

        //simulate go to page
        history.pushState({}, "", '?page=method');
        location.reload()
    }

    const handleNewProjectCancel = (e, entity, key, editCallback) => {
        setConfirm(null)
    }

    const [ajaxdata, setAjaxdata] = useState(() => {
        return {
            title: '',
            content: ''
        }
    });

    if (ajaxdata.title === '') {
        fetch('/ajaxpage?page=dashboard')
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                setAjaxdata({
                    title: data.title,
                    content: (data.content.normalize())
                })
            })
            .catch(function(error) {
                //console.error(error);
            });
    }

    return (<div className={"m-pagecenter"}>
        {confirm}
        <h1>{ajaxdata.title}</h1>

        <div className={"m-page__text"} dangerouslySetInnerHTML={{__html: ajaxdata.content}}></div>
        <div className={"m-page__text"}>
            <p>&nbsp;</p>

            <div className={"m-dashboard__buttons"}>
                <a href={"#"} onClick={(e) => handleNewProject(e)}>Neues Projekt</a>
                <a href={"#"} onClick={(e) => eventhandler.handleSidebarEvent(e, {page: 'projectresume'})}>Gespeichertes
                    Projekt fortsetzen</a>
            </div>

            <ul className={"dashboardProjectFooterMenu"}>
                <li data-is-active={'toolbeschreibung' === eventhandler.activemenu}>
                    <a href={"#"}
                       onClick={(e) => eventhandler.handleSidebarEvent(e, {page: 'toolbeschreibung'})}>Toolbeschreibung</a>
                </li>
                <li data-is-active={'impressum' === eventhandler.activemenu}>
                    <a href={"#"} onClick={(e) => eventhandler.handleSidebarEvent(e, {page: 'impressum'})}>Impressum</a>
                </li>
                <li data-is-active={'datenschutz' === eventhandler.activemenu}>
                    <a href={"#"}
                       onClick={(e) => eventhandler.handleSidebarEvent(e, {page: 'datenschutz'})}>Datenschutz</a>
                </li>
                <li data-is-active={'barrierefreiheit' === eventhandler.activemenu}>
                    <a href={"#"}
                       onClick={(e) => eventhandler.handleSidebarEvent(e, {page: 'barrierefreiheit'})}>Erklärung zur Barrierefreiheit</a>
                </li>
                <li data-is-active={'barrieremelden' === eventhandler.activemenu}>
                    <a href={"#"}
                       onClick={(e) => eventhandler.handleSidebarEvent(e, {page: 'barrieremelden'})}>Barriere melden</a>
                </li>
                <li data-is-active={'gebaerdensprache' === eventhandler.activemenu}>
                    <a href={"#"} className={"handicon"}
                       onClick={(e) => eventhandler.handleSidebarEvent(e, {page: 'gebaerdensprache'})}></a>
                </li>
                <li data-is-active={'easyspeech' === eventhandler.activemenu}>
                    <a href={"#"} className={"easyspeechicon"}
                       onClick={(e) => eventhandler.handleSidebarEvent(e, {page: 'easyspeech'})}></a>
                </li>
            </ul>
        </div>
    </div>)
}
