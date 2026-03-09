# Phase 12 仕様書別SubAgent同期テンプレート

## 1. 対象タスク

| 項目 | 記入内容 |
| --- | --- |
| タスクID | `<TASK-ID>` |
| 実装対象 | `<実装ファイル/機能>` |
| 監査対象workflow | `<workflow-a>`（必須） / `<workflow-b>`（必要時） |
| 反映対象仕様書 | `interfaces / api-ipc / security / task-workflow / lessons / (+ domain-ui-spec if needed)` |
| 実行日 | `<YYYY-MM-DD>` |

## 2. SubAgent分担（仕様書単位）

| SubAgent | 担当仕様書 | 主担当作業 | 完了条件 |
| --- | --- | --- | --- |
| SubAgent-A | `references/interfaces-*.md` | 型定義・Preload API契約同期 | 実装型と仕様型の差分ゼロ |
| SubAgent-B | `references/api-ipc-*.md` | IPCチャネル契約（request/response/validation）同期 | チャネル表・実装状況表が実装一致 |
| SubAgent-C | `references/security-*.md` | sender/P42/許可値/エラー境界の同期 | セキュリティ要件の欠落ゼロ |
| SubAgent-D | `references/task-workflow.md` | 完了記録・成果物・検証証跡・苦戦箇所同期 | 実装内容 + 証跡 + 苦戦箇所が同一ターンで記録済み |
| SubAgent-E | `references/lessons-learned.md` | 苦戦箇所の再利用可能化 | 再発条件付きで簡潔解決手順が記録済み |

### 2.1 UI機能実装プロファイル（TASK-UI-05型）

| SubAgent | 担当仕様書 | 主担当作業 | 完了条件 |
| --- | --- | --- | --- |
| SubAgent-A | `references/ui-ux-components.md` | 主要UI一覧・完了タスク・導線同期 | UI正本へ反映済み |
| SubAgent-B | `references/ui-ux-feature-components.md` | 機能仕様・未タスク・苦戦箇所同期 | 機能仕様と再利用手順が記録済み |
| SubAgent-C | `references/arch-ui-components.md` | 構造責務境界の同期 | レイヤー境界が整合 |
| SubAgent-D | `references/arch-state-management.md` | 状態管理責務の同期 | 状態境界が整合 |
| SubAgent-E | `references/task-workflow.md` | 完了台帳・検証証跡・残課題同期 | 実装 + 証跡 + 未タスクが同一ターン記録済み |
| SubAgent-F | `references/lessons-learned.md` | 再発条件付き教訓の同期 | 苦戦箇所と簡潔手順が再利用可能 |

#### 2.1.1 UIドメイン追加仕様（必要時）

| SubAgent | 担当仕様書 | 主担当作業 | 完了条件 |
| --- | --- | --- | --- |
| SubAgent-G+ | `references/<ui-domain-spec>.md` | ドメイン固有 UI 正本（例: `ui-ux-navigation.md`）の同期 | 実装内容 + 苦戦箇所 + 再利用手順が追記済み |

### 2.2 再確認（2workflow同時監査）プロファイル

| SubAgent | 担当範囲 | 主担当作業 | 完了条件 |
| --- | --- | --- | --- |
| SubAgent-A | `<workflow-a>` | `verify-all-specs` + `validate-phase-output` + Task 1/3/4/5 実体突合 | workflow-a の検証が全て PASS |
| SubAgent-B | `<workflow-b>` | `verify-all-specs` + `validate-phase-output` + Task 1/3/4/5 実体突合 | workflow-b の検証が全て PASS（不要時はN/A理由記録） |
| SubAgent-C | `docs/30-workflows/unassigned-task/` / `docs/30-workflows/completed-tasks/` / `docs/30-workflows/completed-tasks/unassigned-task/` | `verify-unassigned-links` + `audit --diff-from HEAD` + 10見出し確認 + 配置先判定 | `missing=0` かつ `currentViolations=0`、未実施は1つ目、完了済みUTは2つ目、3つ目は legacy のみ。`target-file` 監査は1つ目（未実施UT）に限定 |
| SubAgent-D | `references/task-workflow.md` | 2workflow証跡、苦戦箇所、簡潔解決手順の同期 | 監査結果が再利用可能形式で記録済み |
| SubAgent-E | `references/lessons-learned.md` | 再発条件付き教訓と標準ルールの同期 | 教訓が task-workflow と整合 |

