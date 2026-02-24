# Phase 13: PR作成 — skill:ハンドラP42準拠バリデーション形式統一

## メタ情報

| 項目               | 内容                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| タスクID           | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001                                            |
| タスク名           | skill:ハンドラP42準拠バリデーション形式統一                                        |
| Phase              | 13                                                                                 |
| 名称               | PR作成                                                                             |
| 分類               | セキュリティ                                                                       |
| 規模               | 小規模                                                                             |
| Issue              | #874                                                                               |
| 前提Phase          | Phase 12（ドキュメント — 全タスク完了）                                            |
| 次Phase            | なし（最終Phase）                                                                  |
| ステータス         | pending                                                                            |
| 成果物ディレクトリ | `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-13/` |

## 目的

Phase 1〜12 の全成果物を最終確認し、PR作成の準備を行う。ユーザーの明示的な許可を得た上でPRを作成する。

---

## 実行タスク

- 成果物確認: 全Phase成果物の存在を確認する。
- ステータス確認: artifacts/indexの状態を整合させる。
- 最終品質確認: lint/typecheck/testの最終結果を確認する。
- メタ更新: indexとartifactsの最終反映を行う。
- PR準備: 変更概要・テスト計画を整理する。
- PR実行: ユーザー明示許可後のみ作成する（自動実行禁止）。

| Task | 名称                      | 概要                                             |
| ---- | ------------------------- | ------------------------------------------------ |
| 1    | 全成果物の存在確認        | 全Phaseの成果物が存在することを確認する          |
| 2    | artifacts.json ステータス | 全Phase (1-12) が completed であることを確認する |
| 3    | 最終品質チェック          | lint / typecheck / テストを実行する              |
| 4    | index.md 更新             | Phase一覧テーブルのステータスを更新する          |
| 5    | artifacts.json 最終更新   | Phase 13 ステータスを completed に更新する       |
| 6    | PR 作成                   | ユーザー許可後に PR を作成する                   |

## 参照資料

| 資料                                    | パス / リンク                                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Phase 12 ドキュメント                   | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-12-documentation.md`                   |
| Phase 12 実装ガイド                     | `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-12/implementation-guide.md`    |
| Phase 12 documentation-changelog        | `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-12/documentation-changelog.md` |
| Phase 12 未タスクレポート               | `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-12/unassigned-task-report.md`  |
| Phase 1 要件定義                        | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-1-requirements.md`                     |
| Phase 2 設計                            | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-2-design.md`                           |
| Phase 3 設計レビュー                    | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-3-design-review.md`                    |
| Phase 5 実装                            | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-5-implementation.md`                   |
| Phase 6 テスト拡充                      | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-6-test-expansion.md`                   |
| Phase 7 カバレッジ確認                  | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-7-coverage-check.md`                   |
| Phase 8 リファクタリング                | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-8-refactoring.md`                      |
| Phase 9 品質検証                        | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-9-quality-assurance.md`                |
| Phase 10 最終レビュー                   | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-10-final-review.md`                    |
| Phase 11 手動テスト                     | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-11-manual-test.md`                     |
| Git & ツーリングルール（PR 作成ルール） | `.claude/rules/07-git-and-tooling.md`                                                                        |
| CLAUDE.md（--no-verify禁止）            | `CLAUDE.md`                                                                                                  |
| index.md（Phase一覧）                   | `docs/30-workflows/completed-tasks/skill-validation-consistency/index.md`                                    |
| artifacts.json                          | `docs/30-workflows/completed-tasks/skill-validation-consistency/artifacts.json`                              |
| Issue #874                              | GitHub Issue #874                                                                                            |

---

### システム仕様（aiworkflow-requirements 抽出）

| 参照資料                      | パス                                                                              | 抽出した要件                                 |
| ----------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------- |
| security-skill-ipc.md         | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | skill系IPCのセキュリティ整合と完了記録確認   |
| ipc-contract-checklist.md     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | Main/Preload/テスト/仕様の同時更新完了確認   |
| interfaces-agent-sdk-skill.md | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Skill API契約更新の反映確認                  |
| api-ipc-agent.md              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | IPC仕様とのドリフト有無を最終チェック        |
| error-handling.md             | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | Validation Errorの分類とUI表示方針の整合確認 |

---

## 実行手順

### Step 1: 全成果物の存在確認

全Phaseの成果物ファイルが存在することを確認する。

#### コード成果物

| #   | 成果物                                                                 | 確認内容                                         | 確認  |
| --- | ---------------------------------------------------------------------- | ------------------------------------------------ | ----- |
| 1   | `apps/desktop/src/main/ipc/skillHandlers.ts`                           | 6ハンドラにP42準拠バリデーションが実装されている | - [ ] |
| 2   | `apps/desktop/src/main/ipc/__tests__/skillHandlers.validation.test.ts` | バリデーション専用テストファイルが存在する       | - [ ] |
| 3   | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`            | 既存テストがthrow形式に対応更新されている        | - [ ] |

