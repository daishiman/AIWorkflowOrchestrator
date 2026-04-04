# Phase 8: リファクタリング記録 (Refactoring Record)

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| タスクID | TASK-P0-09                             |
| Phase    | 8                                      |
| 機能名   | claude-sdk-permission-hooks-governance |
| 作成日   | 2026-03-31                             |

---

## 1. Policy テーブルの集約

### Before

Phase 別の policy 定義が個別のオブジェクトリテラルとして散在する可能性があった。

### After

`POLICY_TABLE` に全 4 phase の policy を集約し、`Object.freeze` で保護。

```typescript
const POLICY_TABLE: Readonly<
  Record<SkillCreatorGovernancePhase, SkillCreatorSdkPolicy>
> = Object.freeze({
  plan: { ... },
  execute: { ... },
  verify: { ... },
  improve: { ... },
});
```

### Reason

- 単一の定数マップにより、policy 追加・変更時のレビューが容易
- `Object.freeze` により実行時の改変を防止
- 全 phase の policy が一目で比較可能

---

## 2. Tool リスト定数の分離

### Before

各 phase の allowedTools / disallowedTools に直接文字列配列を書く方式。

### After

`READ_TOOLS`, `WRITE_TOOLS`, `IMPROVE_TOOLS`, `TEST_TOOLS`, `DESTRUCTIVE_TOOLS` として定数配列を分離。

```typescript
const READ_TOOLS = ["Read", "Glob", "Grep", "Bash", "Agent"] as const;
const DESTRUCTIVE_TOOLS = ["NotebookEdit"] as const;
```

### Reason

- tool リストの重複排除（Read, Glob, Grep, Bash, Agent は複数 phase で共通）
- `DESTRUCTIVE_TOOLS` の一元管理により、破壊的 tool の追加が 1 箇所で完結
- `as const` による readonly tuple 型で型安全性を確保

---

## 3. Hook Payload の統一

### Before

各 hook handler が個別に audit event を組み立てる方式（潜在的な重複リスク）。

### After

`auditSink.recordEvent()` convenience メソッドにより、構造化パラメータから統一的に audit event を生成・記録。

```typescript
auditSink.recordEvent({
  eventType: "pre_tool_use",
  sessionId,
  phase,
  toolName,
  decision,
});
```

### Reason

- timestamp 自動生成を `recordEvent()` に集約（各 hook が個別に `new Date()` しない）
- event 構造の一貫性を保証（必須フィールドの漏れ防止）
- テスト時の検証が容易（`recordEvent` の引数を検証するだけで十分）

---

## 4. Duplicate 検出結果

### 検出された重複

| 対象         | 状態     | 説明                                                        |
| ------------ | -------- | ----------------------------------------------------------- |
| policy 分岐  | 解消済み | POLICY_TABLE に集約。getPolicy() で 1 箇所から取得          |
| hook payload | 解消済み | recordEvent() に統一。各 hook が個別に event を組み立てない |
| tool リスト  | 解消済み | READ_TOOLS / DESTRUCTIVE_TOOLS 等の定数で共通部分を一元管理 |

### 検出されなかった重複

- canUseTool のロジック重複: なし（evaluateContextPolicy は PermissionPolicy 内に閉じている）
- HooksFactory と PermissionPolicy の責務重複: なし（HooksFactory は canUseTool を呼び出すのみ）
- AuditSink と IPC handler の責務重複: なし（handler は AuditSink から read するだけ）

---

## 5. governance/ モジュール構成

### エクスポート構造

```
governance/
  index.ts          ← バレルエクスポート
  SkillCreatorPermissionPolicy.ts  ← policy 判定
  SkillCreatorHooksFactory.ts      ← hooks 生成
  SkillCreatorAuditSink.ts         ← audit 記録
```

### index.ts によるクリーンインポート

```typescript
// governance/index.ts
export {
  getPolicy,
  canUseTool,
  getAllPolicies,
} from "./SkillCreatorPermissionPolicy";
export { SkillCreatorAuditSink } from "./SkillCreatorAuditSink";
export { createHooks } from "./SkillCreatorHooksFactory";
export type { SkillCreatorHooks } from "./SkillCreatorHooksFactory";
```

利用側は `from "./governance"` で必要なものだけインポート可能。

---

## 6. Before / After / Reason サマリ

| 対象           | Before                           | After                                  | Reason                      |
| -------------- | -------------------------------- | -------------------------------------- | --------------------------- |
| policy 定義    | 個別オブジェクトリテラル（潜在） | POLICY_TABLE + Object.freeze           | 一元管理 + 実行時改変防止   |
| tool リスト    | 各 phase にインライン配列        | 定数配列 (READ_TOOLS 等)               | 重複排除 + 変更箇所の集約   |
| hook payload   | 各 hook で個別に event 組み立て  | recordEvent() convenience メソッド     | timestamp 統一 + 構造一貫性 |
| モジュール構成 | ファイル直接参照                 | governance/index.ts バレルエクスポート | クリーンインポート          |

---

## 7. 再検証結果

| 確認項目                                  | 結果     |
| ----------------------------------------- | -------- |
| refactor 後に全 64 governance テスト PASS | 確認済み |
| policy 判定ロジックが変わっていない       | 確認済み |
| hook 実行順が変わっていない               | 確認済み |
| audit sink の挙動が変わっていない         | 確認済み |
| 既存テストの回帰なし                      | 確認済み |

---

## 8. 完了チェック

- [x] POLICY_TABLE に policy が集約されている
- [x] tool リスト定数が分離されている
- [x] recordEvent() による hook payload 統一が確認されている
- [x] duplicate policy ロジックが検出・解消されている
- [x] governance/ module exports が index.ts で整備されている
- [x] refactor 後の全テスト PASS が確認されている
