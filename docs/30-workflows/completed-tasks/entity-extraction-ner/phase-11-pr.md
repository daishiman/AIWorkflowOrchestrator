# Phase 11: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 11                      |
| Phase名    | PR作成                  |
| 前提Phase  | Phase 10 (ドキュメント) |
| 後続Phase  | -（完了）               |
| ステータス | 未実施                  |
| 作成日     | 2026-01-05              |
| 機能名     | entity-extraction-ner   |

---

## 目的

実装をmainブランチにマージするためのPull Requestを作成する。

## 背景

全Phaseが完了し、品質基準を満たした実装をPRとして提出し、コードレビューを経てマージする。

---

## 使用スキル

このPhaseでは特定のスキルは使用しない。PRテンプレートに従って作成する。

---

## 参照資料

| 参照資料       | パス                              | 内容             |
| -------------- | --------------------------------- | ---------------- |
| 要件定義       | `outputs/phase-1/requirements.md` | 機能・非機能要件 |
| 最終レビュー   | `outputs/phase-8/final-review.md` | レビュー結果     |
| 手動テスト結果 | `outputs/phase-9/manual-test.md`  | テスト結果       |

---

## 成果物

| 成果物     | パス                     | 内容           |
| ---------- | ------------------------ | -------------- |
| PRチェック | `outputs/phase-11/pr.md` | PR情報・リンク |

---

## PR作成手順

### 1. ブランチ確認

```bash
git branch --show-current
# feature/entity-extraction-ner であることを確認
```

### 2. 変更確認

```bash
git status
git diff main --stat
```

### 3. コミット

```bash
git add .
git commit -m "feat(shared): エンティティ抽出サービス (NER) を実装

- LLMEntityExtractor: LLMベースのエンティティ抽出
- RuleBasedEntityExtractor: ルールベースのフォールバック実装
- バッチ処理、重複マージ、フィルタリング機能
- 80%以上のテストカバレッジ

Closes #XXX"
```

### 4. プッシュ

```bash
git push -u origin feature/entity-extraction-ner
```

### 5. PR作成

```bash
gh pr create --title "feat(shared): エンティティ抽出サービス (NER) を実装" \
  --body "$(cat << 'EOF'
## 概要

HybridRAGパイプラインのKnowledge Graph構築に必要なエンティティ抽出サービスを実装しました。

## 変更内容

### 追加ファイル
- `packages/shared/src/services/extraction/types.ts`
- `packages/shared/src/services/extraction/interfaces.ts`
- `packages/shared/src/services/extraction/errors.ts`
- `packages/shared/src/services/extraction/entity-extractor.ts`
- `packages/shared/src/services/extraction/rule-based-extractor.ts`
- `packages/shared/src/services/extraction/prompts/entity-extraction.ts`
- `packages/shared/src/services/extraction/index.ts`
- `packages/shared/src/services/extraction/__tests__/entity-extractor.test.ts`
- `packages/shared/src/services/extraction/__tests__/rule-based-extractor.test.ts`

### 機能
- LLMベースエンティティ抽出（10種類のエンティティタイプ対応）
- ルールベースエンティティ抽出（フォールバック用）
- バッチ処理（複数チャンク一括処理）
- 重複エンティティマージ
- フィルタリング（タイプ、信頼度、最大数）

## テスト

- ユニットテスト: ✅ Pass
- カバレッジ: 80%+
- 手動テスト: ✅ Pass

## 関連Issue

- Closes #XXX

## レビュー観点

- [ ] 型定義の妥当性
- [ ] エラーハンドリングの適切性
- [ ] LLMプロンプトの品質
- [ ] テストカバレッジの十分性
EOF
)"
```

---

## PRチェックリスト

### 必須項目

- [ ] 全テストがパスしている
- [ ] ESLint/TypeScriptエラーがない
- [ ] コミットメッセージがConventional Commits形式
- [ ] PRタイトルが適切
- [ ] PR説明が十分

### 推奨項目

- [ ] 関連Issueがリンクされている
- [ ] スクリーンショット/GIFがある（UI変更時）
- [ ] Breaking Changeがある場合は明記

---

## CI確認

PRを作成後、以下のCIチェックがパスすることを確認:

- [ ] Build
- [ ] Lint
- [ ] Type Check
- [ ] Unit Tests
- [ ] Integration Tests（該当する場合）

---

## 完了条件

- [ ] 全変更がコミットされている
- [ ] リモートブランチにプッシュされている
- [ ] PRが作成されている
- [ ] CIがパスしている
- [ ] artifacts.json の status が "completed" に更新されている
- [ ] PR情報が `outputs/phase-11/pr.md` に記録されている

---

## 依存関係

- **前提**: Phase 10 が完了していること
- **後続**: なし（タスク完了）

---

## スキルフィードバック記録

```markdown
## Phase 11 実行記録

### PR情報

- PR番号: #{{number}}
- PR URL: {{url}}
- 作成日時: {{datetime}}

### CI結果

- Build: {{PASS/FAIL}}
- Lint: {{PASS/FAIL}}
- Type Check: {{PASS/FAIL}}
- Tests: {{PASS/FAIL}}

### タスク完了

- artifacts.json更新: {{完了/未完了}}
```

---

## タスク完了後

PRがマージされたら:

1. `artifacts.json` の `status` を `"completed"` に更新
2. タスクファイルを `docs/30-workflows/completed-tasks/` に移動
3. マスタータスクリストを更新