### 2.3 Step 2 判定同期プロファイル（仕様更新タスク必須）

| SubAgent | 担当範囲 | 主担当作業 | 完了条件 |
| --- | --- | --- | --- |
| SubAgent-S2-A | `phase-12-documentation.md` | Step 2 更新対象（`arch/api/interfaces/security`）の要否判定を確定 | 更新対象に応じて Step 2 を `完了` / `該当なし` で説明可能 |
| SubAgent-S2-B | `outputs/phase-12/documentation-changelog.md` | Step 判定（1-A〜2）と理由を同期 | Step 2 判定が実装実体と一致 |
| SubAgent-S2-C | `outputs/phase-12/spec-update-summary.md` | Step 2 更新仕様書の一覧化と反映内容同期 | changelog の Step 2 判定と更新対象一覧が一致 |

### 2.4 仕様書別SubAgent実行ログ（必須）

| SubAgent | 担当仕様書 | 実装内容の反映先 | 苦戦箇所の反映先 | 検証証跡 |
| --- | --- | --- | --- | --- |
| SubAgent-A | `<spec-a>` | `<実装内容を反映した見出し>` | `<苦戦箇所を反映した見出し>` | `<verify/validate/links/audit/UI証跡>` |
| SubAgent-B | `<spec-b>` | `<実装内容を反映した見出し>` | `<苦戦箇所を反映した見出し>` | `<verify/validate/links/audit/UI証跡>` |
| SubAgent-C | `<spec-c>` | `<実装内容を反映した見出し>` | `<苦戦箇所を反映した見出し>` | `<verify/validate/links/audit/UI証跡>` |

> 全SubAgentで「実装内容」「苦戦箇所」の両方を埋めること。空欄は未完了扱い。

## 3. 各仕様書の必須記載

| 仕様書 | 必須記載 |
| --- | --- |
| interfaces | 実装内容、契約差分、後方互換方針、型公開面（package index） |
| api-ipc | チャネル一覧、引数/戻り値、実装状況、Preload対応メソッド |
| security | 検証要件、責務分離、許可値リスト、サニタイズ方針 |
| task-workflow | 完了記録、成果物、苦戦箇所、検証証跡、未タスク監査結果 |
| lessons-learned | 苦戦箇所、再発条件、原因、解決策、簡潔手順 |

UI機能実装時の必須記載（追加）:
- `ui-ux-components`: 完了タスク、関連未タスク、実装導線
- `ui-ux-feature-components`: 機能仕様、苦戦箇所、簡潔解決手順
- `arch-ui-components` / `arch-state-management`: UI構造・状態責務境界
- `ui-ux-navigation` などのドメイン固有 UI 正本: その機能に固有な契約・苦戦箇所・再利用手順

### 3.1 同種課題の5分解決カード同期ルール

- `task-workflow.md` / `lessons-learned.md` / `<domain-spec or ui-ux-feature-components.md>` の3仕様書に同一カードを記録する
- カードは「症状1行」「根本原因1行」「最短5ステップ」「検証ゲート」「同期先3点」を必須項目とする
- 5ステップは `実体固定→仕様是正→画面証跡→未タスク監査→台帳同期` の順序を固定し、並び替えを禁止する

## 4. IPC追加時の契約突合（必須）

| 観点 | 確認方法 | 完了条件 |
| --- | --- | --- |
| handler 実装 | `rg -n "skill:.*" apps/desktop/src/main/ipc` | 追加チャネルのハンドラが存在 |
| register 配線 | `rg -n "register.*Handlers" apps/desktop/src/main/ipc/index.ts` | 新規ハンドラが `registerAllIpcHandlers` に登録済み |
| preload 公開 | `rg -n "safeInvoke|safeInvokeUnwrap" apps/desktop/src/preload/skill-api.ts` | 全チャネルに対応する API が公開済み |
| service 公開境界 | `rg -n "services/<domain>/|export .* from \"./\"|SkillChain(Store|Executor)" apps/desktop/src/main` | 依存サービスのバレル公開（または未タスク移管）が記録されている |
| 回帰テスト運用 | `pnpm --filter @repo/desktop test:run`（失敗時は `vitest run <target>` 分割） | `SIGTERM` 時も分割実行で対象回帰の合否が確定できる |
| 仕様同期 | interfaces/api-ipc/security の3仕様書を同時更新 | 実装名・契約・検証要件のドリフトゼロ |

