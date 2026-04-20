# Phase 1: 要件定義

## メタ情報

| 項目                | 内容                                                         |
| ------------------- | ------------------------------------------------------------ |
| タスクID            | TASK-EVALS-CONSUMER-AUDIT-001                                |
| タスク名            | EVALS consumer 完全監査（スキーマ変更前の全 consumer 特定）  |
| Phase               | 1                                                            |
| 機能名              | evals-consumer-audit                                         |
| 作成日              | 2026-04-19                                                   |
| 前提Phase           | - （TASK-CONFLICT-PREVENT-001 完了済みが前提）               |
| 後続Phase           | Phase 2                                                      |
| ステータス          | pending                                                      |
| issue_number        | 2279                                                         |
| issue_status        | CLOSED                                                       |
| issue_closed_reason | 運用上クローズ済みだが、ユーザー指示により仕様書は作成する   |
| depends_on          | TASK-CONFLICT-PREVENT-001（完了）                            |
| blocks              | EVALS.json スキーマ変更を含む全タスク（AC-6 規則の解除条件） |
| chain_position      | 単独タスク（chain でない）                                   |
| taskType            | NON_VISUAL / 調査・文書化タスク（コード実装なし）            |

**Issue #2279 が CLOSED のまま設計書を作成する理由**:

- 運用フロー上 Issue は閉じられているが、`EVALS.json` スキーマ変更の AC-6（TASK-CONFLICT-PREVENT-001 で設定された変更禁止制約）を解除するためには、本タスクの成果物（consumer 一覧・field map・schema-change-guide・dual-root-parity）が正式な根拠文書として必要である。
- ユーザーから「仕様書として残せ」という明示的な指示があり、後続のスキーマ変更タスクが参照する設計書として定着させる意図がある。
- Issue 状態（CLOSED）はそのままとし、本設計書自体を AC-6 解除判定の基準とする。

---

## 目的

`.claude/skills/*/EVALS.json` および `.agents/skills/*/EVALS.json` を**読む・書く・検証する**全 consumer を網羅的に洗い出し、スキーマ変更時の影響範囲を事前に可視化できる状態にする。コード実装は一切行わず、Markdown 成果物のみで監査結果を残す。

---

## 1. 背景・動機

### 1.1 背景

- `.claude/skills/` 配下の各スキルには `EVALS.json` が配置され、スキル利用回数・成功率・レベル履歴・品質インサイト等のメトリクスを保持している。
- `EVALS.json` を参照するコード（以下「consumer」と呼ぶ）は以下のレイヤに分散している。
  - Node.js スクリプト（`log-usage.js`, `log_usage.js`, `collect_feedback.js`, `init_skill.js`）
  - TypeScript コード（`SkillScanner.ts` 等）
  - Vitest テストフィクスチャ（`skill-creator.fixture.test.ts`）
  - エージェント定義 Markdown（`.claude/skills/*/agents/*.md`）
- dual root 構造（`.claude/skills/` と `.agents/skills/`）によって同一 consumer が両方に存在し、どちらが正本かが明確でない。

### 1.2 動機

- **TASK-CONFLICT-PREVENT-001 の AC-6 解除**: 「consumer 監査完了まで EVALS schema 変更禁止」という制約が、現状 consumer 一覧の不在により解除できない。この制約は EVALS.json の拡張（新フィールド追加・リネーム）を含む全タスクをブロックしている。
- **無声破損リスクの排除**: フィールド削除／リネーム時に JSON パースは成功するが参照先が `undefined` となり、メトリクス計算が壊れる。TypeScript 型検査が効かない純 JS / Markdown では検出困難。
- **dual root 同期ガードの前提整備**: `.claude` と `.agents` のどちらが正本かが不明のまま mirror sync（UT-UIUX-MIRROR-SYNC-CI-001）を設計すると、片方向の同期が抜け落ちる。

### 1.3 放置時の影響

| 影響内容                                                                            | 深刻度 |
| ----------------------------------------------------------------------------------- | ------ |
| フィールド削除時にスクリプトが undefined を参照しサイレントに誤メトリクスを書き込む | 高     |
| `validate-schemas.js` の期待構造と実体が乖離し、自動検証がすり抜ける                | 高     |
| dual root の片方だけ更新され、もう片方の consumer が古いスキーマで動き続ける        | 中     |
| `self-improvement-cycle.md` のレベル判定がメトリクス欠損で壊れる                    | 中     |
| 新規 EVALS 拡張タスク（level4, metrics 拡張等）が AC-6 により無期限にブロックされる | 中     |

---

## 2. ステークホルダー

