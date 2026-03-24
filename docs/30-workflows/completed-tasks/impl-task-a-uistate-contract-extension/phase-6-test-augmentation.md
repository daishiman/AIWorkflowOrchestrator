# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                                      |
| -------- | --------------------------------------- |
| Phase    | 6 - テスト拡充                          |
| 機能名   | uistate-contract-extension              |
| タスクID | TASK-IMP-UISTATE-CONTRACT-EXTENSION-001 |
| 作成日   | 2026-03-24                              |

## 目的

Phase 4-5 で作成した基本テストに加え、エッジケース、境界値、後方互換、Guard 関数のテストを追加し、カバレッジを向上させる。

## 前提成果物

| Phase | 成果物     | パス               |
| ----- | ---------- | ------------------ |
| 4     | テスト作成 | `outputs/phase-4/` |
| 5     | 実装       | `outputs/phase-5/` |

## 参照資料

| 資料名         | パス / 説明                                                   |
| -------------- | ------------------------------------------------------------- |
| 主要変更対象   | `packages/shared/src/types/execution-capability.ts`           |
| 既存テスト     | `packages/shared/src/types/__tests__/cta-contract.test.ts`    |
| カバレッジ基準 | `.claude/rules/02-code-quality.md#カバレッジ基準`             |
| テスト設計注意 | `.claude/rules/06-known-pitfalls.md#P9`（テスト間状態リーク） |

## 実行タスク

### Task 1: エッジケーステスト

以下の複合条件のテストケースを追加する（Phase 2 D-3 優先順位に準拠）:

| #   | テストケース                       | 入力条件                                            | 期待動作                                                        |
| --- | ---------------------------------- | --------------------------------------------------- | --------------------------------------------------------------- |
| 1   | streaming + handoff 同時成立       | `isStreaming: true`, `isHandoffRequired: true`      | 優先順位に従い `streaming` を返す（P1:streaming > P2:handoff）  |
| 2   | degraded + none（capability なし） | `isDegraded: true`, capability: `none`              | `degraded` を返し、CTA は manual fallback / ヘルプ              |
| 3   | handoff + degraded 同時成立        | `isHandoffRequired: true`, `isDegraded: true`       | 優先順位に従い `handoff` を返す（P2:handoff > P4:degraded）     |
| 4   | streaming + degraded 同時成立      | `isStreaming: true`, `isDegraded: true`             | 優先順位に従い `streaming` を返す（P1:streaming > P4:degraded） |
| 5   | 全フラグ true                      | 全 optional フラグ `true`                           | 最優先の `streaming` を返す（P1 が最高優先度）                  |
| 6   | degraded + ready 同時成立          | `isDegraded: true`, capability: `integratedRuntime` | 優先順位に従い `degraded` を返す（P4:degraded > P5:ready）      |

**禁止値チェック**: テストケースに以下の禁止値を使用しないこと: `idle`, `running`, `completed`, `error`, `handoff_pending`, `pending`

### Task 2: 境界値テスト

| #   | テストケース                       | 入力条件                                         | 期待動作                                                                                |
| --- | ---------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| 1   | 全 optional フィールドが undefined | `CapabilityContext` の optional フィールド未設定 | capability に応じて `ready`/`blocked`/`unavailable` を返す（D-3 P5〜P8 フォールバック） |
| 2   | 全 optional フィールドが false     | 全 optional フィールドに `false` を明示的に設定  | capability に応じて `ready`/`blocked`/`unavailable` を返す                              |
| 3   | 空オブジェクト（capability: none） | capability: `none`, optional フィールドなし      | `hasResolutionAction` に応じて `blocked` または `unavailable` を返す                    |

### Task 3: overload 2 の後方互換テスト

既存の overload 2 シグネチャで呼び出した場合に、新パラメータなしで従来どおりの結果を返すことを検証する。

| #   | テストケース                           | 入力条件                                                         | 期待動作             |
| --- | -------------------------------------- | ---------------------------------------------------------------- | -------------------- |
| 1   | 旧形式（ready 相当）での呼び出し       | 旧形式の CapabilityContext（capability: `integratedRuntime`）    | `ready` を返す       |
| 2   | 旧形式（blocked 相当）での呼び出し     | 旧形式の CapabilityContext（capability: `none` + resolution）    | `blocked` を返す     |
| 3   | 旧形式（unavailable 相当）での呼び出し | 旧形式の CapabilityContext（capability: `none` + no resolution） | `unavailable` を返す |

### Task 4: Guard 関数テスト

| #   | テストケース                                    | 入力条件                       | 期待動作                |
| --- | ----------------------------------------------- | ------------------------------ | ----------------------- |
| 1   | assertStreamingCtaContract 正常系               | streaming 状態の有効な CTA     | エラーなし（void 返却） |
| 2   | assertStreamingCtaContract 異常系               | streaming 状態で無効な CTA     | エラー throw            |
| 3   | assertHandoffGuidanceExists 正常系              | handoff 状態 + handoffGuidance | エラーなし（void 返却） |
| 4   | assertHandoffGuidanceExists 異常系（undefined） | handoff 状態 + undefined       | エラー throw            |
| 5   | assertHandoffGuidanceExists 異常系（null）      | handoff 状態 + null            | エラー throw            |

## 成果物

| 成果物                          | パス                                                          |
| ------------------------------- | ------------------------------------------------------------- |
| 拡充済みテスト                  | `packages/shared/src/types/__tests__/uistate-resolve.test.ts` |
| 拡充済み Contract Matrix テスト | `packages/shared/src/types/__tests__/contract-matrix.test.ts` |
| Phase 6 完了レポート            | `outputs/phase-6/`                                            |

## 統合テスト連携

本 Phase の成果物が他 Phase や他タスクのテストに影響する場合の確認事項:

| 確認項目                         | 確認方法                                                                    | 判定基準      |
| -------------------------------- | --------------------------------------------------------------------------- | ------------- |
| 既存テスト（CC-1〜CC-5）への影響 | `pnpm --filter @repo/shared vitest run`                                     | 全テスト PASS |
| Task B（HealthPolicy）との型整合 | TASK-IMP-HEALTH-POLICY-UNIFICATION-001 の CapabilityContext.isDegraded 参照 | 型定義が一致  |

## サブタスク管理

Phase 実行時に TaskCreate / TaskUpdate で進捗を管理する。

- [ ] Phase 開始時: TaskUpdate で status を `in_progress` に更新
- [ ] 各 Task 完了時: TaskUpdate で該当サブタスクを `completed` に更新
- [ ] Phase 完了時: 全サブタスクが `completed` であることを確認

## タスク100%実行確認【必須】

Phase 完了前に以下を確認する:

- [ ] 実行タスクの全項目が実施されている
- [ ] 成果物テーブルの全成果物が作成されている
- [ ] 完了条件の全チェックボックスがチェックされている
- [ ] 次 Phase への引き継ぎ事項が明確である

## 完了条件

- [ ] エッジケーステスト 6 件が追加されている
- [ ] 境界値テスト 3 件が追加されている
- [ ] overload 2 後方互換テスト 3 件が追加されている
- [ ] Guard 関数テスト 5 件が追加されている
- [ ] 追加テスト全件が PASS している
- [ ] テスト間で状態を共有していない（P9 準拠）
- [ ] 既存テスト CC-1〜CC-5 が引き続き PASS している

## 次Phase

[Phase 7: カバレッジ確認](./phase-7-coverage-check.md)
