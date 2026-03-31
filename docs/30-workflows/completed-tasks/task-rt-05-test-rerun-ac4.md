# 未タスク指示書: TASK-RT-05-TEST-RERUN

| 項目         | 値                                                                                  |
| ------------ | ----------------------------------------------------------------------------------- |
| タスクID     | TASK-RT-05-TEST-RERUN                                                               |
| 由来         | TASK-RT-05 (multi_select-user-input-kind) Phase 9/10 環境ブロック残課題             |
| ステータス   | 完了（2026-03-31）                                                                  |
| 優先度       | HIGH                                                                                |
| カテゴリ     | testing / regression-verification                                                   |
| 作成日       | 2026-03-30                                                                          |
| 関連タスク   | TASK-RT-05 (multi_select-user-input-kind), UT-RT-06 (esbuild platform mismatch fix) |
| issue_number | 1756                                                                                |

---

## 1. なぜこのタスクが必要か（Why）

TASK-RT-05（multi_select-user-input-kind）の実装はコード上完了しているが、esbuild の darwin-arm64/darwin-x64 platform mismatch により Vitest が起動できず、Phase 9（テスト実行）と Phase 10（回帰確認）が環境ブロックで未完了のまま残っている。

UT-RT-06 にて esbuild 環境修正が施されたため、クリーンな環境での再実行が可能になった。TASK-RT-05 のテストと AC-4（既存 4 kind 非破壊）の再確認を改めて実施する必要がある。

## 2. 何を達成するか（What）

1. UT-RT-06 修正後の環境で `SkillCreatorWorkflowEngine` と `SkillLifecyclePanel` のテストを全件実行し、PASS を確認する
2. AC-4（single_select / free_text / secret / confirm の既存 4 kind が非破壊で動作する）を検証する
3. Phase 9 の品質レポート（`phase-9/quality-report.md`）を「PASS」状態で更新する
4. Phase 10 の最終レビュー結果（`phase-10/final-review-result.md`）の「AC-4: 要再確認」を「PASS」に更新する

## 3. 対象テストファイル

| ファイルパス                                                                                       | テスト対象                         | 実行カテゴリ    |
| -------------------------------------------------------------------------------------------------- | ---------------------------------- | --------------- |
| `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`              | Engine ロジック（Phase 9）         | Unit / Engine   |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | Renderer コンポーネント（Phase 9） | Unit / Renderer |

---

## 4. 苦戦箇所と解決策

### 苦戦箇所1: esbuild platform mismatch 解消手順

| 項目   | 内容                                                                                                                                                          |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 問題   | `pnpm exec vitest run` 実行時に `Error: You installed esbuild for another platform than the one you're currently using` エラーが発生し、Vitest が起動しない。 |
| 原因   | node_modules 内の esbuild バイナリが darwin-arm64 と darwin-x64 で不一致の状態になっている。`pnpm install` 単体では解消されない場合がある。                   |
| 解決策 | node_modules を完全削除してから `pnpm install` を再実行する。**削除 → install → vitest run の順序が重要**。                                                   |
| 教訓   | worktree 環境や CI での esbuild バイナリ不整合は `pnpm install` だけでは解消されないことがある。node_modules / .pnpm-store のクリアが必要な場合がある。       |

```bash
# 解消手順
rm -rf node_modules apps/desktop/node_modules packages/shared/node_modules packages/ui/node_modules
pnpm install
pnpm exec vitest run
```

### 苦戦箇所2: AC-4 テスト範囲の特定

| 項目   | 内容                                                                                                                                                           |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 問題   | AC-4（既存 4 kind 非破壊）の確認に必要なテストが Engine テストと Renderer テストの両方にまたがっており、片方だけ実行しても AC-4 の完全確認にならない。         |
| 原因   | `single_select` / `free_text` / `secret` / `confirm` の送信経路は Engine 層（ワークフロー制御）と Renderer 層（UI コンポーネント）の両方で検証が必要。         |
| 解決策 | `SkillCreatorWorkflowEngine.test.ts`（Engine 4 件）と `SkillLifecyclePanel.llm-generation.test.tsx`（Renderer 5 件以上）の**両方**をターゲットにして実行する。 |
| 教訓   | multi_select 追加後の既存 kind 非破壊確認は、Engine テストと Renderer テストを必ずペアで実行すること。どちらか一方だけでは回帰検出の漏れが生じる。             |

---

## 5. Phase 構成

### Phase 1: 事前確認（UT-RT-06 の修正内容確認・esbuild 状態確認）

**目的**: UT-RT-06 の修正が適用済みであることを確認し、esbuild 状態を診断する

**実行手順**:

1. UT-RT-06 の変更内容を確認する
   ```bash
   git log --oneline | head -20
   git show HEAD --stat
   ```
2. esbuild バイナリの状態を確認する
   ```bash
   node -e "require('esbuild')"
   pnpm exec vitest --version
   ```
