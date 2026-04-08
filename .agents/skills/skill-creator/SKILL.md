---
name: skill-creator
description: |
  スキルを作成・更新・プロンプト改善するためのメタスキル。
  **最初のアクションは必ず AskUserQuestion**（インタビュー深度確認）。
  **collaborative**モードでユーザーと対話しながら共創し、
  抽象的なアイデアから具体的な実装まで柔軟に対応する。
  **orchestrate**モードでタスクの実行エンジン（Claude Code / Codex / 連携）を選択。

  Anchors:
  • Continuous Delivery (Jez Humble) / 適用: 自動化パイプライン / 目的: 決定論的実行
  • The Lean Startup (Eric Ries) / 適用: Build-Measure-Learn / 目的: 反復改善
  • Domain-Driven Design (Eric Evans) / 適用: 戦略的設計・ユビキタス言語・Bounded Context / 目的: ドメイン構造の明確化
  • Clean Architecture (Robert C. Martin) / 適用: 依存関係ルール・層分離設計 / 目的: 変更に強い高精度スキル
  • Design Thinking (IDEO) / 適用: ユーザー中心設計 / 目的: 共感と共創

  Trigger:
  新規スキルの作成、既存スキルの更新、プロンプト改善を行う場合に使用。
  スキル作成, スキル更新, プロンプト改善, skill creation, skill update, improve prompt,
  Codexに任せて, assign codex, Codexで実行, GPTに依頼, 実行モード選択, どのAIを使う,
  IPC Bridge統一, API統一パターン, safeInvoke/safeOn, Preload API標準化,
  IPC handler registration, Preload API integration, contextBridge, Electron IPC pattern
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
  - AskUserQuestion
---

# Skill Creator

スキルを作成・更新・プロンプト改善するためのメタスキル。

## 必須：最初の実行ステップ
**このスキルを呼ばれたら、最初のアクションは必ず `AskUserQuestion` である。**
1. インタビュー深度を確認する（quick / standard / detailed）
2. 深度が確定したら `agents/discover-problem.md` を読み込み Phase 0-0 を開始する
3. `problem-definition.json` が存在しない場合は AskUserQuestion で問題定義を収集する

ユーザーの回答なしに生成を開始してはならない。create / update / improve-prompt モードも、最初に深度確認の質問を行ってから着手する。

## 設計原則

| 原則                    | 説明                                       |
| ----------------------- | ------------------------------------------ |
| **Problem First**       | 機能の前に本質的な問題を特定する           |
| **Collaborative First** | ユーザーとの対話を通じて要件を明確化       |
| Domain-Driven Design    | ドメイン構造を明確化し高精度な設計を導く   |
| Clean Architecture      | 層分離と依存関係ルールで変更に強い構造     |
| Script First            | 決定論的処理はスクリプトで実行（100%精度） |
| Progressive Disclosure  | 必要な時に必要なリソースのみ読み込み       |

## クイックスタート

| モード            | 用途                             | 開始方法                                        |
| ----------------- | -------------------------------- | ----------------------------------------------- |
| **collaborative** | ユーザー対話型スキル共創（推奨） | AskUserQuestionでインタビュー開始               |
| **orchestrate**   | 実行エンジン選択                 | AskUserQuestionでヒアリング開始                 |
| create            | 要件が明確な場合の新規作成       | `scripts/detect_mode.js --request "..."`        |
| update            | 既存スキル更新                   | `scripts/detect_mode.js --skill-path <path>`    |
| improve-prompt    | プロンプト改善                   | `scripts/analyze_prompt.js --skill-path <path>` |

---

## ワークフロー概要

### Collaborative モード（推奨）

