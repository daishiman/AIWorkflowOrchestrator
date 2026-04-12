# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目                 | 値                                 |
| -------------------- | ---------------------------------- |
| Phase                | 13                                 |
| タスクID             | TASK-UI-SCHEDULE-CRON-SEMANTIC-001 |
| 機能名               | 意味論的 cron バリデーション追加   |
| タスク種別           | implementation                     |
| requiresUserApproval | **true**                           |
| 前Phase              | Phase 12: ドキュメント更新         |
| 次Phase              | なし（最終Phase）                  |
| ステータス           | 未実施                             |
| 作成日               | 2026-04-12                         |

---

## 目的

Phase 1〜12 の完了後に、コミットと PR を作成し、TASK-UI-SCHEDULE-CRON-SEMANTIC-001 の実装をメインブランチへマージするためのレビュー依頼を行う。

> **重要**: PR作成はユーザーの明示的な許可後のみ実施する。確認なしに `git commit` や `gh pr create` を実行してはならない。

---

## PR 作成前チェックリスト

以下を全て確認してからユーザーに承認を求めること:

- [ ] Phase 12 全タスク（Task 12-1〜12-6）が完了していること
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` が生成されていること
- [ ] 自動テスト全件 PASS が `outputs/phase-11/manual-test-result.md` に記録されていること
- [ ] ユーザーの明示的な承認を取得していること
- [ ] ブランチ名を確認していること（例: `feat/cron-semantic-validation`）
- [ ] コミットメッセージ候補をユーザーに提示し、承認を得ていること

---

## ユーザー承認フロー

```
Phase 12 完了
    |
    v
[Claude] PR作成前チェックリストを提示
    |
    v
[Claude] 以下を確認:
  - ブランチ名（例: feat/cron-semantic-validation）
  - コミットメッセージ候補
  - PR タイトル・本文の下書き
    |
    v
[User] 承認 / 修正指示
    |
    v
[Claude] 承認後のみ実行コマンドを実施
```

---

## PR 内容（下書き）

### PR タイトル

```
[TASK-UI-SCHEDULE-CRON-SEMANTIC-001] 意味論的 cron バリデーション追加
```

### PR 概要

- `validateCronExpression` に `options?.semantic` フラグを追加する
- `cron-parser` ライブラリで next-execution-time を計算し、不可能な日付（`"0 0 31 2 *"` = 2月31日等）を検出する
- `options` はオプショナルであり、未指定時は従来の構文・値域チェックのみを実行する（後方互換性を維持）
- 新規インターフェース `ValidateCronOptions = { semantic?: boolean }` を追加する
- `apps/desktop/package.json` に `cron-parser` 依存を追加する

### 関連 Issue

`closes #2074`

### 変更ファイル

| ファイル                                                                | 変更種別 | 変更内容                                                              |
| ----------------------------------------------------------------------- | -------- | --------------------------------------------------------------------- |
| `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`            | 修正     | `ValidateCronOptions` 追加・`validateCronExpression` 拡張・JSDoc 更新 |
| `apps/desktop/package.json`                                             | 修正     | `cron-parser` 依存追加                                                |
| `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts` | 修正     | 意味論的不正ケースのテストを追加                                      |

---

## コミットメッセージ候補

```
feat(schedule): add semantic cron validation with cron-parser

Add ValidateCronOptions interface to validateCronExpression for semantic
validation. When options.semantic=true, uses cron-parser to detect
impossible dates like "0 0 31 2 *" (Feb 31st).

Closes #2074
```

---

## 実行コマンド（ユーザー承認後のみ）

> 以下のコマンドはユーザーの明示的な承認後にのみ実行すること。

````bash
# 1. ブランチ作成
git checkout -b feat/cron-semantic-validation

# 2. 変更ファイルをステージング
git add apps/desktop/src/renderer/utils/scheduleConfigValidator.ts
git add apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts

# 3. コミット（--no-verify は使用禁止）
git commit -m "feat(schedule): add semantic cron validation with cron-parser

Add ValidateCronOptions interface to validateCronExpression for semantic
validation. When options.semantic=true, uses cron-parser to detect
impossible dates like \"0 0 31 2 *\" (Feb 31st).

Closes #2074"

# 4. リモートへプッシュ
git push -u origin feat/cron-semantic-validation

# 5. PR 作成
gh pr create \
  --title "[TASK-UI-SCHEDULE-CRON-SEMANTIC-001] 意味論的 cron バリデーション追加" \
  --body "$(cat <<'EOF'
## 概要

