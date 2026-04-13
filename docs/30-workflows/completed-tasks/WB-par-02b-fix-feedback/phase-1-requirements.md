# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| Phase      | 1                                                              |
| タスクID   | TASK-SW-FIX-FEEDBACK-001                                       |
| 機能名     | スキル一覧リアルタイム反映・skillPath nullガード・成功表示修正 |
| タスク種別 | implementation（UIコンポーネント変更あり）                     |
| 前提Phase  | -                                                              |
| 後続Phase  | Phase 2                                                        |
| 作成日     | 2026-04-12                                                     |
| ステータス | pending                                                        |

## 目的

スキルウィザードにおけるフィードバックループ欠如問題（問題6・8・14・20）の受け入れ基準を定義し、
修正スコープと実装方針を確定する。

## タスク分類宣言

**UI task（Renderer実装変更あり）**

- `SkillCreateWizard.tsx`：`handleExecutePlan`成功パスへの`fetchSkills()`追加
- `CompleteStep.tsx`：`skillPath` nullガードと成功ヘッダーの条件表示

## 背景

### 問題6: スキル一覧にリアルタイム反映されない

スキル生成完了後、スキル一覧コンポーネントが更新されない。ユーザーは生成結果を確認するために
手動リロードが必要な状態。原因はLLMモード（`handleExecutePlan`）の成功パスに
`fetchSkills()`呼び出しが欠落していること。

### 問題8: LLMモード完了後に`fetchSkills()`が呼ばれない

templateモードの成功パスには`fetchSkills()`が存在する。しかしLLMモード専用の
`handleExecutePlan`関数の成功パス末尾には`fetchSkills()`が追加されていない。
これがスキル一覧未更新の直接原因。

### 問題14: `skillPath = null`のままStep 3到達でサイレント失敗

スキル生成が内部的に失敗し`skillPath`が`null`のままStep 3（`CompleteStep`）に
遷移した場合でも、エラーメッセージが表示されない。ユーザーは成功したと誤認したまま
ウィザードを閉じてしまう。

### 問題20: `skillPath = null`でも成功ヘッダーが表示される

`CompleteStep`の「✓ スキルの骨格を生成しました」ヘッダーが`skillPath`の値に関わらず
無条件表示される。`skillPath = null`の失敗ケースでも成功メッセージが出てしまう。

## 受け入れ基準（AC一覧）

| AC番号 | 受け入れ基準                                                                     | 検証方法                         |
| ------ | -------------------------------------------------------------------------------- | -------------------------------- |
| AC-1   | LLMモードでスキル生成完了後、スキル一覧が即座に更新される                        | 手動テスト（VISUAL）             |
| AC-2   | templateモードでスキル生成完了後、スキル一覧が即座に更新される（既存動作の維持） | 自動テスト・手動テスト           |
| AC-3   | `skillPath = null`のままStep 3に到達した場合、エラーメッセージが表示される       | 自動テスト・手動テスト（VISUAL） |
| AC-4   | `skillPath = null`の場合「✓ スキルの骨格を生成しました」ヘッダーが表示されない   | 自動テスト・手動テスト（VISUAL） |
| AC-5   | `skillPath`が正常値の場合、従来通り成功ヘッダーと完了画面が表示される            | 自動テスト・手動テスト（VISUAL） |

## スコープ定義

### 含む（in-scope）

- `SkillCreateWizard.tsx`の`handleExecutePlan`成功パスへの`fetchSkills()`追加
- `CompleteStep.tsx`の`skillPath` nullガード実装
- `CompleteStep.tsx`の成功ヘッダー表示条件の変更（`skillPath !== null`のみ表示）
- エラーメッセージ・リトライ誘導UIの実装

### 含まない（out-of-scope）

- templateモード側の`fetchSkills()`ロジック変更（既存動作は維持）
- `skillPath`が`null`になる原因の修正（問題14の根本原因はWave Aタスクで対処）
- スキル生成ロジック（IPC Handler）の変更
- コミット・PR作成（ユーザー明示承認前）

## 制約・前提条件

| 種別 | 内容                                                               |
| ---- | ------------------------------------------------------------------ |
| 依存 | TASK-SW-FIX-DATAFLOW-001（Wave A）の完了が前提                     |
| 制約 | コミット・PR作成はユーザーの明示的指示があるまで禁止               |
| 制約 | `--no-verify`の使用は禁止                                          |
| 前提 | `SkillCreateWizard.tsx`に`fetchSkills`関数が既に定義されていること |
| 前提 | `CompleteStep.tsx`が`skillPath`プロパティを受け取っていること      |

## 実行タスク

1. `SkillCreateWizard.tsx`の`handleExecutePlan`の実装を調査し、`fetchSkills`の呼び出し箇所を確認する
2. `CompleteStep.tsx`のプロパティ型定義と現在のレンダリングロジックを確認する
3. 問題6/8/14/20それぞれの根本原因と修正箇所を特定する
4. 受け入れ基準（AC-1〜AC-5）を確定する
5. 成果物を出力する

## 参照資料

| 資料名                       | パス                                                                 | 用途                      |
| ---------------------------- | -------------------------------------------------------------------- | ------------------------- |
| ウィザードオーケストレーター | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`   | fetchSkills追加箇所の確認 |
| 完了画面コンポーネント       | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` | nullガード実装箇所の確認  |
| バグ修正ウェーブ概要         | `docs/30-workflows/skill-wizard-bugfix-wave/index.md`                | 問題全体像の参照          |

## 成果物

| 成果物         | パス                                         | 説明                           |
| -------------- | -------------------------------------------- | ------------------------------ |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件           |
| 受け入れ基準書 | `outputs/phase-1/acceptance-criteria.md`     | AC-1〜AC-5 検証可能一覧        |
| 問題分析書     | `outputs/phase-1/problem-analysis.md`        | 問題6・8・14・20の根本原因分析 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] AC-1〜AC-5が検証可能な形で定義されていること
- [ ] 問題6/8/14/20それぞれの修正箇所が特定されていること
- [ ] スコープ（in-scope / out-of-scope）が確定していること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 既存実装の調査（SkillCreateWizard.tsx / CompleteStep.tsx）
2. 問題6・8・14・20の根本原因特定
3. AC-1〜AC-5の定義確定
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 2: 設計
