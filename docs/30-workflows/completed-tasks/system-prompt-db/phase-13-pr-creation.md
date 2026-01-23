# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 13                                     |
| Phase名    | PR作成                                 |
| 前提Phase  | Phase 12                               |
| 後続Phase  | なし（最終Phase）                      |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-22                             |
| 機能名     | システムプロンプトのデータベース永続化 |

---

## 目的

全Phaseの成果を統合し、レビュー可能なPull Requestを作成する。

## 背景

開発作業の最終フェーズとして、コードレビューを経てmainブランチへマージするためのPRを作成する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: コミット整理

**目的**: コミット履歴を整理し、レビューしやすい状態にする

**実行手順**:

1. コミット履歴を確認する
   ```bash
   git log --oneline
   ```
2. 必要に応じてコミットを整理する
   - 関連する変更をまとめる
   - コミットメッセージを明確にする
3. コミットメッセージの規約を確認する
   - feat: 新機能
   - fix: バグ修正
   - refactor: リファクタリング
   - test: テスト追加
   - docs: ドキュメント
4. 成果物を `outputs/phase-13/commit-summary.md` に出力する

**期待される成果物**:

- `outputs/phase-13/commit-summary.md`

---

### タスク2: 変更差分確認

**目的**: PRに含まれる変更を確認する

**実行手順**:

1. 変更ファイル一覧を確認する
   ```bash
   git diff main --stat
   ```
2. 主要な変更を確認する
   - 新規ファイル
   - 変更ファイル
   - 削除ファイル
3. 変更量を確認する
   - 行数
   - ファイル数
4. 成果物を `outputs/phase-13/change-summary.md` に出力する

**期待される成果物**:

- `outputs/phase-13/change-summary.md`

---

### タスク3: PR本文作成

**目的**: PRの説明文を作成する

**実行手順**:

1. PRタイトルを作成する
   - `feat: システムプロンプトテンプレートのデータベース永続化`
2. PR本文を作成する
   - 概要
   - 変更内容
   - 関連Issue（あれば）
   - テスト方法
   - レビューポイント
   - スクリーンショット（必要に応じて）
3. チェックリストを作成する
   - [ ] テストがパスすること
   - [ ] 型チェックがパスすること
   - [ ] Lintがパスすること
   - [ ] ドキュメントが更新されていること
4. 成果物を `outputs/phase-13/pr-description.md` に出力する

**期待される成果物**:

- `outputs/phase-13/pr-description.md`

---

### タスク4: 最終確認

**目的**: PR作成前の最終確認を行う

**実行手順**:

1. 全テストを実行する
   ```bash
   pnpm --filter @repo/shared test
   pnpm --filter @repo/desktop test
   ```
2. 型チェックを実行する
   ```bash
   pnpm --filter @repo/shared typecheck
   pnpm --filter @repo/desktop typecheck
   ```
3. Lintを実行する
   ```bash
   pnpm --filter @repo/shared lint
   pnpm --filter @repo/desktop lint
   ```
4. ビルドを実行する
   ```bash
   pnpm --filter @repo/shared build
   pnpm --filter @repo/desktop build
   ```
5. 成果物を `outputs/phase-13/final-verification.md` に出力する

**期待される成果物**:

- `outputs/phase-13/final-verification.md`

---

### タスク5: PR作成

**目的**: GitHub PRを作成する

**実行手順**:

1. リモートにプッシュする
   ```bash
   git push -u origin <branch-name>
   ```
2. GitHub CLIでPRを作成する
   ```bash
   gh pr create --title "feat: システムプロンプトテンプレートのデータベース永続化" --body-file outputs/phase-13/pr-description.md
   ```
3. PRのURLを記録する
4. 成果物を `outputs/phase-13/pr-creation-result.md` に出力する

**期待される成果物**:

- `outputs/phase-13/pr-creation-result.md`

---

## 参照資料

### 前Phaseの成果物

| 参照資料           | パス                                          | 内容       |
| ------------------ | --------------------------------------------- | ---------- |
| APIドキュメント    | `outputs/phase-12/api-documentation.md`       | API仕様    |
| 開発者ドキュメント | `outputs/phase-12/developer-documentation.md` | 開発ガイド |

---

## 成果物

| 成果物       | パス                                     | 内容         |
| ------------ | ---------------------------------------- | ------------ |
| コミット概要 | `outputs/phase-13/commit-summary.md`     | コミット整理 |
| 変更概要     | `outputs/phase-13/change-summary.md`     | 変更差分     |
| PR本文       | `outputs/phase-13/pr-description.md`     | PR説明       |
| 最終確認     | `outputs/phase-13/final-verification.md` | 最終検証     |
| PR作成結果   | `outputs/phase-13/pr-creation-result.md` | PR URL       |

---

## 完了条件

- [ ] コミットが整理されている
- [ ] 変更差分が確認されている
- [ ] PR本文が作成されている
- [ ] 最終確認（テスト・型・Lint・ビルド）がパスしている
- [ ] PRが作成されている
- [ ] すべての成果物が出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## PR作成チェックリスト

### コード品質

| 項目           | 確認状況 |
| -------------- | -------- |
| テストパス     | 未       |
| 型チェックパス | 未       |
| Lintパス       | 未       |
| ビルドパス     | 未       |

### ドキュメント

| 項目             | 確認状況 |
| ---------------- | -------- |
| PRタイトル       | 未       |
| PR本文           | 未       |
| レビューポイント | 未       |
| テスト方法       | 未       |

---

## PR本文テンプレート

```markdown
## 概要

システムプロンプトテンプレートをelectron-storeからTursoデータベースに移行する機能を実装しました。

## 変更内容

### 新機能

- Tursoデータベースへのシステムプロンプトテンプレート永続化
- Embedded Replicasによるオフライン動作サポート
- ユーザー認証連動による認可制御
- プリセットテンプレートの保護機能

### 技術的変更

- `system_prompt_templates` テーブルの追加
- `SystemPromptRepository` の実装
- IPC ハンドラーの追加
- Slice の更新
- electron-store からの自動マイグレーション

## 関連Issue

- Closes #XXX

## テスト方法

1. アプリケーションを起動
2. 設定 > システムプロンプト管理を開く
3. テンプレートのCRUD操作を確認
4. オフライン時の動作を確認

## レビューポイント

- [ ] Repository の認可チェック
- [ ] プリセット保護ロジック
- [ ] マイグレーション処理のエラーハンドリング
- [ ] IPC 通信のセキュリティ

## スクリーンショット

（必要に応じて追加）

## チェックリスト

- [ ] テストがパスする
- [ ] 型チェックがパスする
- [ ] Lintがパスする
- [ ] ドキュメントが更新されている
```

---

## 依存関係

- **前提**: Phase 12（ドキュメント整備）が完了していること
- **後続**: なし（最終Phase）

---

## タスク完了

このPhaseが完了すると、システムプロンプトのデータベース永続化タスクは完了です。

PR作成後は、コードレビューを経てmainブランチへのマージを行ってください。
