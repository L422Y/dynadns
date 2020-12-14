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
    FORCE = false
    ARGS = []
    EXITCONDITION = false
    accounts = {}
    constructor(config) {

        // update config
        this.opts = { ...this.opts, ...config.options }
        this.accounts = [...config.accounts]

        // ensure INTERVAL is not too low
        if (this.opts.INTERVAL < 30) {
            this.opts.INTERVAL = 30
        }

        // check if daemon or should daemonize
        this.ARGS = process.argv.slice(2)
        this.FORCE = this.ARGS.indexOf('--force') > -1
        this.DAEMONIZE = this.ARGS.indexOf('--daemon') > -1
        this.ISDAEMON = this.DAEMONIZED || this.DAEMONIZE;

        // bind class methods to object scope
        const funcs = [
            'main',
            'check',
            'update',
            'checkAndUpdate',
            'setupLogging'
        ];

        funcs.forEach(fn => this[fn].bind(this));

        // run main
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
        // check for IP change
        this.check().then(updated => {
            if (updated) {
                l(`IP changed: ${this.IP} ${this.FORCE ? '(FORCED)' : ''}`)
                this.FORCE = false;
                // our IP has changed, process all records
                this.accounts.forEach(account => {
                    let providerObject = providers[account.provider];
                    for (const [domain, records] of Object.entries(account.records)) {
                        records.forEach(record => {
                            this.update(providerObject, domain, record, account);
                        })
                    }
                })
            } else {
                if (this.DEBUG) l('IP unchanged.')
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
        if (lastip != ip || this.FORCE) {
            changed = true
            fs.writeFileSync('lastip.dat', ip)
            this.IP = ip

            changed = true
        }

        return changed
    }

    async update(provider, domain, record, account) {
        // setup template values
        let values = {
            KEY: account.key, SECRET: account.secret, DOMAIN: domain, ...this.opts, IPADDRESS: this.IP,
            HOST: record.host,
            TYPE: record.type,
            VALUE: record.value
        }

        // make the provider a JSON string for easy templating
        let _p = JSON.stringify(provider)

        // apply values to entire provider template
        for (const [key, value] of Object.entries(values)) {
            _p = _p.replace(`#${key.toUpperCase()}#`, value);
        }
        _p = JSON.parse(_p)


        // setup axios config
        const config = {
            method: _p.method,
            url: _p.url,
            data: _p.body,
            headers: _p.headers
        };

        l(`updating '${values.HOST}.${values.DOMAIN}'`)
        l(config)
        // issue the call to the provider
        axios(config)
            .then(response => {
                l(`Successfully updated ${values.HOST}.${values.DOMAIN} to ${values.IPADDRESS}.`)
            })
            .catch(err => {
                le(`Error: ${err.request.path} (${err.statusCode}) ${err.statusMessage}`, JSON.stringify(err.response.data))
            })
    }
}