import * as React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Table,
    TableBody,
    TableRow,
    TableCell,
    TablePagination,
    TableHead,
    FormControl,
    Checkbox,
    Grid
} from "@material-ui/core";
import groupBy from "lodash/groupBy";
import mapValues from "lodash/mapValues";
import autobind from "autobind-decorator";
import {
    getTrials,
    getPermissionsForUser,
    grantPermission,
    revokePermission
} from "../../api/api";
import { Trial } from "../../model/trial";
import { Account } from "../../model/account";
import Permission from "../../model/permission";
import { InfoContext } from "../info/InfoProvider";
import Loader from "../generic/Loader";

export interface IUserPermissionsDialogProps {
    open: boolean;
    user: Account;
    token: string;
    onCancel: () => void;
}

export interface IUserPermissionsDialogState {
    trials?: Trial[];
    permissions?: Permission[];
    page: number;
    rowsPerPage: number;
    isRefreshing: boolean;
}

const UserPermissionsDialogWithInfo: React.FunctionComponent<
    IUserPermissionsDialogProps
> = props => {
    const { supportedTemplates, extraDataTypes } = React.useContext(
        InfoContext
    )!;

    const supportedTypes = [
        ...supportedTemplates.metadata,
        ...supportedTemplates.manifests,
        ...extraDataTypes
    ];

    return <UserPermissionsDialog {...props} supportedTypes={supportedTypes} />;
};

class UserPermissionsDialog extends React.Component<
    IUserPermissionsDialogProps & { supportedTypes: string[] },
    IUserPermissionsDialogState
