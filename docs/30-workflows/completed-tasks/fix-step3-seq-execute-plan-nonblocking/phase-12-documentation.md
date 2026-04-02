# Phase 12: ドキュメント更新

## メタ情報

| 項目         | 内容                         |
| ------------ | ---------------------------- |
| Phase        | 12                           |
| タスクID     | TASK-FIX-EXECUTE-PLAN-FF-001 |
| ステータス   | 未実施                       |
| 担当         | 実装者                       |
| 見積もり時間 | 1.5h                         |

## 目的

修正内容をシステム仕様書・実装ガイド・スキルフィードバックへ同期し、知識を再利用可能な状態にする。未タスクの検出と記録も行う。

## 実行タスク

1. `implementation-guide.md` の作成（Part 1: 中学生レベル例え話 + Part 2: 技術詳細）
2. `system-spec-update-summary.md` の作成（仕様書更新内容のサマリー）
3. `documentation-changelog.md` の作成（変更履歴）
4. `unassigned-task-detection.md` の作成（未タスク検出）
5. `skill-feedback-report.md` の作成（スキルフィードバック）

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                                                          | 内容                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------- | --------------------------- |
| セキュリティ仕様   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                  | Electron IPC セキュリティ   |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                                  | システム全体像              |
| タスクワークフロー | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                                | 完了タスク記録              |
| IPC 契約整合       | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-ipc-contract-preload-alignment.md` | preload / consumer 契約整合 |
| バックログ         | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                                  | follow-up 未タスク管理      |
| 教訓               | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                                | 再発防止の現在版            |
| 入口導線           | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                                           | 主要入口の再生成            |
| 詳細台帳           | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                              | 関連参照先の再生成          |
| トピック索引       | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                                                 | topic-map の再生成          |

## 実行手順

### ステップ 1: implementation-guide.md の作成

**ファイル**: `outputs/phase-12/implementation-guide.md`

#### Part 1: 中学生レベル例え話

「ボタンを押したら、まず受け付けだけ返して、作業は裏で続け、終わったら別でお知らせが来る仕組み」を中学生でも理解できる言葉で説明する:

- 先に「なぜ必要か」を 1 文で書いてから、「何をするか」を説明する
- 専門用語を使う場合は、必ず直後に言い換える
- 日常生活での例え話を 1 つ以上入れる

**例え話: 宅配注文と配達通知**

従来の仕組み（待ち続ける）:
「宅配会社に電話して注文する。配達員が商品を届けるまで電話を切らずに待つ。30 分後に商品が届いたら電話を切る。→ 電話がつながりっぱなしで 30 分かかり、途中で時間切れになる」

今回の仕組み（先に受け付けだけ返す）:
「宅配会社に電話して注文する。宅配会社が『注文を受け付けました』と言ったら電話を切る。商品が届いたら、あとで『届きました』というお知らせが別でもらえる。→ 最初の電話は 1 秒以内に終わる」

#### Part 2: 技術詳細

1. **型と責務の整理**:
   - `SkillCreatorExecuteAsyncPhase = "executing" | "complete" | "error"` を内部進捗ラベルとして扱う
   - `PhaseChangedCallback(planId, phase, progress)` を `SkillCreatorWorkflowEngine.ts` で export する
   - `onWorkflowStateSnapshot?(planId, snapshot, error?)` を `RuntimeSkillCreatorFacade.ts` の public relay として扱う
   - Renderer には内部 phase 名を公開せず、`SkillCreatorWorkflowUiSnapshot` のみを渡す

2. **API シグネチャと使用例**:
   - `ipcMain.handle("skill-creator:execute-plan")` は即座に `{ accepted: true, planId }` を返す
   - `skillCreatorAPI.executePlan(planId, skillSpec, authMode?, apiKey?)` は公開呼び出しで、preload の正本契約は `IpcResult<SkillCreatorExecutePlanAck>` になっている。Renderer 側は compat path と snapshot relay の両方で遷移を受け取る
   - `skillCreatorAPI.onWorkflowStateChanged(callback)` で Renderer は snapshot を購読する
   - `RuntimeSkillCreatorFacade.executeAsync(planId, args): Promise<void>` は fire-and-forget の内部実行 API であり、`args` は `planId / skillSpec / authMode? / apiKey?` を持つ
   - 使用例:

```typescript
const executeResult = await skillCreatorAPI.executePlan(
  planId,
  skillSpec,
  "api-key",
  null,
);

if (executeResult.success) {
  const unsubscribe = skillCreatorAPI.onWorkflowStateChanged((snapshot) => {
    console.log(snapshot.currentPhase, snapshot.awaitingUserInput);
  });
  // 必要に応じて unsubscribe()
}

