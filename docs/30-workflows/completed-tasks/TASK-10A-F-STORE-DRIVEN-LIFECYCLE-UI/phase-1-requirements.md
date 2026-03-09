# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 1                                    |
| 機能名 | task-10a-f-store-driven-lifecycle-ui |
| 作成日 | 2026-03-09                           |
| モード | P50該当: 検証・補完モード            |

## 目的

既実装の TASK-10A-F が本来どの責務を持つかを明文化し、`SkillImportDialog` への誤投影を排除した受け入れ基準を固定する。

## 実行タスク

- P50確認: 実装済みコードと正本仕様を突き合わせる
- FR/NFR整理: create/analyze 導線の Store 統合要件を定義する
- 受け入れ基準作成: Given / When / Then で検証条件を定義する
- スコープ境界定義: TASK-10A-E-C / TASK-10A-G との分離を固定する

## 参照資料

| 資料名       | パス                                                                                        | 説明                             |
| ------------ | ------------------------------------------------------------------------------------------- | -------------------------------- |
| 正本台帳     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | TASK-10A-F の完了記録            |
| 状態管理仕様 | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | state境界、Case B 方式           |
| 実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | direct IPC → Store 移行          |
| UI機能仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillAnalysisView / CreateWizard |
| Hook 実装    | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`                      | direct IPC 排除本体              |
| Wizard 実装  | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                          | `useCreateSkill()` 利用          |
| View 実装    | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`                          | 表示責務                         |

## 実行手順

### ステップ0: P50チェック

```bash
rg -n 'window\\.electronAPI\\.skill\\.(analyze|applyImprovements|autoImprove|create)' \
  apps/desktop/src/renderer/components/skill
```

| 判定    | 条件                   | 対応                                  |
| ------- | ---------------------- | ------------------------------------- |
| P50該当 | 対象実装が既に存在する | 全Phaseを検証・補完モードに切り替える |
| 非P50   | 実装が未存在           | 通常の実装ワークフローへ戻す          |

### ステップ1: 要件抽出

- `useSkillAnalysis.ts` は direct IPC を持たない
- `SkillCreateWizard.tsx` は `useCreateSkill()` を使う
- `SkillAnalysisView.tsx` は描画責務に留まる

### ステップ2: 受け入れ基準作成

- Store state と local state の境界を定義する
- エラー処理と再分析の挙動を定義する

### ステップ3: スコープ境界固定

- `SkillImportDialog` は本タスク対象外
- `SkillEditor` 残存直接 IPC は TASK-10A-G 側に送る

## 統合テスト連携

| 接続要件カテゴリ | 記載内容                                                |
| ---------------- | ------------------------------------------------------- |
| API接続          | Renderer は Store action 経由で `agentSlice` に接続する |
| データフロー     | `agentSlice` → selector → hook → view / wizard          |
| 状態境界         | 共有状態は Store、UI一時状態は local                    |

## 多角的チェック観点

| 観点               | 確認内容                                                     |
| ------------------ | ------------------------------------------------------------ |
| アーキテクチャ     | direct IPC が hook/view から排除されているか                 |
| UI/UX              | SkillAnalysisView と CreateWizard の責務が肥大化していないか |
| エラーハンドリング | `skillError` が Store 経由で一元化されているか               |
| 依存関係           | TASK-10A-E-C / TASK-10A-G と衝突しないか                     |

## 成果物

| 成果物       | パス                                                                                                             | 説明                       |
| ------------ | ---------------------------------------------------------------------------------------------------------------- | -------------------------- |
| 要件定義書   | `docs/30-workflows/completed-tasks/TASK-10A-F-STORE-DRIVEN-LIFECYCLE-UI/phase-1-requirements.md`                 | 本Phaseの正本              |
| 要件サマリー | `docs/30-workflows/completed-tasks/TASK-10A-F-STORE-DRIVEN-LIFECYCLE-UI/outputs/phase-1/requirements-summary.md` | 実行時に記録する補助成果物 |

## 完了条件

- [ ] P50該当の根拠が記載されている
- [ ] FR/NFR/AC が `useSkillAnalysis` 中心で定義されている
- [ ] `SkillImportDialog` と `SkillEditor` の境界が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. P50チェック
2. 正本仕様確認
3. FR/NFR/AC作成
4. スコープ境界記載
5. 完了条件確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 次のPhase

Phase 2: 設計
