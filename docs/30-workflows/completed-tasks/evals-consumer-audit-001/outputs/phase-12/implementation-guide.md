# evals-consumer-audit - 実装ガイド

> TASK-EVALS-CONSUMER-AUDIT-001 Phase 12 Task 1 成果物。
> Part 1: 中学生レベル説明 / Part 2: 技術者向け説明 の 2 部構成。
> 本ファイルは PR description の元になる close-out ガイド。
> canonical 4 成果物は Phase 5 / 6 / 8 のパスを**参照**する（Phase 12 では複製しない）。

---

## メタ情報

| 項目                | 内容                                                       |
| ------------------- | ---------------------------------------------------------- |
| タスクID            | TASK-EVALS-CONSUMER-AUDIT-001                              |
| 機能名              | evals-consumer-audit                                       |
| Phase               | 12（close-out）                                            |
| 対象読者            | PR レビュアー / 今後 EVALS.json を変更する開発者 / 学習者  |
| 作成日              | 2026-04-19                                                 |
| taskType            | NON_VISUAL / 監査タスク（docs-only・コード実装なし）       |
| implementation_mode | verify_existing                                            |
| issue_number        | 2279（CLOSED・fix-forward 仕様書作成方針）                 |
| 判定結果            | **AC-6 解除可能（PASS 4/4）** / Phase 11 再現検証 5/5 PASS |

---

## Part 1

このパートは、プログラミング初心者・中学生レベルの読者が「このタスクが何を解決したのか」を理解するための説明です。専門用語は最小限にして、身近な例えで説明します。

### なぜ必要か

このプロジェクトには `EVALS.json` という「スキルの成績表」のようなファイルが、スキルごとに置いてあります。スキルが何回使われたか、成功率は何％か、今はレベル何かが記録されています。

たとえば:

- ❌ 悪い例（専門的すぎる）: 「EVALS.json の schema に consumer から片方向参照があり NaN 伝播の可能性がある」
- ⭕ 良い例（わかりやすい）: 「成績表の書き方を急に変えると、それを読むロボットが壊れてしまう。誰がその成績表を読んでいるか、全員を数え上げないと怖くて書き方を変えられない」

この成績表は、全部で 2 か所（`.claude/skills/` と `.agents/skills/`）に同じものがコピーされています。もし片方だけ書き換えてしまうと、2 つがズレて「どっちが本物？」と混乱します。

さらに、成績表を読むロボット（スクリプトやテスト）が何台あるのかが、これまで誰も数えたことがありませんでした。ロボットが何台あるか分からない状態で成績表の書き方を変えると、どこかのロボットがいきなり壊れる危険がありました。

**このタスクは「成績表を変えても安全かどうか」を決めるために、ロボットを全部数えて、変え方の手順書を作ることを目的としています。**

### 何をするか

このタスクは次の順番で作業しました:

1. コードを全部さがして、`EVALS.json` を読んだり書いたりしているロボットを 1 台ずつ数える
2. 読んでいる「欄」（たとえば「使用回数」「成功率」）を欄ごとに一覧表にする
3. 2 か所にあるコピー（`.claude/` と `.agents/`）が本当に同じものか、ファイルを 1 バイトずつ比べる
4. もし成績表に新しい欄を足したり、欄を消したり、欄の名前を変えたりしたいときの「安全な手順書」を作る
5. 見つけた問題点を全部書き出して、将来直すための宿題リストにする

### 日常の例え

**たとえば:** クラス全員の身長を記録した「健康カード」があるとします。

```
           健康カード
  名前     身長    体重    視力
────────────────────────────
  太郎     150     42.0    1.0
  花子     148     40.5    1.2
  次郎     155     45.0    0.8
```

このカードを、

- 保健室の先生（ロボット A：読み書きする）
- 担任の先生（ロボット B：読むだけ）
- 通知表を作るプリンター（ロボット C：読むだけ）
- 体育の先生のノート（ロボット D：コピーだけ）

が見ています。

いま先生が「身長」を「高さ（cm）」にリネームしようとしたとします。でも、**誰がカードを見ているかリストがない**と、担任の先生のプログラムが「身長」を探して見つからず、フリーズしてしまいます。

このタスクでやったのは「誰がカードを見ているかの名簿を作る」ことと、「欄の名前を変える前に誰に声をかけないといけないかの手順書を書く」ことです。

たとえば、以下のような「名簿」と「手順書」を作りました:

```
  「身長」を使っている人（readers）: 3 人
  「身長」を書き換える人（writers）: 1 人
  「身長」をチェックする人（validators）: 0 人 ← これが一番こわい!
```

「チェックする人が 0 人」というのが最も大きな発見でした。いまの仕組みでは、誰かが間違えて欄を消しても、自動で警告が出ません。だから「手順書」では「人間が 3 つのコマンドを手で打って確認してね」と書きました。

### 今回作ったもの

| 日本語               | 英語                     | 役割                                                |
| -------------------- | ------------------------ | --------------------------------------------------- |
| consumer 一覧        | consumer-audit-report.md | 誰が EVALS.json を読んでいるかの名簿（32 人分）     |
| 欄ごとの逆引きマップ | evals-field-map.md       | 欄ごとに「読む人／書く人／チェックする人」の一覧    |
| 2 か所比較レポート   | dual-root-parity.md      | 2 つのコピーが本当に同じかを 1 バイトずつ比べた記録 |
| 変更手順書           | schema-change-guide.md   | 欄を足す/消す/リネームするときの安全手順書          |

