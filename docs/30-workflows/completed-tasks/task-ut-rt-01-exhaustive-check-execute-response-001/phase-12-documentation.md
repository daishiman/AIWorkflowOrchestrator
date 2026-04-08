# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 12                                                  |
| Phase 名   | ドキュメント更新                                    |
| 前提 Phase | Phase 11（手動テスト）                              |
| 後続 Phase | Phase 13（PR 作成）                                 |
| ステータス | 未実施                                              |
| 作成日     | 2026-04-08                                          |
| 機能名     | task-ut-rt-01-exhaustive-check-execute-response-001 |

---

## 目的

実装ガイド（Part 1・Part 2）・システム仕様更新・ドキュメント更新履歴・未タスク検出レポート・スキルフィードバックレポート・コンプライアンスチェックを作成し、Phase 12 の 6 必須成果物を揃える。

## 背景

本タスクはリファクタリング（インターフェース不変）であるため、Task 2（システム仕様更新）の Step 2（システム仕様更新）は `N/A` とする判断を本 Phase で確定させる。

---

## Phase 12 記録分離方針

- `実行タスク` は plan、`Phase 実行記録` と `outputs/phase-12/*.md` は current fact として扱う
- `phase12-task-spec-compliance-check.md` は Task / Step / validator / artifacts.json / current-baseline の同値性を集約する root evidence として必ず作成する
- docs-only / spec_created workflow では Step 1-B の status を `spec_created` とし、`completed` へ置き換えない
- 仕様更新の有無は `documentation-changelog.md` と `system-spec-update-summary.md` で同じ結論にする

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### Task 1: 実装ガイド作成（Part 1 + Part 2）

**目的**: 初学者向け（Part 1）と開発者向け（Part 2）の実装ガイドを作成する。

**実行手順**:

1. `outputs/phase-12/implementation-guide.md` を作成する

#### Part 1（中学生レベル）の必須要件

- 「なぜ exhaustive check が必要か」を日常の例え話で説明する
  - 例：「定食屋のメニューに新メニューが追加されたとき、注文を受け付けるプログラムが新メニューを知らないままだと、お客さんの注文が通らない。TypeScript の exhaustive check は、新メニューが追加されたら必ずプログラムを修正するよう、コンパイラが警告してくれる仕組み」
- 専門用語は使わない（使う場合は即座に説明）
- `why / what / how` の順で説明する
- 例え話を 1 つ以上含める

#### Part 2（技術者レベル）の必須要件

- `RuntimeSkillCreatorExecuteResponse` union 型の構造（3 メンバー）
- current contract と target delta を分けて記述する
- `classifyExecuteResult()` の API シグネチャと使用例
- `extractExecuteErrorMessage()` の使用位置と error 正規化の責務
- `assertNever` による exhaustive check のコード例
- discriminant の優先順位（`type` フィールド → `success` → `error`）
- テスト方針（TC-01〜TC-09 の概要）
- 将来の union 拡張時の対応手順

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`（Part 1 + Part 2）

---

### Task 2: システム仕様書更新（4 サブステップ）

**目的**: システム仕様書を current facts に同期する。

#### Step 1-A: タスク完了記録

1. `aiworkflow-requirements` の `task-workflow-completed.md` に完了タスクを追記する：
   - タスク ID・タスク名・完了日・成果物リンク
2. `task-specification-creator/LOGS.md` と `aiworkflow-requirements/LOGS.md` の両方を更新する（2 ファイル必須）
3. `topic-map.md` を確認し、新規セクションがあれば追記する

#### Step 1-B: 実装状況テーブル更新

1. `task-workflow-backlog.md` の `TASK-UT-RT-01-EXHAUSTIVE-CHECK-EXECUTE-RESPONSE-001` を current facts に合わせて更新する
2. 本ブランチが docs-only の場合は `spec_created` を維持し、`completed` に上書きしない

#### Step 1-C: 関連タスクテーブル更新

1. `task-workflow.md` 内の関連タスクテーブルで本タスクのステータスを更新する
2. 親タスク（`TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001`）の未タスクリンクを確認する

#### Step 2: システム仕様更新（条件付き）

本タスクはリファクタリング（インターフェース不変）であるため、Step 2 は **N/A** とする：

- `classifyExecuteResult()` / `extractExecuteErrorMessage()` はモジュールスコープのプライベート関数であり、外部 API シグネチャの変更なし
- `assertNever` はモジュールスコープのプライベートヘルパーであり、外部 API シグネチャの変更なし
- `executeAsync()` の外部インターフェースは変更なし

**期待される成果物**:

- `outputs/phase-12/system-spec-update-summary.md`

---

### Task 3: ドキュメント更新履歴作成

**目的**: 本タスクの変更を `documentation-changelog.md` に記録する。

**実行手順**:

1. `outputs/phase-12/documentation-changelog.md` を作成する
2. 以下の内容を記録する：
   - Step 1-A: 完了タスク記録（完了）
   - Step 1-B: 実装状況テーブル更新（current facts に合わせて `spec_created` / `completed` を判断）
   - Step 1-C: 関連タスクテーブル更新（完了）
   - Step 2: N/A（リファクタリング、インターフェース不変）
   - 変更ファイル一覧（`RuntimeSkillCreatorFacade.ts`・テストファイル）
   - `current contract` / `target delta` の分離結果

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

---

### Task 4: 未タスク検出レポート作成（0 件でも出力必須）

**目的**: Phase 10 で記録した未タスク候補を formalize し、未タスク検出レポートを作成する。

**実行手順**:

1. `outputs/phase-12/unassigned-task-detection.md` を作成する
2. 以下のソースから未タスク候補を確認する：
   - Phase 10 の未タスク候補リスト（`verifyAndImproveLoop()` exhaustive check 化等）
   - 元タスク仕様書のスコープ外事項
3. 候補を `current`（新規発見）と `baseline`（元から既知）に分離して記録する
4. 候補が 0 件の場合も「検出なし」として出力する

**期待される成果物**:

- `outputs/phase-12/unassigned-task-detection.md`

---

### Task 5: スキルフィードバックレポート作成（改善点なしでも出力必須）

**目的**: task-specification-creator スキルへのフィードバックを記録する。

**実行手順**:

1. `outputs/phase-12/skill-feedback-report.md` を作成する
2. 以下の観点で記録する：
   - テンプレート改善: Phase 仕様書テンプレートの漏れや曖昧さ
   - ワークフロー改善: 機械検証や手順分岐の改善余地
   - ドキュメント改善: 再利用しやすい横断ガイドライン化の候補
3. 改善点がない場合も「改善提案なし」として出力する

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`

