# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 12                                   |
| 機能名     | TASK-CI-FUTURE-003                   |
| タスク名   | キャッシュヒット率のモニタリング設定 |
| 前提Phase  | Phase 11                             |
| 後続Phase  | Phase 13                             |
| 作成日     | 2026-04-15                           |
| ステータス | pending                              |

## 目的

実装の内容を将来の開発者が理解・保守できる形でドキュメント化し、システム仕様書・変更履歴・未タスク・準拠証跡を更新する。
6 タスクを全て完了することが必須。

## 実行タスク（6タスク - 全て完了必須）

---

### Task 12-1: 実装ガイドの作成（2パート構成）

#### Part 1: 中学生レベル概念説明

**なぜキャッシュのモニタリングが必要か？**

CI（継続的インテグレーション）はコードをプッシュするたびに自動でテストやチェックを実行する仕組みです。
この仕組みの中で「キャッシュ」は「前回の作業で使ったファイルを保存しておき、次回はダウンロードをスキップする」という節約機能です。

キャッシュがうまく使えると：

- CI が 15 分かかっていたのが 5 分になる（3 倍速！）

でも、キャッシュが使えない状態になっても、今まで気づく方法がありませんでした。
このタスクでは「キャッシュが今どのくらい機能しているか」を自動でレポートする仕組みを作ります。

郵便ポストに例えると：「郵便が届いているかどうか（キャッシュが使えているか）を毎回確認せず、ポストが自動でスマホに通知してくれる仕組み」を作るようなものです。

#### Part 2: 技術者レベル実装ガイド

**判定ロジック仕様**

```bash
# キャッシュ状態の3状態判定
# 入力: CACHE_HIT (steps.<id>.outputs.cache-hit)
#       NODE_MODULES_PRESENT (cache restore 直後の node_modules 存在確認)
# 出力: CACHE_STATUS (文字列), CACHE_KIND (exact|fallback|miss), CACHE_REASON, ANNOTATION_LEVEL ("warning"|"notice"|"")

if [ "$CACHE_HIT" = "true" ] && [ "$NODE_MODULES_PRESENT" = "true" ]; then
  CACHE_STATUS="✅ 完全ヒット (Exact Hit)"
  CACHE_KIND="exact"
  CACHE_REASON="cache-hit=true かつ node_modules が復元済み"
  ANNOTATION_LEVEL=""
elif [ "$NODE_MODULES_PRESENT" = "true" ]; then
  CACHE_STATUS="⚠️ フォールバックヒット (Partial Hit)"
  CACHE_KIND="fallback"
  CACHE_REASON="cache-hit=false / node_modules がフォールバック復元済み"
  ANNOTATION_LEVEL="notice"
else
  CACHE_STATUS="❌ キャッシュミス (Miss)"
  CACHE_KIND="miss"
  CACHE_REASON="cache restore 後に node_modules が存在しない"
  ANNOTATION_LEVEL="warning"
fi
```

**重要: `actions/cache@v4` の outputs 仕様**

| output 名           | 挙動                                                                      |
| ------------------- | ------------------------------------------------------------------------- |
| `cache-hit`         | 完全一致キーでヒットした場合のみ `true`。フォールバック時は `false`       |
| `node_modules` 確認 | cache restore 直後に `node_modules` が存在するかで fallback / miss を判定 |

**補足**: 判定結果は `GITHUB_OUTPUT` に `cache-status` / `cache-kind` / `cache-reason` / `annotation-level` として書き出す。

**設定パラメータ**

| パラメータ                | 説明                                       | デフォルト |
| ------------------------- | ------------------------------------------ | ---------- |
| `if: always()`            | 前ステップ失敗時も判定ステップを実行する   | 必須設定   |
| `continue-on-error: true` | 判定ステップ失敗時でも CI をブロックしない | 必須設定   |
| 閾値（警告レベル）        | キャッシュミス時: `::warning::`            | 変更可能   |
| 閾値（通知レベル）        | フォールバックヒット時: `::notice::`       | 変更可能   |

**保存先**: `outputs/phase-12/implementation-guide.md`

---

### Task 12-2: システム仕様書更新（4サブステップ）

#### Step 1-A: タスク完了記録

以下のシステム仕様書に「完了タスク」セクションを追加または更新する。

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
  - TASK-CI-FUTURE-003 の完了記録を追加する
  - ステータスを「未実施 → 完了」に更新する
