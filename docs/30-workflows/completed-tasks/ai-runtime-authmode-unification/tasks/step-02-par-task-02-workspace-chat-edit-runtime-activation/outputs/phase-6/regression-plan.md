# Phase 6 回帰テスト計画: Chat Edit AI Runtime 有効化

## メタ情報

| 項目         | 値                                                         |
| ------------ | ---------------------------------------------------------- |
| Phase        | 6 - テスト拡充（回帰テスト計画）                           |
| タスク ID    | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001                |
| 作成日       | 2026-03-14                                                 |
| 対象ブランチ | step-02-par-task-02-workspace-chat-edit-runtime-activation |

---

## Phase 6 の目的

Phase 5 の実装変更（contextBridge 修正、RuntimeResolver 新規追加、TerminalHandoffBuilder 新規追加、workspacePath 検証追加、stub adapter 除去）に伴い、回帰リスクがある箇所に edge case テストを追加する。

Phase 4 の test-matrix.md で定義された主要テストケース（TC-SEL-01〜06、TC-SEND-01〜08、TC-HAND-01〜04、TC-WS-01〜06、TC-ERR-01〜07、TC-PREL-01〜03、TC-REG-01〜05）を前提とし、それらでカバーされていない境界値・異常系を補完する。

---

## 追加回帰テスト: 複数ファイル context

| TC-ID      | テスト名                                     | 入力条件                                                                         | 期待結果                                                         | 種別   |
| ---------- | -------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------ |
| TC-EDGE-01 | contexts 3ファイル・全件 workspacePath 内    | `contexts` に 3 ファイルを指定し、全ての `filePath` が `workspacePath` 配下      | 全ファイルが許可され処理が正常完了する                           | 境界値 |
| TC-EDGE-02 | contexts 3ファイル・2件目が workspacePath 外 | `contexts` に 3 ファイルを指定し、インデックス 1 のファイルが `workspacePath` 外 | `PERMISSION_DENIED` エラーを返し、他のファイルも処理されない     | 異常系 |
| TC-EDGE-03 | contexts 空配列                              | `contexts: []` を渡す                                                            | `CONTEXT_TOO_LARGE` または実装が定義する適切なエラーコードを返す | 境界値 |
| TC-EDGE-04 | contexts が MAX_FILE_CONTEXTS 上限 + 1 件    | `contexts` のファイル数が許容上限を 1 件超過                                     | 上限超過エラーを返し、処理を開始しない                           | 境界値 |

---

## 追加回帰テスト: large context

| TC-ID      | テスト名                           | 入力条件                                                 | 期待結果                                                                               | 種別   |
| ---------- | ---------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------ |
| TC-EDGE-05 | 合計サイズ = 100KB ちょうど        | 全 contexts ファイルの合計バイト数が 100 × 1024 byte     | 許可される（境界値は許容範囲内）                                                       | 境界値 |
| TC-EDGE-06 | 合計サイズ = 100KB + 1 byte        | 全 contexts ファイルの合計バイト数が 100 × 1024 + 1 byte | `CONTEXT_TOO_LARGE` エラーを返す                                                       | 境界値 |
| TC-EDGE-07 | 1ファイル 99KB + もう1ファイル 2KB | ファイル A が 99KB、ファイル B が 2KB（合計 101KB）      | `CONTEXT_TOO_LARGE` エラーを返す（合計で判定されること）                               | 異常系 |
| TC-EDGE-08 | selection.selectedText が 10KB     | `selection.selectedText` に 10KB の文字列を指定          | selectedText のサイズが合計サイズ計算に含まれ、上限超過時に `CONTEXT_TOO_LARGE` を返す | 異常系 |

---

## 追加回帰テスト: selection なし edge case

| TC-ID      | テスト名                                            | 入力条件                                                   | 期待結果                                                                                         | 種別   |
| ---------- | --------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------ |
| TC-EDGE-09 | selection = undefined vs null の違い                | `selection: undefined` と `selection: null` をそれぞれ渡す | 両方とも「selection なし」として同一の動作をする（差異がないこと）                               | 異常系 |
| TC-EDGE-10 | selectedText = ""（空文字）                         | `selection.selectedText` に空文字列 `""` を渡す            | 空文字列を「選択なし」として扱うか、`INVALID_INPUT` エラーを返すか、いずれかの一貫した動作をする | 境界値 |
| TC-EDGE-11 | selection.startLine > selection.endLine（不正範囲） | `selection.startLine: 10, selection.endLine: 5` を渡す     | `INVALID_INPUT` エラーを返す、または不正な範囲を検出して処理を拒否する                           | 異常系 |

---

## 追加回帰テスト: RuntimeResolver edge case

