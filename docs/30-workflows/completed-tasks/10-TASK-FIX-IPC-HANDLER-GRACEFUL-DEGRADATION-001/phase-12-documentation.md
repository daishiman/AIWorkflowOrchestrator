# Phase 12: ドキュメント更新

## メタ情報

| 項目     | 値                                            |
| -------- | --------------------------------------------- |
| Phase    | 12                                            |
| タスクID | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 |
| 機能名   | ipc-handler-graceful-degradation              |
| 作成日   | 2026-03-07                                    |

## 目的

Graceful Degradation の実装意図、システム仕様同期、未タスク検出、スキル改善点の記録を行う。Phase 12 は構造PASSだけでは不十分なので、Task 1〜5 の実体と Step 結果の両方を残す。

## 実行タスク

- Task 1: 実装ガイド作成（Part 1: 中学生レベル、Part 2: 開発者向け技術詳細）
- Task 2: システム仕様書更新（`spec-update-workflow.md` 準拠）
- Task 3: `documentation-changelog.md` 作成
- Task 4: 未タスク検出（0件でも `report` と `detection` を両方出力）
- Task 5: `skill-feedback-report.md` 作成（改善点なしでも必須）

## 参照資料

| 資料名               | パス                                                                                                           | 説明                      |
| -------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------- |
| Phase 12 更新手順    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                 | Step 1-A〜2 の正本        |
| Phase 12 実体確認    | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`                         | 必須成果物の確認基準      |
| Phase 11/12 ガイド   | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                                    | Part 1/2 と 0件出力ルール |
| quick reference      | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                                            | 仕様抽出の起点            |
| 実装コード           | `apps/desktop/src/main/ipc/index.ts`                                                                           | Main Process 変更対象     |
| 完了済み類題         | `docs/30-workflows/completed-tasks/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/outputs/phase-12/implementation-guide.md` | 同ドメインの完成例        |
| 落とし穴             | `.claude/rules/06-known-pitfalls.md`                                                                           | P1-P5, P25-P31, P38, P43  |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                                                                   | Phase 1 成果物            |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`                                                                       | Phase 1 成果物            |
| スコープ定義         | `outputs/phase-1/scope-definition.md`                                                                          | Phase 1 成果物            |
| 設計書               | `outputs/phase-2/design-document.md`                                                                           | Phase 2 成果物            |
| 型定義設計           | `outputs/phase-2/type-definitions.md`                                                                          | Phase 2 成果物            |
| シーケンス図         | `outputs/phase-2/sequence-diagram.md`                                                                          | Phase 2 成果物            |
| 実装レポート         | `outputs/phase-5/implementation-report.md`                                                                     | Phase 5 成果物            |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md`                                                                           | Phase 8 成果物            |
| 品質検証結果         | `outputs/phase-9/quality-report.md`                                                                            | Phase 9 成果物            |
| 最終レビュー結果     | `outputs/phase-10/final-review.md`                                                                             | Phase 10 成果物           |
| 要件充足マトリクス   | `outputs/phase-10/requirements-matrix.md`                                                                      | Phase 10 成果物           |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`                                                                       | Phase 11 成果物           |
| 発見課題一覧         | `outputs/phase-11/discovered-issues.md`                                                                        | Phase 11 成果物           |

### 今回の実装で確認すべき aiworkflow-requirements 抽出結果

| 関心ごと           | 参照先                                                                                                                                       | Phase 12 で確認する内容                                   |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| IPC ライフサイクル | `references/security-electron-ipc.md`                                                                                                        | register / unregister 対称性と非IPCリスナー解除           |
| 実装パターン       | `references/architecture-implementation-patterns.md`                                                                                         | Main Process の再登録・部分失敗パターン                   |
| 登録一元管理       | `references/arch-ipc-persistence.md`                                                                                                         | `registerAllIpcHandlers` を単一入口として維持できているか |
| サービス初期化     | `references/arch-electron-services.md`                                                                                                       | 失敗境界をどの初期化グループで切るか                      |
| エラー分類         | `references/error-handling.md`                                                                                                               | Infrastructure Error とログ最小化                         |
| IPC 契約           | `references/api-ipc-system.md`                                                                                                               | runtime contract 変更の有無                               |
| 再発防止           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | P5、解除漏れ、監査順序の教訓同期                          |

### 前提Phase成果物

| 資料名          | パス                | 用途                                |
| --------------- | ------------------- | ----------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | Phase 1 の出力を入力として参照する  |
| Phase 2 成果物  | `outputs/phase-2/`  | Phase 2 の出力を入力として参照する  |
| Phase 3 成果物  | `outputs/phase-3/`  | Phase 3 の出力を入力として参照する  |
| Phase 4 成果物  | `outputs/phase-4/`  | Phase 4 の出力を入力として参照する  |
| Phase 5 成果物  | `outputs/phase-5/`  | Phase 5 の出力を入力として参照する  |
| Phase 6 成果物  | `outputs/phase-6/`  | Phase 6 の出力を入力として参照する  |
| Phase 7 成果物  | `outputs/phase-7/`  | Phase 7 の出力を入力として参照する  |
| Phase 8 成果物  | `outputs/phase-8/`  | Phase 8 の出力を入力として参照する  |
| Phase 9 成果物  | `outputs/phase-9/`  | Phase 9 の出力を入力として参照する  |
| Phase 10 成果物 | `outputs/phase-10/` | Phase 10 の出力を入力として参照する |
| Phase 11 成果物 | `outputs/phase-11/` | Phase 11 の出力を入力として参照する |

