# Phase 13: PR作成・CI確認

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 13                                                           |
| タスクID   | UT-W3-ANALYTICS-ADAPTER-001                                  |
| タスク名   | trackEvent analytics adapter差し替え（本番分析基盤への接続） |
| 前提Phase  | Phase 12                                                     |
| 後続Phase  | マージ完了                                                   |
| 作成日     | 2026-04-11                                                   |
| ステータス | 未実施（blocked: ユーザー明示承認待ち）                      |

## 目的

ユーザーの明示的な承認を受けた後、コミット・PRの作成・CI/CDの確認を行う。
**本Phaseはユーザーの明示的な許可があるまでblocked状態を維持する。**

## 最低限の記録

- blocked理由: ユーザー明示承認待ち
- 承認状態: pending
- Phase 12 root evidence: `outputs/phase-12/phase12-task-spec-compliance-check.md`
- ローカル確認結果: `outputs/phase-13/local-check-result.md`
- 変更要約: `outputs/phase-13/change-summary.md`
- PR情報と作成結果: `outputs/phase-13/pr-info.md` / `outputs/phase-13/pr-creation-result.md`

## 重要: 自動実行禁止

```
PR作成はユーザーの明示承認後にのみ実施する。
コミット・pushも同様。
承認前は本Phaseに一切着手しないこと。
```

## 実行タスク（ユーザー承認後のみ実施）

### タスク1: ブランチ作成・コミット

**目的**: 適切なブランチ名でコミットを作成する

**実行手順**:

1. ブランチ名を決定する（例: `feat/analytics-adapter-ut-w3-001`）
2. 変更ファイルを確認する（`git status`・`git diff`）
3. `outputs/phase-13/local-check-result.md` と `outputs/phase-13/change-summary.md` を作成する
4. 以下のファイルをステージングする:
   - `apps/desktop/src/renderer/utils/analyticsAdapter.ts`（新規）
   - `apps/desktop/src/renderer/utils/trackEvent.ts`（修正）
   - `apps/desktop/src/renderer/utils/__tests__/analyticsAdapter.test.ts`（新規）
   - `apps/desktop/src/main/ipc/analyticsHandler.ts`（新規、IPC経由の場合）
   - `apps/desktop/src/preload/`関連ファイル（修正）
   - CSP設定ファイル（修正、変更がある場合）
5. コミットメッセージを作成する（Conventional Commits形式）
6. pre-commitフック（lint-staged）が通ることを確認する

**期待される成果物**:

- コミット作成済み

### タスク2: PR作成

**目的**: GitHub PRを適切なタイトル・本文で作成する

**実行手順**:

1. `git push -u origin <branch-name>`でリモートにpushする
2. PRタイトル: `feat(analytics): trackEvent analytics adapter差し替え（本番分析基盤への接続）`
3. PR本文には以下を含める:
   - 変更内容の概要（AC-1〜AC-9の充足）
   - 関連Issue: Closes #2058
   - テスト結果サマリー（analyticsAdapter: N件PASS）
   - カバレッジ確認（90%+達成）
   - CSP設定変更の有無
4. `gh pr create`で作成する

**期待される成果物**:

- GitHub PR URL

### タスク3: CI/CD確認

**目的**: CI/CDパイプラインが全てPASSすることを確認する

**実行手順**:

1. `gh run list --branch <branch-name>`でCI状態を確認する
2. CI失敗の場合はログを確認し修正する
3. 全ジョブPASSを確認する

```bash
# CI確認コマンド
gh run list --branch <branch-name>
gh run view <run-id> --log
```

**期待される成果物**:

- CI全件PASS確認

### タスク4: PRレビュー対応（レビュー後）

**目的**: レビューコメントへの対応を行う

**実行手順**:

1. PRレビューコメントを確認する
2. 修正が必要な場合はコミットを追加する
3. 対応完了後に再レビューを依頼する

## PR作成コマンド（参考）

