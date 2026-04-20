# Phase 6: テスト拡充（文書品質の追加検証）

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| Phase      | 6                                                                        |
| タスクID   | TASK-LOGS-ARCHIVE-POLICY-001                                             |
| 機能名     | LOGS.md アーカイブポリシー詳細化                                         |
| 前提Phase  | Phase 4, Phase 5                                                         |
| 後続Phase  | Phase 7                                                                  |
| 作成日     | 2026-04-19                                                               |
| Issue      | [#2282](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2282) |
| ステータス | completed                                                                |

## 本Phaseにおける「テスト拡充」の定義（読み替え）

本タスクはコード実装を伴わない**文書作成タスク**である。したがって、従来の
「テスト拡充」を以下のように**文書品質工程**として正当化し読み替える。

| 用語           | 通常の意味                 | 本タスクでの読み替え                                              |
| -------------- | -------------------------- | ----------------------------------------------------------------- |
| テスト拡充     | 動作テストケースの追加     | ポリシー文書の**追加検証観点**の拡張                              |
| エッジケース   | 境界値での動作確認         | 閾値超過直前/直後、月またぎ等の**判定手順検証**                   |
| 回帰テスト     | 既存テストの維持確認       | 既存 `logs-archive-*.md` との**整合性の網羅的再検証**             |
| テストスイート | 実行可能なテストコード集合 | `outputs/phase-6/validation-report.md` の**検証表形式エビデンス** |
| 統合テスト     | 複数モジュール結合の検証   | **複数スキルへの適用シミュレーション**                            |

Phase 4 で作成済みの基本検証観点に対し、本 Phase では以下の 3 カテゴリで検証網羅性を向上させる。

- (a) 既存 `logs-archive-*.md` との整合性検証の網羅化
- (b) 複数スキル（`.claude/skills/` 配下 18 skill 相当）への適用シミュレーション
- (c) エッジケース（閾値超過直前・直後 / 月またぎ）の判定手順検証

## 目的

Phase 5 で執筆したポリシー文書（`.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md`）
および mirror 文書に対して、**基本検証（Phase 4）では捕捉しきれない観点**を追加検証し、
文書品質をプロダクション運用レベルに引き上げる。

## 実行タスク

- (a) 既存 `logs-archive-*.md` 群との整合性を全件照合
- (b) `.claude/skills/` 配下全スキル 18 件分のポリシー適用シミュレーションを実施
- (c) エッジケース判定手順の検証（閾値境界・月またぎ・mirror 非同期瞬間）
- 拡充後の検証結果を `outputs/phase-6/validation-report.md` へ記録
- Phase 7（カバレッジ確認）へ引き継ぐ未達項目の洗い出し

## 参照資料

| 資料名                          | パス                                                                              | 用途                           |
| ------------------------------- | --------------------------------------------------------------------------------- | ------------------------------ |
| Issue #2282                     | https://github.com/daishiman/AIWorkflowOrchestrator/issues/2282                   | 要件原本                       |
| Phase 2 設計書                  | `docs/30-workflows/logs-archive-policy-001/phase-2-design.md`                     | 不変条件・データ契約参照       |
| Phase 3 レビュー                | `docs/30-workflows/logs-archive-policy-001/phase-3-design-review.md`              | Findings (F-001〜F-005) 再確認 |
| Phase 5 実装ポリシー文書        | `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md`        | 検証対象（正本）               |
| Phase 5 mirror                  | `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md`        | 検証対象（mirror）             |
| 既存 logs-archive-2026-feb.md   | `.claude/skills/task-specification-creator/references/logs-archive-2026-feb.md`   | 整合性照合対象                 |
| 既存 logs-archive-2026-march.md | `.claude/skills/task-specification-creator/references/logs-archive-2026-march.md` | 整合性照合対象                 |
| 既存 logs-archive-legacy.md     | `.claude/skills/task-specification-creator/references/logs-archive-legacy.md`     | legacy 表記互換性照合          |
| 既存 logs-archive-index.md      | `.claude/skills/task-specification-creator/references/logs-archive-index.md`      | インデックス構造確認           |
| `.claude/skills/` 配下全skill   | `.claude/skills/*/`                                                               | (b) シミュレーション対象       |

## 追加検証ケース一覧

### (a) 既存 `logs-archive-*.md` との整合性検証

| VC ID   | 検証名                                                   | 検証内容                                                                                            |
| ------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| VC-A-01 | 既存 `logs-archive-2026-feb.md` との命名規則の並存性     | 新規則 `logs-archive-YYYY-MM.md`（数値月）と既存の英名月（feb/march）の共存方針がポリシー文書に明記 |
| VC-A-02 | 既存アーカイブ内部構造の踏襲性                           | 既存ファイルの「セクション見出し」「日付フォーマット」をポリシー文書の手順章が踏襲している          |
| VC-A-03 | `logs-archive-index.md` とポリシー文書の記述重複ゼロ確認 | インデックス責務とポリシー責務が重複せず、相互参照で連結されている                                  |
| VC-A-04 | `logs-archive-legacy.md` の扱いがポリシー文書に明記      | legacy ファイルへの遡及適用しない方針が明記されている（Phase 1 スコープ除外の再確認）               |
| VC-A-05 | 最終更新日・次回見直し日の記載形式統一                   | 既存アーカイブの記載形式とポリシー文書冒頭メタ情報のフォーマットが一致                              |

### (b) 複数スキル適用シミュレーション（`.claude/skills/` 配下 18 skill 相当）

| VC ID   | 検証名                                            | 検証内容                                                                            |
| ------- | ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| VC-B-01 | 全skillのLOGS.md存在確認                          | 18 skill 全てで `LOGS.md` の有無を列挙し、無い場合は除外根拠がポリシーと整合する    |
| VC-B-02 | 行数閾値 300 行超となるskillの抽出                | `wc -l` で計測し、閾値超過skillの一覧とポリシー手順の当てはめ結果を表形式で残す     |
| VC-B-03 | サイズ閾値 30 KB 超となるskillの抽出              | `wc -c` で計測し、閾値超過skillの一覧とポリシー手順の当てはめ結果を表形式で残す     |
| VC-B-04 | 行数と KB が乖離するskillの検出                   | 片方のみ閾値超過するケースがポリシーの OR 条件で正しく捕捉されることをシミュレート  |
| VC-B-05 | ポリシー手順を18skill全てに機械的に当てはめ可能か | skill名・ディレクトリパスのみを可変で、手順 1〜6 が記述通りに機械的に適用可能か確認 |
| VC-B-06 | 閾値未達skillへの誤適用リスク確認                 | 閾値未達なのに archive が走る可能性をポリシー文言から排除できるか                   |
| VC-B-07 | mirror (`.agents/skills/`) の 18 skill 対応整合   | `.agents/skills/` 側で同一skillの存在を照合し、mirror 対称性がポリシーと整合        |

### (c) エッジケース判定手順の検証

| VC ID   | 検証名                                         | 検証内容                                                                                   |
| ------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------ |
| VC-C-01 | 閾値超過**直前**（299 行 / 29.9 KB）の非発火   | ポリシー記述で「超」と明確化されており、等値では発火しないことが読み取れる                 |
| VC-C-02 | 閾値超過**直後**（301 行 / 30.1 KB）の発火     | 境界直後で確実に発火する記述（AND/OR 条件の順序）がポリシー文書で曖昧でない                |
| VC-C-03 | 月またぎケース（月末23:59→翌月00:00）の判定    | 月末/月初どちらで判定するかの時刻固定がポリシーに明記（Phase 3 F-003 対応の検証）          |
| VC-C-04 | 複数月連続未archiveの取り扱い                  | archive漏れで 2 か月以上溜まった場合の復旧手順が手順章に明記されている                     |
| VC-C-05 | 同月内で 2 度目の閾値超過                      | 既に当月分 archive 後に再度閾値超過した場合の追記ルール（末尾追記 / 新ファイル分割）が明記 |
| VC-C-06 | うるう年（2028-02）の月日数差異への影響        | 月単位粒度のため影響なしであることがポリシーから読み取れる                                 |
| VC-C-07 | タイムゾーンまたぎ（UTC / JST）の判定統一      | どのタイムゾーンで月判定するかがポリシーに明記（または暗黙で JST 固定である根拠）          |
| VC-C-08 | mirror sync が閾値判定中に走った場合の競合回避 | Phase 3 F-002 を踏まえ、sync と archive の順序がポリシー手順で決定的か                     |

## 実行手順

### 1. Phase 4 基本検証結果の再確認

```bash
# Phase 4 で作成した検証レポートを再確認
ls docs/30-workflows/logs-archive-policy-001/phase-4-*
```

### 2. (a) 既存 `logs-archive-*.md` との整合性検証

```bash
# 既存アーカイブの列挙と行数・サイズ計測
ls .claude/skills/task-specification-creator/references/logs-archive-*.md
wc -l .claude/skills/task-specification-creator/references/logs-archive-*.md
wc -c .claude/skills/task-specification-creator/references/logs-archive-*.md

# セクション見出しパターン抽出
rg -n "^# |^## " .claude/skills/task-specification-creator/references/logs-archive-2026-march.md
rg -n "^# |^## " .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md
```

VC-A-01〜VC-A-05 の各検証結果を表形式で記録する。

### 3. (b) 18 skill 適用シミュレーション

```bash
# .claude/skills/ 配下の全skill列挙
ls -d .claude/skills/*/ | wc -l   # 期待: 18 skill程度

# 各skillのLOGS.md行数・サイズ計測（存在するもののみ）
find .claude/skills -maxdepth 2 -name "LOGS.md" -print0 \
  | xargs -0 wc -l

find .claude/skills -maxdepth 2 -name "LOGS.md" -print0 \
  | xargs -0 wc -c

# .agents/ 側の対称性確認
find .agents/skills -maxdepth 2 -name "LOGS.md" -print0 \
  | xargs -0 wc -l
```

シミュレーション結果を以下の表形式で残す：

| skill名 | LOGS.md 行数 | LOGS.md KB | 行閾値 | KB閾値 | 当月archive要否 | mirror対称 |
| ------- | ------------ | ---------- | ------ | ------ | --------------- | ---------- |

### 4. (c) エッジケース判定手順の検証

各 VC-C-01〜VC-C-08 について、ポリシー文書の該当記述を引用し、判定結果（曖昧性なし / 修正要）を
以下の形式で残す：

| VC ID   | 文書内引用箇所（行番号）             | 判定       | 修正要否 |
| ------- | ------------------------------------ | ---------- | -------- |
| VC-C-01 | `phase-5 logs-archive-policy.md:L??` | 曖昧性なし | 不要     |

### 5. 拡充後の検証結果集約

- `docs/30-workflows/logs-archive-policy-001/outputs/phase-6/validation-report.md` に検証結果を保存
  （ファイル新規作成は Phase 6 実行時に行う。本仕様書では作成不要）
- Phase 7（カバレッジ確認）で使うための未達項目一覧を抽出

## 統合テスト連携【必須】

| 判定項目                                 | 基準                        | 結果 |
| ---------------------------------------- | --------------------------- | ---- |
| VC-A-01〜VC-A-05 完了                    | 全件 追加済み・合格         | PASS |
| VC-B-01〜VC-B-07 完了                    | 全件 追加済み・合格         | PASS |
| VC-C-01〜VC-C-08 完了                    | 全件 追加済み・合格         | PASS |
| Phase 4 基本検証の回帰（既存観点の維持） | 回帰なし                    | PASS |
| Phase 3 Findings（F-001〜F-005）反映確認 | 全件 ポリシー文書に反映済み | PASS |

## 多角的チェック観点

| 観点                | チェック内容                                              |
| ------------------- | --------------------------------------------------------- |
| 既存互換性          | 既存 `logs-archive-*.md` の命名・構造と衝突しないか       |
| 網羅性（skill単位） | `.claude/skills/` 配下全skillへポリシー適用できるか       |
| 境界値（閾値）      | 閾値直前/直後で期待通りの判定になるか                     |
| 境界値（時間軸）    | 月またぎ・うるう年・タイムゾーンでブレないか              |
| mirror 対称性       | `.claude/` と `.agents/` で同一内容・同一判定結果になるか |
| 手順の機械的再現性  | 人が読んで迷わず手順 1〜6 を実行できるか                  |

## 受け入れ基準（AC）

| ID   | 受け入れ基準                                                    | 検証方法                      |
| ---- | --------------------------------------------------------------- | ----------------------------- |
| AC-1 | VC-A-01〜VC-A-05 全件が「合格」で記録されている                 | 検証レポート表を確認          |
| AC-2 | VC-B-01〜VC-B-07 全件が 18 skill 分の実測値付きで記録されている | シミュレーション表を確認      |
| AC-3 | VC-C-01〜VC-C-08 全件が文書内引用（行番号付き）で記録されている | エッジケース検証表を確認      |
| AC-4 | Phase 3 F-001〜F-005 の反映状況が全件「反映済み」で確認できる   | Findings 反映マトリクスを確認 |
| AC-5 | 未達項目（あれば）が Phase 7 へ引き継がれている                 | 引き継ぎセクションを確認      |

## スコープ

### 含むもの

- Phase 5 で執筆されたポリシー文書への追加検証観点の拡張
- (a)(b)(c) 3 カテゴリの検証ケース実行手順
- 既存 `logs-archive-*.md` との整合性の網羅照合
- 18 skill への適用シミュレーション設計
- エッジケース判定手順の文書レベル検証

### 含まないもの

- ポリシー文書の内容そのものの変更（Phase 5 の責務）
- アーカイブ自動化スクリプトの実装（別タスク）
- 過去 LOGS.md への遡及的 archive（別タスク）
- mirror sync 機構自体の改修（TASK-CONFLICT-PREVENT-001 の責務）
- 18 skill 全ての実 LOGS.md を実際に archive する作業（運用時の別実行）

## リスクと対策

| リスク                                                                | 影響度 | 対策                                                                                  |
| --------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------- |
| 18 skill の実 LOGS.md 計測時にまだ LOGS.md 自体が無いスキルが多数ある | 低     | 「未作成 skill は検証対象外」と注記し、将来の作成時に遡及適用される運用を明記         |
| 既存 `logs-archive-legacy.md` との位置づけが曖昧                      | 中     | VC-A-04 で legacy の扱いをポリシー文書に明記することを条件化                          |
| エッジケース VC-C-07（タイムゾーン）が文書に未記載                    | 中     | 未記載なら Phase 7 へ未達項目として引き継ぎ、ポリシー追記を Phase 8 or 別タスクで実施 |
| 検証ケースが多く、単体 Phase 実行時間が超過                           | 低     | (a)(b)(c) を並列実行可能な独立観点として整理し分担可能にする                          |

## 成果物

| 成果物           | パス                                   | 説明                          |
| ---------------- | -------------------------------------- | ----------------------------- |
| 拡張検証レポート | `outputs/phase-6/validation-report.md` | VC-A / VC-B / VC-C の集約結果 |

## 完了条件

- [ ] VC-A / VC-B / VC-C の全ケースを定義した
- [ ] Findings F-001〜F-005 との対応を確認した
- [ ] `outputs/phase-6/validation-report.md` の出力方針を固定した
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phaseへの引き継ぎ

### Phase 7（カバレッジ確認）で扱う項目

- VC-A / VC-B / VC-C の全合格件数 / 総ケース数に基づく**文書要件カバレッジ率**の算出
- Issue #2282 の 7 項目（閾値・archive先・手順・mirror同期・topic-map参照・見直しサイクル・エスカレーション）
  の**網羅率 100% 達成**の確認
- 未達項目があれば Phase 6 への差し戻しを判定

### 成果物受け渡し

- `docs/30-workflows/logs-archive-policy-001/outputs/phase-6/validation-report.md` 検証エビデンス
  （Phase 6 実行時に作成）

## Phase 100%実行確認【必須】

- [ ] 本 Phase 内の全タスク（(a)(b)(c) 3 カテゴリ）を 100% 実行完了
- [ ] 成果物テーブル記載の検証エビデンスを全件記録
- [ ] Phase 3 Findings 反映状況を全件確認
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認

## 次Phase

Phase 7: カバレッジ確認（文書要件カバレッジ）
