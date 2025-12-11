# ドメイン用語集テンプレート

> このテンプレートを使用して、プロジェクトのドメイン用語集を作成してください。
> `{{placeholder}}` を実際の値に置き換えてください。

---

# {{ProjectName}} ドメイン用語集

## 概要

このドキュメントは、{{ProjectName}} プロジェクトで使用されるドメイン用語を定義します。
チーム全員がこの用語集に従い、コード、ドキュメント、会話で一貫した用語を使用してください。

**最終更新**: {{LastUpdatedDate}}
**バージョン**: {{Version}}
**責任者**: {{Owner}}

## 用語集の使い方

1. 新しい概念を導入する前に、この用語集を確認してください
2. 用語集にない概念は、追加提案してください
3. コードの命名は用語集の「コード対応」に従ってください
4. 非推奨用語は使用しないでください

---

## コンテキスト: {{ContextName1}}

### {{Term1}}

| 項目           | 内容             |
| -------------- | ---------------- |
| **用語**       | {{Term1}}        |
| **英語**       | {{EnglishTerm1}} |
| **定義**       | {{Definition1}}  |
| **コード対応** | `{{ClassName1}}` |
| **ファイル**   | `{{FilePath1}}`  |

**関連用語**: {{RelatedTerm1a}}, {{RelatedTerm1b}}

**使用例**:

- 「{{UsageExample1a}}」
- 「{{UsageExample1b}}」

**非推奨表現**:

- ~~{{DeprecatedTerm1}}~~ → {{Term1}} を使用

---

### {{Term2}}

| 項目           | 内容             |
| -------------- | ---------------- |
| **用語**       | {{Term2}}        |
| **英語**       | {{EnglishTerm2}} |
| **定義**       | {{Definition2}}  |
| **コード対応** | `{{ClassName2}}` |
| **ファイル**   | `{{FilePath2}}`  |

**状態遷移** (該当する場合):

```
{{State2a}} → {{State2b}} → {{State2c}} → {{State2d}}
                  ↓
              {{State2e}}
```

**関連用語**: {{RelatedTerm2a}}, {{RelatedTerm2b}}

**使用例**:

- 「{{UsageExample2a}}」
- 「{{UsageExample2b}}」

---

## コンテキスト: {{ContextName2}}

### {{Term3}}

| 項目           | 内容             |
| -------------- | ---------------- |
| **用語**       | {{Term3}}        |
| **英語**       | {{EnglishTerm3}} |
| **定義**       | {{Definition3}}  |
| **コード対応** | `{{ClassName3}}` |
| **ファイル**   | `{{FilePath3}}`  |

**注意**: このコンテキストでの「{{Term3}}」は、{{ContextName1}} コンテキストの「{{Term3InOtherContext}}」とは異なる概念です。

---

## 操作・動詞

### 状態変更操作

| 日本語    | 英語             | メソッド名          | 説明                 |
| --------- | ---------------- | ------------------- | -------------------- |
| {{Verb1}} | {{EnglishVerb1}} | `{{MethodName1}}()` | {{VerbDescription1}} |
| {{Verb2}} | {{EnglishVerb2}} | `{{MethodName2}}()` | {{VerbDescription2}} |
| {{Verb3}} | {{EnglishVerb3}} | `{{MethodName3}}()` | {{VerbDescription3}} |

### クエリ操作

| 日本語         | 英語                  | メソッド名               | 説明                  |
| -------------- | --------------------- | ------------------------ | --------------------- |
| {{QueryVerb1}} | {{EnglishQueryVerb1}} | `{{QueryMethodName1}}()` | {{QueryDescription1}} |
| {{QueryVerb2}} | {{EnglishQueryVerb2}} | `{{QueryMethodName2}}()` | {{QueryDescription2}} |

---

## ステータス・状態

### {{StatusCategory1}}

