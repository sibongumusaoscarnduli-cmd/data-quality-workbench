# Recruiter demo and learning guide

## Two-minute demo

1. Explain the problem: bad exports cause misleading dashboards.
2. Load the synthetic orders sample and point out that 7 errors affect only 6 records.
3. Filter to the warning: pending payment needs business review but is not invalid data.
4. Correct an invalid date and revalidate to show the count changes.
5. Show the Python command and describe pipeline exit codes.
6. Open a parity test and explain why the browser and Python implementations must agree.

## Technical questions to prepare

- Why use Decimal when dealing with prices?
- Why must calendar validation go beyond a regular expression?
- What makes duplicate detection O(n)?
- Why render imported values using textContent?
- Why does the validator not automatically remove duplicate orders?
- How would a Web Worker improve responsiveness?
- What would change if reports were stored on a server?
- How would you extend the tool to validate a hospital or retail dataset?

## Suggested personal contributions

Pick one, implement it and explain the tests you added:

- Add a configurable maximum quantity.
- Add a schema selector for a second dataset type.
- Add a rule-summary view grouped by severity and column.
- Move validation to a Web Worker with cancellation.

## Honest portfolio description

“ClearData is an AI-assisted portfolio project that validates orders CSVs using Python and JavaScript. It includes row-level diagnostics, a pipeline-friendly CLI, regression tests and a static browser demo.”

After reviewing and modifying the code, describe the specific features and tests you personally understand and contributed. Do not claim production customers, employment experience, measured business improvements or independent authorship that did not occur. This project can demonstrate skills; it cannot guarantee an interview or job.
