# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 8                                   |
| Phase名    | リファクタリング                    |
| 前提Phase  | Phase 7                             |
| 後続Phase  | Phase 9                             |
| ステータス | 完了                                |
| 作成日     | 2026-04-16                          |
| 機能名     | ut-fix-ci-ipc-continue-on-error-001 |

---

## 目的

`continue-on-error: true` 削除後の `.github/workflows/ci.yml` について、
`verify-ipc-4layer` ジョブおよびその周辺の設定を整理・最適化する。
不要なコメントや残骸を除去し、CI設定の可読性と保守性を向上させる。

## 背景

- Phase 5 で `continue-on-error: true` の1行を削除したが、
  元々この行が一時設定であった経緯からコメントや関連の残骸が残っている可能性がある
- `timeout-minutes: 5` の値が実際のCI実行時間に対して適切かどうかを確認する
- CI設定はチーム全体が参照するため、意図が明確に読み取れる状態が望ましい
- リファクタリング後もCIが継続してGREENであることを確認する

---

## 実行タスク

### タスク8-1: `verify-ipc-4layer` ジョブ設定の棚卸し

**目的**: `verify-ipc-4layer` ジョブの現在の設定内容を棚卸しし、
整理が必要な箇所を特定する

**実行手順**:

1. `.github/workflows/ci.yml` の `verify-ipc-4layer` ジョブブロック全体を確認する
   ```bash
   grep -n "" .github/workflows/ci.yml | sed -n '290,315p'
   ```
2. 以下の観点で確認項目をリストアップする：
   - `continue-on-error` の残骸コメントが存在するか
   - 一時設定時に追加されたコメント（例: `# TODO:`, `# 一時設定`, `# 暫定` など）が残っているか
   - `ELECTRON_SKIP_BINARY_DOWNLOAD: 1` の設定が現在も必要か（Node.jsのみで実行するため適切）
   - `Setup pnpm` / `pnpm install` ステップが不要なのに追加されていないか確認
3. 確認結果を `outputs/phase-8/refactoring-checklist.md` にリストアップする

**期待される成果物**:

- `outputs/phase-8/refactoring-checklist.md`（整理箇所のチェックリスト）

---

### タスク8-2: 不要なコメント・残骸の除去

**目的**: タスク8-1で特定した不要なコメントや残骸を `ci.yml` から除去する

**実行手順**:

1. タスク8-1の `refactoring-checklist.md` を参照し、除去対象を確認する
2. 対象箇所を削除または修正する
3. 変更箇所を確認する
   ```bash
   git diff .github/workflows/ci.yml
   ```
4. YAMLの構文が正しいことを確認する
   ```bash
   # yamllint がある場合
   yamllint .github/workflows/ci.yml
   # または python3 で検証
   python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" && echo "YAML valid"
   ```

**変更が不要な場合の対応**:

- `refactoring-checklist.md` に「整理箇所なし：ジョブ設定はクリーンな状態」と記録する
- このタスクは「確認済み」として完了とする

**期待される成果物**:

- `.github/workflows/ci.yml`（クリーンアップ済み、変更がある場合のみ）
- `outputs/phase-8/refactoring-checklist.md`（各項目の対応結果）

---

### タスク8-3: `timeout-minutes` の適切な値の確認

**目的**: `verify-ipc-4layer` ジョブの `timeout-minutes: 5` が実際の実行時間に対して
適切な値であることを確認する

**実行手順**:

1. Phase 6 で収集した `outputs/phase-6/ci-verify-ipc-log.txt` から実際の実行時間を確認する
   ```bash
   grep -E "duration|elapsed|seconds|Complete" \
     docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-6/ci-verify-ipc-log.txt
   ```
2. 実行時間と `timeout-minutes: 5` の比較：

   | 実際の実行時間 | `timeout-minutes: 5` の評価 | 対応                               |
   | -------------- | --------------------------- | ---------------------------------- |
   | 30秒未満       | 余裕あり（適切）            | 変更不要                           |
   | 1〜3分         | 適切                        | 変更不要                           |
   | 4分以上        | タイムアウトリスクあり      | `timeout-minutes: 10` に変更を検討 |

3. 現在の設定（`timeout-minutes: 5`）が適切であれば変更不要
4. 確認結果を `outputs/phase-8/timeout-check.md` に記録する

**期待される成果物**:

- `outputs/phase-8/timeout-check.md`（timeout設定の妥当性確認記録）

---

### タスク8-4: リファクタリング後のCI継続PASS確認

**目的**: タスク8-2/8-3で変更を加えた場合に、CIが継続してGREENであることを確認する

**変更がなかった場合**: このタスクはスキップし、「変更なし、Phase 7時点のGREEN継続」と記録する

**変更があった場合の実行手順**:

1. 変更をコミットする
   ```bash
   git add .github/workflows/ci.yml
   git commit -m "chore(ci): cleanup verify-ipc-4layer job configuration"
   ```
2. リモートブランチにpushする
   ```bash
   git push
   ```
3. GitHub Actions でCIが再度GREENになることを確認する
   ```bash
   gh run list --branch $(git branch --show-current) --limit 3
   ```
4. 確認結果を `outputs/phase-8/post-refactoring-ci-check.md` に記録する

**期待される成果物**:

- `outputs/phase-8/post-refactoring-ci-check.md`（リファクタリング後CI確認記録）

---

## 参照資料

| 参照資料               | パス                                                                                            | 内容                                             |
| ---------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| CIワークフロー定義     | `.github/workflows/ci.yml`                                                                      | リファクタリング対象ファイル（290〜315行目付近） |
| Phase 6 CI実行ログ     | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-6/ci-verify-ipc-log.txt`   | 実際のCI実行時間の確認に使用                     |
| Phase 7 整合性サマリー | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-7/ci-integrity-summary.md` | リファクタリング前の整合性確認結果               |
| タスクindex            | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/index.md`                                | タスク全体設計                                   |

---

## 成果物

| 成果物                         | パス                                                                                                 | 内容                                       |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| リファクタリングチェックリスト | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-8/refactoring-checklist.md`     | 整理箇所と対応結果のチェックリスト         |
| timeout確認記録                | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-8/timeout-check.md`             | timeout-minutesの妥当性確認                |
| リファクタリング後CI確認記録   | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/outputs/phase-8/post-refactoring-ci-check.md` | 変更後のCI継続PASS確認（変更ありの場合）   |
| CI設定ファイル（最終版）       | `.github/workflows/ci.yml`                                                                           | クリーンアップ済みCI設定（変更ありの場合） |

---

## 統合テスト連携

Phase 8 では以下の統合テスト連携を実施する：

- リファクタリング（CI設定整理）後も `verify-ipc-4layer` ジョブがGREENを維持することを確認する
- YAMLの構文バリデーションを実施し、設定ファイルの破損がないことを保証する
- 変更があった場合はCI再実行でGREEN継続を実証する

---

## 完了条件

- [ ] `verify-ipc-4layer` ジョブ設定の棚卸しが完了し、整理箇所が特定されている
- [ ] 不要なコメント・残骸が除去されている（または「整理箇所なし」と記録されている）
- [ ] `timeout-minutes: 5` の妥当性が確認されている
- [ ] `.github/workflows/ci.yml` のYAML構文が正しいことが確認されている
- [ ] リファクタリング後もCIがGREENであることが確認されている（変更ありの場合）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（8-1〜8-4）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 7（カバレッジ確認）が完了し、CI整合性サマリーの総合判定がPASSであること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、`phase-9-quality-assurance.md` を実行してください。
