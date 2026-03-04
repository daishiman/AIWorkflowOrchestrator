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

### 3.3 仕様書別SubAgent実行ログ（必須）

| SubAgent | 担当仕様書 | 実装内容の反映先 | 苦戦箇所の反映先 | 検証証跡 |
| --- | --- | --- | --- | --- |
| `<SubAgent-A>` | `<spec-a>` | `<実装内容を反映したセクション/見出し>` | `<苦戦箇所を反映したセクション/見出し>` | `<verify/validate/links/audit/UI証跡のいずれか>` |
| `<SubAgent-B>` | `<spec-b>` | `<実装内容を反映したセクション/見出し>` | `<苦戦箇所を反映したセクション/見出し>` | `<verify/validate/links/audit/UI証跡のいずれか>` |
| `<SubAgent-C>` | `<spec-c>` | `<実装内容を反映したセクション/見出し>` | `<苦戦箇所を反映したセクション/見出し>` | `<verify/validate/links/audit/UI証跡のいずれか>` |

> 各行は「実装内容」と「苦戦箇所」の両列を必須とし、片側のみ更新を禁止する。

---

## 4. 仕様反映先（テンプレート準拠）

| 仕様書 | 反映内容 | 証跡 |
| --- | --- | --- |
| `task-workflow.md` | 完了タスク・成果物・苦戦箇所・簡潔手順を記録 | `<該当セクション>` |
| `<domain-spec>.md` | 実装仕様・契約差分・苦戦箇所・関連タスクを記録 | `<該当セクション>` |
| `lessons-learned.md` | 再発条件付きの苦戦箇所と再利用手順を記録 | `<該当セクション>` |

### 4.1 標準5仕様書の転記チェック（TASK-10A-C型）

| 仕様書 | 必須記載 | 担当SubAgent |
| --- | --- | --- |
| `interfaces-agent-sdk-skill.md` | 実装した型/API契約、苦戦箇所、同種課題の簡潔解決手順 | A |
| `api-ipc-agent.md` | request/response/validation、苦戦箇所、同種課題の簡潔解決手順 | B |
| `security-electron-ipc.md` | sender/P42/構造/サニタイズ、苦戦箇所、同種課題の簡潔解決手順 | C |
| `task-workflow.md` | 完了記録、検証証跡、SubAgent分担、苦戦箇所 | D |
| `lessons-learned.md` | 再発条件付きの苦戦箇所、同種課題の簡潔解決手順 | E |

> 上記5仕様書は同一ターンで更新し、`task-workflow.md` の対象タスク節に SubAgent 分担表を転記する。

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
2. `<実装 + 契約 + セキュリティを同一ターンで同期する>`
3. `<未タスクがある場合は docs/30-workflows/unassigned-task/ に10見出し（## メタ情報 + ## 1..9）で作成し、完了移管後は docs/30-workflows/completed-tasks/unassigned-task/ へ移す>`
4. `<UIタスクは再撮影前に preview preflight（build成功 + 127.0.0.1:4173 疎通）を実施し、失敗時は未タスク化へ分離する>`
5. `<verify-all-specs / validate-phase-output / phase-11-manual-test必須節grep / verify-unassigned-links / audit --diff-from HEAD を実行し、検証値と苦戦箇所を task-workflow と lessons に同時転記する>`

---

## 7. 検証コマンド

