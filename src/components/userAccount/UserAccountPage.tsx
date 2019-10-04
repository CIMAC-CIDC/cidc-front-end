import * as React from "react";
import {
    Typography,
    CircularProgress,
    Chip,
    Grid,
    Card,
    CardHeader,
    CardContent
} from "@material-ui/core";
import "./UserAccount.css";
import { getPermissions } from "../../api/api";
import AdminMenu from "./AdminMenu";
import { ORGANIZATION_NAME_MAP } from "../../util/constants";
import Permission from "../../model/permission";
import ContactAnAdmin from "../generic/ContactAnAdmin";
import { AuthContext } from "../../identity/AuthProvider";
import { useUserContext } from "../../identity/UserProvider";
import { AccountCircle, FolderShared } from "@material-ui/icons";

export default function UserAccountPage() {
    const authData = React.useContext(AuthContext);
    const userAccount = useUserContext();

    const [permissions, setPermissions] = React.useState<
        Permission[] | undefined
    >(undefined);

    React.useEffect(() => {
        if (authData && authData.idToken) {
            getPermissions(authData.idToken).then(setPermissions);
        }
    }, [authData]);

    const isAdmin = userAccount && userAccount.role === "cidc-admin";
    const hasPerms = permissions && permissions.length > 0;

    return (
        <div>
            {!userAccount || !permissions ? (
                <div className="User-account-progress">
                    <CircularProgress />
                </div>
            ) : (
                <Grid container spacing={24}>
                    <Grid item>
                        <Card style={{ height: "100%" }}>
                            <CardHeader
                                avatar={<AccountCircle />}
                                title={
                                    <Typography variant="headline">
                                        Personal Info
                                    </Typography>
                                }
                            />
                            <CardContent>
                                <Grid
                                    container
                                    justify="flex-start"
                                    direction="column"
                                >
                                    <Grid item>
                                        <Typography
                                            variant="h6"
                                            color="textSecondary"
                                            paragraph
                                        >
                                            {`${userAccount.first_n} ${
                                                userAccount.last_n
                                            }`}
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography
                                            variant="h6"
                                            color="textSecondary"
                                            paragraph
                                        >
                                            {userAccount.email}
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography
                                            variant="h6"
                                            color="textSecondary"
                                            paragraph
                                        >
                                            {
                                                ORGANIZATION_NAME_MAP[
                                                    userAccount.organization
                                                ]
                                            }
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography
                                            variant="h6"
                                            color="textSecondary"
                                            paragraph
                                        >
                                            Joined on{" "}
                                            {new Date(
                                                userAccount._created
                                            ).toLocaleDateString()}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item>
                        <Card style={{ height: "100%" }}>
                            <CardHeader
                                avatar={<FolderShared />}
                                title={
                                    <Typography variant="headline">
                                        Dataset Access
                                    </Typography>
                                }
                            />
                            <CardContent>
                                <div>
                                    <Grid container spacing={8}>
                                        {isAdmin ? (
                                            <Grid item>
                                                <Typography
                                                    variant="h6"
                                                    color="textSecondary"
                                                    paragraph
                                                >
                                                    As an admin, you have access
                                                    to all datasets.
                                                </Typography>
                                            </Grid>
                                        ) : hasPerms ? (
                                            permissions.map(perm => {
                                                return (
                                                    <Grid
                                                        item
                                                        key={
                                                            perm.trial +
                                                            perm.assay_type
                                                        }
                                                    >
                                                        <Chip
                                                            label={`${
                                                                perm.trial
                                                            }: ${
                                                                perm.assay_type
                                                            }`}
                                                        />
                                                    </Grid>
                                                );
                                            })
                                        ) : (
                                            <Grid item>
                                                <Typography
                                                    variant="h5"
                                                    color="textSecondary"
                                                    paragraph
                                                >
                                                    You do not have access to
                                                    any datasets.
                                                    <br />
                                                    <ContactAnAdmin /> if you
                                                    believe this is a mistake.
                                                </Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
            {userAccount && authData && userAccount.role === "cidc-admin" && (
                <AdminMenu token={authData.idToken} userId={userAccount.id} />
            )}
        </div>
    );
}
