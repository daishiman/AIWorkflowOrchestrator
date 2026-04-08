# パターン集: 成功パターン - 実装・IPC・OAuth・UI

> 元ファイル: `patterns.md` から分割
> 読み込み条件: IPC統合、OAuth、UIコンポーネント、テスト実行の実装パターンを参照したい時。

## 仕様書修正タスクの「差分監査」と「全体監査」分離（UT-SKILL-IPC-PRELOAD-EXTENSION-001）

- **状況**: Phase 12で未タスク監査を行う際、リポジトリ全体には既存違反が多く、今回変更分の判定が埋もれる
- **問題**: `audit-unassigned-tasks.js` を全体実行すると既存違反が大量に出力され、今回タスク固有の漏れ（Open Item）を見落としやすい
- **解決パターン**:
  1. **全体監査**を実行してベースライン件数を記録する（運用健全性確認）
  2. **差分監査**として今回ワークフロー成果物・Open Itemを個別再判定する
  3. 差分で未解決があれば未タスク指示書を新規作成し、`task-workflow.md` 残課題へ登録する
  4. `verify-unassigned-links.js` で参照整合を最終確認する
- **効果**:
  - 全体ノイズに影響されず、今回タスク分の漏れを確実に是正できる
  - 「未タスク0件」の誤判定を防げる
- **発見日**: 2026-02-25
- **関連タスク**: UT-SKILL-IPC-PRELOAD-EXTENSION-001

## scoped監査の判定軸固定（UT-FIX-SKILL-EXECUTE-INTERFACE-001 再確認）

- **状況**: `audit-unassigned-tasks.js --json --target-file <path>` 実行時、baseline違反が大量に出力されて対象ファイルが fail に見えやすい
- **問題**: `--target-file` は「対象のみ表示」ではなく「current/baseline 分類」であるため、表示件数だけで判断すると誤判定する
- **解決パターン**:
  1. `scope.currentFiles` が対象ファイルを指していることを確認
  2. `currentViolations.total` を今回判定の正本にする
  3. `baselineViolations.total` は別枠で記録し、今回タスクの fail 判定に直結させない
- **効果**:
  - 対象ファイルが準拠済み（current=0）かを安定して判定できる
  - baseline負債による誤差し戻しを防止できる
- **発見日**: 2026-02-25
- **関連タスク**: UT-FIX-SKILL-EXECUTE-INTERFACE-001

## Phase 12 UI再確認の証跡固定（TASK-UI-00-ORGANISMS）

- **状況**: UIコンポーネント実装タスクで、Phase 12再確認時に「成果物存在確認」だけで完了判定しやすい
- **問題**: 画面証跡時刻や `manual-test-result.md` の更新が同期されず、再監査で証跡鮮度の差し戻しが発生する
- **解決パターン**:
  1. `verify-all-specs` + `validate-phase-output` + `validate-phase11-screenshot-coverage` を同一ターンで実行する
  2. `pnpm run screenshot:<feature>` 実行後、`stat` でスクリーンショット実時刻を取得して `manual-test-result.md` と同期する
  3. `verify-unassigned-links` + `audit --diff-from HEAD` を連続実行し、`currentViolations=0` を合否基準に固定する
  4. `phase12-task-spec-compliance-check.md` を作成し、Task 1〜5 + Step 1-A〜1-E + Step 2 の判定を1ファイルに集約する
- **効果**:
  - Phase 12の完了根拠（構造/出力/UI証跡/未タスク監査）を一元化できる
  - UI再撮影後の時刻ドリフトを抑止できる
- **発見日**: 2026-03-04
- **関連タスク**: TASK-UI-00-ORGANISMS

## Phase 12準拠確認と親仕様参照ガード（TASK-043B）

- **状況**: Phase 12 の Task 12-1〜12-5 と Step 1-A〜1-G / Step 2 が複数成果物へ分散し、完了根拠を一目で確認しづらい
- **問題**:
  1. `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` を横断しないと準拠確認が閉じない
  2. `verify-all-specs` が `../task-*.md` 参照を見逃すと、親仕様ブリッジ欠落が Phase 12 後半まで残りやすい
- **解決パターン**:
  1. `outputs/phase-12/phase12-task-spec-compliance-check.md` を追加し、Task 12-1〜12-5 と Step 1-A〜1-G / Step 2 の判定を 1 ファイルへ集約する
  2. `verify-all-specs.js` で `task-*.md` と `../task-*.md` の参照実在も検証し、親仕様ブリッジ欠落を早期検出する
  3. 未タスクが 0 件でも `verify-unassigned-links` / `audit --diff-from HEAD` の結果を compliance check に明記する