結果として:

- **32 人の読み手（consumer）**を全員数え切った（コード 1 / スクリプト 10 / テスト 3 / ドキュメント 18）
- **56 個の欄**について「読む人・書く人」の逆引きマップを作った
- **2 か所のコピーは 6 スキル全部バイト単位で同じ**だった（完全に同期が取れている）
- **チェックする人（validator）が 0 人**という大発見 → 将来の宿題に登録
- **camelCase と snake_case の 2 種類のスキーマが混ざって使われている**という発見 → 将来の宿題に登録
- **「変更しても良いよ」という許可（AC-6 解除）を出せる状態**になった

---

## Part 2

> Part 2 は技術者・開発者向け。PR レビュアーは本パートを読めば、監査成果物の場所・発見事項・AC 達成状況・未解決タスクが一望できる。

## 1. 全 Phase 実行サマリ（Wave 1〜7）

本タスクは `task-specification-creator` の Phase 3 で定義した 10 ウェーブに沿って並列/直列で実行された。close-out 以前の実行結果サマリを以下に示す。

| Wave | Phase      | 出力先 / 主な成果物                                                                                                            | 結果                                                                                                                                                                              |
| ---- | ---------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W1   | Phase 4    | `outputs/phase-4/raw-grep-*.txt`, `raw-find-evals.txt`                                                                         | 6 種 raw evidence 収集。`rg` / `find` をメタコメント付きで固定化。EVALS.json は 13 ファイル（`.claude` 6 / `.agents` 6 / fixture 1）                                              |
| W2   | Phase 5, 6 | ★`outputs/phase-5/consumer-audit-report.md`<br>★`outputs/phase-5/evals-field-map.md`<br>★`outputs/phase-6/dual-root-parity.md` | consumer 32 件を A/B/C/D 4 分類で確定。フィールド 56 件の逆引きマップ作成。`.claude` / `.agents` の 6 スキル全件を `cmp -s` IDENTICAL / SHA-256 一致で **bit-for-bit 同一**と確認 |
| W3   | Phase 7    | `outputs/phase-7/coverage-recheck.md`                                                                                          | 第 2 回再検索で Phase 4 と完全一致（差分 0）。`unlisted-paths.txt` = 0 行、QG-6 PASS                                                                                              |
| W4   | Phase 8    | ★`outputs/phase-8/schema-change-guide.md`                                                                                      | 追加 / 削除 / リネームの 3 操作について、影響範囲・手順・dual root 同期・検証コマンドを体系化。QG-7 PASS                                                                          |
| W5   | Phase 9    | `outputs/phase-9/spec-alignment-report.md`                                                                                     | `aiworkflow-requirements/references/` との突合。EVALS.json 言及 9 件を分類し、不整合は全て未タスク候補化。QG-8 PASS                                                               |
| W6   | Phase 10   | `outputs/phase-10/ac6-release-verdict.md` / `outputs/phase-10/final-review-log.md`                                             | **AC-6 解除判定 PASS（4/4 条件充足）**。MINOR / MAJOR なし。Phase 11 進行可                                                                                                       |
| W7   | Phase 11   | `outputs/phase-11/manual-test-result.md`（primary evidence）                                                                   | 再現コマンド iteration #3 で RC-1〜RC-5 全 PASS。consumer-audit-report.md との差分 0。QG-10 PASS                                                                                  |

### 1.1 4 つの★最終成果物

canonical 4 成果物は Phase 5 / 6 / 8 に配置されており、**Phase 12 では複製せず参照する**。

| #   | 名称                     | 正本パス                                                                              | 役割                                                                                                                                |
| --- | ------------------------ | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1   | consumer-audit-report.md | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md` | 32 consumer × 9 列（path/root/category/operation/referenced_fields/updated_fields/target_evals_paths/dynamic_path/notes）の完全名簿 |
| 2   | evals-field-map.md       | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md`       | 56 フィールド × 8 列（field_path/type/schema_origin/readers/writers/validators/risk_on_change/notes）の逆引きマップ                 |
| 3   | dual-root-parity.md      | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/dual-root-parity.md`      | `.claude/skills/` vs `.agents/skills/` の 6 スキル bit-for-bit 比較（分類 0 = 完全一致）                                            |
| 4   | schema-change-guide.md   | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md`   | add / remove / rename 3 操作の唯一の正本手順書（§3 / §4 / §5）                                                                      |

---

## 2. どうやって動くの？

### 2.1 全体の流れ

```
  [W1] raw evidence 収集 (rg / find / diff の固定化)
       ↓
  [W2] consumer 整理 (32 件)  ／  dual root diff (6 スキル bit 一致)
       ↓                               ↓
  [W3] 漏れ再検索 (Phase 4 と 0 差分)
       ↓
  [W4] schema-change-guide 作成 (add / remove / rename)
       ↓
  [W5] 正本 references との突合 (不整合は未タスク化)
       ↓
  [W6] AC-6 解除判定 PASS (4/4)
       ↓
  [W7] 第三者再現手動検証 (iteration #3 PASS)
       ↓
  [W8〜W9] Phase 12 close-out 6 成果物 (本フェーズ)
       ↓
  [W10] Phase 13 PR 作成
```

