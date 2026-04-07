# 未タスク指示書: TASK-UI-02 フォローアップ（5件）

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| 未タスクID   | TASK-UI-02-FOLLOWUP                              |
| 発生元タスク | TASK-UI-02 ConversationPanel 孤立解消            |
| 発生Phase    | Phase 5〜8（実装・テスト拡充・リファクタリング） |
| 優先度       | LOW（全5件）                                     |
| 見積もり規模 | 小〜中規模                                       |
| 作成日       | 2026-04-06                                       |

---

## 概要

TASK-UI-02（`SkillCreatorConversationPanel` stub 化・`ConversationalInterview` 一本化・Session IPC 廃止）の実装完了後に残存した LOW 優先度の未タスク 5 件をまとめた指示書。機能的影響なし。次スプリント計画時に参照してタスクを起票すること。

---

## 未タスク一覧

### UT-UI-02-F-01: MultiSelectCheckbox の `maxSelect` プロパティ実装（W-MC-06）

| 項目         | 内容                                                                                   |
| ------------ | -------------------------------------------------------------------------------------- |
| 未タスクID   | UT-UI-02-F-01                                                                          |
| 発見Phase    | Phase 6（テスト拡充）                                                                  |
| 優先度       | LOW                                                                                    |
| 見積もり規模 | 小規模                                                                                 |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/interview-widgets/MultiSelectCheckbox.tsx` |

**概要**: `MultiSelectCheckbox` コンポーネントに `maxSelect` プロパティが Props として定義されているが、実装が存在しない。選択数の上限制御を未実装のまま放置している。

**背景**: Phase 6 で `W-MC-06` テストケースとして `it.todo()` に記録された。TASK-UI-02 スコープ外のため保留。

**受入基準**:

- [ ] `maxSelect: number` prop が定義されている
- [ ] 選択数が `maxSelect` に達した場合、未選択チェックボックスが無効化される
- [ ] `maxSelect` 未指定時は従来動作（上限なし）を維持する
- [ ] 既存の W-MC-01〜W-MC-05 テストがすべて PASS する
- [ ] W-MC-06 テスト（`maxSelect` 動作）が Green になる

---

### UT-UI-02-F-02: ConversationalInterview の `onError` エラーコード伝搬（IPC-ER-03）

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| 未タスクID   | UT-UI-02-F-02                                                            |
| 発見Phase    | Phase 6（テスト拡充）                                                    |
| 優先度       | LOW                                                                      |
| 見積もり規模 | 小規模                                                                   |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` |

**概要**: `ConversationalInterview` の `onError` コールバックが固定文字列のエラーメッセージを渡しており、IPC から返るエラーコードを伝搬していない。エラー種別の分類ができないため、上位コンポーネントが詳細なエラーハンドリングを行えない。

**背景**: Phase 6 で `IPC-ER-03` テストケースとして `it.todo()` に記録された。TASK-UI-02 スコープ外のため保留。

**受入基準**:

- [ ] `onError(message: string, code?: string)` のように IPC エラーコードを第2引数で受け取れる
- [ ] IPC エラーコードが `onError` コールバックに正しく伝搬される
- [ ] 既存の onError テストがすべて PASS する
- [ ] IPC-ER-03 テスト（エラーコード伝搬）が Green になる

---

### UT-UI-02-F-03: SkillCreatorIpcBridge.ts の Session IPC dead code 削除

| 項目         | 内容                                                              |
| ------------ | ----------------------------------------------------------------- |
| 未タスクID   | UT-UI-02-F-03                                                     |
| 発見Phase    | Phase 8（リファクタリング）                                       |
| 優先度       | LOW                                                               |
| 見積もり規模 | 小規模                                                            |
| 対象ファイル | `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts` |

**概要**: TASK-UI-02 で Session IPC を廃止したが、`SkillCreatorIpcBridge.ts` 内に Session IPC ハンドラの dead code が残存している。コードの可読性低下と誤解を招く可能性がある。

**背景**: Phase 8 リファクタリングでスコープ外として保留。`#3/#4` と同時実施推奨。

**受入基準**:

- [ ] `SkillCreatorIpcBridge.ts` から Session IPC ハンドラのコードがすべて削除されている
- [ ] 削除後も `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] 既存テストがすべて PASS する

---

### UT-UI-02-F-04: preload/types.ts の `skillCreatorSession` 型定義除去

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| 未タスクID   | UT-UI-02-F-04                       |
| 発見Phase    | Phase 8（リファクタリング）         |
| 優先度       | LOW                                 |
| 見積もり規模 | 小規模                              |
| 対象ファイル | `apps/desktop/src/preload/types.ts` |

**概要**: `preload/types.ts` に `skillCreatorSession` の型定義が残存している。Session IPC 廃止済みのため不要な型定義であり、削除すべき。

**背景**: Phase 8 リファクタリングでスコープ外として保留。`UT-UI-02-F-03` と同時実施推奨。

**受入基準**:

- [ ] `preload/types.ts` から `skillCreatorSession` 型定義が除去されている
- [ ] 除去後も `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `ElectronAPI` 型から `skillCreatorSession` フィールドが削除されている（または型互換のため保持する場合は理由を明記）

---

### UT-UI-02-F-05: skill-creator/ 廃止ファイル群の git delete

| 項目         | 内容                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------- |
| 未タスクID   | UT-UI-02-F-05                                                                            |
| 発見Phase    | Phase 5（実装）                                                                          |
| 優先度       | LOW                                                                                      |
| 見積もり規模 | 小規模                                                                                   |
| 対象ファイル | `apps/desktop/src/renderer/components/skill-creator/` 配下の `export {}` stub ファイル群 |

**概要**: TASK-UI-02 Phase 5 で `SkillCreatorConversationPanel.tsx` 等の孤立ファイルを `export {}` stub 化したが、最終的には git delete すべき廃止ファイルである。Stub 化はビルドエラー回避の暫定措置として採用した。

**背景**: Phase 5 実装でビルドエラーを即時解消するため stub 化を選択。live import がゼロであることを確認した上で git delete に移行する。`UT-UI-02-F-03` / `UT-UI-02-F-04` と同時実施推奨。

**受入基準**:

- [ ] 廃止対象ファイル一覧を `grep -rn "import.*SkillCreatorConversationPanel" apps/desktop/src/` で確認し、live import がゼロであることを検証する
- [ ] 廃止ファイルを git delete する
- [ ] 削除後も `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] 削除後も `pnpm --filter @repo/desktop test` がすべて PASS する

---

## 実施順序推奨

| グループ | タスク                                | 理由                                     |
| -------- | ------------------------------------- | ---------------------------------------- |
| 独立     | UT-UI-02-F-01（maxSelect）            | 他タスクと依存関係なし                   |
| 独立     | UT-UI-02-F-02（onError エラーコード） | 他タスクと依存関係なし                   |
| 同時推奨 | UT-UI-02-F-03 + F-04 + F-05           | Session IPC 完全撤去を一括で行う方が安全 |
