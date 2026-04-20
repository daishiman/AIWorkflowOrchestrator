# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 9                                |
| タスクID   | TASK-LOGS-ARCHIVE-POLICY-001     |
| 機能名     | LOGS.md アーカイブポリシー詳細化 |
| 前提Phase  | Phase 8                          |
| 後続Phase  | Phase 10                         |
| 作成日     | 2026-04-19                       |
| ステータス | completed                        |

## 本タスクにおける品質保証の位置づけ

本タスクは **文書作成のみで実装コード変更を伴わない**。そのため、
一般的な lint / typecheck / 単体テスト / ビルドといったコードベースの
CI チェックは本 Phase の対象外とする。代わりに、以下の
**文書品質ゲート**を Phase 9 の品質保証として実施する。

- Markdown lint（markdownlint-cli / Prettier による構文妥当性検証）
- リンク切れチェック（文書内外の相対パス・URL の到達性）
- YAML フロントマター検証（メタ情報テーブル / YAML 部の整形）
- 相対パス妥当性検証（`.claude/` / `.agents/` / topic-map から見たパス解決性）
- 不変条件 4 項目の機械的検証スクリプト（Phase 2 §不変条件・Phase 3 R-5）

## 目的

Phase 5 で執筆し Phase 6 以降で検証されたポリシー文書および topic-map.md 更新が、
AIWorkflowOrchestrator の文書標準（Markdown 構文・リンク整合性・命名規約・
`.claude` / `.agents` mirror 対称性）を満たしていることを機械的に確認する。
Phase 10 最終レビューへ進むための品質ゲートとして機能する。

## 実行タスク

- Markdown lint の実行と確認（ポリシー文書 2 ファイル + topic-map.md）
- リンク切れチェック（内部相対リンク / 外部 URL）
- YAML フロントマター（存在する場合）の妥当性検証
- 相対パス妥当性検証（`references/` 配下参照が両 mirror で解決可能）
- 不変条件 4 項目の機械的検証スクリプト実行
- 品質レポート（`outputs/phase-9/quality-report.md`）への記録

## 参照資料

| 資料名                       | パス                                                                       | 用途                          |
| ---------------------------- | -------------------------------------------------------------------------- | ----------------------------- |
| Phase 2 設計                 | `docs/30-workflows/logs-archive-policy-001/phase-2-design.md`              | 不変条件 4 項目の参照         |
| Phase 3 設計レビュー         | `docs/30-workflows/logs-archive-policy-001/phase-3-design-review.md`       | R-5（不変条件検証）参照       |
| Phase 5 実装（ポリシー正本） | `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md` | 品質保証対象                  |
| Phase 5 実装（mirror）       | `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md` | 品質保証対象（mirror 対称性） |
| topic-map.md                 | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`              | 参照追加の整合確認            |
| Issue #2282                  | https://github.com/daishiman/AIWorkflowOrchestrator/issues/2282            | 要件原本                      |

## 統合テスト連携【必須】

| 判定項目           | 基準                    | 結果 |
| ------------------ | ----------------------- | ---- |
| mirror 対称性      | diff 差分ゼロ           | PASS |
| links / path       | NOT FOUND 0 件          | PASS |
| docs-only evidence | NON_VISUAL と矛盾しない | PASS |

## 実行手順

### 1. Markdown lint の実行

```bash
# markdownlint-cli を利用する場合
pnpm dlx markdownlint-cli \
  .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md \
  .agents/skills/aiworkflow-requirements/references/logs-archive-policy.md \
  .claude/skills/aiworkflow-requirements/indexes/topic-map.md
# 期待: 0 error

# Prettier による Markdown フォーマット確認
pnpm prettier --check \
  .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md \
  .agents/skills/aiworkflow-requirements/references/logs-archive-policy.md
# 期待: 全ファイル "matched"
```

### 2. リンク切れチェック

```bash
# 内部相対リンク（ポリシー文書から参照される logs-archive-*.md 実例 / topic-map）
pnpm dlx markdown-link-check \
  .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md
pnpm dlx markdown-link-check \
  .agents/skills/aiworkflow-requirements/references/logs-archive-policy.md
