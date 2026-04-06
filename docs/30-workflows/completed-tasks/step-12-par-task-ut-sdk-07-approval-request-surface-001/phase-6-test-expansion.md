# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Phase      | 6                                                                     |
| Phase名    | テスト拡充                                                            |
| 対象機能   | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001: approval:request surface 追加 |
| 前提Phase  | Phase 5: 実装                                                         |
| 次Phase    | Phase 7: カバレッジ確認                                               |
| ステータス | pending                                                               |
| 作成日     | 2026-04-06                                                            |
| 更新日     | 2026-04-06                                                            |

## 目的

Phase 5 の実装に対して、fail path・境界値・TTL expired フロー・回帰ガードのテストを追加し、カバレッジを強化する。

## 実行タスク

### Task 1: TTL expired フローのテスト追加

```typescript
describe("ApprovalRequestPanel - TTL expired フロー", () => {
  it("expiresAt を過ぎると expired 状態に遷移する", async () => {
    // expiresAt = Date.now() - 1000（過去）のリクエストを渡す
    // expired 状態であることを確認
  });

  it("TTL 経過前は承認ボタンが有効", () => {
    // expiresAt = Date.now() + 30000（未来）
    // ボタンが enabled であることを確認
  });

  it("TTL 経過後は承認・拒否ボタンが disabled", () => {});

  it("expired 警告メッセージが表示される", () => {});
});
```

### Task 2: IPC 通信失敗時のエラーハンドリングテスト

```typescript
describe("respondToApproval エラーハンドリング", () => {
  it("IPC 通信失敗時にエラー状態を表示する", async () => {
    // respondToApproval が reject するようにモック
    // エラーメッセージが表示されることを確認
  });

  it("IPC 失敗後も再試行ボタンが表示される（または graceful degradation）", () => {});
});
```

### Task 3: 境界値テスト

```typescript
describe("ApprovalRequest 境界値テスト", () => {
  it("expiresAt が現在時刻と同じ場合は expired 扱い", () => {});

  it("requestId が空文字の場合のハンドリング", () => {
    // 実装がガードしているか確認
  });

  it("連続して複数の approval:request を受信した場合、最新を表示する", () => {
    // 2回連続でイベントを発火
    // 最後に受信したリクエストが表示されることを確認
  });
});
```

### Task 4: cleanup のメモリリークテスト

```typescript
describe("onApprovalRequest cleanup", () => {
  it("コンポーネントアンマウント後に listener が解除される", () => {
    // cleanup 関数が呼ばれることを確認
    // アンマウント後にイベントが発火しても callback が呼ばれないことを確認
  });
});
```

### Task 5: 回帰ガード

既存の governance-bundle テストが引き続き通過することを確認する:

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="governance-bundle"
```

- 既存テストへの影響がないことを確認
- `respondToApproval()` の既存の動作が変わっていないことを確認

## 参照資料

| 資料名               | パス                                                                                                  | 説明           |
| -------------------- | ----------------------------------------------------------------------------------------------------- | -------------- |
| Phase 5 実装サマリー | `outputs/phase-5/implementation-summary.md`                                                           | 実装内容の確認 |
| governance-bundle    | `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts`                          | 回帰ガード対象 |
| lessons-learned      | `.claude/skills/aiworkflow-requirements/references/lessons-learned-skill-lifecycle-test-hardening.md` | テスト標準化   |

## 多角的チェック観点

| 観点         | 確認内容                                                 |
| ------------ | -------------------------------------------------------- |
| fail path    | IPC 失敗・TTL expired・無効 requestId の全ケースをカバー |
| 回帰ガード   | 既存 governance テストが継続して GREEN であること        |
| 境界値       | expiresAt の境界・連続受信・空文字 requestId             |
| メモリリーク | cleanup が確実に機能することの確認                       |

## 統合テスト連携

- Phase 6 で追加した fail path と境界値は Phase 7 のカバレッジ確認にそのまま反映する。
- TTL expired と cleanup の検証結果は Phase 9 の品質保証と Phase 11 の手動確認に引き継ぐ。

## 成果物

| 成果物             | パス                                 | 説明                                       |
| ------------------ | ------------------------------------ | ------------------------------------------ |
| テスト拡充レポート | `outputs/phase-6/coverage-report.md` | 追加したテストケース一覧・カバレッジ増加量 |

## 完了条件

- [ ] TTL expired フローのテストが追加されている
- [ ] IPC 通信失敗時のエラーハンドリングテストが追加されている
- [ ] 境界値テストが追加されている
- [ ] cleanup のメモリリークテストが追加されている
- [ ] 既存の governance-bundle テストが引き続き GREEN である
- [ ] 全追加テストが GREEN である
- [ ] `outputs/phase-6/coverage-report.md` が作成されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 7: カバレッジ確認](./phase-7-coverage-check.md)
