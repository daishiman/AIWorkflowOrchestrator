# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 9                                   |
| Phase名    | 品質保証                            |
| 前提Phase  | Phase 8                             |
| 後続Phase  | Phase 10                            |
| ステータス | 完了                                |
| 作成日     | 2026-04-16                          |
| 機能名     | ut-fix-ci-ipc-continue-on-error-001 |

---

## 目的

`continue-on-error: true` 削除とリファクタリングが完了した状態で、
以下の4点を総合的に品質保証する：

1. **CI必須ジョブGREEN確認** - `build` を含む必須ジョブが正常にPASSしていること
2. **coverage条件分岐確認** - `coverage` が `push` の `main` でのみ success となり、`pull_request` では `skipped` が正常であること
3. **IPC違反検出テスト** - 意図的なIPC違反を導入してCIがブロックされることを確認し、Guard機能が有効であることを実証する
4. **静的品質確認** - Lintエラーなし・型エラーなしを確認する

## 背景

- Phase 5〜8 で実施した変更の最終品質ゲートとして機能する
- IPC違反検出テストは「Guard機能が本当に有効か」を実証する最重要確認であり、
  このテストを経て初めて `continue-on-error` 削除の目的達成を宣言できる
- `build` は最終ゲートであり、`verify-ipc-4layer` の結果を受けて継続実行される
- `coverage` は `push` の `main` のみで実行され、`pull_request` では `skipped` が正常である
- Phase 10（最終レビューゲート）へ進む前に全品質指標をクリアする必要がある

---

## 実行タスク

### タスク9-1: CI必須ジョブGREEN確認

**目的**: 現在のブランチで CI 必須ジョブが GREEN であることを確認し、
`coverage` が trigger 条件どおりに `success` / `skipped` になることを確認する

**確認対象ジョブ一覧**:

| ジョブ名            | 期待ステータス    | 備考                                                     |
| ------------------- | ----------------- | -------------------------------------------------------- |
| `lint`              | success           | ESLint/Prettierチェック                                  |
| `typecheck`         | success           | TypeScript型チェック                                     |
| `build-shared`      | success           | `@repo/shared` ビルド                                    |
| `test-shared`       | success           | 共有ライブラリのユニットテスト                           |
| `test-desktop`      | success           | Electronデスクトップのユニットテスト                     |
| `test-web`          | success           | Next.js Webアプリのユニットテスト                        |
| `e2e-desktop`       | success           | Playwright E2Eテスト                                     |
| `check-module-sync` | success           | モジュール同期チェック                                   |
| `security`          | success           | Security Audit（step-level continue-on-error は意図的）  |
| `verify-ipc-4layer` | success           | IPC 4層整合性検証（**今回の主対象**）                    |
| `build`             | success           | `verify-ipc-4layer` を含む最終ビルドゲート               |
| `coverage`          | success / skipped | `push` の `main` で success、`pull_request` では skipped |

**実行手順**:

1. 最新のCI実行状況を確認する
   ```bash
   gh run list --branch $(git branch --show-current) --limit 3
   ```
2. 最新CIの全ジョブステータスを確認する
   ```bash
   RUN_ID=$(gh run list --branch $(git branch --show-current) --limit 1 --json databaseId --jq '.[0].databaseId')
   gh run view $RUN_ID --json jobs --jq '.jobs[] | {name: .name, conclusion: .conclusion}'
   ```
3. `coverage` ジョブが `push` の `main` では `success`、`pull_request` では `skipped` であることを確認する
4. 必須ジョブが `success` であることを確認する
5. 確認結果を `outputs/phase-9/build-and-coverage-check.md` に記録する

**期待される成果物**:

- `outputs/phase-9/build-and-coverage-check.md`（必須ジョブGREEN / security・coverage条件付き確認記録）

---

### タスク9-2: IPC違反検出テスト（CIブロッキング有効性確認）

**目的**: 意図的にIPC違反を導入し、CIが正しくブロックされることを確認することで、
`continue-on-error` 削除によるGuard機能の有効化を実証する

> **重要**: このテストはローカル環境のみで実施し、違反コードをリモートにpushしないこと。
> ローカルで `node scripts/verify-ipc-4layer.cjs` がFAILすることを確認し、
> その後すぐに変更を元に戻す。

