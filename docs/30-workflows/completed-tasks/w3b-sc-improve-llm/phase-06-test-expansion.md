# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                 |
| ------ | ------------------ |
| Phase  | 6                  |
| 機能名 | w3b-sc-improve-llm |
| 作成日 | 2026-03-22         |

## 目的

Phase 5 実装後のカバレッジ不足箇所を特定し、エラー系テストを追加する。存在しないスキル名指定時と SKILL.md 読み込み失敗時のエラーテストを重点的に追加する。

## 実行タスク

1. カバレッジレポートの確認（未カバー分岐の特定）
2. エラー系テストの追加
   - E-1: 存在しないスキル名を指定した場合 → `{ success: false, error: { code: "SKILL_NOT_FOUND" } }` を返す（IPC wrapper 形式、P60対策）
   - E-2: SKILL.md 読み込み失敗時（`FileNotFoundError`）→ `{ success: false, error: { code: "READ_ERROR" } }` を返す（IPC wrapper 形式）
   - E-3: フィードバック文字列が空文字列の場合 → `{ success: false, error: { code: "VALIDATION_ERROR" } }` を返す（P42対策: trim()チェック）
   - E-4: フィードバック文字列がスペースのみの場合 → `{ success: false, error: { code: "VALIDATION_ERROR" } }` を返す（P42対策）
   - E-5: LLM タイムアウト時 → `{ success: false, error: { code: "LLM_ERROR" } }` を返す
   - E-9: `ReadonlySkillError` 発生時（`~/.claude/skills/` 配下のスキルへの適用試行）→ `{ success: false, error: { code: "READONLY_SKILL" } }` を返す（Phase 3 レビュー指摘の未実装ケース）
   - E-13: skillName が空文字列の場合 → `{ success: false, error: { code: "VALIDATION_ERROR" } }` を返す（P42対策）
   - E-14: skillName がスペースのみの場合 → `{ success: false, error: { code: "VALIDATION_ERROR" } }` を返す（P42対策）
3. 境界値テストの追加
   - E-6: 改善提案が 0 件の場合（LLM が improvements: [] を返した）→ `{ success: true, data: { suggestions: [] } }` で正常終了
   - E-7: 改善提案が複数件の場合（全件返却の確認）
4. before テキスト不一致時のテスト
   - E-8: applyImprovement で before が SKILL.md に存在しない場合 → エラーにしない（スキップカウントが増える）
5. graceful degradation テストの追加
   - E-10: `llmAdapter` 未注入時はスタブレスポンスを返す（plan() の graceful degradation と同パターン）
   - E-11: `resourceLoader` 未注入時はスタブレスポンスを返す
6. terminal_handoff 分岐テストの追加
   - E-12: `resolveDecision()` が `terminal_handoff` を返した場合、LLM と SkillFileManager が呼ばれない
7. buildImproveUserPrompt 単体テストの追加
   - E-15: buildImproveUserPrompt(feedback, skillContent) がフィードバックと SKILL.md 内容を正しくテンプレートに埋め込むことを検証する

## 参照資料

