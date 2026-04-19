# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 9                                         |
| タスクID   | TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 |
| 機能名     | gitattributes-merge-union-reeval          |
| 前提Phase  | Phase 8: リファクタリング                 |
| 後続Phase  | Phase 10: 最終レビューゲート              |
| 作成日     | 2026-04-19                                |
| ステータス | completed                                 |

## 目的

Phase 5-8 を経た `.gitattributes` および本タスクのドキュメント群が、line budget・リンク健全性・mirror parity・自前 sanity check の4観点で品質基準を満たしていることを保証する。設定ファイル特有のため公式 linter は存在せず、`grep`/`awk` ベースの自前チェックを正本とする。

## 背景

`.gitattributes` は静的解析ツールが薄く、エラーは実マージ時にしか顕在化しない。そのため Phase 9 では以下の予防的チェックを行う:

1. **line budget**: ファイル全体の規模が許容範囲内（コメント込みで100行以下目安）
2. **Markdown link**: 仕様書 13 ファイル群と outputs/\* / Issue リンクが破綻していないこと
3. **mirror parity**: `.claude/skills/*` と `.agents/skills/*` の対応エントリが対称
4. **自前 sanity check**: `grep` ベースの構文・重複・順序チェック

## 実行タスク

### タスク0: line budget 確認

**目的**: `.gitattributes` が肥大化していないこと、コメントが冗長でないことを定量的に確認する。

**実行手順**:

1. `.gitattributes` の総行数を計測し、以下の基準で判定:
   - 100行以下: PASS
   - 101-150行: WARN（コメント圧縮を検討）
   - 151行以上: FAIL（Phase 8 への戻り）
2. コメント行と実エントリ行を分離し、比率を確認:
   - コメント比率 30-60%: 健全
   - コメント比率 60%超: 冗長（圧縮提案）
3. 1エントリあたりのコメント行数平均を算出（目安: 1〜3行）
4. グループ見出しコメント・関連リソース集約セクションは budget 外として除外可

**期待される成果物**: `outputs/phase-9/quality-report.md` 内のセクション「line budget」

### タスク1: Markdown link 検証

**目的**: 本タスク仕様書 13 ファイル間のクロスリンク、各 outputs/\* への参照、Issue #2281 リンクが破綻していないことを確認する。

**実行手順**:

1. `docs/30-workflows/gitattributes-merge-union-reeval-001/` 配下の全 `.md` ファイルから Markdown リンク (`[text](path)` 形式) を抽出
2. 各リンク先について以下を検証:
   - 相対パスリンク: ファイルが実在するか
   - `outputs/phase-N/*.md` リンク: 該当 Phase 完了時に生成されることが artifacts.json に登録されているか
   - 外部リンク (https://github.com/...): URL 形式が正しいか（実アクセス検証は任意）
3. Issue リンク `#2281` が `https://github.com/daishiman/AIWorkflowOrchestrator/issues/2281` に正しく解決されることを確認
4. 破綻リンクがあれば一覧化し、修正パッチを Phase 9 内で適用

**期待される成果物**: `outputs/phase-9/quality-report.md` 内のセクション「Markdown link 検証」

### タスク2: mirror parity 確認

**目的**: `.claude/skills/*` と `.agents/skills/*` の対応エントリが対称的に修正されていることを保証する。

**実行手順**:

1. `.gitattributes` から `.claude/skills/` 始まりの全 glob を抽出し、ベースパス部分を `.claude/skills/` → `.agents/skills/` に置換
2. 置換後の glob が `.gitattributes` に存在するかを照合
3. 不対称（片側のみ存在）のエントリがあれば一覧化し、意図的か否かを判定:
   - 意図的不対称: 理由をコメントに明記する PR を Phase 8 へフィードバック
   - 非意図的不対称: Phase 8 への戻りで対称化
4. mirror 同期スクリプト（既存があれば）を実行し、エラーなく完了することを確認
5. 対称性カバレッジを計測:
   - `.claude/skills/*` エントリ数 N
   - `.agents/skills/*` 対応エントリ数 M
   - 対称率 = M / N × 100% （目標: 100%）

**期待される成果物**: `outputs/phase-9/quality-report.md` 内のセクション「mirror parity」

### タスク3: 自前 sanity check（grep ベース）

**目的**: `.gitattributes` 専用 linter が存在しないため、`grep` / `awk` ベースのチェックを最低限の lint として実行する。

**実行手順**:

1. **構文チェック**:
   - 各エントリ行が `<glob> <attribute>=<value>` または `<glob> <attribute>` 形式に従うこと
   - `grep -nE '^[^#].* (merge|text|binary|diff|filter|eol)' .gitattributes` で属性付きエントリを抽出し、パターンに合致しない行を検出
2. **重複チェック**:
   - `awk '/^[^#]/ {print $1}' .gitattributes | sort | uniq -d` で重複 glob を検出
   - 結果が空であることを確認
3. **trailing whitespace チェック**:
   - `grep -nE ' +$' .gitattributes` で末尾空白を検出
4. **未使用属性チェック**:
   - `merge=union` / `merge=ours` / `text` / `binary` 以外の独自属性が混入していないか確認
5. 全 sanity check 結果を一覧化し、FAIL 項目があれば修正

**期待される成果物**: `outputs/phase-9/quality-report.md` 内のセクション「自前 sanity check」

## 参照資料

| 資料名                       | パス                                                                    | 用途                       |
| ---------------------------- | ----------------------------------------------------------------------- | -------------------------- |
| `.gitattributes` 最新版      | `.gitattributes`                                                        | 検査対象                   |
| 仕様書群                     | `docs/30-workflows/gitattributes-merge-union-reeval-001/`               | リンク検証対象             |
| artifacts.json               | `docs/30-workflows/gitattributes-merge-union-reeval-001/artifacts.json` | outputs 登録確認           |
| Phase 8 リファクタリング記録 | `outputs/phase-8/refactoring-log.md`                                    | mirror parity 影響範囲確認 |

## 成果物

| 成果物           | パス                                | 説明                                                     |
| ---------------- | ----------------------------------- | -------------------------------------------------------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | line budget / link / mirror parity / sanity check の結果 |

## 統合テスト連携【必須】

| 判定項目                        | 基準           | 結果    |
| ------------------------------- | -------------- | ------- |
| line budget                     | 100行以下      | pending |
| Markdown link 健全性            | 破綻リンク 0件 | pending |
| mirror parity                   | 対称率 100%    | pending |
| 自前 sanity check（重複・構文） | FAIL 0件       | pending |

## 完了条件

- [ ] `.gitattributes` の総行数が 100 行以下
- [ ] コメント比率が 30-60% の範囲内
- [ ] 仕様書間 Markdown リンクの破綻が 0 件
- [ ] Issue #2281 リンクが正しく解決される
- [ ] mirror parity 対称率が 100%
- [ ] 自前 sanity check（重複・構文・trailing whitespace）が全 PASS
- [ ] `outputs/phase-9/quality-report.md` が生成されている
- [ ] FAIL 項目があれば Phase 8 への戻りまたは修正パッチが適用済み
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

→ [Phase 10: 最終レビューゲート](./phase-10-final-review.md)
