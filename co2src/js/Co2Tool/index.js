import React, {useReducer, useState, useRef} from "react";
import SidebarTreenavi from "./Sidebar/treenavi"
import EventHandler from "./Tools/eventhandler"
import Page from "./Page/page"
import Treenavi from "./Sidebar/treenavi";
import Formdata from "./Tools/formdata";
import SimpleBar from 'simplebar';
import { ErrorBoundary } from "react-error-boundary";

export default function Index({manifest}) {
    const eventhandler = new EventHandler()
    const formdata = new Formdata()
    eventhandler.manifestData = manifest

    let data_from_storage = JSON.parse(window.localStorage.getItem('co2tool'))
    if (data_from_storage) {
        eventhandler.projectdata = data_from_storage.projectdata
        eventhandler.sidebartree = data_from_storage.sidebartree
        eventhandler.copypaste = data_from_storage.copypaste
    }

    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

    const setRedirect = (config) => {
        //setContent(config.page)

        //eventhandler.handleSidebarEvent(null, config)
    }

    const [formerrors, setFormerrors] = useState(() => {
        return {}
    });

    const [showsidebar, setShowsidebar] = useState(() => {
        return true
    });

    const [content, setContent] = useState(() => {
        if (eventhandler.getUrlParams(location.search)['page']) {
            if (formdata.pageswithoutsidebar.includes(eventhandler.getUrlParams(location.search)['page'])) {
                setShowsidebar(false)
            }
            else {
                setShowsidebar(true)
            }

            return eventhandler.getUrlParams(location.search)['page']
        }

        setShowsidebar(false)

        return 'dashboard'
    });

    const [activemenu, setActivemenu] = useState(() => {
        if (eventhandler.getUrlParams(location.search)['page']) {
            return eventhandler.getUrlParams(location.search)['page']
        }

        return ''
    });

    const [shophelp, setShophelp] = useState(() => {
        return {}
    });

    const [copypaste, setCopypaste] = useState(() => {
        if (eventhandler.copypaste) {
            return eventhandler.copypaste
        }

        return []
    });

    const [sidebartree, setSidebartree] = useState(() => {
        if (eventhandler.sidebartree) {
            return eventhandler.sidebartree
        }

        return formdata.sidebartreebase
    });

    eventhandler.content = content
    eventhandler.setContent = setContent
    eventhandler.sidebartree = sidebartree
    eventhandler.setSidebartree = setSidebartree
    eventhandler.activemenu = activemenu
    eventhandler.setActivemenu = setActivemenu
    eventhandler.setRedirect = setRedirect
    eventhandler.formerrors = formerrors
    eventhandler.setFormerrors = setFormerrors
    eventhandler.forceUpdate = forceUpdate
    eventhandler.showsidebar = showsidebar
    eventhandler.setShowsidebar = setShowsidebar
    eventhandler.shophelp = shophelp
    eventhandler.setShophelp = setShophelp
    eventhandler.copypaste = copypaste
    eventhandler.setCopypaste = setCopypaste

    const handleDownload = (e) => {
        eventhandler.downloadProject()
    }

    const handleLogoCLick = (e) => {
        if (eventhandler.projectdata && eventhandler.sidebartree) {
            eventhandler.handleSidebarEvent(e,{page: 'dashboard'})
        }
        else {
            eventhandler.handleSidebarEvent(e,{page: 'projectresume'})
        }
    }

    const handleProjectResumeCLick = (e) => {
        if (eventhandler.projectdata && eventhandler.sidebartree) {
            eventhandler.handleSidebarEvent(e,{page: 'projektangaben'})
        }
    }

    const handleBackToHomeCLick = (e) => {
        if (eventhandler.projectdata && eventhandler.sidebartree) {
            eventhandler.handleSidebarEvent(e,{page: 'dashboard'})
        }
    }

    React.useEffect(() => {
        const sidebar = document.querySelector('.l-sidebar__inner')
        if (sidebar) {
            const bar = new SimpleBar(sidebar,{
                'direction': 'rtl'
            });
        }
    })


    const errorPage = ({ error, resetErrorBoundary }) => {
        return (
            <div className={"m-errorpage"} key={eventhandler.uuid()}>
                <div className={"m-errorpage__inner"} key={eventhandler.uuid()}>
                    <strong>Ein Fehler ist aufgetreten</strong>
                </div>
            </div>
        )
    }

    return (
        <ErrorBoundary fallbackRender={errorPage} fallback={""}>
            <div data-has-sidebar={showsidebar===true}>
                <header className={"l-header"}>
                    <div className={"container"}>
                        <div className={"row"}>
                            <div className={"l-header__inner"}>
                                <img src={eventhandler.manifest("images/content/logo-bbsr.svg")} alt={""} title={""} className={"l-header__logo"} onClick={handleLogoCLick}/>
                                <div>
                                    <h4>Raumluft-CO<sub>2</sub>-Rechner</h4>
                                    <div className={"m-form__button l-header__download"}>
                                        {eventhandler.projectdata.project && eventhandler.projectdata.project.projektname && (<a href={"#"} className={"l-header__projectresume"} onClick={handleProjectResumeCLick}>Dateneingabe fortsetzen</a>)}
                                        <a href={"#"} className={"l-header__download"} onClick={handleDownload}>Projekt speichern
                                            {eventhandler.projectdata.project && (<small>{eventhandler.projectdata.project.projektname}</small>)}
                                        </a>
                                        &nbsp;
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                <main className={"l-main"}>
                    <div className={"container"}>
                        <div className={"row"}>
                            {showsidebar === true && (
                                <aside className={"l-sidebar"}>
                                    <div className={"l-sidebar__wrapper"}>
                                        <div className={"l-sidebar__inner"}>
                                            <SidebarTreenavi/>
                                        </div>
                                    </div>
                                </aside>
                            )}

                            {showsidebar === false && eventhandler.activemenu !== 'dashboard' && eventhandler.activemenu !== '' && (
                                <a href={"#"} className={"l-sidebar_backtohome"} onClick={handleBackToHomeCLick}>zur Startseite</a>
                            )}

                            <article className={"l-content"}>
                                <Page page={content} />
                            </article>
                        </div>
                    </div>
                </main>
            </div>
        </ErrorBoundary>
    );
}