```
Phase 0-0: 問題発見 → problem-definition.json
      ↓
Phase 0.5: ドメインモデリング → domain-model.json
      ↓
Phase 0-1〜0-8: インタビュー → interview-result.json
      ↓
[分岐] multiSkillPlan がある場合:
  Phase 0.9: マルチスキル設計 (design-multi-skill) → multi-skill-graph.json
  → 各サブスキルに対して以下を繰り返し:
      ↓
リソース選択: select-resources.md → resource-selection.json
      ↓
Phase 1: 要求分析 → Phase 2: 設計
      ↓
[条件] skillDependencies がある場合:
  Phase 2.5: 依存関係解決 (resolve-skill-dependencies) → skill-dependency-graph.json
      ↓
Phase 3: 構造計画 → Phase 4: 生成
      ↓
[条件] externalCliAgents がある場合:
  Phase 4.5: 外部CLIエージェント委譲 (delegate-to-external-cli) → external-cli-result.json
      ↓
Phase 5: レビュー (quick-validate) → Phase 6: 検証 (validate-all)
```

📖 [agents/discover-problem.md](.claude/skills/skill-creator/agents/discover-problem.md) — 根本原因分析
📖 [agents/model-domain.md](.claude/skills/skill-creator/agents/model-domain.md) — DDD/Clean Architecture
📖 [agents/interview-user.md](.claude/skills/skill-creator/agents/interview-user.md)
📖 [agents/select-resources.md](.claude/skills/skill-creator/agents/select-resources.md)

### Runtime ワークフロー状態遷移

Renderer から IPC 経由で駆動する Runtime Skill Creator ワークフロー:

```
plan → review (awaiting user input) → execute → verify → [pass] handoff
                ↑ needs_changes              ↑          → [fail] improve → reverify → ...
                └──────────────────┘         │
                ↑ reject (verification)      │
                └────────────────────────────┘
```

#### submitUserInput phase transition semantics（TASK-SDK-04-U1）

`submitUserInput()` は `awaitingUserInput.reason` と `selectedOptionId` に基づき phase 遷移を適用する:

| reason                | selectedOptionId   | 遷移                                                   |
| --------------------- | ------------------ | ------------------------------------------------------ |
| `plan_review`         | `ready_to_execute` | currentPhase → `execute`                               |
| `plan_review`         | `needs_changes`    | currentPhase → `plan`                                  |
| `verification_review` | `approve`          | verifyResult: `pass` / `handoff`                       |
| `verification_review` | `improve`          | verifyResult.nextAction: `improve`                     |
| `verification_review` | `reject`           | currentPhase → `plan`, verifyResult: `fail` / `review` |

遷移発生時は `phase_transition` artifact（`fromPhase`, `toPhase`, `reason`, `selectedOptionId`）を記録する。未知の reason/option は no-op フォールバック。

| Phase       | IPC チャネル                           | 型                                  |
| ----------- | -------------------------------------- | ----------------------------------- |
| plan        | `skill-creator:plan`                   | `SkillCreatorPlanResult`            |
| review      | `skill-creator:submit-user-input`      | `SkillCreatorUserInputRequest`      |
| execute     | `skill-creator:execute-plan`           | `SkillCreatorExecutePlanResult`     |
| verify      | `skill-creator:get-verify-detail`      | `RuntimeSkillCreatorVerifyDetail`   |
| reverify    | `skill-creator:reverify-workflow`      | `RuntimeSkillCreatorReverifyResult` |
| improve     | `skill-creator:improve-skill`          | `RuntimeSkillCreatorImproveResult`  |
| state query | `skill-creator:get-workflow-state`     | `SkillCreatorWorkflowState`         |
| state push  | `skill-creator:workflow-state-changed` | (event)                             |
| SDK 正規化  | `skill-creator:normalize-sdk-messages` | `SkillCreatorSdkEvent`              |

#### plan エラーレスポンス（TASK-RT-01）

`RuntimeSkillCreatorFacade` の LLMAdapter からのエラーは `RuntimeSkillCreatorPlanErrorResponse` として propagate される（TASK-RT-01 で silent failure → explicit error response へ改善）。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `status` | `"error"` | plan フェーズのエラーを示す固定値 |
| `degradedReason` | `RuntimeSkillCreatorDegradedReason` | 劣化理由（`llm_unavailable` / `api_key_missing` / `unknown` 等） |

Renderer はこのレスポンスを受け取った場合、`plan.status === "error"` + `degradedReason` で劣化状態を UI に表示する。

#### AskUserQuestion MCP カスタムツール（TASK-SDK-SC-01）

