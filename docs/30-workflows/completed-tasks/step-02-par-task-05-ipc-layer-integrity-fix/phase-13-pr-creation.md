# Phase 13: PR 作成

## メタ情報

| 項目     | 値                                                    |
| -------- | ----------------------------------------------------- |
| Phase    | 13                                                    |
| タスクID | TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001                  |
| 機能名   | skill-lifecycle-routing / ipc-layer-integrity-fix     |
| 作成日   | 2026-03-17                                            |
| 前Phase  | [Phase 12: ドキュメント](./phase-12-documentation.md) |
| 後Phase  | なし（マージ準備完了）                                |

## 目的

Phase 12 までの根拠を整理したうえで、**ユーザーの明示承認が得られた場合のみ** commit / PR 作成へ進む。
この workflow では Phase 13 を pending / blocked で維持すること自体が正しい終端になり得る。

## 重要な注意事項

**PR 作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**
**対象ワークツリーは `TARGET_WORKFLOW_DIR="docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-05-ipc-layer-integrity-fix"` として明示すること。**

**現時点の状態**:

- Phase 13 は `pending`
- commit / PR / CI 実行は未着手
- このタスクではユーザーが「コミット、PRは勝手にしないこと」と明示しているため、承認前に Phase 13 を閉じない

| 禁止事項                               | 理由                                       |
| -------------------------------------- | ------------------------------------------ |
| 勝手に PR を作成する                   | レビュー前の変更がリモートに反映される     |
| ユーザー確認なしで commit する         | 差分確定前の状態を固定してしまう           |
| ユーザー確認なしで PR 補助スキルを使う | 意図しないブランチやコミットが作成される   |
| ローカル確認をスキップする             | 動作確認されていないコードが PR に含まれる |

## 実行タスク

### タスク 1: ローカル確認チェック

**目的**: PR 作成前に全てのチェックがパスすることを確認する

**コマンド**:

```bash
export TARGET_WORKFLOW_DIR="docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-05-ipc-layer-integrity-fix"

# shared パッケージビルド（P32 対策: 共有チャンネル定数の整合確認）
pnpm --filter @repo/shared build

# 型チェック
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck

# Lint 確認
pnpm --filter @repo/desktop lint

# テスト確認
cd apps/desktop && pnpm vitest run \
  src/main/ipc/__tests__/skillHandlers.update.test.ts \
  src/preload/__tests__/skill-api.getDetail-update.test.ts \
  --reporter=verbose
```

**チェックリスト**:

- [ ] shared ビルドが成功する
- [ ] 型チェックがパスする（desktop + shared 両方）
- [ ] Lint エラーがない
- [ ] 全テストがパスする

**期待される成果物**:

- `outputs/phase-13/local-check-result.md`

---

### タスク 2: 変更内容の確認

**目的**: コミット対象の変更内容を確認する

**コマンド**:

```bash
# 変更ファイル一覧
git status

# 差分確認
git diff --stat HEAD

# 機密情報確認
git diff HEAD -- apps/desktop/src/main/ipc/skillHandlers.ts \
  apps/desktop/src/preload/skill-api.ts
```

**想定される変更ファイル**:

