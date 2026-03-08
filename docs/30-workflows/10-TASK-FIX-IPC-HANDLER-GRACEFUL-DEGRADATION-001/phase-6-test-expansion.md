# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                                            |
| -------- | --------------------------------------------- |
| Phase    | 6                                             |
| タスクID | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 |
| 機能名   | ipc-handler-graceful-degradation              |
| 作成日   | 2026-03-07                                    |

## 目的

Phase 4 の基本テストに加えて、カバレッジ不足箇所のテストを追加する。異常系の網羅性を高め、エッジケースと実際の障害シナリオに対応するテストを追加する。

## 実行タスク

- カバレッジ分析: 現時点のカバレッジを計測し、不足箇所を特定する
- エッジケーステスト追加: 実際の障害シナリオに基づくテストを追加する
- 依存チェーンテスト追加: サービス初期化失敗時の影響範囲テストを追加する

## 参照資料

| 資料名         | パス                                                                   | 説明           |
| -------------- | ---------------------------------------------------------------------- | -------------- |
| テストファイル | `apps/desktop/src/main/ipc/__tests__/ipc-graceful-degradation.test.ts` | Phase 4 成果物 |
| IPC index      | `apps/desktop/src/main/ipc/index.ts`                                   | テスト対象     |

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

### ステップ1: カバレッジ計測

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/ipc/__tests__/ipc-graceful-degradation.test.ts src/main/ipc/__tests__/safe-register.test.ts
```

### ステップ2: 追加テストケース

| テストID | カテゴリ     | テスト名                                                            | 検証内容                                    |
| -------- | ------------ | ------------------------------------------------------------------- | ------------------------------------------- |
| T-13     | 障害シナリオ | SkillService 初期化失敗で Skill 系ハンドラが未登録                  | Auth 系ハンドラは正常に登録される           |
| T-14     | 障害シナリオ | electron-store コンストラクタ例外                                   | Store 依存外のハンドラが正常に登録される    |
| T-15     | 依存チェーン | authKeyService 初期化後のハンドラ登録で authKeyService が共有される | 同一インスタンスが複数ハンドラで使用される  |
| T-16     | 非同期       | SkillScheduler.initialize の非同期エラーがハンドラ登録に影響しない  | `void skillScheduler.initialize()` は非同期 |
| T-17     | 戻り値       | successCount + failureCount が全ハンドラ数と一致する                | 数値の整合性                                |
| T-18     | セキュリティ | エラーメッセージにファイルパスが含まれない                          | NFR-02 検証                                 |

### ステップ3: テスト実行と確認

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/ipc/__tests__/
```

## 統合テスト連携

- T-13/T-14 で実際の障害シナリオの影響範囲を検証する
- T-15 で依存サービスの共有パターンを検証する

## 成果物

| 成果物             | パス                                                                   | 説明         |
| ------------------ | ---------------------------------------------------------------------- | ------------ |
| 拡充テスト         | `apps/desktop/src/main/ipc/__tests__/ipc-graceful-degradation.test.ts` | テスト追加分 |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                                   | 計測結果     |

## 完了条件

- [ ] T-13〜T-18 のテストケースが追加されている
- [ ] 全テスト（T-01〜T-18）が Green
- [ ] カバレッジレポートが生成されている
- [ ] `safeRegister` のブランチカバレッジが 100%
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: カバレッジ確認
