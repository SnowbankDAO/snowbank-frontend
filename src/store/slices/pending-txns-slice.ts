import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import i18n from "../../i18n";
export interface IPendingTxn {
    readonly txnHash: string;
    readonly text: string;
    readonly type: string;
}

const initialState: Array<IPendingTxn> = [];

const pendingTxnsSlice = createSlice({
    name: "pendingTransactions",
    initialState,
    reducers: {
        fetchPendingTxns(state, action: PayloadAction<IPendingTxn>) {
            state.push(action.payload);
        },
        clearPendingTxn(state, action: PayloadAction<string>) {
            const target = state.find(x => x.txnHash === action.payload);
            if (target) {
                state.splice(state.indexOf(target), 1);
            }
        },
    },
});

export const getStakingTypeText = (action: string) => {
    return action.toLowerCase() === "stake" ? i18n.t("stake:StakingSB") : i18n.t("stake:UnstakingStakedSB");
};

export const getWrappingTypeText = (action: string) => {
    return action.toLowerCase() === "wrap" ? i18n.t("stake:WrappingSB") : i18n.t("stake:UnwrappingSB");
};

export const isPendingTxn = (pendingTransactions: IPendingTxn[], type: string) => {
    return pendingTransactions.map(x => x.type).includes(type);
};

export const txnButtonText = (pendingTransactions: IPendingTxn[], type: string, defaultText: string) => {
    return isPendingTxn(pendingTransactions, type) ? i18n.t("PendingEllipsis") : defaultText;
};

export const { fetchPendingTxns, clearPendingTxn } = pendingTxnsSlice.actions;

export default pendingTxnsSlice.reducer;
