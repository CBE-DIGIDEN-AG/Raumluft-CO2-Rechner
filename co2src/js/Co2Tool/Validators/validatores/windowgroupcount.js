import EventHandler from "../../Tools/eventhandler";

export default function Windowgroupcount({formfield, windowcount}) {
    const eventhandler = new EventHandler()
    let count = 0

    const parseChildElements = (children) => {
        for (const child of children) {
            if (Array.isArray(child) === true) {
                parseChildElements(child)
            }
            else if (child && child.type && child.type.name === 'Formsfield') {
                //check value
                var parts = child.props.name.split('.')
                if (parts[parts.length-1] === 'windowcount') {
                    count += parseInt(eventhandler.getValue(child.props.name))
                }

                if (child.props.children) {
                    if (Array.isArray(child.props.children) === false) {
                        parseChildElements([child.props.children])
                    }
                    else {
                        parseChildElements(child.props.children)
                    }
                }
            }
            else if (child && child.props && child.props.children) {
                if (typeof child.props.children === 'object') {
                    var childs = child.props.children

                    if (Array.isArray(child.props.children) === false) {
                        childs = [childs]
                    }
                    parseChildElements(childs)
                }
            }
            else {
                //console.log(child)
            }
        }
    }

    parseChildElements(formfield.children)

    if (count > parseInt(windowcount)) {
        return false
    }

    return true
}
