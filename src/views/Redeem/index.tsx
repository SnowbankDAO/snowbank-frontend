import { useState, useCallback, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Grid, InputAdornment, OutlinedInput, Zoom, Link } from "@material-ui/core";
import { trim } from "../../helpers";
import { changeStake, changeApproval, changeRedeemApproval, changeRedeem } from "../../store/slices/stake-thunk";
import "./stake.scss";
import { useWeb3Context } from "../../hooks";
import { IPendingTxn, isPendingTxn, txnButtonText } from "../../store/slices/pending-txns-slice";
import { Skeleton } from "@material-ui/lab";
import { IReduxState } from "../../store/slices/state.interface";
import { messages } from "../../constants/messages";
import classnames from "classnames";
import { warning } from "../../store/slices/messages-slice";
import { IAppSlice } from "../../store/slices/app-slice";

import { useTranslation } from "react-i18next";
import RedeemTimer from "../../components/RedeemTimer";

function Redeem() {
    const { t } = useTranslation();

    const dispatch = useDispatch();
    const { provider, address, connect, chainID, checkWrongNetwork } = useWeb3Context();
    const app = useSelector<IReduxState, IAppSlice>(state => state.app);

    const [quantity, setQuantity] = useState<string>("");

    const isAppLoading = useSelector<IReduxState, boolean>(state => state.app.loading);
    const currentIndex = useSelector<IReduxState, string>(state => {
        return state.app.currentIndex;
    });
    const fiveDayRate = useSelector<IReduxState, number>(state => {
        return state.app.fiveDayRate;
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
    const redeemAllowance = useSelector<IReduxState, number>(state => {
        return state.account.redeeming && state.account.redeeming.sb;
    });
    const stakingRebase = useSelector<IReduxState, number>(state => {
        return state.app.stakingRebase;
    });
    const stakingAPY = useSelector<IReduxState, number>(state => {
        return state.app.stakingAPY;
    });
    const redeemRfv = useSelector<IReduxState, number>(state => {
        return state.app.redeemRfv;
    });
    const redeemSbSent = useSelector<IReduxState, number>(state => {
        return state.app.redeemSbSent;
    });
    const redeemMimAvailable = useSelector<IReduxState, number>(state => {
        return state.app.redeemMimAvailable;
    });
    const stakingTVL = useSelector<IReduxState, number>(state => {
        return state.app.stakingTVL;
    });

    const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });

    const setMax = () => {
        setQuantity(sbBalance);
    };

    const onSeekApproval = async (token: string) => {
        if (await checkWrongNetwork()) return;

        await dispatch(changeRedeemApproval({ address, token, provider, networkID: chainID }));
    };

    const onChangeStake = async (action: string) => {
        if (await checkWrongNetwork()) return;
        if (quantity === "" || parseFloat(quantity) === 0) {
            dispatch(warning({ text: action === "stake" ? messages.before_stake : messages.before_unstake }));
        } else {
            await dispatch(changeRedeem({ address, action, value: String(quantity), provider, networkID: chainID }));
            setQuantity("");
        }
    };

    const hasAllowance = useCallback(
        token => {
            return redeemAllowance;
        },
        [redeemAllowance],
    );

    const trimmedSSBBalance = trim(Number(ssbBalance), 6);
    const trimmedWrappedStakedSBBalance = trim(Number(wssbBalance), 6);
    const trimmedStakingAPY = trim(stakingAPY * 100, 1);
    const stakingRebasePercentage = trim(stakingRebase * 100, 4);
    const nextRewardValue = trim((Number(stakingRebasePercentage) / 100) * Number(trimmedSSBBalance), 6);
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
    const valueOfYourNextRewardAmount = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    }).format(Number(nextRewardValue) * app.marketPrice);
    const valueOfRedeemableBalance = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    }).format(Number(sbBalance) * redeemRfv + Number(ssbBalance) * redeemRfv);
    const valueOfMIMRedeemable = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    }).format(Number(redeemRfv) * Number(quantity));
    const totalTreasuryRedeemed = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
    }).format(Number(redeemSbSent * redeemRfv));
    const totalSBRedeemed = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    }).format(Number(redeemSbSent));

    return (
        <div className="stake-view">
            <Zoom in={true}>
                <div className="stake-card redistribution-card">
                    <Grid className="stake-card-grid" container direction="column" spacing={2}>
                        <Grid item>
                            <div className="stake-card-header">
                                <p className="stake-card-header-title-redistribution">Final Redistribution</p>
                            </div>
                            <p className="stake-card-redeem-text">
                                Great products convert unconscious, inchoate problems into conscious, realized opportunities. This is what motivated us to start Snowbank: building
                                an amazing product for DeFi and the Avalanche ecosystem. We were fortunate enough to build an amazing community, with shared values, and a common
                                goal. Unfortunately, we have to come to the conclusion that our product isn’t meeting its audience. Interest in rebasing projects is at an all-time
                                low. Despite our exciting v2 plans, we still believe the opportunity could be better captured by a fresh new project.
                                <b>Therefore, it is now time for everyone to move on.</b>
                            </p>
                            <p className="stake-card-redeem-text">
                                <b>
                                    Swap your SB for a fixed USDC value equal to the SB risk-free value (RFV) as of Feb 17th. There is no deadline for the redistribution, you can
                                    always swap your SB for a fixed USDC value.
                                </b>
                            </p>
                            <p className="stake-card-redeem-text">
                                <b>
                                    Liquidity pools will be progressively removed to increase the treasury funds available for redeeming. Do not sell your SB tokens on Trader Joe
                                    or other decentralized exchanges as low liquidity will negatively impact your selling price.
                                </b>
                            </p>
                            <Link href="https://docs.snowbank.finance/events/final-redistribution" target="_blank" className="stake-card-link-text">
                                Learn more about Snowbank's Final Redistribution event and details here.
                            </Link>
                        </Grid>
                    </Grid>
                </div>
            </Zoom>
            <Zoom in={true}>
                <div className="stake-card">
                    <Grid className="stake-card-grid" container direction="column" spacing={2}>
                        <Grid item>
                            <div className="stake-card-header">
                                <p className="stake-card-header-title">{t("redeem:StakeTitle")}</p>
                                {/* <RedeemTimer /> */}
                            </div>
                        </Grid>

                        <Grid item>
                            <div className="stake-card-metrics">
                                <Grid container spacing={2}>
                                    <Grid item xs={4} sm={4} md={4} lg={4}>
                                        <div className="stake-card-apy">
                                            <p className="stake-card-metrics-title">Risk-Free Value</p>
                                            <p className="stake-card-metrics-value">{isAppLoading ? <Skeleton width="80px" /> : <>{trim(Number(redeemRfv), 4)} USDC</>}</p>
                                        </div>
                                    </Grid>

                                    <Grid item xs={4} sm={4} md={4} lg={4}>
                                        <div className="stake-card-index">
                                            <p className="stake-card-metrics-title">Total SB Deposited</p>
                                            <p className="stake-card-metrics-value">{redeemSbSent !== undefined ? <>{totalSBRedeemed} SB</> : <Skeleton width="150px" />}</p>
                                        </div>
                                    </Grid>

                                    <Grid item xs={4} sm={4} md={4} lg={4}>
                                        <div className="stake-card-index">
                                            <p className="stake-card-metrics-title">Total Treasury Redeemed</p>
                                            <p className="stake-card-metrics-value">
                                                {redeemSbSent !== undefined && redeemRfv !== undefined ? <>{totalTreasuryRedeemed}</> : <Skeleton width="150px" />}
                                            </p>
                                        </div>
                                    </Grid>
                                </Grid>
                            </div>
                        </Grid>

                        <div className="stake-card-area">
                            {!address && (
                                <div className="stake-card-wallet-notification">
                                    <div className="stake-card-wallet-connect-btn" onClick={connect}>
                                        <p>{t("ConnectWallet")}</p>
                                    </div>
                                    <p className="stake-card-wallet-desc-text">{t("redeem:ConnectYourWalletToStake")}</p>
                                </div>
                            )}
                            {address && (
                                <div>
                                    <div className="stake-card-action-area">
                                        <div className="stake-card-action-row">
                                            <OutlinedInput
                                                type="number"
                                                placeholder={t("Amount")}
                                                className="stake-card-action-input"
                                                value={quantity}
                                                onChange={e => setQuantity(e.target.value)}
                                                labelWidth={0}
                                                endAdornment={
                                                    <InputAdornment position="end">
                                                        <div onClick={setMax} className="stake-card-action-input-btn">
                                                            <p>{t("Max")}</p>
                                                        </div>
                                                    </InputAdornment>
                                                }
                                            />

                                            <div className="stake-card-tab-panel">
                                                {address && hasAllowance("sb") ? (
                                                    <div
                                                        className="stake-card-tab-panel-btn"
                                                        onClick={() => {
                                                            if (isPendingTxn(pendingTransactions, "staking")) return;
                                                            onChangeStake("stake");
                                                        }}
                                                    >
                                                        <p>{txnButtonText(pendingTransactions, "staking", t("redeem:StakingSB"))}</p>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="stake-card-tab-panel-btn"
                                                        onClick={() => {
                                                            if (isPendingTxn(pendingTransactions, "approve_staking")) return;
                                                            onSeekApproval("sb");
                                                        }}
                                                    >
                                                        <p>{txnButtonText(pendingTransactions, "approve_staking", t("Approve"))}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="stake-card-action-help-text">{address && !hasAllowance("sb") && <p>{t("redeem:ApproveNote")}</p>}</div>
                                    </div>

                                    <div className="stake-user-data">
                                        <div className="data-row">
                                            <p className="data-row-name">USDC Value You Will Redeem</p>
                                            <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>{valueOfMIMRedeemable}</>}</p>
                                        </div>
                                        <div className="data-row">
                                            <p className="data-row-name">Your SB Balance</p>
                                            <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>{trim(Number(sbBalance), 4)} SB</>}</p>
                                        </div>
                                        <div className="data-row">
                                            <p className="data-row-name">Your Staked SB Balance</p>
                                            <p className="data-row-value">
                                                {isAppLoading ? <Skeleton width="80px" /> : <>{trim(Number(ssbBalance), 4)} sSB</>}{" "}
                                                <a href="https://dapp.snowbank.finance/#/stake">Unstake</a>
                                            </p>
                                        </div>
                                        <div className="data-row">
                                            <p className="data-row-name">Total USDC Redeemable</p>
                                            <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>{valueOfRedeemableBalance}</>}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Grid>
                </div>
            </Zoom>
        </div>
    );
}

export default Redeem;
