# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 8                                 |
| 機能名 | safety-gov-production-integration |
| 作成日 | 2026-03-31                        |

## 目的

Phase 5 実装の品質を向上させる。DI パターンの統一・重複コードの除去・TODO コメントの解消を行う。
リファクタリング後も全テストが PASS であることを確認する。

## 実行タスク

- Main / Preload / Renderer の責務境界を崩す重複実装がないか確認する
- ApprovalGate DI と execution namespace の命名・型・戻り値形式を統一する
- TODO / dead path / temporary workaround を整理し、Before/After/理由テーブルへ落とす
- リファクタ後に targeted suite を再実行し、回帰がないことを確認する

### 1. TODO コメントの解消

Phase 5 実装時に残した TODO（getProviderName, getModelName, getDestinations, getTerminalLog, getCopyCommand のプレースホルダー実装）を実際の DI ソースに置き換える。

```bash
grep -n "TODO" apps/desktop/src/main/ipc/index.ts | head -20
```

変更記録テーブル（Before/After/理由）:

| 対象            | Before                  | After                  | 理由             |
| --------------- | ----------------------- | ---------------------- | ---------------- |
| getProviderName | `() => "anthropic"`     | 実際のサービスから取得 | ハードコード解消 |
| getModelName    | `() => "claude-sonnet"` | 実際のサービスから取得 | ハードコード解消 |
| getTerminalLog  | `() => ""`              | 実際のサービスから取得 | ハードコード解消 |
| getCopyCommand  | `() => ""`              | 実際のサービスから取得 | ハードコード解消 |

### 2. DI パターンの統一確認

```bash
# 既存の SafetyGate DI パターンと比較
grep -n "DefaultSafetyGate\|safetyGate" apps/desktop/src/main/ipc/index.ts
```

`DefaultApprovalGate` の生成パターンが `DefaultSafetyGate` と一致しているか確認し、統一する。

### 3. リファクタリング後のテスト確認

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop test
```

## 参照資料

| 参照資料                   | パス                                        |
| -------------------------- | ------------------------------------------- |
| Phase 5 実装サマリー       | `outputs/phase-5/implementation-summary.md` |
| Phase 7 カバレッジレポート | `outputs/phase-7/coverage-report.md`        |

## 統合テスト連携【必須】

| 判定項目                  | 基準       | 結果（実行時に記録） |
| ------------------------- | ---------- | -------------------- |
| リファクタ後全テスト PASS | 100%       | -                    |
| typecheck PASS            | エラー 0件 | -                    |

## 成果物

| 成果物               | パス                                 | 説明                      |
| -------------------- | ------------------------------------ | ------------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | Before/After/理由テーブル |

## 完了条件

- [ ] TODO コメントが解消されている
- [ ] DI パターンが既存コードと統一されている
- [ ] リファクタリング後も全テストが PASS
- [ ] typecheck がエラー 0件
- [ ] `outputs/phase-8/refactoring-log.md` に Before/After/理由テーブルが記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 9: 品質保証
