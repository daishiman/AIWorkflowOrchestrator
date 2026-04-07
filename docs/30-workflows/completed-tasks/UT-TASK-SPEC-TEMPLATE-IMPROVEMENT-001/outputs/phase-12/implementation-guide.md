# task-specification-creator validator 必須見出し強化 - 実装ガイド

## メタ情報

| 項目      | 内容                                  |
| --------- | ------------------------------------- |
| 機能名    | UT-TASK-SPEC-TEMPLATE-IMPROVEMENT-001 |
| 作成日    | 2026-04-06                            |
| 対象読者  | 開発者・技術者・学習者                |
| 関連Issue | #1917                                 |

---

## Part 1

### なぜ必要か

Phase 12 の成果物（`implementation-guide.md`）を検査する `validate-phase12-implementation-guide.js` が、特定の構造を持つファイルで `### 使用例` を見落とすバグが存在した。

たとえば:

- ❌ 悪い例（バグが発生する構造）: `## Part 2` 内に `## APIの概要` のような非番号見出しがあり、その後ろに `### 使用例` を置くと、validator が見落とす
- ⭕ 良い例（修正後）: `## Part 1` / `## Part 2` のみを Part 境界として認識し、Part 内の任意の `##` 見出しを保持する

### 何をするか

`extractSection()` 関数が「次の `## Part N`」のみを境界として使い、fenced code block 内の擬似見出しを無視するよう修正する。これにより、Part 2 内にどんな `##` 見出しや code fence が置かれても `### 使用例` を正しく検出できる。

### 日常の例え

たとえば: 本棚の棚を「1段目」「2段目」で区切るとき、2段目の中に仕切り板があっても「2段目の本」として正しく数えられるようになった。以前は仕切り板があると「ここまでが2段目」と誤解して残りの本を見逃していた。

### 今回作ったもの

| 日本語         | 英語                                        | 役割                                     |
| -------------- | ------------------------------------------- | ---------------------------------------- |
| Part境界検出   | `NEXT_PART_HEADING`                         | `## Part N` のみを境界として認識する定数 |
| セクション抽出 | `extractSection()`                          | Part 1 / Part 2 の内容を切り出す関数     |
| 使用例検査     | `hasUsageExample()`                         | `### 使用例` 直下の code block を確認    |
| 追加見出し検査 | `hasCreatedThings()` / `hasTestStructure()` | Part 1 / Part 2 の必須見出しを確認       |

---

## Part 2

> Part 2 は番号付き小節を含んでもよい。`### 使用例` は Part 2 の中に置き、見出し名を変えない。

## 1. アーキテクチャ概要

### 1.1 ファイル構成

```
.claude/skills/task-specification-creator/
├── scripts/
│   ├── validate-phase12-implementation-guide.js   # 修正対象 validator
│   └── __tests__/
│       └── validate-phase12-implementation-guide.test.mjs  # テスト
└── assets/
    ├── implementation-guide-template.md            # 変更なし
    └── documentation-changelog-template.md         # 変更なし（既に5フィールド存在）
```

### 1.2 修正の概要

`extractSection()` が Part 境界を検出する正規表現を変更:

```javascript
// 変更前: 非番号 ## 見出しを境界と誤認していた
const TOP_LEVEL_NON_NUMBERED_HEADING = /\n##\s+(?!\d+\.)/;

// 変更後: ## Part N のみを境界として認識（fence-safe scan 前提）
const NEXT_PART_HEADING = /^##\s+Part\s+\d+\b/;
```

---

## 2. 変更詳細

### 型定義

```typescript
/** validator の実行結果 */
interface ValidationResult {
  ok: boolean;
  guidePath: string;
  checks: CheckResult[];
  errors: string[];
}

/** 個別チェック結果 */
interface CheckResult {
  id: string;
  label: string;
  ok: boolean;
}
```

### APIシグネチャ

```typescript
// validatePhase12ImplementationGuide(workflowDir: string): ValidationResult
validatePhase12ImplementationGuide("docs/30-workflows/MY-TASK-001");
```

### 使用例

```bash
# validator の実行
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/MY-TASK-001 \
  --json
```

```bash
# テストの実行
node --test .claude/skills/task-specification-creator/scripts/__tests__/validate-phase12-implementation-guide.test.mjs
```

### エラーハンドリング

| ケース                                 | 期待動作                                         | 呼び出し側の対応                    |
| -------------------------------------- | ------------------------------------------------ | ----------------------------------- |
| `implementation-guide.md` が存在しない | `ok: false`, `errors` に不存在メッセージ         | ファイルを作成してから再実行        |
| `### 使用例` 見出し欠落                | `ok: false`, `errors: ["Part 2 に使用例がある"]` | `### 使用例` とコードブロックを追加 |
| Part 2 全体にコードブロックなし        | `ok: false`（使用例チェック FAIL）               | bash/ts コードブロックを追加        |

### エッジケース

| ケース                        | なぜ起こるか           | 現在の扱い                                       |
| ----------------------------- | ---------------------- | ------------------------------------------------ |
| Part 2 内に非番号 `##` 見出し | 作者が自由に章立てする | `NEXT_PART_HEADING` により正しく処理             |
| Part 3 以降が存在する         | 拡張仕様               | `## Part 3` を境界として Part 2 を正しく切り出す |
| `## Part 2` が存在しない      | 仕様書未完成           | `part2_exists: false` でチェック全失敗           |

### 設定項目と定数一覧

| 名前                | 既定値                  | 役割                      | 変更時の注意                  |
| ------------------- | ----------------------- | ------------------------- | ----------------------------- |
| `PART1_HEADING`     | `/^##\s+Part 1\b.*$/im` | Part 1 見出しのマッチング | Part 1 の命名規則変更時に更新 |
| `PART2_HEADING`     | `/^##\s+Part 2\b.*$/im` | Part 2 見出しのマッチング | Part 2 の命名規則変更時に更新 |
| `NEXT_PART_HEADING` | `/^##\s+Part\s+\d+\b/`  | 次の Part 境界検出        | Part 命名規則変更時に更新     |

---

### テスト構成

| テストファイル                                   | テスト数 | カバー範囲                                                                          |
| ------------------------------------------------ | -------- | ----------------------------------------------------------------------------------- |
| `validate-phase12-implementation-guide.test.mjs` | 9        | extractSection, hasUsageExample, changelog template, created things, test structure |
| **合計**                                         | **9**    |                                                                                     |

---

## 7. 追加の学び

| 項目           | 内容                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| validator 強化 | `hasUsageExample` を `### 使用例` 直下の code block に限定し、Part 境界抽出は fenced code block を無視する形に更新した。 |

---

## 8. 用語集

| 用語           | 読み方                   | 説明                                               |
| -------------- | ------------------------ | -------------------------------------------------- |
| validator      | バリデーター             | 入力データが仕様を満たしているか検査するスクリプト |
| extractSection | エクストラクトセクション | Markdown から特定セクションを切り出す関数          |
| Part-aware     | パートアウェア           | `## Part N` のみを境界として認識する設計方針       |
| TDD            | ティーディーディー       | Test-Driven Development: テスト先行開発手法        |
