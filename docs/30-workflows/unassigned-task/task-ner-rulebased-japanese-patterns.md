# NER RuleBasedExtractor 日本語パターン拡張 - タスク指示書

## メタ情報

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| タスクID     | task-ner-rulebased-japanese-patterns                      |
| タスク名     | RuleBasedEntityExtractor 日本語パターン拡張               |
| 分類         | 改善                                                      |
| 対象機能     | エンティティ抽出サービス（NER）- RuleBasedEntityExtractor |
| 優先度       | 低                                                        |
| 見積もり規模 | 小規模                                                    |
| ステータス   | 未実施                                                    |
| 発見元       | CONV-06-04 Phase 11（手動テスト発見事項）                 |
| 発見日       | 2026-01-18                                                |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

CONV-06-04（エンティティ抽出サービス NER）のPhase 11手動テストにおいて、RuleBasedEntityExtractorの日本語対応に関する制限事項が確認された。

RuleBasedEntityExtractorは、LLMを使用せずパターンマッチングで高速にエンティティを抽出するフォールバック実装である。現在の実装では以下の日本語パターンがカバーされていない:

| 制限事項               | 現状                                     |
| ---------------------- | ---------------------------------------- |
| 日本語人名の抽出       | 辞書ベースのみ、一般パターンなし         |
| 日本語組織名（辞書外） | 「株式会社」「合同会社」等のパターンなし |
| カタカナ技術用語一部   | 新しい技術用語がカバーされていない       |

### 1.2 問題点・課題

| 問題項目               | 詳細                                                       | 影響範囲           |
| ---------------------- | ---------------------------------------------------------- | ------------------ |
| 日本語人名検出の欠落   | 「山田太郎」「鈴木一郎」等の一般的な日本語人名が検出不可   | 日本語ドキュメント |
| 日本語組織名検出の欠落 | 「株式会社〇〇」「〇〇合同会社」等のパターンが未対応       | 日本語ドキュメント |
| 新カタカナ用語の不足   | 「リアクト」「タイプスクリプト」等の日本語表記が辞書にない | 技術文書           |

### 1.3 放置した場合の影響

| 影響                                 | 深刻度 |
| ------------------------------------ | ------ |
| LLM非使用時の日本語抽出精度低下      | 中     |
| フォールバック時の品質劣化           | 中     |
| 日本語中心の環境でのユーザー体験低下 | 低     |

**注記**: これらは設計上の想定内であり、LLMEntityExtractor使用時は問題なく抽出可能。RuleBasedExtractorは高速フォールバック用途のため、優先度は「低」とする。

---

## 2. 何を達成するか（What）

### 2.1 目的

RuleBasedEntityExtractorの日本語パターンを拡張し、LLM非使用時でも基本的な日本語エンティティを抽出可能にする。

### 2.2 最終ゴール

- 日本語人名パターンの追加（姓名分離、敬称除去）
- 日本語組織名パターンの追加（株式会社、有限会社、合同会社等）
- カタカナ技術用語辞書の拡充
- 既存テストへの回帰影響なし

### 2.3 スコープ

#### 含むもの

- 日本語人名検出パターンの追加
- 日本語組織名検出パターンの追加
- カタカナ技術用語辞書の拡充
- パターン追加に伴うユニットテスト
- RuleBasedExtractor専用のベンチマーク

#### 含まないもの

- LLMEntityExtractorの変更
- 日本語形態素解析ライブラリの導入（複雑度制御）
- 他言語（中国語、韓国語等）対応
- 新しいエンティティタイプの追加

### 2.4 成果物

