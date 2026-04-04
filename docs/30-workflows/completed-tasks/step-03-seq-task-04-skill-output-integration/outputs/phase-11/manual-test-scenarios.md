# Phase 11 成果物: 手動テストシナリオ — TASK-SDK-SC-04

## 手動テストシナリオ一覧

本タスクは Electron Main Process 上の実装であるため、実際の SDK セッション実行環境では以下のシナリオで動作確認が必要。

### MT-01: スキル生成フロー全体通し（新規スキル）

1. Skill Creator を起動し、質問に回答して SDK セッションを完了させる
2. セッション出力に `<!-- SKILL_START: {skillName} -->` / `<!-- SKILL_END: {skillName} -->` マーカーが含まれる
3. **期待値**:
   - `.claude/skills/{skillName}/SKILL.md` が自動作成される
   - `SkillCreatorResultPanel` に「スキルを生成しました: {skillName}」が表示される
   - スキル名・保存先パス・プレビューが正しく表示される
   - 「スキルを開く」ボタンが表示される

### MT-02: 既存スキル上書きフロー

1. MT-01 と同じスキル名で再度セッションを実行する
2. **期待値**:
   - `requiresOverwriteConfirm: true` として `SkillCreatorResultPanel` に上書き確認バナーが表示される
   - 「上書きして保存」ボタンが表示される
   - ボタンをクリックすると上書き保存が完了し、通知が再表示される

### MT-03: マーカーなしセッション出力（フォールバック確認）

1. SDK セッションがマーカーなしの出力を返す
2. **期待値**:
   - `name:` が含まれる場合は出力全体を SKILL.md として保存される
   - `name:` が含まれない場合は `extractSkillFromOutput` が `null` を返し、UI 通知は行われない
   - どちらの場合もエラーは発生しない（サイレント処理）

## 注意事項

手動テストは実際の Electron 起動環境が必要。
現時点では自動テスト（T-01〜T-09）で動作の大部分を担保している。
