# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 11                                  |
| Phase名    | 手動テスト                          |
| 前提Phase  | Phase 10                            |
| 後続Phase  | Phase 12                            |
| ステータス | 完了                                |
| 作成日     | 2026-04-16                          |
| 機能名     | ut-fix-ci-ipc-continue-on-error-001 |

---

## 目的

GitHub Actions の実際の実行結果を GitHub UI で目視確認し、
`verify-ipc-4layer` ジョブが `continue-on-error` なしで GREEN になることを
人間の目で最終確認する。あわせて、PR 実行では `coverage` ジョブが
`skipped` になることを正常系として確認する。

## 背景

- 本タスクは NON_VISUAL（UI なし）の変更であるため、スクリーンショット計画（screenshot-plan.json）は不要
- CI 設定ファイルの変更は自動テストだけでは完全に検証できず、
  実際に GitHub Actions 上で動作することを目視確認する必要がある
- `coverage` は `push` の `main` でのみ実行され、PR では `skipped` が正常である
- Phase 10 のレビューゲートが PASS または MINOR で完了した前提でこの Phase に入る

---

## 実行タスク

### タスク1: ドラフト PR の作成と CI トリガー

**目的**: CI を実際にトリガーし、GitHub Actions 上で `verify-ipc-4layer` ジョブが動作することを確認する

**実行手順**:

1. 作業ブランチが最新の状態であることを確認する
   ```bash
   git status
   git log --oneline -5
   ```
2. GitHub 上でドラフト PR を作成して CI をトリガーする
   ```bash
   gh pr create \
     --title "fix(ci): UT-FIX-CI-IPC-CONTINUE-ON-ERROR-001 verify-ipc-4layer continue-on-error 解除 [DRAFT]" \
     --body "手動テスト用ドラフトPR" \
     --draft
   ```
3. PR URL を記録する
4. GitHub の Actions タブに移動し、CI がトリガーされたことを確認する

**期待される成果物**:

- ドラフト PR URL の記録
- CI トリガー確認

---

### タスク2: `verify-ipc-4layer` ジョブの実行確認

**目的**: CI 上で `verify-ipc-4layer` ジョブが GREEN になることを目視確認する

**実行手順**:

1. GitHub の Actions タブを開く（URL: `https://github.com/daishiman/AIWorkflowOrchestrator/actions`）
2. 対象の PR に紐づく CI ワークフローを選択する
3. `verify-ipc-4layer` ジョブを選択してログを確認する
4. 以下の観点で目視確認する
   - ジョブのステータスが `✓`（GREEN）であること
   - Rule-1（preload ホワイトリスト整合）PASS のログが出力されていること
   - Rule-2（main ハンドラ実装整合）PASS のログが出力されていること
   - Rule-3（双方向チャネル整合）PASS のログが出力されていること
   - `continue-on-error` の影響を示すオレンジ色のアイコンが表示されていないこと
   - `coverage` ジョブが PR では `skipped` であり、これは正常であること
5. ジョブのステータスと実行時間を記録する

**期待される成果物**:

- `verify-ipc-4layer` ジョブ GREEN の確認記録

---

### タスク3: CI 必須ジョブ（build を含む）GREEN 確認と security / coverage の状態確認

**目的**: `verify-ipc-4layer` ジョブ以外の CI 必須ジョブ（build を含む）も GREEN であることを確認し、
`security` が GREEN、`coverage` が PR で `skipped` になることを正常系として確認する

**実行手順**:

1. 対象の CI ワークフローの全ジョブ一覧を確認する
2. 全ジョブのステータスを一覧化する
3. 必須ジョブが GREEN であることを確認する
4. `security` ジョブが GREEN であることを確認する
5. `coverage` ジョブが PR では `skipped` であることを確認する
6. `coverage` 以外で FAILED または SKIPPED のジョブがある場合は原因を調査し記録する

**期待される成果物**:

- CI 必須ジョブ（build を含む）と `coverage` のトリガー別ステータス一覧

---

### タスク4: テスト結果の記録

**目的**: 手動テストの実施結果を `outputs/phase-11/` に記録する

**実行手順**:

1. `outputs/phase-11/manual-test-checklist.md` を作成し、以下の内容を記録する
   - 実施した確認項目とその結果（PASS/FAIL）
   - GitHub Actions の CI URL
   - 確認日時
