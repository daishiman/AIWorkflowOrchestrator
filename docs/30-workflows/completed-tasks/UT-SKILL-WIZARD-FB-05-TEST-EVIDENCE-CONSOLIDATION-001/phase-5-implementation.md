# Phase 5: 実装

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| Phase      | 5                                                              |
| タスクID   | UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001          |
| 機能名     | Phase 11 テスト証跡の一本化テンプレート整備（edge case一覧表） |
| 前提Phase  | Phase 4                                                        |
| 後続Phase  | Phase 6                                                        |
| 作成日     | 2026-04-13                                                     |
| ステータス | pending                                                        |

## 目的

docs-only タスクのため「実装」はskillテンプレートファイルの更新を指す。Phase 4で定義した期待構造（ES-001〜004）に従い、4つの対象Markdownファイルに新セクションを追加・修正する。

## docs-only タスクにおける「実装」の定義

| 通常の実装       | 本タスクにおける対応                 |
| ---------------- | ------------------------------------ |
| ソースコード変更 | Markdownテンプレートファイルの更新   |
| 関数・クラス追加 | 新セクション（`##` 見出し）の追加    |
| APIの変更        | テーブル構造（列定義・行定義）の変更 |
| 設定ファイル更新 | スキルガイドファイルの更新           |

## 更新対象ファイル一覧

| No  | ファイルパス                                                                            | 変更種別 | 対応AC           |
| --- | --------------------------------------------------------------------------------------- | -------- | ---------------- |
| 1   | `.claude/skills/task-specification-creator/references/phase-11-test-report-template.md` | 修正     | AC-1, AC-2, AC-3 |
| 2   | `.claude/skills/task-specification-creator/references/phase-template-phase11.md`        | 修正     | AC-4             |
| 3   | `.claude/skills/task-specification-creator/references/phase-template-phase11-detail.md` | 修正     | AC-4             |
| 4   | `.claude/skills/task-specification-creator/references/phase-11-guide.md`                | 修正     | AC-4             |

## Before/After 記録フォーマット

### ファイル1: phase-11-test-report-template.md

| 項目   | 内容                                                                                                                                                                                     |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 対象   | `.claude/skills/task-specification-creator/references/phase-11-test-report-template.md`                                                                                                  |
| Before | `## テスト件数サマリー` セクションなし。`## edge case 一覧表` セクションなし。`## 仕様判断根拠` セクションなし。                                                                         |
| After  | `## テスト件数サマリー`（正常系/異常系/edge case/合計の集約テーブル + `### 実施情報`）、`## edge case 一覧表`（EC-NNN形式6列テーブル）、`## 仕様判断根拠`（SD-NNN形式4列テーブル）を追加 |
| 理由   | AC-1（edge case一覧表）、AC-2（テスト件数集約）、AC-3（仕様判断根拠）を充足するため                                                                                                      |

### ファイル2: phase-template-phase11.md

| 項目   | 内容                                                                                                          |
| ------ | ------------------------------------------------------------------------------------------------------------- |
| 対象   | `.claude/skills/task-specification-creator/references/phase-template-phase11.md`                              |
| Before | Phase 11テンプレートの概要説明に新3セクションへの言及なし                                                     |
| After  | テンプレート概要に `edge case 一覧表`・`テスト件数サマリー`・`仕様判断根拠` の3セクションを追加項目として記載 |
| 理由   | AC-4（task-specification-creatorスキルへの反映）を充足するため                                                |

### ファイル3: phase-template-phase11-detail.md

| 項目   | 内容                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------ |
| 対象   | `.claude/skills/task-specification-creator/references/phase-template-phase11-detail.md`          |
| Before | Phase 11テンプレートの詳細説明に新3セクションの記述なし                                          |
| After  | 各セクションの詳細説明（項目定義・記入ルール・採番ルール）を追加                                 |
| 理由   | AC-4（task-specification-creatorスキルへの反映）を充足するため。詳細ガイドとしての情報を追加する |

### ファイル4: phase-11-guide.md

| 項目   | 内容                                                                                                           |
| ------ | -------------------------------------------------------------------------------------------------------------- |
| 対象   | `.claude/skills/task-specification-creator/references/phase-11-guide.md`                                       |
| Before | Phase 11テンプレートの使い方ガイドに新3セクションの使い方説明なし                                              |
| After  | `edge case 一覧表`・`テスト件数サマリー`・`仕様判断根拠` の記入方法・注意点を追加                              |
| 理由   | AC-4（task-specification-creatorスキルへの反映）を充足するため。ガイド情報として新セクションの使い方を提供する |

## 実装計画

### 実装順序

| 順序 | ファイル                         | 理由                                                      |
| ---- | -------------------------------- | --------------------------------------------------------- |
| 1    | phase-11-test-report-template.md | AC-1〜3の主要変更。基盤となるテンプレートを先に完成させる |
| 2    | phase-template-phase11-detail.md | 詳細説明はテンプレート本体を参照しながら記述するため2番目 |
| 3    | phase-template-phase11.md        | 概要説明は詳細が確定してから簡潔にまとめる                |
| 4    | phase-11-guide.md                | ガイドはテンプレート・詳細説明が確定してから記述する      |

