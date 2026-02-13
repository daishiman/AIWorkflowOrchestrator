# Phase 1: 要件定義書 - AgentView無限ループ修正

## メタ情報

| 項目        | 値                                   |
| ----------- | ------------------------------------ |
| タスクID    | UT-FIX-AGENTVIEW-INFINITE-LOOP-001   |
| Phase       | 1                                    |
| 機能名      | AgentView無限ループ修正              |
| 分類        | バグ修正                             |
| 作成日      | 2026-02-12                           |
| 関連Pitfall | P31（Zustand Store Hooks無限ループ） |
| ステータス  | 完了                                 |

## 目的

AgentViewコンポーネントで発生する`useCallback`/`useEffect`連鎖による無限ループを解消し、`fetchSkills`がマウント時に有限回（StrictMode含め最大2回）で収束する状態へ修正する。

---

## 1. 現状分析

### 1.1 無限ループの原因

AgentView（`apps/desktop/src/renderer/views/AgentView/index.tsx`）で以下の連鎖パターンが無限ループを引き起こしている。

**発生箇所と流れ:**

1. **Lines 108-118**: インラインセレクタでStoreアクションを取得

```typescript
const setSkills = useAppStore((state) => state.setSkills);
const setLoading = useAppStore((state) => state.setLoading);
const setError = useAppStore((state) => state.setError);
```

2. **Lines 145-161**: `fetchSkills`を`useCallback`で定義し、依存配列に`[setSkills, setLoading, setError]`を含む

```typescript
const fetchSkills = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const imported = await window.electronAPI.skill.getImported();
    setSkills(imported as unknown as Skill[]);
  } catch (err) {
    setError(/* ... */);
  } finally {
    setLoading(false);
  }
}, [setSkills, setLoading, setError]);
```

3. **Lines 175-180**: `useEffect`で`fetchSkills`を依存配列に含めて実行

```typescript
useEffect(() => {
  fetchSkills();
}, [fetchSkills]);
```

4. **ループメカニズム**:
   - `fetchSkills`実行 -> `setSkills`でStore状態更新
   - Store状態更新 -> AgentViewコンポーネント再レンダー
   - 再レンダー -> `useAppStore((state) => state.setSkills)`が新しい関数参照を返す可能性
   - 新しい関数参照 -> `useCallback`の`fetchSkills`参照が変化
   - `fetchSkills`参照変化 -> `useEffect`が再トリガー
   - `useEffect`再トリガー -> `fetchSkills`再実行 -> 無限ループ

**根本原因**: `useAppStore((state) => state.setSkills)`のようなインラインセレクタは、Zustandの実装上、Storeの状態が変化するたびにセレクタ関数が再評価される。アクション関数自体は安定した参照を持つが、Store更新によるコンポーネント再レンダー時にセレクタの返却値の同一性判定が失敗し、参照が変わったとみなされる場合がある。これがP31（Zustand Store Hooks無限ループ）パターンそのものである。

### 1.2 再現条件

| 条件         | 詳細                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------- |
| 発生トリガー | AgentViewコンポーネントがマウントされた時                                                   |
| 確認方法1    | デバッグログ `[AgentView][DEBUG] Render #` が無限に出力される                               |
| 確認方法2    | `[AgentView][DEBUG] useEffect triggered - fetchSkills reference changed` が無限に出力される |
| 確認方法3    | ブラウザDevToolsのConsoleタブでログカウントが急激に増加する                                 |
| 確認方法4    | CPU使用率が異常に高くなり、UIが応答不能になる                                               |

### 1.3 影響範囲

| 対象           | ファイルパス                                                             | 影響内容                                   |
| -------------- | ------------------------------------------------------------------------ | ------------------------------------------ |
| 修正対象（主） | `apps/desktop/src/renderer/views/AgentView/index.tsx`                    | useCallback/useEffect連鎖の修正            |
| 修正対象（副） | `apps/desktop/src/renderer/store/index.ts`                               | 不足している個別セレクタHookの追加         |
| 参照確認       | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                   | スライス定義・アクション名の確認           |
| テスト対象     | `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx` | 既存テストの維持・無限ループ検出テスト追加 |

---

## 2. 個別セレクタHookのギャップ分析

### 2.1 store/index.ts に既に存在するセレクタ

以下のAgentSlice関連個別セレクタHookは既に定義済み:

| セレクタHook                    | 取得対象                         | 種別       |
| ------------------------------- | -------------------------------- | ---------- |
| `useFetchSkills()`              | `state.fetchSkills`              | アクション |
| `useImportedSkills()`           | `state.importedSkills`           | 状態       |
| `useAvailableSkillsMetadata()`  | `state.availableSkillsMetadata`  | 状態       |
| `useIsLoadingSkills()`          | `state.isLoadingSkills`          | 状態       |
| `useSkillError()`               | `state.skillError`               | 状態       |
| `useImportSkill()`              | `state.importSkill`              | アクション |
| `useRemoveSkill()`              | `state.removeSkill`              | アクション |
| `useSelectSkillByName()`        | `state.selectSkillByName`        | アクション |
| `useSelectedSkillName()`        | `state.selectedSkillName`        | 状態       |
| `useIsSkillExecuting()`         | `state.isExecuting`              | 状態       |
| `useSkillExecutionId()`         | `state.executionId`              | 状態       |
| `useSkillExecutionStatus()`     | `state.skillExecutionStatus`     | 状態       |
| `usePendingSkillPermission()`   | `state.pendingPermission`        | 状態       |
| `useIsScanningSkills()`         | `state.isScanning`               | 状態       |
| `useIsImportingSkill()`         | `state.isImporting`              | 状態       |
| `useImportingSkillName()`       | `state.importingSkillName`       | 状態       |
| `useRescanSkills()`             | `state.rescanSkills`             | アクション |
| `useExecuteSkill()`             | `state.executeSkill`             | アクション |
| `useAbortSkillExecution()`      | `state.abortExecution`           | アクション |
| `useRespondToSkillPermission()` | `state.respondToSkillPermission` | アクション |
| `useClearSkillError()`          | `state.clearSkillError`          | アクション |

### 2.2 AgentViewが使用しているが未定義のセレクタ

AgentView/index.tsxのコードから、以下の状態・アクションがインラインセレクタで取得されているが、store/index.tsに対応する個別セレクタHookが存在しない:

| 必要なセレクタHook          | 取得対象                   | 種別       | agentSlice上の定義                                |
| --------------------------- | -------------------------- | ---------- | ------------------------------------------------- |
| `useAgentSkills()`          | `state.skills`             | 状態       | `AgentState.skills: Skill[]`                      |
| `useAgentAvailableSkills()` | `state.availableSkills`    | 状態       | `AgentState.availableSkills: Skill[]`             |
| `useImportedSkillIds()`     | `state.importedSkillIds`   | 状態       | `AgentState.importedSkillIds: string[]`           |
| `useAgentSelectedSkill()`   | `state.selectedSkill`      | 状態       | `AgentState.selectedSkill: Skill \| null`         |
| `useSkillFilter()`          | `state.skillFilter`        | 状態       | `AgentState.skillFilter: string`                  |
| `useSkillCategory()`        | `state.skillCategory`      | 状態       | `AgentState.skillCategory: SkillCategory \| null` |
| `useIsImportDialogOpen()`   | `state.isImportDialogOpen` | 状態       | `AgentState.isImportDialogOpen: boolean`          |
| `useToastMessage()`         | `state.toastMessage`       | 状態       | `AgentState.toastMessage: {...} \| null`          |
| `useAgentIsLoading()`       | `state.isLoading`          | 状態       | `AgentState.isLoading: boolean`                   |
| `useAgentError()`           | `state.error`              | 状態       | `AgentState.error: string \| null`                |
| `useSetSkills()`            | `state.setSkills`          | アクション | `AgentActions.setSkills`                          |
| `useSetAvailableSkills()`   | `state.setAvailableSkills` | アクション | `AgentActions.setAvailableSkills`                 |
| `useSelectSkill()`          | `state.selectSkill`        | アクション | `AgentActions.selectSkill`                        |
| `useSetSkillFilter()`       | `state.setSkillFilter`     | アクション | `AgentActions.setSkillFilter`                     |
| `useSetSkillCategory()`     | `state.setSkillCategory`   | アクション | `AgentActions.setSkillCategory`                   |
| `useOpenImportDialog()`     | `state.openImportDialog`   | アクション | `AgentActions.openImportDialog`                   |
| `useCloseImportDialog()`    | `state.closeImportDialog`  | アクション | `AgentActions.closeImportDialog`                  |
| `useShowToast()`            | `state.showToast`          | アクション | `AgentActions.showToast`                          |
| `useClearToast()`           | `state.clearToast`         | アクション | `AgentActions.clearToast`                         |
| `useSetAgentLoading()`      | `state.setLoading`         | アクション | `AgentActions.setLoading`                         |
| `useSetAgentError()`        | `state.setError`           | アクション | `AgentActions.setError`                           |

