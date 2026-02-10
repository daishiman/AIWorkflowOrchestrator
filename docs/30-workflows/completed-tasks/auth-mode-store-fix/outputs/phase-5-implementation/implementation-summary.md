# Phase 5: 実装完了サマリー

## メタ情報

| 項目         | 値                                   |
| ------------ | ------------------------------------ |
| タスク ID    | UT-FIX-STORE-HOOKS-INFINITE-LOOP-001 |
| Phase        | 5 (実装)                             |
| 実施日       | 2026-02-10                           |
| 対象 Pitfall | P31: Zustand Store Hooks無限ループ   |
| 関連仕様書   | 06-known-pitfalls.md                 |

## 概要

Zustand Store の合成 Hook (`useAuthModeStore()`, `useLLMStore()`, `useSkillStore()`) が毎回新しいオブジェクトを返すため、その中の関数を `useEffect` の依存配列に含めると無限ループが発生する問題を修正しました。

## 修正ファイル一覧

| ファイル                                                        | 修正内容                                    |
| --------------------------------------------------------------- | ------------------------------------------- |
| `apps/desktop/src/renderer/views/SettingsView/index.tsx`        | authModeInitRef によるガード追加            |
| `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx` | providersFetchedRef, prevProviderIdRef 追加 |
| `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`  | handleRescan の依存配列を空に               |

---

## 1. SettingsView/index.tsx

### 修正概要

- `useRef` を import に追加
- `authModeInitRef` を追加して `initializeAuthMode` を1回だけ実行するようにガード
- `useEffect` の依存配列を空にし、`eslint-disable-line` コメントを追加

### 修正前後のコード比較

```diff
-import React, { useState, useCallback, useEffect } from "react";
+import React, { useState, useCallback, useEffect, useRef } from "react";
```

```diff
   // Auth mode store
   const {
     mode: authMode,
     status: authModeStatus,
     isLoading: authModeLoading,
     setMode: setAuthMode,
     initializeAuthMode,
   } = useAuthModeStore();

-  // Initialize auth mode on mount
+  // Initialize auth mode on mount (1回だけ実行 - P31対策)
+  const authModeInitRef = useRef(false);
   useEffect(() => {
-    initializeAuthMode();
-  }, [initializeAuthMode]);
+    if (!authModeInitRef.current) {
+      authModeInitRef.current = true;
+      initializeAuthMode();
+    }
+  }, []); // eslint-disable-line react-hooks/exhaustive-deps
```

### 修正後のコード (該当部分)

```typescript
// Initialize auth mode on mount (1回だけ実行 - P31対策)
const authModeInitRef = useRef(false);
useEffect(() => {
  if (!authModeInitRef.current) {
    authModeInitRef.current = true;
    initializeAuthMode();
  }
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

---

## 2. LLMSelectorPanel.tsx

### 修正概要

- `useRef` を import に追加
- `providersFetchedRef` を追加して `fetchProviders` を1回だけ実行
- `prevProviderIdRef` を追加して `selectedProviderId` の変更を追跡
- `checkHealth` の依存配列から `checkHealth` 関数を除外

### 修正前後のコード比較

```diff
-import React, { useEffect, useCallback } from "react";
+import React, { useEffect, useCallback, useRef } from "react";
```

```diff
-  // Fetch providers on mount
+  // Fetch providers on mount (1回だけ実行 - P31対策)
+  const providersFetchedRef = useRef(false);
   useEffect(() => {
-    fetchProviders();
-  }, [fetchProviders]);
+    if (!providersFetchedRef.current) {
+      providersFetchedRef.current = true;
+      fetchProviders();
+    }
+  }, []); // eslint-disable-line react-hooks/exhaustive-deps

