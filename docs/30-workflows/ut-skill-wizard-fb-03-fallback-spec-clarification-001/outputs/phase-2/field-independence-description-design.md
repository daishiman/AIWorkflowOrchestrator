# Phase 2 成果物: フィールド独立性記述設計書

## タスク情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001 |
| 作成日   | 2026-04-11                                            |

## SKILL.md への追記設計

### 追記位置

`SKILL.md` の「よくある漏れ」テーブルの `[Feedback FB-03]` エントリの直後に
以下のセクションを追加する。

### 追記テキスト（確定版）

```markdown
| **[FB-03補足] SmartDefault AC-4 フィールド独立推論性** | SmartDefaultの各フィールドは**独立して**推論される。あるフィールドが空/null/推論不可でも、他フィールドの推論には影響しない。`purpose` は `tool`/`timing` のみを駆動し、`category` は `format` のみを駆動する。**誤用**: purpose空 → 全フィールドnull（連鎖null誤解）。**正用**: purpose空 → tool/timingのみnull、formatはcategoryから独立推論継続。詳細は `inferSmartDefaults` のAC-4テストケース（TC-FB03-01〜09）を参照 |
```

## phase-template-execution.md への追記設計

### 追記位置

Phase 4（テスト作成）のセクション内、または SmartDefault 関連のガイドライン箇所に追加。

### 追記テキスト（確定版）

```markdown
#### SmartDefault フィールド間独立推論性（AC-4補足）

SmartDefaultの各フィールドは独立して推論される。以下の原則に従う：

1. 各フィールドは独自の推論ロジックを持つ
2. あるフィールドがnullになっても、他フィールドの推論には影響しない
3. フィールド間に明示的な依存関係がない限り、独立して評価する

| フィールド | 推論ソース | 空白時の動作     | 他フィールドへの影響 |
| ---------- | ---------- | ---------------- | -------------------- |
| tool       | purpose    | null（推論不可） | なし（独立）         |
| timing     | purpose    | null（推論不可） | なし（独立）         |
| format     | category   | null（推論不可） | なし（独立）         |

**よくある誤解**:

| 誤解パターン                                    | 正しい動作                                                        |
| ----------------------------------------------- | ----------------------------------------------------------------- |
| purpose空 → 全フィールドがnull                  | purpose空 → tool/timingのみnull、formatはcategoryから独立推論     |
| category空 → format推論不可 → purpose推論も影響 | category空 → formatのみnull、purpose推論（tool/timing）は影響なし |

**テスト参照**: `TC-FB03-01〜09`（`smartDefaultReasoningService.test.ts`）
```

## テストケース設計（修正版）

### 設計修正のポイント

仕様書（Phase 4）の TC-FB03-01 では `category: "tool"` を使用しているが、
以下の理由で `category: "code-support"` に修正する：

| 問題点                                                     | 修正方針                                             |
| ---------------------------------------------------------- | ---------------------------------------------------- |
| `"tool"` は `inferFormat` のカテゴリマッピングに存在しない | `"code-support"` を使用（format="code"にマッピング） |
| `result.category` アサーションは戻り値に存在しない         | アサーションを削除                                   |
| `async/await` が使用されているが同期関数                   | async/awaitを削除                                    |

### 完成版テストケース設計（TC-FB03-01〜09）

詳細は `outputs/phase-4/test-cases.md` を参照。
