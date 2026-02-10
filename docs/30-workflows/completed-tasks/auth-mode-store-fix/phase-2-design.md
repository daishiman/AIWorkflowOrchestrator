# Phase 2: 設計

## メタ情報

| 項目      | 内容                                 |
| --------- | ------------------------------------ |
| タスクID  | UT-FIX-STORE-HOOKS-INFINITE-LOOP-001 |
| Phase     | 2 - 設計                             |
| 作成日    | 2026-02-10                           |
| 前提Phase | Phase 1（要件定義）                  |
| 次Phase   | Phase 3（設計レビュー）              |
| 参照      | `phase-1-requirements.md`            |

---

## 1. 修正ファイル一覧

### 1.1 変更対象ファイル

| ファイル                                                        | 変更種別  | 変更理由                   |
| --------------------------------------------------------------- | --------- | -------------------------- |
| `apps/desktop/src/renderer/views/SettingsView/index.tsx`        | 修正      | useRefパターンで初期化保護 |
| `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx` | 修正      | useRefパターンで初期化保護 |
| `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`  | 確認/修正 | useCallback依存配列の確認  |

### 1.2 影響を受けるテストファイル

| ファイル                                                                       | 影響度 |
| ------------------------------------------------------------------------------ | ------ |
| `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`           | 低     |
| `apps/desktop/src/renderer/components/llm/__tests__/LLMSelectorPanel.test.tsx` | 低     |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx`  | 低     |

---

## 2. 修正内容（コード変更箇所）

### 2.1 SettingsView/index.tsx

#### 2.1.1 変更前（現在のコード: L34-36）

```typescript
// Initialize auth mode on mount
useEffect(() => {
  initializeAuthMode();
}, [initializeAuthMode]);
```

#### 2.1.2 変更後

```typescript
import React, { useState, useCallback, useEffect, useRef } from "react";
// ... 他のimport

