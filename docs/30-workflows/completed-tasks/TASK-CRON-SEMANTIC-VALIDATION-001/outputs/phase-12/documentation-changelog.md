# ドキュメント更新履歴

## 2026-04-12 TASK-CRON-SEMANTIC-VALIDATION-001

### 追加

- `docs/30-workflows/TASK-CRON-SEMANTIC-VALIDATION-001/index.md`: タスク状態を completed に同期
- `docs/30-workflows/TASK-CRON-SEMANTIC-VALIDATION-001/artifacts.json`: task status を completed に同期
- `outputs/phase-12/implementation-guide.md`: validateCronSemantics 実装ガイド（中学生レベル + 技術者レベル）
- `outputs/phase-12/system-spec-update-summary.md`: システム仕様書更新サマリ
- `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`: `CRON_VALIDATION_ERRORS` 定数・`MAX_DAYS_PER_MONTH` 定数・`validateCronSemantics` 内部関数を追加
- `.claude/skills/task-specification-creator/SKILL.md` / `.claude/skills/task-specification-creator/LOGS.md`: 変更なし（current facts を同期）
- `.claude/skills/aiworkflow-requirements/SKILL.md` / `.claude/skills/aiworkflow-requirements/LOGS.md`: 変更なし（current facts を同期）

### 更新

- `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`: `validateCronExpression` に Stage 3（意味論的チェック）を追加
- `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`: SCV-11 を weekday 指定スキップ確認に更新、TC-SV-01〜07・AC-5・SCV-13 を追加
- `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts`: TC-EDGE/LEAP/COMP/REG テストを追加
- `apps/desktop/src/__tests__/views/ScheduleManager/ScheduleDialog.test.tsx`: 2月31日の保存ブロック回帰テストを追加
- `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`: 2月31日の生成ブロック回帰テストを追加

### 備考

- UI コンポーネントの実装変更はなし。既存の string エラー表示ロジックに対する回帰テストを追加
- GitHub Issue #2082 対応
- history companion にはスキル定義差分なし・仕様更新不要の判定を同期済み