| 値                  | 日本語               | 説明                    |
| ------------------- | -------------------- | ----------------------- |
| `{{StatusValue1a}}` | {{StatusJapanese1a}} | {{StatusDescription1a}} |
| `{{StatusValue1b}}` | {{StatusJapanese1b}} | {{StatusDescription1b}} |
| `{{StatusValue1c}}` | {{StatusJapanese1c}} | {{StatusDescription1c}} |

---

## コンテキストマップ

異なるコンテキスト間での用語の対応関係:

| {{ContextName1}}  | {{ContextName2}}  | 備考                  |
| ----------------- | ----------------- | --------------------- |
| {{Context1Term1}} | {{Context2Term1}} | {{MappingNote1}}      |
| {{Context1Term2}} | -                 | {{ContextName1}} 固有 |
| -                 | {{Context2Term2}} | {{ContextName2}} 固有 |

---

## 非推奨用語一覧

以下の用語は使用しないでください:

| 非推奨              | 推奨             | 理由                   |
| ------------------- | ---------------- | ---------------------- |
| ~~{{Deprecated1}}~~ | {{Recommended1}} | {{DeprecationReason1}} |
| ~~{{Deprecated2}}~~ | {{Recommended2}} | {{DeprecationReason2}} |

---

## 変更履歴

| 日付            | バージョン         | 変更内容               | 担当者            |
| --------------- | ------------------ | ---------------------- | ----------------- |
| {{ChangeDate1}} | {{ChangeVersion1}} | {{ChangeDescription1}} | {{ChangeAuthor1}} |
| {{ChangeDate2}} | {{ChangeVersion2}} | {{ChangeDescription2}} | {{ChangeAuthor2}} |

---

## 付録: JSON形式

機械可読形式のドメイン用語集:

```json
{
  "projectName": "{{ProjectName}}",
  "version": "{{Version}}",
  "lastUpdated": "{{LastUpdatedDate}}",
  "contexts": [
    {
      "name": "{{ContextName1}}",
      "terms": [
        {
          "term": "{{Term1}}",
          "englishTerm": "{{EnglishTerm1}}",
          "definition": "{{Definition1}}",
          "codeMapping": {
            "className": "{{ClassName1}}",
            "filePath": "{{FilePath1}}"
          },
          "relatedTerms": ["{{RelatedTerm1a}}", "{{RelatedTerm1b}}"],
          "examples": ["{{UsageExample1a}}", "{{UsageExample1b}}"],
          "deprecated": ["{{DeprecatedTerm1}}"]
        }
      ]
    }
  ],
  "verbs": [
    {
      "japanese": "{{Verb1}}",
      "english": "{{EnglishVerb1}}",
      "methodName": "{{MethodName1}}",
      "description": "{{VerbDescription1}}"
    }
  ],
  "statuses": {
    "{{StatusCategory1}}": [
      {
        "value": "{{StatusValue1a}}",
        "japanese": "{{StatusJapanese1a}}",
        "description": "{{StatusDescription1a}}"
      }
    ]
  }
}
```

---

## 使用例

### 実際のプロジェクトでの記入例

```markdown
## コンテキスト: 販売

### 注文

| 項目           | 内容                                                     |
| -------------- | -------------------------------------------------------- |
| **用語**       | 注文                                                     |
| **英語**       | Order                                                    |
| **定義**       | 顧客が商品を購入する意思表示。一つ以上の注文明細を含む。 |
| **コード対応** | `Order`                                                  |
| **ファイル**   | `src/sales/domain/Order.ts`                              |

**関連用語**: 顧客, 注文明細, 配送

**使用例**:

- 「顧客が注文を確定した」
- 「注文の承認待ちです」

**非推奨表現**:

- ~~オーダー~~ → 注文 を使用
- ~~購入~~ → 注文 を使用（「購入」は行為、「注文」はエンティティ）
```

---

**テンプレート終了**

このテンプレートを基に、プロジェクト固有のドメイン用語集を作成してください。
