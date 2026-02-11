# Zustand Store Hooks無限ループ修正 統合仕様書

## 1. 概要

### 1.1 タスク情報

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
| 関連Issue        | #763                                              |
| 親タスク         | UT-AUTH-MODE-UI-001                               |
| 関連タスク       | TASK-AUTH-MODE-SELECTION-001, UT-AUTH-MODE-UI-001 |

### 1.2 目的

Zustand Store Hooks（`useAuthModeStore`, `useLLMStore`, `useSkillStore`）が毎回新しいオブジェクトを返すことによる無限ループを修正し、設定画面・LLM選択・スキル選択が正常に動作するようにする。

---

## 2. 問題の背景

### 2.1 発見経緯

UT-AUTH-MODE-UI-001（認証方式選択機能のUI統合）のPhase 11手動テスト中に発見された。設定画面を開くとローディングスピナーが無限に回り続け、操作不能となる現象が確認された。

### 2.2 根本原因（P31: Zustand Store Hooks無限ループ）

```typescript
// store/index.ts:318-338
export const useAuthModeStore = () =>
  useAppStore((state) => ({
    mode: state.mode,
    // ... 毎回新しいオブジェクトを作成
    initializeAuthMode: state.initializeAuthMode,
  }));

// SettingsView/index.tsx:34-36
const { initializeAuthMode } = useAuthModeStore(); // 毎回新しい参照

useEffect(() => {
  initializeAuthMode(); // 無限ループ！
}, [initializeAuthMode]); // 依存配列が毎回変わる
```

**問題の構造:**

```
useAuthModeStore()呼び出し
    ↓
毎回新しいオブジェクト{ mode, initializeAuthMode, ... }を返す
    ↓
useEffect依存配列にinitializeAuthModeを含める
    ↓
オブジェクト参照が変わるたびにuseEffectが再実行
    ↓
initializeAuthMode()がfetchMode()を呼び出す
    ↓
状態更新（isLoading変更）
    ↓
コンポーネント再レンダリング
    ↓
useAuthModeStore()呼び出し（ループの始まり）
```

### 2.3 症状

- 設定画面（SettingsView）を開くとローディングが無限にぐるぐる回る
- LLMSelectorPanelでプロバイダー取得が無限に実行される
- SkillSelectorでスキル再スキャンが勝手に実行される

---

## 3. 解決アプローチ

### 3.1 修正戦略

**短期修正（このタスクで実施）**: 依存配列から問題のある関数を削除し、useRefで初期化を1回だけ実行

**長期改善（将来タスク UT-STORE-HOOKS-REFACTOR-001）**: Store Hooksを個別セレクタベースに再設計

### 3.2 useRefによる初期化保護パターン

```typescript
// パターン: 初期化を1回だけ実行
const initRef = useRef(false);

useEffect(() => {
  if (!initRef.current) {
    initRef.current = true;
    // 初期化処理
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 初期化は1回のみ実行
}, []);
```

**利点:**

- React StrictModeでも1回のみ実行を保証
- シンプルで理解しやすい
- 将来のStore Hooks再設計を妨げない

### 3.3 前回値比較パターン

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

---

## 4. 対象コンポーネント

### 4.1 影響範囲

| コンポーネント   | 影響するStore Hook | 症状                                     | 本タスク対象 |
| ---------------- | ------------------ | ---------------------------------------- | ------------ |
| SettingsView     | useAuthModeStore   | 認証方式初期化が無限実行                 | 対象         |
| LLMSelectorPanel | useLLMStore        | fetchProviders/checkHealthが無限実行     | 対象         |
| SkillSelector    | useSkillStore      | selectSkillByName/rescanSkillsが無限実行 | 確認対象     |

> **Note**: AgentView（useAppStore直接使用）にも潜在的な問題があるが、影響範囲が広いため将来タスク（UT-STORE-HOOKS-REFACTOR-001）で対応予定。

### 4.2 変更対象ファイル

| ファイル                                                        | 変更種別  | 変更理由                   |
| --------------------------------------------------------------- | --------- | -------------------------- |
| `apps/desktop/src/renderer/views/SettingsView/index.tsx`        | 修正      | useRefパターンで初期化保護 |
| `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx` | 修正      | useRefパターンで初期化保護 |
| `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`  | 確認/修正 | useCallback依存配列の確認  |

### 4.3 具体的な修正内容

#### 4.3.1 SettingsView/index.tsx

```typescript
// 修正前（無限ループ）
const { initializeAuthMode } = useAuthModeStore();
useEffect(() => {
  initializeAuthMode();
}, [initializeAuthMode]);

// 修正後（1回だけ実行）
const { initializeAuthMode } = useAuthModeStore();
const authModeInitRef = useRef(false);

useEffect(() => {
  if (!authModeInitRef.current) {
    authModeInitRef.current = true;
    initializeAuthMode();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 初期化は1回のみ実行
}, []);
```

#### 4.3.2 LLMSelectorPanel.tsx

```typescript
// 修正後
const providersInitRef = useRef(false);

useEffect(() => {
  if (!providersInitRef.current) {
    providersInitRef.current = true;
    fetchProviders();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 初期化は1回のみ実行
}, []);

// Check health when provider changes
const prevProviderIdRef = useRef<string | null>(null);

useEffect(() => {
  if (selectedProviderId && selectedProviderId !== prevProviderIdRef.current) {
    prevProviderIdRef.current = selectedProviderId;
    checkHealth(selectedProviderId);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- checkHealthは参照安定性が保証されない
}, [selectedProviderId]);
```

