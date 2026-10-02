export default function Notnull({value}) {
    if (!value) {
        return false
    }

    if (parseFloat(value.replace(',', '.')) === 0) {
        return false
    }

    return true
}
