import React from "react";
import { groupBy, isEqual, invert, map, omit } from "lodash";
import { Grid, Tooltip, IconButton } from "@material-ui/core";
import { useForm, FormContext } from "react-hook-form";
import FormStepHeader from "./_FormStepHeader";
import FormStepFooter from "./_FormStepFooter";
import { useTrialFormContext, useTrialFormSaver } from "./TrialForm";
import FormStepDataSheet, {
    IGridElement,
    makeHeaderRow,
    IFormStepDataSheetProps,
    ICellWithLocation
} from "./_FormStepDataSheet";
import { Add } from "@material-ui/icons";

const KEY_NAME = "collection_event_list";
const ASSAY_LIST_DELIMITER = ",";

interface IFlatCollectionEvent {
    event_name: string;
    specimen_type: string;
    intended_assays?: string[];
    comments?: string;
    parent_specimen_type?: string;
}

interface ICollectionEvent {
    event_name: string;
    specimen_types: ISpecimenTree[];
}

interface ISpecimenTree {
    specimen_type: string;
    intended_assays?: string[];
    derivatives?: ISpecimenTree[];
}

const attrToHeader = {
    specimen_type: "Specimen Type",
    event_name: "Event Name",
    parent_specimen_type: "Parent Specimen Type",
    intended_assays: "Intended Assays",
    comments: "Comments"
};

const colToAttr: IFormStepDataSheetProps<IFlatCollectionEvent>["colToAttr"] = [
    "specimen_type",
    "event_name",
    "parent_specimen_type",
    "intended_assays",
    "comments"
];

const attrToCol = invert(colToAttr);

const makeRow = (event?: Partial<IFlatCollectionEvent>) => {
    if (event) {
        const hasParent = !!event.parent_specimen_type;
        return [
            { value: event.specimen_type },
            {
                value: event.event_name,
                readOnly: hasParent
            },
            {
                value: event.parent_specimen_type,
                readOnly: true
            },
            { value: event.intended_assays?.join(ASSAY_LIST_DELIMITER) },
            { value: event.comments }
        ];
    } else {
        const values = [
            ...Array(2).fill({ value: "" }),
            { readOnly: true },
            ...Array(2).fill({ value: "" })
        ];
        return values;
    }
};

const getCellName = ({ row, attr }: any) => `${KEY_NAME}[${row}].${attr}`;

