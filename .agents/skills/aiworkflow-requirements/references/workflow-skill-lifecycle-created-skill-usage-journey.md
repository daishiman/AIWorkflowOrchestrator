# Skill Lifecycle Created Skill Usage Journey ワークフロー仕様

> 本ドキュメントは AIWorkflowOrchestrator の仕様書です。  
> 管理: `.claude/skills/aiworkflow-requirements/references/`

---

## 概要

`TASK-SKILL-LIFECYCLE-05`（`step-04-seq-task-05-created-skill-usage-journey`）で定義した
「作成済みスキルを使う主導線」の設計仕様を再利用するための workflow 正本。

対象は以下の 3 シナリオ:

1. 作成直後に使う（Immediate Use）
2. あとから使う（Deferred Use）
3. 履歴から再利用する（History Reuse）

**トリガー**: `TASK-SKILL-LIFECYCLE-05`, `created-skill-usage-journey`, `ScoreGateBadge`, `PostExecutionActionBar`, `favoriteSkillNames`, `recentlyUsedSkills`

---

## 必要仕様の抽出セット

| 関心ごと | 参照仕様 | 抽出キーワード |
| --- | --- | --- |
| 利用導線UI | `ui-ux-agent-execution.md` | `execute`, `skill`, `run` |
| 導線ナビゲーション | `ui-ux-navigation.md` | `Skill Center`, `Agent`, `entry` |
| 画面コンポーネント | `ui-ux-feature-components.md` | `SkillCard`, `SkillList`, `usage` |
| 実行契約/IPC | `interfaces-agent-sdk-executor.md` | `execute`, `run`, `agent` |
| スキル型定義 | `interfaces-agent-sdk-skill.md` | `SkillAnalysis`, `ImportedSkill` |
| 状態管理 | `arch-state-management.md` | `skillSlice`, `agentSlice`, `history` |
| Workspace文脈 | `llm-workspace-chat-edit.md` | `workspacePath`, `context`, `skill` |

---

## 抽出確認コマンド

```bash
node scripts/search-spec.js "TASK-SKILL-LIFECYCLE-05" -C 3
node scripts/search-spec.js "created-skill-usage-journey" -C 3
node scripts/search-spec.js "ScoreGateBadge" -C 3
node scripts/search-spec.js "PostExecutionActionBar" -C 3
node scripts/search-spec.js "favoriteSkillNames" -C 3
node scripts/search-spec.js "recentlyUsedSkills" -C 3
node scripts/search-spec.js "workspacePath" -C 3
```

---

## Task04 依存契約

| 依存項目 | 契約内容 |
| --- | --- |
| ScoringGate | `NEEDS_IMPROVEMENT / SAVE_ALLOWED / USE_ALLOWED / RECOMMENDED` の4段階 |
| ScoreDisplay/ScoreDelta | 実行前後の品質表示を導線上で一貫表示する |
| evaluatePrompt | 改善ループ（実行後再評価）で `skill:optimize:evaluate` 契約を利用する |
| PostExecutionActionBar | 実行後の「再利用/改善」アクションを明示する |

---

## Task07 依存契約（TASK-SKILL-LIFECYCLE-07）

| 依存項目 | 契約内容 |
| --- | --- |
| SkillAggregateView | Task07 が算出する集約ビュー。成功率（`successRate`）・トレンド（`scoreTrend: ScoreDataPoint[]`）・推薦スコア（`recommendationScore`）を保持する |
| Task05 UI への提供 | Task07 の SkillAggregateView は Task05 の UI コンポーネント（SkillCard / SkillDetailPanel）に品質指標を提供し、「履歴から再利用」シナリオの判断材料となる |
| フィードバック連携 | Task07 の SkillFeedback がユーザー評価を蓄積し、推薦スコア算出の入力として使用される |

### 参照リンク

- Task07 設計: `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/phase-2-design.md`
- Task07 要件: `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/phase-1-requirements.md`

---

## Task08 接続契約（TASK-SKILL-LIFECYCLE-08 / spec_created）

Task05 の「作成済みスキル利用導線」は、Task08 の公開・互換性設計を取り込む前段となる。

