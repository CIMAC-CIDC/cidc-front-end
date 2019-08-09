type Role =
    | "cidc-admin"
    | "cidc-biofx-user"
    | "cimac-biofx-user"
    | "cimac-user"
    | "developer"
    | "devops"
    | "nci-biobank-user";

type Organization = "CIDC" | "DFCI" | "ICAHN" | "STANFORD" | "ANDERSON";

// tslint:disable-next-line:interface-name
export interface Account {
    _etag: string;
    _created: string;
    _updated: string;
    id: number;
    email: string;
    first_n?: string;
    last_n?: string;
    approved: boolean;
    disabled: boolean;
    role?: Role;
    last_access?: string;
    organization: Organization;
}