#### ドキュメント成果物

| #   | 成果物                  | 確認内容                                    | 確認  |
| --- | ----------------------- | ------------------------------------------- | ----- |
| 1   | 実装ガイド              | Part 1（概念説明）+ Part 2（実装詳細）あり  | - [ ] |
| 2   | documentation-changelog | 全 Step の完了結果が記録されている          | - [ ] |
| 3   | 未タスクレポート        | 検出結果が記録されている（0件でも作成済み） | - [ ] |
| 4   | LOGS.md（2ファイル）    | 両方更新済み                                | - [ ] |
| 5   | SKILL.md（2ファイル）   | 変更履歴が更新済み                          | - [ ] |
| 6   | topic-map.md            | 再生成済み                                  | - [ ] |

#### Phase 出力成果物

| Phase | 出力ディレクトリ   | 成果物                                                                                                | 確認  |
| ----- | ------------------ | ----------------------------------------------------------------------------------------------------- | ----- |
| 3     | `outputs/phase-3`  | design-review-result.md                                                                               | - [ ] |
| 5     | `outputs/phase-5`  | テスト結果                                                                                            | - [ ] |
| 9     | `outputs/phase-9`  | quality-report.md                                                                                     | - [ ] |
| 10    | `outputs/phase-10` | final-review-result.md                                                                                | - [ ] |
| 11    | `outputs/phase-11` | validation-test-result.md, regression-test-result.md, security-test-result.md, manual-test-summary.md | - [ ] |
| 12    | `outputs/phase-12` | implementation-guide.md, documentation-changelog.md, unassigned-task-report.md                        | - [ ] |

---

### Step 2: artifacts.json の全Phaseステータス確認

`artifacts.json` の全 Phase ステータスが `completed` であることを確認する。

| Phase | 名称             | 期待ステータス |
| ----- | ---------------- | -------------- |
| 1     | 要件定義         | completed      |
| 2     | 設計             | completed      |
| 3     | 設計レビュー     | completed      |
| 4     | テスト作成       | completed      |
| 5     | 実装             | completed      |
| 6     | テスト拡充       | completed      |
| 7     | カバレッジ確認   | completed      |
| 8     | リファクタリング | completed      |
| 9     | 品質検証         | completed      |
| 10    | 最終レビュー     | completed      |
| 11    | 手動テスト       | completed      |
| 12    | ドキュメント     | completed      |
| 13    | PR作成           | in_progress    |

---

### Step 3: ブランチ名確認

```bash
git branch --show-current
```

期待されるブランチ名: `docs/skill-validation-consistency-specs`

> **注意**: ブランチ名が異なる場合は、適切なプレフィックス（`fix/`, `feature/`, `docs/`）が付いていることを確認する。07-git-and-tooling.md のPR作成ルールに準拠していること。

---

### Step 4: コミット作成

> **`--no-verify` 禁止！** いかなる理由があっても `--no-verify` は使用しない。テストが失敗する場合は `.skip` + Issue/TODO 作成で対処する。

#### コミット前チェック（必須）

```bash
# Lint
pnpm lint

# 型チェック
pnpm typecheck

# テスト（対象パッケージのディレクトリから実行 — P40対策）
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers
```

| #   | チェック                       | 期待結果    | 確認  |
| --- | ------------------------------ | ----------- | ----- |
| 1   | `pnpm lint` が PASS する       | exit code 0 | - [ ] |
| 2   | `pnpm typecheck` が PASS する  | exit code 0 | - [ ] |
| 3   | 全テストが PASS する           | FAIL 0 件   | - [ ] |
| 4   | `--no-verify` を使用していない | 使用禁止    | - [ ] |

