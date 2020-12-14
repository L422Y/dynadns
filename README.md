# DynaDNS

A self powered dynamic DNS updater using your own registrar.

Currently supported providers: *GoDaddy*

---

# How to use

## Installation

 ```shell
 git clone https://github.com/L422Y/dynadns/
 cd dynadns
 cp config.json.example config.json
 npm install
 ```

## Configuration

Modify your `config.json`:

### Base options
```json
{
    "options": {
        "INTERVAL": 600,
        "DEBUG": true,
        "LOG": true
    },
```

`DEBUG` enables messages to `stdout`
`INTERVAL` enables messages to `stdout`

### Accounts

For each account, you need to set the provider, key, secret and setup the records object.
Record entries are grouped by domain, which is stored as the key for each group of records.

`#IPADDRESS#` will be replaced with your current external IP address.

```
    "accounts": [
        {
            "provider": "godaddy",
            "key": "KEYKEYKEYKEYKEYKEYKEYKEYKEYKEYKEYKEY",
            "secret": "SECRETSECRETSECRETSECRET",
            "records": {
                "yourdomain.com": [
                    {
                        "type": "A",
                        "host": "test123",
                        "value": "#IPADDRESS#"
                    },
                    {
                        "type": "MX",
                        "host": "test123",
                        "value": "ASPMX.L.GOOGLE.COM"
                    },
                    {
                        "type": "TXT",
                        "host": "test123",
                        "value": "v=spf1 mx include:spf.protection.outlook.com ip4:#IPADDRESS# ~all"
                    }
                ]
            }
        }
    ]
}
```



You can obtain your KEY and SECRET here:
* GoDaddy: https://developer.godaddy.com/keys

## Updating in the background


### Option 1 (Preferred)
The `--daemon` argument was made to keep the script alive and allow it to check and update the record as needed, the rate at which this happens is defined by the `INTERVAL` setting in your configuration, in seconds. This mode is made for use with [PM2](https://pm2.keymetrics.io/), or `systemd`

Example PM2 installation:
```shell
npm install -g pm2
pm2 start --name DYNADNS index.js -- --daemon
pm2 save
```

`pm2 startup` will give you a command to run to enable starting pm2 on boot and restoring any processes.

`pm2 log` and `pm2 status` will let you make sure the script is running.


### Option 2
Alternatively by using `crontab`

```shell
*/5 * * * * node path/to/dynadns/index.js
```

---

# Roadmap

- ~~Refactor check and update into separate implementations~~
- ~~Actually parse command line arguments~~
- ~~Daemon mode with intervaled external IP check (for use with [PM2](https://pm2.keymetrics.io/), or `systemd`)~~
- ~~Error handling for missing `.env`~~
- ~~Move record(s) config out of `.env` to JSON~~
- ~~Support for additional record types (AAAA, CNAME, TXT, MX, PTR)~~
- ~~Support for multiple record updates~~
- Callbacks / Webhooks after successful updates
- Support for Windows and Linux (may work already)
- Support for additional registrars
- Support for custom functionality (for providers without APIs)


Feel free to contribute 😎
