# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 13                      |
| Phase名    | PR作成                  |
| 前提Phase  | Phase 12                |
| 後続Phase  | なし（最終Phase）       |
| ステータス | 未実施                  |
| 作成日     | 2026-01-12              |
| 機能名     | postrelease-sdk-testing |

---

## 目的

全成果物をまとめてPull Requestを作成し、レビュー・マージの準備を完了する。

## 背景

Phase 1〜12で作成した全成果物（テストコード、ドキュメント、設定ファイル等）をまとめ、mainブランチへのマージ準備を行う。PRには適切な説明を付け、レビュアーが変更内容を理解しやすいようにする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 変更内容の最終確認

**目的**: PRに含める変更内容を最終確認する。

**実行手順**:

1. 変更されたファイル一覧を確認
   ```bash
   git status
   git diff --stat main
   ```
2. 不要なファイルがないか確認
3. コミット履歴を確認
4. 必要に応じて整理

**確認項目**:

| 確認項目       | 内容                         | 結果  |
| -------------- | ---------------------------- | ----- |
| テストファイル | E2E/パフォーマンス/安定性    | OK/NG |
| ドキュメント   | 全成果物ドキュメント         | OK/NG |
| 設定ファイル   | package.json等の変更         | OK/NG |
| 不要ファイル   | .tmp, node_modules等がないか | OK/NG |

**期待される成果物**:

- 変更内容確認結果

---

### タスク2: コミット整理

**目的**: コミット履歴を整理し、レビューしやすい状態にする。

**実行手順**:

1. コミット履歴を確認
   ```bash
   git log --oneline main..HEAD
   ```
2. 必要に応じてコミットをまとめる（squash）
3. コミットメッセージを適切に修正
4. 最終コミット状態を確認

**コミットメッセージ規則**:

```
feat(agent-sdk): Add post-release SDK integration tests

- Add E2E tests for real SDK connection
- Add performance tests with baseline measurements
- Add stability tests for long-running sessions
- Add network resilience tests
- Update documentation with test results
```

**期待される成果物**:

- 整理されたコミット履歴

---

### タスク3: PR本文作成

**目的**: PRの説明文を作成する。

**実行手順**:

1. PR本文テンプレートに従って作成
2. 変更概要を記載
3. テスト結果を記載
4. レビューポイントを記載
5. チェックリストを作成

**PR本文テンプレート**:

```markdown
## Summary

Post-release SDK統合テストの実装と実行結果

## Changes

### テストコード

- E2Eテスト: `apps/desktop/e2e/agent-sdk-integration.spec.ts`
- パフォーマンステスト: `apps/desktop/e2e/agent-performance.spec.ts`
- 安定性テスト: `apps/desktop/scripts/long-running-test.mjs`
- ネットワークテスト: `apps/desktop/e2e/agent-network-resilience.spec.ts`

### ドキュメント

- テスト結果サマリー
- SDK統合ガイド
- パフォーマンスベースライン
- トラブルシューティングガイド

## Test Results

| カテゴリ               | 結果 |
| ---------------------- | ---- |
| E2Eテスト              | PASS |
| パフォーマンステスト   | PASS |
| 安定性テスト           | PASS |
| ネットワーク障害テスト | PASS |

### Performance Metrics

| 指標              | 目標      | 実績 |
| ----------------- | --------- | ---- |
| 初回応答時間      | 500ms以下 | XXms |
| メッセージ間遅延  | 100ms以下 | XXms |
| メモリ増加量/時間 | 100MB以下 | XXMB |

## Review Points

- [ ] テストカバレッジが十分か
- [ ] パフォーマンス目標が達成されているか
- [ ] ドキュメントが適切か

## Checklist

- [ ] テストが全てパスしている
- [ ] Lintエラーがない
- [ ] 型エラーがない
- [ ] ドキュメントが更新されている
```

**期待される成果物**:

- PR本文

---

### タスク4: PR作成

**目的**: GitHubでPull Requestを作成する。

**実行手順**:

