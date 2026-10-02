import EventHandler from "../Tools/eventhandler";
import Require from "./validatores/require";
import RequireSelect from "./validatores/requireselect";
import Zip from "./validatores/zip";
import Date from "./validatores/date";
import Time from "./validatores/time";
import Integer from "./validatores/integer";
import Notnull from "./validatores/notnull";
import Float from "./validatores/float";
import Windowgroupcount from "./validatores/windowgroupcount";
import Floatrange from "./validatores/floatrange";
import Integersteps from "./validatores/integersteps";
import Length from "./validatores/length";

export default class ValidateHandler {
    validate(type, value, formfield) {
        if (!value && value !== '0' && value !== 0) {
            return false
        }

        //parse funcnames
        const reg = new RegExp('^\\s*(\\w+)\\s*\\((.*)\\)')
        let funcreg = reg.exec(type)

        if (funcreg) {
            type = funcreg[1]
        }

        switch(type) {
            case ('required'):
                if (formfield.type === 'select') {
                    return RequireSelect({value: value, formfield:formfield})
                }
                else {
                    return Require({value: value})
                }
                break;
            case ('zip'):
                return Zip({value: value})
                break;
            case ('date'):
                return Date({value: value})
                break;
            case ('time'):
                return Time({value: value})
                break;
            case ('integer'):
                return Integer({value: value})
                break;
            case ('notnull'):
                return Notnull({value: value})
                break;
            case ('float'):
                return Float({value: value})
                break;
            case ('windowgroupcount'):
                return Windowgroupcount({formfield: formfield, windowcount: funcreg[2]})
                break;
            case ('floatrange'):
                return Floatrange({value: value, range: funcreg[2].split('|')})
                break;
            case ('integersteps'):
                return Integersteps({value: value, wide: funcreg[2]})
                break;
            case ('length'):
                return Length({value: value, maxlength: funcreg[2]})
                break;
        }

        //unkonw validator
        return false
    }
}
