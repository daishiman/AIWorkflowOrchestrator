# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 6                                  |
| Phase名    | テスト拡充                         |
| タスクID   | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 |
| 前提Phase  | Phase 5（実装）                    |
| 後続Phase  | Phase 7（カバレッジ確認）          |
| ステータス | completed                          |
| 作成日     | 2026-03-13                         |
| 更新日     | 2026-03-16                         |
| 機能名     | skill-docs-runtime-integration     |

## 目的

Phase 4-5 で作成・Green 化した 23 テストケースに対し、エッジケース・回帰テスト・セキュリティ回帰テストを追加して、カバレッジの gap を埋め、堅牢性を高める。

## 実行タスク

- T-6-1: 入力境界・特殊文字・同時実行のエッジケーステストを追加する
- T-6-2: timeout/rate-limit/API key 失効の失敗パス回帰を追加する
- T-6-3: CapabilityResolver の判定境界を追加検証する
- T-6-4: IPC セキュリティ（sender/P42/パストラバーサル）回帰を追加する

### T-6-1: エッジケーステスト追加

入力値の境界条件と並行実行のテストを追加する。

| テストケースID | テスト内容                                                       | 期待結果                                            |
| -------------- | ---------------------------------------------------------------- | --------------------------------------------------- |
| T-6-1-01       | 空文字列の prompt を `query()` に渡す                            | code: 5001（バリデーションで弾かれる）              |
| T-6-1-02       | 超長文（10,000文字超）の prompt を `query()` に渡す              | 正常処理または適切なサイズ制限エラー                |
| T-6-1-03       | 特殊文字（SQL injection パターン、XSS パターン）を prompt に含む | サニタイズされた状態で処理される                    |
| T-6-1-04       | Unicode 特殊文字（絵文字、CJK、RTL）を prompt に含む             | 正常にエンコード・処理される                        |
| T-6-1-05       | 同時に 3 リクエストを concurrent で送信する                      | 全て正常に処理されるか、適切なキュー/拒否が行われる |
| T-6-1-06       | `null` / `undefined` を prompt として渡す                        | P42 3段バリデーションで拒否される                   |

### T-6-2: 失敗パスの回帰テスト

リトライシナリオと連続失敗のテストを追加する。

| テストケースID | テスト内容                                   | 期待結果                                                   |
| -------------- | -------------------------------------------- | ---------------------------------------------------------- |
| T-6-2-01       | 429 が 3 回連続で発生する                    | 3 回とも `retryable: true` + rate-limit guidance を返す    |
| T-6-2-02       | 5xx → retry → success のシーケンス           | 最終的に `success: true` のレスポンスが返る                |
| T-6-2-03       | timeout → retry → timeout の連続タイムアウト | 2 回とも `retryable: true` + timeout guidance を返す       |
| T-6-2-04       | 5xx → 429 → success の複合エラーシーケンス   | 各エラーで適切な error code を返し、最終的に success       |
| T-6-2-05       | API key 有効 → リクエスト中に API key 無効化 | 進行中リクエストは 2002 エラー、次回は isAvailable() false |

### T-6-3: CapabilityResolver 境界テスト

API key 状態の遷移に伴う capability 変化をテストする。

| テストケースID | テスト内容                                         | 期待結果                            |
| -------------- | -------------------------------------------------- | ----------------------------------- |
| T-6-3-01       | API key 有効 → 無効化 → resolve() の再実行         | `full` → `guidance-only` に遷移する |
| T-6-3-02       | API key 未設定 → 設定 → resolve() の再実行         | `guidance-only` → `full` に遷移する |
| T-6-3-03       | LLM プロバイダがダウン → 復旧 → resolve() の再実行 | `degraded` → `full` に遷移する      |

### T-6-4: IPC セキュリティ回帰テスト

4層セキュリティの各層について回帰テストを追加する。

| テストケースID | テスト内容                                                   | 期待結果                               |
| -------------- | ------------------------------------------------------------ | -------------------------------------- |
| T-6-4-01       | sender 偽装（異なる webContents.id からの呼び出し）          | IPC 呼び出しが拒否される               |
| T-6-4-02       | パストラバーサル攻撃（`../` を含むスキル名）                 | バリデーションエラーが返る             |
| T-6-4-03       | P42 バリデーション: スペースのみの文字列（`"   "`）          | `.trim() === ""` で拒否される          |
| T-6-4-04       | P42 バリデーション: 型不一致（数値を文字列パラメータに渡す） | `typeof` チェックで拒否される          |
| T-6-4-05       | エラーレスポンスに内部パス情報が含まれないことを確認         | エラーメッセージがサニタイズされている |

## テスト追加集計

| カテゴリ              | ケース数 |
| --------------------- | -------- |
| エッジケース（T-6-1） | 6        |
| 回帰テスト（T-6-2）   | 5        |
| 境界テスト（T-6-3）   | 3        |
| セキュリティ（T-6-4） | 5        |
| **合計追加**          | **19**   |
| Phase 4 からの累計    | **42**   |

## 参照資料

### Phase 依存

