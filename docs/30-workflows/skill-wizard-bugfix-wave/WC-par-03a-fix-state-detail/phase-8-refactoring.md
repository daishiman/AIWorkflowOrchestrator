# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 8                            |
| Phase名    | リファクタリング             |
| 対象機能   | TASK-SW-FIX-STATE-DETAIL-001 |
| 前提Phase  | Phase 7: カバレッジ確認      |
| 次Phase    | Phase 9: 品質保証            |
| ステータス | pending                      |
| 作成日     | 2026-04-12                   |

## 目的

4件の修正後の重複・説明不足・命名の揺れを整理し、
必要最小限の複雑性でmaintainabilityを向上させる。

## 実行タスク

### Task 1: 命名整理

- `internalAnswers`・`answers`・`initialAnswers`等の命名が混在していないことを確認し、統一する
- `handleCancelTemplateGeneration`等のハンドラー名がコンポーネント内の命名規則と一致していることを確認する
- `generationLockRef`の関連変数名が一貫していることを確認する

### Task 2: useEffect依存配列の整理

- 追加した依存配列が最小限であることを確認する
- 不要な依存（lintの警告を回避するために追加された無関係な変数）がないことを確認する
- exhaustive-depsルールへの準拠を確認する

### Task 3: ロジック重複の除去

- `resolveExternalIntegration`の呼び出し箇所が重複していないことを確認する
- `generationLockRef`のリセット処理が複数箇所に散在していないことを確認する
- 共通化できる処理があれば抽出する

## 参照資料

| 資料名             | パス                                         | 説明                       |
| ------------------ | -------------------------------------------- | -------------------------- |
| 要件定義           | `outputs/phase-1/requirements-definition.md` | 守るべきAC                 |
| 設計書             | `outputs/phase-2/design-document.md`         | 修正原則                   |
| 実装記録           | `outputs/phase-5/implementation-record.md`   | 整理対象の本体             |
| テスト拡充記録     | `outputs/phase-6/extended-test-record.md`    | 壊してはいけない境界ケース |
| カバレッジレポート | `phase-7-coverage-check.md`                  | 重複削減候補               |

## 統合テスト連携

- リファクタ後も4件のバグ検出テストの観測点を変えない
- 命名整理がテストのexpectationを壊していないことを確認する

## 成果物

| 成果物               | パス                                    | 説明       |
| -------------------- | --------------------------------------- | ---------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md` | 簡素化判断 |

## 完了条件

- [ ] 命名と責務が整理されている
- [ ] useEffect依存配列が最小限である
- [ ] ロジック重複が除去されている
- [ ] 最小複雑性の判断理由が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 9: 品質保証](./phase-9-quality-assurance.md)
