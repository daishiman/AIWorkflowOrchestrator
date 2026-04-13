# 設計一貫性チェック - TASK-UI-SCHEDULE-CRON-SEMANTIC-001

## concern 分離確認

### バンドルサイズ

- `cron-parser` は Renderer バンドルに追加される（Main Process には不要）
- `import { CronExpressionParser } from "cron-parser"` を `scheduleConfigValidator.ts` でのみ使用
- `options.semantic === true` の場合のみ実行するため、semantic 未使用コンポーネントへの影響なし

### 後方互換性

- `options` パラメータはオプショナル（`?`）のため、既存の全呼び出し箇所への変更は不要
- `validateSkillWizardScheduleConfig` の内部実装は変更なし（`options` を渡さない）
- 既存テスト SCV-01〜SCV-12 は `options` 未指定で呼ぶため、引き続き PASS

### テスタビリティ

- `options.semantic: true` で明示的に有効化するため、ユニットテストで制御しやすい
- `cron-parser` のモック不要（実際の計算ロジックを使用してテスト）
- 正常ケースと不正ケースを独立してテスト可能

## 設計判断記録

| 決定事項                                 | 選択                               | 理由                                       |
| ---------------------------------------- | ---------------------------------- | ------------------------------------------ |
| semantic 有効化方式                      | opt-in（`options.semantic: true`） | 後方互換性を壊さず既存呼び出しへの影響ゼロ |
| ライブラリ選択                           | `cron-parser`                      | 正確性・保守性が高く実装コストが低い       |
| `validateSkillWizardScheduleConfig` 変更 | 変更しない                         | 呼び出し元の判断で `options` を渡す設計    |
| バンドル追加先                           | `dependencies`                     | Renderer で実行時に必要なため              |
| エラーメッセージ形式                     | 既存パターンに準拠した日本語       | UIでの表示は既存の仕組みを流用             |

## 完了条件チェックリスト

- [x] `ValidateCronOptions` インターフェースの定義が確定
- [x] `validateCronExpression` の変更後シグネチャが確定
- [x] `cron-parser` を推奨ライブラリとして採用する判断が記録済み
- [x] 意味論的バリデーションロジックのフローが文書化済み
- [x] 後方互換性の確保方針（`options` オプショナル）が確定
- [x] 変更ファイルリスト（コード1種 + テスト2種 + 依存関係1件）が確定