| ファイル                                                                                         | 変更種別 |
| ------------------------------------------------------------------------------------------------ | -------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                                                     | 修正     |
| `apps/desktop/src/preload/skill-api.ts`                                                          | 修正     |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.update.test.ts`                               | 新規     |
| `apps/desktop/src/preload/__tests__/skill-api.getDetail-update.test.ts`                          | 新規     |
| `docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-05-ipc-layer-integrity-fix/**` | 新規     |

**確認事項**:

| 確認項目           | 確認内容                             |
| ------------------ | ------------------------------------ |
| 変更ファイル       | 想定通りのファイルのみ変更されている |
| 機密情報           | API キー等が含まれていない           |
| 不要ファイル       | ビルド成果物等が含まれていない       |
| コードフォーマット | Prettier が適用されている            |

**期待される成果物**:

- `outputs/phase-13/change-summary.md`

---

### タスク 3: ユーザー確認の取得

**目的**: PR 作成の許可をユーザーから取得する

**実行手順**:

1. 変更内容のサマリーを提示する
2. ユーザーにローカル確認結果を再確認してもらう
3. PR 作成の許可を求める
4. 許可が得られたら次のタスクへ進む

**提示内容テンプレート**:

```markdown
## PR 作成確認

以下の内容で PR を作成します:

### 変更内容

- skillHandlers.ts: SKILL_UPDATE ハンドラ新規追加 + unregister 追加（AC-1, AC-2）
- skill-api.ts: getDetail() / update() Preload API 追加（AC-3, AC-4）
- P42 準拠3段バリデーション、P45 準拠命名統一（AC-5）
- IPC契約チェックリスト Phase 1-6 実施済み（AC-6）

### ローカルチェック結果

- 型チェック: PASS
- Lint: PASS
- テスト: PASS

PR を作成してよろしいですか？
```

**期待される成果物**:

- ユーザーからの許可（チャット上）

---

### タスク 4: PR作成手段の選定と実行（承認後のみ）

**目的**: 承認後にのみ、利用可能な手段で PR を作成する

**実行手順**:

1. ユーザーの許可を確認する（タスク 3 完了後のみ実行）
2. 利用可能な PR 作成手段を選ぶ（例: `gh pr create`、チーム標準スクリプト、PR補助スキル）
3. PR が作成されたことを確認する
4. PR URL を記録する

**実行時追加ルール**:

- `TARGET_WORKFLOW_DIR` に含まれる成果物だけを PR 本文・コメントの根拠に使う
- `outputs/phase-12/implementation-guide.md` の要点は PR コメントで明示する
- UI変更がないため、スクリーンショット要求はしない
- ユーザー承認が必要な場合は、PR 作成前に承認待ちを明示する

**PR タイトル（参考）**:

```
fix(ipc): SKILL_UPDATEハンドラ追加とSKILL_GET_DETAIL Preload API公開
```

**PR 本文サマリー（参考）**:

```markdown
## Summary

- `skill:update` デッドチャンネルを解消（ipcMain.handle 追加 + unregister 追加）
- `skill:get-detail` Preload API 未公開を解消（getDetail() メソッド追加）
- P42 準拠3段バリデーション・P45 準拠命名統一を実施

## Test Plan

- `skillHandlers.update.test.ts` 新規作成（正常系・異常系・P42バリデーション）
- `skill-api.getDetail-update.test.ts` 新規作成
- 既存 skillHandlers テスト全件 PASS を確認済み
```

**期待される成果物**:

- `outputs/phase-13/pr-creation-result.md`
- `outputs/phase-13/pr-info.md`
- PR URL

---

### タスク 5: CI 確認・マージ準備完了報告

**目的**: CI がパスしマージ準備が完了したことを確認・報告する

**CI 確認事項**:

| CI 項目    | 期待結果 | 実際 |
| ---------- | -------- | ---- |
| ビルド     | PASS     | -    |
| テスト     | PASS     | -    |
| 型チェック | PASS     | -    |
| Lint       | PASS     | -    |

**タスクディレクトリ移動（PR 作成 + CI PASS + マージ完了後に実行）**:

```bash
# マージ後に実行
mv docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-05-ipc-layer-integrity-fix \
   docs/30-workflows/completed-tasks/TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001
```

**期待される成果物**:

- `outputs/phase-13/ci-result.md`
- `outputs/phase-13/merge-readiness-report.md`

---

## 参照資料

| 参照資料                 | パス                                                                                                                                                                                                                                                                                              | 内容                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 1 要件定義         | `outputs/phase-1/requirements.md`                                                                                                                                                                                                                                                                 | 要件定義                     |
| Phase 2 設計書           | `outputs/phase-2/design.md`                                                                                                                                                                                                                                                                       | 設計                         |
| Phase 5 実装成果物       | `outputs/phase-5/implementation-report.md`                                                                                                                                                                                                                                                        | 実装コード                   |
| Phase 6 テスト拡充       | `outputs/phase-6/coverage-after.md`                                                                                                                                                                                                                                                               | 拡充後テストとカバレッジ結果 |
| Phase 7 カバレッジ       | `outputs/phase-7/coverage-report.md`                                                                                                                                                                                                                                                              | カバレッジ結果               |
| Phase 8 リファクタリング | `outputs/phase-8/refactoring-report.md`                                                                                                                                                                                                                                                           | リファクタリング結果         |
| Phase 9 品質検証         | `outputs/phase-9/quality-gate-result.md`                                                                                                                                                                                                                                                          | 品質検証結果                 |
| Phase 10 最終レビュー    | `outputs/phase-10/final-review-result.md`                                                                                                                                                                                                                                                         | 最終レビュー結果             |
| Phase 11 手動テスト      | `outputs/phase-11/manual-test-result.md` / `outputs/phase-11/devtools-test-result.md` / `outputs/phase-11/error-handling-result.md` / `outputs/phase-11/discovered-issues.md`                                                                                                                     | 手動テスト結果               |
| Phase 12 ドキュメント    | `outputs/phase-12/implementation-guide.md` / `outputs/phase-12/spec-update-summary.md` / `outputs/phase-12/phase12-task-spec-compliance-check.md` / `outputs/phase-12/documentation-changelog.md` / `outputs/phase-12/unassigned-task-detection.md` / `outputs/phase-12/skill-feedback-report.md` | ドキュメント成果物           |
| 変更ファイル             | `apps/desktop/src/main/ipc/skillHandlers.ts`                                                                                                                                                                                                                                                      | 実装コード                   |
| Git ルール               | `.claude/rules/07-git-and-tooling.md`                                                                                                                                                                                                                                                             | Git 操作ルール               |

---

## 成果物

| 成果物           | パス                                         | 内容              |
| ---------------- | -------------------------------------------- | ----------------- |
| ローカルチェック | `outputs/phase-13/local-check-result.md`     | チェック結果      |
| 変更サマリー     | `outputs/phase-13/change-summary.md`         | 変更内容          |
| PR 情報          | `outputs/phase-13/pr-info.md`                | PR URL/メタデータ |
| PR 作成結果      | `outputs/phase-13/pr-creation-result.md`     | PR 情報           |
| CI 結果          | `outputs/phase-13/ci-result.md`              | CI 状況           |
| マージ準備報告   | `outputs/phase-13/merge-readiness-report.md` | 最終報告          |

---

## 完了条件

- [ ] ローカルチェック（ビルド、テスト、型、Lint）が全てパスしている
- [ ] 変更内容が確認されている（想定外ファイルの変更がない）
- [ ] ユーザーから PR 作成の許可が得られている
- [ ] PR が作成されている
- [ ] CI が全てパスしている
- [ ] マージ準備完了報告が作成されている

---

## タスク100%実行確認【必須】

- [ ] **本Phase内の全タスクを100%実行完了**
- [ ] 各タスクの成果物（6ファイル）が生成されている
- [ ] PR URL をユーザーに報告済み

---

## タスク完了報告テンプレート

**注意**: マージはユーザーが GitHub UI 上で手動で実行してください。

```markdown
## TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001: IPC層整合性修正 完了

### 成果物

- skillHandlers.ts に SKILL_UPDATE ハンドラ追加（ipcMain.handle + unregister）
- skill-api.ts に getDetail() / update() Preload API 追加
- P42 準拠3段バリデーション・P45 準拠命名統一 実装完了
- ユニットテスト実装完了
- 実装ガイド作成完了

### PR

- URL: {{PR_URL}}
- ステータス: マージ準備完了

### 次のステップ

- GitHub UI で PR をレビュー・マージしてください
- マージ後、step-02 の他の並列タスクと合流して step-03 へ進みます
```
