# Phase 10: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 10                     |
| Phase名    | ドキュメント更新       |
| 前提Phase  | Phase 9                |
| 後続Phase  | Phase 11               |
| ステータス | 未実施                 |
| 作成日     | 2026-01-04             |
| 機能名     | チャット履歴永続化機能 |

---

## 目的

新機能に関するドキュメントを更新し、ユーザーや開発者が利用できる状態にする。

## 背景

実装が完了しても、ドキュメントがなければユーザーは機能を使えず、開発者は保守できない。ドキュメントは製品の一部。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: api-documentation-best-practices

**パス**: `.claude/skills/api-documentation-best-practices/SKILL.md`

**Trigger条件**:
API仕様ドキュメントの作成が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- API仕様書

---

### スキル2: user-centric-writing

**パス**: `.claude/skills/user-centric-writing/SKILL.md`

**Trigger条件**:
ユーザー向けドキュメントの作成が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- ユーザーガイド

---

### スキル3: tutorial-design

**パス**: `.claude/skills/tutorial-design/SKILL.md`

**Trigger条件**:
チュートリアル形式のドキュメントが必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- 使い方チュートリアル

---

## 参照資料

| 参照資料 | パス                                                                       | 内容     |
| -------- | -------------------------------------------------------------------------- | -------- |
| 要件定義 | `docs/30-workflows/chat-history-persistence/outputs/phase-1/`              | 機能仕様 |
| API設計  | `docs/30-workflows/chat-history-persistence/outputs/phase-2/api-design.md` | API仕様  |

### システム仕様（aiworkflow-requirements）

> 仕様変更がある場合は、システム仕様ドキュメントも更新してください。

| 参照資料     | パス                                                             | 内容             |
| ------------ | ---------------------------------------------------------------- | ---------------- |
| チャット仕様 | `.claude/skills/aiworkflow-requirements/references/chat-spec.md` | チャット機能仕様 |

---

## 成果物

| 成果物         | パス                              | 内容             |
| -------------- | --------------------------------- | ---------------- |
| ユーザーガイド | `docs/10-guides/chat-history.md`  | 使い方ガイド     |
| API仕様書      | `docs/20-api/chat-history-api.md` | API仕様          |
| 変更履歴       | `CHANGELOG.md`                    | 変更履歴への追記 |

---

## 完了条件

- [ ] ユーザーガイドが作成されている
- [ ] API仕様書が作成されている
- [ ] CHANGELOGが更新されている
- [ ] システム仕様への反映が完了している（必要な場合）

---

## 依存関係

- **前提**: Phase 9 が完了していること
- **後続**: Phase 11 へ進む

---

## ドキュメント更新チェックリスト

### ユーザー向けドキュメント

- [ ] 機能概要が記載されている
- [ ] 使い方が手順形式で記載されている
- [ ] スクリーンショット/図が含まれている
- [ ] FAQが含まれている

### 開発者向けドキュメント

- [ ] API仕様が記載されている
- [ ] データモデルが記載されている
- [ ] 設定方法が記載されている

### プロジェクトドキュメント

- [ ] CHANGELOGが更新されている
- [ ] READMEが更新されている（必要な場合）

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 10 実行記録

### 使用スキル

- api-documentation-best-practices: {{result}}
- user-centric-writing: {{result}}
- tutorial-design: {{result}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/chat-history-persistence/phase-11-pr.md`
