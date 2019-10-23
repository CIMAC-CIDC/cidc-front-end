import * as React from "react";
import {
    Grid,
    Card,
    CardContent,
    Typography,
    CardHeader
} from "@material-ui/core";
import { InfoContext } from "../info/InfoProvider";
import { CloudDownload } from "@material-ui/icons";
import TemplateDownloadButton from "../generic/TemplateDownloadButton";
import Loader from "../generic/Loader";
import { useManifestsStyles } from "./ManifestsPage";

const ManifestTemplateDownload: React.FunctionComponent = () => {
    const classes = useManifestsStyles();
    const info = React.useContext(InfoContext);

    const manifests = info && info.supportedTemplates.manifests;

    return (
        <Card className={classes.card}>
            <CardHeader
                avatar={<CloudDownload />}
                title={
                    <Typography variant="h6">
                        Download an empty manifest template
                    </Typography>
                }
            />
            <CardContent>
                {!manifests ? (
                    <Loader />
                ) : (
                    <Grid container spacing={1}>
                        {manifests.map(name => (
                            <Grid item>
                                <TemplateDownloadButton
                                    fullWidth
                                    templateName={name}
                                    templateType="manifests"
                                    variant="contained"
                                >
                                    {name}
                                </TemplateDownloadButton>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </CardContent>
        </Card>
    );
};

export default ManifestTemplateDownload;
