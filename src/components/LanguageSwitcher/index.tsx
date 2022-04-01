import React from "react";
import { useDispatch } from "react-redux";
import { changeLanguage } from "../../store/slices/app-slice";
import { TextField, FormControl, MenuItem } from "@material-ui/core";
import "./languageswitcher.scss";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const availableLanguages = Object.keys(i18n.services.resourceStore.data);
    const defaultLanguage = i18n.resolvedLanguage;
    const [language, setLanguage] = React.useState(defaultLanguage);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let code = event.target.value;
        i18n.changeLanguage(code);
        setLanguage(code);
        dispatch(changeLanguage(i18n.resolvedLanguage));
    };

    return (
        <FormControl variant="outlined" className="language-switcher-form-control">
            <TextField
                id="outlined-select-language"
                className="language-switcher-input"
                select
                label={language === "" ? "Language" : ""}
                value={language}
                size="small"
                InputLabelProps={{ shrink: false }}
                SelectProps={{
                    MenuProps: {
                        getContentAnchorEl: null,
                        anchorOrigin: {
                            vertical: "bottom",
                            horizontal: "left",
                        },
                        transformOrigin: {
                            vertical: "bottom",
                            horizontal: "left",
                        },
                    },
                }}
                margin="normal"
                variant="outlined"
                onChange={handleChange}
            >
                {availableLanguages.map(option => (
                    <MenuItem key={option} value={option}>
                        {t(`lang:${option}.nativeName`)} {option !== "en" ? "(" + t(`lang:${option}.name`) + ")" : ""}
                    </MenuItem>
                ))}
            </TextField>
        </FormControl>
    );
}
