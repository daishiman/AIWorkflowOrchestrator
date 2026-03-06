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
>
> **IPC transport 契約更新時の cross-cutting 追補**:
> - `references/ipc-contract-checklist.md`（契約変更の横断チェック）
> - `indexes/quick-reference.md`（channel / DTO の早見表）
>
> **ドメイン仕様書の標準ブロック**:
> - `assets/phase12-domain-spec-sync-block-template.md`（各仕様書に `実装内容` / `苦戦箇所` / `5分解決カード` を同粒度で配置）

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

> `<domain-spec>.md` の構成は `assets/phase12-domain-spec-sync-block-template.md` を使い、`### 実装内容（要点）` / `### 苦戦箇所（再利用形式）` / `### 同種課題の5分解決カード` を同じタスクセクション内へ置く。

### 4.1 標準5仕様書の転記チェック（TASK-10A-C型）

| 仕様書 | 必須記載 | 担当SubAgent |
| --- | --- | --- |
| `interfaces-agent-sdk-skill.md` | 実装した型/API契約、苦戦箇所、同種課題の簡潔解決手順 | A |
| `api-ipc-agent.md` | request/response/validation、苦戦箇所、同種課題の簡潔解決手順 | B |
| `security-electron-ipc.md` | sender/P42/構造/サニタイズ、苦戦箇所、同種課題の簡潔解決手順 | C |
| `task-workflow.md` | 完了記録、検証証跡、SubAgent分担、苦戦箇所 | D |
| `lessons-learned.md` | 再発条件付きの苦戦箇所、同種課題の簡潔解決手順 | E |

> 上記5仕様書は同一ターンで更新し、`task-workflow.md` の対象タスク節に SubAgent 分担表を転記する。
>
> IPC transport 契約を更新する場合は、上記に加えて `references/ipc-contract-checklist.md` と `indexes/quick-reference.md` も同一ターンで同期する。

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

## 6. 同種課題の5分解決カード（必須）

### 6.1 カード本体（コピペ用）

| 項目 | 記入内容 |
| --- | --- |
| 対象課題 | `<TASK-ID>` |
| 症状（1行） | `<今回の再発症状を1行で記述>` |
| 根本原因（1行） | `<再発条件を含む原因>` |
| 最短手順 | `1) 実体固定 2) 仕様是正 3) 画面証跡 4) 未タスク監査 5) 台帳同期` |
| 検証ゲート | `<13/13, 28項目, links, current=0 など>` |
| 同期先3点 | `<task-workflow / lessons-learned / domain-spec or ui-ux-feature>` |

### 6.2 最短5ステップ

1. `<変更範囲を標準5責務（interfaces/api-ipc/security/task/lessons）またはUI6責務（ui-ux-components/ui-ux-feature/arch-ui/arch-state/task/lessons）へ分離する>`
2. `<実装 + 契約 + セキュリティを同一ターンで同期する>`
3. `<未タスクがある場合は docs/30-workflows/unassigned-task/ に10見出し（## メタ情報 + ## 1..9）で作成し、完了移管後は docs/30-workflows/completed-tasks/unassigned-task/ へ移す>`
4. `<UIタスクは再撮影前に preview preflight（build成功 + 127.0.0.1:4173 疎通）を実施し、失敗時は未タスク化へ分離する>`
5. `<task spec 再確認が必要な場合は phase12-task-spec-recheck-template.md を使い、phase-12-documentation / outputs/phase-12 / implementation-guide / 未タスク10見出しの4点突合を先に完了する>`
6. `<outputs/phase-12/phase12-task-spec-compliance-check.md` を作成し、Task 12-1〜12-5 と Step 1-A〜1-G / Step 2 の根拠を1ファイルへ集約する>`
7. `<verify-all-specs / validate-phase-output / phase-11-manual-test必須節grep / verify-unassigned-links / audit --diff-from HEAD を実行し、検証値と苦戦箇所を task-workflow と lessons に同時転記する>`
8. `<UIタスクでは validate-phase11-screenshot-coverage を追加し、ユーザーが画面検証を要求した場合は対象 view 専用 harness + SCREENSHOT へ昇格する。全量 test:run が SIGTERM の場合は vitest 分割実行へフォールバックした記録を含めて、検証値と苦戦箇所を task-workflow と lessons に同時転記する>`
9. `<currentViolations=0` でも `baselineViolations>0` が残る場合は、feature差分と切り分けて `docs/30-workflows/unassigned-task/` に運用改善未タスクを作成し、`audit --diff-from HEAD --target-file` の `scope.currentFiles=1` と `audit --json` 単独の repo 全体参考値を分離記録する>`

