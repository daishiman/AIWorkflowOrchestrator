# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 9                             |
| タスクID   | UNASSIGNED-EMB-005-A          |
| タスク名   | XenovaTransformerEncoder 実装 |
| ステータス | 完了                          |
| 作成日     | 2026-04-20                    |
| 前Phase    | 8: リファクタリング           |
| 次Phase    | 10: 最終レビュー              |

---

## 目的

Phase 5〜8 の成果物に対し、TypeScript strict / ESLint / Vitest / ビルド / Prettier / セキュリティ / パフォーマンスの 7 観点で品質ゲートを実行し、Issue #2312 の AC-8（全テスト PASS / typecheck PASS）と CLAUDE.md の品質基準を満たすことを保証する。品質メトリクスは `outputs/phase-9/quality-report.md` に集約し、Phase 10 への進行可否を判定する。

---

## 実行タスク

### タスク1: TypeScript 型チェック（strict）

```bash
pnpm --filter @repo/shared typecheck
```

**合格基準**: `error TS` が 0 件、`xenova-transformer-encoder.ts` 内の `any` 出現が 0 件。出力を `outputs/phase-9/typecheck.log` に保存。

---

### タスク2: ESLint 静的解析

```bash
pnpm lint
```

**合格基準**: `0 errors` かつ `0 warnings`。`eslint-disable` の新規追加は禁止し、警告は原則コード修正で解消する。例外的な無効化はチケット起票し `quality-report.md` に理由を明記。出力を `outputs/phase-9/lint.log` に保存。

---

### タスク3: Vitest 全テスト実行

```bash
pnpm --filter @repo/shared test -- --run
```

**合格基準**: 全テスト PASS（FAIL = 0）。`xenova-transformer-encoder.test.ts` と `late-chunking-service.test.ts`（統合）の PASS 件数 / 実行時間を記録。skipped テストはチケット番号付きでのみ許容。出力を `outputs/phase-9/test.log` に保存。

---

### タスク4: ビルド検証

```bash
pnpm --filter @repo/shared build
```

**合格基準**: ビルドエラーゼロ、出力先に `xenova-transformer-encoder.{js,d.ts}` 相当が存在。出力を `outputs/phase-9/build.log` に保存。

---

### タスク5: Prettier フォーマット整合確認

```bash
pnpm prettier --check \
  packages/shared/src/services/embedding/late-chunking/xenova-transformer-encoder.ts \
  packages/shared/src/services/embedding/late-chunking/types/xenova-types.ts \
  packages/shared/src/services/embedding/late-chunking/__tests__/xenova-transformer-encoder.test.ts
```

**合格基準**: `All matched files use Prettier code style!`。差分が出た場合は `--write` で修正し再 check する。

---

### タスク6: セキュリティ観点レビュー

| 項目ID | 観点                                                                                | 判定 |
| ------ | ----------------------------------------------------------------------------------- | ---- |
| S-01   | コンストラクタの `modelName` が外部入力（IPC / ユーザ入力）から流入しないことを確認 |      |
| S-02   | `modelName` のサニタイズ（`Xenova/` プレフィックス / 文字種制限）の必要性を評価     |      |
| S-03   | モデルダウンロード元が HuggingFace Hub であり、信頼境界が文書化されている           |      |
| S-04   | ダウンロード失敗時にスタックトレースに認証情報が含まれない                          |      |
| S-05   | `cause` 経由のログ出力に機密情報（API キー等）が混入しない                          |      |
| S-06   | `pnpm audit` で `@xenova/transformers` 系の高 / 重大脆弱性が 0 件                   |      |

各項目に「OK / 改善要 / 該当なし」を記入し、改善要は緩和策（呼び出し側 allowlist / 入力バリデーション）を記録。`pnpm audit` 結果を `outputs/phase-9/audit.log` に保存。

---

### タスク7: パフォーマンス観点レビュー

