---
name: ipc-preload-spec-sync-guardian
description: |
  task-9D〜9J の IPC/Preload 仕様差分を短時間で検出し、仕様書を現行実体へ同期するスキル。
  `preload/channels.ts` / `preload/skill-api.ts` / `preload/types.ts` と `packages/shared/src/types/skill-*.ts` の整合を優先する。
  UT-SDK-07 以降は `packages/shared/src/ipc/channels.ts` が APPROVAL/EXECUTION チャネルの正本となり、
  `preload/channels.ts` は shared から import する構造に変わった。この shared channels 層も監査スコープに含む。

  Anchors:
  • Lean Software Development / 適用: 小さな差分の継続是正 / 目的: 手戻り最小化
  • Clean Architecture / 適用: 契約境界（IPC/Preload/Shared Types/Shared IPC） / 目的: ドリフト防止
  • TDD by Specification / 適用: grep・監査スクリプト先行 / 目的: 変更の再現性確保

  Trigger:
  task-9D〜9J 仕様書で path drift / artifacts drift / IPC命名差分を検出した時に使う。
  task-9d, task-9e, task-9f, task-9g, task-9h, task-9i, task-9j, ipc, preload, channels, skill-api, artifacts, spec alignment, approval:respond, approval:request, execution:get-disclosure-info, execution:get-terminal-log, execution:get-copy-command, approvalHandlers, disclosureHandlers, advancedConsoleHandlers,
  skill-creator:get-workflow-state, skill-creator:submit-user-input, skill-creator:workflow-state-changed, skill-creator:get-verify-detail, skill-creator:request-reverify,
  skill-creator:configure-api, skill-creator:api-configured, skill-creator:api-test-result, skill-creator:external-api-config-required,
  SKILL_CREATOR_EXTERNAL_API_CHANNELS, ExternalApiConnectionConfig, skillCreatorExternalApi,
  UT-SDK-07, shared-ipc-channel, packages/shared/src/ipc/channels, APPROVAL_CHANNELS, EXECUTION_CHANNELS, SKILL_CREATOR_EXTERNAL_API_CHANNELS, shared channel migration
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
---

# IPC Preload Spec Sync Guardian

## 概要

task-9D〜9J 仕様書の「旧参照パス」「artifacts不整合」「型配置ズレ」を監査し、最小差分で修正する。
コード実装は行わず、仕様書とシステム仕様の同期を目的とする。

## ワークフロー

### Phase 1: 監査スコープ固定

**目的**: 対象を限定し、全体ノイズと今回差分を分離する。

**アクション**:
1. 対象を `task-022-task-9f` と `task-023[a-f]-task-9*` に固定する。
2. 監査基準を `references/spec-sync-checklist.md` で確定する。

### Phase 2: 並列監査

**目的**: 旧パス残存と artifacts 欠落を同時検出する。

**アクション**:
1. `scripts/audit_task9_spec_sync.js` を実行する。
2. `oldPaths` と `missingArtifacts` を分離して報告する。

### Phase 3: 仕様書修正

**目的**: 現行実体に合わせた最小修正を適用する。

**アクション**:
1. `preload/skillAPI.ts` を `preload/skill-api.ts` に統一する。
2. `main/ipc/channels.ts` を `preload/channels.ts` に統一する。
3. `packages/shared/src/types/skill-*.ts` と `packages/shared/src/types/index.ts` を artifacts に反映する。
4. **UT-SDK-07 以降（2026-03-29〜）**: APPROVAL/EXECUTION チャネルの正本は `packages/shared/src/ipc/channels.ts`。
   - 仕様書が `preload/channels.ts` を直接参照している場合、`@repo/shared/src/ipc/channels` 経由への import 変更を確認する。
   - `APPROVAL_CHANNELS` / `EXECUTION_CHANNELS` は `packages/shared/src/ipc/channels.ts` で定義される。
   - `preload/channels.ts` は shared から re-export/import する構造のため、仕様書の参照パスを shared 側へ更新する。

### Phase 4: システム仕様同期

**目的**: 完了記録・苦戦箇所・再発防止を仕様正本へ反映する。

**アクション**:
1. `aiworkflow-requirements/references/task-workflow.md` に完了記録を追加する。
2. `aiworkflow-requirements/references/lessons-learned.md` に苦戦箇所と簡潔解決手順を追加する。
3. `aiworkflow-requirements/LOGS.md` と `SKILL.md` 変更履歴を同期する。

## SubAgent 分担

| SubAgent | 責務 | 並列可否 |
| --- | --- | --- |
| A | task-9D〜9J 監査と差分抽出 | 可 |
| B | 仕様書修正（artifacts / 参照パス） | 可 |
| C | システム仕様書反映（task-workflow / lessons / logs） | 可 |
| D | 最終整合確認（index再生成・検証） | A/B/C完了後 |

## ベストプラクティス

### すべきこと

- `old path` と `missing artifacts` を別問題として扱う。
- `task-9` 正本と `UT系計画書` を混同しない。
- 変更後に監査スクリプトを再実行してから反映する。

### 避けるべきこと

- 仕様修正タスクで実装コードを同時変更する。
- 残課題テーブル更新なしで完了扱いにする。
- `LOGS.md` と `SKILL.md` の片方だけ更新する。

## リソース参照

### scripts/