- **効果**:
  - Phase 12 準拠確認の入口が 1 ファイルに集約される
  - workflow ディレクトリと親仕様ファイルの二重導線ドリフトを機械検証で塞げる
- **発見日**: 2026-03-06
- **関連タスク**: TASK-043B

## Phase 12 root evidence + workflow 正本集約（UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001）

- **状況**: Task 12-1〜12-5 の成果物は揃っていても、system spec 側の実装内容・苦戦箇所・screen evidence が複数仕様へ散ると、Phase 12 の完了根拠と再利用入口が別々になりやすい
- **問題**:
  1. `system-spec-update-summary.md` と system spec を別々に読まないと「何を実装し、どこで苦戦したか」が追えない
  2. Phase 12 の準拠確認を報告しても、同種課題の初動で参照入口が定まらない
- **解決パターン**:
  1. `outputs/phase-12/phase12-task-spec-compliance-check.md` を root evidence として追加し、Task 12-1〜12-5 / Step 1-A〜1-G / Step 2 を 1 ファイルへ集約する
  2. 実装内容と苦戦箇所が 6 仕様書以上へ広がる follow-up task では、`aiworkflow-requirements/references/workflow-<feature>.md` を新規作成し、SubAgent 分担、5分解決カード、検証コマンドもまとめて残す
  3. `resource-map.md` / `quick-reference.md` / `SKILL.md` に workflow 正本の入口を追加し、仕様更新後の再利用経路を固定する
  4. `quick_validate.js` 3件、`verify-unassigned-links`、`audit --target-file`、screen verification の結果を compliance check と verification report の両方へ転記する
- **効果**:
  - Phase 12 完了判定と system spec 再利用入口が分離しない
  - 同種課題の再開時に「どこから読むべきか」の探索コストを下げられる
- **発見日**: 2026-03-13
- **関連タスク**: UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001

## `phase-12-documentation.md` 完了同期パターン（TASK-9H）

- **状況**: `outputs/phase-12` の成果物5件が揃っていても、`phase-12-documentation.md` のメタ情報と完了条件チェックが `未実施` のまま残ることがある
- **問題**: 実体成果物とタスク仕様書の状態が乖離し、Phase 12 再監査で「未実施」と誤判定される
- **解決パターン**:
  1. `implementation-guide/system-spec-update-summary/documentation-changelog/unassigned-task-detection/skill-feedback-report` の存在を先に確認する
  2. `phase-12-documentation.md` のステータスを `完了` に更新する
  3. Step 1-A〜Step 3 と完了条件チェックリストを同一ターンで同期更新する
  4. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` の結果を `system-spec-update-summary.md` に記録する
- **効果**:
  - Phase 12 の「成果物実体」と「仕様書ステータス」の二重台帳不一致を防止できる
  - 監査時の差し戻し（未実施残置）を削減できる
- **発見日**: 2026-02-27
- **関連タスク**: TASK-9H

## completed workflow の planned wording ゼロ化（TASK-UI-04C）

- **状況**: `outputs/phase-12` の成果物と validator は揃っているのに、`phase-12-documentation.md` に `仕様策定のみ` や「実装・テストは保留」などの文言が残る
- **問題**: completed workflow を再監査したときに、本文だけを見ると未実施タスクのように誤読され、Step 1-B と Task 100% 実行確認が崩れる
- **解決パターン**:
  1. `phase-12-documentation.md` に対して `rg -n "仕様策定のみ|実行予定|保留として記録"` を実行し、残置文言を 0 件にする
  2. completed workflow では「実装・テスト・Phase 11/12 は完了、保留は Phase 13 のみ」のように実績ベースで書き換える
  3. 完了条件チェックリストと `Task 100% 実行確認` の `[ ]` を `[x]` へ同期する
  4. 是正結果を `system-spec-update-summary.md` と `phase12-task-spec-compliance-check.md` にも反映する
- **効果**:
  - completed workflow の本文と成果物台帳が同じ状態を示す
  - Phase 12 再監査時に「成果物はあるが本文は未実施」という差し戻しを防止できる
- **発見日**: 2026-03-11
- **関連タスク**: TASK-UI-04C-WORKSPACE-PREVIEW

## Phase 12 タスク仕様準拠の4点突合（TASK-UI-01-E）

- **状況**: `outputs/phase-12` とシステム仕様更新が揃っていても、`phase-12-documentation.md` の完了同期、実装ガイド必須要件、未タスク指示書フォーマット、監査値転記のどれかが後追いでずれやすい
- **問題**: 「Phase 12 実行済み」と報告しても、Task 12-1〜12-5 の要件と実績値が1ファイルに閉じず、再監査で数値や配置先の差し戻しが起こる
- **解決パターン**:
  1. `phase-12-documentation.md` の `ステータス=completed`、Task 12-1〜12-5、Task 100% 実行確認を `outputs/phase-12` の7成果物と1対1で突合する
  2. `implementation-guide.md` は `## Part 1` / `## Part 2`、理由先行、日常例え、TypeScript 型/API/エッジケース/設定語を `rg` で確認する
  3. 未タスクは `docs/30-workflows/unassigned-task/` の物理配置、`## メタ情報 + ## 1..9` の10見出し、`audit --json --diff-from HEAD --target-file`、`verify-unassigned-links` を同一ターンで確認する
  4. `system-spec-update-summary.md` / `phase12-compliance-recheck.md` / `unassigned-task-detection.md` / `task-workflow.md` に同一の実測値を転記する
