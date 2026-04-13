# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| Phase      | 1                                                           |
| タスクID   | TASK-SW-FIX-DATAFLOW-001                                    |
| 機能名     | Step 1回答→スキル生成連携（Q1〜Q6コンテキストブリッジ実装） |
| タスク種別 | implementation                                              |
| 前提Phase  | -                                                           |
| 後続Phase  | Phase 2                                                     |
| 作成日     | 2026-04-12                                                  |
| ステータス | pending                                                     |

## 目的

`SkillCreateWizard.tsx:553` で `createSkill(formData.purpose, SKILL_GENERATION_OPTIONS)` しか呼ばれておらず、Step 1で収集したQ1〜Q6の回答（`answers`）・`formData.skillName`・`formData.category` が一切スキル生成に渡されないという最重要バグを修正する要件を確定する。

## 背景

### 問題の詳細

ウィザードは複数ステップでユーザーからスキル生成に必要な情報を収集する設計になっている。Step 1 では以下のQ1〜Q6を収集する：

| 質問ID | 内容                         |
| ------ | ---------------------------- |
| Q1     | スキルの主な目的・用途       |
| Q2     | 対象ユーザーまたは使用シーン |
| Q3     | 使用するツール・サービス     |
| Q4     | 実行タイミング・頻度         |
| Q5     | 期待するアウトプット・成果物 |
| Q6     | 制約事項・禁止事項           |

しかし現在の実装（`SkillCreateWizard.tsx:553`）では：

```typescript
// 問題のある実装（現状）
createSkill(formData.purpose, SKILL_GENERATION_OPTIONS);
// ↑ answers（Q1〜Q6）も formData.skillName も formData.category も渡されない
```

この結果、ユーザーがStep 1で丁寧に入力した情報が全て無視され、
生成されるスキルは `formData.purpose` のみに基づく貧弱なものになっている。
ウィザードの核心価値（詳細なコンテキストに基づいた高品質スキル生成）が実現されていない。

### 修正方針

1. `buildSkillContext(formData, answers)` 変換関数を `SkillCreateWizard.tsx` 内（または別ユーティリティファイル）に作成し、ウィザードのフォームデータとQ1〜Q6回答を `SkillCreationContext` 型に変換する
2. `handleGenerate` 関数を修正し、`createSkill(buildSkillContext(formData, answers), OPTIONS)` を呼ぶようにする
3. `agentSlice.ts` の `createSkill` Thunk シグネチャに `context?: SkillCreationContext` を追加する（optional で後方互換を維持）
4. `skillHandler.ts` の IPC ハンドラで `context` の各フィールドをプロンプトに組み込む
5. `packages/shared/src/types/skillCreator.ts` に `SkillCreationContext` 型を追加する

## 受け入れ基準（AC一覧）

| AC番号 | 受け入れ基準                                                                                    | 検証方法                   |
| ------ | ----------------------------------------------------------------------------------------------- | -------------------------- |
| AC-1   | `buildSkillContext()` 関数が `formData` と `answers` を正しく `SkillCreationContext` に変換する | 単体テスト                 |
| AC-2   | `handleGenerate` が `SkillCreationContext` を渡して `createSkill` を呼ぶ                        | 単体テスト・コードレビュー |
| AC-3   | `createSkill` のシグネチャに `context?: SkillCreationContext` が追加されている（後方互換あり）  | 型チェック・単体テスト     |
| AC-4   | IPC ハンドラが `context` の各フィールド（skillName/category/Q1〜Q6回答）をプロンプトに組み込む  | 単体テスト・E2E確認        |
| AC-5   | `context` なしの既存呼び出しが引き続き正常動作する（後方互換テスト）                            | 回帰テスト                 |
| AC-6   | Q1〜Q6の回答がスキル生成プロンプトに反映される（E2Eレベル確認）                                 | 手動テスト・E2E            |

## スコープ定義

### 含む（in-scope）

- `SkillCreationContext` 型の追加（`packages/shared/src/types/skillCreator.ts`）
- `buildSkillContext(formData, answers)` 変換関数の実装
- `handleGenerate` の修正（`createSkill` 呼び出しに `context` を渡す）
- `agentSlice.ts` の `createSkill` Thunk シグネチャ拡張（`context?: SkillCreationContext`）
- `skillHandler.ts` の IPC ハンドラ拡張（`context` をプロンプトに組み込む）
- 対応するユニットテストの追加
- 後方互換性テストの追加