### 2.2 監査結果の保存方法

本タスクは docs-only のため、保存先は全て `docs/30-workflows/evals-consumer-audit-001/outputs/phase-N/` 配下の Markdown。正本の `.claude/skills/` / `.agents/skills/` への書き込みは **一切行わない**（Phase 9 §メタ情報で不変性確認済）。

---

## 3. 重要な発見

### 3.1 validator = 0 件（最重要）

EVALS.json の **構造を機械的に検証する consumer は現状 0 件**。

- `.claude/skills/skill-fixture-runner/scripts/validate-schemas.js` は `schemas/*.json` のみを対象とし、EVALS.json の中身は見ない
- `apps/desktop/src/main/services/skill/SkillScanner.ts` はファイル存在 + size + type=evals タグのみ
- TypeScript 型も存在しない

影響: フィールド削除・リネーム時のサイレント破損（`undefined` 参照→NaN 伝播）を自動検出する機構が無い。`schema-change-guide.md` §7 の 3 カテゴリ手動検証コマンド（静的参照 / dual root 一致 / JSON パース）が唯一のガード。

### 3.2 camelCase / snake_case 二重スキーマ併存

同一概念が 2 系統のキー名で並立している:

| 概念         | camelCase 系（v2）        | snake_case 系（v1）         | 該当スキル                                                                                                                            |
| ------------ | ------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 現在レベル   | `currentLevel`            | `current_level`             | camel: task-specification-creator / int-test-skill / github-issue-manager<br>snake: skill-creator / aiworkflow-requirements / fixture |
| 累計使用回数 | `metrics.totalUsageCount` | `metrics.total_usage_count` | 同上                                                                                                                                  |
| 最終評価日時 | `metrics.lastEvaluated`   | `metrics.last_evaluated`    | 同上                                                                                                                                  |

影響: 同じスキル内でも init（camelCase）と log_usage（snake_case）がミスマッチなケース（skill-creator）が存在 → `NaN` 伝播の潜在リスク。本監査では **正本を断定せず**、`schema-change-guide.md` §5 リネーム手順は両系統を扱う。

### 3.3 dual root bit-for-bit 一致

`.claude/skills/*/EVALS.json`（6 件）と `.agents/skills/*/EVALS.json`（6 件）は **全て完全一致**。

| 比較方法  | 結果                                                   |
| --------- | ------------------------------------------------------ |
| `diff -u` | 出力空（6 ペアすべて）                                 |
| `cmp -s`  | IDENTICAL（6 ペアすべて）                              |
| SHA-256   | 両 root で同一ハッシュ（6 ペアすべて・バイト数も一致） |

これにより「dual root 正本はどちらか」の議論を**本タスクでは断定せず**、両 root を同一 commit で同時更新する運用に固定する方針（Phase 2 §3.1）が成立。

### 3.4 動的パス consumer が 13 件

`path.join(skillDir, "EVALS.json")` / `resolve(SKILL_DIR, ...)` のような動的構築を行う consumer が 13 件存在。`rg 'EVALS\.json'` だけでは見落とす可能性があり、Phase 2 §7.2 / Phase 4 Step 2 / Phase 7 §1 の再現コマンドでは **dynamic 検索を独立 kind として実行**している。

### 3.5 fixture が snake_case を test 契約として固定

`apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts:163` の `expect(evals.skill_name).toBeDefined()` が snake_case を **unit test 契約として固定**。代表スキーマを camelCase に統一する方向でリネームするなら、**このテストの修正が必須**。schema-change-guide.md §5 リネーム手順に明記済。

---

## 4. 作ったものの全体像

```
  docs/30-workflows/evals-consumer-audit-001/
  ├── design-docs/
  │   └── phase-3-phase-design.md          ← Phase 4〜13 設計（W1〜W10）
  │
  ├── outputs/
  │   ├── phase-4/  raw evidence (grep/find 固定)
  │   ├── phase-5/
  │   │   ├── ★ consumer-audit-report.md   ← canonical #1 (32 consumer)
  │   │   └── ★ evals-field-map.md         ← canonical #2 (56 field)
  │   ├── phase-6/
  │   │   └── ★ dual-root-parity.md        ← canonical #3 (6 スキル bit 一致)
  │   ├── phase-7/  coverage-recheck.md (Phase 4 と 0 差分)
  │   ├── phase-8/
  │   │   └── ★ schema-change-guide.md     ← canonical #4 (add/remove/rename)
  │   ├── phase-9/  spec-alignment-report.md (未整合→未タスク化)
  │   ├── phase-10/ ac6-release-verdict.md (AC-6 PASS 4/4)
  │   ├── phase-11/ manual-test-result.md (primary evidence / NON_VISUAL)
  │   └── phase-12/ (本フェーズ close-out 6 成果物)
  │       ├── implementation-guide.md       ← 本ファイル
  │       ├── system-spec-update-summary.md (Task 2 で生成)
  │       ├── documentation-changelog.md    (Task 3 で生成)
  │       ├── unassigned-task-detection.md  (Task 4 で生成)
  │       ├── skill-feedback-report.md      (Task 5 で生成)
  │       └── phase12-task-spec-compliance-check.md (Task 6 で集約)
  │
  └── phase-{1..13}/  ← 各 Phase の spec.md
```

