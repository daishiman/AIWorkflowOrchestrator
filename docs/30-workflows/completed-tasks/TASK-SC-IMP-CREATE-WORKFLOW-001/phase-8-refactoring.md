# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 8                               |
| Phase名    | リファクタリング                |
| 対象機能   | TASK-SC-IMP-CREATE-WORKFLOW-001 |
| 前提Phase  | Phase 7: カバレッジ確認         |
| 次Phase    | Phase 9: 品質保証               |
| ステータス | pending                         |
| 作成日     | 2026-04-14                      |

## 目的

`runCreateWorkflow` の戻り型変更後の重複・説明不足・命名の揺れを整理し、
必要最小限の複雑性でmaintainabilityを向上させる。

## 実行タスク

### Task 1: 型定義の整理

- `runCreateWorkflow` の戻り型 `StructurePlanJson | null` がインライン定義か `@repo/shared/types` への移行かを判断する
- インライン定義を選択する場合はファイル先頭にまとめ、型名の一貫性を確認する
- `@repo/shared/types` へ移行する場合は他パッケージへの影響範囲を事前確認し、Phase 9のlint/typecheckで検証する
- `StructurePlanJson` 型のフィールド定義（`skillName`・`description`・`phases`等）が仕様と一致していることを確認する

### Task 2: switch文の可読性確認

- `createSkill()` のswitch文における `case "create"` のコードブロックが単一責務を持つことを確認する
- `runCreateWorkflow` の呼び出しと戻り値の受け取りが1〜3行程度で記述されていることを確認する
- `void options` コメントの削除後に `options.description` が実際に使用されていることを確認する
- switch文のfall-throughやdefaultケースの挙動が意図通りであることを確認する

### Task 3: loadAgentパターンの統一

- `resourceLoader.loadAgent` の呼び出しパターンが既存の collaborative モードと一致していることを確認する
- エラーハンドリング（try/catch）の書き方が既存パターンと統一されていることを確認する
- `loadAgent` 失敗時のログ出力が他の失敗ケースと命名・レベルが一致していることを確認する

## 参照資料

| 資料名             | パス                                      | 説明                       |
| ------------------ | ----------------------------------------- | -------------------------- |
| 要件定義           | `outputs/phase-1/requirements.md`         | 守るべきAC                 |
| 設計書             | `outputs/phase-2/design.md`               | 修正原則                   |
| 実装計画           | `outputs/phase-5/implementation-plan.md`  | 整理対象の本体             |
| テスト拡充記録     | `outputs/phase-6/extended-test-record.md` | 壊してはいけない境界ケース |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`      | 重複削減候補               |

## 統合テスト連携

- リファクタ後も `runCreateWorkflow` のテストの観測点を変えない
- 型定義の移動がテストの import パスを壊していないことを確認する

## 成果物

| 成果物               | パス                                    | 説明       |
| -------------------- | --------------------------------------- | ---------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md` | 簡素化判断 |

## 完了条件

- [ ] 型定義の配置先（インライン vs 共有）が決定・記録されている
- [ ] switch文のcase "create"の可読性が確認されている
- [ ] loadAgentパターンが既存コードと統一されている
- [ ] 最小複雑性の判断理由が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 9: 品質保証](./phase-9-quality-assurance.md)
