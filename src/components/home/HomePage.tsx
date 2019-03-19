import * as React from "react";
import { Typography } from "@material-ui/core";
import { Link } from "react-router-dom";

export default class HomePage extends React.Component<any, {}> {
    public render() {
        if (!this.props.auth.checkAuth(this.props.location.pathname)) {
            return null;
        }

        return (
            <div className="Content">
                <Typography variant="h4" gutterBottom={true}>
                    Welcome to the CIMAC-CIDC Data Portal
                </Typography>
                <Typography paragraph={true} style={{ fontSize: 18 }}>
                    From this site, you can:
                </Typography>
                <Typography style={{ fontSize: 18 }}>
                    <li>
                        Get instructions on{" "}
                        <Link to="/transfer-data">transferring new data.</Link>
                    </li>
                    <li>
                        Browse previously{" "}
                        <Link to="/browse-files">uploaded data.</Link>
                    </li>
                    <li>
                        Read documentation on our{" "}
                        <Link to="/pipelines">bioinformatics pipelines.</Link>
                    </li>
                    <li>
                        Browse <Link to="/pipelines">completed pipelines.</Link>
                    </li>
                    <li>
                        Read out{" "}
                        <Link to="/privacy-security">
                            Privacy and Security notice.
                        </Link>
                    </li>
                    <li>
                        View your{" "}
                        <Link to="/user-account">account settings.</Link>
                    </li>
                </Typography>
            </div>
        );
    }
}
