# Phase 11: 手動テスト

## メタ情報

| 項目       | 値                                    |
| ---------- | ------------------------------------- |
| Phase      | 11                                    |
| 機能名     | execute-skill-file-writer-integration |
| タスクID   | TASK-P0-05                            |
| タスク種別 | 機能追加                              |
| UI task    | No                                    |
| 作成日     | 2026-03-30                            |

## 目的

Electron アプリ上で `execute()` → LLM応答解析 → `SkillFileWriter.persist()` → ファイル書き出しの一連のフローを手動で検証する。

## UI task 判定

| 項目               | 判定     | 理由                                                            |
| ------------------ | -------- | --------------------------------------------------------------- |
| UI task            | **No**   | Main Process 層の変更のみ。UI変更なし                           |
| スクリーンショット | **不要** | NON_VISUAL 判定。視覚的な変更がないためスクリーンショット対象外 |
| 検証方法           | DevTools | DevToolsコンソール + ファイルシステム確認で検証                 |

> **NON_VISUAL**: UI 変更を伴わない Main Process 層の機能追加のため、Apple UI/UX 視覚検証およびスクリーンショットは不要。

## 実行タスク

### Task 11-1: テスト環境準備

1. Electron アプリをビルド: `pnpm --filter @repo/desktop build`
2. 開発モードで起動: `pnpm --filter @repo/desktop dev`
3. DevTools を開く（`Cmd+Option+I`）
4. Console タブで IPC 通信のログを確認可能な状態にする

### Task 11-2: テストケース実行

#### TC-01: 正常系 — execute呼び出し → LLM応答にコードブロック含む → ファイル書き出し成功

| 項目     | 内容                                                                                                                                                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 前提条件 | `SkillFileWriter` が DI 済み。LLM Adapter が正常応答を返す設定                                                                                                                                                                 |
| 操作手順 | 1. スキル作成画面で execute を実行<br>2. LLM がコードブロックを含む応答を返す                                                                                                                                                  |
| 期待結果 | - `parseLlmResponseToContent()` がコードブロックを抽出<br>- `SkillGeneratedContent` 型に変換<br>- `SkillFileWriter.persist()` が呼ばれファイルが生成<br>- `ExecuteResult.persistResult` に `skillPath` と `files[]` が含まれる |
| 検証方法 | - DevTools Console でログ確認<br>- ファイルシステムで書き出し先ディレクトリを確認<br>- 生成ファイルの内容がLLM応答のコードブロックと一致                                                                                       |
| 判定     | -                                                                                                                                                                                                                              |

#### TC-02: LLM応答にコードブロックなし → persistResult が null

| 項目     | 内容                                                                                                                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 前提条件 | `SkillFileWriter` が DI 済み。LLM Adapter がコードブロックを含まない応答を返す設定                                                                                                                            |
| 操作手順 | 1. スキル作成画面で execute を実行<br>2. LLM がテキストのみの応答を返す                                                                                                                                       |
| 期待結果 | - `parseLlmResponseToContent()` が `null` を返す<br>- `persist()` が呼ばれない<br>- `ExecuteResult.persistResult` が `undefined`<br>- `ExecuteResult.persistError` が `undefined`<br>- execute 自体は正常終了 |
| 検証方法 | - DevTools Console で persist 関連のログが出力されないことを確認<br>- `ExecuteResult` の内容を確認                                                                                                            |
| 判定     | -                                                                                                                                                                                                             |

#### TC-03: SkillFileWriter 未設定 → persist スキップ（graceful degradation）

| 項目     | 内容                                                                                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 前提条件 | `SkillFileWriter` が DI されていない状態（`skillFileWriter` が `undefined`）                                                                                         |
| 操作手順 | 1. SkillFileWriter 未設定でスキル作成画面の execute を実行<br>2. LLM がコードブロック含む応答を返す                                                                  |
| 期待結果 | - `console.warn` でスキップログが出力される（MR-01対応）<br>- `persist()` が呼ばれない<br>- execute 自体は正常終了<br>- `ExecuteResult.persistResult` が `undefined` |
| 検証方法 | - DevTools Console で `console.warn` ログを確認<br>- execute が成功ステータスで完了していることを確認                                                                |
| 判定     | -                                                                                                                                                                    |

