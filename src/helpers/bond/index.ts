import { Networks } from "../../constants/blockchain";
import { LPBond, CustomLPBond } from "./lp-bond";
import { StableBond, CustomBond } from "./stable-bond";

import MimIcon from "../../assets/tokens/MIM.svg";
import AvaxIcon from "../../assets/tokens/AVAX.svg";
import mimSbIcon from "../../assets/tokens/SB-MIM.png";
import AvaxSbIcon from "../../assets/tokens/SB-AVAX.png";
import MimSdogIcon from "../../assets/tokens/SDOG-MIM.svg";
import avaxUsdceIcon from "../../assets/tokens/AVAX-USDCe.png";

import { StableBondContract, LpBondContract, WavaxBondContract, StableReserveContract, LpReserveContract } from "../../abi";

export const mim = new StableBond({
    name: "mim",
    displayName: "MIM",
    bondToken: "MIM",
    bondIconSvg: MimIcon,
    bondContractABI: StableBondContract,
    reserveContractAbi: StableReserveContract,
    networkAddrs: {
        [Networks.AVAX]: {
            bondAddress: "0x587bc7775f88d9A190aa02D30f7dF2C9Bb183F5D",
            reserveAddress: "0x130966628846BFd36ff31a822705796e8cb8C18D",
        },
    },
    isActive: false,
});

export const wavax = new CustomBond({
    name: "wavax",
    displayName: "wAVAX",
    bondToken: "AVAX",
    bondIconSvg: AvaxIcon,
    bondContractABI: WavaxBondContract,
    reserveContractAbi: StableReserveContract,
    networkAddrs: {
        [Networks.AVAX]: {
            bondAddress: "0x472c18c4079eCb68629F4FbA1141172404BFEE9C",
            reserveAddress: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
        },
    },
    isActive: false,
});

export const mimSb = new LPBond({
    name: "mim_sb_lp",
    displayName: "SB-MIM LP",
    bondToken: "MIM",
    bondIconSvg: mimSbIcon,
    bondContractABI: LpBondContract,
    reserveContractAbi: LpReserveContract,
    networkAddrs: {
        [Networks.AVAX]: {
            bondAddress: "0x90A08fdF9f433954930f19E97FE9A1B0bDBf5C5f",
            reserveAddress: "0x425c45adfb53861e5db8f17d9b072ab60d4404d8",
        },
    },
    lpUrl: "https://www.traderjoexyz.com/#/pool/0x130966628846BFd36ff31a822705796e8cb8C18D/0x7d1232b90d3f809a54eeaeebc639c62df8a8942f",
    isActive: true,
});

// export const avaxUsdce = new CustomLPBond({
//     name: "usdce_avax_lp",
//     displayName: "USDC.e-AVAX LP",
//     bondToken: "AVAX",
//     bondIconSvg: avaxUsdceIcon,
//     bondContractABI: LpBondContract,
//     reserveContractAbi: LpReserveContract,
//     networkAddrs: {
//         [Networks.AVAX]: {
//             bondAddress: "0x5E831EF7B5B2824B6F327055d0193Ecf8dCAA480",
//             reserveAddress: "0xa389f9430876455c36478deea9769b7ca4e3ddb1",
//         },
//     },
//     lpUrl: "https://www.traderjoexyz.com/#/pool/0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664",
//     isActive: true,
// });

// export const mimSdog = new LPBond({
//     name: "mim_sdog_lp",
//     displayName: "SDOG-MIM LP",
//     bondToken: "MIM",
//     bondIconSvg: MimSdogIcon,
//     bondContractABI: LpBondContract,
//     reserveContractAbi: LpReserveContract,
//     networkAddrs: {
//         [Networks.AVAX]: {
//             bondAddress: "0x0d71d9616f6844f12f1ce1516aa67817754517ff",
//             reserveAddress: "0xa3f1f5076499ec37d5bb095551f85ab5a344bb58",
//         },
//     },
//     lpUrl: "https://traderjoexyz.com/#/pool/0x130966628846BFd36ff31a822705796e8cb8C18D/0xdE9E52F1838951e4d2bb6C59723B003c353979b6",
// });

export const avaxSb = new CustomLPBond({
    name: "avax_sb_lp",
    displayName: "SB-AVAX LP",
    bondToken: "AVAX",
    bondIconSvg: AvaxSbIcon,
    bondContractABI: LpBondContract,
    reserveContractAbi: LpReserveContract,
    networkAddrs: {
        [Networks.AVAX]: {
            bondAddress: "0x288e6d7f4935c1f4d2862715306d4bdf8dea6592",
            reserveAddress: "0xa3d2cfe49df9d1ea0dc589b69252e1eddc417d6d",
        },
    },
    lpUrl: "https://traderjoexyz.com/#/pool/AVAX/0x7d1232b90d3f809a54eeaeebc639c62df8a8942f",
    isActive: true,
});

export default [mim, wavax, mimSb, avaxSb];
