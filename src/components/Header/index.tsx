import { AppBar, Toolbar, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import MenuIcon from "../../assets/icons/hamburger.svg";
import SnowbankMenu from "./snowbank-menu";
import ConnectButton from "./connect-button";
import "./header.scss";
import { DRAWER_WIDTH, TRANSITION_DURATION } from "../../constants/style";

interface IHeader {
    handleDrawerToggle: () => void;
    drawe: boolean;
}

const useStyles = makeStyles(theme => ({
    appBar: {
        [theme.breakpoints.up("sm")]: {
            width: "100%",
            padding: "20px 0 30px 0",
        },
        justifyContent: "flex-end",
        alignItems: "flex-end",
        background: "transparent",
        backdropFilter: "none",
        zIndex: 10,
    },
    topBar: {
        transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.sharp,
            duration: TRANSITION_DURATION,
        }),
        marginLeft: DRAWER_WIDTH,
    },
    topBarShift: {
        transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.easeOut,
            duration: TRANSITION_DURATION,
        }),
        marginLeft: 0,
    },
}));

function Header({ handleDrawerToggle, drawe }: IHeader) {
    const classes = useStyles();
    const isVerySmallScreen = useMediaQuery("(max-width: 400px)");

    return (
        <div className={`${classes.topBar} ${!drawe && classes.topBarShift}`}>
            <AppBar position="sticky" className={classes.appBar} elevation={0}>
                {/* <Box className="dapp-information-box">
                    <p className="dapp-information-text">
                        Staking rewards & turbines will restart Tuesday 4th at 4:00 am EST. The redistribution event will end at the same time.{" "}
                        <a href="https://docs.snowbank.finance/events/rebirth-redistribution" target="_blank">
                            Learn more about the event here
                        </a>
                        .
                    </p>
                </Box> */}
                <Toolbar disableGutters className="dapp-topbar">
                    <div onClick={handleDrawerToggle} className="dapp-topbar-slider-btn">
                        <img src={MenuIcon} alt="" />
                    </div>
                    <div className="dapp-topbar-btns-wrap">
                        {!isVerySmallScreen && <SnowbankMenu />}
                        <ConnectButton />
                    </div>
                </Toolbar>
            </AppBar>
        </div>
    );
}

export default Header;
