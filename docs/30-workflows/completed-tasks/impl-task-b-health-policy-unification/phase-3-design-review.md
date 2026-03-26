# Phase 3: 設計レビュー

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase      | 3                         |
| Phase名    | 設計レビュー              |
| 機能名     | health-policy-unification |
| 作成日     | 2026-03-24                |
| 前提Phase  | Phase 2                   |
| 後続Phase  | Phase 4                   |
| ステータス | 未実施                    |

## 目的

Phase 2 設計書の妥当性を、要件整合性・後方互換性・DIP 準拠・P62 防止の 4 軸でレビューし、Phase 4（テスト作成）への移行可否を判定する。

## 背景

Phase 2 で設計した D-1〜D-6 の定義が、既存アーキテクチャとの整合性を保ち、P62（暗黙 fallback）・P61（DIP 違反）等の既知の落とし穴を回避できているかをレビューする。本 Phase の承認が Phase 4 以降の実装基盤となる。

## 前提成果物

- Phase 1: [phase-1-requirements.md](./phase-1-requirements.md)
- Phase 2: [phase-2-design.md](./phase-2-design.md)

## レビュー観点

### R-1: 要件整合性

| チェック項目                                             | 検証方法                                        | 判定基準                  |
| -------------------------------------------------------- | ----------------------------------------------- | ------------------------- |
| HealthPolicy インターフェースが AC-1 を充足するか        | `packages/shared/src/types/` 配下への配置確認   | 型定義が shared に存在    |
| resolveHealthPolicy が AC-2 の全導出ルールを網羅するか   | Phase 1 導出ルール表と Phase 2 擬似コードの突合 | 全 6 ルールがコードに反映 |
| apiKeyDegraded の @deprecated マークが AC-3 を充足するか | D-3 セクションの JSDoc 確認                     | @deprecated タグ存在      |
| RuntimePolicyResolver の DI が AC-4 を充足するか         | D-4 セクションのコンストラクタ引数確認          | HealthPolicy が DI される |
| mainlineAccess.ts の消費が AC-5 を充足するか             | D-5 セクションの isConnectionAvailable 導出確認 | HealthPolicy 経由で取得   |

### R-2: 後方互換性

| チェック項目                                                               | 検証方法                                   | 判定基準            |
| -------------------------------------------------------------------------- | ------------------------------------------ | ------------------- |
| healthPolicy が optional であるか                                          | D-5 の MainlineExecutionAccessInput 型確認 | optional（?）である |
| healthPolicy 未指定時に既存の apiKeyDegraded / healthStatus から導出するか | D-5 の fallback ロジック確認               | 既存パス維持        |
| 既存テスト（6 ファイル）が影響を受けないか                                 | apiKeyDegraded 利用テストの input 形式確認 | テスト変更不要      |
| RuntimePolicyResolver の既存テストが影響を受けないか                       | コンストラクタ引数の optional 確認         | 既存テスト変更不要  |

### R-3: DIP（依存性逆転原則）準拠

| チェック項目                                                          | 検証方法                                     | 判定基準                           |
| --------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------- |
| RuntimePolicyResolver が HealthPolicy（インターフェース）に依存するか | import 先が `@repo/shared/types/` であること | 具象クラスではなくインターフェース |
| mainlineAccess.ts が HealthPolicy（インターフェース）に依存するか     | import 先が `@repo/shared/types/` であること | 具象クラスではなくインターフェース |
| resolveHealthPolicy が pure function であるか                         | 外部依存（IO, Date, Random）の確認           | 副作用なし                         |
| P61 パターン（具象クラス DI）に該当しないか                           | P61 チェックリスト適用                       | インターフェース依存のみ           |

### R-4: P62 防止

| チェック項目                                                        | 検証方法                                                | 判定基準                        |
| ------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------- |
| degraded 時に integrated_api への暗黙 fallback がないか             | D-4 の degraded 分岐確認                                | terminal_handoff を返す         |
| HealthPolicy.isDegraded === true 時に DEFAULT_CONFIG を参照しないか | `grep "DEFAULT_CONFIG" RuntimePolicyResolver.ts` で確認 | DEFAULT_CONFIG 参照なし         |
| unknown 状態で暗黙的な実行を行わないか                              | resolveHealthPolicy の unknown 分岐確認                 | isConnectionAvailable === false |