| ステークホルダー                          | 関心事                                                        | 期待される成果                                        |
| ----------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------- |
| `task-specification-creator` skill 保守者 | EVALS.json を直接書き込むスクリプト群の変更影響               | consumer-audit-report.md で自分の consumer を確認     |
| `skill-creator` skill 保守者              | `init_skill.js`・`log_usage.js`・`collect_feedback.js` の挙動 | 自スクリプトの read/write フィールドが field map 記載 |
| `skill-fixture-runner` 保守者             | `validate-skill-structure.js` の EVALS.json 検証範囲          | 検証 consumer として明示的に列挙される                |
| `aiworkflow-requirements` 正本保守者      | 正本仕様と EVALS consumer ポリシーの整合                      | `references/` 内の EVALS 言及と監査結果の整合性       |
| 後続スキーマ変更タスクの実行者            | AC-6 解除条件・変更手順の明確化                               | schema-change-guide.md を参照して安全に変更できる     |
| dual root sync ガード設計者               | `.claude` vs `.agents` の差分量・正本判定                     | dual-root-parity.md で差分状態を共有                  |
| CI / Hooks 管理者                         | EVALS.json 更新時の自動検証フックの整備範囲                   | 非連動 consumer の一覧を認識した上でフック設計        |

---

## 3. 要件

### 3.1 機能要件（FR）

| ID    | 要件                                                                                                                                                                                                          | 優先度 |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-1  | `.claude/skills/` と `.agents/skills/` 配下に存在する全 `EVALS.json` ファイルを列挙できる                                                                                                                     | 高     |
| FR-2  | `EVALS.json` を参照・更新・検証する全 consumer（_.js / _.ts / _.tsx / _.md）を列挙できる                                                                                                                      | 高     |
| FR-3  | 各 consumer について「操作種別（read/write/validate/document-only）」「参照フィールド」「更新フィールド」を記録する                                                                                           | 高     |
| FR-4  | 現行 EVALS スキーマの全フィールド（`skillName`, `version`, `currentLevel`, `metrics.*`, `levelHistory[]`, `patterns.*`, `phaseMetrics`, `qualityInsights.*`, `levelCriteria.*`）を field map として文書化する | 高     |
| FR-5  | フィールドごとに「どの consumer が read しているか」「どの consumer が write しているか」を逆引きできるマップを作成する                                                                                       | 高     |
| FR-6  | `.claude/skills/*/EVALS.json` と `.agents/skills/*/EVALS.json` の差分（内容・存在の有無）をスキル単位で表にする                                                                                               | 高     |
| FR-7  | スキーマ変更時の影響分析手順（フィールド追加／削除／リネームごと）を schema-change-guide.md に記載する                                                                                                        | 高     |
| FR-8  | TASK-CONFLICT-PREVENT-001 AC-6 の解除可否を、成果物の充足度から判定し結論を記載する                                                                                                                           | 高     |
| FR-9  | 監査過程で発見された新規課題（漏れ consumer、dual root ドリフト、検証不在領域等）は未タスクとして記録先を明示する                                                                                             | 中     |
| FR-10 | consumer 分類軸（コード／スクリプト／テスト／ドキュメント参照のみ）をレポート上で明示する                                                                                                                     | 中     |

### 3.2 非機能要件（NFR）

| ID    | 要件                                                                                                                | 優先度 |
| ----- | ------------------------------------------------------------------------------------------------------------------- | ------ |
| NFR-1 | 全成果物は Markdown で作成し、git 管理下に配置する                                                                  | 高     |
| NFR-2 | 監査は再現可能（ripgrep / grep のコマンド列を成果物に記載し、同じ結果が得られる）                                   | 高     |
| NFR-3 | `.backups/` および `node_modules/` は走査対象から除外する                                                           | 高     |
| NFR-4 | 動的パス生成（`path.join(skillDir, "EVALS.json")` 等）もコードリーディングで補足する                                | 高     |
| NFR-5 | 成果物は `docs/30-workflows/evals-consumer-audit-001/outputs/phase-N/` に配置し、Phase 番号と 1:1 対応させる        | 高     |
| NFR-6 | レビュー可能性: consumer 一覧は最低限「パス / 操作種別 / 参照フィールド / 更新フィールド」の 4 カラムで表形式化する | 中     |
| NFR-7 | 監査実行のコマンド例は pnpm / node / ripgrep のみに依存し、追加ツールのインストールは不要とする                     | 中     |
| NFR-8 | 成果物サイズは各ファイル 1000 行以内を目安とし、超過時は分割する                                                    | 低     |

---

## 4. 成功基準（Definition of Done）

### 4.1 受け入れ基準（AC）

