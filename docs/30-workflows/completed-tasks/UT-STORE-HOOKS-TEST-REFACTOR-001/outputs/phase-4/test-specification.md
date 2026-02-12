# Phase 4: テスト作成（Red） - テスト仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| タスクID   | UT-STORE-HOOKS-TEST-REFACTOR-001 |
| Phase      | 4                                |
| 作成日     | 2026-02-12                       |
| ステータス | 完了                             |

---

## 概要

`agentSlice.selectors.test.ts` を `getState()` パターンから `renderHook` パターンへ移行するためのテスト仕様を作成。

## テストカテゴリ設計

| カテゴリ | 名称                   | テスト数 | 説明                                            |
| -------- | ---------------------- | -------- | ----------------------------------------------- |
| CAT-01   | 状態セレクタ初期値     | 13       | 全13個の状態セレクタの初期値検証                |
| CAT-02   | 状態セレクタ値取得     | 7        | setState後のセレクタ値取得検証                  |
| CAT-03   | アクションセレクタ存在 | 10       | 全10個のアクションセレクタの関数型検証          |
| CAT-04   | アクション実行         | 3        | 同期アクション（selectSkillByName等）の実行検証 |
| CAT-05   | 関数参照安定性         | 4        | rerender後のアクション参照安定性検証            |
| CAT-06   | 再レンダー最適化       | 2        | 無関係な状態変更時の再レンダー回避検証          |
| CAT-07   | 無限ループ防止（P31）  | 3        | useEffect内でのアクション使用安全性検証         |
| CAT-08   | 非同期アクション       | 4        | fetchSkills、rescanSkills等の非同期処理検証     |
| CAT-09   | エラーハンドリング     | 2        | API失敗時のエラー状態検証                       |
| -        | 個別セレクタexport     | 23       | store/index.tsからの全23個exportの検証          |

## 移行パターン

### Before（getState()パターン）

```typescript
const store = create<AgentSlice>()(agentSlice);
const state = store.getState();
expect(state.availableSkillsMetadata).toEqual([]);
```

### After（renderHookパターン）

```typescript
const { result } = renderHook(() => useAvailableSkillsMetadata());
expect(result.current).toEqual([]);
```

## テスト環境要件

- `@vitest-environment happy-dom` ディレクティブ
- `localStorage` ポリフィル
- `window.electronAPI` 完全モック（authMode + llm + skill セクション）
- `useAppStore` 統合ストア使用

## 成果物

テストコード: `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.selectors.test.ts`