-  // Check health when provider changes
+  // Check health when provider changes (P31対策: checkHealthは依存配列から除外)
+  const prevProviderIdRef = useRef<string | null>(null);
   useEffect(() => {
-    if (selectedProviderId) {
-      checkHealth(selectedProviderId);
+    if (
+      selectedProviderId &&
+      selectedProviderId !== prevProviderIdRef.current
+    ) {
+      prevProviderIdRef.current = selectedProviderId;
+      checkHealth(selectedProviderId);
     }
-  }, [selectedProviderId, checkHealth]);
+  }, [selectedProviderId]); // eslint-disable-line react-hooks/exhaustive-deps
```

### 修正後のコード (該当部分)

```typescript
// Fetch providers on mount (1回だけ実行 - P31対策)
const providersFetchedRef = useRef(false);
useEffect(() => {
  if (!providersFetchedRef.current) {
    providersFetchedRef.current = true;
    fetchProviders();
  }
}, []); // eslint-disable-line react-hooks/exhaustive-deps

// Check health when provider changes (P31対策: checkHealthは依存配列から除外)
const prevProviderIdRef = useRef<string | null>(null);
useEffect(() => {
  if (selectedProviderId && selectedProviderId !== prevProviderIdRef.current) {
    prevProviderIdRef.current = selectedProviderId;
    checkHealth(selectedProviderId);
  }
}, [selectedProviderId]); // eslint-disable-line react-hooks/exhaustive-deps
```

---

## 3. SkillSelector.tsx

### 修正概要

- `handleRescan` の `useCallback` 依存配列を空にし、`eslint-disable-next-line` コメントを追加

### 修正前後のコード比較

```diff
-  const handleRescan = useCallback(() => {
-    rescanSkills();
-  }, [rescanSkills]);
+  // P31対策: rescanSkillsは参照が不安定なため依存配列から除外
+  const handleRescan = useCallback(() => {
+    rescanSkills();
+    // eslint-disable-next-line react-hooks/exhaustive-deps
+  }, []);
```

### 修正後のコード (該当部分)

```typescript
// P31対策: rescanSkillsは参照が不安定なため依存配列から除外
const handleRescan = useCallback(() => {
  rescanSkills();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

---

## 修正パターン解説

### 問題の原因

Zustand の合成 Store Hook (例: `useAuthModeStore()`) は、呼び出しごとに新しいオブジェクトを返します。そのオブジェクト内の関数 (例: `initializeAuthMode`) も毎回新しい参照となるため、`useEffect` の依存配列に含めると無限ループが発生します。

```typescript
// 無限ループの例
const { initializeAuthMode } = useAuthModeStore();
useEffect(() => {
  initializeAuthMode(); // 実行後に状態が変わる
}, [initializeAuthMode]); // 参照が変わるため再実行 -> 無限ループ
```

### 解決策: useRef によるガード

`useRef` を使用して初期化済みフラグを保持し、1回だけ実行されるようにガードします。

```typescript
// 修正後
const { initializeAuthMode } = useAuthModeStore();
const initRef = useRef(false);
useEffect(() => {
  if (!initRef.current) {
    initRef.current = true;
    initializeAuthMode();
  }
}, []); // 依存配列は空に
```

---

## 完了条件チェックリスト

- [x] SettingsView/index.tsx に authModeInitRef ガードを追加
- [x] LLMSelectorPanel.tsx に providersFetchedRef ガードを追加
- [x] LLMSelectorPanel.tsx に prevProviderIdRef で変更追跡を追加
- [x] SkillSelector.tsx の handleRescan 依存配列を修正
- [x] 全修正箇所に P31 対策のコメントを追加
- [x] eslint-disable コメントで lint エラーを抑制
- [x] TypeScript 型チェック通過確認 (Hook による自動実行)
- [x] 既存テストの回帰なし確認 (Hook による自動実行)

---

## 次 Phase

Phase 6-7: テスト拡充・カバレッジ確認

- 修正箇所に対するユニットテストの追加
- useRef ガードが正しく機能することの検証
- カバレッジ基準 (Line 80%, Branch 60%) の達成確認
