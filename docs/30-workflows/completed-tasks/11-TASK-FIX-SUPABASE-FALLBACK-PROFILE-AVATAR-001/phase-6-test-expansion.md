# Phase 6: テスト拡充

## メタ情報

| 項目      | 値                                            |
| --------- | --------------------------------------------- |
| Phase     | 6                                             |
| タスクID  | TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 |
| 機能名    | supabase-fallback-profile-avatar              |
| 作成日    | 2026-03-07                                    |
| 前提Phase | Phase 5 実装（GREEN確認済み）                 |

## 目的

Phase 5の実装に対して、カバレッジ不足箇所を特定し、境界値・異常系・エッジケースのテストを追加する。

## 実行タスク

- Task 1: カバレッジ不足分析: fallback 実装後に残る未検証パスを洗い出す
- Task 2: 追加テストケース: error code 一貫性や件数同期の回帰テストを拡充する
- Task 3: 回帰テスト（チャンネル数同期検証）: `channels.ts` と fallback 配列のズレ検知を追加する

### Task 1: カバレッジ不足分析

Phase 4のテストで未カバーの領域を特定:

| 観点         | 追加テストケース                 | 理由                                                                                |
| ------------ | -------------------------------- | ----------------------------------------------------------------------------------- |
| 境界値       | 空のチャンネルリストでの動作     | 将来の変更でリストが空になった場合の安全性                                          |
| エッジケース | フォールバックハンドラの戻り値型 | `Promise<unknown>` が正しく解決されることの確認                                     |
| セキュリティ | エラーコード形式の一貫性         | `PROFILE_ERROR_CODES.NOT_CONFIGURED` / `AVATAR_ERROR_CODES.NOT_CONFIGURED` の値検証 |
| 回帰防止     | 新規チャンネル追加時の検出       | `channels.ts` のProfile/Avatarチャンネル数とフォールバック数の一致検証              |

### Task 2: 追加テストケース

| #    | テストケース                                                               | 期待結果                 |
| ---- | -------------------------------------------------------------------------- | ------------------------ |
| T-E1 | Profile フォールバックのチャンネル数が `channels.ts` のProfile定数数と一致 | 定数数 = ハンドラ数 = 11 |
| T-E2 | Avatar フォールバックのチャンネル数が `channels.ts` のAvatar定数数と一致   | 定数数 = ハンドラ数 = 3  |
| T-E3 | Profile レスポンスの `error.code` が `profile/not-configured` 固定         | 全チャンネルで同一コード |
| T-E4 | Avatar レスポンスの `error.code` が `avatar/not-configured` 固定           | 全チャンネルで同一コード |
| T-E5 | フォールバックレスポンスの `success` が `false` 固定                       | boolean false            |
| T-E6 | フォールバックレスポンスに `data` プロパティが存在しない                   | `data` が undefined      |

### Task 3: 回帰テスト（チャンネル数同期検証）

```typescript
it("should cover all PROFILE channels defined in IPC_CHANNELS", () => {
  const profileChannels = Object.entries(IPC_CHANNELS)
    .filter(([key]) => key.startsWith("PROFILE_"))
    .map(([, value]) => value);

  registerProfileFallbackHandlers();

  const registeredChannels = (ipcMain.handle as Mock).mock.calls.map(
    (call) => call[0],
  );

  expect(registeredChannels).toEqual(expect.arrayContaining(profileChannels));
  expect(registeredChannels.length).toBe(profileChannels.length);
});
```

このテストは、`channels.ts` に新しいProfile チャンネルが追加された際に、フォールバックの追加漏れを自動検出する。

## 参照資料

| 資料名            | パス                                                                                                          | 説明             |
| ----------------- | ------------------------------------------------------------------------------------------------------------- | ---------------- |
| Phase 4 テスト    | `docs/30-workflows/completed-tasks/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/phase-4-test-creation.md` | 既存テストケース |
| Phase 5 実装      | `apps/desktop/src/main/ipc/index.ts`                                                                          | 実装コード       |
| IPCチャンネル定数 | `apps/desktop/src/preload/channels.ts`                                                                        | チャンネル定義   |

### システム仕様（aiworkflow-requirements）

- `references/error-handling.md` - エラーコード体系

### 前提Phase成果物

| 資料名          | パス                | 用途                                |
| --------------- | ------------------- | ----------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | Phase 1 の出力を入力として参照する  |
| Phase 2 成果物  | `outputs/phase-2/`  | Phase 2 の出力を入力として参照する  |
| Phase 3 成果物  | `outputs/phase-3/`  | Phase 3 の出力を入力として参照する  |
| Phase 4 成果物  | `outputs/phase-4/`  | Phase 4 の出力を入力として参照する  |
| Phase 5 成果物  | `outputs/phase-5/`  | Phase 5 の出力を入力として参照する  |
| Phase 6 成果物  | `outputs/phase-6/`  | Phase 6 の出力を入力として参照する  |
| Phase 7 成果物  | `outputs/phase-7/`  | Phase 7 の出力を入力として参照する  |
| Phase 8 成果物  | `outputs/phase-8/`  | Phase 8 の出力を入力として参照する  |
| Phase 9 成果物  | `outputs/phase-9/`  | Phase 9 の出力を入力として参照する  |
| Phase 10 成果物 | `outputs/phase-10/` | Phase 10 の出力を入力として参照する |
| Phase 11 成果物 | `outputs/phase-11/` | Phase 11 の出力を入力として参照する |
| Phase 12 成果物 | `outputs/phase-12/` | Phase 12 の出力を入力として参照する |

## 実行手順

1. Phase 5実装のカバレッジレポートを確認
2. 未カバー箇所を特定
3. 追加テストケース（T-E1〜T-E6）を実装
4. 回帰テスト（チャンネル数同期検証）を実装
5. 全テスト実行して GREEN を確認

## 統合テスト連携

- Phase 4 の基本契約テストに加え、Profile / Avatar の全チャンネルで error code が固定されることを拡張テストで確認する
- `channels.ts` 変更時に自動で検知できるよう、定数件数と登録件数の同期テストを回帰項目として保持する
- Phase 11 の代表操作で使う `profile:get` / `avatar:upload` 以外もテスト網羅し、手動確認依存を減らす

## 成果物

| 成果物             | パス                                                            | 説明             |
| ------------------ | --------------------------------------------------------------- | ---------------- |
| 拡充テストファイル | `apps/desktop/src/main/ipc/__tests__/fallback-handlers.test.ts` | 追加テストケース |

## 完了条件

- [ ] 追加テストケース6件（T-E1〜T-E6）が実装済み
- [ ] 回帰テスト（チャンネル数同期検証）が実装済み
- [ ] 全テスト（Phase 4 + Phase 6）が GREEN
- [ ] カバレッジが Phase 7 の基準を満たす見込み

## 次のPhase

Phase 7: カバレッジ確認
