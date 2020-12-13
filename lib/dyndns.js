const providers = require('./providers')
const NamedMutex = require('named-mutex')
const axios = require('axios')
const fs = require('fs')
let le = console.error
let l = console.log

module.exports = class dynadns {
    IP = "x.x.x.x"
    opts = {
        DEBUG: false,
        ISDAEMON: false,
        LOG: false,
        INTERVAL: 30
    }
    DAEMONIZE = false
    DAEMONIZED = false
    ARGS = []
    EXITCONDITION = false
    constructor(opts) {

        // update options
        this.opts = { ...this.opts, ...opts };

        // ensure INTERVAL is not too low
        if (this.opts.INTERVAL < 30) {
            this.opts.INTERVAL = 30
        }

        // check if daemon or should daemonize
        this.ARGS = process.argv.slice(2)
        this.DAEMONIZE = this.ARGS.indexOf('--daemon') > -1
        this.ISDAEMON = this.DAEMONIZED || this.DAEMONIZE;

        // bind methods to object scope
        for (const fn of ['main', 'check', 'update', 'checkAndUpdate', 'setupLogging']) {
            this[fn].bind(this);
        }

        return this.main();
    }

    main() {
        this.setupLogging();
        if (this.DAEMONIZE) {
            l('Daemonizing...')
            // wants to daemonize, try to get lock
            const mutex = new NamedMutex('dynadns')
            if (mutex.tryLock()) {
                // got lock
                l('Starting daemon...')
                let wait = () => {
                    this.checkAndUpdate();
                    if (!this.EXITCONDITION)
                        setTimeout(wait, this.opts.INTERVAL * 1000);
                };
                wait();
            } else {
                // application already running
                console.error(`dynadns is already running`)
                process.exit(1)
            }
        } else {
            // one and done
            l('Checking external IP...')
            this.checkAndUpdate();
        }
    }

    setupLogging() {
        // set up logging depening on configuration
        if (this.opts.DEBUG && !this.ISDAEMON) {
            l = console.log
            le = console.error
        } else if (this.ISDAEMON && this.opts.LOG) {
            l = (...args) => {
                process.stdout.write([`[${new Date().toISOString()}]`, "[INFO]", ...args].join(' ') + "\n")
            }
            le = (...args) => {
                process.stderr([`[${new Date().toISOString()}]`, "[ERROR]", ...args].join(' ') + "\n")
            }

        } else {
            l = le = () => { }
        }
    }

    checkAndUpdate() {
        this.check().then(updated => {
            if (updated) {
                l(`Changed, IP is now ${this.IP}`)
                this.update();
            } else {
                l('IP unchanged.')
            }
        })
    }

    async check() {
        let ip = "x.x.x.x"
        let lastip = "x.x.x.x"
        let changed = false

        // get external ip address
        await axios('https://api.ipify.org').then(response => ip = response.data);

        // check for last stored address
        if (fs.existsSync('lastip.dat')) {
            lastip = fs.readFileSync('lastip.dat')
        }

        // compare new address with stored address
        if (lastip != ip) {
            changed = true
            fs.writeFileSync('lastip.dat', ip)
            this.IP = ip
            return true;
        }
        return false;
    }

    async update() {
        // setup template values
        let values = { ...this.opts, IPADDRESS: this.IP }

        // make the provider a JSON string for easy templating
        let provider = JSON.stringify(providers[this.opts.PROVIDER])

        // apply values to entire provider template
        for (const [key, value] of Object.entries(values)) {
            provider = provider.replace(`#${key}#`, value);
        }
        provider = JSON.parse(provider)

        // setup axios config
        const config = {
            method: provider.method,
            url: provider.url,
            data: provider.body,
            headers: provider.headers
        };

        // issue the call to the provider
        axios(config)
            .then(response => {
                l(`Successfully updated ${values.HOST}.${values.DOMAIN} to ${values.IPADDRESS}.`)
            })
            .catch(err => {
                le(`Error: (${err.status}) ${err.statusText}`, JSON.stringify(err.response.data))
            })
    }
}