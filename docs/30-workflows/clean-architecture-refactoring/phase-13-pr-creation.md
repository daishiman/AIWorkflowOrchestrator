# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 13                             |
| Phase名    | PR作成                         |
| 前提Phase  | Phase 12（ドキュメント更新）   |
| 後続Phase  | なし（完了）                   |
| ステータス | 未実施                         |
| 作成日     | 2026-01-18                     |
| 機能名     | clean-architecture-refactoring |
| タスクID   | ARCH-001                       |

---

## 目的

全ての成果物をまとめてPull Requestを作成し、マージ準備を完了する。

## 背景

全てのPhaseが完了し、品質基準を満たしていることが確認されたため、mainブランチへのマージのためのPRを作成する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ユーザーにローカル動作確認を依頼【必須】

**目的**: PR作成前にユーザーにローカルでの動作確認を依頼する

**実行手順**:

1. ユーザーに以下の確認を依頼する:
   - [ ] アプリケーションがローカルで起動すること
   - [ ] 主要機能が動作すること
   - [ ] 明らかな問題がないこと

2. 確認依頼メッセージ例:

   ```
   PR作成前に、ローカル環境での動作確認をお願いします。

   確認項目:
   - `pnpm dev` でアプリケーションが起動すること
   - チャット履歴の基本操作（作成、表示、検索）が動作すること
   - エラーや警告が表示されないこと

   問題がなければ、PRを作成してよいかご確認ください。
   ```

3. ユーザーからの確認を待つ

**期待される成果物**:

- ユーザーからの確認完了

---

### タスク2: 変更サマリー提示と許可確認【必須】

**目的**: 変更内容のサマリーを提示しPR作成の許可を確認する

**実行手順**:

1. 変更内容のサマリーを作成する:
   - 追加されたファイル数
   - 変更されたファイル数
   - 削除されたファイル数
   - 主な変更点

2. ユーザーにサマリーを提示し、PR作成の許可を確認する:

   ```
   ## 変更サマリー

   - 追加: XX ファイル
   - 変更: XX ファイル
   - 削除: XX ファイル

   ### 主な変更点
   - Domain層純粋化（Drizzle依存除去）
   - Use Caseパターン導入
   - React Context DIパターン実装
   - 包括的テストスイート追加

   PRを作成してもよろしいですか？
   ```

3. **重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと

**期待される成果物**:

- ユーザーからの明示的な許可

---

### タスク3: 変更内容の最終確認

**目的**: PRに含める変更内容を確認する

**実行手順**:

1. git statusで変更ファイルを確認する:

   ```bash
   git status
   ```

2. 変更ファイルをカテゴリ別に整理する:

   **新規ファイル（追加）**:
   - [ ] `packages/shared/src/core/Result.ts`
   - [ ] `packages/shared/src/core/errors/`
   - [ ] `packages/shared/src/features/chat-history/domain/`
   - [ ] `packages/shared/src/features/chat-history/application/`
   - [ ] `packages/shared/src/infrastructure/persistence/`
   - [ ] `apps/desktop/src/contexts/ChatHistory*.tsx`
   - [ ] `apps/desktop/src/hooks/useChatHistory.ts`
   - [ ] テストファイル群
   - [ ] ドキュメントファイル群

   **変更ファイル（修正）**:
   - [ ] 既存コンポーネント（Context使用への変更）
   - [ ] 既存仕様書

   **削除ファイル**:
   - [ ] `packages/shared/src/features/chat-history/types/`（旧型定義）
   - [ ] 旧ChatHistoryService（Phase 8で削除済み）
   - [ ] 旧リポジトリ実装

3. 不要なファイルがないか確認する:
   - [ ] デバッグ用コードが含まれていない
   - [ ] 一時ファイルが含まれていない
   - [ ] 機密情報が含まれていない

**期待される成果物**:

- 変更ファイル一覧

---

### タスク4: コミット整理

**目的**: コミット履歴を整理する

**実行手順**:

1. コミット履歴を確認する:

   ```bash
   git log --oneline -20
   ```

2. コミットメッセージの形式を確認する:
   - Conventional Commits形式に従っているか
   - 変更内容が明確に説明されているか

3. 必要に応じてコミットを整理する:
   - Squashによるコミット統合（必要な場合）
   - Rebaseによる履歴整理（必要な場合）

4. 推奨されるコミット構成:

   ```
   feat(chat-history): Clean Architectureへのリファクタリング

   - Domain層の純粋化（エンティティ、値オブジェクト）
   - Use Caseパターンの導入
   - リポジトリパターンの実装（DI対応）
   - マッパーによるドメイン/DB分離
   - React Context/Hooks DIパターン
   - 旧実装の削除
   - 包括的なテストスイート
   - ドキュメント更新

   BREAKING CHANGE: ChatHistoryServiceは削除されました。
   useChatHistory hookを使用してください。

   Refs: ARCH-001
   ```

