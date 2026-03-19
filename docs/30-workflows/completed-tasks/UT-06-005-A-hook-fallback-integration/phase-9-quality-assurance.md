# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 9                                     |
| 機能名 | UT-06-005-A-hook-fallback-integration |
| 作成日 | 2026-03-17                            |

## 目的

Phase 8 リファクタリング完了後のコードに対して、Lint・TypeScript 型チェック・全テスト実行・セキュリティ確認をまとめて実施し、全品質ゲートを通過することを確認する。fail-closed 原則（NFR-101）が実装上で正しく機能していることを最終確認する。

## 実行タスク

- 自動テスト: 全テスト 275+ ケースが PASS であることを確認する
- Lint チェック: ESLint で lint エラーがないことを確認する
- 型チェック: TypeScript の型エラーがないことを確認する
- カバレッジ確認: Phase 7 の基準（Line 80%+, Branch 60%+, Function 80%+）を維持していることを確認する
- セキュリティ確認: fail-closed 原則が実装レベルで維持されているか最終確認する
- 品質ゲート判定: 全チェックの結果を集約し、PASS/FAIL を判定する

## 参照資料

| 資料名             | パス                                        | 説明                               |
| ------------------ | ------------------------------------------- | ---------------------------------- |
| Phase 8 成果物     | `outputs/phase-8/`                          | リファクタリング後のコード品質記録 |
| Phase 7 成果物     | `outputs/phase-7/coverage-result.md`        | カバレッジ基準値（維持すべき値）   |
| Phase 5 実装成果物 | `outputs/phase-5/implementation-summary.md` | 実装仕様の根拠と差分               |
| コード品質ルール   | `.claude/rules/02-code-quality.md`          | カバレッジ基準・コーディング規約   |
| セキュリティルール | `.claude/rules/04-electron-security.md`     | fail-closed・IPC セキュリティ原則  |
| Git・ツーリング    | `.claude/rules/07-git-and-tooling.md`       | コミット前チェックリスト           |

## 依存フェーズ

- Phase 8: `outputs/phase-8/refactoring-log.md`（リファクタリング観点での変更点）
- Phase 7: `outputs/phase-7/coverage-report.md`（カバレッジ基準）
- Phase 5: `outputs/phase-5/implementation-summary.md`（実装詳細）

### システム仕様（aiworkflow-requirements）

| 参照資料                            | パス                                                                                         | 内容                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------- |
| Permission フォールバックフロー詳細 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` | abort/skip/retry の分岐ロジックと型定義 |
| fail-closed セキュリティ要件        | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`              | フォールバック失敗時の安全側倒し原則    |

## 実行手順

### ステップ1: 自動テスト実行

```bash
# SkillExecutor 関連テスト全実行
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/

# 期待: 275+ ケース全 PASS（新規テスト含む）
```

**確認観点:**

| テストファイル                        | 期待ケース数 | 確認事項                            |
| ------------------------------------- | ------------ | ----------------------------------- |
| `SkillExecutor.hook-fallback.test.ts` | 新規追加分   | Phase 4-6 で追加したテストが全 PASS |
| その他 `SkillExecutor.*.test.ts`      | 既存 275+    | 既存テストに退行がないこと          |

### ステップ2: Lint チェック

```bash
# デスクトップアプリの lint 実行
pnpm --filter @repo/desktop lint

# または直接 ESLint を実行
pnpm --filter @repo/desktop exec eslint \
  src/main/services/skill/SkillExecutor.ts \
  src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts
```

**確認観点:**

| チェック項目             | 期待状態                              |
| ------------------------ | ------------------------------------- |
| ESLint エラー            | 0件                                   |
| ESLint 警告              | 0件（または既知の許容警告のみ）       |
| `no-unused-vars`         | 未使用の import/変数がないこと        |
| `@typescript-eslint/...` | TypeScript 固有のルール違反がないこと |

### ステップ3: TypeScript 型チェック

```bash
# デスクトップアプリの型チェック実行
pnpm --filter @repo/desktop typecheck

# または tsc 直接実行
pnpm --filter @repo/desktop exec tsc --noEmit
```

**確認観点:**

