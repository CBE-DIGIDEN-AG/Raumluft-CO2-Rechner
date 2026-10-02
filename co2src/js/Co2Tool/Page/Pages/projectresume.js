import React, { useState, useRef, useEffect } from "react";
import EventHandler from "../../Tools/eventhandler";

export default function projectresume() {
    const eventhandler = new EventHandler()

    const handleUpload = (e) => {
        eventhandler.uploadProject(e.target.files, handleUploadSuccess)
    }

    const [uploadstatus, setUploadstatus] = useState(() => {
        return ''
    });

    const handleUploadSuccess = (status, message) => {
        if (status === true) {
            setUploadstatus((<div className={"m-dashboard__projectresume"}>
                    <strong>Ihr Projekt wurde erfolgreich hochgeladen!</strong>
                    <a href={"#"} onClick={handleUploadSuccessRedirect}>zu den Projektdaten</a>
                </div>)
            )
        }
        else {
            setUploadstatus('Beim Projektupload trat ein Fehler auf.')
        }
    }

    const handleUploadSuccessRedirect = (e) => {
        eventhandler.handleSidebarEvent(e,{page: 'projektangaben'})
    }

    React.useEffect(() => {
        const dropArea = document.querySelector('.m-projectupload')
        if (dropArea) {
            ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropArea.addEventListener(eventName, preventDefaults, false)
            })

            function preventDefaults (e) {
                e.preventDefault()
                e.stopPropagation()
            }

            ;['dragenter', 'dragover'].forEach(eventName => {
                dropArea.addEventListener(eventName, highlight, false)
            })

            ;['dragleave', 'drop'].forEach(eventName => {
                dropArea.addEventListener(eventName, unhighlight, false)
            })

            function highlight(e) {
                dropArea.classList.add('highlight')
            }

            function unhighlight(e) {
                dropArea.classList.remove('highlight')
            }

            dropArea.addEventListener('drop', handleDrop, false)

            function handleDrop(e) {
                let dt = e.dataTransfer
                eventhandler.uploadProject(dt.files, handleUploadSuccess)
            }
        }
    })

    return (<div className={"m-pagecenter"}>
        <h1>Gespeichertes Projekt fortsetzen</h1>

        <div className={"m-page__text"}>
            Um ein Projekt fortzusetzen, ziehen Sie die Projektdatei per Drag & Drop auf das Feld, oder klicken Sie, um die Datei auszuwählen.
        </div>

        {uploadstatus && (
            <div className={"m-page__message"}>
                {uploadstatus}
            </div>
        )}

        <div className={"m-projectupload"}>
            <div className={"m-projectupload__input"}>
                <input onChange={handleUpload} type="file" name="files" id="file" />
                <label htmlFor={"file"}><strong>Datei wählen</strong></label>
            </div>
        </div>
    </div>)
}
