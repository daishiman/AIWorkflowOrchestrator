# Phase 2: スコープ・前提・依存・制約・アーキテクチャ判断

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | TASK-EVALS-CONSUMER-AUDIT-001                     |
| Phase      | 2                                                 |
| 機能名     | evals-consumer-audit                              |
| 作成日     | 2026-04-19                                        |
| 前提Phase  | Phase 1                                           |
| 後続Phase  | Phase 3                                           |
| ステータス | pending                                           |
| taskType   | NON_VISUAL / 調査・文書化タスク（コード実装なし） |

## 目的

Phase 1 で確定した要件（FR-1〜FR-10 / NFR-1〜NFR-8 / AC-1〜AC-8）を受け、本タスクのスコープ境界・依存関係・成果物アーキテクチャ・品質ゲート・実行ツールを固定する。Phase 3 で Phase 4〜13 を並列/直列設計するための前提を整える。

---

## 1. スコープ詳細

### 1.1 含むもの（In Scope）

| 分類                         | 対象                                                                                               | 備考                                                                                                    |
| ---------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| EVALS.json ファイル列挙      | `.claude/skills/*/EVALS.json` および `.agents/skills/*/EVALS.json` の全件                          | フィクスチャ（`apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json`）も含む |
| Node.js スクリプト consumer  | `.claude/skills/*/scripts/*.js`, `.agents/skills/*/scripts/*.js`                                   | `log-usage.js`, `log_usage.js`, `collect_feedback.js`, `init_skill.js` など                             |
| TypeScript / TSX consumer    | `apps/desktop/src/**/*.ts`, `apps/desktop/src/**/*.tsx` で EVALS.json を参照するもの               | `SkillScanner.ts` 等                                                                                    |
| Vitest テスト consumer       | `apps/desktop/src/__tests__/**/*.ts` で EVALS.json を読む・期待するフィクスチャ                    | `skill-creator.fixture.test.ts` 等                                                                      |
| 検証スクリプト consumer      | `.claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js` と `validate-schemas.js` | ファイル存在チェック／内容 validate を区別                                                              |
| エージェント定義の参照       | `.claude/skills/*/agents/*.md` 内で EVALS.json を指示・参照している箇所                            | ドキュメント参照として分類                                                                              |
| dual root 差分評価           | スキル単位で `.claude` と `.agents` の EVALS.json 内容差分                                         | 差分=0 / 許容差分 / 要対応差分 に三分類                                                                 |
| EVALS スキーマの全フィールド | 代表スキーマ（task-specification-creator）を基準に全フィールドを列挙し、各スキルの追加差分も記録   | `skillName`〜`levelCriteria.*` を網羅                                                                   |
| 監査コマンドの再現手順       | `rg`, `grep`, `diff`, `find`, `node` コマンドの再現可能な列挙                                      | NFR-2 / AC-8 に対応                                                                                     |

### 1.2 含まないもの（Out of Scope）

| 非スコープ                                                       | 理由                                                                     |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------ |
| EVALS.json スキーマ変更 / 新フィールド追加                       | 本タスクは監査のみ。変更は schema-change-guide.md に従う後続タスクで実施 |
| `.backups/` 配下 のアーカイブ EVALS.json                         | 現行 consumer ではない                                                   |
| `node_modules/` 配下                                             | 外部依存                                                                 |
| EVALS.json 以外（`LOGS.md`, `feedback.json` 等）の consumer 監査 | 別タスク（未タスク候補として記録）                                       |
| dual root の統合作業                                             | mirror sync 系タスクで扱う                                               |
| CI フック（validate-schemas.js 強化）の実装                      | 実装を伴うため別タスク                                                   |
| EVALS.json 実データ補正（値の書き換え）                          | 監査は読み取りのみ                                                       |
| Node.js / pnpm バージョンアップ                                  | 無関係                                                                   |

### 1.3 分類軸（consumer categorization axis）

監査結果を整理するため、consumer を以下の 4 軸 × 2 root で分類する。Phase 5 で表形式化する際の列定義。

| 軸  | カテゴリ                      | 例                                   |
| --- | ----------------------------- | ------------------------------------ |
| A   | コード（production TS）       | `SkillScanner.ts`                    |
| B   | スクリプト（skill 内 \*.js）  | `log-usage.js`, `init_skill.js`      |
| C   | テスト（\*.test.ts, fixture） | `skill-creator.fixture.test.ts`      |
| D   | ドキュメント参照のみ（\*.md） | `self-improvement-cycle.md` 内の言及 |

