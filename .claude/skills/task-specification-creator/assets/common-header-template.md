# 共通ヘッダーテンプレート

> **Progressive Disclosure**
> - 読み込みタイミング: Phase仕様書生成時（generate-task-specs Task実行時）
> - 読み込み条件: Phase仕様書のヘッダー部分を生成するとき
> - 使用スキーマ: schemas/phase-spec.json
> - 組み合わせ: common-footer-template.md, phase-spec-template.md

Phase仕様書の共通ヘッダー部分を定義する。

---

## 変数一覧

| 変数名 | 説明 | 例 |
| ------ | ---- | -- |
| `{{PHASE_NUMBER}}` | Phase番号（1-13） | `4` |
| `{{PHASE_NAME}}` | Phase名称 | `テスト作成` |
| `{{FEATURE_NAME}}` | 機能名（ケバブケース） | `search-replace-ui` |
| `{{CREATED_DATE}}` | 作成日（ISO形式） | `2026-01-06` |
| `{{PHASE_PURPOSE}}` | Phase目的（1-2文） | `期待される動作を検証するテストを...` |

---

## テンプレート

```markdown
# Phase {{PHASE_NUMBER}}: {{PHASE_NAME}}

## メタ情報

| 項目   | 値                 |
| ------ | ------------------ |
| Phase  | {{PHASE_NUMBER}}   |
| 機能名 | {{FEATURE_NAME}}   |
| 作成日 | {{CREATED_DATE}}   |

## 目的

{{PHASE_PURPOSE}}
<!-- このPhaseで達成すべき目的を1-2文で記述 -->
```

---

## 使用方法

1. Phase仕様書の先頭にこのテンプレートを展開
2. 変数を実際の値で置換
3. 目的セクションに具体的な内容を記述

---

## 注意事項

- `{{PHASE_PURPOSE}}` には具体的で測定可能な目的を記述すること
- 目的は「〜を行う」「〜を作成する」など、動詞で終わる形式を推奨