| 接続点 | Task05 側 | Task08 側 | 契約内容 |
| --- | --- | --- | --- |
| 公開レベル表示 | SkillCard / DetailPanel | `SkillVisibility` | `local` / `team` / `public` の表示契約を共通化 |
| 公開可否表示 | ScoreGateBadge | `PublishReadiness` | 利用導線で `blocked` を明示し公開操作を無効化 |
| 互換性表示 | 改善/再利用導線 | `CompatibilityCheckResult` | `breaking` は major バンプ要求を表示 |
| 安全性連携 | execute 前注意喚起 | `SafetyGateInput` | high/critical は管理者承認 or 公開不可へ遷移 |

### follow-up 未タスク

- `UT-SKILL-LIFECYCLE-08-TYPE-IMPL`
- `UT-SKILL-LIFECYCLE-08-UI-IMPL`

### 公開レベル遷移フロー

スキルの公開レベルは `SkillVisibility` 型（`"local" | "team" | "public"`）で管理し、常に `local` から開始する。

| 遷移 | トリガー | 前提条件 | IPC チャンネル |
| --- | --- | --- | --- |
| `local` → `team` | ユーザーが Team 公開を選択 | `PublishReadiness` が `auto-approved` または `review-required` | `skill:publishing:register` |
| `team` → `public` | ユーザーが Public 公開を選択 | `PublishReadiness` が `auto-approved`、`license` / `readme` / `changelog` / `minAppVersion` が必須 | `skill:publishing:update` |
| `team` / `public` → 非推奨 | ユーザーが deprecate を選択 | `getDependents()` で依存スキル数を表示、確認ダイアログ | `skill:publishing:deprecate` |
| 任意 → 削除 | ユーザーが remove を選択 | 依存スキル0件、またはユーザー確認済み | `skill:publishing:remove` |

遷移の不変条件:
- `riskLevel === "critical"` のスキルは `blocked` 判定となり、`team` / `public` への遷移は不可
- `gateStatus === "rejected"` の場合も同様に `blocked`
- 降格（`public` → `team` → `local`）は `deprecate` → `remove` → 再登録の手順で行う

### Skill Center 登録/更新/停止フロー

| ステップ | 操作 | サービス | IPC チャンネル | 入力型 | 出力型 |
| --- | --- | --- | --- | --- | --- |
| 1 | 新規登録 | `SkillRegistryService.register()` | `skill:publishing:register` | `SkillPublishingMetadata` | `RegisterResult` |
| 2 | メタデータ更新 | `SkillRegistryService.update()` | `skill:publishing:update` | `skillId` + `SkillPublishingMetadata` | `UpdateResult` |
| 3 | 互換性チェック | `CompatibilityChecker.check()` | `skill:publishing:check-compatibility` | `oldSchema` + `newSchema` | `CompatibilityCheckResult` |
| 4 | 公開準備度チェック | `PublishReadinessChecker.check()` | `skill:publishing:check-readiness` | `SafetyGateInput` + `ObservabilityMetrics` | `PublishReadiness` |
| 5 | 非推奨化 | `SkillRegistryService.deprecate()` | `skill:publishing:deprecate` | `skillId` + `DeprecationNotice` | `void` |
| 6 | 削除 | `SkillRegistryService.remove()` | `skill:publishing:remove` | `skillId` | `void` |

配布操作:

| 操作 | サービス | IPC チャンネル |
| --- | --- | --- |
| インポート | `SkillDistributionService.importSkill()` | `skill:distribution:import` |
| エクスポート | `SkillDistributionService.exportSkill()` | `skill:distribution:export` |
| フォーク | `SkillDistributionService.forkSkill()` | `skill:distribution:fork` |
| 共有 | `SkillDistributionService.shareSkill()` | `skill:distribution:share` |

全レスポンスは `IpcResponse<T>` wrapper 形式（P60 準拠）。

---

## 現行 workflow 仕様書

| 区分 | パス |
| --- | --- |
| task root | `docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/` |
| requirements | `phase-1-requirements.md` |
| design | `phase-2-design.md` |
| review/test/doc | `phase-3` 〜 `phase-13` |
| Phase 12 guide | `outputs/phase-12/implementation-guide.md` |

