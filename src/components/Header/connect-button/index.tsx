import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useWeb3Context } from "../../../hooks";
import { DEFAULD_NETWORK } from "../../../constants";
import { IReduxState } from "../../../store/slices/state.interface";
import { IPendingTxn } from "../../../store/slices/pending-txns-slice";
import "./connect-menu.scss";
import CircularProgress from "@material-ui/core/CircularProgress";
import { colors } from "@material-ui/core";

import { useTranslation } from "react-i18next";

function ConnectMenu() {
    const { t } = useTranslation();
    const { connect, disconnect, connected, web3, providerChainID, checkWrongNetwork } = useWeb3Context();
    const dispatch = useDispatch();
    const [isConnected, setConnected] = useState(connected);

    let pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });

    let buttonText = t("ConnectWallet");
    let clickFunc: any = connect;
    let buttonStyle = {};

    if (isConnected) {
        buttonText = t("Disconnect");
        clickFunc = disconnect;
    }

    if (pendingTransactions && pendingTransactions.length > 0) {
        buttonText = t("CountPending", { count: pendingTransactions.length });
        clickFunc = () => {};
    }

    if (isConnected && providerChainID !== DEFAULD_NETWORK) {
        buttonText = t("WrongNetwork");
        buttonStyle = { backgroundColor: "rgb(255, 67, 67)", color: "#ffffff" };
        clickFunc = () => {
            checkWrongNetwork();
        };
    }

    useEffect(() => {
        setConnected(connected);
    }, [web3, connected]);

    return (
        <div className="connect-button" style={buttonStyle} onClick={clickFunc}>
            <p>{buttonText}</p>
            {pendingTransactions.length > 0 && (
                <div className="connect-button-progress">
                    <CircularProgress size={15} color="inherit" />
                </div>
            )}
        </div>
    );
}

export default ConnectMenu;
