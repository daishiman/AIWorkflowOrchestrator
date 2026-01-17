# Phase 13: PR作成

## メタ情報

| 項目   | 値             |
| ------ | -------------- |
| Phase  | 13             |
| 機能名 | corrective-rag |
| 作成日 | 2026-01-16     |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後に`/ai:diff-to-pr`を実行
- CI確認: CIが通過したことを確認

## 重要：PR作成に関する注意

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

| 禁止事項                                     | 理由                                           |
| -------------------------------------------- | ---------------------------------------------- |
| 勝手にPRを作成する                           | レビュー前の変更がリモートに反映されてしまう   |
| ユーザー確認なしで`/ai:diff-to-pr`を実行する | 意図しないブランチやコミットが作成される可能性 |
| ローカル確認をスキップする                   | 動作確認されていないコードがPRに含まれる       |

## PR作成チェックリスト

### 1. 事前確認

| 確認項目                       | 結果 |
| ------------------------------ | ---- |
| 全Phaseの成果物が存在する      | -    |
| テストが全て成功している       | -    |
| Lint・型チェックがパスしている | -    |
| ドキュメントが整備されている   | -    |

### 2. コミット整理

| 確認項目                 | 結果 |
| ------------------------ | ---- |
| コミットメッセージが適切 | -    |
| 不要なコミットがない     | -    |
| 機密情報が含まれていない | -    |

### 3. PR内容

| 項目           | 内容                             |
| -------------- | -------------------------------- |
| タイトル       | feat(search): Corrective RAG実装 |
| ベースブランチ | main                             |
| ラベル         | enhancement, search              |

## 参照資料

| 資料名        | パス                | 説明           |
| ------------- | ------------------- | -------------- |
| ドキュメント  | `outputs/phase-12/` | Phase 12成果物 |
| 全Phase成果物 | `outputs/phase-*/`  | 全成果物       |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料 | パス                                                                 | 内容         |
| -------- | -------------------------------------------------------------------- | ------------ |
| PR規約   | `.claude/skills/aiworkflow-requirements/references/pr-guidelines.md` | PR作成ガイド |

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

```bash
# ローカル確認チェックリスト
pnpm build        # ビルドが成功する
pnpm test         # 全テストがパスする
pnpm typecheck    # 型チェックがパスする
pnpm lint         # Lintエラーがない
```

### 2. 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

### 4. 実行結果の確認

- PRが作成されていること
- CIが通過していること

### 5. フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

## PR本文テンプレート

```markdown
## Summary

Corrective RAG（CRAG）機能を実装しました。検索結果の関連性をLLMで評価し、
必要に応じてWeb検索で補強する自己修正RAGパイプラインです。

### 主な変更点

- RelevanceEvaluator: LLMベースの関連性評価クラス
- CorrectiveRAG: 3段階アクション処理（correct/incorrect/ambiguous）
- IWebSearcher: Web検索連携インターフェース

### 関連Issue

- Closes #XXX

## Test Plan

- [x] ユニットテスト: RelevanceEvaluator（RE-001〜RE-012）
- [x] ユニットテスト: CorrectiveRAG（CR-001〜CR-011）
- [x] 統合テスト: LLM連携・Web検索連携
- [x] カバレッジ: Line 80%+, Branch 60%+, Function 80%+
- [x] 手動テスト: 実環境動作確認

## Screenshots

（該当なし - バックエンド機能）

## Checklist

- [x] 自己レビュー完了
- [x] テスト追加・更新
- [x] ドキュメント更新
- [x] 破壊的変更なし

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

## 統合テスト連携【必須】

PR作成前の最終統合テスト確認:

| 確認項目                       | 結果 |
| ------------------------------ | ---- |
| CI上で統合テストが成功している | -    |
| 本番環境相当での動作確認済み   | -    |

## 成果物

| 成果物     | パス                                 | 説明         |
| ---------- | ------------------------------------ | ------------ |
| PR情報     | `outputs/phase-13/pr-info.md`        | PR URL等     |
| 変更サマリ | `outputs/phase-13/change-summary.md` | 変更内容要約 |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全Phaseの成果物が存在している
- [ ] PRが作成されている
- [ ] CI/CDが成功している
- [ ] レビュアーがアサインされている
- [ ] 統合テストがCI上で成功している
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 全成果物の存在確認
3. ユーザーにローカル動作確認を依頼
4. 変更サマリー提示・許可確認
5. PR作成（ユーザー許可後）
6. CI確認
7. レビュアーアサイン
8. タスクディレクトリの移動
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/corrective-rag --phase 13
```

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/corrective-rag/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep corrective-rag

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): corrective-ragをcompleted-tasksに移動"
git push
```

## タスク完了

このPhaseの完了をもって、CONV-07-06 Corrective RAGタスクは完了となります。

### 完了報告

- タスクID: CONV-07-06
- 機能名: Corrective RAG
- 実装場所: `packages/shared/src/services/search/crag/`
- PR URL: （作成後に記載）

## 次のPhase

なし（ワークフロー完了）