#### コミットメッセージ

```
fix(desktop): skill:ハンドラ6件にP42準拠3段バリデーション追加

skillHandlers.ts内の6つの未準拠ハンドラ(get-detail, execute, abort,
get-status, analyze, improve)にP42準拠の3段バリデーション
(型チェック→空文字列→トリム空文字列)とthrow形式エラーレスポンスを追加。

Closes #874
```

> **注意**: コミットメッセージは HEREDOC を使って渡す。`--no-verify` は絶対に付けない。

---

### Step 5: PR作成

> **重要**: PR作成はユーザーの明示的な許可を得てから実行する。自動実行禁止。

#### ユーザーへの確認事項

PR作成前に以下の情報をユーザーに提示し、明示的な許可を求める:

1. **変更概要**: skillHandlers.ts 内の6ハンドラに P42 準拠バリデーション追加
2. **変更ファイル数**: 実装1ファイル + テスト複数ファイル + 仕様書群
3. **テスト結果**: lint / typecheck / テスト全 PASS
4. **リスク**: 低（バリデーション追加のみ、既存動作への影響は throw 形式への変更のみ）

#### PR本文テンプレート

```markdown
## Summary

- skillHandlers.ts内の6つの未準拠ハンドラにP42準拠の3段バリデーション（型チェック→空文字列→トリム空文字列）を追加
- throw形式エラーレスポンス（`{ code: "VALIDATION_ERROR", message: "..." }`）に統一
- バリデーション専用テスト追加で全ハンドラの入力検証をカバー

## Test plan

- [ ] `pnpm lint` PASS
- [ ] `pnpm typecheck` PASS
- [ ] バリデーション専用テスト全 PASS（`skillHandlers.validation.test.ts`）
- [ ] 既存テスト回帰なし（`skillHandlers.test.ts`）
- [ ] DevTools経由の手動テスト完了（空文字列/スペースのみ文字列の拒否確認）
- [ ] 正常系回帰テスト PASS（スキル一覧表示、詳細表示、実行、中止）

Closes #874

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

#### PR 作成コマンド（ユーザー許可後に実行）

```bash
gh pr create \
  --title "fix(desktop): skill:ハンドラP42準拠バリデーション統一 (#874)" \
  --body "$(cat <<'EOF'
## Summary

- skillHandlers.ts内の6つの未準拠ハンドラにP42準拠の3段バリデーション（型チェック→空文字列→トリム空文字列）を追加
- throw形式エラーレスポンス（`{ code: "VALIDATION_ERROR", message: "..." }`）に統一
- バリデーション専用テスト追加で全ハンドラの入力検証をカバー

## Test plan

- [ ] `pnpm lint` PASS
- [ ] `pnpm typecheck` PASS
- [ ] バリデーション専用テスト全 PASS（`skillHandlers.validation.test.ts`）
- [ ] 既存テスト回帰なし（`skillHandlers.test.ts`）
- [ ] DevTools経由の手動テスト完了（空文字列/スペースのみ文字列の拒否確認）
- [ ] 正常系回帰テスト PASS（スキル一覧表示、詳細表示、実行、中止）

Closes #874

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

#### PR タイトルルール確認

- [ ] 70文字以内: `fix(desktop): skill:ハンドラP42準拠バリデーション統一 (#874)` — 確認済み
- [ ] `fix/` プレフィックス: セキュリティ改善のため `fix` を使用
- [ ] Summary + Test Plan を含む

---

## 統合テスト連携

### CI確認

PR作成後、GitHub Actions の結果を確認する:

```bash
gh pr checks <PR_NUMBER> --watch
```

| #   | CIジョブ  | 期待結果 | 確認  |
| --- | --------- | -------- | ----- |
| 1   | lint      | PASS     | - [ ] |
| 2   | typecheck | PASS     | - [ ] |
| 3   | テスト    | PASS     | - [ ] |
| 4   | ビルド    | PASS     | - [ ] |

### CI 失敗時の対応

