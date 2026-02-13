# AgentView 無限ループ修正 - タスク指示書

## メタ情報

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | UT-FIX-AGENTVIEW-INFINITE-LOOP-001             |
| タスク名     | AgentView useCallback/useEffect 無限ループ修正 |
| 分類         | バグ修正                                       |
| 対象機能     | AgentView コンポーネント（スキル管理画面）     |
| 優先度       | 高                                             |
| 見積もり規模 | 中規模                                         |
| ステータス   | 完了                                           |
| 発見元       | 手動テスト（DevToolsコンソールログ確認）       |
| 発見日       | 2026-02-12                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-STORE-HOOKS-REFACTOR-001 および UT-STORE-HOOKS-COMPONENT-MIGRATION-001 にて、P31（Zustand Store Hooks無限ループ）対策として個別セレクタへの移行が行われた。SettingsView、LLMSelectorPanel、SkillSelector は移行完了したが、**AgentView は移行対象に含まれなかった**。

AgentView はスキル管理の主要画面であり、マウント時に以下のデバッグログが無限に出力される：

```
[AgentView][DEBUG] Render # 1
[AgentView][DEBUG] useEffect triggered - fetchSkills reference changed
```

### 1.2 問題点・課題

AgentView (`apps/desktop/src/renderer/views/AgentView/index.tsx`) で以下の無限ループパターンが存在する：

1. **Store アクションを `useAppStore` のインラインセレクタで取得**（L108, L117, L118）：

   ```typescript
   const setSkills = useAppStore((state) => state.setSkills);
   const setLoading = useAppStore((state) => state.setLoading);
   const setError = useAppStore((state) => state.setError);
   ```

2. **取得したアクションを `useCallback` の依存配列に含めている**（L145-161）：

   ```typescript
   const fetchSkills = useCallback(async () => {
     setLoading(true);
     setError(null);
     // ...
     setSkills(imported as unknown as Skill[]);
   }, [setSkills, setLoading, setError]); // ← 依存配列
   ```

3. **`fetchSkills` を `useEffect` の依存配列に含めている**（L175-180）：

   ```typescript
   useEffect(() => {
     fetchSkills();
   }, [fetchSkills]); // ← fetchSkills が変わるたびに再実行
   ```

4. **`persist` ミドルウェアの rehydration および `devtools` により、Store の関数参照が不安定になり、`setSkills`/`setLoading`/`setError` の参照が変化 → `fetchSkills` が再生成 → `useEffect` が再トリガー → 無限ループ**

### 1.3 放置した場合の影響

- AgentView 表示時にCPU使用率が高止まりし、アプリケーション全体のパフォーマンスが劣化する
- `window.electronAPI.skill.getImported()` が無限に呼び出され、IPC通信が過負荷になる
- React StrictMode の二重実行と相まって、ループ速度が倍増する
- ユーザーが AgentView を開くたびにバッテリー消費が増大する

---

## 2. 何を達成するか（What）

### 2.1 目的

AgentView コンポーネントの無限ループを解消し、スキル一覧の取得をマウント時の1回（StrictMode考慮で2回）のみに制限する。

### 2.2 最終ゴール

- AgentView を開いた際に `fetchSkills` が1回のみ実行される（StrictModeでは2回まで許容）
- `[AgentView][DEBUG] useEffect triggered` のログが1回（StrictModeで2回）のみ出力される
- 既存の全テストがPASSする

### 2.3 スコープ

#### 含むもの

- `AgentView/index.tsx` の `useCallback`/`useEffect` パターンの修正
- AgentView内の Store アクション取得方法の見直し
- 修正後のデバッグログ削除
- 関連する既存テストの更新

#### 含まないもの

- agentSlice 自体のリファクタリング（既に `fetchSkills` アクションが存在するが、AgentView独自の `fetchSkills` とは異なるロジック）
- 他コンポーネントの個別セレクタ移行（既に完了済み）
- Store 全体の `persist`/`devtools` ミドルウェアの変更

### 2.4 成果物

| 成果物                           | パス                                                        |
| -------------------------------- | ----------------------------------------------------------- |
| 修正されたAgentView              | `apps/desktop/src/renderer/views/AgentView/index.tsx`       |
| 更新されたテスト（必要に応じて） | `apps/desktop/src/renderer/views/AgentView/__tests__/*.tsx` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-STORE-HOOKS-REFACTOR-001 完了済み（個別セレクタが `store/index.ts` に定義済み）
- UT-STORE-HOOKS-COMPONENT-MIGRATION-001 完了済み（他コンポーネントの移行パターンが参考になる）

### 3.2 依存タスク

- なし（即時着手可能）

### 3.3 必要な知識

- Zustand の個別セレクタパターンと参照安定性の仕組み
- React `useCallback`/`useEffect` の依存配列メカニズム
- P31（06-known-pitfalls.md）の解決パターン
- `persist` ミドルウェアの rehydration が関数参照に与える影響

### 3.4 推奨アプローチ

