# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                                            |
| -------- | --------------------------------------------- |
| Phase    | 8                                             |
| タスクID | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 |
| 機能名   | ipc-handler-graceful-degradation              |
| 作成日   | 2026-03-07                                    |

## 目的

Phase 5 の実装をコード品質の観点から改善する。TDD の Refactor フェーズとして、動作を変えずにコードの可読性・保守性を向上させる。

## 実行タスク

- コード整理: `safeRegister` とハンドラ登録コードの可読性を改善する
- 型定義の配置: 型定義を適切なファイルに分離するかどうかを判断する
- 重複排除: ハンドラ登録パターンの重複を削減する

## 参照資料

| 資料名         | パス                                       | 説明             |
| -------------- | ------------------------------------------ | ---------------- |
| 実装コード     | `apps/desktop/src/main/ipc/index.ts`       | リファクタ対象   |
| 品質基準       | `.claude/rules/02-code-quality.md`         | コーディング規約 |
| 実装レポート   | `outputs/phase-5/implementation-report.md` | Phase 5 成果物   |
| カバレッジ結果 | `outputs/phase-7/coverage-result.md`       | Phase 7 成果物   |

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

### ステップ1: リファクタリング候補の特定

| 候補                                 | 判断基準                                            | 対応 |
| ------------------------------------ | --------------------------------------------------- | ---- |
| 型定義を別ファイルに分離             | 型定義が3つ以下かつ index.ts 内で完結する場合は不要 | 判断 |
| ハンドラ登録のグルーピング（配列化） | 依存なしグループは配列ループで簡潔にする            | 実施 |
| `safeRegister` を別ファイルに分離    | 他のファイルから再利用する予定がない場合は不要      | 不要 |
| ログ出力のフォーマットを定数化       | フォーマット文字列が2箇所以上で使用される場合       | 判断 |

### ステップ2: ハンドラ登録のグルーピング

依存なしハンドラを配列化して登録ループで処理する:

```typescript
// 依存なしハンドラの配列化（可読性向上）
const independentHandlers: [string, () => void][] = [
  ["registerFileHandlers", registerFileHandlers],
  ["registerStoreHandlers", registerStoreHandlers],
  ["registerDashboardHandlers", registerDashboardHandlers],
  // ...
];

for (const [name, fn] of independentHandlers) {
  if (safeRegister(name, fn, failures)) successCount++;
}
```

### ステップ3: テスト実行（リグレッション確認）

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/
```

全テストが Green のまま維持されていることを確認する。

## 統合テスト連携

- リファクタリング後も全テストが Green であることを確認する
- `registerAllIpcHandlers` の動作が変わっていないことを確認する

## 成果物

| 成果物               | パス                                 | 説明           |
| -------------------- | ------------------------------------ | -------------- |
| リファクタ後コード   | `apps/desktop/src/main/ipc/index.ts` | 改善済み実装   |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md` | 変更内容の記録 |

## 完了条件

- [ ] リファクタリング候補が評価されている
- [ ] 実施したリファクタリングが記録されている
- [ ] 全テストが Green（リグレッションなし）
- [ ] コードの可読性が Phase 5 時点から改善されている
- [ ] 不要なリファクタリング（過剰な抽象化）を行っていない
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 9: 品質検証
