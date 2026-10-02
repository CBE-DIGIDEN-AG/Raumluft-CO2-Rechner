import React, { useState, useRef } from "react";
import EventHandler from "./eventhandler";
import {Formsfield} from "../Forms/formsfield";

export default function Listbuilder({addlabel, model, storage,detailpage,next,prev, show,setShow, editCallback, entity, title, contextmenu,page, dragdrop, beforeList, afterList, itemCallback, layout='small', classNames, parameter, messages, createlabel = 'neuer Datensatz', storageItemValidate, limit=999}) {
    const eventhandler = new EventHandler()

    const id = 'list' + eventhandler.uuid()

    const [confirm, setConfirm] = useState(() => {
        return ''
    });

    const [statusmessages, setStatusmessages] = useState(() => {
        return ''
    });

    const handleCreate = (e, editCallback) => {
        let entity = new model({name: createlabel, key: storage.length})

        show = 'new'
        setShow(show)

        //need to be discussed
        storage.push(entity)
        //eventhandler.store()
        //eventhandler.forceUpdate()

        editCallback(e, entity, 'editstart')
    }

    const handleEdit = (e, entityfromcall, key, editCallback) => {
        editCallback(e, entityfromcall, 'editstart')
    }

    const handleContextClone = (e, entity, key, editCallback) => {
        let clone = Object.assign(Object.create(entity), entity)
        clone.uuid = eventhandler.uuid()
        clone.key = storage.length

        editCallback(e, clone, 'clone')

        if (clone.name) {
            clone.name = 'Kopie von ' + clone.name
        }

        storage.push(clone)
        eventhandler.store()

        editCallback(e, entity, 'editend')
        show = 'list'
        setShow(show)
    }

    const handleContextClearintervall = (e, entity, key, editCallback) => {
        var title = 'Wollen Sie das Intervall wirklich leeren?'
        var description = ''

        setConfirm((<div className={"m-list__confirm"}>
            <div className={"m-list__confirminner"}>
                <strong>{title}</strong>
                {description && (<span className={"desc"}>{description}</span>)}

                <div className={"m-list__confirmactions"}>
                    <a href={"#"} data-type={"delete"} onClick={(e) => handleContextClearintervallConfirmed(e, entity, key, editCallback)}>Leeren</a>
                    <a href={"#"} data-type={"cancel"} onClick={(e) => handleContextCancel(e, entity, key, editCallback)}>Abbrechen</a>
                </div>
            </div>
        </div>))
    }


    const handleContextClearintervallConfirmed = (e, entity, key, editCallback) => {
        //clear sidebartree
        let map = {};
        for (const interval of Object.entries(entity.intervals)) {
            map[interval[0]] = {
                id: 'dayprofile.usageprofiles.usageprofile' + entity.roomtype + '.interval'+interval[0],
            }
        }
        eventhandler.removeAllChildsFromSidebarTree('dayprofile.usageprofiles.'+entity.roomtype, true)

        console.log(eventhandler.sidebartree.dayprofile)

        //clear entities
        entity.intervals = []

        eventhandler.store()

        setConfirm(null)

        setStatusmessages((<p>
            <strong>Das Intervall wurde erfolgreich geleert.</strong>
        </p>))

        eventhandler.forceUpdate()
    }

    const handleContextCopyintervall = (e, entity, key, editCallback) => {
        eventhandler.addToCopyPaste('intervall',entity)

        setStatusmessages((<p>
            <strong>Das Intervall wurde in der Zwischenablage gespeichert.</strong>
        </p>))
    }

    const handleContextPasteintervall = (e, entity, key, editCallback) => {
        const copyiedentity = eventhandler.getCopyPaste('intervall')
        entity.intervals = []

        //startzeit mitnehmen
        entity.start = copyiedentity.start
        
        //correct sidebartree
        let map = {};

        //we cleanup gaps in id´s
        let i = 0
        for (const interval of Object.entries(copyiedentity.intervals)) {
            if (!interval[1]) {
                continue
            }

            let clonedintervall = Object.assign(Object.create(interval[1]), interval[1])
            clonedintervall.uuid = eventhandler.uuid()
            clonedintervall.key = i //keys has to be the same

            //we have to cleanup some values before we clone it
            clonedintervall.windows = []

            entity.intervals.push(clonedintervall)

            map[interval[0]] = {
                id: 'dayprofile.usageprofiles.usageprofile' + entity.roomtype + '.interval'+i,
                submenu_isopen: false,
                title: interval[1].name,
                valid: false
            }

            i++
        }
        eventhandler.expandSidebarTree('dayprofile.usageprofiles.'+entity.roomtype, map, true)

        eventhandler.store()
        eventhandler.forceUpdate()

        setStatusmessages((<p>
            <strong>Das Intervall wurde erfolgreich eingefügt.</strong>
        </p>))
    }

    const handleContextDelete = (e, entity, key, editCallback) => {
        var title = 'Wollen Sie den Datensatz wirklich löschen?'
        if (messages && messages.delete.title) {
            title = messages.delete.title
        }
        title = title.replace('%name%', entity.name)

        var description = ''
        if (messages && messages.delete.description) {
            description = messages.delete.description
        }
        description = description.replace('%name%', entity.name)

        setConfirm((<div className={"m-list__confirm"}>
            <div className={"m-list__confirminner"}>
                <strong>{title}</strong>
                {description && (<span className={"desc"}>{description}</span>)}

                <div className={"m-list__confirmactions"}>
                    <a href={"#"} data-type={"delete"} onClick={(e) => handleContextDeleteConfirm(e, entity, key, editCallback)}>Löschen</a>
                    <a href={"#"} data-type={"cancel"} onClick={(e) => handleContextCancel(e, entity, key, editCallback)}>Abbrechen</a>
                </div>
            </div>
        </div>))
    }

    const handleContextDeleteConfirm = (e, entity, key, editCallback) => {
        storage.map((storageentity, key) => {
            if (storageentity === entity) {
                delete storage[key]

                eventhandler.store()

                editCallback(e, entity, 'removeitem')
            }
        })

        setConfirm(null)
    }

    const handleContextCancel = (e, entity, key, editCallback) => {
        setConfirm(null)
    }

    const HandleDragDropStore = (e,items) => {
        let newOrder = []
        for (const item of items) {
            newOrder.push(storage[item.getAttribute('data-key')])
        }

        for (var i= 0; i <= newOrder.length;i++) {
            if(newOrder[i]) {
                newOrder[i].key = i
                storage[i] = newOrder[i]
            }
        }

        eventhandler.store()

        editCallback(e, entity, 'afterdragdrop')
    }

    React.useEffect((e) => {
        if (dragdrop === true) {
            const target = document.querySelector('#' + id)

            if (target) {
                target.classList.add("slist");
                let items = target.querySelectorAll(".m-list__item"), current = null;

                for (let i of items) {
                    i.draggable = true;

                    i.ondragstart = e => {
                        current = i;
                        for (let it of items) {
                            if (it != current) { it.classList.add("hint"); }
                        }
                    };

                    i.ondragenter = e => {
                        if (i != current) { i.classList.add("active"); }
                    };

                    i.ondragleave = () => i.classList.remove("active");
                    i.ondragend = () => { for (let it of items) {
                        it.classList.remove("hint");
                        it.classList.remove("active");
                    }};

                    i.ondragover = e => e.preventDefault();

                    i.ondrop = e => {
                        e.preventDefault();
                        if (i != current) {
                            let currentpos = 0, droppedpos = 0;
                            for (let it=0; it<items.length; it++) {
                                if (current == items[it]) { currentpos = it; }
                                if (i == items[it]) { droppedpos = it; }
                            }

                            if (currentpos < droppedpos) {
                                i.parentNode.insertBefore(current, i.nextSibling);
                            } else {
                                i.parentNode.insertBefore(current, i);
                                i.parentNode.insertBefore(current, i.nextSibling);
                            }

                            HandleDragDropStore(e, target.querySelectorAll(".m-list__item"))
                        }
                    };
                }
            }
        }
    })

    if (!classNames) { classNames = {} }
    if (!classNames.listimtem) { classNames.listimtem = '' }

    const getStorageLength = () => {
        let length = 0

        storage.map((storageentity, key) => {
            if (storageentity) {
                length++
            }
        })

        return length
    }

    return (<div className={"m-page__container"} key={eventhandler.uuid()}>
        {confirm}

        {statusmessages && (
            <div className={"m-page__message"}>
                {statusmessages}
            </div>
        )}

        {(show === 'new') && (React.createElement(detailpage, {entity: entity, editCallback: editCallback}))}
        {(show === 'edit') && (React.createElement(detailpage, {entity: entity, editCallback: editCallback, page: page, parameter: parameter}))}
        {(show === 'list') && (
            <div className={"m-page__container"} key={eventhandler.uuid()}>
                <div className={"m-page__fields"} data-layout={layout}>
                    <h2>{title}</h2>

                    {beforeList && beforeList()}

                    <div className={"m-list"} id={id}>
                        {storage.map((entity, key) => {
                            if (entity) {
                                if (storageItemValidate && storageItemValidate(entity) === false) {
                                    return
                                }

                                return (
                                    <div className={"m-list__item " + classNames.listimtem} key={eventhandler.uuid()} data-key={entity.key}>
                                        <span className={"name"}>{entity.name}</span>
                                        <span className={"edit"} onClick={(e) => handleEdit(e, entity, key, editCallback)}>Edit</span>
                                        {contextmenu.length >0 && <div className={"context"}><span>...</span>
                                            <ul className={"m-list__contextmenu"}>
                                                {(limit && limit > getStorageLength()) && contextmenu.includes('clone') && <li onClick={(e) => handleContextClone(e, entity, key, editCallback)}>Duplizieren</li>}
                                                {contextmenu.includes('delete') && <li onClick={(e) => handleContextDelete(e, entity, key, editCallback)}>Löschen</li>}
                                                {contextmenu.includes('clearintervall') && <li onClick={(e) => handleContextClearintervall(e, entity, key, editCallback)}>Lüftungskonzept leeren</li>}
                                                {contextmenu.includes('copyintervall') && <li onClick={(e) => handleContextCopyintervall(e, entity, key, editCallback)}>Lüftungskonzept kopieren</li>}
                                                {contextmenu.includes('pasteintervall') && eventhandler.hasCopyPaste('intervall') && <li onClick={(e) => handleContextPasteintervall(e, entity, key, editCallback)}>Lüftungskonzept einfügen</li>}
                                            </ul>
                                        </div>}
                                        {itemCallback && itemCallback(entity)}
                                    </div>
                                )
                            }
                        })}
                    </div>

                    {(limit && limit > getStorageLength()) && addlabel && (<span className={"m-list__create"} onClick={(e) => handleCreate(e, editCallback)}>{addlabel}</span>)}

                    {afterList && afterList()}
                </div>

                <div className={"actions"}>
                    {prev && (<Formsfield type={"submit"} name={prev} value={"back"} label={"zurück"} />)}
                    {next && (<Formsfield type={"submit"} name={next} value={"next"} label={"Übernehmen und weiter"} />)}
                </div>
            </div>
        )}
    </div>)
}

Listbuilder.customname = 'Listbuilder'