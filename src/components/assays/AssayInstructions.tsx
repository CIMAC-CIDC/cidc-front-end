import * as React from "react";
import { RouteComponentProps } from "react-router";
import CIDCGithubMarkdown from "./CIDCGithubMarkdown";
import TemplateDownloadButton from "../generic/TemplateDownloadButton";
import { withIdToken } from "../identity/AuthProvider";
import { Grid } from "@material-ui/core";
import { CloudDownload } from "@material-ui/icons";

export interface IAssayInstructionsProps
    extends RouteComponentProps<{ assay: string }> {
    token?: string;
}

const AssayInstructions: React.FunctionComponent<
    IAssayInstructionsProps
> = props => {
    const assay = props.match.params.assay;
    const path = `cidc-documentation/master/assays/${assay}.md`;

    return (
        <Grid container direction="column">
            <Grid item>
                <div
                    style={{
                        // A hack to place the download button
                        // next to the markdown doc title
                        float: "right",
                        top: 10,
                        padding: 0,
                        marginBottom: -50
                    }}
                >
                    <TemplateDownloadButton
                        templateName={assay}
                        templateType="metadata"
                        variant="contained"
                        startIcon={<CloudDownload />}
                    >
                        Download an empty {assay} template
                    </TemplateDownloadButton>
                </div>
            </Grid>
            <Grid item>
                <CIDCGithubMarkdown path={path} insertIdToken />
            </Grid>
        </Grid>
    );
};

export default withIdToken(AssayInstructions);
