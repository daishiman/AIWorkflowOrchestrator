# 差分確認設計 - TASK-SW-CANCEL-003

## メタ情報

| 項目     | 内容               |
| -------- | ------------------ |
| タスクID | TASK-SW-CANCEL-003 |
| 作成日   | 2026-04-19         |

## 責務境界の設計

### Main 層の責務（CANCEL-003）

| 責務                 | 実装箇所                                                   |
| -------------------- | ---------------------------------------------------------- |
| AbortController 管理 | `SkillCreatorService.currentAbortController` フィールド    |
| abort 実行           | `cancelCurrentOperation()` メソッド                        |
| finally reset        | `createSkill()` の finally ブロック                        |
| IPC handler 登録     | `registerSkillCreatorHandlers()` 内 `SKILL_CREATOR_CANCEL` |
| IPC handler 解除     | `unregisterSkillCreatorHandlers()` 内 `removeHandler`      |

### Renderer 依存事項（CANCEL-004）

| 事項                                                    | 理由                                                                          |
| ------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `skillCreatorAPI?.cancelGeneration?.()` の IPC 接続完了 | Preload API の実装は CANCEL-002 で完了したが、E2E でのフロー確認は CANCEL-004 |
| キャンセルボタン UI との連携                            | Renderer の UI 実装は CANCEL-004 の責務                                       |

### 「層別完了」と「E2E完了」の定義

| 完了種別            | 定義                                                                             | CANCEL-003 の判定   |
| ------------------- | -------------------------------------------------------------------------------- | ------------------- |
| 層別完了（Main 層） | `SkillCreatorService` + `skillCreatorHandlers` が AC を満たすこと                | 既実装で達成済み    |
| E2E 完了            | Renderer キャンセルボタン → IPC → Main abort → signal 伝播の全経路が動作すること | CANCEL-004 側で確認 |

## 差分確認フローの設計

### Phase 4（テスト作成）の再定義

- 純粋な RED 作成ではなく、targeted test 設計として実施
- 既存テストが AC をカバーしているか確認する
- 不足テストがある場合のみ追加

### Phase 5（実装）の再定義

- 新規実装フェーズではなく、差分確認・最小補修として実施
- 現実装 vs AC の mismatch 一覧を作成する
- mismatch が見つかった場合のみ補修へ遷移する

### mismatch 時の補修条件

| 条件                       | アクション                     |
| -------------------------- | ------------------------------ |
| AC と実装が完全一致        | 補修なし、確認記録のみ         |
| 軽微な差異（命名揺れなど） | Phase 8 リファクタリングで対処 |
| AC 不充足（機能欠損）      | Phase 5 で最小補修を適用       |

## Phase 11/12 の NON_VISUAL 設計

### Phase 11 方針

- `TASK-SW-CANCEL-003-manual-test-report.md` を primary evidence とする
- screenshot は不要（UI/UX 変更なし）
- walkthrough 対象: targeted test 実行、typecheck、lint、handler 登録・解除確認

### Phase 12 方針

- canonical 6成果物を厳密なファイル名で揃える
- Step 1（1-A〜1-C）と Step 2 の更新判断を明記する
- `aiworkflow-requirements` への更新が不要な場合も「不要理由」を記録する
