# Lessons Learned（教訓集） / workflow / quality lessons

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: workflow / quality lessons

## TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001: Phase 12実行監査（2026-02-28）

### 苦戦箇所: 成果物が存在しても `artifacts.json` ステータスが未同期になりやすい

| 項目             | 内容                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 課題             | `outputs/phase-12` の必須成果物5件が存在していても、`artifacts.json` の `phases.12.status` が `pending` のまま残りやすい |
| 再発条件         | ファイル存在確認だけで Phase 12 の完了判定を行う場合                                                                     |
| 原因             | 「成果物実体」と「台帳ステータス」を別工程で管理し、同時突合していなかった                                               |
| 対処             | 監査時に `outputs/phase-12` と `artifacts.json` を同時確認し、乖離を明示記録した                                         |
| 今後の標準ルール | 完了判定は `成果物実体 + artifacts status + チェックリスト同期` の三点セットを必須化する                                 |

### 苦戦箇所: `audit-unassigned-tasks` の baseline と current を混同しやすい

| 項目             | 内容                                                                            |
| ---------------- | ------------------------------------------------------------------------------- |
| 課題             | `--json` 単体実行の違反件数（baseline）を、今回差分の違反件数と誤認しやすい     |
| 再発条件         | `--diff-from` を使わずに合否を判定した場合                                      |
| 原因             | 監視目的（baseline）と合否目的（current）の使い分けが曖昧だった                 |
| 対処             | `--diff-from HEAD` を併用し、`currentViolations.total` を合否基準として固定した |
| 今後の標準ルール | 監査結果は `current`（合否）と `baseline`（監視）を必ず分離して記録する         |

### 苦戦箇所: `phase-12-documentation.md` のチェックリスト未同期

| 項目             | 内容                                                                         |
| ---------------- | ---------------------------------------------------------------------------- |
| 課題             | 検証コマンドがPASSでも、実行仕様書のチェック項目が未チェックのまま残りやすい |
| 再発条件         | 成果物作成と仕様書更新を別ターンで進める場合                                 |
| 原因             | 実体証跡の更新後に、手順書側の完了状態を同期する運用が固定されていなかった   |
| 対処             | 検証証跡を `task-workflow.md` と `lessons-learned.md` に同一ターン反映した   |
| 今後の標準ルール | Phase 12 は「実体証跡・仕様書チェック・教訓記録」の同時更新で完了とする      |

### 苦戦箇所: 仕様書別SubAgent分担で非対象仕様の扱いが揺れる

| 項目             | 内容                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 課題             | 仕様書別に担当を切っても、更新不要な仕様書（interfaces/api-ipc/securityなど）の省略理由が残らず、再確認時に漏れと区別しづらい |
| 再発条件         | 仕様書別SubAgent分担を適用したが、非対象仕様の記録欄がないテンプレートを使う場合                                              |
| 原因             | 「担当あり/更新なし」の判断を文章でしか残しておらず、機械的な確認軸がなかった                                                 |
| 対処             | `phase12-system-spec-retrospective-template.md` に N/A判定ログ（対象/非対象/理由/代替証跡）を追加した                         |
| 今後の標準ルール | SubAgent分担では全仕様書の判定（更新 or N/A）を必ず表形式で残す                                                               |

### 同種課題の簡潔解決手順（5ステップ）

1. `verify-all-specs` と `validate-phase-output` で Phase 構造を先に確定する。
2. `outputs/phase-12` の必須成果物5件と `artifacts.json` ステータスを同時に確認する。
3. `audit-unassigned-tasks --diff-from HEAD` で `currentViolations` を合否基準に固定し、baselineは別管理する。
4. 仕様書別SubAgent分担を作成し、更新不要な仕様書は `N/A + 理由 + 代替証跡` を記録する。
5. 実装内容と苦戦箇所を `task-workflow.md` と `lessons-learned.md` へ同一ターンで同期する。

