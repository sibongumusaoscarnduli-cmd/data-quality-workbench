# ClearData — CSV quality workbench

An original portfolio project for Sibongumusa Oscar Nduli. Inspect an orders export before using it in a dashboard: find duplicate IDs, missing values, impossible dates, invalid quantities/prices and payment statuses.

**Status:** implemented and locally tested; public deployment pending GitHub account access. No live URL is claimed yet.

## Try it in 60 seconds

Requires Python 3.10+. No pip packages or build step.

```sh
python3 -m http.server 8080 --directory docs --bind 127.0.0.1
# Open http://localhost:8080
```

The sample loads automatically: 10 records, 4 valid records, 7 errors and 1 warning. Change a value, validate again, filter errors or warnings, and export a JSON report. CSV contents stay in the browser; nothing is uploaded. The app has no external scripts or analytics.

## Command-line usage

```sh
python3 quality.py examples/orders.csv --output quality-report.json
```

Exit codes: `0` passes error checks (warnings may remain), `1` data-quality errors, `2` invalid input or I/O failure. This makes the tool usable as a pipeline quality gate. JSON schema version is `1`.

## Tests

```sh
NODE_BIN=node python3 -m unittest discover -s tests -v
node --test tests/engine.test.js
```

Python tests cover duplicate rows, leap days, non-finite numbers, decimal precision, required fields, multiline CSV, CLI exit codes and parity with the browser implementation. CI runs both suites. The parity test is skipped when NODE_BIN is unset; set it to run the complete suite.

## Architecture

```text
UTF-8 CSV -> parser -> schema checks -> row rules -> report
                           |                |
                      input errors     errors + warnings
```

- `quality.py`: Python standard-library parser, Decimal-based numeric checks and CLI.
- `docs/engine.js`: standalone browser validation engine.
- `docs/app.js`: safe text-only rendering, filtering and report download.
- `tests/`: regression and cross-language parity tests.
- `examples/orders.csv`: fully synthetic data with intentional failures.

## Decisions and trade-offs

- A fixed, explicit orders schema makes rules understandable; configurable schemas are future work.
- Prices use Decimal in Python; browser validation checks decimal places and bounds before numeric comparisons. This tool does not calculate financial totals.
- Duplicate IDs invalidate every affected record, rather than silently keeping a first row.
- Warnings do not invalidate records. Multiple issues on one record count as one invalid record.
- Record numbers refer to non-empty parsed CSV records including the header, not physical line numbers. A quoted field may contain newlines.
- Inputs are limited to 2 MB; the browser renders at most 500 issues. JSON export includes all issues.
- No authentication or database is needed: validation is local and reports contain rule metadata, not source field values. Column names still appear in reports.
- This is a portfolio tool for orders CSVs, not an enterprise replacement for Great Expectations. It does not prove a dataset is accurate; it tests the listed rules.

## Deployment

Publish this repository as `data-quality-workbench`, then enable GitHub Pages from the `main` branch, `/docs` folder. The demo is static and needs no server credentials. Run CI before publishing and verify the deployed sample plus file import and export. Deployment has not been completed yet.

## Inspiration and authorship

[Great Expectations](https://github.com/fivetran/great_expectations) inspired the idea of explicit, explainable data-quality rules. This project was written independently: no upstream source code or branding was copied. Created with AI assistance; the owner should review the code, work through the exercises below, and describe their own contributions accurately in interviews.

## Interview walkthrough

1. Explain why an invalid date like 2026-02-30 must fail even though it matches a date pattern.
2. Demonstrate that both occurrences of a duplicate ID fail.
3. Explain the difference between error count and invalid-record count.
4. Show how CLI exit codes can stop a pipeline.
5. Add a new rule in both engines and a parity test before claiming that feature as your contribution.

## Roadmap

- User-defined schema file with explicit type and range rules.
- Web Worker for larger files and cancellable processing.
- SQL-backed history as a separate opt-in application, with authentication and retention policies.

MIT licensed. See LICENSE.

## Documentation

- [Architecture and trade-offs](documentation/ARCHITECTURE.md)
- [Schema, validation rules and JSON contract](documentation/RULES.md)
- [Tests and acceptance checklist](documentation/TESTING.md)
- [Deployment and rollback](documentation/DEPLOYMENT.md)
- [Recruiter demo and interview guide](documentation/INTERVIEW_GUIDE.md)