---

### Task 6: phase12-task-spec-compliance-check.md 作成

**目的**: Phase 12 の全成果物が揃っていることを root evidence として確認する。

**実行手順**:

1. `outputs/phase-12/phase12-task-spec-compliance-check.md` を作成する
2. 以下を照合する：
   - Task 1〜6 の成果物が全て作成されているか
   - `artifacts.json` の phase-12 エントリと実体ファイルが一致しているか
   - `task-workflow-completed.md` と `task-workflow-backlog.md` の ledger parity を確認する
   - `plan` / `予定` / `TODO` の残骸が許容箇所以外に残っていないか grep 監査する

**期待される成果物**:

- `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

## 参照資料

| 参照資料                     | パス                                                                                   | 内容                        |
| ---------------------------- | -------------------------------------------------------------------------------------- | --------------------------- |
| phase-12-documentation-guide | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` | Phase 12 ガイド             |
| spec-update-workflow         | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | Step 1-A〜1-C・Step 2 手順  |
| phase12-checklist-definition | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md` | Phase 12 チェックリスト定義 |

---

## 成果物

| 成果物                                | パス                                                     | 内容                               |
| ------------------------------------- | -------------------------------------------------------- | ---------------------------------- |
| implementation-guide.md               | `outputs/phase-12/implementation-guide.md`               | Part 1（初学者）+ Part 2（技術者） |
| system-spec-update-summary.md         | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-C・Step 2 N/A          |
| documentation-changelog.md            | `outputs/phase-12/documentation-changelog.md`            | 変更履歴一覧                       |
| unassigned-task-detection.md          | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク候補（0 件でも出力）       |
| skill-feedback-report.md              | `outputs/phase-12/skill-feedback-report.md`              | スキルフィードバック               |
| phase12-task-spec-compliance-check.md | `outputs/phase-12/phase12-task-spec-compliance-check.md` | root evidence                      |

---

## 統合テスト連携

- `task-workflow-completed.md` / `task-workflow-backlog.md` の ledger parity を確認する。
- LOGS.md 2 ファイル（aiworkflow-requirements + task-specification-creator）を同波更新する。

---

## 完了条件

- [ ] `outputs/phase-12/implementation-guide.md` が作成されている（Part 1 + Part 2）
- [ ] `outputs/phase-12/system-spec-update-summary.md` が作成されている
- [ ] `outputs/phase-12/documentation-changelog.md` が作成されている
- [ ] `outputs/phase-12/unassigned-task-detection.md` が作成されている（0 件でも作成）
- [ ] `outputs/phase-12/skill-feedback-report.md` が作成されている（改善点なしでも作成）
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` が作成されている
- [ ] LOGS.md 2 ファイルが更新されている
- [ ] `artifacts.json` の phase-12 エントリと実体ファイルが一致している

---

## Phase 末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11（手動テスト）が完了していること
- **後続**: Phase 13（PR 作成）へ進む

---

## Phase 実行記録

Phase 完了後、以下を記録してください：

```markdown
## Phase 12 実行記録

### Task 完了状況

| Task | 内容                      | 完了 |
| ---- | ------------------------- | ---- |
| 1    | 実装ガイド（Part 1+2）    | □    |
| 2    | システム仕様更新          | □    |
| 3    | ドキュメント更新履歴      | □    |
| 4    | 未タスク検出レポート      | □    |
| 5    | スキルフィードバック      | □    |
| 6    | Phase 12 コンプライアンス | □    |

### Step 2 判定

- Step 2 実施: N/A（リファクタリング、インターフェース不変）
- 根拠: classifyExecuteResult() / assertNever() はプライベート関数で外部 API 不変

### 次 Phase への引き継ぎ事項

-
```

---

## 次の Phase

完了後、以下のファイルを実行してください：

`docs/30-workflows/task-ut-rt-01-exhaustive-check-execute-response-001/phase-13-pr-creation.md`
