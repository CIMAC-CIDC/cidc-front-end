import * as React from "react";
import {
    Tabs,
    Tab,
    Card,
    Typography,
    Link as MuiLink,
    Grid,
    withStyles,
    makeStyles
} from "@material-ui/core";
import {
    withRouter,
    RouteComponentProps,
    Link as RouterLink
} from "react-router-dom";
import logo from "../../logo.png";
import { useUserContext } from "../identity/UserProvider";
import { useRootStyles } from "../../rootStyles";

const ENV = process.env.REACT_APP_ENV;

export const EnvBanner: React.FunctionComponent = () =>
    ENV !== "prod" ? (
        <Card
            style={{
                background:
                    "repeating-linear-gradient(45deg, #ffcc00, #ffcc00 10px, black 10px, black 20px)",
                padding: "1em",
                textAlign: "center"
            }}
        >
            <Typography
                variant="overline"
                style={{
                    background: "white",
                    padding: "0.5em",
                    lineHeight: "2em"
                }}
            >
                Warning! You're accessing a development instance of the CIDC
                portal. If this is a mistake, please navigate to{" "}
                <MuiLink href="https://portal.cimac-network.org">
                    https://portal.cimac-network.org
                </MuiLink>
                .
            </Typography>
        </Card>
    ) : null;

interface IStyledTabsProps {
    value: string | false;
    onChange: (event: React.ChangeEvent<{}>, newValue: string) => void;
}

const StyledTabs = withStyles({
    indicator: {
        display: "flex",
        justifyContent: "center",
        backgroundColor: "transparent",
        "& > div": {
            maxWidth: 60,
            width: "100%",
            backgroundColor: "black"
        }
    }
})((props: IStyledTabsProps) => (
    <Tabs {...props} TabIndicatorProps={{ children: <div /> }} />
));

const StyledTab = withStyles(theme => ({
    root: { minWidth: 120 }
}))(Tab);

const useHeaderStyles = makeStyles(theme => ({
    tabs: {
        background: theme.palette.grey[100],
        margin: 0
    },
    logo: { height: 75, padding: 5 }
}));

export const DONT_RENDER_PATHS = ["/register", "/unactivated", "/callback"];

const Header: React.FunctionComponent<RouteComponentProps> = props => {
    const rootClasses = useRootStyles();
    const classes = useHeaderStyles();
    const user = useUserContext();

    function handleChange(_: React.ChangeEvent<{}>, value: any) {
        props.history.push(value);
    }

    let selectedTab: string | false = props.location.pathname;

    if (["/", "/privacy-security"].includes(selectedTab)) {
        selectedTab = false;
    } else if (DONT_RENDER_PATHS.includes(selectedTab)) {
        return null;
    } else {
        selectedTab = `/${selectedTab.split("/")[1]}`;
    }

    return (
        <div data-testid="header" style={{ minWidth: "100%" }}>
            <EnvBanner />
            <div className={classes.tabs}>
                <Grid
                    container
                    className={rootClasses.centeredPage}
                    justify="space-between"
                    alignItems="center"
                    wrap="nowrap"
                    spacing={1}
                >
                    <Grid item>
                        <RouterLink to="/">
                            <img
                                src={logo}
                                className={classes.logo}
                                alt="Home"
                            />
                        </RouterLink>
                    </Grid>
                    <Grid item>
                        <StyledTabs value={selectedTab} onChange={handleChange}>
                            <StyledTab
                                disableRipple={true}
                                value="/browse-data"
                                label="browse data"
                            />
                            {user && user.showAssays && (
                                <StyledTab
                                    disableRipple={true}
                                    value="/assays"
                                    label="Assays"
                                />
                            )}
                            {user && user.showAnalyses && (
                                <StyledTab
                                    disableRipple={true}
                                    value="/analyses"
                                    label="Analyses"
                                />
                            )}
                            {user && user.showManifests && (
                                <StyledTab
                                    disableRipple={true}
                                    value="/manifests"
                                    label="Manifests"
                                />
                            )}
                            <StyledTab
                                disableRipple={true}
                                value="/pipelines"
                                label="Pipelines"
                            />
                            <StyledTab
                                disableRipple={true}
                                value="/schema"
                                label="Schema"
                            />
                            <StyledTab
                                disableRipple={true}
                                value="/profile"
                                label="Profile"
                            />
                        </StyledTabs>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
};

export default withRouter(Header);
