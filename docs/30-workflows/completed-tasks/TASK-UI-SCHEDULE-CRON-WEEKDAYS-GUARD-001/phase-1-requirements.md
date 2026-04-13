# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 1                                        |
| 機能名 | TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 |
| 作成日 | 2026-04-12                               |

## 目的

`visualConfigToCron({ frequency: "weekly", weekdays: [], ... })` が `"0 9 * * "` のような
不正なcron式を出力する問題の要件を定義し、修正範囲・受入基準・依存関係を確定する。

---

## Step 0: P50チェック【必須】

Phase 1 開始前に、対象ファイルの実装状態を確認し、既実装コードとの重複・齟齬を防止する。

```bash
# visualConfigToCron 関数および weekdays フィールドの現状確認
grep -n "visualConfigToCron\|weekdays\|weekdayField" \
  apps/desktop/src/renderer/utils/cronConverter.ts

# 既存テストの空曜日ケース確認
grep -n "weekdays\|empty\|EMPTY\|\[\]" \
  apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts

# cronConverter 全体の export 確認
grep -n "export" \
  apps/desktop/src/renderer/utils/cronConverter.ts
```

**確認事項**:

- [ ] `cronConverter.ts` に `visualConfigToCron` 関数が存在すること
- [ ] `weekdays` フィールドが `frequency: "weekly"` ケースで使用されていること
- [ ] `weekdays: []` の場合にガード処理が未実装であること（現在は不正なcron式を出力する）
- [ ] `cronConverter.edge.test.ts` に空曜日ガード仕様がまだ反映されていないこと（未実装の証拠）

---

## 実行タスク

- **タスク1**: P50チェック — 対象ファイルの現状実装状態を確認
- **タスク2**: 問題の根本原因を特定・文書化
- **タスク3**: 修正スコープの確定（変更ファイル一覧・変更種別）
- **タスク4**: 受入基準（AC-1〜AC-5）の定義
- **タスク5**: 空文字退避方針の確認

---

## 参照資料

| 資料名                                          | パス                                                                                             | 説明                                |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------- |
| cronConverter 実装                              | `apps/desktop/src/renderer/utils/cronConverter.ts`                                               | 修正対象: `visualConfigToCron` 関数 |
| cronConverter エッジケーステスト                | `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts`                                    | テスト追加対象                      |
| TASK-UI-SCHEDULE-VISUAL-PICKER-001 Phase 12実装 | `docs/30-workflows/completed-tasks/TASK-UI-SCHEDULE-VISUAL-PICKER-001/phase-12-documentation.md` | 関連タスクの実装ガイド参照          |

---

## 実行手順

### ステップ1: 問題の現状確認

```bash
# 1. visualConfigToCron 関数の全体確認
cat apps/desktop/src/renderer/utils/cronConverter.ts

# 2. weekdays を扱う箇所を詳細確認
grep -n -A 10 "weekdays" \
  apps/desktop/src/renderer/utils/cronConverter.ts

# 3. 既存エッジケーステストの確認
cat apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts
```

**確認すべき事実**:

- `visualConfigToCron` 関数の `frequency: "weekly"` 分岐の実装
- `weekdays` 配列をcron式の曜日フィールドに変換するロジック
- `weekdays: []` のとき、曜日フィールドが空文字になりcron式が不正になること

### ステップ2: 問題の根本原因分析

**発生しているバグ**:

```
入力: visualConfigToCron({ frequency: "weekly", weekdays: [], hour: 9, minute: 0 })
出力: "0 9 * * "   ← 曜日フィールドが空（不正なcron式）
期待: 空文字 `""` を返す（不正なcron式を生成しない）
```

**根本原因**: `weekdays` 配列が空の場合のガード処理が未実装であること。

### ステップ3: 受入基準の確定

以下の受入基準を確定し、成果物として `outputs/phase-1/acceptance-criteria.md` に記録する。

**受入基準（AC-1〜AC-5）**:

| AC番号 | 基準                                                                                         | 検証方法              |
| ------ | -------------------------------------------------------------------------------------------- | --------------------- |
| AC-1   | `{ frequency: "weekly", weekdays: [] }` で不正なcron式（曜日フィールドが空）が生成されない   | テスト PASS           |
| AC-2   | 正常ケース（`weekdays` に値あり）は引き続き正しいcron式を生成する                            | テスト PASS           |
| AC-3   | 既存テスト全件が引き続き PASS であること                                                     | `pnpm test` PASS      |
| AC-4   | `cronConverter.edge.test.ts` に空曜日ケースの追加テストケースが存在すること                  | コードレビュー / grep |
| AC-5   | `cronConverter.ts` の `visualConfigToCron` 関数の JSDoc にガード処理仕様が記載されていること | コードレビュー        |

### ステップ4: スコープ確定

**変更ファイル（コード）**:

| ファイル                                           | 変更種別 | 変更内容                                                       |
| -------------------------------------------------- | -------- | -------------------------------------------------------------- |
| `apps/desktop/src/renderer/utils/cronConverter.ts` | 修正     | `visualConfigToCron` 関数に空weekdaysガード処理追加、JSDoc更新 |

