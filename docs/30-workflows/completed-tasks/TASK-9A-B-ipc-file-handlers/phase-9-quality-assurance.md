# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 9                              |
| Phase名    | 品質保証                       |
| タスクID   | TASK-9A-B                      |
| 前提Phase  | Phase 8（リファクタリング）    |
| 後続Phase  | Phase 10（最終レビューゲート） |
| ステータス | 完了                           |
| 作成日     | 2026-02-19                     |
| 機能名     | TASK-9A-B-ipc-file-handlers    |

---

## 目的

静的解析、型チェック、セキュリティ検証、テスト実行の4観点からコード品質を検証する。
プロジェクト品質基準（Line Coverage 80%+、Branch Coverage 60%+）を満たしていることを確認する。

## 背景

IPCハンドラーはセキュリティ境界に位置するため、通常の品質検証に加えてセキュリティ固有の検証が必須である。
パストラバーサル防止、送信元検証、エラーサニタイズの3点を重点的に検証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Lint 検証

**目的**: ESLint ルールへの準拠を確認する

**実行手順**:

1. ESLint を実行する
2. エラー・警告を確認する
3. 問題があれば修正する
4. 再度 Lint を実行して確認する

**コマンド**:

```bash
# Lint 実行（desktopパッケージ）
pnpm --filter @repo/desktop lint

# 自動修正
pnpm --filter @repo/desktop lint --fix
```

**検証対象ファイル**:

| ファイル                                     | 確認項目                           |
| -------------------------------------------- | ---------------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | 新規6ハンドラーのLintクリア        |
| `apps/desktop/src/preload/skill-api.ts`      | 新規6メソッドのLintクリア          |
| `apps/desktop/src/preload/channels.ts`       | チャンネル定数追加部分のLintクリア |
| `apps/desktop/src/preload/types.ts`          | 型定義追加部分のLintクリア         |
| `packages/shared/src/ipc/channels.ts`        | 共有チャンネル定数のLintクリア     |

**期待される成果物**:

- `outputs/phase-9/lint-report.md`

---

### タスク2: 型チェック検証

**目的**: TypeScript の型エラーがないことを確認する

**実行手順**:

1. TypeScript コンパイラを実行する
2. 型エラーを確認する
3. `preload/types.ts` と `skillHandlers.ts` の型整合性を確認する
4. `packages/shared/src/ipc/channels.ts` と `apps/desktop/src/preload/channels.ts` のチャンネル定数整合性を確認する

**コマンド**:

```bash
# 型チェック実行
pnpm --filter @repo/desktop typecheck

# shared パッケージも確認
pnpm --filter @repo/shared typecheck
```

**型整合性チェックポイント**:

| チェック項目                 | 確認内容                                                          |
| ---------------------------- | ----------------------------------------------------------------- |
| preload/types.ts の引数型    | 6メソッド全ての引数型が `skillHandlers.ts` のハンドラー引数と一致 |
| preload/types.ts の戻り値型  | 6メソッド全ての戻り値型がハンドラーのレスポンス型と一致           |
| channels.ts のチャンネル定数 | `IPC_CHANNELS` に6チャンネルが定義されている                      |
| ALLOWED_INVOKE_CHANNELS      | 6チャンネルがホワイトリストに追加されている                       |

**期待される成果物**:

- `outputs/phase-9/typecheck-report.md`

---

### タスク3: セキュリティ検証

**目的**: IPCハンドラーのセキュリティ要件が全て満たされていることを確認する

**実行手順**:

1. 全6ハンドラーで `validateIpcSender()` が実施されていることを確認する
2. パス引数を受け取るハンドラーで `validatePath` が実施されていることを確認する
3. 全catchブロックで `sanitizeErrorMessage` が使用されていることを確認する
4. チャンネル名がハードコード文字列ではなく `IPC_CHANNELS` 定数で参照されていることを確認する

**セキュリティチェックリスト**:

| チャンネル            | validateIpcSender | validatePath | sanitizeErrorMessage | IPC_CHANNELS定数参照 |
| --------------------- | ----------------- | ------------ | -------------------- | -------------------- |
| `skill:readFile`      | -                 | -            | -                    | -                    |
| `skill:writeFile`     | -                 | -            | -                    | -                    |
| `skill:createFile`    | -                 | -            | -                    | -                    |
| `skill:deleteFile`    | -                 | -            | -                    | -                    |
| `skill:listBackups`   | -                 | -            | -                    | -                    |
| `skill:restoreBackup` | -                 | -            | -                    | -                    |

**パストラバーサル検証コマンド**:

```bash
# パストラバーサルテストが含まれていることを確認
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose --grep "path traversal\|パストラバーサル\|\.\\.\/"
```

**ハードコード文字列検出コマンド**:

