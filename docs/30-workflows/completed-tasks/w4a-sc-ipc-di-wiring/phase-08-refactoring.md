# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 8                      |
| 機能名   | Skill Creator DI 配線  |
| タスクID | UT-SC-05-IPC-DI-WIRING |
| 作成日   | 2026-03-23             |

## 目的

Phase 5 の実装コードの品質を改善する。本タスクは1ファイル（`index.ts`）の限定的な修正であるため、リファクタリング対象は小規模。

## 背景

Phase 7 でカバレッジ基準を達成した後、コード品質の最終チェックとリファクタリングを行う。修正対象が1ファイルのため、大規模なリファクタリングは不要と想定。

## 実行タスク

### Task 1: コード品質チェック

以下の観点で修正箇所をレビューする:

| チェック項目              | 基準                                                          |
| ------------------------- | ------------------------------------------------------------- |
| `any` 型の使用            | 使用していないこと                                            |
| 未使用 import             | 追加した import が全て使用されていること                      |
| console.warn のメッセージ | 機密情報（API キー等）を含まないこと                          |
| 変数命名                  | `llmAdapter`、`resourceLoader` が実態と一致すること           |
| `try-catch` のスコープ    | LLM アダプター取得のみを囲んでいること                        |
| `void` 式の使用           | 即時実行 async 使用時に `void` が付いていること（必要な場合） |

### Task 2: import 文の整理

追加した import が既存 import と同じスタイル（パスエイリアス `@/main/...` vs 相対パス `../`）で記述されていることを確認する。

### Task 3: 重複コードの確認

`SkillCreatorService` のコンストラクタ内でも `ResourceLoader` を生成している（L41）。DI 配線で生成した `resourceLoader` インスタンスと、`SkillCreatorService` 内部のインスタンスが別物であることを確認し、問題がないことを検証する（別用途のため問題なし）。

### Task 4: リファクタリング後のテスト実行

```bash
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorHandlers
```

## 参照資料

- `apps/desktop/src/main/ipc/index.ts`（修正後）
- `.claude/rules/02-code-quality.md`

## 成果物

- リファクタリング済みコード（変更があった場合のみ）

## 完了条件

- [ ] コード品質チェック全項目を確認した
- [ ] import 文のスタイルが既存と統一されていることを確認した
- [ ] 重複コードがないことを確認した（または重複が許容される理由を記録した）
- [ ] テストが全て PASS した

## 統合テスト連携

リファクタリング後のテスト継続成功を確認する。コード品質改善が動作に影響しないことを検証。

## TDD検証

```bash
# リファクタリング後のテスト実行
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorHandlers
```

- [ ] リファクタリング後もテストが成功することを確認

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. コード品質チェック全項目確認（Task 1）
2. import 文スタイル確認（Task 2）
3. 重複コード確認（Task 3）
4. リファクタリング後のテスト実行（Task 4）

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/w4a-sc-ipc-di-wiring --phase 8
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

| タスク                                 | 結果 | 備考 |
| -------------------------------------- | ---- | ---- |
| Task 1: コード品質チェック             | -    | -    |
| Task 2: import 文の整理                | -    | -    |
| Task 3: 重複コードの確認               | -    | -    |
| Task 4: リファクタリング後のテスト実行 | -    | -    |

### 発見事項

- 良かった点: -
- 問題点: -
- 改善提案: -

### 次Phaseへの引き継ぎ事項

- -

## 次のPhase

Phase 9: 品質保証
