# Phase 1 成果物: 受け入れ基準

## メタ情報

| 項目       | 内容         |
| ---------- | ------------ |
| タスクID   | TASK-9B      |
| Phase      | 1            |
| 成果物     | 受け入れ基準 |
| 作成日     | 2026-02-26   |
| ステータス | 完了         |

## 受け入れ基準一覧（AC-01 〜 AC-22）

### 機能要件対応 AC

| ID    | 受け入れ基準                                                                    | 対応要件 | テスト方法     | 優先度 |
| ----- | ------------------------------------------------------------------------------- | -------- | -------------- | ------ |
| AC-01 | `/skill-creator chat` で対話的ヒアリング後にスキルディレクトリが生成される      | FR-1     | 統合テスト     | High   |
| AC-02 | `/skill-creator api` で REST API 連携スキルが生成され、認証情報管理が含まれる   | FR-2     | 統合テスト     | High   |
| AC-03 | `/skill-creator improve` で既存スキルの改善提案が生成される                     | FR-3     | ユニットテスト | High   |
| AC-04 | `/skill-creator improve --auto` で改善が自動適用される                          | FR-3     | ユニットテスト | Medium |
| AC-05 | `/skill-creator execute` でタスク仕様書が依存順序どおりに実行される             | FR-4     | 統合テスト     | High   |
| AC-06 | `/skill-creator execute --dry-run` で実行計画のみ表示される                     | FR-4     | ユニットテスト | Medium |
| AC-07 | `/skill-creator execute` で循環依存がある場合にエラーメッセージが表示される     | FR-4     | ユニットテスト | High   |
| AC-08 | `/skill-creator use` で作成済みスキルがセッションにインポートされる             | FR-5     | 統合テスト     | High   |
| AC-09 | `/skill-creator chain` で複数スキルのパイプラインが定義ファイルとして生成される | FR-6     | ユニットテスト | Medium |
| AC-10 | `/skill-creator fork` で元スキルの構造を引き継いだ新スキルが作成される          | FR-7     | ユニットテスト | Medium |
| AC-11 | `/skill-creator share export` で GitHub Gist にスキルがエクスポートされる       | FR-8     | 統合テスト     | Low    |
| AC-12 | `/skill-creator share import` で外部ソースからスキルがインポートされる          | FR-8     | 統合テスト     | Low    |
| AC-13 | `/skill-creator schedule` でスケジュール設定が永続化される                      | FR-9     | ユニットテスト | Low    |
| AC-14 | `/skill-creator debug` でブレークポイントが機能し、ステップ実行ができる         | FR-10    | 統合テスト     | Medium |
| AC-15 | `/skill-creator docs` でMarkdown形式のドキュメントが生成される                  | FR-11    | ユニットテスト | Medium |
| AC-16 | `/skill-creator stats` で実行回数・平均実行時間が表示される                     | FR-12    | ユニットテスト | Low    |

### 非機能要件対応 AC

| ID    | 受け入れ基準                                                              | 対応要件  | テスト方法         | 優先度 |
| ----- | ------------------------------------------------------------------------- | --------- | ------------------ | ------ |
| AC-17 | 全IPCハンドラーで `validateIpcSender()` が呼ばれ、不正送信元が拒否される  | NFR-1-1   | セキュリティテスト | High   |
| AC-18 | スペースのみの文字列引数（`"   "`）がバリデーションで拒否される           | NFR-1-2   | セキュリティテスト | High   |
| AC-19 | `../` を含むパス引数がIPCレベルで拒否される                               | NFR-1-3   | セキュリティテスト | High   |
| AC-20 | エラーレスポンスに内部ファイルパス・スタックトレースが含まれない          | NFR-1-4   | セキュリティテスト | High   |
| AC-21 | `pnpm typecheck` が全パッケージで通過する                                 | NFR-2-1/2 | 型チェック         | High   |
| AC-22 | 既存スキル関連IPCハンドラー（list, import, remove）が引き続き正常動作する | -         | 回帰テスト         | High   |

## AC → テストマッピング

| AC ID | テスト種別         | テストファイル（予定）                            |
| ----- | ------------------ | ------------------------------------------------- |
| AC-01 | 統合テスト         | SkillCreatorService.integration.test.ts (INT-001) |
| AC-02 | 統合テスト         | SkillCreatorService.integration.test.ts (INT-002) |
| AC-03 | ユニットテスト     | SkillCreatorService.test.ts (SC-020)              |
| AC-04 | ユニットテスト     | SkillCreatorService.test.ts (SC-021)              |
| AC-05 | 統合テスト         | SkillCreatorService.integration.test.ts (INT-003) |
| AC-06 | ユニットテスト     | SkillCreatorService.test.ts (SC-022)              |
| AC-07 | ユニットテスト     | SkillCreatorService.test.ts (SC-023)              |
| AC-08 | 統合テスト         | SkillCreatorService.integration.test.ts (INT-004) |
| AC-09 | ユニットテスト     | SkillCreatorService.test.ts (SC-024)              |
| AC-10 | ユニットテスト     | SkillCreatorService.test.ts (SC-025)              |
| AC-11 | 統合テスト         | SkillCreatorService.integration.test.ts (INT-005) |
| AC-12 | 統合テスト         | SkillCreatorService.integration.test.ts (INT-006) |
| AC-13 | ユニットテスト     | SkillCreatorService.test.ts (SC-026)              |
| AC-14 | 統合テスト         | SkillCreatorService.integration.test.ts (INT-007) |
| AC-15 | ユニットテスト     | SkillCreatorService.test.ts (SC-027)              |
| AC-16 | ユニットテスト     | SkillCreatorService.test.ts (SC-028)              |
| AC-17 | セキュリティテスト | skillCreatorHandlers.validation.test.ts (IPC-001) |
| AC-18 | セキュリティテスト | skillCreatorHandlers.validation.test.ts (IPC-002) |
| AC-19 | セキュリティテスト | skillCreatorHandlers.validation.test.ts (IPC-003) |
| AC-20 | セキュリティテスト | skillCreatorHandlers.validation.test.ts (IPC-004) |
| AC-21 | 型チェック         | `pnpm typecheck` コマンド                         |
| AC-22 | 回帰テスト         | skillHandlers.test.ts                             |

## テスト優先度マトリクス

| 優先度 | AC数 | ID一覧                                                 |
| ------ | ---- | ------------------------------------------------------ |
| High   | 11   | AC-01, AC-02, AC-03, AC-05, AC-07, AC-08, AC-17〜AC-22 |
| Medium | 6    | AC-04, AC-06, AC-09, AC-10, AC-14, AC-15               |
| Low    | 5    | AC-11, AC-12, AC-13, AC-16                             |
