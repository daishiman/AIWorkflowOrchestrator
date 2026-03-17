# Phase 6: テスト拡充

## メタ情報

| 項目             | 内容                                         |
| ---------------- | -------------------------------------------- |
| Phase 番号       | 6                                            |
| 機能名           | PreToolUse Hook フォールバック統合テスト拡充 |
| タスク ID        | UT-06-005-A-hook-fallback-integration        |
| 作成日           | 2026-03-17                                   |
| 依存 Phase       | Phase 5（実装 - Green フェーズ）             |
| 担当エージェント | Phase6Writer                                 |

## 目的

Phase 4 の基本テスト（TC-A-001〜TC-A-006）を超えて、カバレッジ基準（Line: 80%、Branch: 60%、Function: 80%）を充足するためのテストを追加する。

- 境界値テスト（retryCount 境界）を追加する
- 異常系テスト（window 破棄状態、signal キャンセル）を追加する
- 既存 FR-001〜FR-003 との共存テストを追加する
- abort 冪等性テストを追加する
- タイムアウト設定のテストを追加する

## 実行タスク

- テスト拡充実装: `SkillExecutor.hook-fallback.test.ts` に拡充テストを追加する
- 境界値/異常系追加: 境界値・異常系・統合シナリオを網羅する
- カバレッジ確認: vitest のカバレッジレポートでブランチカバレッジを確認する
- Phase 7 接続準備: Phase 7 へ向けて基準達成を確認する

## 参照資料

| 資料名               | パス                                                                                 | 目的           |
| -------------------- | ------------------------------------------------------------------------------------ | -------------- |
| Phase 4 テスト成果物 | `outputs/phase-4/test-design.md`                                                     | 基本テスト確認 |
| Phase 5 実行レポート | `outputs/phase-5/execution-report.md`                                                | 実装詳細確認   |
| 既存テスト（拡充前） | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts` | 追加先ファイル |
| 既存 Fallback テスト | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.fallback.test.ts`      | 共存テスト参照 |
| SkillExecutor 実装   | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                              | カバレッジ対象 |
| コード品質ルール     | `.claude/rules/02-code-quality.md`                                                   | カバレッジ基準 |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`                                                 | P9/P13/P41     |

## 事前確認

### 既存ユーティリティ重複検出【必須】

Phase 6 で追加するテストヘルパー関数が既存テストファイルと重複しないか確認する:

```bash
grep -rn "export.*function.*createPermissionContext\|export.*function.*makePermissionResponse" packages/ apps/
grep -rn "export const.*permissionMock\|export const.*permissionHelper" packages/ apps/
```

### テスト対象ファイルの import 副作用チェック（Phase 4 から継続）

Phase 5 実装により `SkillExecutor.ts` にトップレベル副作用が追加されていないか確認する:

```bash
grep -n "^[^/]*\(app\.\|server\.\|connect\|initialize\|ipcMain\.\|BrowserWindow\)" apps/desktop/src/main/services/skill/SkillExecutor.ts | head -20
```

## 実行手順

### Step 1: 現在のカバレッジ確認

Phase 5 実装後の現在のカバレッジを計測する:

```bash
pnpm --filter @repo/desktop exec vitest run --coverage src/main/services/skill/SkillExecutor.ts 2>&1 | grep -A 10 "SkillExecutor"
```

カバレッジ目標（Phase 7 ゲート基準）:

- Line Coverage: 80% 以上（推奨: 90%）
- Branch Coverage: 60% 以上（推奨: 70%）
- Function Coverage: 80% 以上（推奨: 90%）

### Step 2: 境界値テストの追加

#### TC-B-001: retryCount=0 でのフォールバック動作

```
概要: 初回リクエスト（retryCount=0）で拒否応答が返ったとき、
      nextRetryCount=1 となり retry が返ること

前提条件:
  - waitForResponse が1回目は { approved: false } を返す
  - waitForResponse が2回目は { approved: true } を返す

期待結果:
  - sendPermissionRequest が2回呼ばれること
  - 最終的に proceed: true が返ること
```

#### TC-B-002: retryCount が PERMISSION_MAX_RETRIES-1 での動作

```
概要: 最大リトライ回数のひとつ前（PERMISSION_MAX_RETRIES-1）で
      retry の代わりに abort に遷移すること

前提条件:
  - waitForResponse が常に { approved: false } を返す
  - retryCount が PERMISSION_MAX_RETRIES-1 に達している状態

期待結果:
  - processPermissionFallback が { action: "abort", reason: "max_retries" } を返すこと
  - executeAbortFlow が "max_retries" で呼ばれること
```

#### TC-B-003: retryCount が PERMISSION_MAX_RETRIES に達した場合

```
概要: retryCount >= PERMISSION_MAX_RETRIES の場合、
      processPermissionFallback が abort を返すこと

期待結果:
  - nextRetryCount >= maxRetries の条件で abort に遷移すること
  - executeAbortFlow が "max_retries" で呼ばれること
```

#### TC-B-004: タイムアウト直前（PERMISSION_REQUEST_TIMEOUT_MS-1 ms）の正常応答

```
概要: タイムアウト時間の 1ms 前に正常応答が返った場合、
      タイムアウトが発生しないこと

前提条件:
  - vi.useFakeTimers()
  - waitForResponse が TIMEOUT-1ms 後に { approved: true } を返す

操作:
  - PreToolUse Hook を呼び出す
  - vi.advanceTimersByTime(TIMEOUT_MS - 1) で時間を進める

期待結果:
  - executeAbortFlow が呼ばれないこと
  - proceed: true が返ること
```

### Step 3: 異常系テストの追加

#### TC-C-001: mainWindow.isDestroyed() = true 時の Permission リクエスト送信

```
概要: mainWindow が破棄されている場合、
      sendPermissionRequest が IPC 送信をスキップすること

前提条件:
  - mockMainWindow.isDestroyed が true を返す
  - waitForResponse が { approved: true } を返す（IPC 不使用でも解決可能な場合）

期待結果:
  - mainWindow.webContents.send が呼ばれないこと
  - または PermissionTimeoutError がスローされること（応答が来ない場合）
```

#### TC-C-002: signal.aborted = true での早期終了

```
概要: AbortSignal が既にキャンセル済みの場合、
      Permission チェックが即座に終了すること

前提条件:
  - AbortController を作成して事前に abort() を呼ぶ
  - signal を PreToolUse Hook に渡す

期待結果:
  - Hook が abort 系の応答を返すこと
  - sendPermissionRequest が呼ばれないまたは早期終了すること
```

#### TC-C-003: processPermissionFallback が予期しない action を返した場合

```
概要: processPermissionFallback が未知の action 値を返したとき、
      fail-closed で abort に遷移すること

前提条件:
  - processPermissionFallback をスパイして { action: "unknown_action" } を返す

期待結果:
  - executeAbortFlow が "unknown" 引数で呼ばれること
  - Hook が abort 系の応答を返すこと
```

### Step 4: FR-001〜FR-003 との共存テストの追加

#### TC-D-001: 危険コマンドは FR-101 Permission チェック前にブロックされる

```
概要: 危険コマンド（rm -rf 等）は FR-001 でブロックされ、
      handlePermissionCheck が呼ばれないこと

前提条件:
  - input.toolName = "Bash"
  - input.args.command = "rm -rf /"

期待結果:
  - Hook が { proceed: false } を返すこと
  - sendPermissionRequest が呼ばれないこと（FR-001 で早期リターン）
```

#### TC-D-002: 保護パスへの書き込みは FR-101 Permission チェック前にブロックされる

```
概要: 保護パス（~/.ssh/config 等）への書き込みは FR-002 でブロックされ、
      handlePermissionCheck が呼ばれないこと

前提条件:
  - input.toolName = "Write"
  - input.args.file_path = "/etc/hosts"（保護パス）

期待結果:
  - Hook が { proceed: false } を返すこと
  - sendPermissionRequest が呼ばれないこと（FR-002 で早期リターン）
