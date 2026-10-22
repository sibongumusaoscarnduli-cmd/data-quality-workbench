# Schema and report contract

Required headers: `order_id,order_date,product,quantity,unit_price,status`.
Order is flexible. Extra headers are allowed. Duplicate headers are rejected. Leading/trailing whitespace in headers and values is ignored. IDs and status values are case-sensitive.

| Rule | Field | Level | Behaviour |
|---|---|---|---|
| required | All six fields | Error | Empty or absent values fail |
| unique | order_id | Error | Every occurrence of a repeated ID fails |
| date | order_date | Error | Real date, year 0001–9999, exactly YYYY-MM-DD |
| number | quantity | Error | Numeric whole value from 1 to 1,000,000 |
| number | unit_price | Error | 0 to 1,000,000,000; at most two decimal places |
| category | status | Error | Must be paid, pending or refunded |
| pending | status | Warning | Review pending payments before revenue recognition |
| row_width | Whole record | Error | Field count must match header count |

Numbers use plain decimal notation: no exponent notation, currency symbols, thousands separators, NaN or Infinity. `1.0` is accepted as an integer quantity. No future-date rule is applied.

## Example result

```json
{
  "schema_version": 1,
  "records": 1,
  "valid_records": 1,
  "errors": 0,
  "warnings": 1,
  "issues": [
    {
      "record": 2,
      "column": "status",
      "rule": "pending",
      "severity": "warning",
      "message": "Payment is pending; review before recognising revenue."
    }
  ]
}
```

`record` counts non-empty parsed CSV records with header at 1. It is not a physical line number: quoted fields can contain newlines. `errors` counts error issues, not records. `valid_records` excludes any record with at least one error. Warnings do not reduce it.

## Input failures vs row failures

Empty CSV, missing headers, duplicate headers, malformed quoted input and an oversized input are input failures. The CLI exits 2; the browser clears stale results and displays a message. Validly parsed rows with domain problems produce a report and CLI exit 1. The CLI exits 0 if no error issues exist.
