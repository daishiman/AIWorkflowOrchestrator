# TASK-TSC-VERIFICATION-PHASE5-MODE-001

## メタ情報

```yaml
issue_number: 2273
```

## メタ情報

| 項目       | 値                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------- |
| タスクID   | TASK-TSC-VERIFICATION-PHASE5-MODE-001                                                          |
| 機能名     | tsc-verification-phase5-mode                                                                   |
| ステータス | open（未着手）                                                                                 |
| 作成日     | 2026-04-18                                                                                     |
| 親タスク   | なし                                                                                           |
| 優先度     | Low                                                                                            |
| タスク種別 | docs/skill-improvement（スキル改善）                                                           |
| 関連Issue  | #2273                                                                                          |
| ソース     | FB-TSC-001（TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001 Phase 12 skill-feedback-report） |

## 概要

`task-specification-creator` スキルの Phase 5 仕様書において、Phase 1 結論が「実装充足済み（E-1）」の場合の no-op 判定フローが明示されていない。verification task で Phase 5 を実施する際に「差分確認・最小修正」が必須か no-op でよいかの判断が暗黙になっており、実施者が迷う原因になっている。

Phase 1 結論に基づく分岐（新規実装 vs. no-op）を Phase 5 の冒頭に明示化し、verification task の close-out フローを標準化する。

## スコープ

### 含む

- `task-specification-creator` スキルの Phase 5 仕様書への分岐説明追加
- 「Phase 1 結論が E-1（実装充足済み）の場合、Step 1 差分確認のみで完了」の明示
- Phase 5 no-op 記録をテンプレートの標準パターンとして追加

### 含まない

- Phase 5 以外のフェーズへの変更
- task-specification-creator スキルのアーキテクチャ変更
- 既存の実装タスク向け Phase 5 仕様の変更

## 受入基準

| ID   | 基準                                                                                |
| ---- | ----------------------------------------------------------------------------------- |
| AC-1 | Phase 5 の冒頭に「Phase 1 結論に基づく分岐」が明示されている                        |
| AC-2 | 「実装充足済み（no-op）」パスで Step 1 差分確認のみで完了できることが記述されている |
| AC-3 | Phase 5 no-op 記録サンプルがテンプレートに存在する                                  |

## 苦戦箇所（発見元コンテキスト）

`TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001` の実装時に判明した課題:

1. **verification task での暗黙判断**: Phase 5 の仕様書は「差分確認・最小修正」と書かれているが、Phase 1 で「current branch が既に仕様充足」と判定した場合に no-op でよいことが不明瞭だった。実施者が「何かを実装しなければならない」という誤解を持ちやすい。
2. **解決策**: Phase 5 冒頭に明示的な分岐説明を追加することで、verification task でのフェーズ実施判断を一元化する。適用タイミングはタスク種別が `verification` または Phase 1 結論に `E-1（実装充足済み）` が含まれる場合。
