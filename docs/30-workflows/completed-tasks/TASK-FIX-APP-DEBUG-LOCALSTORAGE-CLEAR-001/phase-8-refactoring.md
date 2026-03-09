# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 |
| Phase      | 8                                         |
| Phase名    | リファクタリング                          |
| カテゴリ   | fix                                       |
| ステータス | completed                                 |
| 前提Phase  | Phase 7                                   |
| 後続Phase  | Phase 9                                   |

## 目的

デバッグコード削除後の App.tsx のコード品質を確認し、品質差分が見つかった場合に限りリファクタリングを行う。

## 実行タスク

- タスク1: 削除後コードの品質差分を確認する
- タスク2: 差分がある箇所だけを修正し、スコープ外拡張を防ぐ
- タスク3: 残存 `console.log` を未タスク候補として判定する

### タスク1: コード品質確認

**目的**: 削除後のコードが品質基準を満たしているか確認する

**チェック項目**:

| 項目           | 確認内容                                   | 判定         |
| -------------- | ------------------------------------------ | ------------ |
| 不要な空行     | 削除箇所に連続空行が残っていないか         | (実行時記入) |
| コメント整合性 | 残存コメントが削除コードを参照していないか | (実行時記入) |
| import 整理    | 未使用 import が残っていないか             | (実行時記入) |
| コード構造     | App 関数の構造が自然な流れか               | (実行時記入) |

### タスク2: リファクタリング実施（品質差分が見つかった場合のみ）

**目的**: 品質上の問題があれば修正する

**手順**:

1. タスク1のチェック結果に基づき、修正が必要な箇所を特定
2. 修正を実施
3. テストが全て PASS することを確認

**注意**: 本タスクのスコープは「デバッグコード削除」に限定する。App.tsx 全体のリファクタリングはスコープ外。

### タスク3: L72 の console.log 確認

**目的**: 残存する `console.log("🔍 [App] Initializing auth...")` がデバッグ出力かどうかを確認する

**手順**:

1. L72 の `console.log` が開発ログとして意図的に残されているか判断
2. 本タスクのスコープ外であるため、削除が必要な場合は未タスクとして記録

**判断**: スコープ外（Auth 初期化のログであり、デバッグ用 localStorage.clear() とは無関係）

## 参照資料

| 参照資料       | パス                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| Phase 1 成果物 | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-1-requirements.md`   |
| Phase 2 成果物 | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-2-design.md`         |
| Phase 5 成果物 | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-5-implementation.md` |
| Phase 6 成果物 | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-6-test-expansion.md` |
| Phase 7 成果物 | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-7-coverage-check.md` |
| App.tsx        | `apps/desktop/src/renderer/App.tsx`                                                                     |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                          | 内容                                 |
| ---------------- | ----------------------------------------------------------------------------- | ------------------------------------ |
| 開発ガイドライン | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | コード品質基準・リファクタリング指針 |
| 教訓集           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`        | デバッグコード残置と再監査時の扱い   |

## 統合テスト連携

- リファクタリング後に全テスト PASS を確認
- Phase 9 で品質検証を実施

## 成果物

| 成果物                 | パス                                    |
| ---------------------- | --------------------------------------- |
| リファクタリング報告書 | `outputs/phase-8/refactoring-report.md` |

## 完了条件

- [ ] コード品質チェックが完了していること
- [ ] 必要なリファクタリングが実施されていること（または不要と判断されていること）
- [ ] 全テストが PASS すること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 9: 品質検証へ進む。
