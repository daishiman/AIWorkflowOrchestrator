# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 13                    |
| Phase名    | PR作成                |
| 前提Phase  | Phase 12              |
| 後続Phase  | なし（タスク完了）    |
| ステータス | 未実施                |
| 作成日     | 2026-01-12            |
| 機能名     | graph-search-strategy |

---

## 目的

レビュー可能なPull Requestを作成する。全成果物をコミットし、適切なPR説明を作成する。

## 背景

Phase 1-12で作成した全成果物をmainブランチにマージするためのPRを作成する。レビュアーが理解しやすい説明と、テスト結果・カバレッジ情報を含める。

---

## ⚠️ PR作成に関する重要な注意【必須確認】

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

| 禁止事項                                     | 理由                                           |
| -------------------------------------------- | ---------------------------------------------- |
| 勝手にPRを作成する                           | レビュー前の変更がリモートに反映されてしまう   |
| ユーザー確認なしで`/ai:diff-to-pr`を実行する | 意図しないブランチやコミットが作成される可能性 |
| ローカル確認をスキップする                   | 動作確認されていないコードがPRに含まれる       |

---

## タスク完了フロー

```
Phase 1〜12 完了
    ↓
【必須】ローカルでの動作確認
    ↓
【必須】ユーザーにPR作成の許可を確認
    ↓
ユーザー許可後: PR作成（/ai:diff-to-pr 使用）
    ↓
CI通過確認
    ↓
タスクディレクトリを completed-tasks/ に移動
    ↓
（該当する場合）未タスク指示書を削除
    ↓
変更をコミット・プッシュ
    ↓
ワークフロー完了
```

---

## ローカル確認チェックリスト【PR作成前に必須】

PR作成前に以下を**必ず**確認すること:

| #   | 確認項目                       | コマンド例            | 確認 |
| --- | ------------------------------ | --------------------- | ---- |
| 1   | ビルドが成功する               | `pnpm build`          | [ ]  |
| 2   | 全テストがパスする             | `pnpm test`           | [ ]  |
| 3   | 型チェックがパスする           | `pnpm typecheck`      | [ ]  |
| 4   | Lintエラーがない               | `pnpm lint`           | [ ]  |
| 5   | 実際の動作確認（該当する場合） | `pnpm dev` で手動確認 | [ ]  |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ローカル確認

**目的**: PR作成前の動作確認

**実行手順**:

1. ビルドが成功することを確認
2. 全テストがパスすることを確認
3. 型チェックがパスすることを確認
4. Lintエラーがないことを確認
5. 必要に応じて手動動作確認

**期待される成果物**:

- ローカル確認チェックリスト完了

```bash
# ローカル確認コマンド
pnpm build
pnpm test
pnpm typecheck
pnpm lint
```

---

### タスク2: ユーザー許可確認【必須】

**目的**: PR作成の許可を得る

**実行手順**:

1. ローカル確認結果をユーザーに報告
2. PR作成の許可をユーザーに確認
3. **ユーザーからの明示的な許可を待つ**

**重要**: ユーザーの許可なしにPR作成に進んではいけない

---

### タスク3: コミット・PR作成

**目的**: 全変更をコミットしてPRを作成

**実行手順**:

1. 変更ファイルの確認
2. 不要ファイルの除外確認
3. コミットメッセージの作成
4. コミット実行
5. **`/ai:diff-to-pr` スキルを使用してPR作成**

**期待される成果物**:

- コミット完了
- Pull Request

**コミットメッセージ形式**:

```
feat(search): implement GraphSearchStrategy for Knowledge Graph search

- Add GraphSearchStrategy implementing ISearchStrategy
- Support local, global, and relationship query types
- Integrate with IKnowledgeGraphStore, IEmbeddingProvider, ICommunitySummarizer
- Add comprehensive unit and integration tests
- Achieve 80%+ code coverage

Refs: CONV-07-04
```

**PRタイトル形式**:

```
feat(search): GraphSearchStrategy - Knowledge Graph検索戦略の実装
```

---

### タスク4: CI確認・タスク完了処理

