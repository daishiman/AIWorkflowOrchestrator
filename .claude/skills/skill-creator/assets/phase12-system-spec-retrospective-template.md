# Phase 12 システム仕様更新・苦戦箇所テンプレート

> **用途**: Phase 12 Step 2 で「今回の実装内容」と「苦戦箇所」を aiworkflow-requirements へ再利用可能な形で反映する。
> **推奨出力先**: `docs/30-workflows/<TASK-ID>/outputs/phase-12/spec-update-summary.md`
> **プロファイル選択基準**:
> 1. コード変更あり + UI変更あり → P-UI6（6仕様書プロファイル）
> 2. コード変更あり + IPC/API変更あり → P-STD5（標準5仕様書プロファイル）
> 3. コード変更あり + task-workflow.mdにStep 2更新対象あり → P-STD5
> 4. コード変更なし（ドキュメント改善のみ）→ P-RECHECK（再確認プロファイル）
>
> **P-STD5 関連仕様書（標準5点セット）**:
> - `references/interfaces-*.md`（型/API契約）
> - `references/api-ipc-*.md`（IPC契約）
> - `references/security-*.md`（セキュリティ仕様）
> - `references/task-workflow.md`（完了台帳）
> - `references/lessons-learned.md`（再発防止知見）
>
> **P-UI6 関連仕様書（UI機能6点セット）**:
> - `references/ui-ux-components.md`（主要UI一覧・完了タスク）
> - `references/ui-ux-feature-components.md`（機能仕様・関連未タスク・苦戦箇所）
> - `references/arch-ui-components.md`（UI構造・責務境界）
> - `references/arch-state-management.md`（状態管理パターン）
> - `references/task-workflow.md`（完了台帳）
> - `references/lessons-learned.md`（再発防止知見）
>
> **P-RECHECK 関連範囲（再確認5点）**:
> - `references/task-workflow.md`（完了台帳・残課題テーブル・検証証跡）
> - `references/lessons-learned.md`（苦戦箇所の再発条件付き教訓化）
> - `docs/30-workflows/unassigned-task/`（未タスク指示書配置・10見出し確認・監査実行）
> - 検証スクリプト実行（verify/validate/audit/linksの順次実行と記録）
> - `spec-update-summary.md` / `spec-sync-subagent-report.md`（Step 2判定同期・三点突合確認）

---

## メタ情報

| 項目 | 値 |
| --- | --- |
| タスクID | `<TASK-ID>` |
| タスク名 | `<TASK-NAME>` |
| 実施日 | `YYYY-MM-DD` |
| ステータス | `completed` / `spec_created` |
| 監査対象workflow | `<workflow-a>`（必須） / `<workflow-b>`（必要時） |
| プロファイル | `P-STD5` / `P-UI6` / `P-RECHECK` |
| SubAgent分担 | `SubAgent-A:interfaces / SubAgent-B:api-ipc / SubAgent-C:security / SubAgent-D:task-workflow / SubAgent-E:lessons` または `SubAgent-A:ui-ux-components / SubAgent-B:ui-ux-feature-components / SubAgent-C:arch-ui-components / SubAgent-D:arch-state-management / SubAgent-E:task-workflow / SubAgent-F:lessons` |

---

## 実装内容サマリー

| 観点 | 内容 |
| --- | --- |
| 何を実装したか | `<実装の要点を1-2行>` |
| 変更範囲 | `<Main / Preload / Renderer / Store / docs の中から該当するものを列挙>` |
| なぜ必要か | `<背景と狙い>` |
| 完了判定 | `<Phase 12要件と一致する根拠>` |

---

## 仕様書別SubAgent分担（必須）

> **制約**: 1仕様書=1SubAgent、1SubAgentあたり3ファイル以下（P43対策）

### P-STD5: 標準5仕様書プロファイル

| SubAgent | 担当仕様書 | 主担当作業 | 依存関係 |
| --- | --- | --- | --- |
| SubAgent-A | `references/interfaces-*.md` | 型/API契約の同期 | 実装差分確定後 |
| SubAgent-B | `references/api-ipc-*.md` | IPCチャネル契約（request/response/validation）同期 | SubAgent-A完了後 |
| SubAgent-C | `references/security-*.md` | sender/P42/入力検証/エラーサニタイズ同期 | SubAgent-B完了後 |
| SubAgent-D | `references/task-workflow.md` | 完了台帳・検証証跡・残課題同期 | SubAgent-A/B/C完了後 |
| SubAgent-E | `references/lessons-learned.md` | 苦戦箇所と再利用手順の教訓化 | SubAgent-D完了後 |

### P-UI6: UI機能6仕様書プロファイル