root 軸:

- `.claude/skills/` 配下
- `.agents/skills/` 配下
- `apps/desktop/src/` 配下（root 非依存）

---

## 2. 依存関係

### 2.1 上流依存（Blocker 解消）

| 依存タスク                                                        | 関係                                  | 状態 | 本タスクへの影響                                                     |
| ----------------------------------------------------------------- | ------------------------------------- | ---- | -------------------------------------------------------------------- |
| TASK-CONFLICT-PREVENT-001                                         | AC-6（EVALS schema 変更禁止）の定義元 | 完了 | AC-6 の文言と解除条件を継承する必要がある                            |
| TASK-CONFLICT-PREVENT-001 Phase 12 `unassigned-task-detection.md` | 本タスクの発見元                      | 完了 | 発見時の問題意識（dual root ドリフト / consumer 一覧不在）を引き継ぐ |

### 2.2 下流依存（本タスクがブロックする対象）

| ブロックされているタスク類                                     | 関係                                     | 解除条件                                                                                 |
| -------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| EVALS.json にフィールドを追加する全タスク                      | AC-6 により変更禁止                      | 本タスクの 4 成果物が揃い、consumer-audit-report.md で AC-6 解除判定が「可」となった時点 |
| EVALS.json フィールドをリネームする全タスク                    | AC-6 により変更禁止                      | 同上                                                                                     |
| EVALS.json からフィールドを削除する全タスク                    | AC-6 により変更禁止                      | 同上                                                                                     |
| `mirror sync ガード` 系タスク（UT-UIUX-MIRROR-SYNC-CI-001 等） | dual root 同期対象に EVALS.json を含むか | dual-root-parity.md の差分判定結果を参照して対象範囲を決定                               |

### 2.3 並行してはならない作業

- **本タスク実行中は EVALS.json の内容変更禁止**（監査対象が動くため）。
- **本タスク実行中は consumer コード（_.js / _.ts）の変更禁止**（field map がブレるため）。
- ただし、別ブランチで同作業が並行していないかは Phase 4 の Step 0（P50 チェック）で確認する。

---

## 3. アーキテクチャ判断

### 3.1 dual root（.claude / .agents）の扱い

| 判断事項                                                                                          | 本タスクの扱い                                                                                 |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `.claude/skills/` と `.agents/skills/` のどちらが正本か                                           | **本タスクでは断定しない**。差分の可視化までに留め、正本判定は後続タスクへ委譲（未タスク記録） |
| 両 root の EVALS.json 内容差分                                                                    | `diff` でスキル単位に比較し、`dual-root-parity.md` に記載                                      |
| 両 root に存在するスクリプト（`log-usage.js` 等）                                                 | それぞれ独立 consumer として列挙。同名でも `path` が異なれば別エントリ                         |
| 片 root にのみ存在する EVALS.json                                                                 | 「片方欠損」として dual-root-parity.md で明示し、未タスク候補として記録                        |
| フィクスチャ（`apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json`） | dual root には属さない「第 3 の root（test fixture root）」として別枠で扱う                    |

### 3.2 consumer 分類の確定

Phase 1 FR-3 / FR-10 で定義した「操作種別」「分類軸」を以下の表で固定する。Phase 4 以降のテンプレとして使用する。

| 列名                 | 型                                                             | 説明                                                         |
| -------------------- | -------------------------------------------------------------- | ------------------------------------------------------------ |
| `path`               | string                                                         | consumer ファイルの絶対／リポジトリ相対パス                  |
| `root`               | `.claude` / `.agents` / `apps/desktop` / `fixture`             | どの root に属するか                                         |
| `category`           | A(code) / B(script) / C(test) / D(doc)                         | 4 軸分類                                                     |
| `operation`          | `read` / `write` / `read+write` / `validate` / `document-only` | 操作種別                                                     |
| `referenced_fields`  | string[]                                                       | 読み取りで参照するフィールド（ドット記法）                   |
| `updated_fields`     | string[]                                                       | 書き込みで更新するフィールド                                 |
| `target_evals_paths` | string[]                                                       | この consumer が対象とする EVALS.json のパス（複数ありうる） |
| `dynamic_path`       | boolean                                                        | パスを文字列連結で生成するか（grep では見えにくい）          |
| `notes`              | string                                                         | 特記事項（漏れ検出のコツ、テスト上の仮データ等）             |

