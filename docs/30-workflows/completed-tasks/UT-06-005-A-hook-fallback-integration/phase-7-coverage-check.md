# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 7                                     |
| 機能名 | UT-06-005-A-hook-fallback-integration |
| 作成日 | 2026-03-17                            |

## 目的

Phase 4-6 で作成・拡充したテストのカバレッジを測定し、SkillExecutor.ts の `handlePermissionCheck`・`sendPermissionRequestWithTimeout`・`PermissionTimeoutError` が規定基準（Line 80%+, Branch 60%+, Function 80%+）を満たしていることを確認する。未達の場合は Phase 6 に戻りテストを追加する。

## 実行タスク

- カバレッジ測定: Vitest の v8 カバレッジプロバイダで SkillExecutor.ts のカバレッジを取得する
- 判定: 測定結果を基準テーブルと照合し、PASS/FAIL を判定する
- 未達対応: FAIL の場合は不足箇所を特定し、Phase 6 に戻る指示を記録する
- 結果記録: 測定結果を成果物として記録する

## 参照資料

| 資料名                      | パス                                     | 説明                               |
| --------------------------- | ---------------------------------------- | ---------------------------------- |
| Phase 5 成果物              | `outputs/phase-5/execution-report.md`    | 実装結果（TC/フェイル安全化）      |
| Phase 6 成果物              | `outputs/phase-6/`                       | テスト拡充後の最新テスト群         |
| Phase 4 テスト設計書        | `outputs/phase-4/test-design.md`         | テスト設計書（カバレッジ設計含む） |
| コード品質ルール            | `.claude/rules/02-code-quality.md`       | カバレッジ基準定義                 |
| v8カバレッジ落とし穴（P41） | `.claude/rules/06-known-pitfalls.md#P41` | インライン関数カウントに関する注意 |

### システム仕様（aiworkflow-requirements）

| 参照資料                      | パス                                                                                         | 内容                                  |
| ----------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------- |
| Permission フォールバック詳細 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` | abort/skip/retry 分岐ロジックと型定義 |
| fail-closed セキュリティ要件  | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`              | フォールバック失敗時の安全側倒し原則  |

## 実行手順

### ステップ1: カバレッジ測定コマンドの実行

以下のコマンドでカバレッジを測定する:

```bash
# SkillExecutor 関連テスト全体のカバレッジ測定
pnpm --filter @repo/desktop exec vitest run --coverage \
  src/main/services/skill/__tests__/

# 特定のテストファイルに絞って測定する場合
pnpm --filter @repo/desktop exec vitest run --coverage \
  src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts
```

**カバレッジレポートの出力先:**

```
apps/desktop/coverage/
  ├── index.html         # HTMLレポート（ブラウザで閲覧可能）
  └── coverage-final.json
```

### ステップ2: 測定対象ファイルの確認

カバレッジ測定の主対象は以下のファイル:

| 測定対象ファイル                                        | 対象クラス/関数                                            |
| ------------------------------------------------------- | ---------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts` | `handlePermissionCheck`                                    |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts` | `sendPermissionRequestWithTimeout`                         |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts` | `PermissionTimeoutError`（クラス定義とコンストラクタ）     |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts` | PreToolUse Hook 内の Permission チェック挿入箇所（FR-101） |

### ステップ3: カバレッジ基準の確認

#### 基準テーブル

| 指標              | 最低基準 | 推奨基準 | 判定   |
| ----------------- | -------- | -------- | ------ |
| Line Coverage     | 80%      | 90%      | [記録] |
| Branch Coverage   | 60%      | 70%      | [記録] |
| Function Coverage | 80%      | 90%      | [記録] |

#### 測定結果テーブル（実行後に記録）

| 指標              | 測定値 | 最低基準 | 判定（PASS/FAIL） |
| ----------------- | ------ | -------- | ----------------- |
| Line Coverage     | -      | 80%      | -                 |
| Branch Coverage   | -      | 60%      | -                 |
| Function Coverage | -      | 80%      | -                 |

### ステップ4: P41 準拠チェック（v8 カバレッジのインライン関数）

**P41 の教訓**: Vitest の v8 カバレッジプロバイダはインライン arrow function を独立した関数としてカウントする。オプションオブジェクト内のコールバックが実行されないと Function Coverage が大幅低下する。

以下の箇所を確認する:

```bash
# SkillExecutor.ts 内のインライン関数箇所を確認
grep -n "=>\|callback\|getAllowedWindows" \
  apps/desktop/src/main/services/skill/SkillExecutor.ts | head -30
```

P41 対策として、セキュリティテストでコールバックの戻り値を明示的に検証しているか確認する。