---

## 実装内容（TASK-SKILL-LIFECYCLE-05）

### 追加ファイル

| パス | 内容 |
| --- | --- |
| `packages/shared/src/types/cta-visibility.ts` | ScoringGate × CTA 16パターンマトリクスの純粋関数 |
| `packages/shared/src/types/__tests__/cta-visibility.test.ts` | 30テスト全GREEN |
| `packages/shared/src/types/index.ts` | エクスポート追加 |

### cta-visibility.ts 設計詳細

- **`CTA_VISIBILITY_MAP`**: `Record<ScoringGate, CTAVisibility>` 静的マッピングテーブル（16パターン）
- **`getCTAVisibility(gateResult)`**: ScoringGate → CTAVisibility を返す純粋関数
- **`getCTAVisibilityFromScore(score)`**: スコア数値 → CTAVisibility を返す純粋関数（内部で `getScoreGateResult` を利用）
- **`CTAState`**: `"primary" | "secondary" | "disabled" | "hidden"`
- **`CTAType`**: `"USE_NOW" | "SAVE_LATER" | "IMPROVE_FIRST" | "IMPROVE_RECOMMENDED"`

### テスト設計（30件）

| テストグループ | 件数 | 内容 |
| --- | --- | --- |
| 16パターンマトリクス | 16 | 全 ScoringGate × CTAState/CTAType の組み合わせ |
| 境界値 | 11 | スコア 0, 59, 60, 79, 80, 99, 100 の正確な gate 分岐 |
| 異常値 | 3 | `-10`, `150`, `NaN` の正規化挙動 |

---

## 苦戦箇所

### 苦戦1: 設計タスクでの実装コード必要性判断

- **課題**: タスク種別が `"design"` だが、Phase 4 のテスト設計で `getCTAVisibility()` の実装コードが必要になった。設計タスクに実装コードを含めるべきか判断が遅れた
- **解決策**: `Record<ScoringGate, CTAVisibility>` パターンで純粋関数として実装。設計タスクでもテスト検証可能なコードは共有型パッケージに配置する
- **標準ルール**: 設計タスクでも `packages/shared` への型・純粋関数の追加は許容する

### 苦戦2: artifacts.json の更新漏れ

- **課題**: 49成果物ファイルを全て作成したが、`artifacts.json` が `not_started` のまま放置された。3つの並列検証エージェントで全Phase PASS を確認した後に発見
- **解決策**: Phase 完了ごとに `artifacts.json` を逐次更新する。最終確認で `status: "completed"` + 全受入基準 `verified: true` に更新
- **標準ルール**: Phase 仕様実行完了時は `artifacts.json` を最初に更新する

### 苦戦3: NaN境界値テストでの getScoreGateResult 挙動

- **課題**: `getScoreGateResult(NaN)` が `NEEDS_IMPROVEMENT` を返すことの検証。`NaN < 60` は false だが、`normalizeScore()` のクランプ処理で 0 に正規化される挙動を理解するまで時間がかかった
- **解決策**: `normalizeScore()` のソースを確認し、`Math.max(0, Math.min(100, score))` で NaN が 0 にクランプされる挙動を把握
- **標準ルール**: 境界値テストでは NaN/Infinity の正規化挙動も必ず検証する

### 苦戦4: Record パターンでの ScoringGate 網羅性保証

- **課題**: `switch` 分岐だけだと新しい `ScoringGate` が追加されたときに網羅漏れを見逃すリスクが残る
- **解決策**: `Record<ScoringGate, CTAVisibility>` を採用し、キー不足を型エラーとして検出する
- **標準ルール**: ユニオン型の全ケース網羅は `Record<UnionType, Config>` を第一候補にする

### 苦戦5: 設計タスクで artifacts.json を後回しにしやすい

- **課題**: 成果物作成が先行し、`artifacts.json` のステータス更新が遅延した
- **解決策**: Phase 完了ごとに `artifacts.json` を更新し、最終で `status=completed` を確認する
- **標準ルール**: 「成果物作成」と「台帳更新」を同一ステップで実施する

### 苦戦6: Phase 12 本文と成果物の実績が乖離しやすい

