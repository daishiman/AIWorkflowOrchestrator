# Phase 2: 設計 - SkillCreator Layer3/4 severity フィルタ追加

## メタ情報

| 項目   | 値                                                    |
| ------ | ----------------------------------------------------- |
| Phase  | 2                                                     |
| 機能名 | task-skill-creator-layer34-ui-display-severity-filter |
| 作成日 | 2026-04-03                                            |

## 目的

severity フィルタの状態管理設計、UI コンポーネント設計、データフロー設計を行い、実装計画を確定する。

## 実行タスク

### タスク1: 状態管理設計

**目的**: severity filter state のライフサイクルとスコープを設計する。

**手順**:

1. filter state の型定義を設計する
   ```typescript
   type SeverityFilterValue = "all" | "warning+" | "error";
   ```
2. state の配置を決定する
   - `SkillLifecyclePanel` の verify detail セクション内で `useState` を使用
   - `expandedLayers` state と同レベル（兄弟 state）として配置
3. state のライフサイクルを定義する
   - 初期値: `'all'`
   - reverify 時: **リセットしない**（ユーザーの選択を維持）
   - activeWorkflowId 変更時: `'all'` にリセット
4. 派生 state の設計
   - `filteredChecksByLayer`: `useMemo` で `checksByLayer` に filter を適用
   - `filteredSeverityCounts`: フィルタ後の severity 別件数

**期待される成果物**: 状態管理設計書（state 一覧・ライフサイクル図）

### タスク2: UI コンポーネント設計

**目的**: フィルタ切り替え UI の配置・見た目・操作性を設計する。

**手順**:

1. フィルタ UI の種類を決定する
   - **セグメントコントロール**（3つのボタングループ）を採用
   - ラベル: `すべて` / `⚠ Warning+` / `✗ Error`
   - 内部値: `all` / `warning+` / `error`
2. 配置位置を決定する
   - verify detail ヘッダー（「検証結果」見出し）の右側
   - Layer アコーディオン一覧の上部
3. スタイル設計
   - 選択中: `bg-[var(--bg-tertiary)]` + `font-semibold`
   - 非選択: `bg-transparent` + `text-[var(--text-secondary)]`
   - ダーク/ライトモード対応（CSS変数使用）
4. アクセシビリティ
   - `role="group"` + `aria-label="severity filter"`
   - 各ボタンに `aria-pressed` 属性

**期待される成果物**: UIコンポーネント設計書（ワイヤーフレーム・スタイル定義）

### タスク3: データフロー設計

**目的**: filter state から表示までのデータフローを設計する。

**手順**:

1. データフローを図式化する
   ```
   verifyDetail.checks
     → checksByLayer (既存 useMemo: Layer別グルーピング)
     → filteredChecksByLayer (新規 useMemo: severity フィルタ適用)
     → VerifyLayerGroup (filteredChecks.length > 0 の Layer のみ)
       → individual check cards (filter 済み)
   ```
2. severity フィルタロジックを定義する
   ```typescript
   const shouldShowCheck = (
     check: RuntimeSkillCreatorVerifyCheck,
     filter: SeverityFilterValue,
   ): boolean => {
     if (filter === "all") return true;
     if (filter === "warning+")
       return check.severity === "warning" || check.severity === "error";
     if (filter === "error") return check.severity === "error";
     return true;
   };
   ```
3. 集計バッジの更新ロジックを定義する
   - VerifyLayerGroup ヘッダーの severity 件数バッジは filter 後の counts を使用
   - 全体の check 件数表示は「表示中 X / 全 Y 件」形式

**期待される成果物**: データフロー設計書

### タスク4: 新規作成・修正ファイルパス一覧

**目的**: 実装計画としてファイルパス一覧を確定する。

**手順**:

1. 修正ファイル一覧を作成する

| 種別 | ファイルパス                                                                        | 変更内容                               |
| ---- | ----------------------------------------------------------------------------------- | -------------------------------------- |
| 修正 | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                | severity filter state・UI・useMemo追加 |
| 修正 | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx` | フィルタテストケース追加               |

**期待される成果物**: ファイルパス一覧

## 参照資料

| 資料名              | パス                                                                 | 説明     |
| ------------------- | -------------------------------------------------------------------- | -------- |
| Phase 1成果物       | `outputs/phase-1/requirements.md`                                    | 要件定義 |
| SkillLifecyclePanel | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 現行実装 |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                                 | 内容                           |
| ----------------------- | ------------------------------------------------------------------------------------ | ------------------------------ |
| UI/UXコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-core.md` | SkillLifecyclePanel 配置・責務 |

## 統合テスト連携

Renderer 内完結のため IPC 接続テストは不要。コンポーネントテストの設計観点を Phase 4 に引き継ぐ。

| 設計観点               | テスト方針                                                          |
| ---------------------- | ------------------------------------------------------------------- |
| filter state 変更      | `fireEvent.click` で切り替え → DOM の check card 数を検証           |
| Layer 非表示           | filter 後 0 件の Layer の `VerifyLayerGroup` が render されないこと |
| reverify 後 state 維持 | reverify mock → filter state が変わらないこと                       |

## 多角的チェック観点

| 観点             | 適用判断                      | 仕様参照先                            |
| ---------------- | ----------------------------- | ------------------------------------- |
| UI/UX            | ✅ セグメントコントロール設計 | `aiworkflow-requirements: ui-ux-*.md` |
| アクセシビリティ | ✅ ARIA属性設計               | `aiworkflow-requirements: ui-ux-*.md` |

## 成果物

| 成果物 | パス                        | 説明                           |
| ------ | --------------------------- | ------------------------------ |
| 設計書 | `outputs/phase-2/design.md` | 状態管理・UI・データフロー設計 |

## 完了条件

- [ ] severity filter state の型定義・ライフサイクル・スコープを設計した
- [ ] セグメントコントロールの配置・スタイル・アクセシビリティを設計した
- [ ] データフロー（checks → filter → display）を設計した
- [ ] 新規作成・修正ファイルパス一覧を確定した
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビュー
