# TASK-P0-05: execute-skill-file-writer-integration

## 概要

`execute()` 内で LLM 応答から `SkillGeneratedContent` を抽出し、`SkillFileWriter.persist()` に渡すパスを実装する。現在 `SkillFileWriter` は DI されているが `execute()` 内で一切使われておらず、生成されたスキルコードがファイルシステムに書き出されない。本タスクは LLM 応答の解析、型変換、ファイル書き出し、結果反映の一連のフローを実装する。

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| タスクID   | TASK-P0-05                         |
| タスク種別 | 機能追加                           |
| 優先度     | P0 (Critical Path)                 |
| ステータス | spec_created                       |
| 上流ゲート | TASK-RT-01, TASK-RT-02, TASK-RT-06 |
| 依存タスク | TASK-RT-01, TASK-RT-02, TASK-RT-06 |
| 後続タスク | なし                               |
| 作成日     | 2026-03-29                         |
| 更新日     | 2026-03-29                         |

## 受入基準

| ID   | 基準                                                                      |
| ---- | ------------------------------------------------------------------------- |
| AC-1 | `execute()` が LLM 応答を解析し、コードブロックを抽出できる               |
| AC-2 | 抽出結果が `SkillGeneratedContent` 型に変換される                         |
| AC-3 | `SkillFileWriter.persist()` でファイルシステムに書き出される              |
| AC-4 | 書き出し結果が `ExecuteResult` に含まれる（書き出しファイル一覧、パス等） |
| AC-5 | LLM 応答の解析失敗時にエラーハンドリングが行われる                        |

## スコープ

**含む**:

- `RuntimeSkillCreatorFacade.ts` の `execute()` 内に LLM 応答解析ロジックを追加
- `SkillGeneratedContent` 型の定義または拡張
- `SkillFileWriter.persist()` の呼び出し統合
- `ExecuteResult` 型に書き出し結果フィールドを追加
- LLM 応答のパース（コードブロック抽出）ユーティリティ
- エラーハンドリング
- ユニットテスト

**含まない**:

- `SkillFileWriter` 自体の実装変更
- LLM 応答フォーマットの変更
- ファイル書き出し先ディレクトリの設定 UI
- improve() / verify() への同様の統合

## 依存関係

| 種別       | 参照先                           | 役割                           |
| ---------- | -------------------------------- | ------------------------------ |
| upstream   | TASK-RT-01                       | LLMAdapter エラー伝播（前提）  |
| upstream   | TASK-RT-02                       | エラー通知型（前提）           |
| upstream   | TASK-RT-06                       | Claude Code SDK message 正規化 |
| upstream   | `../requirements-draft.md`       | skill-creator 全体の要件       |
| upstream   | `../root-workflow-pack/index.md` | lane 共通不変条件              |
| downstream | なし                             |                                |

## 現行コードアンカー

| ファイル                                                              | 現状の役割                                | TASK-P0-05 での扱い                        |
| --------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------ |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `execute()` が LLM 呼び出し後に結果未利用 | LLM 応答解析 → SkillFileWriter 連携        |
| `apps/desktop/src/main/services/runtime/SkillFileWriter.ts`           | DI されているが未使用                     | `persist()` の呼び出しを実装               |
| `packages/shared/src/types/skillCreator.ts`                           | 型定義                                    | SkillGeneratedContent / ExecuteResult 拡張 |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| 真の論点             | SkillFileWriter が DI されているのに使われていない。execute の最終段階でファイル永続化が欠落している    |
| 依存関係・責務境界   | LLM 応答の解析は Facade 内ユーティリティ、ファイル書き出しは SkillFileWriter に委譲                     |
| 価値とコストの不均衡 | パーサー + persist 呼び出しで実装可能。既存 DI 基盤を活用するためコスト低                               |
| 改善優先順位         | 1. LLM 応答パーサー 2. SkillGeneratedContent 型 3. persist 呼び出し 4. ExecuteResult 拡張 5. エラー処理 |
| 4条件評価            | 価値性: 高（コア機能）/ 実現性: 高（DI 済み）/ 整合性: 既存パターン / 運用性: テスト可能                |

## ディレクトリ構成

```text
step-09-par-task-p0-05-execute-skill-file-writer-integration/
├── index.md
├── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage-check.md
├── phase-8-refactoring.md
├── phase-9-quality-assurance.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
├── phase-13-pr-creation.md
└── outputs/
```

## 実装者向けクイックガイド

### 着手条件

- TASK-RT-01 / TASK-RT-02 が完了している（LLMAdapter エラー伝播が前提）
- `RuntimeSkillCreatorFacade.ts` の `execute()` メソッドを読了している
- `SkillFileWriter.ts` の `persist()` メソッドの引数と戻り値を読了している
- `SkillGeneratedContent` 型の現状を読了している

### 想定変更ポイント

- `packages/shared/src/types/skillCreator.ts` — `SkillGeneratedContent` 型拡張、`ExecuteResult` に書き出し結果フィールド追加
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — `execute()` 内に LLM 応答解析 → `persist()` 呼び出し追加
- LLM 応答パーサーユーティリティ（新規 or 既存拡張）
- テストファイル — パーサー / persist 連携テスト

### 非対象

- SkillFileWriter 自体の変更
- LLM 応答フォーマット変更
- improve() / verify() への統合

### 完了イメージ

- `execute()` が LLM 応答からコードブロックを抽出し、`SkillGeneratedContent` に変換する
- `SkillFileWriter.persist()` が呼ばれ、ファイルが書き出される
- `ExecuteResult` に書き出しファイルパス一覧が含まれる
- パース失敗時にエラーレスポンスが返る

### 並列実行メモ

- TASK-P0-05 は TASK-RT-05 / TASK-P0-06 と並列実行可能（shared type のマージ競合に注意）
- TASK-RT-01 / TASK-RT-02 への依存があるため、着手は RT タスク完了後

## Phase 一覧

- [phase-1-requirements.md](./phase-1-requirements.md)
- [phase-2-design.md](./phase-2-design.md)
- [phase-3-design-review.md](./phase-3-design-review.md)
- [phase-4-test-creation.md](./phase-4-test-creation.md)
- [phase-5-implementation.md](./phase-5-implementation.md)
- [phase-6-test-expansion.md](./phase-6-test-expansion.md)
- [phase-7-coverage-check.md](./phase-7-coverage-check.md)
- [phase-8-refactoring.md](./phase-8-refactoring.md)
- [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
- [phase-10-final-review.md](./phase-10-final-review.md)
- [phase-11-manual-test.md](./phase-11-manual-test.md)
- [phase-12-documentation.md](./phase-12-documentation.md)
- [phase-13-pr-creation.md](./phase-13-pr-creation.md)
