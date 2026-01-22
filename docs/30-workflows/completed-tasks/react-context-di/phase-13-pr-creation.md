# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 13                           |
| Phase名    | PR作成                       |
| 前提Phase  | Phase 12（ドキュメント更新） |
| 後続Phase  | -（完了）                    |
| ステータス | 未実施                       |
| 作成日     | 2026-01-22                   |
| 機能名     | React Context DI実装         |

---

## 目的

`/ai:diff-to-pr` でコミット・PR・CI確認を行い、マージ準備を完了する。

## 背景

Phase 1〜12で実装・テスト・ドキュメント作成が完了した。本Phaseでは、変更をコミットし、Pull Requestを作成してCI/CDを確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ローカル確認チェックリスト

**目的**: PR作成前にローカルで全チェックが通ることを確認する。

**実行手順**:

1. 以下のチェックを実行:

   | #   | 確認項目             | コマンド                                | 結果 |
   | --- | -------------------- | --------------------------------------- | ---- |
   | 1   | ビルドが成功する     | `pnpm --filter @repo/desktop build`     |      |
   | 2   | 全テストがパスする   | `pnpm --filter @repo/desktop test`      |      |
   | 3   | 型チェックがパスする | `pnpm --filter @repo/desktop typecheck` |      |
   | 4   | Lintエラーがない     | `pnpm --filter @repo/desktop lint`      |      |

2. 全チェックが成功することを確認
3. 結果を `outputs/phase-13/pre-commit-check.md` に記録

**期待される成果物**:

- `outputs/phase-13/pre-commit-check.md`

---

### タスク2: 変更差分確認

**目的**: コミット対象の変更差分を確認する。

**実行手順**:

1. 変更ファイル一覧を確認:

   ```bash
   git status
   ```

2. 変更差分を確認:

   ```bash
   git diff
   ```

3. 以下のファイルが含まれていることを確認:
   - `apps/desktop/src/features/chat-history/context/ChatHistoryContext.tsx`
   - `apps/desktop/src/features/chat-history/context/ChatHistoryProvider.tsx`
   - `apps/desktop/src/features/chat-history/context/index.ts`
   - `apps/desktop/src/features/chat-history/context/__mocks__/MockChatHistoryProvider.tsx`
   - `apps/desktop/src/features/chat-history/context/__tests__/ChatHistoryContext.test.tsx`
   - `apps/desktop/src/features/chat-history/hooks/useChatHistory.ts`
   - `apps/desktop/src/features/chat-history/hooks/index.ts`
   - `apps/desktop/src/features/chat-history/hooks/__tests__/useChatHistory.test.ts`
   - `docs/30-workflows/react-context-di/` 配下のドキュメント

4. 差分を `outputs/phase-13/diff-summary.md` に記録

**期待される成果物**:

- `outputs/phase-13/diff-summary.md`

---

### タスク3: PR作成依頼【ユーザー承認必須】

**目的**: `/ai:diff-to-pr` スキルを使用してPR作成を行う。

**実行手順**:

1. **重要**: PR作成前にユーザーに承認を求める:

   ```
   以下の内容でPR作成を行います。よろしいですか？

   - ブランチ: task/UT-006-react-context-di
   - 対象: React Context DI実装
   - 変更ファイル: XX件
   ```

2. ユーザー承認後、`/ai:diff-to-pr` を実行

3. PR作成結果を `outputs/phase-13/pr-creation-result.md` に記録

**期待される成果物**:

- `outputs/phase-13/pr-creation-result.md`
- GitHub Pull Request

---

### タスク4: CI/CD確認

**目的**: CI/CDが成功することを確認する。

**実行手順**:

1. GitHub ActionsのCI結果を確認
2. 以下のチェックが成功していることを確認:

   | チェック項目 | 結果 |
   | ------------ | ---- |
   | Build        |      |
   | Test         |      |
   | Type Check   |      |
   | Lint         |      |

3. CI結果を `outputs/phase-13/ci-result.md` に記録

**期待される成果物**:

- `outputs/phase-13/ci-result.md`

---

### タスク5: マージ準備完了報告

**目的**: PR作成とCI確認が完了したことを報告する。

**実行手順**:

1. 以下の内容でマージ準備完了レポートを作成:

   ```markdown
   # マージ準備完了レポート

   ## PR情報

   | 項目     | 内容                            |
   | -------- | ------------------------------- |
   | PR番号   | #XXX                            |
   | PR URL   | https://github.com/.../pull/XXX |
   | ブランチ | task/UT-006-react-context-di    |
   | 対象     | React Context DI実装            |

   ## CI結果

   | チェック項目 | 結果 |
   | ------------ | ---- |
   | Build        | PASS |
   | Test         | PASS |
   | Type Check   | PASS |
   | Lint         | PASS |

   ## 次のアクション

   ユーザーがGitHub UIでマージを実行してください。
   ```

2. `outputs/phase-13/merge-ready-report.md` に記録

**期待される成果物**:

- `outputs/phase-13/merge-ready-report.md`

---

## 参照資料

### 前Phase成果物

| 参照資料         | パス                                       | 内容         |
| ---------------- | ------------------------------------------ | ------------ |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md` | 実装説明     |
| ドキュメント履歴 | `outputs/phase-12/document-changelog.md`   | ファイル一覧 |

---

## 成果物

| 成果物             | パス                                     | 内容             |
| ------------------ | ---------------------------------------- | ---------------- |
| コミット前チェック | `outputs/phase-13/pre-commit-check.md`   | ローカル確認結果 |
| 差分サマリー       | `outputs/phase-13/diff-summary.md`       | 変更差分記録     |
| PR作成結果         | `outputs/phase-13/pr-creation-result.md` | PR作成記録       |
| CI結果             | `outputs/phase-13/ci-result.md`          | CI/CD結果        |
| マージ準備完了     | `outputs/phase-13/merge-ready-report.md` | 最終レポート     |

---

## 完了条件

- [ ] タスク1: ローカル確認チェックリスト完了（全項目PASS）
- [ ] タスク2: 変更差分確認完了
- [ ] タスク3: PR作成完了（ユーザー承認後）
- [ ] タスク4: CI/CD確認完了（全項目PASS）
- [ ] タスク5: マージ準備完了報告完了
- [ ] 全成果物が `outputs/phase-13/` に出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 重要な注意事項

### PR作成に関する重要な注意

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

| 禁止事項                                     | 理由                                           |
| -------------------------------------------- | ---------------------------------------------- |
| 勝手にPRを作成する                           | レビュー前の変更がリモートに反映されてしまう   |
| ユーザー確認なしで`/ai:diff-to-pr`を実行する | 意図しないブランチやコミットが作成される可能性 |
| ローカル確認をスキップする                   | 動作確認されていないコードがPRに含まれる       |

### マージに関する注意

**マージはユーザーがGitHub UIで手動実行する。**

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること
- **後続**: なし（タスク完了）

---

## タスク完了

Phase 13完了後、以下の状態になります:

- Pull Requestが作成されている
- CI/CDが全て成功している
- マージ準備が完了している

ユーザーがGitHub UIでマージを実行することで、タスクが完全に完了します。
