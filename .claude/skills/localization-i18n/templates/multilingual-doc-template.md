# 多言語ドキュメントテンプレート

## 使用方法

このテンプレートを使用して、多言語対応ドキュメントの
構造を設計・文書化します。

---

# {{project_name}} 多言語ドキュメント仕様

**作成日**: {{creation_date}}
**更新日**: {{last_updated}}
**ソース言語**: {{source_language}}
**対象言語**: {{target_languages}}

---

## 1. 言語構成

### サポート言語

| 言語コード      | 言語名          | 状態         | 完成度            |
| --------------- | --------------- | ------------ | ----------------- |
| {{lang_code_1}} | {{lang_name_1}} | {{status_1}} | {{completion_1}}% |
| {{lang_code_2}} | {{lang_name_2}} | {{status_2}} | {{completion_2}}% |
| {{lang_code_3}} | {{lang_name_3}} | {{status_3}} | {{completion_3}}% |

### 言語優先度

```
優先度1（必須）: {{priority_1_languages}}
優先度2（重要）: {{priority_2_languages}}
優先度3（推奨）: {{priority_3_languages}}
```

---

## 2. ディレクトリ構造

```
docs/
├── {{source_lang}}/              ← ソース言語
│   ├── {{section_1}}/
│   │   ├── {{page_1}}.md
│   │   └── {{page_2}}.md
│   └── {{section_2}}/
│       └── {{page_3}}.md
│
├── {{target_lang_1}}/            ← 翻訳言語1
│   └── [同じ構造]
│
├── {{target_lang_2}}/            ← 翻訳言語2
│   └── [同じ構造]
│
├── _shared/                      ← 言語共通
│   ├── images/
│   ├── diagrams/
│   └── code-samples/
│
└── _meta/                        ← メタ情報
    ├── glossary.yaml
    ├── style-guide.md
    └── translation-status.json
```

---

## 3. ファイル命名規約

### ドキュメントファイル

```
{lang_code}/{section}/{page-name}.md

例:
ja/getting-started/quickstart.md
en/getting-started/quickstart.md
zh-Hans/getting-started/quickstart.md
```

### 共有リソース

```
_shared/{type}/{resource-name}.{ext}

例:
_shared/images/architecture-diagram.svg
_shared/code-samples/auth-example.js
```

---

## 4. フロントマター仕様

### 必須フィールド

```yaml
---
title: "{{page_title}}"
description: "{{page_description}}"
lang: "{{language_code}}"
original_lang: "{{source_language}}"
translation_status: "{{status}}" # draft | review | published
last_translated: "{{date}}"
translator: "{{translator_name}}"
---
```

### オプションフィールド

```yaml
---
# 翻訳管理
translation_id: "{{unique_id}}"
source_version: "{{source_commit_hash}}"
needs_update: { { boolean } }

# SEO
keywords:
  - { { keyword_1 } }
  - { { keyword_2 } }

# ナビゲーション
sidebar_position: { { number } }
---
```

---

## 5. 用語集（Glossary）

### 形式

```yaml
# _meta/glossary.yaml
terms:
  - id: "{{term_id}}"
    source: "{{source_term}}"
    translations:
      { { lang_1 } }: "{{translation_1}}"
      { { lang_2 } }: "{{translation_2}}"
    definition: "{{definition}}"
    context: "{{usage_context}}"
    notes: "{{translator_notes}}"
    do_not_translate: { { boolean } }
```

### 例

```yaml
terms:
  - id: "settings"
    source: "設定"
    translations:
      en: "Settings"
      zh-Hans: "设置"
      ko: "설정"
    definition: "アプリケーションの動作を制御するパラメータ"
    context: "UI要素、メニュー項目として使用"
    notes: "Configurationとは区別する"
```

---

## 6. スタイルガイド

### 言語別スタイル

| 項目       | {{lang_1}}      | {{lang_2}}      | {{lang_3}}      |
| ---------- | --------------- | --------------- | --------------- |
| 敬語レベル | {{formality_1}} | {{formality_2}} | {{formality_3}} |
| 文末表現   | {{ending_1}}    | {{ending_2}}    | {{ending_3}}    |
| 数字表記   | {{number_1}}    | {{number_2}}    | {{number_3}}    |
| 日付形式   | {{date_1}}      | {{date_2}}      | {{date_3}}      |