### 3.3 EVALS フィールド逆引きマップの構造

`evals-field-map.md` で生成する逆引きテーブルの列定義。

| 列名             | 説明                                                                         |
| ---------------- | ---------------------------------------------------------------------------- |
| `field_path`     | ドット記法のフィールドパス（例: `metrics.successCount`）                     |
| `type`           | string / number / array / object / freeform                                  |
| `schema_origin`  | 代表スキーマ由来か、特定スキル固有拡張か                                     |
| `readers`        | このフィールドを read する consumer のパス列                                 |
| `writers`        | このフィールドを write する consumer のパス列                                |
| `validators`     | このフィールドを validate する consumer のパス列（`validate-schemas.js` 等） |
| `risk_on_change` | フィールド変更時の影響度（low/medium/high）                                  |
| `notes`          | 自由記述フィールドかどうかの注記等                                           |

### 3.4 成果物間のトレーサビリティ

| 成果物                     | 依存する前段成果物                                 | 依存される後段成果物                      |
| -------------------------- | -------------------------------------------------- | ----------------------------------------- |
| `consumer-audit-report.md` | Phase 4 の grep 生結果 / Phase 5 の field 参照整理 | `schema-change-guide.md` が参照           |
| `evals-field-map.md`       | `consumer-audit-report.md` の consumer 列          | `schema-change-guide.md` が参照           |
| `dual-root-parity.md`      | Phase 6 の `diff` 生結果                           | `schema-change-guide.md` の同期手順で参照 |
| `schema-change-guide.md`   | 上記 3 点                                          | AC-6 解除判定の根拠                       |

---

## 4. 成果物の配置構造と命名規則

### 4.1 配置構造

```
docs/30-workflows/evals-consumer-audit-001/
├── design-docs/
│   ├── phase-1-requirements.md             # Phase 1（本タスクで作成済）
│   ├── phase-2-scope-architecture.md       # Phase 2（本ファイル）
│   └── phase-3-phase-design.md             # Phase 3
└── outputs/
    ├── phase-1/                            # 参照情報の固定（再現コマンド等）
    ├── phase-2/                            # スコープ・依存整理の実資料
    ├── phase-3/                            # Phase 設計レビュー結果
    ├── phase-4/                            # 静的検索 raw 結果
    │   ├── raw-grep-claude.txt
    │   ├── raw-grep-agents.txt
    │   └── raw-grep-apps.txt
    ├── phase-5/                            # consumer-audit-report / field-map
    │   ├── consumer-audit-report.md        # ★最終成果物 1
    │   └── evals-field-map.md              # ★最終成果物 2
    ├── phase-6/                            # dual-root-parity
    │   └── dual-root-parity.md             # ★最終成果物 3
    ├── phase-7/                            # カバレッジ相当（consumer 漏れ再検索）
    ├── phase-8/                            # schema-change-guide
    │   └── schema-change-guide.md          # ★最終成果物 4
    ├── phase-9/                            # 品質検証（references との突合）
    ├── phase-10/                           # 最終レビュー・AC-6 解除判定
    ├── phase-11/                           # 手動検証（再現コマンド実行）
    ├── phase-12/                           # ドキュメント更新・未タスク同期
    └── phase-13/                           # PR 作成
```

### 4.2 命名規則

- Markdown ファイル名: ケバブケース、`.md` 拡張子、英語小文字
- raw データ: `raw-<tool>-<root>.txt`
- 中間ファイル: `draft-<content>.md`
- 最終成果物は Phase 5 / 6 / 8 に集約し、Phase 10 で AC-6 解除判定レポート（`ac6-release-verdict.md`）を追加

---

## 5. 品質ゲート方針

本タスクは NON_VISUAL / コード実装なしのため、ユニットテスト／結合テストの数値カバレッジは適用しない。以下の「監査品質ゲート」を定義する。