**目的**: CI通過確認とタスクディレクトリ移動

**実行手順**:

1. CIが成功していることを確認
2. コンフリクトがないことを確認
3. タスクディレクトリを `completed-tasks/` に移動
4. artifacts.json の status を `"completed"` に更新
5. 移動をコミット・プッシュ

**期待される成果物**:

- CI成功
- タスクディレクトリ移動完了

---

## `/ai:diff-to-pr` スキルの使用

**ユーザーの許可を得た後にのみ**、`/ai:diff-to-pr` スキルを使用してPR作成を行う:

```bash
# ユーザー許可後にのみ実行
/ai:diff-to-pr
```

このスキルが実行する内容:

1. 変更差分の確認
2. コミットメッセージ生成
3. PR作成
4. CI結果確認

---

## タスク完了移動手順

```bash
# 1. タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/graph-search-strategy/ docs/30-workflows/completed-tasks/

# 2. 移動を確認
ls docs/30-workflows/completed-tasks/ | grep graph-search-strategy

# 3. 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): graph-search-strategyをcompleted-tasksに移動"
git push
```

---

## 参照資料

| 参照資料         | パス                                      | 内容           |
| ---------------- | ----------------------------------------- | -------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | Phase 10成果物 |
| ドキュメント     | `docs/api/graph-search-strategy.md`       | Phase 12成果物 |

---

## 成果物

| 成果物       | パス          | 説明       |
| ------------ | ------------- | ---------- |
| Pull Request | GitHub PR URL | 作成したPR |

---

## 統合テスト連携【必須】

PR作成前に最終テストを実行:

```bash
# 全テスト実行
pnpm test
pnpm test:integration

# ビルド確認
pnpm build

# Lint・型チェック
pnpm lint
pnpm typecheck
```

---

## 完了条件チェックリスト

| #   | 項目                                                     | 必須 | 確認 |
| --- | -------------------------------------------------------- | ---- | ---- |
| 1   | **ローカルでビルド・テスト・型チェック・Lintが全てパス** | ✅   | [ ]  |
| 2   | **ユーザーにPR作成の許可を確認済み**                     | ✅   | [ ]  |
| 3   | PRが作成されている                                       | ✅   | [ ]  |
| 4   | CIが全て通過している                                     | ✅   | [ ]  |
| 5   | コンフリクトがない                                       | ✅   | [ ]  |
| 6   | タスクディレクトリが `completed-tasks/` に移動済み       | ✅   | [ ]  |
| 7   | `artifacts.json` の `status` が `"completed"`            | ✅   | [ ]  |
| 8   | （該当時）未タスク指示書が削除済み                       | 条件 | [ ]  |
| 9   | **本Phase内の全タスクを100%完了**                        | ✅   | [ ]  |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] **タスク全体の完了を確認**

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし（タスク完了）

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. ローカル確認（ビルド・テスト・型チェック・Lint）
2. ユーザーへのPR作成許可確認
3. コミット準備・実行
4. `/ai:diff-to-pr` によるPR作成
5. CI通過確認
6. タスクディレクトリの `completed-tasks/` 移動
7. artifacts.json の status 更新
8. 完了条件チェックリストの検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している
- [ ] タスクディレクトリが `completed-tasks/` に移動されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/graph-search-strategy --phase 13
```

---

## Phase実行記録

| 項目            | 内容                        |
| --------------- | --------------------------- |
| 実行開始日時    | {{EXECUTION_START}}         |
| 実行完了日時    | {{EXECUTION_END}}           |
| 実行者          | {{EXECUTOR}}                |
| 成果物確認      | [ ] 全て生成済み            |
| artifacts.json  | [ ] 更新済み                |
| タスク完了移動  | [ ] completed-tasks移動済み |
| 次Phase移行可否 | N/A（タスク完了）           |

---

## PR本文テンプレート

```markdown
## 概要

GraphSearchStrategyを実装しました。HybridRAGの第3の検索戦略として、Knowledge Graphを活用した検索を提供します。

## 変更内容

### 新規追加

