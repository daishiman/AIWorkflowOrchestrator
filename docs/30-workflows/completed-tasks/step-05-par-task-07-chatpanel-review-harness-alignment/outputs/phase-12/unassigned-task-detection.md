# Phase 12 ドキュメント: 未タスク検出レポート

- タスク ID: TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001
- 作成日: 2026-03-23
- フェーズ: Phase 12 - ドキュメント

---

## 概要

本レポートは Phase 12 Task 4 の「未タスク検出」の結果を記録する。
P3/P58 対策として、0 件であっても本ファイルの作成は必須である。
検出件数: **3 件**（MINOR-A / MINOR-B / 実装時発見）

---

## 検出した未タスク

### UNASSIGNED-01: openTerminal IPC handler の確認と実装

**元の指摘**: Phase 3 設計レビュー MINOR-A

**概要**:
`app:open-terminal` IPC channel が Main Process に登録されているかどうかを確認し、
未登録の場合は新規実装を行う。

**詳細**:

- Phase 3 設計レビューで「GAP-04 openTerminal IPC channel 存在確認が未実施」として指摘
- 後続実装タスクの Phase 5 着手前に確認が必要
- 未実装の場合は ipc-contract-checklist.md Phase 1-6 を遵守して実装する

**確認コマンド**:

```bash
grep -rn "open-terminal\|openTerminal" apps/desktop/src/main/
grep -rn "open-terminal\|openTerminal" apps/desktop/src/preload/
```

**優先度**: HIGH（MT-03 手動テストの前提条件）

**受け入れ基準**:

- [ ] `app:open-terminal` が Main Process に登録されているか確認した
- [ ] 未登録の場合は新規 IPC handler を実装した
- [ ] Preload allowlist に `app:open-terminal` を追加した
- [ ] IPC_CHANNELS 定数に `APP_OPEN_TERMINAL = 'app:open-terminal'` を追加した
- [ ] `pnpm typecheck` が通ることを確認した
- [ ] MT-03（handoff → ターミナル起動）が期待結果を充足することを確認した

**指示書ファイル（P3 準拠 3 ステップ）**:

Step 1: 指示書を `unassigned-task/` に作成する（本タスクの後続作業として実施）

Step 2: `task-workflow.md` 残課題テーブルに登録する:

```
| UNASSIGNED-01 | openTerminal IPC handler 確認・実装 | HIGH | MINOR-A | 未着手 |
```

Step 3: 関連仕様書（`ipc-design.md`、`risk-register.md`）に参照リンクを追加する

---

### UNASSIGNED-02: ChatPanelProps role 型追加の検討

**元の指摘**: Phase 3 設計レビュー MINOR-B

**概要**:
ChatPanelProps に `role?: 'mainline' | 'review-harness'` 型を追加することで、
コンパイル時にコンポーネントの役割を型で表現できる。

**詳細**:

- Phase 3 設計レビューで「ChatPanelProps role 型追加の要否再評価」として指摘
- `role` は HTML 標準属性との衝突リスクがあるため P46（HTMLAttributes 型衝突）の対策が必要
- JSDoc `@role review-harness` で代替できる場合は不要かもしれない

**調査コマンド**:

```bash
# ChatPanel の呼び出し箇所を調査
grep -rn "ChatPanel" apps/desktop/src/renderer/ --include="*.tsx"
grep -rn "ChatPanel" apps/desktop/src/ --include="*.stories.tsx"
```

**優先度**: LOW（機能影響なし、可読性の改善）

**受け入れ基準**:

- [ ] ChatPanel の呼び出し箇所を調査した
- [ ] `role` の HTML 標準属性との衝突を評価した（P46 対策）
- [ ] 型追加するか JSDoc で代替するかを決定した
- [ ] 決定内容を implementation-guide.md に追記した

**指示書ファイル（P3 準拠 3 ステップ）**:

Step 1: 指示書を `unassigned-task/` に作成する（本タスクの後続作業として実施）

