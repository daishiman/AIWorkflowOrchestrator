# TASK-CONFLICT-PREVENT-001: Phase 7 カバレッジマトリクス

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| タスクID   | TASK-CONFLICT-PREVENT-001 |
| Phase      | 7                         |
| 作成日     | 2026-04-18                |
| ステータス | completed                 |

## AC × TC 対応表

| AC   | 内容                                                                                      | 対応 TC / 手法                   | 判定    | 備考                                                  |
| ---- | ----------------------------------------------------------------------------------------- | -------------------------------- | ------- | ----------------------------------------------------- |
| AC-1 | 13 phase 骨格が task-specification-creator 必須セクションを満たす                         | validator (verify-all-specs.js)  | PASS    | errors:0, warnings:約10, passed:true                  |
| AC-2 | generated / mirror / log / metadata の 4 分類が混同なく定義される                         | document review (Phase 2 design) | PASS    | 各分類の policy が Phase 2 で一本化済み               |
| AC-3 | merge=ours を使う箇所は custom merge driver 登録前提で記述し Git 組み込み仕様と矛盾しない | TC-4-01 (.gitattributes 検証)    | PASS    | `merge=ours` → `custom keep-ours driver` で実装済み   |
| AC-4 | .claude canonical / .agents mirror の方針が Phase 2/5/9/12 で一貫する                     | TC-4-04 (parity diff)            | PARTIAL | LOGS.md, keywords.json 等に差分残存。follow-up 化済み |
| AC-5 | topic-map.md の date diff 増幅要因に deterministic 対策があり行番号索引契約は維持される   | TC-4-03 (regenerate grep)        | PASS    | 日付ヘッダ除去済み・行番号索引維持確認済み            |
| AC-6 | EVALS の schema はこの task で変更しない                                                  | TC-4-05 (schema diff)            | PASS    | schema 不変・JSON 向け merge policy のみ適用          |
| AC-7 | Phase 13 は user approval 取得まで blocked を維持する                                     | artifacts / phase-13 review      | PASS    | index.md / artifacts.json で blocked 維持確認         |

## 競合分類 × coverage

| 競合分類                                             | command                                | 判定    | 状態                                  |
| ---------------------------------------------------- | -------------------------------------- | ------- | ------------------------------------- |
| G1: generated index (keywords.json, topic-map.md 等) | rg "自動生成:" / regenerate            | PASS    | 日付除去済み・行番号索引維持          |
| G2: mirror tree (.agents/skills/\*\*)                | diff -qr .claude/skills .agents/skills | PARTIAL | 差分残存（follow-up）                 |
| G3: append-only log (LOGS.md)                        | merge simulation (union 動作確認)      | PASS    | union policy 設計済み                 |
| G4: volatile metadata (EVALS.json)                   | schema diff                            | PASS    | schema 不変・follow-up audit 登録済み |

## 判定サマリー

| 分類                     | 件数 |
| ------------------------ | ---- |
| PASS                     | 6    |
| PARTIAL (follow-up 済み) | 1    |
| FAIL                     | 0    |

## 接続先

- gap-list.md: 未到達 gap の詳細
- traceability-report.md: 要件→設計→テスト→実装の縦断対応
- Phase 9 quality-report.md: validator 実測結果の正本