3. TASK-RT-05 の実装ファイルが存在することを確認する
   ```bash
   ls apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts
   ls apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
   ```

**完了条件**:

- [ ] UT-RT-06 の esbuild 修正コミットが確認できる
- [ ] 対象テストファイル 2 件が存在する
- [ ] esbuild バイナリ状態のエラーの有無が記録されている

---

### Phase 2: 環境クリーンアップ（node_modules 削除・pnpm install）

**目的**: esbuild platform mismatch を完全解消した状態で Vitest を実行できる環境を構築する

**実行手順**:

1. node_modules を完全削除する
   ```bash
   rm -rf node_modules
   rm -rf apps/desktop/node_modules
   rm -rf apps/web/node_modules
   rm -rf packages/shared/node_modules
   rm -rf packages/ui/node_modules
   ```
2. `pnpm install` で依存関係を再インストールする
   ```bash
   pnpm install
   ```
3. esbuild バイナリが正常に解決されていることを確認する
   ```bash
   node -e "require('esbuild'); console.log('esbuild OK')"
   ```

**完了条件**:

- [ ] `pnpm install` が成功する
- [ ] `node -e "require('esbuild')"` がエラーなく完了する

---

### Phase 3: Phase 9 再実行（vitest run Engine テスト）

**目的**: `SkillCreatorWorkflowEngine.test.ts` の全件 PASS を確認する

**実行手順**:

1. Engine テストを単独実行する
   ```bash
   pnpm exec vitest run apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts
   ```
2. テスト結果を記録する（件数・PASS/FAIL）

**期待値**:

- Engine テスト 4 件以上が PASS

**完了条件**:

- [ ] Engine テストが全件 PASS する
- [ ] テスト件数と PASS 件数が記録されている

---

### Phase 4: Phase 9 再実行（vitest run Renderer テスト）

**目的**: `SkillLifecyclePanel.llm-generation.test.tsx` の全件 PASS を確認する

**実行手順**:

1. Renderer テストを単独実行する
   ```bash
   pnpm exec vitest run apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
   ```
2. テスト結果を記録する（件数・PASS/FAIL）

**期待値**:

- Renderer テスト 5 件以上が PASS

**完了条件**:

- [ ] Renderer テストが全件 PASS する
- [ ] テスト件数と PASS 件数が記録されている

---

### Phase 5: AC-4 確認（既存 4 kind の回帰テスト確認）

**目的**: multi_select 追加後も single_select / free_text / secret / confirm の既存 4 kind が非破壊で動作することを確認する

**実行手順**:

1. AC-4 に関連するテストケースを特定する
   ```bash
   grep -n "single_select\|free_text\|secret\|confirm" \
     apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts \
     apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
   ```
2. 既存 4 kind がテストでカバーされていることを確認する
3. Phase 3/4 の結果を AC-4 の観点で整理する

**完了条件**:

- [ ] single_select の送信経路がテストでカバーされている（または N/A の理由が記録されている）
- [ ] free_text の送信経路がテストでカバーされている（または N/A の理由が記録されている）
- [ ] secret の送信経路がテストでカバーされている（または N/A の理由が記録されている）
- [ ] confirm の送信経路がテストでカバーされている（または N/A の理由が記録されている）
- [ ] multi_select 追加により既存 4 kind の動作に変化がないことが確認されている

---

### Phase 6: Phase 10 再実行（最終レビュー・品質レポート更新）

**目的**: Phase 3〜5 の結果をもとに最終的な品質評価を実施し、受入条件を全件確認する

**実行手順**:

1. TASK-RT-05 の全受入条件を確認する
   - AC-1: multi_select の新規送信経路が動作する
   - AC-2: 複数選択肢が正しく組み立てられる
   - AC-3: multi_select の IPC 経由の型安全性が確保されている
   - AC-4: 既存 4 kind（single_select / free_text / secret / confirm）が非破壊で動作する
2. 品質指標（テスト件数・カバレッジ・型チェック）を確認する
   ```bash
   pnpm typecheck
   pnpm lint
   ```

**完了条件**:

- [ ] AC-1〜AC-4 の全受入条件の PASS/FAIL が記録されている
- [ ] `pnpm typecheck` が PASS する
- [ ] `pnpm lint` が PASS する（または既知の警告として記録されている）

---

### Phase 7: phase-9/quality-report.md 更新

**目的**: TASK-RT-05 の phase-9/quality-report.md を「PASS」状態で更新する

**実行手順**:

1. TASK-RT-05 の phase-9/quality-report.md のパスを特定する
   ```bash
   find docs/30-workflows -name "quality-report.md" | grep -i "rt-05\|multi.select\|user.input"
   ```
2. Phase 3/4 のテスト結果を反映して「PASS」状態に更新する

**完了条件**:

- [ ] phase-9/quality-report.md が「PASS」状態で更新されている
- [ ] テスト結果（件数・日時・環境）が記録されている

---

### Phase 8: phase-10/final-review-result.md 更新（AC-4 → PASS）

**目的**: TASK-RT-05 の phase-10/final-review-result.md の「AC-4: 要再確認」を「PASS」に更新する

**実行手順**:

1. TASK-RT-05 の phase-10/final-review-result.md のパスを特定する
   ```bash
   find docs/30-workflows -name "final-review-result.md" | grep -i "rt-05\|multi.select\|user.input"
   ```
2. 「AC-4: 要再確認」セクションを Phase 5 の確認結果で更新する
3. ブロッカー状態の解除を記録する

**完了条件**:

- [ ] phase-10/final-review-result.md の AC-4 が「PASS」に更新されている
- [ ] 更新日時と確認内容が記録されている

---

### Phase 9: 品質確認

**目的**: 全テストスイートと静的解析が通過することを確認する

**実行手順**:

```bash
pnpm exec vitest run \
  apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
pnpm typecheck
pnpm lint
```

**完了条件**:

- [ ] Engine テスト 4 件以上 PASS
- [ ] Renderer テスト 5 件以上 PASS
- [ ] `pnpm typecheck` PASS
- [ ] `pnpm lint` PASS または警告が記録されている

---

### Phase 10〜12: スキル仕様反映・ドキュメント更新・完了

**目的**: TASK-RT-05 の完了状態を関連ドキュメントへ同期する

**実行手順**:

1. TASK-RT-05 の workflow ドキュメント（index.md など）のステータスを更新する
2. lessons-learned に esbuild mismatch 解消パターンを記録する
3. task-workflow.md の TASK-RT-05 ステータスを確認・更新する

**完了条件**:

- [ ] TASK-RT-05 の workflow ドキュメントが「完了」状態である
- [ ] esbuild mismatch 解消の教訓が lessons-learned に記録されている
- [ ] task-workflow.md の TASK-RT-05 エントリが最新状態である

---

## 6. 受入条件チェックリスト（まとめ）

| AC   | 内容                                                               | 確認方法                                                 |
| ---- | ------------------------------------------------------------------ | -------------------------------------------------------- |
| AC-1 | Engine テスト 4 件以上 PASS                                        | `vitest run SkillCreatorWorkflowEngine.test.ts`          |
| AC-2 | Renderer テスト 5 件以上 PASS                                      | `vitest run SkillLifecyclePanel.llm-generation.test.tsx` |
| AC-3 | 既存 4 kind（single_select/free_text/secret/confirm）回帰 PASS     | Phase 5 の grep 確認 + テスト結果                        |
| AC-4 | phase-9/quality-report.md が「PASS」状態に更新されている           | ファイル内容確認                                         |
| AC-5 | phase-10/final-review-result.md の AC-4 が「PASS」に更新されている | ファイル内容確認                                         |

---

## 7. 検証コマンド（まとめ）

```bash
# 環境クリーンアップ
rm -rf node_modules apps/desktop/node_modules packages/shared/node_modules packages/ui/node_modules
pnpm install

# Engine テスト
pnpm exec vitest run apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts

# Renderer テスト
pnpm exec vitest run apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# 静的解析
pnpm typecheck
pnpm lint

# AC-4 対象 kind の grep 確認
grep -n "single_select\|free_text\|secret\|confirm" \
  apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
```

---

## 8. リスクと対策

| リスク                                        | 対策                                                                                                         |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| node_modules 削除後も esbuild mismatch が残る | `.pnpm-store` も含めたキャッシュクリア（`pnpm store prune`）を追加で実施する                                 |
| AC-4 の既存 kind テストが存在しない           | grep 確認でテストが見つからない場合は、AC-4 確認用のテストケースを新規追加する（スコープ拡大として記録する） |
| TASK-RT-05 の phase-9/phase-10 パスが不明     | `find docs/30-workflows -name "*.md" -path "*/rt-05/*"` で探索する                                           |

---

## 9. 参照情報

- `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`
- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`
- `docs/30-workflows/` 内の TASK-RT-05 ワークフローディレクトリ
- UT-RT-06 の実装コミット（esbuild platform mismatch 修正）
- `.claude/skills/task-specification-creator/SKILL.md`（Phase 12 苦戦防止 Tips: worktree 作成後は `pnpm install` を確認する）

---

## 10. 備考

本タスクは環境問題（esbuild mismatch）が解消した後の **再実行・確認タスク** であり、新規実装は行わない。
TASK-RT-05 の実装自体は完了済みのため、本タスクの作業は「テスト実行」「ドキュメント更新」のみに限定する。

将来の同様課題（worktree 環境での esbuild mismatch）に対しては、**node_modules 完全削除 → pnpm install → vitest run の順序** を標準解消手順として適用すること。
