# Phase 10: 最終レビュー

## メタ情報

| 項目         | 内容                         |
| ------------ | ---------------------------- |
| Phase        | 10                           |
| タスクID     | TASK-FIX-EXECUTE-PLAN-FF-001 |
| ステータス   | 未実施                       |
| 担当         | 実装者                       |
| 見積もり時間 | 0.5h                         |

## 目的

Phase 1〜9 の全成果物を総合的に確認し、PR 作成（Phase 13）に向けてリリース可否を判定する。AC-1〜AC-6 が全て満たされていることを最終確認する。

## 実行タスク

1. AC-1〜AC-6 の充足を成果物から確認する
2. テスト品質の最終確認（TC-T1〜T4 全て PASS）
3. コード品質の最終確認（typecheck / lint）
4. Phase 11 手動テストへの準備確認
5. Phase 12 ドキュメント更新への準備確認
6. リリース可否判定を記録する

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容                      |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------- |
| セキュリティ仕様   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | Electron IPC セキュリティ |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | システム全体像            |

## 実行手順

### ステップ 1: AC 充足の最終確認

| AC   | 受入条件                                                       | 成果物 / 証拠                  | 判定 |
| ---- | -------------------------------------------------------------- | ------------------------------ | ---- |
| AC-1 | ハンドラーが 100ms 以内に `{ accepted: true, planId }` を返す  | TC-T2-01 PASS                  | TBD  |
| AC-2 | `executeAsync()` が Agent SDK `query()` を呼ぶ                 | TC-T2-02, TC-T4-01 PASS        | TBD  |
| AC-3 | フェーズ遷移時に `webContents.send(STATE_CHANGED, ...)` が発火 | TC-T3-02, TC-T4-01 PASS        | TBD  |
| AC-4 | `CHANNEL_TIMEOUTS['skill-creator:execute-plan']` === 1_800_000 | TC-T1-01, TC-T1-02 PASS        | TBD  |
| AC-5 | 既存 `safeInvoke` 互換性（breaking change なし）               | Phase 9 全テスト PASS          | TBD  |
| AC-6 | `onPhaseChanged` が型安全に定義                                | TC-T3-04 PASS、型チェック PASS | TBD  |

### ステップ 2: リリース可否チェックリスト

#### 機能要件

- [ ] AC-1: ハンドラーが 100ms 以内に `{ accepted: true, planId }` を返す
- [ ] AC-2: `executeAsync` がバックグラウンドで Agent SDK `query()` を呼ぶ
- [ ] AC-3: 各フェーズ遷移で `webContents.send(SKILL_CREATOR_WORKFLOW_STATE_CHANGED, ...)` が発火する
- [ ] AC-4: `CHANNEL_TIMEOUTS` に `"skill-creator:execute-plan": 1_800_000` が登録されている
- [ ] AC-5: 既存 `safeInvoke` 互換性が保たれている（Renderer 変更なし）
- [ ] AC-6: `SkillCreatorWorkflowEngine.onPhaseChanged` が型安全に定義されている

#### テスト品質

- [ ] TC-T1-01〜02（CHANNEL_TIMEOUTS）が PASS している
- [ ] TC-T2-01〜07（fire-and-forget ハンドラー）が PASS している
- [ ] TC-T3-01〜06（onPhaseChanged）が PASS している
- [ ] TC-T4-01〜02（executeAsync エラー処理）が PASS している

#### 技術品質

- [ ] `pnpm --filter @repo/desktop typecheck` PASS
- [ ] `pnpm --filter @repo/desktop lint`（修正ファイル）PASS
- [ ] `pnpm --filter @repo/desktop exec vitest run` 全体 PASS

#### 準備状態

- [ ] Phase 11 手動テストの実行環境（Electron アプリ）が起動可能
- [ ] Phase 12 ドキュメント更新に必要な情報が揃っている

### ステップ 3: 最終判定

以下の基準で判定する:

**RELEASE OK（Phase 11 へ進む）**:

- AC-1〜AC-6 が全て充足
- テスト品質チェックリストが全て PASS
- 技術品質チェックリストが全て PASS

**BLOCKED（前 Phase へ戻る）**:

- いずれかの AC が未充足
- テスト失敗が残存
- 型エラーまたは ESLint エラーが残存

## 多角的チェック観点

- 30 分スキル生成タスクが実際に完了まで実行できる保証があるか（`CHANNEL_TIMEOUTS` + fire-and-forget の組み合わせ）
- Renderer 側が戻り値 `{ accepted: true, planId }` を受け取った後、`SKILL_CREATOR_WORKFLOW_STATE_CHANGED` イベントを待つ処理になっているか確認したか
- Phase 11 の手動テストで確認する「NON_VISUAL 理由」が準備されているか

## 成果物

| 成果物           | パス                                      | 説明                                            |
| ---------------- | ----------------------------------------- | ----------------------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | AC 充足表、チェックリスト結果、リリース可否判定 |

## 完了条件

- [ ] AC-1〜AC-6 の全充足が成果物から確認されている
- [ ] テスト品質チェックリストが全て PASS している
- [ ] 技術品質チェックリストが全て PASS している
- [ ] リリース可否判定（RELEASE OK / BLOCKED）が明記されている
- [ ] Phase 11 手動テストへの準備が整っていることが確認されている

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（`outputs/phase-10/final-review-result.md`）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 11: 手動テスト へ進む（最終レビュー RELEASE OK の場合のみ）
