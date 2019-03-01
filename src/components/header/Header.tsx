import * as React from "react";
import { Tabs, Tab } from "@material-ui/core";
import autobind from "autobind-decorator";
import { withRouter } from "react-router-dom";
import "./Header.css";
import logo from "../../logo.png";

class Header extends React.Component<any, {}> {
    @autobind
    private handleChange(event: React.ChangeEvent<{}>, value: any) {
        if (value === "/logout") {
            this.props.auth.logout();
            return;
        }
        this.props.history.push(value);
    }

    public render() {
        let selectedTab = this.props.location.pathname;
        if (
            selectedTab === "/wes-upload" ||
            selectedTab === "/cli-instructions"
        ) {
            selectedTab = "/transfer-data";
        } else if (selectedTab === "/wes-pipeline") {
            selectedTab = "/pipelines";
        } else if (selectedTab === "/callback") {
            return null;
        } else if (selectedTab.startsWith("/file-details")) {
            selectedTab = "/browse-files";
        } else if (selectedTab === "/register") {
            return null;
        }

        if (!this.props.auth.checkAuth(this.props.location.pathname)) {
            return null;
        }

        return (
            <div>
                <img src={logo} className="Logo" />
                <Tabs
                    value={selectedTab}
                    onChange={this.handleChange}
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
                            <span className="Header-tab-label">
                                Transfer Data
                            </span>
                        }
                    />
                    <Tab
                        disableRipple={true}
                        value="/browse-files"
                        label={
                            <span className="Header-tab-label">
                                Browse Files
                            </span>
                        }
                    />
                    <Tab
                        disableRipple={true}
                        value="/pipelines"
                        style={{ minWidth: 100 }}
                        label={
                            <span className="Header-tab-label">Pipelines</span>
                        }
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
                                {this.props.email}
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
    }
}

export default withRouter(Header);
