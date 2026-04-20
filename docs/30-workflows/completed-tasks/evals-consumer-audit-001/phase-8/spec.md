# Phase 8: Schema Change Guide 作成 - タスク仕様書

## メタ情報

| 項目              | 内容                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------ |
| phase_id          | phase-8                                                                                                                  |
| task_id           | TASK-EVALS-CONSUMER-AUDIT-001                                                                                            |
| Phase             | 8                                                                                                                        |
| Phase名           | schema-change-guide 作成（Refactoring 相当 / 監査タスク固有の再解釈）                                                    |
| 機能名            | evals-consumer-audit                                                                                                     |
| 作成日            | 2026-04-19                                                                                                               |
| status            | 未実施                                                                                                                   |
| depends_on        | Phase 5（consumer-audit-report.md / evals-field-map.md）、Phase 6（dual-root-parity.md）、Phase 7（coverage-recheck.md） |
| blocks            | Phase 9（references 整合検証）                                                                                           |
| 前提Phase         | Phase 7                                                                                                                  |
| 後続Phase         | Phase 9                                                                                                                  |
| taskType          | NON_VISUAL / 調査・文書化タスク（コード実装なし）                                                                        |
| 出力先            | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md`                                      |
| 対応 AC           | AC-5 / FR-7（Phase 1 要件定義）、AC-6 解除条件（TASK-CONFLICT-PREVENT-001）                                              |
| 対応 Quality Gate | QG-7（Phase 2）                                                                                                          |

---

## 1. 目的（Why）

Phase 5（consumer 一覧・field map）と Phase 6（dual root 差分表）と Phase 7（漏れ再検索）の成果物を統合し、**フィールド追加／削除／リネームの 3 操作**を安全に実施するための手順書（schema-change-guide.md）を作成する。これは AC-6（「consumer 監査完了まで EVALS schema 変更禁止」）解除後に、後続のスキーマ変更タスクが参照する**唯一の正本手順書**となる。

本 Phase はコード実装を一切含まず、Markdown ドキュメントとして変更手順・影響範囲・dual root 同期ルール・検証手順・consumer 追加時のメンテナンスルールを体系化することが唯一の責務である。

---

## 2. 入力（前Phase成果物・参照資料）

### 2.1 前Phase成果物（必須入力）

| 成果物                   | パス                                                                                  | 用途                                                              |
| ------------------------ | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| consumer-audit-report.md | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md` | 各 consumer の read/write/validate フィールドと分類軸を参照する   |
| evals-field-map.md       | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md`       | フィールド逆引きで reader/writer/validator を特定する             |
| dual-root-parity.md      | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/dual-root-parity.md`      | dual root 同期手順の根拠（差分タイプ別の扱い）                    |
| coverage-recheck.md      | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/coverage-recheck.md`      | 漏れ 0 の証跡（ガイド記載の consumer 集合が完全であることの保証） |

### 2.2 設計書（参照資料）

| 資料                           | パス                                                                                   | 用途                                      |
| ------------------------------ | -------------------------------------------------------------------------------------- | ----------------------------------------- |
| Phase 1 要件定義               | `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-1-requirements.md`       | AC-5 / FR-7 定義、RISK-4 対策             |
| Phase 2 スコープ・アーキ       | `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-2-scope-architecture.md` | §3.1 dual root 断定禁止、QG-7 定義        |
| Phase 3 Phase 設計             | `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-3-phase-design.md`       | Phase 8 の「必須内容」6 項目の原文        |
| TASK-CONFLICT-PREVENT-001 指示 | `docs/30-workflows/unassigned-task/TASK-EVALS-CONSUMER-AUDIT-001.md`                   | AC-6 原文、解除条件 4 項目                |
| review-gate-criteria.md        | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`         | レビューゲート判定基準（Phase 10 で使用） |

### 2.3 入力検証

Phase 8 着手前に以下を確認する（未充足の場合は Phase 5/6/7 へ差し戻し）。

- [ ] Phase 5 の 2 成果物が存在し、QG-3 / QG-4 を PASS している
- [ ] Phase 6 の dual-root-parity.md が存在し、QG-5 を PASS している
- [ ] Phase 7 の coverage-recheck.md で漏れヒット 0 件が確認済
- [ ] Phase 1 AC-5 / FR-7 の文言が本 Phase の完了条件と整合している

---

## 3. 実行手順

### ステップ 1: 前段成果物の読込と論点抽出

```bash
# 前段成果物の存在確認
ls -1 docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md \
       docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md \
       docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/dual-root-parity.md \
       docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/coverage-recheck.md
```

