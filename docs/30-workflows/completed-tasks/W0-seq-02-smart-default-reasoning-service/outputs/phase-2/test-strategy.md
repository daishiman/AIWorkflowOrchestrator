# テスト戦略

## タスク情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| Phase    | 2                                              |

## テスト方針

TDD（Red → Green → Refactor）サイクルで進める。

1. **Phase 4**: Red テスト定義（実装なしで失敗するテストを先に作成）
2. **Phase 5**: Green 化（最小実装でテストを通す）
3. **Phase 6**: エッジケース追加（境界条件・組み合わせテスト）
4. **Phase 7**: カバレッジ計測（目標: 90% 以上）
5. **Phase 8**: リファクタリング（品質改善、テスト維持）

## テスト対象

| テスト対象                           | テスト種別     | 目的                                    |
| ------------------------------------ | -------------- | --------------------------------------- |
| ツール推論（slack/github/notion）    | ユニットテスト | 推論正確性検証                          |
| タイミング推論（scheduled/realtime） | ユニットテスト | 推論正確性検証                          |
| フォーマット推論（code/structured）  | ユニットテスト | 推論正確性検証                          |
| フォールバック                       | ユニットテスト | null フィールド・空 inferenceLog の確認 |
| inferenceLog                         | ユニットテスト | 推論根拠の記録が正しいことの確認        |
| エッジケース                         | ユニットテスト | 境界条件・複数ツール名・大文字小文字    |
| 組み合わせテスト                     | ユニットテスト | AC-2 確認                               |

## テストファイル配置

```
packages/shared/src/services/skillCreator/__tests__/
  smartDefaultReasoningService.test.ts
```

## テスト実行コマンド

```bash
# 単体実行
pnpm --filter @repo/shared test -- smartDefaultReasoningService

# カバレッジ付き実行（Phase 7）
pnpm --filter @repo/shared test --coverage \
  --coverage.include="**/services/skillCreator/smartDefaultReasoningService.ts"
```

## カバレッジ目標

| 対象ファイル                      | 目標カバレッジ       |
| --------------------------------- | -------------------- |
| `smartDefaultReasoningService.ts` | 90% 以上（行・分岐） |