- `.claude/skills/aiworkflow-requirements/LOGS.md`
  - 変更履歴エントリを追加する
- `.claude/skills/task-specification-creator/LOGS.md`
  - Phase 12 の準拠確認と current facts を追加する
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`
  - 変更したセクションと参照先を追記する
- `.claude/skills/aiworkflow-requirements/indexes/keywords.json`
  - CI モニタリング関連のキーワード索引を再生成する
- `.agents/skills/aiworkflow-requirements/`
  - canonical と同値に同期する
- `.agents/skills/task-specification-creator/LOGS.md`
  - canonical と同値に同期する

**LOGS.md エントリ形式**:

```markdown
## 2026-04-15 TASK-CI-FUTURE-003 完了

- `.github/workflows/ci.yml` に `キャッシュヒット率確認` ステップを追加
- `cache-hit` + `node_modules` 存在確認で 3 状態（完全ヒット・フォールバック・ミス）を判定
- GitHub Actions Summary と `GITHUB_OUTPUT` への出力、アノテーション機能を実装
```

#### Step 1-B: 実装状況テーブル更新

`task-workflow.md` の実装状況テーブルで TASK-CI-FUTURE-003 のステータスを更新する。

| タスクID           | 変更前 | 変更後 |
| ------------------ | ------ | ------ |
| TASK-CI-FUTURE-003 | 未実施 | 完了   |

#### Step 1-C: 関連タスクテーブル更新

関連タスク（TASK-CI-OPT-001）のステータスをテーブルで更新する。

#### Step 2: システム仕様更新（条件付き）

本タスクは GitHub Actions YAML の変更のみのため、新規インターフェース・型定義の追加はない。
Step 2 は **不要**（スキップ可）。

---

### Task 12-3: ドキュメント更新履歴の作成

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/TASK-CI-FUTURE-003-cache-hit-rate-monitoring \
  --output outputs/phase-12/documentation-changelog.md
```

スクリプトが利用不可の場合は手動で作成する。

**保存先**: `outputs/phase-12/documentation-changelog.md`

---

### Task 12-4: 未タスク検出レポートの作成（0件でも出力必須）

Phase 11 の手動テストで発見された HIGH 問題、および Phase 2/3 で識別されたスコープ外の改善案を整理する。

**既知の未タスク候補**（Issue #2169 から転記）:

| 候補ID | 内容                                         | 推奨配置先                        |
| ------ | -------------------------------------------- | --------------------------------- |
| FT-001 | 長期トレンド蓄積・可視化ダッシュボードの構築 | `unassigned-task/` （優先度: 低） |
| FT-002 | Slack / メールアラートの設定                 | `unassigned-task/` （優先度: 低） |
| FT-003 | 外部モニタリングサービス（Datadog 等）の導入 | `unassigned-task/` （優先度: 低） |

Phase 11 で HIGH 問題が検出された場合は `docs/30-workflows/unassigned-task/` にタスク仕様書を作成する。

**保存先**: `outputs/phase-12/unassigned-task-detection.md`

---

### Task 12-5: スキルフィードバックレポートの作成（改善点なしでも出力必須）

本タスク実行を通じて得られた `task-specification-creator` スキルへのフィードバックを記録する。

**フィードバック項目**:

- Phase 4 のテスト作成において「GitHub Actions YAML の変更」という性質上、ユニットテストが書けない。CI 実行ベースのテスト計画をスキルのテンプレートに追加することを推奨する。
- Phase 11 の手動テストにおいて「スクリーンショット」の取得が CI ツールの制約上難しい。ログ URL の記録を代替手段として標準化することを推奨する。

**保存先**: `outputs/phase-12/skill-feedback-report.md`

---

### Task 12-6: Phase 12 準拠確認【必須・最終確認】

`phase12-task-spec-compliance-check.md` を root evidence として 1 ファイルに集約する。

**確認項目**:

- Task 12-1〜12-5 の成果物が存在すること
- Task 12-1〜12-5 の実質監査が完了していること
- Step 1-A〜1-C の更新が same-wave で完了していること
- `.claude/skills/aiworkflow-requirements/LOGS.md` と `.claude/skills/task-specification-creator/LOGS.md` の両方が更新されていること
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` が更新されていること
- `.claude/skills/aiworkflow-requirements/indexes/keywords.json` が更新されていること
- `.claude/skills/aiworkflow-requirements/scripts/generate-index.js` と `.claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/TASK-CI-FUTURE-003-cache-hit-rate-monitoring --regenerate` を実行して索引を再生成していること
- `.claude/skills/` と `.agents/skills/` の mirror parity が確認されていること
- `artifacts.json` と `outputs/artifacts.json` の同値性が確認されていること
- `phase-12-documentation.md` に planned wording / temp wording が残っていないこと

**記載形式**:

```markdown
## Phase 12 準拠確認

### 1. 存在確認

...

### 2. 実質監査

...

### 3. same-wave 同期確認

...

### 4. root parity 確認

...
```

**保存先**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

## 参照資料

| 資料名                          | パス                                                                                    | 用途               |
| ------------------------------- | --------------------------------------------------------------------------------------- | ------------------ |
| Phase 11 手動テスト結果         | `outputs/phase-11/manual-test-result.md`                                                | 未タスク検出の入力 |
| タスク運用仕様                  | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                    | システム仕様更新先 |
| 仕様更新フロー                  | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Phase 12 実行根拠  |
| aiworkflow-requirements LOGS    | `.claude/skills/aiworkflow-requirements/LOGS.md`                                        | 変更履歴追記先     |
| task-specification-creator LOGS | `.claude/skills/task-specification-creator/LOGS.md`                                     | 準拠証跡追記先     |
| topic-map                       | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                           | トピック更新先     |
| ドキュメント変更履歴スクリプト  | `.claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js` | Task 12-3          |
| 受け入れ基準                    | `outputs/phase-1/acceptance-criteria.md`                                                | Phase 1 成果物     |
| phase 2 成果物                  | `outputs/phase-2/design.md`                                                             | Phase 2 成果物     |
| phase 5 成果物                  | `outputs/phase-5/changed-files.md`                                                      | Phase 5 成果物     |
| phase 8 成果物                  | `outputs/phase-8/refactoring-plan.md`                                                   | Phase 8 成果物     |
| phase 9 成果物                  | `outputs/phase-9/causal-loop-audit.md`                                                  | Phase 9 成果物     |
| phase 10 成果物                 | `outputs/phase-10/final-review.md`                                                      | Phase 10 成果物    |
| phase 11 成果物                 | `outputs/phase-11/evidence-index.md`                                                    | Phase 11 成果物    |

## 実行手順

1. Task 12-1 の実装ガイド（Part 1 + Part 2）を作成する
2. Task 12-2 の Step 1-A〜1-C を実行する（Step 2 は不要）
3. Task 12-3 のドキュメント更新履歴を作成する
4. Task 12-4 の未タスク検出レポートを作成する（0 件でも必須）
5. Task 12-5 のスキルフィードバックレポートを作成する（改善点なしでも必須）
6. Task 12-6 の Phase 12 準拠確認を作成する
7. 全成果物を `outputs/phase-12/` に保存する

## 成果物

| 成果物名                     | 保存先                                                   | 説明                             |
| ---------------------------- | -------------------------------------------------------- | -------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Part 1（中学生）+ Part 2（技術） |
| 仕様更新サマリー             | `outputs/phase-12/system-spec-update-summary.md`         | システム仕様書の更新内容まとめ   |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 変更履歴の記録                   |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク一覧（0件でも必須）      |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | スキル改善提案                   |
| Phase 12 準拠確認            | `outputs/phase-12/phase12-task-spec-compliance-check.md` | root evidence / 最終監査         |

## 完了条件

- [ ] Task 12-1 の実装ガイド（Part 1 中学生レベル + Part 2 技術者レベル）が作成されている
- [ ] Task 12-2 の Step 1-A（タスク完了記録・変更履歴更新）が完了している
- [ ] Task 12-2 の Step 1-B（実装状況テーブル更新）が完了している
- [ ] Task 12-2 の Step 1-C（関連タスクテーブル更新）が完了している
- [ ] Task 12-3 のドキュメント更新履歴が作成されている
- [ ] Task 12-4 の未タスク検出レポートが作成されている（0件でも必須）
- [ ] Task 12-5 のスキルフィードバックレポートが作成されている（改善点なしでも必須）
- [ ] Task 12-6 の Phase 12 準拠確認が作成されている
- [ ] 成果物 6 件が `outputs/phase-12/` に保存されている
