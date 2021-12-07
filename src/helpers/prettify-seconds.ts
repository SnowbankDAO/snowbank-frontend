import i18n from "../i18n";

export const prettifySeconds = (seconds?: number, resolution?: string) => {
    if (seconds !== 0 && !seconds) {
        return "";
    }

    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);

    if (resolution === "day") {
        return d + ` ${i18n.t("day", { count: d })}`;
    }

    const dDisplay = d > 0 ? d + ` ${i18n.t("day", { count: d })}, ` : "";
    const hDisplay = h > 0 ? h + ` ${i18n.t("hour", { count: h })}, ` : "";
    const mDisplay = m > 0 ? m + ` ${i18n.t("min", { count: m })}` : "";

    return dDisplay + hDisplay + mDisplay;
};
