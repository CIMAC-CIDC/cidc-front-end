import * as React from "react";
import {
    Card,
    CardContent,
    Typography,
    Button,
    FormControl,
    Grid,
    Input,
    InputLabel,
    MenuItem,
    Select,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Divider
} from "@material-ui/core";
import { ITemplateCardProps } from "./TemplatesPage";
import { allNames, onValueChange } from "./utils";
import { getManifestValidationErrors, uploadManifest } from "../../api/api";
import { AuthContext } from "../../auth/Auth";
import { WarningRounded, CheckBoxRounded } from "@material-ui/icons";
import { XLSX_MIMETYPE } from "../../util/constants";
import Loader from "../generic/Loader";

const TemplateUpload: React.FunctionComponent<ITemplateCardProps> = (
    props: ITemplateCardProps
) => {
    const auth = React.useContext(AuthContext)!;

    const fileInput = React.useRef<HTMLInputElement>(null);

    const [manifestType, setManifestType] = React.useState<string | undefined>(
        undefined
    );
    const [isValidating, setIsValidating] = React.useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
    const [errors, setErrors] = React.useState<string[] | undefined>(undefined);
    const [file, setFile] = React.useState<File | undefined>(undefined);

    // When the manifest file or manifest type changes, run validations
    React.useEffect(() => {
        if (file && manifestType) {
            setIsValidating(true);
            getManifestValidationErrors(auth.getIdToken()!, {
                schema: manifestType,
                template: file
            }).then(errs => {
                setErrors(errs);
                setIsValidating(false);
            });
        }
    }, [file, manifestType, auth]);

    // The file is valid if it has been validated and there are no errors
    const fileValid = errors instanceof Array && errors.length === 0;

    const onSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (manifestType && file) {
            setIsSubmitting(true);
            uploadManifest(auth.getIdToken()!, {
                schema: manifestType,
                template: file
            })
                .then(() => setIsSubmitting(false))
                .catch(err => {
                    setErrors([`Upload failed: ${err.toString()}`]);
                    setIsSubmitting(false);
                });
        }
    };

    return (
        <Card className={props.cardClass}>
            <CardContent>
                <Typography variant="title">
                    Upload a shipping / receiving manifest
                </Typography>
                <form onSubmit={onSubmit}>
                    <Grid
                        container
                        direction="row"
                        justify="space-evenly"
                        alignItems="center"
                    >
                        <Grid item xs={3}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="manifestType">
                                    Manifest Type
                                </InputLabel>
                                <Select
                                    inputProps={{
                                        id: "manifestType",
                                        name: "type"
                                    }}
                                    value={manifestType || ""}
                                    onChange={onValueChange(setManifestType)}
                                >
                                    {allNames.manifests.map(name => (
                                        <MenuItem key={name} value={name}>
                                            {name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="uploadInput" shrink>
                                    Select a manifest to upload
                                </InputLabel>
                                <Input
                                    id="uploadInput"
                                    onClick={() => {
                                        // Clear the file input onClick to ensure onChange
                                        // fires on every selection, even if the same file
                                        // is selected twice.
                                        if (fileInput.current) {
                                            fileInput.current.value = "";
                                        }
                                    }}
                                    disabled={
                                        !manifestType || manifestType === ""
                                    }
                                    onChange={() => {
                                        if (fileInput.current) {
                                            const files =
                                                fileInput.current.files;
                                            if (files && files.length > 0) {
                                                setFile(files[0]);
                                            }
                                        }
                                    }}
                                    inputProps={{
                                        ref: fileInput,
                                        accept: XLSX_MIMETYPE
                                    }}
                                    type="file"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={2}>
                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={!fileValid}
                            >
                                Upload
                            </Button>
                        </Grid>
                    </Grid>
                </form>
                <Divider />
                <div
                    style={{
                        margin: "1em",
                        maxHeight: "15em",
                        overflowY: "scroll"
                    }}
                >
                    <Grid container direction="row" alignItems="center">
                        {isValidating || isSubmitting ? (
                            <Loader size={32} />
                        ) : errors === undefined ? (
                            <Typography color="textSecondary">
                                Select a manifest to view validations.
                            </Typography>
                        ) : (
                            <List dense>
                                {errors.length === 0 ? (
                                    <ListItem>
                                        <ListItemAvatar>
                                            <CheckBoxRounded color="primary" />
                                        </ListItemAvatar>
                                        <ListItemText>
                                            Manifest is valid.
                                        </ListItemText>
                                    </ListItem>
                                ) : (
                                    errors.map(error => (
                                        <ListItem key={error}>
                                            <ListItemAvatar>
                                                <WarningRounded color="error" />
                                            </ListItemAvatar>
                                            <ListItemText>{error}</ListItemText>
                                        </ListItem>
                                    ))
                                )}
                            </List>
                        )}
                    </Grid>
                </div>
            </CardContent>
        </Card>
    );
};

export default TemplateUpload;
