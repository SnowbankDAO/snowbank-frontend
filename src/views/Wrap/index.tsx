import { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Grid, InputAdornment, OutlinedInput, Zoom } from "@material-ui/core";
import RebaseTimer from "../../components/RebaseTimer";
import { trim } from "../../helpers";
import { changeWrap, changeApproval } from "../../store/slices/wrap-thunk";
import "./wrap.scss";
import { useWeb3Context } from "../../hooks";
import { IPendingTxn, isPendingTxn, txnButtonText } from "../../store/slices/pending-txns-slice";
import { Skeleton } from "@material-ui/lab";
import { IReduxState } from "../../store/slices/state.interface";
import { messages } from "../../constants/messages";
import classnames from "classnames";
import { warning } from "../../store/slices/messages-slice";
import { IAppSlice } from "../../store/slices/app-slice";

import { useTranslation } from "react-i18next";

function Stake() {
    const { t } = useTranslation();

    const dispatch = useDispatch();
    const { provider, address, connect, chainID, checkWrongNetwork } = useWeb3Context();
    const app = useSelector<IReduxState, IAppSlice>(state => state.app);

    const [view, setView] = useState(0);
    const [quantity, setQuantity] = useState<string>("");

    const isAppLoading = useSelector<IReduxState, boolean>(state => state.app.loading);
    const currentIndex = useSelector<IReduxState, string>(state => {
        return state.app.currentIndex;
    });

    const wrapAllowance = useSelector<IReduxState, number>(state => {
        console.log(state.account.wrapping.ssbAllowance);
        return state.account.wrapping.ssbAllowance;
    });
    const sbBalance = useSelector<IReduxState, string>(state => {
        return state.account.balances && state.account.balances.sb;
    });
    const ssbBalance = useSelector<IReduxState, string>(state => {
        return state.account.balances && state.account.balances.ssb;
    });
    const wssbBalance = useSelector<IReduxState, string>(state => {
        return state.account.balances && state.account.balances.wssb;
    });

    const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });

    const setMax = () => {
        if (view === 0) {
            setQuantity(ssbBalance);
        } else {
            setQuantity(wssbBalance);
        }
    };

    const onSeekApproval = async (token: string) => {
        if (await checkWrongNetwork()) return;

        await dispatch(changeApproval({ address, token, provider, networkID: chainID }));
    };

    const onChangeWrap = async (action: string) => {
        if (await checkWrongNetwork()) return;
        if (quantity === "" || parseFloat(quantity) === 0) {
            dispatch(warning({ text: action === "wrap" ? messages.before_wrap : messages.before_unstake }));
        } else {
            await dispatch(changeWrap({ address, action, value: String(quantity), provider, networkID: chainID }));
            setQuantity("");
        }
    };

    const hasAllowance = useCallback(
        token => {
            if (token === "ssb") return wrapAllowance > 0;
            if (token === "wssb") return true;
            return 0;
        },
        [wrapAllowance],
    );

    const changeView = (newView: number) => () => {
        setView(newView);
        setQuantity("");
    };

    const trimmedSSBBalance = trim(Number(ssbBalance), 6);
    const trimmedWrappedStakedSBBalance = trim(Number(wssbBalance), 6);

    const wrappedTokenEquivalent = trim(Number(trimmedWrappedStakedSBBalance) * Number(currentIndex), 6);
    const valueOfSB = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    }).format(Number(sbBalance) * app.marketPrice);
    const valueOfStakedBalance = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    }).format(Number(trimmedSSBBalance) * app.marketPrice);
    const valueOfWrappedStakedBalance = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    }).format(Number(trimmedWrappedStakedSBBalance) * Number(currentIndex) * app.marketPrice);

    const sumOfAllBalance = Number(sbBalance) + Number(trimmedSSBBalance) + Number(trimmedWrappedStakedSBBalance) * Number(currentIndex);
    const valueOfAllBalance = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    }).format(sumOfAllBalance * app.marketPrice);

    return (
        <div className="wrap-view">
            <Zoom in={true}>
                <div className="wrap-card">
                    <Grid className="wrap-card-grid" container direction="column" spacing={2}>
                        <Grid item>
                            <div className="wrap-card-header">
                                <p className="wrap-card-header-title">{t("wrap:WrapTitle")}</p>
                                <p className="wrap-card-header-subtitle">{t("wrap:WrapYourSnowbank")}</p>
                            </div>
                        </Grid>

                        <Grid item>
                            <div className="wrap-card-metrics">
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4} md={4} lg={4}>
                                        <div className="wrap-card-index">
                                            <p className="wrap-card-metrics-title">{t("CurrentIndex")}</p>
                                            <p className="wrap-card-metrics-value">{currentIndex ? <>{trim(Number(currentIndex), 2)} SB</> : <Skeleton width="150px" />}</p>
                                        </div>
                                    </Grid>
                                </Grid>
                            </div>
                        </Grid>

                        <div className="wrap-card-area">
                            {!address && (
                                <div className="wrap-card-wallet-notification">
                                    <div className="wrap-card-wallet-connect-btn" onClick={connect}>
                                        <p>{t("ConnectWallet")}</p>
                                    </div>
                                    <p className="wrap-card-wallet-desc-text">{t("wrap:ConnectYourWalletToWrap")}</p>
                                </div>
                            )}
                            {address && (
                                <div>
                                    <div className="wrap-card-action-area">
                                        <div className="wrap-card-action-stage-btns-wrap">
                                            <div onClick={changeView(0)} className={classnames("wrap-card-action-stage-btn", { active: !view })}>
                                                <p>{t("wrap:Wrap")}</p>
                                            </div>
                                            <div onClick={changeView(1)} className={classnames("wrap-card-action-stage-btn", { active: view })}>
                                                <p>{t("wrap:Unwrap")}</p>
                                            </div>
                                        </div>

                                        <div className="wrap-card-action-row">
                                            <OutlinedInput
                                                type="number"
                                                placeholder={t("Amount")}
                                                className="wrap-card-action-input"
                                                value={quantity}
                                                onChange={e => setQuantity(e.target.value)}
                                                labelWidth={0}
                                                endAdornment={
                                                    <InputAdornment position="end">
                                                        <div onClick={setMax} className="wrap-card-action-input-btn">
                                                            <p>{t("Max")}</p>
                                                        </div>
                                                    </InputAdornment>
                                                }
                                            />

                                            {view === 0 && (
                                                <div className="wrap-card-tab-panel">
                                                    {address && hasAllowance("ssb") ? (
                                                        <div
                                                            className="wrap-card-tab-panel-btn"
                                                            onClick={() => {
                                                                if (isPendingTxn(pendingTransactions, "wrapping")) return;
                                                                onChangeWrap("wrap");
                                                            }}
                                                        >
                                                            <p>{txnButtonText(pendingTransactions, "wrapping", t("Wrap sSB"))}</p>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="wrap-card-tab-panel-btn"
                                                            onClick={() => {
                                                                if (isPendingTxn(pendingTransactions, "approve_wrapping")) return;
                                                                onSeekApproval("ssb");
                                                            }}
                                                        >
                                                            <p>{txnButtonText(pendingTransactions, "approve_wrapping", t("Approve"))}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {view === 1 && (
                                                <div className="wrap-card-tab-panel">
                                                    {address ? (
                                                        <div
                                                            className="wrap-card-tab-panel-btn"
                                                            onClick={() => {
                                                                if (isPendingTxn(pendingTransactions, "unwrapping")) return;
                                                                onChangeWrap("unwrap");
                                                            }}
                                                        >
                                                            <p>{txnButtonText(pendingTransactions, "unwrapping", t("Unwrap wsSB"))}</p>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="wrap-card-tab-panel-btn"
                                                            onClick={() => {
                                                                if (isPendingTxn(pendingTransactions, "approve_unwrapping")) return;
                                                                onSeekApproval("ssb");
                                                            }}
                                                        ></div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="wrap-card-action-help-text">
                                            {address && ((!hasAllowance("ssb") && view === 0) || (!hasAllowance("ssb") && view === 1)) && <p>{t("wrap:ApproveNote")}</p>}
                                        </div>
                                    </div>

                                    <div className="wrap-user-data">
                                        <div className="data-row">
                                            <p className="data-row-name">{t("YourBalance")}</p>
                                            <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>{trim(Number(sbBalance), 4)} SB</>}</p>
                                        </div>

                                        <div className="data-row">
                                            <p className="data-row-name">{t("wrap:YourStakedBalance")}</p>
                                            <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>{trimmedSSBBalance} sSB</>}</p>
                                        </div>

                                        {Number(trimmedWrappedStakedSBBalance) > 0 && (
                                            <div className="data-row">
                                                <p className="data-row-name">{t("wrap:YourWrappedStakedBalance")}</p>
                                                <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>{trimmedWrappedStakedSBBalance} wsSB</>}</p>
                                            </div>
                                        )}

                                        {Number(trimmedWrappedStakedSBBalance) > 0 && (
                                            <div className="data-row">
                                                <p className="data-row-name">{t("wrap:WrappedTokenEquivalent")}</p>
                                                <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>({wrappedTokenEquivalent} sSB)</>}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Grid>
                </div>
            </Zoom>
            <Zoom in={true}>
                <div>
                    {address && (
                        <div className="wrap-card">
                            <Grid className="wrap-card-grid" container direction="column">
                                <Grid item>
                                    <div className="wrap-card-header data-row">
                                        <p className="wrap-card-header-title">{t("YourBalance")}</p>
                                        <p className="wrap-card-header-title">{isAppLoading ? <Skeleton width="80px" /> : <>{valueOfAllBalance}</>}</p>
                                    </div>
                                </Grid>

                                <div className="wrap-card-area">
                                    <div>
                                        <div className="">
                                            <div className="data-row">
                                                <p className="data-row-name">{t("wrap:ValueOfYourSB")}</p>
                                                <p className="data-row-value"> {isAppLoading ? <Skeleton width="80px" /> : <>{valueOfSB}</>}</p>
                                            </div>

                                            <div className="data-row">
                                                <p className="data-row-name">{t("wrap:ValueOfYourStakedSB")}</p>
                                                <p className="data-row-value"> {isAppLoading ? <Skeleton width="80px" /> : <>{valueOfStakedBalance}</>}</p>
                                            </div>

                                            {Number(trimmedWrappedStakedSBBalance) > 0 && (
                                                <div className="data-row">
                                                    <p className="data-row-name">{t("wrap:ValueOfYourWrappedStakedSB")}</p>
                                                    <p className="data-row-value"> {isAppLoading ? <Skeleton width="80px" /> : <>{valueOfWrappedStakedBalance}</>}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Grid>
                        </div>
                    )}
                </div>
            </Zoom>
        </div>
    );
}

export default Stake;
