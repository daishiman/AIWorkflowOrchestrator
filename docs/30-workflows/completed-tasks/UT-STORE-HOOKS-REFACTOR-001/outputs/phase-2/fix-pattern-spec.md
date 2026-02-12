# 修正パターン仕様

## メタ情報

| 項目       | 値                          |
| ---------- | --------------------------- |
| 機能名     | UT-STORE-HOOKS-REFACTOR-001 |
| Phase      | 2                           |
| 作成日     | 2026-02-11                  |
| ステータス | 完了                        |

## 1. 概要

本ドキュメントでは、P31（Zustand Store Hooks無限ループ）問題の修正パターンを、Before/Afterのコード例と共に定義する。

## 2. 修正パターン一覧

### 2.1 パターンA: 合成Hook → 個別セレクタ移行

#### Before（問題あり）

```typescript
// SettingsView/index.tsx
import { useAuthModeStore } from '../../store';
import { useRef, useEffect } from 'react';

const SettingsView: React.FC = () => {
  const { mode, initializeAuthMode } = useAuthModeStore();
  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      initializeAuthMode();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <div>{mode}</div>;
};
```

**問題点**:

- `useRef`ガードが必要
- ESLint警告を抑制する必要がある（`eslint-disable-line`）
- 技術的負債として残る

#### After（推奨）

```typescript
// SettingsView/index.tsx
import { useAuthMode, useInitializeAuthMode } from '../../store';
import { useEffect } from 'react';

const SettingsView: React.FC = () => {
  const mode = useAuthMode();
  const initializeAuthMode = useInitializeAuthMode();

  useEffect(() => {
    initializeAuthMode();
  }, [initializeAuthMode]); // 安全に依存配列に含められる

  return <div>{mode}</div>;
};
```

**改善点**:

- `useRef`ガード不要
- ESLint警告なし
- 依存配列に安全に含められる

---

### 2.2 パターンB: LLMプロバイダー取得

#### Before（問題あり）

```typescript
// LLMSettingsCard.tsx
import { useLLMStore } from '../../store';
import { useRef, useEffect } from 'react';

const LLMSettingsCard: React.FC = () => {
  const { providers, fetchProviders, isLoading, error } = useLLMStore();
  const fetchRef = useRef(false);

  useEffect(() => {
    if (!fetchRef.current) {
      fetchRef.current = true;
      fetchProviders();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {providers.map((p) => (
        <ProviderItem key={p.id} provider={p} />
      ))}
    </div>
  );
};
```

#### After（推奨）

```typescript
// LLMSettingsCard.tsx
import {
  useLLMProviders,
  useFetchLLMProviders,
  useLLMIsLoading,
  useLLMError,
} from '../../store';
import { useEffect } from 'react';

const LLMSettingsCard: React.FC = () => {
  const providers = useLLMProviders();
  const fetchProviders = useFetchLLMProviders();
  const isLoading = useLLMIsLoading();
  const error = useLLMError();

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]); // 安全に依存配列に含められる

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {providers.map((p) => (
        <ProviderItem key={p.id} provider={p} />
      ))}
    </div>
  );
};
```

---

### 2.3 パターンC: スキル取得と選択

#### Before（問題あり）

```typescript
// SkillSettingsSection.tsx
import { useAgentStore } from '../../store';
import { useRef, useEffect } from 'react';

const SkillSettingsSection: React.FC = () => {
  const { importedSkills, fetchSkills, selectSkillByName, selectedSkillName } =
    useAgentStore();
  const fetchRef = useRef(false);

  useEffect(() => {
    if (!fetchRef.current) {
      fetchRef.current = true;
      fetchSkills();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectSkill = (name: string) => {
    selectSkillByName(name);
  };

  return (
    <div>
      {importedSkills.map((skill) => (
        <SkillItem
          key={skill.name}
          skill={skill}
          isSelected={skill.name === selectedSkillName}
          onSelect={() => handleSelectSkill(skill.name)}
        />
      ))}
    </div>
  );
};
```

#### After（推奨）

```typescript
// SkillSettingsSection.tsx
import {
  useImportedSkills,
  useFetchSkills,
  useSelectSkillByName,
  useSelectedSkillName,
} from '../../store';
import { useEffect, useCallback } from 'react';

const SkillSettingsSection: React.FC = () => {
  const importedSkills = useImportedSkills();
  const fetchSkills = useFetchSkills();
  const selectSkillByName = useSelectSkillByName();
  const selectedSkillName = useSelectedSkillName();

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]); // 安全に依存配列に含められる

  const handleSelectSkill = useCallback(
    (name: string) => {
      selectSkillByName(name);
    },
    [selectSkillByName]
  ); // アクションセレクタは参照が安定しているためuseCallbackも安全

  return (
    <div>
      {importedSkills.map((skill) => (
        <SkillItem
          key={skill.name}
          skill={skill}
          isSelected={skill.name === selectedSkillName}
          onSelect={() => handleSelectSkill(skill.name)}
        />
      ))}
    </div>
  );
};
```