- **効果**:
  - Phase 12 完了判定の根拠を「仕様書・成果物・未タスク・検証値」の4面で固定できる
  - follow-up 更新後の warning 件数や `current/baseline` の誤記を防止できる
- **発見日**: 2026-03-06
- **関連タスク**: TASK-UI-01-E-INTEGRATION-GATE-SPEC-SYNC

## `validate-phase-output` の引数仕様固定（位置引数）

- **状況**: Phase検証時に `verify-all-specs` と同形式のオプション（`--phase` など）を想定しやすい
- **問題**: `validate-phase-output.js` は workflow ディレクトリの位置引数のみ受け付けるため、誤用で検証が止まる
- **解決パターン**:
  1. `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/<workflow>` を固定テンプレート化
  2. `verify-all-specs --workflow` とコマンドペアで使い、役割を分離（仕様整合 / 出力構造）
  3. Phase 12記録には両コマンドの結果を併記する
- **効果**:
  - コマンド誤用による再監査のやり直しを削減できる
  - 検証証跡の比較可能性が上がる
- **発見日**: 2026-02-25
- **関連タスク**: UT-FIX-SKILL-EXECUTE-INTERFACE-001

## Phase 12 テスト件数ドリフト再同期パターン（TASK-9E）

- **状況**: Phase 6 以降にテストが追加された後、Phase 5-11 成果物と正本仕様に旧件数（例: 57, 32+25）が残る
- **問題**: 成果物と仕様台帳の件数が不一致になり、再監査で差し戻しが発生する
- **解決パターン**:
  1. 正本件数を `task-workflow.md` に固定し、内訳（Service/IPC）を併記する
  2. `rg -n "57|32 \\+ 25|SkillForker 32"` で TASK文脈の旧値を抽出する
  3. Phase時点値が必要な文書は「Phase時点値 + 最終値併記」で更新する
  4. 更新後に `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` を実行する
  5. 再発要因が残る場合は `docs/30-workflows/unassigned-task/` に9セクション形式で未タスク化する
- **効果**:
  - 件数ドリフトを局所的に是正できる
  - Phase 12 完了証跡の整合性を維持できる
- **発見日**: 2026-02-28
- **関連タスク**: TASK-9E

---

## 大規模テスト実行時のVitest Worker対策（TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE）

- **状況**: 9000+テストを含む大規模テストスイート実行時
- **問題**: Vitest Workerが予期せず終了し、テスト結果が不完全になる
- **原因**: メモリ消費やタイムアウトが原因と推定
- **解決策**:
  | 対策 | コマンド/設定 | 効果 |
  | ---- | ------------ | ---- |
  | テスト分割実行 | `pnpm vitest run apps/desktop/src/main/services/skill/` | 対象を絞って安定実行 |
  | ワーカー数制限 | `--poolOptions.workers.max=4` | メモリ消費を抑制 |
  | 並列実行無効化 | `--no-file-parallelism` | 安定性優先 |
- **効果**: 大規模テストスイートでも安定した実行結果を得られる
- **発見日**: 2026-02-08
- **関連タスク**: TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE
- **関連Pitfall**: P22（06-known-pitfalls.md）