# 期待: 全リンクが ALIVE（404/ENOENT なし）
```

### 3. YAML フロントマター検証

本タスクのポリシー文書は YAML フロントマターを必須としないが、
メタ情報テーブル（冒頭の Markdown テーブル）について以下を検証する。

```bash
# メタ情報テーブルの必須項目存在確認
rg -n "^\| (タスクID|作成日|ステータス|最終更新日) " \
  .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md
# 期待: 4 行以上（タスクID・作成日・ステータス・最終更新日）
```

### 4. 相対パス妥当性検証

```bash
# ポリシー文書内の相対パスがすべて解決可能か確認
python3 - <<'PY'
import re, pathlib
for doc in [
    ".claude/skills/aiworkflow-requirements/references/logs-archive-policy.md",
    ".agents/skills/aiworkflow-requirements/references/logs-archive-policy.md",
]:
    base = pathlib.Path(doc).parent
    text = pathlib.Path(doc).read_text()
    for m in re.finditer(r"\[[^\]]+\]\(([^)]+)\)", text):
        link = m.group(1)
        if link.startswith(("http", "#", "mailto:")):
            continue
        resolved = (base / link).resolve()
        assert resolved.exists(), f"NOT FOUND: {doc} -> {link}"
print("OK")
PY
```

### 5. 不変条件 4 項目の機械的検証スクリプト

Phase 2 §不変条件 / Phase 3 R-5 で定義した 4 項目を機械的に検証する。

```bash
# 不変条件 I-1: 命名規則の不変性（正規表現マッチ）
python3 - <<'PY'
import re, pathlib
pattern = re.compile(r"^logs-archive-\d{4}-(0[1-9]|1[0-2])\.md$")
# 新規作成される月次アーカイブは本規則に合致すること
# 既存 legacy（logs-archive-2026-feb.md 等）は別規則として扱う
doc = pathlib.Path(".claude/skills/aiworkflow-requirements/references/logs-archive-policy.md").read_text()
assert "logs-archive-YYYY-MM.md" in doc, "命名規則の記述が無い"
assert "legacy" in doc.lower() or "feb" in doc.lower(), "legacy 表記の共存方針が無い（F-001）"
print("I-1 OK")
PY

# 不変条件 I-2: 閾値の一貫性（300 行 / 30 KB / 月次 が両 mirror で一致）
diff \
  <(rg -n "300 行|30 KB|月次" .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md) \
  <(rg -n "300 行|30 KB|月次" .agents/skills/aiworkflow-requirements/references/logs-archive-policy.md)
# 期待: diff なし（完全一致）

# 不変条件 I-3: mirror 対称性
diff \
  .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md \
  .agents/skills/aiworkflow-requirements/references/logs-archive-policy.md
# 期待: diff なし（完全一致）

# 不変条件 I-4: references 配置（topic-map.md から参照可能）
rg -n "logs-archive-policy" \
  .claude/skills/aiworkflow-requirements/indexes/topic-map.md
