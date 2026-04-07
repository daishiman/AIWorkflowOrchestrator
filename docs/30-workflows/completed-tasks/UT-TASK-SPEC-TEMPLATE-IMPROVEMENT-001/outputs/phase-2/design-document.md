# 設計書: UT-TASK-SPEC-TEMPLATE-IMPROVEMENT-001

## 作成日

2026-04-06

---

## 1. validator 修正設計

### 1.1 現行ロジックの問題

`extractSection()` の境界検出正規表現:

```javascript
// 現行（問題あり）
const TOP_LEVEL_NON_NUMBERED_HEADING = /\n##\s+(?!\d+\.)/;
```

- `(?!\d+\.)` は「数字+ピリオド」で始まる見出しを除外するが、それ以外の非Partな `##` 見出し（例: `## APIの概要`）を境界として誤検知する
- Part 2 内に番号なし `##` 見出しがある実装ガイドで `### 使用例` が見落とされる

### 1.2 採用アプローチ: B (Part-aware extraction)

**修正方針**:

- `extractSection()` の次の境界を「次の `## Part \d+`」のみに変更する
- Part 内の任意の `##` 見出し（番号付き・番号なし問わず）を Part のコンテンツとして保持する

**修正後の正規表現**:

```javascript
// 修正後（Part-aware）
const NEXT_PART_HEADING = /\n##\s+Part\s+\d+\b/;
```

**修正後の `extractSection()` ロジック**:

```javascript
function extractSection(content, headingPattern) {
  const match = headingPattern.exec(content);
  if (!match || match.index < 0) return "";

  const section = content.slice(match.index + match[0].length);
  const nextPartMatch = section.match(NEXT_PART_HEADING);
  if (!nextPartMatch) return section.trim();

  return section.slice(0, nextPartMatch.index).trim();
}
```

### 1.3 既存チェックへの影響確認

| チェックID                 | チェック内容        | 影響                                                |
| -------------------------- | ------------------- | --------------------------------------------------- |
| `part1_exists`             | Part 1 が存在する   | なし（抽出後に length チェック）                    |
| `part1_why_first`          | なぜ必要かが先      | なし                                                |
| `part1_analogy`            | 日常の例え          | なし                                                |
| `part2_exists`             | Part 2 が存在する   | なし                                                |
| `part2_typescript`         | 型定義がある        | 改善（Part 2 内の `##` 見出し後の型定義も検出可能） |
| `part2_api_signature`      | APIシグネチャがある | 改善（同上）                                        |
| `part2_usage_example`      | 使用例がある        | **修正対象**（バグ修正）                            |
| `part2_error_handling`     | エラーハンドリング  | 改善                                                |
| `part2_edge_cases`         | エッジケース        | 改善                                                |
| `part2_settings_constants` | 設定項目と定数一覧  | 改善                                                |

---

## 2. implementation-guide-template.md 修正設計

### 2.1 現行構造確認

`## Part 2` 配下にすでに以下の注釈がある:

```markdown
> Part 2 は番号付き小節を含んでもよい。`### 使用例` は Part 2 の中に置き、見出し名を変えない。
```

テンプレート本体の `## Part 2` 配下には `## 1.`, `## 2.` のような番号付き小節があり、
その中の `### 型定義`, `### 使用例` 等が配置されている。

### 2.2 修正方針

- 最小変更原則: 既存見出し名を変更しない
- validator 最小骨格セクションの注記を更新して、新しい境界検出（`## Part N`）との整合を明記する
- `### 使用例` が `## Part 2` の中に必ず存在することの注意書きを強化する

---

## 3. documentation-changelog-template.md 修正設計

### 3.1 現状確認

ファイル精査の結果、以下の5フィールドは**すでにテンプレート本体に追加済み**:

```markdown
| 変更者 | {{AUTHOR}} |
| 関連 Issue / PR | {{ISSUE_PR_LINK}} |
| validator 実行結果 | {{VALIDATOR_RESULT}} |
| current / baseline | {{CURRENT_BASELINE}} |
| artifacts 同期結果 | {{ARTIFACTS_SYNC_RESULT}} |
```

品質チェックリストの「メタ情報テーブルの 5 必須フィールドが全て記録されているか」も存在する。

**追加修正不要**（既に要件を満たしている）。

---

## 4. テスト設計

### 新規追加テストケース

| ID        | シナリオ                                                                              | 期待結果        |
| --------- | ------------------------------------------------------------------------------------- | --------------- |
| TC-NEW-01 | Part 2 内に非番号 `##` 見出し（`## APIの概要`）があり、その後ろに `### 使用例` がある | PASS (ok: true) |

### 既存テストの回帰確認

- "必須要件を満たすガイドは PASS" → PASS
- "Part 2 の番号付き小節の後に使用例があっても PASS" → PASS
- "Part 2 の型定義が無ければ FAIL" → PASS
- "Part 2 に使用例が無ければ FAIL" → PASS
- "documentation changelog テンプレートに 5 必須フィールドがある" → PASS
- "Part 1 が理由先行でなければ FAIL" → PASS

---

## 5. インターフェース仕様

### 入力

```
implementation-guide.md (Markdown テキスト)
```

### 出力 (JSON with --json flag)

```json
{
  "ok": boolean,
  "guidePath": string,
  "checks": [{ "id": string, "label": string, "ok": boolean }],
  "errors": string[]
}
```
