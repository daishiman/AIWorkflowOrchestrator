# UT-EXEC-01 - scope-definition.md への execution-capability.ts パス追記

## メタ情報

```yaml
issue_number: 1421
```

## メタ情報

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| タスクID   | UT-EXEC-01                                                |
| タスク名   | scope-definition.md への execution-capability.ts パス追記 |
| 分類       | 完了済み duplicate reference                              |
| 出典       | Phase 10 MINOR-1                                          |
| 優先度     | high                                                      |
| 担当       | 未割当                                                    |
| ステータス | 完了（2026-03-27, duplicate source reference）            |
| 作成日     | 2026-03-20                                                |

## 目的

`scope-definition.md` の canonical doc set（D. Implementation Anchor 節）に `packages/shared/src/types/execution-capability.ts` を追加する。

この文書は `task-exec-scope-definition-path-update-001.md` と内容が重複するため、current wave では duplicate reference として保持し、新規未タスクとしては扱わない。

Phase 10 最終レビューにおいて MINOR-1 判定として検出された指摘事項。Implementation Anchor テーブルに execution-capability.ts が記載されておらず、canonical doc set として不完全な状態になっている。このファイルはワークフロー全体の実行責任契約の基盤型定義であるため、scope-definition.md に明示的に参照パスと目的を記録する必要がある。

## 実施内容

`scope-definition.md` の D. Implementation Anchor 節のテーブルに以下の行を追加する:

- ファイルパス: `packages/shared/src/types/execution-capability.ts`
- 参照目的: AI ランタイムの実行能力を表す 4 状態型定義（`AccessCapability`）および関連型のアンカー

## current status

- current workflow `docs/30-workflows/completed-tasks/task-exec-scope-definition-path-update-001/` で actual target correction と patch execution が完了した
- 本文中の related path `docs/30-workflows/ai-runtime-execution-responsibility-realignment/` は historical context であり、actual patch target は `docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/outputs/phase-1/scope-definition.md`
- 本ファイルは duplicate source reference として保持し、active backlog とは扱わない

## 完了条件

- [ ] `scope-definition.md` の Implementation Anchor テーブルに `execution-capability.ts` の行を追加している
- [ ] 追加行には参照目的（4 状態型定義のアンカー）が明記されている
- [ ] `scope-definition.md` の変更差分が canonical doc set として論理的に一貫している

## 関連タスク

- 親タスク: TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001
- 関連仕様: `docs/30-workflows/completed-tasks/task-exec-scope-definition-path-update-001/`
- 関連ファイル: `packages/shared/src/types/execution-capability.ts`
- 正本未タスク指示書: `docs/30-workflows/completed-tasks/unassigned-task/task-exec-scope-definition-path-update-001.md`
