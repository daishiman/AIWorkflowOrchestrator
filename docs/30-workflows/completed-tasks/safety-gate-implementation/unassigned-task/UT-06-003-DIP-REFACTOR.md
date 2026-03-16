# UT-06-003-DIP-REFACTOR: DIP 準拠リファクタリング

## メタ情報

| 項目       | 値                                             |
| ---------- | ---------------------------------------------- |
| タスクID   | UT-06-003-DIP-REFACTOR                         |
| タスク名   | DIP 準拠リファクタリング + unregister 関数追加 |
| 発見元     | UT-06-003 Phase 12                             |
| 優先度     | 中（priority:medium）                          |
| 分類       | リファクタリング                               |
| ステータス | 未実施                                         |
| 作成日     | 2026-03-16                                     |

## 関連タスク

| タスクID  | 関係性                             | ステータス |
| --------- | ---------------------------------- | ---------- |
| UT-06-003 | 親タスク（DefaultSafetyGate 実装） | 完了       |

## 目的

UT-06-003 の実装で以下の技術的負債が残存している。本タスクではこれらを解消し、コード品質を向上させる。

1. ~~`registerSafetyGateHandlers` の引数が `DefaultSafetyGate`（具象クラス）を直接受け取っており、DIP（依存性逆転原則）に違反~~ → **解決済み**（Phase 12 監査時に修正。引数型を `SafetyGatePort` に変更済み）
2. ~~`safetyGateHandlers.ts` 内に `as` キャストによる型安全性の偽装が存在（P49 違反）~~ → **解決済み**（Phase 12 監査時に `in` 演算子 + `typeof` による実行時検証に置換済み）
3. `unregisterSafetyGateHandlers` 解除関数が未実装（P5 リスナー二重登録リスク） → **未解決**

## スコープ

### スコープ内

- `registerSafetyGateHandlers` の引数型を `DefaultSafetyGate` → `SafetyGatePort` に変更（DIP 準拠）
- `safetyGateHandlers.ts` の `as` キャストを `in` 演算子による実行時検証に置換（P49 準拠）
- `unregisterSafetyGateHandlers()` 解除関数の追加（P5 対策）
- `ipc/index.ts` の `unregisterAllIpcHandlers` に SafetyGate 解除を統合
- 既存テストの修正

### スコープ外

- DefaultSafetyGate の評価ロジック変更
- 新規 IPC チャンネルの追加

## 受入基準

- [ ] `registerSafetyGateHandlers` の引数型が `SafetyGatePort` インターフェースである
- [ ] `as` キャストが除去され、`in` 演算子 + `typeof` による実行時検証に置換されている
- [ ] `unregisterSafetyGateHandlers()` 関数が実装されている
- [ ] `unregisterAllIpcHandlers` から `unregisterSafetyGateHandlers` が呼び出される
- [ ] 既存テストが全て PASS すること
- [ ] 型チェックが通ること
- [ ] Lint が通ること

## 技術詳細

### 1. DIP 準拠（引数型変更）

```typescript
// 現状（DIP 違反）
export function registerSafetyGateHandlers(safetyGate: DefaultSafetyGate): void;

// 修正後（DIP 準拠）
export function registerSafetyGateHandlers(safetyGate: SafetyGatePort): void;
```

### 2. P49 準拠（as キャスト除去）

```typescript
// 現状（P49 違反）
const result = args as SafetyGateResult;

// 修正後（P49 準拠）
if (args != null && typeof args === "object" && "overallGrade" in args) {
  // 安全にアクセス
}
```

### 3. P5 対策（unregister 関数追加）

```typescript
export function unregisterSafetyGateHandlers(): void {
  ipcMain.removeHandler("skill:evaluate-safety");
}
```

## 参照資料

| 資料名                 | パス                                                       |
| ---------------------- | ---------------------------------------------------------- |
| IPC ハンドラ実装       | `apps/desktop/src/main/ipc/handlers/safety-gate.ts`        |
| DefaultSafetyGate 実装 | `apps/desktop/src/main/permissions/default-safety-gate.ts` |
| P5 既知の落とし穴      | `.claude/rules/06-known-pitfalls.md#P5`                    |
| P49 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md#P49`                   |