```

#### TC-D-003: 通常ツール実行では FR-001〜FR-003 後に Permission チェックが実行される

```
概要: 危険でない通常のツール実行では、FR-001〜FR-003 を経てから
      handlePermissionCheck が呼ばれること

前提条件:
  - input.toolName = "Read"
  - waitForResponse が { approved: true } を返す

期待結果:
  - sendHooksStream が FR-003 分1回呼ばれること
  - sendPermissionRequest が1回呼ばれること
  - Hook が { proceed: true } を返すこと
```

### Step 5: abort 冪等性テストの追加

#### TC-E-001: handlePermissionCheck 内での二重 abort

```
概要: handlePermissionCheck が abort した後に再度 PreToolUse Hook が呼ばれても、
      executeAbortFlow が2回呼ばれないこと（冪等性）

前提条件:
  - 1回目: waitForResponse が拒否応答、max_retries に達する
  - 2回目: 同じ executionId で PreToolUse Hook を再度呼ぶ

期待結果:
  - executeAbortFlow が追加で呼ばれないこと（abortedExecutions ガード）
```

### Step 6: タイムアウト設定テストの追加

#### TC-F-001: PERMISSION_REQUEST_TIMEOUT_MS の静的プロパティ確認

```
概要: PERMISSION_REQUEST_TIMEOUT_MS が正しい値（30000）であること

期待結果:
  - SkillExecutor.PERMISSION_REQUEST_TIMEOUT_MS === 30000

注意:
  - P41 対策: v8 カバレッジプロバイダはインライン定数アクセスを
    独立した実行パスとしてカウントする場合があるため、
    このテストで定数アクセスを明示的にカバーする
```

### Step 7: カバレッジ再計測

拡充テスト追加後にカバレッジを再計測して基準達成を確認する:

```bash
pnpm --filter @repo/desktop exec vitest run --coverage src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts
```

カバレッジが基準を下回る場合は、不足ブランチを特定して追加テストを実装する。

### Step 8: 全テストスイートの最終確認

追加テストが既存テストに影響しないことを確認する:

```bash
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/
```

## 統合テスト連携

| Phase | 役割                   | 成果物                                | 連携先              |
| ----- | ---------------------- | ------------------------------------- | ------------------- |
| 4     | Red テスト作成         | `SkillExecutor.hook-fallback.test.ts` | Phase 5             |
| 5     | 実装（Green 転換）     | `SkillExecutor.ts` 修正               | Phase 6（本 Phase） |
| 6     | テスト拡充（本 Phase） | 追加テストケース                      | Phase 7             |
| 7     | カバレッジ確認ゲート   | カバレッジレポート                    | Phase 8             |

## 多角的チェック観点

| 観点                | チェック内容                                                                         | 優先度 |
| ------------------- | ------------------------------------------------------------------------------------ | ------ |
| カバレッジ基準      | Line 80%、Branch 60%、Function 80% を達成すること                                    | 必須   |
| P9 対策             | テスト間で状態が共有されないこと（beforeEach で vi.clearAllMocks()）                 | 必須   |
| P13 対策            | タイムアウトテストで advanceTimersByTime を使用（runAllTimers 禁止）                 | 必須   |
| P41 対策            | インライン関数・定数アクセスを明示的にテストで実行すること                           | 高     |
| 境界値網羅          | retryCount=0, 1, PERMISSION_MAX_RETRIES-1, PERMISSION_MAX_RETRIES の全境界値をテスト | 高     |
| FR-001〜FR-003 共存 | 既存のセキュリティチェックが FR-101 より先に実行されることを検証                     | 高     |
| 冪等性テスト        | 二重 abort でエラーが発生しないことを検証                                            | 高     |
| テスト独立性        | 各テストケースが独立していること（実行順序に依存しない）                             | 必須   |
| 既存テスト維持      | `SkillExecutor.fallback.test.ts` の全 23 テストが引き続き PASS すること              | 必須   |

## 成果物

| 成果物名                   | 種別         | 格納先                                                                                        |
| -------------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| 拡充テストファイル         | コード       | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts`          |
| Phase 6 カバレッジレポート | ドキュメント | `docs/30-workflows/UT-06-005-A-hook-fallback-integration/outputs/phase-6/coverage-report.md`  |
| Phase 6 実行レポート       | ドキュメント | `docs/30-workflows/UT-06-005-A-hook-fallback-integration/outputs/phase-6/execution-report.md` |

