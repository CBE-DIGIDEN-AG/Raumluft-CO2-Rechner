import PageCallback from "../Sidebar/callback";
import React from "react";
import Formdata from "./formdata";
import ValidateHandler from "../Validators/validateHandler";

let eventhandler_instance = null;

export default class Eventhandler {
    content = null
    setContent = null
    sidebartree = null
    setSidebartree = null
    formerrors = null
    setFormerrors = null
    forceUpdate= null
    activemenu = null
    setActivemenu = null
    setRedirect = null
    showsidebar = null
    setShowsidebar = null
    shophelp = null
    setShophelp = null
    copypaste = null
    setCopypaste = null
    manifestData = null
    debugMode = false

    //singleton interface
    constructor() {
        if (eventhandler_instance) {
           return eventhandler_instance
        }
        eventhandler_instance = this;
    }

    projectdata = {
        project: {
            name: '',
            bnb_projektnummer: '',
            bau_reg_nr: '',
            date: '',
            building: ''
        },
        dayprofile: {

        }
    }

    forms = {}
    formsReact = {}
    formdata = new Formdata()

    uuid() {
        return ([1e7]+1e3+4e3+8e3+1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    setActiveEntityForPopups(entity) {
        this.activeEntityForPopups = entity
    }

    method() {
        if (this.projectdata.project && this.projectdata.project.method === '16798') {
            return '16798'
        }

        if (this.projectdata.project && this.projectdata.project.method === '4108') {
            return '4108'
        }
    }

    manifest(key) {
        if (this.manifestData && this.manifestData[key]) {
            return this.manifestData[key]
        }

        if (this.manifestData && this.manifestData['co2/' + key]) {
            return this.manifestData['co2/' + key]
        }

        return key
    }

    log = (message_name, message_var = '', level='log') => {
        if (this.debugMode === true) {
            let styling_name = ''
            let styling_var = ''

            switch (level) {
                case ('log'):
                    styling_name = 'background: #ccc; color: #000000'
                    styling_var = 'background: transparent; color: #d00'
                    break

                case ('notice'):
                    styling_name = 'background: #dddd00; color: #111111'
                    styling_var = 'background: transparent; color: #d00'
                    break

                case ('error'):
                    styling_name = 'background: #d00; color: #ffffff'
                    styling_var = 'background: transparent; color: #d00'
                    break
            }

            console.log('%c' + message_name + ':%c ' + message_var, styling_name, styling_var)
        }
    }

    createHash = (string) => {
        var i, l, hval = 0x811c9dc5;

        for (i = 0, l = string.length; i < l; i++) {
            hval ^= string.charCodeAt(i);
            hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
        }

        return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
    }

    intervals_are_unique() {
        let intervalls_to_compare = []
        this.projectdata.dayprofile.roomtypes.map((room, roomkey) => {
            if (!room) {
                return
            }

            let intervall_to_compare = []

            if (this.projectdata['dayprofile']['usageprofiles'][room.key]) {
                const usageprofile = this.projectdata['dayprofile']['usageprofiles'][room.key]

                intervall_to_compare.push(usageprofile.start)

                usageprofile.intervals.map((interval, intervalkey) => {
                    if (!interval) {
                        return
                    }

                    intervall_to_compare.push(interval.duration)
                })
            }

            intervalls_to_compare.push(intervall_to_compare)
        })

        return intervalls_to_compare.every(function(n) {
            return (n.every( e => intervalls_to_compare[0].includes(e)))
        });
    }

    destroyProject = () => {
        this.projectdata = {}
        this.sidebartree = this.formdata.sidebartreebase
        this.copypaste = []

        window.localStorage.removeItem('co2tool')
        this.store()
    }

    addToCopyPaste = (name, element) => {
        this.copypaste = []
        this.copypaste.push({
            time: Date.now(),
            name: name,
            element: element
        })
        this.setCopypaste(this.copypaste)

        this.store()
    }

    hasCopyPaste = (name) => {
        for (const item of Object.entries(this.copypaste)) {
            if (item[1].name === name) {
                return true
            }
        }

        return false
    }

    getCopyPaste = (name) => {
        for (const item of Object.entries(this.copypaste).reverse()) {
            if (item[1].name === name) {
                return item[1].element
            }
        }

        return false
    }

    // TODO abstract function
    expandSidebarTree(parent, childs, force=false) {
        return this.expandSidebarTreeRecursive(parent.split('.'), this.sidebartree, childs, force)
    }

    expandSidebarTreeRecursive(parts,storage ,childs, force=false) {
        var part = parts[0]
        parts.shift()

        if (parts.length > 0 && storage) {
            return this.expandSidebarTreeRecursive(parts, storage[part].childs, childs, force)
        }
        else if (storage) {
            if (!storage[part]) {
                return null
            }

            for (const child of Object.entries(childs)) {
                if (!storage[part].childs) {
                    storage[part].childs = {}
                }

                if (force === true || !storage[part].childs[child[0]]) {
                    storage[part].childs[child[0]] = child[1]
                }
            }
        }
    }

    find_set_in_sidebartree(id, value=null, prefix='') {
        return this.find_set_in_sidebartree_recursive(id.split('.'), this.sidebartree , value, prefix)
    }

    find_set_in_sidebartree_recursive(parts, storage, value=null, prefix='') {
        var part = parts[0]
        parts.shift()

        if (parts.length > 0 && storage && storage[part]) {
            return this.find_set_in_sidebartree_recursive(parts, storage[part].childs, value, prefix)
        }
        else if (storage) {
            if (prefix !== '') {
                if (part.indexOf(prefix) === 0) {
                  var partdump = part.replace(prefix, '')

                    if (partdump !== 's') {
                        part = partdump
                    }
                }
            }

            if (!storage[part]) {
                return null
            }

            if (value) {
                storage[part] = value
                this.store()
            }

            return storage[part]
        }
    }


    removeFromSidebarTree(parent, childs, force= false) {
        var parts = parent.split('.')

        //TODO muss be recursive
        if (parts.length === 1) {
            //merge if needed

        }
        else if (parts.length === 2) {
            for (const child of Object.entries(childs)) {
                if (force === true || this.sidebartree[parts[0]].childs[parts[1]].childs[child[0]]) {
                    //TODO fehler abfangen
                    delete this.sidebartree[parts[0]].childs[parts[1]].childs[child[0]]
                }
            }
        }
        else if (parts.length === 3) {
            for (const child of Object.entries(childs)) {
                if (force === true || this.sidebartree[parts[0]].childs[parts[1]].childs[parts[2]].childs[child[0]]) {
                    //TODO fehler abfangen
                    try {
                        delete this.sidebartree[parts[0]].childs[parts[1]].childs[parts[2]].childs[child[0]]
                    }
                    catch(e) {}
                }
            }
        }
    }

    removeAllChildsFromSidebarTree(parent, force= false) {
        var parts = parent.split('.')

        //TODO muss be recursive
        if (parts.length === 1) {
            //merge if needed

        }
        else if (parts.length === 2) {
            if (force === true || this.sidebartree[parts[0]].childs[parts[1]].childs) {
                try {
                    this.sidebartree[parts[0]].childs[parts[1]].childs = {}
                }
                catch(e) {}
            }
        }
        else if (parts.length === 3) {
            if (force === true || this.sidebartree[parts[0]].childs[parts[1]].childs[parts[2]].childs) {
                try {
                    this.sidebartree[parts[0]].childs[parts[1]].childs[parts[2]].childs = {}
                }
                catch(e) {}
            }
        }
    }

    handleChangeContentEvent(e, name) {
        var parts = name.split('.')

        if (parts.length === 1) {
            this.handleSidebarEvent(e, {page: name})
        }
        else if (parts.length === 2 && parts[0] === 'page') {
            this.handleSidebarEvent(e, {page: parts[1]})
        }
        else if (parts.length === 3 && parts[0] === 'page') {
            this.handleSidebarEvent(e, {page: parts[1] + '.' + parts[2]})
        }
        else if (parts.length === 4 && parts[0] === 'page') {
            this.handleSidebarEvent(e, {page: parts[1] + '.' + parts[2] + '.' + parts[3]})
        }
    }

    store() {
        window.localStorage.removeItem('co2tool');
        window.localStorage.setItem('co2tool', JSON.stringify({projectdata: this.projectdata,sidebartree: this.sidebartree, copypaste: this.copypaste }));
    }

    handleSidebarEvent = (e, config) => {
        //store current scrollposiiton
        //var currentop = document.body.getBoundingClientRect().top
        if (this.formdata.pageswithoutsidebar.includes(config.page)) {
            this.setShowsidebar(false)
        }
        else {
            this.setShowsidebar(true)
        }

        //reset form errors on new site call
        this.formerrors = []
        this.setFormerrors([])

        //set content
        this.setContent(config.page)

        //set active element in tree in sidebar
        this.setActivemenu(config.page)

        //store data
        this.store()

        history.pushState({}, "", '?page='+config.page);
    }

    // TODO abstract function / recursive
    getSidebarByForm = (form) => {
        var formparts = form.split('.')

        try {
            var sidebarelement = null
            if (formparts.length === 1) {
                return this.sidebartree[formparts[0]]
            }
            else if (formparts.length === 2) {
                return this.sidebartree[formparts[0]].childs[formparts[1]]
            }
            else if (formparts.length === 3) {
                return this.sidebartree[formparts[0]].childs[formparts[1]].childs[formparts[2]]
            }
            else if (formparts.length === 4) {
                return this.sidebartree[formparts[0]].childs[formparts[1]].childs[formparts[2]].childs[formparts[3]]
            }
        }
        catch(e) {

        }
    }

    uploadProject = (files, callback) => {
        try {
            const obj = this
            var reader = new FileReader()
            reader.onload = function() {
                try {
                    var datadump = JSON.parse(reader.result)

                    if (datadump.projectdata && datadump.sidebartree) {
                        obj.destroyProject()

                        obj.projectdata = datadump.projectdata
                        obj.sidebartree = datadump.sidebartree
                        obj.copypaste   = datadump.copypaste

                        obj.setSidebartree(obj.sidebartree)

                        obj.store()
                        obj.forceUpdate()

                        callback(true, '')
                    }
                    else {
                        throw ('invalid structure')
                    }
                }
                catch(e) {
                    callback(false, e)
                }
            };
            reader.readAsText(files[0])
        }
        catch(e) {
        }
    }

    slugify = str =>
        str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '_')
            .replace(/^-+|-+$/g, '')

    downloadProject = () => {
        let filename = 'project'
        const currentDate = new Date()
        const dateoptions = { year: 'numeric', month: 'short', day: 'numeric' };

        const mimeType = "data:text/plain;charset=utf-8";

        if (this.projectdata.project.projektname) {
            filename = this.projectdata.project.projektname
        }

        filename += '_' + currentDate.toLocaleDateString('de-DE', dateoptions)
        filename = this.slugify(filename)
        filename += '.json'

        var csvFile = JSON.stringify(
            {
                projectdata: this.projectdata,
                sidebartree: this.sidebartree,
                copypaste:   this.copypaste
            }
        );

        var blob = new Blob([csvFile], { type: mimeType });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, filename);
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }

