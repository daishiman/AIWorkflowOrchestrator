# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 13                                                |
| Phase名    | PR作成                                            |
| タスクID   | TASK-SW-FIX-FEEDBACK-001                          |
| 機能名     | current facts 同期・skill準拠検証・docs-only 改善 |
| 前提Phase  | Phase 12                                          |
| 次Phase    | -                                                 |
| ステータス | blocked                                           |
| 作成日     | 2026-04-14                                        |

## 重要: このフェーズはユーザー承認後のみ実施すること

**Phase 13 は Phase 1〜12 が全て完了し、ユーザーが PR 作成を明示的に承認した後にのみ実行する。**

---

## ルール

| ルール               | 説明                                                               |
| -------------------- | ------------------------------------------------------------------ |
| ユーザー承認必須     | user の明示承認がない限り blocked のままにする                     |
| ローカル確認省略禁止 | Task 1 のローカル確認を必ず実行し、結果を記録する                  |
| 自動コミット/PR禁止  | commit / PR を自動で作成しない。必ずユーザー承認を得てから実行する |

---

## 目的

ユーザーの明示承認後に PR 作成を行い、workflow docs の current facts 同期をまとめる。
Phase 1〜12 の全成果物を整理し、レビューアーが変更内容を理解しやすい PR 本文を作成する。

---

## 実行タスク

### Task 1: ローカル確認

Phase 12 までの全作業が正しく完了していることをローカル環境で確認する。

