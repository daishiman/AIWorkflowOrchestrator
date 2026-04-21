# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| Phase        | 13                                               |
| タスクID     | TASK-SC-CREATOR-UPDATE-IMPL-001                  |
| タスク名     | SkillCreatorService runUpdateWorkflow 実処理実装 |
| タスク種別   | NON_VISUAL                                       |
| ステータス   | ブロック中（ユーザー承認待ち）                   |
| 作成日       | 2026-04-21                                       |
| GitHub Issue | #2318（CLOSED）                                  |

---

## 目的

Phase 1-12 で実装・検証・ドキュメント化した
`SkillCreatorService.runUpdateWorkflow()` 実処理実装を、
PR として main ブランチへマージする。

---

## 実行条件

- **ユーザーの明示的な承認が必要**
- Phase 10 の最終レビューが PASS していること
- Phase 11 の手動テストが完了していること（全テスト PASS）
- Phase 12 の全ドキュメントが揃っていること

---

## ブロック理由

ユーザーの明示承認待ち。PR はユーザー指示があるまで作成しない。

---

## blocked 時の最低限の記録

user の明示承認がない限り、本 Phase は blocked のままとする。
blocked の場合でも以下を `outputs/phase-13/` に記録する:

- `local-check-result.md`: PR 作成前に確認済みのローカルチェック要約
- `change-summary.md`: 変更概要と対象ファイル群
- `pr-info.md`: 想定タイトル、想定本文、base/head、blocked 理由
- `pr-creation-result.md`: 未作成であること、承認待ちで止めたこと

---

## 変更サマリー

### 変更内容

| 変更種別 | 対象ファイル                                                  | 内容                                              |
| -------- | ------------------------------------------------------------- | ------------------------------------------------- |
| 実装追加 | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | `runUpdateWorkflow()` メソッドの実処理実装        |
| 実装修正 | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | `case "update":` をスタブから実処理呼び出しへ変更 |

### 変更の背景

`SkillCreatorService.runUpdateWorkflow()` がスタブ実装（`logger.warn` のみ）のままで、
`update` モード実行時に既存スキルの SKILL.md が実際に更新されなかった。
本 PR により `runUpdateWorkflow()` に実処理が実装され、
update モードが正常に機能するようになる。

---

## PR 作成手順（承認後）

### 1. ブランチ確認

```bash
git status
git branch
```

### 2. PR 作成

```bash
gh pr create \
  --title "feat(skill-creator): runUpdateWorkflow 実処理実装 (TASK-SC-CREATOR-UPDATE-IMPL-001)" \
  --body "$(cat <<'EOF'
## 概要

`SkillCreatorService.runUpdateWorkflow()` にスタブ実装を廃止し、実処理を実装する。

- `update` モード実行時に既存 SKILL.md が実際に更新されるようになる
- LLM クライアント利用可能時は purpose を再生成する
- AbortSignal 中断が各ステップで機能する

## 変更内容

- `runUpdateWorkflow()` メソッドの新規実装
- `case "update":` を `logger.warn` スタブから実処理呼び出しへ修正

## テスト

- `runUpdateWorkflow()` 関連テスト全 PASS
- 既存テストへの回帰なし
- TypeScript 型チェック PASS
- ESLint エラーゼロ

## 関連

Closes #2318

🤖 Generated with Claude Code
EOF
)"
```

### 3. CI の確認

```bash
# PR番号を確認して CI ステータスを監視
gh pr checks <PR番号> --watch
```

確認項目:

- [ ] lint: PASS
- [ ] typecheck: PASS
- [ ] test（vitest）: PASS
- [ ] build: PASS

### 4. PR レビュー依頼

CI がすべて PASS した後、レビュアーを指定する:

```bash
gh pr edit <PR番号> --add-reviewer <reviewer>
```

---

## 完了条件

- [ ] ユーザーの明示的な承認を得た
- [ ] Phase 10 最終レビューが PASS
- [ ] Phase 11 手動テストが PASS
- [ ] Phase 12 全ドキュメントが揃っている
- [ ] PR が作成されている
- [ ] CI が全て PASS している
- [ ] レビュアーが指定されている

---

## 成果物

- `outputs/phase-13/local-check-result.md`
- `outputs/phase-13/change-summary.md`
- `outputs/phase-13/pr-info.md`
- `outputs/phase-13/pr-creation-result.md`
