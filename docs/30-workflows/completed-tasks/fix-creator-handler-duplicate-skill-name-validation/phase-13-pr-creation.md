# Phase 13: PR作成

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 13                           |
| Phase名    | PR作成                       |
| 前提Phase  | Phase 12（ドキュメント更新） |
| 後続Phase  | なし（最終Phase）            |
| ステータス | blocked                      |
| 作成日     | 2026-04-06                   |
| タスクID   | TASK-FIX-IPC-SKILL-NAME-001  |

## 目的

Bug 1（IPCハンドラ重複登録）とBug 2（スキル名kebab-case変換不整合）の修正内容を
Pull Requestとしてまとめ、レビュー・マージを依頼する。

> **重要**: コミット・PRの作成は**ユーザーからの明示的な指示があるまで実行禁止**。
> 本Phaseに記載された内容はテンプレートおよびチェックリストであり、
> 自動実行してはならない。

---

## PRタイトル案

```
fix: IPCハンドラ重複登録とスキル名kebab-case変換の修正 (#TASK-FIX-IPC-SKILL-NAME-001)
```

---

## PR本文テンプレート

```markdown
## Summary

- **Bug 1修正**: `creatorHandlers.ts` 内の `skill-creator:get-adapter-status` ハンドラの
  `registerRuntimeSkillCreatorHandlers()` 内の重複登録ブロックを削除。重複によって
  `registerRuntimeSkillCreatorHandlers()` が例外スローし、後続14ハンドラが未登録に
  なっていた問題を解消。
- **Bug 2修正**: `SkillService.ts` の `toWizardSkillName()` に `.toLowerCase()` と
  非許容文字（アンダースコア・日本語等）のハイフン置換を追加。`init_skill.js` の
  バリデーション `/^[a-z0-9]+(-[a-z0-9]+)*$/` との不整合を解消。公開経路では
  `new-skill` の衝突時に `new-skill-2` を選ぶ回帰も追加。
- **影響範囲**: Electron Mainプロセスの2ファイルのみ変更。UIレイヤー・Preload・
  `@repo/shared` への変更なし。既存スキル（英小文字・数字・ハイフン）への後方互換性を維持。

## Test plan

- [ ] **手動テスト1**: アプリを起動し、SkillLifecyclePanel でスキルの新規作成を実施。
      コンソールに `No handler registered for 'skill-creator:...'` エラーが出ないことを確認。
- [ ] **手動テスト2**: スキル名に大文字（例: `MySkill`）を入力し、作成が成功することを確認。
- [ ] **手動テスト3**: スキル名にアンダースコア（例: `my_skill`）を入力し、
      `my-skill` に変換されて作成が成功することを確認。
- [ ] **手動テスト4**: スキル名に日本語（例: `私のスキル`）を入力し、
      `new-skill` を基準に、衝突時は `new-skill-2` 以降へ解決されて作成が成功することを確認。
- [ ] **ユニットテスト確認**: `pnpm --filter @repo/desktop test` がグリーンであることを確認。
  - `creatorHandlers.adapterStatus.test.ts`: Bug 1の回帰テスト
  - `SkillService.test.ts`: `toWizardSkillName` の全変換パターンと `new-skill-2` 衝突解消のユニットテスト

## 関連Issue

- 関連Issue番号: （Issueが作成された場合は番号を記入）
- タスク仕様書: `docs/30-workflows/fix-creator-handler-duplicate-skill-name-validation/`
```

---

## コミットメッセージ案

Bug 1とBug 2は独立したファイルへの修正であるため、**2コミットに分離**することを推奨する。

### コミット1（Bug 1）

```
fix(ipc): IPCハンドラ重複登録を削除 (#TASK-FIX-IPC-SKILL-NAME-001)

creatorHandlers.ts 内の skill-creator:get-adapter-status ハンドラが
2回登録されていたため、registerRuntimeSkillCreatorHandlers() が例外をスローし、
後続14ハンドラが未登録になっていた。

重複ブロックを削除し、後続ハンドラが正常登録されるように修正。

Fixes: skill-creator:execute-plan 以降の14ハンドラが
       "No handler registered" エラーになっていた問題
```

### コミット2（Bug 2）

```
fix(skill): toWizardSkillName() に kebab-case 変換を追加 (#TASK-FIX-IPC-SKILL-NAME-001)

SkillService.ts の toWizardSkillName() が大文字・アンダースコア・日本語を
そのまま通過させていたため、init_skill.js のバリデーション
/^[a-z0-9]+(-[a-z0-9]+)*$/ に失敗し skill:create が常にエラーになっていた。

toLowerCase() + 非許容文字のハイフン置換を追加し、出力が常にバリデーションを
通過するように修正。既存の英小文字・数字・ハイフンのみの入力には影響なし。
```

---

## PR作成前チェックリスト

### コード品質

- [ ] `pnpm lint` がエラーなし
- [ ] `pnpm typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop test` がグリーン
- [ ] 変更ファイル数: 2ファイル（`creatorHandlers.ts` + `SkillService.ts`）のみ

### 仕様・ドキュメント

- [ ] Phase 1〜11が全て完了済み
- [ ] Phase 12（ドキュメント更新）が完了済み
- [ ] `outputs/phase-12/` 配下に5ファイルが揃っている
- [ ] `docs/00-requirements/18-skills.md §3.2.2.1` の更新が完了済み

### Acceptance Criteria

- [ ] AC-1: `registerRuntimeSkillCreatorHandlers()` が例外なく完走する
- [ ] AC-2: 全16のskill-creatorチャンネルがipcMainに登録される
- [ ] AC-3: `toWizardSkillName()` 出力が `/^[a-z0-9]+(-[a-z0-9]+)*$/` に適合する
- [ ] AC-4: 日本語・大文字・アンダースコア入力でもスキル作成が成功する
- [ ] AC-5: 既存スキルへの後方互換性が維持される

### PR作成コマンド（ユーザー承認後に実行）

```bash
# ブランチ確認
git branch

# ステータス確認
git status

# コミット（Bug 1）
git add apps/desktop/src/main/ipc/creatorHandlers.ts
git commit -m "fix(ipc): IPCハンドラ重複登録を削除 (#TASK-FIX-IPC-SKILL-NAME-001)"

# コミット（Bug 2）
git add apps/desktop/src/main/services/skill/SkillService.ts
git commit -m "fix(skill): toWizardSkillName() に kebab-case 変換を追加 (#TASK-FIX-IPC-SKILL-NAME-001)"

# PR作成
gh pr create \
  --title "fix: IPCハンドラ重複登録とスキル名kebab-case変換の修正 (#TASK-FIX-IPC-SKILL-NAME-001)" \
  --body "$(cat docs/30-workflows/fix-creator-handler-duplicate-skill-name-validation/phase-13-pr-body.md)"
```
