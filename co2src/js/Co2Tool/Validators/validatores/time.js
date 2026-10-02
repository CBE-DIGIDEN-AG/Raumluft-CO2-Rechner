export default function Time({value}) {
    const reg = new RegExp('^(?:[01]?\\d|2[0-3])(?::[0-5]\\d){1,2}$')
    if (reg.exec(value)) {
        return true;
    }

    return false
}