---

## 5. AC-1 〜 AC-8 達成状況

Phase 1 で定義した受入基準 8 項目の達成状況は以下のとおり。

| AC   | 基準                                                                 | 達成 | 直接根拠                                                                                                                                                                                           |
| ---- | -------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | 全 consumer が consumer-audit-report.md に記載されている             | ✅   | `phase-5/consumer-audit-report.md` §1.1 で 32 consumer / A=1, B=10, C=3, D=18 を網羅。Phase 7 `unlisted-paths.txt` = 0 行で保証                                                                    |
| AC-2 | 各 consumer の operation / referenced_fields / updated_fields を明示 | ✅   | `phase-5/consumer-audit-report.md` §3〜§6 で全 consumer に 9 列記載                                                                                                                                |
| AC-3 | 代表スキーマ全フィールドの逆引きを evals-field-map.md に記載         | ✅   | `phase-5/evals-field-map.md` §3.1〜§3.9 で 56 フィールド × 8 列。§4.1 集計で総数 56 を自己検証                                                                                                     |
| AC-4 | dual root 差分が 0 または許容範囲                                    | ✅   | `phase-6/dual-root-parity.md` §2 で 6 スキル全件「分類 0（完全一致）」。SHA-256 同一                                                                                                               |
| AC-5 | add / remove / rename 3 操作の手順書が存在                           | ✅   | `phase-8/schema-change-guide.md` §3 / §4 / §5 で 3 操作 × 影響範囲 / 手順 / dual root 同期 / 検証を体系化                                                                                          |
| AC-6 | TASK-CONFLICT-PREVENT-001 AC-6 の解除判定が明示                      | ✅   | `phase-10/ac6-release-verdict.md` で **PASS 4/4（解除可能）**                                                                                                                                      |
| AC-7 | 発見した未タスク候補の記録先が明示                                   | ✅   | `phase-5/consumer-audit-report.md` §8（6 件）+ `phase-9/spec-alignment-report.md`（正本整合）+ `phase-11/discovered-issues.md`。`unassigned-task-detection.md` と unassigned task 実ファイルで確定 |
| AC-8 | 再現コマンドが列挙され、第三者が同一結果を得られる                   | ✅   | `phase-2/spec.md` §7.2 / `phase-5/consumer-audit-report.md` §11 / `phase-11/manual-test-result.md` 実行ログで iteration #3 まで同一結果                                                            |

**結論**: AC-1〜AC-8 すべて達成。

### 5.1 対応 Quality Gate

| QG    | 対象 Phase | 結果                                                |
| ----- | ---------- | --------------------------------------------------- |
| QG-2  | Phase 4    | 漏れ 0 件（raw evidence 6 種確定）                  |
| QG-3  | Phase 5-A  | AC-1 / AC-2 / FR-2 / FR-3 PASS                      |
| QG-4  | Phase 5-B  | AC-3 / FR-4 / FR-5 PASS（56 フィールド逆引き）      |
| QG-5  | Phase 6    | AC-4 / FR-6 PASS（6 スキル 0 差分）                 |
| QG-6  | Phase 7    | `unlisted-paths.txt` = 0 行 PASS                    |
| QG-7  | Phase 8    | AC-5 / FR-7 PASS                                    |
| QG-8  | Phase 9    | 正本整合 0 件（全て「既記述」または「未タスク化」） |
| QG-9  | Phase 10   | レビューゲート PASS（MINOR / MAJOR なし）           |
| QG-10 | Phase 11   | 再現コマンド iteration #3 で 0 差分 PASS            |
| QG-11 | Phase 12   | 本フェーズ必須 6 成果物生成中                       |
| QG-12 | Phase 13   | 後続 Phase（本タスクの判定対象外）                  |

---

## 6. AC-6 解除判定結果

本タスクの最重要成果は **TASK-CONFLICT-PREVENT-001 AC-6 の解除判定**である。

### 6.1 判定サマリ（`phase-10/ac6-release-verdict.md` より）

| 項目             | 値                        |
| ---------------- | ------------------------- |
| **最終判定**     | **AC-6 解除可能（PASS）** |
| 判定日時         | 2026-04-19                |
| 解除条件 pass 数 | **4 / 4**                 |
| 解除条件 fail 数 | 0                         |

### 6.2 解除条件 4 項目

| condition_id | 条件                                                                                      | verdict  | 直接根拠                                                                     |
| ------------ | ----------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| AC6-COND-1   | 全 consumer が consumer-audit-report.md に記載されている                                  | **pass** | `phase-5/consumer-audit-report.md` §1.1 + `phase-7/coverage-recheck.md` §5.2 |
| AC6-COND-2   | 各 consumer の参照フィールドが evals-field-map.md に記載されている                        | **pass** | `phase-5/evals-field-map.md` §3.1〜§3.9 / §4.4                               |
| AC6-COND-3   | schema-change-guide.md でフィールド変更手順が定義されている                               | **pass** | `phase-8/schema-change-guide.md` §3 / §4 / §5 / §6 / §7                      |
| AC6-COND-4   | dual-root-parity.md で `.claude/skills/` と `.agents/skills/` の差分が 0 または許容範囲内 | **pass** | `phase-6/dual-root-parity.md` §2（6 スキル全件 分類 0）                      |