| 確認項目           | コマンド                                                                                                                                                          | 期待結果         | 結果 |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---- |
| workflow docs 差分 | `git status --short` / `git diff --name-only`                                                                                                                     | 想定ファイルのみ | -    |
| docs validator     | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-SW-FIX-FEEDBACK-001`                                      | PASS             | -    |
| artifacts parity   | `git status --short docs/30-workflows/TASK-SW-FIX-FEEDBACK-001/artifacts.json` / `git diff --name-only docs/30-workflows/TASK-SW-FIX-FEEDBACK-001/artifacts.json` | parity 0件       | -    |

> docs-only のため、app code の lint/typecheck/vitest は follow-up branch がある場合のみ実行する。

**想定される変更ファイル**:

| ファイル                                                        | 変更内容                          |
| --------------------------------------------------------------- | --------------------------------- |
| `docs/30-workflows/TASK-SW-FIX-FEEDBACK-001/index.md`           | current facts 同期 / scope 再定義 |
| `docs/30-workflows/TASK-SW-FIX-FEEDBACK-001/phase-*.md`         | current contract / follow-up 分離 |
| `docs/30-workflows/TASK-SW-FIX-FEEDBACK-001/artifacts.json`     | Phase 状態と metadata の同期      |
| `docs/30-workflows/TASK-SW-FIX-FEEDBACK-001/outputs/phase-12/*` | Phase 12 成果物                   |

---

### Task 2: コミット作成（ユーザー承認後）

**前提**: ユーザーから PR 作成の明示承認を得ていること。

#### コミットメッセージ

```bash
git commit -m "$(cat <<'EOF'
docs(skill-wizard): current facts 同期・skill準拠検証・docs-only 改善（TASK-SW-FIX-FEEDBACK-001）

current facts と skill 定義の差分を整理し、issue 6 / 14 / 20 は解消済み、issue 8 は follow-up 候補として分離する。

変更内容:
- workflow docs を docs-only / spec_created に再定義
- SkillLifecyclePanel / CompleteStep の current contract を evidence つきで固定
- issue 8 の non-blocking 化を follow-up 候補として分離
- Phase 12 の出力パリティ（artifacts.json / outputs/artifacts.json）を明文化

対象ファイル:
- docs/30-workflows/TASK-SW-FIX-FEEDBACK-001/index.md
- docs/30-workflows/TASK-SW-FIX-FEEDBACK-001/phase-*.md
- docs/30-workflows/TASK-SW-FIX-FEEDBACK-001/artifacts.json

受入条件検証:
- AC-1: LLM success path の current facts が evidence と一致 [PASS]
- AC-2: terminal_handoff の current facts が evidence と一致 [PASS]
- AC-3: skillPath=null 時にエラーUI表示 [PASS]
- AC-4: skillPath=null 時に成功ヘッダー非表示 [PASS]
- AC-5: skillPath正常値時に成功UI表示 [PASS]
EOF
)"
```

#### PR本文にAC-1〜AC-5の検証結果を記載

PR本文には以下のAC検証結果テーブルを含める:

| AC   | 内容                                     | テストケース    | 結果 |
| ---- | ---------------------------------------- | --------------- | ---- |
| AC-1 | LLM success path に current facts が一致 | TC-FEEDBACK-001 | -    |
| AC-2 | terminal_handoff に current facts が一致 | TC-FEEDBACK-002 | -    |
| AC-3 | skillPath=null 時にエラーメッセージ表示  | TC-FEEDBACK-004 | -    |
| AC-4 | skillPath=null 時に成功ヘッダー非表示    | TC-FEEDBACK-005 | -    |
| AC-5 | skillPath正常値時に成功画面表示          | TC-FEEDBACK-006 | -    |

---

### Task 3: PR作成

#### PR タイトル

```
docs(skill-wizard): current facts 同期・skill準拠検証・docs-only 改善（TASK-SW-FIX-FEEDBACK-001）
```

#### PR ラベル

- `docs`
- `priority:high`
- `scale:small`
- `type:docs`
- `wave:B`

#### PR作成コマンド

````bash
gh pr create \
  --title "docs(skill-wizard): current facts 同期・skill準拠検証・docs-only 改善（TASK-SW-FIX-FEEDBACK-001）" \
  --label "docs,priority:high,scale:small,type:docs,wave:B" \
  --body "$(cat <<'EOF'
## 概要

スキルウィザードの current facts を skill 定義へ同期し、issue 8 を follow-up 候補として分離します。

## 変更内容

### current facts / follow-up

| 論点 | 取り扱い | 内容 |
| ---- | -------- | ---- |
| 6    | 解消済み | SkillLifecyclePanel 側で current facts として成立 |
| 8    | follow-up候補 | fetchSkills 非ブロッキング化は別タスクへ分離 |
| 14   | 解消済み | CompleteStep の null guard あり |
| 20   | 解消済み | CompleteStep の成功ヘッダー条件表示あり |

### 修正ファイル

| ファイル | 変更内容 |
| -------- | -------- |
| `docs/30-workflows/TASK-SW-FIX-FEEDBACK-001/index.md` | docs-only / current facts 同期 |
| `docs/30-workflows/TASK-SW-FIX-FEEDBACK-001/phase-*.md` | current contract / evidence / follow-up 分離 |
| `docs/30-workflows/TASK-SW-FIX-FEEDBACK-001/artifacts.json` | Phase 状態と parity の明記 |

## 受入条件検証

| AC   | 内容                                   | テストケース    | 結果 |
| ---- | -------------------------------------- | --------------- | ---- |
| AC-1 | LLM success path が current facts と一致 | TC-FEEDBACK-001 | PASS |
| AC-2 | terminal_handoff が current facts と一致 | TC-FEEDBACK-002 | PASS |
| AC-3 | skillPath=null 時にエラー表示          | TC-FEEDBACK-004 | PASS |
| AC-4 | skillPath=null 時に成功ヘッダー非表示  | TC-FEEDBACK-005 | PASS |
| AC-5 | skillPath正常値時に成功画面表示        | TC-FEEDBACK-006 | PASS |

## テスト

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-SW-FIX-FEEDBACK-001
````

## 関連タスク

- TASK-SW-FIX-FEEDBACK-001（本タスク）
- 依存: TASK-SW-FIX-DATAFLOW-001（Wave A・完了済み）
- 関連Issue: #2131
  EOF
  )"

````

---

### Task 4: CI確認

```bash
# PR の CI 状態を確認
gh pr checks

# CI が失敗した場合は内容を確認
gh run list --limit 5
````

CI が全て通過するまで確認する。失敗した場合は内容を調査し、必要に応じて修正コミットを追加する。

---

## 最低限の記録

| 項目                   | 記録             |
| ---------------------- | ---------------- |
| blocked理由            | ユーザー承認待ち |
| user approvalの有無    | pending          |
| Phase 12までの完了根拠 | pending          |
| local checkの結果要約  | pending          |

---

## 参照資料テーブル

| 資料名              | パス                                                     | 用途                        |
| ------------------- | -------------------------------------------------------- | --------------------------- |
| Phase 1 仕様        | `phase-1-requirements.md`                                | 受入条件AC-1〜AC-5の定義    |
| Phase 2 仕様        | `phase-2-design.md`                                      | current contract            |
| Phase 5 仕様        | `phase-5-implementation.md`                              | no-op / follow-up           |
| Phase 10 仕様       | `phase-10-final-review.md`                               | 最終レビュー結果            |
| Phase 11 仕様       | `phase-11-manual-test.md`                                | 手動テスト結果              |
| Phase 12 仕様       | `phase-12-documentation.md`                              | ドキュメント更新結果        |
| Phase 12 実装ガイド | `outputs/phase-12/implementation-guide.md`               | PR本文の根拠                |
| Phase 12 仕様同期   | `outputs/phase-12/system-spec-update-summary.md`         | 仕様同期の根拠              |
| Phase 12 compliance | `outputs/phase-12/phase12-task-spec-compliance-check.md` | current facts / parity 根拠 |
| index.md            | `index.md`                                               | タスク全体情報              |

---

## 成果物

`outputs/phase-13/` 配下の各ファイル:

| 成果物           | パス                                     | 内容                         |
| ---------------- | ---------------------------------------- | ---------------------------- |
| PR情報           | `outputs/phase-13/pr-info.md`            | PR URL・タイトル・ラベル     |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | docs validator / diff 結果   |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | 変更ファイル・AC検証結果一覧 |

---

## 完了条件チェックリスト

- [ ] ユーザーの PR 作成承認を得ている
- [ ] Task 1: ローカル確認（docs validator / diff）が全件PASSしている
- [ ] Task 2: コミットメッセージがプロジェクトの規約に沿っている
- [ ] Task 2: PR本文に AC-1〜AC-5 の検証結果が記載されている
- [ ] Task 3: PR が作成されている
- [ ] Task 3: PR にラベル（docs, priority:high, scale:small, type:docs, wave:B）が付与されている
- [ ] Task 4: CI が全て通過している
- [ ] PR の URL をユーザーに報告している
- [ ] 成果物テーブルの全ファイルが `outputs/phase-13/` に出力されている

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] docs-only 方針と blocked 状態の整合を確認
