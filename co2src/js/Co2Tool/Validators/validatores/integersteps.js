export default function Integersteps({value, wide}) {
    if ((value % wide) === 0) {
        return true;
    }

    return false
}