### 6.3 解除により unblock される系統

- EVALS.json にフィールドを**追加**する全タスク
- EVALS.json フィールドを**リネーム**する全タスク
- EVALS.json から フィールドを**削除**する全タスク
- mirror sync ガード系タスク（EVALS.json 関連サブタスク）

後続タスクは **必ず** `phase-8/schema-change-guide.md` に従う。特に:

1. **validator=0 件** → 3 カテゴリ手動検証（静的参照 / dual root 一致 / JSON パース）必須
2. **二重スキーマ** → リネームは camelCase / snake_case 両系統を扱う
3. **dual root 同時更新** → `.claude` / `.agents` を **同一 commit** で更新

---

## 7. 視覚証跡

**UI/UX変更なしのため Phase 11 スクリーンショット不要**。

本タスクは NON_VISUAL / docs-only / verify_existing モードのため、スクリーンショット / 動画 / UI 変更は一切発生しない。一次証跡は `docs/30-workflows/evals-consumer-audit-001/outputs/phase-11/` 配下の文書群とログであり、ルート `outputs/phase-11/` 側のスクリーンショット群は別 UI タスク由来の補助参照に留まる。

| 証跡種別                  | パス                                                                                       | 役割                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| 最終レビューログ          | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-10/final-review-log.md`          | Phase 10 レビューゲート PASS 判定の詳細ログ（MINOR / MAJOR 0 件）   |
| 最終レビュー結果          | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-10/final-review-result.md`       | AC-1〜AC-8 / QG-3〜QG-10 の充足判定一覧                             |
| 手動検証 primary evidence | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-11/manual-test-result.md`        | 第三者再現（iteration #3）の RC-1〜RC-5 全 PASS ログ                |
| 再現検証補助              | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-11/reproduction-verification.md` | Phase 4 / Phase 7 / Phase 11 の 3 回実行で差分 0 を示す集合比較記録 |
| 手動検証チェックリスト    | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-11/manual-test-checklist.md`     | NON_VISUAL 向けチェックリスト完遂記録                               |
| 発見事項一覧              | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-11/discovered-issues.md`         | 未タスク候補の一次ソース（Phase 12 Task 4 の入力）                  |

再現ログ実体: `docs/30-workflows/evals-consumer-audit-001/outputs/phase-11/logs/`

---

## 8. 型定義

本タスクは docs-only / verify_existing のため、新規の TypeScript 型定義は追加しない。既存の型状況を以下に記録する。

### 8.1 EVALS.json に対応する TypeScript 型

| 型名候補                      | 所在                                                   | 状態                                                                                                         |
| ----------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `EvalsSchema` / `Evals`       | （存在しない）                                         | **未定義**。TypeScript 層に EVALS.json 構造の型は存在しない。`phase-8/schema-change-guide.md` メタ情報で明示 |
| `SkillOtherFile.type="evals"` | `apps/desktop/src/main/services/skill/SkillScanner.ts` | filename 判定のみ。中身の型を持たない                                                                        |

### 8.2 スキーマ方言タグ（evals-field-map.md §1.1 の schema_origin）

| タグ               | 意味                                                  | 該当スキル                                                                        |
| ------------------ | ----------------------------------------------------- | --------------------------------------------------------------------------------- |
| `representative`   | camelCase v2 / phaseMetrics + qualityInsights 含有    | task-specification-creator                                                        |
| `camel-minimal`    | camelCase / metrics + levelHistory + patterns のみ    | github-issue-manager / int-test-skill                                             |
| `legacy-snake-v1`  | snake_case / levels.{N} ツリー / average_satisfaction | skill-creator / aiworkflow-requirements                                           |
| `legacy-snake-min` | snake_case / metrics 3 フィールドのみ                 | skill-fixture-runner                                                              |
| `fixture`          | snake_case 最小形                                     | `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json` |

---

## APIシグネチャ

本タスクは docs-only のため新規 API は存在しない。代わりに**参照 API**（consumer 側で既存の I/O）を列挙する。

```typescript
// 本タスクでは下記の既存 API を読み取り専用で監査する
// .claude/skills/task-specification-creator/scripts/log-usage.js
//   readFileSync(EVALS_PATH, "utf8") → JSON.parse → 更新 → writeFileSync
//
// .claude/skills/skill-creator/scripts/init_skill.js
//   createEvalsTemplate(skillName) → writeFileSync（新規作成のみ）
//
// apps/desktop/src/main/services/skill/SkillScanner.ts
//   SkillOtherFile { filename: "EVALS.json", type: "evals", size }
//   ※ 内容 parse はしない
```

---

## 使用例

### 9.1 基本的な使い方: AC-6 解除後に新フィールドを追加する

