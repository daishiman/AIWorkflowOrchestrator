# Phase 13: PR作成

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 13                         |
| Phase名    | PR作成                     |
| 対象機能   | TASK-SW-STREAM-FUP-03      |
| 前提Phase  | Phase 12: ドキュメント更新 |
| 次Phase    | -（完了）                  |
| ステータス | 未実施                     |
| 作成日     | 2026-04-17                 |

## 目的

PR 作成前のローカル品質確認と承認待ち手順を固定する。

## 実行タスク

- typecheck / lint / test の実行条件を確認する。
- ユーザー承認を待つ。
- PR 作成時の提出物を整理する。

## 参照資料

- Phase 12 outputs
- `artifacts.json`
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts`

## 重要: ユーザー承認必須

**このPhaseはユーザーの明示的な承認を得た後にのみ実行する。**

Phase 12 完了後に自動的にPRを作成しないこと。

## 事前チェック

### ローカル品質確認（PR作成前に必須）

```bash
# 1. 依存関係整合確認
pnpm install && pnpm --filter @repo/shared build

# 2. 型チェック
pnpm --filter @repo/desktop typecheck

# 3. lint
pnpm --filter @repo/desktop lint

# 4. progress tests + 既存回帰
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService"

# 5. pre-commit フック（--no-verify 禁止）
git add <変更ファイル>
git commit -m "feat(skill): TASK-SW-STREAM-FUP-03 モード別onProgress進捗フロー詳細化"
```

## PR 作成コマンド

```bash
git push origin <ブランチ名>

gh pr create \
  --title "feat(skill): [TASK-SW-STREAM-FUP-03] モード別 onProgress 進捗フロー詳細化" \
  --body "$(cat <<'EOF'
## 概要

`SkillCreatorService.createSkill()` の進捗通知を mode 別に詳細化し、progress flow を単一集約。

## 変更内容

- `collaborative` モード: インタビュー・合意形成フェーズを追加
- `orchestrate` モード: 実行エンジン選択フェーズを追加
- `update` モード: スキル読み込み・分析フェーズを追加
- `improve-prompt` モード: 読み込み・分析・改善フェーズを追加
- `create` モード: 既存5段階フローを維持（回帰なし）
- progress flow の正本を `SkillCreatorService.ts` に集約し、private method への重複を排除

## テスト

- 既存14テストケース: 全件 PASS（回帰なし）
- 新規 progress tests: mode 別 progress sequence + 安全性検証

## 関連

- Closes #2208
- Depends on: TASK-SW-STREAM-001（完了済み）

🤖 Generated with [Claude Code](https://claude.ai/claude-code)
EOF
)"
```

## コミットメッセージ規則

```
feat(skill): TASK-SW-STREAM-FUP-03 モード別onProgress進捗フロー詳細化

- collaborative/orchestrate/update/improve-prompt モードに独自フェーズを追加
- progress flow の正本を 1 箇所に集約
- create モードの既存5段階フローは変更なし（回帰なし）
- 既存14テストケース全件 PASS を確認

Closes #2208
```

## 成果物

| 成果物                                      | パス                                                           |
| ------------------------------------------- | -------------------------------------------------------------- |
| TASK-SW-STREAM-FUP-03-change-summary.md     | `outputs/phase-13/TASK-SW-STREAM-FUP-03-change-summary.md`     |
| TASK-SW-STREAM-FUP-03-local-check-result.md | `outputs/phase-13/TASK-SW-STREAM-FUP-03-local-check-result.md` |

## 完了条件

- [ ] ユーザーの明示的な承認を得た
- [ ] ローカル品質確認（typecheck / lint / test）が全件 PASS した
- [ ] pre-commit フックが正常に通過した（`--no-verify` は絶対禁止）
- [ ] PR が作成された
- [ ] PR URL をユーザーに報告した
- [ ] 両成果物が生成されている

## タスク100%実行確認【必須】

- [ ] ユーザー承認を確認した
- [ ] ローカルチェックを実行した
- [ ] コミット・プッシュ・PR作成を実行した
- [ ] artifacts.json が `phase13_completed` に更新されている