- **AC-1**: `consumer-audit-report.md` に全 consumer が列挙され、**コード／スクリプト／テスト／ドキュメント参照** の 4 分類で整理されている。
- **AC-2**: 各 consumer について「操作（read/write/validate/document-only）」「参照フィールド」「更新フィールド」が記録されている。
- **AC-3**: `evals-field-map.md` に現行 EVALS スキーマの全フィールドが定義され、各フィールドについて「read する consumer」「write する consumer」が逆引きできる。
- **AC-4**: `dual-root-parity.md` に `.claude/skills/*/EVALS.json` と `.agents/skills/*/EVALS.json` のスキル単位差分表が記載され、差分が 0 / 許容 / 要対応のいずれであるかが判定されている。
- **AC-5**: `schema-change-guide.md` に「フィールド追加」「フィールド削除」「フィールドリネーム」それぞれの手順・影響範囲・dual root 同期手順・検証手順が定義されている。
- **AC-6**: TASK-CONFLICT-PREVENT-001 AC-6（EVALS schema 変更禁止）の解除条件が満たされているか否かを本タスクの成果物から判定し、判定結果が `consumer-audit-report.md` 末尾に明記されている。
- **AC-7**: 監査過程で発見された未タスクは `unassigned-task/` 配下に記録先を提示（または既存未タスクへの追記先を明記）している。
- **AC-8**: 再現コマンド（`rg`, `grep`, `diff`, `node`）が成果物中に列挙され、第三者が再実行して同じ consumer リストを得られる。

### 4.2 品質基準

- 全成果物が Markdown として lint エラーなく書かれている（`pnpm lint` を通過する必要はないが Markdown 構造は整合）。
- consumer 漏れチェックコマンド（Step 6.1 を参照）で、監査後に未記載の参照ヒットが 0 件である。
- dual root 差分のうち「許容」と判定したものには理由（例: dual root 同期対象外の一時データ）が明示されている。

---

## 5. 非ゴール（含まないもの）

| 非ゴール                                                                | 理由                                                               |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------ |
| EVALS.json のスキーマ変更自体                                           | 本タスクは監査のみ。変更は schema-change-guide.md に従う後続タスク |
| `.backups/` 配下のアーカイブ EVALS.json の調査                          | アーカイブは現行 consumer ではないため除外                         |
| `LOGS.md` や `references/` の単なるコメント・説明文（非 consumer 参照） | コード／スクリプトとして参照していないため consumer ではない       |
| EVALS.json 以外の JSON（`LOGS.md` 等）の consumer 監査                  | スコープ外、別タスクで扱う                                         |
| TypeScript 型定義（`EvalsSchema` 等）の新規追加                         | 実装を伴うため本タスクのスコープ外                                 |
| dual root を単一 root へ統合する作業                                    | 別タスク（mirror sync 系）で扱う                                   |
| CI フック（validate-schemas.js の強化など）の実装                       | 実装を伴うため別タスク                                             |
| EVALS.json の実データ補正（`successCount` 修正等）                      | 監査スコープ外                                                     |

---

## 6. 制約・前提

### 6.1 前提条件

- Node.js および `pnpm` が利用可能。
- `ripgrep (rg)` または `grep` が利用可能。`diff` コマンドが利用可能。
- `.claude/skills/` と `.agents/skills/` の両方がローカルに checkout されている。
- TASK-CONFLICT-PREVENT-001 が完了済みで、AC-6 の内容が既知。
- 代表スキーマとして `.claude/skills/task-specification-creator/EVALS.json` をサンプルにできる。

### 6.2 制約

- **コード実装禁止**: 本タスクでは `*.ts` / `*.tsx` / `*.js` / `action.yml` などの実装ファイルの新規作成・修正を行わない。Markdown 成果物のみ。
- **Issue #2279 の再オープン禁止**: Issue は CLOSED のまま、設計書・成果物のみで完了扱いとする。
- **EVALS.json 自体の改変禁止**: 監査中に発見したフィールド不整合があっても本タスクで修正しない（後続タスクに委譲）。
- **ripgrep/grep 結果の誇張禁止**: 静的検索で見つからなかった動的 consumer（文字列連結・テンプレートリテラル）はコードリーディングで補完し、検出漏れリスクは `qualityInsights` に明示する。
- **dual root 正本の独断決定禁止**: `.claude` vs `.agents` のどちらが正本かは本タスクで断定せず、「現状の差分可視化」までに留める。
- **aiworkflow-requirements 正本との整合**: `references/` 内で EVALS.json に関する記述があれば、その内容と監査結果が矛盾しないことを確認する。矛盾があれば未タスクとして記録する。

---

## 7. 想定リスク