| SubAgent | 担当仕様書 | 主担当作業 | 依存関係 |
| --- | --- | --- | --- |
| SubAgent-A | `references/ui-ux-components.md` | 主要UI一覧・完了タスク・関連導線の同期 | 実装差分確定後 |
| SubAgent-B | `references/ui-ux-feature-components.md` | 機能仕様・関連未タスク・苦戦箇所の同期 | SubAgent-A完了後 |
| SubAgent-C | `references/arch-ui-components.md` | UI構造と責務境界の同期 | SubAgent-A/B完了後 |
| SubAgent-D | `references/arch-state-management.md` | 状態管理設計とP31対策の同期 | SubAgent-C完了後 |
| SubAgent-E | `references/task-workflow.md` | 完了台帳・検証証跡・未タスクの同期 | SubAgent-A/B/C/D完了後 |
| SubAgent-F | `references/lessons-learned.md` | 再発条件付き教訓と簡潔手順の同期 | SubAgent-E完了後 |

### P-RECHECK: 再確認プロファイル

| SubAgent | 担当範囲 | 主担当作業 | 依存関係 | 完了条件 |
| --- | --- | --- | --- | --- |
| SubAgent-A | `references/task-workflow.md` | 完了台帳・残課題テーブル・検証証跡同期 | 成果物確定後 | 完了タスク + 証跡 + 苦戦箇所が記録済み |
| SubAgent-B | `references/lessons-learned.md` | 苦戦箇所の再発条件付き教訓化 | SubAgent-A完了後 | 再発条件 + 簡潔解決手順が記録済み |
| SubAgent-C | `docs/30-workflows/unassigned-task/` | 未タスク指示書配置・10見出し確認・監査実行 | SubAgent-B完了後 | `missing=0` かつ `currentViolations=0` かつ `rg -n '^## メタ情報$' <file>` が1件のみ |
| SubAgent-D | 検証スクリプト実行 | verify/validate/audit/linksの順次実行と記録 | SubAgent-C完了後 | 4スクリプト全PASS。`current=合否/baseline=監視`で記録 |
| SubAgent-E | `spec-update-summary.md` / `spec-sync-subagent-report.md` | Step 2判定同期・三点突合確認 | SubAgent-D完了後 | `spec-sync-subagent-report.md` が存在し、summary/report/changelogの三点が整合 |

### 2workflow同時監査プロファイル（spec_created + completed）

| workflow | 種別 | 必須検証 | 記録先 |
| --- | --- | --- | --- |
| `<workflow-a>` | `spec_created` / `completed` | `verify-all-specs` + `validate-phase-output` + Task 1/3/4/5 実体突合 | `task-workflow.md` 再確認テーブル |
| `<workflow-b>` | `spec_created` / `completed` | `verify-all-specs` + `validate-phase-output` + Task 1/3/4/5 実体突合 | `task-workflow.md` 再確認テーブル |

> `<workflow-b>` が不要な場合は1workflowのみで運用し、理由を「備考」に明記する。

### Step 2 判定同期チーム（全プロファイル共通・必須）

| SubAgent | 担当範囲 | 主担当作業 | 完了条件 |
| --- | --- | --- | --- |
| SubAgent-S2-A | `phase-12-documentation.md` | Step 2 更新対象（`arch/api/interfaces/security`）の要否判定を確定 | 更新対象に応じて Step 2 を `完了` / `該当なし` で説明可能 |
| SubAgent-S2-B | `outputs/phase-12/documentation-changelog.md` | Step 判定（1-A〜2）と理由を同期 | Step 2 判定が実装実体と一致 |
| SubAgent-S2-C | `outputs/phase-12/spec-update-summary.md` | Step 2 更新仕様書の一覧化と反映内容同期 | changelog の Step 2 判定と更新対象一覧が一致 |

---

## 仕様反映先（テンプレート準拠）

| 仕様書 | 反映内容 | 証跡 |
| --- | --- | --- |
| `task-workflow.md` | 完了タスク・成果物・苦戦箇所・簡潔手順を記録 | `<該当セクション>` |
| `<domain-spec>.md` | 実装仕様・契約差分・苦戦箇所・関連タスクを記録 | `<該当セクション>` |
| `lessons-learned.md` | 再発条件付きの苦戦箇所と再利用手順を記録 | `<該当セクション>` |

UI機能実装の場合は次を推奨:
- `ui-ux-components.md`（実装内容・完了タスク・未タスク導線）
- `ui-ux-feature-components.md`（機能仕様・苦戦箇所）
- `arch-ui-components.md` / `arch-state-management.md`（設計整合）
- `task-workflow.md` / `lessons-learned.md`（台帳・教訓）

---

## 苦戦箇所（再利用可能形式）

| 苦戦箇所 | 再発条件 | 解決策 | 今後の標準ルール |
| --- | --- | --- | --- |
| `<課題1>` | `<再発しやすい条件>` | `<今回の対処>` | `<次回の標準運用>` |
| `<課題2>` | `<再発しやすい条件>` | `<今回の対処>` | `<次回の標準運用>` |
| `<課題3>` | `<再発しやすい条件>` | `<今回の対処>` | `<次回の標準運用>` |

