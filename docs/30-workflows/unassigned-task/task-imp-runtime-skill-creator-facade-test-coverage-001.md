# RuntimeSkillCreatorFacade ユニットテスト追加 - タスク指示書

## メタ情報

```yaml
issue_number: 1217
```

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | UT-IMP-RUNTIME-SKILL-CREATOR-FACADE-TEST-COVERAGE-001          |
| タスク名     | RuntimeSkillCreatorFacade ユニットテスト追加                   |
| 分類         | 品質改善                                                       |
| 対象機能     | skill-agent-runtime-routing / RuntimeSkillCreatorFacade        |
| 優先度       | 中                                                             |
| 見積もり規模 | 小規模                                                         |
| ステータス   | 未実施                                                         |
| 発見元       | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001 Phase 12 未タスク検出 |
| 発見日       | 2026-03-14                                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`RuntimeSkillCreatorFacade` は TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001 の Phase 5 で実装されたが、同 Phase でユニットテストが作成されなかった。同タスクの他の実装ファイル（`RuntimePolicyResolver`: 13件、`TerminalHandoffBuilder`: 9件）にはテストが存在するが、Facade のみテスト未作成のまま残っている。

### 1.2 問題点・課題

- `plan()` / `execute()` / `improve()` の3メソッドが未検証。
- 各メソッド内部で `RuntimePolicyResolver.resolve()` を呼び出し、`integrated_api` / `terminal_handoff` の分岐が正しく動作するかのテストがない。
- `terminal_handoff` 時に `TerminalHandoffBuilder` が生成する `TerminalHandoffBundle` の内容検証がない。

### 1.3 放置した場合の影響

- Phase 9（品質検証）で Function Coverage が不合格になる可能性がある。
- 後続の統合クロージャタスク（UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001）で配線を追加した際に回帰検知ができない。
- Facade 内部のロジック変更時にサイレントな破壊が発生するリスクがある。

---

## 2. 何を達成するか（What）

### 2.1 目的

`RuntimeSkillCreatorFacade` の3メソッド（`plan` / `execute` / `improve`）に対するユニットテストを作成し、runtime 分岐ロジックの検証を担保する。

### 2.2 最終ゴール

- `RuntimeSkillCreatorFacade.test.ts` が作成され、8-12件のテストケースが全 PASS する。
- Line Coverage 90%以上、Branch Coverage 70%以上を達成する。

### 2.3 スコープ

#### 含むもの

- `plan()` の success / error / handoff テスト。
- `execute()` の success / error テスト。
- `improve()` の success / error / handoff テスト。
- DI モック（`AuthKeyService`、`SkillCreatorService`）の設定。

#### 含まないもの

- IPC ハンドラの統合テスト（UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 のスコープ）。
- `RuntimePolicyResolver` / `TerminalHandoffBuilder` のテスト追加（既存テスト済み）。

### 2.4 成果物

- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `RuntimeSkillCreatorFacade.ts` が存在し、ビルドが通ること。
- `RuntimePolicyResolver` と `TerminalHandoffBuilder` のテストパターンが参照可能であること。

### 3.2 依存タスク

- TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001（実装本体、完了済み）

### 3.3 必要な知識

- Vitest テストフレームワーク
- DI モックパターン（`vi.fn()` / `mockResolvedValue`）
- `RuntimeDecision` 型（`integrated_api` / `terminal_handoff`）

### 3.4 推奨アプローチ

- 既存の `RuntimePolicyResolver.test.ts` のモックパターンを踏襲する。
- `AuthKeyService` と `SkillCreatorService` をモックし、Facade の分岐ロジックのみを検証する。
- `beforeEach` で全モックをリセットし、テスト間の状態リークを防止する（P9準拠）。

### 3.5 実装課題と解決策（親タスクからの教訓）

TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001 の実装で遭遇した苦戦箇所のうち、テスト作成に関連するものを以下に記録する。