> {
    state: IUserPermissionsDialogState = {
        trials: undefined,
        permissions: undefined,
        page: 0,
        rowsPerPage: 10,
        isRefreshing: false
    };

    @autobind
    componentDidMount() {
        if (this.props.open) {
            getTrials(this.props.token).then(trials =>
                this.setState({ trials })
            );
            this.refreshPermissions();
        }
    }

    componentDidUpdate(prevProps: any) {
        if (!prevProps.open) {
            this.componentDidMount();
        }
    }

    @autobind
    refreshPermissions() {
        this.setState({ isRefreshing: true });
        getPermissionsForUser(this.props.token, this.props.user.id).then(
            permissions => {
                this.setState({ permissions, isRefreshing: false });
            }
        );
    }

    @autobind
    private makeHandleChange(trial: string, assay: string) {
        return (e: React.ChangeEvent<HTMLInputElement>, deleteId?: number) => {
            const checked = e.currentTarget.checked;
            if (checked) {
                // Add to local state
                const tempNewPerm = { trial, assay_type: assay } as Permission;
                this.setState(({ permissions }) => ({
                    permissions: permissions
                        ? [...permissions, tempNewPerm]
                        : [tempNewPerm]
                }));

                // Add to API
                grantPermission(
                    this.props.token,
                    this.props.user,
                    trial,
                    assay
                ).then(() => this.refreshPermissions());
            } else if (!checked && deleteId) {
                // Delete from local state
                this.setState(({ permissions }) => ({
                    permissions:
                        permissions &&
                        permissions.filter(
                            p => !(p.trial === trial && p.assay_type === assay)
                        )
                }));

                // Delete from API
                revokePermission(this.props.token, deleteId).then(() =>
                    this.refreshPermissions()
                );
            }
        };
    }

    @autobind
    private handleCancel() {
        this.props.onCancel();
    }

    @autobind
    private handleChangePage(
        event: React.MouseEvent<HTMLButtonElement> | null,
        page: number
    ) {
        this.setState({ page });
    }

    @autobind
    private handleChangeRowsPerPage(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        this.setState({ rowsPerPage: Number(event.target.value) });
    }

    public render() {
        const userName = `${this.props.user.first_n} ${this.props.user.last_n}`;
        if (!this.state.permissions) {
            return null;
        }
        // Create a mapping from trial ID -> assay type -> permission
        const permissionsMap = mapValues(
            groupBy(this.state.permissions, p => p.trial),
            trialGroup =>
                trialGroup.reduce(
                    (acc, p) => ({ ...acc, [p.assay_type]: p }),
                    {}
                )
        );

        return (
            <>
                <Dialog open={this.props.open} onClose={this.handleCancel}>
                    <DialogTitle>
                        <Grid container direction="row" justify="space-between">
                            <Grid item>
                                Editing data access for{" "}
                                <strong>{userName}</strong>
                            </Grid>
                            <Grid item>
                                {this.state.isRefreshing && (
                                    <Loader size={25} />
                                )}
                            </Grid>
                        </Grid>
                    </DialogTitle>
                    {!this.state.trials && <Loader />}
                    <DialogContent>
                        {this.state.trials && (
                            <div>
                                <Table padding="checkbox">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Trial</TableCell>
                                            {this.props.supportedTypes.map(
                                                typ => (
                                                    <TableCell key={typ}>
                                                        {typ}
                                                    </TableCell>
                                                )
                                            )}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {this.state.trials
                                            .slice(
                                                this.state.page *
                                                    this.state.rowsPerPage,
                                                this.state.page *
                                                    this.state.rowsPerPage +
                                                    this.state.rowsPerPage
                                            )
                                            .map((trial: Trial) => (
                                                <TableRow key={trial.trial_id}>
                                                    <TableCell>
                                                        {trial.trial_id}
                                                    </TableCell>
                                                    {this.props.supportedTypes.map(
                                                        typ => {
                                                            return (
                                                                <AssayCheckbox
                                                                    key={
                                                                        typ +
                                                                        trial.trial_id
                                                                    }
                                                                    trialID={
                                                                        trial.trial_id
                                                                    }
                                                                    assayType={
                                                                        typ
                                                                    }
                                                                    permissionsMap={
                                                                        permissionsMap
                                                                    }
                                                                    onChange={this.makeHandleChange(
                                                                        trial.trial_id,
                                                                        typ
                                                                    )}
                                                                    shouldRefresh={() =>
                                                                        this.setState(
                                                                            {
                                                                                isRefreshing: true
                                                                            }
                                                                        )
                                                                    }
                                                                    isRefreshing={
                                                                        this
                                                                            .state
                                                                            .isRefreshing
                                                                    }
                                                                />
                                                            );
                                                        }
                                                    )}
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                                <TablePagination
                                    component="div"
                                    rowsPerPageOptions={[5, 10, 25]}
                                    count={this.state.trials.length}
                                    rowsPerPage={this.state.rowsPerPage}
                                    page={this.state.page}
                                    onChangePage={this.handleChangePage}
                                    onChangeRowsPerPage={
                                        this.handleChangeRowsPerPage
                                    }
                                />
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </>
        );
    }
}

const AssayCheckbox: React.FunctionComponent<{
    trialID: string;
    assayType: string;
    permissionsMap: {
        [trial: string]: { [assay: string]: Permission };
    };
    onChange: (
        e: React.ChangeEvent<HTMLInputElement>,
        deleteId?: number
    ) => void;
    shouldRefresh: () => void;
    isRefreshing: boolean;
}> = ({
    trialID,
    assayType,
    permissionsMap,
    onChange,
    isRefreshing,
    shouldRefresh
}) => {
    const isChecked =
        trialID in permissionsMap && assayType in permissionsMap[trialID];

    const deleteId = isChecked
        ? permissionsMap[trialID][assayType].id
        : undefined;

    return (
        <TableCell>
            <FormControl>
                <Checkbox
                    data-testid={`checkbox-${trialID}-${assayType}`}
                    checked={isChecked}
                    onChange={e => {
                        shouldRefresh();
                        onChange(e, deleteId);
                    }}
                    disabled={isRefreshing}
                />
            </FormControl>
        </TableCell>
    );
};

export default UserPermissionsDialogWithInfo;
