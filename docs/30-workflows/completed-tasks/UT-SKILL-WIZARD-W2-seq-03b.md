# 未タスク指示書: UT-SKILL-WIZARD-W2-seq-03b

## メタ情報

```yaml
issue_number: 2011
task_id: UT-SKILL-WIZARD-W2-seq-03b
task_name: wizard/index.ts 最終エクスポート整理
category: 改善
target_feature: skill-wizard/wizard-exports
priority: 低
scale: 小規模
status: 未実施
created_date: 2026-04-07
dependencies: [UT-SKILL-WIZARD-W1-par-02a, UT-SKILL-WIZARD-W1-par-02b]
```

## メタ情報

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-W2-seq-03b                                              |
| 由来       | UT-SKILL-WIZARD-W1-par-02a Phase 12 未タスク検出レポート（W2 引き継ぎ） |
| ステータス | resolved by `docs/30-workflows/W2-seq-03b-wizard-exports/`              |
| 優先度     | low                                                                     |
| 作成日     | 2026-04-07                                                              |
| 関連仕様書 | `docs/30-workflows/W2-seq-03b-wizard-exports/index.md`                  |

## 目的

`apps/desktop/src/renderer/components/skill/wizard/index.ts` のエクスポートを最終整理する。  
Wave 1（W1-par-02a/02b/02c）の全実装完了後、廃止コンポーネント（DescribeStep/ConfigureStep）の  
エクスポートを削除し、新コンポーネント（SkillInfoStep/ConversationRoundStep）を正式追加する。

## 背景

W1-par-02a で `DescribeStep` エクスポートを削除・`GenerationMode` 型を `GenerateStep.tsx` に移動し、  
`wizard/index.ts` の一部整理は完了している。  
ただし current implementation では `ConfigureStep` は既に存在せず、W2-seq-03b の主対象は
`DescribeStep` / `DescribeStepProps` / inline `GenerationMode` の整理と `SkillInfoStepProps` 公開で閉じた。

### 苦戦箇所（W1-par-02a より引き継ぎ）

- **エクスポート順序の依存**: `wizard/index.ts` はウィザード全体の公開 API となっており、  
  Wave 1 の並列タスクが同時進行するため、各タスクが独立してエクスポートを操作すると競合が起きやすい。  
  Wave 2 での一括整理（本タスク）がその競合を解消する設計になっている。

## 実行タスク

1. W1-par-02a/02b/02c/02d の完了を確認する（前提確認）
2. 以下のエクスポートを `wizard/index.ts` から削除する:
   - `DescribeStep`
   - `DescribeStepProps`
   - inline `GenerationMode`
3. 以下のエクスポートが存在することを確認（なければ追加）:
   - `SkillInfoStepProps`
   - `GenerationMode`（`GenerateStep.tsx` から re-export）
4. 不要な未使用エクスポートが残っていないか全量チェックする
5. ビルド確認・インポートチェックを実施する
6. 最終エクスポート一覧をドキュメント化する

## 参照資料

| 参照資料                          | パス                                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------ |
| W2-seq-03b 詳細仕様書（index.md） | docs/30-workflows/W2-seq-03b-wizard-exports/index.md                                       |
| wizard/index.ts 現行ファイル      | apps/desktop/src/renderer/components/skill/wizard/index.ts                                 |
| W1-par-02a Phase 12 未タスク検出  | docs/30-workflows/W1-par-02a-skill-info-step/outputs/phase-12/unassigned-task-detection.md |
| 共有型定義                        | packages/shared/src/types/skillCreator.ts                                                  |

## 受入基準

- [ ] W1-par-02a/02b/02c の全実装が前提として完了している
- [ ] `DescribeStep` / `DescribeStepProps` / inline `GenerationMode` のエクスポートが存在しない
- [ ] `SkillInfoStepProps` の型 export が正しく公開されている
- [ ] `GenerationMode` 型が `GenerateStep.tsx` から正しく re-export されている
- [ ] `pnpm typecheck` がエラーなく通過する
- [ ] `wizard/index.ts` を import している既存コードが壊れていない
- [ ] 最終エクスポート一覧が Phase 12 ドキュメントに記録されている

## 注意事項

- **直列実行**: Wave 1（W1-par-02a/02b/02c/02d）全完了後に実行すること
- `W2-seq-03a-skill-create-wizard`（SkillCreateWizard 本体統合）と同 Wave 2 だが、本タスクが先行推奨
- Phase 13（PR 作成）はユーザー指示まで blocked 扱い
