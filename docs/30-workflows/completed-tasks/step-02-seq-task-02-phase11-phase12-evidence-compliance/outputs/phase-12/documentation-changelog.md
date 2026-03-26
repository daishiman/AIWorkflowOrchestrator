# Documentation Changelog

## current update

- corrective workflow の `outputs/phase-1` 〜 `outputs/phase-12`
- parent workflow の `phase-11-manual-test.md`
- parent workflow の `phase-12-documentation.md`
- parent workflow の `outputs/phase-11/*`
- parent workflow の `outputs/phase-12/*`
- parent / corrective の `artifacts.json`
- parent / corrective の `outputs/artifacts.json`

## baseline issue

- parent Phase 11 は TC-ID と review board evidence を持っていなかった
- parent Phase 12 は implementation guide validator 未達で、compliance も内容完了を見ていなかった

## validation

| コマンド                                                              | 結果                                                |
| --------------------------------------------------------------------- | --------------------------------------------------- |
| `validate-phase-output.js` for corrective workflow                    | PASS（32項目、error 0、warning 0）                  |
| `verify-all-specs.js --json` for corrective workflow                  | PASS（13/13 phases、errors 0、warnings 0、info 10） |
| `validate-phase-output.js` for parent workflow                        | PASS（32項目、error 0、warning 0）                  |
| `verify-all-specs.js --json` for parent workflow                      | PASS（13/13 phases、errors 0、warnings 0、info 2）  |
| `validate-phase11-screenshot-coverage.js --json` for parent workflow  | PASS（expected 3、covered 3）                       |
| `validate-phase12-implementation-guide.js --json` for parent workflow | PASS（10/10 checks）                                |
