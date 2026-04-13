# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 12                                      |
| Phase名    | ドキュメント更新                        |
| 前提Phase  | Phase 11（手動テスト検証）              |
| 後続Phase  | Phase 13                                |
| ステータス | 完了                                    |
| 作成日     | 2026-04-13                              |
| 機能名     | TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 |

---

## 目的

実装完了後に、aiworkflow-requirements の仕様正本・実装ガイド・システム仕様更新サマリー・
未タスク検出・スキルフィードバックを更新し、次の開発者が知見を活用できる状態にする。

## Phase 12 記録分離方針

- `実行タスク` は plan、`Phase実行記録` と `outputs/phase-12/*.md` は current fact として扱う
- `phase12-task-spec-compliance-check.md` は root evidence として必ず作成し、Task 12-1〜12-5 完了後に閉じる
- 仕様更新の有無は `documentation-changelog.md` と `system-spec-update-summary.md` で同じ結論にする
- `Phase 12` では `system-spec-update-summary.md` に Step 1-A〜1-C と Step 2 の要否を明記する

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 実装ガイド作成

**目的**: このタスクで得られた実装知見を次の開発者が活用できる形でまとめる

**実行手順**:

1. `outputs/phase-12/implementation-guide.md` を作成する
2. Part 1 / Part 2 の 2部構成にする
3. Part 1 では以下を必須にする:
   - 中学生レベルの概念説明
   - 日常生活の例え話
   - 「なぜ必要か」を先に説明してから「何をするか」を説明
   - 専門用語を使う場合は即座に説明する
4. Part 2 では以下を必須にする:
   - TypeScript の型定義
   - API シグネチャと使用例
   - エラーハンドリングとエッジケース
   - 設定可能なパラメータと定数の一覧
5. `weekly` との対称ガード、TDD の Red→Green、`Number.isInteger` を使う理由を記録する

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`（実装ガイド）

---

### タスク2: システム仕様更新サマリー

**目的**: 仕様正本・実装状況・関連タスクの current facts を同期する

**実行手順**:

1. `outputs/phase-12/system-spec-update-summary.md` を作成する
2. Step 1-A で完了タスク記録を残す:
   - 完了タスクID
   - 完了日
   - 実装ファイル
   - テストファイル
   - 関連ドキュメント
3. Step 1-B で current facts を同期する:
   - `index.md` の Phase ステータス
   - `artifacts.json` の Phase ステータス
   - `outputs/artifacts.json` がある場合は同値性確認
4. Step 1-C で関連タスク / 未タスク候補の状態を更新する
5. `LOGS.md` 更新対象を明記する:
   - `.claude/skills/task-specification-creator/LOGS.md`
   - `.claude/skills/aiworkflow-requirements/LOGS.md`
   - `.claude/skills/task-specification-creator/SKILL.md` の変更履歴
   - `.claude/skills/aiworkflow-requirements/SKILL.md` の変更履歴
6. Step 2 は新規インターフェース / API / architecture 変更がないため N/A とする

**期待される成果物**:

- `outputs/phase-12/system-spec-update-summary.md`（システム仕様更新サマリー）

---

### タスク3: ドキュメント更新ログ作成

**目的**: 何をどのように更新したかを記録する

**実行手順**:

1. 以下の内容で `outputs/phase-12/documentation-changelog.md` を作成する:

   | 更新対象                     | 更新内容                                   | 更新日     |
   | ---------------------------- | ------------------------------------------ | ---------- |
   | `cronConverter.ts`           | `monthly` 分岐にガード処理追加・JSDoc 更新 | 2026-04-13 |
   | `cronConverter.edge.test.ts` | TC-11〜TC-15 追加（エッジケース拡充含む）  | 2026-04-13 |
   | タスク仕様書本体             | 13 Phase 仕様の再構成・Phase 12 6タスク化  | 2026-04-13 |

2. current / baseline を分けて記録する
3. `artifacts.json` と `outputs/artifacts.json` がある場合は parity を確認する
4. 仕様更新の有無とその理由を明記する

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`（更新ログ）

---

### タスク4: 未タスク検出

**目的**: このタスクの実施過程で発見された未実装の課題を記録する

**実行手順**:

1. 以下の未タスク候補を確認・検討する:
   - `hour`/`minute` の範囲チェック（スコープ外として除外済み）→ 将来のタスク候補
   - `dayOfMonth: null` の既定値ルールは別契約として残っているか
   - `TASK-CRON-ALL-FREQUENCY-GUARD-001` として切り出し可能か検討する
