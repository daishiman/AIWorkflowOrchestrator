# Phase 1: 受け入れ基準

## TASK-SW-STRUCT-LLM-002 受け入れ基準

### AC-1: `generateFeaturesWithLlm` メソッドの実装

- `SkillCreatorService.ts` に `generateFeaturesWithLlm(description, signal?)` プライベートメソッドを追加する
- `plan-structure` エージェントプロンプトを読み込んで `generate_features.js` を呼び出す

### AC-2: `runCreateWorkflow` の変更

- `features: []` ハードコードを `features: await this.generateFeaturesWithLlm(...)` に変更する
- スクリプト失敗時は空配列でフォールバックする

### AC-3: `generate_features.js` スクリプトの作成

- `.claude/skills/skill-creator/scripts/generate_features.js` を新規作成する
- `--description` 引数を必須とし、JSON配列をstdoutに出力する

### AC-4: テストの整備

- `SkillCreatorService.features.test.ts` に TC-01〜TC-14 を実装する
- `struct-001.test.ts` の TC-03 を「配列であること」の検証に更新する
