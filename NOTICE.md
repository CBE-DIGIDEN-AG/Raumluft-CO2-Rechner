# Third-party notices

This file lists components that are **not** covered by the project's MIT
licence, or whose terms deserve attention before reuse. Dependencies installed
by Composer and npm carry their own licences; see `composer.lock`,
`package-lock.json` and the packages themselves.

## Brand assets

The files `assets/images/logo-bbsr.svg` and `assets/images/logo_bbsr.png` show
the logo of the Bundesinstitut für Bau-, Stadt- und Raumforschung (BBSR). They
are included so the tool renders as deployed, but no right to use the logo or
the BBSR name is granted. Replace them if you operate your own instance.

## Fonts

| Font | Files | Licence |
|---|---|---|
| Open Sans | `co2src/fonts/open-sans-*` | Apache License 2.0 |
| Merriweather | `co2src/fonts/Merriweather-*` | SIL Open Font License 1.1 |

## Libraries with special terms

- **Highcharts** (`highcharts`, npm) is not under an open-source licence. It is
  free for non-commercial use only; any other use requires a licence from
  Highsoft. See <https://www.highcharts.com/license>. Operators of this tool
  are responsible for holding a suitable licence.
- **Dompdf** and its font and SVG libraries (`dompdf/*`, Composer) are licensed
  under the LGPL.

## Standards

The calculation methods follow DIN/TS 4108-8 and DIN EN 16798-7. The standards
themselves are published by DIN Media and are not part of this repository.
