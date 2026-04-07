# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 12                                |
| Phase名    | ドキュメント更新                  |
| 機能名     | task-ui-03-ipc-renderer-migration |
| 前提Phase  | Phase 11: 手動テスト              |
| 次Phase    | Phase 13: PR作成                  |
| ステータス | pending                           |
| 作成日     | 2026-04-07                        |

## 目的

IPC 経路移行完了を記録し、TASK-UI-03 本来の成果物である IPC 分離契約設計ドキュメント・実装ガイドを整備する。また未タスク検出、スキルフィードバック、Phase 12 準拠確認（Task 12-6）を記録する。

## 実行タスク

| Task      | 内容                                                   | 主成果物                                                 |
| --------- | ------------------------------------------------------ | -------------------------------------------------------- |
| Task 12-1 | 実装ガイド作成（中学生レベル説明 + 技術詳細）          | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | システムドキュメント更新（aiworkflow-requirements 等） | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | ドキュメント更新履歴作成                               | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | 未タスク検出                                           | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | スキルフィードバックレポート                           | `outputs/phase-12/skill-feedback-report.md`              |
| Task 12-6 | phase12-task-spec-compliance-check                     | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

- Task 12-1: 実装ガイド作成（中学生レベル説明 + 技術詳細）
- Task 12-2: システムドキュメント更新（aiworkflow-requirements等の更新）
- Task 12-3: ドキュメント更新履歴作成
- Task 12-4: 未タスク検出（残課題の検出と記録）
- Task 12-5: スキルフィードバックレポート作成
- Task 12-6: phase12-task-spec-compliance-check（Task 12-1〜12-5 と Step 1/2 の準拠確認）

### Task 12-1: 実装ガイド作成

**Part 1（中学生レベル）**:

- なぜ必要か: 2つの経路が混在していると、将来バグが起きたとき「どちらが動いていたか」の調査が複雑になる
- たとえば、学校の連絡に「連絡帳」と「LINE」の 2 つを使っていたとする。どちらで送ればいいか迷うし、両方確認しないといけない
- 何をしたか: `window.skillCreatorAPI` を唯一の窓口として使うようにし、`window.electronAPI.skillCreator` は preload の互換シムとして段階廃止する方針にした

**Part 2（技術詳細）**:

- 変更したファイルと変更内容（current contract / target delta を分ける）
- `window.skillCreatorAPI` vs `window.electronAPI.skillCreator` の違いと統一方針
- TypeScript の `interface` / `type` 定義
- IPC API シグネチャと使用例
- エラーハンドリング、エッジケース、設定/定数
- テスト構造と検証コマンド
- **Consumer Contract & IPC Compatibility**: Before/After の対応表、互換シムの残存条件、follow-up へ回す削除トリガー
- 新機能開発者向けの IPC 経路選択ガイドライン

### Task 12-2: システムドキュメント更新

更新対象として以下を確認:

- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md` または `api-ipc-agent-core.md` — IPC 経路移行完了の記録
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` — TASK-UI-03-REMAINING 完了記録
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` または関連 lessons — `skillCreatorAPI` を canonical にする判断根拠
- `.claude/skills/aiworkflow-requirements/LOGS.md` — タスク完了エントリ追加
- `.claude/skills/task-specification-creator/LOGS.md` — タスク完了記録追加
- `.claude/skills/aiworkflow-requirements/SKILL.md` — 変更履歴追記
- `.claude/skills/task-specification-creator/SKILL.md` — 変更履歴追記
- `outputs/phase-11/manual-test-result.md` / `discovered-issues.md` — Phase 11 の NON_VISUAL 根拠と発見課題

**漏れやすいポイント**:

- LOGS.md は 2 ファイル（aiworkflow-requirements + task-specification-creator）両方更新（P1準拠）
- topic-map.md を再生成（P2準拠）: `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`
- `artifacts.json` と `outputs/artifacts.json` の parity を確認する
- public surface を変えない場合は Step 2 を N/A にし、理由を `system-spec-update-summary.md` と `documentation-changelog.md` の両方へ残す
- `electronAPI.skillCreator` の互換シムは preload に残す場合、その残存理由を `system-spec-update-summary.md` に固定する

### Task 12-3: ドキュメント更新履歴

変更した全ファイルを changelog に記録する。

### Task 12-4: 未タスク検出

以下を確認し未タスクがないか検出する:

- Phase 3 MINOR 指摘事項
- Phase 10 MINOR 指摘事項
- `electronAPI.skillCreator` 互換シムの削除が後続タスクとして残っている場合は記録（repo-wide grep が 0 件になるまで follow-up）
- 互換シムを残す方針で確定した場合は、後続タスク化しない理由を明記する

### Task 12-5: スキルフィードバック

ワークフロー改善点・技術的教訓を記録する（なし含む）。

### Task 12-6: phase12-task-spec-compliance-check

Task 12-1〜12-6 と Step 1/2 の準拠確認を 1 ファイルへ集約する。

- マトリクス形式で PASS/FAIL を記録する
- Task 12-1〜12-6 の完了条件と照合する
- Task 12-1〜12-6 の成果物が 6 ファイルと齟齬なく揃っていることを確認する
- `outputs/phase-12/*.md` に将来時制の表現が残っていないことを確認する
- `artifacts.json` と `outputs/artifacts.json` の parity を照合する
- Phase 12 の root evidence として、自己申告ではなく実ファイル根拠で判定する

## 参照資料

| 資料名         | パス                                       | 説明     |
| -------------- | ------------------------------------------ | -------- |
| 実装記録       | `outputs/phase-5/implementation-record.md` | 変更内容 |
| 設計書         | `outputs/phase-2/design-document.md`       | 移行方針 |
| 命名規則ガイド | `outputs/phase-6/channel-naming-guide.md`  | 命名規則 |
| 最終レビュー   | `outputs/phase-10/final-review-result.md`  | 総合判定 |

## 漏れやすいポイント（06-known-pitfalls.md 参照）

| ID  | ポイント                      | 対策                                                            |
| --- | ----------------------------- | --------------------------------------------------------------- |
| P1  | LOGS.md 2ファイル更新漏れ     | aiworkflow-requirements + task-specification-creator 両方を更新 |
| P2  | topic-map.md 再生成忘れ       | 仕様書変更時は generate-index.js を実行                         |
| P3  | 未タスク管理の3ステップ不完全 | 指示書→task-workflow.md→関連仕様書リンクの3ステップ             |

## 成果物

| 成果物               | パス                                                     | 必須 |
| -------------------- | -------------------------------------------------------- | ---- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | ✅   |
| 仕様更新サマリ       | `outputs/phase-12/system-spec-update-summary.md`         | ✅   |
| ドキュメント変更履歴 | `outputs/phase-12/documentation-changelog.md`            | ✅   |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`          | ✅   |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`              | ✅   |
| 準拠確認             | `outputs/phase-12/phase12-task-spec-compliance-check.md` | ✅   |

## 完了条件

- [ ] 実行タスクを「表」と「`- Task 12-X:` 箇条書き」両方で記載している
- [ ] 実装ガイド（Part 1: 中学生レベル説明）に `たとえば` が含まれている
- [ ] 実装ガイド（Part 2: 技術詳細）が作成されている
- [ ] Phase 12 の必須 6 成果物が揃っている
- [ ] aiworkflow-requirements/LOGS.md にタスク完了エントリを追加した
- [ ] task-specification-creator/LOGS.md にタスク完了記録を追加した
- [ ] topic-map.md を再生成した
- [ ] `artifacts.json` と `outputs/artifacts.json` の parity を確認した
- [ ] 未タスク検出レポートが出力されている
- [ ] スキルフィードバックレポートが出力されている
- [ ] `phase12-task-spec-compliance-check.md` が Task 12-1〜12-5 / Step 1/2 と整合している
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] outputs/artifacts.json が root と一致している

## 次Phase

→ [Phase 13: PR作成](./phase-13-pr-creation.md)