#### 苦戦箇所A: AuthKeyService モック設計

| 項目       | 内容                                                                                                                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `RuntimePolicyResolver` が内部で `AuthKeyService.getKey()` を呼び出すため、Facade テストでは resolver 自体をモックするか、resolver の依存もモックするかの判断が必要                           |
| 再発条件   | Facade のテストで resolver を実インスタンスにしてしまい、AuthKeyService のモック不足でテストが不安定になる                                                                                    |
| 解決策     | Facade テストでは `RuntimePolicyResolver` をモックし、`resolve()` の戻り値（`RuntimeDecision`）を直接制御する。resolver 自体のテストは既存の `RuntimePolicyResolver.test.ts` で担保されている |
| 標準ルール | Facade テストは「Facade 固有のロジック」のみ検証し、依存コンポーネントの動作検証は各コンポーネントのテストに委譲する                                                                          |

#### 苦戦箇所B: @ts-expect-error 未使用ディレクティブ TS2578

| 項目     | 内容                                                                                                                  |
| -------- | --------------------------------------------------------------------------------------------------------------------- |
| 課題     | テスト内で型エラーを予想して `@ts-expect-error` を先回りで追加すると、実際には型エラーが発生せず TS2578 になる        |
| 再発条件 | モック型の定義が柔軟で、テスト内での型不一致が起きないケース                                                          |
| 解決策   | `@ts-expect-error` は実際にビルドエラーが出た後にのみ追加する。テスト作成時は先に `pnpm typecheck` を実行して確認する |

#### 同種課題の5分解決カード

| ステップ | アクション                                                                                                                   |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1        | `RuntimePolicyResolver.test.ts` のモックパターンを確認し、同じ構造を踏襲する                                                 |
| 2        | `RuntimePolicyResolver` をモックし、`resolve()` の戻り値を `integrated_api` / `terminal_handoff` で直接制御する              |
| 3        | 各メソッド（plan/execute/improve）の success / error / handoff パスを網羅する                                                |
| 4        | `beforeEach` で全モックを `vi.clearAllMocks()` でリセットする（P9準拠）                                                      |
| 5        | `pnpm exec vitest run apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` で PASS を確認する |

---

## 4. 実行手順

### Phase構成

- Phase A: テスト設計（TC一覧作成）
- Phase B: テストコード実装
- Phase C: カバレッジ確認

### Phase A: テスト設計

#### 目的

テストケースの一覧を設計し、カバレッジ目標を設定する。

#### 手順

1. `RuntimeSkillCreatorFacade.ts` のメソッド一覧と分岐パスを列挙する。
2. 各分岐に対応するテストケースを設計する。
3. 期待する Line/Branch Coverage を設定する。

#### 成果物

テストケース一覧（TC-ID / メソッド / 条件 / 期待結果）。

#### 完了条件

全分岐パスに対応するテストケースが設計されている。

### Phase B: テストコード実装

#### 目的

設計したテストケースをコードとして実装する。

#### 手順

1. `RuntimeSkillCreatorFacade.test.ts` を新規作成する。
2. モック設定（`vi.mock()` / `vi.fn()`）を実装する。
3. 各テストケースを `describe` / `it` ブロックで実装する。
4. `pnpm exec vitest run` で全テスト PASS を確認する。

#### 成果物

`apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`

#### 完了条件

全テストケースが PASS し、TypeCheck が通ること。

### Phase C: カバレッジ確認

#### 目的

カバレッジ基準の充足を確認する。

#### 手順

1. `pnpm exec vitest run --coverage` でカバレッジレポートを生成する。
2. `RuntimeSkillCreatorFacade.ts` の Line/Branch/Function Coverage を確認する。
3. 未達の場合は追加テストケースを作成する。

#### 成果物

カバレッジレポート（Line 90%以上、Branch 70%以上）。

#### 完了条件

