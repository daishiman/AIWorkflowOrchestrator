# Phase 9: リスクレジスター — UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001

## リスク一覧

| ID   | リスク内容                                                             | 発生確率 | 影響度 | 対策                                                                  | 現状     |
| ---- | ---------------------------------------------------------------------- | -------- | ------ | --------------------------------------------------------------------- | -------- |
| R-01 | `executionPrompt` 参照の見落とし（別ファイルでの import 等）           | 低       | 高     | grep で全ファイル検索済み（0件確認）                                  | 軽減済み |
| R-02 | `defaultExecutionPrompt` が将来変更されたとき全実行パスに影響する      | 低       | 中     | 定数として明示されているため変更箇所が自明                            | 許容     |
| R-03 | `describe.skip` 内の `skill-lifecycle-request-input` 参照が混乱を招く  | 低       | 低     | 旧タスク（PR#2036）のスキップテストであり別タスクで整理予定           | 残存     |
| R-04 | `SkillCreateWizard` への実配線未完了による UX の片手落ち               | 中       | 中     | `onOpenSkillWizard` / `onOpenSettings` を分離し current facts で解消  | 解消済み |
| R-05 | `canExecuteSkill` からプロンプト長チェック削除によるユーザビリティ変化 | 低       | 低     | `defaultExecutionPrompt` が固定値のため、ユーザーが意図せず実行可能に | 許容     |

## 残存リスクの評価

**R-03**: `describe.skip` はテスト実行に影響しない。旧 testid 整理は別タスクで行う。許容可能。

**R-04**: `onOpenSkillWizard` と `onOpenSettings` を分離し、作成導線と設定導線の混線を解消した。UX の片手落ちは解消済み。

**R-05**: 固定プロンプトによる自動実行はウィザード移行後の意図した挙動。許容可能。

## 総合リスク評価: LOW（残存3件はいずれも低〜中影響、緩和策あり）
