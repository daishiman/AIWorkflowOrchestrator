## 概要

`general` / `workspace` / `skill-lifecycle` の 3 つの会話導線を `ChatView` と `chatSlice` の共通基盤へ統合し、Task02 の Phase 1〜12 で作成した仕様・設計・検証・更新結果まで一体で反映する PR。

## 変更内容

## <!-- 主な変更点をリストアップ -->

- `chatSlice` / `useStreamingChat` / `ChatView` を中心に session 管理、retry / abort、persist / revive を統合
- `WorkspaceView` / `SkillCenterView` を handoff 入口へ整理し、selected files / lifecycle job を `ChatView` に集約
- system spec 正本、task spec、skill 改善、Issue 同期、Phase 11/12/13 証跡を更新

## 変更タイプ

- [ ] 🐛 バグ修正 (bug fix)
- [x] ✨ 新機能 (new feature)
- [x] 🔨 リファクタリング (refactoring)
- [x] 📝 ドキュメント (documentation)
- [x] 🧪 テスト (test)
- [ ] 🔧 設定変更 (configuration)
- [ ] 🚀 CI/CD (continuous integration)

## テスト

- [x] ユニットテスト実行 (`pnpm test`)
- [x] 型チェック実行 (`pnpm typecheck`)
- [x] ESLint チェック実行 (`pnpm lint`)
- [x] ビルド確認 (`pnpm build`)
- [x] 手動テスト実施

## 関連 Issue

Closes #

## 破壊的変更

- [ ] この PR には破壊的変更が含まれます

## スクリーンショット

| 項目                    | スクリーンショット                                                       |
| ----------------------- | ------------------------------------------------------------------------ |
| Chat / general baseline | `outputs/phase-11/screenshots/TC-02-01-chat-general-foundation.png`      |
| Chat / retry error      | `outputs/phase-11/screenshots/TC-02-02-chat-retry-error-state.png`       |
| Workspace handoff       | `outputs/phase-11/screenshots/TC-02-04-workspace-handoff-chat.png`       |
| Skill Lifecycle handoff | `outputs/phase-11/screenshots/TC-02-06-skill-lifecycle-handoff-chat.png` |

## チェックリスト

- [x] コードが既存のスタイルに従っている
- [x] 必要に応じてドキュメントを更新した
- [x] 新規・変更機能にテストを追加した
- [x] すべてのテストがローカルで成功する
- [ ] Pre-commit hooks が成功する

## その他

- Phase 12 実装ガイド反映元: `docs/30-workflows/completed-tasks/step-02-par-task-02-chat-platform-unification/outputs/phase-12/implementation-guide.md`
- 反映ポイント 1: Part 1 の「入口ごとの差分は context、会話本体は共通基盤」という整理を `WorkspaceView` / `SkillCenterView` / `ChatView` へ反映
- 反映ポイント 2: Part 2 の `chatSessions` / `modeSessionIds` / `Date` revive 契約を `store/index.ts` と `chatSlice.ts` へ反映
- 反映ポイント 3: Part 2 の retry / abort / placeholder 契約を `useStreamingChat.ts` と `ChatView` へ反映
- UI/UX カバレッジ: `docs/30-workflows/completed-tasks/step-02-par-task-02-chat-platform-unification/outputs/phase-11/screenshot-coverage.md` で expected 5 / covered 5 PASS
- Follow-up は `#1163` (`UT-IMP-CHAT-PLATFORM-HANDOFF-REVIVE-GUARD-001`) として別 issue 管理

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
