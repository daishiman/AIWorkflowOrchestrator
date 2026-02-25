# aiworkflow-requirements 抽出監査

## 判定

- 総合判定: **PASS（抽出強化済み）**

## 今回実装（仕様）に必要な抽出項目

| 区分                | 抽出元仕様                                                   | 抽出した要件                                          |
| ------------------- | ------------------------------------------------------------ | ----------------------------------------------------- |
| IPC契約             | `api-ipc-agent.md`, `ipc-contract-checklist.md`              | `skill:*` チャネル契約整合、Main/Preload/Renderer同期 |
| 型定義              | `interfaces-agent-sdk-skill.md`, `arch-electron-services.md` | `ImportedSkill` / `RemoveResult` / 実行系戻り値の整合 |
| IPCセキュリティ     | `security-skill-ipc.md`, `security-electron-ipc.md`          | `validateIpcSender` + 引数検証 + trim空文字拒否       |
| Preloadセキュリティ | `security-api-electron.md`                                   | contextBridge公開面の最小化、ホワイトリスト管理       |
| 実装パターン        | `architecture-implementation-patterns.md`                    | `safeInvoke` / `safeInvokeUnwrap` 選択基準            |
| エラー方針          | `error-handling.md`                                          | エラー分類・返却方針・利用者通知                      |
| 品質基準            | `quality-requirements.md`                                    | テスト品質・カバレッジ・品質ゲート                    |

## 改善内容

- 全Phase参照資料へ `security-api-electron.md` / `error-handling.md` / `quality-requirements.md` を追加。
- Phaseごとの実行手順に「参照資料確認」を固定化し、抽出漏れを抑制。

## 注意点（仕様差分の兆候）

- `interfaces-agent-sdk-skill.md` の一部セクションに旧記述が残る可能性があるため、実装着手時は `ipc-contract-checklist.md` と `arch-electron-services.md` を優先正本として突合する。
