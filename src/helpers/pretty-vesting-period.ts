import { prettifySeconds } from "./prettify-seconds";
import { secondsUntilBlock } from "./seconds-until-block";

import i18n from "../i18n";

export const prettyVestingPeriod = (currentBlock: number, vestingBlock: number) => {
    if (vestingBlock === 0) {
        return "";
    }

    const seconds = secondsUntilBlock(currentBlock, vestingBlock);
    if (seconds < 0) {
        return i18n.t("bond:FullyVested");
    }
    return prettifySeconds(seconds);
};
