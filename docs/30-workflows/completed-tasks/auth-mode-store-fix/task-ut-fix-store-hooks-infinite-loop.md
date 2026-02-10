# UT-FIX-STORE-HOOKS-INFINITE-LOOP-001: Zustand Store Hooks無限ループ修正

## メタ情報

```yaml
issue_number: 763
parent_task: UT-AUTH-MODE-UI-001
discovered_during: Phase 11（手動テスト検証）
```

## メタ情報

| 項目             | 内容                                              |
| ---------------- | ------------------------------------------------- |
| タスクID         | UT-FIX-STORE-HOOKS-INFINITE-LOOP-001              |
| タスク名         | Zustand Store Hooks無限ループ修正                 |
| 分類             | バグ修正                                          |
| 対象機能         | 設定画面・LLM選択・スキル選択                     |
| 優先度           | 緊急（ユーザー操作不可）                          |
| 見積もり規模     | 中（1-2時間）                                     |
| ステータス       | 未実施                                            |
| 発見元           | UT-AUTH-MODE-UI-001 Phase 11手動テスト時          |
| 発見日           | 2026-02-10                                        |
| セキュリティ影響 | なし                                              |
| 関連タスク       | TASK-AUTH-MODE-SELECTION-001, UT-AUTH-MODE-UI-001 |

## 1. Why（なぜこのタスクが必要か）

### 問題

Zustand Store Hooks（`useAuthModeStore`, `useLLMStore`, `useSkillStore`）が毎回新しいオブジェクトを返すため、これらの関数を`useEffect`の依存配列に含めると無限ループが発生する。

### 症状

- 設定画面（SettingsView）を開くとローディングが無限にぐるぐる回る
- LLMSelectorPanelでプロバイダー取得が無限に実行される
- SkillSelectorでスキル再スキャンが勝手に実行される

### 根本原因

```typescript
// store/index.ts:318-338
export const useAuthModeStore = () =>
  useAppStore((state) => ({
    mode: state.mode,
    // ... 毎回新しいオブジェクトを作成 ❌
    initializeAuthMode: state.initializeAuthMode,
  }));

// SettingsView/index.tsx:34-36
const { initializeAuthMode } = useAuthModeStore(); // 毎回新しい参照

useEffect(() => {
  initializeAuthMode(); // 無限ループ！
}, [initializeAuthMode]); // 依存配列が毎回変わる
```

### 影響範囲

| コンポーネント   | 影響するStore Hook | 症状                                     | 本タスク対象 |
| ---------------- | ------------------ | ---------------------------------------- | ------------ |
| SettingsView     | useAuthModeStore   | 認証方式初期化が無限実行                 | ✅ 対象      |
| LLMSelectorPanel | useLLMStore        | fetchProviders/checkHealthが無限実行     | ✅ 対象      |
| SkillSelector    | useSkillStore      | selectSkillByName/rescanSkillsが無限実行 | ✅ 確認対象  |

> **Note**: AgentView（useAppStore直接使用）にも潜在的な問題があるが、影響範囲が広いため将来タスク（UT-STORE-HOOKS-REFACTOR-001）で対応予定。

## 2. What（何を達成するか）

### ゴール

1. 設定画面が正常に開き、無限ループが発生しない
2. LLMSelectorPanelが正常に動作する
3. SkillSelectorが正常に動作する
4. 既存のテストがすべてパス

### 修正箇所（変更ファイル）

```
apps/desktop/src/renderer/
├── store/index.ts                          # Store Hooksの修正
├── views/SettingsView/index.tsx            # useEffect依存配列の修正
├── components/llm/LLMSelectorPanel.tsx     # useEffect/useCallback依存配列の修正
└── components/skill/SkillSelector.tsx      # useCallback依存配列の修正
```

## 3. How（どのように実装するか）

### 修正戦略

**短期修正（このタスクで実施）**: 依存配列から問題のある関数を削除し、useRefで初期化を1回だけ実行

**長期改善（将来タスク）**: Store Hooksを個別セレクタベースに再設計

### Step 1: SettingsView修正

```typescript
// 修正前（無限ループ）
const { initializeAuthMode } = useAuthModeStore();
useEffect(() => {
  initializeAuthMode();
}, [initializeAuthMode]);

// 修正後（1回だけ実行）
const { initializeAuthMode } = useAuthModeStore();
const initRef = useRef(false);

useEffect(() => {
  if (!initRef.current) {
    initRef.current = true;
    initializeAuthMode();
  }
}, []); // 依存配列は空
```