| チェック項目                                  | 期待状態                                     |
| --------------------------------------------- | -------------------------------------------- |
| TypeScript エラー                             | 0件                                          |
| `PermissionTimeoutError` の型                 | `Error` を継承し、`timeoutMs: number` を保持 |
| `handlePermissionCheck` の戻り値型            | `Promise<PreToolUseResult>` または同等の型   |
| `sendPermissionRequestWithTimeout` の戻り値型 | `Promise<SkillPermissionResponse>`           |

**P19/P48 チェック（型キャスト・non-null assertion）:**

```bash
# as any / ! の残存確認
grep -n "as any\|!\." \
  apps/desktop/src/main/services/skill/SkillExecutor.ts | grep -v "//.*!"
```

期待: 新規追加コード内に `as any` および不必要な `!` がないこと。

### ステップ4: カバレッジ確認（Phase 7 基準維持）

```bash
# カバレッジ測定
pnpm --filter @repo/desktop exec vitest run --coverage \
  src/main/services/skill/__tests__/
```

**判定テーブル:**

| 指標              | Phase 7 測定値 | 現在測定値 | 判定（維持/低下） |
| ----------------- | -------------- | ---------- | ----------------- |
| Line Coverage     | [Phase 7値]    | -          | -                 |
| Branch Coverage   | [Phase 7値]    | -          | -                 |
| Function Coverage | [Phase 7値]    | -          | -                 |

**期待**: Phase 7 の測定値以上。

### ステップ5: セキュリティ確認（fail-closed 原則）

#### 5-1. NFR-101 の実装確認

`handlePermissionCheck` 内のフォールバック処理の例外ハンドリングを確認する:

```bash
# fail-closed の実装箇所を確認
grep -A 5 -B 2 "executeAbortFlow\|fail-closed\|NFR-101" \
  apps/desktop/src/main/services/skill/SkillExecutor.ts
```

**確認チェックリスト:**

| NFR-ID  | 確認内容                                                     | 期待状態           |
| ------- | ------------------------------------------------------------ | ------------------ |
| NFR-101 | フォールバック処理の例外時に `executeAbortFlow` が呼ばれるか | 実装されている     |
| NFR-102 | タイムアウト値のデフォルトが 30000ms か                      | 定数として定義済み |
| NFR-103 | abort フローの冪等性（二重 abort でエラー非発生）            | テストで確認済み   |

#### 5-2. IPC セキュリティ原則の確認

`04-electron-security.md` の IPC セキュリティ原則に準拠しているか確認する:

```bash
# ハードコード文字列でチャンネル名を指定していないか確認（P27対策）
grep -n '"skill:\|\"permission:' \
  apps/desktop/src/main/services/skill/SkillExecutor.ts
```

期待: チャンネル名はすべて `IPC_CHANNELS` 定数経由。

#### 5-3. 入力バリデーションの確認（P42 準拠）

`handlePermissionCheck` の引数バリデーションを確認する:

```bash
# バリデーション箇所の確認
grep -A 3 "handlePermissionCheck\|typeof.*string.*trim" \
  apps/desktop/src/main/services/skill/SkillExecutor.ts | head -30
```

P42 の3段バリデーション（型チェック → 空文字列 → トリム空文字列）が適用されているか確認する。

### ステップ6: 品質ゲート集約判定

全チェック結果を集約し、品質ゲートの PASS/FAIL を判定する:

| チェック項目              | 結果       | 判定 |
| ------------------------- | ---------- | ---- |
| 自動テスト（275+ ケース） | [実行結果] | -    |
| ESLint エラー 0件         | [実行結果] | -    |
| TypeScript 型エラー 0件   | [実行結果] | -    |
| Line Coverage 80%+        | [測定値]   | -    |
| Branch Coverage 60%+      | [測定値]   | -    |
| Function Coverage 80%+    | [測定値]   | -    |
| NFR-101 fail-closed 確認  | [確認結果] | -    |
| IPC チャンネル定数使用    | [確認結果] | -    |
| P42 入力バリデーション    | [確認結果] | -    |

**総合判定:**

| 総合結果      | 対応                                                                             |
| ------------- | -------------------------------------------------------------------------------- |
| 全 PASS       | Phase 10（最終レビュー）へ進む                                                   |
| いずれか FAIL | 対応する Phase へ戻る（テスト失敗→Phase 6、Lint/型→Phase 5、カバレッジ→Phase 6） |

## 統合テスト連携（Phase 1〜11は必須）

