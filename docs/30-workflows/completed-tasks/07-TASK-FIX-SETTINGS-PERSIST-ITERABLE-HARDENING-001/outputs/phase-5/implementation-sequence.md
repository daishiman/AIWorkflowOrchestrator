# Phase 5: 実装順序

> タスク: TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001
> 作成日: 2026-03-07

---

## 実装順序と責務境界

### 並列実行グループ A: navigationSlice ガード (SubAgent-Navigation-Slice)

| 順序 | 変更内容                                                     | ファイル           | DD    |
| ---- | ------------------------------------------------------------ | ------------------ | ----- |
| A-1  | setCurrentView: Array.isArray ガード + [view] フォールバック | navigationSlice.ts | DD-03 |
| A-2  | goBack: Array.isArray ガード + 早期リターン                  | navigationSlice.ts | DD-04 |
| A-3  | canGoBack: Array.isArray ガード + false 返却                 | navigationSlice.ts | DD-05 |

### 並列実行グループ B: customStorage ガード (SubAgent-Store-Hydrate)

| 順序 | 変更内容                                                         | ファイル       | DD    |
| ---- | ---------------------------------------------------------------- | -------------- | ----- |
| B-1  | getItem: Array.isArray + string フィルタ + 空 Set フォールバック | store/index.ts | DD-01 |
| B-2  | setItem: instanceof Set + Array.isArray + 空配列フォールバック   | store/index.ts | DD-02 |
| B-3  | useCanGoBack: Array.isArray ガード追加                           | store/index.ts | DD-05 |

### テスト（グループ A, B 完了後）

| 順序 | 変更内容                         | ファイル                | DD       |
| ---- | -------------------------------- | ----------------------- | -------- |
| T-1  | viewHistory 破損テスト追加       | navigationSlice.test.ts | DD-03-05 |
| T-2  | customStorage 破損テスト新規作成 | customStorage.test.ts   | DD-01-02 |

---

## SubAgent と Codex の担当境界

| 担当     | Phase 帯  | 役割                                       |
| -------- | --------- | ------------------------------------------ |
| SubAgent | Phase 4-5 | テスト設計、AC 固定、実装、テスト実行      |
| Codex    | なし      | 本タスクの変更量は SubAgent で完結する規模 |

---

## commit/PR 非実行ポリシー

Phase 5 ではローカル変更とテスト結果のみで完了条件を満たす。
以下の操作は実行しない:

- `git commit`
- `git push`
- PR 作成