#### 4.3.3 SkillSelector.tsx

```typescript
// 修正後
const handleRescan = useCallback(() => {
  rescanSkills();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- rescanSkillsは参照安定性が保証されない
}, []);
```

---

## 5. 受入基準

### 5.1 機能要件

| ID     | 要件                                                    | 優先度 | 検証方法        |
| ------ | ------------------------------------------------------- | ------ | --------------- |
| AC-001 | SettingsViewを開いても無限ローディングが発生しない      | 必須   | 手動テスト      |
| AC-002 | 認証方式初期化（initializeAuthMode）が1回だけ実行される | 必須   | console.log確認 |
| AC-003 | LLMSelectorPanelのfetchProvidersが1回だけ実行される     | 必須   | console.log確認 |
| AC-004 | LLMSelectorPanelのcheckHealthがprovider変更時のみ実行   | 必須   | 手動テスト      |
| AC-005 | SkillSelectorのrescanSkillsが手動操作時のみ実行される   | 必須   | 手動テスト      |
| AC-006 | TypeScriptの型エラーが発生しない                        | 必須   | pnpm typecheck  |
| AC-007 | ESLintエラーが発生しない（既存警告除く）                | 必須   | pnpm lint       |
| AC-008 | 既存の単体テストがすべてPASS                            | 必須   | pnpm test       |

### 5.2 非機能要件

| ID      | 要件                                            | 優先度 |
| ------- | ----------------------------------------------- | ------ |
| NFR-001 | 修正後のレンダリングパフォーマンスが劣化しない  | 必須   |
| NFR-002 | React StrictModeでも二重実行が発生しない        | 必須   |
| NFR-003 | 将来のStore Hooks再設計の妨げにならない修正方法 | 推奨   |

### 5.3 完了条件チェックリスト

- [ ] SettingsViewのuseEffect依存配列をuseRefパターンに修正
- [ ] LLMSelectorPanelのuseEffect依存配列をuseRefパターンに修正
- [ ] SkillSelectorのuseCallback依存配列を確認・修正
- [ ] `pnpm typecheck` がパス
- [ ] `pnpm lint` がパス（または既存警告のみ）
- [ ] 既存テストがPASS
- [ ] 手動テスト：設定画面で無限ループしない
- [ ] 手動テスト：LLM選択が正常動作
- [ ] 手動テスト：スキル選択が正常動作

---

## 6. 検証方法

| テスト種別 | 検証内容                 | 実行コマンド/手順            |
| ---------- | ------------------------ | ---------------------------- |
| 型チェック | TypeScript型エラーなし   | `pnpm typecheck`             |
| Lint       | ESLintエラーなし         | `pnpm lint`                  |
| 単体テスト | 既存テストがPASS         | `pnpm test -- --run`         |
| 手動テスト | 設定画面で無限ループなし | アプリ起動 → 設定画面開く    |
| 手動テスト | LLM選択が正常動作        | LLM選択ドロップダウン操作    |
| 手動テスト | スキル選択が正常動作     | スキル選択ドロップダウン操作 |

---

## 7. リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                   |
| ---------------------------------- | ------ | -------- | ---------------------- |
| 初期化が2回実行される可能性        | 中     | 低       | useRefでガード         |
| ESLint exhaustive-depsの警告       | 低     | 高       | コメントで意図を明示   |
| 他の場所で同様のパターンがある     | 中     | 中       | grepで全体検索して確認 |
| テストでuseRefの動作を確認できない | 低     | 中       | 手動テストで確認       |

---

## 8. 実装順序

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

## 9. 関連ドキュメント

### 9.1 システム仕様書

| 仕様書                        | 関連セクション                                   |
| ----------------------------- | ------------------------------------------------ |
| arch-state-management.md      | Zustand設計原則、リスナー管理                    |
| ui-ux-design-principles.md    | フィードバック設計                               |
| ui-ux-settings.md             | 設定画面UI/UX仕様                                |
| testing-component-patterns.md | コンポーネントテストパターン、Storeモッキング    |
| 06-known-pitfalls.md          | P5: リスナー二重登録、**P31: Zustand無限ループ** |

### 9.2 関連ファイル

| 種別          | パス                                                            |
| ------------- | --------------------------------------------------------------- |
| Store定義     | `apps/desktop/src/renderer/store/index.ts`                      |
| authModeSlice | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`       |
| SettingsView  | `apps/desktop/src/renderer/views/SettingsView/index.tsx`        |
| LLMSelector   | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx` |
| SkillSelector | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`  |

### 9.3 ワークフロードキュメント

| ドキュメント      | パス                                                                             |
| ----------------- | -------------------------------------------------------------------------------- |
| タスク仕様書      | `docs/30-workflows/auth-mode-store-fix/task-ut-fix-store-hooks-infinite-loop.md` |
| Phase 1: 要件定義 | `docs/30-workflows/auth-mode-store-fix/phase-1-requirements.md`                  |
| Phase 2: 設計     | `docs/30-workflows/auth-mode-store-fix/phase-2-design.md`                        |

---

## 10. 将来タスク（アーキテクチャ改善）

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

---

## 変更履歴

| 日付       | バージョン | 変更内容                     |
| ---------- | ---------- | ---------------------------- |
| 2026-02-10 | 1.0.0      | 初版作成（Phase 1, 2を統合） |