// Main Process 側では SkillCreatorExecutePlanRequest 相当の args を受け取り、
// RuntimeSkillCreatorFacade.executeAsync(planId, args) が裏で処理を続ける。
```

3. **エラーハンドリングとエッジケース**:
   - `planId` / `skillSpec` が空なら validation error を返す
   - `executeAsync` の catch では `triggerPhaseTransition(planId, "error", 0)` を呼び、snapshot がない場合のみ `onWorkflowStateSnapshot(planId, null, errorMessage)` を送る
   - `mainWindow` が破棄済みなら `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` の送信をスキップする
   - 複数 planId の並列実行は `workflows: Map<string, ...>` で分離する

4. **設定可能なパラメータと定数**:
   - `IPC_TIMEOUT_MS = 5000`
   - `CHANNEL_TIMEOUTS["skill-creator:execute-plan"] = 1_800_000`
   - `SKILL_CREATOR_WORKFLOW_STATE_CHANGED`
   - `SkillCreatorExecuteAsyncPhase`
   - `SkillCreatorExecutePlanRequest` の `authMode` / `apiKey`
   - `RuntimeSkillCreatorFacade.executeAsync()` の内部 progress は `executing / complete / error` の 3 値で管理する

### ステップ 2: system-spec-update-summary.md の作成

**ファイル**: `outputs/phase-12/system-spec-update-summary.md`

以下の仕様書を更新・参照する:

| 仕様書                                                      | 更新内容                                                                                  | 優先度 |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------ |
| `security-electron-ipc.md`                                  | IPC fire-and-forget パターンを IPC ベストプラクティスとして追記                           | should |
| `api-ipc-system-core.md`                                    | `skill-creator:execute-plan` の ack / snapshot 目標契約と現行 preload/renderer 差分を同期 | must   |
| `architecture-overview.md`                                  | スキル生成フローの非同期アーキテクチャ（fire-and-forget + snapshot relay）を記録          | should |
| `task-workflow-completed.md`                                | TASK-FIX-EXECUTE-PLAN-FF-001 の完了を記録                                                 | must   |
| `task-workflow-completed-ipc-contract-preload-alignment.md` | preload / renderer consumer の契約整合を追記                                              | must   |
| `task-workflow-backlog.md`                                  | `executePlan` consumer の follow-up と timeout cleanup を追記                             | must   |
| `lessons-learned-current.md`                                | fire-and-forget 化と contract drift の教訓を追記                                          | must   |
| `indexes/quick-reference.md`                                | 主要入口の更新                                                                            | must   |
| `indexes/resource-map.md`                                   | 関連参照先の更新                                                                          | must   |
| `indexes/topic-map.md`                                      | トピック別索引の更新                                                                      | must   |

> 仕様書更新後は `node scripts/generate-index.js` を実行し、`indexes/quick-reference.md` / `indexes/resource-map.md` / `indexes/topic-map.md` を再生成する。

### ステップ 3: documentation-changelog.md の作成

**ファイル**: `outputs/phase-12/documentation-changelog.md`

変更履歴:

```
## 2026-04-01

### TASK-FIX-EXECUTE-PLAN-FF-001: skill-creator:execute-plan fire-and-forget 化

**変更ファイル**:
- apps/desktop/src/preload/ipc-utils.ts: CHANNEL_TIMEOUTS に execute-plan 追加
- apps/desktop/src/main/ipc/creatorHandlers.ts: fire-and-forget 化
- apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts: onPhaseChanged callback 追加
- apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts: executeAsync 追加
- docs/30-workflows/fix-step3-seq-execute-plan-nonblocking/: Phase 1-13 の語彙統一と Phase 13 blocked 化
- .claude/skills/aiworkflow-requirements/indexes/{quick-reference,resource-map,topic-map}.md: node scripts/generate-index.js で再生成
- outputs/phase-12/phase12-task-spec-compliance-check.md: Task 1〜5 / Step 1-A〜G / Step 2 parity を記録

**修正内容**: 30 分かかるスキル生成 IPC の非ブロッキング化

