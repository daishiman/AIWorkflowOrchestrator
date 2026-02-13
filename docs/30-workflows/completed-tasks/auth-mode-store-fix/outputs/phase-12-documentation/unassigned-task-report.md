# 未タスク検出レポート

## メタ情報

| 項目     | 値                                   |
| -------- | ------------------------------------ |
| タスクID | UT-FIX-STORE-HOOKS-INFINITE-LOOP-001 |
| Phase    | 12                                   |
| 検出日   | 2026-02-10                           |
| 検出者   | Claude Code                          |

---

## 検出ソース確認

| #   | ソース                   | 確認結果 | 検出件数 |
| --- | ------------------------ | -------- | -------- |
| 1   | Phase 3 レビュー結果     | 確認完了 | 0件      |
| 2   | Phase 10 レビュー結果    | 確認完了 | 1件      |
| 3   | Phase 11 手動テスト結果  | 確認完了 | 0件      |
| 4   | 各Phase成果物            | 確認完了 | 1件      |
| 5   | コードベースのTODO/FIXME | 確認完了 | 0件      |

**合計検出件数**: 2件

---

## 検出された未タスク

### UT-1: Store Hooksを個別セレクタベースに再設計

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| 未タスクID | UT-STORE-HOOKS-REFACTOR-001                |
| 検出元     | タスク仕様書セクション8（長期的改善案）    |
| 優先度     | 中                                         |
| 種別       | リファクタリング                           |
| 影響範囲   | `apps/desktop/src/renderer/store/index.ts` |

#### 概要

現在の合成Store Hooks（`useAuthModeStore`、`useLLMStore`、`useSkillStore`等）は、毎回新しいオブジェクトを返すため、`useEffect`の依存配列に含めると無限ループを引き起こす可能性がある。

#### 現状の問題

```typescript
// 現在のパターン（毎回新しいオブジェクト参照）
export const useAuthModeStore = () =>
  useAppStore((state) => ({
    mode: state.mode,
    status: state.status,
    initializeAuthMode: state.initializeAuthMode,
    // ...
  }));
```

#### 推奨される改善

```typescript
// 個別セレクタベース（参照が安定）
export const useAuthMode = () => useAppStore((state) => state.mode);
export const useAuthModeStatus = () => useAppStore((state) => state.status);
export const useInitializeAuthMode = () =>
  useAppStore((state) => state.initializeAuthMode);
```

#### 対応方針

1. 既存の合成Hooksを個別セレクタに分割
2. 使用側コンポーネントを個別セレクタに移行
3. useRefガードを不要にする
4. 段階的に移行（後方互換性を維持しながら）

#### 関連ドキュメント

- `.claude/rules/03-state-management.md` - Zustand設計原則
- `.claude/rules/06-known-pitfalls.md` - P31

---

### UT-2: App.tsxのinitializeAuth確認

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| 未タスクID | UT-FIX-APP-INITAUTH-CHECK-001       |
| 検出元     | Phase 10 最終レビュー（MINOR指摘）  |
| 優先度     | 低                                  |
| 種別       | 検証・確認                          |
| 影響範囲   | `apps/desktop/src/renderer/App.tsx` |

#### 概要

Phase 10の最終レビューで、App.tsxにも`initializeAuthMode`または類似の認証初期化処理が存在する可能性が指摘された。SettingsViewと同様の無限ループリスクがないか確認が必要。

#### 確認すべき内容

1. App.tsxで`useAuthModeStore`または`useLLMStore`を使用しているか
2. `useEffect`の依存配列にStore Hooks由来の関数が含まれていないか
3. 含まれている場合、useRefガードが適用されているか

#### 対応方針

1. App.tsxの実装を確認
2. 無限ループリスクがある場合、SettingsViewと同様のuseRefガードを適用
3. リスクがない場合、確認済みとして記録

#### 備考

このタスクは検証タスクであり、問題が発見されなければ実装変更は不要。

---

## 未タスク管理3ステップ完了確認

### UT-STORE-HOOKS-REFACTOR-001

| ステップ | 内容                            | ステータス                      |
| -------- | ------------------------------- | ------------------------------- |
| 1        | `unassigned-task/` に指示書作成 | 要実施                          |
| 2        | `task-workflow.md` 残課題登録   | 要実施                          |
| 3        | 関連仕様書に参照リンク追加      | 完了（P31に関連タスク記載済み） |

### UT-FIX-APP-INITAUTH-CHECK-001

| ステップ | 内容                            | ステータス |
| -------- | ------------------------------- | ---------- |
| 1        | `unassigned-task/` に指示書作成 | 要実施     |
| 2        | `task-workflow.md` 残課題登録   | 要実施     |
| 3        | 関連仕様書に参照リンク追加      | 要実施     |

---

## 次のアクション

1. **UT-STORE-HOOKS-REFACTOR-001**
   - [ ] `docs/30-workflows/unassigned-task/task-ut-store-hooks-refactor.md` を作成
   - [ ] `task-workflow.md` に残課題として登録
   - [ ] 関連仕様書（03-state-management.md）に参照リンク追加

2. **UT-FIX-APP-INITAUTH-CHECK-001**
   - [ ] `docs/30-workflows/completed-tasks/task-ut-fix-app-initauth-check.md` を作成
   - [ ] `task-workflow.md` に残課題として登録
   - [ ] 関連仕様書に参照リンク追加

---

## 備考

- 本レポートは Phase 12 ドキュメント更新の一環として作成
- 検出された未タスクは、現在のタスク（UT-FIX-STORE-HOOKS-INFINITE-LOOP-001）とは独立して管理される
- 優先度は「中」と「低」であり、緊急の対応は不要
