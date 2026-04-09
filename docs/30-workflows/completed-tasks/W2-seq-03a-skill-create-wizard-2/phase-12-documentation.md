# Phase 12: ドキュメント更新（canonical 6 成果物）

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 12                                                         |
| タスクID   | UT-SKILL-WIZARD-W2-SKILL-CREATE-WIZARD-001                 |
| 機能名     | SkillCreateWizard.tsx 実装（オーケストレーション・Wave 2） |
| 前提Phase  | Phase 11                                                   |
| 後続Phase  | Phase 13                                                   |
| 作成日     | 2026-04-08                                                 |
| ステータス | 未実施                                                     |

---

## 目的

仕様書・実装ガイド・フィードバック等の canonical 6 成果物を作成する。

## 背景

Phase 1-11 の全作業が完了した後、他のタスクや将来の開発者が本タスクの成果を活用できるよう、canonical 6 成果物を作成する。

---

## Phase 12 記録分離方針

- `実行タスク` は plan、`Phase実行記録` と `outputs/phase-12/*.md` は current fact として扱う
- `phase12-task-spec-compliance-check.md` は Task / Step / validator / artifacts.json / current-baseline の同値性を集約する root evidence として必ず作成する
- docs-only / spec_created workflow では Step 1-B の status を `spec_created` とし、`completed` へ置き換えない
- 仕様更新の有無は `documentation-changelog.md` と `system-spec-update-summary.md` で同じ結論にする
- spec 変更がある場合は `topic-map.md` を同 wave で再生成し、必要に応じて `LOGS.md` / `SKILL.md` history との整合も確認する

## 実行オーケストレーション

| SubAgent | 主担当                                             | 並列条件                         |
| -------- | -------------------------------------------------- | -------------------------------- |
| A        | Task 1 Part 1: `implementation-guide.md`（Part 1） | B と並列可                       |
| B        | Task 1 Part 2: `implementation-guide.md`（Part 2） | A と並列可                       |
| C        | Task 2: `system-spec-update-summary.md`            | A/B の草案固定後に並列可         |
| D        | Task 3: `documentation-changelog.md`               | C と並列可                       |
| E        | Task 4: `unassigned-task-detection.md`             | C/D の一次成果物が揃い次第並列可 |
| F        | Task 5: `skill-feedback-report.md`                 | E と並列可                       |
| G        | Task 6: `phase12-task-spec-compliance-check.md`    | A-F 固定後に実行                 |
| H        | Task 7: `skill-wizard-redesign-lane/index.md` 更新 | G の結果反映後に直列実行         |

---

## 実行タスク

### タスク1: 実装ガイド（implementation-guide.md）の作成

**目的**: 他タスクへの引き継ぎ情報をまとめる

**実行手順**:

1. `implementation-guide.md` を Part 1（中学生レベル）/ Part 2（技術者レベル）の 2 部構成で記述する
2. Part 1 に日常の例え話と「なぜ必要か」を先に書く
3. Part 2 に型定義・API シグネチャ・エッジケース・設定一覧を書く
4. `SkillCreateWizard.tsx` の新設計（3 ステップ）の概要を記述する
5. `inferSmartDefaults` の呼び出し方式（Props 経由）を記述する
6. NON_VISUAL 計装ポイント 5 つと `trackEvent` スタブの説明を記述する
7. Wave 3 の `trackEvent` 本実装への差し替え手順を記述する
8. W2-seq-03b との連携事項（`wizard/index.ts` エクスポート更新）を記述する
9. `outputs/phase-12/implementation-guide.md` として保存する

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

### タスク2: システム仕様更新サマリー（system-spec-update-summary.md）の作成

**目的**: システム仕様の変更点をサマリーとして記録する

**実行手順**:

1. 本タスクで変更されたシステム仕様を列挙する：
   - `SkillCreateWizard.tsx` の設計変更（3ステップ構成へ統一）
   - `inferSmartDefaults` の統合
   - NON_VISUAL 計装ポイント 5 つの追加
2. 変更の影響範囲を記述する
3. `outputs/phase-12/system-spec-update-summary.md` として保存する

**期待される成果物**:

- `outputs/phase-12/system-spec-update-summary.md`

---

### タスク3: ドキュメント変更履歴（documentation-changelog.md）の作成

**目的**: 本タスクで変更されたドキュメントの履歴を記録する

**実行手順**:

1. 作成・更新されたファイルのリストを作成する
2. 各ファイルの変更内容を記述する
3. `outputs/phase-12/documentation-changelog.md` として保存する

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

---

