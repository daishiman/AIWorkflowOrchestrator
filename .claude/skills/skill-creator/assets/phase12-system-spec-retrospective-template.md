# Phase 12 システム仕様更新・苦戦箇所テンプレート

> **用途**: Phase 12 Step 2 で「今回の実装内容」と「苦戦箇所」を aiworkflow-requirements へ再利用可能な形で反映する。
> **推奨出力先**: `docs/30-workflows/<TASK-ID>/outputs/phase-12/spec-update-summary.md`
> **関連仕様書（推奨5点セット）**:
> - `references/<interface-spec>.md`（型/API契約）
> - `references/<api-ipc-spec>.md`（IPC契約）
> - `references/<security-spec>.md`（セキュリティ仕様）
> - `references/task-workflow.md`（完了台帳）
> - `references/lessons-learned.md`（再発防止知見）
>  
> **UI機能実装時（TASK-UI-05型）の推奨6点セット**:
> - `references/ui-ux-components.md`（主要UI一覧・完了タスク）
> - `references/ui-ux-feature-components.md`（機能仕様・関連未タスク・苦戦箇所）
> - `references/arch-ui-components.md`（UI構造・責務境界）
> - `references/arch-state-management.md`（状態管理パターン）
> - `references/task-workflow.md`（完了台帳）
> - `references/lessons-learned.md`（再発防止知見）

---

## 1. メタ情報

| 項目 | 値 |
| --- | --- |
| タスクID | `<TASK-ID>` |
| 実施日 | `YYYY-MM-DD` |
| ステータス | `completed` / `spec_created` |
| 監査対象workflow | `<workflow-a>`（必須） / `<workflow-b>`（必要時） |
| SubAgent分担 | `A:interfaces / B:api-ipc / C:security / D:task-workflow / E:lessons` または `A:ui-ux-components / B:ui-ux-feature-components / C:arch-ui-components / D:arch-state-management / E:task-workflow / F:lessons` |

---

## 2. 実装内容サマリー

| 観点 | 内容 |
| --- | --- |
| 何を実装したか | `<実装の要点を1-2行>` |
| 変更範囲 | `<Main / Preload / Renderer / Store など>` |
| なぜ必要か | `<背景と狙い>` |
| 完了判定 | `<Phase 12要件と一致する根拠>` |

---

## 3. 仕様書別SubAgent分担（必須）

| SubAgent | 担当仕様書 | 主担当作業 | 依存関係 |
| --- | --- | --- | --- |
| A | `references/<interface-spec>.md` | 型/API契約の同期 | 実装差分確定後 |
| B | `references/<api-ipc-spec>.md` | IPCチャネル契約（request/response/validation）同期 | A完了後 |
| C | `references/<security-spec>.md` | sender/P42/入力検証/エラーサニタイズ同期 | B完了後 |
| D | `references/task-workflow.md` | 完了台帳・検証証跡・残課題同期 | A/B/C完了後 |
| E | `references/lessons-learned.md` | 苦戦箇所と再利用手順の教訓化 | D完了後 |

### 3.1 UI機能実装向けSubAgent分担（TASK-UI-05型）

| SubAgent | 担当仕様書 | 主担当作業 | 依存関係 |
| --- | --- | --- | --- |
| A | `references/ui-ux-components.md` | 主要UI一覧・完了タスク・関連導線の同期 | 実装差分確定後 |
| B | `references/ui-ux-feature-components.md` | 機能仕様・関連未タスク・苦戦箇所の同期 | A完了後 |
| C | `references/arch-ui-components.md` | UI構造と責務境界の同期 | A/B完了後 |
| D | `references/arch-state-management.md` | 状態管理設計とP31対策の同期 | C完了後 |
| E | `references/task-workflow.md` | 完了台帳・検証証跡・未タスクの同期 | A/B/C/D完了後 |
| F | `references/lessons-learned.md` | 再発条件付き教訓と簡潔手順の同期 | E完了後 |

再確認タスクでは次の分担に置き換えてよい:
- `A: task-workflow`
- `B: lessons-learned`
- `C: unassigned-task (配置/見出し/監査)`
- `D: 検証（verify/validate/links/audit）`

### 3.2 2workflow同時監査プロファイル（spec_created + completed）

| workflow | 種別 | 必須検証 | 記録先 |
| --- | --- | --- | --- |
| `<workflow-a>` | `spec_created` / `completed` | `verify-all-specs` + `validate-phase-output` + Task 1/3/4/5 実体突合 | `task-workflow.md` 再確認テーブル |
| `<workflow-b>` | `spec_created` / `completed` | `verify-all-specs` + `validate-phase-output` + Task 1/3/4/5 実体突合 | `task-workflow.md` 再確認テーブル |

> `<workflow-b>` が不要な場合は1workflowのみで運用し、理由を「備考」に明記する。

### 3.3 Step 2 判定の二重突合（必須）

| 観点 | 確認元 | 完了条件 |
| --- | --- | --- |
| Step 2 要否判定 | `phase-12-documentation.md` の更新対象テーブル | 更新対象に `arch-*` / `api-*` / `interfaces-*` / `security-*` が含まれる場合は Step 2 を `完了` にする |
| Step判定同期 | `outputs/phase-12/documentation-changelog.md` | Step 2 が実装実体と一致している（`該当なし` の誤判定なし） |
| 更新対象同期 | `outputs/phase-12/spec-update-summary.md` | Step 2 で更新した仕様書が一覧に明記され、反映内容が記載されている |

---

## 4. 仕様反映先（テンプレート準拠）

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

## 5. 苦戦箇所（再利用可能形式）

| 苦戦箇所 | 再発条件 | 解決策 | 今後の標準ルール |
| --- | --- | --- | --- |
| `<課題1>` | `<再発しやすい条件>` | `<今回の対処>` | `<次回の標準運用>` |
| `<課題2>` | `<再発しやすい条件>` | `<今回の対処>` | `<次回の標準運用>` |
| `<課題3>` | `<再発しやすい条件>` | `<今回の対処>` | `<次回の標準運用>` |

---

## 6. 同種課題の簡潔解決手順（5ステップ）

1. `<変更範囲を標準5責務（interfaces/api-ipc/security/task/lessons）またはUI6責務（ui-ux-components/ui-ux-feature/arch-ui/arch-state/task/lessons）へ分離する>`
2. `<phase-12-documentation.md の更新対象表を正本に Step 2 要否を確定し、documentation-changelog / spec-update-summary と二重突合する>`
3. `<実装 + 契約 + セキュリティ + サービス公開境界（services/*/index.ts）を同一ターンで同期し、苦戦箇所を task-workflow / lessons に同時記録する>`
4. `<未タスクがある場合は docs/30-workflows/unassigned-task/ に10見出し（## メタ情報 + ## 1..9）で作成する>`
5. `<verify-all-specs / validate-phase-output / verify-unassigned-links / audit --diff-from HEAD を連続実行し、current=合否・baseline=監視で分離記録する>`

---

## 7. 検証コマンド

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
| `node .claude/skills/skill-creator/scripts/quick_validate.js <skill-dir>` | スキル構造検証 | `error: 0` |

---

## 8. Phase 12 成果物チェック

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
- [ ] `documentation-changelog.md` の Step 2 判定が `phase-12-documentation.md` の更新対象と一致している
- [ ] `spec-update-summary.md` の更新対象一覧に Step 2 の実更新仕様書が反映されている
- [ ] IPC登録修正タスクでは `services/*/index.ts` の export 同期有無（または未タスク移管）が記録されている
- [ ] 未タスク監査結果は `current=合否 / baseline=監視` を分離して記録している
