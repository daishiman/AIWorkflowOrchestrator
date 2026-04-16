# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 11                                      |
| タスクID   | TASK-SW-STREAM-001                      |
| 機能名     | skill-creator-service-progress-callback |
| 前提Phase  | Phase 10（PASS または MINOR）           |
| 後続Phase  | Phase 12                                |
| 作成日     | 2026-04-15                              |
| ステータス | pending                                 |

## 目的

自動テストでは確認できない実際の動作を手動で確認する。
`createSkill()` の `onProgress` コールバックが実際に呼び出されることを、
デバッグログやコンソール出力を通じて確認する。

## 実行タスク

- ローカル開発環境でのビルド確認
- コールバック呼び出しの動作確認（デバッグログ）
- TASK-SW-STREAM-002 との接続を想定した動作確認
- 手動テスト結果の記録

## 参照資料

| 資料名                | パス                                                          | 用途             |
| --------------------- | ------------------------------------------------------------- | ---------------- |
| 実装ファイル          | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | 確認対象コード   |
| Phase 10 レビュー結果 | `outputs/phase-10/final-review-result.md`                     | 申し送り事項確認 |

## 実行手順

### 1. ローカルビルド確認

```bash
# desktop パッケージのビルド確認
pnpm --filter @repo/desktop build
# 期待: ビルドエラーなし

# TypeScript 型チェック（最終確認）
pnpm --filter @repo/desktop typecheck
# 期待: 0 error
```

### 2. コールバック呼び出しの動作確認

本タスク（TASK-SW-STREAM-001）単体での手動テストでは、
`onProgress` コールバックの実際の呼び出しを以下の方法で確認する:

**方法A: デバッグログの一時追加（確認後に削除）**

```typescript
// SkillCreatorService.ts に一時的にデバッグログを追加
// ※確認後に必ず削除すること
const debugOnProgress = (progress: SkillCreatorProgressData) => {
  console.log("[STREAM-001 DEBUG]", progress);
};

// 実際の呼び出しで debugOnProgress を渡してテスト
await service.createSkill(options, debugOnProgress);
```

**方法B: 既存テストの実行結果で確認**

```bash
# verbose モードでテスト実行
pnpm --filter @repo/desktop exec vitest run --reporter=verbose \
  src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts
```

### 3. 手動テストチェックリスト

| 確認項目                                         | 確認方法                       | 結果    |
| ------------------------------------------------ | ------------------------------ | ------- |
| ビルドがエラーなしで完了すること                 | `pnpm build` の出力確認        | pending |
| `onProgress` が5回呼ばれることが確認できること   | デバッグログまたはテスト出力   | pending |
| 各段階のデータ（phase/percentage/message）が正確 | ログまたはテスト出力の目視確認 | pending |
| `onProgress` 未指定時にエラーが出ないこと        | デバッグ実行またはテスト確認   | pending |

### 4. TASK-SW-STREAM-002 との接続を想定した確認

TASK-SW-STREAM-002 では `skillCreatorHandlers.ts` で以下の接続を行う予定:

```typescript
// TASK-SW-STREAM-002 での接続イメージ（参考）
const skillDir = await skillCreatorService.createSkill(
  validatedArgs,
  (progress) => {
    sendSkillCreatorProgress(mainWindow, progress);
  },
);
```

本タスクの `onProgress` 引数がこの接続パターンに対応できることをコードレビューで確認する。

### 5. 手動テスト結果の記録

`outputs/phase-11/manual-test-result.md` に以下を記録:

- 実施した確認方法
- 各チェックリスト項目の結果
- 発見した問題（存在する場合）
- Phase 12 への申し送り事項

## 統合テスト連携【必須】

| 判定項目             | 基準                          | 結果    |
| -------------------- | ----------------------------- | ------- |
| ビルド成功           | エラーなし                    | pending |
| コールバック動作確認 | 5回の呼び出しが確認できること | pending |

## 多角的チェック観点

| 観点           | チェック内容                                                             |
| -------------- | ------------------------------------------------------------------------ |
| 実際の動作     | 自動テストが通るだけでなく、実際のコールバック呼び出しが確認できているか |
| 接続準備       | TASK-SW-STREAM-002 が本タスクを前提に実装できることをコードで確認したか  |
| デバッグコード | 手動確認用に追加したデバッグコードが確実に削除されているか               |

## 成果物

| 成果物         | パス                                     | 説明                         |
| -------------- | ---------------------------------------- | ---------------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | チェックリスト結果・申し送り |

## 完了条件

- [ ] ローカルビルドがエラーなしで完了した
- [ ] `onProgress` コールバックが5回呼ばれることを確認した
- [ ] 各段階のデータ（phase/percentage/message）の正確性を確認した
- [ ] `onProgress` 未指定時のエラーなし動作を確認した
- [ ] 一時追加したデバッグコードを削除した（追加した場合）
- [ ] `outputs/phase-11/manual-test-result.md` が作成されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. ローカルビルド確認
2. コールバック呼び出し動作確認（デバッグログまたはテスト出力）
3. 手動テストチェックリストの確認（4項目）
4. TASK-SW-STREAM-002 接続パターンのコードレビュー確認
5. デバッグコードの削除確認
6. 手動テスト結果の出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 12: ドキュメント更新
