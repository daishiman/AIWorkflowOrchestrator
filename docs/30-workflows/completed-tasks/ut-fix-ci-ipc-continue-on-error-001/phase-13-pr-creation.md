# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 13                                  |
| Phase名    | PR作成                              |
| 前提Phase  | Phase 12                            |
| 後続Phase  | なし（完了）                        |
| ステータス | 未実施                              |
| 作成日     | 2026-04-16                          |
| 機能名     | ut-fix-ci-ipc-continue-on-error-001 |

---

## 目的

Phase 1〜12 の全作業を経て完成した変更（`.github/workflows/ci.yml` の `continue-on-error: true` 削除）を
GitHub Pull Request としてマージ可能な状態にし、CI の最終確認を行う。

## 背景

- Phase 12（ドキュメント更新）が完了し、全ての変更と記録が整った状態でこの Phase に入る
- Issue #2196 は CLOSED 状態であるが、実装変更の PR はまだ作成・マージされていない
- PR を作成して CI を最終確認し、レビュー・マージの準備を整える
- Phase 11 でドラフト PR を作成済みの場合は、そのドラフトを正式 PR に昇格させる

---

## 実行タスク

### タスク1: ブランチ・コミット状態の最終確認

**目的**: PR 作成前に作業ブランチのコミット状態が正常であることを確認する

**実行手順**:

1. 現在のブランチ名を確認する

   ```bash
   git branch --show-current
   ```

   - 期待値: `fix/ut-fix-ci-ipc-continue-on-error-001`（または同等の適切なブランチ名）

2. コミット差分を確認する

   ```bash
   git diff main -- .github/workflows/ci.yml
   ```

   - 削除行が `continue-on-error: true` のみであることを確認する

3. コミット履歴を確認する
   ```bash
   git log main..HEAD --oneline
   ```
4. 未コミットの変更がないことを確認する

   ```bash
   git status
   ```

   - ドキュメント更新（Phase 12）のコミットが含まれていることを確認する

**期待される成果物**:

- ブランチ・コミット状態の確認結果

---

### タスク2: PR の作成

**目的**: GitHub に Pull Request を作成し、レビューとマージの準備を整える

**実行手順**:

1. Phase 11 でドラフト PR を作成済みの場合は、そのドラフトを正式 PR に昇格させる
   ```bash
   gh pr ready
   ```
2. ドラフト PR を作成していない場合は、以下のコマンドで新規 PR を作成する

   ```bash
   gh pr create \
     --title "fix(ci): UT-FIX-CI-IPC-CONTINUE-ON-ERROR-001 verify-ipc-4layer continue-on-error 解除" \
     --body "$(cat <<'EOF'
   ## 変更内容

   - `.github/workflows/ci.yml` の `verify-ipc-4layer` ジョブから `continue-on-error: true` を削除

   ## 背景

   - `UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001` でCI追加時に一時設定した `continue-on-error: true` を解除
   - 既知の全IPC違反（Rule-1: preloadホワイトリスト12チャネル、Rule-2: mainハンドラ8チャネル）は解消済み
   - `continue-on-error: true` が残存する限り、将来のIPC違反がCIをすり抜けるリスクがある

   ## 関連Issue

   Closes #2196

   ## 確認事項

   - [ ] ローカルで `node scripts/verify-ipc-4layer.cjs` が Rule-1/2/3 全PASS
   - [ ] CI `verify-ipc-4layer` ジョブがGREEN
   - [ ] CI全ジョブがGREEN
   EOF
   )"
   ```

3. 作成した PR の URL を記録する
4. PR が正しく作成されたことを確認する
   ```bash
   gh pr view
   ```

**期待される成果物**:

- 作成した PR の URL
- PR の内容確認結果

---

### タスク3: PR マージ前の CI 最終確認

**目的**: PR 作成後に CI が全ジョブ GREEN であることを最終確認する

**実行手順**:

1. PR に紐づく CI の実行状況を確認する
   ```bash
   gh pr checks
   ```
2. 全チェックが PASS になるまで待機する（最大 30 分程度）
3. `verify-ipc-4layer` ジョブが GREEN であることを確認する
4. 全ジョブが GREEN になったら以下を記録する
   - CI 完了日時
   - 全ジョブのステータス一覧
   - `gh pr checks` の出力結果

**CI 確認手順（詳細）**:

```bash
# PR のチェック状況をリアルタイムで確認
gh pr checks --watch

# または GitHub Actions の URL を直接確認
gh pr view --web
```

**GitHub Actions での目視確認手順**:

1. `gh pr view --web` で PR ページを開く
2. "Checks" タブを選択する
3. 全チェックが緑色のチェックマークになっていることを確認する
4. 特に `verify-ipc-4layer` ジョブの詳細ログで Rule-1/2/3 PASS を確認する

**期待される成果物**:

- CI 最終確認結果の記録（全ジョブ GREEN）

---

### タスク4: PR のタイトル・ボディの最終確認

**目的**: PR のタイトルとボディが所定の形式に従っていることを確認する

**実行手順**:

1. PR のタイトルを確認する

   ```bash
   gh pr view --json title -q '.title'
   ```

   - 期待値: `fix(ci): UT-FIX-CI-IPC-CONTINUE-ON-ERROR-001 verify-ipc-4layer continue-on-error 解除`