SDK セッション（`SkillCreatorSdkSession`）は `createSdkMcpServer` + `tool` API で `AskUserQuestion` をカスタム MCP ツールとして提供する。ユーザー入力が必要なときは必ずこのツールを呼び出す。

**ツール名**: `AskUserQuestion`

| パラメータ    | 型                                                                 | 必須 | 説明                                               |
| ------------- | ------------------------------------------------------------------ | ---- | -------------------------------------------------- |
| `question`    | `string`                                                           | ✓    | ユーザーに提示する質問文                           |
| `type`        | `"single_select" \| "multi_select" \| "free_text" \| "secret" \| "confirm"` | —    | 入力種別（省略時は `free_text`）                   |
| `options`     | `Array<{ value?: string; label?: string; description?: string; preview?: string }>` | —    | `single_select` / `multi_select` 時の選択肢        |
| `placeholder` | `string`                                                           | —    | `free_text` 時の入力欄ヒント文字列                 |

呼び出し例:
```json
{
  "question": "インタビューの深度を選んでください",
  "type": "single_select",
  "options": [
    { "value": "quick",    "label": "Quick（最小限）" },
    { "value": "standard", "label": "Standard（推奨）" },
    { "value": "detailed", "label": "Detailed（詳細）" }
  ]
}
```

ツールが返す値はユーザーが入力したテキスト（`multi_select` の場合は JSON 配列文字列、`confirm` の場合は `"true"` / `"false"`）。

#### ユーザー入力ブリッジ（5種）

| kind            | 用途                  | 例                      |
| --------------- | --------------------- | ----------------------- |
| `single_select` | 選択肢から1つ選択     | plan review の承認/却下 |
| `multi_select`  | 選択肢から複数選択    | interview で利用機能を複数選ぶ |
| `free_text`     | 自由テキスト入力      | フィードバックコメント  |
| `secret`        | 秘匿入力（APIキー等） | LLM API キー            |
| `confirm`       | Yes/No 確認           | reverify 実行確認       |

#### Verify Detail Surface（layer3/layer4）

`RuntimeSkillCreatorVerifyDetail` は layer3（構造検証）と layer4（品質検証）の check を自動生成する。
各 check は `info` / `warning` / `error` の severity を持ち、`reverifyEligible` フラグで再検証可否を判定する。
`disabledReason` は 4段階（`no_plan` / `already_running` / `all_checks_pass` / `cooldown`）で UI の disable 理由を通知する。

#### 動的リソース選択（PhaseResourcePlanner / SkillCreatorSourceResolver）

- **PhaseResourcePlanner**: max bytes ベースの context budget で `required-core` / `required-context` / `optional-quality` / `optional-deep-dive` の 4 tier にリソースを分類し、budget 超過時は下位 tier を自動カットする。
- **SkillCreatorSourceResolver**: manifest 定義と fallback 候補（`.claude/skills/skill-creator` / `.agents/skills/skill-creator`）の競合を structure signature で解決し、`manifest` / `bundled` / `project` の source mode を確定する。
- **SkillCreatorWorkflowSourceProvenance**: 解決結果を `resolvedSkillCreatorRoot` / `resourceDescriptorHash` / `manifestPath` / `manifestCacheKey` として plan result に埋め込む。

#### Session Persistence & Resume（TASK-SDK-08）

- **`SkillCreatorPersistedWorkflowCheckpoint`**: phase boundary で生成される永続化単位。`checkpointId` / `planId` / `workflowStateSnapshot` / `revision` / `lease` を持つ。
- **`WorkflowCheckpointLease`**: stale write guard 用。`ownerInstanceId` / `leaseExpiresAt` / `acquiredAt` で排他制御する。
- **`ResumeCompatibilityResult`**: resume 可否評価結果。`status` / `reasons: ResumeIncompatibilityReason[]` / `warnings` を返す。
- **`ResumeIncompatibilityReason`**: `"version_mismatch"` | `"route_type_mismatch"` | `"manifest_cache_key_mismatch"` の3種。
- **`SkillCreatorWorkflowEngine.hydrateFromCheckpoint(checkpoint)`**: persisted checkpoint から `SkillCreatorWorkflowStateSnapshot` を復元するメソッド。