| 項目ID | 観点                                                                                            | 判定 |
| ------ | ----------------------------------------------------------------------------------------------- | ---- |
| P-01   | `loadModel()` が冪等で、2 回目以降の `encode()` で再ロードが発生しない                          |      |
| P-02   | 並行 `encode()` 呼び出し時の二重ロード防止策（Promise キャッシュ）の有無と判断根拠が文書化済み  |      |
| P-03   | `Float32Array.slice()` により元テンソルが GC 可能（参照保持していない）                         |      |
| P-04   | `EncoderOutput.hiddenStates` が `seqLen` 個の `Float32Array` として返り、ストリーミング処理可能 |      |
| P-05   | 大入力時の OOM 検知パスが 2 系統（loadModel / encode）に存在                                    |      |
| P-06   | テスト実行時に実モデルをロードしておらず、CI 時間に実モデルダウンロードが含まれない             |      |

任意計測: モック使用時の `encode()` 単体実行時間（10 回平均）を `outputs/phase-9/perf-bench.log` に記録、p50 < 50ms（モック前提）を目標とする。

---

### タスク8: 品質ゲートの最終判定

**品質ゲートチェックリスト**:

#### コード品質

- [ ] `pnpm --filter @repo/shared typecheck` でエラーゼロ
- [ ] `pnpm lint` で エラー / 警告ゼロ
- [ ] `pnpm prettier --check` で差分ゼロ

#### テスト品質

- [ ] `pnpm --filter @repo/shared test -- --run` で全テスト PASS
- [ ] Phase 7 のカバレッジ 4 指標が 80% 以上を維持

#### ビルド

- [ ] `pnpm --filter @repo/shared build` 成功
- [ ] `xenova-transformer-encoder` が出力に含まれる

#### セキュリティ

- [ ] S-01〜S-06 すべて「OK」または緩和策実施済み
- [ ] `pnpm audit` で高 / 重大脆弱性 0 件

#### パフォーマンス

- [ ] P-01〜P-06 すべて「OK」または許容判断済み

全項目チェックされた場合のみ Phase 10 へ進む。未達項目があれば原因 Phase（5/6/8）に戻す。

---

## 参照資料

| 参照資料                        | パス                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| Phase 7 カバレッジレポート      | `outputs/phase-7/coverage-report.md`                                                 |
| Phase 8 リファクタリングログ    | `outputs/phase-8/refactoring-log.md`                                                 |
| Vitest 設定                     | `packages/shared/vitest.config.ts`                                                   |
| プロジェクト規約                | `CLAUDE.md`                                                                          |
| Issue #2312 AC-8                | `gh issue view 2312 --repo daishiman/AIWorkflowOrchestrator`                         |
| `xenova-transformer-encoder.ts` | `packages/shared/src/services/embedding/late-chunking/xenova-transformer-encoder.ts` |
| system spec 正本                | `.claude/skills/aiworkflow-requirements/references/api-internal-embedding.md`        |

---

## 成果物

| 成果物             | パス                                     | 内容                                             |
| ------------------ | ---------------------------------------- | ------------------------------------------------ |
| 品質レポート       | `outputs/phase-9/quality-report.md`      | typecheck/lint/test/build/prettier/sec/perf 集約 |
| typecheck ログ     | `outputs/phase-9/typecheck.log`          | コマンド出力スナップショット                     |
| ESLint ログ        | `outputs/phase-9/lint.log`               | コマンド出力スナップショット                     |
| テストログ         | `outputs/phase-9/test.log`               | Vitest 実行結果                                  |
| ビルドログ         | `outputs/phase-9/build.log`              | ビルド成果                                       |
| pnpm audit ログ    | `outputs/phase-9/audit.log`              | 脆弱性スキャン結果                               |
| パフォーマンスログ | `outputs/phase-9/perf-bench.log`（任意） | encode() 実行時間ベンチ                          |

---

## 統合テスト連携

