import { ethers } from "ethers";
import { getAddresses } from "../../constants";
import { StakingHelperContract, TimeTokenContract, MemoTokenContract, StakingContract, RedeemContract } from "../../abi";
import { clearPendingTxn, fetchPendingTxns, getStakingTypeText } from "./pending-txns-slice";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAccountSuccess, getBalances } from "./account-slice";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { Networks } from "../../constants/blockchain";
import { warning, success, info, error } from "../../store/slices/messages-slice";
import { messages } from "../../constants/messages";
import { getGasPrice } from "../../helpers/get-gas-price";
import { metamaskErrorWrap } from "../../helpers/metamask-error-wrap";
import { sleep } from "../../helpers";

import i18n from "../../i18n";

interface IChangeRedeemApproval {
    token: string;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    address: string;
    networkID: Networks;
}

export const changeRedeemApproval = createAsyncThunk("stake/changeRedeemApproval", async ({ token, provider, address, networkID }: IChangeRedeemApproval, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }
    const addresses = getAddresses(networkID);

    const signer = provider.getSigner();
    const sbContract = new ethers.Contract(addresses.SB_ADDRESS, TimeTokenContract, signer);

    let approveTx;
    try {
        const gasPrice = await getGasPrice(provider);

        if (token === "sb") {
            approveTx = await sbContract.approve(addresses.REDEEM_ADDRESS, ethers.constants.MaxUint256, { gasPrice });
        }

        const text = i18n.t("redeem:ApproveStaking");
        const pendingTxnType = "approve_redeem";

        dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text, type: pendingTxnType }));
        await approveTx.wait();
        dispatch(success({ text: messages.tx_successfully_send }));
    } catch (err: any) {
        return metamaskErrorWrap(err, dispatch);
    } finally {
        if (approveTx) {
            dispatch(clearPendingTxn(approveTx.hash));
        }
    }

    await sleep(2);

    const stakeAllowance = await sbContract.allowance(address, addresses.STAKING_HELPER_ADDRESS);

    return dispatch(
        fetchAccountSuccess({
            redeeming: {
                sbStake: Number(stakeAllowance),
            },
        }),
    );
});
interface IChangeApproval {
    token: string;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    address: string;
    networkID: Networks;
}

export const changeApproval = createAsyncThunk("stake/changeApproval", async ({ token, provider, address, networkID }: IChangeApproval, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }
    const addresses = getAddresses(networkID);

    const signer = provider.getSigner();
    const sbContract = new ethers.Contract(addresses.SB_ADDRESS, TimeTokenContract, signer);
    const ssbContract = new ethers.Contract(addresses.SSB_ADDRESS, MemoTokenContract, signer);

    let approveTx;
    try {
        const gasPrice = await getGasPrice(provider);

        if (token === "sb") {
            approveTx = await sbContract.approve(addresses.STAKING_HELPER_ADDRESS, ethers.constants.MaxUint256, { gasPrice });
        }

        if (token === "ssb") {
            approveTx = await ssbContract.approve(addresses.STAKING_ADDRESS, ethers.constants.MaxUint256, { gasPrice });
        }

        const text = token === "sb" ? i18n.t("stake:ApproveStaking") : i18n.t("stake:ApproveUnstaking");
        const pendingTxnType = token === "sb" ? "approve_staking" : "approve_unstaking";

        dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text, type: pendingTxnType }));
        await approveTx.wait();
        dispatch(success({ text: messages.tx_successfully_send }));
    } catch (err: any) {
        return metamaskErrorWrap(err, dispatch);
    } finally {
        if (approveTx) {
            dispatch(clearPendingTxn(approveTx.hash));
        }
    }

    await sleep(2);

    const stakeAllowance = await sbContract.allowance(address, addresses.STAKING_HELPER_ADDRESS);
    const unstakeAllowance = await ssbContract.allowance(address, addresses.STAKING_ADDRESS);

    return dispatch(
        fetchAccountSuccess({
            staking: {
                sbStake: Number(stakeAllowance),
                ssbUnstake: Number(unstakeAllowance),
            },
        }),
    );
});

interface IChangeRedeem {
    action: string;
    value: string;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    address: string;
    networkID: Networks;
}

export const changeRedeem = createAsyncThunk("stake/changeRedeem", async ({ action, value, provider, address, networkID }: IChangeRedeem, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }
    const addresses = getAddresses(networkID);
    const signer = provider.getSigner();
    const redeem = new ethers.Contract(addresses.REDEEM_ADDRESS, RedeemContract, signer);

    let stakeTx;

    try {
        const gasPrice = await getGasPrice(provider);

        stakeTx = await redeem.swap(ethers.utils.parseUnits(value, "gwei"), { gasPrice });
        const pendingTxnType = i18n.t("redeem:Redeem");
        dispatch(fetchPendingTxns({ txnHash: stakeTx.hash, text: getStakingTypeText(action), type: pendingTxnType }));
        await stakeTx.wait();
        dispatch(success({ text: messages.tx_successfully_send }));
    } catch (err: any) {
        return metamaskErrorWrap(err, dispatch);
    } finally {
        if (stakeTx) {
            dispatch(clearPendingTxn(stakeTx.hash));
        }
    }
    dispatch(info({ text: messages.your_balance_update_soon }));
    await sleep(10);
    await dispatch(getBalances({ address, networkID, provider }));
    dispatch(info({ text: messages.your_balance_updated }));
    return;
});

interface IChangeStake {
    action: string;
    value: string;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    address: string;
    networkID: Networks;
}

export const changeStake = createAsyncThunk("stake/changeStake", async ({ action, value, provider, address, networkID }: IChangeStake, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }
    const addresses = getAddresses(networkID);
    const signer = provider.getSigner();
    const staking = new ethers.Contract(addresses.STAKING_ADDRESS, StakingContract, signer);
    const stakingHelper = new ethers.Contract(addresses.STAKING_HELPER_ADDRESS, StakingHelperContract, signer);

    let stakeTx;

    try {
        const gasPrice = await getGasPrice(provider);

        if (action === "stake") {
            stakeTx = await stakingHelper.stake(ethers.utils.parseUnits(value, "gwei"), address, { gasPrice });
        } else {
            stakeTx = await staking.unstake(ethers.utils.parseUnits(value, "gwei"), true, { gasPrice });
        }
        const pendingTxnType = action === "stake" ? i18n.t("stake:Staking") : i18n.t("stake:Unstaking");
        dispatch(fetchPendingTxns({ txnHash: stakeTx.hash, text: getStakingTypeText(action), type: pendingTxnType }));
        await stakeTx.wait();
        dispatch(success({ text: messages.tx_successfully_send }));
    } catch (err: any) {
        return metamaskErrorWrap(err, dispatch);
    } finally {
        if (stakeTx) {
            dispatch(clearPendingTxn(stakeTx.hash));
        }
    }
    dispatch(info({ text: messages.your_balance_update_soon }));
    await sleep(10);
    await dispatch(getBalances({ address, networkID, provider }));
    dispatch(info({ text: messages.your_balance_updated }));
    return;
});
