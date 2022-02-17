import { ethers } from "ethers";
import { getAddresses } from "../../constants";
import { StakingContract, MemoTokenContract, TimeTokenContract, RedeemContract } from "../../abi";
import { setAll, getMarketPrice, getTokenPrice } from "../../helpers";
import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { JsonRpcProvider } from "@ethersproject/providers";
import { RootState } from "../store";
import allBonds from "../../helpers/bond";

interface ILoadAppDetails {
    networkID: number;
    provider: JsonRpcProvider;
}

export const loadAppDetails = createAsyncThunk(
    "app/loadAppDetails",
    //@ts-ignore
    async ({ networkID, provider }: ILoadAppDetails) => {
        const mimPrice = getTokenPrice("MIM");
        const addresses = getAddresses(networkID);

        const ohmPrice = getTokenPrice("OHM");
        const ohmAmount = 1512.12854088 * ohmPrice;

        const stakingContract = new ethers.Contract(addresses.STAKING_ADDRESS, StakingContract, provider);
        const redeemContract = new ethers.Contract(addresses.REDEEM_ADDRESS, RedeemContract, provider);
        const currentBlock = await provider.getBlockNumber();
        const currentBlockTime = (await provider.getBlock(currentBlock)).timestamp;
        const ssbContract = new ethers.Contract(addresses.SSB_ADDRESS, MemoTokenContract, provider);
        const sbContract = new ethers.Contract(addresses.SB_ADDRESS, TimeTokenContract, provider);
        const mimContract = new ethers.Contract(addresses.MIM_ADDRESS, TimeTokenContract, provider);

        const marketPrice = ((await getMarketPrice(networkID, provider)) / Math.pow(10, 9)) * mimPrice;

        const totalSupply = (await sbContract.totalSupply()) / Math.pow(10, 9);
        const circSupply = (await ssbContract.circulatingSupply()) / Math.pow(10, 9);

        const stakingTVL = circSupply * marketPrice;
        const marketCap = totalSupply * marketPrice;

        const redeemRfv = (await redeemContract.RFV()) / Math.pow(10, 2);
        const redeemSbSent = (await sbContract.balanceOf(addresses.REDEEM_ADDRESS)) / Math.pow(10, 9);
        const redeemMimAvailable = (await mimContract.balanceOf(addresses.REDEEM_ADDRESS)) / Math.pow(10, 18);

        const tokenBalPromises = allBonds.map(bond => bond.getTreasuryBalance(networkID, provider));
        const tokenBalances = await Promise.all(tokenBalPromises);
        const treasuryBalance = tokenBalances.reduce((tokenBalance0, tokenBalance1) => tokenBalance0 + tokenBalance1) + redeemMimAvailable + 18391046;

        const tokenAmountsPromises = allBonds.map(bond => bond.getTokenAmount(networkID, provider));
        const tokenAmounts = await Promise.all(tokenAmountsPromises);

        const rfvTreasury = tokenBalances[0] + tokenBalances[1] + redeemMimAvailable + tokenBalances[2] / 2 + tokenBalances[3] / 2 + 18391046;

        const daoSb = await sbContract.balanceOf(addresses.DAO_ADDRESS);
        const daoSbAmount = Number(ethers.utils.formatUnits(daoSb, "gwei"));

        const sbBondsAmountsPromises = allBonds
            .filter(bond => bond.name !== "mim_avax_turbine")
            .filter(bond => bond.name !== "avax_fxs_turbine")
            .map(bond => bond.getSbAmount(networkID, provider));
        const sbBondsAmounts = await Promise.all(sbBondsAmountsPromises);

        const LpSbAmount = sbBondsAmounts.reduce((sbAmount0, sbAmount1) => sbAmount0 + sbAmount1, 0);
        const sbSupply = totalSupply - LpSbAmount - daoSbAmount;

        const rfv = rfvTreasury / (sbSupply - redeemSbSent);
        const deltaMarketPriceRfv = ((rfv - marketPrice) / rfv) * 100;

        const epoch = await stakingContract.epoch();
        const stakingReward = epoch.distribute;
        const circ = await ssbContract.circulatingSupply();
        const stakingRebase = stakingReward / circ;
        const fiveDayRate = Math.pow(1 + stakingRebase, 5 * 3) - 1;
        const stakingAPY = Math.pow(1 + stakingRebase, 365 * 3) - 1;

        const currentIndex = await stakingContract.index();
        const nextRebase = epoch.endTime;

        const treasuryRunway = rfvTreasury / circSupply;
        const runway = Math.log(treasuryRunway) / Math.log(1 + stakingRebase) / 3;

        return {
            currentIndex: Number(ethers.utils.formatUnits(currentIndex, "gwei")),
            totalSupply,
            marketCap,
            currentBlock,
            circSupply,
            fiveDayRate,
            treasuryBalance,
            stakingAPY,
            stakingTVL,
            stakingRebase,
            marketPrice,
            deltaMarketPriceRfv,
            currentBlockTime,
            nextRebase,
            rfv,
            runway,
            redeemRfv,
            redeemSbSent,
            redeemMimAvailable,
        };
    },
);

const initialState = {
    loading: true,
};

export interface IAppSlice {
    loading: boolean;
    stakingTVL: number;
    marketPrice: number;
    deltaMarketPriceRfv: number;
    marketCap: number;
    circSupply: number;
    currentIndex: string;
    currentBlock: number;
    currentBlockTime: number;
    fiveDayRate: number;
    treasuryBalance: number;
    stakingAPY: number;
    stakingRebase: number;
    networkID: number;
    nextRebase: number;
    totalSupply: number;
    rfv: number;
    runway: number;
    redeemRfv: number;
    redeemSbSent: number;
    redeemMimAvailable: number;
}

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        fetchAppSuccess(state, action) {
            setAll(state, action.payload);
        },
    },
    extraReducers: builder => {
        builder
            .addCase(loadAppDetails.pending, (state, action) => {
                state.loading = true;
            })
            .addCase(loadAppDetails.fulfilled, (state, action) => {
                setAll(state, action.payload);
                state.loading = false;
            })
            .addCase(loadAppDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            });
    },
});

const baseInfo = (state: RootState) => state.app;

export default appSlice.reducer;

export const { fetchAppSuccess } = appSlice.actions;

export const getAppState = createSelector(baseInfo, app => app);
