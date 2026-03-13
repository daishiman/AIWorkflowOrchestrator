# レビュー結果テンプレート

> **Progressive Disclosure**
> - 読み込みタイミング: Phase 3（設計レビュー）、Phase 10（最終レビュー）実行時
> - 読み込み条件: レビューゲート結果を記録するとき
> - 使用スキーマ: schemas/review-gate-result.json
> - 出力先: outputs/phase-{{N}}/review-result.md

Phase 3/10のレビューゲート結果を記録するテンプレート。

---

## 変数一覧

| 変数名 | 説明 | 例 |
| ------ | ---- | -- |
| `{{PHASE_NUMBER}}` | Phase番号（3または10） | `3` |
| `{{REVIEW_TYPE}}` | レビュータイプ | `設計レビュー` / `最終レビュー` |
| `{{FEATURE_NAME}}` | 機能名 | `search-replace-ui` |
| `{{REVIEW_DATE}}` | レビュー実施日 | `2026-01-26` |
| `{{JUDGMENT}}` | 最終判定 | `PASS` / `MINOR` / `MAJOR` / `CRITICAL` |
| `{{RETURN_TARGET}}` | 戻り先Phase | `2`（MAJORの場合） |

---

## 配置先

```
outputs/phase-{{PHASE_NUMBER}}/review-result.md
```

---

## テンプレート本体

````markdown
# Phase {{PHASE_NUMBER}}: {{REVIEW_TYPE}} - レビュー結果

## メタ情報

| 項目 | 内容 |
| ---- | ---- |
| Phase | {{PHASE_NUMBER}} |
| レビュータイプ | {{REVIEW_TYPE}} |
| 機能名 | {{FEATURE_NAME}} |
| 実施日 | {{REVIEW_DATE}} |
| 実行ランナー | {{REVIEW_RUNNER}} |
| 実行コマンド | `{{REVIEW_COMMAND}}` |
| **最終判定** | **{{JUDGMENT}}** |

---

## 判定結果

| 判定 | 条件 | 次のアクション |
| ---- | ---- | -------------- |
| **{{JUDGMENT}}** | {{JUDGMENT_CONDITION}} | {{NEXT_ACTION}} |

{{#if RETURN_TARGET}}
**戻り先**: Phase {{RETURN_TARGET}}
{{/if}}

---

## レビュー項目

### 要件（Requirements）

| # | レビュー項目 | 結果 | コメント |
|---|-------------|------|---------|
| 1 | {{ITEM_1}} | {{STATUS_1}} | {{COMMENT_1}} |

### 設計（Design）

| # | レビュー項目 | 結果 | コメント |
|---|-------------|------|---------|
| 1 | {{ITEM_1}} | {{STATUS_1}} | {{COMMENT_1}} |

### 実装（Implementation）

| # | レビュー項目 | 結果 | コメント |
|---|-------------|------|---------|
| 1 | {{ITEM_1}} | {{STATUS_1}} | {{COMMENT_1}} |

### テスト（Test）

| # | レビュー項目 | 結果 | コメント |
|---|-------------|------|---------|
| 1 | {{ITEM_1}} | {{STATUS_1}} | {{COMMENT_1}} |

### 品質（Quality）

| # | レビュー項目 | 結果 | コメント |
|---|-------------|------|---------|
| 1 | {{ITEM_1}} | {{STATUS_1}} | {{COMMENT_1}} |

---

## サマリー

| 判定 | 件数 |
| ---- | ---- |
| PASS | {{PASS_COUNT}} |
| MINOR | {{MINOR_COUNT}} |
| MAJOR | {{MAJOR_COUNT}} |
| CRITICAL | {{CRITICAL_COUNT}} |
| **合計** | **{{TOTAL_COUNT}}** |

---

## 指摘事項一覧

{{#if HAS_ISSUES}}
| # | カテゴリ | 深刻度 | 指摘内容 | 改善提案 |
|---|---------|--------|---------|---------|
{{#each ISSUES}}
| {{@index}} | {{category}} | {{severity}} | {{issue}} | {{suggestion}} |
{{/each}}
{{else}}
**指摘事項なし**
{{/if}}

---

## 次のアクション

{{#each NEXT_ACTIONS}}
- [ ] {{this}}
{{/each}}

---

## レビュアー

- {{REVIEWER}}
````

---

## 判定基準

### Phase 3: 設計レビュー

| 判定 | 条件 | 戻り先 |
| ---- | ---- | ------ |
| PASS | 全項目問題なし | Phase 4 |
| MINOR | 軽微な指摘のみ | Phase 4（指摘対応後） |
| MAJOR | 要件に問題 | Phase 1 |
| MAJOR | 設計に問題 | Phase 2 |

### Phase 10: 最終レビュー

| 判定 | 条件 | 戻り先 |
| ---- | ---- | ------ |
| PASS | 全項目問題なし | Phase 11 |
| MINOR | 軽微な指摘のみ | Phase 11（指摘対応後） |
| MAJOR | 実装に問題 | Phase 5 |
| MAJOR | テストに問題 | Phase 4 |
| MAJOR | 設計に問題 | Phase 2 |
| CRITICAL | 根本的問題 | Phase 1 |

---

## 使用方法

1. `run-review-task.js` または raw `codex exec` で review task を実行する
2. 各カテゴリの項目をチェック
3. 指摘事項があれば記録
4. 最終判定を決定
5. `codex review` は差分 blocker を補助確認したい場合だけ使う
6. PASS / MINOR でも次Phaseまたは戻り先を明記する
7. `outputs/phase-{{N}}/review-result.md` に出力