2. `outputs/phase-11/manual-test-result.md` を作成し、以下の内容を記録する
   - テスト全体の総合判定（PASS/FAIL）
   - 各ジョブのステータス一覧
   - `verify-ipc-4layer` ジョブのログ抜粋（Rule-1/2/3 の PASS メッセージ）
3. `outputs/phase-11/discovered-issues.md` を作成し、以下の内容を記録する
   - 手動テスト中に発見した問題（なければ「なし」と記録）
   - 問題の深刻度（MINOR/MAJOR/CRITICAL）
   - 対処方針

**outputs/phase-11/manual-test-checklist.md の記述例**:

```markdown
# 手動テストチェックリスト - Phase 11

## 実施情報

| 項目   | 内容            |
| ------ | --------------- |
| 実施日 | YYYY-MM-DD      |
| 実施者 | （実施者名）    |
| CI URL | （Actions URL） |

## チェックリスト

- [ ] ドラフト PR を作成して CI をトリガーした
- [ ] GitHub Actions タブで CI ワークフローが開始されたことを確認した
- [ ] `verify-ipc-4layer` ジョブが GREEN になった
- [ ] Rule-1 PASS のログを確認した
- [ ] Rule-2 PASS のログを確認した
- [ ] Rule-3 PASS のログを確認した
- [ ] `continue-on-error` によるオレンジアイコンが表示されていないことを確認した
- [ ] CI 必須ジョブ（build を含む）が GREEN になった
- [ ] `security` ジョブが GREEN になった
- [ ] `coverage` ジョブが PR では `skipped` であることを確認した
```

**outputs/phase-11/discovered-issues.md の記述例**:

```markdown
# 発見された問題 - Phase 11

## 発見された問題

（問題がなければ）なし

## 総合判定

PASS
```

**期待される成果物**:

- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/discovered-issues.md`

---

## 参照資料

| 参照資料                          | パス                                                                             | 内容                    |
| --------------------------------- | -------------------------------------------------------------------------------- | ----------------------- |
| CI ワークフロー定義               | `.github/workflows/ci.yml`                                                       | 実装対象ファイル        |
| IPC 整合性検証スクリプト          | `scripts/verify-ipc-4layer.cjs`                                                  | Rule-1/2/3 検証ロジック |
| GitHub Actions                    | https://github.com/daishiman/AIWorkflowOrchestrator/actions                      | CI 実行結果確認先       |
| GitHub Issue                      | https://github.com/daishiman/AIWorkflowOrchestrator/issues/2196                  | 受け入れ条件の正本      |
| Phase 10 最終レビューゲート仕様書 | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/phase-10-final-review.md` | 前 Phase の完了状態     |

---

## 成果物

| 成果物                   | パス                                        | 内容                           |
| ------------------------ | ------------------------------------------- | ------------------------------ |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | 実施した確認項目と結果         |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | 総合判定・ジョブステータス一覧 |
| 発見された問題           | `outputs/phase-11/discovered-issues.md`     | テスト中に発見された問題の記録 |

> **注意**: screenshot-plan.json は本タスクが NON_VISUAL であるため作成しない。

---

## 統合テスト連携

GitHub Actions の実際の CI 実行結果を目視確認することで、
自動テスト（Phase 9）では検証しきれない実環境での動作を補完する。
`verify-ipc-4layer` ジョブが `continue-on-error` なしで GREEN になることが
この Phase の中心的な確認事項である。PR 実行では `coverage` が `skipped` であることも
正常な結果として確認する。

---

## 完了条件

- [ ] ドラフト PR を作成し、CI をトリガーした
- [ ] GitHub Actions の `verify-ipc-4layer` ジョブが GREEN であることを目視確認した
- [ ] Rule-1/2/3 が全 PASS であることをログで確認した
- [ ] `continue-on-error` による影響表示（オレンジアイコン等）がないことを確認した
- [ ] CI 必須ジョブ（build を含む）が GREEN であることを確認した
- [ ] `coverage` ジョブが PR では `skipped` であることを確認した
- [ ] `outputs/phase-11/manual-test-checklist.md` を作成した
- [ ] `outputs/phase-11/manual-test-result.md` を作成した
- [ ] `outputs/phase-11/discovered-issues.md` を作成した

---

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスク（タスク1〜4）を 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認（3 ファイル）

---

## 依存関係

- **前提**: Phase 10 が PASS または MINOR で完了していること
- **後続**: Phase 12（ドキュメント更新）へ進む