## 5. 検証コマンド

```bash
rg --files .claude/skills | rg 'verify-all-specs|validate-phase-output|verify-unassigned-links|audit-unassigned-tasks'
rg -n "register.*Handlers|skill:analytics|safeInvokeUnwrap" apps/desktop/src/main/ipc apps/desktop/src/preload/skill-api.ts
rg -n "services/skill/SkillChain(Store|Executor)|export .*SkillChain(Store|Executor)" apps/desktop/src/main
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-dir> --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-dir>
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-a> --json
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-b> --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-a>
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-b>
rg -n '^\\| ステータス \\| completed' <workflow-path>/phase-12-documentation.md
rg -n '^- \\[x\\] Task 12-[1-5]' <workflow-path>/phase-12-documentation.md
diff -u <workflow-path>/artifacts.json <workflow-path>/outputs/artifacts.json
node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow <workflow-path> --regenerate
rg -n '^\\| 12 \\| .* \\| .*完了' <workflow-path>/index.md
rg -n 'ステータス\\s*\\|\\s*pending' <workflow-path>/phase-{1,2,3,4,5,6,7,8,9,10,11}-*.md
rg -n '^\\| 2\\s+\\|' <workflow-path>/outputs/phase-12/documentation-changelog.md
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
rg -n "<UT-ID>|<task-id>" docs/30-workflows/unassigned-task docs/30-workflows/completed-tasks docs/30-workflows/completed-tasks/unassigned-task
pnpm --filter @repo/desktop preview
curl -I http://127.0.0.1:4173
pnpm --filter @repo/desktop test:run
pnpm --filter @repo/desktop exec vitest run <target-test-file-1> <target-test-file-2>
rg -o 'TC-[A-Za-z0-9-]*[0-9][A-Za-z0-9-]*' <workflow-path>/phase-11-manual-test.md <workflow-path>/outputs/phase-11/manual-test-checklist.md | sort -u
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow <workflow-path>
ls -la <workflow-path>/outputs/phase-11/screenshots
rg -n "screenshots/.*\\.png|NON_VISUAL:" <workflow-path>/outputs/phase-11/manual-test-result.md
ps -ef | rg "capture-.*phase11|vite" | rg -v rg || true
```

## 6. 完了チェック

