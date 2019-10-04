import * as React from "react";
import {
    Tabs,
    Tab,
    Card,
    Typography,
    Link as MuiLink,
    Divider,
    Grid
} from "@material-ui/core";
import {
    withRouter,
    RouteComponentProps,
    Link as RouterLink
} from "react-router-dom";
import "./Header.css";
import logo from "../../logo.png";
import {
    AccountCircle,
    Search,
    TableChart,
    CloudUpload
} from "@material-ui/icons";

const ENV = process.env.REACT_APP_ENV;

const EnvBanner: React.FunctionComponent = () =>
    ENV !== "prod" ? (
        <Card
            style={{
                background: "#ffcc00",
                textAlign: "center"
            }}
        >
            <Typography variant="overline">
                Warning! You're accessing a development instance of the CIDC
                portal. If this is a mistake, please navigate to{" "}
                <MuiLink href="https://portal.cimac-network.org">
                    https://portal.cimac-network.org
                </MuiLink>
                .
            </Typography>
        </Card>
    ) : null;

const Header: React.FunctionComponent<RouteComponentProps> = props => {
    function handleChange(_: React.ChangeEvent<{}>, value: any) {
        props.history.push(value);
    }

    let selectedTab = props.location.pathname;
    if (selectedTab.startsWith("/transfer-data")) {
        selectedTab = "/transfer-data";
    } else if (selectedTab === "/callback") {
        return null;
    } else if (selectedTab.startsWith("/file-details")) {
        selectedTab = "/browse-files";
    } else if (selectedTab.startsWith("/templates")) {
        selectedTab = "/templates";
    } else if (["/register", "/unactivated"].includes(selectedTab)) {
        return null;
    }

    return (
        <div style={{ backgroundColor: "var(--light-grey-gradient)" }}>
            <EnvBanner />
            <div className="Header-tabs">
                <Grid
                    container
                    alignItems="center"
                    style={{ width: "100%", paddingBottom: "0" }}
                >
                    <Grid item>
                        <RouterLink to="/">
                            <img src={logo} className="Logo" alt="Home" />
                        </RouterLink>
                    </Grid>
                    <Grid item>
                        <Tabs
                            value={selectedTab}
                            onChange={handleChange}
                            TabIndicatorProps={{ color: "rgba(0,0,0,0)" }}
                        >
                            <Tab
                                disableRipple={true}
                                value="/browse-files"
                                label="Browse Files"
                                icon={<Search />}
                            />
                            <Tab
                                disableRipple={true}
                                value="/transfer-data"
                                label="Transfer Data"
                                icon={<CloudUpload />}
                            />
                            <Tab
                                disableRipple={true}
                                value="/templates"
                                label="Templates"
                                icon={<TableChart />}
                            />
                            <Tab
                                disableRipple={true}
                                value="/user-account"
                                label="Profile"
                                icon={<AccountCircle />}
                            />
                        </Tabs>
                    </Grid>
                </Grid>
            </div>

            <Divider light />
        </div>
    );
};

export default withRouter(Header);