| スクリプト | 機能 | 使用例 |
| --- | --- | --- |
| `scripts/audit_task9_spec_sync.js` | task-9D〜9J の旧参照・artifacts不足を監査 | `node scripts/audit_task9_spec_sync.js --format markdown` |
| `scripts/validate_all.js` | スキル構造と監査結果をまとめて検証 | `node scripts/validate_all.js` |
| `scripts/log_usage.js` | 使用ログ記録 | `node scripts/log_usage.js --result success --phase Phase4` |

### agents/

| Task | パス | 責務 |
| --- | --- | --- |
| audit-task9-spec | [agents/audit-task9-spec.md](agents/audit-task9-spec.md) | 監査観点固定と差分抽出 |
| patch-task9-spec | [agents/patch-task9-spec.md](agents/patch-task9-spec.md) | 仕様書修正パッチ設計 |
| sync-system-spec | [agents/sync-system-spec.md](agents/sync-system-spec.md) | task-workflow/lessons/logs同期 |

### references/

| リソース | パス | 読込条件 |
| --- | --- | --- |
| 監査チェックリスト | [references/spec-sync-checklist.md](references/spec-sync-checklist.md) | 修正前 |
| クイック復旧手順 | [references/quick-recovery-playbook.md](references/quick-recovery-playbook.md) | 苦戦時 |
| 実行パターン集 | [references/patterns.md](references/patterns.md) | 改善時 |

## 拡張スコープ: Skill Creator ワークフロー IPC

task-9D〜9J に加えて、以下の Skill Creator ワークフロー IPC チャネルが監査スコープに含まれる。

| チャネル | 方向 | 型定義 |
| --- | --- | --- |
| `skill-creator:get-workflow-state` | invoke | `SkillCreatorWorkflowState` |
| `skill-creator:submit-user-input` | invoke | `SkillCreatorUserInputRequest` |
| `skill-creator:workflow-state-changed` | event (on) | push notification |
| `skill-creator:get-verify-detail` | invoke | `RuntimeSkillCreatorVerifyDetail` |
| `skill-creator:reverify-workflow` | invoke | `RuntimeSkillCreatorReverifyResult` |

これらのチャネルの整合確認先:
- `apps/desktop/src/preload/channels.ts`: IPC_CHANNELS 定数に登録されているか
- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`: handler が登録されているか
- `packages/shared/src/types/skillCreator.ts`: 型定義が存在するか

## 拡張スコープ: Skill Creator 外部API IPC

TASK-SDK-SC-03 で追加された External API Support のIPCチャネル。

| チャネル | 方向 | 型定義 | 定数グループ |
| --- | --- | --- | --- |
| `skill-creator:configure-api` | Renderer → Main (invoke) | `ExternalApiConnectionConfig` | `SKILL_CREATOR_EXTERNAL_API_CHANNELS` |
| `skill-creator:api-configured` | Main → Renderer (event) | 確認応答 | `SKILL_CREATOR_EXTERNAL_API_CHANNELS` |
| `skill-creator:api-test-result` | Main → Renderer (event) | テスト結果 | `SKILL_CREATOR_EXTERNAL_API_CHANNELS` |
| `skill-creator:external-api-config-required` | Main → Renderer (event) | 設定要求通知 | `SKILL_CREATOR_SESSION_CHANNELS` |

これらのチャネルの整合確認先:
- `packages/shared/src/ipc/channels.ts`: `SKILL_CREATOR_EXTERNAL_API_CHANNELS` 定数に登録されているか
- `apps/desktop/src/preload/channels.ts`: `SKILL_CREATOR_EXTERNAL_API_CHANNELS` がスプレッドで取り込まれているか
- `apps/desktop/src/preload/skill-creator-api.ts`: Preload APIで `ExternalApiConnectionConfig` 型が使用されているか
- `apps/desktop/src/preload/skill-creator-session-api.ts`: `EXTERNAL_API_CONFIG_REQUIRED` イベント購読が実装されているか
- `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts`: handler が登録されているか
- `packages/shared/src/types/skillCreatorExternalApi.ts`: 型定義（`ExternalApiConnectionConfig`, `ExternalApiAuthType`, `ExternalApiTimeoutError`, `ExternalApiHttpError`, `IExternalApiAdapter`）が存在するか

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.4.0 | 2026-04-03 | TASK-SDK-SC-03 対応: External API IPC 4チャネル（configure-api / api-configured / api-test-result / external-api-config-required）を監査スコープへ追加。`SKILL_CREATOR_EXTERNAL_API_CHANNELS` 定数グループと `packages/shared/src/types/skillCreatorExternalApi.ts` 型定義を整合確認先に追加。Trigger に External API 関連キーワードを登録 |
| 1.3.0 | 2026-03-29 | UT-SDK-07 対応: `packages/shared/src/ipc/channels.ts` を監査スコープへ追加。APPROVAL/EXECUTION チャネルの正本が shared に移管された事実を description・Phase 3・Trigger に反映。Trigger に `UT-SDK-07 / shared-ipc-channel / APPROVAL_CHANNELS / EXECUTION_CHANNELS / shared channel migration` を追加 |
| 1.2.0 | 2026-03-27 | Skill Creator ワークフロー IPC 5 チャネル（get-workflow-state / submit-user-input / workflow-state-changed / get-verify-detail / reverify-workflow）を監査スコープへ追加。Trigger キーワードに同チャネル名を登録 |
| 1.1.0 | 2026-02-25 | 実運用版を作成。task-9D〜9J仕様同期ワークフロー、SubAgent分担、監査スクリプト連携を追加 |
| 1.0.0 | 2026-02-25 | 初版作成 |
