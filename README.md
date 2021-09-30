# express-rest-api-generator

[![npm](https://img.shields.io/npm/v/@thesuhu/express-rest-api-generator.svg?style=flat-square)](https://www.npmjs.com/package/express-rest-api-generator)
[![Build Status](https://img.shields.io/travis/thesuhu/express-rest-api-generator.svg?branch=main&style=flat-square)](https://app.travis-ci.com/thesuhu/express-rest-api-generator)
[![license](https://img.shields.io/github/license/thesuhu/express-rest-api-generator?style=flat-square)](https://github.com/thesuhu/express-rest-api-generator/blob/master/LICENSE)

The easy way to generate rest API with express. 

## Install

```sh
npm install -g @thesuhu/express-rest-api-generator
```

## Quick Start

Create the app:
```sh
restapi [option] [dir]
```
The above command will generate the application directory structure and the files needed to run the application.

Install dependencies:
```sh
npm install
```

Start yours rest API at http://localhost:3000/ (You can change the port by changing the `PORT` environment in the `.env` file):
```sh
npm start
```
or (pre-installed `nodemon` required)
```sh
npm run dev
```

## Options

This generator provides the following command line flags.

        --version        output the version number
    -f, --force          force on non-empty directory
    -h, --help           output usage information

## License

[MIT](https://github.com/thesuhu/express-rest-api-generator/blob/master/LICENSE)