- **課題**: `phase-12-documentation.md`/`documentation-changelog.md` に計画文（実行予定）が残ると、成果物実体と矛盾して監査が不安定になる
- **解決策**: planned wording を除去し、Task 1〜5 の実績を `phase-12-documentation.md`・`documentation-changelog.md`・`spec-update-summary.md` へ同値で転記する
- **標準ルール**: Phase 12 は「実績のみ記録」を原則とし、計画文を残さない

---

## Current Canonical Set

`.claude/skills/aiworkflow-requirements/references/` 配下で本タスクに関連するファイル:

| ファイル | 役割 |
| --- | --- |
| `workflow-skill-lifecycle-created-skill-usage-journey.md` | 本ドキュメント（統合正本） |
| `workflow-skill-lifecycle-evaluation-scoring-gate.md` | Task04 依存元の ScoringGate 正本 |
| `ui-ux-agent-execution.md` | Agent実行画面 UI 仕様 |
| `ui-ux-navigation.md` | 導線ナビゲーション仕様 |
| `ui-ux-feature-components.md` | 画面コンポーネント仕様 |
| `interfaces-agent-sdk-executor.md` | 実行契約 IPC 仕様 |
| `interfaces-agent-sdk-skill.md` | スキル型定義仕様 |
| `arch-state-management.md` | 状態管理仕様 |
| `llm-workspace-chat-edit.md` | Workspace文脈引き継ぎ仕様 |
| `task-workflow-completed-skill-lifecycle-agent-view-line-budget.md` | 完了台帳 |
| `lessons-learned-current.md` | 苦戦箇所 summary |

---

## Artifact Inventory

Phase別の成果物パス（task root: `docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/`）:

| Phase | 成果物ファイル |
| --- | --- |
| Phase 1 | `outputs/phase-1/requirements-definition.md`, `outputs/phase-1/scope-definition.md`, `outputs/phase-1/spec-extraction-map.md`, `outputs/phase-1/usage-scenario-table.md` |
| Phase 2 | `outputs/phase-2/screen-transition-design.md`, `outputs/phase-2/component-design.md`, `outputs/phase-2/state-management-design.md`, `outputs/phase-2/ipc-integration-design.md`, `outputs/phase-2/quality-display-placement.md` |
| Phase 3 | `outputs/phase-3/requirements-design-matrix.md`, `outputs/phase-3/dependency-contract-report.md`, `outputs/phase-3/ui-ux-review-report.md`, `outputs/phase-3/technical-review-report.md`, `outputs/phase-3/gate-decision.md` |
| Phase 4 | `outputs/phase-4/traceability-test-design.md`, `outputs/phase-4/scoring-gate-cta-matrix.md`, `outputs/phase-4/flow-test-design.md`, `outputs/phase-4/state-management-test-design.md`, `outputs/phase-4/ipc-test-design.md`, `outputs/phase-4/accessibility-test-design.md` |
| Phase 5 | `outputs/phase-5/integrity-verification-report.md` |
| Phase 6 | `outputs/phase-6/test-expansion-plan.md`, `outputs/phase-6/failure-handling-matrix.md`, `outputs/phase-6/regression-guard-list.md` |
| Phase 7 | `outputs/phase-7/coverage-matrix.md`, `outputs/phase-7/coverage-gap-report.md`, `outputs/phase-7/coverage-summary.md` |
| Phase 8 | `outputs/phase-8/terminology-unification.md`, `outputs/phase-8/duplication-removal.md`, `outputs/phase-8/common-execution-flow.md`, `outputs/phase-8/link-normalization-checklist.md` |
| Phase 9 | `outputs/phase-9/spec-quality-report.md`, `outputs/phase-9/ambiguity-detection-report.md`, `outputs/phase-9/type-consistency-report.md`, `outputs/phase-9/link-validity-report.md`, `outputs/phase-9/pitfall-compliance-report.md` |
| Phase 10 | `outputs/phase-10/ac-fulfillment-report.md`, `outputs/phase-10/design-completeness-report.md`, `outputs/phase-10/gate-decision.md`, `outputs/phase-10/unassigned-task-report.md` |
| Phase 11 | `outputs/phase-11/walkthrough-scenario-a.md`, `outputs/phase-11/walkthrough-scenario-b.md`, `outputs/phase-11/walkthrough-scenario-c.md`, `outputs/phase-11/walkthrough-feedback-loop.md`, `outputs/phase-11/walkthrough-edge-cases.md`, `outputs/phase-11/manual-test-checklist.md`, `outputs/phase-11/manual-test-result.md`, `outputs/phase-11/manual-test-report.md`, `outputs/phase-11/screenshot-plan.json`, `outputs/phase-11/screenshots/*` |
| Phase 12 | `outputs/phase-12/implementation-guide.md`, `outputs/phase-12/spec-update-summary.md`, `outputs/phase-12/documentation-changelog.md`, `outputs/phase-12/unassigned-task-detection.md`, `outputs/phase-12/skill-feedback-report.md`, `outputs/phase-12/phase12-task-spec-compliance-check.md`, `outputs/phase-12/unassigned-task-report.md` |
| artifacts 追跡 | `artifacts.json` |

