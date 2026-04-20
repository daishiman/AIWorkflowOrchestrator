# Phase 12: 実装ガイド (Implementation Guide)

## メタ情報

| 項目                | 内容               |
| ------------------- | ------------------ |
| タスクID            | TASK-SW-CANCEL-004 |
| Phase               | 12                 |
| 作成日              | 2026-04-20         |
| taskType            | NON_VISUAL         |
| implementation_mode | verify_existing    |

---

## Part 1: 中学生レベルの説明

### このタスクが何をしたか

スキル作成画面で「生成中止」ボタンを押したときに、きちんと「あ、中止されたんだな」と伝わる仕組みを作っているんだけど、その**仕組み自体はもうできている**ので、「本当にちゃんと動くかな？」を確認するのがこのタスク。

### 例え話

スピーカーのリモコンでいうと:

- リモコン（Renderer の `useCancelGeneration`）の「停止ボタン」を押すと
- まず手元のスピーカー（ブラウザ側）がすぐに静かになり（= abort）
- 「止まったよ」ランプが付いて（= stage を "cancelled" に）
- そのあと、壁の向こうにあるメインスピーカー（Main process）にも「止めて」と伝える（= IPC 通知）
- もしメインスピーカーへの信号が途中で途切れても、手元はもう静かなので気にしない（= catch swallow）

### ポイント

1. **手元が先に止まる**ので、ユーザーは必ず「止まった」と感じられる
2. 壁の向こうへの連絡は「届けば嬉しい」くらいの扱い（失敗しても大ごとにしない）
3. ランプ（stage）は手元が止まった時点でつく

---

## Part 2: 技術者レベルの説明

### 対象

- **ファイル**: `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`
- **テスト**: `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration.test.ts`

### Contract

```typescript
cancelGeneration: () => Promise<void>;
```

実行順序:

1. `abortControllerRef.current?.abort()` — local AbortSignal を abort
2. `abortControllerRef.current = null` — ref を null 化し次の start に備える
3. `setStage("cancelled")` — Zustand ストアの streaming stage を更新
4. `await skillCreatorAPI?.cancelGeneration?.()` — preload 経由で IPC invoke
5. IPC reject は `try/catch` で swallow（UI へ伝播させない）

### 4層 IPC 接続

| 層       | 位置                                                         | 役割                                |
| -------- | ------------------------------------------------------------ | ----------------------------------- |
| shared   | `packages/shared/src/ipc/channels.ts:200`                    | `SKILL_CREATOR_CANCEL` channel 定数 |
| preload  | `apps/desktop/src/preload/skill-creator-api.ts:396, 726`     | context bridge surface              |
| main     | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts:689, 750` | handler 登録 / 解除                 |
| renderer | `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`     | hook から invoke                    |

### 本 Workflow で行った作業

| Phase | 作業                                                         | コード変更                                  |
| ----- | ------------------------------------------------------------ | ------------------------------------------- |
| 1-3   | 要件定義・設計・設計レビュー（verify_existing 固定）         | なし                                        |
| 4     | 既存テスト棚卸し、AC↔test 対応表                             | なし                                        |
| 5     | 実装 diff check（mismatch: 0）                               | なし                                        |
| 6     | IPC failure swallow テスト 1 ケース追加                      | `useCancelGeneration.test.ts` 末尾に 1 case |
| 7-8   | focused coverage / 命名 drift 確認                           | なし                                        |
| 9     | focused test 6/6 PASS / typecheck PASS / lint 対象 0 warning | なし                                        |
| 10    | AC / 4条件 / 4層接続 最終確認                                | なし                                        |
| 11    | NON_VISUAL 証跡 3 点セット                                   | なし                                        |

### 設定可能なパラメータと定数

| 項目               | 内容                                                            |
| ------------------ | --------------------------------------------------------------- |
| 設定可能パラメータ | なし。hook は外部設定値を受け取らない                           |
| 参照定数           | `SKILL_CREATOR_CANCEL` を参照するが、本 task で定数値変更はない |
| 観測対象状態       | `streamingStage = "cancelled"`                                  |

### 呼び出し側の注意

`cancelGeneration()` 自体は `Promise<void>` を返し、hook 内では IPC 完了まで `await` する。一方、`SkillCreateWizard` 側は local abort と stage 更新を優先し、失敗も hook 内で swallow されるため fire-and-forget で呼び出している。

## 視覚証跡

**UI/UX変更なしのため Phase 11 スクリーンショット不要。**

### 追加テストのシグネチャ

```typescript
it("IPC cancelGeneration が reject してもエラーを伝播させず cancelled を維持する", async () => {
  // vi.fn().mockRejectedValue で IPC reject を注入
  // expect(resolves.toBeUndefined()) で catch swallow を観測
  // streamingStage が "cancelled" のまま維持されることを assertion
});
```

### 回帰観点の完全性

本 task で新規に補強した観点は C-6 (IPC failure swallow) と C-7 (`window.skillCreatorAPI` 未定義時の no-op safety) である。C-1〜C-5 は既存テストで Covered 済み。