**変更ファイル（テスト）**:

| ファイル                                                      | 変更種別 | 変更内容                         |
| ------------------------------------------------------------- | -------- | -------------------------------- |
| `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` | 修正     | 空曜日ケース（TC-01〜TC-06）追加 |

**スコープ外（変更しない）**:

- Renderer 側の他コンポーネント — 本タスクのスコープ外
- IPC 関連ファイル — `visualConfigToCron` は純粋関数のため影響なし
- `cronConverter.ts` の他関数（`visualConfigToCron` のみ修正）

### ステップ5: アプローチ比較

| アプローチ | 内容                                    | メリット                                                              | デメリット |
| ---------- | --------------------------------------- | --------------------------------------------------------------------- | ---------- |
| 採用方針   | `weekdays: []` のとき空文字 `""` を返す | UI 側の既存バリデーションと整合し、意図しない曜日への補完を避けられる |
| 不採用案1  | 例外をスローする                        | 呼び出し元に追加の例外処理が必要になり、今回のスコープを広げる        |
| 不採用案2  | 日曜（0）をフォールバックする           | 意図しないスケジュールを作るため、改善目的に反する                    |

**Phase 2 で設計を詳細化する**（Phase 1 では採用方針を固定し、理由を記録する）。

---

## 統合テスト連携

- `visualConfigToCron` は純粋関数のため、IPC 連携なし
- ガード処理の入出力契約（空文字退避）を Phase 2 設計に引き継ぐ
- テストシナリオ（TC-01〜TC-06）を Phase 4 テスト作成に引き継ぐ

---

## 多角的チェック観点（AIが判断）

### システム系

- **因果ループ**: `weekdays: []` → 曜日フィールド空 → 不正なcron式生成 → スケジューラが誤動作（または拒否）
- **責務境界**: ガード処理は `visualConfigToCron` 関数内（入力バリデーション層）が適切
- **状態所有権**: `weekdays` の検証責務は `visualConfigToCron` が所有。呼び出し元には委譲しない

### 価値・コスト系

- **価値**: 不正なcron式によるスケジューラ誤動作を防止できる
- **コスト**: 変更ファイル数は最小（1コード + 1テスト）。影響範囲は純粋関数のみ
- **トレードオフ**: 空文字退避は安全だが、呼び出し元が空文字を無効入力として扱う前提を維持する必要がある

### 問題解決系

- **優先順位**: AC-1（不正なcron式の防止）が最重要
- **リスク**: 空文字退避の契約を Phase 2 で明文化しないと、Phase 4 以降のテスト期待値がぶれる

---

## サブタスク管理

| ID     | タスク名                   | 担当 | ステータス |
| ------ | -------------------------- | ---- | ---------- |
| T-01-1 | P50チェック                | -    | 未実施     |
| T-01-2 | 問題の根本原因文書化       | -    | 未実施     |
| T-01-3 | スコープ確定               | -    | 未実施     |
| T-01-4 | 受入基準定義（AC-1〜AC-5） | -    | 未実施     |
| T-01-5 | 空文字退避方針の確認       | -    | 未実施     |

---

## 成果物

| 成果物               | 配置先                                   | 形式     |
| -------------------- | ---------------------------------------- | -------- |
| 受入基準ドキュメント | `outputs/phase-1/acceptance-criteria.md` | Markdown |
| P50チェック結果      | `outputs/phase-1/p50-check-result.md`    | Markdown |
| スコープ定義書       | `outputs/phase-1/scope-definition.md`    | Markdown |

---

## 完了条件

- [ ] P50チェックを実行し、対象ファイルの現状実装状態が確認済みであること
- [ ] `cronConverter.ts` の `visualConfigToCron` 関数に空weekdaysガード処理が未実装であることを確認済みであること
- [ ] `weekdays: []` のとき不正なcron式が出力されることを確認済みであること
- [ ] 受入基準 AC-1〜AC-5 が全て定義・文書化されていること
- [ ] 変更対象ファイル一覧（コード1種 + テスト1種）が確定していること
- [ ] `outputs/phase-1/` に全成果物が生成されていること

---

## タスク100%実行確認【必須】

Phase 1 完了時に以下を確認して記録すること:

- [ ] T-01-1: P50チェック実行済み
- [ ] T-01-2: 問題の根本原因を `outputs/phase-1/p50-check-result.md` に記録済み
- [ ] T-01-3: スコープを `outputs/phase-1/scope-definition.md` に記録済み
- [ ] T-01-4: 受入基準 AC-1〜AC-5 を `outputs/phase-1/acceptance-criteria.md` に記録済み
- [ ] T-01-5: 空文字退避方針を `outputs/phase-1/scope-definition.md` に記録済み

---

## 次Phase

**Phase 2: 設計** — 空文字退避方針の詳細設計を行い、`visualConfigToCron` 関数の変更前/後の差分を設計する。

**ゲート条件**: Phase 1 の全完了条件を満たさない場合、Phase 2 へ進まないこと。