**PR**: blocked（ユーザーの明示承認待ち）
```

### ステップ 4: unassigned-task-detection.md の作成

**ファイル**: `outputs/phase-12/unassigned-task-detection.md`

未タスク候補が 0 件でも、必ず `0件` と明記して出力すること。空のままにはしない。`0件でも出力必須`。

本修正の調査・実装過程で検出された未タスク候補:

| 未タスク候補                                            | 内容                                                                                                               | 優先度 | 推奨タスクID                                           |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------ | ------------------------------------------------------ |
| `executePlan` consumer 契約整合                         | `SkillCreateWizard.tsx` / `SkillLifecyclePanel.tsx` が accepted ack と snapshot 購読の両方に整合するか再確認が必要 | high   | TASK-SKILL-CREATOR-EXECUTE-PLAN-CONSUMER-ALIGNMENT-001 |
| `CHANNEL_TIMEOUTS` P0 値の恒久対応                      | 1_800_000 は暫定値。fire-and-forget 完全移行後は `safeInvoke` 呼び出し方式の見直しが必要                           | low    | TASK-IPC-CHANNEL-TIMEOUT-CLEANUP-001                   |
| before-quit guard の実装                                | アプリ終了時にバックグラウンド実行中のスキル生成を適切に処理する機能                                               | medium | 別タスク（要検討）                                     |
| `skill-creator:*` 他ハンドラーの fire-and-forget 化調査 | 同様の問題が他ハンドラーに存在しないか確認                                                                         | low    | TASK-CREATOR-HANDLERS-AUDIT-001                        |

### ステップ 5: skill-feedback-report.md の作成

**ファイル**: `outputs/phase-12/skill-feedback-report.md`

改善点が見つからない場合でも、必ず `改善点なし` を含めて出力すること。`改善点なしでも出力必須`。

`task-specification-creator` スキルへのフィードバック:

1. **良かった点**:
   - Phase 2 の 4 concern 設計が実装との対応が明確
   - Phase 3 の IPC 4 層整合性チェックで breaking change を早期発見

2. **改善提案**:
   - Phase 4 のテストファイルセットアップコードに `planId` と `SkillCreatorExecuteAsyncPhase` の対応をもっと具体的に書く
   - Phase 3 で `executePlan` consumer の契約影響を明示し、Phase 9 まで先送りしない
   - Phase 12 の Part 2 は型 / API / error / edge case / constants を必須見出しとして固定する

### 補助成果物: phase12-task-spec-compliance-check.md の作成

**ファイル**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

`phase12-task-spec-compliance-template.md` をベースに、Task 1〜5 / Step 1-A〜G / Step 2 / artifacts.json parity を 1 ファイルへ集約する。

- `phase-12-documentation.md` の Task 数・成果物数・完了条件と一致させる
- `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` の値を突合する
- `artifacts.json` の phase-12 artifacts と物理成果物の一致を確認する

## 多角的チェック観点

- `implementation-guide.md` の Part 1 が「中学生レベル」（技術用語なしで説明）になっているか確認したか
- `implementation-guide.md` の Part 2 が型定義 / API シグネチャ / 使用例 / エラーハンドリング / edge case / constants をすべて含むか確認したか
- `phase12-task-spec-compliance-check.md` が outputs/phase-12 の 6 成果物目として存在し、artifacts.json と parity しているか確認したか
- `unassigned-task-detection.md` の未タスクが実際の調査・実装過程で発見したものになっているか（架空のタスクを記載していないか）
- `skill-feedback-report.md` の「改善提案」が次回の仕様書品質向上に具体的に役立つ内容になっているか

## 成果物

| 成果物               | パス                                                     | 説明                                                |
| -------------------- | -------------------------------------------------------- | --------------------------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | Part 1 中学生レベル例え話 + Part 2 技術詳細         |
| 仕様書更新サマリー   | `outputs/phase-12/system-spec-update-summary.md`         | 更新対象仕様書と更新内容                            |
| ドキュメント変更履歴 | `outputs/phase-12/documentation-changelog.md`            | 変更ファイル一覧と変更内容                          |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`          | 本タスクで検出された未タスク候補                    |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`              | task-specification-creator スキルへのフィードバック |
| 準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 1〜5 / Step 1-A〜G / Step 2 / artifacts parity |

## 完了条件

- [ ] `implementation-guide.md` の Part 1（中学生レベル例え話）が完成している
- [ ] `implementation-guide.md` の Part 2（技術詳細）が完成している
- [ ] `system-spec-update-summary.md` に更新対象仕様書が記録されている
- [ ] `task-workflow-completed.md` に TASK-FIX-EXECUTE-PLAN-FF-001 の完了が記録されている
- [ ] `unassigned-task-detection.md` に未タスク候補が記録されている
- [ ] `skill-feedback-report.md` に具体的なフィードバックが記録されている
- [ ] `phase12-task-spec-compliance-check.md` に Task 1〜5 / Step 1-A〜G / Step 2 / artifacts parity が記録されている

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（6 ファイル）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 13 は blocked。ユーザーの明示承認後にのみ再開する。
