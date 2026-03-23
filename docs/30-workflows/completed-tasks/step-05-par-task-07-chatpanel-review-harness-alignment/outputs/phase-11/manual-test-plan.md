# Phase 11 手動テスト: テスト計画書

- タスク ID: TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001
- 作成日: 2026-03-23
- フェーズ: Phase 11 - 手動テスト

---

## 目的

本タスクは設計タスクであり、プロダクションコードの変更は後続実装タスクで実施する。
Phase 11 では、現状の ChatPanel の状態（GAP-01〜04 が未解消の状態）を確認し、
後続実装タスクの受入テストとして使用できるシナリオを設計する。

### P53 対策: CLI 環境での代替証跡方針

CLI 環境では Electron アプリのスクリーンショット取得が困難である（P53 参照）。
本テスト計画では以下の代替証跡方針を採用する。

1. **Playwright スクリプト**: `page.screenshot()` で状態別スクリーンショットを取得
2. **自動テスト結果**: Vitest の PASS/FAIL を「間接的な視覚検証」として記録
3. **設計時点の所見**: GAP 分析の結果を discovered-issues.md に再記録

---

## 前提条件

- Electron アプリがビルド済みであること（`pnpm --filter @repo/desktop build`）
- 開発サーバーが起動済みであること（`pnpm --filter @repo/desktop dev`）
- Storybook または Review Harness 専用エントリポイントが利用可能であること

---

## MT-01: ChatPanel review-empty 状態の確認

### シナリオ概要

ChatPanel が `empty` 状態で表示された際に、review harness として正しく識別されることを確認する。

### 前提条件

- chatSlice の state が `empty` に設定されていること
- ChatPanel が直接レンダリングされる画面にアクセスできること

### 実行手順

1. Electron アプリを起動する
2. ChatPanel が表示される画面（Review Harness 専用画面、または Storybook）に遷移する
3. chatState を `empty` に設定する（DevTools の Zustand ストアから直接変更、
   または Storybook のコントロールパネルで設定）
4. ChatPanel に「空の状態」の EmptyState コンポーネントが表示されることを確認する
5. review harness 専用の識別情報（JSDoc や data 属性）が付与されていることを確認する

### 期待結果

- EmptyState コンポーネントが表示される
- 「メッセージを送信してチャットを開始してください」等の案内テキストが表示される
- no-op の CTA ボタンが表示されないか、表示される場合は disabled になっている

### 現状（設計タスク時点）

**GAP 状態**: GAP-01〜04 が未解消のため、CTA ボタンは no-op のまま。
後続実装タスク完了後に本シナリオを再実行し、期待結果を充足するか確認する。

### 証跡取得方法

```bash
# Playwright スクリプトで代替（P53 対策）
npx playwright screenshot --full-page http://localhost:3000/review-harness
```

---

## MT-02: blocked 状態 → 設定画面遷移の確認

### シナリオ概要

ChatPanel が `blocked` 状態の時に、「設定を開く」CTA を押すと
設定画面に遷移することを確認する（GAP-03 解消の検証）。

### 前提条件

- chatSlice の state が `blocked` に設定されていること

### 実行手順

1. Electron アプリを起動する
2. chatState を `blocked` に設定する
3. ChatPanel に BlockedBanner が表示されることを確認する
4. 「設定を開く」CTA ボタンを確認する
5. CTA ボタンをクリックする
6. 設定画面（SettingsView）が表示されることを確認する

### 期待結果（後続実装タスク完了後）

- BlockedBanner が表示される
- 「設定を開く」CTA ボタンがクリック可能な状態で表示される
- クリック後、設定画面に遷移する
- chatState が `blocked` のまま维持されるか、設定画面遷移に応じて変化する

### 現状（設計タスク時点）

**GAP-03 未解消**: `onOpenSettings` が no-op のため、CTA をクリックしても
設定画面に遷移しない。このシナリオは後続実装タスク完了後に有効となる。

### 証跡取得方法

```bash
# 自動テスト結果を代替証跡として記録
pnpm --filter @repo/desktop test -- --reporter=verbose --grep "blocked.*settings"
```

---

## MT-03: handoff 状態 → ターミナル起動の確認

### シナリオ概要

ChatPanel が `handoff` 状態の時に、「ターミナルを開く」CTA を押すと
ターミナルが起動することを確認する（GAP-04 解消の検証）。

### 前提条件

- chatSlice の state が `handoff` に設定されていること
- `app:open-terminal` IPC channel が Main Process に登録されていること