| ゲート ID | 判定 Phase | 判定項目                                                   | 合格基準                                                                 |
| --------- | ---------- | ---------------------------------------------------------- | ------------------------------------------------------------------------ |
| QG-1      | Phase 3    | Phase 4〜13 設計が監査 3 レイヤ（静的/field/検証）をカバー | Phase 3 レビューで PASS                                                  |
| QG-2      | Phase 4    | 静的検索の raw 結果がすべて Phase 5 整理対象に含まれる     | 漏れ 0 件                                                                |
| QG-3      | Phase 5    | consumer 列挙が AC-1 / AC-2 / FR-2 / FR-3 を満たす         | 分類軸 4 × 操作種別が表に記載                                            |
| QG-4      | Phase 5    | evals-field-map.md が FR-4 / FR-5 を満たす                 | 全フィールド + 逆引き（reader/writer/validator）が表に記載               |
| QG-5      | Phase 6    | dual-root-parity.md が全スキルを網羅                       | `.claude/skills/` の全ディレクトリが表に存在                             |
| QG-6      | Phase 7    | 漏れ再検索コマンドの出力がすべて成果物記載範囲内           | 未記載ヒット 0 件                                                        |
| QG-7      | Phase 8    | schema-change-guide.md が add/remove/rename 3 操作を網羅   | 各操作について「影響範囲」「手順」「dual root 同期」「検証」4 項目が記載 |
| QG-8      | Phase 9    | `aiworkflow-requirements` references/ との記述整合         | 不整合時は未タスク記録                                                   |
| QG-9      | Phase 10   | AC-6 解除判定が「可」か「不可（追加対応必要）」が明示      | 判定文と根拠が明示                                                       |
| QG-10     | Phase 11   | 再現コマンド列挙の再実行で同じ consumer リストが得られる   | 差分 0                                                                   |
| QG-11     | Phase 12   | 発見した未タスクが `unassigned-task/` に記録先と共に列挙   | 件数分記録                                                               |
| QG-12     | Phase 13   | PR 説明に 4 成果物パスと AC-6 解除判定結果が記載           | 記載あり                                                                 |

**レビューゲート**: Phase 3（設計完了）／Phase 10（最終レビュー）／Phase 13（PR）でゲート通過を必須化。

---

## 6. リスクとリスク対策

Phase 1 で定義した RISK-1〜RISK-7 に対する Phase 別の対策マッピング。

| リスク ID | 主要対策                                                               | 実施 Phase        | 補助ゲート |
| --------- | ---------------------------------------------------------------------- | ----------------- | ---------- |
| RISK-1    | 動的パスパターンを補完検索（`join.*EVALS`, `EVALS_FILE`, `evalsPath`） | Phase 4（検索）   | QG-2       |
| RISK-2    | `find . -name EVALS.json` で root 間対称性チェック                     | Phase 6（対称性） | QG-5       |
| RISK-3    | consumer 分類を A/B/C/D 4 軸に固定                                     | Phase 5           | QG-3       |
| RISK-4    | schema-change-guide.md に「consumer 追加時の更新ルール」を明記         | Phase 8           | QG-7       |
| RISK-5    | Phase 3 で監査 3 レイヤが Phase に反映されているかチェック             | Phase 3           | QG-1       |
| RISK-6    | references/ 内の EVALS 記述を Phase 9 で突き合わせ                     | Phase 9           | QG-8       |
| RISK-7    | フィールド型分類（固定キー／自由記述）を field-map の `type` 列に記載  | Phase 5           | QG-4       |

### 6.1 本 Phase 固有リスク

| ID     | リスク                                                         | 対策                                                  |
| ------ | -------------------------------------------------------------- | ----------------------------------------------------- |
| P2-R-1 | 分類軸の粒度が荒く、同一 consumer を複数カテゴリに重複計上する | A/B/C/D は排他的とし、ドキュメント参照のみは D に固定 |
| P2-R-2 | dual root 正本判定を断定して後続タスクと衝突                   | 「断定しない」方針をスコープ外として明示              |
| P2-R-3 | 成果物配置を Phase 番号で切り過ぎて参照性が落ちる              | 最終成果物 4 点は固定 Phase（5 / 6 / 8）に集約する    |

---

## 7. 実行環境・ツール

### 7.1 必須ツール

| ツール         | バージョン目安   | 用途                                              |
| -------------- | ---------------- | ------------------------------------------------- |
| Node.js        | プロジェクト準拠 | EVALS.json のパース確認（必要時のみ）             |
| pnpm           | プロジェクト準拠 | なし（参考コマンドの統一）                        |
| ripgrep (`rg`) | 13.x+            | 静的検索の主力ツール                              |
| grep           | POSIX            | `rg` が使えない環境のフォールバック               |
| diff           | POSIX            | dual root 内容比較                                |
| find           | POSIX            | EVALS.json の全列挙                               |
| git            | 2.x+             | ブランチ・履歴確認（Phase 4 Step 0 P50 チェック） |

