# TASK-SW-FIX-DATAFLOW-001

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| タスクID   | TASK-SW-FIX-DATAFLOW-001                                    |
| タスク名   | Step 1回答→スキル生成連携（Q1〜Q6コンテキストブリッジ実装） |
| タスク種別 | implementation                                              |
| 優先度     | critical                                                    |
| 規模       | medium                                                      |
| 作成日     | 2026-04-12                                                  |
| ステータス | phase12_completed（Phase 13 blocked）                       |

## 概要

`SkillCreateWizard.tsx:553` において `createSkill(formData.purpose, SKILL_GENERATION_OPTIONS)` しか呼ばれておらず、Step 1で収集したQ1〜Q6の回答（`answers`）・`formData.skillName`・`formData.category` が一切スキル生成に渡されない。ウィザードの核心価値が技術的に実現されていない最重要バグを修正する。

## 問題の背景

ウィザードのStep 1でユーザーが入力したQ1〜Q6の回答は、スキルの目的・対象・使用ツール・タイミング・期待値・制約などを詳細に収集するために設計されている。しかし現在の実装では、`handleGenerate` 関数内で `createSkill` を呼ぶ際にこれらの回答が全く渡されず、単純な `formData.purpose` のみでスキル生成が行われている。結果として生成されるスキルはQ1〜Q6の情報を反映しない空虚なものとなっており、ウィザードの存在価値が失われている。

## 完了条件

- [ ] `buildSkillContext(formData, answers)` 変換関数が実装されている
- [ ] `handleGenerate` が `SkillCreationContext` を渡して `createSkill` を呼んでいる
- [ ] `createSkill` のシグネチャに `context?: SkillCreationContext` が追加されている（後方互換）
- [ ] IPCハンドラが `context` の各フィールドをプロンプトに組み込んでいる
- [ ] `context` なしの既存呼び出しが引き続き正常動作する
- [ ] Q1〜Q6の回答がスキル生成プロンプトに反映される

## Phaseリスト

| Phase | 名前             | 概要                                                                     | タスク種別     | ステータス        |
| ----- | ---------------- | ------------------------------------------------------------------------ | -------------- | ----------------- |
| 1     | 要件定義         | スコープ確定・AC一覧・SkillCreationContext型要件・後方互換要件定義       | implementation | completed         |
| 2     | 設計             | buildSkillContext設計・IPC API拡張設計・データフロー図・変更ファイル一覧 | implementation | completed         |
| 3     | 設計レビュー     | 設計の矛盾・漏れチェック・後方互換性確認・Phase 4ゲート判定              | implementation | completed         |
| 4     | テスト作成       | TC-01〜TC-10 テストケース定義（TDD Red段階）                             | implementation | completed         |
| 5     | 実装             | buildSkillContext実装・createSkillシグネチャ拡張・IPCハンドラ拡張        | implementation | completed         |
| 6     | テスト拡充       | フェイルパス・エッジケース・後方互換テスト追加                           | implementation | completed         |
| 7     | カバレッジ確認   | 変更ファイル別カバレッジ計測・未到達分析                                 | implementation | completed         |
| 8     | リファクタリング | buildSkillContext・IPCハンドラの責務境界整理・重複除去                   | implementation | completed         |
| 9     | 品質保証         | 静的解析・型チェック・リスク評価・品質ゲート                             | implementation | completed         |
| 10    | 最終レビュー     | Phase 1〜9統合レビュー・AC達成確認・承認判定                             | implementation | completed         |
| 11    | 手動テスト       | NON_VISUAL・Step 1でQ1〜Q6を入力→生成→スキル内容確認                     | NON_VISUAL     | completed         |
| 12    | ドキュメント更新 | 実装ガイド・仕様書更新・未タスク検出・フィードバック・準拠チェック       | implementation | phase12_completed |
| 13    | PR作成           | ユーザー明示承認後のみ実施                                               | -              | blocked           |

## 変更対象ファイル

| ファイルパス                                                       | 変更種別 | 変更概要                                                |
| ------------------------------------------------------------------ | -------- | ------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` | 修正     | handleGenerate に buildSkillContext 呼び出しを追加      |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`             | 修正     | createSkill シグネチャに context?: SkillCreationContext |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                       | 修正     | IPC ハンドラで context をプロンプトに組み込む           |
| `packages/shared/src/types/skillCreator.ts`                        | 修正     | SkillCreationContext 型を追加                           |

## 参照資料

| 資料名                        | パス                                                               | 用途                       |
| ----------------------------- | ------------------------------------------------------------------ | -------------------------- |
| SkillCreateWizard 実装        | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` | 問題箇所の確認（L553）     |
| agentSlice 実装               | `apps/desktop/src/renderer/store/slices/agentSlice.ts`             | createSkill シグネチャ確認 |
| skillHandlers 実装            | `apps/desktop/src/main/ipc/skillHandlers.ts`                       | IPC ハンドラ確認           |
| skillCreator 型定義           | `packages/shared/src/types/skillCreator.ts`                        | 既存型定義確認             |
| aiworkflow-requirements SKILL | `.claude/skills/aiworkflow-requirements/SKILL.md`                  | システム仕様確認           |