**実行手順**:

**Step 1: 違反の導入**

1. `verify-ipc-4layer.cjs` が参照するソースファイルに意図的なIPC違反を導入する
   - 例: preloadホワイトリストに存在しないチャネル名をrendererの呼び出し箇所に追加する
   - 変更対象は `apps/desktop/src/preload/` または `apps/desktop/src/renderer/` 配下のIPC関連ファイル
2. 具体的な違反導入例（Rule-1違反の場合）:
   ```bash
   # 変更前後のdiffを記録
   git stash  # 万が一の備え：現状を一時退避
   # または、変更後すぐに git diff を取得して手動で元に戻す手順を準備する
   ```

**Step 2: FAIL確認**

1. ローカルで `verify-ipc-4layer.cjs` を実行し、FAILすることを確認する
   ```bash
   node scripts/verify-ipc-4layer.cjs
   echo "Exit code: $?"
   ```
2. 終了コードが `0` 以外であることを確認する（FAILの場合は非ゼロ）
3. FAIL出力を `outputs/phase-9/ipc-violation-test-fail.txt` に保存する
   ```bash
   node scripts/verify-ipc-4layer.cjs \
     > docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-9/ipc-violation-test-fail.txt 2>&1 || true
   ```

**Step 3: 違反の除去（必須）**

1. 導入した違反を必ず元に戻す
   ```bash
   git checkout -- <変更したファイル>
   # または
   git stash pop
   ```
2. 元に戻したことを確認する
   ```bash
   node scripts/verify-ipc-4layer.cjs
   echo "Exit code: $?"
   ```
3. 終了コードが `0`（PASS）であることを確認する

**期待される成果物**:

- `outputs/phase-9/ipc-violation-test-fail.txt`（意図的違反時のFAIL出力）
- `outputs/phase-9/ipc-violation-test-result.md`（テスト実施記録と結論）

---

### タスク9-3: Lintエラーなし確認

**目的**: `.github/workflows/ci.yml` への変更がLintエラーを引き起こしていないことを確認する

**実行手順**:

1. pnpm lint を実行してエラーがないことを確認する
   ```bash
   pnpm lint 2>&1 | tail -20
   ```
2. `ci.yml` はYAMLファイルのためESLint対象外だが、他の変更ファイルがある場合はLintが通ることを確認する
3. Lint結果を `outputs/phase-9/lint-check.txt` に保存する
   ```bash
   pnpm lint > docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-9/lint-check.txt 2>&1
   echo "Lint exit code: $?" >> docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-9/lint-check.txt
   ```

**期待される成果物**:

- `outputs/phase-9/lint-check.txt`（Lint実行結果）

---

### タスク9-4: 型エラーなし確認

**目的**: `.github/workflows/ci.yml` への変更が型エラーを引き起こしていないことを確認する

**実行手順**:

1. TypeScript型チェックを実行する
   ```bash
   pnpm typecheck 2>&1 | tail -20
   ```
2. 型エラーが0件であることを確認する
3. 型チェック結果を `outputs/phase-9/typecheck-result.txt` に保存する
   ```bash
   pnpm typecheck > docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-9/typecheck-result.txt 2>&1
   echo "Typecheck exit code: $?" >> docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-9/typecheck-result.txt
   ```

**期待される成果物**:

- `outputs/phase-9/typecheck-result.txt`（型チェック実行結果）

---

### タスク9-5: 品質チェックリストの作成

**目的**: Phase 9 で実施した全品質確認の結果をまとめ、Phase 10（最終レビューゲート）へ引き継ぐ

**品質チェックリスト**:

```markdown
## Phase 9 品質チェックリスト

### CI必須ジョブGREEN / security・coverage条件付き確認

- [ ] lint: success
- [ ] typecheck: success
- [ ] build-shared: success
- [ ] test-shared: success
- [ ] test-desktop: success
- [ ] test-web: success
- [ ] e2e-desktop: success
- [ ] check-module-sync: success
- [ ] security: success（step-level continue-on-error は意図的）
- [ ] verify-ipc-4layer: success（continue-on-errorなし）
- [ ] build: success
- [ ] coverage: success（push main）/ skipped（pull_request では正常）

### IPC違反検出Guard有効性

- [ ] 意図的違反導入時に verify-ipc-4layer.cjs が FAIL（非ゼロ終了）することを確認
- [ ] 違反除去後に verify-ipc-4layer.cjs が PASS（ゼロ終了）することを確認
- [ ] 違反コードがリモートにpushされていないことを確認

### 静的品質

- [ ] pnpm lint: エラー0件
- [ ] pnpm typecheck: 型エラー0件

### 総合判定

- [ ] 全チェック項目がPASS → Phase 10 へ進む
- [ ] 未PASSの項目あり → 該当Phaseへ戻り修正
```

**実行手順**:

1. 上記チェックリストを `outputs/phase-9/quality-checklist.md` として保存する
2. タスク9-1〜9-4の結果をもとに各チェック項目を記入する
3. 総合判定を確定し記録する
4. 未PASSの項目がある場合は、対応するPhaseへ戻る指示を記録する

**期待される成果物**:

- `outputs/phase-9/quality-checklist.md`（品質チェックリスト完成版）

---

## 参照資料

| 参照資料                 | パス                                                                                             | 内容                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| Phase 6 CI GREEN証跡     | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-6/ci-green-evidence.md`     | CI GREEN確認の証跡（Phase 9での再確認に使用）       |
| Phase 7 CI整合性サマリー | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-7/ci-integrity-summary.md`  | Rule-1/2/3全PASS確認結果                            |
| Phase 8 リファクタ記録   | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-8/refactoring-checklist.md` | リファクタリング内容の確認                          |
| IPC検証スクリプト        | `scripts/verify-ipc-4layer.cjs`                                                                  | 違反検出テストに使用                                |
| CIワークフロー定義       | `.github/workflows/ci.yml`                                                                       | 最終確定版CI設定                                    |
| タスクindex              | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/index.md`                                 | CI検証指標（build必須 + security/coverage条件付き） |

---

## 成果物

| 成果物                  | パス                                                                                                 | 内容                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 必須ジョブGREEN確認記録 | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-9/build-and-coverage-check.md`  | 必須ジョブGREEN / security・coverage条件付き確認結果 |
| IPC違反FAILログ         | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-9/ipc-violation-test-fail.txt`  | 意図的違反導入時のFAIL出力                           |
| IPC違反テスト結果記録   | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-9/ipc-violation-test-result.md` | Guard有効性確認テストの実施記録                      |
| Lint確認結果            | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-9/lint-check.txt`               | pnpm lint 実行結果                                   |
| 型チェック結果          | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-9/typecheck-result.txt`         | pnpm typecheck 実行結果                              |
| 品質チェックリスト      | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-9/quality-checklist.md`         | Phase 9 総合品質チェックリスト                       |

---

## 統合テスト連携

Phase 9 では以下の統合テスト連携を実施する：

- CI必須ジョブGREEN確認を品質保証の最終ゲートとして使用する
- `coverage` は `push` の `main` でのみ実行され、`pull_request` では `skipped` が正常であることを前提に判定する
- IPC違反検出テストにより、Guard機能（`continue-on-error` 削除の効果）を実証する
- Lint・型チェックによる静的品質確認を実施し、変更の安全性を保証する

---

## 完了条件

- [ ] CI必須ジョブ（`build` を含む）が全て `success` であることが確認されている
- [ ] `security` ジョブが `success` であることが確認されている
- [ ] `coverage` ジョブが `push` の `main` では `success`、`pull_request` では `skipped` であることが確認されている
- [ ] 意図的なIPC違反導入時に `verify-ipc-4layer.cjs` がFAIL（非ゼロ終了）することを確認した
- [ ] 違反除去後に `verify-ipc-4layer.cjs` がPASS（ゼロ終了）することを確認した
- [ ] 違反コードがリモートにpushされていないことを確認した
- [ ] `pnpm lint` がエラー0件で完了している
- [ ] `pnpm typecheck` が型エラー0件で完了している
- [ ] `outputs/phase-9/quality-checklist.md` の総合判定が PASS である

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（9-1〜9-5）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 8（リファクタリング）が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## 次のPhase

完了後、`phase-10-final-review.md` を実行してください。
