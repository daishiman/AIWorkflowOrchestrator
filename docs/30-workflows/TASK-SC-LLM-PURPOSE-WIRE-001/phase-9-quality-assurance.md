# Phase 9: 品質保証 -- extract-purpose LLM 実結果差し替え

## メタ情報

| 項目       | 値                           |
| ---------- | ---------------------------- |
| Phase番号  | 9                            |
| 機能名     | llm-purpose-wire             |
| タスクID   | TASK-SC-LLM-PURPOSE-WIRE-001 |
| 作成日     | 2026-04-16                   |
| 依存 Phase | Phase 8（リファクタリング）  |

## 目的

Lint・TypeScript 型チェック・関連テスト全実行を実施し、Phase 10 最終レビューへの進行に必要な品質基準を全て満たすことを確認する。

## 品質基準

| 項目              | 基準      |
| ----------------- | --------- |
| TypeScript エラー | 0 件      |
| ESLint エラー     | 0 件      |
| テスト            | 全件 PASS |

## 実行タスク

### Task 9-1: ESLint チェック

```bash
cd apps/desktop && pnpm lint src/main/services/skill/SkillCreatorService.ts
```

期待する結果: エラー 0 件、警告 0 件

エラーが発生した場合: `pnpm lint --fix` を実行する。自動修正不可の場合は手動で修正する。

### Task 9-2: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

期待する結果: エラー 0 件

型エラーが発生した場合の確認ポイント:

- `StructurePlanJson.purpose` の型定義が `string` として正しく定義されているか
- LLM 呼び出しの戻り値の型が `purpose` フィールドの型と一致しているか
- `loadAgent` の戻り値の型が正しく扱われているか
- エラーハンドリング内の型推論が適切か

### Task 9-3: SkillCreatorService テスト全実行

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillCreatorService.test.ts
```

期待する結果: 全テスト PASS

対象テストファイル:

- `SkillCreatorService.test.ts`（Phase 4 および Phase 6 で追加した purpose LLM 結果検証テストを含む）

### Task 9-4: 関連テストへの影響確認

SkillCreatorService を使用する他のテストが影響を受けていないことを確認する:

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/
```

期待する結果: 全テスト PASS

### Task 9-5: shared パッケージのビルド確認

```bash
pnpm --filter @repo/shared build
```

期待する結果: エラー 0 件でビルド完了

### Task 9-6: 品質チェック結果の記録

| チェック項目                         | コマンド                                                                        | 結果      |
| ------------------------------------ | ------------------------------------------------------------------------------- | --------- |
| ESLint                               | `pnpm lint src/main/services/skill/SkillCreatorService.ts`                      | PASS/FAIL |
| TypeScript 型チェック                | `pnpm --filter @repo/desktop typecheck`                                         | PASS/FAIL |
| SkillCreatorService テスト全実行     | `pnpm vitest run src/main/services/skill/__tests__/SkillCreatorService.test.ts` | PASS/FAIL |
| skill サービステスト全体への影響確認 | `pnpm vitest run src/main/services/skill/__tests__/`                            | PASS/FAIL |
| shared パッケージビルド              | `pnpm --filter @repo/shared build`                                              | PASS/FAIL |

全て PASS の場合のみ Phase 10 に進む。

### Task 9-7: purpose フィールド LLM 結果確認

`StructurePlanJson.purpose` にエージェント定義の raw 文字列ではなく LLM の推論結果が入っていることを確認する:

```bash
# purpose フィールドの型定義を確認
grep -n "purpose" apps/desktop/src/main/services/skill/SkillCreatorService.ts | head -20
```

期待する結果: purpose フィールドへの代入がエージェント定義文字列のままになっていないこと（LLM 呼び出し結果が代入されていること）

## 参照資料

| 資料名                   | パス                                                                    |
| ------------------------ | ----------------------------------------------------------------------- |
| Phase 8 リファクタリング | `docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/phase-8-refactoring.md` |
| SkillCreatorService      | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`           |
| コード品質ルール         | `.claude/rules/02-code-quality.md`                                      |

## 成果物

| 成果物       | パス                            | 形式     |
| ------------ | ------------------------------- | -------- |
| 品質保証記録 | `outputs/phase-9/qa-results.md` | Markdown |

## 完了条件

- [ ] ESLint がエラー 0 件で完了した
- [ ] TypeScript 型チェックがエラー 0 件で完了した
- [ ] SkillCreatorService テスト全実行で全テストが PASS した
- [ ] 関連テスト（skill サービス全体）が引き続き PASS した
- [ ] `@repo/shared` パッケージのビルドが成功した
- [ ] `StructurePlanJson.purpose` に LLM 推論結果が格納されていることを確認した
- [ ] 品質チェック結果を `outputs/phase-9/qa-results.md` に記録した
- [ ] **本Phase内の全タスクを100%実行完了**

## 次の Phase

Phase 10: 最終レビュー（`phase-10-final-review.md`）
