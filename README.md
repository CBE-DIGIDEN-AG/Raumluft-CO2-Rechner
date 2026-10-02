# CO₂ tool for occupied rooms

Web tool for calculating and assessing CO₂ concentrations in indoor air
("Webtool zur Berechnung und Bewertung der CO₂-Konzentrationen in der
Innenraumluft"). It compares window ventilation, hybrid and mechanical
ventilation concepts for a room, using predefined climate data and room usage
profiles, and exports the results as Excel or PDF. The calculation methods
follow DIN/TS 4108-8 and DIN EN 16798-7, and the results can be used for the
assessment system *Bewertungssystem Nachhaltiges Bauen* (BNB).

The user interface is in German.

## Architecture

| Part | Technology |
|---|---|
| Backend | PHP ≥ 8.2, Symfony 7.4, Doctrine ORM, EasyAdmin |
| Frontend | React 18, Highcharts, Bootstrap 5, built with webpack into `assets/co2/` |
| Assets | Symfony AssetMapper serves the built files from `public/assets/` |
| Database | MySQL/MariaDB, only used for the editable text pages (imprint, privacy, …) |

The calculation runs entirely in the browser (`co2src/js/Co2Tool/`). The
backend serves the page shell, the text pages and the Excel export.

## Getting started

Requirements: [DDEV](https://ddev.readthedocs.io/) (recommended), or PHP 8.2+,
Composer 2, Node.js 18 (see `.nvmrc`) and a MySQL/MariaDB database.

```bash
git clone <repository-url> co2-tool && cd co2-tool

ddev start
ddev composer install                       # also creates .env from env_example
ddev php -r 'echo "APP_SECRET=".bin2hex(random_bytes(16))."\n";' >> .env.local
ddev exec php bin/console doctrine:schema:update --force

npm ci
npm run watch                               # or: npm run production
```

Open the URL printed by `ddev start`.

Without DDEV, set `DATABASE_URL` in `.env.local` and use `php -S` or the
Symfony CLI with `public/` as document root.

> **Database schema:** create it with `doctrine:schema:update --force`. The
> single migration in `migrations/` predates the current entity and is not
> sufficient for a fresh install.

### Text pages

The imprint, privacy statement and similar pages are not part of the
repository. Create them under `/admin` → Pages. The frontend loads these
slugs: `impressum`, `datenschutz`, `barrierefreiheit`, `toolbeschreibung`,
`dashboard`, `gebaerdensprache`, `barrieremelden`, `easyspeech`.

## Configuration

Set variables in `.env.local` (never commit it) or in the real environment.

| Variable | Required | Meaning |
|---|---|---|
| `APP_ENV` | yes | `dev` locally, `prod` in production |
| `APP_SECRET` | yes | Random secret, e.g. `php -r 'echo bin2hex(random_bytes(32));'`. Unique per installation. |
| `DATABASE_URL` | yes | Doctrine connection URL, see `env_example` |
| `MESSENGER_TRANSPORT_DSN` | yes | Defaults to the Doctrine transport, see `env_example` |
| `MAILER_DSN` | no | Mail transport, for example `smtp://user:pass@host:587` |
| `MATOMO_URL` | no | Base URL of a Matomo instance. Tracking is only enabled when both Matomo variables are set. |
| `MATOMO_SITE_ID` | no | Matomo site ID |

## Deployment notes

- Build the frontend (`npm ci && npm run production`) and install PHP
  dependencies without dev packages (`composer install --no-dev -o`).
- After each deploy run `php bin/console doctrine:schema:update --force`,
  `importmap:install`, `asset-map:compile` and `cache:clear`.
- Messenger messages (for example mails) are processed by
  `php bin/console messenger:consume async`, run it under a process
  supervisor.
- **Protect `/admin`.** The application has no login of its own. Restrict
  `/admin` with HTTP basic auth or an IP allow-list at the web server, or put it
  behind an identity-aware proxy. An unprotected `/admin` lets anyone edit the
  text pages that are shown to all visitors.
- Serve only the `public/` directory and keep `.env.local` and `var/` out of the
  web root.

## Security

Please report vulnerabilities privately, see [SECURITY.md](SECURITY.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

Released under the [MIT License](LICENSE). Third-party components, fonts and
brand assets have their own terms, see [NOTICE.md](NOTICE.md). The logos of the
Bundesinstitut für Bau-, Stadt- und Raumforschung (BBSR) are not covered by the
MIT License.

The frontend build setup is derived from
[frontend-webpack-boilerplate](https://github.com/WeAreAthlon/frontend-webpack-boilerplate)
by Athlon Sofia (MIT).
