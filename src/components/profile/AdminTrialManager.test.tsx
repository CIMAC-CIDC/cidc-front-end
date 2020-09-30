import { fireEvent } from "@testing-library/react";
import React from "react";
import { renderWithUserContext } from "../../../test/helpers";
import {
    getTrials,
    createTrial,
    updateTrialMetadata,
    getTrial
} from "../../api/api";
import AdminTrialManager from "./AdminTrialManager";
jest.mock("../../api/api");

const trial1 = {
    trial_id: "test-trial-0",
    metadata_json: {
        protocol_identifier: "test-trial-0",
        trial_name: "trial testing something interesting!",
        participants: [],
        allowed_collection_event_names: ["a", "b", "c"],
        allowed_cohort_names: []
    }
};
const trial2 = {
    trial_id: "test-trial-1",
    metadata_json: {
        protocol_identifier: "test-trial-1",
        participants: [],
        allowed_collection_event_names: [],
        allowed_cohort_names: []
    }
};
const trials = [trial1, trial2];
getTrials.mockResolvedValue(trials);

const renderTrialManager = () =>
    renderWithUserContext(<AdminTrialManager />, {});

it("renders available trials and trial creation button", async () => {
    const { findByText, queryByText } = renderTrialManager();
    expect(await findByText(/create a new trial/i)).toBeInTheDocument();
    expect(queryByText(/test-trial-0/i)).toBeInTheDocument();
    expect(queryByText(/test-trial-1/i)).toBeInTheDocument();
});

it("handles trial creation", async () => {
    const newTrialId = "new-trial-name";
    createTrial
        .mockRejectedValueOnce({
            response: {
                data: { _error: { message: "violates unique constraint" } }
            }
        })
        .mockRejectedValueOnce({
            response: { data: { _error: { message: "some other error" } } }
        })
        .mockResolvedValueOnce({ ...trial2, trial_id: newTrialId });

    const {
        findByText,
        queryByText,
        getByText,
        getByLabelText,
        getByTestId
    } = renderTrialManager();
    const openFormButtonText = /create a new trial/i;
    const infoText = /please provide the unique identifier/i;

    // open the trial creation form
    fireEvent.click(await findByText(openFormButtonText));
    expect(queryByText(infoText)).toBeInTheDocument();
    expect(queryByText(openFormButtonText)).not.toBeInTheDocument();

    // click "cancel" to close the form
    fireEvent.click(getByText(/cancel/i));
    expect(queryByText(infoText)).not.toBeInTheDocument();

    // reopen the form
    fireEvent.click(getByText(openFormButtonText));

    // blocks submitting empty trial_ids
    const creationForm = getByTestId("trial-creation-form");
    fireEvent.submit(creationForm);
    expect(await findByText(/this is a required field/i)).toBeInTheDocument();
    expect(createTrial).not.toHaveBeenCalled();

    // input a value
    const input = getByLabelText(/protocol identifier/i);
    fireEvent.input(input, { target: { value: newTrialId } });
    expect(input.value).toBe(newTrialId);

    // displays api errors appropriately:
    // * non-unique error
    fireEvent.submit(creationForm);
    expect(
        await findByText(/protocol identifier already exists/i)
    ).toBeInTheDocument();
    expect(createTrial).toHaveBeenCalledTimes(1);
    // * unexpected error
    fireEvent.submit(creationForm);
    expect(await findByText(/unexpected error/i)).toBeInTheDocument();
    expect(createTrial).toHaveBeenCalledTimes(2);

    // successful submission closes the creation form and adds the new trial
    // to the trial manager list
    fireEvent.submit(creationForm);
    expect(await findByText(openFormButtonText)).toBeInTheDocument();
    expect(queryByText(infoText)).not.toBeInTheDocument();
    expect(queryByText(newTrialId)).toBeInTheDocument();
    expect(createTrial).toHaveBeenCalledTimes(3);
});

