export default function Floatrange({value, range}) {
    const reg = new RegExp('^[-+]?[0-9,-]*$')
    if (reg.exec(value)) {
        var valuefloat = parseFloat(value.replace(',','.'))

        if (valuefloat >= parseFloat(range[0]) && valuefloat <= parseFloat(range[1])) {
            return true;
        }
    }

    return false
}
