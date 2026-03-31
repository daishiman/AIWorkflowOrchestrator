# UT-10-disclosureHandlers-standalone-test: disclosureHandlers.ts 独立テスト追加

## メタ情報

| 項目       | 値                                                                        |
| ---------- | ------------------------------------------------------------------------- |
| ステータス | 未着手                                                                    |
| 優先度     | 低                                                                        |
| 起票日     | 2026-03-31                                                                |
| 起票元     | safety-gov-production-integration Phase 12 / unassigned-task-detection.md |
| 関連タスク | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001                           |
| Issue番号  | #1612（UT-IMP-SAFETY-GOV-DISCLOSURE-TEST-001と重複・既存Issue参照）       |

## 1. なぜこのタスクが必要か（Why）

`safety-gov-production-integration` では approval / preload / lifecycle 側の
統合テストを先に完了したが、`disclosureHandlers.ts` の独立テストが存在しない。

disclosure handler は dismiss / reopen / state 取得の3つの操作を持つが、
これらを単独で検証するテストがないため、今後の仕様変更時に
regression を早期検出できない品質ゲートの欠如が残っている。

## 2. 何を達成するか（What）

`disclosureHandlers.ts` の独立テストファイルを追加し、
sender 検証・P42 バリデーション・state 遷移を単体で検証する。

### 受入基準

- `disclosureHandlers.ts` の単独テストファイルが追加されている
- sender 検証の正常系/異常系が含まれる
- P42 バリデーション（IPC sender frame 検証）の正常系/異常系が含まれる
- state 遷移（dismissed → shown、shown → dismissed）の正常系が含まれる
- テストカバレッジが `disclosureHandlers.ts` 全行をカバーする

### 対象ファイル

| ファイル                                                                     | 内容           |
| ---------------------------------------------------------------------------- | -------------- |
| `apps/desktop/src/main/ipc/disclosureHandlers.ts`                            | テスト対象     |
| `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts`（新規作成） | テストファイル |

## 3. どのように実行するか（How）

1. `disclosureHandlers.ts` の実装を確認し、テスト対象 API を整理する
   - `registerDisclosureHandlers()` の登録パターン
   - dismiss / reopen / getState の各ハンドラー
2. IPC mock を用いた単体テストを作成する
   ```typescript
   // 例: sender 検証テスト
   it("should reject invalid sender", () => {
     const invalidSender = { frameId: -1 };
     expect(() => handler(event, {})).toThrow();
   });
   ```
3. P42 バリデーション（`validateIpcSender()`）のテストケースを追加する
4. state 遷移テストを追加する（dismissed ↔ shown の往復）
5. `pnpm --filter @repo/desktop test` でテストが通ることを確認する

## 4. 苦戦箇所の記録（safety-gov-production-integration より）

### 統合テスト優先による単体テスト不足

- **問題**: 統合テストが先に完成すると、単体テストの追加が後回しになりやすい。
  disclosure handler は他のハンドラーと組み合わせてのみテストされていた
- **解決方法（未解決）**: 独立テストファイルの追加が必要
- **教訓**: 新規ハンドラー追加時は「独立テスト先行」ルールを
  Phase 4 テンプレートに明記することで防止できる