#### TC-04: persist 失敗（権限エラー等） → persistError に記録、execute 自体は success

| 項目     | 内容                                                                                                                                                                                                                             |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 前提条件 | `SkillFileWriter` が DI 済み。書き出し先ディレクトリが読み取り専用等で persist が失敗する設定                                                                                                                                    |
| 操作手順 | 1. 書き出し先の権限を変更（`chmod 444`）またはモックで persist エラーを発生させる<br>2. スキル作成画面で execute を実行                                                                                                          |
| 期待結果 | - `persist()` が例外をスローまたはエラーを返す<br>- `ExecuteResult.persistError` にエラー情報が記録される<br>- `ExecuteResult.persistResult` が `undefined`<br>- execute 全体は success ステータスで完了（graceful degradation） |
| 検証方法 | - DevTools Console でエラーログを確認<br>- `ExecuteResult` の `persistError` フィールドにエラーメッセージが含まれることを確認<br>- execute のステータスが success であることを確認                                               |
| 判定     | -                                                                                                                                                                                                                                |

### Task 11-3: 発見事項の記録

テスト実行中に発見されたスコープ外の問題・改善点を `outputs/phase-11/discovered-issues.md` に記録する。

記録テンプレート:

| #   | 発見事項 | 重要度 | スコープ内/外 | 対応方針 |
| --- | -------- | ------ | ------------- | -------- |
| 1   | -        | -      | -             | -        |

> 発見事項が0件の場合も「0件」と明記して出力する。

## 参照資料

| 資料名           | パス                                      | 説明             |
| ---------------- | ----------------------------------------- | ---------------- |
| タスク概要       | `index.md`                                | AC定義・スコープ |
| Phase 10 結果    | `outputs/phase-10/final-review-result.md` | 最終レビュー判定 |
| Phase 3 レビュー | `phase-3-design-review.md`                | MR-01 指摘       |
| Phase 5 実装     | `phase-5-implementation.md`               | 実装内容         |

## 統合テスト連携

| 観点                | 内容                                                          |
| ------------------- | ------------------------------------------------------------- |
| Phase 10 からの引継 | 最終レビューで指摘された追加確認事項をテストケースに反映      |
| Phase 12 への引継   | 発見事項を未タスク候補として Phase 12 Task 4 に引き継ぐ       |
| NON_VISUAL判定      | UI task: No のため、Phase 12 でスクリーンショット再判定は不要 |

## 成果物

| 成果物         | パス                                     | 説明               |
| -------------- | ---------------------------------------- | ------------------ |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | TC-01〜04 の判定   |
| 発見事項       | `outputs/phase-11/discovered-issues.md`  | スコープ外問題一覧 |

### `outputs/phase-11/manual-test-result.md` の構成

```markdown
# Phase 11: 手動テスト結果

## テスト環境

| 項目     | 値  |
| -------- | --- |
| OS       | -   |
| Node.js  | -   |
| Electron | -   |
| ビルド   | -   |

## テストケース結果

| TC    | テスト名                                | 判定 | 備考 |
| ----- | --------------------------------------- | ---- | ---- |
| TC-01 | 正常系（コードブロック含む → 書出成功） | -    | -    |
| TC-02 | コードブロックなし → persist スキップ   | -    | -    |
| TC-03 | SkillFileWriter 未設定 → graceful skip  | -    | -    |
| TC-04 | persist 失敗 → persistError 記録        | -    | -    |

## UI / 視覚検証

NON_VISUAL: UI 変更なし。スクリーンショット対象外。

## 総合判定

| 判定     | 結果 |
| -------- | ---- |
| **総合** | -    |
```

## 完了条件

- [ ] TC-01〜TC-04 の全テストケースが実行されている
- [ ] 各テストケースの判定（PASS/FAIL）が記録されている
- [ ] NON_VISUAL 判定が明記されている（スクリーンショット不要）
- [ ] 発見事項が記録されている（0件でも明記）
- [ ] `outputs/phase-11/manual-test-result.md` が作成されている
- [ ] `outputs/phase-11/discovered-issues.md` が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 12: ドキュメント更新