| ID     | リスク                                                                              | 発生確率 | 影響 | 検出 Phase | 対策                                                                                            |
| ------ | ----------------------------------------------------------------------------------- | -------- | ---- | ---------- | ----------------------------------------------------------------------------------------------- |
| RISK-1 | 動的パス生成（`path.join(...,"EVALS.json")`）を grep で見落とす                     | 中       | 高   | Phase 5    | コードリーディング併用、`join.*EVALS` / `EVALS_FILE` / `evalsPath` 等のパターンも検索           |
| RISK-2 | dual root の片方に新スキルが追加されていて、もう片方の consumer が存在しない        | 中       | 中   | Phase 6    | `find` で全 EVALS.json を列挙し、対称性を確認                                                   |
| RISK-3 | Markdown 内の参照をコード consumer と誤認する                                       | 低       | 低   | Phase 4    | 分類軸を「コード／スクリプト／テスト／ドキュメント参照のみ」の 4 つに固定し、分類を明示         |
| RISK-4 | 監査後に新規 consumer が追加されて再監査が必要になる                                | 低       | 高   | 運用後     | schema-change-guide.md に「consumer 追加時は evals-field-map.md を必ず更新」ルールを記載        |
| RISK-5 | Phase 1-3 の設計を機械的にテンプレ適用し、consumer 監査タスク固有の論点を取りこぼす | 中       | 中   | Phase 3    | Phase 3 レビューで「監査 3 レイヤ（静的／field参照／検証）」が Phase 設計に反映されているか確認 |
| RISK-6 | `aiworkflow-requirements` 正本との記述不整合が監査後に判明する                      | 低       | 中   | Phase 10   | Phase 9 品質検証で `references/` の EVALS 関連記述を突き合わせ                                  |
| RISK-7 | `qualityInsights.notes` のような自由記述フィールドを「参照あり」と誤判定する        | 中       | 低   | Phase 5    | field map 作成時にフィールド型（固定キー／自由記述）を分類                                      |

---

## 統合テスト連携【必須】

本タスクはコード実装を含まないため、従来のユニット／結合テストカバレッジ基準は適用しない。代わりに以下の「監査品質ゲート」で完了判定する。

| 判定項目                                                                   | 基準       | 結果    |
| -------------------------------------------------------------------------- | ---------- | ------- |
| consumer 漏れチェックコマンド出力がすべて成果物記載範囲内                  | 100%       | pending |
| dual root 差分表が全スキル（`.claude/skills/` 配下の全ディレクトリ）を網羅 | 100%       | pending |
| EVALS スキーマの全フィールドが field map に記載されている                  | 100%       | pending |
| schema-change-guide.md が 3 操作（add/remove/rename）を網羅                | 100%       | pending |
| AC-6 解除判定が明示されている                                              | 明示あり   | pending |
| 未タスク発見時の記録先（unassigned-task パス）が提示されている             | 発見件数分 | pending |

---

## 成果物

| 成果物     | パス                                                                             | 説明                                                 |
| ---------- | -------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 要件定義書 | `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-1-requirements.md` | 本ファイル（Why / ステークホルダー / AC / 非ゴール） |

最終成果物（Phase 4 以降で作成）は以下の 4 点：

| 最終成果物               | パス                                                                                  | 生成 Phase   |
| ------------------------ | ------------------------------------------------------------------------------------- | ------------ |
| consumer-audit-report.md | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md` | Phase 5 集約 |
| evals-field-map.md       | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md`       | Phase 5      |
| schema-change-guide.md   | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md`   | Phase 8      |
| dual-root-parity.md      | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/dual-root-parity.md`      | Phase 6      |

※ 具体的な配置と生成 Phase は Phase 3 で確定する。

---

## 完了条件

- [ ] 背景・動機・ステークホルダー・要件・AC・非ゴール・制約・リスクが記載されている
- [ ] Issue #2279 が CLOSED のまま設計書を作成する理由が明記されている
- [ ] AC-1〜AC-8 が検証可能な形で定義されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 次 Phase（Phase 2）の入力として、スコープ / 依存 / アーキテクチャ判断に必要な前提が揃っている

## タスク100%実行確認【必須】

- [x] Step 0: 入力資料 4 点（TASK-EVALS-CONSUMER-AUDIT-001.md / phase-template-core.md / phase-template-phase1.md / EVALS.json 代表スキーマ）を読了
- [x] Step 1: 背景と動機を整理
- [x] Step 2: ステークホルダー 7 種を列挙
- [x] Step 3: FR-1〜FR-10 / NFR-1〜NFR-8 を分類
- [x] Step 4: AC-1〜AC-8 を検証可能な形で定義
- [x] Step 5: 非ゴール 8 項目を固定
- [x] Step 6: 制約 6 項目・前提 5 項目を列挙
- [x] Step 7: リスク RISK-1〜RISK-7 を検出 Phase とともに固定

## 次Phase

Phase 2: スコープ・前提・依存・制約・アーキテクチャ判断
