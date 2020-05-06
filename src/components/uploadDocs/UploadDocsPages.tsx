import * as React from "react";
import {
    List,
    Grid,
    ListItem,
    ListItemText,
    Divider,
    ListSubheader
} from "@material-ui/core";
import { map } from "lodash";
import { RouteComponentProps, Route, withRouter, Redirect } from "react-router";
import UploadInstructions from "./UploadInstructions";
import { useRootStyles } from "../../rootStyles";
import { Dictionary } from "lodash";

interface IDocPathConfig {
    path: string;
    label: string;
    title: string;
    assays?: boolean;
    analyses?: boolean;
}

const pathConfigs: Dictionary<IDocPathConfig> = {
    "cli-instructions": {
        path: "cli-instructions",
        label: "CLI Instructions",
        title: "The CIDC Command-Line Interface"
    },
    wes: {
        path: "wes",
        label: "WES",
        title: "WES upload",
        assays: true,
        analyses: true
    },
    rna: {
        path: "rna",
        label: "RNA Expression",
        title: "RNA Expression upload",
        assays: true,
        analyses: true
    },
    cytof: {
        path: "cytof",
        label: "CyTOF",
        title: "CyTOF upload",
        assays: true,
        analyses: true
    },
    olink: {
        path: "olink",
        label: "Olink",
        title: "Olink upload",
        assays: true
    },
    ihc: { path: "ihc", label: "IHC", title: "IHC upload", assays: true },
    elisa: {
        path: "elisa",
        label: "ELISA",
        title: "ELISA upload",
        assays: true
    },
    mif: { path: "mif", label: "mIF", title: "mIF upload", assays: true }
};

export interface IUploadDocsPageProps extends RouteComponentProps {
    uploadType: "assays" | "analyses";
}

const UploadDocsPage: React.FunctionComponent<IUploadDocsPageProps> = props => {
    const classes = useRootStyles();

    const DocsListItem: React.FunctionComponent<{
        label: string;
        path: string;
    }> = localProps => (
        <ListItem
            button
            selected={props.location.pathname.endsWith(localProps.path)}
            onClick={() => props.history.push(localProps.path)}
        >
            <ListItemText>{localProps.label}</ListItemText>
        </ListItem>
    );

    const CLIRedirect = () => (
        <Redirect to={`/${props.uploadType}/cli-instructions`}></Redirect>
    );

    const CLIUploadInstructions = () => (
        <UploadInstructions
            docPath={`/assays/cli-instructions.md`}
            title={pathConfigs["cli-instructions"].title}
            tokenButton={true}
            uploadType={props.uploadType}
        />
    );

    const SelectedUploadInstructions: React.FC<RouteComponentProps<{
        docPath: string;
    }>> = rprops => {
        const docPath = rprops.match.params.docPath;
        const isCLI = docPath.indexOf("cli") > -1;
        const notFound = pathConfigs[docPath] === undefined;

        if (isCLI) {
            return null;
        }
        if (notFound) {
            return <CLIRedirect />;
        }

        return (
            <UploadInstructions
                docPath={`/${props.uploadType}/${docPath}.md`}
                title={pathConfigs[docPath].title}
                uploadType={props.uploadType}
            />
        );
    };

    return (
        <div className={classes.centeredPage}>
            <Grid container direction="row">
                <Grid item style={{ width: 200 }}>
                    <List style={{ paddingTop: 0 }}>
                        <ListSubheader disableSticky>
                            General Overview
                        </ListSubheader>
                        <DocsListItem
                            label={pathConfigs["cli-instructions"].label}
                            path={`/${props.uploadType}/${pathConfigs["cli-instructions"].path}`}
                        />
                        <ListSubheader disableSticky>
                            Assay-Specific Docs
                        </ListSubheader>
                        {map(pathConfigs, (config, path) => {
                            const shouldRender =
                                path !== "cli-instructions" &&
                                config[props.uploadType];
                            return (
                                shouldRender && (
                                    <DocsListItem
                                        key={path}
                                        label={config.label}
                                        path={`/${props.uploadType}/${config.path}`}
                                    />
                                )
                            );
                        })}
                    </List>
                </Grid>
                <Grid item>
                    <Divider orientation="vertical" />
                </Grid>
                <Grid item>
                    <div style={{ padding: "1em" }}>
                        <Route
                            path={`/${props.uploadType}`}
                            component={CLIRedirect}
                            exact
                        />
                        <Route
                            path={`/${props.uploadType}/cli-instructions`}
                            component={CLIUploadInstructions}
                        />
                        <Route
                            path={`/${props.uploadType}/:docPath`}
                            component={SelectedUploadInstructions}
                        />
                    </div>
                </Grid>
            </Grid>
        </div>
    );
};

export const AssayDocsPage = withRouter(props => (
    <UploadDocsPage {...props} uploadType="assays" />
));

export const AnalysesDocsPage = withRouter(props => (
    <UploadDocsPage {...props} uploadType="analyses" />
));