### 追加セクションの採番ルール（Phase 3引き継ぎ条件への対応）

| ID体系 | 形式            | 採番方法                                | 例     |
| ------ | --------------- | --------------------------------------- | ------ |
| EC-NNN | 3桁ゼロ埋め整数 | 001から連番。タスクをまたいでリセット可 | EC-001 |
| SD-NNN | 3桁ゼロ埋め整数 | 001から連番。タスクをまたいでリセット可 | SD-001 |

### SD-NNN → EC-NNN 逆引き設計の方針（Phase 3引き継ぎ条件への対応）

逆引き列（EC-NNN一覧）は仕様判断根拠テーブルに追加しない。理由は以下の通り。

- 1つのSD-NNNが複数EC-NNNから参照される場合、セル内に複数値が入り可読性が低下する
- edge case一覧表の `仕様判断根拠ID` 列で正方向の参照が完全に表現されている
- 逆引きが必要な場合はedge case一覧表を `仕様判断根拠ID` でソート/フィルタすることで対応できる

### Phase 3引き継ぎ条件の対応状況

| 条件                                                         | 対応方針                                                                   |
| ------------------------------------------------------------ | -------------------------------------------------------------------------- |
| 各テーブルの追加列（前提条件・備考・決定日・レビュア）の要否 | 全て「追加しない」と決定。シンプルさを優先し、必要時に拡張可能な構造とする |
| ID採番ルール（EC-NNN・SD-NNN）の明示                         | 上記「追加セクションの採番ルール」テーブルで明示                           |
| SD-NNN → EC-NNN 逆引き設計の要否                             | 上記「逆引き設計の方針」セクションで「追加しない」と決定                   |

## 新規作成/修正ファイルパス一覧

```
# 修正対象（全て既存ファイルの修正）
.claude/skills/task-specification-creator/references/phase-11-test-report-template.md
.claude/skills/task-specification-creator/references/phase-template-phase11.md
.claude/skills/task-specification-creator/references/phase-template-phase11-detail.md
.claude/skills/task-specification-creator/references/phase-11-guide.md

# 新規作成なし（docs-only タスクのため）
```

## 実行タスク

- 対象4ファイルの現行内容を全て読み込む
- phase-11-test-report-template.md に3セクションを追加する（実装順序1番目）
- phase-template-phase11-detail.md に詳細説明を追加する（実装順序2番目）
- phase-template-phase11.md に概要記述を追加する（実装順序3番目）
- phase-11-guide.md に使い方ガイドを追加する（実装順序4番目）
- Phase 4のCL-001〜003で自己チェックを実施する

## 参照資料

| 資料名              | パス                                                                                               | 用途                     |
| ------------------- | -------------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 4テスト作成書 | `docs/30-workflows/UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001/phase-4-test-creation.md` | 期待構造・チェックリスト |
| Phase 2設計書       | `docs/30-workflows/UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001/phase-2-design.md`        | テンプレート設計内容     |

## 成果物

| 成果物                             | パス                                                                                                | 説明                       |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------- |
| 実装計画書（本ファイル）           | `docs/30-workflows/UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001/phase-5-implementation.md` | 実装計画・Before/After記録 |
| 更新済みテストレポートテンプレート | `.claude/skills/task-specification-creator/references/phase-11-test-report-template.md`             | AC-1〜3対応                |
| 更新済みPhase 11テンプレート       | `.claude/skills/task-specification-creator/references/phase-template-phase11.md`                    | AC-4対応（概要）           |
| 更新済みPhase 11詳細テンプレート   | `.claude/skills/task-specification-creator/references/phase-template-phase11-detail.md`             | AC-4対応（詳細）           |
| 更新済みPhase 11ガイド             | `.claude/skills/task-specification-creator/references/phase-11-guide.md`                            | AC-4対応（ガイド）         |

## 完了条件

- [ ] 対象4ファイルの修正が完了していること
- [ ] CL-001（構造検証）のチェックリストが全項目PASSであること
- [ ] CL-002（スキルテンプレート反映）のチェックリストが全項目PASSであること
- [ ] CL-003（整合性）のチェックリストが全項目PASSであること
- [ ] Phase 3の引き継ぎ条件3点が全て対応されていること
- [ ] コードファイルへの変更がゼロであること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 対象4ファイルの現行内容読み込み
2. phase-11-test-report-template.md への3セクション追加
3. phase-template-phase11-detail.md への詳細説明追加
4. phase-template-phase11.md への概要記述追加
5. phase-11-guide.md への使い方ガイド追加
6. CL-001〜003による自己チェック
7. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成（または修正）
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 6: テスト拡充