| 参照資料          | パス                        | 内容                           |
| ----------------- | --------------------------- | ------------------------------ |
| Phase 5（実装）   | `phase-5-implementation.md` | 実装済みコードを確認する       |
| Phase 4（テスト） | `phase-4-test-creation.md`  | 既存 23 テストケースを確認する |

### ソースコード

| 参照資料           | パス                                                                  | 内容                               |
| ------------------ | --------------------------------------------------------------------- | ---------------------------------- |
| LLMDocQueryAdapter | `apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts`          | Adapter のエラーハンドリングを確認 |
| CapabilityResolver | `apps/desktop/src/main/services/skill/SkillDocsCapabilityResolver.ts` | 3 パス判定ロジックを確認           |
| IPC ハンドラ       | `apps/desktop/src/main/ipc/handlers/skill-docs.ts`                    | セキュリティ層の実装を確認         |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                   | パス                                                                                                              | 内容                                           |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| api-ipc-agent              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-details.md`                                      | Skill Docs IPC 正本                            |
| architecture-overview      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                                      | registerSkillDocsHandlers の構成正本           |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | Skill Docs 関連未タスクと public contract 正本 |
| security-electron-ipc      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-advanced.md`                             | sender、path validation、error envelope の正本 |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                              | TASK-9I の完了履歴と未タスク正本               |

## 実行手順

### ステップ1: Phase 5 の Green 状態確認

Phase 4-5 の 23 テストケースが全て Green であることを確認する。`cd apps/desktop && pnpm vitest run` で確認する。

### ステップ2: T-6-1 から T-6-4 を順に追加実装

各テストグループを既存テストファイルに追加する。テスト追加後に即時実行して Green を確認する。

- T-6-1: LLMDocQueryAdapter.test.ts と SkillDocGenerator.queryFn.test.ts に追加
- T-6-2: LLMDocQueryAdapter.test.ts に追加
- T-6-3: SkillDocsCapabilityResolver.test.ts に追加
- T-6-4: skill-docs-handlers.test.ts に追加

### ステップ3: system spec との整合確認

security-electron-ipc-advanced.md の要件が T-6-4 のセキュリティ回帰テストで検証されていることを確認する。

### ステップ4: 全テスト Green + カバレッジ差分確認

42 テストケース（Phase 4 の 23 + Phase 6 の 19）が全て Green であることを確認し、カバレッジレポートの差分を Phase 7 への入力として記録する。

## 統合テスト連携

- T-6-2 の回帰テストは LLMDocQueryAdapter のリトライ境界を検証する
- T-6-3 の境界テストは CapabilityResolver の状態遷移を検証する
- T-6-4 のセキュリティ回帰テストは IPC ハンドラの 4層セキュリティを横断的に検証する
- Phase 7 でカバレッジ gap が検出された場合、本 Phase に戻って追加テストを実装する

## 成果物

| 成果物                     | パス                                                                                 | 内容                               |
| -------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------- |
| 回帰計画                   | `outputs/phase-6/regression-plan.md`                                                 | 追加回帰と確認順序を整理する       |
| Adapter テスト（拡充）     | `apps/desktop/src/main/services/skill/__tests__/LLMDocQueryAdapter.test.ts`          | T-6-1, T-6-2 のテスト追加          |
| queryFn テスト（拡充）     | `apps/desktop/src/main/services/skill/__tests__/SkillDocGenerator.queryFn.test.ts`   | T-6-1 のエッジケース追加           |
| Capability テスト（拡充）  | `apps/desktop/src/main/services/skill/__tests__/SkillDocsCapabilityResolver.test.ts` | T-6-3 の境界テスト追加             |
| IPC ハンドラテスト（拡充） | `apps/desktop/src/main/ipc/__tests__/skill-docs-handlers.test.ts`                    | T-6-4 のセキュリティ回帰テスト追加 |

## 完了条件

- [ ] エッジケーステスト（T-6-1: 6件）が追加され全て Green である
- [ ] 回帰テスト（T-6-2: 5件）が追加され全て Green である
- [ ] 境界テスト（T-6-3: 3件）が追加され全て Green である
- [ ] セキュリティ回帰テスト（T-6-4: 5件）が追加され全て Green である
- [ ] 累計 42 テストケースが全て Green である
- [ ] カバレッジレポート差分が Phase 7 への入力として記録されている

## 既知の落とし穴

| Pitfall | 内容                                       | 対策                                        |
| ------- | ------------------------------------------ | ------------------------------------------- |
| P9      | モジュールスコープ変数のテスト間リーク     | beforeEach でモック・状態をリセットする     |
| P13     | タイマーテストの無限ループ                 | advanceTimersByTime で 1 ステップずつ進める |
| P39     | happy-dom 環境での userEvent 非互換        | fireEvent を使用する                        |
| P40     | テスト実行ディレクトリ依存                 | `cd apps/desktop` から実行する              |
| P42     | 文字列引数の .trim() バリデーション漏れ    | T-6-4-03 で明示的に検証する                 |
| P55     | エラーメッセージ中のパスに正規表現メタ文字 | T-6-4-05 でパス情報漏洩を検証する           |

## 次のPhase

- [Phase 7（カバレッジ確認）](./phase-7-coverage-check.md) に進む
