# [#783] [UT-STORE-HOOKS-REFACTOR-003] 合成Hookを使用しているコンポーネントの段階的移行

## メタ情報

| 項目         | 内容                        |
| ------------ | --------------------------- |
| タスクID     | UT-STORE-HOOKS-REFACTOR-003 |
| 分類         | リファクタリング            |
| 優先度       | 中                          |
| 見積もり規模 | 中規模                      |
| 依存タスク   | なし（単独で実行可能）      |

## 概要

非推奨の合成Hook（`useAuthModeStore()`, `useLLMStore()`, `useSkillStore()`）を使用している全コンポーネントを、個別セレクタパターンに移行する。

## 背景

UT-STORE-HOOKS-REFACTOR-001 (#771) でP31（無限ループ問題）を解決するため、合成Hookを非推奨とし、個別セレクタ（`useAuthMode()`, `useSetAuthMode()`等）を新設した。Phase 8でSettingsViewとLLMSelectorPanelを個別セレクタに移行したが、他にも合成Hookを使用しているコンポーネントが存在する可能性がある。

## 目的・ゴール

- 合成Hook使用箇所が0件になる（テストファイル除く）
- 全コンポーネントが個別セレクタを使用している
- P31パターン（無限ループリスク）がコードベースから排除されている

## スコープ

- **対象**: `apps/desktop/src/renderer/` 配下の全コンポーネント
- **含むもの**: 合成Hook使用箇所の調査、個別セレクタへの移行、動作検証
- **含まないもの**: 合成Hook自体の削除、Store Slice内部の変更、テストファイル内の合成Hook使用（モック用途）

## 実行手順

### Phase 1: 調査

合成Hook使用箇所を全て特定する

```bash
grep -rn "useAuthModeStore\|useLLMStore\|useSkillStore" apps/desktop/src/renderer/ --include="*.tsx" --include="*.ts" | grep -v ".test." | grep -v ".spec."
```

### Phase 2: 分析

各使用箇所のP31リスクを評価し、移行優先度を決定する

- **高リスク**: 合成Hookの関数を`useEffect`依存配列に含む
- **中リスク**: 合成Hookの状態を依存配列に含む
- **低リスク**: 依存配列なし or 空配列

### Phase 3: 移行

優先度順に個別セレクタへ移行する

```typescript
// Before（非推奨）
const { mode, setMode } = useAuthModeStore();

// After（推奨）
const mode = useAuthMode();
const setMode = useSetAuthMode();
```

### Phase 4: 検証

移行後の動作確認とテスト実行

## リスクと対策

| リスク                                        | 影響度 | 対策                            |
| --------------------------------------------- | ------ | ------------------------------- |
| P31パターン（無限ループ）がコードベースに残存 | 高     | grepによる網羅的検索で0件を確認 |
| 移行時の機能破壊                              | 高     | 段階的移行とテスト実行          |
| 依存配列の誤修正                              | 高     | P31チェックリストでレビュー     |

## 関連情報

- **関連タスク**: UT-STORE-HOOKS-REFACTOR-001 (#771)
- **関連Pitfall**: P31（Zustand Store Hooks無限ループ - `06-known-pitfalls.md`）
- **タスク仕様書**: `docs/30-workflows/completed-tasks/task-ut-store-hooks-refactor-003-migration.md`
- **実装パターン集**: `.claude/skills/aiworkflow-requirements/references/patterns.md`

## 完了条件

- [ ] 合成Hook使用箇所が0件である（テストファイル除く）
- [ ] 全コンポーネントが個別セレクタを使用している
- [ ] TypeScript型チェックが通る
- [ ] ESLintエラーがない
- [ ] 全テストがPASS
- [ ] P31パターンがないことを確認
