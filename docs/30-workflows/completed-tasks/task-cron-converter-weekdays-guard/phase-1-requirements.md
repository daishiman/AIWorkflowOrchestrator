# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 1                                        |
| タスクID   | TASK-CRON-CONVERTER-WEEKDAYS-GUARD-001   |
| 機能名     | cronConverter weekdays=[] ガード処理追加 |
| 作成日     | 2026-04-12                               |
| ステータス | completed                                |

## 目的

`visualConfigToCron()` が `weekdays: []` を受け取った場合の不正 cron 式生成を防ぎ、API 契約を堅牢にする。影響範囲を確定し、受け入れ基準を固定する。

## P50チェック: 既実装状態の調査

```bash
# cronConverter.ts の現在の実装確認
cat apps/desktop/src/renderer/utils/cronConverter.ts

# 既存テストの確認
ls apps/desktop/src/renderer/utils/__tests__/

# InvalidConfigError の既存定義確認
grep -r "InvalidConfigError" apps/desktop/src/

# weekdays のバリデーション実装確認
grep -r "weekdays" apps/desktop/src/renderer/utils/cronConverter.ts
```

**調査結果**: `cronConverter.ts` の `visualConfigToCron()` に `weekdays: []` を渡すと `"0 9 * * "` が生成される（5フィールド構文違反）。UI レベル（VisualCronPicker）でのバリデーションは実装済みだが、`cronConverter.ts` 側にはガードが存在しない。

## 機能要件 (FR)

### FR-01: weekdays=[] ガード処理

| 項目             | 内容                                                      |
| ---------------- | --------------------------------------------------------- |
| 対象関数         | `visualConfigToCron()` in `cronConverter.ts`              |
| トリガー条件     | `frequency === "weekly"` かつ `weekdays` が空配列（`[]`） |
| 期待動作         | `InvalidConfigError` をスローする                         |
| エラーメッセージ | `"weekdays must not be empty when frequency is 'weekly'"` |

### FR-02: 既存の正常系維持

| 入力                        | 期待出力                  |
| --------------------------- | ------------------------- |
| `weekdays: [0]`             | `"0 9 * * 0"`             |
| `weekdays: [1,2,3,4,5]`     | `"0 9 * * 1,2,3,4,5"`     |
| `weekdays: [0,1,2,3,4,5,6]` | `"0 9 * * 0,1,2,3,4,5,6"` |

### FR-03: JSDoc 更新

`visualConfigToCron()` の JSDoc に `@throws {InvalidConfigError}` の記述を追加する。

## 非機能要件 (NFR)

### NFR-01: 単一責任原則

- `cronConverter.ts` 自身がガードの責任を持つこと（UI バリデーションに依存しない）
- `InvalidConfigError` は既存の Error クラス体系に従うこと

### NFR-02: テスト可能性

- ガード処理は純粋関数として実装し、単体テストが容易であること

## 受け入れ基準 (AC)

- AC-01: `weekdays: []` を渡した場合に `InvalidConfigError` がスローされること
- AC-02: `weekdays: [0]` を渡した場合に `"0 9 * * 0"` が返ること
- AC-03: `weekdays: [1,2,3,4,5]` を渡した場合に `"0 9 * * 1,2,3,4,5"` が返ること
- AC-04: `weekdays: [0,1,2,3,4,5,6]` を渡した場合に `"0 9 * * 0,1,2,3,4,5,6"` が返ること
- AC-05: `InvalidConfigError` に適切なエラーメッセージが含まれること
- AC-06: JSDoc に `@throws InvalidConfigError` の記述が追加されること

> AC-01〜06 は以後の Phase の唯一の比較基準とし、後続 Phase では原則として番号参照のみを行う。

## スコープ

### 含む

- `apps/desktop/src/renderer/utils/cronConverter.ts` へのガード追加
- `InvalidConfigError` クラスの定義（既存クラスがあれば再利用、なければ新規定義）
- テストケース追加（`weekdays: []` / `weekdays: [0]` / `weekdays: [0,1,2,3,4,5,6]` など）
- JSDoc の `@throws InvalidConfigError` 追記

### 含まない

- UI レベル（VisualCronPicker）のバリデーション変更
- cron セマンティクスの包括的な検証（TASK-CRON-SEMANTIC-VALIDATION-001 の対象）
- `weekdays` の値範囲バリデーション（0-6 範囲外等）

## 関連ファイル一覧

| ファイル                                                             | 責務              | 修正要否         |
| -------------------------------------------------------------------- | ----------------- | ---------------- |
| `apps/desktop/src/renderer/utils/cronConverter.ts`                   | cron 変換ロジック | 要               |
| `apps/desktop/src/renderer/utils/__tests__/cronConverter.test.ts`    | テスト            | 要（追加）       |
| `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx` | UI バリデーション | 不要（確認のみ） |

## 参照資料

| 資料名             | パス                                                                 | 内容                  |
| ------------------ | -------------------------------------------------------------------- | --------------------- |
| GitHub Issue #2081 | https://github.com/daishiman/AIWorkflowOrchestrator/issues/2081      | タスク詳細・背景      |
| cronConverter.ts   | `apps/desktop/src/renderer/utils/cronConverter.ts`                   | 修正対象ファイル      |
| VisualCronPicker   | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx` | UI バリデーション参考 |

## 成果物

| 成果物       | パス                                         | 説明                 |
| ------------ | -------------------------------------------- | -------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 検証可能な AC 一覧   |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 含む/含まない一覧    |

## 完了条件

- [ ] 全機能要件が明文化されている
- [ ] 受け入れ基準が検証可能な形式で定義されている
- [ ] スコープの含む/含まないが明確に区分されている
- [ ] 関連ファイル一覧が特定されている
- [ ] `InvalidConfigError` の既存定義有無が確認されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 2: 設計