**注意**: `useAgentIsLoading`/`useAgentError`は、store/index.ts に既存の`useAuthLoading`（同じ`state.isLoading`）と衝突する可能性がある。命名は`useAgent`プレフィックスで区別する。

---

## 3. 機能要件

### REQ-1: fetchSkillsの初回マウント時の単一実行

AgentViewの初回マウント時、`fetchSkills`（`window.electronAPI.skill.getImported()`呼び出し）が**1回だけ**実行されること。

**検証方法**: `window.electronAPI.skill.getImported`のモック呼び出し回数が1であることをアサーション。

### REQ-2: 画面再遷移時のfetchSkills再実行

AgentViewがunmount後にremountされた場合、`fetchSkills`が再度**1回だけ**実行されること。

**検証方法**: unmount -> remount 後に`getImported`の呼び出し回数が累計2であることをアサーション。

### REQ-3: スキル操作後のfetchSkills明示的実行

スキルインポート完了後およびスキル削除完了後に、`fetchSkills`が明示的に**1回だけ**実行されること。

**検証方法**: インポート/削除操作後の`getImported`呼び出し回数を検証。

### REQ-4: isLoading状態遷移の正常動作

`fetchSkills`実行中に`isLoading`（または`isLoadingSkills`）が`true`に設定され、完了後に`false`に遷移すること。UI上でローディング表示が正しく切り替わること。

**検証方法**: `isLoading`の状態遷移をテストで検証し、ローディングUI要素の表示・非表示をアサーション。

### REQ-5: エラー状態のUI表示

`fetchSkills`がエラーをスローした場合、`error`状態にエラーメッセージが設定され、エラーUIが表示されること。

**検証方法**: `getImported`がrejectするモックでエラーメッセージ表示をアサーション。

### REQ-6: エラー時の再試行

エラー表示時の「再試行」ボタン押下で`fetchSkills`が**1回だけ**再実行されること。

**検証方法**: 再試行ボタンクリック後の`getImported`呼び出し回数を検証。

---

## 4. 非機能要件

### NFREQ-1: デバッグログの除去

本番コードから以下のデバッグ用`console.log`を全て除去すること:

| 行番号（現時点） | 対象コード                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------- |
| Line 93          | `console.log("[AgentView][DEBUG] Render #", renderCount.current);`                       |
| Line 176-178     | `console.log("[AgentView][DEBUG] useEffect triggered - fetchSkills reference changed");` |

デバッグ用の`useRef(renderCount)`も同時に除去する（Line 91-92）。

### NFREQ-2: P31パターン準拠（個別セレクタHook使用）

P31（Zustand Store Hooks無限ループ）パターンの長期解決策に準拠し、以下を遵守すること:

1. `useAppStore((state) => state.xxx)`のインラインセレクタではなく、`store/index.ts`で定義された個別セレクタHookを使用する
2. `useCallback`の依存配列に含むアクション関数は、個別セレクタHookから取得する
3. 合成Store Hook（`useSkillStore()`等）の戻り値関数を`useEffect`依存配列に含めない

### NFREQ-3: 既存テストの互換性維持

既存の`AgentView.test.tsx`に含まれるテストケースが全てパスし続けること。破壊的変更を行わないこと。

### NFREQ-4: レンダリング回数の有限収束

AgentViewのレンダリング回数がマウント後に有限回（React StrictMode環境を考慮して最大4回程度）で収束すること。無限に増加しないこと。

---

## 5. 受け入れ基準

### AC-1: fetchSkillsの呼び出し回数検証

`fetchSkills`（`window.electronAPI.skill.getImported`）の呼び出しがマウントごとに1回であることをユニットテストで検証できる。

**テスト内容**:

```
Given: AgentViewがマウントされる
When: 初回レンダリングが完了する
Then: getImported の呼び出し回数が 1 である
```

### AC-2: useEffectの発火回数が有限

`useEffect`の発火回数が有限（最大2回: StrictMode含む）であることをテストで検証できる。

**テスト内容**:

```
Given: React StrictMode環境でAgentViewがマウントされる
When: 安定状態に達する（500ms以内）
Then: getImported の呼び出し回数が 2 以下である
```

### AC-3: デバッグログ不在の検証

