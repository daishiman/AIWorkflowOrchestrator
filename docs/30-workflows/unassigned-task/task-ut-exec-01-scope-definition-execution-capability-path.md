# UT-EXEC-01 - scope-definition.md への execution-capability.ts パス追記

## メタ情報

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| タスクID   | UT-EXEC-01                                                |
| タスク名   | scope-definition.md への execution-capability.ts パス追記 |
| 分類       | 未タスク（unassigned）                                    |
| 出典       | Phase 10 MINOR-1                                          |
| 優先度     | high                                                      |
| 担当       | 未割当                                                    |
| ステータス | 未着手                                                    |
| 作成日     | 2026-03-20                                                |

## 目的

`scope-definition.md` の canonical doc set（D. Implementation Anchor 節）に `packages/shared/src/types/execution-capability.ts` を追加する。

Phase 10 最終レビューにおいて MINOR-1 判定として検出された指摘事項。Implementation Anchor テーブルに execution-capability.ts が記載されておらず、canonical doc set として不完全な状態になっている。このファイルはワークフロー全体の実行責任契約の基盤型定義であるため、scope-definition.md に明示的に参照パスと目的を記録する必要がある。

## 実施内容

`scope-definition.md` の D. Implementation Anchor 節のテーブルに以下の行を追加する:

- ファイルパス: `packages/shared/src/types/execution-capability.ts`
- 参照目的: AI ランタイムの実行能力を表す 4 状態型定義（`AccessCapability`）および関連型のアンカー

## 完了条件

- [ ] `scope-definition.md` の Implementation Anchor テーブルに `execution-capability.ts` の行を追加している
- [ ] 追加行には参照目的（4 状態型定義のアンカー）が明記されている
- [ ] `scope-definition.md` の変更差分が canonical doc set として論理的に一貫している

## 関連タスク

- 親タスク: TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001
- 関連仕様: `docs/30-workflows/ai-runtime-execution-responsibility-realignment/`
- 関連ファイル: `packages/shared/src/types/execution-capability.ts`