## 未タスク仕様書への実装課題継承パターン（TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE）

- **状況**: Phase 12で未タスク指示書を作成する際
- **パターン**: 親タスクで苦戦した箇所を「実装課題と解決策」セクションとして未タスク仕様書に追記
- **構成**:

  ```markdown
  ## 実装課題と解決策（{{PARENT_TASK_ID}}からの学び）

  ### {{PITFALL_ID}}: {{タイトル}}

  **問題**: {{問題の説明}}
  **教訓**: {{得られた教訓}}
  **解決策**: {{解決策}}
  **本タスクへの適用**: {{このタスクでどう活かすか}}
  ```

- **効果**:
  - 将来の実装者が同じ問題に遭遇した際の対処法を事前に把握
  - 06-known-pitfalls.mdとの連携による知見の再利用
  - タスク間での学びの継承
- **発見日**: 2026-02-08
- **関連タスク**: TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE

## IPCチャンネル統合パターン（TASK-FIX-4-1-IPC-CONSOLIDATION）

- **状況**: 重複したIPCチャンネル定義を統合・整理する場合
- **苦戦箇所と解決策**:

  | 苦戦箇所               | 問題                                                             | 解決策                                                    |
  | ---------------------- | ---------------------------------------------------------------- | --------------------------------------------------------- |
  | ハードコード発見       | `"skill:complete" as string`で型チェック・ホワイトリストバイパス | Grepで`as string`パターンを検索し、IPC_CHANNELS定数に置換 |
  | 重複定義整理           | preload/channels.ts vs shared/ipc/channels.tsの重複              | Single Source of Truth（preload/channels.ts）に集約       |
  | ホワイトリスト更新漏れ | ALLOWED_INVOKE_CHANNELSに旧チャンネルが残存                      | テストで旧チャンネルが含まれていないことを検証            |

- **検出コマンド**:
  ```bash
  # ハードコード文字列の検出
  grep -rn '"skill:' apps/desktop/src/preload/
  grep -rn 'as string' apps/desktop/src/preload/skill-api.ts
  ```
- **効果**:
  - 型安全性向上（コンパイル時にチャンネル名検証）
  - セキュリティ強化（ホワイトリストバイパス防止）
  - 保守性向上（定義箇所が単一）
- **発見日**: 2026-02-05
- **関連タスク**: TASK-FIX-4-1-IPC-CONSOLIDATION

## TASK-FIX-5-1: SkillAPI二重定義統一

**カテゴリ**: IPC Bridge / Preload API

**成功パターン**:

| パターンID | パターン名 | 説明 | 参照 |
|-----------|-----------|------|------|
| FIX-5-1-S1 | 正本参照パターン | 重複記述を削除し、単一ファイルへの参照リンクで統一 | [architecture-implementation-patterns.md](../../aiworkflow-requirements/references/architecture-implementation-patterns.md) |
| FIX-5-1-S2 | IPCチャンネル数矛盾解消 | 歴史的経緯を注記で説明し、最新参照先を明示 | [interfaces-agent-sdk-skill.md](../../aiworkflow-requirements/references/interfaces-agent-sdk-skill.md) |
| FIX-5-1-S3 | クロスリファレンス表 | P23-P28と実装パターンS1-S5の対応表を追加 | [06-known-pitfalls.md](../../../.claude/rules/06-known-pitfalls.md) |

**失敗パターン**:

| パターンID | パターン名 | 問題 | 回避策 |
|-----------|-----------|------|--------|
| FIX-5-1-F1 | safeInvoke/safeOn 3箇所分散 | 同一内容が3ファイルに分散し、更新時に矛盾発生 | 正本を1箇所に決め、他は参照リンクに |
| FIX-5-1-F2 | IPCチャンネル数不一致（8 vs 13） | 歴史的経緯で数値が異なり混乱 | 注記で経緯を説明、最新値を明示 |
| FIX-5-1-F3 | completed-tasksパス未更新 | タスク完了後もパスが旧形式のまま | 完了時にリンクパスを一括更新 |

## Phase 12 Task 2完全チェックリスト（task-imp-search-ui-001）

