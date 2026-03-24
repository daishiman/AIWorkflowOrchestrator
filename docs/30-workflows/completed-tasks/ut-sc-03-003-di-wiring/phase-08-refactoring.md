# Phase 8: リファクタリング

## メタ情報

| 項目       | 値                            |
| ---------- | ----------------------------- |
| Phase      | 8                             |
| タスクID   | UT-SC-03-003                  |
| 親タスクID | TASK-SC-03-PLAN-LLM-PROMPT    |
| 作成日     | 2026-03-23                    |
| 前提Phase  | Phase 7（カバレッジ確認）PASS |

## 目的

Phase 5（実装）および Phase 6（テスト拡充）で追加したコードに対して、コード品質を改善するリファクタリングを実施する。既存コードベースとの一貫性を確保し、保守性・可読性を向上させる。

## 実行タスク

### Task 1: 定数配置の一貫性確認

- 既存の `DEFAULT_SKILL_CREATOR_PATH` 定数が正しく使用されていることを確認する
- 他の定数（既存の設定値やパス定義）と近い位置にグルーピングされているか確認する
- 定数名が `UPPER_SNAKE_CASE` 命名規則に従っているか確認する

### Task 2: fire-and-forget async パターンの一貫性確認

- `ipc/index.ts` 内の fire-and-forget async パターン（LLMAdapterFactory.getAdapter("anthropic") 呼び出し）が、同ファイル内の他の非同期初期化処理（`skillScheduler.initialize()` など）と一貫した構造であるか確認する
- 具体的な確認項目:
  - `.then()` / `.catch()` チェーンの有無と形式
  - エラーハンドリングの粒度（warn レベルのログ出力）
  - void 演算子の使用有無
- 不一致がある場合は既存パターンに合わせて統一する

### Task 3: ログメッセージフォーマットの統一

- `console.warn` メッセージが既存の `[IPC]` プレフィックスパターンと一致しているか確認する
- `ipc/index.ts` 内の他の `console.warn` / `console.error` メッセージと同じフォーマットであるか確認する
- P20（テスト環境でのログ出力汚染）に該当しないか確認する

### Task 4: JSDoc コメントの充実

- `RuntimeSkillCreatorFacade.setLLMAdapter()` メソッドの JSDoc コメントが以下を含んでいるか確認する:
  - P34（遅延初期化が必要な依存オブジェクトの DI パターン選択）への参照
  - Setter Injection パターンを採用した理由の簡潔な説明
  - `@param` タグによる引数の型と用途の記述
  - `@see` タグによる関連ドキュメントへの参照
- 不足している場合は追記する

### Task 5: リファクタリング後のテスト通過確認

- リファクタリングによって既存テストが壊れていないことを確認する
- 実行コマンド:
  ```bash
  cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/
  cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorHandlers
  ```
- 全テストが PASS すること

## 参照資料

| 資料                                                                  | 用途                                   |
| --------------------------------------------------------------------- | -------------------------------------- |
| P34（06-known-pitfalls.md）                                           | Setter Injection パターン選択の根拠    |
| P5（06-known-pitfalls.md）                                            | リスナー二重登録防止の確認             |
| P20（06-known-pitfalls.md）                                           | テスト環境でのログ出力汚染防止         |
| 02-code-quality.md                                                    | コーディング規約・DRY/KISS/YAGNI原則   |
| `apps/desktop/src/main/ipc/index.ts`                                  | fire-and-forget パターンの既存実装参照 |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | リファクタリング対象                   |

## 成果物

| 成果物                     | パス                                                                  |
| -------------------------- | --------------------------------------------------------------------- |
| リファクタリング済みコード | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` |
| リファクタリング済みコード | `apps/desktop/src/main/ipc/index.ts`                                  |

## 完了条件

- [ ] DEFAULT_SKILL_CREATOR_PATH 定数が他の定数と同じスコープに適切に配置されている
- [ ] fire-and-forget async パターンが既存の非同期初期化処理と一貫した構造になっている
- [ ] console.warn メッセージが `[IPC]` プレフィックスパターンに従っている
- [ ] setLLMAdapter() の JSDoc コメントに P34 パターンへの参照が含まれている
- [ ] リファクタリング後に全テストが PASS している
- [ ] 機能的な変更が発生していないこと（リファクタリングのみ）

## 統合テスト連携

リファクタ後の統合テスト継続成功を確認:

- [ ] リファクタリング後に `pnpm --filter @repo/desktop test` が全件PASS
- [ ] DI配線テストが変更なく全件PASS（動作を変えていないことの検証）

## 多角的チェック観点（AIが判断）

| 観点               | 適用 | チェック内容                                                                         |
| ------------------ | ---- | ------------------------------------------------------------------------------------ |
| アーキテクチャ     | Yes  | DI配線がレイヤー依存方向（Main→Services）を遵守しているか                            |
| セキュリティ       | No   | 認証・認可の変更なし                                                                 |
| IPC通信            | Yes  | RuntimeSkillCreatorFacade への依存注入が IPC ハンドラ登録と整合しているか            |
| エラーハンドリング | Yes  | graceful degradation（llmAdapter/resourceLoader 未注入時のスタブ返却）が維持されるか |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 9（品質検証）へ進む。Lint・型チェック・全テスト実行による品質ゲートを通過させる。
