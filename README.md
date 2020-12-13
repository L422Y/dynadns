# DynaDNS

A self powered dynamic DNS updater using your own registrar.

Currently supported providers: *GoDaddy*

---

# How to use

## Installation

 ```
 git clone https://github.com/L422Y/dynadns/
 cd dynadns
 cp .env.example .env
 npm install
 ```

## Configuration

Modify your `.env`:

```
PROVIDER=godaddy
HOST=abc123
DOMAIN=domain.com
DEBUG=true
INTERVAL=60

KEY=2o43tij2843g0924jngf29j34g02n934g0923n4g02g39
SECRET=l2n3ruihf2oq980efno2i3nf2
```

`PROVIDER` is the provider (godaddy only, for now)

`HOST` is the subdomain you'd like to update the `A` record for

`DOMAIN` is the domain to modify

`DEBUG` enables messages to `stdout`

`INTERVAL` enables messages to `stdout`


You can obtain your KEY and SECRET here:
* GoDaddy: https://developer.godaddy.com/keys

## Constantly update the address

One way to do this is by using `crontab` (though daemonization is in the works)

```
*/5 * * * * node path/to/dynadns/index.js
```

There's also the `--daemon` argument, which will keep the script alive to check and update the record as needed, the rate at which is defined by the `INTERVAL` setting in your configuration. This mode is made for use with [PM2](https://pm2.keymetrics.io/), or `systemd`

---

# Roadmap

- ~~Refactor check and update into separate implementations~~
- ~~Actually parse command line arguments~~
- ~~Daemon mode with intervaled external IP check (for use with [PM2](https://pm2.keymetrics.io/), or `systemd`)~~
- ~~Error handling for missing `.env`~~
- Support for Windows and Linux (may work already)
- Support for additional registrars
- Support for custom functionality (for providers without APIs)
- Support for additional record types (AAAA, CNAME, TXT, MX, PTR)
- Support for multiple record updates


Feel free to contribute 😎
