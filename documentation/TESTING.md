# Testing and verification

## Automated commands

From the repository root with Python 3.10+ and Node installed:

```sh
NODE_BIN=node python3 -m unittest discover -s tests -v
node --test tests/engine.test.js
```

On Windows PowerShell set `$env:NODE_BIN = 'node'` before running the Python command. With NODE_BIN unset, the cross-language test is skipped, so this is not the complete validation run.

## Current local result

13 Python tests passed, including cross-language parity. Five Node tests passed. GitHub Actions configuration is supplied but remote CI has not yet run.

Python coverage includes valid leap days, impossible dates, duplicate IDs, blank lines/BOMs, escaped and multiline fields, numeric precision and bounds, schema errors, short records, sample totals, CLI output and exit codes. The parity test runs eight fixtures through both engines and compares the entire JSON result.

## Manual acceptance checklist

- [x] Initial sample: 10 records, 4 valid, 7 errors, 1 warning.
- [x] Warning filter shows only the pending-payment record.
- [x] A valid single-record input shows 100% valid and no issues.
- [x] Upload a UTF-8 CSV via the file picker.
- [x] Export and inspect a JSON report (totals verified).
- [ ] Inspect the final deployed URL after GitHub Pages is enabled.

The last item cannot be completed locally. Update this checklist only after observing the corresponding behaviour.

## Adding a rule

1. Write a failing regression for both a valid and an invalid example.
2. Implement the rule in `quality.py` and `docs/engine.js`.
3. Add a fixture to `test_browser_cli_parity`.
4. Update `RULES.md` and the browser schema description.
5. Run both suites and the relevant browser scenario.

## CI

`.github/workflows/ci.yml` runs Python and Node tests on push and pull request, with read-only repository permissions. A green local run is not evidence of a green GitHub run; verify actual Actions results after publication.
