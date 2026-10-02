export default function Date({value}) {

    const reg = new RegExp('^(0[1-9]|[12][0-9]|3[01])(\\.|\\/|-)(0[1-9]|1[0-2])(\\.|\\/|-)((?:19|20)\\d{2})')
    if (reg.exec(value)) {
        return true;
    }

    return false
}
