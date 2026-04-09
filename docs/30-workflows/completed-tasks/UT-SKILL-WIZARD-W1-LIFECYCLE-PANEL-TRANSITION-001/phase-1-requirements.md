# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 1                                                          |
| 機能名     | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001          |
| タスク名   | SkillLifecyclePanel.tsx 遷移ボタン化（テキストエリア削除） |
| 前提Phase  | -                                                          |
| 後続Phase  | Phase 2                                                    |
| 作成日     | 2026-04-08                                                 |
| ステータス | pending                                                    |

---

## 目的

`SkillLifecyclePanel.tsx` からテキストエリアを削除し、ウィザード遷移ボタンへ置き換えるための要件境界を固定する。  
削除対象の UI 要素・state・ハンドラ、追加対象のボタン要素を確定し、受け入れ基準を定義する。

---

## 背景

`skill-wizard-redesign-lane` の設計確定仕様として、スキル作成フローを新ウィザード（`SkillCreateWizard`）経由に一本化する。  
Wave 0（W0-seq-01 / W0-seq-02）完了済みで、Wave 1 の並列タスクとして独立実行可能。

---

## Step 0: P50チェック（必須）

Phase 1 開始前に対象ファイルの実装状態を確認し、重複作業を防止する。

```bash
# 対象コンポーネントの現状確認
git log --oneline -10 -- apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
grep -n "skill-lifecycle-request-input\|skill-lifecycle-execution-input\|textarea" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# テスト関連の data-testid 参照全量確認
grep -rn "skill-lifecycle-request-input\|skill-lifecycle-execution-input" \
  apps/desktop/src/renderer/components/skill/__tests__/
```

---

## 実行タスク

- **要件抽出**: 対象コンポーネントの現状分析（削除対象 UI・state・ハンドラの全量洗い出し）
- **aiworkflow 仕様抽出**: resource-map 起点で UI/UX・状態管理関連の仕様を抽出
- **受け入れ基準化**: 矛盾なし・漏れなし・整合あり・依存整合の判定基準を定義

---

## 参照資料

### 実装・コード

| 資料名                              | パス                                                                                                | 用途                           |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------ |
| 対象コンポーネント                  | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                | 削除対象・追加対象の確認       |
| テストファイル（メイン）            | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`                 | data-testid 参照箇所の全量確認 |
| テストファイル（adapter-status）    | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanelAdapterStatus.test.tsx`    | 関連テスト影響確認             |
| テストファイル（approval）          | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanelApproval.test.tsx`         | 関連テスト影響確認             |
| テストファイル（auth-regression）   | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanelAuthRegression.test.tsx`   | 関連テスト影響確認             |
| テストファイル（error-persistence） | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanelErrorPersistence.test.tsx` | 関連テスト影響確認             |
| テストファイル（llm-generation）    | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanelLlmGeneration.test.tsx`    | 関連テスト影響確認             |

### システム仕様（aiworkflow-requirements）

| 資料名         | パス                                                                         | 用途                    |
| -------------- | ---------------------------------------------------------------------------- | ----------------------- |
| UI/UX仕様      | `.claude/skills/aiworkflow-requirements/references/ui-ux-skill-lifecycle.md` | SkillLifecyclePanel仕様 |
| 状態管理       | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | state設計の根拠         |
| リソースマップ | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`             | 抽出漏れ防止            |
| タスク運用     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`         | 台帳同期ルール          |
| 教訓           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`       | 再発防止知見            |

---

## 実行手順

1. 対象コンポーネント（`SkillLifecyclePanel.tsx`）を読み込み、現状の UI 構造・state・ハンドラを把握する
2. 削除対象の `data-testid`（`skill-lifecycle-request-input` / `skill-lifecycle-execution-input`）の全量を確認する
3. 6 本のテストファイルで上記 `data-testid` を参照している箇所を全て洗い出す
4. `approvedSkillSpec` state と `executePlan` ハンドラの依存関係を分析する
5. aiworkflow-requirements から関連仕様を抽出する
6. 受け入れ基準（AC）を番号付きで定義する

---

## 受け入れ基準

| AC番号 | 基準                                                                                              |
| ------ | ------------------------------------------------------------------------------------------------- |
| AC-1   | `skill-lifecycle-request-input` の textarea 要素が `SkillLifecyclePanel.tsx` から削除されている   |
| AC-2   | `skill-lifecycle-execution-input` の textarea 要素が `SkillLifecyclePanel.tsx` から削除されている |
| AC-3   | `data-testid="skill-lifecycle-open-wizard-button"` のボタンが追加されている                       |
| AC-4   | 削除した state（`request` / `executionPrompt` 等）がコード上に残っていない                        |
| AC-5   | 既存テストファイル 6 本が全て更新され PASS する                                                   |
| AC-6   | Phase 9 QA 基準（`git delete OR export {} stub化かつ live import ゼロ`）を満たす                  |
| AC-7   | `SkillCreateWizard` 本体の実装は行わない（スコープ外）                                            |
| AC-8   | IPC チャンネルの変更は行わない（スコープ外）                                                      |

---

## 統合テスト連携

- 削除対象の `data-testid` 参照箇所を 6 本のテストファイルで全量確認する
- 追加する `data-testid="skill-lifecycle-open-wizard-button"` のテストケースを要件に明記する
- `approvedSkillSpec` state の依存関係（`executePlan` ハンドラ）を確認し、削除可否を判定する
- 統合ログは `outputs/phase-1/` に保存する

---

## 多角的チェック観点

| 思考法       | 確認内容                                                              |
| ------------ | --------------------------------------------------------------------- |
| 水平思考     | 他のコンポーネントに同様のテキストエリアが存在しないか確認する        |
| 逆説思考     | テキストエリア削除によって壊れる機能の逆算リストを作成する            |
| システム思考 | SkillLifecyclePanel → SkillCreateWizard の遷移フロー全体を確認する    |
| 影響範囲思考 | 6本のテストファイル以外に参照箇所がないか確認する                     |
| 依存関係思考 | `approvedSkillSpec` / `executePlan` の依存グラフを作成する            |
| スコープ思考 | current facts における settings / wizard 導線との境界を明確に定義する |

---

## 成果物

| 成果物               | パス                                                         | 説明                           |
| -------------------- | ------------------------------------------------------------ | ------------------------------ |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                 | 機能要件と非機能要件           |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`                     | 検証可能な AC 一覧             |
| 仕様抽出結果         | `outputs/phase-1/aiworkflow-requirements-extraction.md`      | aiworkflow 仕様抽出結果        |
| 削除対象分析         | `outputs/phase-1/deletion-target-analysis.md`                | 削除対象 UI/state/ハンドラ一覧 |
| トレーサビリティ行列 | `outputs/phase-1/implementation-spec-traceability-matrix.md` | 要件と仕様の対応表             |

---

## 完了条件

- [ ] 削除対象の UI 要素（textarea 2 件）を全量確認した
- [ ] 削除対象の state・ハンドラを全量確認した
- [ ] 6 本のテストファイルの影響範囲を全量確認した
- [ ] 受け入れ基準（AC-1〜AC-8）を定義した
- [ ] aiworkflow-requirements からの仕様抽出が完了した
- [ ] 本 Phase 内の全タスクを 100% 実行完了

---

## サブタスク管理

1. 対象コンポーネントの現状分析（Step 0 チェック含む）
2. 削除対象・追加対象の全量洗い出し
3. テストファイル影響範囲確認
4. aiworkflow-requirements 仕様抽出
5. 受け入れ基準の定義と確定
6. 成果物出力

---

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001 --phase 1
```

---

## 次のPhase

Phase 2: 設計
