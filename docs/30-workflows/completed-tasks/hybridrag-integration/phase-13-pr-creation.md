# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 13                    |
| Phase名    | PR作成                |
| 前提Phase  | Phase 12              |
| 後続Phase  | なし（完了）          |
| ステータス | 未実施                |
| 作成日     | 2026-01-17            |
| 機能名     | hybridrag-integration |

---

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 背景

Phase 12までの実装・ドキュメント作成が完了したため、変更をコミットしてPRを作成する。PRの作成はユーザーの明示的な許可を得てから行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ローカル動作確認依頼【必須】

**目的**: ユーザーにローカル環境での動作確認を依頼する

**実行手順**:

1. ユーザーに以下の確認を依頼:

   ```
   PR作成前に、以下のコマンドでローカル動作を確認してください:

   1. ビルド確認:
      pnpm build

   2. テスト確認:
      pnpm --filter @repo/shared test

   3. 型チェック確認:
      pnpm --filter @repo/shared typecheck

   4. Lint確認:
      pnpm --filter @repo/shared lint

   確認が完了したら、PRを作成してよいかお知らせください。
   ```

2. ユーザーからの確認を待つ

**期待される成果物**:

- ユーザーからの確認結果

---

### タスク2: 変更サマリー提示と許可確認【必須】

**目的**: 変更内容のサマリーを提示しPR作成の許可を確認する

**実行手順**:

1. 変更サマリーを作成:

   ```markdown
   ## 変更サマリー

   ### 追加されたファイル

   - `packages/shared/src/services/search/hybrid-rag-engine.ts` - HybridRAGEngineクラス
   - `packages/shared/src/services/search/hybrid-rag-factory.ts` - HybridRAGFactoryクラス
   - `packages/shared/src/services/search/__tests__/hybrid-rag-engine.test.ts` - テスト

   ### 変更されたファイル

   - `packages/shared/src/services/search/index.ts` - エクスポート追加

   ### 追加されたドキュメント

   - `outputs/phase-12/implementation-guide.md` - 実装ガイド
   ```

2. ユーザーにPR作成の許可を確認:
   ```
   上記の変更内容でPRを作成してよろしいですか？
   ```
3. 明示的な許可を待つ

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

**期待される成果物**:

- ユーザーからの許可

---

### タスク3: PR作成

**目的**: `/ai:diff-to-pr`を実行してPRを作成する

**実行手順**:

1. ユーザーの許可を確認:
   - [ ] ユーザーから明示的な許可を得ている
2. PR作成を実行:
   ```
   /ai:diff-to-pr
   ```
3. フォールバック（必要な場合）:

   ```bash
   # git/gh CLIで手動対応
   git add .
   git commit -m "feat(search): HybridRAG検索エンジン統合

   - HybridRAGEngineクラスを実装（4ステージパイプライン）
   - HybridRAGFactoryクラスを実装（Full/Lite/Testing）
   - 目標精度90%以上、レイテンシ500ms以下（CRAG無効時）を達成

   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

   git push -u origin feature/conv-07-07-hybridrag-integration

   gh pr create --title "feat(search): HybridRAG検索エンジン統合" --body "## Summary
   - HybridRAGEngineクラス: 4ステージパイプライン（Query Classification → Triple Search → RRF Fusion + Reranking → CRAG）
   - HybridRAGFactoryクラス: Full/Lite/Testing設定をサポート
   - 目標精度90%以上、レイテンシ目標達成

   ## Test plan
   - [ ] `pnpm --filter @repo/shared test` が全てPASS
   - [ ] `pnpm --filter @repo/shared typecheck` がエラー0
   - [ ] `pnpm --filter @repo/shared lint` が警告0
   - [ ] カバレッジ基準達成（Line 80%+, Branch 60%+, Function 80%+）

   🤖 Generated with [Claude Code](https://claude.com/claude-code)"
   ```

**期待される成果物**:

- PR URL

---

### タスク4: CI確認

**目的**: CIが通過したことを確認する

**実行手順**:

1. PRのCI状況を確認:
   ```bash
   gh pr checks
   ```
2. 結果を確認:
   | CI項目 | 結果 |
   | ------------ | -------- |
   | Build | {{PASS/FAIL}} |
   | Test | {{PASS/FAIL}} |
   | Type Check | {{PASS/FAIL}} |
   | Lint | {{PASS/FAIL}} |
3. CI失敗時の対応:
   - 失敗原因を特定
   - 修正を実施
   - 再度コミット・プッシュ

**期待される成果物**:

- CI結果

---

### タスク5: タスク完了処理【必須】

**目的**: タスクディレクトリをcompleted-tasksに移動する

**実行手順**:

1. PRがマージ可能な状態になったことを確認
2. タスクディレクトリを移動:
   ```bash
   mv docs/30-workflows/hybridrag-integration/ docs/30-workflows/completed-tasks/
   ```
3. 移動を確認:
   ```bash
   ls docs/30-workflows/completed-tasks/ | grep hybridrag-integration
   ```
4. 変更をコミット:
   ```bash
   git add docs/30-workflows/
   git commit -m "docs(workflows): hybridrag-integrationをcompleted-tasksに移動"
   git push
   ```

**期待される成果物**:

- タスクディレクトリの移動完了

---

## 参照資料

| 参照資料       | パス                                           | 内容             |
| -------------- | ---------------------------------------------- | ---------------- |
| Phase 10成果物 | `outputs/phase-10/final-review-result.md`      | 最終レビュー結果 |
| Phase 11成果物 | `outputs/phase-11/manual-test-result.md`       | 手動テスト結果   |
| Phase 12成果物 | `outputs/phase-12/documentation-update-log.md` | ドキュメント更新 |

---

## 成果物

| 成果物 | パス                          | 内容           |
| ------ | ----------------------------- | -------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL・CI結果 |

---

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

---

## PR作成に関する重要な注意

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

| 禁止事項                                 | 理由                                           |
| ---------------------------------------- | ---------------------------------------------- |
| 勝手にPRを作成する                       | レビュー前の変更がリモートに反映されてしまう   |
| ユーザー確認なしで`/ai:diff-to-pr`を実行 | 意図しないブランチやコミットが作成される可能性 |
| ローカル確認をスキップする               | 動作確認されていないコードがPRに含まれる       |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 12が完了していること
- **後続**: なし（ワークフロー完了）

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 13 実行記録

### 実行タスク

- タスク1（ローカル動作確認依頼）: {{result}}
- タスク2（変更サマリー提示と許可確認）: {{result}}
- タスク3（PR作成）: {{result}}
- タスク4（CI確認）: {{result}}
- タスク5（タスク完了処理）: {{result}}

### PR情報

- **PR URL**: {{URL}}
- **CI結果**: {{PASS/FAIL}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:
```

---

## ワークフロー完了

Phase 13が完了すると、HybridRAG統合タスクのワークフローは完了となります。

タスクディレクトリは `docs/30-workflows/completed-tasks/hybridrag-integration/` に移動されています。