**アプローチA（推奨）: AgentView の独自 `fetchSkills` を廃止し、agentSlice の `fetchSkills` アクションを使用**

agentSlice にはすでに `fetchSkills` アクション（L556-577）が定義されている。AgentView は `useCallback` で独自の `fetchSkills` を再実装しているが、これを agentSlice のアクションに統一する：

```typescript
// Before（無限ループ）
const setSkills = useAppStore((state) => state.setSkills);
const setLoading = useAppStore((state) => state.setLoading);
const setError = useAppStore((state) => state.setError);
const fetchSkills = useCallback(async () => {
  setLoading(true);
  // ...
}, [setSkills, setLoading, setError]);

// After（個別セレクタ + Sliceアクション使用）
const fetchSkills = useAppStore((state) => state.fetchSkills);
// ※ agentSlice の fetchSkills は内部で isLoadingSkills, skillError を使用
```

ただし、agentSlice の `fetchSkills` は `isLoadingSkills`/`skillError` を使い、AgentView の独自版は `isLoading`/`error` を使用しているため、**ロジックの違いに注意が必要**：

| 項目         | AgentView独自版      | agentSlice版                                 |
| ------------ | -------------------- | -------------------------------------------- |
| ローディング | `isLoading`          | `isLoadingSkills`                            |
| エラー       | `error`              | `skillError`                                 |
| 取得内容     | `getImported()` のみ | `list()` + `getImported()`                   |
| 設定先       | `skills`             | `availableSkillsMetadata` + `importedSkills` |

この差異を考慮した上で、以下のどちらかを選択する：

- **A-1**: agentSlice の `fetchSkills` をそのまま使い、AgentView の表示を `importedSkills`/`isLoadingSkills`/`skillError` に切り替える
- **A-2**: AgentView 用の新しい Slice アクション `fetchImportedSkills` を agentSlice に追加する

**アプローチB（短期対策）: useRef ガードで無限ループを防止**

UT-FIX-STORE-HOOKS-INFINITE-LOOP-001 の短期対策パターンを適用：

```typescript
const fetchSkillsRef = useRef(false);
useEffect(() => {
  if (!fetchSkillsRef.current) {
    fetchSkillsRef.current = true;
    fetchSkills();
  }
}, []);
```

**アプローチBは非推奨**（P31の長期解決策が既に実装済みのため、一貫性を保つためアプローチAを選択すべき）。

---

## 4. 実行手順

### Phase構成

| Phase | 名称             | 目的                           |
| ----- | ---------------- | ------------------------------ |
| 1-3   | 設計・レビュー   | AgentView のデータフロー再設計 |
| 4     | テスト作成       | 無限ループ防止テスト追加       |
| 5     | 実装             | AgentView の修正               |
| 6-7   | テスト拡充・確認 | カバレッジ確認                 |
| 8-9   | リファクタ・品質 | コード品質検証                 |
| 10    | 最終レビュー     | 動作確認                       |

### Phase 5: 実装（コア）

#### 目的

AgentView の `useCallback`/`useEffect` 無限ループを解消する。

#### 手順

1. AgentView で使用している Store 状態/アクションを整理する
2. `useCallback` で定義している `fetchSkills` を廃止し、以下のいずれかに置換：
   - agentSlice の `fetchSkills` アクションを個別セレクタで取得
   - または agentSlice に `fetchImportedSkills` を新設
3. `useEffect` の依存配列を修正（空配列 `[]` にするか、安定した関数参照のみ含める）
4. AgentView が参照する状態を `isLoading`/`error`/`skills` から `isLoadingSkills`/`skillError`/`importedSkills` に変更する（アプローチA-1の場合）
5. `fetchAvailableSkills` の `useCallback` も同様に修正する
6. デバッグ用の `console.log` と `renderCount` を削除する

#### 修正対象ファイル

- `apps/desktop/src/renderer/views/AgentView/index.tsx`
- `apps/desktop/src/renderer/store/slices/agentSlice.ts`（アプローチA-2の場合のみ）

#### 成果物

- 修正された AgentView コンポーネント

#### 完了条件

- AgentView を開いた際に `fetchSkills` が1回のみ実行される
- 既存テストが全てPASSする

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] AgentView マウント時にスキル一覧が1回だけ取得される
- [ ] スキル一覧が正しく表示される
- [ ] スキルの検索・フィルタリングが動作する
- [ ] スキルのインポート・削除・実行が動作する
- [ ] トースト通知が正しく表示される

### 品質要件

- [ ] `pnpm --filter @repo/desktop typecheck` がPASS
- [ ] `pnpm --filter @repo/desktop lint` がPASS
- [ ] 関連テストが全てPASS
- [ ] DevTools コンソールに無限ループのログが出力されない
- [ ] `useCallback` の依存配列に Store アクション関数を含めない（または個別セレクタで安定した参照を使用）

### ドキュメント要件

- [ ] P31 の解決済みステータスにこのタスクを追加（06-known-pitfalls.md）
- [ ] Phase 12 の成果物を作成（該当する場合）

---

## 6. 検証方法

### テストケース

