# TASK-CI-FUTURE-007 実装ガイド

## Part 1: 中学生レベルの説明

### なぜこの変更が必要だったか

テストを書いたとき、「このテストはプログラムのどの部分を実際に確認しているか」を記録するのがカバレッジです。
学校のテストに例えると、100問のうち何問分の範囲を勉強できたかを表す「学習進捗表」のようなものです。

### 変更前に何が起きていたか

- デスクトップアプリ（`@repo/desktop`）のカバレッジは Codecov に送られていた
- バックエンド（`@repo/backend`）のカバレッジは誰にも見えない状態だった

つまり、バックエンドのテストが「どの部分を確認できているか」が可視化されていなかったのです。

### なぜ main push 時だけカバレッジを収集するか

PR（プルリクエスト）は「新しいコードを仲間に確認してもらう」ためのものです。
PR のたびにカバレッジを収集・アップロードすると：

- テスト実行時間が 20〜30% 増える（レビュー待ちが遅くなる）
- Codecov の使用量を無駄に消費する

そこで、`push` の main ブランチに入ったときだけカバレッジを記録する方針にしました。

### フラグ `backend` とは

Codecov では複数のパッケージのカバレッジを区別するために「フラグ」というラベルを使います。

- `desktop` フラグ → デスクトップアプリのカバレッジ
- `backend` フラグ → バックエンドのカバレッジ（今回追加）

これにより Codecov のダッシュボードで「どちらが改善・悪化したか」を個別に確認できます。

### シャード別収集

バックエンドのテストは 2 つのグループ（シャード）に分けて同時実行しています。
シャード 1 とシャード 2 は、それぞれ `coverage/backend` 配下に分けて置き、上書きしないようにします。
最後に Codecov がまとめて読めるようにして、`backend` フラグでアップロードします。

---

## Part 2: 技術者向け詳細

### VITEST_SHARDED_COVERAGE 環境変数の役割

```typescript
// apps/backend/vitest.config.ts
coverage: {
  enabled: !!process.env.VITEST_SHARDED_COVERAGE,
}
```

`VITEST_SHARDED_COVERAGE=true` が設定されている場合のみ `enabled: true` となり、カバレッジが収集される。
CI の条件分岐側と vitest 設定側の両方で制御することで、二重の保護を実現する。

### vitest.config.ts の coverage 設定変更

| 設定項目           | 変更前                     | 変更後                                  | 理由                                   |
| ------------------ | -------------------------- | --------------------------------------- | -------------------------------------- |
| `reporter`         | `["text", "json", "html"]` | `["json", "lcov"]`                      | Codecov は json/lcov を要求。html 不要 |
| `reportsDirectory` | 未設定（デフォルト）       | `"./coverage"`                          | アーティファクトパスの明示化           |
| `enabled`          | 未設定（常に有効）         | `!!process.env.VITEST_SHARDED_COVERAGE` | CI 条件と連動した制御                  |

### ci.yml での条件分岐

```yaml
# test-web ジョブ内
- name: Run web app tests (shard ${{ matrix.shard }}/2)
  run: |
    if [ "${{ github.event_name }}" = "push" ] && [ "${{ github.ref }}" = "refs/heads/main" ]; then
      VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2 --coverage
    else
      pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2
    fi

- name: Upload backend coverage artifact
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  uses: actions/upload-artifact@v4
  with:
    name: backend-coverage-${{ matrix.shard }}
    path: apps/backend/coverage/
    retention-days: 1
    if-no-files-found: error
```

### coverage ジョブへの backend 対応

```yaml
coverage:
  needs: [test-shared, test-desktop, test-web]
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  steps:
    # ... desktop の既存ステップ（変更なし）...

    - name: Download desktop coverage artifacts
      uses: actions/download-artifact@v4
      with:
        pattern: desktop-coverage-*
        path: coverage/desktop
        merge-multiple: true

    - name: Upload desktop coverage to Codecov
      uses: codecov/codecov-action@v5
      with:
        directory: coverage/desktop
        flags: desktop
        token: ${{ secrets.CODECOV_TOKEN }}
        fail_ci_if_error: false

    - name: Download backend coverage artifacts
      uses: actions/download-artifact@v4
      with:
        pattern: backend-coverage-*
        path: coverage/backend

    - name: Upload backend coverage to Codecov
      uses: codecov/codecov-action@v5
      with:
        directory: coverage/backend
        flags: backend
        token: ${{ secrets.CODECOV_TOKEN }}
        fail_ci_if_error: false
```

### 変更前後の比較表

| 観点                         | 変更前                      | 変更後                                    |
| ---------------------------- | --------------------------- | ----------------------------------------- |
| backend カバレッジ収集       | なし                        | main push 時に 2 シャードで収集           |
| Codecov backend フラグ       | なし                        | `flags: backend` でアップロード           |
| PR 時の実行時間              | 変化なし                    | 変化なし（カバレッジスキップ維持）        |
| desktop カバレッジ           | `directory: coverage/`      | `directory: coverage/desktop`（混在修正） |
| backend アーティファクト結合 | `merge-multiple: true` 前提 | 個別ディレクトリ保持に変更                |

### エッジケースと注意点

1. **シャード数が変わった場合**: `backend-coverage-{shard}` の `{shard}` は matrix.shard 変数で動的に対応するため、シャード数変更時も自動追従する
2. **VITEST_SHARDED_COVERAGE が未設定の場合**: `enabled: false` となりカバレッジは無効化される。main push 以外はこの状態で動作する
3. **if-no-files-found: error**: main push 時にカバレッジファイルが生成されなかった場合、CI が失敗する。reporter 設定のデグレードを防止する保護
4. **coverage ジョブの timeout-minutes: 5**: backend 2 シャード分のアーティファクト追加によるジョブ時間増加を観測し、必要に応じて調整する（MINOR CI-M-01）

---

## 視覚証跡

UI/UX 変更なしのため Phase 11 スクリーンショット不要。

代替証跡:

- `outputs/phase-11/manual-test-report.md`
- `outputs/phase-11/ci-timing-measurements.md`
- `outputs/phase-11/phase11-capture-metadata.json`
