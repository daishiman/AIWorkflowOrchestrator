# Phase 11: 手動テスト（NON_VISUAL） - タスク仕様書

## メタ情報

| 項目               | 内容                      |
| ------------------ | ------------------------- |
| Phase              | 11                        |
| Phase名            | 手動テスト（NON_VISUAL）  |
| カテゴリ           | テスト                    |
| 前提Phase          | Phase 10                  |
| 後続Phase          | Phase 12                  |
| GUI変更            | なし（NON_VISUAL タスク） |
| スクリーンショット | 不要（GUI変更なしのため） |

## 目的

自動テスト結果を証跡として、NON_VISUAL の手動テスト記録を作成する。
旧来の `E-11〜E-16` といった範囲参照ではなく、current facts のテスト構成をそのまま記録する。

## 実行タスク

### タスク1: 自動テスト結果を保存する（証跡）

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="persist-integration|SkillFileWriter|parseLlmResponseToContent" --verbose 2>&1 | tee outputs/phase-11/test-output.log
```

### タスク2: 記録（件数/ID）

| テスト分類         | テストスイート                    | テストケース数 | 証跡（current facts）              |
| ------------------ | --------------------------------- | -------------- | ---------------------------------- |
| persist 統合テスト | persist-integration.test.ts       | 22             | F-01〜F-06, E-10〜E-16, E-21〜E-29 |
| SkillFileWriter    | SkillFileWriter.test.ts           | 28             | 単体テスト                         |
| パーサー           | parseLlmResponseToContent.test.ts | 14             | 単体テスト                         |
| 合計               |                                   | 64             | -                                  |

## 完了条件

- [ ] `outputs/phase-11/test-output.log` が生成されている
- [ ] テスト件数が current facts（64件）と一致している