### 7.2 代表的な再現コマンド

| 目的                             | コマンド                                                                                                                                                        |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EVALS.json ファイルの全列挙      | `find .claude .agents apps -name EVALS.json -not -path '*/node_modules/*' -not -path '*/.backups/*'`                                                            |
| コード／スクリプトからの参照検索 | `rg -n 'EVALS\.json\|EVALS_PATH\|evalsPath\|EVALS_FILE' .claude/skills/ .agents/skills/ apps/ -g '!**/node_modules/**' -g '!**/.backups/**' -g '*.{js,ts,tsx}'` |
| 動的パス生成の追加検索           | `rg -n "join\([^)]*EVALS\|\`[^\`]_EVALS\.json\`" .claude/skills/ .agents/skills/ apps/ -g '_.{js,ts,tsx}'`                                                      |
| エージェント Markdown 内参照     | `rg -n 'EVALS\.json\|EVALS' .claude/skills/*/agents/ .agents/skills/*/agents/ -g '*.md'`                                                                        |
| テスト consumer 検索             | `rg -n 'EVALS' apps/desktop/src/__tests__/ -g '*.{ts,tsx}'`                                                                                                     |
| dual root 差分（スキル単位）     | `for s in $(ls .claude/skills); do diff .claude/skills/$s/EVALS.json .agents/skills/$s/EVALS.json 2>/dev/null \|\| echo "== $s: missing one side =="; done`     |
| 漏れチェック（Phase 7）          | 上記検索結果をテキスト化し、`consumer-audit-report.md` に記載のパス集合との `comm -23` 差分で確認                                                               |

### 7.3 使わないツール

- **`jq` / `ajv`**: 実装（スキーマ検証コード）を書かない方針のため不要。
- **Playwright / Vitest 実行**: コード変更なしのため不要。
- **ESLint / Prettier 実行**: Markdown のみのため実行不要（編集時の auto-format hook は自動）。

---

## 統合テスト連携【必須】

| 判定項目                                                          | 基準     | 結果    |
| ----------------------------------------------------------------- | -------- | ------- |
| Phase 1 の AC-1〜AC-8 が Phase 2 のスコープで全てカバーされている | 100%     | pending |
| dual root 断定禁止方針が明示されている                            | 明示あり | pending |
| 監査 3 レイヤ（静的/field/検証）が実行ツールレベルで実現可能      | 確認済   | pending |
| 品質ゲート QG-1〜QG-12 が Phase 番号にマッピングされている        | 全 12 件 | pending |

---

## 成果物

| 成果物                       | パス                                                                                   | 説明       |
| ---------------------------- | -------------------------------------------------------------------------------------- | ---------- |
| スコープ／アーキテクチャ設計 | `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-2-scope-architecture.md` | 本ファイル |

## 完了条件

- [ ] 含む／含まないスコープが表形式で明示されている
- [ ] 上流／下流依存、並行禁止作業が列挙されている
- [ ] dual root の扱い方針（断定しない）がアーキテクチャ判断として明示されている
- [ ] consumer 分類の列定義（9 列）が確定している
- [ ] EVALS フィールド逆引きマップの列定義（8 列）が確定している
- [ ] 成果物の配置構造と命名規則が Phase 番号と 1:1 で対応している
- [ ] 品質ゲート QG-1〜QG-12 が Phase 番号にマッピングされている
- [ ] 実行ツール一覧と再現コマンド例が列挙されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク100%実行確認【必須】

- [x] スコープ詳細（含む／含まない／分類軸）を固定
- [x] 依存関係（上流／下流／並行禁止）を列挙
- [x] dual root と consumer 分類のアーキテクチャ判断を確定
- [x] 成果物の配置構造／命名規則を定義
- [x] 品質ゲート QG-1〜QG-12 を Phase 番号にマッピング
- [x] Phase 別リスク対策マッピングを作成
- [x] 実行環境・ツール・再現コマンドを列挙

## 次Phase

Phase 3: Phase 4〜13 の責務・入出力・ゲート条件・並列/直列判定
