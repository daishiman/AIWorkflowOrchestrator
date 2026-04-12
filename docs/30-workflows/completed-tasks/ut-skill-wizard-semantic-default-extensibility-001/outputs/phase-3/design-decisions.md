# Phase 3: 設計決定・正準形マッピング表（AC-4 対応）

## 正準形マッピング表（q1〜q6 全エントリ）

| 質問ID | 質問ラベル           | rawValue      | displayLabel | 備考                                      |
| ------ | -------------------- | ------------- | ------------ | ----------------------------------------- |
| q1     | 利用者（誰が使うか） | `"自分だけ"`  | `"自分のみ"` | inferSmartDefaults の表記揺れ吸収         |
| q2     | 入力データ           | -             | -            | 変換エントリなし（現在）                  |
| q3     | 実行タイミング       | `"scheduled"` | `"定期実行"` | 英語 semantic 値を日本語 UI ラベルへ変換  |
| q4     | 出力先               | -             | -            | 変換エントリなし（現在）                  |
| q5     | 外部ツール連携       | `"slack"`     | `"Slack"`    | lowercase → proper case                   |
| q5     | 外部ツール連携       | `"github"`    | `"GitHub"`   | lowercase → proper case                   |
| q5     | 外部ツール連携       | `"notion"`    | `"その他"`   | freeText: "Notion" も設定（特別ケース）   |
| q6     | 出力フォーマット     | `"週次"`      | `"週に1回"`  | Q6 options 外のため freeText に格納される |

## 変換方針（設定駆動型採用の理由）

- `ConversationRoundStep.tsx` 内に変換テーブルをハードコードすると、
  q7 以降の追加時に UI コンポーネントを直接修正する必要があり管理限界が生じる
- `SEMANTIC_LABEL_MAP` を `@repo/shared` に分離することで、
  変換テーブルの追加・変更が `skill-wizard-label-map.ts` 1 ファイルで完結する
- DI（依存性注入）パターン採用: `resolveSemanticLabel(value, questionId, labelMap?)` の
  第3引数でカスタムマップを注入可能にし、テスト容易性と拡張性を両立する

## なぜ shared に置いたか（設計根拠）

1. **責務の一元化**: `apps/desktop` 固有コンポーネント内に変換テーブルを埋め込むと
   他パッケージからの参照や単体テストが困難になる。`@repo/shared` に置くことで管理責務を一元化する

2. **型安全性**: `QuestionSemanticLabelMap = Record<string, Record<string, string>>` 型により、
   コンパイル時に変換テーブルの構造が保証される

3. **将来拡張**: q7〜qN が追加された場合は `SEMANTIC_LABEL_MAP` にエントリを追記するだけで対応完了。
   コンポーネント本体の変更は不要

4. **テスト可能性**: `resolveSemanticLabel` を shared からエクスポートすることで、
   コンポーネントの内部実装を expose せずに単体テストが可能

## 特別ケース: notion

`notion` は `resolveSemanticLabel` では `"その他"` に変換されるが、
UI の自由入力欄（freeText）に `"Notion"` を設定するロジックが別途必要。
`createQuestionAnswer` 内で `normalizedKey === "notion"` を先行チェックして対応。
SEMANTIC_LABEL_MAP の `notion: "その他"` エントリはフォールバック保険として残す。