## 実行手順

### Task 1: 実装ガイド作成【必須・2パート構成】

ファイル: `outputs/phase-12/implementation-guide.md`

**Part 1 要件**

- 日常生活の例え話を先に置き、「なぜ必要か」→「どう直すか」の順に説明する
- `registerAllIpcHandlers` / `safeRegister` / IPC をそのまま投げず、日常語へ翻訳する
- 「1箇所の故障で残り全部が止まる」問題を中学生でも追えるようにする

**Part 2 要件**

- `HandlerRegistrationFailure` / `IpcHandlerRegistrationResult` の想定型定義を載せる
- `safeRegister()` の想定シグネチャと利用例を載せる
- エラーハンドリング、エッジケース、設定/定数（例: Infrastructure Error 4000番台）を明記する
- `unregisterAllIpcHandlers` との対称性、`themeWatcherUnsubscribe` のような非IPCリスナーも扱う

### Task 2: システム仕様書更新【必須】

#### Step 1-A: タスク完了記録

- [ ] `aiworkflow-requirements/LOGS.md` を更新する
- [ ] `.claude/skills/task-specification-creator/LOGS.md` を更新する
- [ ] `aiworkflow-requirements/SKILL.md` の変更履歴を更新する
- [ ] `.claude/skills/task-specification-creator/SKILL.md` の変更履歴を更新する

#### Step 1-B: 実装状況テーブル更新

- [ ] `api-ipc-system.md` に Graceful Degradation の登録/解除契約を追記する
- [ ] `security-electron-ipc.md` の関連セクションへ完了状態を同期する

#### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rn "TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001" .claude/skills/aiworkflow-requirements/references/` で関連箇所を列挙する
- [ ] `.claude/skills/aiworkflow-requirements/references/task-workflow.md` / `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` / `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md` の関連タスク欄を更新する

#### Step 1-D: topic-map.md 再生成

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行する

#### Step 2: 仕様本文更新

| 更新対象                                                                                                                                     | 反映内容                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `security-electron-ipc.md`                                                                                                                   | register / unregister 対称性、非IPCリスナー解除 |
| `architecture-implementation-patterns.md`                                                                                                    | Main Process 側の graceful degradation パターン |
| `arch-electron-services.md`                                                                                                                  | 失敗境界を初期化グループ単位で扱う設計          |
| `error-handling.md`                                                                                                                          | Infrastructure Error とログ最小化               |
| `api-ipc-system.md`                                                                                                                          | runtime contract と登録責務                     |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | 再発防止、監査順序、苦戦箇所                    |

### Task 3: documentation-changelog.md 作成【必須】

ファイル: `outputs/phase-12/documentation-changelog.md`

- [ ] Step 1-A〜Step 2 の結果を表で残す
- [ ] 「更新不要」と判断した項目は理由を残す
- [ ] 全確認前に `完了` と書かない

### Task 4: 未タスク検出【0件でも必須】

ファイル:

- `outputs/phase-12/unassigned-task-report.md`
- `outputs/phase-12/unassigned-task-detection.md`

- [ ] Phase 3 / 10 / 11 の結果から未タスク候補を洗い出す
- [ ] 新規検出がある場合は `docs/30-workflows/unassigned-task/` へ起票する
- [ ] `.claude/skills/aiworkflow-requirements/references/task-workflow.md` と関連仕様書に同じ ID を同期する
- [ ] 0件でも件数と根拠を出力する

### Task 5: スキルフィードバックレポート作成【改善点なしでも必須】

ファイル: `outputs/phase-12/skill-feedback-report.md`

- [ ] `task-specification-creator` のテンプレート/validator で再発しやすい穴を記録する
- [ ] `aiworkflow-requirements` から必要仕様を引く導線の改善点を記録する
- [ ] 改善点なしでも「改善点なし」と明記する

## 統合テスト連携

- 実装ガイドのコード例が Phase 2 設計と矛盾しないことを確認する
- 仕様更新後、Phase 5〜10 の想定テスト項目（部分失敗継続、解除安全性、ログ最小化）と文書内容を突き合わせる
- `validate-phase12-implementation-guide.js` と `validate-phase-output.js`、`validate-phase11-screenshot-coverage.js` の 3 本で通る構造にする

## 成果物

| 成果物               | パス                                            | 説明                      |
| -------------------- | ----------------------------------------------- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1 + Part 2           |
| ドキュメント変更ログ | `outputs/phase-12/documentation-changelog.md`   | Step結果の記録            |
| 未タスクレポート     | `outputs/phase-12/unassigned-task-report.md`    | 人間向けサマリー          |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md` | 件数・根拠・3ステップ判定 |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | 改善提案または改善点なし  |

## 完了条件

- [ ] Task 1 の Part 1 / Part 2 が両方出力されている
- [ ] Task 2 の Step 1-A〜2 の結果が `documentation-changelog.md` に記録されている
- [ ] `LOGS.md` 2ファイルと `SKILL.md` 2ファイルの更新要否が判断されている
- [ ] `topic-map.md` 再生成の実行有無が記録されている
- [ ] 未タスクが 0件でも `report` と `detection` の両方が出力されている
- [ ] `skill-feedback-report.md` が改善点なしを含めて出力されている
- [ ] `validate-phase12-implementation-guide.js` と `validate-phase-output.js`、`validate-phase11-screenshot-coverage.js` が通る
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 13: PR作成
