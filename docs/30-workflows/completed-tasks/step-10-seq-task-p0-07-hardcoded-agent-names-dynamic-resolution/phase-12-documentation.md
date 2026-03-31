# Phase 12: ドキュメント更新

## メタ情報

| 項目      | 値                                       |
| --------- | ---------------------------------------- |
| Phase     | 12                                       |
| Phase名   | ドキュメント更新                         |
| 機能名    | hardcoded-agent-names-dynamic-resolution |
| 前提Phase | Phase 11: 手動テスト                     |
| 次Phase   | Phase 13: PR 作成                        |
| 状態      | completed                                |
| 作成日    | 2026-03-29                               |
| 更新日    | 2026-03-30                               |

## 目的

実装差分に伴うドキュメント更新を、task-specification-creator の Phase 12 規約と aiworkflow-requirements の正本同期ルールの両方に従って完了する。Part 1/2 の実装ガイド、システム仕様更新、変更履歴、未タスク検出、skill feedback を同じ wave で閉じる。

## 必須タスク

| Task | 名称                             | 必須 | 詳細参照                |
| ---- | -------------------------------- | ---- | ----------------------- |
| 1    | 実装ガイド作成（2パート構成）    | ✅   | 下記参照                |
| 2    | システム仕様更新（2ステップ）    | ✅   | 下記参照                |
| 3    | ドキュメント更新履歴作成         | ✅   | 下記参照                |
| 4    | 未タスク検出レポート作成         | ✅   | 0件でも出力必須         |
| 5    | スキルフィードバックレポート作成 | ✅   | 改善点なしでも出力必須  |
| 6    | Phase 12 準拠チェック            | ✅   | 6成果物と実測証跡を集約 |

## 実行タスク

- Phase 5 の実装差分を、利用者向けと開発者向けの両方で説明可能な形にする
- aiworkflow-requirements の正本へ、実装事実と依存の更新を反映する
- 変更履歴、未タスク、skill feedback を同一 Phase で閉じる

## 参照資料

| 資料名                     | パス                                                          | 説明                     |
| -------------------------- | ------------------------------------------------------------- | ------------------------ |
| task-specification-creator | `../../../.claude/skills/task-specification-creator/SKILL.md` | Phase 12 の正本          |
| aiworkflow-requirements    | `../../../.claude/skills/aiworkflow-requirements/SKILL.md`    | システム仕様の正本       |
| Phase 5 実装               | `phase-5-implementation.md`                                   | 実装内容                 |
| Phase 1 要件               | `phase-1-requirements.md`                                     | 仕様の前提               |
| index.md                   | `index.md`                                                    | 受入基準と依存関係の正本 |

## 実行手順

### Task 1: 実装ガイドを作成する

#### Part 1: 中学生レベルの説明

- 日常生活のたとえ話を 1 つ以上入れる
- なぜ必要かを先に説明し、その後に何をするかを説明する
- 専門用語を使う場合は、その場で短く言い換える

#### Part 2: 技術者レベルの説明

- TypeScript の interface / type を載せる
- API シグネチャと使用例を書く
- エラーハンドリングとエッジケースをまとめる
- 設定可能なパラメータと定数を一覧化する

### Task 2: システム仕様を更新する

#### Step 1-A: タスク完了記録

- 「完了タスク」セクションを追加する
- 関連ドキュメントへのリンクを追加する
- 変更履歴を反映する
- `LOGS.md` を 2 ファイル分更新する
- `topic-map.md` を更新する

#### Step 1-B: 実装状況テーブル更新

- 実装完了の項目は「未実装」から「完了」へ更新する
- 仕様書作成のみの項目は `spec_created` を記録する

#### Step 1-C: 関連タスクテーブル更新

- 仕様書内の「関連タスク」「未タスク候補」テーブルを current facts に合わせて更新する

#### Step 2: 条件付きシステム仕様更新

- 新規インターフェース / 型 / 定数 / API 変更がある場合のみ更新する
- 内部実装の詳細変更のみなら N/A とする

### Task 3: 変更履歴を作成する

- documentation-changelog.md に、更新対象と理由を記録する

### Task 4: 未タスク検出レポートを作成する

- 0 件でも必ず出力する
- 検出根拠と N/A 理由を残す

### Task 5: スキルフィードバックレポートを作成する

- 仕様へ反映した改善点を記録する
- 改善点がなければ、その理由を明記して空欄にしない

## 成果物

| 成果物                  | パス                                                     | 説明                     |
| ----------------------- | -------------------------------------------------------- | ------------------------ |
| implementation guide    | `outputs/phase-12/implementation-guide.md`               | Part 1/2 の実装ガイド    |
| system spec update      | `outputs/phase-12/system-spec-update-summary.md`         | 正本同期の反映結果       |
| documentation changelog | `outputs/phase-12/documentation-changelog.md`            | 変更履歴                 |
| unassigned tasks report | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出             |
| skill feedback report   | `outputs/phase-12/skill-feedback-report.md`              | skill へのフィードバック |
| compliance check        | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 準拠確認        |

## 完了条件

- [ ] Part 1 / Part 2 の実装ガイドが作成されている
- [ ] システム仕様更新の Step 1-A〜1-C と Step 2 の判定が完了している
- [ ] 変更履歴が記録されている
- [ ] 未タスク検出レポートが作成されている
- [ ] スキルフィードバックレポートが作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次Phase

→ [Phase 13: PR 作成](./phase-13-pr-creation.md)