### 実行手順

1. Electron アプリを起動する
2. chatState を `handoff` に設定する
3. ChatPanel に HandoffBanner が表示されることを確認する
4. 「ターミナルを開く」CTA ボタンを確認する
5. CTA ボタンをクリックする
6. OS のターミナルが起動することを確認する

### 期待結果（後続実装タスク完了後）

- HandoffBanner が表示される
- 「ターミナルを開く」CTA ボタンがクリック可能な状態で表示される
- クリック後、OS のターミナル（macOS: Terminal.app または iTerm）が起動する

### 現状（設計タスク時点）

**GAP-04 未解消 + MINOR-A 未確認**: `onOpenTerminal` が no-op のため、
CTA をクリックしてもターミナルが起動しない。
さらに `app:open-terminal` IPC channel が Main Process に存在するかどうかが未確認（MINOR-A）。

**RISK-1 対処**: このテストを実行する前に、RISK-1 の Mitigation を確認すること。

```bash
grep -rn "open-terminal\|openTerminal" apps/desktop/src/main/
```

IPC channel が存在しない場合はこのシナリオをスキップし、discovered-issues.md に記録する。

---

## MT-04: streaming 状態 → Escape キャンセルの確認

### シナリオ概要

ChatPanel が `streaming` 状態の時に、Escape キーを押すと
ストリーミングがキャンセルされることを確認する（GAP-02 解消の検証）。

### 前提条件

- chatSlice の state が `streaming` に設定されていること
- `chat:cancel-stream` IPC channel が Main Process に登録されていること

### 実行手順

1. Electron アプリを起動する
2. チャットにメッセージを送信し、AI がレスポンスを生成中の状態にする
3. chatState が `streaming` になっていることを確認する
4. StreamingPanel とキャンセル CTA が表示されることを確認する
5. Escape キーを押す（または「キャンセル」ボタンをクリックする）
6. ストリーミングが停止し、chatState が `cancelled` に変化することを確認する

### 期待結果（後続実装タスク完了後）

- StreamingPanel が表示される（リアルタイムでトークンが流れる）
- キャンセル CTA が表示される
- Escape キーまたはキャンセルボタンで `chat:cancel-stream` IPC が呼ばれる
- chatState が `cancelled` に遷移し、CancelledNotice が表示される

### 現状（設計タスク時点）

**GAP-02 未解消**: `onCancelStream` が no-op のため、
Escape キーまたはキャンセルボタンを押してもストリーミングが停止しない。

---

## MT-05: RuntimeBanner のバッジ表示の確認

### シナリオ概要

RuntimeBanner が現在の実行モードに応じた正しいバッジを表示することを確認する。

### 前提条件

- RuntimeBanner コンポーネントが ChatPanel に含まれていること
- AI エージェントのランタイムモード（Local / Cloud / Hybrid）が設定されていること

### 実行手順

1. Electron アプリを起動する
2. 設定からランタイムモードを「Local」に変更する
3. ChatPanel の RuntimeBanner に「Local」バッジが表示されることを確認する
4. 設定からランタイムモードを「Cloud」に変更する
5. RuntimeBanner のバッジが「Cloud」に変化することを確認する
6. 設定からランタイムモードを「Hybrid」に変更する
7. RuntimeBanner のバッジが「Hybrid」に変化することを確認する

### 期待結果

- ランタイムモードに応じた正しいバッジが表示される
- バッジの色がランタイムモードを視覚的に区別できる
- バッジ変更がリアルタイムで反映される（State 変化に追従する）

### 現状（設計タスク時点）

RuntimeBanner は GAP リストに含まれていないため、既存実装で期待動作をする可能性がある。
このシナリオは現時点でも実施可能であり、既存実装の確認として有効である。

---

## テスト実施サマリー

| テスト ID | シナリオ               | 関連 GAP         | 実施タイミング                        |
| --------- | ---------------------- | ---------------- | ------------------------------------- |
| MT-01     | review-empty 状態確認  | -                | 設計タスク後・実装後                  |
| MT-02     | blocked → 設定遷移     | GAP-03           | 後続実装タスク完了後                  |
| MT-03     | handoff → ターミナル   | GAP-04 + MINOR-A | 後続実装タスク完了後（RISK-1 確認後） |
| MT-04     | streaming → キャンセル | GAP-02           | 後続実装タスク完了後                  |
| MT-05     | RuntimeBanner バッジ   | -                | 現時点でも実施可能                    |