```bash
# Step 1: add 手順書に従う
$EDITOR docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md
# §3 フィールド追加手順を読む

# Step 2: dual root を同一 commit で更新
$EDITOR .claude/skills/<target>/EVALS.json
$EDITOR .agents/skills/<target>/EVALS.json
git diff --stat
git add .claude/skills/<target>/EVALS.json .agents/skills/<target>/EVALS.json
git commit -m "feat(evals): add <field> to <skill> EVALS.json"

# Step 3: 3 カテゴリ検証（validator=0 件ゆえ手動必須）
# 3a. 静的参照
rg -n "<field>" .claude/skills/ .agents/skills/ apps/ \
   -g '!**/node_modules/**' -g '!**/.backups/**'
# 3b. dual root 一致
diff -u .claude/skills/<target>/EVALS.json .agents/skills/<target>/EVALS.json
# 3c. JSON パース
node --check -e "JSON.parse(require('fs').readFileSync('.claude/skills/<target>/EVALS.json','utf8'))"
```

### 9.2 監査結果の再現検証（Phase 11 再現コマンド）

```bash
# consumer 総数の再確認
rg -n 'EVALS\.json|EVALS_PATH|evalsPath|EVALS_FILE' \
   .claude/skills/ .agents/skills/ apps/ \
   -g '!**/node_modules/**' -g '!**/.backups/**' \
   -g '*.{js,ts,tsx,mjs,cjs}'

# dual root 一致の再確認
for skill in aiworkflow-requirements github-issue-manager int-test-skill \
             skill-creator skill-fixture-runner task-specification-creator; do
  cmp -s ".claude/skills/$skill/EVALS.json" ".agents/skills/$skill/EVALS.json" \
    && echo "$skill: IDENTICAL"
done
```

---

## エラーハンドリング

| ケース                                                          | 期待動作                                                                       | 呼び出し側の対応                                                                          |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| EVALS.json のキーを削除／リネームしたが consumer を更新し忘れた | 実行時に `undefined` 参照 → NaN 伝播 / Silent break                            | **自動検出不可**（validator=0 件）。`schema-change-guide.md` §7 の 3 カテゴリ手動検証必須 |
| `.claude` / `.agents` 片方のみ更新してしまった                  | `diff -u` で差分発生                                                           | `schema-change-guide.md` §6 dual root 同期ルールに従い同一 commit で再更新                |
| fixture EVALS.json の `skill_name` を変更した                   | `skill-creator.fixture.test.ts` TC-004 が失敗                                  | fixture とテストを同時修正。`schema-change-guide.md` §5 リネーム手順 Step 4 に明記済      |
| camelCase / snake_case 系を取り違えて writer を追加した         | キー名が揃わず NaN 伝播（例: skill-creator の init と log_usage のミスマッチ） | `evals-field-map.md` §5.2 を参照し、両系統の field_path を確認してから書き込む            |

---

## エッジケース

| ケース                                         | なぜ起こるか                                                                                    | 現在の扱い                                                              |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 動的パス構築（`path.join(dir, "EVALS.json")`） | consumer が EVALS.json 名を文字列連結で組み立てるケースが 13 件                                 | Phase 4 / 7 / 11 で `dynamic` kind として独立検索。漏れ 0 件を保証      |
| root-cross リンク                              | `.agents/skills/skill-creator/references/resource-map.md:229` が `.claude/` 配下を参照          | 未タスク候補 #3 として `phase-5/consumer-audit-report.md` §8 に記録済   |
| 空 EVALS.json / `{}` でもエラーにならない      | `SkillScanner.ts` は存在と size/type のみ検証                                                   | 未タスク候補 #4 として記録済（schema-change-guide.md の検証手順で緩和） |
| init（camelCase）→ log_usage（snake_case）     | skill-creator が init_skill.js で camelCase 生成後、log_usage.js が snake_case を期待する不整合 | 未タスク候補 #1 / #2 として記録済（スキーマ方言統一提案）               |

---

## 設定項目と定数一覧

本タスクは docs-only のため、新規の設定項目・定数は追加しない。既存の定数状況は以下。

| 名前                         | 既定値                                      | 役割                                                               | 変更時の注意                                                           |
| ---------------------------- | ------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `OTHER_FILES`                | `{ filename: "EVALS.json", type: "evals" }` | `SkillScanner.ts` のファイル分類タグ                               | `type: "evals"` を参照する下流 UI 経路があれば連動更新必要             |
| `EVALS_PATH` / `SKILL_DIR`   | `resolve(__dirname, "../EVALS.json")` など  | 各 log-usage / log_usage / init_skill スクリプトのファイルパス定数 | スキル移動時は全 dual root ペアを同時更新                              |
| `createEvalsTemplate()` 返値 | camelCase v2 初期オブジェクト               | skill-creator の init_skill.js が新規生成する初期 EVALS            | camelCase 系のみ生成。log_usage.js（snake_case）と不整合。発見 #2 参照 |

---

## テスト構成

本タスクは docs-only のためユニットテストの追加は無い。代わりに、監査対象のテスト構成を以下に記録する。