it("handles trial editing and updates", async () => {
    getTrials.mockResolvedValue([trial1]);
    getTrial.mockResolvedValue({ ...trial1, _etag: "some-etag" });
    updateTrialMetadata.mockResolvedValue(trial1);

    const {
        findByText,
        getByLabelText,
        getByText,
        getByTestId
    } = renderTrialManager();
    const trialAccordion = await findByText(new RegExp(trial1.trial_id, "i"));
    expect(trialAccordion).toBeInTheDocument();

    // expand the accordion
    fireEvent.click(trialAccordion);

    // check that already entered metadata values are present
    const trialName = getByLabelText(/trial name/i);
    expect(trialName.value).toBe(trial1.metadata_json.trial_name);
    const collectionEvents = getByLabelText(/collection event names/i);
    expect(collectionEvents.value).toBe(
        trial1.metadata_json.allowed_collection_event_names.join(",")
    );

    // check that submission button is disabled if there are no changes yet
    const submitButton = getByText(/save changes/i).closest("button")!;
    expect(submitButton.disabled).toBe(true);

    // update the collection events, add an NCT identifier, and set the trial status
    fireEvent.input(collectionEvents, { target: { value: "1,2,3" } });
    fireEvent.input(getByLabelText(/nct number/i), {
        target: { value: "some nct id" }
    });
    fireEvent.click(getByLabelText(/ongoing/i));
    expect(submitButton.disabled).toBe(false);

    // submit the changes
    fireEvent.submit(getByTestId(/trial-editing-form/i));
    expect(await findByText(/changes saved/i)).toBeInTheDocument();

    // after successful submit, submit button is disabled and reads "changes saved!"
    expect(submitButton.disabled).toBe(true);
    expect(submitButton.innerHTML).toContain("changes saved!");

    // edited values were passed to the API correctly
    expect(updateTrialMetadata).toHaveBeenCalled();
    const { metadata_json } = updateTrialMetadata.mock.calls[0][2];
    expect(metadata_json.nct_id).toBe("some nct id");
    expect(metadata_json.trial_status).toBe("Ongoing");
    expect(metadata_json.allowed_collection_event_names).toEqual([
        "1",
        "2",
        "3"
    ]);
});

it("handles discarding trial edits", async () => {
    getTrials.mockResolvedValue([trial1]);

    const {
        findByText,
        getByText,
        queryByText,
        getByLabelText
    } = renderTrialManager();
    // expand the trial accordion
    fireEvent.click(await findByText(new RegExp(trial1.trial_id, "i")));

    // check that trial name is displayed
    const trialNameInput = getByLabelText(/trial name/i);
    expect(trialNameInput.value).toBe(trial1.metadata_json.trial_name);
    const submitButton = getByText(/save changes/i).closest("button")!;
    expect(submitButton.disabled).toBe(true);
    expect(queryByText(/discard changes/i)).not.toBeInTheDocument();

    // update the trial name
    fireEvent.input(trialNameInput, { target: { value: "new trial name" } });
    expect(trialNameInput.value).toBe("new trial name");
    expect(submitButton.disabled).toBe(false);

    // discard the changes
    const discardButton = getByText(/discard changes/i);
    fireEvent.click(discardButton);
    expect(trialNameInput.value).toBe(trial1.metadata_json.trial_name);
    expect(submitButton.disabled).toBe(true);
    expect(discardButton).not.toBeInTheDocument();
});

it("displays API errors produced while editing trials", async () => {
    getTrials.mockResolvedValue([trial1]);
    getTrial.mockResolvedValue({ ...trial1, _etag: "some-etag" });
    const errorMessage = "uh oh";
    updateTrialMetadata.mockRejectedValue({ response: { data: errorMessage } });

    const { findByText, getByTestId, getByLabelText } = renderTrialManager();
    // expand the trial accordion
    fireEvent.click(await findByText(new RegExp(trial1.trial_id, "i")));

    // edit the some value
    fireEvent.input(getByLabelText(/trial name/i), {
        target: { value: "foo" }
    });

    // api error should display after submission
    fireEvent.submit(getByTestId(/trial-editing-form/i));
    expect(await findByText(new RegExp(errorMessage, "i"))).toBeInTheDocument();
});