- `LateChunkingService` × `XenovaTransformerEncoder` の統合テスト（AC-6）が `pnpm --filter @repo/shared test -- --run` 内で PASS することを確認
- ビルド成果物に `XenovaTransformerEncoder` が含まれ、`@repo/shared` を依存する側（`apps/desktop` など）からの import が壊れないことを保証
- セキュリティ・パフォーマンス観点の判定結果を Phase 11（手動テスト）の検証項目へ引き継ぐ

---

## 多角的チェック観点

| 観点                   | チェック内容                                                                            |
| ---------------------- | --------------------------------------------------------------------------------------- |
| typecheck の対象範囲   | `@repo/shared` 全体（テスト・型補助ファイル含む）が対象になっているか                   |
| lint の警告許容方針    | 警告 0 件を維持し、`eslint-disable` を新規追加していないか                              |
| test 実行の再現性      | 同一コマンドで複数回実行しても結果が安定するか（flaky の有無）                          |
| ビルド成果物の整合     | export 増分（`XenovaTransformerEncoder`）が `dist` の type 定義にも反映されているか     |
| セキュリティの信頼境界 | モデル名外部入力経路の有無を「無し」と断言できるか、または allowlist が用意されているか |
| パフォーマンスの現実性 | 計測が「モック前提」であることを明記し、実モデルロード性能は scope-out できているか     |
| AC-1〜AC-8 のカバー    | 本 Phase で検証可能な AC（特に AC-8）を全て扱っているか                                 |
| `--no-verify` 不使用   | コミット時に `--no-verify` を使用していないことを確認（CLAUDE.md ルール）               |

---

## サブタスク管理

| サブタスクID | 内容                       | ステータス |
| ------------ | -------------------------- | ---------- |
| ST-9-01      | TypeScript 型チェック      | 未実施     |
| ST-9-02      | ESLint 静的解析            | 未実施     |
| ST-9-03      | Vitest 全テスト実行        | 未実施     |
| ST-9-04      | ビルド検証                 | 未実施     |
| ST-9-05      | Prettier フォーマット確認  | 未実施     |
| ST-9-06      | セキュリティ観点レビュー   | 未実施     |
| ST-9-07      | パフォーマンス観点レビュー | 未実施     |
| ST-9-08      | 品質ゲート最終判定         | 未実施     |

---

## ゲート判定

| 判定基準                        | 条件               | 次のアクション                              |
| ------------------------------- | ------------------ | ------------------------------------------- |
| 全 8 タスクの合格基準を満たす   | 品質達成           | Phase 10 へ進む                             |
| typecheck エラー残存            | 型不整合           | Phase 8 / Phase 5 へ差し戻し                |
| lint エラー / 警告残存          | 静的解析未達       | Phase 8 へ差し戻し（または当 Phase 内修正） |
| 任意のテスト FAIL               | テスト未達         | Phase 6 へ差し戻し                          |
| ビルド失敗                      | パッケージング不可 | Phase 5 / Phase 8 へ差し戻し                |
| セキュリティ重大脆弱性検出      | 高リスク           | Phase 8 で緩和策実装                        |
| パフォーマンス OOM 検知パス欠落 | 設計準拠不足       | Phase 5 / Phase 8 へ差し戻し                |

---

## 完了条件

- [ ] `pnpm --filter @repo/shared typecheck` でエラーゼロ
- [ ] `pnpm lint` でエラー / 警告ゼロ
- [ ] `pnpm --filter @repo/shared test -- --run` で全テスト PASS
- [ ] `pnpm --filter @repo/shared build` 成功
- [ ] `pnpm prettier --check` で差分ゼロ
- [ ] セキュリティ S-01〜S-06 がすべて判定済み
- [ ] パフォーマンス P-01〜P-06 がすべて判定済み
- [ ] `outputs/phase-9/quality-report.md` が生成され、品質ゲートチェックリストが完了している

---

## タスク100%実行確認【必須】

- [ ] 本Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UNASSIGNED-EMB-005-A-xenova-transformer-encoder/phase-10-final-review.md`