- consumer-audit-report.md から「write を行う consumer」「validate を行う consumer」を抽出する
- evals-field-map.md から「フィールド × reader/writer/validator」の逆引きを抽出する
- dual-root-parity.md の差分タイプ（0 / 許容 / 要対応）を「同期ルール」セクションに反映する

### ステップ 2: schema-change-guide.md 骨子作成

Phase 3 設計書§Phase 8「必須内容」の 6 項目を骨子とする。

1. フィールド追加手順
2. フィールド削除手順
3. フィールドリネーム手順
4. dual root 同期ルール
5. 検証手順
6. consumer 追加時の運用ルール

### ステップ 3: 3 操作 × 4 観点マトリクスの作成

Phase 2 QG-7 合格基準に従い、3 操作（add / remove / rename）それぞれについて以下 4 観点を表にする。

| 観点               | 記述内容                                                                    |
| ------------------ | --------------------------------------------------------------------------- |
| 影響範囲           | どの consumer が影響を受けるか（consumer-audit-report.md の該当行へリンク） |
| 手順               | 変更順序・commit 粒度・dry-run 方法                                         |
| dual root 同期手順 | `.claude/skills/` と `.agents/skills/` の変更順序と一貫性確保               |
| 検証手順           | 変更後に実行する `rg` / `diff` / `node --check` コマンド列                  |

### ステップ 4: フィールド追加手順セクション作成

- 既存 consumer が `undefined` を許容するかを evals-field-map.md の `readers` 列から判定
- 追加フィールドのデフォルト値ポリシー（null / 0 / []）を明示
- `validate-schemas.js` への追加ルールが必要かどうかを判定
- initializer 系 consumer（`init_skill.js`）に追加書込みが必要かを明記

### ステップ 5: フィールド削除手順セクション作成

- evals-field-map.md の `readers` / `writers` / `validators` 全列で空でないフィールドは削除禁止
- 削除可能と判断した場合も、dual root 両方で同時削除する commit 手順を記載
- 削除後の既存 EVALS.json 実ファイルからのフィールド除去は別タスクに委譲する旨を明示（本タスクはスキーマガイドのみ）

### ステップ 6: フィールドリネーム手順セクション作成

- リネームは「新フィールド追加 → 全 consumer を新フィールド対応に更新 → 旧フィールド削除」の 3 段階に分解
- 各段階の dual root 同期点と検証コマンドを列挙
- リネーム対象フィールドの `readers` / `writers` / `validators` から更新漏れ禁止リストを生成

### ステップ 7: dual root 同期ルールセクション作成

Phase 2 §3.1 の「dual root 正本断定禁止」方針を踏襲しつつ、以下のルールを記述する。

- 変更順序: `.claude/skills/` → `.agents/skills/` の順で適用し、`diff` で同期確認する
- 差分タイプ別対応:
  - 差分タイプ「0（完全一致）」: 両 root を同一 commit で更新
  - 差分タイプ「許容（運用メトリクスのみ）」: スキーマ変更時は両 root でスキーマキーのみ同期
  - 差分タイプ「要対応（構造差異）」: 本ガイド適用前に未タスクで構造差異を解消する
- 片 root 欠損スキル: ガイド適用前に dual-root-parity.md の該当行を確認し、欠損理由を明記

### ステップ 8: 検証手順セクション作成

スキーマ変更後に実行する検証コマンド列を以下 3 カテゴリで列挙する。

| カテゴリ           | コマンド例                                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 静的参照検証       | `rg -n '<変更フィールド名>' .claude/skills/ .agents/skills/ apps/ -g '*.{js,ts,tsx,md}'`                                      |
| dual root 一致検証 | `for s in $(ls .claude/skills); do diff .claude/skills/$s/EVALS.json .agents/skills/$s/EVALS.json; done`                      |
| JSON パース検証    | `find .claude/skills .agents/skills -name EVALS.json -exec node -e "JSON.parse(require('fs').readFileSync('{}', 'utf8'))" \;` |

### ステップ 9: consumer 追加時の運用ルールセクション作成（RISK-4 対策）

Phase 1 RISK-4「監査後に新規 consumer が追加されてスキーマが変更禁止のまま放置される」への対策として以下を記述する。

- 新規 consumer を追加する PR では必ず evals-field-map.md の `readers` / `writers` / `validators` を更新する
- consumer 追加時のチェックリスト（本ガイドに含める）:
  - [ ] consumer-audit-report.md に 1 行追加したか
  - [ ] evals-field-map.md の該当フィールドの `readers` / `writers` / `validators` を更新したか
  - [ ] dual root の対称性が維持されているか
  - [ ] schema-change-guide.md の記述が現状と乖離していないか（必要なら更新）
