# Phase 7 Output: カバレッジマトリクス

## AC × TC 対応表

| AC   | 内容                                 | 対応 TC                               | 判定                              |
| ---- | ------------------------------------ | ------------------------------------- | --------------------------------- |
| AC-1 | 13 phase 骨格                        | validator                             | PASS（errors:0）                  |
| AC-2 | 4分類設計（G1/G2/G3/G4）             | Phase 2 merge-policy-matrix + TC-4-02 | PASS                              |
| AC-3 | custom driver と built-in の混同なし | TC-4-01 + TC-4-05                     | PASS                              |
| AC-4 | canonical/mirror 一貫性              | TC-4-04                               | PARTIAL（full sync は follow-up） |
| AC-5 | deterministic topic-map              | TC-4-03                               | PASS（日付除去・行番号維持）      |
| AC-6 | EVALS schema 不変                    | TC-4-05 + consumer-audit-decision.md  | PASS                              |

## conflict class × command 対応表

| クラス               | policy                  | 検証コマンド      | 状態              |
| -------------------- | ----------------------- | ----------------- | ----------------- |
| G1 generated index   | merge=ours              | regenerate + grep | PASS              |
| G2 mirror tree       | merge=ours              | diff -qr          | PARTIAL follow-up |
| G3 append-only log   | merge=union             | union merge test  | PASS（設計）      |
| G4 volatile metadata | merge=ours (schema不変) | schema key check  | PASS              |
