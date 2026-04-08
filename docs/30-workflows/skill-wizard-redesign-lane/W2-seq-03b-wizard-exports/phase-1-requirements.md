# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 1                                |
| タスクID   | UT-SKILL-WIZARD-W2-seq-03b       |
| 機能名     | wizard/index.ts エクスポート更新 |
| 前提Phase  | -                                |
| 後続Phase  | Phase 2                          |
| 作成日     | 2026-04-07                       |
| ステータス | pending                          |

## 目的

`wizard/index.ts` の削除・追加エクスポートの影響範囲を確定し、受け入れ基準を固定する。

## 背景

W1-par-02a/W1-par-02b/W1-par-02c で新コンポーネント（SkillInfoStep/ConversationRoundStep）が実装され、  
旧コンポーネント（DescribeStep/ConfigureStep）は廃止となる。  
`wizard/index.ts` のエクスポートを新コンポーネントへ更新し、旧エクスポートを削除する。

## 削除エクスポートの影響範囲

| 削除エクスポート                      | 参照元（想定）                     | 影響                                         |
| ------------------------------------- | ---------------------------------- | -------------------------------------------- |
| `DescribeStep`                        | `SkillCreateWizard.tsx`（旧実装）  | W2-seq-03aで該当コードも削除済みのため無影響 |
| `DescribeStepProps`                   | 型参照箇所                         | 型エラーを事前に確認が必要                   |
| `ConfigureStep`                       | `SkillCreateWizard.tsx`（旧実装）  | W2-seq-03aで該当コードも削除済みのため無影響 |
| `WizardOptions`, `ConfigureStepProps` | 型参照箇所                         | 型エラーを事前に確認が必要                   |
| `GenerationMode` 型                   | `SkillCreateWizard.tsx` / 外部参照 | W2-seq-03aで state削除済みのため無影響       |

## 追加エクスポートの影響範囲

| 追加エクスポート             | 利用先                                | 影響                             |
| ---------------------------- | ------------------------------------- | -------------------------------- |
| `SkillInfoStep`              | `SkillCreateWizard.tsx`（W2-seq-03a） | W2-seq-03aが参照できる状態にする |
| `SkillInfoStepProps`         | 型参照箇所                            | 型安全なimportを保証             |
| `ConversationRoundStep`      | `SkillCreateWizard.tsx`（W2-seq-03a） | W2-seq-03aが参照できる状態にする |
| `ConversationRoundStepProps` | 型参照箇所                            | 型安全なimportを保証             |

## 実行タスク

- 削除エクスポートの参照調査: プロジェクト全体で `DescribeStep`/`ConfigureStep`/`GenerationMode` の参照箇所を洗い出す
- 維持エクスポートの確認: `StepIndicator`/`GenerateStep`/`CompleteStep` が影響を受けないことを確認する
- 受け入れ基準定義: 削除後・追加後の型チェック通過基準を定義する

## 参照資料

| 資料名                | パス                                                                          | 用途                     |
| --------------------- | ----------------------------------------------------------------------------- | ------------------------ |
| 現行index.ts          | `apps/desktop/src/renderer/components/skill/wizard/index.ts`                  | 現行エクスポート確認     |
| SkillInfoStep         | `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`         | 新コンポーネント存在確認 |
| ConversationRoundStep | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 新コンポーネント存在確認 |
| DescribeStep（廃止）  | `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`          | 廃止コンポーネント確認   |
| ConfigureStep（廃止） | `apps/desktop/src/renderer/components/skill/wizard/ConfigureStep.tsx`         | 廃止コンポーネント確認   |
| レーンindex           | `docs/30-workflows/skill-wizard-redesign-lane/index.md`                       | タスク依存関係確認       |

## 実行手順

1. `wizard/index.ts` の現行エクスポートを全て列挙する。
2. `DescribeStep`/`ConfigureStep`/`GenerationMode` のプロジェクト全体での参照箇所を調査する。
3. W1-par-02a/W1-par-02b/W1-par-02c の完了状態を確認し、新コンポーネントファイルの存在を確認する。
4. 受け入れ基準を矛盾なし・漏れなしで固定する。

## 成果物

| 成果物         | パス                                         | 説明                          |
| -------------- | -------------------------------------------- | ----------------------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件          |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`     | 検証可能なAC一覧              |
| 影響範囲マップ | `outputs/phase-1/impact-scope-map.md`        | 削除/追加エクスポート影響範囲 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 削除エクスポートの全参照箇所が確定していること
- [ ] 維持エクスポートへの影響がないことが確認されていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 削除/追加エクスポートの影響範囲調査
3. 受け入れ基準の定義
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 2: 設計
