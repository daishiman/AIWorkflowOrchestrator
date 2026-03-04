# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 4                                                 |
| 機能名     | TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001       |
| タスク名   | 重複インポート時の冪等性保証と不要IPC呼び出し抑止 |
| 前提Phase  | Phase 3                                           |
| 後続Phase  | 実装                                              |
| 作成日     | 2026-03-04                                        |
| ステータス | completed                                         |

## 目的

失敗するテストを先に作成し、期待動作を固定化する。

## 背景

既存実装では再インポート要求が繰り返し Main に到達し、冪等成功であっても無駄なIPC/ログ発生が残っていた。

## SubAgent分担

| SubAgent | 担当                                   |
| -------- | -------------------------------------- |
| A        | IPC Handler（`skill:import` 冪等契約） |
| B        | Renderer Store（再インポート抑止）     |
| C        | 回帰テスト設計・Phase 12仕様同期       |

## 実行タスク

- 単体テスト作成: 主要失敗パターンを Red で固定化する
- 契約テスト作成: IPC/Store/Hook の境界条件を定義する
- 回帰テスト雛形: 既知不具合を再現するケースを追加する

## 参照資料

| 参照資料           | パス                                         | 説明           |
| ------------------ | -------------------------------------------- | -------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物 |
| スコープ定義       | `outputs/phase-1/scope-definition.md`        | Phase 1 成果物 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     | Phase 2 成果物 |
| API仕様            | `outputs/phase-2/api-specification.md`       | Phase 2 成果物 |
| 状態設計           | `outputs/phase-2/state-design.md`            | Phase 2 成果物 |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md`    | Phase 3 成果物 |
| レビューゲート判定 | `outputs/phase-3/review-gate-decision.md`    | Phase 3 成果物 |

## テスト対象ファイル（差分追跡）

| 区分       | ファイル                                                                                | 観点                                                    |
| ---------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| IPC Test   | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                             | importedCount=0 でも成功扱いとなる冪等契約を Red で固定 |
| Store Test | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts` | 既存インポート済み時に IPC を呼ばないことを Red で固定  |
| Target     | `apps/desktop/src/main/ipc/skillHandlers.ts`                                            | `skill:import` 戻り値条件の見直し                       |
| Target     | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                  | 再インポート早期returnの振る舞い                        |

## 実行手順

1. 参照資料を確認して判断根拠を固定する。
2. 実行タスクを順に処理し、成果物へ反映する。
3. 完了条件を検証し、次Phaseへ引き継ぐ。

## 統合テスト連携（Phase 1〜11）

- Main/Preload/Renderer の接続点を明示してテスト観点へ反映する。
- 不具合再現条件を自動テストと手動テスト双方へ引き継ぐ。

## 多角的チェック観点（AIが判断）

| 観点               | 確認内容                         | 参照仕様                   |
| ------------------ | -------------------------------- | -------------------------- |
| セキュリティ       | sender検証・入力検証・境界防御   | security-\*.md             |
| UI/UX              | 表示崩れ・導線・アクセシビリティ | ui-ux-\*.md                |
| アーキテクチャ     | 責務分離と依存方向               | architecture-\*.md         |
| API/IPC            | 引数・戻り値・エラー契約         | api-_.md / interfaces-_.md |
| エラーハンドリング | 例外分類と利用者通知             | error-handling.md          |

## 成果物

| 成果物           | パス                                    | 内容           |
| ---------------- | --------------------------------------- | -------------- |
| テスト仕様書     | `outputs/phase-4/test-specification.md` | Redケース定義  |
| テストケース一覧 | `outputs/phase-4/test-cases.md`         | 単体/契約/回帰 |

## 完了条件

- [x] 実行タスクの成果物が定義されている
- [x] 参照仕様との整合根拠を記録した
- [x] 次Phaseへの引き継ぎ事項を記録した
- [x] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] Phase内で定義した成果物を全件記録
- [x] 引き継ぎ事項を明記

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001
```

## Phase実行記録

| 項目         | 記録                               |
| ------------ | ---------------------------------- |
| 実行タスク   | 完了                               |
| 発見事項     | 主要課題は仕様化済み・追加阻害なし |
| 引き継ぎ事項 | 次Phaseへ成果物を引き継ぎ済み      |

## 次のPhase

Phase 5 実装
