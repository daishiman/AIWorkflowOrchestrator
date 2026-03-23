# Phase 5: 実装計画

## メタ情報

| 項目               | 値                                              |
| ------------------ | ----------------------------------------------- |
| タスクID           | TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001 |
| 作成日             | 2026-03-23                                      |
| Phase              | 5 — 実装                                        |
| 対象コンポーネント | ChatPanel.tsx                                   |
| タスク種別         | 設計タスク（プロダクションコード変更なし）      |

---

## 1. 変更順序と責務分離

本タスクは設計タスクであり、実装フェーズにおける変更指針を定義する文書である。
実際の変更は後続の実装タスクで行う。

### 変更順序（依存関係順）

```
Step 1: JSDoc に @role review-harness を追加
  └─ 依存: なし（純粋なドキュメント追加）

Step 2: GAP-02 — onSelectProvider → handleSelectProvider（Store action）
  └─ 依存: Step 1 完了後（JSDoc で役割を宣言してから実装）

Step 3: GAP-03 — onSelectModel → handleSelectModel（Store action）
  └─ 依存: Step 2 と並列実行可能

Step 4: GAP-01 — onTerminalSwitch → handleTerminalSwitch（Store action）
  └─ 依存: Step 2,3 完了後（同一パターンを確認してから）

Step 5: GAP-04 — onOpenTerminal → handleOpenTerminal（IPC call）
  └─ 依存: MINOR-A 確認後（openTerminal IPC チャンネルの存在確認が前提）
```

---

## 2. 各変更の詳細仕様

### Step 1: JSDoc @role review-harness 追加

**対象箇所**: `ChatPanel.tsx` のコンポーネント定義の直前

**変更内容**:

```typescript
/**
 * ChatPanel — Review Harness
 *
 * @role review-harness
 * @description
 *   Review harness として機能する ChatPanel。
 *   mainline の ChatPanel とは以下の点で異なる:
 *   - Provider/Model 選択は Store action で mainline に委譲する
 *   - Terminal 起動は IPC call（openTerminal）で実行する
 *   - UI の一部機能（送信・キャンセル等）は mainline と同一コントラクトを維持する
 *
 * @see Concern 1 (Review Harness Role Enforcement)
 * @see TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001
 */
export const ChatPanel: React.FC<ChatPanelProps> = ({ ... }) => {
```

**禁止事項**: 既存 JSDoc の削除・上書きはしない。追記のみ行う。

---

### Step 2: GAP-02 — onSelectProvider の置換

**対象箇所**: ChatPanel.tsx 内の `onSelectProvider` コールバック

**変更前（no-op）**:

```typescript
onSelectProvider={() => {}}
```

**変更後（Store action）**:

```typescript
// 個別セレクタで action を取得（P31 対策）
const handleSelectProvider = useSetSelectedProvider();

// JSX 内での使用
onSelectProvider = { handleSelectProvider };
```

**必要な import 追加**:

```typescript
import { useSetSelectedProvider } from "../../store";
```

---

### Step 3: GAP-03 — onSelectModel の置換

**対象箇所**: ChatPanel.tsx 内の `onSelectModel` コールバック

**変更前（no-op）**:

```typescript
onSelectModel={() => {}}
```

**変更後（Store action）**:

```typescript
const handleSelectModel = useSetSelectedModel();

onSelectModel = { handleSelectModel };
```

**必要な import 追加**:

```typescript
import { useSetSelectedModel } from "../../store";
```

---

### Step 4: GAP-01 — onTerminalSwitch の置換

**対象箇所**: ChatPanel.tsx 内の `onTerminalSwitch` コールバック

**変更前（no-op）**:

```typescript
onTerminalSwitch={() => {}}
```

**変更後（Store action）**:

```typescript
const setActiveView = useSetActiveView();
const handleTerminalSwitch = useCallback(() => {
  setActiveView("terminal");
}, [setActiveView]);

onTerminalSwitch = { handleTerminalSwitch };
```

**必要な import 追加**:

```typescript
import { useSetActiveView } from "../../store";
import { useCallback } from "react";
```

**備考**: `setActiveView('terminal')` の引数文字列は View 型の定数に依存する。
既存の型定義（`ViewType`）を参照すること。

