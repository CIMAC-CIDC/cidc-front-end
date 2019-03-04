import { TablePagination, TableSortLabel } from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import autobind from "autobind-decorator";
import _ from "lodash";
import * as React from "react";
import { Analysis } from "../../model/Analysis";
import { LOCALE, dateOptions } from "../../util/Constants";

const ID_KEY = "_id";
const TRIAL_ID_KEY = "trial_name";
const EXPERIMENTAL_STRATEGY_KEY = "experimental_strategy";
const START_DATE_KEY = "start_date";
const END_DATE_KEY = "end_date";
const STATUS_KEY = "status";

export interface IAnalysisTableProps {
    analyses: Analysis[];
    history: any;
}

export interface IAnalysisTableState {
    rowsPerPage: number;
    page: number;
    sortBy: string;
    sortDirection: "asc" | "desc";
}

export default class AnalysisTable extends React.Component<
    IAnalysisTableProps,
    IAnalysisTableState
> {
    state: IAnalysisTableState = {
        page: 0,
        rowsPerPage: 10,
        sortBy: ID_KEY,
        sortDirection: "asc"
    };

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

    private handleChangeSorting(sortBy: string) {
        const isAsc =
            this.state.sortBy === sortBy && this.state.sortDirection === "asc";
        this.setState({ sortBy, sortDirection: isAsc ? "desc" : "asc" });
    }

    public render() {
        return (
            <div className="Analysis-table">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell className="Analysis-table-header-cell">
                                <TableSortLabel
                                    active={this.state.sortBy === ID_KEY}
                                    direction={this.state.sortDirection}
                                    // tslint:disable-next-line:jsx-no-lambda
                                    onClick={() =>
                                        this.handleChangeSorting(ID_KEY)
                                    }
                                >
                                    Pipeline ID
                                </TableSortLabel>
                            </TableCell>
                            <TableCell className="Analysis-table-header-cell">
                                <TableSortLabel
                                    active={this.state.sortBy === TRIAL_ID_KEY}
                                    direction={this.state.sortDirection}
                                    // tslint:disable-next-line:jsx-no-lambda
                                    onClick={() =>
                                        this.handleChangeSorting(TRIAL_ID_KEY)
                                    }
                                >
                                    Trial ID
                                </TableSortLabel>
                            </TableCell>
                            <TableCell className="Analysis-table-header-cell">
                                <TableSortLabel
                                    active={
                                        this.state.sortBy ===
                                        EXPERIMENTAL_STRATEGY_KEY
                                    }
                                    direction={this.state.sortDirection}
                                    // tslint:disable-next-line:jsx-no-lambda
                                    onClick={() =>
                                        this.handleChangeSorting(
                                            EXPERIMENTAL_STRATEGY_KEY
                                        )
                                    }
                                >
                                    Experimental Strategy
                                </TableSortLabel>
                            </TableCell>
                            <TableCell className="Analysis-table-header-cell">
                                <TableSortLabel
                                    active={
                                        this.state.sortBy === START_DATE_KEY
                                    }
                                    direction={this.state.sortDirection}
                                    // tslint:disable-next-line:jsx-no-lambda
                                    onClick={() =>
                                        this.handleChangeSorting(START_DATE_KEY)
                                    }
                                >
                                    Time Started
                                </TableSortLabel>
                            </TableCell>
                            <TableCell className="Analysis-table-header-cell">
                                <TableSortLabel
                                    active={this.state.sortBy === END_DATE_KEY}
                                    direction={this.state.sortDirection}
                                    // tslint:disable-next-line:jsx-no-lambda
                                    onClick={() =>
                                        this.handleChangeSorting(END_DATE_KEY)
                                    }
                                >
                                    Time Completed
                                </TableSortLabel>
                            </TableCell>
                            <TableCell className="Analysis-table-header-cell">
                                <TableSortLabel
                                    active={this.state.sortBy === STATUS_KEY}
                                    direction={this.state.sortDirection}
                                    // tslint:disable-next-line:jsx-no-lambda
                                    onClick={() =>
                                        this.handleChangeSorting(STATUS_KEY)
                                    }
                                >
                                    Status
                                </TableSortLabel>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {_.orderBy(
                            this.props.analyses,
                            this.state.sortBy,
                            this.state.sortDirection
                        )
                            .slice(
                                this.state.page * this.state.rowsPerPage,
                                this.state.page * this.state.rowsPerPage +
                                    this.state.rowsPerPage
                            )
                            .map((analysis: Analysis) => {
                                return (
                                    <TableRow key={analysis._id}>
                                        <TableCell className="Analysis-table-row-cell">
                                            {analysis._id}
                                        </TableCell>
                                        <TableCell className="Analysis-table-row-cell">
                                            {analysis.trial_name}
                                        </TableCell>
                                        <TableCell className="Analysis-table-row-cell">
                                            {analysis.experimental_strategy}
                                        </TableCell>
                                        <TableCell className="Analysis-table-row-cell">
                                            {new Date(
                                                analysis.start_date
                                            ).toLocaleString(
                                                LOCALE,
                                                dateOptions
                                            )}
                                        </TableCell>
                                        <TableCell className="Analysis-table-row-cell">
                                            {analysis.end_date
                                                ? new Date(
                                                      analysis.end_date
                                                  ).toLocaleString(
                                                      LOCALE,
                                                      dateOptions
                                                  )
                                                : ""}
                                        </TableCell>
                                        <TableCell className="Analysis-table-row-cell">
                                            {analysis.status}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    rowsPerPageOptions={[5, 10, 25]}
                    count={this.props.analyses.length}
                    rowsPerPage={this.state.rowsPerPage}
                    page={this.state.page}
                    onChangePage={this.handleChangePage}
                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                />
            </div>
        );
    }
}