### R-5: Phase 4 への引き継ぎ確認（前向きチェック）

| チェック項目                                                                      | 検証方法                                                        | 判定基準                                    |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------- |
| Phase 2 の HealthPolicy 型定義が Phase 4 テストに正確に引き継がれるか             | D-1 の HealthPolicy フィールドリストを Phase 4 テスト設計と突合 | フィールド名が 1:1 一致                     |
| Phase 2 の HealthPolicyInput 型が Phase 4 テストで使用されるか                    | D-2 のフィールド名と Phase 4 テストの入力構造を突合             | フィールド名が一致（apiKeyDegraded を使用） |
| Phase 2 の resolveHealthPolicy() 6導出ルールが Phase 4 テストケースに反映されるか | D-2 の P1-P5 と Phase 4 テストケースを突合                      | 全6ルールがテストされる                     |

## レビュー結果テンプレート

### 判定

| 判定  | 条件                                                 |
| ----- | ---------------------------------------------------- |
| PASS  | R-1〜R-4 全てのチェック項目を充足                    |
| MINOR | 軽微な修正で対応可能（Phase 4 移行可）               |
| MAJOR | 要件または設計の根本的な問題あり（Phase 1/2 へ戻る） |

### R-1 結果

- [ ] AC-1 充足確認
- [ ] AC-2 導出ルール網羅確認
- [ ] AC-3 @deprecated 確認
- [ ] AC-4 DI 確認
- [ ] AC-5 消費確認

### R-2 結果

- [ ] healthPolicy optional 確認
- [ ] fallback ロジック確認
- [ ] 既存テスト影響なし確認

### R-3 結果

- [ ] DIP 準拠確認
- [ ] pure function 確認
- [ ] P61 非該当確認

### R-4 結果

- [ ] degraded 暗黙 fallback なし確認
- [ ] DEFAULT_CONFIG 非参照確認
- [ ] unknown 暗黙実行なし確認

## 成果物

| 成果物         | パス                                      | 内容                   |
| -------------- | ----------------------------------------- | ---------------------- |
| レビュー結果   | `outputs/phase-3/design-review-result.md` | 判定結果と指摘事項     |
| 指摘事項リスト | `outputs/phase-3/review-findings.md`      | MINOR/MAJOR 指摘の詳細 |

## 統合テスト連携

本 Phase の成果物が他 Phase や他タスクのテストに影響する場合の確認事項:

| 確認項目                                  | 確認方法                                                                     | 判定基準      |
| ----------------------------------------- | ---------------------------------------------------------------------------- | ------------- |
| 既存テスト（apiKeyDegraded 関連）への影響 | `pnpm --filter @repo/shared vitest run`                                      | 全テスト PASS |
| Task A（UiState）との型整合               | TASK-IMP-UISTATE-CONTRACT-EXTENSION-001 の CapabilityContext.isDegraded 消費 | 型定義が一致  |
| RuntimePolicyResolver 既存テスト          | `pnpm --filter @repo/desktop vitest run RuntimePolicyResolver`               | 全テスト PASS |

## サブタスク管理

Phase 実行時に TaskCreate / TaskUpdate で進捗を管理する。

- [ ] Phase 開始時: TaskUpdate で status を `in_progress` に更新
- [ ] 各 Task 完了時: TaskUpdate で該当サブタスクを `completed` に更新
- [ ] Phase 完了時: 全サブタスクが `completed` であることを確認

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 完了条件

- [ ] R-1〜R-4 の全チェック項目が実行されている
- [ ] 判定（PASS / MINOR / MAJOR）が記録されている
- [ ] MINOR 指摘がある場合、対応方針が記載されている
- [ ] MAJOR 指摘がある場合、戻り先 Phase が特定されている

## 依存関係

- **前提**: Phase 2 が完了していること
- **後続**: Phase 4 へ進む

## 次Phase

Phase 4: [phase-4-test-creation.md](./phase-4-test-creation.md)