---

### Step 5: GAP-04 — onOpenTerminal の置換（MINOR-A 確認後）

**前提条件（MINOR-A）**: 実装前に以下を確認する。

```bash
# openTerminal IPC チャンネルの存在確認
grep -rn "openTerminal" apps/desktop/src/main/handlers/
grep -rn "openTerminal" apps/desktop/src/preload/

# IPC チャンネル定数の確認
grep -rn "OPEN_TERMINAL\|openTerminal" apps/desktop/src/main/constants/
```

**確認ができた場合の変更**:

**変更前（no-op）**:

```typescript
onOpenTerminal={() => {}}
```

**変更後（IPC call）**:

```typescript
const handleOpenTerminal = useCallback(async () => {
  await window.electronAPI.openTerminal();
}, []);

onOpenTerminal = { handleOpenTerminal };
```

**確認ができなかった場合**: IPC チャンネルが存在しない場合は、未タスクとして登録し、
本 Step の実装を保留する。no-op に戻すことは禁止。

---

## 3. 禁止事項

以下のパターンは本タスクにおいて絶対に導入禁止である。

### 禁止パターン 1: no-op 再導入

```typescript
// 禁止
onSelectProvider={() => {}}
onSelectModel={() => {}}
onTerminalSwitch={() => {}}
onOpenTerminal={() => {}}
```

### 禁止パターン 2: silent fallback

```typescript
// 禁止: エラーを握りつぶしてサイレントに無処理
const handleSelectProvider = (provider: string) => {
  try {
    setSelectedProvider(provider);
  } catch {
    // エラーを無視 ← 禁止
  }
};
```

### 禁止パターン 3: local 判定によるロジック分岐

```typescript
// 禁止: ChatPanel 内部で mainline/harness の判定を行う
const isReviewMode = useIsReviewMode();
const handleSelectProvider = isReviewMode
  ? () => {} // harness では no-op ← 禁止
  : (provider: string) => setSelectedProvider(provider);
```

### 禁止パターン 4: 合成 Store Hook の useEffect 依存配列への混入（P31 再発防止）

```typescript
// 禁止
const { setSelectedProvider } = useAppStore(); // 合成Hook
useEffect(() => {
  setSelectedProvider(defaultProvider);
}, [setSelectedProvider]); // 無限ループ

// 正しい実装
const setSelectedProvider = useSetSelectedProvider(); // 個別セレクタ
useEffect(() => {
  setSelectedProvider(defaultProvider);
}, [setSelectedProvider]); // Zustand アクションは安定参照
```

---

## 4. MINOR-A 対応手順

設計レビューで MINOR 判定された課題 A（`openTerminal` IPC チャンネルの存在確認）の
対応手順を定義する。

### 確認コマンド

```bash
# Step 1: IPC ハンドラの存在確認
grep -rn "openTerminal" apps/desktop/src/main/handlers/

# Step 2: Preload API の存在確認
grep -rn "openTerminal" apps/desktop/src/preload/

# Step 3: IPC チャンネル定数の確認
grep -rn "openTerminal\|OPEN_TERMINAL" apps/desktop/src/main/constants/ipc-channels.ts
```

### 判定分岐

| 確認結果            | 対応                                                           |
| ------------------- | -------------------------------------------------------------- |
| 全 3 箇所に存在する | GAP-04 を Step 5 の通りに実装する                              |
| 一部のみ存在する    | 不足箇所を未タスクとして登録し、GAP-04 を保留                  |
| 存在しない          | `openTerminal` IPC の実装タスクを未タスク登録し、GAP-04 を保留 |

---

## 5. 実装後の検証手順

### 静的検証

```bash
# no-op が残っていないことを確認
grep -n "() => {}" apps/desktop/src/renderer/components/chat/ChatPanel.tsx

# @role review-harness が追加されたことを確認
grep -n "@role review-harness" apps/desktop/src/renderer/components/chat/ChatPanel.tsx

# 型チェック
cd apps/desktop && pnpm typecheck
```

### 動的検証（テスト）

```bash
# ChatPanel のテストを実行
cd apps/desktop && pnpm vitest run src/renderer/components/chat/

# TC-01〜TC-05 が全て PASS することを確認
```
