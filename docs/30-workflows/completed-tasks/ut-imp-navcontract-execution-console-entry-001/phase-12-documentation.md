# Phase 12: ドキュメント

## メタ情報

| 項目   | 値                                             |
| ------ | ---------------------------------------------- |
| Phase  | 12                                             |
| 機能名 | ut-imp-navcontract-execution-console-entry-001 |
| 作成日 | 2026-03-24                                     |

## 目的

実装ガイド・システム仕様書更新・未タスク検出を実施する。

## 実行タスク

| Task      | 内容                                                   | 主成果物                                         |
| --------- | ------------------------------------------------------ | ------------------------------------------------ |
| Task 12-1 | 技術ドキュメント作成（実装ガイド作成）                 | `outputs/phase-12/implementation-guide.md`       |
| Task 12-2 | システムドキュメント更新（aiworkflow-requirements 等） | `outputs/phase-12/system-spec-update-summary.md` |
| Task 12-3 | ドキュメント更新履歴作成                               | `outputs/phase-12/documentation-changelog.md`    |
| Task 12-4 | 未タスク検出（残課題の検出と記録）                     | `outputs/phase-12/unassigned-task-detection.md`  |
| Task 12-5 | スキルフィードバックレポート作成                       | `outputs/phase-12/skill-feedback-report.md`      |

- Task 12-1: 技術ドキュメント作成（実装ガイド作成）
- Task 12-2: システムドキュメント更新（aiworkflow-requirements等の更新）
- Task 12-3: ドキュメント更新履歴作成（変更履歴の記録）
- Task 12-4: 未タスク検出（残課題の検出と記録）
- Task 12-5: スキルフィードバックレポート作成（ワークフロー改善点と技術的教訓の記録）

## 参照資料

| 資料名               | パス                                                                           | 説明                 |
| -------------------- | ------------------------------------------------------------------------------ | -------------------- |
| 最終レビュー         | `outputs/phase-10/final-review-result.md`                                      | Phase 10成果物       |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`                                       | Phase 11成果物       |
| 仕様更新ワークフロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | Step 1-A〜Step 2手順 |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`                                           | Phase 12関連項目     |

## サブフェーズ

### Task 12-1: 実装ガイド作成

#### Part 1: 中学生レベル概念説明

**日常の例え話**: アプリの「メニュー画面」を想像してください。スマートフォンの下にある「ホーム」「検索」「設定」のようなボタンがありますよね。このタスクは、そのメニューに新しいボタン「実行コンソール」を追加する作業です。新しいお店がショッピングモールに出店するとき、フロアガイド（案内板）に新しいお店の名前と場所を追加するのと同じです。

**何をしたか**:

1. 新しいアイコン（再生ボタンのような丸い矢印）を追加した
2. メニューの「補助機能」グループに「実行コンソール」ボタンを追加した
3. キーボードの `Cmd+9` で素早くアクセスできるようにした

#### Part 2: 技術者レベル詳細

**変更概要**:

| ファイル          | 変更内容                                                   |
| ----------------- | ---------------------------------------------------------- |
| `Icon/index.tsx`  | `PlayCircle` import、`IconName` union、`iconMap` Record    |
| `navContract.ts`  | `DockViewType` Extract union、`NAV_SECTIONS`、shortcut map |
| テストファイル x2 | 期待値更新（items count、id 配列、shortcut、length）       |

**型の関係**:

```
ViewType (store/types.ts) <- 既に executionConsole 追加済み
    | Extract<ViewType, ...>
DockViewType (navContract.ts) <- 本タスクで追加
    | NavItemContract.id
NAV_SECTIONS[1].items[2].id <- 本タスクで追加
```

### Task 12-2: システム仕様書更新

#### Step 1-A: タスク完了記録

- [ ] `aiworkflow-requirements/LOGS.md` 更新
- [ ] `task-specification-creator/LOGS.md` 更新（2ファイル両方 - P1/P25 対策）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新