1. AgentView をマウントした際に `fetchSkills` が1回のみ呼び出されることを確認するテスト
2. AgentView のスキル一覧表示テスト（既存テスト更新）
3. Store の状態変更が AgentView の再レンダーを過剰に引き起こさないことを確認するテスト

### 検証手順

1. `pnpm --filter @repo/desktop dev` でアプリを起動
2. AgentView（Agent画面）に遷移
3. DevTools コンソールを確認し、無限ループのログが出力されないことを確認
4. スキル一覧が正しく表示されることを確認
5. 他の画面に遷移して戻った際にも無限ループが発生しないことを確認

---

## 7. リスクと対策

| リスク                                                                               | 影響度 | 発生確率 | 対策                                             |
| ------------------------------------------------------------------------------------ | ------ | -------- | ------------------------------------------------ |
| agentSlice の `fetchSkills` と AgentView の独自版のロジック差異                      | 中     | 高       | 両者のデータフローを事前に比較し、統一方針を決定 |
| `isLoading`/`error` から `isLoadingSkills`/`skillError` への切り替えで既存テスト破壊 | 中     | 中       | テストの入力/出力を事前に確認し、段階的に修正    |
| `persist` ミドルウェアが新しい状態キーを永続化してしまう                             | 低     | 低       | `partialize` で永続化対象を制限済みか確認        |
| P21パターン（DI追加時の大規模テスト修正）                                            | 低     | 低       | AgentView 固有の修正のため影響範囲は限定的       |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/rules/06-known-pitfalls.md#P31` - Zustand Store Hooks無限ループ
- `.claude/rules/03-state-management.md` - 状態管理ルール
- `docs/30-workflows/UT-STORE-HOOKS-REFACTOR-001/` - 個別セレクタ再設計タスク
- `docs/30-workflows/UT-STORE-HOOKS-COMPONENT-MIGRATION-001/` - コンポーネント移行タスク

### 関連完了タスク

- `03b-task-fix-6-1-state-centralization.md` - AgentView ローカルstate排除（完了済み）
- UT-STORE-HOOKS-REFACTOR-001 - 個別セレクタ再設計（完了済み）
- UT-STORE-HOOKS-COMPONENT-MIGRATION-001 - SettingsView/LLMSelectorPanel/SkillSelector 移行（完了済み）

### 関連Pitfall

- P31: Zustand Store Hooks無限ループ
- P5: リスナー二重登録（StrictMode関連）

### 対象ソースコード

| ファイル                                               | 行番号   | 内容                                     |
| ------------------------------------------------------ | -------- | ---------------------------------------- |
| `apps/desktop/src/renderer/views/AgentView/index.tsx`  | L96-118  | Store state/actions のインラインセレクタ |
| `apps/desktop/src/renderer/views/AgentView/index.tsx`  | L145-161 | `fetchSkills` の `useCallback` 定義      |
| `apps/desktop/src/renderer/views/AgentView/index.tsx`  | L175-180 | `fetchSkills` の `useEffect` トリガー    |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts` | L556-577 | agentSlice の `fetchSkills` アクション   |
| `apps/desktop/src/renderer/store/index.ts`             | L491     | 個別セレクタ `useFetchSkills`            |

---

## 9. 備考

### 根本原因の詳細分析

無限ループの発生メカニズム：

```
① AgentView マウント
↓
② useAppStore((state) => state.setSkills) 等でアクション取得
↓
③ useCallback(fetchSkills, [setSkills, setLoading, setError]) 生成
↓
④ useEffect(() => fetchSkills(), [fetchSkills]) 実行
↓
⑤ fetchSkills() 内で setLoading(true) → Store 状態変更
↓
⑥ persist ミドルウェアの rehydration / devtools の状態更新
↓
⑦ Store の状態変更によりコンポーネント再レンダー
↓
⑧ setSkills/setLoading/setError の参照が変化（persist/devtools起因）
↓
⑨ useCallback が新しい fetchSkills を生成
↓
⑩ useEffect が再トリガー → ④に戻る（無限ループ）
```

### UT-STORE-HOOKS-COMPONENT-MIGRATION-001 で AgentView が漏れた理由

UT-STORE-HOOKS-COMPONENT-MIGRATION-001 の対象は「合成Store Hook（`useAuthModeStore()`等）を使用しているコンポーネント」に限定されていた。AgentView は合成Store Hookではなく `useAppStore` のインラインセレクタを直接使用していたため、移行対象から漏れた。しかし、インラインセレクタであっても `useCallback` の依存配列にアクション関数を含めると、`persist`/`devtools` ミドルウェアの影響で参照が不安定になり、同様の無限ループが発生する。

### 補足事項

- agentSlice には `fetchSkills`（L227, L556-577）と、AgentView独自の `fetchSkills`（L145-161）の2つが存在する。前者は `list()` + `getImported()` を呼び、`availableSkillsMetadata` + `importedSkills` に格納する。後者は `getImported()` のみ呼び、`skills` に格納する。この二重構造自体が技術的負債であり、統一が望ましい。
