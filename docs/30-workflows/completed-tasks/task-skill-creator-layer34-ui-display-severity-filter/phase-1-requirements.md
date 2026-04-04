# Phase 1: 要件定義 - SkillCreator Layer3/4 severity フィルタ追加

## メタ情報

| 項目       | 値                                                    |
| ---------- | ----------------------------------------------------- |
| Phase      | 1                                                     |
| 機能名     | task-skill-creator-layer34-ui-display-severity-filter |
| 作成日     | 2026-04-03                                            |
| タスク分類 | **UIタスク**（Renderer側のみ、backend変更なし）       |

## 目的

severity フィルタの機能要件・非機能要件を抽出し、受け入れ基準を明文化する。既存コードの命名規則を分析し記録する。

## 実行タスク

### タスク1: P50チェック — 既実装状態の調査

**目的**: 対象ファイルの現在の実装状態を確認し、既存実装と衝突しないことを検証する。

**手順**:

1. `SkillLifecyclePanel.tsx` の最近のコミット履歴を確認する
2. severity filter に関する既存コードが存在しないことを確認する
3. `VerifyLayerGroup` コンポーネントの現在の props を記録する

```bash
git log --oneline -20 -- apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
grep -n "severityFilter\|severity.*filter\|SeverityFilter" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

**期待される成果物**: P50チェック結果（既存実装との衝突なし確認）

### タスク2: 既存コード命名規則の分析

**目的**: 既存コードの命名規則を分析し、新規コードとの整合性を確保する。

**手順**:

1. `SkillLifecyclePanel.tsx` の state 命名パターンを確認する（camelCase: `expandedLayers`, `isVerifyDetailLoading` 等）
2. 定数命名パターンを確認する（UPPER_SNAKE_CASE: `VERIFY_LAYER_ORDER`, `verifyCheckSeverityStyles` 等）
3. コンポーネント命名パターンを確認する（PascalCase: `VerifyLayerGroup` 等）
4. 型命名パターンを確認する（PascalCase with prefix: `RuntimeSkillCreatorVerifyCheckSeverity` 等）

**期待される成果物**: 命名規則分析結果

### タスク3: 機能要件の抽出

**目的**: severity フィルタに必要な機能要件を網羅的に定義する。

**手順**:

1. フィルタ条件の定義
   - `all`: 全 severity を表示（既定値）
   - `warning+`: `warning` と `error` のみ表示
   - `error`: `error` のみ表示
2. フィルタ適用先の確定
   - `VerifyLayerGroup` 内の check 一覧に適用
   - フィルタ後 0 件の Layer は非表示
3. フィルタ状態の永続性
   - reverify 後も filter state を維持
   - activeWorkflowId 変更時は `all` にリセット

**期待される成果物**:

- 機能要件リスト（FR-1 〜 FR-N）

### タスク4: 非機能要件の抽出

**目的**: UIタスクに関連する非機能要件を定義する。

**手順**:

1. パフォーマンス: フィルタ切り替えは即時反映（useMemo による再計算）
2. アクセシビリティ: セグメントコントロールは keyboard navigable
3. テーマ対応: ライト/ダークモード両対応
4. レスポンシブ: 既存レイアウトのグリッド構造を維持

**期待される成果物**:

- 非機能要件リスト（NFR-1 〜 NFR-N）

### タスク5: 受け入れ基準の定義

**目的**: 各要件に対して検証可能な受け入れ基準を定義する。

**手順**:

1. AC-1: `all` 選択時に全 severity の check が表示される
2. AC-2: `warning+` 選択時に `info` check が非表示になる
3. AC-3: `error` 選択時に `warning` と `info` check が非表示になる
4. AC-4: フィルタ変更後も Layer accordion の開閉状態が維持される
5. AC-5: フィルタ適用後の集計バッジが filter 後の件数を反映する
6. AC-6: reverify 後も選択した filter 条件が維持される
7. AC-7: check 0 件の Layer が非表示になる

**期待される成果物**:

- 受け入れ基準リスト（AC-1 〜 AC-7）

## 参照資料

| 資料名              | パス                                                                                         | 説明                                      |
| ------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Issue #1857         | GitHub Issue                                                                                 | タスクの元要求                            |
| 既存未タスク仕様    | `docs/30-workflows/unassigned-task/task-skill-creator-layer34-ui-display-severity-filter.md` | 未タスクとして記録された初期仕様          |
| SkillLifecyclePanel | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                         | 変更対象コンポーネント                    |
| skillCreator型定義  | `packages/shared/src/types/skillCreator.ts`                                                  | RuntimeSkillCreatorVerifyCheckSeverity 等 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                                 | 内容                             |
| ----------------------- | ------------------------------------------------------------------------------------ | -------------------------------- |
| UI/UXコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-core.md` | SkillLifecyclePanel の配置・責務 |
| テストパターン          | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`    | コンポーネントテスト基準         |
| インターフェース定義    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`    | verify detail 関連型             |

## 統合テスト連携

本タスクは Renderer Process 内で完結する UI 改善のため、IPC/API 接続テストは不要。コンポーネントテストで verify detail のフィルタ動作を検証する。

| テスト種別           | 観点                                     |
| -------------------- | ---------------------------------------- |
| コンポーネントテスト | フィルタ条件ごとの表示/非表示            |
| コンポーネントテスト | Layer accordion と filter state の独立性 |
| コンポーネントテスト | reverify 後の filter state 維持          |

## 多角的チェック観点

| 観点             | 適用判断                       | 仕様参照先                            |
| ---------------- | ------------------------------ | ------------------------------------- |
| UI/UX            | ✅ Renderer コンポーネント変更 | `aiworkflow-requirements: ui-ux-*.md` |
| アクセシビリティ | ✅ セグメントコントロール追加  | `aiworkflow-requirements: ui-ux-*.md` |
| セキュリティ     | ❌ 認証・入力検証に関係しない  | -                                     |
| API設計          | ❌ IPC/API 変更なし            | -                                     |
| データ整合性     | ❌ DB 操作なし                 | -                                     |

**Electronデスクトップアプリ観点**:

| 層                 | 適用判断 | 備考                               |
| ------------------ | -------- | ---------------------------------- |
| Renderer           | ✅       | severity filter の state 管理と UI |
| Main               | ❌       | 変更なし                           |
| IPC                | ❌       | 変更なし                           |
| Preload            | ❌       | 変更なし                           |
| ローカルストレージ | ❌       | filter 永続化はスコープ外          |

## 成果物

| 成果物     | パス                              | 説明          |
| ---------- | --------------------------------- | ------------- |
| 要件定義書 | `outputs/phase-1/requirements.md` | FR/NFR/AC一覧 |

## 完了条件

- [ ] P50チェックで既存実装との衝突がないことを確認した
- [ ] 既存コードの命名規則（camelCase state / PascalCase component / UPPER_SNAKE 定数）を記録した
- [ ] 機能要件（FR-1〜FR-N）を定義した
- [ ] 非機能要件（NFR-1〜NFR-N）を定義した
- [ ] 受け入れ基準（AC-1〜AC-7）を検証可能な形で定義した
- [ ] タスク分類を **UIタスク** として記録した
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計