- CI フック化は別タスク（unassigned-task 候補）として言及のみにとどめる

### ステップ 10: AC-6 解除条件とガイドの関係を明記

schema-change-guide.md の末尾に、本ガイドが AC-6 解除条件「schema-change-guide.md でフィールド変更手順が定義されている」を満たす旨を明記する。実際の解除判定は Phase 10 で行うため、ここでは「本ガイドが Phase 10 解除判定の入力となる」事実のみを記述する。

### ステップ 11: 内部リンク検証

- consumer-audit-report.md / evals-field-map.md / dual-root-parity.md への相対リンクが全て正しく解決することを Markdown エディタまたは `grep` で確認
- 壊れたリンクが 0 件であることを確認

---

## 4. 成果物（パス・フォーマット・スキーマ）

### 4.1 主成果物

| 成果物                 | パス                                                                                | フォーマット                                                         |
| ---------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| schema-change-guide.md | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md` | Markdown（GitHub Flavored Markdown）。目安 1000 行以内、超過時は分割 |

### 4.2 成果物セクション構成（必須）

```
# EVALS.json Schema Change Guide

## メタ情報
## 1. 目的
## 2. 前提条件
## 3. フィールド追加手順（4 観点マトリクス）
## 4. フィールド削除手順（4 観点マトリクス）
## 5. フィールドリネーム手順（4 観点マトリクス）
## 6. dual root 同期ルール
## 7. 検証手順（静的参照 / dual root 一致 / JSON パース）
## 8. consumer 追加時の運用ルール（RISK-4 対策）
## 9. 未対応事項・未タスク候補
## 10. AC-6 解除条件との対応表
## 参照資料
```

### 4.3 スキーマ仕様（マトリクス列）

3 操作別の手順表は以下の列を持つこと。

| 列名               | 型       | 必須 | 説明                                                              |
| ------------------ | -------- | ---- | ----------------------------------------------------------------- |
| step               | integer  | ○    | 手順番号                                                          |
| action             | string   | ○    | 実施内容                                                          |
| affected_consumers | string[] | ○    | 影響を受ける consumer のパス（consumer-audit-report.md との整合） |
| dual_root_scope    | enum     | ○    | `.claude` / `.agents` / `both` / `n/a`                            |
| validation         | string   | ○    | 検証コマンドまたは確認項目                                        |
| notes              | string   |      | 特記事項                                                          |

---

## 5. 完了条件チェックリスト

- [ ] `outputs/phase-8/schema-change-guide.md` が存在する
- [ ] フィールド「追加／削除／リネーム」3 操作すべてに 4 観点（影響範囲／手順／dual root 同期／検証）が記載されている（QG-7）
- [ ] dual root 同期ルールが差分タイプ（0 / 許容 / 要対応）別に記述されている
- [ ] 検証手順に静的参照検証・dual root 一致検証・JSON パース検証の 3 カテゴリが含まれている
- [ ] consumer 追加時の運用ルール（チェックリスト付き）が記載されている（RISK-4）
- [ ] consumer-audit-report.md / evals-field-map.md / dual-root-parity.md への相対リンクが壊れていない
- [ ] AC-6 解除条件「schema-change-guide.md でフィールド変更手順が定義されている」との対応が明記されている
- [ ] Phase 1 AC-5 / FR-7 の記述と矛盾しない
- [ ] ファイルサイズが 1000 行以内、超過時は分割されている（NFR-8）

---

## 6. 検証方法（自己検証コマンド）

### 6.1 ファイル存在・サイズ検証

```bash
test -f docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md \
  && echo "OK: schema-change-guide.md exists" \
  || echo "NG: missing"

wc -l docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md
```

### 6.2 3 操作 × 4 観点カバレッジ検証

```bash
# 3 操作見出しが揃っているか
rg -n '^##\s+(\d+\.\s+)?(フィールド追加|フィールド削除|フィールドリネーム)' \
   docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md

# 4 観点キーワードが各操作配下に存在するか
for kw in '影響範囲' '手順' 'dual root 同期' '検証'; do
  echo "--- $kw ---"
  rg -n "$kw" docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md || echo "NG: $kw not found"
done
```

### 6.3 前段成果物リンク健全性

```bash
# 相対リンクが存在ファイルを指しているか
rg -o '\]\(([^)]+\.md)\)' docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md \
  | sed 's/.*(\(.*\))/\1/' | while read -r link; do
    test -f "docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/$link" \
      || test -f "$link" \
      || echo "BROKEN: $link"
  done
