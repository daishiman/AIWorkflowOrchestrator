# Phase 9: 品質検証

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 9                            |
| 機能名 | slide-runtime-alignment-impl |
| 作成日 | 2026-03-22                   |
| Issue  | #1363                        |

## 目的

Phase 5〜8 で実施した実装とリファクタリングの品質を、ESLint・TypeScript 型チェック・テスト実行・legacy チャネル名残存確認の4段階で検証する。全チェックが PASS することを Phase 10 への進行条件とする。

## 実行タスク

| タスク | 内容                        | 期待結果      |
| ------ | --------------------------- | ------------- |
| Q-1    | ESLint チェック             | 0 errors      |
| Q-2    | TypeScript 型チェック       | 0 errors      |
| Q-3    | slide 関連テスト実行        | 全テスト PASS |
| Q-4    | shared パッケージビルド確認 | ビルド成功    |
| Q-5    | legacy チャネル名の残存確認 | 0 件          |

## 参照資料

| 資料名           | パス                                                                      |
| ---------------- | ------------------------------------------------------------------------- |
| Phase 1 要件書   | `docs/30-workflows/slide-runtime-alignment-impl/phase-01-requirements.md` |
| Phase 2 設計書   | `docs/30-workflows/slide-runtime-alignment-impl/phase-02-design.md`       |
| コード品質ルール | `.claude/rules/02-code-quality.md`                                        |
| Git & ツーリング | `.claude/rules/07-git-and-tooling.md`                                     |

## 実行手順

### Q-1: ESLint チェック

```bash
pnpm --filter @repo/desktop lint
```

**期待結果**: エラー 0 件、警告の対応が完了していること。

**よくある失敗パターン**:

- `@typescript-eslint/no-unused-vars`: Phase 8 の import 整理漏れ
- `@typescript-eslint/no-explicit-any`: 型キャストで `any` を使用した箇所
- `no-console`: デバッグ用 `console.log` の削除漏れ

**対処**: 指摘箇所を修正してから再実行する。`--no-verify` は使用禁止（CLAUDE.md 参照）。

---

### Q-2: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

**期待結果**: エラー 0 件。

**よくある失敗パターン**:

- `HandoffGuidance` 型が `packages/shared/src/slide/types.ts` に追加されているが、`apps/desktop` 側の import が古い型定義を参照している（P32 対策: 2ファイル同時更新必須）
- `SkillPhase` の `never` チェック（R-2 で追加した switch 文の `default` 節）で型エラーが出る場合は、`SkillPhase` 型の定義を確認する
- `slideSlice` に追加した新規 store fields の型が `SlideSliceState` interface と一致しているか確認する

**対処**: 型エラーを全て解消してから次のステップへ進む。型アサーション（`as`）での回避は禁止（`.claude/rules/02-code-quality.md` 参照）。

---

### Q-3: slide 関連テスト実行

```bash
cd apps/desktop && pnpm vitest run src/main/slide/
```

**期待結果**: 全テスト PASS。

**テスト実行ディレクトリの注意** (P40 対策):

- 必ず `apps/desktop/` ディレクトリに移動してから実行すること
- プロジェクトルートから実行すると `vitest.config.ts` の environment 設定が読み込まれず失敗する

**よくある失敗パターン**:

- `validateIpcSender` のモック未更新（P21: DI 追加時のモック大規模修正）
- `RuntimeResolver` のモックが `integrated` / `handoff` 分岐に対応していない
- channel rename 後にテスト内のチャネル名文字列が旧 legacy 名のまま残っている

**個別サブスイートの確認**:

```bash
# ipc-handlers のテストのみ
cd apps/desktop && pnpm vitest run src/main/slide/ipc-handlers.test.ts

# skill-executor のテストのみ
cd apps/desktop && pnpm vitest run src/main/slide/skill-executor.test.ts

# slideSlice のテストのみ
cd apps/desktop && pnpm vitest run src/renderer/stores/slide/slideSlice.test.ts
```

---

### Q-4: shared パッケージビルド確認

```bash
pnpm --filter @repo/shared build
```

**目的**: `HandoffGuidance` 型など `packages/shared/src/slide/types.ts` に追加した型定義が、他パッケージから正しく import できることを確認する。

**期待結果**: ビルドエラーなし。

---

### Q-5: legacy チャネル名の残存確認