### タスク4: 未タスク検出記録（unassigned-task-detection.md）の作成

**目的**: 本タスク実施中に発見した未タスクを記録する

**実行手順**:

1. 本タスク実施中に発見した未対応の課題・改善点を記録する
2. W3-seq-04（使用率計装・`trackEvent` 本実装）が unblocked になったことを記録する
3. その他の未タスクを記録する
4. `outputs/phase-12/unassigned-task-detection.md` として保存する

**期待される成果物**:

- `outputs/phase-12/unassigned-task-detection.md`

---

### タスク5: スキル・フィードバックレポート（skill-feedback-report.md）の作成

**目的**: skill-wizard-redesign-lane の知見をフィードバックとして記録する

**実行手順**:

1. 本タスク実施で得られた知見・教訓を記録する：
   - `SmartDefaultResult` のステップ間受け渡し方式（Props 経由）の決定理由
   - ウィザード状態管理（`useState`）の判断理由
   - NON_VISUAL 計装ポイントのテスト設計（`vi.spyOn(console, 'log')`）
2. `outputs/phase-12/skill-feedback-report.md` として保存する

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`

---

### タスク6: タスク仕様書準拠チェック（phase12-task-spec-compliance-check.md）の作成

**目的**: 本仕様書と `task-specification-creator` / `aiworkflow-requirements` の正本との差分を確認する root evidence を作成する

**実行手順**:

1. 本仕様書（`docs/30-workflows/W2-seq-03a-skill-create-wizard-2/index.md`）の完了条件チェックリストと実際の成果物を照合する
2. canonical 6 成果物、Step 1-A / 1-B / 1-C、Step 2、`topic-map.md`、`LOGS.md` の整合を確認する
3. 乖離がある場合は記録し、対処する
4. `outputs/phase-12/phase12-task-spec-compliance-check.md` として保存する

**期待される成果物**:

- `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

### タスク7: skill-wizard-redesign-lane/index.md の更新

**目的**: W2-seq-03a のステータスを `completed` に更新する

**実行手順**:

1. `docs/30-workflows/skill-wizard-redesign-lane/index.md` を読み込む
2. W2-seq-03a のステータスを `completed` に更新する
3. 完了日を記録する

**期待される成果物**:

- 更新済みの `docs/30-workflows/skill-wizard-redesign-lane/index.md`

---

## 参照資料

| 参照資料                         | パス                                                                   | 内容               |
| -------------------------------- | ---------------------------------------------------------------------- | ------------------ |
| Phase 1-11 全成果物              | `outputs/phase-1/` 〜 `outputs/phase-11/`                              | 各 Phase の成果物  |
| skill-wizard-redesign-lane index | `docs/30-workflows/skill-wizard-redesign-lane/index.md`                | ステータス更新対象 |
| task-specification-creator 正本  | `.claude/skills/task-specification-creator/SKILL.md`                   | Phase 12 形式基準  |
| aiworkflow-requirements 正本     | `.claude/skills/aiworkflow-requirements/SKILL.md`                      | 仕様更新の正本     |
| lessons-learned                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | 教訓の記録先       |

---

## 成果物

| 成果物                   | パス                                                     | 内容             |
| ------------------------ | -------------------------------------------------------- | ---------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | 引き継ぎ情報     |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | 仕様変更点       |
| ドキュメント変更履歴     | `outputs/phase-12/documentation-changelog.md`            | ファイル変更履歴 |
| 未タスク検出記録         | `outputs/phase-12/unassigned-task-detection.md`          | 発見した未タスク |
| フィードバックレポート   | `outputs/phase-12/skill-feedback-report.md`              | 知見・教訓       |
| タスク仕様書準拠チェック | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 完了条件照合     |

---

## 完了条件

- [ ] `implementation-guide.md` が作成されていること
- [ ] `system-spec-update-summary.md` が作成されていること
- [ ] `documentation-changelog.md` が作成されていること
- [ ] `unassigned-task-detection.md` が作成されていること（W3-seq-04 の記録含む）
- [ ] `skill-feedback-report.md` が作成されていること
- [ ] `phase12-task-spec-compliance-check.md` が作成されていること
- [ ] `skill-wizard-redesign-lane/index.md` の W2-seq-03a ステータスが `completed` に更新されていること
- [ ] 本 Phase 内の全タスクを 100% 実行完了

---

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11（手動テスト・証跡記録）が完了していること
- **後続**: Phase 13（PR 作成）へ進む

---

## 次の Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/W2-seq-03a-skill-create-wizard-2/phase-13-pr-creation.md`
