# Phase 2: 設計

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 2                                             |
| Phase名    | 設計                                          |
| 対象機能   | TASK-P0-04-manifest-loader-default-activation |
| 前提Phase  | Phase 1: 要件定義                             |
| 次Phase    | Phase 3: 設計レビュー                         |
| ステータス | pending                                       |
| 作成日     | 2026-03-29                                    |

## 目的

Facade 初期化時の自動インスタンス化戦略、manifest 自動発見ロジック、fallback chain の設計を確定し、既存パスとの共存を保証する最小設計を定める。

## 実行タスク

### Task 1: 自動インスタンス化戦略

- コンストラクタ内で3コンポーネントのデフォルトインスタンスを生成する
- 外部注入がある場合はそちらを優先する（DI override パターン）
- 各コンポーネントのコンストラクタ依存を調査し、Facade が保持する情報で生成可能か確認する
  - SkillCreatorSourceResolver: コンストラクタ引数の確認
  - PhaseResourcePlanner: コンストラクタ引数の確認
  - ResolvedResourceReader: コンストラクタ引数の確認

### Task 2: manifest 自動発見設計

- `loadWorkflowManifest()` の拡張: explicitRoot がない場合に source resolver candidates を列挙する
- candidates からの manifest 探索順序を定義する
- 発見成功時は dynamic pipeline を活性化、未発見時は static loader fallback を維持する
- 探索結果のキャッシュ戦略を定義する

### Task 3: fallback chain 設計

- Priority 1: dynamic resource pipeline（3コンポーネント + manifest）
- Priority 2: static resourceLoader（既存パス）
- Priority 3: stub 返却（最終フォールバック）
- 各段階の遷移条件と logging を定義する

### Task 4: ipc/index.ts wiring 調整設計

- 現在の PhaseResourcePlanner 注入を維持しつつ、Facade 内部での自動インスタンス化と共存する方針を定める
- 外部注入と内部生成の優先順位ルールを定義する

### Task 5: 30思考法の反映

- 論理分析系: 既存パスとの矛盾がないことを検証する
- 構造分解系: 初期化責務と runtime 責務を分離する
- 発想・拡張系: 最小変更で最大効果を得る設計に寄せる
- ユーザー提示の30思考法全30項目を少なくとも1回ずつ適用し、`outputs/phase-2/design-document.md` に `30思考法マトリクス` を残す
- 各思考法の適用結果は「適用観点 / 得られた示唆 / 採用可否」を1行ずつ記録する

## 参照資料

| 資料名      | パス                                                                  | 説明                         |
| ----------- | --------------------------------------------------------------------- | ---------------------------- |
| 要件定義    | `phase-1-requirements.md`                                             | FR-01〜FR-06, NFR-01〜NFR-03 |
| Facade 実装 | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 自動インスタンス化の起点     |
| IPC wiring  | `apps/desktop/src/main/ipc/index.ts`                                  | 現在の注入ポイント           |

## 統合テスト連携

- 自動インスタンス化の観測点を Phase 4 のテスト設計に引き継ぐ
- fallback chain の各段階をテスト可能な形で設計する

## 成果物

| 成果物 | パス                                 | 説明                                                                           |
| ------ | ------------------------------------ | ------------------------------------------------------------------------------ |
| 設計書 | `outputs/phase-2/design-document.md` | 自動インスタンス化戦略、manifest 発見、fallback chain 設計、30思考法マトリクス |

## 完了条件

- [ ] 3コンポーネントの自動インスタンス化方針が確定している
- [ ] manifest 自動発見の探索順序が定義されている
- [ ] fallback chain の遷移条件が明確である
- [ ] ipc wiring との共存方針が定義されている
- [ ] 30思考法の設計反映が記録されている
- [ ] 30思考法の全30項目が適用されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 3: 設計レビュー](./phase-3-design-review.md)
