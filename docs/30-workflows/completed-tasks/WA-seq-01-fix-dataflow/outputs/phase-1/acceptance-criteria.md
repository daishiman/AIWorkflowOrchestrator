# 受け入れ基準 (Acceptance Criteria)

## AC-1: buildSkillContext 全フィールド変換

- **Given**: `formData`（全フィールド入力済み）と `answers`（Q1〜Q6 全て入力済み）
- **When**: `buildSkillContext(formData, answers)` を呼ぶ
- **Then**: 返却された `SkillCreationContext` の全フィールドに値が入っている

## AC-2: 空文字の undefined 正規化

- **Given**: `answers.q1.freeText = ""`、`answers.q1.selectedOptions = []`
- **When**: `buildSkillContext` を呼ぶ
- **Then**: `context.q1Purpose === undefined`

## AC-3: handleGenerate が SkillCreationContext を渡す

- **Given**: ウィザード Step 1 で Q1〜Q6 に回答済み
- **When**: 生成ボタンをクリック（`handleGenerate` 呼び出し）
- **Then**: `createSkill` が第3引数に `SkillCreationContext` オブジェクトを受け取る

## AC-4: createSkill Thunk が IPC に context を渡す

- **Given**: `createSkill(description, options, context)` が呼ばれた
- **When**: `window.electronAPI.skill.create` が呼ばれる
- **Then**: `params.context` に `SkillCreationContext` が含まれている

## AC-5: IPC ハンドラがエンリッチプロンプトを生成

- **Given**: context に Q1〜Q6 の内容が入っている
- **When**: `skill:create` IPC ハンドラが実行される
- **Then**: `createSkillFromWizard` に渡される description に Q1〜Q6 の内容が含まれる

## AC-6: 後方互換性

- **Given**: context なしで `createSkill(description, options)` が呼ばれた
- **When**: IPC ハンドラが実行される
- **Then**: `createSkillFromWizard` に渡される description は `description.trim()` と同一
