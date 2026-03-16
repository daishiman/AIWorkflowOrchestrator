# UT-06-003-DIP-REFACTOR SafetyGateハンドラ unregister関数追加（P5対策） - タスク指示書

## メタ情報

```yaml
issue_number: 1288
```

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| タスクID     | UT-06-003-DIP-REFACTOR                          |
| タスク名     | SafetyGateハンドラ unregister関数追加（P5対策） |
| 分類         | リファクタリング                                |
| 対象機能     | SafetyGate IPC Handler                          |
| 優先度       | 中                                              |
| 見積もり規模 | 小規模                                          |
| ステータス   | 未実施                                          |
| 発見元       | UT-06-003 Phase 12                              |
| 発見日       | 2026-03-17                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-06-003 で実装した `registerSafetyGateHandlers` は、引数型がすでに `SafetyGatePort`（インターフェース）を使用しており、DIP 準拠は完了している（`apps/desktop/src/main/ipc/safetyGateHandlers.ts` L3-8 参照）。

しかし `unregisterSafetyGateHandlers` 関数が未実装のままとなっている。他の IPC ハンドラグループ（`registerAuthKeyHandlers` / `unregisterAuthKeyHandlers` 等）は登録・解除が対になっているが、SafetyGate だけがその対応から漏れている。

### 1.2 問題点・課題

1. `unregisterSafetyGateHandlers` 関数が存在せず、`ipcMain.handle` を解除する手段がない
2. macOS の `activate` イベント等でハンドラ再登録を行う際に、SafetyGate ハンドラが二重登録されて例外が発生するリスクがある（P5 パターン）
3. `unregisterAllIpcHandlers()` の呼び出しチェーンに SafetyGate の解除が含まれていない

### 1.3 放置した場合の影響

- macOS で Dock アイコンクリックによるウィンドウ再生成時に SafetyGate の IPC ハンドラが二重登録され、`Error: Attempted to register a second handler for 'skill:evaluate-safety'` が発生する（P5 再発）
- 他のハンドラグループとの整合性が取れず、コードレビューで指摘される

---

## 2. 何を達成するか（What）

### 2.1 目的

`registerSafetyGateHandlers` に対応する `unregisterSafetyGateHandlers` を追加し、`unregisterAllIpcHandlers()` に統合する。

### 2.2 最終ゴール

- `unregisterSafetyGateHandlers()` 関数が実装されている
- `unregisterAllIpcHandlers()` の呼び出しチェーンに SafetyGate の解除が含まれている
- 登録 → 解除 → 再登録の順で例外が発生しないことがテストで検証されている

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/main/ipc/safetyGateHandlers.ts` への `unregisterSafetyGateHandlers()` 追加
- `apps/desktop/src/main/ipc/index.ts` の `unregisterAllIpcHandlers()` への統合
- `apps/desktop/src/main/ipc/__tests__/safetyGateHandlers.test.ts` への unregister テスト追加

#### 含まないもの

- 引数型の変更（`SafetyGatePort` 使用済みのため不要）
- `DefaultSafetyGate` 本体の変更
- SafetyGate の評価ロジック変更

### 2.4 成果物

- `apps/desktop/src/main/ipc/safetyGateHandlers.ts`（`unregisterSafetyGateHandlers` 追加）
- `apps/desktop/src/main/ipc/index.ts`（`unregisterAllIpcHandlers` に統合）
- `apps/desktop/src/main/ipc/__tests__/safetyGateHandlers.test.ts`（unregister テスト追加）

---

## 3. どう実装するか（How）

### 3.1 実装方針

`authKeyHandlers.ts` の `unregisterAuthKeyHandlers` パターンを参考に実装する。`ipcMain.removeHandler` は登録されていないチャンネルに対して呼び出しても例外にならないため、冪等な実装が可能。

#### 変更内容

```typescript
// safetyGateHandlers.ts に追加
export function unregisterSafetyGateHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_EVALUATE_SAFETY);
}
```

```typescript
// index.ts の unregisterAllIpcHandlers に追加
import {
  registerSafetyGateHandlers,
  unregisterSafetyGateHandlers,
} from "./safetyGateHandlers";

