# Phase 13: PR作成 -- extract-purpose LLM 実結果差し替え

## メタ情報

| 項目       | 値                           |
| ---------- | ---------------------------- |
| Phase番号  | 13                           |
| 機能名     | llm-purpose-wire             |
| タスクID   | TASK-SC-LLM-PURPOSE-WIRE-001 |
| 作成日     | 2026-04-16                   |
| 依存 Phase | Phase 12（ドキュメント更新） |
| ステータス | blocked（ユーザー指示待ち）  |

## 目的

Phase 12 の全タスク完了を確認した後、実装内容を PR としてまとめて提出する。
PR 作成はユーザーの明示的な指示があるまで実行しない（blocked 状態）。

## 実行タスク

- [ ] Phase 12 の全成果物完了を確認する
- [ ] PR タイトルとブランチ名を最終確認する
- [ ] `pnpm lint` / `pnpm --filter @repo/desktop typecheck` / 関連テスト PASS を確認する
- [ ] `gh pr create` コマンドでPRを作成する（ユーザー指示後のみ）
- [ ] `outputs/phase-13/pr-info.md` に作成したPR URLと情報を記録する

## 参照資料

| 資料名          | パス                                                                     | 用途              |
| --------------- | ------------------------------------------------------------------------ | ----------------- |
| Phase 12 成果物 | `outputs/phase-12/`                                                      | PR 本文作成の根拠 |
| index.md        | `docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/index.md`                | タスク全体の概要  |
| GitHub Issue    | [#2181](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2181) | 要件原本          |

## 重要事項

- **コミットしない**
- **PR を作成しない**
- **ユーザーの明示的な指示があるまで実行しない**

## PR タイトル案

```
feat(skill-creator): extract-purposeエージェントによるpurposeフィールドのLLM実結果差し替え (#2181)
```

または簡潔版:

```
feat(SC): TASK-SC-LLM-PURPOSE-WIRE-001 purpose フィールドを LLM 推論結果に差し替え
```

## PR 本文テンプレート

```markdown
## 概要

`runCreateWorkflow` 内で `extract-purpose` エージェント定義を LLM に渡し、
purpose 文字列を取得する処理を実装。
`StructurePlanJson.purpose` にエージェント定義の raw 文字列ではなく
LLM の推論結果が格納されるよう修正する。

## 変更内容

- `SkillCreatorService.ts`: `runCreateWorkflow` 内に LLM 呼び出し処理を追加
  - `loadAgent("extract-purpose")` でエージェント定義を取得
  - 取得した定義を LLM に渡して purpose 文字列を推論
  - 推論結果を `StructurePlanJson.purpose` に格納
  - purpose 取得失敗時のエラーハンドリングを実装
- `SkillCreatorService.test.ts`: purpose フィールドが LLM 結果であることを検証するテストを追加

## 受け入れ基準

- [x] AC-1: `extract-purpose` エージェント定義を LLM に渡して purpose を取得する処理が実装されている
- [x] AC-2: `StructurePlanJson.purpose` に LLM の推論結果が格納されている
- [x] AC-3: LLM 呼び出し方式が設計ドキュメントに明記されている
- [x] AC-4: purpose 生成失敗時のエラーハンドリングが実装されている
- [x] AC-5: 既存テストが全て PASS する
- [x] AC-6: 新規ユニットテストで purpose フィールドが LLM 結果であることが検証されている

## 関連

- Issue: #2181
- 親タスク: TASK-SC-IMP-CREATE-WORKFLOW-001
- 依存タスク: TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001

## テスト確認

- `pnpm --filter @repo/desktop typecheck`: PASS
- `pnpm lint`: PASS
- `pnpm vitest run src/main/services/skill/__tests__/SkillCreatorService.test.ts`: PASS
```

## PR 作成コマンド（ユーザー指示後に実行）

```bash
# ブランチ確認
git branch --show-current

# PR 作成（ユーザー指示後のみ実行）
gh pr create \
  --title "feat(skill-creator): TASK-SC-LLM-PURPOSE-WIRE-001 purposeフィールドをLLM実結果に差し替え" \
  --body "$(cat <<'EOF'
## 概要

`runCreateWorkflow` 内で `extract-purpose` エージェント定義を LLM に渡し、purpose 文字列を取得する処理を実装。`StructurePlanJson.purpose` にエージェント定義の raw 文字列ではなく LLM の推論結果が格納されるよう修正する。

## 変更内容

- `SkillCreatorService.ts`: `runCreateWorkflow` 内に LLM 呼び出し処理を追加
- `SkillCreatorService.test.ts`: purpose フィールドが LLM 結果であることを検証するテストを追加

## 関連

- Issue: #2181
- 親タスク: TASK-SC-IMP-CREATE-WORKFLOW-001

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## PR 作成前チェックリスト（ユーザー指示後に確認）

- [ ] `pnpm lint` が通ること
- [ ] `pnpm --filter @repo/desktop typecheck` が通ること
- [ ] 関連テストが全て PASS すること
- [ ] `--no-verify` を使っていないこと（絶対禁止）
- [ ] コミットメッセージが適切であること

## 成果物

| 成果物  | パス                          | 形式     |
| ------- | ----------------------------- | -------- |
| PR 情報 | `outputs/phase-13/pr-info.md` | Markdown |

## 完了条件

- [ ] PR 作成は blocked であると明記されている
- [ ] PR タイトル案が記載されている
- [ ] PR 本文テンプレートが記載されている
- [ ] ユーザー指示後に実行するコマンドが記載されている
- [ ] **本Phase内の全タスクを100%実行完了**
