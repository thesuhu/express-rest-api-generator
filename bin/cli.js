#!/usr/bin/env node

var program = require('commander')
var readline = require('readline')
var fs = require('fs')
var mkdirp = require('mkdirp')
var basedir = require('app-root-path')
var path = require('path')

var MODE_0666 = parseInt('0666', 8)
var MODE_0755 = parseInt('0755', 8)
var VERSION = require('../package').version

var _exit = process.exit

// Re-assign process.exit because of commander
process.exit = exit

// CLI
around(program, 'optionMissingArgument', function (fn, args) {
    commander.outputHelp()
    fn.apply(this, args)
    return { args: [], unknown: [] }
})

before(program, 'outputHelp', function () {
    // track if help was shown for unknown option
    this._helpShown = true
})

before(program, 'unknownOption', function () {
    // allow unknown options if help was shown, to prevent trailing error
    this._allowUnknownOption = this._helpShown

    // show help if not yet shown
    if (!this._helpShown) {
        commander.outputHelp()
    }
})

program
    .name('express-rest-api-generator')
    .version(VERSION, '    --version')
    .usage('[options] [dir]')
    .option('-f, --force', 'force on non-empty directory')
    .parse(process.argv)

if (!exit.exited) {
    main()
}

// Install an around function
function around(obj, method, fn) {
    var old = obj[method]

    obj[method] = function () {
        var args = new Array(arguments.length)
        for (var i = 0; i < args.length; i++) args[i] = arguments[i]
        return fn.call(this, old, args)
    }
}

// Install a before function
function before(obj, method, fn) {
    var old = obj[method]

    obj[method] = function () {
        fn.call(this)
        old.apply(this, arguments)
    }
}

// Prompt for confirmation on STDOUT/STDIN
function confirm(msg, callback) {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    rl.question(msg, function (input) {
        rl.close()
        callback(/^y|yes|ok|true$/i.test(input))
    })
}

// Copy file from templates directory
function copyTemplate(from, to) {
    write(to, fs.readFileSync(path.join(basedir + '/templates', from), 'utf-8'))
}

// Create application at the given directory.
function createApplication(name, dir) {
    console.log()

    // package
    var pkg = {
        name: name,
        version: '1.0.0',
        description: name + ' aplication',
        scripts: {
            start: 'node -r dotenv/config ./bin/www',
            dev: 'nodemon -r dotenv/config ./bin/www'
        },
        dependencies: {
            "@thesuhu/colorconsole": "^1.0.5",
            "@thesuhu/writelog": "^1.0.1",
            "app-root-path": "^3.0.0",
            "cors": "^2.8.5",
            "dotenv": "^10.0.0",
            "express": "^4.17.1",
            "moment-timezone": "^0.5.33",
            "morgan": "^1.10.0",
            "rotating-file-stream": "^2.1.6"
        }
    }

    // write package.json
    write(path.join(dir, 'package.json'), JSON.stringify(pkg, null, 2) + '\n')

    // dotenv
    var env = `
    #app
    NODE_ENV=dev
    DEBUG=${name}:*
    PORT=3000
    
    #jwt
    SALT=dGhlc3VodSBpcyBiYWNrIQ==
    ALG_JWT=HS256
    SIGN_JWT=SHA256
    
    #morgan
    INTERVAL=30d
    SIZE=10M
    
    #parser
    LIMIT_JSON=50mb
    LIMIT_URLENCODE=50mb
    `
    // write .env
    write(path.join(dir, '.env'), env)

    // create directory
    if (dir !== '.') {
        mkdir(dir, '.')
    }

    mkdir(dir, 'middleware')
    mkdir(dir, 'lib')

    // copy app.js
    copyTemplate('app.js', path.join(dir, 'app.js'))

    // copy www
    mkdir(dir, 'bin')
    var www = fs.readFileSync(basedir + '/templates/www', 'utf-8').replace(/name/g, name)
    write(path.join(dir, 'bin/www'), www)

    // copy routes
    mkdir(dir, 'routes')
    copyTemplate('routes.js', path.join(dir, 'routes/routes.js'))

    // copy config
    mkdir(dir, 'config')
    copyTemplate('message-code.js', path.join(dir, 'config/message-code.js'))
    copyTemplate('key.js', path.join(dir, 'config/key.js'))

    var gitignore = `
    node_modules/
    logs/
    .env
    `
    // write gitignore
    write(path.join(dir, '.gitignore'), gitignore)

    var prompt = launchedFromCmd() ? '>' : '$'

    if (dir !== '.') {
        console.log()
        console.log('   change directory:')
        console.log('     %s \x1b[33mcd\x1b[0m %s', prompt, dir)
    }

    console.log()
    console.log('   install dependencies:')
    console.log('     %s \x1b[33mnpm\x1b[0m install', prompt)
    console.log()
    console.log('   run the app:')
    console.log('     %s \x1b[33mnpm\x1b[0m start', prompt)
    console.log()
    console.log('   run the app in dev (pre-installed nodemon required):')
    console.log('     %s \x1b[33mnpm\x1b[0m run dev', prompt)
    console.log()
}

// Create an app name from a directory path, fitting npm naming requirements.
function createAppName(pathName) {
    return path.basename(pathName)
        .replace(/[^A-Za-z0-9.-]+/g, '-')
        .replace(/^[-_.]+|-+$/g, '')
        .toLowerCase()
}

// Check if the given directory `dir` is empty
function emptyDirectory(dir, fn) {
    fs.readdir(dir, function (err, files) {
        if (err && err.code !== 'ENOENT') throw err
        fn(!files || !files.length)
    })
}

// Graceful exit
function exit(code) {
    function done() {
        if (!(draining--)) _exit(code)
    }

    var draining = 0
    var streams = [process.stdout, process.stderr]

    exit.exited = true

    streams.forEach(function (stream) {
        // submit empty write request and wait for completion
        draining += 1
        stream.write('', done)
    })

    done()
}

// Determine if launched from cmd.exe
function launchedFromCmd() {
    return process.platform === 'win32' &&
        process.env._ === undefined
}

// Main program
function main() {
    // Path
    var destinationPath = program.args.shift() || '.'

    // App name
    var appName = createAppName(path.resolve(destinationPath)) || 'hello-world'

    // Generate application
    emptyDirectory(destinationPath, function (empty) {
        if (empty || program.force) {
            createApplication(appName, destinationPath)
        } else {
            confirm('destination is not empty, continue? [y/N] ', function (ok) {
                if (ok) {
                    process.stdin.destroy()
                    createApplication(appName, destinationPath)
                } else {
                    console.error('aborting')
                    exit(1)
                }
            })
        }
    })
}

// Make the given dir relative to base
function mkdir(base, dir) {
    var loc = path.join(base, dir)

    console.log('   \x1b[36mcreate\x1b[0m : ' + loc + path.sep)
    mkdirp.sync(loc, MODE_0755)
}

// str to file
function write(file, str, mode) {
    fs.writeFileSync(file, str, { mode: mode || MODE_0666 })
    console.log('   \x1b[36mcreate\x1b[0m : ' + file)
}