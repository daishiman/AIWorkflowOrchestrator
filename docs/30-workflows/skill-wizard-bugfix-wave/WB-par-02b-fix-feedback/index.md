# TASK-SW-FIX-FEEDBACK-001

## メタ情報

| 項目         | 内容                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------- |
| タスクID     | TASK-SW-FIX-FEEDBACK-001                                                                           |
| タスク名     | スキル一覧リアルタイム反映・skillPath nullガード・成功表示修正                                     |
| タスク種別   | implementation（UIコンポーネント変更あり）                                                         |
| Wave         | Wave B（TASK-SW-FIX-DATAFLOW-001 完了後。Phase 1-4/6-13 は並列、Phase 5 は共有ファイル調整が必要） |
| 依存タスク   | TASK-SW-FIX-DATAFLOW-001（Wave A完了が前提）                                                       |
| GitHub Issue | -                                                                                                  |
| 優先度       | high                                                                                               |
| 規模         | small（2ファイル・5行未満の変更）                                                                  |
| 作成日       | 2026-04-12                                                                                         |
| ステータス   | pending                                                                                            |

## 概要

スキルウィザードにおける4件のフィードバックループ欠如問題（問題6・8・14・20）を修正する。

1. **問題6/8**: スキル生成完了後にスキル一覧が更新されない。特にLLMモード（`handleExecutePlan`）では成功パス末尾に`fetchSkills()`が呼ばれていない。
2. **問題14**: `skillPath = null`のままStep 3に到達しても成功画面が表示されてしまうサイレント失敗。
3. **問題20**: `skillPath = null`でも「✓ スキルの骨格を生成しました」成功ヘッダーが無条件表示される。

修正コストは極低（2ファイル・実質5行の追加/変更）で、ユーザー体験への効果は大きい。

## 問題の背景

### 問題6: スキル一覧にリアルタイム反映されない（全般）

スキル生成が完了してもスキル一覧コンポーネントに反映されず、ユーザーは手動リロードが必要。

### 問題8: LLMモード完了後に`fetchSkills()`が呼ばれない

templateモードの成功パスには`fetchSkills()`が存在するが、LLMモード固有の`handleExecutePlan`成功パスには追加されていない。

### 問題14: `skillPath = null`のままStep 3到達でサイレント失敗

スキル生成が内部的に失敗して`skillPath`が`null`のまま遷移しても、Step 3（CompleteStep）では何のエラーも表示されず、ユーザーは成功したと誤認する。

### 問題20: `skillPath = null`でも成功ヘッダーが表示される

`CompleteStep`の成功ヘッダー「✓ スキルの骨格を生成しました」が`skillPath`の値に関わらず無条件で表示される。

## 修正方針

1. `handleExecutePlan`の成功パス末尾に`await fetchSkills()`を追加（2行の追加）
2. `CompleteStep`のStep 3レンダリング時に`skillPath === null`の場合はエラーメッセージ表示またはリトライ誘導
3. `CompleteStep`の成功ヘッダー表示を`skillPath !== null`を条件に変更

## 変更対象ファイル

| ファイルパス                                                         | 変更種別 | 変更概要                                             |
| -------------------------------------------------------------------- | -------- | ---------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`   | 修正     | `handleExecutePlan`成功パス末尾に`fetchSkills()`追加 |
| `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` | 修正     | `skillPath`nullガード・成功ヘッダー条件表示          |

## Phaseリスト

| Phase | 名前             | 概要                                                               | ステータス |
| ----- | ---------------- | ------------------------------------------------------------------ | ---------- |
| 1     | 要件定義         | AC定義・スコープ確定・修正方針の要件整理                           | pending    |
| 2     | 設計             | fetchSkills追加箇所・nullガードロジック・エラー表示UIの設計        | pending    |
| 3     | 設計レビュー     | 設計の矛盾・漏れチェック・フェーズゲート判定                       | pending    |
| 4     | テスト作成       | TDD Red段階のテストケース定義                                      | pending    |
| 5     | 実装             | SkillCreateWizard.tsx / CompleteStep.tsx の修正                    | pending    |
| 6     | テスト拡充       | エッジケース・回帰テスト追加                                       | pending    |
| 7     | カバレッジ確認   | テストカバレッジ計測・未到達分析                                   | pending    |
| 8     | リファクタリング | 重複・ドリフト除去                                                 | pending    |
| 9     | 品質保証         | 静的解析・リスク評価・品質ゲート                                   | pending    |
| 10    | 最終レビュー     | Phase 1-9の成果物統合レビュー・承認判定                            | pending    |
| 11    | 手動テスト       | VISUAL（成功/失敗表示の視覚確認・スクリーンショット）              | pending    |
| 12    | ドキュメント更新 | 実装ガイド・仕様書更新・未タスク検出・フィードバック・準拠チェック | pending    |
| 13    | PR作成           | ユーザー明示承認後のみ実施                                         | pending    |

## 参照資料

| ドキュメント                 | パス                                                                         |
| ---------------------------- | ---------------------------------------------------------------------------- |
| ウィザードオーケストレーター | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`           |
| 完了画面コンポーネント       | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`         |
| バグ修正ウェーブ概要         | `docs/30-workflows/skill-wizard-bugfix-wave/index.md`                        |
| Wave A タスク                | `docs/30-workflows/skill-wizard-bugfix-wave/WA-seq-01-fix-dataflow/index.md` |

## 作成日

2026-04-12
