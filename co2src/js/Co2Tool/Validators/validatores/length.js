export default function Length({value, maxlength}) {
    if (value.length <= maxlength) {
        return true;
    }

    return false
}