| TC-ID      | テスト名                                                           | 入力条件                                                                                     | 期待結果                                                                                               | 種別   |
| ---------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------ |
| TC-EDGE-12 | authMode 取得が一時的に失敗した場合のフォールバック                | `AuthModeService.getAuthMode()` がエラーを投げるようモックする                               | 安全なデフォルト（例: `claude-code` handoff モード）にフォールバックし、エラーを呼び出し元に伝播しない | 異常系 |
| TC-EDGE-13 | AuthKeyService が例外を投げた場合の fallback                       | `AuthKeyService.getKey()` が例外を投げるようモックする                                       | エラーをキャッチして `RUNTIME_NOT_AVAILABLE` 相当の応答を返す、または handoff にフォールバックする     | 異常系 |
| TC-EDGE-14 | hybrid mode で integrated が RATE_LIMIT → handoff へフォールバック | authMode を `hybrid` に設定し、integrated runtime が `RATE_LIMIT` エラーを返すようモックする | `RATE_LIMIT` を受けて自動的に terminal handoff モードへフォールバックし、`HandoffResult` を返す        | 異常系 |
| TC-EDGE-15 | hybrid mode で integrated が TIMEOUT → handoff へフォールバック    | authMode を `hybrid` に設定し、integrated runtime がタイムアウトするようモックする           | タイムアウトを検出して自動的に terminal handoff モードへフォールバックし、`HandoffResult` を返す       | 異常系 |

---

## 追加回帰テスト: TerminalHandoffBuilder edge case

| TC-ID      | テスト名                            | 入力条件                                                                        | 期待結果                                                                                      | 種別   |
| ---------- | ----------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------ |
| TC-EDGE-16 | contexts が空の場合の guidance 生成 | `contexts: []` を渡して `TerminalHandoffBuilder.build()` を呼び出す             | ファイル参照なしの guidance テキストが生成され、例外は発生しない                              | 境界値 |
| TC-EDGE-17 | terminalCommand が OS ごとに適切か  | `process.platform` を `darwin` / `linux` / `win32` にそれぞれ設定してビルドする | macOS・Linux では `/usr/bin/env` ベースのコマンド、Windows では適切なコマンド形式が生成される | 互換性 |
| TC-EDGE-18 | contextSummary の最大文字数制限     | `contextSummary` が許容最大文字数を超える長さの文字列を持つ入力を渡す           | `contextSummary` が定義された最大文字数に切り詰め（truncation）されて guidance に含まれる     | 境界値 |

---

## 既実装テストへの回帰影響分析

| テスト対象                                              | 変更の影響                                                                                                                                             | 対応                                                                                                  |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `chatEditHandlers` 既存テスト（TC-REG-01〜05 含む）     | Phase 5 で workspacePath 検証ロジックが追加されたため、`workspacePath` を渡さない既存テストが `PERMISSION_DENIED` で失敗する可能性がある               | 既存テストのセットアップに有効な `workspacePath` を追加するか、モックで検証をバイパスするかを確認する |
| `ChatEditService` 既存テスト                            | Phase 5 で LLMAdapter の DI 構成が変更された場合、コンストラクタ引数の変更に追従して既存テストのモック定義を更新する必要がある                         | 影響ファイルを `grep -rn "ChatEditService" **/*.test.ts` で特定し、コンストラクタ引数を修正する       |
| `ContextBuilder` 既存テスト                             | Phase 5 では ContextBuilder 本体を変更しない設計のため、影響なし                                                                                       | 対応不要（変更後の型チェックで確認）                                                                  |
| `chatEditApi.ts`（Preload）既存テスト（TC-PREL-01〜03） | contextBridge に `handoff` フィールドが追加されるため、既存テストの `contextBridge.exposeInMainWorld` 呼び出し検証が型ミスマッチで失敗する可能性がある | テストの期待値に `handoff` フィールドを追加し、TC-PREL-01〜03 を更新する                              |

---

## 回帰確認順序

```
1. 既実装回帰（TC-REG-01〜05）
   └── chatEditHandlers の既存動作が保たれているか確認

2. edge case テスト（TC-EDGE-01〜18）
   ├── 複数ファイル context (TC-EDGE-01〜04)
   ├── large context (TC-EDGE-05〜08)
   ├── selection なし (TC-EDGE-09〜11)
   ├── RuntimeResolver (TC-EDGE-12〜15)
   └── TerminalHandoffBuilder (TC-EDGE-16〜18)

3. 統合テスト
   └── stub adapter 除去後に実際の IPC チャネル経由で
       end-to-end の動作を確認
```

実行コマンド例:

```bash
# chatEditHandlers 関連テストのみ実行
cd apps/desktop && pnpm vitest run src/main/handlers/chatEditHandlers

# RuntimeResolver テスト実行
cd apps/desktop && pnpm vitest run src/main/services/RuntimeResolver

# TerminalHandoffBuilder テスト実行
cd apps/desktop && pnpm vitest run src/main/services/TerminalHandoffBuilder

# 全テスト一括実行（最終確認）
cd apps/desktop && pnpm vitest run
```

---

## 完了条件

- [ ] TC-EDGE-01〜18 の全テストケースが実装されている
- [ ] 既実装回帰（TC-REG-01〜05）が全て PASS している
- [ ] 既実装テストへの回帰影響分析で特定した修正が完了している
- [ ] 主要な edge case（境界値・異常系）が定義されており、カバレッジ基準（Line 80% / Branch 60% / Function 80%）を満たしている
- [ ] `pnpm vitest run` が全件 PASS する