```bash
# safeInvokeでハードコード文字列が使われていないか確認
grep -rn "safeInvoke\|safeOn" apps/desktop/src/preload/skill-api.ts | grep -v "IPC_CHANNELS"
```

**期待される成果物**:

- `outputs/phase-9/security-report.md`

---

### タスク4: テスト実行・カバレッジ確認

**目的**: 全テストが成功し、カバレッジ基準を満たしていることを確認する

**実行手順**:

1. 全テストを実行する
2. カバレッジレポートを確認する
3. カバレッジ基準との照合を行う
4. 基準未達の場合はPhase 6に戻る

**コマンド**:

```bash
# テスト実行（カバレッジ付き）
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --coverage --reporter=verbose
```

**カバレッジ基準**:

| 指標              | 最低基準 | 推奨基準 | 実績 | 判定 |
| ----------------- | -------- | -------- | ---- | ---- |
| Line Coverage     | 80%      | 90%      | -    | -    |
| Branch Coverage   | 60%      | 70%      | -    | -    |
| Function Coverage | 80%      | 90%      | -    | -    |

**期待される成果物**:

- `outputs/phase-9/test-coverage-report.md`

---

### タスク5: 品質ゲート総合判定

**目的**: 全ての品質基準を満たしているか総合判定する

**実行手順**:

1. タスク1〜4の結果を統合する
2. 品質基準との照合を行う
3. 判定結果を記録する

**品質ゲートチェックリスト**:

#### 機能検証

- [ ] 全ユニットテスト成功
- [ ] 6ハンドラー全てのテストがPASS

#### コード品質

- [ ] Lint エラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み

#### テスト網羅性

- [ ] Line Coverage 80%+ 達成
- [ ] Branch Coverage 60%+ 達成
- [ ] Function Coverage 80%+ 達成

#### セキュリティ

- [ ] 全ハンドラーで validateIpcSender 実施確認済み
- [ ] パス引数のバリデーション実施確認済み
- [ ] エラーサニタイズ実施確認済み
- [ ] ハードコード文字列なし確認済み

#### 判定結果

| 品質項目      | 結果 |
| ------------- | ---- |
| Lint          | -    |
| TypeCheck     | -    |
| Security      | -    |
| Test/Coverage | -    |
| **総合判定**  | -    |

**期待される成果物**:

- `outputs/phase-9/quality-gate-result.md`

---

## 参照資料

| 参照資料          | パス                                                         | 内容                   |
| ----------------- | ------------------------------------------------------------ | ---------------------- |
| IPCハンドラー実装 | `apps/desktop/src/main/ipc/skillHandlers.ts`                 | Main Processハンドラー |
| Preload API       | `apps/desktop/src/preload/skill-api.ts`                      | Preload API実装        |
| テストファイル    | `apps/desktop/src/main/ipc/__tests__/skillHandlers*.test.ts` | テストコード           |
| ESLint設定        | `.eslintrc.*`                                                | Lintルール             |
| TypeScript設定    | `tsconfig.json`                                              | 型チェック設定         |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                         | 内容             |
| ---------------- | ---------------------------------------------------------------------------- | ---------------- |
| セキュリティ原則 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | IPC セキュリティ |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | 品質基準         |

---

## 成果物

| 成果物               | パス                                      | 内容             |
| -------------------- | ----------------------------------------- | ---------------- |
| Lintレポート         | `outputs/phase-9/lint-report.md`          | Lint結果         |
| 型チェックレポート   | `outputs/phase-9/typecheck-report.md`     | 型チェック結果   |
| セキュリティレポート | `outputs/phase-9/security-report.md`      | セキュリティ確認 |
| テスト・カバレッジ   | `outputs/phase-9/test-coverage-report.md` | テスト結果       |
| 品質ゲート結果       | `outputs/phase-9/quality-gate-result.md`  | 総合判定         |

---

## 統合テスト連携

> 品質保証で統合テスト結果を確認する

| 確認項目                 | 基準                                 |
| ------------------------ | ------------------------------------ |
| 全テスト                 | 100% パス                            |
| セキュリティテスト       | パストラバーサル・sender検証全件PASS |
| エラーハンドリングテスト | エラーサニタイズ確認済み             |

---

## 完了条件

- [ ] Lint エラーがない
- [ ] 型エラーがない
- [ ] セキュリティレビューが完了している（全6ハンドラーで4項目確認済み）
- [ ] 全テストが成功している
- [ ] カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を達成している
- [ ] 品質ゲートの全項目をパスしている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（5ファイル）が全て生成されていることを確認
- [ ] 品質ゲート全項目PASSを確認

---

## 依存関係

- **前提**: Phase 8 が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-9A-B-ipc-file-handlers/phase-10-final-review.md`