#### SDKMessage 正規化（TASK-RT-06）

- **`SkillCreatorSdkEvent`**: `query()` が返す生 `SDKMessage` を lane 安定契約へ変換した結果型。`eventType: "init" | "assistant" | "result" | "error"` で分類。UI / IPC / WorkflowEngine はこの型のみを消費する。
- **`SkillCreatorSdkEventSourceProvenance`**: `sourceRoot` / `manifestHash` を含む source 解決結果。`SkillCreatorSdkEvent` に埋め込む。
- **`sdkMessageNormalizer.ts`**: `apps/desktop/src/main/services/runtime/` に配置。IPC チャネル `skill-creator:normalize-sdk-messages` 経由で提供する。

#### verify → improve → re-verify 閉ループ（TASK-P0-02）

`verifyAndImproveLoop()` は verify → improve → re-verify のサイクルを自動的に回す閉ループパイプライン。

| フェーズ | 処理 |
| ------- | ---- |
| verify | `skill-creator:get-verify-detail` を実行し、check 結果を取得 |
| improve | `failedChecks`（error/warning）のみを LLM 改善入力に渡す。`info` は除外 |
| re-verify | improve 適用後に再度 verify を実行 |

**ループ制御**（`RuntimeSkillCreatorFacadeDeps.maxImproveRetry`）:
- デフォルト 3、範囲 1-10（範囲外は自動クランプ）
- 直前の improve 要約を次回 feedback に合成（feedback memory）し、同一修正の繰り返しを抑制
- 全 check PASS → `finalStatus: "pass"` で正常終了
- `maxImproveRetry` 到達 → `loopExhausted: true`、ユーザー判断を要求

**結果型**: `RuntimeSkillCreatorVerifyAndImproveResult`（`finalStatus`, `totalAttempts`, `finalChecks`, `loopExhausted`, `errorMessage?`, `workflowSnapshot`）

#### execute() → SkillFileWriter persist 統合（TASK-P0-05）

`execute()` の Step 3.5-3.6 で LLM 応答からスキルコンテンツを抽出し、ファイルシステムへ永続化する。

**二重パイプライン設計**:

| 経路 | パイプライン | 正式度 | 説明 |
| --- | --- | --- | --- |
| A経路 | Facade → `parseLlmResponseToContent()` → `SkillFileWriter.persist()` | 正式経路 | execute() 内で直接コンテンツ抽出・永続化 |
| B経路 | `SkillCreatorOutputHandler` → `SkillRegistry` | 別系統 | IPC Bridge 経由のセッション完了時パイプライン |

**Setter Injection**: `SkillFileWriter` は `RuntimeSkillCreatorFacadeDeps.skillFileWriter?` で optional inject。未注入時は `console.warn` で警告し persist をスキップ（graceful degradation）。

**結果型拡張**: `SkillExecuteResult` に以下のフィールドを追加:
- `persistResult: PersistResult | null` - persist 成功時の書き込み結果
- `persistError: string | null` - persist 中の例外メッセージ（スキル実行自体の成否とは独立）

### Orchestrate モード

実行エンジン選択: `claude` | `codex` | `gemini` | `claude-to-codex`

📖 [references/execution-mode-guide.md](.claude/skills/skill-creator/references/execution-mode-guide.md)

---

## リソース一覧