- **状況**: Phase 12 Task 2（システム仕様書更新）実行時
- **パターン**: Step 1-A〜1-D + Step 2の全ステップを個別にチェック
- **チェックリスト**:
  | Step | チェック項目 | 更新対象 |
  | ---- | ------------ | -------- |
  | 1-A | タスク完了記録 | 該当仕様書（ui-ux-\*.md等） |
  | 1-A | LOGS.md更新 | **aiworkflow-requirements/LOGS.md** |
  | 1-A | LOGS.md更新 | **task-specification-creator/LOGS.md** |
  | 1-A | SKILL.md変更履歴 | **aiworkflow-requirements/SKILL.md** |
  | 1-A | SKILL.md変更履歴 | **task-specification-creator/SKILL.md** |
  | 1-B | 実装状況テーブル | api-endpoints.md等（該当する場合） |
  | 1-C | 関連タスクテーブル | Grepで検索して確認 |
  | 1-D | topic-map.md再生成 | `node generate-index.js` 実行 |
  | 2 | システム仕様更新 | 新規インターフェース追加時のみ |
- **効果**: documentation-changelog.mdに各Stepの結果を記録することで漏れを防止
- **発見日**: 2026-02-04
- **関連タスク**: task-imp-search-ui-001

## UX改善タスクの構造化（R-ID方式）

- **状況**: 複数のUX改善機能を1タスクで実装する場合
- **パターン**: 各改善点にR1/R2/R3...のようなRequirement IDを付与
- **例**（TASK-3-2-A）:
  - R1: ローディングアニメーション（スピナー表示）
  - R2: タイムスタンプ表示（相対時刻）
  - R3: クリップボードコピー（ワンクリック）
- **効果**:
  - 要件の追跡が容易
  - テストケースとの対応が明確
  - ドキュメントでの参照が統一
- **発見日**: 2026-01-27
- **関連タスク**: TASK-3-2-A

## Part 1概念説明の日常例えパターン

- **状況**: Phase 12 Part 1（中学生レベル）ドキュメント作成時
- **パターン**: 各技術概念に日常生活の身近な例えを対応付ける
- **例**（TASK-3-2-A）:
  | 技術概念 | 日常の例え |
  | -------------------- | ---------------------- |
  | ローディングスピナー | 電子レンジの回る皿 |
  | 相対時刻表示 | LINEのメッセージ時刻 |
  | クリップボードコピー | コピー機のコピーボタン |
- **効果**: 専門用語なしで概念が伝わる
- **発見日**: 2026-01-27
- **関連タスク**: TASK-3-2-A

## ユーティリティ関数の独立分離

- **状況**: コンポーネント内の汎用ロジックを実装する場合
- **パターン**: ロジックをutils/配下の独立ファイルに分離
- **例**（TASK-3-2-A）:
  - `formatRelativeTime()` → `utils/formatTime.ts`
  - コンポーネントから import して使用
- **効果**:
  - 単体テストが容易（100%カバレッジ達成）
  - 再利用性向上
  - コンポーネントのシンプル化
- **発見日**: 2026-01-27
- **関連タスク**: TASK-3-2-A

## コンポーネント同階層ユーティリティファイル配置

- **状況**: 特定コンポーネント専用のフィルタロジックを分離する場合
- **パターン**: コンポーネントと同じディレクトリに`*Utils.ts`として配置（共通utils/ではなく）
- **例**（task-imp-permission-date-filter）:
  - `dateFilterUtils.ts` → `PermissionSettings/dateFilterUtils.ts`（PermissionHistoryFilter.tsx・PermissionHistoryPanel.tsxと同階層）
  - `getDateRangeStartDate()`, `filterByDateRange()` をエクスポート
  - 定数 `DAYS_IN_WEEK=7`, `DAYS_IN_MONTH=30` も同ファイルで管理
- **効果**:
  - コンポーネント固有ロジックの局所性が高い（Feature Cohesion）
  - テストファイルも`__tests__/dateFilterUtils.test.ts`として同階層に配置
  - 22テストケース（境界値・1000件パフォーマンス含む）で98.5%カバレッジ
- **判断基準**: 2ファイル以上で使われるが同機能グループ内→同階層、プロジェクト横断→共通utils/
- **発見日**: 2026-02-02
- **関連タスク**: task-imp-permission-date-filter

## 順次フィルタパイプライン（useMemo チェーン）

- **状況**: 複数の独立したフィルタ条件を組み合わせてリストをフィルタリングする場合
- **パターン**: `useMemo`内で条件ごとに順次フィルタを適用するパイプライン
- **例**（task-imp-permission-date-filter）:
  1. toolNameフィルタ（定義時のみ適用）
  2. decisionフィルタ（定義時のみ適用）
  3. dateRangeフィルタ（`filterByDateRange()`で適用）
