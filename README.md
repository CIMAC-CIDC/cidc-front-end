| Environment | Branch                                                              | Status                                                                                                                      |
| ----------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| production  | [production](https://github.com/CIMAC-CIDC/cidc-ui/tree/production) | [![Build Status](https://travis-ci.org/CIMAC-CIDC/cidc-ui.svg?branch=production)](https://travis-ci.org/CIMAC-CIDC/cidc-ui) |
| staging     | [master](https://github.com/CIMAC-CIDC/cidc-ui)                     | [![Build Status](https://travis-ci.org/CIMAC-CIDC/cidc-ui.svg?branch=master)](https://travis-ci.org/CIMAC-CIDC/cidc-ui)     |

## CIDC UI Readme


### Installation:

Clone the project, and run `npm install`

### Build:

To create a new deployment bundle, run `npm run build`


### Test:

To run unit tests, run: `npm run test`. This should generate code coverage files and an `lcov.info` file that is compatible with most code-coverage highlighting plugins.

### Deploy
The CIDC leverages GCS's static site-hosting capabilities for serving the Portal UI. Although it's recommended that you rely on the Travis CI pipeline for deployment to staging and production, should you need to deploy by hand, run:
```bash
sh .travis/build.sh
sh .travis/deploy.sh gs://$YOUR_GCS_BUCKET
```
This will create a production-ready build of the site using whatever configuration is present in your `.env` file, upload the build files to `$YOUR_GCS_BUCKET`, and make those files publicly readable.

### Developer mode:
To test React components without trying to contact the back-end, start the application in "dev mode", with `npm run start-dev`