### Step 2: LLMSelectorPanel修正

```typescript
// 修正前
const { fetchProviders, checkHealth } = useLLMStore();
useEffect(() => {
  fetchProviders();
}, [fetchProviders]);
useEffect(() => {
  checkHealth();
}, [checkHealth]);

// 修正後
const { fetchProviders, checkHealth } = useLLMStore();
const initRef = useRef(false);

useEffect(() => {
  if (!initRef.current) {
    initRef.current = true;
    fetchProviders();
    checkHealth();
  }
}, []);
```

### Step 3: SkillSelector修正

```typescript
// selectSkillByName, rescanSkills のuseCallback依存配列を確認・修正
```

### Step 4: テスト実行・動作確認

1. `pnpm typecheck` がパス
2. `pnpm lint` がパス
3. 既存テストがパス
4. 手動テスト：設定画面を開いて無限ループしないことを確認

## 4. 完了条件

- [ ] SettingsViewのuseEffect依存配列をuseRefパターンに修正
- [ ] LLMSelectorPanelのuseEffect依存配列をuseRefパターンに修正
- [ ] SkillSelectorのuseCallback依存配列を確認・修正
- [ ] `pnpm typecheck` がパス
- [ ] `pnpm lint` がパス（または既存警告のみ）
- [ ] 既存テストがPASS
- [ ] 手動テスト：設定画面で無限ループしない
- [ ] 手動テスト：LLM選択が正常動作
- [ ] 手動テスト：スキル選択が正常動作

## 5. リスクと対策

| リスク                             | 対策                   |
| ---------------------------------- | ---------------------- |
| 初期化が2回実行される可能性        | useRefでガード         |
| テストでuseRefの動作を確認できない | 手動テストで確認       |
| 他の場所で同様のパターンがある     | grepで全体検索して確認 |

## 6. 検証方法

| テスト種別 | 検証内容                 | 実行コマンド/手順            |
| ---------- | ------------------------ | ---------------------------- |
| 型チェック | TypeScript型エラーなし   | `pnpm typecheck`             |
| Lint       | ESLintエラーなし         | `pnpm lint`                  |
| 単体テスト | 既存テストがPASS         | `pnpm test -- --run`         |
| 手動テスト | 設定画面で無限ループなし | アプリ起動→設定画面開く      |
| 手動テスト | LLM選択が正常動作        | LLM選択ドロップダウン操作    |
| 手動テスト | スキル選択が正常動作     | スキル選択ドロップダウン操作 |

## 7. 参照

### システム仕様書

| 仕様書                        | 関連セクション                                   |
| ----------------------------- | ------------------------------------------------ |
| arch-state-management.md      | Zustand設計原則、リスナー管理                    |
| ui-ux-design-principles.md    | フィードバック設計                               |
| ui-ux-settings.md             | 設定画面UI/UX仕様                                |
| testing-component-patterns.md | コンポーネントテストパターン、Storeモッキング    |
| 06-known-pitfalls.md          | P5: リスナー二重登録、**P31: Zustand無限ループ** |

### 関連ファイル

- Store定義: `apps/desktop/src/renderer/store/index.ts`
- authModeSlice: `apps/desktop/src/renderer/store/slices/authModeSlice.ts`
- SettingsView: `apps/desktop/src/renderer/views/SettingsView/index.tsx`
- LLMSelectorPanel: `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx`
- SkillSelector: `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`

## 8. 将来タスク（アーキテクチャ改善）

このタスクでは短期修正のみ実施。以下は将来タスクとして別途作成：

### UT-STORE-HOOKS-REFACTOR-001（将来）

Store Hooksを個別セレクタベースに再設計：

```typescript
// 現在の問題あるパターン
export const useAuthModeStore = () =>
  useAppStore((state) => ({ ... }));  // 毎回新しいオブジェクト

// 改善案
export const useAuthMode = () => useAppStore((state) => state.mode);
export const useAuthModeStatus = () => useAppStore((state) => state.status);
export const useInitializeAuthMode = () => useAppStore((state) => state.initializeAuthMode);
// ... 個別セレクタ
```
