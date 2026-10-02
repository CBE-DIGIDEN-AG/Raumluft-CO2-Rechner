export default function Float({value}) {
    const reg = new RegExp('^[0-9,]*$')
    if (reg.exec(value)) {
        return true;
    }

    return false
}
