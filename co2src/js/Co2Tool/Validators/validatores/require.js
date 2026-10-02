export default function Require({value}) {
    if (!value) {
        return false
    }
    else if (value === '') {
        return false
    }

    return true;
}
