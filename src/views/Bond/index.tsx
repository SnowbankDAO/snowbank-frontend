import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { trim } from "../../helpers";
import { Grid, Backdrop, Paper, Box, Tab, Tabs, Fade } from "@material-ui/core";
import TabPanel from "../../components/TabPanel";
import BondHeader from "./BondHeader";
import BondRedeem from "./BondRedeem";
import BondPurchase from "./BondPurchase";
import "./bond.scss";
import { useWeb3Context } from "../../hooks";
import { Skeleton } from "@material-ui/lab";
import { IReduxState } from "../../store/slices/state.interface";
import { IAllBondData } from "../../hooks/bonds";
import classnames from "classnames";

import { useTranslation } from "react-i18next";

interface IBondProps {
    bond: IAllBondData;
}

function Bond({ bond }: IBondProps) {
    const { t } = useTranslation();

    const { provider, address } = useWeb3Context();

    const [slippage, setSlippage] = useState(0.5);
    const [recipientAddress, setRecipientAddress] = useState(address);

    const [view, setView] = useState(bond.isActive ? 0 : 1);

    const isBondLoading = useSelector<IReduxState, boolean>(state => state.bonding.loading ?? true);

    const onRecipientAddressChange = (value: any) => {
        return setRecipientAddress(value);
    };

    const onSlippageChange = (value: any) => {
        return setSlippage(value);
    };

    useEffect(() => {
        if (address) setRecipientAddress(address);
    }, [provider, address]);

    const changeView = (newView: number) => () => {
        setView(newView);
    };

    return (
        <Fade in={true} mountOnEnter unmountOnExit>
            <Grid className="bond-view">
                <Backdrop open={true}>
                    <Fade in={true}>
                        <div className="bond-card">
                            <BondHeader
                                bond={bond}
                                slippage={slippage}
                                recipientAddress={recipientAddress}
                                onSlippageChange={onSlippageChange}
                                onRecipientAddressChange={onRecipientAddressChange}
                            />
                            {/* @ts-ignore */}
                            <Box direction="row" className="bond-price-data-row">
                                <div className="bond-price-data">
                                    <p className="bond-price-data-title">{t("bond:MintPrice")}</p>
                                    <p className="bond-price-data-value">
                                        {isBondLoading ? <Skeleton /> : bond.isLP || bond.name === "wavax" ? `$${trim(bond.bondPrice, 2)}` : `${trim(bond.bondPrice, 2)} MIM`}
                                    </p>
                                </div>
                                <div className="bond-price-data">
                                    <p className="bond-price-data-title">{t("SBPrice")}</p>
                                    <p className="bond-price-data-value">{isBondLoading ? <Skeleton /> : `$${trim(bond.marketPrice, 2)}`}</p>
                                </div>
                            </Box>

                            {bond.isActive && (
                                <div className="bond-one-table">
                                    <div className={classnames("bond-one-table-btn", { active: !view })} onClick={changeView(0)}>
                                        <p>{t("bond:Mint")}</p>
                                    </div>
                                    <div className={classnames("bond-one-table-btn", { active: view })} onClick={changeView(1)}>
                                        <p>{t("bond:Redeem")}</p>
                                    </div>
                                </div>
                            )}

                            {bond.isActive && (
                                <TabPanel value={view} index={0}>
                                    <BondPurchase bond={bond} slippage={slippage} recipientAddress={recipientAddress} />
                                </TabPanel>
                            )}

                            <TabPanel value={view} index={1}>
                                <BondRedeem bond={bond} />
                            </TabPanel>
                        </div>
                    </Fade>
                </Backdrop>
            </Grid>
        </Fade>
    );
}

export default Bond;
