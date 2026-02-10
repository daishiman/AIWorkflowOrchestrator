# Phase 5: 実装 - Zustand Store Hooks無限ループ修正

## メタ情報

| 項目      | 内容                                 |
| --------- | ------------------------------------ |
| タスクID  | UT-FIX-STORE-HOOKS-INFINITE-LOOP-001 |
| Phase     | 5 - 実装                             |
| 前提Phase | Phase 4（テスト作成）                |
| 成果物    | 修正済みコンポーネントファイル       |
| 次Phase   | Phase 6（テスト拡充）                |

## 1. 目的

useRefパターンを使用して、Store Hooksの初期化処理が1回だけ実行されるように修正する。

## 2. 修正ファイル一覧

| ファイル                                                        | 修正内容                                          | 優先度 |
| --------------------------------------------------------------- | ------------------------------------------------- | ------ |
| `apps/desktop/src/renderer/views/SettingsView/index.tsx`        | useRef + useEffect パターン適用                   | 必須   |
| `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx` | useRef + useEffect パターン適用                   | 必須   |
| `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`  | useCallback依存配列の確認（問題なければ変更不要） | 確認   |

## 3. 実装手順

### Step 1: SettingsView 修正

**ファイル**: `apps/desktop/src/renderer/views/SettingsView/index.tsx`

#### 修正前

```typescript
import React, { useState, useCallback, useEffect } from "react";
// ... 省略

export const SettingsView: React.FC<SettingsViewProps> = ({ className }) => {
  // Auth mode store
  const {
    mode: authMode,
    status: authModeStatus,
    isLoading: authModeLoading,
    setMode: setAuthMode,
    initializeAuthMode,
  } = useAuthModeStore();

  // Initialize auth mode on mount
  useEffect(() => {
    initializeAuthMode();
  }, [initializeAuthMode]); // <- 無限ループの原因

  // ...
};
```

#### 修正後

```typescript
import React, { useState, useCallback, useEffect, useRef } from "react";
// ... 省略

export const SettingsView: React.FC<SettingsViewProps> = ({ className }) => {
  // Auth mode store
  const {
    mode: authMode,
    status: authModeStatus,
    isLoading: authModeLoading,
    setMode: setAuthMode,
    initializeAuthMode,
  } = useAuthModeStore();

  // Initialize auth mode on mount (1回だけ実行)
  const authModeInitRef = useRef(false);
  useEffect(() => {
    if (!authModeInitRef.current) {
      authModeInitRef.current = true;
      initializeAuthMode();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ...
};
```

#### 変更点の詳細

1. `useRef` を import に追加
2. `authModeInitRef` を作成（初期値 `false`）
3. `useEffect` の依存配列を空に変更
4. `if` 文でガードし、一度実行したら `true` に設定
5. ESLint の `exhaustive-deps` 警告を抑制するコメントを追加

---

### Step 2: LLMSelectorPanel 修正

**ファイル**: `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx`

#### 修正前

```typescript
import React, { useEffect, useCallback } from "react";
// ... 省略

export const LLMSelectorPanel: React.FC<LLMSelectorPanelProps> = ({
  isVisible = true,
  onClose,
  compact = false,
  className = "",
}) => {
  const {
    // ...
    fetchProviders,
    checkHealth,
  } = useLLMStore();

  // Fetch providers on mount
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]); // <- 無限ループの原因

  // Check health when provider changes
  useEffect(() => {
    if (selectedProviderId) {
      checkHealth(selectedProviderId);
    }
  }, [selectedProviderId, checkHealth]); // <- 潜在的な問題

  // ...
};
```

#### 修正後

```typescript
import React, { useEffect, useCallback, useRef } from "react";
// ... 省略

export const LLMSelectorPanel: React.FC<LLMSelectorPanelProps> = ({
  isVisible = true,
  onClose,
  compact = false,
  className = "",
}) => {
  const {
    // ...
    fetchProviders,
    checkHealth,
  } = useLLMStore();

  // Fetch providers on mount (1回だけ実行)
  const providersFetchedRef = useRef(false);
  useEffect(() => {
    if (!providersFetchedRef.current) {
      providersFetchedRef.current = true;
      fetchProviders();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Check health when provider changes
  // selectedProviderId の変更時のみ実行（checkHealth は依存配列から除外）
  const prevProviderIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (
      selectedProviderId &&
      selectedProviderId !== prevProviderIdRef.current
    ) {
      prevProviderIdRef.current = selectedProviderId;
      checkHealth(selectedProviderId);
    }
  }, [selectedProviderId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ...
};
```

#### 変更点の詳細

1. `useRef` を import に追加
2. `providersFetchedRef` を作成して `fetchProviders` を1回だけ実行
3. `prevProviderIdRef` を作成して `selectedProviderId` の変更を追跡
4. `checkHealth` の依存配列から `checkHealth` 関数を除外

---

### Step 3: SkillSelector 確認

**ファイル**: `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`

現在のコードを確認したところ、`SkillSelector` には `useEffect` での自動初期化処理がなく、ユーザーの明示的な操作（ドロップダウン展開、再スキャンボタンクリック）でのみ処理が実行される設計になっています。

#### 確認結果

- `rescanSkills` は再スキャンボタンのクリック時のみ呼ばれる
- `selectSkillByName` はユーザーの選択操作時のみ呼ばれる
- `useEffect` での自動実行はない

**結論**: SkillSelector は現状で問題なし。修正不要。

---

## 4. 実装チェックリスト

### 必須修正

- [ ] SettingsView: `useRef` を import に追加
- [ ] SettingsView: `authModeInitRef` を作成
- [ ] SettingsView: `useEffect` の依存配列を空に変更
- [ ] SettingsView: `if` 文でガード
- [ ] LLMSelectorPanel: `useRef` を import に追加
- [ ] LLMSelectorPanel: `providersFetchedRef` を作成
- [ ] LLMSelectorPanel: `fetchProviders` の `useEffect` を修正
- [ ] LLMSelectorPanel: `prevProviderIdRef` を作成
- [ ] LLMSelectorPanel: `checkHealth` の `useEffect` を修正

### 確認項目

- [ ] SkillSelector: 自動実行の `useEffect` がないことを確認（修正不要）

---

## 5. 型チェック・Lint

実装後、以下のコマンドで確認：

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint

# 自動修正
pnpm --filter @repo/desktop lint:fix
```

---

## 6. 完了条件

- [ ] SettingsView の修正が完了
- [ ] LLMSelectorPanel の修正が完了
- [ ] SkillSelector の確認が完了（修正不要を確認）
- [ ] 型チェックがパス（`pnpm typecheck`）
- [ ] Lint がパス（`pnpm lint`）
- [ ] Phase 4 で作成したテストがパス（Green フェーズ）

---

## 7. 注意事項

### ESLint 警告の抑制

`react-hooks/exhaustive-deps` ルールにより、依存配列が空の `useEffect` に警告が出る場合があります。この場合、以下のコメントで抑制します：

```typescript
useEffect(() => {
  // ...
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

**理由**: 意図的に初回のみ実行する設計であり、依存関係を追加すると無限ループが発生するため。

### useRef パターンの理由

Zustand の Store Hooks（`useLLMStore`, `useAuthModeStore` など）が毎回新しいオブジェクトを返すため、これらの関数を `useEffect` の依存配列に含めると無限ループが発生します。

`useRef` を使用することで：

1. 初期化処理が1回だけ実行されることを保証
2. React.StrictMode での2回実行でも1回だけ実行
3. コンポーネントの再レンダリングでも再実行されない

---

## 8. 次Phase

Phase 6（テスト拡充）へ進む。
