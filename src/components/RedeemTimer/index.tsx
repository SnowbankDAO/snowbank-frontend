import { useSelector } from "react-redux";
import { secondsUntilBlock, prettifySeconds } from "../../helpers";
import { Box } from "@material-ui/core";
import "./rebasetimer.scss";
import { Skeleton } from "@material-ui/lab";
import { useMemo } from "react";
import { IReduxState } from "../../store/slices/state.interface";

import { useTranslation } from "react-i18next";

const END_DATE = new Date(1641286800000);

function RedeemTimer() {
    const { t } = useTranslation();

    const endSeconds = Math.floor(END_DATE.getTime() / 1000);

    const currentBlockTime = useSelector<IReduxState, number>(state => {
        return state.app.currentBlockTime;
    });

    const timeUntilRebase = useMemo(() => {
        if (currentBlockTime && endSeconds) {
            const seconds = secondsUntilBlock(currentBlockTime, endSeconds);
            return prettifySeconds(seconds);
        }
    }, [currentBlockTime, endSeconds]);

    return (
        <Box className="rebase-timer">
            <p>{currentBlockTime ? timeUntilRebase ? <>{t("TimeToRedeem", { time: timeUntilRebase })}</> : <span>{t("Redeem Closed")}</span> : <Skeleton width="200px" />}</p>
        </Box>
    );
}

export default RedeemTimer;