```

### 6.4 consumer 追加時チェックリスト存在確認

```bash
rg -n 'consumer 追加時|consumer-audit-report\.md に 1 行追加|evals-field-map\.md の該当フィールド' \
   docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md
```

### 6.5 AC-6 対応明記確認

```bash
rg -n 'AC-6|CONFLICT-PREVENT-001' \
   docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md
```

---

## 7. リスクと対策

| リスク ID | リスク                                                                 | 発生確率 | 影響 | 対策                                                                              |
| --------- | ---------------------------------------------------------------------- | -------- | ---- | --------------------------------------------------------------------------------- |
| P8-R-1    | 3 操作のうち rename を add+remove の合成と混同し、独立手順が書かれない | 中       | 中   | rename セクションを独立させ、「3 段階分解」を明示                                 |
| P8-R-2    | dual root 同期で正本を断定してしまい、Phase 2 方針と衝突               | 中       | 高   | 「正本判定は本ガイド範囲外、両 root を同一 commit で更新する」ルールに固定        |
| P8-R-3    | consumer-audit-report.md の更新があるのに本ガイドが更新されず乖離      | 中       | 高   | 「consumer 追加時の運用ルール」でガイド自身の更新義務を明記（RISK-4 対策）        |
| P8-R-4    | 検証コマンドが環境依存（jq 等）で再現不能                              | 低       | 中   | Phase 2 §7.3 に従い `jq` 等は使わず、`rg` / `diff` / `node` のみで構成            |
| P8-R-5    | スキーマ定義を再記述してしまい evals-field-map.md と二重管理           | 中       | 中   | 本ガイドはフィールドスキーマの定義を含めず、evals-field-map.md への参照に統一する |
| P8-R-6    | 1000 行超過で可読性が落ちる                                            | 低       | 低   | 分割条件を明示し、3 操作別に `schema-change-guide-{add,remove,rename}.md` へ分割  |

---

## 8. 前/後 Phase との依存

### 8.1 前 Phase からの依存

- **Phase 5**: consumer-audit-report.md / evals-field-map.md を入力として全面参照する。Phase 5 の QG-3 / QG-4 が PASS していない場合、本 Phase は着手不可。
- **Phase 6**: dual-root-parity.md の差分タイプを「dual root 同期ルール」セクションに転記する。Phase 6 の QG-5 が PASS していない場合、着手不可。
- **Phase 7**: coverage-recheck.md で漏れ 0 が保証されていないと、本ガイドの「影響範囲」記述が不完全となる。QG-6 PASS が前提。

### 8.2 後 Phase への引き継ぎ

- **Phase 9**: 本ガイドの記述が `.claude/skills/aiworkflow-requirements/references/` 内の EVALS 関連記述と矛盾しないかを検証する。矛盾発見時は Phase 9 で未タスク化し、本ガイド本体は変更しない。
- **Phase 10**: 本ガイドの存在と QG-7 PASS が AC-6 解除判定「schema-change-guide.md でフィールド変更手順が定義されている」条件を満たす根拠となる。

### 8.3 Phase 3 設計との整合

Phase 3 設計書 W4（Phase 8）で「W2 + W3 の成果を統合」と定義されており、本 Phase は W4 の単独ウェーブとして実行する（並列化なし）。W5（Phase 9）は本 Phase 完了を待って開始する直列依存のため、本 Phase のスケジュールが後続全体のクリティカルパスに直結する点に留意する。

---

## 統合テスト連携【必須】

| 判定項目                                        | 基準       | 結果    |
| ----------------------------------------------- | ---------- | ------- |
| 3 操作（add/remove/rename）× 4 観点の記載完了   | 100%       | pending |
| dual root 同期ルールが差分タイプ 3 区分別に記述 | 3 区分全て | pending |
| 検証コマンドが 3 カテゴリ分記載                 | 3 カテゴリ | pending |
| consumer 追加時運用ルールのチェックリスト項目数 | 4 項目以上 | pending |
| 前段成果物への相対リンク健全性                  | 壊れ 0     | pending |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] schema-change-guide.md が生成されていることを確認
- [ ] 自己検証コマンド（§6）を実行し QG-7 PASS を確認
- [ ] Phase 9 への引き継ぎ事項を `phase-9/spec.md` 側から参照可能な状態にする

---

## 次のPhase

`docs/30-workflows/evals-consumer-audit-001/phase-9/spec.md`（正本整合性検証）