1. リモートブランチにプッシュ
   ```bash
   git push -u origin docs/task-agent-05-postrelease-sdk-testing
   ```
2. GitHub CLIでPRを作成
   ```bash
   gh pr create --title "feat(agent-sdk): Post-release SDK integration tests" --body-file pr-body.md --base main
   ```
3. PRが正しく作成されたことを確認
4. CIが実行されることを確認

**確認項目**:

| 確認項目       | 内容                 | 結果  |
| -------------- | -------------------- | ----- |
| PR作成         | PRが作成されている   | OK/NG |
| ベースブランチ | mainが指定されている | OK/NG |
| CI実行         | CIが開始されている   | OK/NG |
| ラベル         | 適切なラベルが付与   | OK/NG |

**期待される成果物**:

- 作成されたPR

---

### タスク5: CI確認・対応

**目的**: CIが成功することを確認し、必要に応じて修正する。

**実行手順**:

1. CI実行状況を確認
   ```bash
   gh pr checks
   ```
2. 失敗がある場合は原因を調査
3. 必要に応じて修正・再プッシュ
4. 全CIがパスするまで繰り返し

**CI確認項目**:

| CI項目     | 内容             | 結果      |
| ---------- | ---------------- | --------- |
| Build      | ビルドが成功     | PASS/FAIL |
| Test       | テストが成功     | PASS/FAIL |
| Lint       | Lintが成功       | PASS/FAIL |
| Type Check | 型チェックが成功 | PASS/FAIL |

**期待される成果物**:

- CI成功確認

---

### タスク6: レビュー依頼

**目的**: レビュアーにレビューを依頼する。

**実行手順**:

1. レビュアーを指定
2. レビュー依頼コメントを追加
3. 必要に応じてSlack等で通知
4. レビュー待ち状態に

**期待される成果物**:

- レビュー依頼完了

---

## 参照資料

| 参照資料           | パス                                    | 内容           |
| ------------------ | --------------------------------------- | -------------- |
| テスト結果サマリー | `outputs/phase-12/test-summary.md`      | Phase 12成果物 |
| 全Phase成果物      | `outputs/phase-1` 〜 `outputs/phase-12` | 全Phase成果物  |
| PRテンプレート     | `.github/PULL_REQUEST_TEMPLATE.md`      | PRテンプレート |

---

## 成果物

| 成果物           | パス                                | 内容           |
| ---------------- | ----------------------------------- | -------------- |
| PR本文           | `outputs/phase-13/pr-body.md`       | PR説明文       |
| 変更ファイル一覧 | `outputs/phase-13/changed-files.md` | 変更内容一覧   |
| PR URL           | `outputs/phase-13/pr-url.txt`       | 作成したPR URL |

---

## 統合テスト連携【必須】

PR作成前の最終チェック:

| チェック項目     | 基準           | 結果      |
| ---------------- | -------------- | --------- |
| 全テストパス     | CI上で成功     | PASS/FAIL |
| Lintパス         | エラー0        | PASS/FAIL |
| 型チェックパス   | エラー0        | PASS/FAIL |
| ドキュメント完備 | 全成果物が存在 | PASS/FAIL |
| コミット整理     | 適切な粒度     | PASS/FAIL |

---

## 完了条件

- [ ] 変更内容が最終確認されている
- [ ] コミット履歴が整理されている
- [ ] PR本文が作成されている
- [ ] PRがGitHubに作成されている
- [ ] CIが全てパスしている
- [ ] レビュー依頼が完了している
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 変更内容の最終確認
2. コミット整理
3. PR本文作成
4. PR作成
5. CI確認・対応
6. レビュー依頼
7. 成果物の配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/postrelease-sdk-testing --phase 13
```

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし（これが最終Phase）

---

## タスク完了

このPhaseが完了すると、AGENT-005-POSTRELEASEタスク全体が完了となります。

### 完了後のアクション

1. PRがマージされたらブランチを削除
2. 成果物を適切な場所にアーカイブ
3. 次のタスクへの知見として活用