# 期待: 1 行以上ヒット（参照エントリ存在）
```

### 6. 文書品質ゲート判定

| チェック項目                         | 基準                       | 結果 |
| ------------------------------------ | -------------------------- | ---- |
| Markdown lint（正本 + mirror + map） | 0 error                    | PASS |
| Prettier check                       | 全ファイル matched         | PASS |
| リンク切れチェック                   | 全リンク ALIVE             | PASS |
| メタ情報テーブル必須項目             | 4 項目以上存在             | PASS |
| 相対パス解決                         | NOT FOUND ゼロ             | PASS |
| 不変条件 I-1（命名規則）             | 規則 + legacy 方針記述あり | PASS |
| 不変条件 I-2（閾値一貫性）           | 両 mirror で完全一致       | PASS |
| 不変条件 I-3（mirror 対称性）        | `diff` なし                | PASS |
| 不変条件 I-4（references 配置）      | topic-map.md に参照行あり  | PASS |

**全項目 PASS の場合のみ Phase 10 へ進む。**

## 受け入れ基準（AC）

| ID   | 受け入れ基準                                                                 | 検証方法                           |
| ---- | ---------------------------------------------------------------------------- | ---------------------------------- |
| AC-1 | Markdown lint / Prettier check が 0 error で完了する                         | 手順 1 の出力ログ                  |
| AC-2 | ポリシー文書内のリンクがすべて到達可能                                       | 手順 2 の markdown-link-check 出力 |
| AC-3 | メタ情報テーブルの必須項目（タスクID・作成日・ステータス・最終更新日）が存在 | 手順 3 の `rg` 出力                |
| AC-4 | 相対パスがすべて解決可能（NOT FOUND ゼロ）                                   | 手順 4 の Python スクリプト出力    |
| AC-5 | 不変条件 I-1〜I-4 の機械的検証がすべて PASS                                  | 手順 5 の各コマンド出力            |
| AC-6 | 品質レポートが `outputs/phase-9/quality-report.md` に保存されている          | ファイル存在確認                   |

## スコープ

### 含むもの

- ポリシー文書（正本 + mirror）の Markdown 構文・フォーマット検証
- topic-map.md 更新の構文検証
- 文書内リンク・相対パスの到達性検証
- 不変条件 4 項目の機械的検証
- 品質レポートの作成

### 含まないもの

- コード（TypeScript / JavaScript）の lint / typecheck / テスト（本タスクはコード変更なし）
- ビルド（本タスクは pnpm ビルド成果物に影響しない）
- Phase 11 の手動読み合わせ（Phase 11 で実施）
- 閾値値そのものの妥当性再評価（Phase 10 の R-1 対応）

## リスクと対策

| リスク                                    | 影響度 | 対策                                                                  |
| ----------------------------------------- | ------ | --------------------------------------------------------------------- |
| markdownlint-cli が未インストール         | 低     | `pnpm dlx` による都度実行で対応、CI 未導入でも支障なし                |
| 相対パス解決スクリプトが Python 依存      | 低     | macOS / Linux 標準で Python3 利用可能、代替として Node スクリプトも可 |
| mirror 対称性 diff が CRLF / EOF で誤検知 | 中     | `diff -w` or 事前に `prettier --write` を両側に適用して改行統一       |
| 不変条件 I-1 の legacy 共存方針記述が曖昧 | 中     | Phase 3 F-001 対応として「legacy は残置・新規は YYYY-MM」を明示       |

## 多角的チェック観点

| 観点            | チェック内容                                     |
| --------------- | ------------------------------------------------ |
| validator 実測  | lint / path / metadata / diff が実測で説明可能か |
| docs-only 整合  | コードタスク向け品質項目を持ち込みすぎていないか |
| NON_VISUAL 証跡 | screenshot 不要方針と手動テスト証跡が一致するか  |

## サブタスク管理

- [ ] lint / path / metadata / invariants の点検
- [ ] quality-report 出力方針の固定
- [ ] Phase 10 へ持ち込む未解決項目の整理

## 次Phaseへの引き継ぎ

### Phase 10（最終レビュー）に引き継ぐ事項

- 品質ゲート全 PASS の証跡（`outputs/phase-9/quality-report.md`）
- 不変条件 4 項目の機械的検証が PASS であること
- mirror 対称性 diff 結果（Phase 10 で再確認）
- markdown-link-check 出力のうち要注意リンク（外部 URL の一時失敗等）

### 未解決事項として Phase 10 に持ち込む項目

- なし（全 PASS が完了条件のため）。PASS しない場合は Phase 5 または Phase 2 へ戻る。

## 成果物

| 成果物           | パス                                | 説明                                            |
| ---------------- | ----------------------------------- | ----------------------------------------------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | Markdown lint / リンク / 不変条件検証結果の記録 |

## 完了条件

- [ ] Markdown lint / Prettier check が 0 error
- [ ] リンク切れチェックで全リンク ALIVE
- [ ] メタ情報テーブル必須項目が揃っている
- [ ] 相対パス解決で NOT FOUND ゼロ
- [ ] 不変条件 I-1〜I-4 が全て PASS
- [ ] 品質レポートが `outputs/phase-9/quality-report.md` に保存済み
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 品質レポートを生成可能な状態にした
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認した
