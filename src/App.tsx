import * as React from "react";
import { Router, Switch, Route } from "react-router-dom";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import history from "./components/identity/History";
import ErrorGuard from "./components/errors/ErrorGuard";
import InfoProvider from "./components/info/InfoProvider";
import { CIDCThemeProvider, useRootStyles } from "./rootStyles";
import { QueryParamProvider } from "use-query-params";
import NotFoundRoute from "./components/generic/NotFoundRoute";
import IdentityProvider from "./components/identity/IdentityProvider";
import {
    AssayDocsPage,
    AnalysesDocsPage
} from "./components/upload-docs/UploadDocsPages";
import Loader from "./components/generic/Loader";

const HomePage = React.lazy(() => import("./components/home/HomePage"));
const ManifestsPage = React.lazy(() =>
    import("./components/manifests/ManifestsPage")
);
const PrivacyAndSecurityPage = React.lazy(() =>
    import("./components/privacy-and-security/PrivacyAndSecurityPage")
);
const ProfilePage = React.lazy(() =>
    import("./components/profile/ProfilePage")
);
const Register = React.lazy(() => import("./components/identity/Register"));

const SchemaPage = React.lazy(() => import("./components/schema/SchemaPage"));
const PipelinesPage = React.lazy(() =>
    import("./components/pipelines/PipelinesPage")
);
const BrowseDataPage = React.lazy(() =>
    import("./components/browse-data/BrowseDataPage")
);
const FileDetailsPage = React.lazy(() =>
    import("./components/browse-data/files/FileDetailsPage")
);

export default function App() {
    const classes = useRootStyles();

    return (
        <Router history={history}>
            <QueryParamProvider ReactRouterRoute={Route}>
                <div className={classes.root}>
                    <CIDCThemeProvider>
                        <ErrorGuard>
                            <InfoProvider>
                                <IdentityProvider>
                                    <Header />
                                    <div className={classes.content}>
                                        <React.Suspense fallback={<Loader />}>
                                            <Switch>
                                                <Route
                                                    exact
                                                    path="/"
                                                    component={HomePage}
                                                />
                                                <Route
                                                    path="/assays"
                                                    component={AssayDocsPage}
                                                />
                                                <Route
                                                    path="/analyses"
                                                    component={AnalysesDocsPage}
                                                />
                                                <Route
                                                    exact
                                                    path="/browse-data/:fileId"
                                                    component={FileDetailsPage}
                                                />
                                                <Route
                                                    exact
                                                    path="/browse-data"
                                                    component={BrowseDataPage}
                                                />
                                                <Route
                                                    exact
                                                    path="/manifests"
                                                    component={ManifestsPage}
                                                />
                                                <Route
                                                    path="/pipelines"
                                                    component={PipelinesPage}
                                                />
                                                <Route
                                                    exact
                                                    path="/schema"
                                                    component={SchemaPage}
                                                />
                                                <Route
                                                    exact
                                                    path="/privacy-security"
                                                    component={
                                                        PrivacyAndSecurityPage
                                                    }
                                                />
                                                <Route
                                                    exact
                                                    path="/profile"
                                                    component={ProfilePage}
                                                />
                                                <Route
                                                    exact
                                                    path="/register"
                                                    component={Register}
                                                />
                                                <Route
                                                    path="*"
                                                    component={NotFoundRoute}
                                                />
                                            </Switch>
                                        </React.Suspense>
                                    </div>
                                    <Footer />
                                </IdentityProvider>
                            </InfoProvider>
                        </ErrorGuard>
                    </CIDCThemeProvider>
                </div>
            </QueryParamProvider>
        </Router>
    );
}