#### Step 1-B: 実装状況テーブル

- [ ] `ui-ux-navigation.md` の navContract エントリ数を更新（該当する場合）

#### Step 1-C: 関連タスクテーブル

```bash
grep -rn "UT-IMP-NAVCONTRACT-EXECUTION-CONSOLE-ENTRY-001" .claude/skills/aiworkflow-requirements/references/
```

#### Step 1-D: topic-map.md 再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

#### Step 2: システム仕様更新

navContract のエントリ追加は型定義の拡張のみであり、新規インターフェースやアーキテクチャ変更はない。`ui-ux-navigation.md` にエントリ数の更新が必要な場合のみ実施。

### Task 12-3: documentation-changelog.md

- [ ] 更新した全仕様書の変更内容を記録
- [ ] 各 Step の完了結果を詳細に記録
- DON'T: 全 Step 確認前に「完了」と記載しない（P4/P51 対策）

### Task 12-4: 未タスク検出

- [ ] `unassigned-task-report.md` 作成（0件でも必須）
- [ ] 検出した未タスクがあれば3ステップ完了:
  1. `unassigned-task/` に指示書作成
  2. `task-workflow.md` 残課題テーブルに登録
  3. 関連仕様書に参照リンク追加
- [ ] GitHub Issue を `gh issue close` で同時に Close（再評価クローズの場合 - P56 対策）

### Task 12-5: スキルフィードバックレポート

- [ ] フィードバックレポート作成（改善点なしでも必須 - P28 対策）

## 漏れやすいポイント（06-known-pitfalls.md参照）

| ID  | ポイント                            | 対策                                                                |
| --- | ----------------------------------- | ------------------------------------------------------------------- |
| P1  | LOGS.md 2ファイル更新漏れ           | aiworkflow-requirements + task-specification-creator 両方を同時更新 |
| P2  | topic-map.md 再生成忘れ             | セクション変更時は必ず `generate-index.js` を実行                   |
| P27 | topic-map.md 再生成トリガー判断ミス | 追加だけでなく削除・更新も再生成トリガー                            |
| P29 | SKILL.md 変更履歴の更新漏れ         | LOGS.md とは別に SKILL.md の変更履歴テーブルも必ず更新              |
| P3  | 未タスク管理の3ステップ不完全       | 指示書 -> task-workflow.md登録 -> 関連仕様書リンク                  |

## 苦戦箇所の記録【推奨】

タスク実行中に苦戦した箇所があれば記録する。0件でも「苦戦箇所なし（0件）」を明記する。

## 成果物

| 成果物                       | パス                                            | 必須 | 説明                       |
| ---------------------------- | ----------------------------------------------- | ---- | -------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`      | 必須 | 概念的+技術的ドキュメント  |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`   | 必須 | 更新履歴                   |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md` | 必須 | 検出結果（なしでも出力）   |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`     | 必須 | 改善点（なしでも出力必須） |
| 未完了タスク指示書           | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成             |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 10/11成果物の読み込み）
2. Task 12-1〜12-5 の順次実施
3. 成果物の作成・配置
4. 完了条件の検証

## 完了条件

- [ ] Task 12-1〜Task 12-5 の全タスクが完了している
- [ ] LOGS.md が2ファイル更新されている（P1/P25 対策）
- [ ] topic-map.md が再生成されている（P2/P27 対策）
- [ ] documentation-changelog.md が作成されている
- [ ] unassigned-task-report.md が作成されている
- [ ] スキルフィードバックレポートが作成されている（P28 対策）
- [ ] 苦戦箇所セクションを記録した（0件でも明記）
- [ ] artifacts.json の Phase 12 ステータスが更新されている

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（Task 12-1〜12-5）を100%実行完了
- [ ] 各タスクの成果物が `outputs/phase-12/` に生成されている
- [ ] artifacts.json が更新されている

## 次の Phase

Phase 13: 完了
