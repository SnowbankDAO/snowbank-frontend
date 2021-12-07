import { useSelector } from "react-redux";
import { secondsUntilBlock, prettifySeconds } from "../../helpers";
import { Box } from "@material-ui/core";
import "./rebasetimer.scss";
import { Skeleton } from "@material-ui/lab";
import { useMemo } from "react";
import { IReduxState } from "../../store/slices/state.interface";

import { useTranslation } from "react-i18next";

function RebaseTimer() {
    const { t } = useTranslation();

    const currentBlockTime = useSelector<IReduxState, number>(state => {
        return state.app.currentBlockTime;
    });

    const nextRebase = useSelector<IReduxState, number>(state => {
        return state.app.nextRebase;
    });

    const timeUntilRebase = useMemo(() => {
        if (currentBlockTime && nextRebase) {
            const seconds = secondsUntilBlock(currentBlockTime, nextRebase);
            return prettifySeconds(seconds);
        }
    }, [currentBlockTime, nextRebase]);

    return (
        <Box className="rebase-timer">
            <p>{currentBlockTime ? timeUntilRebase ? <>{t("TimeToNextRebase", { time: timeUntilRebase })}</> : <span>{t("Rebasing")}</span> : <Skeleton width="200px" />}</p>
        </Box>
    );
}

export default RebaseTimer;