```bash
# ブランチ作成
git checkout -b feat/analytics-adapter-ut-w3-001

# ステージング・コミット
git add apps/desktop/src/renderer/utils/analyticsAdapter.ts \
        apps/desktop/src/renderer/utils/trackEvent.ts \
        apps/desktop/src/renderer/utils/__tests__/analyticsAdapter.test.ts \
        apps/desktop/src/main/ipc/analyticsHandler.ts
git commit -m "feat(analytics): trackEvent analytics adapter差し替え（本番分析基盤への接続）

- analyticsAdapter.ts新規作成（IPC経由analytics送信）
- trackEvent.tsのsinkをanalyticsAdapterに差し替え
- オフラインイベントキューイング実装
- ユーザーオプトアウト連動実装
- ALLOWED_INVOKE_CHANNELSにanalyticsチャネル追加

Closes #2058"

# PR作成
git push -u origin feat/analytics-adapter-ut-w3-001
gh pr create \
  --title "feat(analytics): trackEvent analytics adapter差し替え（本番分析基盤への接続）" \
  --body "$(cat <<'EOF'
## 変更内容

W3-seq-04で実装したtrackEventのno-opスタブを本番analytics sinkに差し替えます。

## 受入条件達成状況

- [x] AC-1: 本番環境でanalytics sink送信
- [x] AC-2: CSP非抵触（IPC経由）
- [x] AC-3: オフライン時キューイング・復帰後送信
- [x] AC-4: オプトアウト時送信停止
- [x] AC-5: trackEvent公開APIシグネチャ不変
- [x] AC-6: SkillCreateWizard.tsx変更なし
- [x] AC-7: analyticsAdapter 90%+カバレッジ
- [x] AC-8: typecheck/lint/test全PASS
- [x] AC-9: 初期化失敗時no-opフォールバック

## テスト結果

- analyticsAdapter.test.ts: N件PASS
- trackEvent.test.ts: N件PASS（回帰なし）
- SkillCreateWizard.tracking.test.tsx: N件PASS（回帰なし）

Closes #2058
EOF
)"
```

## 参照資料

| 参照資料             | パス                                                                           |
| -------------------- | ------------------------------------------------------------------------------ |
| Phase 12 成果物      | `outputs/phase-12/`                                                            |
| review-gate-criteria | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` |

## 成果物

| 成果物           | パス                                     | 内容                 |
| ---------------- | ---------------------------------------- | -------------------- |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | 承認前の事前確認     |
| 変更要約         | `outputs/phase-13/change-summary.md`     | 変更ファイルと要点   |
| PR情報           | `outputs/phase-13/pr-info.md`            | PRメタ情報           |
| PR作成結果       | `outputs/phase-13/pr-creation-result.md` | PR作成とCI確認結果   |
| GitHub PR        | GitHub PR URL                            | コード変更・レビュー |
| CI確認結果       | GitHub Actions                           | 全ジョブPASS確認     |

## 完了条件

- [ ] ユーザーから明示的な承認を取得済み
- [ ] `outputs/phase-13/local-check-result.md` と `outputs/phase-13/change-summary.md` 作成完了
- [ ] `outputs/phase-13/pr-info.md` と `outputs/phase-13/pr-creation-result.md` 作成完了
- [ ] ブランチ作成・コミット完了
- [ ] GitHub PR作成完了
- [ ] CI/CDパイプライン全件PASS
- [ ] 本Phase内の全タスクを100%実行完了

## 注意事項

- コミット・PRはユーザーの明示的な許可があるまで実行禁止
- `git commit --no-verify`・`git push --no-verify`は絶対禁止
- Electronセキュリティポリシーを緩める変更は最小限にとどめる
- analytics SDK導入は`pnpm --filter @repo/desktop add`で行う（npm/yarn禁止）

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了（ユーザー承認後）
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## タスク完了

Phase 13完了後、UT-W3-ANALYTICS-ADAPTER-001タスクは完了となる。