`console.log`デバッグ文（`[AgentView][DEBUG]`）がプロダクションコードに含まれないこと。

**テスト内容**:

```
Given: AgentViewのソースコード
When: ファイル内容を検索する
Then: "[AgentView][DEBUG]" パターンが見つからない
```

### AC-4: 既存テストの全パス

既存の`AgentView.test.tsx`のテストケースが全てパスすること。

**テスト内容**:

```
Given: 既存テストスイート
When: pnpm vitest run で実行する
Then: AgentView関連テストが全てPASSする
```

### AC-5: 個別セレクタHook使用の検証

AgentView/index.tsxで`useAppStore((state) => state.xxx)`のインラインセレクタが使用されていないこと（全て個別セレクタHookに置換済みであること）。

**テスト内容**:

```
Given: AgentView/index.tsxのソースコード
When: useAppStore の呼び出しパターンを検索する
Then: useAppStore のインラインセレクタ呼び出しが 0 件である
```

---

## 6. スコープ定義

### 6.1 スコープ内

| 項目 | 対象ファイル                                                             | 作業内容                                                                      |
| ---- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| S1   | `apps/desktop/src/renderer/views/AgentView/index.tsx`                    | useCallback/useEffect連鎖の修正、インラインセレクタの個別セレクタHookへの置換 |
| S2   | `apps/desktop/src/renderer/store/index.ts`                               | 不足している個別セレクタHookの追加（セクション2.2の21個）                     |
| S3   | `apps/desktop/src/renderer/views/AgentView/index.tsx`                    | デバッグ用console.logとuseRef(renderCount)の除去                              |
| S4   | `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx` | 無限ループ検出テストの追加                                                    |
| S5   | `apps/desktop/src/renderer/store/__tests__/`                             | 新規個別セレクタHookのユニットテスト追加                                      |

### 6.2 スコープ外

| 項目                                                                    | 理由                                                                                                                      | 対処                                                  |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `agentSlice.ts`の型定義変更（Skill vs ImportedSkill）                   | 影響範囲が広く、別タスクで対応すべき                                                                                      | 既存の型アサーション（`as unknown as Skill[]`）を維持 |
| `SkillManagement.integration.test.tsx`の修正                            | UT-FIX-5-1-002で対応予定                                                                                                  | 別タスクとして管理                                    |
| 他コンポーネント（SettingsView, LLMSelectorPanel, SkillSelector）の修正 | UT-STORE-HOOKS-COMPONENT-MIGRATION-001で完了済み                                                                          | 対応不要                                              |
| agentSlice内のfetchSkills（Line 556-577）とAgentViewのfetchSkillsの統合 | agentSlice側にfetchSkillsが既に存在するが、AgentViewが使用しているのはローカルのfetchSkills。統合は設計フェーズ以降で検討 | Phase 2で設計判断                                     |

---

## 7. 統合テスト連携

### 7.1 API/IPC呼び出し

| API                                      | 呼び出しタイミング         | 期待回数          |
| ---------------------------------------- | -------------------------- | ----------------- |
| `window.electronAPI.skill.getImported()` | 初回マウント時             | 1回               |
| `window.electronAPI.skill.getImported()` | 再マウント時               | 1回（累計2回）    |
| `window.electronAPI.skill.list()`        | インポートダイアログ表示時 | 1回               |
| `window.electronAPI.skill.import()`      | スキルインポート実行時     | 各スキルにつき1回 |
| `window.electronAPI.skill.remove()`      | スキル削除実行時           | 1回               |
| `window.electronAPI.skill.execute()`     | スキル実行時               | 1回               |

### 7.2 状態遷移

| 状態                 | 初期値  | 遷移パターン                                         | 備考              |
| -------------------- | ------- | ---------------------------------------------------- | ----------------- |
| `isLoading`          | `false` | `false` -> `true` -> `false`                         | fetchSkills実行時 |
| `error`              | `null`  | `null` -> `string`（エラー時） -> `null`（再試行時） | エラーメッセージ  |
| `skills`             | `[]`    | `[]` -> `Skill[]`                                    | fetchSkills成功時 |
| `isImportDialogOpen` | `false` | `false` -> `true` -> `false`                         | ダイアログ開閉    |
| `toastMessage`       | `null`  | `null` -> `{type, message}` -> `null`（5秒後/手動）  | トースト通知      |

### 7.3 UI挙動

