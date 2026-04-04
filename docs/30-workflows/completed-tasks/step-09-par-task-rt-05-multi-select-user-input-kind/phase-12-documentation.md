# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 12                           |
| 機能名 | multi-select-user-input-kind |
| 作成日 | 2026-03-29                   |

## 目的

implementation guide、system spec update summary、documentation changelog、unassigned-task detection、skill feedback report を docs-only workflow として完結させる。

## 実行タスク

| Task | 名称                       | 内容                                                                             |
| ---- | -------------------------- | -------------------------------------------------------------------------------- |
| 12-1 | implementation guide       | Part 1 と Part 2 の 2 部構成で `multi_select` 契約を説明する                     |
| 12-2 | system spec update summary | workflow、依存、型変更境界を exact path 付きで整理する                           |
| 12-3 | documentation changelog    | current / baseline / validator 結果を記録する                                    |
| 12-4 | unassigned-task detection  | follow-up の有無を 0件でも記録する                                               |
| 12-5 | skill feedback report      | `task-specification-creator` と `aiworkflow-requirements` への改善示唆を記録する |
| 12-6 | compliance check           | Task 12-1〜12-5 の完了確認を行う                                                 |

1. implementation guide を作成する
2. system spec update summary を作成する
3. documentation changelog を作成する
4. unassigned-task detection を作成する
5. skill feedback report と compliance check を作成する

## 参照資料

| 資料名               | パス                           | 説明         |
| -------------------- | ------------------------------ | ------------ |
| index                | `index.md`                     | 全体像       |
| Phase 1 要件         | `phase-1-requirements.md`      | 契約         |
| Phase 2 設計         | `phase-2-design.md`            | 実装方針     |
| Phase 9 QA           | `phase-9-quality-assurance.md` | validator    |
| Phase 10 gate        | `phase-10-final-review.md`     | review 結果  |
| Phase 11 walkthrough | `phase-11-manual-test.md`      | 手動確認観点 |

## Phase 10 MINOR 追跡

| MINOR ID | 指摘内容                   | 解決予定Phase | 解決確認Phase | 解決方法 | ステータス |
| -------- | -------------------------- | ------------- | ------------- | -------- | ---------- |
| なし     | Phase 10 で MINOR 指摘なし | --            | --            | --       | --         |

## 実行手順

### ステップ1: Task 12-1 implementation guide を作成する

**Part 1: 初学者向け説明**

- 複数選択は「1つだけ選ぶ」質問を「いくつでも選べる」質問へ広げる変更として説明する
- 例えは「好きな教科を1つ選ぶ」から「好きな教科を全部選ぶ」へ変わる場面を使う
- 専門用語を使う場合は同じ段落で説明する

**Part 2: 技術詳細**

- `SkillCreatorUserInputKind` へ `multi_select` を追加する理由
- `SkillCreatorUserInputSubmission.selectedOptionIds` を採用する理由
- engine validation の条件
- renderer state と submit 分岐
- regression test の観点

### ステップ2: Task 12-2 system spec update summary を作成する

- workflow doc 自体の更新を exact path で列挙する
- Step 2 の system spec update は、実装時に shared contract を更新した場合のみ required と判定する
- 本 task spec 単体の close-out では、`multi_select` が workflow doc の責務に留まるか、shared contract 変更を伴うかを明記する

### ステップ3: Task 12-3〜12-5 を作成する

- `documentation-changelog.md` に baseline と current の差分を記録する
- `outputs/phase-12/unassigned-task-detection.md` に follow-up 候補を 0件でも記録する
- `skill-feedback-report.md` に今回の validator 観点からの改善案を記録する

## 成果物

| 成果物                     | パス                                                     | 説明                           |
| -------------------------- | -------------------------------------------------------- | ------------------------------ |
| implementation guide       | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2                |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | exact path 一覧                |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            | current / baseline / validator |
| unassigned-task detection  | `outputs/phase-12/unassigned-task-detection.md`          | follow-up 候補                 |
| skill feedback report      | `outputs/phase-12/skill-feedback-report.md`              | skill 改善案                   |
| compliance check           | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-5 の完了確認     |

## サブタスク管理

1. Phase 10 の結果を確認する
2. Part 1 / Part 2 の implementation guide を作成する
3. system spec update summary と documentation changelog を作成する
4. unassigned-task detection と skill feedback report を作成する
5. compliance check を実施する

## 完了条件

- [ ] implementation guide が Part 1 と Part 2 を含む
- [ ] 5 つの主要成果物と compliance check の配置先が定義されている
- [ ] system spec update summary の判断条件が定義されている
- [ ] current / baseline / validator を記録する方針が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
