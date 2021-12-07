import { Dispatch } from "redux";
import { error } from "../store/slices/messages-slice";
import { messages } from "../constants/messages";

import i18n from "../i18n";

export const metamaskErrorWrap = (err: any, dispatch: Dispatch) => {
    let text = messages.something_wrong;

    if (err.code && err.code === -32603) {
        if (err.message.indexOf("ds-math-sub-underflow") >= 0) {
            text = i18n.t("messages.BondMoreThanYourBalance") + " Error code: 32603. Message: ds-math-sub-underflow";
        }

        if (err.data && err.data.message) {
            text = err.data.message.includes(":") ? err.data.message.split(":")[1].trim() : err.data.data || err.data.message;
        }

        if (err.data && err.data.message && err.data.message.includes("gas required exceeds allowance")) {
            text = i18n.t("messages.InsufficientBalance");
        }

        if (err.data && err.data.message && err.data.message.includes("Bond too small")) {
            text = i18n.t("messages.BondTooSmall");
        }
    }

    if (err.code && err.code === 4001) {
        if (err.message.includes("User denied transaction signature")) {
            text = i18n.t("messages.UserDeniedSignature");
        }
    }

    return dispatch(error({ text, error: err }));
};
