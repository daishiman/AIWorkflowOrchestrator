# TASK-SDK-SC-04: Skill Output Integration

## メタ情報

| 項目         | 値                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| タスクID     | TASK-SDK-SC-04                                                                                            |
| 責務         | Skill Output Integration                                                                                  |
| 実行順序     | step-03-seq（TASK-SDK-SC-01 / 02 / 03 完了後に実行）                                                      |
| 依存先       | TASK-SDK-SC-01（SDK セッション基盤）/ TASK-SDK-SC-02（質問エンジン）/ TASK-SDK-SC-03（UI コンポーネント） |
| ブロック対象 | なし（本タスクが最終統合タスク）                                                                          |
| ステータス   | 未着手                                                                                                    |
| 作成日       | 2026-04-02                                                                                                |

## 目的

SDK セッション完了時に skill-creator が生成したスキル（YAML / Markdown）を捕捉し、`.claude/skills/{skill-name}/SKILL.md` に保存、Electron の `SkillRegistry` に登録、UI でスキル生成完了を通知・プレビュー表示するまでのパイプラインを確立する。

本タスクは TASK-SDK-SC-01/02/03 の成果物を統合する最終タスクであり、SDK インタラクティブスキルクリエイター機能の完成を意味する。

## 対象ファイル

| ファイル                                                                         | 変更内容                                               |
| -------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `apps/desktop/src/main/services/runtime/SkillCreatorOutputHandler.ts`            | 新規: スキル出力捕捉・保存・レジストリ登録ハンドラー   |
| `apps/desktop/src/renderer/components/skill-creator/SkillCreatorResultPanel.tsx` | 新規: スキル生成完了通知・プレビュー表示コンポーネント |
| `apps/desktop/src/main/services/runtime/SkillRegistry.ts`                        | 更新: `registerFromPath()` メソッド追加                |
| `packages/shared/src/ipc/channels.ts`                                            | 追記: `SKILL_CREATOR_OUTPUT_READY` チャネル定数        |

## 実行タスク

### Task 1: 要件定義（Phase 1）

FR-001 から FR-006 の機能要件・受入基準 AC-01 から AC-06 の確定。

### Task 2: 設計（Phase 2）

`SkillCreatorOutputHandler` クラス・`SkillCreatorResultPanel` コンポーネント・`ParsedSkillOutput` 型・パース戦略の設計。

### Task 3: 設計レビュー（Phase 3）

矛盾なし / 漏れなし / 整合性あり / 依存関係整合の 4 条件で検証。

### Task 4: テスト作成—Red（Phase 4）

TDD の Red フェーズ: T-01 から T-06 のテストケース定義。

### Task 5: 実装—Green（Phase 5）

TDD の Green フェーズ: `SkillCreatorOutputHandler` / `SkillCreatorResultPanel` / `SkillRegistry` 更新 / `channels.ts` 追記。

### Task 6: テスト拡充（Phase 6）

エッジケース（パース失敗・ディレクトリ作成エラー・レジストリ登録重複）を追加。

### Task 7: カバレッジ確認（Phase 7）

`SkillCreatorOutputHandler` ≥85% のカバレッジ達成確認。

### Task 8: リファクタリング（Phase 8）

パース戦略の統一化・ファイル I/O エラーハンドリング確認。

### Task 9: 品質保証（Phase 9）

typecheck 0 エラー・lint 0 エラー・全テスト PASS・ファイルシステムアクセス権限確認。

### Task 10: 最終レビュー（Phase 10）

全タスク（01/02/03/04）との統合確認・4 条件レビュー。

### Task 11: 手動テスト（Phase 11）

MT-01 から MT-03 のシナリオ手動確認（スキル生成フロー全体通し）。

### Task 12: ドキュメント（Phase 12）

スキル出力フォーマット仕様・パース戦略の説明。

### Task 13: 完了・PR 作成（Phase 13）

コミット・PR 作成・全タスク（01/02/03/04）統合の最終確認。

## 参照資料

| 資料名                        | パス                                                                                |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| requirements-draft            | `docs/30-workflows/skill-creator-agent-sdk-lane/requirements-draft.md`              |
| 既存 channels.ts              | `packages/shared/src/ipc/channels.ts`                                               |
| 既存 skillCreator.ts 型定義   | `packages/shared/src/types/skillCreator.ts`                                         |
| SkillCreatorWorkflowEngine.ts | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`              |
| SkillRegistry.ts              | `apps/desktop/src/main/services/runtime/SkillRegistry.ts`                           |
| TASK-SDK-SC-01 index          | `docs/30-workflows/completed-tasks/step-01-seq-task-01-sdk-session-bridge/index.md` |
| TASK-SDK-SC-02 index          | 旧 completed-tasks 配下の既存成果物（現ブランチでは未配置）                         |
| TASK-SDK-SC-03 index          | 旧 completed-tasks 配下の既存成果物（現ブランチでは未配置）                         |

## 完了条件

- [ ] `SkillCreatorOutputHandler` クラスが実装済みである
- [ ] `SkillCreatorResultPanel` コンポーネントが実装済みである
- [ ] `SkillRegistry.ts` に `registerFromPath()` が追加されている
- [ ] `channels.ts` に `SKILL_CREATOR_OUTPUT_READY` 定数が追加されている
- [ ] `.claude/skills/{name}/SKILL.md` への自動保存が動作する
- [ ] TypeScript コンパイルエラーが 0 件である
- [ ] 全テストが PASS している
