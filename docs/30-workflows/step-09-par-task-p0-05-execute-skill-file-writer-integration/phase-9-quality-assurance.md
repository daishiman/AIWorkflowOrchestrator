# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 9                                     |
| Phase名    | 品質保証                              |
| 対象機能   | execute-skill-file-writer-integration |
| 前提Phase  | Phase 8: リファクタリング             |
| 次Phase    | Phase 10: 最終レビュー                |
| ステータス | not_started                           |
| 作成日     | 2026-03-30                            |

## 目的

lint、typecheck、テスト、IPC契約ドリフト検証、セキュリティ確認を品質ゲートとして実行し、Phase 10 に渡す blocker がないことを確認する。

## 実行タスク

### Task 9-1: 品質ゲート実行

以下の4つの品質ゲートを順に実行し、全てパスすることを確認する。

#### Gate 1: ESLint

```bash
pnpm lint
```

- 新規ファイル `parseLlmResponseToContent.ts` が lint ルールに準拠していること
- 変更ファイル `RuntimeSkillCreatorFacade.ts`, `skillCreator.ts` に新たな lint エラーがないこと
- 警告（warning）がある場合は内容を記録し、blocker でないことを確認

#### Gate 2: TypeScript strict mode

```bash
pnpm typecheck
```

- `persistResult?: { skillPath: string; files: string[] } | null` と `persistError?: string | null` の型定義が strict mode で正しく動作すること
- `parseLlmResponseToContent` の戻り値型 `SkillGeneratedContent | null` が呼び出し元で正しくナローイングされていること
- `SkillFileWriter` の DI（optional dependency）に対する null チェックが型安全であること

#### Gate 3: テスト全件実行

```bash
pnpm test
```

- 新規テスト（パーサーUT、Facade persist連携UT）が全て成功
- 既存テストに regression がないこと
- テスト実行時間が大幅に増加していないこと（+10秒以内が目安）

#### Gate 4: IPC契約ドリフト検証

```bash
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only
```

- `ExecuteResult` 型への `persistResult` / `persistError` フィールド追加が IPC 契約に影響しないことを確認
- `RuntimeSkillCreatorExecuteResponse` がユニオン型であり、フィールド追加が後方互換であることの検証
- ドリフト検出された場合は内容を記録し、対処方針を決定

### Task 9-2: セキュリティ確認

| 確認項目                        | 確認方法                                                             | 期待結果                                       |
| ------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------- |
| パス横断防止                    | `parseLlmResponseToContent` がファイルパスのサニタイズを行わないこと | SkillFileWriter に委譲（パーサーは責務外）     |
| LLM応答由来のファイル名の安全性 | `SkillFileWriter.persist()` 内でパス検証が行われること               | パーサーは生のファイル名を渡し、Writer側で防御 |
| 入力バリデーション              | パーサーが不正な入力（巨大文字列、制御文字等）で例外を投げないこと   | null 返却または正常処理                        |

### Task 9-3: 既存テストとの互換性確認

| 確認対象                             | 確認内容                                                     |
| ------------------------------------ | ------------------------------------------------------------ |
| RuntimeSkillCreatorFacade 既存テスト | execute() の既存テストケースが persist 連携追加後も成功する  |
| SkillFileWriter 既存テスト           | SkillFileWriter のテストが変更されていないこと（スコープ外） |
| skillCreator.ts 型を参照する他テスト | ExecuteResult 型拡張が後方互換で既存テストを壊さないこと     |
| IPC ハンドラー関連テスト             | IPC レスポンス型の変更が既存ハンドラーテストに影響しないこと |

### Task 9-4: 仕様書・成果物名の整合性確認

- Phase 名、成果物名、artifacts.json の名称が統一されていること
- Phase 10〜13 の参照先パスが正しいこと
- 成果物ディレクトリ（`outputs/phase-9/`）が存在すること

## 参照資料

| 資料名            | パス                                                                  | 説明                    |
| ----------------- | --------------------------------------------------------------------- | ----------------------- |
| Phase 2 設計      | `phase-2-design.md`                                                   | IPC後方互換性の設計判断 |
| Phase 5 実装      | `phase-5-implementation.md`                                           | 品質ゲート対象          |
| Phase 8 整理      | `phase-8-refactoring.md`                                              | 品質ゲート対象          |
| IPC契約スクリプト | `apps/desktop/scripts/check-ipc-contracts.ts`                         | ドリフト検証ツール      |
| Facade実装        | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 検証対象                |
| パーサー実装      | `apps/desktop/src/main/services/runtime/parseLlmResponseToContent.ts` | 検証対象                |
| 型定義            | `packages/shared/src/types/skillCreator.ts`                           | 検証対象                |

## 統合テスト連携

- Gate 3（テスト全件実行）で統合的な regression を検出する
- Gate 4（IPC契約ドリフト検証）で型変更の波及影響を検出する
- Phase 10 へ渡す blocker をここで出し切る

## 多角的チェック観点

| 観点               | 判断 | 内容                                                                                   |
| ------------------ | ---- | -------------------------------------------------------------------------------------- |
| セキュリティ       | 該当 | LLM応答由来のファイルパスがSkillFileWriterのパス横断防止に委譲されていることを確認     |
| 後方互換性         | 該当 | ExecuteResult型のオプショナルフィールド追加がIPC契約を壊さないことをドリフト検証で確認 |
| エラーハンドリング | 該当 | persist失敗がexecute全体をfailにしない設計がテストで担保されていることを確認           |

## 成果物

| 成果物           | パス                                | 説明                                               |
| ---------------- | ----------------------------------- | -------------------------------------------------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | 品質ゲート結果、セキュリティ確認、互換性確認の記録 |

## 完了条件

- [ ] Gate 1（ESLint）がエラー0件でパスしている
- [ ] Gate 2（TypeScript typecheck）がエラー0件でパスしている
- [ ] Gate 3（テスト全件）が全件成功している
- [ ] Gate 4（IPC契約ドリフト検証）でドリフトが検出されていない（または対処済み）
- [ ] セキュリティ確認（Task 9-2）が全項目 OK
- [ ] 既存テストとの互換性確認（Task 9-3）が全項目 OK
- [ ] 仕様書・成果物名の整合性確認（Task 9-4）が完了している
- [ ] Phase 10 に渡す blocker がないことが確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 10: 最終レビュー](./phase-10-final-review.md)