- `validateCronExpression` に `options?.semantic` フラグを追加
- `cron-parser` ライブラリで next-execution-time を計算し、不可能な日付（例: `"0 0 31 2 *"` = 2月31日）を検出
- `options` はオプショナルであり、未指定時は従来の構文・値域チェックのみを実行（後方互換性を維持）
- 新規インターフェース `ValidateCronOptions = { semantic?: boolean }` を追加

## 変更ファイル

| ファイル | 変更内容 |
|----------|----------|
| `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts` | `ValidateCronOptions` 追加・`validateCronExpression` 拡張・JSDoc 更新 |
| `apps/desktop/package.json` | `cron-parser` 依存追加 |
| `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts` | 意味論的不正ケースのテストを追加 |

## 受け入れ基準

- [x] AC-1: `validateCronExpression("0 0 31 2 *", { semantic: true })` がエラーを返す
- [x] AC-2: `validateCronExpression("0 0 * * *")` 等の正常ケースは引き続き PASS する
- [x] AC-3: 既存テスト SCV-01〜SCV-12 が全件 PASS する
- [x] AC-4: 追加テストケースでカバレッジが向上している
- [x] AC-5: JSDoc が更新される

## テスト

```bash
pnpm vitest run apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts \
              apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts
````

Closes #2074
EOF
)"

````

---

## 参照資料

| 資料名                               | パス                                                                    | 説明                                              |
| ------------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------- |
| Phase 12 準拠チェック               | `outputs/phase-12/phase12-task-spec-compliance-check.md`                | Phase 12 全タスク完了の root evidence             |
| Phase 11 手動テスト結果              | `outputs/phase-11/manual-test-result.md`                                | 自動テスト全件 PASS の証跡                        |
| scheduleConfigValidator 実装         | `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`            | 変更対象ファイル                                  |
| scheduleConfigValidator エッジテスト | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts` | 追加テスト                                        |
| Issue #2074                          | https://github.com/daishiman/AIWorkflowOrchestrator/issues/2074         | closes #2074                                      |

---

## 成果物

| 成果物             | 配置先                  | 形式              |
| ------------------ | ----------------------- | ----------------- |
| PR URL             | GitHub Pull Requests    | URL               |
| outputs/phase-13/  | （ユーザー承認後に PR 作成完了時点で空でよい） | - |

> `outputs/phase-13/` ディレクトリは PR 作成完了後に PR URL を記録するファイルを置いてよいが、必須ではない。

---

## 完了条件チェックリスト

- [ ] Phase 12 全タスク完了を `outputs/phase-12/phase12-task-spec-compliance-check.md` で確認していること
- [ ] ユーザーの明示的な承認を取得していること
- [ ] `feat/cron-semantic-validation` ブランチが作成されていること
- [ ] コミットが作成され、`--no-verify` を使用していないこと
- [ ] リモートへのプッシュが完了していること
- [ ] `gh pr create` で PR が作成され、URL が取得できていること
- [ ] PR に `closes #2074` が含まれていること

---

## Phase 末端アクション【必須】

Phase 13 完了時に以下を実行すること:

1. PR URL をユーザーに報告する
2. Issue #2074 が PR によって自動クローズされることをユーザーに案内する
3. 必要に応じて `outputs/phase-13/pr-url.md` に PR URL を記録する

---

## 依存関係

| 依存Phase/タスク | 依存内容                                                                         |
| ---------------- | -------------------------------------------------------------------------------- |
| Phase 12 完了    | Phase 12 の全成果物（6ファイル）が `outputs/phase-12/` 配下に生成されていること |
| Phase 11 完了    | 自動テスト全件 PASS が確認されていること                                         |
| ユーザー承認     | PR 作成前にユーザーの明示的な許可を得ていること                                  |

---

## Phase 実行記録テンプレート

```markdown
## Phase 13 実行記録

- 実行日時: YYYY-MM-DD HH:mm
- 実行者: -
- PR 作成前チェックリスト: X / 6 項目完了
- ユーザー承認取得: [ ] DONE / [ ] PENDING
- ブランチ作成: [ ] DONE（ブランチ名: feat/cron-semantic-validation）
- コミット作成: [ ] DONE
- プッシュ完了: [ ] DONE
- PR 作成完了: [ ] DONE（PR URL: https://github.com/daishiman/AIWorkflowOrchestrator/pull/XXXX）
- Issue #2074 クローズ確認: [ ] DONE / [ ] PENDING
- 完了条件充足状況: X / 7 項目完了
````
