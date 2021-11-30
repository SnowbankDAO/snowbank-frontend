import { useState } from "react";
import { useSelector } from "react-redux";
import { Box, Grid, InputAdornment, OutlinedInput, Zoom } from "@material-ui/core";
import Slider from "@mui/material/Slider";
import { trim } from "../../helpers";
import "./snowglobe.scss";
import { useWeb3Context } from "../../hooks";
import { Skeleton } from "@material-ui/lab";
import { IReduxState } from "../../store/slices/state.interface";
import { fCurrency, fShortenNumber } from "../../helpers/formatNumers";

import { IAppSlice } from "../../store/slices/app-slice";
import SnowStorm from "react-snowstorm";
import { Snowfall, Snowflake } from "react-snowflakes";

function Stake() {
    const { address, connect } = useWeb3Context();

    const [ssbQuantity, setSsbQuantity] = useState<string>("1");
    const [rewardYield, setRewardYield] = useState<string>("1.5");
    const [price, setPrice] = useState<string>("1200");
    const [futurePrice, setFuturePrice] = useState<string>("10000");
    const [duration, setDuration] = useState<number>(30);

    const isAppLoading = useSelector<IReduxState, boolean>(state => state.app.loading);
    const ssbBalance = useSelector<IReduxState, string>(state => {
        return state.account.balances && state.account.balances.ssb;
    });
    const stakingRebase = useSelector<IReduxState, number>(state => {
        return state.app.stakingRebase;
    });

    const app = useSelector<IReduxState, IAppSlice>(state => state.app);

    const setSsbToMax = () => {
        setSsbQuantity(ssbBalance);
    };

    const trimmedSsbBalance = trim(Number(ssbBalance), 6);
    const stakingRebasePercentage = trim(stakingRebase * 100, 4);

    const setYeildCurrent = () => {
        setRewardYield(stakingRebasePercentage);
    };
    const setCurrentPrice = () => {
        setPrice(trim(app.marketPrice, 2));
    };
    const setCurrentPriceToFuture = () => {
        setFuturePrice(trim(app.marketPrice, 2));
    };

    function preventHorizontalKeyboardNavigation(event: React.KeyboardEvent) {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
        }
    }
    const handleSliderChange = (event: Event, newValue: number) => {
        setDuration(newValue);
    };

    // Snowglobe calc
    const epochs_per_day = 3;

    const roi_day = (1 + parseFloat(rewardYield) / 100) ** (duration * epochs_per_day) - 1;
    const gains = parseFloat(ssbQuantity) * roi_day;
    const lamboPrice = 222004;

    const currentWealth = parseFloat(ssbQuantity) * app?.marketPrice;
    const futureWealth = (parseFloat(ssbQuantity) + gains) * parseFloat(futurePrice);
    const nbLambo = Math.round(futureWealth / lamboPrice);
    const investment = parseFloat(price) * parseFloat(ssbQuantity);

    return (
        <div className="stake-view">
            <Zoom in={true}>
                <div className="snowglobe-card">
                    <Snowfall
                        count={50}
                        style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                        }}
                        className="snowglobe-card-falling"
                        snowflakeFactory={(index: number) => {
                            const size = index / 50; // 50 is the number of snowflakes.
                            const w = 5 + 10 * size + "px";
                            return (
                                <Snowflake
                                    speed={0.05 + size * 6}
                                    xSpeedPrc={0.3 * size}
                                    ySpeedPrc={0.1 * size}
                                    style={{
                                        width: w,
                                        height: w,
                                        borderRadius: "50%",
                                        backgroundColor: "white",
                                        opacity: 0.2 + 0.8 * size,
                                        filter: `blur(${Math.round(Math.max(size - 0.5, 0) * 15)}px)`,
                                    }}
                                />
                            );
                        }}
                    />
                    <SnowStorm animationInterval={20} vMaxY={2} flakesMaxActive={100} excludeMobile={false} />
                    <Grid className="snowglobe-card-grid" container direction="column" spacing={2}>
                        <Grid item>
                            <div className="snowglobe-card-header">
                                <p className="snowglobe-card-header-title">Snowglobe (❄️,❄️)</p>
                                <p className="snowglobe-card-header-subtitle">Estimate your returns</p>
                                <p className="snowglobe-card-header-disclaimer">
                                    Any financial projections or returns shown on the calculator are estimated predictions of returns only, are hypothetical, are not based on
                                    actual investment results and are not guarantees of future results. Estimated projections do not represent or guarantee the actual results of
                                    any transaction, and no representation is made that any transaction will, or is likely to, achieve results or profits similar to those shown.
                                </p>
                            </div>
                        </Grid>

                        <Grid item>
                            <div className="snowglobe-card-metrics">
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4} md={4} lg={4}>
                                        <div className="snowglobe-card-apy">
                                            <p className="snowglobe-card-metrics-title">Current SB Price</p>
                                            <p className="snowglobe-card-metrics-value">{isAppLoading ? <Skeleton width="100px" /> : `$${trim(app.marketPrice, 2)}`}</p>
                                        </div>
                                    </Grid>

                                    <Grid item xs={6} sm={4} md={4} lg={4}>
                                        <div className="snowglobe-card-tvl">
                                            <p className="snowglobe-card-metrics-title">Current Reward Yield</p>
                                            <p className="snowglobe-card-metrics-value">{isAppLoading ? <Skeleton width="80px" /> : <>{stakingRebasePercentage}%</>}</p>
                                        </div>
                                    </Grid>

                                    <Grid item xs={6} sm={4} md={4} lg={4}>
                                        <div className="snowglobe-card-index">
                                            <p className="snowglobe-card-metrics-title">Your sSB Balance</p>
                                            <p className="snowglobe-card-metrics-value">{isAppLoading ? <Skeleton width="150px" /> : <>{trimmedSsbBalance} sSB</>}</p>
                                        </div>
                                    </Grid>
                                </Grid>
                            </div>
                        </Grid>

                        <div className="snowglobe-card-area">
                            {!address && (
                                <div className="snowglobe-card-wallet-notification">
                                    <div className="snowglobe-card-wallet-connect-btn" onClick={connect}>
                                        <p>Connect Wallet</p>
                                    </div>
                                    <p className="snowglobe-card-wallet-desc-text">Connect your wallet to use the Snowglobe</p>
                                </div>
                            )}
                            {address && (
                                <div>
                                    <div className="snowglobe-card-action-area">
                                        <Grid className="snowglobe-card-grid" container spacing={1}>
                                            <Grid item sm={5} className="snowglobe-entry">
                                                <div className="snowglobe-card-action-row">
                                                    <p className="snowglobe-card-action-label">sSB AMOUNT</p>
                                                    <OutlinedInput
                                                        type="number"
                                                        placeholder="Enter sSB Amount"
                                                        className="snowglobe-card-action-input"
                                                        value={ssbQuantity}
                                                        onChange={e => setSsbQuantity(e.target.value)}
                                                        labelWidth={0}
                                                        endAdornment={
                                                            <InputAdornment position="end">
                                                                <div onClick={setSsbToMax} className="snowglobe-card-action-input-btn">
                                                                    <p>Max</p>
                                                                </div>
                                                            </InputAdornment>
                                                        }
                                                    />
                                                </div>
                                                <div className="snowglobe-card-action-row">
                                                    <p className="snowglobe-card-action-label">REWARD YIELD (%)</p>
                                                    <OutlinedInput
                                                        type="number"
                                                        placeholder="Enter Reward Yield (%)"
                                                        className="snowglobe-card-action-input"
                                                        value={rewardYield}
                                                        onChange={e => setRewardYield(e.target.value)}
                                                        labelWidth={0}
                                                        endAdornment={
                                                            <InputAdornment position="end">
                                                                <div onClick={setYeildCurrent} className="snowglobe-card-action-input-btn">
                                                                    <p>CURRENT</p>
                                                                </div>
                                                            </InputAdornment>
                                                        }
                                                    />
                                                </div>
                                                <div className="snowglobe-card-action-row">
                                                    <p className="snowglobe-card-action-label">SB PRICE AT PURCHASE ($)</p>
                                                    <OutlinedInput
                                                        type="number"
                                                        placeholder="Enter buy price"
                                                        className="snowglobe-card-action-input"
                                                        value={price}
                                                        onChange={e => setPrice(e.target.value)}
                                                        labelWidth={0}
                                                        endAdornment={
                                                            <InputAdornment position="end">
                                                                <div onClick={setCurrentPrice} className="snowglobe-card-action-input-btn">
                                                                    <p>CURRENT</p>
                                                                </div>
                                                            </InputAdornment>
                                                        }
                                                    />
                                                </div>
                                                <div className="snowglobe-card-action-row">
                                                    <p className="snowglobe-card-action-label">FUTURE SB MARKET PRICE ($)</p>
                                                    <OutlinedInput
                                                        type="number"
                                                        placeholder="Enter future price"
                                                        className="snowglobe-card-action-input"
                                                        value={futurePrice}
                                                        onChange={e => setFuturePrice(e.target.value)}
                                                        labelWidth={0}
                                                        endAdornment={
                                                            <InputAdornment position="end">
                                                                <div onClick={setCurrentPriceToFuture} className="snowglobe-card-action-input-btn">
                                                                    <p>CURRENT</p>
                                                                </div>
                                                            </InputAdornment>
                                                        }
                                                    />
                                                </div>
                                            </Grid>
                                            <Grid item className="slider-container">
                                                <Box className="slider-inner">
                                                    <Box className="snowglobe-days">
                                                        <p className="data-row-value">
                                                            {duration}
                                                            <br />
                                                            day{duration === 1 ? "" : "s"}
                                                        </p>
                                                    </Box>
                                                    <Slider
                                                        sx={{
                                                            '& input[type="range"]': {
                                                                WebkitAppearance: "slider-vertical",
                                                            },
                                                            display: { xs: "none", sm: "block" },
                                                        }}
                                                        step={1}
                                                        marks
                                                        min={1}
                                                        max={365}
                                                        orientation="vertical"
                                                        value={duration}
                                                        //@ts-ignore
                                                        onChange={handleSliderChange}
                                                        aria-label="Temperature"
                                                        onKeyDown={preventHorizontalKeyboardNavigation}
                                                    />
                                                    <Slider
                                                        sx={{
                                                            '& input[type="range"]': {
                                                                WebkitAppearance: "slider-horizontal",
                                                            },
                                                            display: { xs: "block", sm: "none" },
                                                            width: 1,
                                                        }}
                                                        step={1}
                                                        marks
                                                        min={1}
                                                        max={365}
                                                        orientation="horizontal"
                                                        value={duration}
                                                        //@ts-ignore
                                                        onChange={handleSliderChange}
                                                        aria-label="Temperature"
                                                        onKeyDown={preventHorizontalKeyboardNavigation}
                                                    />
                                                </Box>
                                            </Grid>

                                            <Grid item sm={5} className="snowglobe-data">
                                                <div className="data-row">
                                                    <p className="data-row-name">Your initial investment</p>
                                                    <p className="data-row-value">{fCurrency(investment)}</p>
                                                </div>
                                                <div className="data-row">
                                                    <p className="data-row-name">Current wealth</p>
                                                    <p className="data-row-value">{fCurrency(currentWealth)}</p>
                                                </div>
                                                <div className="data-row">
                                                    <p className="data-row-name">SB rewards estimation</p>
                                                    <p className="data-row-value">{fShortenNumber(gains)} SB</p>
                                                </div>
                                                <div className="data-row">
                                                    <p className="data-row-name">Potential return</p>
                                                    <p className="data-row-value">{fCurrency(futureWealth)}</p>
                                                </div>
                                                <div className="data-row">
                                                    <p className="data-row-name">
                                                        Potential number of lambos*<span>Lamborghini Huracán, no options</span>
                                                    </p>
                                                    <p className="data-row-value">{nbLambo}</p>
                                                </div>
                                            </Grid>
                                        </Grid>
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

export default Stake;