---

## 7. 検証コマンド

| コマンド | 目的 | 期待結果 |
| --- | --- | --- |
| `rg --files .claude/skills \| rg 'verify-all-specs\|validate-phase-output\|verify-unassigned-links\|audit-unassigned-tasks'` | 監査スクリプト実体の事前解決 | 実体パスが確認できる |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-path> --strict` | ワークフロー仕様準拠確認 | `PASS` |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-path>` | Phase出力構造確認 | `PASS` |
| `rg -n '^\\| ステータス \\| completed' <workflow-path>/phase-12-documentation.md && rg -n '^- \\[x\\] Task 12-[1-5]' <workflow-path>/phase-12-documentation.md` | `phase-12-documentation.md` のメタ情報/Task 12-1〜12-5 完了同期を確認 | `ステータス=completed` と Task 12-1〜12-5 が `[x]` で一致する |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-a> --json && node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-b> --json` | 2workflow同時監査（構造） | 2件とも `PASS` |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-a> && node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-b>` | 2workflow同時監査（出力） | 2件とも `PASS` |
| `rg -n 'ipc-contract-checklist\\.md|quick-reference\\.md' <workflow-path>/outputs/phase-12/spec-update-summary.md <workflow-path>/outputs/phase-12/documentation-changelog.md` | IPC transport 契約変更時の cross-cutting doc 同期確認 | checklist / quick-reference の両方が検出される |
| `rg -n '^### 実装内容（要点）$|^### 苦戦箇所（再利用形式）$|^### 同種課題の5分解決カード$' <domain-spec-file>` | 対象ドメイン仕様書が標準ブロックを持つことを確認 | 3見出しが検出される |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` | 未タスクリンク整合確認 | `missing: 0` |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --target-file <unassigned-file>` | 対象未タスクの今回差分に対する形式/命名/配置監査 | `currentViolations: 0` かつ `scope.currentFiles: 1` |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` | 今回差分の未タスク監査 | `currentViolations: 0` |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD \| jq '{currentViolations: .currentViolations.total, baselineViolations: .baselineViolations.total}'` | 未タスク監査カウンタ（current/baseline）を転記用に固定 | current/baseline の確定値が取得できる |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json` | repo 全体の baseline 監視値を確認 | `currentViolations` は参考値として扱う |
| `rg -n "<UT-ID>|<task-id>" docs/30-workflows/unassigned-task docs/30-workflows/completed-tasks/unassigned-task` | 未タスクの配置先判定（未完了/完了移管） | 未完了は `unassigned-task`、完了済みは `completed-tasks/unassigned-task` |
| `rg -n '^## メタ情報$|^## [1-9]\\. ' <unassigned-file>` | 10見出しの機械確認 | `## メタ情報` が1件、`## 1..9` が9件 |
| `rg -n '## Part 1|## Part 2|なぜ|必要|例え|interface|type|API|エッジケース|設定' <workflow-path>/outputs/phase-12/implementation-guide.md` | 実装ガイド Task 1 必須要素の簡易確認 | Part 1/Part 2 + 理由先行 + 日常例え + 型/API/エッジケース/設定語が検出される |
| `pnpm --filter @repo/desktop preview` | UI再撮影前の preview preflight（build成否確認） | `ready in ...` または build成功ログが確認できる |
| `curl -I http://127.0.0.1:4173` | UI再撮影前のローカル疎通確認 | `HTTP/1.1 200` 系応答 |
| `pnpm --filter @repo/desktop run screenshot:<feature>` | UI画面証跡の当日再撮影（UIタスクのみ） | 対象TCのスクリーンショットが再生成される |
| `pnpm --filter @repo/desktop test:run` | 回帰の全量実行（ベースライン確認） | `PASS` または `SIGTERM` 失敗ログが記録される |
| `pnpm --filter @repo/desktop exec vitest run <target-test-file>` | UI/Store/Main の再確認テストを非watchで実行 | プロセスが単発終了し証跡を固定できる |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow <workflow-path>` | TC単位の証跡紐付け検証（UIタスクのみ） | `PASS`（expected TC = covered TC） |
| `pnpm --filter @repo/desktop exec vitest run <target-test-file-1> <target-test-file-2>` | 全量実行が `SIGTERM` の場合の分割フォールバック | 対象回帰の合否が確定できる |
| `rg -o 'TC-[A-Za-z0-9-]*[0-9][A-Za-z0-9-]*' <workflow-path>/phase-11-manual-test.md <workflow-path>/outputs/phase-11/manual-test-checklist.md \| sort -u` | TC命名互換（`TC-XX` / `TC-UI-*`）の事前確認 | 対象TCが抽出される |
| `ls -la <workflow-path>/outputs/phase-11/screenshots` | UI画面証跡の存在確認（UIタスクのみ） | スクリーンショットが列挙される |
| `rg -n -e '^## 統合テスト連携$' -e '^## 成果物$' -e '^## 実行手順$' -e '^## 完了条件$' <workflow-path>/phase-11-manual-test.md` | Phase 11 必須節（統合テスト連携/成果物or実行手順/完了条件）確認 | 必須見出しが3種そろう |
| `ls -lt <workflow-path>/outputs/phase-11/screenshots` | UI再撮影証跡の鮮度確認（UIタスクのみ） | 最上位ファイルの更新時刻が当日である |
| `ps -ef \| rg "capture-.*phase11\|vite" \| rg -v rg || true` | UI再撮影後の残留プロセス確認（UIタスクのみ） | 不要プロセスが残留していない、または停止方針が記録済み |
| `node .claude/skills/skill-creator/scripts/quick_validate.js <skill-dir>` | スキル構造検証 | `error: 0` |

---

## 8. Phase 12 成果物チェック

- [ ] `implementation-guide.md`
- [ ] `spec-update-summary.md`
- [ ] `documentation-changelog.md`
- [ ] `unassigned-task-detection.md`（標準）
- [ ] 旧名 `unassigned-task-report.md` を新規作成していない（互換用途のみ・非推奨）
- [ ] `phase12-task-spec-compliance-check.md`（再確認時は必須、通常Phase 12でも推奨）
- [ ] `phase-12-documentation.md` が `ステータス=completed` で、Task 12-1〜12-5 のチェックが `[x]` になっている
- [ ] IPC transport 契約更新時は `references/ipc-contract-checklist.md` と `indexes/quick-reference.md` を同一ターンで同期している
- [ ] 更新したドメイン仕様書は `assets/phase12-domain-spec-sync-block-template.md` 準拠で `実装内容` / `苦戦箇所` / `5分解決カード` を持つ
- [ ] 未タスク指示書の見出しフォーマット（`## メタ情報` + `## 1..9`）確認
- [ ] `audit --diff-from HEAD --target-file` の `currentViolations: 0` を確認
- [ ] `audit --diff-from HEAD --target-file` を実行した場合、`scope.currentFiles: 1` まで確認している
- [ ] `audit --json` 単独実行の `currentViolations` は repo 全体参考値として分離記録している
- [ ] `verify-unassigned-links` / `audit --diff-from HEAD` の確定値（existing/missing/current/baseline）を `task-workflow.md` と `outputs/phase-12`（`spec-update-summary.md`/`unassigned-task-detection.md`）へ同値転記する
- [ ] `currentViolations=0` かつ `baselineViolations>0` の場合、feature差分とは別の運用改善未タスクを作成するか、作成不要理由を明記している
- [ ] 未タスクの配置先判定（未完了=`docs/30-workflows/unassigned-task/`、完了移管済み=`docs/30-workflows/completed-tasks/unassigned-task/`）を証跡化している
- [ ] 2workflow同時監査時は両workflowの `verify-all-specs` / `validate-phase-output` 証跡を記録
- [ ] `task-workflow.md` の対象タスク節へ「仕様書別SubAgent分担」表を転記する
- [ ] 仕様書別SubAgent実行ログ（実装内容/苦戦箇所/検証証跡）を `spec-update-summary.md` に記録する
- [ ] `task-workflow.md` / `lessons-learned.md` / `<domain-spec or ui-ux-feature-components.md>` の3点へ同一内容の「5分解決カード」を記録する
- [ ] UIタスクでは `phase-11-manual-test.md` に必須節（`統合テスト連携` / `成果物 or 実行手順` / `完了条件`）が存在する
- [ ] UIタスクでは再撮影前に preview preflight（build成功 + `127.0.0.1:4173` 疎通）を記録している
- [ ] UIタスクでは `validate-phase11-screenshot-coverage.js --workflow <workflow-path>` が `PASS` である
- [ ] UIタスクでは再撮影したスクリーンショット証跡（`outputs/phase-11/screenshots`）を記録し、更新時刻が当日である
- [ ] UI契約だけを確認したいタスクでは、専用 harness を使う理由と保存先を成果物へ記録している
- [ ] ユーザーが画面検証を要求した場合、初期方針が `NON_VISUAL` でも `SCREENSHOT` へ昇格し、`TC-ID ↔ png` を再同期している
- [ ] UIタスクで preflight が失敗した場合は、再撮影を継続せず未タスク化し、代替証跡の理由を記録している
- [ ] UIタスクでは `manual-test-result.md` / `screenshot-coverage.md` の時刻記録が実ファイル `stat` と整合する
- [ ] UIタスクでは再撮影後に残留プロセス（`vite` / `capture-*`）を確認し、必要なら停止している

