# UT-STATUSBADGE-MAPPING-3VALUES-001 StatusBadge マッピング仕様への新3値追加

## メタ情報

| 項目         | 内容                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| タスクID     | UT-STATUSBADGE-MAPPING-3VALUES-001                                          |
| タスク名     | StatusBadge の色/ラベルマッピングに review/improve_ready/reuse_ready を追加 |
| 分類         | 仕様書更新                                                                  |
| 対象機能     | DisplayableStatus / StatusBadge コンポーネント                              |
| 優先度       | 中                                                                          |
| 見積もり規模 | 小規模                                                                      |
| ステータス   | 完了（2026-03-20, same-wave spec sync）                                     |
| 発見元       | UT-LIFECYCLE-EXECUTION-STATUS-TYPE-SPEC-SYNC-001 Phase 12                   |
| 発見日       | 2026-03-20                                                                  |
| Issue番号    | #1406                                                                       |

## 1. なぜこのタスクが必要か

### 1.1 背景

SkillExecutionStatus に review / improve_ready / reuse_ready が追加されたことで、`DisplayableStatus = Exclude<SkillExecutionStatus, 'idle'>` に新3値が自動的に含まれる。StatusBadge コンポーネントの色/ラベルマッピング仕様（ui-ux-feature-components-advanced.md）に新値の定義が必要。

### 1.2 問題点

- StatusBadge の variantStyles Record に新3値のエントリが存在しない
- exhaustive check（`Record<DisplayableStatus, string>` パターン）がコンパイルエラーになる可能性がある

### 1.3 放置した場合の影響

- StatusBadge コンポーネントで新ステータスが未定義のまま表示される（fallback 表示）
- TypeScript の exhaustive check が機能しなくなる

### 1.4 解消結果

2026-03-20 の same-wave spec sync で以下を反映済み:

- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-advanced.md`
  に `review` / `improve_ready` / `reuse_ready` の色・ラベル・用途を追加
- `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx`
  の `STATUS_CONFIG` 実装、および `SkillStreamingView.test.tsx` 36テスト PASS を再確認

## 2. 何を達成するか

### 2.1 目的

ui-ux-feature-components-advanced.md の StatusBadge マッピングテーブルに review / improve_ready / reuse_ready の色とラベルを追記し、exhaustive check パターンの仕様を更新する。

### 2.2 スコープ

| 含まれるもの                              | 含まれないもの                       |
| ----------------------------------------- | ------------------------------------ |
| StatusBadge マッピングテーブルへの3値追加 | StatusBadge コンポーネントの実装変更 |
| exhaustive check パターンの仕様更新       | テストコードの追加                   |
| Apple HIG カラーパレット準拠の色定義      | 他コンポーネントの変更               |

## 3. どのように実現するか

### 3.1 実装手順

1. `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-advanced.md` の StatusBadge マッピングテーブルに以下を追加:
   - `review`: レビュー中（`bg-purple-500`）
   - `improve_ready`: 改善準備完了（`bg-orange-500`）
   - `reuse_ready`: 再利用準備完了（`bg-teal-500`）
2. exhaustive check パターンの Record 型定義に新3値を含める
3. `permission_pending` の表示ラベルを `権限確認中` に合わせて仕様書も更新する

### 3.2 苦戦箇所の教訓

#### P3/P58 再発（未タスク指示書の3ステップ省略）

本未タスクは当初「Task12スコープ内で対応可能なため省略」と判断されたが、P3（未タスク管理の3ステップ不完全）とP58（設計タスクにおける未タスク指示書の配置省略）に該当した。

- **原因**: 「Task12のスコープ内」という理由で独立指示書の作成を省略した
- **教訓**: P3の3ステップ（(1)指示書作成 -> (2)残課題テーブル登録 -> (3)関連仕様書リンク追加）に例外はない
- **対策**: 検出した未タスクは件数に関わらず必ず3ステップを完了する

## 4. 受入基準

- [x] StatusBadge のマッピングテーブルに3値の色/ラベルが定義されている
- [x] テーブル内容が Tailwind utility 契約に準拠している
- [x] exhaustive check パターンの仕様が更新されている

## 5. 参照資料

| 資料                        | パス                                                                                     | 用途         |
| --------------------------- | ---------------------------------------------------------------------------------------- | ------------ |
| StatusBadge 仕様            | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-advanced.md` | 更新対象     |
| UI 実装                     | `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx`                      | 実装確認     |
| SkillExecutionStatus 型定義 | `packages/shared/src/types/skill.ts`                                                     | 型定義の参照 |