| テストファイル                                                        | テスト数（本タスク観点）                             | カバー範囲                                                         |
| --------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------ |
| `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts` | 3（with-evals / with-all-others / with-sized-evals） | EVALS.json の存在 + type=evals タグのみを検証（中身は期待しない）  |
| `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts`   | 2（TC-004 skill_name assert / TC-037 存在検証）      | snake_case の `skill_name` を unit test 契約として固定             |
| `outputs/phase-11/manual-test-result.md` RC-1〜RC-5                   | 5（再現ケース）                                      | 第三者 iteration #3 での再現検証（全 PASS）                        |
| **合計**                                                              | **10 箇所の既存テスト確認**                          | 新規テストなし。発見事項は schema-change-guide.md §5 Step 4 に反映 |

---

## 10. 未解決タスク

本タスク実行中に発見した未対応項目は、`unassigned-task-detection.md` に集約し、`docs/30-workflows/unassigned-task/` 配下へ実ファイル化した。

### 10.1 発見源

| 一次ソース                                                         |      件数 |
| ------------------------------------------------------------------ | --------: |
| `outputs/phase-5/consumer-audit-report.md` §8 発見済み未タスク候補 |         6 |
| `outputs/phase-9/spec-alignment-report.md` 正本整合の不整合        |      3 件 |
| `outputs/phase-11/discovered-issues.md` Phase 11 で見つけた補助    | 新規 0 件 |

### 10.2 確定した未タスク

| #   | 発見内容                                                                  | 候補タスク ID (案)                                                                         |
| --- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 1   | EVALS スキーマの二重標準（snake_case vs camelCase）統一検討               | `docs/30-workflows/unassigned-task/task-evals-schema-dialect-unification-001.md`           |
| 2   | `validate-schemas.js` / `validate-skill-structure.js` への validator 追加 | `docs/30-workflows/unassigned-task/task-skill-fixture-runner-evals-schema-validate-001.md` |
| 3   | snake_case v1 系スキーマの正本化                                          | `docs/30-workflows/unassigned-task/task-evals-spec-snake-case-v1-document-001.md`          |
| 4   | `qualityInsights.*` の正本化                                              | `docs/30-workflows/unassigned-task/task-evals-spec-quality-insights-document-001.md`       |
| 5   | validator=0 件事実の正本追記                                              | `docs/30-workflows/unassigned-task/task-evals-spec-validator-zero-document-001.md`         |
| 6   | `SkillScanner.ts` が EVALS.json の内容バリデーションを行わない            | `docs/30-workflows/unassigned-task/task-skill-scanner-evals-content-validate-001.md`       |
| 7   | `.agents/.../resource-map.md:229` の cross-root link 解消                 | `docs/30-workflows/unassigned-task/task-mirror-resource-map-cross-root-link-001.md`        |

### 10.3 配置先

全件とも `docs/30-workflows/unassigned-task/` 配下に配置済み。`completed-tasks/` への移動は各タスク完了時に別途判断する。

---

## 11. 参照成果物（canonical との対応）

本ガイドは **Phase 12 では canonical 4 成果物を複製しない**。必ず下表のパスを参照すること。

| canonical # | ファイル名                 | 参照パス（Phase 5 / 6 / 8 の正本）                                                    |
| ----------- | -------------------------- | ------------------------------------------------------------------------------------- |
| 1           | `consumer-audit-report.md` | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md` |
| 2           | `evals-field-map.md`       | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md`       |
| 3           | `dual-root-parity.md`      | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/dual-root-parity.md`      |
| 4           | `schema-change-guide.md`   | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md`   |

| close-out 関連            | パス                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------ |
| AC-6 判定                 | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-10/ac6-release-verdict.md` |
| 最終レビューログ          | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-10/final-review-log.md`    |
| 手動検証 primary evidence | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-11/manual-test-result.md`  |
| 発見事項一次ソース        | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-11/discovered-issues.md`   |

---

## 12. 既知の制約

1. **validator 0 件** — EVALS.json の構造を機械検証する consumer は存在しない。schema 変更の自動ガードは `schema-change-guide.md` §7 の 3 カテゴリ手動検証のみ。対応タスクは `task-skill-fixture-runner-evals-schema-validate-001.md`。
2. **dual root 正本を断定しない** — `.claude/skills/` と `.agents/skills/` のどちらが正本かは本タスクでは決めない。両 root を同一 commit で同時更新する運用で合意（Phase 2 §3.1）。
3. **camelCase / snake_case 二重スキーマ併存** — 3 組 6 フィールドが 2 系統で並立。`schema-change-guide.md` §5 リネーム手順は両系統を扱う。
4. **Issue #2279 CLOSED** — Issue は既に CLOSED であり、本タスクは fix-forward 方針で仕様書のみ作成する。
5. **正本不変性** — 本タスクは `aiworkflow-requirements/references/` / `.claude/skills/*/EVALS.json` / `.agents/skills/*/EVALS.json` / 実装コードを**一切変更しない**。書き込みは `docs/30-workflows/evals-consumer-audit-001/` 配下のみ。

---

## 13. 次のステップ

AC-6 解除後、以下の順で後続タスクを実施することを推奨する。

