# Phase 3: 設計レビュー

## メタ情報

| 項目         | 内容                         |
| ------------ | ---------------------------- |
| Phase        | 3                            |
| タスクID     | TASK-FIX-EXECUTE-PLAN-FF-001 |
| ステータス   | 未実施                       |
| 担当         | 実装者                       |
| 見積もり時間 | 0.5h                         |

## 目的

Phase 2 の設計が AC-1〜AC-6 を全て満たし、IPC 4 層が整合しているかを確認する。PASS の場合のみ Phase 4 へ進む。MAJOR 指摘がある場合は Phase 2 に戻る。

## 実行タスク

1. AC-1〜AC-6 が設計で満たされているか確認
2. IPC 4 層が全て整合しているか確認
3. 既存 `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` との互換性確認
4. breaking change がないことの確認
5. MAJOR 指摘の有無を判定し、PASS/FAIL を決定する

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容                      |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------- |
| セキュリティ仕様   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | Electron IPC セキュリティ |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | システム全体像            |

## 実行手順

### ステップ 1: AC-1〜AC-6 の設計充足確認

各受入条件を Phase 2 の設計と照合する:

| AC   | 受入条件                                                                        | 対応する設計                                                     | 充足判定 |
| ---- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------- |
| AC-1 | ハンドラーが 100ms 以内に `{ accepted: true, planId }` を返す                   | `void facade.executeAsync()` + 即時 return 設計                  | 確認対象 |
| AC-2 | `executeAsync()` が Agent SDK `query()` を呼ぶ                                  | `RuntimeSkillCreatorFacade.executeAsync` → `engine.execute(req)` | 確認対象 |
| AC-3 | フェーズ遷移時に `webContents.send(STATE_CHANGED, { planId, phase, progress })` | `onPhaseChanged` callback + Facade でのワイヤリング              | 確認対象 |
| AC-4 | `CHANNEL_TIMEOUTS` に `"skill-creator:execute-plan": 1_800_000`                 | Concern 1 の ipc-utils.ts 変更                                   | 確認対象 |
| AC-5 | 既存 `safeInvoke` 互換性（breaking change なし）                                | ハンドラーシグネチャ維持、Renderer 変更なし                      | 確認対象 |
| AC-6 | `onPhaseChanged` callback が型安全                                              | `PhaseChangedCallback` 型定義 + Optional Property                | 確認対象 |

### ステップ 2: IPC 4 層整合性確認

| 層               | 確認内容                                                                 | 結果     |
| ---------------- | ------------------------------------------------------------------------ | -------- |
| 定数定義         | `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` が channels.ts で定義されているか | 確認対象 |
| CHANNEL_TIMEOUTS | `"skill-creator:execute-plan": 1_800_000` が追加されるか                 | 確認対象 |
| ハンドラー登録   | fire-and-forget パターンが正しく登録されるか                             | 確認対象 |
| Preload API      | 既存 invoke API が変更なく動作するか                                     | 確認対象 |

### ステップ 3: 既存インフラとの互換性確認

以下を確認する:

- `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` チャンネルの既存ペイロード型と `{ planId, phase, progress }` が互換しているか
- `emitWorkflowStateChanged()` 既存メソッドが新設計と競合しないか
- `SkillCreatorWorkflowEngine.workflows: Map<string, SkillCreatorWorkflowState>` が複数 planId の並列実行に対応できるか

### ステップ 4: breaking change の確認

以下の変更が Renderer 側（`apps/desktop/src/renderer/`）に影響しないことを確認する:

| 変更                                                                  | Renderer への影響                         | 判定     |
| --------------------------------------------------------------------- | ----------------------------------------- | -------- |
| ハンドラーの戻り値 `{ success: true }` → `{ accepted: true, planId }` | Renderer が戻り値を使用していれば影響あり | 確認必須 |
| `CHANNEL_TIMEOUTS` への追加                                           | Renderer は参照しないため影響なし         | 問題なし |
| `onPhaseChanged` callback 追加                                        | Main Process 内部のため Renderer 影響なし | 問題なし |
| `executeAsync` メソッド追加                                           | Main Process 内部のため Renderer 影響なし | 問題なし |

**注意**: ハンドラーの戻り値変更（`{ success: true }` → `{ accepted: true, planId }`）は breaking change の可能性がある。Renderer 側でこの戻り値を使用しているコードがあれば、合わせて修正するか、後方互換フィールドを追加すること。

### ステップ 5: PASS/FAIL 判定

以下の判定基準に従い、`outputs/phase-3/design-review-result.md` に結果を記録する:

#### PASS 条件

- AC-1〜AC-6 の全てが設計で充足されている
- IPC 4 層の整合性が確認されている
- breaking change がないことが確認されている（または対処方針が明確）
- MAJOR 指摘がゼロ

#### FAIL 条件（Phase 2 に戻る）

- AC のいずれかが設計で充足されていない
- IPC 4 層に整合性の問題がある
- MAJOR な breaking change が未対処
- 型安全性に問題がある

## 多角的チェック観点

- ハンドラーの戻り値変更（`{ success }` → `{ accepted, planId }`）が Renderer 側の `creatorSlice.ts` 等に影響しないか確認したか
- `void facade.executeAsync()` の fire-and-forget が ESLint の `no-floating-promises` ルールに違反しないか確認したか（`void` キーワードで回避）
- `executeAsync` 内のエラーが `throw` せずに `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` で通知されるため、ハンドラーが例外を受け取らない設計になっているか確認したか
- Phase 4 のテストが Red になることが設計から予測できるか（修正前コードに対して）

## 成果物

| 成果物           | パス                                      | 説明                                |
| ---------------- | ----------------------------------------- | ----------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | PASS/FAIL 判定、AC 充足表、指摘事項 |

## 完了条件

- [ ] AC-1〜AC-6 の全てが設計で充足されていることが確認されている
- [ ] IPC 4 層の整合性確認が完了している
- [ ] 既存 `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` との互換性が確認されている
- [ ] ハンドラー戻り値変更の breaking change 影響が調査・記録されている
- [ ] PASS/FAIL 判定が `design-review-result.md` に明記されている
- [ ] MAJOR 指摘がある場合は Phase 2 に戻っている

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（`outputs/phase-3/design-review-result.md`）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 4: テスト作成（TDD Red） へ進む（設計レビュー PASS の場合のみ）
