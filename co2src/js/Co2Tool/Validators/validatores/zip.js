export default function Zip({value}) {

    const reg = new RegExp('^[0-9]{5}$')
    if (reg.exec(value)) {
        return true;
    }

    return false
}