| 順  | タスク                                                   | 依存                    | 状態   |
| --- | -------------------------------------------------------- | ----------------------- | ------ |
| 1   | `task-evals-schema-dialect-unification-001.md`           | 正本スキーマ補強        | 未着手 |
| 2   | `task-skill-fixture-runner-evals-schema-validate-001.md` | 方言統一 / スキーマ確定 | 未着手 |
| 3   | `task-skill-scanner-evals-content-validate-001.md`       | validator guard         | 未着手 |
| 4   | 正本補強 3 件と cross-root link 修正                     | 独立または並列          | 未着手 |

---

## 14. 用語集

| 用語                   | 読み方                          | 説明                                                                                                                                                           |
| ---------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EVALS.json             | イーバルス ジェイソン           | スキル単位の「成績表」。使用回数・成功率・レベル・評価履歴などを保存する JSON ファイル。スキル × 2 root で 12 ファイル、fixture 1 ファイルの計 13 ファイル存在 |
| consumer               | コンシューマー                  | EVALS.json を読む・書く・参照するコード / テスト / ドキュメントのこと。本タスクでは 32 件を A/B/C/D で分類                                                     |
| dual root              | デュアル ルート                 | `.claude/skills/` と `.agents/skills/` の 2 か所に同じスキルセットが置かれている構造                                                                           |
| canonical              | キャノニカル                    | 「正本」の意。本タスクでは Phase 5 / 6 / 8 の 4 成果物を canonical と定義                                                                                      |
| schema                 | スキーマ                        | データの「形」の定義。どの欄があって、どういう型か、という取り決め                                                                                             |
| validator              | バリデーター                    | データの形が正しいか自動でチェックするコード。本タスクでは **0 件**（未実装）                                                                                  |
| AC-6                   | エーシー ロク                   | TASK-CONFLICT-PREVENT-001 の受入基準 6「consumer 監査完了まで EVALS schema 変更禁止」。本タスクで解除可能と判定                                                |
| dynamic path           | ダイナミック パス               | `path.join(dir, "EVALS.json")` のようにコードで組み立てるファイルパス。単純な文字列検索で見逃しやすい                                                          |
| camelCase / snake_case | キャメルケース / スネークケース | 英単語の連結記法。camelCase: `totalUsageCount`、snake_case: `total_usage_count`                                                                                |
| bit-for-bit 一致       | ビット フォー ビット            | 2 つのファイルが 1 バイトの差もなく完全に同一であること。`cmp -s` で判定                                                                                       |
| fix-forward            | フィックス フォワード           | すでに CLOSED の Issue に対して、差分で新たに PR を出して前進する方針                                                                                          |

---

## 15. 完了条件チェックリスト（本 Task 1）

- [x] `## Part 1` / `### なぜ必要か` / `### 何をするか` / `### 日常の例え` / `### 今回作ったもの` が揃っている
- [x] `## Part 2` / `### 型定義` / `### APIシグネチャ` / `### 使用例` / `### エラーハンドリング` / `### エッジケース` / `### 設定項目と定数一覧` / `### テスト構成` が揃っている
- [x] Part 1 の日常例えに `たとえば:` が 1 回以上含まれている
- [x] `## 視覚証跡` に `UI/UX変更なしのため Phase 11 スクリーンショット不要` が固定記載されている
- [x] 代替証跡として `outputs/phase-10/final-review-result.md` と `outputs/phase-11/manual-test-result.md` が参照されている
- [x] canonical 4 成果物の参照先が Phase 5 / 6 / 8 の実ファイルに統一されている（Phase 12 では複製しない）
- [x] Wave 1〜7 の全 Phase 実行サマリが記載されている
- [x] 重要な発見（validator=0 件 / camelCase vs snake_case / dual root bit 一致）が記載されている
- [x] AC-1〜AC-8 達成状況が表で明示されている
- [x] AC-6 解除判定結果が明示されている
- [x] 未解決タスクの Phase 12 Task 4 への参照が明示されている
- [x] PR description の素材として要約性・網羅性を備えている

---

## 付録 A: PR Description 用エクゼクティブサマリ（Phase 13 用）

> 本付録は Phase 13 `pr-description.md` にそのまま転載可能な形で用意した短縮サマリ。

- **タスク**: TASK-EVALS-CONSUMER-AUDIT-001（Issue #2279 CLOSED / fix-forward）
- **種類**: NON_VISUAL / docs-only / verify_existing（コード実装なし）
- **成果**: 32 consumer を 4 分類で完全列挙、56 フィールド逆引きマップを作成、dual root 6 スキル全件 bit-for-bit 一致を確認、add/remove/rename 3 操作の手順書を体系化
- **判定**: **TASK-CONFLICT-PREVENT-001 AC-6 解除可能（PASS 4/4）**
- **主要発見**: validator=0 件 / camelCase vs snake_case 二重スキーマ併存 / dynamic path consumer 13 件 / fixture が snake_case を test 契約として固定
- **canonical 成果物**:
  1. `phase-5/consumer-audit-report.md`
  2. `phase-5/evals-field-map.md`
  3. `phase-6/dual-root-parity.md`
  4. `phase-8/schema-change-guide.md`
- **未タスク候補**: 7 件（実ファイル化済み）
- **後続タスクへの申し送り**: 必ず `schema-change-guide.md` §7 の 3 カテゴリ手動検証を行う（validator=0 件のため）。dual root は同一 commit で同時更新する
