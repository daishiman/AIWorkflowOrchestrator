## 概要

Skill Center をスキルライフサイクルの一次導線入口として整理し、`create` / `use` / `improve` の journey 契約と画面責務境界をコード・UI・仕様書へ同期しました。あわせて Phase 11 screenshot 証跡と Phase 12 正本仕様更新を完了し、`.claude` 正本と `.agents` mirror の差分を解消しています。

## 変更内容

- `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` を追加し、journey / responsibility / advanced route policy / downstream contract を集約
- `apps/desktop/src/renderer/App.tsx` で `skill-center` alias を `skillCenter` へ正規化
- `apps/desktop/src/renderer/views/SkillCenterView/index.tsx` に journey panel と surface ownership panel を追加
- `apps/desktop/src/renderer/navigation/skillLifecycleJourney.test.ts` と `SkillCenterView.test.tsx` で 18 テスト相当の回帰確認を追加
- `apps/desktop/scripts/capture-task-skill-lifecycle-01-phase11.mjs` を追加し、Phase 11 screenshot の参照先を `completed-tasks` へ統一
- `docs/30-workflows/completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation` に Phase 1-12 成果物と Phase 13 ドラフトを追加
- `.claude` / `.agents` の `aiworkflow-requirements`、`task-specification-creator`、`skill-creator` を Phase 12 正本仕様へ同期
- unassigned-task の frontmatter / legacy backlog 参照更新を反映

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

補足:
ユーザー申告として 2026-03-11 に `pnpm typecheck`, `pnpm lint`, `pnpm --filter @repo/shared build`, `pnpm --filter @repo/desktop build`, `pnpm test --testTimeout=900000` を実行済み。追加再実行は省略。

## 関連 Issue

- Closes なし
- 関連: #1142 #1143 #1144 #1145 #1151

## 破壊的変更

- [ ] この PR には破壊的変更が含まれます

## スクリーンショット

以下は push 後に raw URL へ差し替える。

- `outputs/phase-11/screenshots/TC-11-01-create-entry.png`
- `outputs/phase-11/screenshots/TC-11-02-execute-entry.png`
- `outputs/phase-11/screenshots/TC-11-03-improve-entry.png`
- `outputs/phase-11/screenshots/TC-11-04-advanced-supporting.png`
- `outputs/phase-11/screenshots/TC-11-05-surface-ownership.png`
- `outputs/phase-11/screenshots/TC-11-06-settings-public-shell.png`

## チェックリスト

- [x] コードが既存のスタイルに従っている
- [x] 必要に応じてドキュメントを更新した
- [x] 新規・変更機能にテストを追加した
- [x] すべてのテストがローカルで成功する
- [x] Pre-commit hooks が成功する

## その他

- Phase 12 実装ガイド反映元: `docs/30-workflows/completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/phase-12/implementation-guide.md`
- 実装ガイドの反映要点:
  - `SkillLifecycleJob = create | use | improve`
  - `normalizeSkillLifecycleView(view)` で `skill-center` を canonical `skillCenter` へ正規化
  - `skillLifecycleJourney.ts` へ journey / responsibility / advanced policy / dependency contract を集約
  - `SkillCenterView` に journey panel と surface ownership panel を追加
  - screenshot script は representative surface を selector capture する契約へ合わせた

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
