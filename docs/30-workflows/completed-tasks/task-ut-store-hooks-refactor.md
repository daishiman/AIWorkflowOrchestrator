# Store Hooksを個別セレクタベースに再設計 - タスク指示書

## メタ情報

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| タスクID     | UT-STORE-HOOKS-REFACTOR-001                               |
| タスク名     | Store Hooksを個別セレクタベースに再設計                   |
| 分類         | リファクタリング                                          |
| 対象機能     | Zustand Store Hooks（authModeStore, llmStore等）          |
| 優先度       | 中                                                        |
| 見積もり規模 | 中規模                                                    |
| ステータス   | 未実施                                                    |
| 発見元       | TASK-UT-AUTH-MODE-UI-INTEGRATION タスク仕様書 セクション8 |
| 発見日       | 2026-02-09                                                |
| issue_number | 771                                                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UT-AUTH-MODE-UI-INTEGRATIONの実装中に、`useAuthModeStore()`等の合成Store Hooksが毎回新しいオブジェクトを返すため、その中の関数を`useEffect`の依存配列に含めると無限ループが発生する問題を発見した（P31: Zustand Store Hooks無限ループ）。

現在は短期対策として`useRef`ガードと依存配列を空にする対処を行っているが、これは根本的な解決ではない。

### 1.2 問題点・課題

- `useAuthModeStore()`が返すオブジェクトが毎回新しい参照を持つ
- `useEffect`の依存配列に関数を含めると無限ループが発生
- `useRef`ガードは回避策であり、コードの意図が不明確になる
- 同様のパターンが`useLLMStore()`等の他のStoreにも存在する可能性がある

### 1.3 放置した場合の影響

- 開発者が同様の問題に遭遇し、デバッグに時間を浪費する
- `useRef`ガードが散在し、コードの保守性が低下する
- ESLint exhaustive-deps警告を無視するパターンが増加する

---

## 2. 何を達成するか（What）

### 2.1 目的

Zustand Store Hooksを個別セレクタベースに再設計し、安定した参照を持つHooksを提供する。

### 2.2 最終ゴール

- 各Store Hookが安定した参照を返すように再設計されている
- `useEffect`の依存配列に関数を含めても無限ループが発生しない
- 既存の`useRef`ガードが不要になり、削除されている
- ESLint exhaustive-deps警告なしで正しく動作する

### 2.3 スコープ

#### 含むもの

- `useAuthModeStore`の個別セレクタ化（`useAuthMode()`, `useSetAuthMode()`等）
- `useLLMStore`の個別セレクタ化（必要に応じて）
- 関連するコンポーネントのHook呼び出し更新
- 既存の`useRef`ガードの削除
- 単体テスト・統合テスト

#### 含まないもの

- 全Storeの一括リファクタリング（段階的に実施）
- Store構造自体の変更

### 2.4 成果物

- 更新された`authModeStore.ts`（個別セレクタ追加）
- 更新されたコンポーネント（`SettingsView.tsx`, `LLMSelectorPanel.tsx`等）
- 単体テスト

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Zustandのセレクタパターンを理解していること
- 現在の問題箇所（P31）を把握していること

### 3.2 依存タスク

| タスクID                         | タスク名              | ステータス |
| -------------------------------- | --------------------- | ---------- |
| TASK-UT-AUTH-MODE-UI-INTEGRATION | AuthMode UI統合タスク | 完了       |

### 3.3 必要な知識

- Zustandセレクタパターン（shallow比較、個別フック）
- React Hooks依存配列の仕組み
- TypeScriptジェネリクス

### 3.4 推奨アプローチ

#### 個別セレクタパターン

```typescript
// 現在の問題あるパターン
export const useAuthModeStore = () => ({
  authMode: useStore((s) => s.authMode),
  initializeAuthMode: useStore((s) => s.initializeAuthMode),
  // ...毎回新しいオブジェクトが生成される
});

// 推奨パターン: 個別セレクタ
export const useAuthMode = () => useStore((s) => s.authMode);
export const useSetAuthMode = () => useStore((s) => s.setAuthMode);
export const useInitializeAuthMode = () =>
  useStore((s) => s.initializeAuthMode);
// 関数参照は安定している
```

#### コンポーネント側の更新

