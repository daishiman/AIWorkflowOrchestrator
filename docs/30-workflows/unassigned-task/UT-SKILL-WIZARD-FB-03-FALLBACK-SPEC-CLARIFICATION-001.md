# UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001: フォールバック仕様内のフィールド独立推論性の明示

## メタ情報

| 項目         | 値                                                                        |
| ------------ | ------------------------------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001                     |
| issue_number | 2032                                                                      |
| 検出元       | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 Phase 4〜11 フィードバック |
| 優先度       | MEDIUM                                                                    |
| 影響         | テスト期待値の矛盾→false green、仕様書内の揺れで開発者が混乱              |
| 検出日       | 2026-04-07                                                                |

## 概要

AC-4「推論不能時のフォールバック」において、`purpose` が空でも `category` が有効な場合に `format` を推論するか否かが仕様書内で一度揺れた。フック改変が引き金となり、テスト#27の期待値が一時的にテスト#17と矛盾した。フィールド間の独立推論性を明示することで、将来の仕様揺れを防止する。

## 現状

```typescript
// 現在の実装（正しい）: purpose と category は完全独立
if (input.purpose) {
  // purpose から format を推論
}
if (input.category) {
  // category から tools を推論（purpose に依存しない）
}
```

各フィールドの独立推論性は実装上正しく動作しているが、仕様書（AC-4定義）およびタスク仕様書テンプレートにその旨が明文化されていない。そのため、フック等の外部要因でテスト入力値が変更された際に、フィールド間依存関係の有無が不明確なまま誤った期待値が設定されるリスクがある。

## 期待される修正

```markdown
## AC-4: フォールバック仕様（推論不能時の挙動）

各フィールドは**完全独立**に推論される。あるフィールドが空・不明でも
他フィールドの推論には影響しない。

| フィールド | 推論依存元       | purpose空の場合 |
| ---------- | ---------------- | --------------- |
| category   | purpose          | null を返す     |
| tools      | category         | null を返す     |
| format     | purpose/category | null を返す     |
| timing     | purpose          | null を返す     |
```

task-specification-creator スキルのAC-4テンプレートにこの表を組み込み、フィールド独立性を規約として固定する。

## 完了条件

- [ ] 各フィールドの独立推論性が task-specification-creator スキルテンプレートのAC-4定義に明示されている
- [ ] フォールバック仕様書テンプレートに「フィールド間独立性」の記述が追加されている
- [ ] 同様の仕様揺れを検出するテストケース（purpose空でもcategory有効ケース）が追加されている

## 苦戦箇所記録

フックが自動的にテストの入力値を変更したため、purposeが空でもformatが推論されるというテストケースが一時的に作られた。元の仕様（purpose空→format null）との矛盾を手動で発見するまで数回のテスト実行が必要だった。

## 関連

- 検出タスク: UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001
- 関連フィードバック: FB-03（Phase 12 skill-feedback-report.md）
