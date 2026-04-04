# Phase 12: system spec 更新サマリー

## Step 1-A: タスク概要・差分の要点

- **タスク**: TASK-RT-01 — LLMAdapter 初期化エラーの UI 通知・状態公開
- **Baseline**: Facade に `llmAdapterStatus` は存在したが IPC/UI 層が未接続
- **Current**: IPC 2 チャネル + `LLMAdapterErrorBanner` + `useLLMAdapterStatus` で完全接続

## Step 1-B: 実装状況テーブル

| ファイル                                                                  | 状態         | docs-only フラグ |
| ------------------------------------------------------------------------- | ------------ | ---------------- |
| `packages/shared/src/types/skillCreator.ts`                               | 完了         | なし             |
| `apps/desktop/src/preload/channels.ts`                                    | 完了         | なし             |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                            | 完了         | なし             |
| `apps/desktop/src/preload/skill-creator-api.ts`                           | 完了         | なし             |
| `apps/desktop/src/renderer/components/skill/LLMAdapterErrorBanner.tsx`    | 完了（新規） | なし             |
| `apps/desktop/src/renderer/components/skill/hooks/useLLMAdapterStatus.ts` | 完了（新規） | なし             |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`      | 完了         | なし             |

## Step 1-C: 関連タスク・未タスク候補の棚卸し

| タスク     | ステータス | 備考                                    |
| ---------- | ---------- | --------------------------------------- |
| TASK-RT-04 | 完了       | API Key 設定 UI（本タスクのスコープ外） |
| TASK-RT-02 | 完了       | AdapterStatusBadge（別タスク）          |

未タスク候補: なし

## Step 1-D: 変更ファイル一覧

### system spec

- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-core.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`（generate-index.js で再生成）
- `.claude/skills/aiworkflow-requirements/indexes/keywords.json`（generate-index.js で再生成）

### workflow docs

- `outputs/phase-7/coverage-gap-plan.md`
- `outputs/phase-8/refactoring-report.md`
- `outputs/phase-9/quality-check-report.md`
- `outputs/phase-9/ac-verification.md`
- `outputs/phase-10/gate-decision.md`
- `outputs/phase-11/` 全成果物
- `outputs/phase-12/` 全成果物

## Step 1-E: 未タスク指示書の配置先判定

未タスク: **0 件** — 追加の `docs/30-workflows/unassigned-task/` 配置なし

## Step 1-F: validator 実行結果

| validator                                 | 結果                                     |
| ----------------------------------------- | ---------------------------------------- |
| `validate-phase11-screenshot-coverage.js` | ✅ PASS（TC 6/6 カバー）                 |
| `generate-index.js`                       | ✅ PASS（394 ファイル、2689 キーワード） |

## Step 1-G: 計画系文言 残存チェック

```
rg -n "仕様策定のみ|実行予定|保留として記録" outputs/phase-12/ → 0件
```

**残存なし ✅**

---

## Step 2A: 更新対象ファイルと変更内容

| ファイル                           | 変更内容                                                                                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `api-ipc-agent-core.md`            | `skill-creator:get-adapter-status` / `skill-creator:adapter-status-changed` 2 チャネル追加。`LLMAdapterStatusPayload` 型追加。実装状況に「TASK-RT-01」行追加 |
| `ui-ux-feature-components-core.md` | 収録機能一覧に TASK-RT-01 エントリ追加。`LLMAdapterErrorBanner` セクション新設                                                                               |
| `task-workflow-completed.md`       | TASK-RT-01 既存レコードに「フェーズ 2: IPC/UI layer」の実施内容を追記（重複行なし）                                                                          |

## Step 2B: 実更新結果

| ファイル                           | 更新結果                              |
| ---------------------------------- | ------------------------------------- |
| `api-ipc-agent-core.md`            | ✅ 更新済み                           |
| `ui-ux-feature-components-core.md` | ✅ 更新済み                           |
| `task-workflow-completed.md`       | ✅ 更新済み（既存レコードへのパッチ） |
| `indexes/topic-map.md`             | ✅ generate-index.js で再生成済み     |
| `indexes/keywords.json`            | ✅ generate-index.js で再生成済み     |
