# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 8                                          |
| 機能名 | submitUserInput phase transition semantics |
| 作成日 | 2026-03-27                                 |

## 目的

Phase 5 実装の重複削減とコード品質向上を行う。インターフェースを変更せず、内部実装のみを改善する。

## 実行タスク

### T-8-1: 共通パターン抽出検討

- `applyPlanReviewTransition` / `applyVerificationReviewTransition` の両メソッドを比較し、共通パターンを特定する
- 共通処理（例: artifact 記録、phase 更新、timestamp 設定）を抽出可能か検討する
- 抽出する場合は private ヘルパーメソッドとして実装し、既存テストが全パスすることを確認する

### T-8-2: nowIso() 呼び出しの一元化

- `submitUserInput()` 内の `nowIso()` 呼び出し箇所を洗い出す
- 同一リクエスト処理内で複数回 `nowIso()` を呼び出している場合、メソッド冒頭で一度取得した値を使い回す形に統一する
- タイムスタンプの一貫性を確保する

### T-8-3: MINOR TECH-M-01 解決検討

- Phase 2 で検出された MINOR TECH-M-01（`phase_transition` artifact 型）の解決を検討する
- `phase_transition` kind の artifact に適切な型定義が存在するか確認する
- 必要に応じて型定義を追加し、型安全性を向上させる
- 既存の artifact 型との整合性を維持する

## 注意事項

- **インターフェースを変えない**: public メソッドのシグネチャ、返却型、snapshot の構造は一切変更しない
- **テストが全てパスし続けること**: リファクタリングの各ステップで `vitest run` を実行し、全テストパスを確認する
- **動作の等価性**: リファクタリング前後で振る舞いが完全に同一であること

## 参照資料

### コードベース

| 資料名       | パス                                                                                  | 説明                 |
| ------------ | ------------------------------------------------------------------------------------- | -------------------- |
| Engine 実装  | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                | リファクタリング対象 |
| Shared Types | `packages/shared/src/types/skillCreator.ts`                                           | artifact 型定義      |
| Engine Test  | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts` | 回帰テスト           |
| Phase 2 設計 | `outputs/phase-2/`                                                                    | TECH-M-01 の記録     |

## 成果物

| 成果物                     | パス                             | 説明                       |
| -------------------------- | -------------------------------- | -------------------------- |
| リファクタリング完了コード | Engine 実装ファイル              | 重複削減済みの実装         |
| TECH-M-01 解決記録         | `outputs/phase-8/refactoring.md` | 本ドキュメントに結果を追記 |

## 完了条件

- [ ] T-8-1: 共通パターンの抽出検討が完了し、必要に応じてリファクタリングが実施されている
- [ ] T-8-2: nowIso() の重複呼び出しが解消されている（該当箇所がある場合）
- [ ] T-8-3: MINOR TECH-M-01 の解決検討が完了し、結果が記録されている
- [ ] 全テスト（`pnpm exec vitest run`）がパスしている
- [ ] public インターフェースに変更がないこと
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 9: 品質保証