Step 2: `task-workflow.md` 残課題テーブルに登録する:

```
| UNASSIGNED-02 | ChatPanelProps role 型追加検討 | LOW | MINOR-B | 未着手 |
```

Step 3: 関連仕様書（`ui-ux-panels.md`、`risk-register.md`）に参照リンクを追加する

---

### UNASSIGNED-03: ViewType に "terminal" を追加

**元の指摘**: 実装時発見（Phase 5 実施中）

**概要**:
`ViewType` ユニオン型に `"terminal"` が含まれていないため、`handleTerminalSwitch` と `handleOpenTerminal` が
`setCurrentView("agent")` で代替実装されている。Terminal surface への直接ナビゲーションを実現するには
ViewType に `"terminal"` を追加し、対応する View コンポーネントを実装する必要がある。

**詳細**:

- `apps/desktop/src/renderer/store/types.ts` の `ViewType` に `"terminal"` が存在しない
- 現在は `"agent"` ビューへのナビゲーションで代替（ActionabilityはOK、正確性はNG）
- UNASSIGNED-01（openTerminal IPC）と合わせて対応することで完全な terminal surface 導線が実現する

**優先度**: MEDIUM（UNASSIGNED-01 と併せて対応）

**受け入れ基準**:

- [ ] `ViewType` に `"terminal"` を追加した
- [ ] terminal view に対応する React コンポーネントを作成した
- [ ] ChatPanel の `handleTerminalSwitch` / `handleOpenTerminal` を `setCurrentView("terminal")` に更新した
- [ ] `pnpm typecheck` が通ることを確認した

---

## 未タスク管理 3 ステップの実施状況（P3 チェック）

| ステップ                                  | UNASSIGNED-01                                                                                               | UNASSIGNED-02                                                                                     | UNASSIGNED-03                                                                                      |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| ① `unassigned-task/` に指示書作成         | DONE — `docs/30-workflows/unassigned-task/ut-chatpanel-open-terminal-ipc-handler.md` 作成済み（2026-03-23） | DONE — `docs/30-workflows/unassigned-task/ut-chatpanel-props-role-type.md` 作成済み（2026-03-23） | DONE — `docs/30-workflows/unassigned-task/ut-viewtype-terminal-addition.md` 作成済み（2026-03-23） |
| ② `task-workflow.md` 残課題テーブルに登録 | DONE — `task-workflow-backlog.md` に登録済み（2026-03-23）                                                  | DONE — `task-workflow-backlog.md` に登録済み（2026-03-23）                                        | DONE — `task-workflow-backlog.md` に登録済み（2026-03-23）                                         |
| ③ 関連仕様書に参照リンク追加              | DEFERRED — `ipc-design.md`、`risk-register.md` への参照リンク追加は後続作業として残置                       | DEFERRED — `ui-ux-panels.md`、`risk-register.md` への参照リンク追加は後続作業として残置           | DEFERRED — 関連仕様書への参照リンク追加は後続作業として残置                                        |

**P58 対策注記**: 設計タスクであっても `unassigned-task/` への独立した指示書ファイル作成は必須。
「本レポート内で完了」という省略は P58 の再発パターンであるため、採用しない。

---

## unassigned-task-detection.md ステータス

| 項目             | 値                                       |
| ---------------- | ---------------------------------------- |
| 検出件数         | 3 件                                     |
| MINOR 由来       | 2 件（MINOR-A / MINOR-B）                |
| 実装時発見       | 1 件（UNASSIGNED-03: ViewType terminal） |
| スコープ外再記録 | 0 件                                     |
| クローズ済み     | 0 件                                     |
| **合計**         | **3 件**                                 |

**artifacts.json 更新内容** (Phase 12 ステータス):

```json
{
  "phase": 12,
  "status": "in-progress",
  "unassignedTaskDetection": {
    "total": 3,
    "items": ["UNASSIGNED-01", "UNASSIGNED-02", "UNASSIGNED-03"]
  }
}
```