const CollectionEventsStep: React.FC = () => {
    const { trial, hasChanged, setHasChanged } = useTrialFormContext();
    const formInstance = useForm({ mode: "onBlur" });
    const { getValues } = formInstance;

    const getCollectionEventTree = () => {
        const flatEvents = getValues({ nest: true })[KEY_NAME];
        const eventGroups = groupBy(flatEvents, "event_name");
        const eventTrees = map(
            eventGroups,
            (specimens: IFlatCollectionEvent[], event) => {
                let nodeMap: { [specimenType: string]: ISpecimenTree } = {};
                for (const specimen of specimens) {
                    const name = specimen.specimen_type;
                    nodeMap[name] = {
                        ...nodeMap[name],
                        ...omit(specimen, "parent_specimen_type", "event_name")
                    };

                    const parentName = specimen.parent_specimen_type || "";
                    if (parentName in nodeMap) {
                        const neighbors = nodeMap[parentName].derivatives || [];
                        nodeMap[parentName].derivatives = [
                            ...neighbors,
                            nodeMap[name]
                        ];
                    } else {
                        nodeMap[parentName] = {
                            specimen_type: parentName,
                            derivatives: [nodeMap[name]]
                        };
                    }
                }

                const rootSpecimens = nodeMap[""].derivatives;

                return { event_name: event, specimen_types: rootSpecimens };
            }
        );
        return { [KEY_NAME]: eventTrees };
    };
    useTrialFormSaver(getCollectionEventTree);

    const flattenCollectionEvents = (events: ICollectionEvent[]) => {
        return events.flatMap(event => {
            const flattenSpecimenTree = (parentName: string) => (
                s: ISpecimenTree
            ): IFlatCollectionEvent[] => {
                const flatSpecimen = {
                    event_name: event.event_name,
                    parent_specimen_type: parentName,
                    ...omit(s, "derivatives")
                };
                return [
                    flatSpecimen,
                    ...(s.derivatives?.flatMap(
                        flattenSpecimenTree(s.specimen_type)
                    ) || [])
                ];
            };
            return event.specimen_types.flatMap(flattenSpecimenTree(""));
        });
    };

    const [grid, setGrid] = React.useState<IGridElement[][]>(() => {
        const headers = makeHeaderRow(Object.values(attrToHeader));
        const defaultNestedValues = trial[KEY_NAME];
        const defaultValues = flattenCollectionEvents(defaultNestedValues);
        if (!!defaultValues && defaultValues.length > 0) {
            return [headers, ...defaultValues.map((e: any) => makeRow(e))];
        } else {
            return [headers, makeRow()];
        }
    });

    const getCellValidation = ({
        attr
    }: ICellWithLocation<IFlatCollectionEvent>) => {
        return (value: any) => {
            if (!value || isEqual(value, [""])) {
                return "This is a required field";
            }
        };
    };

    const processCellValue = ({
        attr,
        value: v
    }: ICellWithLocation<IFlatCollectionEvent>) => {
        switch (attr) {
            case "intended_assays":
                if (v === "") {
                    return undefined;
                }
                const splitted = (v || "")
                    .toString()
                    .split(ASSAY_LIST_DELIMITER);
                const trimmed = splitted.map(s => s.trim());
                return trimmed;
            default:
                return v;
        }
    };

    const preRowComponent: IFormStepDataSheetProps<
        IFlatCollectionEvent
    >["preRowComponent"] = ({ row, cells }) => {
        const eventName = cells[attrToCol.event_name].value;
        const specimenName = cells[attrToCol.specimen_type].value;
        const disabled = !(eventName && specimenName);

        const handleClick = () => {
            const newRow = makeRow({
                parent_specimen_type: specimenName
            });
            setGrid([
                ...grid.slice(0, row),
                cells,
                newRow,
                ...grid.slice(row + 1)
            ]);
        };

        return row > 0 ? (
            <Tooltip title="Add a derivative biospecimen">
                <div>
                    <IconButton
                        size="small"
                        color="primary"
                        disabled={disabled}
                        onClick={handleClick}
                    >
                        <Add />
                    </IconButton>
                </div>
            </Tooltip>
        ) : (
            <div />
        );
    };

    const gridWithInferredEventNames = grid.map((row, i) => {
        if (i !== 0) {
            const parentName = row[attrToCol.parent_specimen_type].value;
            if (!!parentName) {
                row[attrToCol.event_name].value =
                    grid[i - 1][attrToCol.event_name].value;
            }
        }
        return row;
    });

    React.useEffect(() => {
        if (!hasChanged) {
            setHasChanged(
                !isEqual(getValues({ nest: true })[KEY_NAME], trial[KEY_NAME])
            );
        }
    }, [grid, trial, getValues, hasChanged, setHasChanged]);

    return (
        <FormContext {...formInstance}>
            <form>
                <Grid
                    container
                    direction="column"
                    spacing={1}
                    alignItems="center"
                >
                    <Grid item>
                        <FormStepHeader
                            title="Define Collection Events"
                            subtitle={
                                "Collection events are the timepoints at which biomaterial is collected from a trial participant. These events, along with what sample types will be collected, should be specified in the clinical trial plan."
                            }
                        />
                    </Grid>
                    <Grid item>
                        <FormStepDataSheet<IFlatCollectionEvent>
                            grid={grid}
                            setGrid={setGrid}
                            colToAttr={colToAttr}
                            rootObjectName={KEY_NAME}
                            preRowComponent={preRowComponent}
                            addRowsButtonText="Add a root specimen type"
                            addRowsIncrement={1}
                            getCellName={getCellName}
                            getCellValidation={getCellValidation}
                            processCellValue={processCellValue}
                            makeEmptyRow={makeRow}
                        />
                    </Grid>
                </Grid>
                <FormStepFooter backButton nextButton />
            </form>
        </FormContext>
    );
};

export default CollectionEventsStep;