Phase 9 では以下の統合観点を最終確認する:

- 全 SkillExecutor テストが PASS（既存テスト + Phase 4-6 追加テスト）
- PreToolUse Hook の統合テスト（FR-001〜FR-003 との共存）が PASS
- `handlePermissionCheck` のタイムアウト統合テスト（vi.useFakeTimers + advanceTimersByTime）が PASS
- Lint・型チェックでコード品質が確認済み

## 多角的チェック観点

| 観点                   | 内容                                                                      | 参照先                           |
| ---------------------- | ------------------------------------------------------------------------- | -------------------------------- |
| テスト網羅性           | AC-001〜AC-007 の全受け入れ基準がテストでカバーされているか               | `outputs/phase-4/test-design.md` |
| fail-closed（NFR-101） | フォールバック処理の例外時に必ず abort フローに遷移するか                 | `security-skill-execution.md`    |
| IPC セキュリティ       | チャンネル名がホワイトリスト定数で管理されているか（P27）                 | `04-electron-security.md`        |
| 型安全（P42）          | 文字列引数の3段バリデーション（型・空文字・トリム）が実装されているか     | `06-known-pitfalls.md#P42`       |
| タイマーテスト（P13）  | `vi.runAllTimers()` を使わず `advanceTimersByTime()` でタイムアウトテスト | `06-known-pitfalls.md#P13`       |
| コード品質             | `any` 型・`@ts-ignore` の不使用が確認されているか                         | `02-code-quality.md`             |

**Electronデスクトップアプリ観点**:

| 層                   | 確認内容                                                               | 仕様参照先                                 |
| -------------------- | ---------------------------------------------------------------------- | ------------------------------------------ |
| バックエンド（Main） | SkillExecutor の Main Process 動作が正しく、全テストが PASS            | `architecture-overview.md`                 |
| IPC通信              | Permission 関連 IPC チャンネルのホワイトリスト管理                     | `04-electron-security.md`                  |
| Preload              | Permission レスポンスが contextBridge 経由で安全に受け渡しされているか | `interfaces-agent-sdk-executor-details.md` |

## 成果物

| 成果物               | パス                                     | 説明                                         |
| -------------------- | ---------------------------------------- | -------------------------------------------- |
| 品質チェック結果     | `outputs/phase-9/quality-gate-result.md` | 全品質ゲートの結果集約（PASS/FAIL 判定付き） |
| セキュリティ確認記録 | `outputs/phase-9/security-check.md`      | fail-closed・IPC セキュリティ確認結果        |
| テスト実行ログ       | `outputs/phase-9/test-execution-log.md`  | テスト実行結果の記録（ケース数・PASS率）     |

## 完了条件

- [ ] 自動テスト 275+ ケース全 PASS
- [ ] ESLint エラー 0件
- [ ] TypeScript 型エラー 0件
- [ ] Line Coverage 80% 以上（Phase 7 の値以上を維持）
- [ ] Branch Coverage 60% 以上（Phase 7 の値以上を維持）
- [ ] Function Coverage 80% 以上（Phase 7 の値以上を維持）
- [ ] NFR-101 fail-closed 原則の実装確認済み
- [ ] IPC チャンネル名がホワイトリスト定数経由であることを確認済み（P27）
- [ ] P42 の3段バリデーション実装確認済み
- [ ] 品質ゲート集約結果が全 PASS
- [ ] 成果物が `outputs/phase-9/` に記録済み
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase 実行開始時に、以下のサブタスクを作成すること:

1. 自動テスト実行（275+ ケース）
2. Lint チェック（ESLint）
3. TypeScript 型チェック
4. カバレッジ確認（Phase 7 基準維持）
5. セキュリティ確認（NFR-101 fail-closed、P27、P42）
6. 品質ゲート集約判定
7. 成果物の作成・配置
8. 完了条件の検証

## タスク100%実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-06-005-A-hook-fallback-integration --phase 9
```

## 次のPhase

- **全品質ゲート PASS**: Phase 10（最終レビュー）へ
- **いずれか FAIL**: 対応する Phase へ戻る
  - テスト失敗: Phase 6（テスト拡充）へ
  - Lint/型エラー: Phase 5（実装）または Phase 8（リファクタリング）へ
  - カバレッジ不足: Phase 6（テスト拡充）へ
