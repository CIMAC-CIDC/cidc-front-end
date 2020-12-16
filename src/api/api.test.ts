import axios, { AxiosPromise } from "axios";
import MockAdapter from "axios-mock-adapter";
import {
    _getItem,
    _extractErrorMessage,
    getApiClient,
    getAccountInfo,
    getManifestValidationErrors,
    updateUser,
    getSingleFile,
    getFilelist,
    getDownloadURL,
    updateTrialMetadata,
    _makeManifestRequest
} from "./api";
import { XLSX_MIMETYPE } from "../util/constants";

const axiosMock = new MockAdapter(axios);

const EMAIL = "foo@bar.com";
// TEST_TOKEN is a JWT with email foo@bar.com (there's nothing sensitive in it; it's just base-64 encoded)
const TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZvb0BiYXIuY29tIiwiaWF0IjoxfQ.eyj";
const OBJECT = { foo: "bar" };
const ENDPOINT = "some/route";

beforeEach(() => axiosMock.reset());

function respondsWith404(p: Promise<any>) {
    return p.catch(({ response }) => {
        expect(response.status).toBe(404);
    });
}

describe("_getItem", () => {
    it("handles an existing item", done => {
        const itemID = "1";
        const payload = OBJECT;
        const expectedRoute = ENDPOINT + "/" + itemID;

        axiosMock.onGet(expectedRoute).reply(200, payload);
        _getItem(TOKEN, ENDPOINT, itemID)
            .then(item => expect(item).toEqual(payload))
            .then(done);
    });

    it("bubbles up a 404 on a non-existent item", done => {
        respondsWith404(_getItem(TOKEN, ENDPOINT, "2")).then(done);
    });
});

describe("_extractErrorMessage", () => {
    const endpoint = "foo";
    const client = getApiClient(TOKEN);

    it("handles non-Eve-style error messages", done => {
        const message = "an error message";
        axiosMock.onGet(endpoint).reply(() => [401, message]);
        client
            .get(endpoint)
            .catch(_extractErrorMessage)
            .catch(err => expect(err).toBe(message))
            .then(done);
    });

    it("handles Eve-style error messages", done => {
        const eveError = {
            _status: "ERR",
            _error: { message: "blah" }
        };
        axiosMock.onGet(endpoint).reply(() => [401, eveError]);
        client
            .get(endpoint)
            .catch(_extractErrorMessage)
            .catch(err => expect(err).toBe(eveError._error.message))
            .then(done);
    });

    it("handles empty error messages", done => {
        axiosMock.onGet(endpoint).reply(() => [401, undefined]);
        client
            .get(endpoint)
            .catch(_extractErrorMessage)
            .catch(err => expect(err.includes("401")).toBeTruthy())
            .then(done);
    });
});

test("getManifestValidationErrors", done => {
    const xlsxBlob = new File(["foobar"], "test.xlsx", {
        type: XLSX_MIMETYPE
    });
    const formData = { schema: "foo", template: xlsxBlob };
    const response = { errors: ["a", "b", "c"] };

    axiosMock.onPost("ingestion/validate").reply(config => {
        expect(config.data.get("schema")).toBe(formData.schema);
        expect(config.data.get("template")).toEqual(formData.template);
        return [200, response];
    });

    getManifestValidationErrors(TOKEN, formData)
        .then(errors => expect(errors).toEqual(response.errors))
        .then(done);
});

test("getFileList", async () => {
    const filelist = "a\tb\nc\td\n";
    const fileIds = [1, 2, 3, 4, 5, 6];
    axiosMock.onPost("downloadable_files/filelist").reply(config => {
        expect(config.data).toBe('{"file_ids":[1,2,3,4,5,6]}');
        return [200, "a\tb\nc\td\n"];
    });

    expect(await getFilelist(TOKEN, fileIds)).toBeInstanceOf(Blob);
});

test("getDownloadURL", async () => {
    const url = "fake/url";
    const fileId = 1;
    axiosMock.onGet("downloadable_files/download_url").reply(config => {
        expect(config.params?.id).toBe(fileId);
        return [200, url];
    });

    expect(await getDownloadURL(TOKEN, fileId)).toBe(url);
});

test("updateTrialMetadata", async () => {
    const etag = "test-etag";
    const trial = { trial_id: "10021", metadata_json: { foo: "bar" } };
    const response = { id: 1, ...trial };
    axiosMock.onPatch("trial_metadata/10021").reply(config => {
        expect(JSON.parse(config.data)).toEqual({
            metadata_json: trial.metadata_json
        });
        expect(config.headers["if-match"]).toBe(etag);
        return [200, response];
    });
    expect(await updateTrialMetadata(TOKEN, etag, trial)).toEqual(response);
});

test("updateUser", async () => {
    const etag = "test-etag";
    const user = { id: 1 };
    const updates = { role: "cidc-biofx-user" };
    axiosMock.onPatch(`users/${user.id}`).reply(config => {
        expect(JSON.parse(config.data)).toEqual({ role: user.role });
        expect(config.headers["if-match"]).toBe(etag);
        return [200, user];
    });
    expect(await updateUser(TOKEN, user.id, etag, {})).toEqual(user);
});

test("_makeManifestRequest", async () => {
    const endpoint = "manifest-endpoint";
    const form = {
        schema: "plasma",
        template: new File(["foo"], "plasma.xlsx", { type: XLSX_MIMETYPE })
    };
    axiosMock.onPost(endpoint).reply(config => {
        expect(config.data.get("schema")).toBe(form.schema);
        expect(config.data.get("template")).toBe(form.template);
        return [200, "ok"];
    });
    await _makeManifestRequest(endpoint, TOKEN, form);
});

test("getManifestValidationErrors", async () => {
    const form = { schema: "", template: new File([""], "") };
    const errors200 = ["some", "errors"];
    const errors403 = ["some", "other", "errors"];
    axiosMock
        .onPost("ingestion/validate")
        .replyOnce(200, { errors: errors200 });
    expect(await getManifestValidationErrors(TOKEN, form)).toEqual(errors200);

    axiosMock.onPost("ingestion/validate").replyOnce(403, {
        _status: "ERR",
        _error: { message: { errors: errors403 } }
    });
    expect(await getManifestValidationErrors(TOKEN, form)).toEqual(errors403);

    axiosMock.onPost("ingestion/validate").replyOnce(403, errors403);
    expect(await getManifestValidationErrors(TOKEN, form)).toEqual([
        errors403.toString()
    ]);
});

test("simple GET endpoints", async () => {
    const testConfigs = [
        { route: "users/self", endpoint: getAccountInfo },
        { route: "downloadable_files", endpoint: getSingleFile, withId: true }
    ];

    await Promise.all(
        testConfigs.map(async ({ route, endpoint, withId }: any) => {
            const data = { some: "data" };
            const id = 1;
            axiosMock.onGet(withId ? `${route}/${id}` : route).reply(200, data);
            const result = await endpoint(TOKEN, id);
            expect(data).toEqual(data);
        })
    );
});
