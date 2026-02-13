# 未タスク検出レポート

## タスクID

UT-STORE-HOOKS-REFACTOR-001

## 検出日

2026-02-11

---

## 1. 検出サマリー

| カテゴリ                     | 検出数  |
| ---------------------------- | ------- |
| Phase 3 レビュー指摘         | 0件     |
| Phase 10 レビュー指摘        | 0件     |
| コードベース TODO/FIXME      | 0件     |
| 今後の改善提案（未タスク化） | 2件     |
| **合計**                     | **2件** |

---

## 2. Phase 3 設計レビュー結果

### 2.1 判定

**PASS** - 全観点で問題なし

### 2.2 指摘事項

なし

---

## 3. Phase 10 最終レビュー結果

### 3.1 判定

**PASS** - 全観点で基準充足

### 3.2 指摘事項

なし

### 3.3 今後の改善提案

Phase 10最終レビューで以下の改善提案が記録されました。これらを未タスクとして登録します。

| 提案                                         | 優先度 | 未タスク化 |
| -------------------------------------------- | ------ | ---------- |
| 状態セレクタのJSDoc追加                      | 低     | UT-1       |
| 合成Hookを使用している他コンポーネントの移行 | 中     | UT-2       |

---

## 4. コードベース TODO/FIXME 検索

### 4.1 検索範囲

```
apps/desktop/src/renderer/store/
```

### 4.2 検索結果

```bash
grep -rn "TODO\|FIXME" apps/desktop/src/renderer/store/
# 結果: 0件
```

対象ディレクトリ内にTODO/FIXMEコメントは検出されませんでした。

---

## 5. 未タスク一覧

### UT-1: 状態セレクタのJSDoc追加

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| タスクID   | UT-STORE-HOOKS-REFACTOR-002                                    |
| 概要       | 個別セレクタにJSDocコメントを追加し、IDE補完と開発者体験を向上 |
| 優先度     | 低                                                             |
| 影響範囲   | store/index.ts（53個の個別セレクタ）                           |
| 前提タスク | なし                                                           |
| 推定工数   | 0.5日                                                          |

**詳細:**

現在の個別セレクタには一部JSDocが不足しています。以下のような形式でドキュメントを追加することで、コードの可読性と保守性が向上します。

```typescript
/**
 * 現在の認証方式を取得
 * @returns "subscription" | "api-key"
 */
export const useAuthMode = () => useAppStore((state) => state.mode);
```

---

### UT-2: 合成Hookを使用しているコンポーネントの段階的移行

| 項目       | 内容                                                             |
| ---------- | ---------------------------------------------------------------- |
| タスクID   | UT-STORE-HOOKS-REFACTOR-003                                      |
| 概要       | 非推奨の合成Hookを使用しているコンポーネントを個別セレクタに移行 |
| 優先度     | 中                                                               |
| 影響範囲   | 合成Hook使用箇所（現時点で未調査）                               |
| 前提タスク | なし                                                             |
| 推定工数   | 1-2日（箇所数による）                                            |

**詳細:**

Phase 8でリファクタリングしたコンポーネント（SettingsView, LLMSelectorPanel）以外にも、合成Hookを使用している箇所が存在する可能性があります。これらを段階的に個別セレクタへ移行することで、コードベース全体の一貫性が向上します。

**検出コマンド:**

```bash
grep -rn "useAuthModeStore\|useLLMStore\|useSkillStore" apps/desktop/src/renderer/
```

---

## 6. 未タスク管理3ステップ確認

### UT-1: 状態セレクタのJSDoc追加（UT-STORE-HOOKS-REFACTOR-002）

| ステップ                            | ステータス |
| ----------------------------------- | ---------- |
| 1. unassigned-task-detection.md記載 | **完了**   |
| 2. task-workflow.md登録             | **完了**   |
| 3. 関連仕様書リンク追加             | **完了**   |

**タスク仕様書パス:** `docs/30-workflows/completed-tasks/task-ut-store-hooks-refactor-002-jsdoc.md`

### UT-2: コンポーネント移行（UT-STORE-HOOKS-REFACTOR-003）

| ステップ                            | ステータス |
| ----------------------------------- | ---------- |
| 1. unassigned-task-detection.md記載 | **完了**   |
| 2. task-workflow.md登録             | **完了**   |
| 3. 関連仕様書リンク追加             | **完了**   |

**タスク仕様書パス:** `docs/30-workflows/completed-tasks/task-ut-store-hooks-refactor-003-migration.md`

---

## 7. 結論

- Phase 3, Phase 10のレビューで指摘事項は0件
- コードベースのTODO/FIXMEは0件
- 今後の改善提案として2件の未タスクを記録
- これらの未タスクは緊急性が低いため、通常の改善サイクルで対応可能

**Phase 12: ドキュメント更新 - 完了**