### 含まない（out-of-scope）

- Step 1 のUIコンポーネント変更（Q1〜Q6フォームの外観変更）
- Step 2（スキル確認画面）の変更
- `answers` の収集ロジック変更（既存のまま）
- スキル保存・エクスポート機能の変更
- コミット・PR作成（ユーザー明示承認前）

## 前提条件・制約

| 種別 | 内容                                                                     |
| ---- | ------------------------------------------------------------------------ |
| 前提 | `SkillCreateWizard.tsx` の現行実装（L553付近）が確認可能なこと           |
| 前提 | `agentSlice.ts` の `createSkill` Thunk の現行シグネチャが確認可能なこと  |
| 前提 | `skillHandler.ts` の IPC ハンドラ実装が確認可能なこと                    |
| 前提 | `packages/shared/src/types/skillCreator.ts` の既存型定義が確認可能なこと |
| 制約 | `context` フィールドは optional とし、既存の呼び出しを壊さない           |
| 制約 | `buildSkillContext` は pure function として実装し、副作用を持たない      |
| 制約 | コミット・PR作成はユーザーの明示的指示があるまで禁止                     |

## 実行タスク

1. `SkillCreateWizard.tsx` の L553 付近を調査し、`handleGenerate`・`answers`・`formData` の構造を把握する
2. `agentSlice.ts` の `createSkill` シグネチャを調査する
3. `skillHandler.ts` の IPC ハンドラを調査し、プロンプト組み立て箇所を特定する
4. `packages/shared/src/types/skillCreator.ts` の既存型定義を確認する
5. `SkillCreationContext` 型の要件を定義する
6. AC-1〜AC-6 を受け入れ基準書としてまとめる
7. 成果物を出力する

## 参照資料

| 資料名                        | パス                                                               | 用途                   |
| ----------------------------- | ------------------------------------------------------------------ | ---------------------- |
| SkillCreateWizard 実装        | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` | 問題箇所の確認（L553） |
| agentSlice 実装               | `apps/desktop/src/renderer/store/slices/agentSlice.ts`             | createSkill シグネチャ |
| skillHandler 実装             | `apps/desktop/src/main/ipc/handlers/skillHandler.ts`               | IPC ハンドラ確認       |
| skillCreator 型定義           | `packages/shared/src/types/skillCreator.ts`                        | 既存型定義確認         |
| aiworkflow-requirements SKILL | `.claude/skills/aiworkflow-requirements/SKILL.md`                  | システム仕様確認       |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                | 内容                         |
| -------------------- | ------------------------------------------------------------------- | ---------------------------- |
| IPC 契約仕様         | `.claude/skills/aiworkflow-requirements/references/ipc-*.md`        | IPC ハンドラ・チャンネル契約 |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-*.md` | 型定義・フィールド定義       |
| スキル生成仕様       | `.claude/skills/aiworkflow-requirements/references/`                | スキル生成プロンプト仕様     |

## 成果物

| 成果物                      | パス                                                 | 説明                         |
| --------------------------- | ---------------------------------------------------- | ---------------------------- |
| 要件定義書                  | `outputs/phase-1/requirements-definition.md`         | 機能要件・非機能要件         |
| 受け入れ基準書              | `outputs/phase-1/acceptance-criteria.md`             | AC-1〜AC-6 検証可能一覧      |
| SkillCreationContext 分析書 | `outputs/phase-1/skill-creation-context-analysis.md` | フィールド構造・型要件の分析 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `handleGenerate` の問題箇所が正確に特定・記録されていること
- [ ] `SkillCreationContext` に必要なフィールドが全件定義されていること
- [ ] AC-1〜AC-6 が検証可能な形で記述されていること
- [ ] 後方互換要件が明示されていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 問題箇所の調査（SkillCreateWizard・agentSlice・skillHandler・skillCreator型）
2. SkillCreationContext 型の要件定義
3. AC-1〜AC-6 の受け入れ基準書作成
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 2: 設計
