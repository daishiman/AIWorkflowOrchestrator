# Phase 10: 最終レビュー - GoogleAdapter system_instruction 対応

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 10                                |
| 機能名   | google-adapter-system-instruction |
| 作成日   | 2026-03-23                        |
| タスクID | TASK-LLM-MOD-03                   |
| 依存     | phase-9-quality-assurance.md      |

## 目的

多角的な観点から実装の品質・整合性を検証し、PASS/MINOR/MAJOR/CRITICAL の判定を行う。

## 実行タスク

### Task 10-1: 受け入れ基準の最終確認

| AC番号   | 内容                                                              | 確認方法                                                                    | 結果   |
| -------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------- | ------ |
| AC-05    | systemPrompt を `system_instruction` フィールドで送信する         | `ADP-012-SI-01` テスト PASS                                                 | 要確認 |
| AC-06    | systemPrompt なしの場合 `system_instruction` を省略する           | `ADP-012-SI-02` テスト PASS                                                 | 要確認 |
| AC-03-01 | `formatContents` が `contents` に systemPrompt を含めない         | `ADP-012-SI-01` の `capturedBody.contents` 検証 PASS                        | 要確認 |
| AC-03-02 | `buildRequestBody` が systemPrompt ありの場合に正しいボディを返す | `ADP-012-SI-03` テスト PASS                                                 | 要確認 |
| AC-03-03 | `buildRequestBody` が systemPrompt なしの場合に正しいボディを返す | `ADP-012-SI-02` テスト PASS                                                 | 要確認 |
| AC-03-04 | `sendChat` が `buildRequestBody` を使用                           | コードレビュー: `JSON.stringify(this.buildRequestBody(request))` の存在確認 | 要確認 |
| AC-03-05 | `streamChat` が `buildRequestBody` を使用                         | コードレビュー: `JSON.stringify(this.buildRequestBody(request))` の存在確認 | 要確認 |
| AC-07    | `pnpm typecheck` が PASS                                          | Phase 9 の typecheck 結果                                                   | 要確認 |

### Task 10-2: セキュリティ・アーキテクチャ確認

| チェック項目                                                                                | 判定                                                                                                             |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `system_instruction` に渡す `systemPrompt` がサニタイズされているか                         | `BaseLLMAdapter` / IPC 層でのバリデーションが既存の場合は OK。本タスクでは追加バリデーション不要（IPC 層の責務） |
| `Record<string, unknown>` 型への代入で型アサーション（`as`）が使用されていないか（P19対策） | 要確認                                                                                                           |
| non-null assertion（`!`）が新規追加されていないか（P48・P52対策）                           | 要確認                                                                                                           |
| `buildRequestBody` が `private` であり外部から直接アクセスできないか                        | 要確認                                                                                                           |
| `baseUrl` の変更（`v1` → `v1beta`）が既存のカスタム設定 `config?.baseUrl` を破壊しないか    | `config?.baseUrl ??` の優先順位確認                                                                              |

### Task 10-3: 設計原則準拠確認

| 設計原則          | 確認内容                                                                                                    | 判定   |
| ----------------- | ----------------------------------------------------------------------------------------------------------- | ------ |
| SRP（単一責務）   | `formatContents` はメッセージ変換のみ、`buildRequestBody` はボディ構築のみ                                  | 要確認 |
| DRY（重複排除）   | `sendChat` と `streamChat` の両方で重複していたリクエストボディ構築が `buildRequestBody` に統合されているか | 要確認 |
| DIP（依存性逆転） | `sendChat` / `streamChat` のシグネチャが変更されていないか（`BaseLLMAdapter` インターフェース互換）         | 要確認 |

### Task 10-4: 変更ファイルの最終コードレビュー

**確認コマンド**:

```bash
# 変更内容の確認
git diff HEAD -- apps/desktop/src/main/adapters/llm/GoogleAdapter.ts
git diff HEAD -- apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts
```

**GoogleAdapter.ts チェックリスト**:

- [ ] `baseUrl` のデフォルト値が `v1beta` になっている
- [ ] `formatContents` に systemPrompt 挿入ロジックが存在しない
- [ ] `buildRequestBody` が `formatContents` の前後に追加されている（または適切な位置に配置されている）
- [ ] `sendChat` の `body` が `JSON.stringify(this.buildRequestBody(request))` を使用している
- [ ] `streamChat` の `body` が `JSON.stringify(this.buildRequestBody(request))` を使用している
- [ ] 旧ワークアラウンドのコメントが削除されている

**GoogleAdapter.test.ts チェックリスト**:

- [ ] 全 MSW モック URL が `v1beta` を使用している
- [ ] `"should prepend systemPrompt as user message"` が削除・置換されている
- [ ] `ADP-012-SI-01`〜`ADP-012-SI-03`、`ADP-STREAM-SI-01`、`T6-01`〜`T6-03` が追加されている

### Task 10-5: 未タスク候補の検出

本タスクのスコープ外で発見した改善点を記録する。

| 検出事項                                                                                            | 優先度 | 対応方針   |
| --------------------------------------------------------------------------------------------------- | ------ | ---------- |
| `buildRequestBody` の戻り値型の厳密化（`GeminiRequestBody` 型の定義）                               | 低     | 未タスク化 |
| `GeminiGenerateContentResponse` インターフェースの `usageMetadata.totalTokenCount` が optional 候補 | 低     | 未タスク化 |

## 判定

**判定結果** (Phase 10 実行時に記入): **\_**

### 判定基準

| 判定     | 条件                           | 対応                               |
| -------- | ------------------------------ | ---------------------------------- |
| PASS     | 全 AC を満たし、重大な問題なし | Phase 11 へ                        |
| MINOR    | 軽微な指摘あり（機能影響なし） | 未タスク仕様書に変換後 Phase 11 へ |
| MAJOR    | 設計・実装に問題あり           | 影響範囲に応じて Phase 1-5 へ戻る  |
| CRITICAL | 要件を満たしていない           | Phase 1 へ戻り要件再確認           |

## 統合テスト連携【必須】

最終レビューで統合テスト結果を確認:

| レビュー項目 | 確認内容                  | 結果       |
| ------------ | ------------------------- | ---------- |
| 全テスト結果 | ユニット/統合/E2E全て成功 | {{RESULT}} |
| カバレッジ   | 基準達成                  | {{RESULT}} |
| 接続テスト   | フロント/バック接続成功   | {{RESULT}} |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 性能要件がある場合                 | `aiworkflow-requirements: architecture-*.md` |

## 参照資料

| 資料名     | パス                           | 内容                   |
| ---------- | ------------------------------ | ---------------------- |
| 要件定義書 | `phase-1-requirements.md`      | AC定義                 |
| 設計書     | `phase-2-design.md`            | 変更仕様               |
| 品質保証   | `phase-9-quality-assurance.md` | テスト・型チェック結果 |

## 成果物

| 成果物       | パス                                     | 説明           |
| ------------ | ---------------------------------------- | -------------- |
| 最終レビュー | `phase-10-final-review.md`（本ファイル） | 多角的品質判定 |

## 完了条件

- [ ] 全 AC の充足が確認されている
- [ ] セキュリティ・アーキテクチャチェックが完了している
- [ ] 設計原則準拠が確認されている
- [ ] 変更ファイルのコードレビューが完了している
- [ ] 未タスク候補が記録されている
- [ ] PASS/MINOR/MAJOR/CRITICAL の判定が記録されている
- [ ] MINOR 以上の指摘は未タスク仕様書に変換されている（MINOR でも省略不可）
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 11: 手動テスト
