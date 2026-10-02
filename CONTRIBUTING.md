# Contributing

Thanks for your interest. Bug reports, fixes and improvements are welcome.

## Before you start

- Open an issue for larger changes so we can agree on the approach first.
- Security problems go through private reporting, see [SECURITY.md](SECURITY.md).

## Development setup

See the README. In short: `ddev start`, `ddev composer install`,
`doctrine:schema:update --force`, `npm ci`, `npm run watch`.

## Pull requests

1. Branch from the default branch and keep the change focused.
2. Make sure CI passes locally where possible:
   `php bin/console lint:container`, `lint:twig templates`, `lint:yaml config`
   and `npm run production`.
3. Describe what changed and why. Mention user-visible changes.
4. By submitting a pull request you agree that your contribution is licensed
   under the project's [MIT License](LICENSE).

## Style

- PHP follows PSR-12 and Symfony conventions.
- Do not commit secrets, `.env.local`, build output (`assets/co2/`) or IDE files.
