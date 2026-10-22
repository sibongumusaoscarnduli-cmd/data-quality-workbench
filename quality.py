"""Deterministic CSV quality checks. Python 3.10+, no external dependencies."""
import argparse
import csv
import io
import json
import re
from collections import Counter
from datetime import date
from decimal import Decimal, InvalidOperation
from pathlib import Path

COLUMNS = ['order_id', 'order_date', 'product', 'quantity', 'unit_price', 'status']
STATUSES = {'paid', 'pending', 'refunded'}
NUMBER = re.compile(r'^-?\d+(?:\.\d+)?$')
MAX_BYTES = 2 * 1024 * 1024


def validate(text):
    if len(text.encode('utf-8')) > MAX_BYTES:
        raise ValueError('CSV exceeds the 2 MB limit.')
    reader = csv.reader(io.StringIO(text.lstrip('\ufeff')), strict=True)
    try:
        raw = list(reader)
    except csv.Error as exc:
        raise ValueError(f'Invalid CSV: {exc}') from exc
    raw = [row for row in raw if any(v.strip() for v in row)]
    if not raw:
        raise ValueError('CSV is empty.')
    headers = [v.strip() for v in raw[0]]
    if len(headers) != len(set(headers)):
        raise ValueError('Duplicate column headers are not allowed.')
    missing = sorted(set(COLUMNS) - set(headers))
    if missing:
        raise ValueError('Missing columns: ' + ', '.join(missing))
    if len(raw) == 1:
        raise ValueError('CSV contains a header but no data rows.')
    issues, rows, ids = [], [], []
    for record, values in enumerate(raw[1:], 2):
        row = dict(zip(headers, (v.strip() for v in values)))
        rows.append((record, row))
        ids.append(row.get('order_id', ''))
        if len(values) != len(headers):
            issues.append(issue(record, '*', 'row_width', 'error', 'Number of fields differs from header.'))
    counts = Counter(v for v in ids if v)
    for record, row in rows:
        for col in COLUMNS:
            if not row.get(col):
                issues.append(issue(record, col, 'required', 'error', 'Value is required.'))
        if row.get('order_id') and counts[row['order_id']] > 1:
            issues.append(issue(record, 'order_id', 'unique', 'error', 'Order ID appears more than once.'))
        value = row.get('order_date', '')
        if value:
            try:
                if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', value):
                    raise ValueError()
                date.fromisoformat(value)
            except ValueError:
                issues.append(issue(record, 'order_date', 'date', 'error', 'Use a real calendar date: YYYY-MM-DD.'))
        for col in ['quantity', 'unit_price']:
            value = row.get(col, '')
            if not value:
                continue
            try:
                if not NUMBER.fullmatch(value):
                    raise InvalidOperation()
                n = Decimal(value)
                if col == 'quantity' and (n <= 0 or n != n.to_integral_value() or n > 1000000):
                    raise InvalidOperation()
                if col == 'unit_price' and (n < 0 or n > 1000000000 or n.as_tuple().exponent < -2):
                    raise InvalidOperation()
            except InvalidOperation:
                message = 'Use a whole number from 1 to 1,000,000.' if col == 'quantity' else 'Use an amount from 0 to 1,000,000,000 with at most 2 decimals.'
                issues.append(issue(record, col, 'number', 'error', message))
        status = row.get('status', '')
        if status and status not in STATUSES:
            issues.append(issue(record, 'status', 'category', 'error', 'Use paid, pending or refunded (lowercase).'))
        elif status == 'pending':
            issues.append(issue(record, 'status', 'pending', 'warning', 'Payment is pending; review before recognising revenue.'))
    invalid = {i['record'] for i in issues if i['severity'] == 'error'}
    return {'schema_version': 1, 'records': len(rows), 'valid_records': len(rows) - len(invalid),
            'errors': sum(i['severity'] == 'error' for i in issues),
            'warnings': sum(i['severity'] == 'warning' for i in issues), 'issues': issues}


def issue(record, column, rule, severity, message):
    return dict(record=record, column=column, rule=rule, severity=severity, message=message)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('csv_file', type=Path)
    parser.add_argument('--output', type=Path, help='Write a JSON report')
    args = parser.parse_args()
    try:
        if args.csv_file.stat().st_size > MAX_BYTES:
            raise ValueError('CSV exceeds the 2 MB limit.')
        report = validate(args.csv_file.read_text(encoding='utf-8-sig'))
    except (ValueError, OSError) as exc:
        parser.exit(2, f'Input error: {exc}\n')
    result = json.dumps(report, indent=2)
    if args.output:
        args.output.write_text(result + '\n', encoding='utf-8')
    else:
        print(result)
    return 1 if report['errors'] else 0


if __name__ == '__main__':
    raise SystemExit(main())
