import * as React from "react";
import { Tabs, Tab } from "@material-ui/core";
import { withRouter, RouteComponentProps } from "react-router-dom";
import "./Header.css";
import logo from "../../logo.png";
import { AuthContext } from "../../auth/AuthProvider";

const Header: React.FunctionComponent<RouteComponentProps> = props => {
    const { authData } = React.useContext(AuthContext)!;

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
        <div style={{ backgroundColor: "var(--light-grey)" }}>
            <img
                src={logo}
                className="Logo"
                alt="The Cancer Immunologic Data Commons"
            />
            <Tabs
                value={selectedTab}
                onChange={handleChange}
                className="Header-tabs"
            >
                <Tab
                    disableRipple={true}
                    value="/"
                    style={{ minWidth: 100 }}
                    label={<span className="Header-tab-label">Home</span>}
                />
                <Tab
                    disableRipple={true}
                    value="/transfer-data"
                    label={
                        <span className="Header-tab-label">Transfer Data</span>
                    }
                />
                <Tab
                    disableRipple={true}
                    value="/browse-files"
                    label={
                        <span className="Header-tab-label">Browse Files</span>
                    }
                />
                <Tab
                    disableRipple={true}
                    value="/templates"
                    style={{ minWidth: 100 }}
                    label={<span className="Header-tab-label">Templates</span>}
                />
                <Tab
                    disableRipple={true}
                    value="/privacy-security"
                    label={
                        <span className="Header-tab-label">
                            Privacy and Security
                        </span>
                    }
                />
                <Tab
                    disableRipple={true}
                    value="/user-account"
                    style={{ minWidth: 300 }}
                    label={
                        <span className="Header-tab-label">
                            {(authData && authData.user.email) || ""}
                        </span>
                    }
                />
                <Tab
                    disableRipple={true}
                    value="/logout"
                    style={{ minWidth: 100 }}
                    label={<span className="Header-tab-label">Logout</span>}
                />
            </Tabs>
        </div>
    );
};

export default withRouter(Header);
