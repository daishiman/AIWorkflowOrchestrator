# Phase 9: 品質検証

## メタ情報

| 項目       | 値                              |
| ---------- | ------------------------------- |
| Phase      | 9                               |
| タスクID   | UT-SC-03-003                    |
| 親タスクID | TASK-SC-03-PLAN-LLM-PROMPT      |
| 作成日     | 2026-03-23                      |
| 前提Phase  | Phase 8（リファクタリング）完了 |

## 目的

Phase 8 までに完成したコードに対して、Lint・型チェック・全テスト実行による品質ゲートを通過させる。全ての検証項目が PASS であることを確認し、Phase 10（最終レビュー）に進む準備を整える。

## 実行タスク

### Task 1: ESLint リントチェック

変更対象ファイルに対して ESLint を実行し、コーディング規約違反がないことを確認する。

```bash
pnpm --filter @repo/desktop exec eslint \
  src/main/services/runtime/RuntimeSkillCreatorFacade.ts \
  src/main/ipc/index.ts
```

- 期待結果: エラー 0 件、警告 0 件
- エラーがある場合: 自動修正可能なものは `--fix` オプションで修正し、修正不可能なものは原因を特定して手動修正する

### Task 2: TypeScript 型チェック

共有パッケージのビルドを先に実行し、その後にデスクトップアプリの型チェックを実行する。

```bash
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop exec tsc --noEmit
```

- 期待結果: 型エラー 0 件
- 確認項目:
  - `setLLMAdapter()` の引数型が LLMAdapter インターフェースと一致していること
  - ResourceLoader のコンストラクタ注入の型が正しいこと
  - fire-and-forget async の戻り値型が適切に処理されていること（void 演算子または `.catch()` でのハンドリング）

### Task 3: RuntimeSkillCreatorFacade 関連テスト実行

```bash
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/
```

- 期待結果: 全テスト PASS
- 確認項目:
  - `setLLMAdapter()` の正常系テスト PASS
  - LLMAdapter 未注入時の graceful degradation テスト PASS
  - ResourceLoader コンストラクタ注入テスト PASS

### Task 4: IPC ハンドラテスト実行

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorHandlers
```

- 期待結果: 全テスト PASS
- 確認項目:
  - fire-and-forget async パターンのテスト PASS
  - LLMAdapterFactory.getAdapter() 失敗時のエラーハンドリングテスト PASS
  - 既存の skill-creator IPC ハンドラテストが全て PASS（回帰なし）

### Task 5: 品質検証レポート作成

Task 1-4 の実行結果を品質検証レポートとして記録する。

レポートに含める項目:

- 各 Task の実行結果（PASS / FAIL）
- テスト件数（実行数 / 成功数 / 失敗数 / スキップ数）
- 型エラー件数
- Lint エラー件数
- FAIL がある場合は原因と修正内容

## 参照資料

| 資料                                                                  | 用途                             |
| --------------------------------------------------------------------- | -------------------------------- |
| 02-code-quality.md                                                    | テスト・カバレッジ基準           |
| 07-git-and-tooling.md                                                 | コミット前チェックリスト         |
| P40（06-known-pitfalls.md）                                           | テスト実行ディレクトリ依存の回避 |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 検証対象ファイル                 |
| `apps/desktop/src/main/ipc/index.ts`                                  | 検証対象ファイル                 |

## 成果物

| 成果物           | パス                                                                               |
| ---------------- | ---------------------------------------------------------------------------------- |
| 品質検証レポート | `docs/30-workflows/ut-sc-03-003-di-wiring/phase-09-quality-verification-report.md` |

## 完了条件

- [ ] ESLint リントチェック: エラー 0 件、警告 0 件
- [ ] TypeScript 型チェック: エラー 0 件
- [ ] RuntimeSkillCreatorFacade 関連テスト: 全 PASS
- [ ] IPC ハンドラテスト: 全 PASS
- [ ] 品質検証レポートが作成されている
- [ ] 全ての検証項目が PASS であること（1つでも FAIL がある場合は Phase 8 に戻りリファクタリングを実施）

## 統合テスト連携

品質検証における統合テスト確認:

- [ ] Lint + TypeCheck + テスト実行が全てPASS
- [ ] DI配線関連の既存テストに regression がないことを確認

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

全ての品質検証項目が PASS の場合、Phase 10（最終レビュー）へ進む。FAIL がある場合は Phase 8（リファクタリング）に戻り、問題を修正した後に再度 Phase 9 を実施する。