2. PR のボディを確認する
   ```bash
   gh pr view --json body -q '.body'
   ```
3. 以下の必須項目が含まれていることを確認する
   - `## 変更内容` セクション（`continue-on-error: true` 削除の説明）
   - `Closes #2196`（Issue クローズ参照）
   - 確認事項チェックリスト（3 項目）
4. 不備がある場合は `gh pr edit` で修正する
   ```bash
   gh pr edit --title "修正後のタイトル"
   gh pr edit --body "修正後のボディ"
   ```

**PRタイトル・ボディのテンプレート**:

```
タイトル:
fix(ci): UT-FIX-CI-IPC-CONTINUE-ON-ERROR-001 verify-ipc-4layer continue-on-error 解除

ボディ:
## 変更内容

- `.github/workflows/ci.yml` の `verify-ipc-4layer` ジョブから `continue-on-error: true` を削除

## 関連Issue

Closes #2196

## 確認事項

- [ ] ローカルで `node scripts/verify-ipc-4layer.cjs` が Rule-1/2/3 全PASS
- [ ] CI `verify-ipc-4layer` ジョブがGREEN
- [ ] CI全ジョブがGREEN
```

**期待される成果物**:

- PR タイトル・ボディの確認結果

---

### タスク5: Phase 13 完了記録とタスク完了宣言

**目的**: 全 Phase の完了を記録し、タスク `UT-FIX-CI-IPC-CONTINUE-ON-ERROR-001` の完了を宣言する

**実行手順**:

1. `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/phase-13-pr-creation.md`（本ファイル）のメタ情報テーブルのステータスを `完了` に更新する
2. `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/artifacts.json` に PR の情報を追記する
   - PR URL
   - PR 番号
   - CI 最終確認日時
3. タスク全体の完了を宣言し、PR のレビュー・マージを依頼する

**完了宣言例**:

```
タスク UT-FIX-CI-IPC-CONTINUE-ON-ERROR-001 が全 Phase（Phase 1〜13）で完了しました。

PR: <PR URL>
CI: 全ジョブ GREEN 確認済み
Issue #2196: Closes 参照済み

レビューおよびマージをお願いします。
```

**期待される成果物**:

- 完了した PR（レビュー待ち状態）
- 更新された `artifacts.json`（PR 情報追記済み）

---

## 参照資料

| 参照資料                        | パス                                                                              | 内容                           |
| ------------------------------- | --------------------------------------------------------------------------------- | ------------------------------ |
| CI ワークフロー定義             | `.github/workflows/ci.yml`                                                        | 変更対象ファイル（差分確認用） |
| IPC 整合性検証スクリプト        | `scripts/verify-ipc-4layer.cjs`                                                   | Rule-1/2/3 検証ロジック        |
| GitHub Issue                    | https://github.com/daishiman/AIWorkflowOrchestrator/issues/2196                   | 受け入れ条件・Closes 参照先    |
| GitHub Actions                  | https://github.com/daishiman/AIWorkflowOrchestrator/actions                       | CI 最終確認先                  |
| Phase 12 ドキュメント更新仕様書 | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/phase-12-documentation.md` | 前 Phase の完了状態            |
| artifacts.json                  | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/artifacts.json`            | PR 情報追記対象                |
| タスク仕様書 index              | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/index.md`                  | 全 Phase サマリー              |

---

## 成果物

| 成果物                    | パス / 場所                                                            | 内容                        |
| ------------------------- | ---------------------------------------------------------------------- | --------------------------- |
| Pull Request              | GitHub（`daishiman/AIWorkflowOrchestrator`）                           | マージ可能な状態の PR       |
| CI 最終確認結果           | `outputs/phase-13/`（Phase 実行時に生成）                              | 全ジョブ GREEN のエビデンス |
| 更新された artifacts.json | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/artifacts.json` | PR 情報追記済み             |

---

## 統合テスト連携

PR 作成後に実行される GitHub Actions の CI が統合テストの最終ゲートとなる。
`gh pr checks --watch` で全チェックの PASS を確認することが本 Phase の中心的な作業である。

---

## 完了条件

- [ ] ブランチが `fix/ut-fix-ci-ipc-continue-on-error-001`（または同等）であることを確認した
- [ ] `git diff main -- .github/workflows/ci.yml` で削除行が `continue-on-error: true` のみであることを確認した
- [ ] `gh pr create`（または `gh pr ready`）で PR を作成した
- [ ] PR タイトルが所定の形式に従っていることを確認した
- [ ] PR ボディに `Closes #2196` が含まれていることを確認した
- [ ] PR ボディに確認事項チェックリスト（3 項目）が含まれていることを確認した
- [ ] CI の全ジョブが GREEN であることを `gh pr checks` で確認した
- [ ] 特に `verify-ipc-4layer` ジョブが GREEN であることを確認した
- [ ] `artifacts.json` に PR 情報を追記した
- [ ] タスク `UT-FIX-CI-IPC-CONTINUE-ON-ERROR-001` の完了を宣言した

---

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスク（タスク1〜5）を 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認（PR・artifacts.json 更新）

---

## 依存関係

- **前提**: Phase 12 が完了していること（ドキュメント更新済み）
- **後続**: タスク完了（Phase 13 が本タスクの最終 Phase）
