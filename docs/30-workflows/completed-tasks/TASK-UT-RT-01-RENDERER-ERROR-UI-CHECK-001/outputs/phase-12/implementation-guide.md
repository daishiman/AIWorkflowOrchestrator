# Phase 12: 実装ガイド

## メタ情報

| 項目     | 内容                                         |
| -------- | -------------------------------------------- |
| Phase    | 12                                           |
| タスクID | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001    |
| タスク名 | Renderer 側エラーメッセージ UI 表示 E2E 確認 |
| 作成日   | 2026-04-13                                   |
| スコープ | workflow-local documentation only            |

## Part 1: たとえばで理解する説明

エラー表示の確認は、学校の先生が「宿題を出しましたよ」と言ったときに、
黒板にもそのメモがちゃんと書かれているかを確かめるのと同じです。

たとえば、先生の声だけ聞こえても黒板に何も書かれていなければ、
あとで見返したときに「何が起きたのか」が分かりません。

今回確認したいのは、スキルが失敗したときに届いたエラーメッセージが
画面の `skill-lifecycle-error` にちゃんと残るかどうかです。
そのため、耳で聞く情報だけでなく、目で見える場所にも同じ内容を出します。

## Part 2: 技術者向け current facts

### 1. 表示経路

| 段階 | current facts                                                                  |
| ---- | ------------------------------------------------------------------------------ |
| 受信 | `onWorkflowStateChanged(snapshot, errorMessage?)` で `errorMessage` を受け取る |
| 保存 | `setWorkflowError(errorMessage)` で store に入れる                             |
| 集約 | `currentSurfaceError = localError ?? workflowError ?? skillError`              |
| 表示 | `data-testid="skill-lifecycle-error"` に描画する                               |

### 2. シグネチャ

```ts
type WorkflowStateChangedHandler = (
  snapshot: WorkflowSnapshot,
  errorMessage?: string,
) => void;
```

`errorMessage` は任意引数で、snapshot と別経路で Renderer 側に渡される。

### 3. 優先順位

```ts
const currentSurfaceError = localError ?? workflowError ?? skillError;
```

優先順位は次の通り。

1. `localError`
2. `workflowError`
3. `skillError`

### 4. 既存テストの読み方

| テスト                                           | current facts                                               |
| ------------------------------------------------ | ----------------------------------------------------------- |
| `SkillLifecyclePanel.error-persistence.test.tsx` | `errorMessage` が `setWorkflowError` に流れることを確認済み |
| `SkillLifecyclePanel.test.tsx`                   | `workflowError` の positive DOM assert を追加済み           |
| `SkillLifecyclePanel.llm-generation.test.tsx`    | `skill-lifecycle-error` の非表示側の確認はある              |

### 5. エッジケース

| ケース                                     | current facts                            | 対応                                                   |
| ------------------------------------------ | ---------------------------------------- | ------------------------------------------------------ |
| `errorMessage` が空                        | store への更新が空文字になる可能性がある | 表示時の空文字条件を要確認                             |
| `workflowError` と `skillError` が両方ある | `workflowError` が優先される             | 既存の優先順位どおり                                   |
| Vitest 実行                                | PASS                                     | `SkillLifecyclePanel.test.tsx` を 40 tests PASS で確認 |

### 6. Visual capture

| 項目       | current facts                                                           |
| ---------- | ----------------------------------------------------------------------- |
| screenshot | `outputs/phase-11/screenshots/phase11-skill-lifecycle-error-banner.png` |
| 判定       | PASS                                                                    |
| 取得方法   | Playwright renderer harness で `workflowError` を注入して取得           |

## このガイドの位置づけ

- これは code change の提案書ではなく current facts の整理である
- 実装は既に存在しており、`workflowError` の表示を直接固定するテストも追加済み
- renderer harness の visual capture は完了済みで、Electron 実機 screenshot が必要なら別工程で補完する

---

_作成日: 2026-04-13_