export function unregisterAllIpcHandlers(): void {
  // ... 既存のハンドラ解除 ...
  unregisterSafetyGateHandlers(); // ← 追加
}
```

### 3.2 苦戦箇所・注意点（前回の教訓）

#### P61（IPCハンドラ設計時のDIP違反検出遅延）— 教訓として記録（修正済み）

UT-06-003 の初期実装段階で `registerSafetyGateHandlers` が `DefaultSafetyGate`（具象クラス）を引数に取る DIP 違反が入り込んだ。Phase 10 最終レビューで検出・修正されたが、Phase 2 設計時点で「IPC ハンドラの依存先は Port/Interface であること」を確認項目に含めていれば防げた。

**現在の実装は修正済み**（引数型: `SafetyGatePort`）。今後の設計タスクへの教訓として本タスク指示書に記録する。

#### P5（リスナー二重登録）

`ipcMain.handle()` は同一チャンネルへの二重登録で例外を送出する。`unregisterSafetyGateHandlers()` を実装することで macOS `activate` イベント等でのハンドラ再登録時の問題を事前に防止できる。

#### P54（safeRegister パターン不適合）

`safetyGateHandlers.ts` のハンドラは戻り値（unsubscribe 関数）が不要であるため、`safeRegister` パターンが適用可能な構造。ただし `unregisterSafetyGateHandlers` という明示的な関数を提供することで、他のハンドラグループとのパターン整合性を保つ。

### 3.3 テスト方針

- `unregisterSafetyGateHandlers()` 呼び出し後に `ipcMain.removeHandler` が `IPC_CHANNELS.SKILL_EVALUATE_SAFETY` で呼ばれること
- `register → unregister → register` の順で呼び出した場合に例外が発生しないこと
- 既存の評価ロジックテスト（`evaluate` の呼び出し確認）が引き続き PASS すること

---

## 4. 関連情報

### 4.1 関連タスク

| タスクID                         | 関係性                              |
| -------------------------------- | ----------------------------------- |
| UT-06-003                        | 親タスク（SafetyGate IPC 実装）     |
| UT-06-003-PRELOAD-API-IMPL       | 並行タスク（Preload層 API 追加）    |
| UT-06-003-METADATA-PROVIDER-IMPL | 並行タスク（MetadataProvider 実装） |

### 4.2 関連仕様書

| 仕様書                         | パス                                                                                        | 内容                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| SafetyGate IPC 仕様            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`                   | SafetyGate IPC ハンドラ仕様                |
| Electron サービス詳細（Part2） | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | IPC ハンドラ登録パターン                   |
| IPC 実装パターン               | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | safeRegister / Graceful Degradation（S30） |

### 4.3 関連 Pitfall

| Pitfall ID | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| P5         | リスナー二重登録（Main Process 側）                             |
| P54        | safeRegister パターン不適合（戻り値キャプチャが必要なハンドラ） |
| P61        | IPCハンドラ設計時のDIP違反検出遅延（教訓として記録、修正済み）  |

---

## 5. 実行手順

### Phase 1: 事前調査

#### 目的

変更対象ファイルの現状と、他のハンドラの unregister パターンを把握する。

#### 手順

1. `apps/desktop/src/main/ipc/safetyGateHandlers.ts` を確認し、現在の実装を把握する
2. `apps/desktop/src/main/ipc/authKeyHandlers.ts` の unregister パターンを確認する
3. `apps/desktop/src/main/ipc/index.ts` の `unregisterAllIpcHandlers()` の現状を確認する

#### 完了条件

- unregister の追加場所と実装形式が確定している

### Phase 2: 実装・テスト追加

#### 目的

`unregisterSafetyGateHandlers` を実装し、テストで検証する。

#### 手順

1. `apps/desktop/src/main/ipc/safetyGateHandlers.ts` に `unregisterSafetyGateHandlers()` を追加する
2. `apps/desktop/src/main/ipc/index.ts` の `unregisterAllIpcHandlers()` に追加する
3. `apps/desktop/src/main/ipc/__tests__/safetyGateHandlers.test.ts` に unregister テストを追加する
4. `pnpm --filter @repo/desktop test` で全テストが PASS することを確認する

#### 完了条件

- 全テストが PASS する
- `pnpm typecheck` が通る
- `pnpm lint` が通る

---

## 6. 完了条件チェックリスト

### 機能要件

- [ ] `unregisterSafetyGateHandlers()` 関数が `safetyGateHandlers.ts` に存在する
- [ ] `unregisterAllIpcHandlers()` から `unregisterSafetyGateHandlers()` が呼ばれている
- [ ] `register → unregister → register` の順で呼び出した場合に例外が発生しない

### 品質要件

- [ ] `pnpm --filter @repo/desktop test` で全テストが PASS する
- [ ] `pnpm typecheck` が通る
- [ ] `pnpm lint` が通る