---

### 2.4 パターンD: 複数状態の同時取得（shallow使用）

#### Before（問題あり）

```typescript
// 複数の状態を一度に取得したいケース
const { mode, status, isLoading, error, fetchMode } = useAuthModeStore();
```

#### After（推奨 - 個別セレクタ優先）

```typescript
// 推奨: 個別セレクタを使用
const mode = useAuthMode();
const status = useAuthModeStatus();
const isLoading = useAuthModeLoading();
const error = useAuthModeError();
const fetchMode = useFetchAuthMode();
```

#### After（代替 - shallow使用）

```typescript
import { useShallow } from "zustand/react/shallow";

// 状態のみをshallow比較で取得（アクションは含めない）
const { mode, status, isLoading, error } = useAppStore(
  useShallow((state) => ({
    mode: state.mode,
    status: state.status,
    isLoading: state.isLoading,
    error: state.error,
  })),
);

// アクションは個別セレクタで取得
const fetchMode = useFetchAuthMode();
```

**注意**: shallow比較はアクション（関数）を含めると正しく動作しない場合があるため、状態のみに使用すること。

---

### 2.5 パターンE: 計算値の取得

#### Before（コンポーネント内で計算）

```typescript
const { providers, selectedProviderId } = useLLMStore();
const selectedProvider = providers.find((p) => p.id === selectedProviderId);
```

#### After（計算セレクタ使用）

```typescript
// 計算セレクタを使用
const selectedProvider = useSelectedLLMProvider();
```

**改善点**:

- コンポーネントの責務が軽減
- 同じ計算を複数コンポーネントで共有可能
- セレクタ内でメモ化の恩恵を受けられる

## 3. 移行チェックリスト

各コンポーネントの移行時に確認すべき項目:

### 3.1 移行前の確認

- [ ] 使用している合成Store Hook（`useXxxStore()`）を特定
- [ ] 分割代入で取得している状態とアクションをリストアップ
- [ ] `useRef`ガードが使用されているか確認
- [ ] ESLint警告抑制コメントがあるか確認

### 3.2 移行作業

- [ ] 合成Store Hookのimportを個別セレクタに置き換え
- [ ] 分割代入を個別のセレクタ呼び出しに変更
- [ ] `useRef`ガードを削除
- [ ] ESLint警告抑制コメントを削除
- [ ] `useEffect`の依存配列にアクションセレクタを追加

### 3.3 移行後の確認

- [ ] TypeScriptコンパイルエラーがないこと
- [ ] ESLint警告がないこと
- [ ] 動作確認（無限ループが発生しないこと）
- [ ] 再レンダリング回数が適切であること（React DevTools Profiler）

## 4. アンチパターン

### 4.1 避けるべきパターン

#### NG: 依存配列の空配列化

```typescript
// NG: 依存配列を空にして警告を回避
useEffect(() => {
  fetchData();
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

#### NG: useRefによる実行回数制限

```typescript
// NG: useRefで実行回数を制限
const hasRun = useRef(false);
useEffect(() => {
  if (!hasRun.current) {
    hasRun.current = true;
    fetchData();
  }
}, []);
```

#### NG: アクションを含む合成Hookのshallow使用

```typescript
// NG: アクション（関数）を含むオブジェクトにshallowを使用
const { mode, fetchMode } = useAppStore(
  useShallow((state) => ({
    mode: state.mode,
    fetchMode: state.fetchMode, // 関数は含めるべきでない
  })),
);
```

### 4.2 推奨パターン

#### OK: 個別セレクタ + 適切な依存配列

```typescript
// OK: 個別セレクタを使用し、依存配列に含める
const fetchData = useFetchData();
useEffect(() => {
  fetchData();
}, [fetchData]); // 安全
```

## 5. 型安全性の確保

### 5.1 セレクタの戻り値型

```typescript
// 型が自動推論される
const mode = useAuthMode(); // AuthMode型
const setMode = useSetAuthMode(); // (mode: AuthMode) => Promise<void>型
```

### 5.2 型アサーション不要

```typescript
// Before（型アサーションが必要な場合があった）
const mode = useAuthModeStore().mode as AuthMode;

// After（型アサーション不要）
const mode = useAuthMode(); // AuthMode型として自動推論
```

## 6. パフォーマンス考慮事項

### 6.1 再レンダリングの最小化

```typescript
// 個別セレクタは必要な状態のみを購読するため、
// 無関係な状態変更で再レンダリングしない

const mode = useAuthMode();
// status変更時: 再レンダリングしない
// mode変更時: 再レンダリングする
```

### 6.2 計算セレクタのメモ化

```typescript
// 計算セレクタは依存状態が変わった時のみ再計算
const selectedProvider = useSelectedLLMProvider();
// providers または selectedProviderId が変わった時のみ再計算
```