2. 0件でも `outputs/phase-12/unassigned-task-detection.md` を作成する
3. 新規未タスクがある場合は `docs/30-workflows/unassigned-task/` に正式化する

**期待される成果物**:

- `outputs/phase-12/unassigned-task-detection.md`（未タスク検出レポート）

---

### タスク5: スキルフィードバック作成

**目的**: task-specification-creator skill の改善点や知見を記録する

**実行手順**:

1. このタスクで得られた以下の知見をまとめる:
   - `implementation-guide.md` は Part 1 / Part 2 を分けると読みやすい
   - 月次ガードは整数範囲の責務に絞り、`null` の既定値ルールは別契約に分離する方が読みやすい
   - `weekly` との対称パターン確認が Phase 3 レビューゲートで有効だった
   - NON_VISUAL タスクでは Phase 11 の smoke check を最小化するとよい
2. `outputs/phase-12/skill-feedback-report.md` を作成する
3. 改善提案がある場合は task-specification-creator / aiworkflow-requirements の両観点で記録する

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`（スキルフィードバック）

### タスク6: Phase 12 準拠チェック

**目的**: Phase 12 の全成果物が skill 定義に準拠しているか最終確認する

**実行手順**:

1. 以下の 6 成果物がすべて揃っているか確認する:
   - `outputs/phase-12/implementation-guide.md`
   - `outputs/phase-12/system-spec-update-summary.md`
   - `outputs/phase-12/documentation-changelog.md`
   - `outputs/phase-12/unassigned-task-detection.md`
   - `outputs/phase-12/skill-feedback-report.md`
   - `outputs/phase-12/phase12-task-spec-compliance-check.md`
2. `task-specification-creator` の Phase 12 必須条件と整合しているか確認する
3. planned wording（`TODO`, `予定`, `保留` など）が残っていないか確認する
4. `system-spec-update-summary.md` と `documentation-changelog.md` の結論が一致しているか確認する
5. `phase12-task-spec-compliance-check.md` を作成する

**期待される成果物**:

- `outputs/phase-12/phase12-task-spec-compliance-check.md`（Phase 12 準拠チェック）

---

## 参照資料

| 参照資料                 | パス                                                                                    | 内容            |
| ------------------------ | --------------------------------------------------------------------------------------- | --------------- |
| Phase 12 準拠基準        | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`  | 成果物要件      |
| 技術ドキュメント指針     | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | Part 1 / 2 指針 |
| 仕様更新ワークフロー     | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Step 1 / Step 2 |
| aiworkflow-requirements  | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                        | 仕様正本確認    |
| 実装ファイル             | `apps/desktop/src/renderer/utils/cronConverter.ts`                                      | 最終実装状態    |
| Phase 11 成果物          | `outputs/phase-11/manual-test-result.md`                                                | 手動テスト結果  |
| unassigned-task 元仕様書 | `docs/30-workflows/unassigned-task/TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001.md`          | 発見元          |

---

## 成果物

| 成果物                   | パス                                                     | 内容                |
| ------------------------ | -------------------------------------------------------- | ------------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | 実装知見まとめ      |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Step 1/2 の同期結果 |
| ドキュメント更新ログ     | `outputs/phase-12/documentation-changelog.md`            | 更新内容の記録      |
| 未タスク検出レポート     | `outputs/phase-12/unassigned-task-detection.md`          | 新規タスク候補一覧  |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              | skill 改善知見      |
| Phase 12 準拠チェック    | `outputs/phase-12/phase12-task-spec-compliance-check.md` | root evidence       |

---

## 統合テスト連携

- 本Phaseはドキュメント更新のため、新規テストの追加はなし
- ドキュメント更新の整合性を `phase12-task-spec-compliance-check.md` で確認する

---

## 完了条件

- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` が作成されている
- [ ] `outputs/phase-12/implementation-guide.md` が作成されている
- [ ] `outputs/phase-12/system-spec-update-summary.md` が作成されている
- [ ] `outputs/phase-12/documentation-changelog.md` が作成されている（仕様更新の有無が明記されている）
- [ ] `outputs/phase-12/unassigned-task-detection.md` が作成されている
- [ ] `outputs/phase-12/skill-feedback-report.md` が作成されている
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜6）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11（手動テスト検証）が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001/phase-13-pr-creation.md`
