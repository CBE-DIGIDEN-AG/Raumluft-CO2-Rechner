import React, { useState, useRef } from "react";


export default function Ajaxpage({slug}) {
    const [ajaxdata, setAjaxdata] = useState(() => {
        return {
            title: '',
            content: ''
        }
    });

    if (ajaxdata.title === '') {
        fetch('/ajaxpage?page=' + slug)
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

    return (<div className={"m-page"}>
        <h1>{ajaxdata.title}</h1>
        <div className={"m-page__text"} dangerouslySetInnerHTML={{__html: ajaxdata.content}}></div>
    </div>)
}