## 完了条件

- [ ] TC-B-001〜TC-B-004（境界値テスト）が全て実装されていること
- [ ] TC-C-001〜TC-C-003（異常系テスト）が全て実装されていること
- [ ] TC-D-001〜TC-D-003（FR-001〜FR-003 共存テスト）が全て実装されていること
- [ ] TC-E-001（abort 冪等性テスト）が実装されていること
- [ ] TC-F-001（タイムアウト設定テスト）が実装されていること
- [ ] Line Coverage が 80% 以上であること
- [ ] Branch Coverage が 60% 以上であること
- [ ] Function Coverage が 80% 以上であること
- [ ] 追加テストを含む全テストが PASS すること
- [ ] 既存の `SkillExecutor.fallback.test.ts` の全テストが引き続き PASS すること
- [ ] Phase 6 カバレッジレポートが作成されていること
- [ ] 本 Phase 内の全タスクを 100% 実行完了していること

## サブタスク管理

| サブタスク ID | 内容                                                | ステータス |
| ------------- | --------------------------------------------------- | ---------- |
| ST-6-1        | 現在のカバレッジ計測                                | completed  |
| ST-6-2        | 境界値テスト（TC-B-001〜TC-B-004）実装              | completed  |
| ST-6-3        | 異常系テスト（TC-C-001〜TC-C-003）実装              | completed  |
| ST-6-4        | FR-001〜FR-003 共存テスト（TC-D-001〜TC-D-003）実装 | completed  |
| ST-6-5        | abort 冪等性テスト（TC-E-001）実装                  | completed  |
| ST-6-6        | タイムアウト設定テスト（TC-F-001）実装              | completed  |
| ST-6-7        | カバレッジ再計測・基準確認                          | completed  |
| ST-6-8        | 全テストスイート最終確認                            | completed  |
| ST-6-9        | Phase 6 カバレッジレポート・実行レポート作成        | completed  |

## タスク 100% 実行確認【必須】

Phase 6 完了検証コマンド:

```bash
# 拡充テストケース数確認（Phase 4 の 6 件 + 拡充分 = 合計 17 件以上を目安）
grep -c "it(" apps/desktop/src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts

# 全テスト PASS 確認
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts 2>&1 | tail -20

# 既存テスト維持確認
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillExecutor.fallback.test.ts 2>&1 | tail -10

# カバレッジ確認（基準: Line 80%, Branch 60%, Function 80%）
pnpm --filter @repo/desktop exec vitest run --coverage src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts 2>&1 | grep -E "(SkillExecutor|All files|Line|Branch|Function)"

# 境界値テスト存在確認
grep -n "retryCount\|PERMISSION_MAX_RETRIES\|boundary\|境界" apps/desktop/src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts

# 成果物確認
node -e "
const fs = require('fs');
const checks = [
  'docs/30-workflows/UT-06-005-A-hook-fallback-integration/outputs/phase-6/coverage-report.md',
  'docs/30-workflows/UT-06-005-A-hook-fallback-integration/outputs/phase-6/execution-report.md',
];
checks.forEach(f => {
  const exists = fs.existsSync(f);
  console.log((exists ? '[OK]' : '[NG]') + ' ' + f);
});
"
```

## 次の Phase

Phase 7: カバレッジ確認（`phase-7-coverage-check.md`）

- カバレッジ基準（Line 80%、Branch 60%、Function 80%）の最終確認
- 基準未達の場合は Phase 6 に戻って追加テストを実装する
- 基準達成の場合は Phase 8（リファクタリング）に進む
