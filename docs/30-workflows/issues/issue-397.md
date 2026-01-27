# [#397] [UT-002] UI統合後の手動テスト実施

## メタ情報

```yaml
issue_number: 397
title: [UT-002] UI統合後の手動テスト実施
state: OPEN
priority: 中
scale: -
category: -
status: -
created_date: 2026-01-21
updated_date: 2026-01-21
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/397
dependencies: []
```

| 項目       | 内容 |
| ---------- | ---- |
| 優先度     | 中   |
| 規模       | -    |
| ステータス | -    |

---

## 概要

UI統合後のチャット履歴機能について、実際のElectronアプリ上で手動テストを実施し、機能・UX・アクセシビリティを検証する。

## タスク情報

| 項目         | 内容                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| タスクID     | UT-002                                                                 |
| 優先度       | 中                                                                     |
| 見積もり規模 | 中規模                                                                 |
| 依存タスク   | ARCH-001 (完了), UT-005, UT-006, UI統合タスク                          |
| ステータス   | 待機中（UI統合完了待ち）                                               |
| 仕様書       | `docs/30-workflows/unassigned-task/task-ui-integration-manual-test.md` |

## 成果物

- `manual-test-result.md`
- `discovered-issues.md`
- `accessibility-report.md`

## 完了条件

### 機能要件

- [ ] 全機能テストケース（TC-001〜TC-011）がPASS
- [ ] 全エラーテストケース（TC-101〜TC-106）がPASS

### 品質要件

- [ ] アクセシビリティテストがPASS（WCAG 2.1 AA）
- [ ] 重大なUIバグなし

### ドキュメント要件

- [ ] manual-test-result.mdが作成されている
- [ ] discovered-issues.mdが作成されている
- [ ] accessibility-report.mdが作成されている

## テスト範囲

### 機能テスト（正常系）

- セッションCRUD操作
- タイトル編集
- ピン留め/解除
- 検索機能
- エクスポート（Markdown/JSON）

### エラーテスト（異常系）

- バリデーションエラー
- 上限エラー
- ネットワークエラー

### アクセシビリティテスト

- キーボードナビゲーション
- スクリーンリーダー互換性
- 色コントラスト

## 関連

- 依存タスク: UT-005, UT-006, UI統合タスク
- 関連タスク: ARCH-001 Clean Architecture Refactoring
- 関連タスク: UT-003 E2Eテスト

---

📋 Generated from task specification