### ステップ5: カバレッジ不足箇所の特定（FAIL 時）

カバレッジが基準未達の場合、以下の手順で不足箇所を特定する:

```bash
# カバレッジHTMLレポートで未カバー行を特定
open apps/desktop/coverage/index.html

# または JSON レポートで確認
cat apps/desktop/coverage/coverage-final.json | \
  python3 -c "import json,sys; d=json.load(sys.stdin); \
  [print(k, v['s']) for k,v in d.items() if 'SkillExecutor' in k]"
```

未カバーの分岐・行を記録し、Phase 6 へ戻る指示を作成する。

### ステップ6: 既存テストの回帰確認

新規テストで既存テストが壊れていないことを確認:

```bash
# 全 SkillExecutor テストを実行
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/

# 期待: 275+ ケースを含む全テストが PASS
```

### ステップ7: 判定と次フェーズへの遷移

| カバレッジ結果 | 対応                                |
| -------------- | ----------------------------------- |
| 全指標 PASS    | Phase 8（リファクタリング）へ進む   |
| いずれか FAIL  | Phase 6（テスト拡充）へ戻り追加する |

## 統合テスト連携（Phase 1〜11は必須）

Phase 7 では以下の統合観点を確認する:

- `handlePermissionCheck` の全分岐（approved/skip/retry/abort/timeout）のカバレッジ
- `sendPermissionRequestWithTimeout` のタイムアウト分岐カバレッジ
- `PermissionTimeoutError` のコンストラクタ実行カバレッジ
- PreToolUse Hook 内の Permission チェック条件分岐（permissionStore が null の場合を含む）

## 多角的チェック観点

| 観点             | 内容                                                              | 参照先                                     |
| ---------------- | ----------------------------------------------------------------- | ------------------------------------------ |
| カバレッジ品質   | インライン関数のカウント漏れがないか（P41）                       | `06-known-pitfalls.md#P41`                 |
| セキュリティ分岐 | fail-closed 分岐（NFR-101）が全テストでカバーされているか         | `security-skill-execution.md`              |
| タイマーテスト   | タイムアウトテストで vi.runAllTimers() を使用していないか（P13）  | `06-known-pitfalls.md#P13`                 |
| 境界値           | retry 回数の境界値（0回、最大回数、最大+1回）がカバーされているか | `02-code-quality.md`                       |
| 異常系           | フォールバック処理自体の例外（NFR-101）がテストされているか       | `interfaces-agent-sdk-executor-details.md` |

**Electronデスクトップアプリ観点**:

| 層                   | 確認内容                                           | 仕様参照先                                 |
| -------------------- | -------------------------------------------------- | ------------------------------------------ |
| バックエンド（Main） | Main Process 内の SkillExecutor テストが全 PASS    | `architecture-overview.md`                 |
| IPC通信              | IPC 依存モックの設定が確認済みであることを検証する | `interfaces-agent-sdk-executor-details.md` |

## 成果物

| 成果物                 | パス                                  | 説明                                       |
| ---------------------- | ------------------------------------- | ------------------------------------------ |
| カバレッジ測定結果     | `outputs/phase-7/coverage-result.md`  | 測定値・判定結果・未達箇所リスト（あれば） |
| カバレッジ判定サマリー | `outputs/phase-7/coverage-summary.md` | PASS/FAIL 判定と次フェーズへの遷移指示     |

## 完了条件

- [ ] カバレッジ測定コマンドを実行し、結果を取得済み
- [ ] Line Coverage が 80% 以上
- [ ] Branch Coverage が 60% 以上
- [ ] Function Coverage が 80% 以上
- [ ] P41（v8 インライン関数カウント）の影響を確認・対処済み
- [ ] 既存テスト 275+ ケースが全 PASS
- [ ] カバレッジ測定結果を `outputs/phase-7/` に記録済み
- [ ] 判定結果に基づき Phase 8 または Phase 6 への遷移判断が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase 実行開始時に、以下のサブタスクを作成すること:

1. カバレッジ測定コマンドの実行
2. 測定対象ファイル・関数の確認
3. カバレッジ基準の判定
4. P41 準拠チェック（インライン関数カウント）
5. カバレッジ不足箇所の特定（FAIL 時）
6. 既存テストの回帰確認（275+ケース全 PASS 確認）
7. 判定と次フェーズへの遷移決定
8. 成果物の作成・配置
9. 完了条件の検証

## タスク100%実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-06-005-A-hook-fallback-integration --phase 7
```

## 次のPhase

- **カバレッジ全指標 PASS**: Phase 8（リファクタリング）へ
- **いずれか FAIL**: Phase 6（テスト拡充）へ戻る