---

## 9. 最適なファイル形成（Phase 12 Step 2）

### 9.1 記述順序（固定）

1. `task-workflow.md`（完了台帳・検証証跡・苦戦箇所）
2. `<domain-spec>.md`（実装仕様と契約差分）
3. `lessons-learned.md`（再発条件付き教訓）

> UI機能実装では `ui-ux-components` / `ui-ux-feature-components` / `arch-ui-components` / `arch-state-management` を 2 と 3 の間に追加する。

### 9.2 各仕様書の必須ブロック（コピペ用）

```markdown
### 実装内容（要点）
- 変更範囲:
- 実装した要点:
- 完了根拠:

### 苦戦箇所（再利用形式）
| 苦戦箇所 | 再発条件 | 対処 | 標準ルール |
| --- | --- | --- | --- |
|  |  |  |  |

### 同種課題の5分解決カード（最短手順）
1.
2.
3.
4.
5.
```

> 実際の貼り付けには `assets/phase12-domain-spec-sync-block-template.md` を優先し、この節のブロックは簡易版として扱う。

### 9.3 ファイル形成チェック

- [ ] 仕様書ごとに `実装内容` と `苦戦箇所` の両方が存在する
- [ ] 更新した domain spec が `phase12-domain-spec-sync-block-template.md` の3見出しを満たす
- [ ] `task-workflow.md` と `lessons-learned.md` の検証値（verify/validate/links/audit）が一致する
- [ ] 3仕様書（`task-workflow.md` / `lessons-learned.md` / `<domain-spec or ui-ux-feature-components.md>`）で5分解決カードの5ステップ順序が一致する
- [ ] UIタスクでは `manual-test-result.md` の時刻と `screenshots/*.png` の `stat` が一致する
- [ ] `currentViolations` を合否、`baselineViolations` を監視値として分離記録している
- [ ] UIタスクで coverage が warning になった場合、`manual-test-checklist` 代替や `画面カバレッジマトリクス` 未記載などの理由を成果物へ明記している
- [ ] テスト再確認時に `pnpm test` を使わず、`pnpm --filter @repo/desktop exec vitest run ...` で非watch実行している
- [ ] `apps/desktop` 全量 `test:run` が `SIGTERM` の場合、失敗ログと分割実行結果の両方を記録している
- [ ] テンプレート本文の重複行（同一手順番号重複、同一検証コマンド重複）がないことを確認している