### 共通ルール

- **ボタン・メニュー表記**: `[ボタン名]`
- **パス表記**: `「設定 > 一般 > 言語」`
- **キーボードショートカット**: `Ctrl+S`（または`⌘S`）
- **変数表記**: `{variable_name}`

---

## 7. 翻訳ワークフロー

### ステータス定義

| ステータス  | 説明       | 次のステップ   |
| ----------- | ---------- | -------------- |
| `pending`   | 翻訳待ち   | 翻訳開始       |
| `draft`     | 翻訳中     | レビュー依頼   |
| `review`    | レビュー中 | 修正または承認 |
| `published` | 公開済み   | 更新監視       |
| `outdated`  | 要更新     | 差分翻訳       |

### ワークフロー図

```
[ソース更新]
     ↓
[翻訳必要性判定]
     ↓
  pending
     ↓
[翻訳者アサイン]
     ↓
   draft
     ↓
[翻訳完了]
     ↓
   review
     ↓
[レビュー承認] ──→ [要修正] ──→ draft
     ↓
 published
     ↓
[ソース更新検知]
     ↓
  outdated
```

---

## 8. 品質管理

### チェック項目

```markdown
## 翻訳前チェック

- [ ] ソースが翻訳準備完了か確認
- [ ] 用語集を確認
- [ ] コンテキスト情報を確認

## 翻訳中チェック

- [ ] 用語の一貫性
- [ ] 敬語レベルの統一
- [ ] プレースホルダーの保持

## 翻訳後チェック

- [ ] スペルチェック
- [ ] 文法チェック
- [ ] フォーマット確認
- [ ] リンク確認
- [ ] 画像alt属性確認
```

### 品質指標

| 指標           | 目標 | 測定方法              |
| -------------- | ---- | --------------------- |
| 用語一貫性     | 100% | 用語集との照合        |
| 翻訳カバレッジ | ≥95% | 未翻訳文字列比率      |
| レビュー完了率 | 100% | レビュー済み/翻訳済み |

---

## 9. 更新管理

### 差分検出

```yaml
# translation-status.json
{
  "ja/getting-started/quickstart.md":
    {
      "source_hash": "abc123",
      "translated_hash": "def456",
      "status": "published",
      "last_sync": "2024-01-15",
    },
}
```

### 更新トリガー

- ソースファイルの変更
- 用語集の更新
- スタイルガイドの変更
- 定期レビュー（{{review_interval}}）

---

## 10. ツール設定

### 翻訳管理システム

```yaml
# 例: Crowdin設定
crowdin:
  project_id: "{{project_id}}"
  source_language: "{{source_lang}}"
  target_languages:
    - "{{target_lang_1}}"
    - "{{target_lang_2}}"
  files:
    - source: "/docs/{{source_lang}}/**/*.md"
      translation: "/docs/%locale%/**/%original_file_name%"
```

### CI/CD統合

```yaml
# 翻訳同期ジョブ
translation-sync:
  triggers:
    - push to main
    - schedule: "0 0 * * *"
  steps:
    - check-source-changes
    - sync-to-tms
    - pull-translations
    - validate-translations
    - create-pr
```

---

## 11. 連絡先

| 役割             | 担当者            | 連絡先                    |
| ---------------- | ----------------- | ------------------------- |
| プロジェクト管理 | {{pm_name}}       | {{pm_contact}}            |
| {{lang_1}}翻訳   | {{translator_1}}  | {{translator_1_contact}}  |
| {{lang_2}}翻訳   | {{translator_2}}  | {{translator_2_contact}}  |
| 技術レビュー     | {{tech_reviewer}} | {{tech_reviewer_contact}} |

---

## 12. 更新履歴

| 日付       | バージョン    | 変更内容     | 担当者       |
| ---------- | ------------- | ------------ | ------------ |
| {{date_1}} | {{version_1}} | {{change_1}} | {{author_1}} |
| {{date_2}} | {{version_2}} | {{change_2}} | {{author_2}} |

---

_ドキュメントID: {{doc_id}}_
_テンプレートバージョン: 1.0.0_