Phase 2 の Wave A で legacy チャネル名を rename したが、コードベース全体に旧名称が残存していないかを grep で確認する。

```bash
grep -rn "startWatching\|stopWatching\|getSyncStatus\|manualSync\|cancelExecution" apps/desktop/src/
```

**期待結果**: 0 件。出力がなければ完全に rename 完了。

**1件でも検出された場合の対処**:

1. 検出されたファイルと行番号を確認する
2. 正本チャネル名（`watch-start`, `watch-stop`, `sync-status`, `reverse-sync`, `cancel`）に修正する
3. 同一チャネル名を参照する Preload (`preload/channels.ts`, `preload/index.ts`) も同時に確認する（P44 対策）

**追加確認**: push チャネルの旧名称も確認する。

```bash
grep -rn "slide:syncStatusChanged\|slide:executionProgress" apps/desktop/src/
```

**期待結果**: 0 件（正本は `slide:sync-status-changed`, `slide:execution-progress`）。

---

**Q-5 追加確認**: Renderer 側の slideApi 呼び出しで旧メソッド名が残存していないか確認:

```bash
grep -rn "startWatching\|stopWatching\|getSyncStatus\|manualSync\|cancelExecution" apps/desktop/src/renderer/
```

---

### 全体確認: 受入基準との照合

Phase 1 で定義した受入基準に対して最終確認を行う。

| 受入基準 | 確認コマンド / 確認方法                                                                                                             | 結果 |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---- |
| AC-1     | `grep -n "registerSlideIpcHandlers" apps/desktop/src/main/ipc/index.ts`                                                             | -    |
| AC-2     | `grep -rn "slide:watch-start\|slide:watch-stop\|slide:sync-status\|slide:reverse-sync\|slide:cancel" apps/desktop/src/preload/`     | -    |
| AC-3     | `grep -n "isHandoff\|handoffGuidance\|HandoffGuidance" apps/desktop/src/main/slide/skill-executor.ts`                               | -    |
| AC-4     | `grep -n '"modifier"' apps/desktop/src/main/slide/skill-executor.ts`                                                                | -    |
| AC-5     | `grep -n "validateIpcSender" apps/desktop/src/main/slide/ipc-handlers.ts`                                                           | -    |
| AC-6     | `grep -n "detectPathTraversal\|trim()" apps/desktop/src/main/slide/ipc-handlers.ts`                                                 | -    |
| AC-7     | `grep -n "@anthropic-ai/sdk\|safeStorage\|ANTHROPIC_API_KEY" apps/desktop/src/main/slide/agent-client.ts`                           | -    |
| AC-8     | `grep -n "sanitizeError" apps/desktop/src/main/slide/ipc-handlers.ts`                                                               | -    |
| AC-9     | Q-2 の typecheck 結果                                                                                                               | -    |
| AC-10    | Q-3 のテスト結果                                                                                                                    | -    |
| AC-11    | `grep -n "syncDirection\|syncProgress\|syncError\|isHandoff\|handoffGuidance" apps/desktop/src/renderer/stores/slide/slideSlice.ts` | -    |

## 統合テスト連携

本 Phase の品質検証が完了し、全チェックが PASS した状態で Phase 10（最終レビュー）へ進む。

Q-3 で失敗したテストは必ず修正する（`.skip` を使う場合は Issue/TODO を作成すること）。

## 成果物

| 成果物       | パス                 | 説明                                        |
| ------------ | -------------------- | ------------------------------------------- |
| 品質検証結果 | Phase 9 完了判定記録 | lint / typecheck / test / build / grep 結果 |

## 完了条件

- [ ] `pnpm --filter @repo/desktop lint` が 0 errors で PASS する
- [ ] `pnpm --filter @repo/desktop typecheck` が 0 errors で PASS する
- [ ] `cd apps/desktop && pnpm vitest run src/main/slide/` で全テストが PASS する
- [ ] `pnpm --filter @repo/shared build` が成功する
- [ ] legacy チャネル名 (`startWatching`, `stopWatching`, `getSyncStatus`, `manualSync`, `cancelExecution`) の grep 結果が 0 件
- [ ] 全受入基準（AC-1〜AC-11）が grep またはテスト結果で確認済み

## 次のPhase

Phase 10（最終レビュー）へ進む。
