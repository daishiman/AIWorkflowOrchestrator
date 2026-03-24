# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| Phase    | 4                          |
| 機能名   | safety-gate-preload-api    |
| タスクID | UT-06-003-PRELOAD-API-IMPL |
| 作成日   | 2026-03-23                 |
| 前提     | Phase 3 設計レビュー PASS  |

## 目的

SafetyGate Preload API の `evaluateSafety` メソッドに対するテストを作成する。TDD の Red フェーズとして、実装前にテストを書く。

## 実行タスク

- 事前確認: 既存ユーティリティ重複検出・IPC レスポンス形式の事前合意・import 副作用チェック
- テストファイル作成: T-1〜T-6 のテストケースを作成
- Red 確認: テスト実行し、実装前のため FAIL であることを確認

## 参照資料

| 資料名             | パス                                           | 説明                   |
| ------------------ | ---------------------------------------------- | ---------------------- |
| Phase 2 設計書     | `phase-2-design.md`                            | テスト設計（T-1〜T-6） |
| Phase 3 レビュー   | `phase-3-design-review.md`                     | レビュー PASS 確認     |
| 既存テストパターン | `preload/__tests__/skill-api.contract.test.ts` | モック構成の参考       |
| チャンネル定義     | `preload/channels.ts`                          | IPC_CHANNELS 定数      |

## 実行手順

### ステップ 0: 事前確認（必須）

#### 既存ユーティリティ重複検出

```bash
grep -rn "export.*function.*evaluateSafety" packages/ apps/
grep -rn "export const evaluateSafety" packages/ apps/
```

#### IPC レスポンス形式の事前合意

| 形式                                                          | 適用 | 根拠                            |
| ------------------------------------------------------------- | ---- | ------------------------------- |
| `{ success: true, data: T }` / `{ success: false, error: E }` | 採用 | Main ハンドラがラップ形式を使用 |

#### import 副作用チェック

```bash
grep -n "^[^/]*\(app\.\|server\.\|connect\|initialize\|ipcMain\.\|BrowserWindow\)" apps/desktop/src/preload/skill-api.ts
```

### ステップ 1: テストファイル作成

テストファイル: `apps/desktop/src/preload/__tests__/skill-api.evaluateSafety.test.ts`

#### モック構成

```typescript
vi.mock("../ipc-utils", () => ({
  invokeWithTimeout: vi.fn(),
}));

vi.mock("../channels", () => ({
  IPC_CHANNELS: {
    SKILL_EVALUATE_SAFETY: "skill:evaluate-safety",
  },
  ALLOWED_INVOKE_CHANNELS: ["skill:evaluate-safety"],
  ALLOWED_ON_CHANNELS: [],
}));
```

#### テストケース

| ID  | テスト名                                                     | カテゴリ         | 検証内容                                        |
| --- | ------------------------------------------------------------ | ---------------- | ----------------------------------------------- |
| T-1 | evaluateSafety が SKILL_EVALUATE_SAFETY チャンネルで呼ばれる | 正常系           | `invokeWithTimeout` の第2引数がチャンネル定数   |
| T-2 | skillName 引数が正しく渡される                               | 正常系           | `invokeWithTimeout` の第3引数が `skillName`     |
| T-3 | safeInvoke の戻り値がそのまま返される                        | 正常系           | ラップ形式 `{ success, data }` が変換なしで返る |
| T-4 | SKILL_EVALUATE_SAFETY がホワイトリストに含まれる             | セキュリティ     | `ALLOWED_INVOKE_CHANNELS` に存在                |
| T-5 | evaluateSafety が skillAPI オブジェクトに存在する            | インターフェース | `typeof skillAPI.evaluateSafety === 'function'` |
| T-6 | invokeWithTimeout のエラーが伝搬する                         | 異常系           | reject された Error がそのまま throw される     |

**注意**: P40（テスト実行ディレクトリ依存）対策として、テストは `apps/desktop/` ディレクトリから実行する。

### ステップ 2: テスト実行（Red 確認）

```bash
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.evaluateSafety.test.ts
```

| テスト | 期待結果 | 理由                  |
| ------ | -------- | --------------------- |
| T-1    | FAIL     | evaluateSafety 未実装 |
| T-2    | FAIL     | evaluateSafety 未実装 |
| T-3    | FAIL     | evaluateSafety 未実装 |
| T-4    | PASS     | チャンネルは追加済み  |
| T-5    | FAIL     | evaluateSafety 未実装 |
| T-6    | FAIL     | evaluateSafety 未実装 |

## 統合テスト連携

| 確認項目           | 内容                             | Phase 4 での対応                |
| ------------------ | -------------------------------- | ------------------------------- |
| テスト設計の網羅性 | 正常系/異常系/セキュリティを網羅 | T-1〜T-6 で MECE にカバー       |
| モック構成         | 既存テストパターンに準拠         | skill-api.contract.test.ts 参照 |
| レスポンス形式合意 | テスト期待値がラップ形式と一致   | P60 準拠で設計済み              |

## 多角的チェック観点（AIが判断）

| 観点               | 適用 | 確認内容                                |
| ------------------ | ---- | --------------------------------------- |
| セキュリティ       | 該当 | T-4 でホワイトリスト確認                |
| API設計            | 該当 | T-5 でインターフェース存在確認          |
| エラーハンドリング | 該当 | T-6 でエラー伝搬確認                    |
| IPC通信            | 該当 | T-1, T-2 でチャンネル・引数の正確性確認 |

## サブタスク管理

1. 事前確認（ユーティリティ重複・レスポンス形式・import 副作用）
2. テストファイル作成（T-1〜T-6）
3. テスト実行（Red 確認）
4. 完了条件の検証

## 成果物

| 成果物         | パス                                                                  | 説明           |
| -------------- | --------------------------------------------------------------------- | -------------- |
| テストファイル | `apps/desktop/src/preload/__tests__/skill-api.evaluateSafety.test.ts` | Preload テスト |
| テスト設計記録 | `docs/30-workflows/safety-gate-preload-api/phase-4-test-creation.md`  | 本ドキュメント |

## 完了条件

- [x] 事前確認（ユーティリティ重複・レスポンス形式・import 副作用）が完了している
- [x] テストファイルが作成されている
- [x] テスト実行が可能（Red 状態で OK）
- [x] T-4（ホワイトリスト確認）が PASS している
- [x] T-1, T-2, T-3, T-5, T-6 が FAIL（実装前のため正常）
- [x] テストケースが Phase 2 設計の T-1〜T-6 と一致している
- [x] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 5: 実装（TDD: Green）