---

## 同種課題の簡潔解決手順（5ステップ）

1. `<変更範囲を標準5責務（interfaces/api-ipc/security/task/lessons）またはUI6責務（ui-ux-components/ui-ux-feature/arch-ui/arch-state/task/lessons）へ分離する>`
2. `<phase-12-documentation.md の更新対象表を正本に Step 2 要否を確定し、documentation-changelog / spec-update-summary と二重突合する>`
3. `<実装 + 契約 + セキュリティ + サービス公開境界（services/*/index.ts）を同一ターンで同期し、苦戦箇所を task-workflow / lessons に同時記録する>`
4. `<未タスクがある場合は docs/30-workflows/unassigned-task/ に10見出し（## メタ情報 + ## 1..9）で作成する>`
5. `<verify-all-specs / validate-phase-output / verify-unassigned-links / audit --diff-from HEAD を連続実行し、current=合否・baseline=監視で分離記録する>`

---

## 検証コマンド

| コマンド | 目的 | 期待結果 |
| --- | --- | --- |
| `rg --files .claude/skills \| rg 'verify-all-specs\|validate-phase-output\|verify-unassigned-links\|audit-unassigned-tasks'` | 監査スクリプト実体の事前解決 | 実体パスが確認できる |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-path> --strict` | ワークフロー仕様準拠確認 | `PASS` |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-path>` | Phase出力構造確認 | `PASS` |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-a> --json && node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-b> --json` | 2workflow同時監査（構造） | 2件とも `PASS` |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-a> && node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-b>` | 2workflow同時監査（出力） | 2件とも `PASS` |
| `rg -n '^\\| 2\\s+\\|' <workflow-path>/outputs/phase-12/documentation-changelog.md` | Step 2 判定の明示確認 | Step 2 行が更新対象と一致する |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` | 未タスクリンク整合確認 | `missing: 0` |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file <unassigned-file>` | 対象未タスクの形式/命名/配置監査 | `currentViolations: 0` |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` | 今回差分の未タスク監査 | `currentViolations: 0`（`baselineViolations` は監視値として別記録） |
| `rg -n '^## メタ情報$|^## [1-9]\\. ' <unassigned-file>` | 10見出しの機械確認 | `## メタ情報` が1件、`## 1..9` が9件 |
| `rg -n "from \"\\.\\./services/<domain>/\"|export \\* from \"\\.\\/\"|SkillChain(Store|Executor)" apps/desktop/src/main` | サービス公開境界（バレル/export）監査 | 直接 import の扱いが説明可能で、必要な export が定義済み |
| `ls -la <workflow-path>/outputs/phase-11/screenshots` | UI画面証跡の存在確認（UIタスクのみ） | スクリーンショットが列挙される |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow <workflow-path>` | UI画面証跡の TC 対応検証（UIタスクのみ） | `PASS`（`expected TC: 0` の場合は下行フォールバックを実施） |
| `rg -n '^###\\s+TC-[0-9]+' <workflow-path>/phase-11-manual-test.md ; find <workflow-path>/outputs/phase-11/screenshots -type f \| wc -l` | TC 抽出不可時のフォールバック検証 | `TC定義を追加` または `screenshots>=1` + フォールバック理由記録 |
| `node .claude/skills/skill-creator/scripts/quick_validate.js <skill-dir>` | スキル構造検証 | `error: 0` |

---

## Phase 12 成果物チェック

- [ ] `implementation-guide.md`
- [ ] `spec-update-summary.md`
- [ ] `documentation-changelog.md`
- [ ] `unassigned-task-detection.md`（標準）
- [ ] 旧名 `unassigned-task-report.md` を新規作成していない（互換用途のみ・非推奨）
- [ ] `phase12-task-spec-compliance-check.md`（任意だが推奨）
- [ ] 未タスク指示書の見出しフォーマット（`## メタ情報` + `## 1..9`）確認
- [ ] `audit --target-file` の `currentViolations: 0` を確認
- [ ] 2workflow同時監査時は両workflowの `verify-all-specs` / `validate-phase-output` 証跡を記録
- [ ] UIタスクではスクリーンショット証跡（`outputs/phase-11/screenshots`）を記録
- [ ] UIタスクでは `validate-phase11-screenshot-coverage` を実行し、未対応時は `expected TC: 0` の理由とフォールバック検証（screenshots実体 + 代表画像確認）を記録
- [ ] `documentation-changelog.md` の Step 2 判定が `phase-12-documentation.md` の更新対象と一致している
- [ ] `spec-update-summary.md` の更新対象一覧に Step 2 の実更新仕様書が反映されている
- [ ] IPC登録修正タスクでは `services/*/index.ts` の export 同期有無（または未タスク移管）が記録されている
- [ ] 未タスク監査結果は `current=合否 / baseline=監視` を分離して記録している