- [ ] プロファイル選択（標準5仕様書 / UI機能6仕様書）が明記されている
- [ ] 5仕様書（interfaces/api-ipc/security/task-workflow/lessons）が同一ターンで更新されている
- [ ] UI機能の場合、`ui-ux-components` / `ui-ux-feature-components` / `arch-ui-components` / `arch-state-management` / `task-workflow` / `lessons-learned` を 1仕様書=1SubAgent で同一ターン更新している
- [ ] UIドメイン固有正本（例: `ui-ux-navigation.md`）がある場合、SubAgent-G+ を追加して同一ターン更新している
- [ ] `handler/register/preload` 三点突合が完了している
- [ ] IPC登録修正タスクでは `service 公開境界`（`services/*/index.ts` export）を確認し、未対応時は未タスク移管を記録している
- [ ] 変更履歴が各仕様書で更新されている
- [ ] 検証コマンド結果が `task-workflow.md` に記録されている
- [ ] `audit-unassigned-tasks --diff-from HEAD` の `currentViolations=0` を確認している
- [ ] 未タスクの配置先判定（未実施=`docs/30-workflows/unassigned-task/`、完了済みUT=`docs/30-workflows/completed-tasks/`、legacy=`docs/30-workflows/completed-tasks/unassigned-task/`）を記録している
- [ ] `audit --target-file` の対象が `docs/30-workflows/unassigned-task/` 配下であることを確認している
- [ ] 苦戦箇所と簡潔解決手順が `lessons-learned.md` に反映されている
- [ ] `task-workflow.md` / `lessons-learned.md` / `<domain-spec or ui-ux-feature-components.md>` の3点に同一の「5分解決カード」が同期されている
- [ ] 仕様書別SubAgent実行ログで、全担当の「実装内容 + 苦戦箇所 + 検証証跡」が記録されている
- [ ] 2workflow同時監査時は `workflow-a` / `workflow-b` の検証結果が両方記録されている
- [ ] UIタスクでは preview preflight（`pnpm --filter @repo/desktop preview` + `curl -I http://127.0.0.1:4173`）を再撮影前に記録している
- [ ] UIタスクでは TC命名互換（`TC-XX` / `TC-UI-*`）を事前確認し、coverage実行前に抽出結果を記録している
- [ ] UIタスクでは `validate-phase11-screenshot-coverage.js --workflow <workflow-path>` の `PASS` を記録している
- [ ] UIタスクではスクリーンショット証跡（`outputs/phase-11/screenshots`）を台帳に記録している
- [ ] UIタスクでは視覚TCの証跡列を `screenshots/*.png` 記法で記録している
- [ ] ユーザーが画面検証を要求した場合、初期方針が `NON_VISUAL` でも `SCREENSHOT` へ昇格し、`TC-ID ↔ png` を再同期している
- [ ] persist/auth 初期化バグでは bug path の metadata 証跡と screenshot harness 証跡を分離し、`skipAuth=true` を唯一経路にしていない
- [ ] UIタスクでは非視覚TCを `NON_VISUAL:` 記法で記録し、許容理由を明記している
- [ ] UIタスクでは再撮影後に残留プロセス（`vite` / `capture-*`）を確認し、必要なら停止している
- [ ] UIタスクで preflight 失敗時は再撮影を中断し、未タスク化と代替証跡理由を記録している
- [ ] UIタスクで coverage が warning になった場合、`manual-test-checklist` 代替や `画面カバレッジマトリクス` 未記載などの理由を成果物へ明記している
- [ ] `apps/desktop test:run` が `SIGTERM` の場合、失敗ログと `vitest run` 分割実行結果を同時に記録している
- [ ] `phase-12-documentation.md` が `ステータス=completed` で、Task 12-1〜12-5 が `[x]` で同期されている
- [ ] `artifacts.json` と `outputs/artifacts.json` が同一内容で同期されている
- [ ] `generate-index.js --workflow <workflow-path> --regenerate` 後の `index.md` が Phase 状態を正しく表示している
- [ ] completed 扱いの `phase-1..11` 本文仕様書に `pending` が残っていない
- [ ] `phase-12-documentation.md` の更新対象表と `documentation-changelog.md` の Step 2 判定が一致している
- [ ] `spec-update-summary.md` の更新対象一覧が Step 2 判定と一致している
- [ ] `audit --diff-from HEAD` の結果は `currentViolations` を合否、`baselineViolations` を監視として分離記録している
- [ ] 利用テンプレート（retrospective/subagent）の重複行（同一手順番号・同一コマンド）が解消されている

## 7. 最適なファイル形成（仕様書別）

### 7.1 仕様書単位の出力粒度

| 仕様書 | 最小構成（必須） |
| --- | --- |
| `task-workflow.md` | 実装内容、苦戦箇所、検証証跡、5分解決カード |
| `lessons-learned.md` | 苦戦箇所（再発条件付き）、5分解決カードテンプレート |
| `<domain-spec>.md` | 実装差分、契約/責務境界、再利用ルール、5分解決カード導線 |

### 7.2 記録整合チェック

- [ ] SubAgentごとに「実装内容 + 苦戦箇所 + 検証証跡」を同一行で記録している
- [ ] 仕様書間で検証値（13/13, 28項目, current=0 など）の値が一致している
- [ ] 3仕様書（`task-workflow.md` / `lessons-learned.md` / `<domain-spec or ui-ux-feature-components.md>`）で5分解決カードの5ステップ順序が一致している
- [ ] UIタスクでは画面証跡の時刻が仕様書間で一致している
