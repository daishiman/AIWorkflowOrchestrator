# Phase 13: PR 作成 - LLMAdapter 初期化エラー UI 通知・状態公開

## メタ情報

| 項目       | 値                                                      |
| ---------- | ------------------------------------------------------- |
| Phase      | 13 - PR 作成                                            |
| 機能名     | task-rt-01-llm-adapter-error-propagation                |
| 作成日     | 2026-04-04                                              |
| 前Phase    | [Phase 12: ドキュメント更新](phase-12-documentation.md) |
| ステータス | **ユーザー指示待ち（blocked）**                         |

## 目的

Phase 1〜12 で完成した実装・テスト・ドキュメントを GitHub PR としてまとめ、
コードレビューを受けられる状態にする。
**このフェーズはユーザーが PR 作成を明示的に指示したタイミングで実行する。**

## 実行タスク

- **ブランチ確認**: 作業ブランチが正しいことを確認する
- **変更ファイル確認**: `git diff --stat main` でスコープ内の変更のみであることを確認する
- **PR 作成**: `gh pr create` で PR を作成する
- **PR チェックリスト確認**: 品質・セキュリティ・ドキュメント条件を確認する

## 参照資料

| 資料名              | パス                                | 用途          |
| ------------------- | ----------------------------------- | ------------- |
| Phase 12 成果物     | `outputs/phase-12/`                 | PR 本文・説明 |
| Phase 10 ゲート判定 | `outputs/phase-10/gate-decision.md` | 品質確認結果  |

## ブロック理由

PR 作成はリモートリポジトリへの push を伴うため、ユーザーの明示的な指示が必要。

## 実行条件

- [ ] Phase 1〜12 が全て完了している
- [ ] ユーザーから「PR を作成してください」等の明示的な指示がある

---

## PR 作成手順

### 1. ブランチ確認

```bash
git branch --show-current
# 期待: feat/task-rt-01-llm-adapter-error-propagation（または同等）
```

### 2. 変更ファイル確認

```bash
git status
git diff --stat main
```

### 3. コミット状態確認

```bash
git log main..HEAD --oneline
```

### 4. PR 作成

```bash
gh pr create \
  --title "feat(skill-creator): LLMAdapter 初期化エラーの UI 通知・状態公開 (TASK-RT-01)" \
  --body "$(cat <<'EOF'
## 概要

LLMAdapter 初期化失敗時に IPC 経由で Renderer に即時通知し、
`SkillLifecyclePanel` 上部にエラーバナーを表示する機能を追加する。

closes #1879

## 変更内容

### 追加
- `LLMAdapterStatusPayload` 型 (`shared/types/skillCreator.ts`)
- IPC チャネル `skill-creator:get-adapter-status` (invoke/pull)
- IPC チャネル `skill-creator:adapter-status-changed` (on/push)
- `RuntimeSkillCreatorFacade.onAdapterStatusChanged` コールバック
- `LLMAdapterErrorBanner` コンポーネント
- `useLLMAdapterStatus` フック（pull + push による状態管理）
- `SkillLifecyclePanel` へのエラーバナー統合

### テスト追加
- `creatorHandlers.adapterStatus.test.ts`（IPC ハンドラ 12 件）
- `LLMAdapterErrorBanner.test.tsx`（コンポーネント 13 件）
- `useLLMAdapterStatus.test.ts`（フック 9 件）

## テスト計画

- [x] `pnpm --filter @repo/desktop vitest run`（全テスト GREEN）
- [x] `pnpm --filter @repo/desktop typecheck`（型チェック PASS）
- [x] `pnpm --filter @repo/desktop lint`（ESLint PASS）
- [x] 手動テスト: APIキー未設定時のエラーバナー表示確認
- [x] 手動テスト: 有効なAPIキー設定時のバナー非表示確認

## スコープ外（別タスク）

- APIキー設定 UI (`TASK-RT-04`)
- `execute()` / `improve()` のアダプタガード
- LLMAdapterFactory の retry logic

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## PR チェックリスト

### コード品質

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS している
- [ ] `pnpm --filter @repo/desktop lint` が PASS している
- [ ] 新規追加テストが全て PASS している
- [ ] 既存テストがリグレッションしていない

### セキュリティ

- [ ] 新規 IPC ハンドラに `validateIpcSender` が適用されている
- [ ] `ALLOWED_INVOKE_CHANNELS` / `ALLOWED_ON_CHANNELS` に追加済み

### ドキュメント

- [ ] `api-ipc-agent-core.md` が更新されている
- [ ] CHANGELOG が更新されている

### 受入条件

- [ ] AC-1〜AC-8 が全て満たされている（Phase 9 照合済み）

---

## PR タイトル規則

```
feat(skill-creator): LLMAdapter 初期化エラーの UI 通知・状態公開 (TASK-RT-01)
```

関連 Issue: [#1879](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1879)

## 多角的チェック観点（AIが判断）

| 観点          | 確認内容                                           |
| ------------- | -------------------------------------------------- |
| PR スコープ   | スコープ外の変更が混入していないか                 |
| コミット品質  | コミットメッセージが変更内容を明確に説明しているか |
| closes リンク | `closes #1879` が PR body に含まれているか         |

## サブタスク管理

| ID      | 内容                   | ステータス |
| ------- | ---------------------- | ---------- |
| ST-13-1 | ブランチ・コミット確認 | 未実施     |
| ST-13-2 | PR 作成コマンド実行    | 未実施     |
| ST-13-3 | PR チェックリスト確認  | 未実施     |

## 成果物

| 成果物    | 場所                                                                  |
| --------- | --------------------------------------------------------------------- |
| GitHub PR | `https://github.com/daishiman/AIWorkflowOrchestrator/pulls`（作成後） |

## 完了条件

- [ ] PR が作成されている
- [ ] PR チェックリストが全て ✅ になっている
- [ ] `closes #1879` が PR body に含まれている
- [ ] CI が全て GREEN である

## タスク100%実行確認【必須】

- [ ] 上記「完了条件」を全て達成した
- [ ] `artifacts.json` の Phase 13 を `completed` に更新した

---

**このタスクは完了です。** TASK-RT-01 の全 Phase が完了しました。
