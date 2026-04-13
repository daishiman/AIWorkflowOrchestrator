# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| Phase      | 8                                                             |
| タスクID   | TASK-SW-FIX-MODE-MGMT-001                                     |
| 機能名     | generationModeラジオボタン廃止・LLM専用化・Step 1スキップ修正 |
| 前提Phase  | Phase 7                                                       |
| 後続Phase  | Phase 9                                                       |
| 作成日     | 2026-04-12                                                    |
| ステータス | pending                                                       |

## 目的

Phase 5 の実装を品質・可読性・保守性の観点でリファクタリングし、全テストが Green のまま維持されることを確認する。

## リファクタリング観点

### 1. SkillCreateWizard の責務整理

`generationMode` / `hasActivatedLlmMode` 廃止後に残存する不要な変数・コメント・型定義を除去し、ウィザードの責務をシンプル化する。

```
現状: generationMode廃止後も型参照・コメントが残存する可能性
改善: 全ての残骸コードを除去し、LLM専用ウィザードとして一貫した実装にする
```

### 2. handleStep0Next の単純化

```typescript
// リファクタリング前（分岐が残存している可能性）
const handleStep0Next = () => {
  // generationMode 参照の残骸コメント等が存在する場合
  goToStep(1);
};

// リファクタリング後（意図が明確）
const handleStep0Next = () => {
  goToStep(1); // LLM専用: 常にStep 1（ConversationRoundStep）へ遷移
};
```

### 3. 不要なインポートの削除

`generationMode` / `hasActivatedLlmMode` 廃止後に残っている可能性のある未使用インポートを除去する。

| 除去対象                           | 理由                |
| ---------------------------------- | ------------------- |
| `GenerationMode` 型インポート      | stateと共に廃止     |
| テンプレートモード用コンポーネント | LLM専用化で不要     |
| `hasActivatedLlmMode` 関連の型     | state廃止に伴う除去 |

### 4. SkillInfoStep の整理

ラジオボタン削除後の `SkillInfoStep.tsx` において、不要な props・型定義・スタイル定義を整理する。

```
現状: generationMode関連のprops型定義が残存する可能性
改善: props型定義から generationMode 関連を完全除去
```

### 5. コメントの整理

「LLMモードのみ」「templateモード廃止」等、削除後の状態を明示するコメントを追加し、後続開発者への意図伝達を明確にする。

## 責務境界マップ

| コンポーネント/ファイル            | 責務                                                           |
| ---------------------------------- | -------------------------------------------------------------- |
| `SkillCreateWizard.tsx`            | state管理・ハンドラ定義・Step間オーケストレーション（LLM専用） |
| `wizard/SkillInfoStep.tsx`         | Step 0 UI（スキル名・目的・カテゴリ入力のみ）                  |
| `wizard/ConversationRoundStep.tsx` | Step 1 UI（Q1〜Q6インタビュー・必ず通過）                      |
| `wizard/GenerateStep.tsx`          | Step 2 UI（LLM生成中表示・generationMode prop不使用）          |
| `wizard/CompleteStep.tsx`          | Step 3 UI（完了表示）                                          |

## 参照資料

| 資料名                 | パス                                              | 用途           |
| ---------------------- | ------------------------------------------------- | -------------- |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | Phase 7 成果物 |
| 未到達分析             | `outputs/phase-7/uncovered-analysis-plan.md`      | Phase 7 成果物 |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | Phase 7 成果物 |
| アーキテクチャ設計     | `outputs/phase-2/architecture-design.md`          | Phase 2 成果物 |

## 実行手順

1. Phase 7 成果物を確認する。
2. 不要なインポート・コメント・型定義を整理する（Step 1〜4）。
3. `SkillCreateWizard.tsx` の責務を明確にするコメントを追加する（Step 5）。
4. リファクタリング後に全テストが Green であることを確認する。

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
- [ ] `generationMode` / `hasActivatedLlmMode` の残骸コードが0件であること
- [ ] 責務境界マップが完成していること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 不要インポート・型の整理
3. コメント整理・責務明確化
4. リファクタ後テスト確認
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 9: 品質保証
