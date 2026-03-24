# UT-SC-03-003-M02: テスト内 undefined キャスト除去

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| タスクID   | UT-SC-03-003-M02                 |
| 親タスクID | UT-SC-03-003                     |
| 発見元     | Phase 10 最終レビュー MINOR 指摘 |
| 優先度     | Low                              |
| 発見日     | 2026-03-24                       |
| ステータス | unassigned                       |

## Why（なぜ必要か）

TC-7 テストケースで `undefined as unknown as ILLMAdapter` というキャストを使用している。P19（型キャストによる実行時検証バイパス）のテスト版パターンであり、テスト可読性と型安全性の観点で改善余地がある。

## What（何をするか）

TC-7 の `setLLMAdapter(undefined as unknown as ILLMAdapter)` を、型安全なテスト手法に置き換える。

## How（どのように実装するか）

1. `RuntimeSkillCreatorFacade.test.ts` の TC-7 テストケースを特定する
2. `undefined as unknown as ILLMAdapter` を以下のいずれかに置き換える:
   - `setLLMAdapter` の引数型を `ILLMAdapter | undefined` に拡張する（API 変更が必要）
   - テスト用のスタブ adapter（全メソッドが例外を投げる）を作成して渡す
3. テストが引き続き PASS することを確認する

## 完了条件

- [ ] TC-7 で `as unknown as` キャストが使用されていない
- [ ] テストの意図（graceful degradation への復帰）が維持されている
- [ ] 全テストが PASS する

## 関連資料

- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` (TC-7)
- P19: 型キャストによる実行時検証バイパス（`06-known-pitfalls.md`）
