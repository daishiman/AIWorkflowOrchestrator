# Phase 13: PR 作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 13                                  |
| Phase名    | PR 作成                             |
| タスクID   | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 |
| 前提Phase  | Phase 12（ドキュメント）            |
| 後続Phase  | なし                                |
| ステータス | not_started                         |
| 作成日     | 2026-03-13                          |
| 更新日     | 2026-03-17                          |
| 機能名     | chatpanel-real-chat-wiring          |

## 目的

> **注記**: 本タスクは「設計」タスクであり、本 Phase は実装仕様書として設計内容を記述する。実際のコード実装は後続の実装タスクで行う。

ChatPanel の実 AI チャット配線の変更をコミットし、ユーザーの明示的な許可を得てから Pull Request を作成し、CI を確認する。

## 実行タスク

- Task 13-1 ブランチ命名と作成: `feature/chatpanel-real-chat-wiring`（07-git-and-tooling.md 準拠）
- Task 13-2 コミット前チェック: `pnpm lint`, `pnpm typecheck`, テスト全 PASS を確認する
- Task 13-3 ユーザーへのローカル動作確認依頼: 変更サマリーを提示し、ローカル確認を依頼する
- Task 13-4 PR 作成: ユーザーの許可後に `/ai:diff-to-pr` を実行する
- Task 13-5 CI 確認: pre-push hook（Phase 1: Lint+Shared Build -> Phase 2: TypeCheck+Tests）の通過を確認する

## 参照資料

| 参照資料                 | パス                        | 内容                               |
| ------------------------ | --------------------------- | ---------------------------------- |
| Phase 1（要件定義）      | `phase-1-requirements.md`   | 要件定義（PR 本文の Summary 参照） |
| Phase 2（設計）          | `phase-2-design.md`         | 設計サマリー（PR 本文参照）        |
| Phase 10（最終レビュー） | `phase-10-final-review.md`  | 最終レビュー報告                   |
| Phase 11（手動テスト）   | `phase-11-manual-test.md`   | 手動テスト結果                     |
| Phase 12（ドキュメント） | `phase-12-documentation.md` | 実装ガイド、更新履歴               |

## 実行手順

### ステップ 1: ブランチ命名と作成（Task 13-1）

```bash
# ブランチ作成（07-git-and-tooling.md 準拠）
git checkout -b feature/chatpanel-real-chat-wiring
```

**命名規則**: `feature/` プレフィックス + 機能名（ケバブケース）

### ステップ 2: コミット前チェック（Task 13-2）

```bash
# TypeScript 型チェック
pnpm --filter @repo/desktop exec tsc --noEmit
# 期待: エラー 0 件

# ESLint
pnpm lint
# 期待: 警告 0 件

# テスト全 PASS
cd apps/desktop && pnpm vitest run
# 期待: 全テスト PASS

# shared パッケージビルド
pnpm --filter @repo/shared build
# 期待: ビルド成功
```

**チェックリスト**:

- [ ] `pnpm lint` が通ること
- [ ] `pnpm typecheck` が通ること
- [ ] 関連テストが全て PASS すること
- [ ] `--no-verify` を使っていないこと（**絶対禁止**）

### ステップ 3: ユーザーへのローカル動作確認依頼（Task 13-3）

ユーザーに以下の変更サマリーを提示し、ローカル確認を依頼する:

**変更サマリー（1-3 箇条書き）**:

1. ChatPanel の 3 箇所の placeholder（model-selector-slot, message-list-slot, chat-input-slot）を実 AI チャットコンポーネントに置換
2. useStreamingChat hook を ChatPanel に接続し、llm:stream-chat 経由のリアルタイム streaming を実装
3. access capability 判定と RuntimeBanner / ErrorGuidance / HandoffBlock による状態別 UI 表示を実装

**Test Plan**:

- `cd apps/desktop && pnpm vitest run src/renderer/components/chat/` で ChatPanel テスト全 PASS
- `cd apps/desktop && pnpm vitest run` で全テスト PASS
- 手動確認: メッセージ送信 -> streaming 表示 -> 完了表示

**重要**: ユーザーから明示的な許可を得るまで PR 作成を実行しない。

### ステップ 4: PR 作成（Task 13-4）

ユーザーの許可後に PR を作成する。

```
/ai:diff-to-pr
```

**PR タイトル**（70 文字以内）:

```
feat(chat): ChatPanel real AI chat wiring with streaming and capability
```

**PR 本文構成**:

1. **Summary**: 変更サマリー（1-3 箇条書き）
2. **Test Plan**: テスト実行コマンドと期待結果
3. **関連 Issue**: `TASK-IMP-CHATPANEL-REAL-AI-CHAT-001`
4. **破壊的変更**: なし（placeholder -> 実コンポーネントへの置換）
5. **スクリーンショット**: Phase 11 の UX-03 証跡（empty / streaming / terminal handoff）

**PR コメント**:

1. コメント 1: 実装詳細、レビュー注意点、テスト方法
2. コメント 2: implementation-guide.md の全文
3. コメント 3: スクリーンショットギャラリー（Phase 11 証跡）

### ステップ 5: CI 確認（Task 13-5）

pre-push hook の 2 フェーズ実行を確認する:

| Phase | 内容                | 期待結果 |
| ----- | ------------------- | -------- |
| 1     | Lint + Shared Build | PASS     |
| 2     | TypeCheck + Tests   | PASS     |

```bash
# CI 状態確認
gh pr checks <PR_NUMBER>
```

### ステップ 6: タスク完了処理

PR 作成後、CI 通過後にタスクディレクトリを完了フォルダに移動する。

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-seq-task-05-chatpanel-real-chat-wiring/ \
   docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep chatpanel

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): chatpanel-real-chat-wiringをcompleted-tasksに移動"
git push
```

## 統合テスト連携

PR 作成前に以下の全テストが PASS していることを確認する:

| テスト種別            | コマンド                                                           | 期待結果 |
| --------------------- | ------------------------------------------------------------------ | -------- |
| ChatPanel テスト      | `cd apps/desktop && pnpm vitest run src/renderer/components/chat/` | 全 PASS  |
| 全ユニットテスト      | `cd apps/desktop && pnpm vitest run`                               | 全 PASS  |
| TypeScript 型チェック | `pnpm --filter @repo/desktop exec tsc --noEmit`                    | 0 エラー |
| ESLint                | `pnpm lint`                                                        | 0 警告   |

## 多角的チェック観点

| 観点         | 適用 | チェック内容                                         |
| ------------ | ---- | ---------------------------------------------------- |
| セキュリティ | 該当 | PR 差分に API key やシークレットが含まれていないこと |
| コード品質   | 該当 | lint/typecheck が通ること、`--no-verify` 未使用      |
| CI/CD        | 該当 | pre-push hook 2 フェーズが通ること                   |

**Electron デスクトップアプリ観点**:

| 層                         | 適用 | チェック内容                                    |
| -------------------------- | ---- | ----------------------------------------------- |
| フロントエンド（Renderer） | 該当 | UI 変更のスクリーンショットが PR に含まれている |
| IPC 通信                   | 該当 | IPC 契約変更がある場合は PR 本文に明記          |

## 成果物

| 成果物  | パス                          | 内容                                                                        |
| ------- | ----------------------------- | --------------------------------------------------------------------------- |
| PR 情報 | `outputs/phase-13/pr-info.md` | PR サマリードラフト（Summary + Test Plan）、PR URL、CI 結果、マージ待ち状態 |

## 完了条件

- [ ] ブランチ名が `feature/chatpanel-real-chat-wiring`（07-git-and-tooling.md 準拠）
- [ ] `pnpm lint` が通っている
- [ ] `pnpm typecheck` が通っている
- [ ] `cd apps/desktop && pnpm vitest run` で全テスト PASS
- [ ] `--no-verify` を使っていない（**絶対禁止**）
- [ ] ユーザーにローカル動作確認を依頼している
- [ ] ユーザーから PR 作成の明示的な許可を得ている
- [ ] PR が作成されている（Summary + Test Plan + 関連 Issue）
- [ ] PR にスクリーンショット（empty / streaming / terminal handoff）が含まれている
- [ ] PR コメントに implementation-guide.md の全文が投稿されている
- [ ] CI（pre-push hook 2 フェーズ）が通過している
- [ ] タスクディレクトリが completed-tasks に移動されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. Task 13-1: ブランチ作成
2. Task 13-2: コミット前チェック（lint/typecheck/test）
3. Task 13-3: ユーザーへのローカル動作確認依頼
4. Task 13-4: PR 作成（ユーザー許可後）
5. Task 13-5: CI 確認
6. タスク完了処理（ディレクトリ移動）

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスク（Task 13-1 ~ 13-5）を 100% 実行完了
- [ ] PR が作成され CI が通過している
- [ ] タスクディレクトリが completed-tasks に移動されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次のPhase

- なし（タスク完了）
