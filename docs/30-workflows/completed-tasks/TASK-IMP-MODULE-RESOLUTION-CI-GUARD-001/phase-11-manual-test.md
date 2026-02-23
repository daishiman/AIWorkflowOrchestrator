# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスクID   | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 |
| Phase      | 11                                      |
| 名称       | 手動テスト                              |
| 前提Phase  | Phase 10（最終レビュー — PASS / MINOR） |
| 次Phase    | Phase 12（ドキュメント）                |
| ステータス | completed                               |

## 目的

自動テストでは検証しきれないシナリオを手動で実行し、チェックスクリプトの実際の動作を確認する。正常系・異常系・復帰の一連のフローを検証する。

## aiworkflow-requirements 抽出要件の手動検証反映

| 要件ID | 出典仕様                   | 手動テストで確認する内容                                 | 本Phaseでの反映先    |
| ------ | -------------------------- | -------------------------------------------------------- | -------------------- |
| M1     | `architecture-monorepo.md` | 三層整合が崩れた時に検知できること                       | シナリオ2, シナリオ3 |
| M2     | `quality-requirements.md`  | 失敗時/成功時の判定が明確で回帰検知できること            | シナリオ1〜6         |
| M3     | `error-handling.md`        | 失敗時の終了コードとエラーメッセージが再現可能であること | シナリオ2〜5         |

## 参照資料

| 資料                           | パス / リンク                                                                                 |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| Phase 10 最終レビュー          | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-10-final-review.md`          |
| Phase 10 レビューレポート      | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/outputs/phase-10/review-report.md` |
| Phase 5 実装（スクリプト仕様） | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-5-implementation.md`         |
| Phase 2 設計                   | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-2-design.md`                 |
| Phase 6 テスト拡充             | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-6-test-expansion.md`         |
| Phase 7 カバレッジ確認         | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-7-coverage-check.md`         |
| Phase 8 リファクタリング       | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-8-refactoring.md`            |
| Phase 9 品質検証               | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-9-quality-assurance.md`      |
| Phase 1 要件定義（受入基準）   | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-1-requirements.md`           |
| @repo/shared package.json      | `packages/shared/package.json`                                                                |
| モノレポ三層整合要件           | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`                  |
| 品質ゲート要件                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                   |
| エラーハンドリング仕様         | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                         |

## 実行タスク

- 実行タスク一覧: 本Phaseで定義したTaskを上から順に実施する

### Task 1: テストシナリオの実行

以下の6シナリオを順番に実行する。

---

## テストシナリオ

### シナリオ 1: 正常系 — 全チェック PASS

**目的**: 現在の整合済みプロジェクトファイルに対して、チェックスクリプトが正常終了することを確認する。

**前提条件**: TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 で3層整合性が修正済みであること。

**手順**:

1. チェックスクリプトを実行する:
   ```bash
   pnpm tsx scripts/check-shared-module-sync.ts
   ```
2. 標準出力を確認する

**期待結果**:

| 確認項目                                 | 期待値      |
| ---------------------------------------- | ----------- |
| exit code                                | 0           |
| 出力に `✅ ALL CHECKS PASSED` が含まれる | あり        |
| 出力に `❌` が含まれない                 | 含まれない  |
| 5つのチェック全てが `PASSED` 表示        | 全て PASSED |

---

### シナリオ 2: 異常系 — exports に架空のサブパスを追加

**目的**: `exports` に存在するが `paths` / `alias` / `typesVersions` に存在しないエントリを検出できることを確認する。

**手順**:

1. `packages/shared/package.json` のバックアップを作成する:
   ```bash
   cp packages/shared/package.json packages/shared/package.json.bak
   ```
2. `packages/shared/package.json` の `exports` に架空のサブパスを追加する:
   ```json
   "./fake-test-subpath": {
     "types": "./dist/fake-test-subpath/index.d.ts",
     "import": "./dist/fake-test-subpath/index.js"
   }
   ```
3. チェックスクリプトを実行する:
   ```bash
   pnpm tsx scripts/check-shared-module-sync.ts
   ```
4. 標準出力を確認する

**期待結果**:

| 確認項目                                      | 期待値                           |
| --------------------------------------------- | -------------------------------- |
| exit code                                     | 1                                |
| チェック1 (exports → paths) が FAILED         | `./fake-test-subpath` が MISSING |
| チェック3 (exports → aliases) が FAILED       | `./fake-test-subpath` が MISSING |
| チェック5 (exports → typesVersions) が FAILED | `fake-test-subpath` が MISSING   |
| チェック2 (paths → exports) は PASSED         | 変更なし                         |
| チェック4 (aliases → exports) は PASSED       | 変更なし                         |

---

### シナリオ 3: 差分レポートの「MISSING」表示確認

**目的**: シナリオ 2 の出力で、不足エントリが「MISSING」として正しく表示されることを確認する。

**前提条件**: シナリオ 2 の状態（架空サブパス追加済み）のまま実行。

**手順**:

1. シナリオ 2 の標準出力を精査する

**期待結果**:

| 確認項目                                               | 期待値   |
| ------------------------------------------------------ | -------- |
| FAILED チェックの下に `Missing:` 行が表示される        | 表示あり |
| `Missing:` 行に `./fake-test-subpath` が含まれる       | 含まれる |
| 表示が視覚的に区別しやすい（インデント、絵文字が使用） | 区別可能 |

---

### シナリオ 4: サマリーセクションの確認

**目的**: シナリオ 2 の出力で、サマリーセクションにエントリ数と不足数が正しく表示されることを確認する。