| 成果物                       | 配置先                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| 日本語パターン定義ファイル   | `packages/shared/src/services/extraction/patterns/japanese-patterns.ts`              |
| 更新されたRuleBasedExtractor | `packages/shared/src/services/extraction/rule-based-entity-extractor.ts`             |
| 日本語テストケース           | `packages/shared/src/services/extraction/__tests__/japanese-extraction.test.ts`      |
| 日本語ベンチマーク           | `packages/shared/src/services/extraction/__tests__/japanese-extraction.benchmark.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

| 前提条件                                   | 必須 |
| ------------------------------------------ | ---- |
| CONV-06-04が完了していること               | ✅   |
| RuleBasedEntityExtractorが動作していること | ✅   |

### 3.2 依存タスク

| タスクID   | タスク名                       | 依存種別 |
| ---------- | ------------------------------ | -------- |
| CONV-06-04 | エンティティ抽出サービス (NER) | 完了必須 |

### 3.3 必要な知識

| 技術           | 必要レベル | 備考                     |
| -------------- | ---------- | ------------------------ |
| TypeScript     | 中級       | パターン実装             |
| 正規表現       | 中級       | 日本語パターンマッチング |
| 日本語言語知識 | 基礎       | 人名・組織名の構造理解   |

### 3.4 推奨アプローチ

1. **パターン設計**: 日本語特有のパターンを正規表現で定義
2. **辞書拡充**: カタカナ技術用語を追加
3. **TDD実装**: テストファーストでパターン追加
4. **回帰テスト**: 既存テストへの影響確認

---

## 4. 実行手順

### Phase構成

標準13Phase構成を簡略化して適用（2Phase構成）。

### Phase 1: パターン設計・実装

#### 目的

日本語パターンの設計と実装。

#### 手順

1. 日本語人名パターンの定義

   ```typescript
   // japanese-patterns.ts
   export const japanesePersonPatterns = [
     // 姓名パターン（漢字2-4文字 + 漢字1-4文字）
     /([一-龯]{2,4})\s*([一-龯]{1,4})(?:さん|様|氏)?/g,
     // 敬称付きパターン
     /([一-龯]{2,4})\s*([一-龯]{1,4})(さん|様|氏|先生|教授)/g,
   ];
   ```

2. 日本語組織名パターンの定義

   ```typescript
   export const japaneseOrgPatterns = [
     // 株式会社〇〇 / 〇〇株式会社
     /株式会社\s*([一-龯ァ-ヶー・a-zA-Z0-9]+)/g,
     /([一-龯ァ-ヶー・a-zA-Z0-9]+)\s*株式会社/g,
     // 有限会社 / 合同会社 / 一般社団法人 等
     /(有限会社|合同会社|一般社団法人|一般財団法人)\s*([一-龯ァ-ヶー・]+)/g,
   ];
   ```

3. カタカナ技術用語辞書の拡充

   ```typescript
   export const katakanaTerms: Record<string, string> = {
     リアクト: "technology",
     タイプスクリプト: "programming_language",
     ジャバスクリプト: "programming_language",
     ノードジェイエス: "technology",
     エレクトロン: "technology",
     // ... 追加
   };
   ```

4. RuleBasedExtractorへの統合

   ```typescript
   // rule-based-entity-extractor.ts
   import { japanesePersonPatterns, japaneseOrgPatterns, katakanaTerms } from './patterns/japanese-patterns';

   private extractJapaneseEntities(text: string): ExtractedEntity[] {
     const entities: ExtractedEntity[] = [];

     // 人名抽出
     for (const pattern of japanesePersonPatterns) {
       const matches = text.matchAll(pattern);
       for (const match of matches) {
         entities.push({
           name: match[1] + match[2],
           normalizedName: this.normalizeJapaneseName(match[1] + match[2]),
           type: 'person',
           confidence: 0.7,
           // ...
         });
       }
     }

     // 組織名抽出（同様）
     // カタカナ用語抽出（同様）

     return entities;
   }
   ```

#### 成果物

- japanese-patterns.ts
- 更新されたRuleBasedExtractor

#### 完了条件

- [ ] 日本語人名パターンが定義されている
- [ ] 日本語組織名パターンが定義されている
- [ ] カタカナ技術用語が辞書に追加されている

### Phase 2: テスト・検証

#### 目的

パターン追加のテストと回帰確認。

#### 手順

1. 日本語テストケースの作成

   ```typescript
   describe("RuleBasedExtractor - Japanese Patterns", () => {
     it("should extract Japanese person names", () => {
       const text = "田中太郎さんと山田花子が参加しました。";
       const result = extractor.extract(createTestChunk(text));
       expect(result.value.entities).toContainEqual(
         expect.objectContaining({ name: "田中太郎", type: "person" }),
       );
       expect(result.value.entities).toContainEqual(
         expect.objectContaining({ name: "山田花子", type: "person" }),
       );
     });

     it("should extract Japanese organization names", () => {
       const text = "株式会社サンプルと合同会社テストが提携しました。";
       const result = extractor.extract(createTestChunk(text));
       expect(result.value.entities).toContainEqual(
         expect.objectContaining({
           name: "株式会社サンプル",
           type: "organization",
         }),
       );
     });

     it("should extract katakana tech terms", () => {
       const text = "タイプスクリプトとリアクトを使用しています。";
       const result = extractor.extract(createTestChunk(text));
       expect(result.value.entities).toContainEqual(
         expect.objectContaining({
           name: "タイプスクリプト",
           type: "programming_language",
         }),
       );
     });
   });
   ```

2. 回帰テスト実行

   ```bash
   pnpm --filter @repo/shared test -- --testPathPattern="rule-based"
   ```

3. ベンチマーク実行

   ```bash
   pnpm --filter @repo/shared test -- --testPathPattern="japanese-extraction.benchmark"
   ```

#### 成果物

- japanese-extraction.test.ts
- japanese-extraction.benchmark.ts

#### 完了条件

- [ ] 日本語テストケースが全てパス
- [ ] 既存テストに回帰影響なし
- [ ] ベンチマークで処理速度が許容範囲内

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 日本語人名（姓名パターン）が抽出可能
- [ ] 日本語組織名（株式会社等）が抽出可能
- [ ] カタカナ技術用語が抽出可能
- [ ] 敬称（さん、様、氏）が正しく除去される

### 品質要件

- [ ] 既存テストが全てパス
- [ ] 新規テストのカバレッジ80%以上
- [ ] 処理速度がRuleBasedの許容範囲内（< 10ms/chunk）
- [ ] ESLint/TypeScriptエラー0件

### ドキュメント要件

- [ ] パターン定義のコメントが適切
- [ ] テストケースが自己説明的

---

## 6. 検証方法

### テストケース

| #   | テスト                        | 期待結果                   |
| --- | ----------------------------- | -------------------------- |
| 1   | 日本語人名（2文字姓+2文字名） | 人名として抽出             |
| 2   | 日本語人名（敬称付き）        | 敬称除去後の人名として抽出 |
| 3   | 株式会社〇〇                  | organization として抽出    |
| 4   | 〇〇株式会社                  | organization として抽出    |
| 5   | カタカナ技術用語              | 該当タイプとして抽出       |
| 6   | 処理速度                      | 10ms/chunk 以下            |

### 検証手順

```bash
# 日本語パターンテスト実行
pnpm --filter @repo/shared test -- --testPathPattern="japanese-extraction"

