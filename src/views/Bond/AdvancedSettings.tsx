import { Box, Modal, Paper, SvgIcon, IconButton, FormControl, OutlinedInput, InputLabel, InputAdornment } from "@material-ui/core";
import { useEffect, useState } from "react";
import { ReactComponent as XIcon } from "../../assets/icons/x.svg";
import "./bondSettings.scss";

import { useTranslation } from "react-i18next";

interface IAdvancedSettingsProps {
    open: boolean;
    handleClose: () => void;
    slippage: number;
    recipientAddress: string;
    onRecipientAddressChange: (e: any) => void;
    onSlippageChange: (e: any) => void;
}

function AdvancedSettings({ open, handleClose, slippage, recipientAddress, onRecipientAddressChange, onSlippageChange }: IAdvancedSettingsProps) {
    const { t } = useTranslation();

    const [value, setValue] = useState(slippage);

    useEffect(() => {
        let timeount: any = null;
        clearTimeout(timeount);

        timeount = setTimeout(() => onSlippageChange(value), 1000);
        return () => clearTimeout(timeount);
    }, [value]);

    return (
        <Modal id="hades" open={open} onClose={handleClose} hideBackdrop>
            <Paper className="ohm-card ohm-popover">
                <div className="cross-wrap">
                    <IconButton onClick={handleClose}>
                        <SvgIcon color="primary" component={XIcon} />
                    </IconButton>
                </div>

                <p className="hades-title">{t("bond:Settings")}</p>

                <Box className="card-content">
                    <InputLabel htmlFor="slippage">
                        <p className="input-lable">{t("bond:Slippage")}</p>
                    </InputLabel>
                    <FormControl variant="outlined" color="primary" fullWidth>
                        <OutlinedInput
                            id="slippage"
                            value={value}
                            onChange={(e: any) => setValue(e.target.value)}
                            fullWidth
                            type="number"
                            className="bond-input"
                            endAdornment={
                                <InputAdornment position="end">
                                    <p className="percent">%</p>
                                </InputAdornment>
                            }
                        />
                        <div className="help-text">
                            <p className="text-bond-desc">{t("bond:SlippageHelpText")}</p>
                        </div>
                    </FormControl>

                    <InputLabel htmlFor="recipient">
                        <p className="input-lable">{t("bond:RecipientAddress")}</p>
                    </InputLabel>
                    <FormControl variant="outlined" color="primary" fullWidth>
                        <OutlinedInput className="bond-input" id="recipient" value={recipientAddress} onChange={onRecipientAddressChange} type="text" />
                        <div className="help-text">
                            <p className="text-bond-desc">{t("bond:RecipientAddressHelpText")}</p>
                        </div>
                    </FormControl>
                </Box>
            </Paper>
        </Modal>
    );
}

export default AdvancedSettings;
