import { Grid, Typography, Button } from "@material-ui/core";
import uniq from "lodash/uniq";
import * as React from "react";
import FileFilter from "./FileFilter";
import FileTable from "./FileTable";
import { withIdToken } from "../identity/AuthProvider";
import { RouteComponentProps } from "react-router";
import { withData, IDataContext } from "../data/DataProvider";
import { Refresh } from "@material-ui/icons";
import Loader from "../generic/Loader";
import { StringParam, ArrayParam, useQueryParams } from "use-query-params";

export const filterConfig = {
    search: StringParam,
    protocol_id: ArrayParam,
    data_format: ArrayParam,
    type: ArrayParam
};
type Filters = ReturnType<typeof useQueryParams>[0];

export const filtersToWhereClause = (filters: Filters): string => {
    const arraySubclause = (ids: any, key: string) =>
        !!ids && `(${ids.map((id: string) => `${key}=="${id}"`).join(" or ")})`;
    const subclauses = [
        arraySubclause(filters.protocol_id, "trial"),
        arraySubclause(filters.type, "assay_type"),
        arraySubclause(filters.data_format, "data_format")
    ];

    return subclauses.filter(c => !!c).join(" and ");
};

const BrowseFilesPage: React.FC<
    RouteComponentProps & { token: string } & IDataContext
> = props => {
    const [filters, setFilters] = useQueryParams(filterConfig);
    const updateFilters = (k: keyof typeof filterConfig, v: string) => {
        if (k === "search") {
            setFilters({ search: v });
        } else {
            const current = filters[k];
            const updated = current
                ? current.includes(v)
                    ? current.filter(f => f !== v)
                    : [...current, v]
                : [v];
            setFilters({ [k]: updated });
        }
    };

    const filterWidth = 300;
    const maxTableWidth = 1500;

    return (
        <div
            style={{
                margin: "auto",
                padding: 20,
                maxWidth: filterWidth + maxTableWidth
            }}
        >
            {props.files.length === 0 && (
                <Grid container justify="center">
                    <Grid item>
                        <Typography>No files found.</Typography>
                    </Grid>
                </Grid>
            )}
            {props.files.length > 0 && (
                <Grid container spacing={3}>
                    <Grid item style={{ width: filterWidth }}>
                        <FileFilter
                            trialIds={{
                                options: uniq(
                                    props.files.map(file => file.trial)
                                ),
                                checked: filters.protocol_id
                            }}
                            experimentalStrategies={{
                                options: uniq(
                                    props.files.map(file => file.assay_type)
                                ),
                                checked: filters.type
                            }}
                            dataFormats={{
                                options: uniq(
                                    props.files.map(file => file.data_format)
                                ),
                                checked: filters.data_format
                            }}
                            onTrialIdChange={v =>
                                updateFilters("protocol_id", v)
                            }
                            onExperimentalStrategyChange={v =>
                                updateFilters("type", v)
                            }
                            onDataFormatChange={v =>
                                updateFilters("data_format", v)
                            }
                        />
                    </Grid>
                    <Grid
                        item
                        style={{
                            maxWidth: 1500,
                            width: `calc(100% - ${filterWidth}px)`
                        }}
                    >
                        <Grid
                            container
                            wrap="nowrap"
                            direction="row"
                            justify="space-between"
                            alignItems="center"
                        >
                            <Grid item>
                                {/*
                                Free text search is disabled for now, pending
                                engineering decisions about how to do this server-side.

                                <TextField
                                    style={{ marginTop: 0 }}
                                    label="Search"
                                    type="search"
                                    margin="dense"
                                    variant="outlined"
                                    value={filters.search}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>
                                    ) =>
                                        updateFilters("search", e.target.value)
                                    }
                                />*/}
                            </Grid>
                            <Grid item>
                                <Button
                                    endIcon={<Refresh />}
                                    disabled={props.dataStatus === "fetching"}
                                    onClick={() => props.refreshData()}
                                >
                                    Refresh
                                </Button>
                            </Grid>
                        </Grid>
                        {props.dataStatus === "fetching" && <Loader />}
                        {props.dataStatus === "fetched" && (
                            <FileTable history={props.history} />
                        )}
                        {props.dataStatus === "failed" && (
                            <Typography>
                                Encountered an error fetching file data.
                            </Typography>
                        )}
                    </Grid>
                </Grid>
            )}
        </div>
    );
};

export default withData(withIdToken(BrowseFilesPage));
