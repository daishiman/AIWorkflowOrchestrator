# Phase 5: 実装 - SkillCreator Layer3/4 severity フィルタ追加

## メタ情報

| 項目      | 値                                                    |
| --------- | ----------------------------------------------------- |
| Phase     | 5                                                     |
| 機能名    | task-skill-creator-layer34-ui-display-severity-filter |
| 作成日    | 2026-04-03                                            |
| 前提Phase | Phase 4                                               |
| 後続Phase | Phase 6                                               |

## 目的

TDD Green フェーズとして、Phase 4 で作成した全テストを PASS させる実装を行う。

## 実行タスク

### タスク1: severity filter 型定義と state 追加

**目的**: filter state の型と初期値を実装する。

**手順**:

1. `SeverityFilterValue` 型を定義する
   ```typescript
   type SeverityFilterValue = "all" | "warning+" | "error";
   ```
2. `SkillLifecyclePanel` 内に state を追加する
   ```typescript
   const [severityFilter, setSeverityFilter] =
     useState<SeverityFilterValue>("all");
   ```
3. activeWorkflowId 変更時のリセット effect に `setSeverityFilter('all')` を追加する

**コード配置先**: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

### タスク2: フィルタ適用 useMemo の実装

**目的**: checksByLayer に severity フィルタを適用する派生 state を実装する。

**手順**:

1. フィルタ関数を定義する
   ```typescript
   const shouldShowCheck = (
     severity: RuntimeSkillCreatorVerifyCheckSeverity,
     filter: SeverityFilterValue,
   ): boolean => {
     if (filter === "all") return true;
     if (filter === "warning+")
       return severity === "warning" || severity === "error";
     return severity === "error";
   };
   ```
2. `filteredChecksByLayer` を useMemo で計算する
3. `VerifyLayerGroup` に渡す checks を `filteredChecksByLayer` に変更する
4. filter 後 0 件の Layer を非表示にするロジックを追加する

### タスク3: セグメントコントロール UI の実装

**目的**: フィルタ切り替え UI を verify detail ヘッダー付近に追加する。

**手順**:

1. セグメントコントロールコンポーネントを実装する
   - 3つのボタン: `すべて` / `⚠ Warning+` / `✗ Error`
   - `role="group"` + `aria-label="severity filter"`
   - 各ボタンに `aria-pressed` 属性
   - 内部 state は `all` / `warning+` / `error` に固定し、表示ラベルとは分離する
2. verify detail セクションの Layer アコーディオン一覧の上部に配置する
3. ライト/ダークモード対応の CSS 変数スタイルを適用する

### タスク4: 集計バッジの更新

**目的**: フィルタ後の件数を集計バッジに反映する。

**手順**:

1. VerifyLayerGroup ヘッダーの severity 件数バッジを filter 後の counts に更新する
2. 「表示中 X / 全 Y 件」形式の件数表示を追加する（フィルタ適用中のみ）

### 新規作成・修正ファイルパス一覧

| 種別 | ファイルパス                                                         | 変更内容                                       |
| ---- | -------------------------------------------------------------------- | ---------------------------------------------- |
| 修正 | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | severity filter state・UI・useMemo・集計バッジ |

## 参照資料

| 資料名        | パス                           | 説明       |
| ------------- | ------------------------------ | ---------- |
| Phase 2成果物 | `outputs/phase-2/design.md`    | 設計書     |
| Phase 4成果物 | `outputs/phase-4/test-plan.md` | テスト計画 |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                                 | 内容                           |
| ----------------------- | ------------------------------------------------------------------------------------ | ------------------------------ |
| UI/UXコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-core.md` | SkillLifecyclePanel 配置・責務 |

## 統合テスト連携

| テスト                | 期待結果                                                  |
| --------------------- | --------------------------------------------------------- |
| Phase 4 テスト全 PASS | `pnpm --filter @repo/desktop test -- SkillLifecyclePanel` |

## 成果物

| 成果物       | パス                                        | 説明                      |
| ------------ | ------------------------------------------- | ------------------------- |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | 変更内容と test PASS 確認 |

## 完了条件

- [ ] `SeverityFilterValue` 型と state を追加した
- [ ] `filteredChecksByLayer` useMemo を実装した
- [ ] セグメントコントロール UI を実装した
- [ ] 集計バッジをフィルタ後の件数に更新した
- [ ] Phase 4 の全テストが PASS する（TDD Green）
- [ ] 既存テストが全て PASS する（リグレッションなし）
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 6: テスト拡充
