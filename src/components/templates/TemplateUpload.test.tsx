import * as React from "react";
import {
    render,
    fireEvent,
    waitForElement,
    RenderResult
} from "@testing-library/react";
import TemplateUpload from "./TemplateUpload";
import { XLSX_MIMETYPE } from "../../util/constants";
import Auth, { AuthContext } from "../../auth/Auth";
import { getManifestValidationErrors, uploadManifest } from "../../api/api";
jest.mock("../../api/api");

const TOKEN = "BLAH";

function renderWithMockedAuthContext() {
    const mockAuth = new Auth(jest.fn(), jest.fn());

    mockAuth.getIdToken = jest.fn(() => TOKEN);

    return render(
        <AuthContext.Provider value={mockAuth}>
            <TemplateUpload cardClass="foo" />
        </AuthContext.Provider>
    );
}

/**
 * Fire a selection event on a material UI Select component.
 * @param select the HTML select element under test
 * @param value the value to simulate selecting
 */
async function selectValueMUI(
    renderResult: RenderResult,
    select: Element,
    value: string
) {
    const { getAllByRole, getByText } = renderResult;
    const selectButton = getAllByRole("button", { container: select })[0];
    fireEvent.click(selectButton);
    const valueButton = await waitForElement(() => getByText(value));
    fireEvent.click(valueButton);
}

test("manifest validation", async () => {
    const renderResult = renderWithMockedAuthContext();
    const { queryByTestId, getByTestId, getByText } = renderResult;
    const manifestTypeSelect = getByTestId("manifest-type-select");
    const manifestFileInput = getByTestId("manifest-file-input");
    const submitButton = getByTestId("submit-button");

    function expectNoValidationsDisplayed() {
        expect(queryByTestId("no-selection")).toBeInTheDocument();
        expect(queryByTestId("valid-manifest")).toBeNull();
        expect(queryByTestId("errors")).toBeNull();
    }

    // Defaults on first render to no validations, disabled submit
    expectNoValidationsDisplayed();
    expect(submitButton).toHaveAttribute("disabled");

    // Select a manifest type. Material UI components make this
    // difficult: we need to first click on the select component,
    // then click on the dropdown option that subsequently appears.
    await selectValueMUI(renderResult, manifestTypeSelect, "PBMC");
    expectNoValidationsDisplayed();
    expect(submitButton).toHaveAttribute("disabled");

    async function doValidationRequest(errors: string[], element: string) {
        getManifestValidationErrors.mockResolvedValue(errors);

        fireEvent.click(manifestFileInput);

        const fakePBMCFile = new File(["foo"], "pbmc.xlsx", {
            type: XLSX_MIMETYPE
        });
        fireEvent.change(manifestFileInput, {
            target: { files: [fakePBMCFile] }
        });

        expect(submitButton).toHaveAttribute("disabled");

        await waitForElement(() => queryByTestId(element)!);
        expect(queryByTestId("no-selection")).toBeNull();
    }

    // Check that validation errors show up and submit button is still disabled
    const errs = ["a", "b", "c"];
    await doValidationRequest(errs, "errors");
    errs.map(e => expect(getByText(e)).toBeInTheDocument());
    expect(queryByTestId("valid-manifest")).toBeNull();
    expect(submitButton).toHaveAttribute("disabled");

    // Check that valid message shows up and submit button is enabled
    await doValidationRequest([], "valid-manifest");
    expect(queryByTestId("valid-manifest")).toBeInTheDocument();
    expect(queryByTestId("errors")).toBeNull();
    expect(submitButton).not.toHaveAttribute("disabled");
});

test("manifest submission", async () => {
    const renderResult = renderWithMockedAuthContext();
    const { getByTestId, getByText } = renderResult;
    const manifestTypeSelect = getByTestId("manifest-type-select");
    const manifestFileInput = getByTestId("manifest-file-input");
    const submitButton = getByTestId("submit-button");

    // Select a manifest type
    selectValueMUI(renderResult, manifestTypeSelect, "PBMC");

    // Select a file to upload and wait for validations to complete
    getManifestValidationErrors.mockResolvedValue([]);
    fireEvent.click(manifestFileInput);
    const fakePBMCFile = new File(["foo"], "pbmc.xlsx", {
        type: XLSX_MIMETYPE
    });
    fireEvent.change(manifestFileInput, {
        target: { files: [fakePBMCFile] }
    });
    await waitForElement(() => getByTestId("valid-manifest")!);

    // Submit the manifest
    uploadManifest.mockResolvedValue({
        metadata_json_patch: { lead_organization_study_id: "CIMAC-12345" }
    });
    fireEvent.click(submitButton);
});