```typescript
// 修正前
const { initializeAuthMode } = useAuthModeStore();
const initRef = useRef(false);
useEffect(() => {
  if (!initRef.current) {
    initRef.current = true;
    initializeAuthMode();
  }
}, []);

// 修正後
const initializeAuthMode = useInitializeAuthMode();
useEffect(() => {
  initializeAuthMode();
}, [initializeAuthMode]); // 安定した参照なので無限ループしない
```

---

## 4. 実行手順

### Phase構成

2フェーズ構成（リファクタリング・検証）

### Phase 1: 個別セレクタ実装

#### 目的

authModeStoreに個別セレクタを追加し、コンポーネントを更新する

#### 手順

1. `authModeStore.ts`に個別セレクタを追加
2. `SettingsView.tsx`のHook呼び出しを更新
3. `LLMSelectorPanel.tsx`のHook呼び出しを更新
4. `SkillSelector.tsx`のHook呼び出しを更新
5. `useRef`ガードを削除
6. 単体テストを更新

#### 成果物

- 更新された`authModeStore.ts`
- 更新されたコンポーネント群
- 単体テスト

#### 完了条件

- 無限ループが発生しない
- ESLint警告が出ない
- 全テストがパスする

### Phase 2: 検証・ドキュメント

#### 目的

動作確認とドキュメント更新

#### 手順

1. 手動テストで設定画面の動作を確認
2. `06-known-pitfalls.md`のP31を更新（解決策を追記）
3. `arch-state-management.md`にベストプラクティスを追記

#### 成果物

- テスト結果レポート
- ドキュメント更新

#### 完了条件

- 手動テストで問題なし
- ドキュメントが更新されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 個別セレクタが実装されている
- [ ] `useRef`ガードが削除されている
- [ ] `useEffect`依存配列が正しく設定されている
- [ ] 無限ループが発生しない

### 品質要件

- [ ] 単体テストがすべてパスする
- [ ] ESLint警告が出ない
- [ ] TypeScript型エラーが発生しない

### ドキュメント要件

- [ ] `06-known-pitfalls.md`が更新されている
- [ ] `arch-state-management.md`にベストプラクティスが追記されている

---

## 6. 検証方法

### テストケース

| No. | テストケース              | 期待結果                       |
| --- | ------------------------- | ------------------------------ |
| 1   | 設定画面を開く            | 無限ループせず正常に表示される |
| 2   | 認証方式を切り替える      | 状態が正しく更新される         |
| 3   | LLMプロバイダーを選択する | 選択が正しく反映される         |
| 4   | スキルを選択する          | スキルが正しく選択される       |

### 検証手順

1. 単体テストを実行し全パスを確認
2. 開発サーバーで設定画面を開き、無限ループしないことを確認
3. 各設定項目を操作し、正常に動作することを確認

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                              |
| ---------------------------- | ------ | -------- | --------------------------------- |
| 既存コードへの影響範囲が広い | 中     | 中       | 段階的に移行、旧APIも一時的に維持 |
| セレクタ増加による管理複雑化 | 低     | 中       | 命名規則を統一、ドキュメント化    |
| テストカバレッジの低下       | 中     | 低       | 移行時にテストも同時に更新        |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/rules/03-state-management.md` - Zustand設計原則
- `.claude/rules/06-known-pitfalls.md` - P31: Zustand Store Hooks無限ループ
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` - 状態管理パターン

### 関連ファイル

- `apps/desktop/src/renderer/store/authModeStore.ts`
- `apps/desktop/src/renderer/views/SettingsView/index.tsx`
- `apps/desktop/src/renderer/components/settings/LLMSettings/LLMSelectorPanel.tsx`
- `apps/desktop/src/renderer/components/skill/SkillSelector/index.tsx`

---

## 9. 備考

### レビュー指摘の原文

```
タスク仕様書 セクション8 スコープ外項目（将来対応として検討）:
UT-STORE-HOOKS-REFACTOR-001: Store Hooksを個別セレクタベースに再設計
現状のuseAuthModeStore()が毎回新しいオブジェクトを返すため、useEffectの依存配列に
含めると無限ループする問題がある。短期対策としてuseRefガードを使用しているが、
長期的には個別セレクタ（useAuthMode(), useSetAuthMode()等）に再設計すべき。
```

### 補足事項

- 本タスクはauthModeStoreを主なターゲットとするが、同様のパターンを持つ他のStoreにも適用可能
- Zustandの公式ドキュメントでも個別セレクタパターンが推奨されている
