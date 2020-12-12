# DynaDNS

A self powered dynamic DNS updater using your own registrar.

---
Currently supported providers: *GoDaddy*

## Configuration

Configure your `.env`:
```
PROVIDER=godaddy
HOST=abc123
DOMAIN=domain.com
DEBUG=true

KEY=2o43tij2843g0924jngf29j34g02n934g0923n4g02g39
SECRET=l2n3ruihf2oq980efno2i3nf2
```

PROVIDER is the provider (godaddy only, for now)
HOST is the subdomain you'd like to update the `A` record for
DOMAIN is the domain to modify
DEBUG enables messages to `stdout`


You can obtain your KEY and SECRET here:
* GoDaddy: https://developer.godaddy.com/keys


---

# Roadmap

- Refactor check and update into separate implementations
- Actually parse command line arguments
- Error handling for missing `.env`
- Check support for Windows and Linux
- Support for additional registrars
- Support for custom functionality (for providers without APIs)
- Support for additional record types (AAAA, CNAME, TXT, MX, PTR)
- Support for multiple record updates
- Daemon mode with intervaled external IP check (for use with [PM2](https://pm2.keymetrics.io/), or `systemd`)
- Daemon install / uninstall command (macOS, Linux)

Feel free to contribute 😎