**期待される成果物**:

- 整理されたコミット履歴

---

### タスク5: PRテンプレート準備

**目的**: PRの説明文を準備する

**実行手順**:

1. PR説明文を作成する:

   ```markdown
   ## 概要

   チャット履歴機能をClean Architectureに準拠するようリファクタリングしました。
   アーキテクチャ準拠率が45%から100%に向上しています。

   ## 変更内容

   ### アーキテクチャ変更

   - **Domain層**: 純粋なエンティティ・値オブジェクト（Drizzle依存なし）
   - **Application層**: 単一責務のUse Case群
   - **Infrastructure層**: Drizzleリポジトリ実装、マッパー
   - **UI層**: React Context/Hooks DIパターン

   ### 主な改善点

   - [ ] Domain層からInfrastructure層依存を除去
   - [ ] God Object（ChatHistoryService）を10個のUse Caseに分割
   - [ ] 型定義を3層に明確化（Domain/DTO/Persistence）
   - [ ] Result型による統一的エラーハンドリング
   - [ ] 包括的なテストスイート（カバレッジ80%以上）

   ## テスト結果

   | 項目                 | 結果 |
   | -------------------- | ---- |
   | ユニットテスト       | PASS |
   | 統合テスト           | PASS |
   | アーキテクチャテスト | PASS |
   | 手動テスト           | PASS |
   | カバレッジ           | XX%  |

   ## 破壊的変更

   - `ChatHistoryService` は削除されました
   - `useChatHistory` hookを使用してください
   - フィーチャーフラグ `USE_NEW_CHAT_HISTORY_ARCH` は削除されました

   ## レビュー観点

   1. Clean Architecture原則への準拠
   2. エラーハンドリングの一貫性
   3. テストの網羅性
   4. ドキュメントの正確性

   ## 関連Issue/タスク

   - タスクID: ARCH-001
   - タスク仕様書: `docs/30-workflows/clean-architecture-refactoring/`

   ## チェックリスト

   - [ ] テストが全てPASSする
   - [ ] Lintエラーがない
   - [ ] 型エラーがない
   - [ ] ドキュメントが更新されている
   - [ ] BREAKING CHANGEが明記されている
   ```

**期待される成果物**:

- `outputs/phase-13/pr-description.md` - PR説明文

---

### タスク6: CI/CD確認

**目的**: CI/CDパイプラインが正常に動作することを確認する

**実行手順**:

1. ローカルで全チェックを実行する:

   ```bash
   # 型チェック
   pnpm --filter @repo/shared typecheck
   pnpm --filter @repo/desktop typecheck

   # Lint
   pnpm --filter @repo/shared lint
   pnpm --filter @repo/desktop lint

   # テスト
   pnpm --filter @repo/shared test:run
   pnpm --filter @repo/desktop test:run

   # ビルド
   pnpm --filter @repo/shared build
   pnpm --filter @repo/desktop build
   ```

2. 結果を確認する:
   - [ ] 型チェック成功
   - [ ] Lint成功
   - [ ] テスト成功
   - [ ] ビルド成功

3. CI設定ファイルを確認する:
   - [ ] `.github/workflows/` の設定が適切
   - [ ] 新規ファイルがCI対象に含まれている

**期待される成果物**:

- CI/CDチェック結果

---

### タスク7: PR作成

**目的**: Pull Requestを作成する

**実行手順**:

1. 最新のmainブランチを取得する:

   ```bash
   git fetch origin main
   ```

2. リベース（必要な場合）:

   ```bash
   git rebase origin/main
   ```

3. コンフリクトがあれば解決する

4. プッシュする:

   ```bash
   git push origin feature/ARCH-001-clean-architecture-refactoring
   ```

5. PRを作成する:

   ```bash
   gh pr create \
     --title "feat(chat-history): Clean Architectureへのリファクタリング" \
     --body-file outputs/phase-13/pr-description.md \
     --base main \
     --label "architecture,refactoring,breaking-change"
   ```

6. PRのURLを記録する

**期待される成果物**:

- 作成されたPR

---

### タスク8: レビュー依頼

**目的**: PRのレビューを依頼する

**実行手順**:

1. レビュアーを指定する:

   ```bash
   gh pr edit --add-reviewer <reviewer1>,<reviewer2>
   ```

2. レビュー観点を共有する:
   - Clean Architecture原則への準拠
   - エラーハンドリングの一貫性
   - テストの網羅性
   - パフォーマンスへの影響
   - ドキュメントの正確性

3. 必要に応じてレビューミーティングを設定する

**期待される成果物**:

- レビュー依頼完了

---

### タスク9: 完了報告

**目的**: タスク完了を報告する

**実行手順**:

1. 完了レポートを作成する:

   ```markdown
   # ARCH-001 完了報告

   ## 完了日時

   YYYY-MM-DD HH:MM

   ## 成果サマリー

   - アーキテクチャ準拠率: 45% → 100%
   - 解消した違反: 8件（Critical 3件 + High 5件）
   - テストカバレッジ: XX%
   - 新規テスト数: XX件

   ## 作成されたPR

   - URL: https://github.com/xxx/xxx/pull/XXX

   ## 成果物一覧

   - Phase 1-13の成果物（outputs/）
   - 新規コード（packages/, apps/）
   - 更新ドキュメント（docs/, .claude/skills/）

   ## 今後のアクション

   - [ ] PRレビュー対応
   - [ ] マージ後の動作確認
   - [ ] フィーチャーフラグ削除確認

   ## 学んだこと・改善点

   - ...
   ```

2. `artifacts.json` を最終更新する:
   - 全Phaseのステータスを "completed" に更新
   - 完了日時を記録

**期待される成果物**:

- `outputs/phase-13/completion-report.md` - 完了報告
- `artifacts.json` の最終更新

---

### タスク10: タスク完了処理【必須】

**目的**: PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する

**実行手順**:

1. PRが作成されていることを確認する

2. CIが通過していることを確認する

3. タスクディレクトリを `completed-tasks` に移動する:

   ```bash
   # タスクディレクトリをcompleted-tasksに移動
   mv docs/30-workflows/clean-architecture-refactoring/ docs/30-workflows/completed-tasks/

   # 移動を確認
   ls docs/30-workflows/completed-tasks/ | grep clean-architecture-refactoring

   # 変更をコミット
   git add docs/30-workflows/
   git commit -m "docs(workflows): clean-architecture-refactoringをcompleted-tasksに移動"
   git push
   ```

4. 移動完了を確認する:
   - [ ] `docs/30-workflows/completed-tasks/clean-architecture-refactoring/` が存在すること
   - [ ] `docs/30-workflows/clean-architecture-refactoring/` が存在しないこと

**期待される成果物**:

- タスクディレクトリの移動完了

---

## 参照資料

| 参照資料         | パス               | 内容             |
| ---------------- | ------------------ | ---------------- |
| 全Phase成果物    | `outputs/phase-*/` | 各Phase成果物    |
| ドキュメント更新 | `docs/`            | 更新ドキュメント |

### システム仕様（aiworkflow-requirements）

> PR作成時は以下のシステム仕様を参照してください。

| 参照資料                     | パス                                                                           | 内容     |
| ---------------------------- | ------------------------------------------------------------------------------ | -------- |
| チャット履歴インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | 機能仕様 |
| 品質要件                     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | 品質基準 |

---

## 成果物

| 成果物             | パス                                    | 内容           |
| ------------------ | --------------------------------------- | -------------- |
| PR説明文           | `outputs/phase-13/pr-description.md`    | PRテンプレート |
| 完了報告           | `outputs/phase-13/completion-report.md` | 完了レポート   |
| 作成されたPR       | GitHub PR URL                           | マージ対象PR   |
| artifacts.json最終 | `artifacts.json`                        | 成果物管理更新 |

---

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼し、確認完了している【必須】
- [ ] 変更サマリーを提示し、ユーザーから明示的なPR作成許可を得ている【必須】
- [ ] 変更内容が確認されている
- [ ] コミット履歴が整理されている
- [ ] PR説明文が準備されている
- [ ] CI/CDチェックが全てPASSしている
- [ ] PRが作成されている
- [ ] レビュー依頼が完了している
- [ ] 完了報告が作成されている
- [ ] artifacts.jsonが最終更新されている
- [ ] タスクディレクトリがcompleted-tasksに移動されている【必須】

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` のPhase 13ステータスを更新
- [ ] 全タスク完了を確認

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること
- **後続**: なし（本タスク完了）

---

## タスク完了

本Phaseの完了をもって、タスクID: ARCH-001「チャット履歴機能のClean Architecture準拠リファクタリング」は完了となります。

PRがマージされた後、以下を実施してください:

1. 本番環境での動作確認
2. フィーチャーフラグの完全削除確認
3. 関連チームへの周知

---

## 最終チェックリスト

### アーキテクチャ準拠

- [ ] Domain層がInfrastructure層に依存していない
- [ ] Domain層がApplication層に依存していない
- [ ] Application層がInfrastructure層に依存していない
- [ ] 準拠率100%達成

### コード品質

- [ ] 型エラー0件
- [ ] Lintエラー0件
- [ ] フォーマット適用済み

### テスト

- [ ] 全テストPASS
- [ ] カバレッジ基準達成
- [ ] 手動テスト完了

### ドキュメント

- [ ] アーキテクチャドキュメント更新
- [ ] API/IFドキュメント更新
- [ ] 開発ガイド更新
- [ ] ADR作成

### PR

- [ ] PR作成完了
- [ ] レビュー依頼完了