| カテゴリ    | 詳細参照                     |
| ----------- | ---------------------------- |
| agents/     | [resource-map.md#agents]     |
| references/ | [resource-map.md#references] |
| scripts/    | [resource-map.md#scripts]    |
| assets/     | [resource-map.md#assets]     |
| schemas/    | [resource-map.md#schemas]    |

📖 [references/resource-map.md](.claude/skills/skill-creator/references/resource-map.md)

---

## 主要エントリポイント

| 用途                     | リソース                                             |
| ------------------------ | ---------------------------------------------------- |
| 問題発見                 | agents/discover-problem.md                           |
| ドメインモデリング       | agents/model-domain.md                               |
| インタビュー             | agents/interview-user.md                             |
| リソース選択             | agents/select-resources.md                           |
| 要求分析                 | agents/analyze-request.md                            |
| スクリプト生成           | agents/design-script.md                              |
| オーケストレーション     | agents/design-orchestration.md                       |
| クロススキル依存関係解決 | agents/resolve-skill-dependencies.md                 |
| 外部CLIエージェント委譲  | agents/delegate-to-external-cli.md                   |
| マルチスキル同時設計     | agents/design-multi-skill.md                         |
| フィードバック記録       | scripts/log_usage.js                                 |
| Phase 12 再監査同期      | assets/phase12-system-spec-retrospective-template.md |

---

## 機能別ガイド

| 機能                         | 参照先                                       |
| ---------------------------- | -------------------------------------------- |
| **問題発見フレームワーク**   | references/problem-discovery-framework.md    |
| **ドメインモデリング**       | references/domain-modeling-guide.md          |
| **Clean Architecture**       | references/clean-architecture-for-skills.md  |
| **プロンプト生成ポリシー**   | references/prompt-generation-policy.md       |
| **スクリプト/LLM分担**       | references/script-llm-patterns.md            |
| **クロススキル参照パターン** | references/cross-skill-reference-patterns.md |
| **外部CLIエージェント統合**  | references/external-cli-agents-guide.md      |
| スクリプト生成               | references/script-types-catalog.md           |
| ワークフローパターン         | references/workflow-patterns.md              |
| オーケストレーション         | references/orchestration-guide.md            |
| 実行モード選択               | references/execution-mode-guide.md           |
| ドキュメント生成             | references/api-docs-standards.md             |
| Phase 12 再監査              | references/update-process.md, `references/output-patterns.md`, `references/patterns-success-ipc-auth.md`, `references/patterns-success-ipc-auth-b.md`, `references/patterns-success-skill-phase12.md`, `references/patterns-success-skill-phase12-b.md`, `references/patterns-success-testing-security.md`, `references/patterns-failure-misc.md`, `references/patterns-failure-phase12.md`, `references/patterns-pitfall-phase12.md`, `references/patterns-pitfall-testing-ui.md` |
| 自己改善サイクル             | references/self-improvement-cycle.md         |
| ライブラリ管理               | references/library-management.md             |

### 追加リファレンス

| カテゴリ             | 参照先                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 基礎設計             | `references/abstraction-levels.md`, `references/core-principles.md`, `references/creation-process.md`, `references/update-process.md`, `references/skill-structure.md`, `references/naming-conventions.md`, `references/quality-standards.md`, `references/prompt-generation-policy.md`                                                                                    |
| ヒアリング・設計補助 | `references/interview-guide.md`, `references/goal-to-api-mapping.md`, `references/variable-template-guide.md`, `references/event-trigger-guide.md`                                                                                                                                                                                                                      |
| 実装・統合           | `references/api-integration-patterns.md`, `references/integration-patterns.md`, `references/integration-patterns-rest.md`, `references/integration-patterns-graphql.md`, `references/integration-patterns-webhook.md`, `references/integration-patterns-ipc.md`, `references/runtime-guide.md`, `references/script-commands.md`, `references/official-docs-registry.md` |
| 実行・運用           | `references/parallel-execution-guide.md`, `references/scheduler-guide.md`, `references/skill-chain-patterns.md`, `references/codex-best-practices.md`                                                                                                                                                                                                                   |

---

## フィードバック（必須）

実行後は必ず記録：

```bash
node scripts/log_usage.js --result success --phase "Phase 4"
node scripts/log_usage.js --result failure --phase "Phase 3" --error "ValidationError"
```

---

## 設計タスク向けオーケストレーション

設計タスク（Phase 1-3中心）では実装タスクと異なるエージェント戦略が有効。

### 設計タスクのフェーズ戦略

| Phase     | 実装タスクとの差異                                                             | 備考                                 |
| --------- | ------------------------------------------------------------------------------ | ------------------------------------ |
| Phase 4-8 | テスト作成・実装が「型定義・仕様書作成」に置き換わる                           | コードテストではなく仕様整合性テスト |
| Phase 9   | `pnpm lint/typecheck` ではなく `quick_validate.js` でゲート                    | 仕様書品質検証                       |
| Phase 11  | UI テストではなく設計文書ウォークスルー（SF-01）                               | NON_VISUAL 判定                      |
| Phase 12  | システム仕様書更新は2段階方式（SF-02）、未タスクは実装タスク4パターン（SF-03） | `phase-template-phase12.md` 参照     |

📖 [task-specification-creator/references/phase-template-phase11.md](../task-specification-creator/references/phase-template-phase11.md) — SF-01（設計タスク向けウォークスルー）
📖 [task-specification-creator/references/phase-template-phase12.md](../task-specification-creator/references/phase-template-phase12.md) — SF-02/SF-03（設計タスク向け補足）

### 設計タスク並列エージェント戦略

```
Phase 2（設計）並列実行可能なSubAgent分担例:
  SubAgent-A: 型定義・インターフェース設計
  SubAgent-B: API/IPC契約設計
  SubAgent-C: UI/UX仕様設計
  SubAgent-D: セキュリティ/権限設計
```

**注意**: 各SubAgentに割り当てるファイル数は3ファイル以下を推奨（P43対策）。

### Phase 12 再監査ショートカット

- `spec_created` / docs-heavy task を更新する時は、先に [task-specification-creator/references/phase-11-12-guide.md](../task-specification-creator/references/phase-11-12-guide.md) と [task-specification-creator/references/spec-update-workflow.md](../task-specification-creator/references/spec-update-workflow.md) を開く。
- SubAgent lane は `A: system spec`, `B: screenshot evidence`, `C: unassigned formalize`, `D: skill update + mirror` を基本形にする。
- [assets/phase12-system-spec-retrospective-template.md](assets/phase12-system-spec-retrospective-template.md) と `assets/phase12-spec-sync-subagent-template.md` を同じターンで使い、system spec / lessons / backlog / skill update を分離して進める。
- `verify-unassigned-links --source <workflow>/outputs/phase-12/unassigned-task-detection.md`、`audit --diff-from HEAD`、`quick_validate.js` / `validate_all.js`、`diff -qr` をまとめて閉じる。
- NON_VISUAL / docs-heavy / env blocker task では、screen evidence の代替根拠、blocker の絶対パス、既存未タスクとの重複確認結果を同じターンで記録する。
- UI 再撮影がある場合は `theme lock → screenshot evidence → docs/spec sync` の順で閉じ、`NON_VISUAL` のまま止めず `SCREENSHOT + outputs` を優先する。

### P43対策: SubAgent ファイル分割基準

| 状況                        | 対応                                               |
| --------------------------- | -------------------------------------------------- |
| 更新対象が4ファイル以上     | SubAgentを複数に分割し各3ファイル以下に制限        |
| 単一AgentへのRate limit懸念 | ファイルグループを先に決め、SubAgent割り当てを明示 |
| Phase 12 仕様書更新         | 3ファイル/SubAgent に分割（P43 再発防止）          |

📖 [references/parallel-execution-guide.md](references/parallel-execution-guide.md)

## ベストプラクティス

| すべきこと                           | 避けるべきこと                    |
| ------------------------------------ | --------------------------------- |
| 問題を先に特定する（Problem First）  | 機能から設計を始める              |
| Core Domainに集中する                | 全体を均等に設計する              |
| Outcomeでゴール定義                  | Outputでゴール定義する            |
| Script優先（決定論的処理）           | 全リソースを一度に読み込む        |
| LLMは判断・創造のみ                  | Script可能な処理をLLMに任せる     |
| Progressive Disclosure               | 具体例をテンプレートに書く        |
| クロススキル参照は相対パスで         | 絶対パスやハードコードで参照      |
| SubAgentは3ファイル以下/エージェント | 多数ファイルを1エージェントに集中 |
| エージェントプロンプトはprompt-creatorで生成 | skill-creator内で独自フォーマットのプロンプトを書く |
| 1プロンプト5000文字以内・単一責務 | 複数責務を1ファイルに詰め込む |

> **自己参照ノート**: skill-creator自体がクロススキル参照パターンの実例。
> `resolve-skill-dependencies.md` で設計した参照構造は、skill-creatorが他スキルの
> SKILL.mdを読み込んで公開インターフェースを特定する際のパターンそのもの。
