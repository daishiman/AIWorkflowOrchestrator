# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 8                                          |
| タスクID   | UT-SKILL-WIZARD-W2-seq-03a                 |
| 機能名     | SkillCreateWizard オーケストレーション更新 |
| 前提Phase  | Phase 7                                    |
| 後続Phase  | Phase 9                                    |
| 作成日     | 2026-04-07                                 |
| ステータス | pending                                    |

## 目的

Phase 5 の実装を品質・可読性・保守性の観点でリファクタリングし、全テストが Green のまま維持されることを確認する。

## リファクタリング観点

### 1. inferSmartDefaults の分離

`inferSmartDefaults` 関数を `SkillCreateWizard.tsx` のコンポーネント外部（または専用ファイル）に分離し、テスト可能性を高める。

```
現状: SkillCreateWizard.tsx 内に関数定義
改善: utils/inferSmartDefaults.ts に分離
     → 単体テストが容易になる
```

### 2. ハンドラの責務分離

複数の責務を持つハンドラをより小さな関数に分割する。

| ハンドラ         | 現状の責務                      | 分割方針                                        |
| ---------------- | ------------------------------- | ----------------------------------------------- |
| `handleGenerate` | trackEvent + LLM生成 + step遷移 | 生成ロジックを `useSkillGeneration` hook に分離 |

### 3. 型定義の整理

```typescript
// リファクタリング前
const handleGenerate = async (method: "complete" | "skip") => { ... }

// リファクタリング後（型エイリアスを使用）
type GenerationMethod = "complete" | "skip";
const handleGenerate = async (method: GenerationMethod) => { ... }
```

### 4. コメントの整理

推論ルールのコメントを inferenceLog と整合させ、コード内の説明を最小化する。

### 5. 不要なインポートの削除

`description` / `options` / `generationMode` 削除後に残っている可能性のある未使用インポートを除去する。

## 責務境界マップ

| コンポーネント/ファイル            | 責務                                                                              |
| ---------------------------------- | --------------------------------------------------------------------------------- |
| `SkillCreateWizard.tsx`            | state管理・ハンドラ定義・Step間オーケストレーション（skillPath / onRetry を含む） |
| `utils/inferSmartDefaults.ts`      | スマートデフォルト推論ロジック                                                    |
| `hooks/useSkillGeneration.ts`      | LLM生成の非同期処理・エラーハンドリング（オプション）                             |
| `wizard/SkillInfoStep.tsx`         | Step 0 UI（W1-par-02a担当）                                                       |
| `wizard/ConversationRoundStep.tsx` | Step 1 UI（W1-par-02b担当）                                                       |
| `wizard/GenerateStep.tsx`          | Step 2 UI（生成中専用・legacy prop cleanup）                                      |
| `wizard/CompleteStep.tsx`          | Step 3 UI（W1-par-02c担当）                                                       |

## 参照資料

| 資料名                 | パス                                              | 用途           |
| ---------------------- | ------------------------------------------------- | -------------- |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | Phase 7 成果物 |
| 未到達分析             | `outputs/phase-7/uncovered-analysis-plan.md`      | Phase 7 成果物 |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | Phase 7 成果物 |
| アーキテクチャ設計     | `outputs/phase-2/architecture-design.md`          | Phase 2 成果物 |

## 実行手順

1. Phase 7 成果物を確認する。
2. `inferSmartDefaults` の分離を実施する（オプション：カバレッジ不足時は優先）。
3. 不要なインポート・コメントを整理する。
4. 型エイリアスを整理する。
5. リファクタリング後に全テストが Green であることを確認する。

## 成果物

| 成果物         | パス                                             | 説明                         |
| -------------- | ------------------------------------------------ | ---------------------------- |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`            | リファクタリング内容と方針   |
| 再テスト計画   | `outputs/phase-8/post-refactor-test-plan.md`     | リファクタ後のテスト確認計画 |
| 責務境界マップ | `outputs/phase-8/responsibility-boundary-map.md` | コンポーネント責務の整理     |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] リファクタリング後に全テストが Green であること
- [ ] 不要なインポートが削除されていること
- [ ] 責務境界マップが完成していること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. inferSmartDefaults 分離（オプション）
3. 不要インポート・型の整理
4. リファクタ後テスト確認
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 9: 品質保証