    getUrlParams = (search) => {
        let hashes = search.slice(search.indexOf('?') + 1).split('&')
        return hashes.reduce((params, hash) => {
            let [key, val] = hash.split('=')
            return Object.assign(params, {[key]: decodeURIComponent(val)})
        }, {})
    }

    getValue = (name, entity) => {
        var parts = name.split('.')

        if (entity && entity.isnew === true) {
            var last = parts[parts.length-1]

            return this.getValueRecursive([last], entity)
        }
        else {
            return this.getValueRecursive(parts, this.projectdata)
        }
    }

    getValueRecursive = (parts, storage) => {
        var part = parts[0]
        parts.shift()

        if (parts.length > 0 && storage) {
            return this.getValueRecursive(parts, storage[part])
        }
        else if (storage) {
            return storage[part]
        }
    }

    handleHelp = (e, name) => {
        var shophelpdump = this.shophelp

        if (this.shophelp[name] === true) {
            shophelpdump[name] = false
        }
        else {
            shophelpdump[name] = true
        }

        //close all others
        for (const helpitem of Object.entries(this.shophelp)) {
            if (helpitem[0] !== name) {
                shophelpdump[helpitem[0]] = false
            }
        }

        this.setShophelp(shophelpdump)
    }

    getTimeFromTS = (ts) => {
        var date = new Date(ts * 1000)
        var hours = date.getHours()
        var minutes = "0" + date.getMinutes()

        return hours + ':' + minutes.substr(-2)
    }