### 派生未タスク（継続改善）

| タスクID                                 | 目的                                                                 | 配置先                                                                                            |
| ---------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001 | Phase 12 での N/A 判定ログ固定と三点突合運用を機械確認まで引き上げる | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-subagent-na-log-guard-001.md` |

---

## UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001: quick_validate 空フィールドガード

### 苦戦箇所: Phase 12 実行済みでもチェックリスト同期が漏れる

| 項目             | 内容                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 課題             | `outputs/phase-12` の成果物は揃っているのに、`phase-12-documentation.md` の完了条件が未チェックで残り、実行状況が不明瞭になる |
| 再発条件         | 成果物作成と実行仕様書更新を別ターンで進める場合                                                                              |
| 原因             | 成果物作成と手順書更新を別ターンで扱い、「実体」と「宣言」を同時同期していなかった                                            |
| 対処             | 完了判定時に `phase-12-documentation.md` の Task 1-5 / Task 100% 実行確認チェックを一括同期した                               |
| 今後の標準ルール | Phase 12 は「成果物実体 + 実行仕様書チェック」の2条件を同時に満たして完了とする                                               |

### 苦戦箇所: 完了移管後に親タスク証跡へ旧 `unassigned-task` 参照が残る

| 項目             | 内容                                                                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 課題             | 子タスクの未タスク指示書を `completed-tasks/` へ移しても、親タスク配下の `artifacts.json` / `minor-issues.md` に旧参照が残る |
| 再発条件         | 子タスクのみを更新対象にして親タスク証跡を再確認しない場合                                                                   |
| 原因             | 完了移管の対象を「該当タスク本人」だけに限定し、親タスク証跡の追従更新を忘れやすい                                           |
| 対処             | 旧参照文字列をキーに `rg` で横断検索し、親タスク証跡3ファイルを同時更新した                                                  |
| 今後の標準ルール | 完了移管は「子タスク移動 + 親タスク証跡更新 + リンク監査」を同一ターンで実施する                                             |

### 苦戦箇所: 検証スクリプトの所在誤認

| 項目             | 内容                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------- |
| 課題             | `verify-all-specs.js` などを `aiworkflow-requirements/scripts` で実行しようとして失敗する |
| 再発条件         | コマンド実行前にスクリプト実体を確認しない場合                                            |
| 原因             | 監査系スクリプトが `task-specification-creator/scripts` に集約されている前提が曖昧だった  |
| 対処             | 先に `rg --files` でスクリプト実体を解決し、正しいパスで再実行した                        |
| 今後の標準ルール | Phase 12 の検証は「実体探索 → 実行」の順序を固定し、実行コマンドを証跡へ残す              |

### 同種課題の簡潔解決手順（5ステップ）

1. `phase-12-documentation.md` と `outputs/phase-12/*` を突合し、完了チェック未同期を解消する。
2. 完了移管した未タスクIDで `rg -n "task-imp-<id>.md"` を実行し、親タスク証跡の旧参照を一括更新する。
3. 監査スクリプトは `task-specification-creator/scripts` を正本として `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` を実行する。
4. `task-workflow.md` と `lessons-learned.md` に実装内容・苦戦箇所・再利用手順を同時追記する。
5. 最終確認として `quick_validate.js` と `verify-unassigned-links.js` を再実行し、構造/リンク整合を確定する。

---

## TASK-9J-skill-analytics: Phase 12再確認（2026-02-28）

### 仕様書別SubAgent分担（5仕様書同期）

| SubAgent | 担当仕様書                                 | 主担当作業                                       | 完了条件                               |
| -------- | ------------------------------------------ | ------------------------------------------------ | -------------------------------------- |
| A        | `references/interfaces-agent-sdk-skill.md` | 型定義8種 + Preload API 5メソッドの契約同期      | API名/型/戻り値が実装一致              |
| B        | `references/api-ipc-agent.md`              | IPC 5チャネルの request/response/validation 同期 | チャネル表と実装状況が一致             |
| C        | `references/security-electron-ipc.md`      | sender/P42/許可値リスト/エラー正規化を同期       | セキュリティ要件の欠落ゼロ             |
| D        | `references/task-workflow.md`              | 完了台帳・成果物・検証証跡・苦戦箇所を同期       | 実装内容 + 教訓 + 証跡を同一ターン更新 |
| E        | `references/lessons-learned.md`            | 再発条件付き教訓と簡潔解決手順を固定化           | 同種課題で再利用できる手順が明記       |

### 仕様反映先（5点セット）

| 仕様書                                     | TASK-9Jで反映した内容                                 |
| ------------------------------------------ | ----------------------------------------------------- |
| `references/interfaces-agent-sdk-skill.md` | 型定義8種、Preload API 5メソッド、完了記録            |
| `references/api-ipc-agent.md`              | 5チャネル契約、実装状況、完了記録                     |
| `references/security-electron-ipc.md`      | validateIpcSender / P42 / 許可値リスト / エラー正規化 |
| `references/task-workflow.md`              | 完了台帳、成果物、苦戦箇所、検証証跡                  |
| `references/lessons-learned.md`            | 再発条件付き苦戦箇所、簡潔解決手順                    |

### 苦戦箇所: IPCハンドラ実装後の登録配線漏れ

| 項目             | 内容                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| 課題             | `skillAnalyticsHandlers.ts` を実装しても、`ipc/index.ts` 側の登録が漏れると機能が起動しない        |
| 再発条件         | 新規IPC追加時に「ハンドラ実装」と「登録配線」を別作業として扱う場合                                |
| 原因             | 実装完了をハンドラファイル単体で判定し、起動経路まで確認していなかった                             |
| 対処             | `registerSkillAnalyticsHandlers` を `ipc/index.ts` に追加し、DI初期化（Store/Service）と同時に接続 |
| 今後の標準ルール | IPC追加時は `handler` / `register` / `preload` の3点を完了条件に固定する                           |

### 苦戦箇所: analytics責務の重複実装

| 項目             | 内容                                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| 課題             | `skillHandlers.ts` と `skillAnalyticsHandlers.ts` に analytics 実装が分散し、契約差分が発生しやすい |
| 再発条件         | 段階導入で旧ハンドラを残したまま新ハンドラを追加した場合                                            |
| 原因             | 責務境界（どのファイルを正本にするか）が未固定                                                      |
| 対処             | analytics責務を `skillAnalyticsHandlers.ts` に一本化し、重複コードを削除                            |
| 今後の標準ルール | 同一チャネル群の実装は1ファイル1責務に統一し、重複実装を残さない                                    |

### 苦戦箇所: Preload API名の仕様ドリフト

| 項目             | 内容                                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| 課題             | 文書の `recordAnalytics` 記述と実装の `analyticsRecord` が混在し、利用側が誤実装しやすい                          |
| 再発条件         | 実装後に仕様書更新を段階分割し、命名確認を後回しにした場合                                                        |
| 原因             | 命名の正本（Preload API実装）に対する最終突合が不足                                                               |
| 対処             | `skill-api.ts` を正本として `api-ipc-agent.md` / `interfaces-agent-sdk-skill.md` / Phase 12成果物を同一ターン同期 |
| 今後の標準ルール | IPC命名は「実装正本→仕様書同期」の一方向で管理し、逆方向編集を禁止する                                            |

### 同種課題の簡潔解決手順（4ステップ）

1. 新規IPCは `handler`・`register(index.ts)`・`preload` を同時確認し、1つでも未反映なら未完了と判定する。
2. 重複ハンドラを検出したら責務を1ファイルに集約し、古い経路を削除して契約の正本を固定する。
3. 命名は `skill-api.ts` を正本にして仕様書へ一括同期し、用語ドリフトを残さない。
4. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` を通してから完了とする。

---

## TASK-9G-skill-schedule: Phase 12再確認（2026-02-27）

### 苦戦箇所: 監査スクリプトを誤ディレクトリで実行しやすい

| 項目             | 内容                                                                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題             | `scripts/verify-all-specs.js` などをプロジェクト直下で実行し、`MODULE_NOT_FOUND` になる                                                                   |
| 再発条件         | 実行前にスクリプト実体パスを確認しない場合                                                                                                                |
| 原因             | 監査系スクリプトが `task-specification-creator/scripts` に集約されている運用が浸透していない                                                              |
| 対処             | `rg --files .claude/skills \| rg 'verify-all-specs\|validate-phase-output\|verify-unassigned-links\|audit-unassigned-tasks'` で正本パスを確定してから実行 |
| 今後の標準ルール | Phase 12再確認は「実体探索 → 検証実行」を固定順序にする                                                                                                   |

### 苦戦箇所: `audit-unassigned-tasks` の baseline と current を混同しやすい

| 項目             | 内容                                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| 課題             | baseline違反件数が多いと、今回差分の合否が不明瞭になる                                              |
| 再発条件         | `currentViolations` を見ずに total件数で判定した場合                                                |
| 原因             | 全体監査と差分監査の目的を分離せずに結果を解釈した                                                  |
| 対処             | 合否判定を `currentViolations` 固定にし、`baselineViolations` は既存課題として別管理                |
| 今後の標準ルール | `audit-unassigned-tasks.js --json --diff-from HEAD` の出力は `currentViolations` のみで完了判定する |

### 苦戦箇所: 未タスクは「存在」だけ確認して「形式」を見落としやすい

| 項目             | 内容                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------- |
| 課題             | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` に配置されていても、テンプレート見出し不足で品質が落ちる |
| 再発条件         | リンク存在チェックだけで完了判定した場合                                                      |
| 原因             | 配置検証とフォーマット検証を別タスクとして扱っていた                                          |
| 対処             | UT-9G-001〜005 を対象に `## メタ情報` + `## 1..9` の10見出しを機械確認                        |
| 今後の標準ルール | 未タスク確認は「配置 + 見出しフォーマット」を同時にPASSさせる                                 |

### 同種課題の簡潔解決手順（4ステップ）

1. 監査コマンド前に `rg --files` で実体パスを確定する。
2. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` を順に実行する。
3. 監査合否は `currentViolations` を正本にし、baselineは改善バックログとして分離する。
4. 未タスクは `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` 配置確認と `## メタ情報 + ## 1..9` 見出し確認を同時に実行する。

---

## TASK-9I-skill-docs: Phase 12再確認（2026-02-28）

### 苦戦箇所: `audit-unassigned-tasks --target-file` の結果が過剰にfailへ見える

| 項目             | 内容                                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| 課題             | 対象ファイルは準拠でも baseline 違反件数が同時出力され、今回差分が fail に見えやすい                     |
| 再発条件         | `currentViolations` を確認せず、全体件数のみで判定した場合                                               |
| 原因             | scoped監査（current判定）と全体監査（baseline監視）を分離せずに報告した                                  |
| 対処             | `--target-file` 出力は `currentViolations.total` を合否基準に固定し、baseline は既存課題として別記録した |
| 今後の標準ルール | 監査結果は必ず `current/baseline` を2列で記録し、今回差分判定を先に確定する                              |

### 苦戦箇所: Phase 12再確認の証跡が散在しやすい

| 項目             | 内容                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| 課題             | 検証結果が `documentation-changelog` / コマンドログ / 口頭報告に分散し、再確認時に追跡コストが高い |
| 再発条件         | 検証コマンドの実行順と記録先を固定しない場合                                                       |
| 原因             | 証跡を「実行都度追記」に任せ、台帳側の集約ルールを先に決めていなかった                             |
| 対処             | `task-workflow.md` に「再確認結果テーブル」を設け、verify/validate/links/audit を1表に集約した     |
| 今後の標準ルール | Phase 12再確認は「1表で証跡化」を完了条件にする                                                    |

### 苦戦箇所: 未タスクは存在確認のみで形式確認が漏れやすい

| 項目             | 内容                                                                                           |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| 課題             | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` にファイルがあっても、9セクション形式崩れを見落としやすい |
| 再発条件         | `ls` による存在確認だけで完了判定した場合                                                      |
| 原因             | 配置検証・見出し検証・監査判定を別工程として扱った                                             |
| 対処             | UT-9I-001/002 で `10見出し（メタ情報 + 1..9）` と `メタ情報見出し件数=1` を機械確認した        |
| 今後の標準ルール | 未タスク確認は「配置 + 見出し + current判定」の3点セットで完了判定する                         |

### 同種課題の簡潔解決手順（4ステップ）

1. `verify-all-specs` と `validate-phase-output` を先に実行し、Phase整合を固定する。
2. `verify-unassigned-links` で台帳リンク切れを排除してから未タスク監査に進む。
3. `audit --target-file` は `currentViolations.total` で合否判定し、baseline は別枠で記録する。
4. `task-workflow.md` と `lessons-learned.md` に「実装内容 + 苦戦箇所 + 再利用手順」を同一ターンで同期する。

### 同種課題の即時実行コマンドセット（TASK-9I再利用）

```bash
# 1) Phase仕様・成果物整合
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/TASK-9I-skill-docs --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-9I-skill-docs

# 2) 未タスク参照整合
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

# 3) 対象未タスク監査（移管前のみ）
# 注: completed-tasks/<task>/unassigned-task へ移管後は --target-file の対象外運用とし、
#     今回差分判定は Step 4（--diff-from HEAD）で実施する

# 4) 差分監査（今回変更のみ）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

---

## UT-IMP-PHASE12-EVIDENCE-LINK-GUARD-001: Phase 12 再確認証跡・未タスクリンク整合ガード（2026-02-28）

### 苦戦箇所: 未タスクリンクのワイルドカード参照が false fail を生む

| 項目             | 内容                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| 課題             | 未タスクディレクトリ配下を指すワイルドカード参照は、実体があってもリンク監査で missing 扱いになる |
| 再発条件         | 台帳にワイルドカード参照を残したまま `verify-unassigned-links` を実行した場合                     |
| 原因             | 監査は実体ファイルパス判定であり、ワイルドカード展開を前提にしていない                            |
| 対処             | 台帳参照を実体ファイル参照へ置換し、`verify-unassigned-links` を再実行して missing 0 を確認       |
| 今後の標準ルール | 未タスクリンクはワイルドカード禁止、実体パスのみ許可する                                          |

### 苦戦箇所: `--target-file` 監査の baseline を今回差分と誤読しやすい

| 項目             | 内容                                                                         |
| ---------------- | ---------------------------------------------------------------------------- |
| 課題             | `current=0` でも baseline 併記により fail と誤判定しやすい                   |
| 再発条件         | `currentViolations.total` を見ずに総件数で判定した場合                       |
| 原因             | scoped監査（今回差分）と baseline（既存負債）の判定軸が分離されていなかった  |
| 対処             | 合否は `currentViolations.total` 固定、baseline は監視値として別列管理に統一 |
| 今後の標準ルール | 監査記録は必ず `current/baseline` 2列で保存する                              |

### 苦戦箇所: 再確認テーブル値が更新後にドリフトしやすい

| 項目             | 内容                                                  |
| ---------------- | ----------------------------------------------------- |
| 課題             | links件数などの証跡値が最新コマンド結果とずれる       |
| 再発条件         | 検証実行と台帳更新を別ターンで実施した場合            |
| 原因             | コマンド結果転記が完了条件に含まれていなかった        |
| 対処             | 検証実行→台帳転記→差分監査を同一ターンで連続実行      |
| 今後の標準ルール | Phase 12 は「実行結果の転記完了」までを完了条件にする |

### 同種課題の簡潔解決手順（5ステップ）

1. `rg -n "docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/\\*\\.md"` でワイルドカード参照を検出し、実体パスへ置換する。
2. `verify-all-specs` と `validate-phase-output` を実行して Phase 構造を先に固定する。
3. `verify-unassigned-links` で missing を 0 にする。
4. `audit --target-file` / `audit --diff-from HEAD` を実行し、合否は `currentViolations.total` で判定する。
5. `task-workflow.md` と `lessons-learned.md` に検証値・苦戦箇所・再利用手順を同一ターンで同期する。

---

## UT-FIX-TS-VITEST-TSCONFIG-PATHS-001: Vitest alias と tsconfig paths の同期自動化

### タスク概要

| 項目        | 内容                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------- |
| タスクID    | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001                                                       |
| 目的        | `vite-tsconfig-paths` 導入で Vitest alias 手動同期を廃止し、4設定整合チェック運用を安定化 |
| 完了日      | 2026-02-24                                                                                |
| ステータス  | **完了**                                                                                  |
| 関連Pitfall | P3, P4, P43                                                                               |

### 苦戦箇所1: Phase 12未タスク検出ソースの網羅漏れ

| 項目 | 内容                                                                                                |
| ---- | --------------------------------------------------------------------------------------------------- |
| 課題 | `unassigned-task-report.md` が5検出ソース前提に対し、4ソース中心の記述になり監査観点が欠落した      |
| 原因 | TODO/FIXME・`.skip`・Phase 10中心に確認し、Phase 3/11の明示記録が弱かった                           |
| 対処 | レポートを5ソース固定（Phase 3/10/11 + TODO/FIXME + `.skip`）へ再構成し、各ソースの判定根拠を明文化 |
| 教訓 | Phase 12 Task 4は「検出件数」より先に「検出ソース網羅」をチェックする                               |

### 苦戦箇所2: validate-phase-output のセクション終端依存

| 項目 | 内容                                                                                |
| ---- | ----------------------------------------------------------------------------------- |
| 課題 | `validate-phase-output.js` のセクション抽出が終端依存実装で誤判定リスクを持っていた |
| 原因 | JavaScript環境で終端表現に依存した実装を使っていた                                  |
| 対処 | `content + sentinel heading` 方式へ変更し、見出し境界のみで抽出する実装へ修正       |
| 教訓 | Markdown抽出は「終端文字」ではなく「次見出し」を境界にする                          |

### 苦戦箇所3: 全体監査結果と今回差分の混同

| 項目 | 内容                                                                                                          |
| ---- | ------------------------------------------------------------------------------------------------------------- |
| 課題 | `audit-unassigned-tasks` の既存違反（67件/5件）を今回タスク起因と誤認しやすかった                             |
| 原因 | 全体健全性監査と変更差分監査を同じ文脈で扱った                                                                |
| 対処 | 全体監査結果はベースラインとして分離記録し、今回差分は `verify-unassigned-links` と対象ファイル個別確認で判定 |
| 教訓 | 「repo全体」と「今回対象」の判定軸を分離しないと優先順位が崩れる                                              |

### 同種課題の簡潔解決手順（5ステップ・再監査版）

1. Phase 12 Task 4の5検出ソースをチェックリスト化し、漏れなく実行記録する
2. 検証スクリプトの抽出ロジックは見出し境界ベースで実装し、終端依存を避ける
3. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` をセットで実行する
4. `audit-unassigned-tasks` は全体ベースラインとして扱い、今回差分判定を別で記録する
5. lessons/LOGS/SKILL/Phase成果物を同一タスクIDで同日同期し、追跡可能性を閉じる

---

