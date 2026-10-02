import React from "react";

export default function Requireselect({value, formfield}) {
    if (!value) {
        return false
    }
    else if (value === '') {
        return false
    }
    else if (formfield.options) {
        let value_exists = false
        
        formfield.options.map((option) => {
            if (option.key.toString() === value.toString()) {
                value_exists = true
            }
        })

        if (value_exists === false) {
            return false
        }
    }

    return true;
}
