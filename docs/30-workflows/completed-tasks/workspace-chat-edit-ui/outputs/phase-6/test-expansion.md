# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容            |
| ---------- | --------------- |
| Phase      | 6               |
| カテゴリ   | 品質            |
| 前提Phase  | Phase 5（実装） |
| ステータス | 未実施          |

---

## 1. 目的

カバレッジ目標を達成するため、エッジケース・境界値・異常系のテストを追加する。

---

## 2. カバレッジ目標

| 指標            | 目標値 | 現状 |
| --------------- | ------ | ---- |
| Line Coverage   | ≥ 80%  | -    |
| Branch Coverage | ≥ 60%  | -    |

---

## 3. タスク一覧

### Task 1: FileAttachmentButton エッジケーステスト追加

#### 概要

FileAttachmentButtonのエッジケース・境界値テストを追加する。

#### テストファイル

`apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/FileAttachmentButton.edge.test.tsx`

#### 追加テストケース

| TC-ID    | テスト名                     | 検証内容                 |
| -------- | ---------------------------- | ------------------------ |
| FAB-E001 | handles empty file selection | キャンセル時の動作       |
| FAB-E002 | handles maxFiles boundary    | maxFiles=0, 1, 10の動作  |
| FAB-E003 | handles accept filter        | 特定拡張子のみ許可       |
| FAB-E004 | handles rapid clicks         | 連続クリック時の防止     |
| FAB-E005 | handles dialog error         | ダイアログエラー時の動作 |
| FAB-E006 | handles file read error      | ファイル読み込みエラー   |

#### 成果物

- `FileAttachmentButton.edge.test.tsx`

---

### Task 2: FileContextList エッジケーステスト追加

#### 概要

FileContextListのエッジケース・境界値テストを追加する。

#### テストファイル

`apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/FileContextList.edge.test.tsx`

#### 追加テストケース

| TC-ID    | テスト名                       | 検証内容                 |
| -------- | ------------------------------ | ------------------------ |
| FCL-E001 | handles very long file names   | 長いファイル名の切り詰め |
| FCL-E002 | handles special characters     | 特殊文字を含むファイル名 |
| FCL-E003 | handles exactly 10 files       | 最大数ちょうどの動作     |
| FCL-E004 | handles 11 files (over max)    | 最大数超過時の動作       |
| FCL-E005 | handles rapid remove clicks    | 連続削除クリック         |
| FCL-E006 | handles selectedId not in list | 存在しないID指定         |
| FCL-E007 | handles custom maxHeight       | カスタム高さ設定         |

#### 成果物

- `FileContextList.edge.test.tsx`

---

### Task 3: スナップショットテスト追加

#### 概要

UIの意図しない変更を検出するスナップショットテストを追加する。

#### テストファイル

`apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/snapshots-new.test.tsx`

#### テストケース

| TC-ID    | テスト名                      | 検証内容                           |
| -------- | ----------------------------- | ---------------------------------- |
| SNAP-001 | FileAttachmentButton default  | デフォルト状態のスナップショット   |
| SNAP-002 | FileAttachmentButton disabled | 無効化状態のスナップショット       |
| SNAP-003 | FileContextList empty         | 空状態のスナップショット           |
| SNAP-004 | FileContextList with files    | ファイル表示状態のスナップショット |
| SNAP-005 | FileContextList with selected | 選択状態のスナップショット         |

#### 成果物

- `snapshots-new.test.tsx`
- `__snapshots__/snapshots-new.test.tsx.snap`

---

### Task 4: カバレッジレポート生成・確認

#### 概要

カバレッジレポートを生成し、目標達成を確認する。

#### 検証コマンド

```bash
# カバレッジレポート生成
pnpm --filter @repo/desktop test -- --coverage --run apps/desktop/src/renderer/features/workspace-chat-edit/

# HTML レポート確認
open coverage/lcov-report/index.html
```

#### 確認項目

| ファイル                 | Line Coverage | Branch Coverage |
| ------------------------ | ------------- | --------------- |
| FileAttachmentButton.tsx | ≥ 80%         | ≥ 60%           |
| FileContextList.tsx      | ≥ 80%         | ≥ 60%           |

#### 成果物

- カバレッジレポート（coverage/）

---

## 4. 完了条件

- [ ] FileAttachmentButton.edge.test.tsx が作成されている
- [ ] FileContextList.edge.test.tsx が作成されている
- [ ] スナップショットテストが作成されている
- [ ] Line Coverage ≥ 80% を達成している
- [ ] Branch Coverage ≥ 60% を達成している
- [ ] 全テストがパスしている

---

## 5. 統合テスト連携【必須】

統合テストの拡充（全カテゴリのカバレッジ向上）:

| テストカテゴリ     | 検証項目                               | 目標 |
| ------------------ | -------------------------------------- | ---- |
| IPC接続テスト      | `chat-edit:read-file` レスポンス形式   | 100% |
| データフローテスト | Renderer→IPC→Main→FileSystem の往復    | 100% |
| エラーハンドリング | ファイル読込失敗時のUI表示・エラー状態 | 80%+ |
| 状態同期テスト     | chatEditSlice への fileContexts 反映   | 100% |

---

## 6. 多角的チェック観点

タスクの性質に応じて、以下の観点を確認する:

| 観点               | 適用判断            | 仕様参照先                                       |
| ------------------ | ------------------- | ------------------------------------------------ |
| UI/UX              | ✅ UIテスト拡充     | `aiworkflow-requirements: arch-ui-components.md` |
| エラーハンドリング | ✅ 異常系テスト拡充 | `aiworkflow-requirements: error-handling.md`     |
| テスタビリティ     | ✅ カバレッジ向上   | -                                                |

**Electronデスクトップアプリ観点（アーキテクチャ層別テスト拡充）**:

| 層                         | テスト拡充観点                            | テストファイル                              |
| -------------------------- | ----------------------------------------- | ------------------------------------------- |
| フロントエンド（Renderer） | ✅ エッジケース、境界値、スナップショット | `*.edge.test.tsx`, `snapshots-new.test.tsx` |
| IPC通信                    | ✅ エラーレスポンス、タイムアウト         | `integration-ui.test.tsx`                   |

---

## 7. サブタスク管理

Phase実行開始時に、以下のサブタスクを作成・管理すること:

1. Task 1: FileAttachmentButton エッジケーステスト追加
2. Task 2: FileContextList エッジケーステスト追加
3. Task 3: スナップショットテスト追加
4. Task 4: カバレッジレポート生成・確認
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに完了に更新すること。

---

## 8. タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（Task 1-4）を100%実行完了
- [ ] 各タスクの成果物（\*.edge.test.tsx, snapshots-new.test.tsx）が生成されている
- [ ] カバレッジ目標を達成している
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

---

## 9. 参照情報

### 品質要件

| 仕様     | パス                                                                        |
| -------- | --------------------------------------------------------------------------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` |

---

## 10. 次のPhase

Phase 7: テストカバレッジ確認
