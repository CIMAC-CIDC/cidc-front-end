import React from "react";
import {
    createMuiTheme,
    makeStyles,
    MuiThemeProvider
} from "@material-ui/core";

export const colors = {
    LIGHT_BLUE: "#95cfff",
    LIGHT_GREY: "#cfd0d0",
    DARK_BLUE_GREY: "#3b4856",
    logoLightBlue: "#0B9FEC",
    logoDarkBlue: "#1C65BE"
};

export const widths = {
    maxPageWidth: 1400,
    minPageWidth: 1100
};

export const theme = createMuiTheme({
    typography: {
        fontFamily: '"Karla", sans-serif'
    },
    palette: {
        primary: {
            main: colors.logoDarkBlue,
            light: colors.logoLightBlue
        }
    },
    overrides: {
        MuiCard: {
            root: {
                boxShadow: "none",
                border: "1px solid #cfd0d0",
                borderRadius: 5
            }
        },
        MuiTab: {
            root: {
                "&$selected": {
                    color: "black"
                }
            }
        }
    }
});

export const CIDCThemeProvider: React.FC = ({ children }) => {
    return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};

export const useRootStyles = makeStyles({
    root: {
        minWidth: "640px !important",
        height: "100vh"
    },
    content: {
        paddingTop: "1rem",
        paddingBottom: "2rem",
        minHeight: 960,
        background: "white"
    },
    centeredPage: {
        paddingRight: "3rem",
        paddingLeft: "3rem",
        minWidth: widths.minPageWidth,
        maxWidth: widths.maxPageWidth,
        margin: "auto"
    }
});