カバレッジ基準を充足していること。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `plan()` の success / error / handoff パスがテスト済み
- [ ] `execute()` の success / error パスがテスト済み
- [ ] `improve()` の success / error / handoff パスがテスト済み
- [ ] `terminal_handoff` 時に `TerminalHandoffBundle` の内容が正しいことを検証済み

### 品質要件

- [ ] Line Coverage 90%以上
- [ ] Branch Coverage 70%以上
- [ ] Function Coverage 90%以上
- [ ] テスト間で状態リークがないこと（`beforeEach` でリセット、P9準拠）
- [ ] `pnpm typecheck` が PASS すること

### ドキュメント要件

- [ ] テストケース一覧が仕様書またはテストコード内コメントとして残ること

---

## 6. 検証方法

### テストケース

| TC-ID | メソッド | 条件                                       | 期待結果                                      |
| ----- | -------- | ------------------------------------------ | --------------------------------------------- |
| TC-01 | plan     | authMode=api-key, key有効 → integrated_api | SkillCreatorService.createPlan() が呼ばれる   |
| TC-02 | plan     | authMode=subscription → terminal_handoff   | TerminalHandoffBundle が返る                  |
| TC-03 | plan     | createPlan() がエラーを返す                | エラーが伝播する                              |
| TC-04 | execute  | authMode=api-key, key有効 → integrated_api | SkillCreatorService.executeTask() が呼ばれる  |
| TC-05 | execute  | executeTask() がエラーを返す               | エラーが伝播する                              |
| TC-06 | improve  | authMode=api-key, key有効 → integrated_api | SkillCreatorService.improveSkill() が呼ばれる |
| TC-07 | improve  | authMode=subscription → terminal_handoff   | TerminalHandoffBundle が返る                  |
| TC-08 | improve  | improveSkill() がエラーを返す              | エラーが伝播する                              |

### 検証手順

1. `cd apps/desktop && pnpm exec vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` を実行する。
2. 全テスト PASS を確認する。
3. `--coverage` オプションでカバレッジを確認する。

---

## 7. リスクと対策

| リスク                            | 影響度 | 発生確率 | 対策                                                                              |
| --------------------------------- | ------ | -------- | --------------------------------------------------------------------------------- |
| DI モック設計が複雑化             | 中     | 中       | RuntimePolicyResolver をモックし、resolve() 戻り値を直接制御する（苦戦箇所A参照） |
| TypeScript 型エラー               | 低     | 中       | @ts-expect-error は実ビルドエラー確認後にのみ追加（苦戦箇所B参照）                |
| テスト実行ディレクトリ依存（P40） | 中     | 低       | `cd apps/desktop && pnpm exec vitest run` で実行する                              |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/step-02-par-task-03-skill-agent-runtime-routing/unassigned-task/task-imp-skill-agent-runtime-routing-integration-closure-001.md`（統合クロージャ）
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`（苦戦箇所A-C）
- `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md`（Task03実装記録）

### 参考コード

- `apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.test.ts`（既存テストパターン）
- `apps/desktop/src/main/services/runtime/__tests__/TerminalHandoffBuilder.test.ts`（既存テストパターン）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（テスト対象）

### 関連 Pitfall

- P9: モジュールスコープ変数のテスト間リーク
- P40: テスト実行ディレクトリ依存（モノレポ）
- P41: v8 カバレッジプロバイダのインライン関数カウント

---

## 9. 備考

### 発見経緯

TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001 の Phase 12 未タスク検出において、`RuntimeSkillCreatorFacade.ts` にテストファイルが存在しないことが確認された。同タスクの他の実装ファイル（RuntimePolicyResolver / TerminalHandoffBuilder）にはテストが存在するため、Facade のみがテスト未作成として残存している。

### 補足事項

- 本タスクはユニットテストのみをスコープとする。統合テスト（IPC配線後の E2E 検証）は UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 のスコープ。
- テストパターンは既存の `RuntimePolicyResolver.test.ts` を踏襲することで設計コストを最小化できる。