| 資料名                             | パス                                                                                         | 説明                                         |
| ---------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Phase 5 実装後のカバレッジレポート | 実行時に生成                                                                                 | 未カバー分岐の特定                           |
| Phase 4 テストファイル             | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts` | 既存テストケース                             |
| 既知の落とし穴                     | `.claude/rules/06-known-pitfalls.md`                                                         | P42: trim() バリデーション                   |
| コード品質ルール                   | `.claude/rules/02-code-quality.md`                                                           | カバレッジ基準: Line 80%以上、Branch 60%以上 |

## 実行手順

1. Phase 5 完了後のカバレッジレポートを確認し、未カバー分岐を特定する
2. E-1〜E-5 のエラー系テストを追加する
3. E-6〜E-7 の境界値テストを追加する
4. E-8 の before 不一致テストを追加する
5. E-9 の ReadonlySkillError テストを追加する
6. E-10〜E-11 の graceful degradation テストを追加する
7. E-12 の terminal_handoff 分岐テストを追加する
8. E-13〜E-14 の skillName バリデーションテストを追加する（P42対策）
9. E-15 の buildImproveUserPrompt 単体テストを追加する
10. 全テストを実行し、Green 状態を確認する

## 統合テスト連携

| 判定項目               | 基準 | 結果       |
| ---------------------- | ---- | ---------- |
| ユニットテストLine     | 80%+ | {{RESULT}} |
| ユニットテストBranch   | 60%+ | {{RESULT}} |
| ユニットテストFunction | 80%+ | {{RESULT}} |

## 多角的チェック観点

| 観点               | 適用判断 | 確認内容                                                                                                 |
| ------------------ | -------- | -------------------------------------------------------------------------------------------------------- |
| セキュリティ       | 該当     | P42準拠3段バリデーション（skillName, feedback）                                                          |
| エラーハンドリング | 該当     | 6種エラーコード（SKILL_NOT_FOUND, READ_ERROR, VALIDATION_ERROR, PARSE_ERROR, LLM_ERROR, READONLY_SKILL） |
| IPC通信            | 該当     | IPC wrapper形式 `{ success: boolean, data?, error? }`（P60対策）                                         |
| アーキテクチャ     | 該当     | DI設計（SkillFileManager必須注入）、plan()との共通化                                                     |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断 | 確認内容                             |
| -------------------- | -------- | ------------------------------------ |
| バックエンド（Main） | 該当     | RuntimeSkillCreatorFacade サービス層 |
| IPC通信              | 該当     | skill-creator:improve-skill ハンドラ |
| Preload/セキュリティ | 該当     | improveSkillWithFeedback API         |

## 成果物

| 成果物                 | パス                                                                                         | 説明           |
| ---------------------- | -------------------------------------------------------------------------------------------- | -------------- |
| 拡充済みテストファイル | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts` | E-1〜E-15 追加 |

## 完了条件

- [ ] E-1（スキル不存在: `SKILL_NOT_FOUND` の IPC wrapper 形式を確認）テストを追加した（P60対策）
- [ ] E-2（SKILL.md 読み込み失敗: `READ_ERROR` の IPC wrapper 形式を確認）テストを追加した（P60対策）
- [ ] E-3（空文字フィードバック: `VALIDATION_ERROR` の IPC wrapper 形式を確認）テストを追加した（trim()バリデーション確認）
- [ ] E-4（スペースのみフィードバック: `VALIDATION_ERROR`）テストを追加した（P42対策）
- [ ] E-5（LLM タイムアウト: `LLM_ERROR`）テストを追加した
- [ ] E-6（提案0件: 正常終了 `{ success: true, data: { suggestions: [] } }`）テストを追加した
- [ ] E-7（提案複数件: 全件返却）テストを追加した
- [ ] E-8（before 不一致: スキップカウントが増えることを確認）テストを追加した
- [ ] E-9（`ReadonlySkillError`: `READONLY_SKILL` エラー）テストを追加した（Phase 3 レビュー指摘）
- [ ] E-10（`llmAdapter` 未注入時のスタブレスポンス）テストを追加した
- [ ] E-11（`resourceLoader` 未注入時のスタブレスポンス）テストを追加した
- [ ] E-12（`terminal_handoff` 分岐: LLM と SkillFileManager が呼ばれないことを確認）テストを追加した
- [ ] E-13（skillName空文字: VALIDATION_ERROR）テストを追加した（P42対策）
- [ ] E-14（skillNameスペースのみ: VALIDATION_ERROR）テストを追加した（P42対策）
- [ ] E-15（buildImproveUserPrompt単体テスト）を追加した
- [ ] 全テストが Green の状態になった
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 7: カバレッジ確認
