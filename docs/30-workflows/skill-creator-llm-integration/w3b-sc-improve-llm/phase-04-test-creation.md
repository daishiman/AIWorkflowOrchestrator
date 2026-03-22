# Phase 4: テスト作成

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 4                      |
| タスクID | TASK-SC-05-IMPROVE-LLM |
| 作成日   | 2026-03-22             |

## 目的

improve() の LLM 実装に対するテストケースを設計・実装する。LLM モックテスト、改善提案 JSON Schema テスト、SKILL.md 読み込みテストを網羅する。

## 実行タスク

1. テストファイル作成
   - `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts`
2. テストケース設計（TDD: テストファースト）
   - I-1: フィードバックと SKILL.md を渡すと LLM が呼ばれ改善提案が返る（正常系）
   - I-2: 改善提案 JSON が section/before/after/reason を含む（Schema検証）
   - I-3: SKILL.md が正常に読み込まれ user プロンプトに含まれる
   - I-4: LLM が不正 JSON を返した場合はパースエラーを返す
   - I-5: improve-prompt.md の内容が system プロンプトとして使用される
3. LLM モック設計
   - `AnthropicAdapter.complete()` または相当するメソッドをモック化
   - 正常レスポンス（JSON 改善提案）と異常レスポンス（不正 JSON）の両パターン
4. SkillFileManager モック設計
   - `readSkillFile()` の成功・失敗パターン
5. 既存テストとの命名規則整合性確認
   - 同ディレクトリの既存テストファイルのインポートパスを参照（P63対策）

## 参照資料

- Phase 2 設計書（JSON Schema、プロンプト設計）
- Phase 3 設計レビュー報告書
- `apps/desktop/src/main/services/runtime/__tests__/` 配下の既存テスト
- `.claude/rules/02-code-quality.md`（TDD 原則）
- `.claude/rules/06-known-pitfalls.md`（P9: テスト間状態リーク、P63: インポートパス）

## 成果物

- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts`
- テストケース一覧（I-1〜I-5）

## 完了条件

- [ ] テストファイルを作成した
- [ ] I-1（正常系 LLM 呼び出し）テストを実装した
- [ ] I-2（JSON Schema 検証）テストを実装した
- [ ] I-3（SKILL.md 読み込み確認）テストを実装した
- [ ] I-4（不正 JSON エラーハンドリング）テストを実装した
- [ ] I-5（system プロンプト確認）テストを実装した
- [ ] `beforeEach` でモック状態をリセットした（P9対策）
- [ ] インポートパスを既存テストから確認して記述した（P63対策）
- [ ] テスト実行は Red（未実装）状態で終わることを確認した

## 次のPhase

Phase 5: 実装
