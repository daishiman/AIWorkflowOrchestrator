# Phase {{PHASE_NUMBER}}: {{PHASE_NAME}} - タスク仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | {{PHASE_NUMBER}}     |
| Phase名    | {{PHASE_NAME}}       |
| 前提Phase  | Phase {{PREV_PHASE}} |
| 後続Phase  | Phase {{NEXT_PHASE}} |
| ステータス | 未実施               |
| 作成日     | {{CREATED_DATE}}     |
| 機能名     | {{FEATURE_NAME}}     |

---

## 目的

{{PHASE_PURPOSE}}

## 背景

{{PHASE_BACKGROUND}}

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

{{#each SKILLS}}

### スキル{{@index}}: {{name}}

**パス**: `.claude/skills/{{name}}/SKILL.md`

**Trigger条件**:
{{trigger}}

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:
{{#each outputs}}

- {{this}}
  {{/each}}

---

{{/each}}

## 参照資料

| 参照資料 | パス | 内容 |
| -------- | ---- | ---- |

{{#each REFERENCES}}
| {{name}} | {{path}} | {{description}} |
{{/each}}

---

## 成果物

| 成果物 | パス | 内容 |
| ------ | ---- | ---- |

{{#each OUTPUTS}}
| {{name}} | {{path}} | {{description}} |
{{/each}}

---

## 完了条件

{{#each COMPLETION_CRITERIA}}

- [ ] {{this}}
      {{/each}}

---

## 依存関係

- **前提**: Phase {{PREV_PHASE}} が完了していること
- **後続**: Phase {{NEXT_PHASE}} へ進む

---

## レビューゲート（Phase 3, 8 の場合）

{{#if IS_REVIEW_GATE}}

### レビュー結果判定

| 判定     | 条件                     | 次のアクション            |
| -------- | ------------------------ | ------------------------- |
| PASS     | 全レビュー観点で問題なし | 次のPhaseへ進行           |
| MINOR    | 軽微な指摘あり           | 指摘対応後、次のPhaseへ   |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて戻る      |
| CRITICAL | 致命的な問題あり         | Phase 1へ戻りユーザー確認 |

### 戻り先決定基準

| 問題の種類       | 戻り先                |
| ---------------- | --------------------- |
| 要件の問題       | Phase 1（要件定義）   |
| 設計の問題       | Phase 2（設計）       |
| テスト設計の問題 | Phase 4（テスト）     |
| 実装の問題       | Phase 5（実装）       |
| 品質の問題       | Phase 6（リファクタ） |

{{/if}}

---

## TDD検証（Phase 4, 5, 6 の場合）

{{#if IS_TDD_PHASE}}

### TDD サイクル確認

```bash
# テスト実行コマンド
{{TDD_TEST_COMMAND}}
```

**確認項目**:
{{#if IS_RED}}

- [ ] テストが失敗することを確認（Red状態）
      {{/if}}
      {{#if IS_GREEN}}
- [ ] テストが成功することを確認（Green状態）
      {{/if}}
      {{#if IS_REFACTOR}}
- [ ] リファクタリング後もテストが成功することを確認
      {{/if}}
      {{/if}}

---

## 品質ゲート（Phase 7 の場合）

{{#if IS_QUALITY_GATE}}

### 品質チェックリスト

#### 機能検証

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功
- [ ] 全E2Eテスト成功

#### コード品質

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み

#### テスト網羅性

- [ ] カバレッジ基準達成

#### セキュリティ

- [ ] 脆弱性スキャン完了
- [ ] 重大な脆弱性なし
      {{/if}}

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase {{PHASE_NUMBER}} 実行記録

### 使用スキル

{{#each SKILLS}}

- {{name}}: {{result}}
  {{/each}}

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

`docs/30-workflows/{{FEATURE_NAME}}/phase-{{NEXT_PHASE}}-*.md`