    validateForm = (form, entity=null,checkonly = false) => {
        const validateHandler = new ValidateHandler()
        let form_is_valid = true;

        for (const formfield of form) {
            if (formfield.validator) {
                const validators = formfield.validator.split(',')
                let field_has_error = false

                for (const validator of validators) {
                    if (validateHandler.validate(validator, this.getValue(formfield.name, entity), formfield) === false) {
                        field_has_error = true
                    }
                }

                if (field_has_error === true) {
                    if (checkonly === false) {
                        this.formerrors[formfield.name] = {
                            field: formfield.name,
                            triggerd_validator : 'required'
                        }

                        this.setFormerrors(this.formerrors)
                    }

                    form_is_valid = false
                }
                else {
                    if (checkonly === false) {
                        delete this.formerrors[formfield.name]
                    }
                }
            }
        }

        return form_is_valid
    }

    highchartsSVGtoImage = (chart, callback) => {
        try {
            var svg = chart.getSVG({
                exporting: {
                    sourceWidth: chart.chartWidth,
                    sourceHeight: chart.chartHeight
                }})
            var canvas = document.createElement('canvas');
            canvas.width = chart.chartWidth;
            canvas.height = chart.chartHeight;
            var ctx = canvas.getContext('2d');
            var img = document.createElement('img');

            img.onload = function() {
                ctx.drawImage(img, 0, 0);
                callback(canvas.toDataURL('image/png'));
            };

            img.setAttribute('src', 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg))));
        }
        catch(e) {
            console.log(e)
        }
    }

    requireddisclaimer = () => {
        return (<span className={"m-page__requireddisclaimer"}>* Pflichtfeld</span>)
    }
}