| 失敗箇所  | 対応方針                                                                     |
| --------- | ---------------------------------------------------------------------------- |
| lint      | `pnpm lint --fix` を試行し、修正コミットを追加する                           |
| typecheck | 型エラーを修正し、修正コミットを追加する                                     |
| テスト    | テスト失敗の原因を調査し、修正コミットを追加する。`--no-verify` は使用しない |
| ビルド    | ビルドエラーを調査し、修正コミットを追加する                                 |

---

## 多角的チェック観点

| 観点         | 確認事項                                                                         |
| ------------ | -------------------------------------------------------------------------------- |
| コード品質   | lint / typecheck / テストが全て PASS しているか                                  |
| セキュリティ | P42準拠バリデーションが全6ハンドラに適用されているか                             |
| 後方互換性   | throw形式変更による Renderer 側への影響がないか（Phase 11 手動テストで確認済み） |
| ドキュメント | Phase 12 の全成果物が作成されているか                                            |
| PR品質       | タイトル70文字以内、Summary + Test Plan 含む                                     |
| Git操作      | `--no-verify` を使用していないか                                                 |

---

## 成果物

| #   | 成果物                  | パス                                                                                         |
| --- | ----------------------- | -------------------------------------------------------------------------------------------- |
| 1   | 更新済み index.md       | `docs/30-workflows/completed-tasks/skill-validation-consistency/index.md`                    |
| 2   | 更新済み artifacts.json | `docs/30-workflows/completed-tasks/skill-validation-consistency/artifacts.json`              |
| 3   | PR情報レポート          | `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-13/pr-info.md` |
| 4   | PR（ユーザー許可後）    | GitHub PR URL                                                                                |

---

## 完了条件チェックリスト

- [ ] Step 1: 全成果物（コード・ドキュメント・Phase出力）の存在を確認した
- [ ] Step 2: 全 Phase (1-12) が `artifacts.json` で `completed` ステータスである
- [ ] Step 3: ブランチ名が `docs/skill-validation-consistency-specs` であることを確認した
- [ ] Step 4: コミット前チェック（lint / typecheck / テスト）が全て PASS した
- [ ] Step 4: `--no-verify` を使用していない
- [ ] Step 5: ユーザーの明示的な許可を得て PR を作成した（または作成準備が完了している）
- [ ] Step 5: PR タイトルが70文字以内で、Summary + Test Plan を含む
- [ ] CI: 全 CI ジョブが PASS した（または失敗時の修正完了）
- [ ] `index.md` の全 Phase ステータスが `completed` に更新されている
- [ ] `artifacts.json` の Phase 13 ステータスが `completed` に更新されている
- [ ] `artifacts.json` の `lastUpdated` が現在日時に更新されている
- [ ] PR URL をユーザーに報告した

---

## 最終確認

### PR作成後の確認事項

- [ ] PR URL が有効であることを確認
- [ ] PR本文にSummary / Test Plan / Closes #874 が含まれている
- [ ] CI が通過中または通過済みであることを確認
- [ ] 意図しないファイルがPRに含まれていないことを確認

### タスクディレクトリ整理（PRマージ後に実施）

PRマージ後に以下を実施する（ユーザー判断）:

- [ ] タスク仕様書ディレクトリを `completed-tasks/UT-FIX-SKILL-VALIDATION-CONSISTENCY-001/` に移動
- [ ] `artifacts.json` の全体ステータスを `completed` に最終更新

---

## Phase末端アクション【必須】

- [ ] `artifacts.json` の Phase 13 ステータスを `completed` に更新
- [ ] `artifacts.json` の `lastUpdated` を現在日時に更新
- [ ] PR URL をユーザーに報告

## 依存関係

| 方向 | Phase / タスク                            | 内容                                       |
| ---- | ----------------------------------------- | ------------------------------------------ |
| 前提 | Phase 12（ドキュメント）                  | 全ドキュメント完了後にPR準備               |
| 後続 | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 | マージ後に開始可能（レスポンス形式統一）   |
| 後続 | UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001   | マージ後に開始可能（get-detail引数名修正） |

## 次Phase

なし（最終Phase）。タスク UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 は本 Phase の完了をもって完了する。

マージ後に以下の関連タスクが開始可能になる:

- UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001（レスポンス形式統一）
- UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001（get-detail引数名修正）
