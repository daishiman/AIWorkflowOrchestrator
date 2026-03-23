# 実装ガイド: toHandoffGuidance Adapter

## Part 1: 概念的説明（中学生でもわかる版）

### 日常の例え: 「通訳者」の比喩

たとえば、国際会議で各国の代表が自国語で話す場面を想像してほしい。英語、フランス語、中国語、アラビア語で話された内容を、全て日本語に翻訳する「通訳者」がいれば、日本語しかわからない人でも全員の話を理解できる。

`toHandoffGuidance()` adapter はまさにこの「通訳者」の役割を果たす。Chat Edit、Agent 実行、Skill 実行など、それぞれ異なる形式（言語）で送られてくるデータを、`HandoffGuidance` という統一形式（日本語）に変換する。

### なぜ必要か

変換ロジックが各サービスに分散していると、修正や追加のたびに複数の場所を探して直す必要があり、ミスが起きやすい。1 つの「通訳者」に集約すれば、変更は 1 箇所で済む。

### 何をするか

1 つの adapter 関数（`toHandoffGuidance`）を作り、全ての変換をここに集約する。4 種類の入力（chat-edit, agent, skill, bundle）を受け取り、統一形式の `HandoffGuidance` を返す。

## Part 2: 技術的詳細

### Discriminated Union パターン

`kind` プロパティで入力型を判別し、`switch` 文で exhaustive check を行う。将来新しい Consumer が追加された場合、`never` 型チェックによりコンパイルエラーで漏れを検出できる。

```typescript
type HandoffSource =
  | ChatEditHandoffSource // kind: "chat-edit"
  | AgentHandoffSource // kind: "agent"
  | SkillHandoffSource // kind: "skill"
  | BundleHandoffSource; // kind: "bundle"
```

### 配置先の選定理由

3 候補から候補 C（`apps/desktop/src/main/adapters/handoff/`）を選定:

1. 既存パターン（`adapters/llm/`）との一貫性
2. `Main → shared` の一方向依存を維持
3. import サイクル回避

### ディレクトリ構成

```text
apps/desktop/src/main/adapters/handoff/
  index.ts                      # re-export
  toHandoffGuidance.ts          # adapter 関数本体
  types.ts                      # Discriminated Union 型定義
  __tests__/
    toHandoffGuidance.test.ts   # 16 テストケース
```

### セキュリティ設計

| 対策             | 処理                               |
| ---------------- | ---------------------------------- |
| バックスラッシュ | `\` → `\\`                         |
| ダブルクォート   | `"` → `\"`                         |
| 変数展開         | `$` → `\$`                         |
| バッククォート   | `` ` `` → `` \` ``                 |
| 改行・タブ       | `\n`, `\t` → ` `                   |
| API キーパターン | `sk-xxx`, `key-xxx` → `[REDACTED]` |
| Bearer トークン  | `Bearer xxx` → `Bearer [REDACTED]` |

### テストカバレッジ

| 指標              | 結果   | 基準 |
| ----------------- | ------ | ---- |
| Line Coverage     | 90.08% | 90%+ |
| Branch Coverage   | 73.07% | 60%+ |
| Function Coverage | 100%   | 90%+ |

### 既存コードとの統合方針

段階的移行（破壊的変更なし）。既存の `TerminalHandoffBuilder` クラスはそのまま維持。将来的に Builder を adapter に委譲する移行パスを確保。
