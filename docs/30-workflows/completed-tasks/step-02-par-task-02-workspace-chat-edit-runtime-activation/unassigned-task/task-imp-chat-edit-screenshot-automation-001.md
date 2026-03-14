# Chat Edit Phase 11 screenshot automation 強化 - タスク指示書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | TASK-IMP-CHAT-EDIT-SCREENSHOT-AUTOMATION-001         |
| 分類       | 改善（開発基盤）                                     |
| 優先度     | 低                                                   |
| ステータス | 未実施                                               |
| 発見元     | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 Phase 12 |
| 発見日     | 2026-03-14                                           |

## 1. なぜこのタスクが必要か（Why）

現状は Playwright harness で 5状態の capture を実施できるが、Electron 実ウィンドウ経由の capture 基盤は未整備。実体寄りの証跡を残せる運用が必要。

## 2. 何を達成するか（What）

Phase 11 の画面証跡を Electron 実体でも安定自動取得できる状態にし、harness 依存を減らす。

## 3. どのように実行するか（How）

- 既存 `capture-task-ai-runtime-chat-edit-phase11.mjs` を基点に、Electron capture（`webContents.capturePage()`）系スクリプトを追加する。
- TC-ID / 出力先 / メタデータ形式を現行 plan と互換にする。
- CI 実行手順（headless/xvfb）を文書化する。

## 4. 実行手順

1. 現行 Playwright capture の出力契約（TC-ID、メタデータ）を固定する。
2. Electron 実ウィンドウ起動から capture 保存までのスクリプトを追加する。
3. 5ケース（TC-11-01〜05）を取得し互換性を確認する。
4. CI での実行ガイドを追記する。

## 5. 完了条件チェックリスト

- [ ] Electron 実体で TC-11-01〜05 を自動取得できる。
- [ ] screenshot-plan と metadata 形式が既存と互換である。
- [ ] 失敗時ログで原因（起動/遷移/保存）が判別できる。

## 6. 検証方法

- ローカル実行（macOS）で5枚保存確認。
- headless 環境での実行テスト。
- 既存 Playwright capture とのファイル命名・メタデータ比較。

## 7. リスクと対策

- リスク: OS/Display 環境差で描画タイミングがぶれる可能性。
- 対策: 待機条件をイベントベースにし、失敗時に再試行と詳細ログを残す。

## 8. 参照情報

- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`
- `apps/desktop/scripts/capture-task-ai-runtime-chat-edit-phase11.mjs`

## 9. 備考

既存の Playwright capture は fallback として維持し、段階移行する。完了時は `phase-11-manual-test.md` も同期する。