| コマンド | 目的 | 期待結果 |
| --- | --- | --- |
| `rg --files .claude/skills \| rg 'verify-all-specs\|validate-phase-output\|verify-unassigned-links\|audit-unassigned-tasks'` | 監査スクリプト実体の事前解決 | 実体パスが確認できる |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-path> --strict` | ワークフロー仕様準拠確認 | `PASS` |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-path>` | Phase出力構造確認 | `PASS` |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-a> --json && node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-b> --json` | 2workflow同時監査（構造） | 2件とも `PASS` |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-a> && node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-b>` | 2workflow同時監査（出力） | 2件とも `PASS` |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` | 未タスクリンク整合確認 | `missing: 0` |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file <unassigned-file>` | 対象未タスクの形式/命名/配置監査 | `currentViolations: 0` |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` | 今回差分の未タスク監査 | `currentViolations: 0` |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD \| jq '{currentViolations: .currentViolations.total, baselineViolations: .baselineViolations.total}'` | 未タスク監査カウンタ（current/baseline）を転記用に固定 | current/baseline の確定値が取得できる |
| `rg -n "<UT-ID>|<task-id>" docs/30-workflows/unassigned-task docs/30-workflows/completed-tasks/unassigned-task` | 未タスクの配置先判定（未完了/完了移管） | 未完了は `unassigned-task`、完了済みは `completed-tasks/unassigned-task` |
| `rg -n '^## メタ情報$|^## [1-9]\\. ' <unassigned-file>` | 10見出しの機械確認 | `## メタ情報` が1件、`## 1..9` が9件 |
| `rg -n '## Part 1|## Part 2|なぜ|必要|例え|interface|type|API|エッジケース|設定' <workflow-path>/outputs/phase-12/implementation-guide.md` | 実装ガイド Task 1 必須要素の簡易確認 | Part 1/Part 2 + 理由先行 + 日常例え + 型/API/エッジケース/設定語が検出される |
| `pnpm --filter @repo/desktop preview` | UI再撮影前の preview preflight（build成否確認） | `ready in ...` または build成功ログが確認できる |
| `curl -I http://127.0.0.1:4173` | UI再撮影前のローカル疎通確認 | `HTTP/1.1 200` 系応答 |
| `pnpm --filter @repo/desktop run screenshot:<feature>` | UI画面証跡の当日再撮影（UIタスクのみ） | 対象TCのスクリーンショットが再生成される |
| `pnpm --filter @repo/desktop exec vitest run <target-test-file>` | UI/Store/Main の再確認テストを非watchで実行 | プロセスが単発終了し証跡を固定できる |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow <workflow-path>` | TC単位の証跡紐付け検証（UIタスクのみ） | `PASS`（expected TC = covered TC） |
| `ls -la <workflow-path>/outputs/phase-11/screenshots` | UI画面証跡の存在確認（UIタスクのみ） | スクリーンショットが列挙される |
| `rg -n -e '^## 統合テスト連携$' -e '^## 成果物$' -e '^## 実行手順$' -e '^## 完了条件$' <workflow-path>/phase-11-manual-test.md` | Phase 11 必須節（統合テスト連携/成果物or実行手順/完了条件）確認 | 必須見出しが3種そろう |
| `ls -lt <workflow-path>/outputs/phase-11/screenshots` | UI再撮影証跡の鮮度確認（UIタスクのみ） | 最上位ファイルの更新時刻が当日である |
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
- [ ] `verify-unassigned-links` / `audit --diff-from HEAD` の確定値（existing/missing/current/baseline）を `task-workflow.md` と `outputs/phase-12`（`spec-update-summary.md`/`unassigned-task-detection.md`）へ同値転記する
- [ ] 未タスクの配置先判定（未完了=`docs/30-workflows/unassigned-task/`、完了移管済み=`docs/30-workflows/completed-tasks/unassigned-task/`）を証跡化している
- [ ] 2workflow同時監査時は両workflowの `verify-all-specs` / `validate-phase-output` 証跡を記録
- [ ] `task-workflow.md` の対象タスク節へ「仕様書別SubAgent分担」表を転記する
- [ ] 仕様書別SubAgent実行ログ（実装内容/苦戦箇所/検証証跡）を `spec-update-summary.md` に記録する
- [ ] UIタスクでは `phase-11-manual-test.md` に必須節（`統合テスト連携` / `成果物 or 実行手順` / `完了条件`）が存在する
- [ ] UIタスクでは再撮影前に preview preflight（build成功 + `127.0.0.1:4173` 疎通）を記録している
- [ ] UIタスクでは `validate-phase11-screenshot-coverage.js --workflow <workflow-path>` が `PASS` である
- [ ] UIタスクでは再撮影したスクリーンショット証跡（`outputs/phase-11/screenshots`）を記録し、更新時刻が当日である
- [ ] UIタスクで preflight が失敗した場合は、再撮影を継続せず未タスク化し、代替証跡の理由を記録している
- [ ] UIタスクでは `manual-test-result.md` / `screenshot-coverage.md` の時刻記録が実ファイル `stat` と整合する