---

## 実装コードアンカー

| 種別 | パス |
| --- | --- |
| CTA制御関数 | `packages/shared/src/types/cta-visibility.ts` |
| CTAテスト | `packages/shared/src/types/__tests__/cta-visibility.test.ts` |
| エクスポート | `packages/shared/src/types/index.ts` |
| ScoringGate依存元 | `packages/shared/src/types/skill-improver.ts` |
| artifacts追跡 | `docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/artifacts.json` |

---

## same-wave 検証手順

```bash
# 1. CTA テスト実行
pnpm --filter @repo/shared exec vitest run src/types/__tests__/cta-visibility.test.ts

# 2. ビルド確認
pnpm --filter @repo/shared build

# 3. artifacts.json 整合
cat docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/artifacts.json \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'status={d[\"status\"]}, phases_completed={sum(1 for p in d[\"phases\"] if p[\"status\"]==\"completed\")}/13')"
```

---


## Agent -> SkillAnalysis handoff 実装完了記録（TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 / 2026-03-20）

Task05「作成済みスキルを使う主導線」の「実行 -> 分析 -> 再実行」ループが TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 で閉じた。

| 接続点 | 実装内容 | 実装アンカー |
| --- | --- | --- |
| Agent 改善 CTA | 実行完了後に `canOfferAnalysis` 派生値で CTA を表示。click で `skillAnalysis` へ handoff | `apps/desktop/src/renderer/views/AgentView/index.tsx` |
| SkillAnalysisView round-trip | `onNavigateBack` / `onNavigateToAgent` optional props で Agent 起点のときだけ戻り導線を表示 | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx` |
| shell guard | `App.tsx` が `viewHistory[length - 2] === "agent"` で起点判定し props を注入 | `apps/desktop/src/renderer/App.tsx` |
| Store 個別セレクタ | `useSetCurrentView` / `useSetCurrentSkillName` を追加し、合成 Hook 依存を回避 | `apps/desktop/src/renderer/store/index.ts` |


## 5分解決カード

1. broad query で 0 件なら、`TASK-SKILL-LIFECYCLE-05` ではなく `ScoreGateBadge` / `workspacePath` に分割して再検索する。
2. 仕様抽出は `ui` → `contract` → `state` → `workspace context` の順で確認する。
3. Task04 依存は `ScoringGate` と `evaluatePrompt` の 2 点を先に固定してから UI 文書へ戻る。
4. Phase 12 実装ガイドは Part 1/Part 2 を分離して記述し、検証スクリプトで機械判定する。
5. 設計タスクでも Phase 6/7 を空欄にせず、テスト拡充/カバレッジ判定の責務を文書化する。
6. CTA制御の仕様確認は `cta-visibility.ts` の `CTA_VISIBILITY_MAP` 定数を見れば16パターン全て一覧できる。
7. `artifacts.json` が stale な場合は Phase 完了状態と受入基準充足を逐次更新する。
8. Phase 12 は `phase-12-documentation.md` / `documentation-changelog.md` / `spec-update-summary.md` の3点を同時更新し、計画文を残さない。
