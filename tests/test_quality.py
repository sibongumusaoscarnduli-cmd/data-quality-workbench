import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from quality import validate

ROOT = Path(__file__).resolve().parents[1]
HEADER = 'order_id,order_date,product,quantity,unit_price,status\n'
GOOD = 'A,2024-02-29,Widget,1,12.50,paid\n'

class QualityTests(unittest.TestCase):
    def test_valid_leap_day(self):
        self.assertEqual(validate(HEADER + GOOD)['valid_records'], 1)

    def test_duplicate_marks_both_records(self):
        r = validate(HEADER + GOOD * 2)
        self.assertEqual(r['valid_records'], 0)
        self.assertEqual(r['errors'], 2)

    def test_quotes_and_multiline(self):
        r = validate(HEADER + 'A,2026-01-01,"Large, \"\"blue\"\"\nwidget",1,2.00,paid\n')
        self.assertEqual(r['errors'], 0)

    def test_pending_is_not_error(self):
        r = validate(HEADER + GOOD.replace('paid', 'pending'))
        self.assertEqual((r['valid_records'], r['warnings']), (1, 1))

    def test_bad_calendar_date(self):
        self.assertEqual(validate(HEADER + GOOD.replace('2024', '2023'))['errors'], 1)

    def test_price_precision_and_nonfinite(self):
        for price in ['NaN', 'Infinity', '1e3', '-1', '2.001']:
            with self.subTest(price=price):
                self.assertEqual(validate(HEADER + GOOD.replace('12.50', price))['errors'], 1)

    def test_bad_quantity(self):
        for n in ['0', '-1', '1.5', '1000001']:
            with self.subTest(n=n):
                self.assertEqual(validate(HEADER + GOOD.replace(',1,', f',{n},'))['errors'], 1)

    def test_schema_errors(self):
        for text in ['', HEADER, 'order_id,order_id\nA,B', 'foo\nbar']:
            with self.subTest(text=text):
                with self.assertRaises(ValueError): validate(text)

    def test_bom_and_blank_lines(self):
        self.assertEqual(validate('\ufeff' + HEADER + '\n' + GOOD)['records'], 1)

    def test_short_row_reports_width_and_missing(self):
        r = validate(HEADER + 'A,2026-01-01\n')
        self.assertEqual(r['errors'], 5)

    def test_sample_totals(self):
        r = validate((ROOT/'examples/orders.csv').read_text())
        self.assertEqual((r['records'], r['valid_records'], r['errors'], r['warnings']), (10,4,7,1))

    def test_cli_exit_and_json(self):
        r = subprocess.run([sys.executable, 'quality.py', 'examples/orders.csv'], cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(r.returncode, 1)
        self.assertEqual(json.loads(r.stdout)['errors'], 7)
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp)/'ok.csv'; path.write_text(HEADER+GOOD)
            r = subprocess.run([sys.executable, 'quality.py', str(path)], cwd=ROOT, capture_output=True)
            self.assertEqual(r.returncode, 0)

    @unittest.skipUnless(os.environ.get('NODE_BIN'), 'Set NODE_BIN to run cross-language parity')
    def test_browser_cli_parity(self):
        cases = [HEADER+GOOD, HEADER+GOOD*2, HEADER+GOOD.replace('2024','2023'), HEADER+GOOD.replace('paid','pending'), HEADER+'A,2026-01-01\n', (ROOT/'examples/orders.csv').read_text(), HEADER+GOOD.replace('12.50','NaN'), HEADER+GOOD.replace('2024','0001')]
        for text in cases:
            run = subprocess.run([os.environ['NODE_BIN'], 'tests/browser_report.js'], cwd=ROOT, input=text, text=True, capture_output=True, check=True)
            self.assertEqual(validate(text), json.loads(run.stdout))

if __name__ == '__main__': unittest.main()
