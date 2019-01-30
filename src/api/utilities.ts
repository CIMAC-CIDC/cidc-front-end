import { UriOptions } from "request";
import request from "request-promise-native";

const currentUrl: string = 'https://stagingportal.cimac-network.org' + '/api';

export interface IAPIHelperOptions {
    endpoint: string;
    etag?: string;
    itemID?: string;
    token?: string;
    parameters?: { [key: string]: string };
    body?: { [key: string]: string };
}

export interface IAPIHelper {
    delete<T>(opts: IAPIHelperOptions): Promise<T | undefined>;
    get<T>(opts: IAPIHelperOptions): Promise<T | undefined>;
    patch<T>(opts: IAPIHelperOptions): Promise<T | undefined>;
    post<T>(opts: IAPIHelperOptions): Promise<T | undefined>;
}

async function makeRequest<T>(
    options: UriOptions & request.RequestPromiseOptions
): Promise<T | undefined> {
    return await request(options);
}

interface IAPIOptions {
    body: { [key: string]: string } | undefined;
    headers: { [key: string]: string };
    json: boolean
    method: string,
    qs: {[key: string]: string} | undefined;
    uri: string;
}

const generateOptions = (
    opts: IAPIHelperOptions,
    method: string
): IAPIOptions => {
    return {
        body: opts.body,
        headers: {
            Authorization: `Bearer ${opts.token}`
        },
        json: true,
        method,
        qs: opts.parameters,
        uri: `${currentUrl}/${opts.endpoint}${
            opts.itemID ? `/${opts.itemID}` : ""
        }`
    };
};

const createAPIHelper = (): IAPIHelper => {
    const get = <T>(opts: IAPIHelperOptions): Promise<T | undefined> => {
        return makeRequest<T | undefined>(
            generateOptions(opts, "GET")
        );
    };
    const patch = <T>(opts: IAPIHelperOptions): Promise<T | undefined> => {
        const optid:IAPIOptions = generateOptions(opts, "POST");
        optid.headers["X-HTTP-METHOD-OVERRIDE"] = "PATCH";
        if (opts.etag) {
            optid.headers["If-Match"] = opts.etag;
        }
        return makeRequest<T | undefined>(optid);
    };
    const post = <T>(opts: IAPIHelperOptions): Promise<T | undefined> => {
        return makeRequest<T | undefined>(
            generateOptions(opts, "POST")
        );
    };
    const delF = <T>(opts: IAPIHelperOptions): Promise<T | undefined> => {
        return makeRequest<T | undefined>(
            generateOptions(opts, "DELETE")
        );
    };
    return Object.freeze({
        delete: delF,
        get,
        patch,
        post
    });
};

export {
    createAPIHelper
};