**前提条件**: シナリオ 2 の状態（架空サブパス追加済み）のまま実行。

**手順**:

1. シナリオ 2 の標準出力のサマリーセクションを精査する

**期待結果**:

| 確認項目                                   | 期待値                 |
| ------------------------------------------ | ---------------------- |
| `SYNC CHECK FAILED` メッセージが表示される | 表示あり               |
| 失敗したチェック数が正確に表示される       | 3件（チェック1, 3, 5） |

---

### シナリオ 5: 修正方法ガイダンスの確認

**目的**: 不整合検出時に、修正方法のガイダンスが出力されることを確認する。

**前提条件**: シナリオ 2 の状態（架空サブパス追加済み）のまま実行。

**手順**:

1. シナリオ 2 の標準出力の末尾にガイダンスが表示されるか確認する

**期待結果**:

| 確認項目                                                                                 | 期待値   |
| ---------------------------------------------------------------------------------------- | -------- |
| 修正方法のガイダンスが出力に含まれる                                                     | 含まれる |
| ガイダンスに exports 確認 → paths 追加 → alias 追加 → typesVersions 追加の手順が含まれる | 含まれる |

---

### シナリオ 6: 復帰 — 架空サブパスを元に戻し正常終了

**目的**: 不整合を修正した後、チェックスクリプトが再び正常終了することを確認する。

**手順**:

1. バックアップから `package.json` を復元する:
   ```bash
   mv packages/shared/package.json.bak packages/shared/package.json
   ```
2. チェックスクリプトを再実行する:
   ```bash
   pnpm tsx scripts/check-shared-module-sync.ts
   ```
3. 標準出力を確認する

**期待結果**:

| 確認項目                                 | 期待値                |
| ---------------------------------------- | --------------------- |
| exit code                                | 0                     |
| 出力に `✅ ALL CHECKS PASSED` が含まれる | あり                  |
| 出力に `❌` が含まれない                 | 含まれない            |
| `package.json` が元の状態に戻っている    | `git diff` で差分なし |

---

## 復元確認

手動テスト完了後、以下のコマンドでプロジェクトファイルが変更されていないことを確認する:

```bash
git diff --stat packages/shared/package.json
```

差分がある場合、手動テスト中の変更が残っている。`git checkout -- packages/shared/package.json` で復元する。

---

## 実行手順

1. シナリオ 1 を実行し、正常系の動作を確認する
2. `package.json` のバックアップを作成する
3. シナリオ 2 を実行し、不整合検出を確認する
4. シナリオ 3 を実行し、MISSING 表示を確認する
5. シナリオ 4 を実行し、サマリーセクションを確認する
6. シナリオ 5 を実行し、ガイダンス表示を確認する
7. シナリオ 6 を実行し、復帰後の正常終了を確認する
8. `git diff --stat` でプロジェクトファイルが変更されていないことを確認する
9. テスト結果を `outputs/phase-11/` に記録する

---

## 統合テスト連携

| 連携項目          | 内容                                                                                                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 主要スイート      | `packages/shared/src/__tests__/module-resolution.test.ts` / `apps/desktop/src/__tests__/shared-module-resolution.test.ts` / `apps/desktop/src/__tests__/vitest-alias-consistency.test.ts` |
| このPhaseでの扱い | 本Phaseの成果を3スイートと `scripts/check-shared-module-sync.ts` の期待値に反映し、差分が出た場合は仕様に戻って整合を取る                                                                 |
| 失敗時の戻り先    | 要件不整合はPhase 1、設計不整合はPhase 2、実装不整合はPhase 5/6に戻す                                                                                                                     |

## 成果物

| #   | 成果物             | パス                                                                                               |
| --- | ------------------ | -------------------------------------------------------------------------------------------------- |
| 1   | 手動テストレポート | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/outputs/phase-11/manual-test-report.md` |

### 手動テストレポートの記載フォーマット

```markdown
## 手動テスト結果

### シナリオ実行結果

| シナリオ# | 名称                      | 結果    | 備考 |
| --------- | ------------------------- | ------- | ---- |
| 1         | 正常系 — 全チェック PASS  | ✅ / ❌ |      |
| 2         | 異常系 — 架空サブパス追加 | ✅ / ❌ |      |
| 3         | MISSING 表示確認          | ✅ / ❌ |      |
| 4         | サマリーセクション確認    | ✅ / ❌ |      |
| 5         | 修正方法ガイダンス確認    | ✅ / ❌ |      |
| 6         | 復帰 — 正常終了確認       | ✅ / ❌ |      |

### 復元確認

- `git diff --stat packages/shared/package.json`: 差分なし / あり

### 総合判定

[PASS: Phase 12 へ進む / FAIL: 失敗シナリオを記載]
```

---

## 完了条件

- [ ] シナリオ 1（正常系）が exit code 0、`✅ ALL CHECKS PASSED` 出力で PASS している
- [ ] シナリオ 2（異常系）が exit code 1、チェック 1/3/5 が FAILED で PASS している
- [ ] シナリオ 3 で MISSING エントリが正しく表示されている
- [ ] シナリオ 4 でサマリーセクションにエントリ数と失敗チェック数が表示されている
- [ ] シナリオ 5 で修正方法ガイダンスが出力に含まれている
- [ ] シナリオ 6（復帰）が exit code 0 で正常終了し、`package.json` が元に戻っている
- [ ] `git diff --stat packages/shared/package.json` で差分がない（ファイル復元確認）
- [ ] 手動テストレポートが `outputs/phase-11/manual-test-report.md` に記録されている

## 次Phase

Phase 12（ドキュメント）へ進む。
