# Phase 11 手動テスト: 発見した問題

- タスク ID: TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001
- 作成日: 2026-03-23
- フェーズ: Phase 11 - 手動テスト

---

## 概要

本タスクは設計タスクであり、プロダクションコードへの変更は後続実装タスクで実施する。
Phase 11 の時点では、実際の Electron アプリ動作確認は後続実装タスク完了後に実施する。

本ファイルには、設計レビュー時点で特定された所見（MINOR-A、MINOR-B）を再記録し、
後続実装タスクのテスト担当者が参照できるようにする。

---

## 設計レビュー時点の所見

### ISSUE-01: GAP-01〜04 の no-op コールバック（設計時点の既知問題）

**発見フェーズ**: Phase 1（要件定義）、Phase 3（設計レビュー）

**問題の説明**:
ChatPanel には以下の 4 箇所に no-op（`() => {}`）コールバックが存在する。
これらはユーザー操作に対してレスポンスを返さず、機能が完全に無効化されている。

| GAP ID | 対象 callback    | 症状                                             |
| ------ | ---------------- | ------------------------------------------------ |
| GAP-01 | `onSendMessage`  | メッセージ送信ボタンを押しても何も起きない       |
| GAP-02 | `onCancelStream` | キャンセルボタンを押してもストリームが停止しない |
| GAP-03 | `onOpenSettings` | 設定ボタンを押しても設定画面に遷移しない         |
| GAP-04 | `onOpenTerminal` | ターミナルボタンを押してもターミナルが起動しない |

**影響範囲**: chatState が `idle`（GAP-01）、`streaming`（GAP-02）、
`blocked`（GAP-03）、`handoff`（GAP-04）の時のユーザー操作が完全に無効

**解消計画**: refactor-boundaries.md に記載。後続実装タスクで Store action / IPC 配線を行う。

**後続実装タスクでの確認手順**:

1. MT-01〜MT-04 のシナリオを順次実行する
2. 各 CTA が期待通りに動作することを確認する
3. 動作確認後、discovered-issues.md を更新してクローズする

---

### ISSUE-02: MINOR-A - openTerminal IPC channel 存在確認が未実施

**発見フェーズ**: Phase 3（設計レビュー）

**問題の説明**:
Phase 3 設計レビューで MINOR-A として指摘。`app:open-terminal` IPC channel が
Main Process に登録されているかどうかが設計時点で未確認である。

**現状（設計タスク時点）**:

- Main Process のハンドラ一覧を確認していない
- Preload の allowlist に `app:open-terminal` が含まれるかどうか不明

**確認コマンド（後続実装タスク担当者向け）**:

```bash
# Main Process のハンドラ確認
grep -rn "open-terminal\|openTerminal" apps/desktop/src/main/

# Preload allowlist の確認
grep -rn "open-terminal\|openTerminal" apps/desktop/src/preload/

# IPC_CHANNELS 定数の確認
grep -rn "OPEN_TERMINAL\|open.terminal" apps/desktop/src/shared/
```

**対応方針**:

- 存在する場合: `handleOpenTerminal` を既存 channel に配線する
- 存在しない場合: 新規 IPC handler を作成する（ipc-contract-checklist.md Phase 1-6 を遵守）

**関連ファイル**:

- `risk-register.md`: RISK-1 として詳細を記録
- `unassigned-task-detection.md`: MINOR-A として未タスク登録済み

---

### ISSUE-03: MINOR-B - ChatPanelProps role 型追加の要否が未決定

**発見フェーズ**: Phase 3（設計レビュー）

**問題の説明**:
Phase 3 設計レビューで MINOR-B として指摘。ChatPanelProps に `role?: 'mainline' | 'review-harness'`
型を追加することで、コンパイル時にコンポーネントの役割を型で表現できる。
一方で、子コンポーネント Props との互換性（P46: HTMLAttributes Props 型衝突パターン）
および BC break リスクを考慮して判断を留保した。

**判断ポイント**:

1. `role` は HTML 標準属性（`aria-role`）と名前が衝突する可能性がある
   → `Omit<React.HTMLAttributes<HTMLDivElement>, 'role'>` の適用が必要
2. Props 型追加は BC break ではないが、既存の呼び出し箇所を調査する必要がある
3. JSDoc の `@role review-harness` で代替できるなら型追加は不要かもしれない

**後続実装タスクでの判断基準**:

```bash
# ChatPanel の呼び出し箇所を調査
grep -rn "ChatPanel" apps/desktop/src/renderer/ --include="*.tsx"
```

呼び出し箇所が 1 箇所のみ（Storybook / Review Harness 専用画面）であれば型追加は容易。
複数箇所で使用されている場合は影響範囲を慎重に評価する。

**関連ファイル**:

- `unassigned-task-detection.md`: MINOR-B として未タスク登録済み
- `risk-register.md`: RISK-2 の一部として関連リスクを記録

---

## 後続実装タスク担当者への引き継ぎ事項

1. **GAP-01〜04 解消後に MT-01〜MT-04 を実行する**
   - 各 MT の「期待結果（後続実装タスク完了後）」セクションを確認すること

2. **ISSUE-02（MINOR-A）を先に解消する**
   - MT-03 の実施前に `app:open-terminal` IPC channel の存在を確認すること
   - channel が存在しない場合は新規実装し、その後 MT-03 を実施すること

3. **ISSUE-03（MINOR-B）は任意**
   - 後続実装タスクの担当者が呼び出し箇所を調査して判断すること
   - 判断結果を unassigned-task-detection.md に追記すること

4. **discovered-issues.md の更新**
   - 手動テスト実施後に本ファイルを更新し、各 ISSUE のステータスを記録すること
   - クローズした ISSUE には `STATUS: CLOSED` と対応内容を追記すること
