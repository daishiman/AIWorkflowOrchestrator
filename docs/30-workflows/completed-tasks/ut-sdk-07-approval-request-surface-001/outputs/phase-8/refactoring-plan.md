# Phase 8 - リファクタリング計画

## 概要

UT-SDK-07-APPROVAL-REQUEST-SURFACE-001 Phase 8 リファクタリング判断と計画。

---

## リファクタリング判断: 不要

### 理由

| 観点             | 評価                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------- |
| コードシンプルさ | `onApprovalRequest` は `safeOn` ラッパー1行 + unsubscribe 返却のみ。十分シンプル         |
| 責務明確性       | preload 層: IPC 購読抽象化、UI 層: state 管理と ApprovalSheet 表示。責務が明確に分離済み |
| 命名一貫性       | `onDisclosureInfo` と同パターン（safeOn + callback + unsubscribe）で命名規則一致         |
| 型安全性         | `ApprovalRequest` 型を使用。`any` なし                                                   |
| 重複コード       | なし                                                                                     |

### 特記事項: `normalizeApprovalOperationType` の fallthrough

`normalizeApprovalOperationType` 関数の switch 文に fallthrough（default ケース）があるが、これは**意図的な設計**。

- default ケースで `'dangerous_operation'` を返すことで、未知の操作タイプに対して安全側（危険として扱う）にフォールバックする
- セキュリティ観点から意図的な設計であり、リファクタリング対象外

---

## Before / After 比較（リファクタリングなし）

| 項目         | Before | After | 変更理由 |
| ------------ | ------ | ----- | -------- |
| 変更ファイル | -      | -     | 変更なし |

**結論: リファクタリング実施なし。既存実装を維持。**

---

_作成日: 2026-04-06_
_Phase 8 完了確認_