- **効果**:
  - 各フィルタが独立しており追加・削除が容易
  - 新フィルタ追加時は既存コードに影響なし（Open-Closed原則）
  - `useMemo`の依存配列で最小限の再計算
- **発見日**: 2026-02-02
- **関連タスク**: task-imp-permission-date-filter

## 将来改善候補の未タスク仕様書変換

- **状況**: Phase 12未タスク検出で「将来改善候補」を発見した場合
- **パターン**: 0件判定後も「将来改善候補」を正式な未タスク仕様書に変換
- **手順**:
  1. Phase 12で「将来改善候補（任意）」として記録
  2. 正式な未タスク仕様書を`unassigned-task/`に作成
  3. unassigned-task-detection.mdに参照リンクを追加
- **例**（TASK-3-2-A）:
  - TASK-3-2-A-EXT-001: タイムスタンプ自動更新
  - TASK-3-2-A-EXT-002: コピーアニメーション強化
  - TASK-3-2-A-EXT-003: UXテキスト多言語対応
- **効果**: 改善アイデアが正式に追跡され、優先度付けされる
- **発見日**: 2026-01-27
- **関連タスク**: TASK-3-2-A

## 親タスク苦戦箇所の事後未タスク化（TASK-UI-04C follow-up）

- **状況**: Phase 12 完了時点では task 内修正で閉じたため `新規未タスク 0件` と判定したが、後から親タスクの苦戦箇所が cross-cutting guard として再利用価値を持つと判断した場合
- **パターン**: 親タスクの苦戦箇所を新規未タスクへ formalize し、`unassigned-task-detection.md` / `spec-update-summary.md` / `documentation-changelog.md` を 0→1 へ再同期する
- **手順**:
  1. 親タスクの `苦戦箇所` と `5分解決カード` から、feature 内修正で閉じたものと共通ガードへ昇格すべきものを分離する
  2. `docs/30-workflows/unassigned-task/` に 9セクション形式の未タスク指示書を作成し、`3.5 実装課題と解決策` に親タスク教訓を転記する
  3. `task-workflow.md` と関連仕様書へ同一 ID を登録し、`verify-unassigned-links` を実行する
  4. 親 workflow の `unassigned-task-detection.md` / `spec-update-summary.md` / `documentation-changelog.md` / 必要に応じて `phase12-task-spec-compliance-check.md` を同じ件数へ更新する
- **例**（TASK-UI-04C）:
  - `UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001`
  - fuzzy no-match、renderer timeout+retry、parse/transport 分離を preview/search 共通ガードへ昇格
- **効果**:
  - 「task 内で直した」ことと「次回の初動短縮に必要な共通ガード」を分けて追跡できる
  - Phase 12 成果物の 0件判定が後日 stale になるのを防げる
  - 親タスクの苦戦箇所を未タスクへ転記する判断基準が明確になる
- **発見日**: 2026-03-11
- **関連タスク**: TASK-UI-04C-WORKSPACE-PREVIEW

## React Contextによる一括更新パターン

- **状況**: 多数のコンポーネントで共有する値を定期的に更新する場合
- **パターン**: Providerで一元管理し、Context経由で配信
- **例**（TASK-3-2-C）:
  - `TimestampProvider`: 現在時刻を管理
  - `useTimestampContext`: 子コンポーネントで時刻取得
  - 単一の`setInterval`で全MessageTimestampを一括更新
- **効果**:
  - タイマーは1つのみ（パフォーマンス最適化）
  - 全コンポーネントが同期した時刻を参照
  - テストが容易（Provider差し替えでモック可能）
- **発見日**: 2026-01-28
- **関連タスク**: TASK-3-2-C

## 動的更新間隔の適応的最適化

- **状況**: 相対時刻表示の更新間隔を最適化する場合
- **パターン**: 経過時間に応じて更新間隔を動的に調整
- **例**（TASK-3-2-C）:
  | 経過時間 | 更新間隔 | 理由 |
  | ---------- | --------- | -------------------------------- |
  | 1分未満 | 1秒ごと | 「X秒前」表示に必要 |
  | 1分〜1時間 | 1分ごと | 「X分前」表示で十分 |
  | 1時間以上 | 1時間ごと | 「X時間前」表示で十分 |
