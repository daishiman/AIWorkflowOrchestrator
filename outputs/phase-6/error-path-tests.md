# Phase 6 タスク1: planSkill エラーパステスト

## 追加テストケース一覧

| テストID | 説明                                                                       | 結果    |
| -------- | -------------------------------------------------------------------------- | ------- |
| E-1      | planSkill が失敗レスポンスを返すとき setGenerationError が呼ばれる         | ✅ PASS |
| E-2      | planSkill が例外をスローするとき setGenerationError が呼ばれる             | ✅ PASS |
| E-2b     | planSkill logical error(success:false in data)時に plan state をクリアする | ✅ PASS |
| E-4      | planSkill 失敗後に setIsGenerating(false) が呼ばれる（finally 保証）       | ✅ PASS |

## 実装メモ

- E-1, E-2, E-2b, E-4 は既存テストファイルの `.skip` を除去して有効化
- handleLlmGenerate の try/catch/finally で全パス網羅