| シナリオ                     | 期待挙動                                                           |
| ---------------------------- | ------------------------------------------------------------------ |
| 初回表示                     | ローディング表示 -> スキル一覧表示                                 |
| 再遷移（unmount -> remount） | ローディング表示 -> スキル一覧表示（初回と同一挙動）               |
| フェッチエラー               | エラーメッセージ + 再試行ボタン表示                                |
| 再試行ボタン押下             | ローディング表示 -> スキル一覧表示（成功時）/ エラー表示（失敗時） |
| スキル削除後                 | トースト表示 + スキル一覧再取得                                    |
| スキルインポート後           | トースト表示 + ダイアログ閉 + スキル一覧再取得                     |

---

## 8. 設計上の検討事項（Phase 2へ引き継ぎ）

### 8.1 AgentView固有のfetchSkills vs agentSliceのfetchSkills

現在、AgentView内にローカルな`fetchSkills`（`useCallback`で定義）が存在し、`setLoading`/`setError`/`setSkills`を手動で管理している。一方、agentSlice内にも`fetchSkills`アクション（Line 556-577）が存在し、`isLoadingSkills`/`skillError`/`importedSkills`を管理している。

Phase 2で以下の設計判断が必要:

- **選択肢A**: AgentView固有のfetchSkillsを廃止し、agentSliceのfetchSkillsを使用する（推奨）
- **選択肢B**: AgentView固有のfetchSkillsを個別セレクタHookベースに修正して維持する

### 8.2 状態の二重管理問題

`isLoading`（AgentView用）と`isLoadingSkills`（agentSlice.fetchSkills用）が共存している。同様に`error`と`skillError`も共存。Phase 2でどちらを使用するか決定する。

---

## 9. 前提条件と依存関係

### 9.1 前提条件

| 前提                                            | 詳細                                                                                                 |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| UT-STORE-HOOKS-REFACTOR-001 完了済み            | 個別セレクタHookのパターンが確立されており、store/index.tsにAgentSlice関連セレクタが部分的に存在する |
| UT-STORE-HOOKS-COMPONENT-MIGRATION-001 完了済み | SettingsView, LLMSelectorPanel, SkillSelectorは個別セレクタ移行済み                                  |
| P31パターンの解決策が確立済み                   | 個別セレクタHookを使用することでZustandアクション参照が安定する                                      |

### 9.2 依存関係

| 依存先                                                 | 依存内容                                         |
| ------------------------------------------------------ | ------------------------------------------------ |
| `@repo/shared/types/skill`                             | `Skill`, `SkillCategory`型定義                   |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts` | `AgentState`, `AgentActions`インターフェース定義 |
| `apps/desktop/src/renderer/store/index.ts`             | `useAppStore`、既存個別セレクタHook              |

---

## 10. リスク分析

| リスク                                                     | 影響度 | 発生確率 | 対策                                                                                                                                  |
| ---------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 個別セレクタHook追加時の命名衝突                           | 中     | 低       | `useAgent`プレフィックスで既存Hook（`useAuthLoading`等）と区別                                                                        |
| AgentView固有fetchSkillsとagentSlice.fetchSkillsの挙動差異 | 高     | 中       | Phase 2で統合判断を行い、テストで挙動を検証                                                                                           |
| 既存テストのモック構造変更                                 | 中     | 中       | 個別セレクタHookのモック方式を事前に設計                                                                                              |
| fetchAvailableSkillsの同様の無限ループリスク               | 低     | 低       | `fetchAvailableSkills`はuseEffectの依存配列に入っていないため即座の問題はないが、`handleImportClick`経由で間接的に使用。Phase 5で確認 |

---

## 成果物

| 成果物     | パス                              | 説明   |
| ---------- | --------------------------------- | ------ |
| 要件定義書 | `outputs/phase-1/requirements.md` | 本文書 |

## 完了条件

- [x] 無限ループの原因が文章で説明されている（セクション1.1）
- [x] 受け入れ基準が検証可能な文で定義されている（セクション5: AC-1 - AC-5）
- [x] スコープ内とスコープ外が分離されている（セクション6）
- [x] 個別セレクタHookのギャップ分析が完了している（セクション2）
- [x] 統合テスト連携が記録されている（セクション7）
- [x] 設計フェーズへの引き継ぎ事項が明記されている（セクション8）
- [x] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 2: 設計（`phase-2-design.md`）

- 個別セレクタHookの命名規則確定
- AgentView固有fetchSkills vs agentSlice.fetchSkillsの設計判断
- 状態の二重管理問題の解決方針