export const SettingsView: React.FC<SettingsViewProps> = ({ className }) => {
  // ... 既存のコード

  // Auth mode store
  const {
    mode: authMode,
    status: authModeStatus,
    isLoading: authModeLoading,
    setMode: setAuthMode,
    initializeAuthMode,
  } = useAuthModeStore();

  // Initialize auth mode on mount (防止無限ループ)
  const authModeInitRef = useRef(false);

  useEffect(() => {
    if (!authModeInitRef.current) {
      authModeInitRef.current = true;
      initializeAuthMode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 初期化は1回のみ実行
  }, []);

  // ... 残りのコード
};
```

#### 2.1.3 変更理由

- `initializeAuthMode`は毎回新しい参照を返すため、依存配列に含めると無限ループが発生
- `useRef`を使用して初期化フラグを管理し、1回のみ実行を保証
- ESLintの`exhaustive-deps`警告はコメントで意図を明示して抑制

---

### 2.2 LLMSelectorPanel.tsx

#### 2.2.1 変更前（現在のコード: L49-58）

```typescript
// Fetch providers on mount
useEffect(() => {
  fetchProviders();
}, [fetchProviders]);

// Check health when provider changes
useEffect(() => {
  if (selectedProviderId) {
    checkHealth(selectedProviderId);
  }
}, [selectedProviderId, checkHealth]);
```

#### 2.2.2 変更後

```typescript
import React, { useEffect, useCallback, useRef } from "react";
// ... 他のimport

export const LLMSelectorPanel: React.FC<LLMSelectorPanelProps> = ({
  isVisible = true,
  onClose,
  compact = false,
  className = "",
}) => {
  const {
    providers,
    selectedProviderId,
    selectedModelId,
    isLoading,
    error,
    healthStatus,
    fetchProviders,
    selectProvider,
    selectModel,
    checkHealth,
  } = useLLMStore();

  // ... 既存のコード

  // Fetch providers on mount (防止無限ループ)
  const providersInitRef = useRef(false);

  useEffect(() => {
    if (!providersInitRef.current) {
      providersInitRef.current = true;
      fetchProviders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 初期化は1回のみ実行
  }, []);

  // Check health when provider changes
  // selectedProviderIdは値なので依存配列に含めても安全
  const prevProviderIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      selectedProviderId &&
      selectedProviderId !== prevProviderIdRef.current
    ) {
      prevProviderIdRef.current = selectedProviderId;
      checkHealth(selectedProviderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- checkHealthは参照安定性が保証されない
  }, [selectedProviderId]);

  // ... 残りのコード
};
```

#### 2.2.3 変更理由

- `fetchProviders`: 初期化時に1回だけ実行が必要
- `checkHealth`: provider変更時のみ実行が必要だが、`checkHealth`の参照が不安定なため依存配列から除外
- `prevProviderIdRef`を使用して、実際にproviderが変わった時のみ実行

---

### 2.3 SkillSelector.tsx

#### 2.3.1 現状確認（L287-289）

```typescript
const handleRescan = useCallback(() => {
  rescanSkills();
}, [rescanSkills]);
```

#### 2.3.2 変更後

```typescript
const handleRescan = useCallback(() => {
  rescanSkills();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- rescanSkillsは参照安定性が保証されない
}, []);
```

#### 2.3.3 変更理由

- `handleRescan`はユーザー操作（ボタンクリック）時のみ呼び出される
- `rescanSkills`の参照が変わっても、実行時に最新の関数が呼ばれるため問題ない
- 依存配列を空にすることで、`handleRescan`の参照が安定する

---

## 3. 依存関係

### 3.1 ファイル依存関係図

```
store/index.ts
    ↓
    ├── useAuthModeStore() → SettingsView/index.tsx
    ├── useLLMStore()      → LLMSelectorPanel.tsx
    └── useSkillStore()    → SkillSelector.tsx
```

### 3.2 修正の依存関係

| 修正項目             | 依存する修正項目 | 備考             |
| -------------------- | ---------------- | ---------------- |
| SettingsView修正     | なし             | 独立して修正可能 |
| LLMSelectorPanel修正 | なし             | 独立して修正可能 |
| SkillSelector修正    | なし             | 独立して修正可能 |

---

## 4. 設計パターン

### 4.1 useRefによる初期化保護パターン

```typescript
// パターン: 初期化を1回だけ実行
const initRef = useRef(false);

useEffect(() => {
  if (!initRef.current) {
    initRef.current = true;
    // 初期化処理
  }
}, []);
```

**利点:**

- React StrictModeでも1回のみ実行を保証
- シンプルで理解しやすい
- 将来のStore Hooks再設計を妨げない

**注意点:**

- ESLintの`exhaustive-deps`警告が出るため、コメントで意図を明示

### 4.2 前回値比較パターン

```typescript
// パターン: 値が変わった時のみ実行
const prevValueRef = useRef<T | null>(null);

useEffect(() => {
  if (value && value !== prevValueRef.current) {
    prevValueRef.current = value;
    // 値が変わった時の処理
  }
}, [value]);
```

**利点:**

- 値の変化を正確に検知
- 不必要な再実行を防止

---

## 5. テスト影響分析

### 5.1 既存テストへの影響

| テストファイル            | 影響 | 理由                           |
| ------------------------- | ---- | ------------------------------ |
| SettingsView.test.tsx     | なし | useRefはテストに影響しない     |
| LLMSelectorPanel.test.tsx | なし | モックは変更不要               |
| SkillSelector.test.tsx    | なし | ユーザー操作のテストに影響なし |

### 5.2 新規テスト要否

新規テストケースの追加は不要。既存のテストで動作確認可能。

---

## 6. 実装順序

1. **Step 1**: SettingsView/index.tsx の修正
   - useRefのimport追加
   - initializeAuthModeのuseEffectを修正

2. **Step 2**: LLMSelectorPanel.tsx の修正
   - useRefのimport追加（既にある場合は不要）
   - fetchProvidersのuseEffectを修正
   - checkHealthのuseEffectを修正

3. **Step 3**: SkillSelector.tsx の確認・修正
   - handleRescanのuseCallback依存配列を修正

4. **Step 4**: 型チェック・Lint実行
   - `pnpm typecheck`
   - `pnpm lint`

5. **Step 5**: テスト実行
   - `pnpm --filter @repo/desktop test -- --run`

6. **Step 6**: 手動テスト
   - 設定画面の動作確認
   - LLM選択の動作確認
   - スキル選択の動作確認

---

## 7. リスク対策

| リスク                         | 対策                                              |
| ------------------------------ | ------------------------------------------------- |
| ESLint警告の抑制が適切でない   | コメントで意図を明確に記載                        |
| 初期化が実行されないケース     | console.logで初期化実行を確認（開発時）           |
| 他の場所で同様のパターンがある | grep検索で確認: `useEffect.*useAuthModeStore`など |

---

## 8. 成果物

| 成果物           | パス                                                      |
| ---------------- | --------------------------------------------------------- |
| 設計書（本文書） | `docs/30-workflows/auth-mode-store-fix/phase-2-design.md` |

---

## 9. 完了条件チェックリスト

- [x] 修正ファイル一覧が明確
- [x] 各ファイルの具体的な変更内容が記載されている
- [x] 変更前後のコードが比較可能
- [x] 依存関係が整理されている
- [x] 設計パターンが文書化されている
- [x] テスト影響が分析されている
- [x] 実装順序が定義されている
- [x] リスク対策が記載されている

---

## 10. 次Phase

**Phase 3: 設計レビュー** に進む

- 設計の妥当性検証
- セキュリティ・パフォーマンス観点のチェック
- レビューゲート判定