- **実装**:
  - `calculateUpdateInterval(timestamp, now)`: 単一タイムスタンプ用
  - `calculateMinUpdateInterval(timestamps, now)`: 複数タイムスタンプ用
- **効果**: 必要十分な更新頻度でCPU使用率を最小化
- **発見日**: 2026-01-28
- **関連タスク**: TASK-3-2-C

## Page Visibility APIによるリソース最適化

- **状況**: タブ非表示時に不要な処理を停止する場合
- **パターン**: `usePageVisibility`フックで可視状態を監視し、非表示時は処理停止
- **例**（TASK-3-2-C）:
  - `usePageVisibility()` → `boolean`（true=表示中）
  - `document.visibilitychange`イベントを監視
  - 非表示時は`useInterval`のdelayを`null`に設定
- **効果**:
  - バックグラウンドタブでのCPU使用ゼロ
  - バッテリー消費削減（モバイル/ラップトップ）
  - ブラウザのパフォーマンス最適化に貢献
- **発見日**: 2026-01-28
- **関連タスク**: TASK-3-2-C

## OAuth Implicit FlowのURLフラグメントパース（TASK-FIX-GOOGLE-LOGIN-001）

- **状況**: OAuth Implicit Flowでのコールバック処理時
- **パターン**: URLフラグメント（#）からパラメータを抽出
- **問題**: `url.search`（?以降）ではなく`url.hash`（#以降）にトークン/エラーが返される
- **実装**:
  ```typescript
  const url = new URL(callbackUrl);
  const params = new URLSearchParams(url.hash.slice(1)); // #を除去
  const error = params.get("error");
  const accessToken = params.get("access_token");
  ```
- **注意点**:
  - OAuth Implicit Flow: `#`（hash）にパラメータ
  - OAuth Authorization Code Flow: `?`（search）にパラメータ
  - PKCE実装時はAuthorization Code Flowに変更されるため`url.search`を使用
- **効果**: OAuthコールバックのエラーパラメータを正しく検出・ハンドリング
- **発見日**: 2026-02-05
- **関連タスク**: TASK-FIX-GOOGLE-LOGIN-001

## Zustandリスナー二重登録防止パターン（TASK-FIX-GOOGLE-LOGIN-001）

- **状況**: Zustand storeの`subscribe()`でIPCリスナーを設定する場合
- **問題**: React StrictModeでuseEffectが2回実行され、リスナーが二重登録される
- **パターン**: モジュールスコープのフラグでガード
- **実装**:

  ```typescript
  // authSlice.ts
  let authListenerRegistered = false;

  export const setupAuthStateListener = () => {
    if (authListenerRegistered) return;
    authListenerRegistered = true;

    window.api?.onAuthStateChange((payload) => {
      // リスナー処理
    });
  };

  // テスト用リセット関数
  export const resetAuthListenerFlag = () => {
    authListenerRegistered = false;
  };
  ```

- **テスト時の注意**:
  - モジュールスコープ変数はテスト間で共有される
  - `beforeEach`で`resetAuthListenerFlag()`を呼び出す
- **効果**: React StrictModeでもリスナーが1回だけ登録される
- **発見日**: 2026-02-05
- **関連タスク**: TASK-FIX-GOOGLE-LOGIN-001

## IPC経由のエラー情報伝達設計（TASK-FIX-GOOGLE-LOGIN-001）

- **状況**: Main→Renderer間でOAuthエラー情報を伝達する場合
- **問題**: AUTH_STATE_CHANGEDペイロードにerror情報が含まれておらず、Rendererでエラー表示不可
- **パターン**: ペイロードにerror/errorCodeフィールドを追加
- **実装**:

  ```typescript
  // Main Process (index.ts)
  mainWindow.webContents.send("auth:state-changed", {
    user: session?.user ?? null,
    isAuthenticated: !!session?.user,
    error: errorMessage ?? null, // 追加
    errorCode: mappedError?.code, // 追加
  });

  // Renderer (authSlice.ts)
  window.api?.onAuthStateChange((payload) => {
    if (payload.error) {
      set({ error: payload.error, errorCode: payload.errorCode });
    }
  });
  ```

- **効果**: OAuthエラー時にRendererで適切なエラーメッセージを表示可能
- **発見日**: 2026-02-05
- **関連タスク**: TASK-FIX-GOOGLE-LOGIN-001
