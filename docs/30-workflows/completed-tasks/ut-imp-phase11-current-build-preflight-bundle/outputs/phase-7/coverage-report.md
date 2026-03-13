# Phase 7 カバレッジ確認レポート

## ケース充足状況

| ケース                | 充足 | 根拠                                              |
| --------------------- | ---- | ------------------------------------------------- |
| success path          | 充足 | `preflight-report.json`, screenshot 5件, metadata |
| native mismatch       | 充足 | core unit test                                    |
| build missing         | 充足 | `failure-build-missing.json`                      |
| harness missing       | 充足 | `failure-harness-missing.json`                    |
| baseUrl unreachable   | 充足 | `failure-baseurl-unreachable.json`                |
| CLI `--json`          | 充足 | CLI test                                          |
| CLI `--write`         | 充足 | CLI test                                          |
| CLI `--base-url`      | 充足 | CLI test                                          |
| CLI `--no-auto-serve` | 充足 | CLI test + manual fail JSON                       |
| no-duplication        | 充足 | source assertion test                             |

## 判定

- success + 4 failure bucket: 充足
- CLI option matrix: 充足
- shared core / wrapper / capture consumer の境界: 充足
