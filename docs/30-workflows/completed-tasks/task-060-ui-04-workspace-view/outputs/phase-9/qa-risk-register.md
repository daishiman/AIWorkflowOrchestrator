# Phase 9 QA Risk Register

## risks

| ID    | 重要度 | リスク                                                                  | 対応                                                |
| ----- | ------ | ----------------------------------------------------------------------- | --------------------------------------------------- |
| QA-01 | 中     | system spec の 04B canonical path が current path で残る                | Phase 12 で `.claude` 正本と mirror root を同期     |
| QA-02 | 低     | parent task が docs-only であることを見落とし、新規 screenshot を求める | Phase 11 で N/A 理由と child evidence 継承を明記    |
| QA-03 | 低     | dual root の mirror drift                                               | Phase 12 で `diff -qr` を実行し、必要ファイルを同期 |

## 総評

実装修正は docs に限定されており、主リスクは system spec 同期漏れに集約される。
