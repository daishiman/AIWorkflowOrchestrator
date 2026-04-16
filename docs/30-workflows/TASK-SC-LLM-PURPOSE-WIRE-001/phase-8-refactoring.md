# Phase 8: リファクタリング -- extract-purpose LLM 実結果差し替え

## メタ情報

| 項目       | 値                           |
| ---------- | ---------------------------- |
| Phase番号  | 8                            |
| 機能名     | llm-purpose-wire             |
| タスクID   | TASK-SC-LLM-PURPOSE-WIRE-001 |
| 作成日     | 2026-04-16                   |
| 依存 Phase | Phase 7（カバレッジ確認）    |

## 目的

Phase 5 の実装コードを、全テストを通した状態を維持しながら品質改善する（TDD: Refactor フェーズ）。コードの可読性・保守性を向上させる変更のみを行い、機能変更は行わない。

## 実行タスク

### Task 8-1: リファクタリング対象の確認

以下のファイルを Read で確認し、リファクタリング候補を評価する:

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（LLM 呼び出し実装箇所）

#### 確認観点

1. **LLM 呼び出しコードの重複**: `runCreateWorkflow` 内で LLM 呼び出し処理が重複していないか
2. **エラーハンドリングの一貫性**: purpose 取得失敗時のエラー処理パターンが他のエラー処理と統一されているか
3. **型安全性**: `purpose` フィールドの型定義が `StructurePlanJson` と整合しているか
4. **コメントの一貫性**: JSDoc スタイルが既存コードと統一されているか
5. **エージェント定義の取得と LLM 呼び出しの責務分離**: `loadAgent` と LLM 呼び出しが適切に分離されているか

### Task 8-2: リファクタリング変更内容（対象/Before/After/理由）

| 対象                                 | Before                           | After                                                | 理由                                 |
| ------------------------------------ | -------------------------------- | ---------------------------------------------------- | ------------------------------------ |
| purpose 抽出処理の命名               | 匿名処理または不明瞭な変数名     | `extractPurposeFromLLM` などの明示的なメソッド名     | 処理の意図を名前から明確にする       |
| エラーハンドリングパターン           | purpose 失敗時に個別の try/catch | 既存の `runCreateWorkflow` のエラー処理と統一        | エラー処理パターンの一貫性を確保する |
| エージェント定義文字列の変数名       | 不明瞭な中間変数名               | `agentDefinition` / `purposePrompt` 等の説明的な名前 | コードの可読性向上                   |
| LLM 呼び出し成功時・失敗時のログ出力 | ログなし or 不十分               | success/failure を明示したログ出力                   | 運用時のデバッグ容易性向上           |

### Task 8-3: リファクタリング候補の評価

#### 候補 R-A: purpose 抽出処理の専用プライベートメソッド化

評価: **判断待ち**（実装 Phase 5 後に評価）

理由: LLM 呼び出し処理が `runCreateWorkflow` 内に直接記述されている場合、専用メソッドへの抽出によりテスト容易性が向上する。ただし、単一呼び出しで複雑でない場合はインライン記述を維持する。

#### 候補 R-B: エラーハンドリングのユーティリティ化

評価: **実施しない**

理由: purpose エラーハンドリングは `runCreateWorkflow` 固有のフローであり、汎用ユーティリティ化すると過度な抽象化になる。

#### 候補 R-C: LLM 呼び出し方式の設計ドキュメント明記

評価: **確認のみ**

確認事項:

- LLM 呼び出し方式（直接呼び出し vs エージェント経由）が設計ドキュメントに明記されているか
- 選択した方式の理由が Phase 2 設計書に記載されているか

#### 候補 R-D: `StructurePlanJson.purpose` の型確認

評価: **確認のみ**

確認事項:

- `purpose` フィールドの型が `string`（必須）として定義されているか
- null/undefined の扱いが設計通りになっているか

### Task 8-4: Prettier フォーマット確認

```bash
cd apps/desktop && pnpm prettier --check src/main/services/skill/SkillCreatorService.ts
```

### Task 8-5: リファクタリング後のテスト確認

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillCreatorService.test.ts
```

期待する結果: 全テスト PASS（FAIL が 0 件）

## 参照資料

| 資料名              | パス                                                                               |
| ------------------- | ---------------------------------------------------------------------------------- |
| Phase 5 実装        | `docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/outputs/phase-5/implementation.md` |
| SkillCreatorService | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                      |
| コード品質ルール    | `.claude/rules/02-code-quality.md`                                                 |

## 成果物

| 成果物                       | パス                                                          | 形式       |
| ---------------------------- | ------------------------------------------------------------- | ---------- |
| リファクタリング記録         | `outputs/phase-8/refactoring-log.md`                          | Markdown   |
| リファクタリング済みサービス | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | TypeScript |

## 完了条件

- [ ] `SkillCreatorService.ts` を Read で確認し、リファクタリング候補を評価した
- [ ] 変更内容を「対象/Before/After/理由」テーブル形式で記録した
- [ ] 候補 R-A（専用メソッド化）について実装を確認し、適否を判断した
- [ ] 候補 R-B（ユーティリティ化）を実施しないと判断し、理由を記録した
- [ ] 候補 R-C（設計ドキュメント明記）の充実を確認した
- [ ] 候補 R-D（型確認）が正しいことを確認した
- [ ] Prettier フォーマットを確認した
- [ ] リファクタリング後に全テストが PASS していることを確認した
- [ ] 機能変更が発生していないことを確認した
- [ ] **本Phase内の全タスクを100%実行完了**

## 次の Phase

Phase 9: 品質保証（`phase-9-quality-assurance.md`）
