# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 6                                        |
| Phase名    | テスト拡充                               |
| 前提Phase  | Phase 5                                  |
| 後続Phase  | Phase 7                                  |
| ステータス | 未実施                                   |
| 作成日     | 2026-04-08                               |
| 機能名     | task-sc-13-verify-channel-implementation |

---

## 目的

Phase 5 の実装（Green）を維持しながら、fail path・境界値・回帰 guard を追加して
テストの堅牢性と信頼性を高める。Phase 4 で作成した最小限のテストを拡充する。

---

## 実行タスク

### タスク1: fail path テストの追加

**目的**: エラー系・境界値のテストカバレッジを拡充する

**追加テストケース**:

| TC-ID   | テストケース名                                             | カテゴリ     | 追加先ファイル                 |
| ------- | ---------------------------------------------------------- | ------------ | ------------------------------ |
| TC-V-08 | apiKey が null の場合（許容される境界値）                  | 境界値       | creatorHandlers.verify.test.ts |
| TC-V-09 | authMode が異なる値の場合のルーティング確認                | 境界値       | creatorHandlers.verify.test.ts |
| TC-V-10 | Facade.verify() が null を返した場合                       | 異常系       | creatorHandlers.verify.test.ts |
| TC-V-11 | エラーオブジェクトに機密情報が含まれる場合の sanitize 確認 | セキュリティ | creatorHandlers.verify.test.ts |
| TC-V-12 | 並列 verify 呼び出し時の独立性確認                         | 並列性       | creatorHandlers.verify.test.ts |

**実行手順**:

1. `creatorHandlers.verify.test.ts` に上記テストケースを追加する
2. テストを実行して全件 PASS を確認する

```bash
pnpm --filter @repo/desktop test apps/desktop/src/main/ipc/__tests__/creatorHandlers.verify.test.ts
```

---

### タスク2: 回帰 guard テストの追加

**目的**: 既存 plan/execute/improve ハンドラへの非影響を回帰テストで担保する

**実行手順**:

1. 既存テストが引き続き PASS であることを確認する
2. verify ハンドラの追加が既存ハンドラに影響を与えていないことを確認する

```bash
# 既存テスト全件実行
pnpm --filter @repo/desktop test apps/desktop/src/main/ipc/__tests__/
```

**確認項目**:

- [ ] plan ハンドラテスト全件 PASS
- [ ] execute ハンドラテスト全件 PASS
- [ ] improve ハンドラテスト全件 PASS
- [ ] applyImprovement ハンドラテスト全件 PASS

---

### タスク3: E2E テスト拡充

**目的**: `skill-creator-integration.test.ts` の verify シナリオを拡充する

**追加テストケース**:

| TC-ID       | テストケース名                          | 期待結果                                   |
| ----------- | --------------------------------------- | ------------------------------------------ |
| TC-E2E-V-03 | verify 後に既存フローが継続動作すること | plan/execute/verify が独立して動作         |
| TC-E2E-V-04 | 不正 skillName での E2E エラー動作      | `{ success: false, error: string }` が返る |

**実行手順**:

```bash
pnpm --filter @repo/desktop test apps/desktop/src/test/skill-creator-integration.test.ts
```

---

## 参照資料

| 参照資料                  | パス                                                                 | 内容                 |
| ------------------------- | -------------------------------------------------------------------- | -------------------- |
| verify ハンドラ UT        | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.verify.test.ts` | Phase 4 作成のテスト |
| skill-creator-integration | `apps/desktop/src/test/skill-creator-integration.test.ts`            | E2E テスト構造       |
| テストヘルパー            | `apps/desktop/src/test/helpers/skill-creator-test-helpers.ts`        | モック・アサーション |

---

## 成果物

| 成果物         | パス                                                                 | 内容                        |
| -------------- | -------------------------------------------------------------------- | --------------------------- |
| verify UT 拡充 | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.verify.test.ts` | TC-V-08〜TC-V-12 追加       |
| E2E テスト拡充 | `apps/desktop/src/test/skill-creator-integration.test.ts`            | TC-E2E-V-03/04 追加         |
| テスト拡充結果 | `outputs/phase-6/test-expansion-result.md`                           | 追加 TC 一覧・PASS 確認証跡 |

---

## 統合テスト連携

- 統合テスト全カテゴリのカバレッジ向上（正常/異常/境界値/セキュリティ/並列）
- `skill-creator-integration.test.ts` での verify チャネル end-to-end 確認

---

## 完了条件

- [ ] TC-V-08〜TC-V-12 が `creatorHandlers.verify.test.ts` に追加されていること
- [ ] TC-E2E-V-03/04 が E2E テストに追加されていること
- [ ] 全追加テストケースが PASS であること
- [ ] 既存 plan/execute/improve テスト全件 PASS であること（回帰確認）
- [ ] `outputs/phase-6/test-expansion-result.md` が作成されていること

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5 が完了していること（実装 Green 状態）
- **後続**: Phase 7 へ進む

---

## 次Phase

**Phase 7: カバレッジ確認** — 変更ファイルの line / branch カバレッジを計測し、目標値を満たしているかを確認する。
