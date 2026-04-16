# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 8                                            |
| タスクID   | TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001   |
| 機能名     | runCreateWorkflow-to-generateSkillMd-connect |
| 前提Phase  | Phase 7（カバレッジ確認完了）                |
| 後続Phase  | Phase 9                                      |
| 作成日     | 2026-04-16                                   |
| ステータス | pending                                      |

## 目的

テストが Green のまま、コードの品質を向上させる（TDD: Refactor フェーズ）。
`SkillCreatorService.ts` の `runCreateWorkflow` 戻り値接続箇所のリファクタリングを実施し、
可読性・責務明確性・エラーハンドリング一貫性を確認・改善する。

## 実行タスク

### タスク1: コードレビュー

- `SkillCreatorService.ts` の修正箇所のコードレビュー
- `void structurePlan;` 削除後のコードの可読性確認
- `generateSkillMd` メソッドの責務が単一か確認
- null チェック（`if (structurePlan)`）の条件が適切か確認
- エラーログの出力フォーマットが既存コードと一貫しているか確認

### タスク2: リファクタリング実施（必要な場合のみ）

- 重複コード除去（既存の `generate_skill_md.js` 呼び出し部分との統合）
- エラーハンドリングの一貫性確認
  - structurePlan が null の場合のエラーログが適切な log レベル（`logger.error` 等）で出力されているか
  - 既存の try/catch ブロックとの整合性
- 型定義の明確化
  - `StructurePlanJson` 型が適切に import されているか
  - 戻り値の型注釈が明確か
- コメント整理（リファクタ箇所への JSDoc 追加が必要か確認）

### タスク3: IPC 契約ドリフト検証

- `SkillCreatorService` の外部インターフェース変更がないことを確認
- IPC ハンドラーへの影響がないことを確認
- 既存の collaborative / orchestrate モードに影響がないことを確認

```bash
# IPC ハンドラーへの影響確認
grep -rn "SkillCreatorService\|runCreateWorkflow\|generateSkillMd" \
  apps/desktop/src/main/ --include="*.ts" | grep -v "__tests__"
```

### タスク4: リファクタリング後テスト実行

```bash
# 全テスト実行でリファクタリングの影響がないことを確認
pnpm --filter @repo/desktop test

# 型チェック再確認
pnpm --filter @repo/desktop typecheck

# lint 再確認
pnpm --filter @repo/desktop lint
```

## 参照資料

| 資料名                 | パス                                                          | 用途           |
| ---------------------- | ------------------------------------------------------------- | -------------- |
| 対象実装ファイル       | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | リファクタ対象 |
| 関連スクリプト         | `generate_skill_md.js`                                        | 呼び出し先確認 |
| Phase 5 実装サマリー   | `outputs/phase-5/implementation-notes.md`                     | 実装内容参照   |
| Phase 7 カバレッジ結果 | `outputs/phase-7/coverage-check-result.md`                    | カバレッジ確認 |

- 依存 Phase 参照: Phase 1 の要件定義（`outputs/phase-1/spec-extraction-map.md`）と Phase 2 の設計書（`outputs/phase-2/design-doc.md`）を前提にする

## 統合テスト連携【必須】

| 判定項目                            | 基準     | 結果 |
| ----------------------------------- | -------- | ---- |
| 全テスト PASS（リファクタリング後） | PASS     | -    |
| 型チェック（desktop）               | PASS     | -    |
| lint（desktop）                     | 0 error  | -    |
| IPC 契約ドリフトなし                | 確認済み | -    |

## 多角的チェック観点

| 観点     | 確認内容                                                                   |
| -------- | -------------------------------------------------------------------------- |
| 矛盾     | リファクタリングによって Phase 5 実装の動作仕様が変わっていないか          |
| 漏れ     | `void structurePlan;` の削除後にコンパイルエラーが残存していないか         |
| 整合性   | エラーログの出力フォーマットが `SkillCreatorService.ts` 内で一貫しているか |
| 依存関係 | リファクタリング後も collaborative / orchestrate モードが正常動作するか    |

## 成果物

| 成果物               | パス                                                          | 説明                                       |
| -------------------- | ------------------------------------------------------------- | ------------------------------------------ |
| リファクタリング記録 | `outputs/phase-8/refactoring-notes.md`                        | Before/After/理由テーブル・変更なし記録    |
| 対象実装ファイル     | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | リファクタリング済み（必要な場合のみ変更） |

## 完了条件

- [ ] コードレビュー完了（命名・型注釈・可読性）
- [ ] IPC 契約ドリフトなし
- [ ] リファクタリング後も全テスト PASS
- [ ] 型チェック（desktop）がエラー 0 件
- [ ] lint（desktop）がエラー 0 件
- [ ] `outputs/phase-8/refactoring-notes.md` 作成済み
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. コードレビュー（命名・型注釈・可読性）
2. リファクタリング実施（必要な場合のみ）
3. IPC 契約ドリフト検証
4. リファクタリング後テスト実行
5. リファクタリング記録作成

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 9: 品質保証