- `GraphSearchStrategy` クラス
  - ローカル検索（エンティティベース）
  - グローバル検索（コミュニティサマリベース）
  - 関係検索（パスベース）
- ユニットテスト・統合テスト
- APIドキュメント・使用ガイド

### 依存関係

- `IKnowledgeGraphStore` インターフェース
- `IEmbeddingProvider` インターフェース
- `ICommunitySummarizer` インターフェース（オプション）

## テスト結果

| 指標              | 結果    |
| ----------------- | ------- |
| ユニットテスト    | ✅ PASS |
| 統合テスト        | ✅ PASS |
| Line Coverage     | XX.X%   |
| Branch Coverage   | XX.X%   |
| Function Coverage | XX.X%   |

## 関連Issue

- Refs: CONV-07-04

## レビューポイント

1. **インターフェース設計**: ISearchStrategy準拠の確認
2. **エラーハンドリング**: Result<T, Error>パターンの適切な使用
3. **パフォーマンス**: 各検索タイプのレスポンスタイム
4. **テストカバレッジ**: 境界値・異常系のテスト

## チェックリスト

- [x] コードがプロジェクトのスタイルガイドに従っている
- [x] テストが追加・更新されている
- [x] ドキュメントが更新されている
- [x] 破壊的変更がない
```

---

## PRチェックリスト

### コード品質

| 項目                   | 確認 |
| ---------------------- | ---- |
| ESLintエラーなし       | [ ]  |
| TypeScript型エラーなし | [ ]  |
| ユニットテスト成功     | [ ]  |
| 統合テスト成功         | [ ]  |
| ビルド成功             | [ ]  |

### PR設定

| 項目                       | 確認 |
| -------------------------- | ---- |
| タイトルが適切             | [ ]  |
| 説明が十分                 | [ ]  |
| ラベルが設定されている     | [ ]  |
| レビュアーが設定されている | [ ]  |
| CIが成功している           | [ ]  |
| コンフリクトがない         | [ ]  |

### ドキュメント

| 項目                | 確認 |
| ------------------- | ---- |
| APIリファレンス更新 | [ ]  |
| 使用ガイド更新      | [ ]  |
| CHANGELOG更新       | [ ]  |

---

## コミット実行例

```bash
# 変更確認
git status
git diff

# ステージング
git add packages/shared/src/services/search/strategies/graph-search-strategy.ts
git add packages/shared/src/services/search/strategies/__tests__/
git add docs/api/graph-search-strategy.md
git add docs/guides/graph-search-usage.md
git add CHANGELOG.md

# コミット
git commit -m "feat(search): implement GraphSearchStrategy for Knowledge Graph search

- Add GraphSearchStrategy implementing ISearchStrategy
- Support local, global, and relationship query types
- Integrate with IKnowledgeGraphStore, IEmbeddingProvider, ICommunitySummarizer
- Add comprehensive unit and integration tests
- Achieve 80%+ code coverage

Refs: CONV-07-04"

# プッシュ
git push origin task/graph-search-strategy

# PR作成（GitHub CLI使用）
gh pr create --title "feat(search): GraphSearchStrategy - Knowledge Graph検索戦略の実装" --body-file pr-body.md
```

---

## タスク完了

このPhase 13を完了すると、graph-search-strategyタスクは完了です。

### 成果物一覧（全Phase）

| Phase | 主要成果物                  |
| ----- | --------------------------- |
| 1     | 要件定義書                  |
| 2     | アーキテクチャ設計書        |
| 3     | 設計レビュー結果            |
| 4     | テスト仕様書・テストコード  |
| 5     | GraphSearchStrategy実装     |
| 6     | 拡充テスト                  |
| 7     | カバレッジレポート          |
| 8     | リファクタリング済みコード  |
| 9     | 品質保証レポート            |
| 10    | 最終レビュー結果            |
| 11    | 手動テスト結果              |
| 12    | APIドキュメント・使用ガイド |
| 13    | Pull Request                |

---

## 次のアクション

PR作成後:

1. CIの成功を確認
2. レビュアーの割り当て
3. レビューコメントへの対応
4. 承認後マージ

タスク完了おめでとうございます！🎉