# 全RuleBasedテスト（回帰確認）
pnpm --filter @repo/shared test -- --testPathPattern="rule-based"

# カバレッジ確認
pnpm --filter @repo/shared test:coverage -- --testPathPattern="extraction"
```

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                               |
| ---------------------------- | ------ | -------- | ---------------------------------- |
| 誤検出（False Positive）増加 | 中     | 中       | 信頼度スコアを低めに設定（0.7）    |
| 処理速度低下                 | 低     | 低       | 正規表現の最適化、ベンチマーク監視 |
| 人名以外の漢字列を人名と誤認 | 中     | 中       | 辞書ベースの除外リスト追加         |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                    | パス                                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------------------------- |
| CONV-06-04 タスク仕様書         | `docs/30-workflows/CONV-06-04-entity-extraction-ner/index.md`                                   |
| CONV-06-04 未タスク検出レポート | `docs/30-workflows/CONV-06-04-entity-extraction-ner/outputs/phase-12/unassigned-task-report.md` |
| Phase 11 手動テスト結果         | `docs/30-workflows/CONV-06-04-entity-extraction-ner/outputs/phase-11/`                          |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                     | パス                                                                                    | 内容                                     |
| ---------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------- |
| NERインターフェース仕様      | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-entity-extraction.md` | IEntityExtractor、RuleBasedExtractor仕様 |
| RAGアーキテクチャ            | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                 | NERサービス設計                          |
| エンティティタイプ（52種類） | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-entity-extraction.md` | EntityType定義、10カテゴリ分類           |

### 参考資料

| 資料                   | URL/備考                                      |
| ---------------------- | --------------------------------------------- |
| 日本語正規表現パターン | Unicode範囲: 一-龯（漢字）、ァ-ヶ（カタカナ） |
| 日本の法人形態         | 株式会社、有限会社、合同会社、一般社団法人 等 |

---

## 9. 備考

### CONV-06-04 手動テスト結果からの引用

```
### 4.2 RuleBasedExtractor の制限事項

手動テストで確認された RuleBasedExtractor の制限事項：

| 制限事項               | 対応方針               |
| ---------------------- | ---------------------- |
| 日本語人名の抽出       | LLM使用推奨            |
| 日本語組織名（辞書外） | LLM使用推奨            |
| カタカナ技術用語一部   | パターン追加で対応可能 |

**注記**: これらは設計上の想定内であり、LLMEntityExtractor使用時は問題なく抽出可能。
```

### 補足事項

- 優先度は「低」：LLMEntityExtractor使用時は影響なし
- フォールバック用途の品質向上が目的
- 形態素解析ライブラリ（kuromoji等）は導入せず、正規表現ベースで対応
- 誤検出を抑えるため、信頼度スコアは0.7（LLMの0.9より低く設定）
