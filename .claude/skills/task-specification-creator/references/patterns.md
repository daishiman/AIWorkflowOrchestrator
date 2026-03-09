# Task Specification Creator パターン集

> フィードバックから発見された成功/失敗パターンを記録

---

## 📌 クイックナビゲーション

| カテゴリ                                                                                              | パターン数 | 説明                             |
| ----------------------------------------------------------------------------------------------------- | ---------- | -------------------------------- |
| [失敗パターン](#失敗パターン)                                                                         | 13件       | 回避すべきアンチパターン         |
| [成功パターン](#成功パターン)                                                                         | 50+件      | 再利用可能なベストプラクティス   |
| [ガイドライン](#ガイドライン)                                                                         | 6件        | 判断基準・検出パターン・Pitfall登録 |
| [フェーズ境界遷移](#フェーズ境界遷移パターンphase-boundary-transition)                                | 4件        | Phase間の成果物引き継ぎ          |
| [失敗回避](#失敗回避パターン)                                                                         | 3件        | よくある失敗の未然防止           |
| [単体テスト設計](#単体テスト設計パターンtask-8a)                                                      | 4件        | モック・カバレッジ戦略           |
| [E2Eテスト設計](#e2eテスト設計パターンtask-8c-b)                                                      | 3件        | Playwright安定化                 |
| [CI/DevOps最適化](#cidevops最適化パターン)                                                            | 2件        | GitHub Actions並列化             |
| [Main→Renderer IPC](#mainrenderer-ipc実装パターンtask-wce-monaco-001)                                 | 1件        | 逆方向通信パターン               |
| [サービス設計](#サービス設計パターンtask-9b-g)                                                        | 4件        | Facade・Script First             |
| [Zustand Store](#zustand-store-hooks無限ループ対策パターンut-fix-store-hooks-infinite-loop-001)      | 1件        | 無限ループ対策・useRefガード     |
| [IPC型不整合解決](#ipc型不整合解決パターンut-fix-skill-import-return-type-001)     | 2件        | IPC戻り値型変換・3層整合性確認   |

---

## 🚨 Phase 12 Task 2 クイックリファレンス

> **最重要**: Phase 12 Task 2は漏れが発生しやすい。以下を必ず確認。

| Step | 必須 | チェック項目       | 更新対象                                |
| ---- | ---- | ------------------ | --------------------------------------- |
| 1-A  | ✅   | タスク完了記録     | 該当仕様書（ui-ux-\*.md等）             |
| 1-A  | ✅   | LOGS.md更新        | **aiworkflow-requirements/LOGS.md**     |
| 1-A  | ✅   | LOGS.md更新        | **task-specification-creator/LOGS.md**  |
| 1-A  | ✅   | SKILL.md変更履歴   | **aiworkflow-requirements/SKILL.md**    |
| 1-A  | ✅   | SKILL.md変更履歴   | **task-specification-creator/SKILL.md** |
| 1-B  | △    | 実装状況テーブル   | api-endpoints.md等（該当する場合）      |
| 1-C  | △    | 関連タスクテーブル | `grep -rn "TASK_ID" references/` で検索 |
| 1-D  | ✅   | topic-map.md再生成 | `node generate-index.js` 実行           |
| 2    | △    | システム仕様更新   | 新規インターフェース追加時のみ          |

📖 詳細: [spec-update-workflow.md](./spec-update-workflow.md)

---

## 失敗パターン

### Markdown見出しレベルの誤検出

- **状況**: 検証スクリプトでMarkdownのH2セクション（`##`）を検出して処理範囲を区切る際
- **問題**: `/^##/` パターンがH3（`###`）やH4（`####`）にもマッチし、予期せずループが早期終了した
- **原因**: 正規表現 `/^##/` は「##で始まる」だけを検査し、その後の文字を考慮していないため
- **教訓**: H2のみを検出したい場合は `/^## [^#]/` または `/^## (?!#)/` を使用する
- **発見日**: 2026-01-24
- **修正ファイル**: `scripts/verify-all-specs.js` (Markdown解析部分) ※元のvalidate-phase12-step1.jsは統合済み

### validate-phase-output のセクション終端誤判定（UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 再監査）

- **状況**: `validate-phase-output.js` で「実行タスク」「完了条件」を抽出する際
- **問題**: 終端指定に `\z` を使っており、JavaScript正規表現では終端として解釈されず誤判定の温床になった
- **原因**: Ruby系正規表現の終端表記をNode.jsに持ち込んだ実装差異
- **解決策**: `content + sentinel heading` 方式に変更し、`(?=^##\s+)` のみでセクションを安定抽出
- **教訓**:
  1. Node.jsでは `\z` / `\Z` に依存しない
  2. Markdownセクション抽出は「終端見出しを付与してから切り出す」実装が安全
  3. 検証スクリプト自身の判定結果は、実ファイル内容と合わせて二重確認する
- **修正ファイル**: `.claude/skills/task-specification-creator/scripts/validate-phase-output.js`
- **発見日**: 2026-02-24

### validate-phase-output の `--phase` 引数ドリフト（TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 再監査）

- **状況**: template / guide / system spec が `validate-phase-output.js <workflow> --phase 12` を案内していた
- **問題**: 実スクリプトは workflow path の位置引数しか受け付けず、`--phase` を渡すと失敗する
- **原因**:
  1. 旧運用例がテンプレートへ残存した
  2. system spec 側の説明が template 側へ逆流した
  3. 再監査時に help 出力との突合を省略した
- **教訓**:
  1. CLI 例は `--help` 出力と同じターンで確認する
  2. template / guide / system spec の3点を同時更新する
  3. `validate-phase-output` は `node .../validate-phase-output.js <workflow-dir>` を正本とする
- **発見日**: 2026-03-09

### 未タスク検出後のtask-workflow.md登録漏れ（TASK-9B-G）

- **状況**: Phase 12で5件の未タスクを検出し、指示書を作成した
- **問題**: 指示書作成のみで完了と誤認し、task-workflow.mdの残課題テーブルへの登録を忘れた
- **原因**:
  1. 「指示書を作成した = 未タスク管理が完了」という誤った認識
  2. unassigned-task-guidelines.mdの「3ステップ必須」規定の見落とし
  3. documentation-changelog.mdに「完了」と記載したため、再検証をスキップ
- **発見経緯**: Phase 12完了後の検証で、task-workflow.mdに5件のエントリが存在しないことを発見
- **教訓**:
  1. 未タスク検出は**3ステップ全て**を完了して初めて完了: ①指示書作成 → ②task-workflow.md登録 → ③関連仕様書登録
  2. Phase 12完了前に必ずtask-workflow.mdの残課題テーブルを確認
  3. documentation-changelog.mdへの「完了」記載は3ステップ確認後に行う
- **修正**: task-workflow.md v1.13.0で5件追加、patterns.mdに成功パターンとして「未タスク検出→残課題テーブル登録3ステップパターン」を追加
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9B-G

### ネイティブモジュールNODE_MODULE_VERSION不一致（ENV-INFRA-001）

- **状況**: better-sqlite3がNODE_MODULE_VERSION不一致エラー（127 vs 131）で動作しない
- **問題**: pnpm storeに古いNode.jsバージョン用にコンパイルされたバイナリがキャッシュされ続ける
- **原因**:
  1. pnpm storeがネイティブモジュールのバイナリをNode.jsバージョンごとに区別しない
  2. `pnpm install`だけでは既存キャッシュを使い回してしまう
  3. 通常の再ビルドコマンド（`pnpm rebuild`）では解決しない場合がある
- **発見経緯**: Node.js 22.11.0 → 22.13.1更新後にElectronアプリ起動時に即座にクラッシュ
- **教訓**:
  1. NODE_MODULE_VERSION不一致は**pnpm store prune**でキャッシュクリアが必要
  2. その後**pnpm install --force**で再ビルドを強制
  3. .nvmrc/package.json engines/voltaの三重構造でバージョン管理する
  4. CONTRIBUTING.mdにトラブルシューティング手順を記載しておく
- **修正コマンド**:
  ```bash
  pnpm store prune
  pnpm install --force
  ```
- **発見日**: 2026-02-04
- **関連タスク**: ENV-INFRA-001

### Phase 12 Task 2 Step 1-A更新漏れ（task-imp-search-ui-001）

- **状況**: Phase 12 Task 2実行時、タスク完了記録をシステム仕様書に追加した
- **問題**: 以下の3つの必須更新を漏らした
  1. **LOGS.md×2ファイル更新漏れ**: aiworkflow-requirements/LOGS.mdのみ更新し、task-specification-creator/LOGS.mdを忘れた
  2. **SKILL.md変更履歴更新漏れ**: 両スキルの変更履歴にバージョン番号を追記しなかった
  3. **topic-map.md再生成漏れ**: 仕様書更新後にgenerate-index.jsを実行しなかった
- **原因**:
  1. spec-update-workflow.mdの「2ファイル両方更新」要件を見落とし
  2. Step 1-Dの「topic-map.md再生成」を確認せず完了と誤認
  3. documentation-changelog.mdのStep詳細記録が不完全だったため、漏れに気付けなかった
- **教訓**:
  1. Phase 12 Task 2は必ず**Step 1-A〜1-D + Step 2**の全ステップを個別に確認
  2. LOGS.mdは**aiworkflow-requirements + task-specification-creator**の**2ファイル**を更新
  3. SKILL.mdの変更履歴も更新対象（見落としやすい）
  4. 仕様書変更後はgenerate-index.jsで**topic-map.md再生成**が必須
  5. documentation-changelog.mdに各Stepの完了結果を詳細に記録することで漏れを可視化
- **修正**: 全7ファイル（LOGS.md×2、SKILL.md×2、ui-ux-search-panel.md、documentation-changelog.md、topic-map.md）を追加更新
- **発見日**: 2026-02-04
- **関連タスク**: task-imp-search-ui-001

### Phase 12出力要件の漏れ

- **状況**: タスク仕様書（phase-12-documentation.md）作成時
- **問題**: スキル仕様（phase-11-12-guide.md）で要求される出力ファイルがタスク仕様書に記載漏れ
- **漏れた要件**:
  1. `implementation-guide.md` Part 1（中学生レベル概念説明）
  2. `documentation-changelog.md`（システム仕様書更新履歴）
  3. `unassigned-task-detection.md`（0件でも必須）
- **原因**: タスク仕様書がスキル仕様の全要件を網羅していなかった
- **教訓**: Phase 12タスク仕様書作成時は必ずphase-11-12-guide.mdのTask 1-4を確認
- **発見日**: 2026-01-26
- **関連タスク**: TASK-3-1-D

### 未タスク配置ディレクトリの間違い（TASK-9B-I）

- **状況**: Phase 12 で UT-9B-I-001 を検出し指示書を作成した
- **問題**: 配置先を `docs/30-workflows/unassigned-task/` ではなく `docs/30-workflows/skill-import-agent-system/tasks/` に配置してしまった
- **原因**: 親タスクの tasks/ ディレクトリと混同し、「タスク仕様書を置く場所」と「未タスク指示書を置く場所」の区別が曖昧だった
- **教訓**:
  1. 未タスク指示書は必ず `docs/30-workflows/unassigned-task/` に配置する
  2. 親タスクの `docs/30-workflows/{feature-name}/tasks/` はタスク仕様書の配置先であり、未タスク指示書の配置先ではない
  3. 配置後に `ls docs/30-workflows/unassigned-task/` で物理ファイルの存在を検証する
- **発見日**: 2026-02-12
- **関連タスク**: TASK-9B-I-SDK-FORMAL-INTEGRATION
- **関連パターン**: P3（未タスク管理の3ステップ不完全）の派生

### テスト数の設計時固定値使用（TASK-9B-I）

- **状況**: Phase 4 で設計した想定テスト数「18」を Phase 12 まで使い続けた
- **問題**: 実装後の実際のテスト数は「13」であり、Phase 12 のドキュメントに不正確な数値が記載された
- **原因**:
  1. Phase 5（実装）でテストケースが統合・削減されたが、想定テスト数を更新しなかった
  2. Phase 12 作成時に実際のテストファイルを確認せず、Phase 4 の想定値をそのまま転記した
- **教訓**:
  1. Phase 12 では必ず `grep -c "it\\(" *.test.ts` で実際のテスト数をカウントする
  2. Phase 4 の想定テスト数はあくまで「設計時の見積もり」であり、最終的な数値ではない
  3. ドキュメントに記載するテスト数は常に実測値を使用する
- **発見日**: 2026-02-12
- **関連タスク**: TASK-9B-I-SDK-FORMAL-INTEGRATION
- **関連パターン**: P4（documentation-changelog への早期「完了」記載）と同類

### Phase 9/10/台帳のテスト件数ドリフト（TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001）

- **状況**: Phase 6 で回帰テストを増やした後、Phase 9・Phase 10・台帳の一部だけを更新した
- **問題**: ドキュメント間で `7 files / 264 tests` と `8 files / 267 tests` が混在した
- **原因**:
  1. 数値系証跡の更新をファイル単位で個別実施し、同一ターン同期をしなかった
  2. 最終確認時に旧値の機械検索（`rg "264|7ファイル"`）を省略した
- **教訓**:
  1. テスト件数は「最新実行ログ」を単一ソースに固定する
  2. Phase 6/9/10 + `task-workflow.md` を同時更新してから検証を再実行する
  3. 数値反映後に `rg "264|7ファイル"` で旧値残存0件を確認する
- **発見日**: 2026-03-04
- **関連タスク**: TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001

### 並列エージェント実行時のAPIレートリミット（TASK-9A-C）

- **状況**: Phase 1の4タスクを4つのSubAgentで同時実行した
- **問題**: 4エージェント中3つがAPI rate limitに到達し、エージェントが停止
- **原因**:
  1. 同一セッション内で4つのSubAgentが同時にAPI呼び出しを行った
  2. API側のレートリミットに同時接続数が抵触
  3. 4並列は上限に近く、安定実行の保証がない
- **教訓**:
  1. 並列エージェント数は**2-3が上限目安**（4以上はレートリミットリスクが高い）
  2. 重要度の高いタスクを先に実行し、残りを後続バッチで実行する
  3. ファイル書き込み完了後のレートリミットであればデータ損失はないが、書き込み中に発生すると成果物が不完全になる可能性がある
- **発見日**: 2026-02-19
- **関連タスク**: TASK-9A-C

### complete-phase.jsパス解決誤り（TASK-9A-C）

- **状況**: Phase完了処理で `node scripts/complete-phase.js` を実行した
- **問題**: モジュール未発見エラーが発生しスクリプトが実行できなかった
- **原因**:
  1. `scripts/complete-phase.js` はプロジェクトルートの `scripts/` ではなく、`.claude/skills/task-specification-creator/scripts/` に配置されている
  2. スキルスクリプトのパスとプロジェクトルートのパスを混同した
- **教訓**:
  1. スキルスクリプトは必ず `.claude/skills/{skill-name}/scripts/` パスで参照する
  2. `node scripts/xxx.js` ではなく `node .claude/skills/task-specification-creator/scripts/xxx.js` と完全パスで実行する
  3. スクリプト実行前にファイルの存在を `test -f` で確認する
- **発見日**: 2026-02-19
- **関連タスク**: TASK-9A-C

### マルチエージェントPhase実行の依存順序違反（UT-FIX-SKILL-REMOVE-INTERFACE-001）

- **状況**: Phase 1-12を5エージェント（Phase 1-3, 4-7, 8-10, 11, 12）に分割して全て並列ディスパッチ
- **問題**: Phase 4-7エージェントがPhase 1-3エージェントより先に完了。要件定義前に実装が進行した
- **原因**: Phase間の依存関係（Phase 1→2→3→4→...）を無視して全エージェントを同時ディスパッチ
- **解決**: ゲートPhase（Phase 3, Phase 10）の前後で並列化区間を分離。推奨: [1→2→3] → [4→5→6→7] → [8→9→10] → [11] → [12]
- **教訓**: 「並列実行できる部分」は依存関係チェーン内ではなく、チェーン間のTask並列化に限定する
- **発見日**: 2026-02-21
- **関連タスク**: UT-FIX-SKILL-REMOVE-INTERFACE-001
- **関連**: Phase 3（設計レビューゲート）、Phase 10（最終レビューゲート）

### worktree環境でのPhase 11手動テスト不可（UT-FIX-SKILL-REMOVE-INTERFACE-001）

- **状況**: Git worktree上でPhase 11（手動テスト）を実行しようとした
- **問題**: worktree環境ではElectronアプリの起動が不可能（node_modulesの共有制約等）
- **解決**: 自動テスト（vitest）で代替し、成果物に「worktree環境制約」を明記。Electron起動テストはmainマージ後に実施
- **教訓**: Phase 11仕様書にworktree環境用の代替テスト手順をデフォルトで含める
- **発見日**: 2026-02-21
- **関連タスク**: UT-FIX-SKILL-REMOVE-INTERFACE-001
- **関連**: Phase 11テンプレート改善候補

### カバレッジ閾値のスコープ解釈あいまいさ（UT-FIX-SKILL-REMOVE-INTERFACE-001）

- **状況**: Phase 7でskillHandlers.ts全体のLine Coverage 45.14%が最低基準80%を下回った
- **問題**: バグ修正タスクではファイル全体のカバレッジではなく修正対象関数のカバレッジで判定すべきだが、仕様書上の基準が不明確
- **解決**: skill:remove固有の分岐カバレッジ（全5分岐カバー済み）を別途記録し、PASS判定
- **教訓**: Phase 7テンプレートに「修正対象関数のBranch Coverage 100%」を追加判定基準として明記
- **発見日**: 2026-02-21
- **関連タスク**: UT-FIX-SKILL-REMOVE-INTERFACE-001
- **関連**: coverage-standards.md改善候補


### artifacts.json Phaseステータスの更新忘れ（UT-FIX-SKILL-IMPORT-INTERFACE-001）

- **状況**: 全Phase完了後に成果物を検証した
- **問題**: artifacts.json の全Phase statusが「pending」のまま残っていた
- **原因**:
  1. complete-phase.js を使わず手動（並列エージェント）で成果物を作成した場合、artifacts.json のステータス更新が自動実行されない
  2. 成果物ファイル作成と artifacts.json 更新を別ステップとして認識していなかった
- **教訓**:
  1. 成果物生成後に必ず artifacts.json の当該 Phase status を `completed` に更新する
  2. Phase 完了時のチェックリストに「artifacts.json 更新」を明示的に含める
  3. 手動生成フローでは complete-phase.js が行う後処理（ステータス更新）を手動で補完する
- **発見日**: 2026-02-21
- **関連タスク**: UT-FIX-SKILL-IMPORT-INTERFACE-001

---

## 成功パターン

### 仕様書修正タスクの「差分監査」と「全体監査」分離（UT-SKILL-IPC-PRELOAD-EXTENSION-001）

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

### scoped監査の判定軸固定（UT-FIX-SKILL-EXECUTE-INTERFACE-001 再確認）

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

### Phase 12 UI再確認の証跡固定（TASK-UI-00-ORGANISMS）

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

### Phase 12準拠確認と親仕様参照ガード（TASK-043B）

- **状況**: Phase 12 の Task 12-1〜12-5 と Step 1-A〜1-G / Step 2 が複数成果物へ分散し、完了根拠を一目で確認しづらい
- **問題**:
  1. `spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` を横断しないと準拠確認が閉じない
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

### `phase-12-documentation.md` 完了同期パターン（TASK-9H）

- **状況**: `outputs/phase-12` の成果物5件が揃っていても、`phase-12-documentation.md` のメタ情報と完了条件チェックが `未実施` のまま残ることがある
- **問題**: 実体成果物とタスク仕様書の状態が乖離し、Phase 12 再監査で「未実施」と誤判定される
- **解決パターン**:
  1. `implementation-guide/spec-update-summary/documentation-changelog/unassigned-task-detection/skill-feedback-report` の存在を先に確認する
  2. `phase-12-documentation.md` のステータスを `完了` に更新する
  3. Step 1-A〜Step 3 と完了条件チェックリストを同一ターンで同期更新する
  4. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` の結果を `spec-update-summary.md` に記録する
- **効果**:
  - Phase 12 の「成果物実体」と「仕様書ステータス」の二重台帳不一致を防止できる
  - 監査時の差し戻し（未実施残置）を削減できる
- **発見日**: 2026-02-27
- **関連タスク**: TASK-9H

### Phase 12 タスク仕様準拠の4点突合（TASK-UI-01-E）

- **状況**: `outputs/phase-12` とシステム仕様更新が揃っていても、`phase-12-documentation.md` の完了同期、実装ガイド必須要件、未タスク指示書フォーマット、監査値転記のどれかが後追いでずれやすい
- **問題**: 「Phase 12 実行済み」と報告しても、Task 12-1〜12-5 の要件と実績値が1ファイルに閉じず、再監査で数値や配置先の差し戻しが起こる
- **解決パターン**:
  1. `phase-12-documentation.md` の `ステータス=completed`、Task 12-1〜12-5、Task 100% 実行確認を `outputs/phase-12` の7成果物と1対1で突合する
  2. `implementation-guide.md` は `## Part 1` / `## Part 2`、理由先行、日常例え、TypeScript 型/API/エッジケース/設定語を `rg` で確認する
  3. 未タスクは `docs/30-workflows/unassigned-task/` の物理配置、`## メタ情報 + ## 1..9` の10見出し、`audit --json --diff-from HEAD --target-file`、`verify-unassigned-links` を同一ターンで確認する
  4. `spec-update-summary.md` / `phase12-compliance-recheck.md` / `unassigned-task-detection.md` / `task-workflow.md` に同一の実測値を転記する
- **効果**:
  - Phase 12 完了判定の根拠を「仕様書・成果物・未タスク・検証値」の4面で固定できる
  - follow-up 更新後の warning 件数や `current/baseline` の誤記を防止できる
- **発見日**: 2026-03-06
- **関連タスク**: TASK-UI-01-E-INTEGRATION-GATE-SPEC-SYNC

### `validate-phase-output` の引数仕様固定（位置引数）

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

### Phase 12 テスト件数ドリフト再同期パターン（TASK-9E）

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

### Phase 12出力成果物チェックリスト

- **状況**: Phase 12タスク仕様書・成果物作成時
- **確認項目**:
  1. ✅ `implementation-guide.md` - Part 1（中学生レベル）+ Part 2（開発者向け）
  2. ✅ `api-documentation.md` / `ipc-documentation.md` / `component-documentation.md`
  3. ✅ `documentation-changelog.md` - システム仕様書更新判断と履歴
  4. ✅ `unassigned-task-detection.md` - 未タスク検出報告（0件でも必須）
- **根拠**: phase-11-12-guide.md Task 1-4の完全準拠
- **発見日**: 2026-01-26

### Zustand Store Hooks無限ループ対策パターン（UT-FIX-STORE-HOOKS-INFINITE-LOOP-001）

- **状況**: Zustand Store Hooksを使用するReactコンポーネントで初期化処理を行う場合
- **問題**: 合成Store Hook（`useAuthModeStore()`等）が毎回新しいオブジェクトを返すため、その中の関数を`useEffect`の依存配列に含めると無限ループが発生
- **症状**:
  - 設定画面がぐるぐる回り続ける
  - LLM/スキル選択が無限実行
  - コンソールに大量のレンダリングログ
- **根本原因**: 合成Store Hookは毎回新しいオブジェクト参照を返すため、`useEffect`の依存配列に関数を含めると毎レンダリングで再実行される
- **解決パターン**:

  | 対策 | 実装方法 | 効果 |
  | ---- | -------- | ---- |
  | **短期: useRefガード** | `useRef`で初期化済みフラグを管理し、依存配列は空にする | 即時修正可能 |
  | **長期: 個別セレクタ** | `useAuthMode()`, `useSetAuthMode()`等の個別セレクタに再設計 | 根本解決 |

- **コード例**:
  ```typescript
  // ❌ 無限ループ
  const { initializeAuthMode } = useAuthModeStore();
  useEffect(() => {
    initializeAuthMode();
  }, [initializeAuthMode]);

  // ✅ 修正後（useRefガード）
  const { initializeAuthMode } = useAuthModeStore();
  const initRef = useRef(false);
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      initializeAuthMode();
    }
  }, []);
  ```
- **関連Pitfall**: P31（06-known-pitfalls.md）
- **Phase 5チェック項目**: Store Hookを使用する場合はuseRefガードを検討
- **発見日**: 2026-02-10
- **関連タスク**: UT-FIX-STORE-HOOKS-INFINITE-LOOP-001

### DIサービス追加時のテスト修正パターン（TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE）

- **状況**: 新しいサービスをDependency Injectionで既存クラスに追加する場合
- **問題**: 既存のテストファイルすべてにモックを追加する必要があり、大規模修正が発生
- **苦戦箇所と解決策**:

  | 苦戦箇所               | 問題                        | 解決策                                                                           |
  | ---------------------- | --------------------------- | -------------------------------------------------------------------------------- |
  | テストファイル洗い出し | 影響範囲が不明確            | `grep -rn "new SkillExecutor" apps/desktop/src/` で関連テストを特定              |
  | モック定義の重複       | 5ファイルに同じモックを追加 | 共通テストユーティリティへの抽出を検討                                           |
  | beforeEachリセット忘れ | テスト間で状態がリーク      | `mockAuthKeyService.getKey.mockResolvedValue()` を各beforeEachで明示的にリセット |

- **パターン**:
  1. コンストラクタにオプショナル引数として新サービスを追加（後方互換性維持）
  2. テストファイルごとにモックオブジェクトを定義
  3. beforeEachでモックをリセット
  4. SkillExecutorコンストラクタの第3引数として渡す
- **効果**:
  - 既存テストへの影響を最小化（オプショナル引数）
  - 各テストファイルで独立したモック管理
- **発見日**: 2026-02-08
- **関連タスク**: TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE
- **関連Pitfall**: P21（06-known-pitfalls.md）

### Setter Injectionによる遅延初期化パターン（TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION）

- **状況**: BrowserWindow等の外部リソースを必要とする依存オブジェクトを既存サービスに注入する場合
- **問題**: Constructor Injectionでは、依存オブジェクト（SkillExecutor）がサービス（SkillService）のコンストラクタ時点で未生成のため注入不可能
- **苦戦箇所と解決策**:

  | 苦戦箇所                   | 問題                                        | 解決策                                                             |
  | -------------------------- | ------------------------------------------- | ------------------------------------------------------------------ |
  | 依存オブジェクト未生成     | SkillExecutorはmainWindow生成後に初期化必要 | Setter Injection（`setSkillExecutor()`）で遅延注入                 |
  | null安全性                 | setter呼び出し前のアクセスでnullエラー      | Optional Chainingと未設定時フォールバック（従来ロジック実行）       |
  | テストモック追加の波及     | 既存5テストファイルすべてにモック追加が必要  | 各テストのbeforeEachでモックを設定し、状態をリセット               |

- **パターン（DIパターン使い分け基準）**:

  | パターン               | 使用条件                               | 例                                |
  | ---------------------- | -------------------------------------- | --------------------------------- |
  | Constructor Injection  | 依存オブジェクトが生成時点で利用可能   | AuthKeyService → SkillExecutor    |
  | Setter Injection       | 依存オブジェクトの生成に外部リソース必要 | SkillExecutor → SkillService      |
  | Factory Pattern        | 依存オブジェクトを動的に生成する必要   | リクエストごとのインスタンス生成  |

- **実装例**:
  ```typescript
  // SkillService: Setter Injection
  class SkillService {
    private skillExecutor: SkillExecutor | null = null;

    setSkillExecutor(executor: SkillExecutor): void {
      this.skillExecutor = executor;
    }

    async executeSkill(skillId: string, params: unknown): Promise<Result> {
      if (this.skillExecutor) {
        return this.skillExecutor.execute(skillId, params);
      }
      // フォールバック: 従来の内部ロジック
      return this.executeSkillInternal(skillId, params);
    }
  }

  // 注入タイミング: mainWindow生成後
  const skillExecutor = new SkillExecutor(mainWindow, authKeyService);
  skillService.setSkillExecutor(skillExecutor);
  ```
- **効果**:
  - 外部リソース依存のDI問題を解決
  - 既存コードの後方互換性維持（フォールバック）
  - テスト時にモック注入が容易
- **発見日**: 2026-02-11
- **関連タスク**: TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION
- **関連Pitfall**: P34, P35（06-known-pitfalls.md）

### 大規模テスト実行時のVitest Worker対策（TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE）

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

### 未タスク仕様書への実装課題継承パターン（TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE）

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

### IPCチャンネル統合パターン（TASK-FIX-4-1-IPC-CONSOLIDATION）

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

### TASK-FIX-5-1: SkillAPI二重定義統一

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

### Phase 12 Task 2完全チェックリスト（task-imp-search-ui-001）

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

### UX改善タスクの構造化（R-ID方式）

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

### Part 1概念説明の日常例えパターン

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

### ユーティリティ関数の独立分離

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

### コンポーネント同階層ユーティリティファイル配置

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

### 順次フィルタパイプライン（useMemo チェーン）

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

### 将来改善候補の未タスク仕様書変換

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

### React Contextによる一括更新パターン

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

### 動的更新間隔の適応的最適化

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

### Page Visibility APIによるリソース最適化

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

### OAuth Implicit FlowのURLフラグメントパース（TASK-FIX-GOOGLE-LOGIN-001）

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

### Zustandリスナー二重登録防止パターン（TASK-FIX-GOOGLE-LOGIN-001）

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

### IPC経由のエラー情報伝達設計（TASK-FIX-GOOGLE-LOGIN-001）

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

---

## ガイドライン

### Markdown見出し検出パターン

- **状況**: スクリプトでMarkdownの特定レベルの見出しを検出する場合
- **指針**:
  - H1のみ: `/^# [^#]/`
  - H2のみ: `/^## [^#]/`
  - H3のみ: `/^### [^#]/`
  - H2以上（H1, H2）: `/^#{1,2} [^#]/`
- **根拠**: 見出しの後にはスペースが続き、より深い見出し（例：###）との誤検出を防ぐ
- **発見日**: 2026-01-24

### forwardRef + useImperativeHandle によるテスト可能性向上

- **状況**: コンポーネント内部のハンドラ関数がUIから直接呼び出されず、Function Coverageが不足する場合
- **パターン**: `forwardRef` + `useImperativeHandle` で内部関数をref経由で外部公開
- **例**（TASK-7D）:
  - ChatPanelの `handleImportRequest` がUI要素に未接続
  - `useImperativeHandle(ref, () => ({ handleImportRequest }))` で公開
  - テストでは `React.createRef<ChatPanelHandle>()` + `act()` で呼び出し
- **効果**:
  - Function Coverage 50% → 100%
  - 親コンポーネントからの制御が可能に
  - テストでの内部関数アクセスが型安全に
- **発見日**: 2026-01-30
- **関連タスク**: TASK-7D

### Exclude型によるType-safe設定マップ

- **状況**: ユニオン型の一部のみを対象とした設定マップを作成する場合
- **パターン**: `Exclude<UnionType, "value">` で対象外の値を除外した型を定義
- **例**（TASK-7D）:
  - `DisplayableStatus = Exclude<SkillExecutionStatus, "idle">`
  - `STATUS_CONFIG: Record<DisplayableStatus, { color: string; label: string }>`
  - 「idle」は表示しないため、設定マップから除外
- **効果**:
  - コンパイル時にすべてのアクティブステータスの設定漏れを検出
  - ランタイムエラーの防止
  - コードの意図が型レベルで明確
- **発見日**: 2026-01-30
- **関連タスク**: TASK-7D

### Store個別セレクタによる再レンダー最適化

- **状況**: Zustand Storeから複数の状態を取得するコンポーネント
- **パターン**: `useAppStore((s) => s.specificField)` を各フィールドごとに呼び出し
- **例**（TASK-7D）:
  ```
  const selectedSkillName = useAppStore((s) => s.selectedSkillName);
  const streamingMessages = useAppStore((s) => s.streamingMessages);
  const isExecuting = useAppStore((s) => s.isExecuting);
  ```
- **効果**:
  - 無関係な状態変更時の不要な再レンダーを防止
  - パフォーマンス最適化（特にストリーミング中の高頻度更新時）
  - 全状態を一括取得するアンチパターンの回避
- **発見日**: 2026-01-30
- **関連タスク**: TASK-7D

### 並列バックグラウンドエージェントによるドキュメント生成

- **状況**: Phase 1-12の大量の出力ドキュメントを効率的に生成する場合
- **パターン**: 独立したPhase群ごとにTask agentを並列起動し、バックグラウンド実行
- **例**（TASK-7D）:
  - Agent 1: Phase 1-3（要件分析・設計・レビュー）
  - Agent 2: Phase 4-7（テスト・実装・カバレッジ）
  - Agent 3: Phase 8-10（リファクタリング・品質・最終レビュー）
  - Agent 4: Phase 11（手動テスト）
  - Agent 5: Phase 12（ドキュメント・実装ガイド）
- **効果**:
  - 33個の出力ドキュメントを効率的に生成
  - コード変更とドキュメント生成を並行して実行可能
  - コンテキスト使用量の分散
- **発見日**: 2026-01-30
- **関連タスク**: TASK-7D

### Record型による定数スタイルマッピング

- **状況**: TypeScriptのユニオン型に対応するUIスタイルを定義する場合
- **パターン**: `Record<EnumType, StyleObject>` でTailwind CSSクラスを型安全にマッピング
- **例**（task-imp-permission-tool-metadata-001）:
  ```
  const RISK_LEVEL_STYLES: Record<RiskLevel, { bg: string; text: string; border: string }> = {
    Low: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
    ...
  };
  ```
- **効果**:
  - 全リスクレベルのスタイル定義が必須（コンパイル時検証）
  - 新しいリスクレベル追加時に未定義スタイルがコンパイルエラー
  - UIの一貫性保証
- **発見日**: 2026-01-31
- **関連タスク**: task-imp-permission-tool-metadata-001

### IIFE（即時実行関数式）によるインラインJSXレンダリング

- **状況**: JSX内で変数束縛を伴う条件付きレンダリングが必要な場合
- **パターン**: `{(() => { const val = compute(); return <span>{val}</span>; })()}` でインライン実行
- **例**（task-imp-permission-tool-metadata-001）:
  - `getRiskLevel(toolName)` の結果を変数に束縛してバッジスタイルを適用
  - 複数のstyleプロパティ（bg, text, border）を組み合わせるためIIFEで中間変数が必要
- **効果**:
  - 別関数に分離するほどでもない小規模なロジックをインラインで表現
  - className構築に中間変数が使える
  - render関数の肥大化を防止
- **発見日**: 2026-01-31
- **関連タスク**: task-imp-permission-tool-metadata-001

### デフォルトメタデータによる安全側フォールバック

- **状況**: 外部入力（ツール名など）に対してメタデータを提供する場合
- **パターン**: 未定義キーに対してDEFAULT値を返し、安全側にフォールバック
- **例**（task-imp-permission-tool-metadata-001）:
  - `DEFAULT_METADATA = { riskLevel: "Medium", securityImpact: "ツールを実行します" }`
  - `TOOL_METADATA[toolName] ?? DEFAULT_METADATA` でnullish coalescing
  - 未知のツールは「Medium」リスク（安全側の中間値）
- **効果**:
  - 新ツール追加時にUIがクラッシュしない
  - 未定義ツールを「安全」ではなく「中程度リスク」として扱う安全設計
  - Null safety保証
- **発見日**: 2026-01-31
- **関連タスク**: task-imp-permission-tool-metadata-001

### 境界値フィクスチャ設計パターン（ギャップ分析駆動）

- **状況**: 既存テストで未カバーの境界値・エラーパターンを体系的に拡充する場合
- **パターン**: ギャップ分析マトリクスでA（エラーパターン）/B（境界値）/C（組み合わせ）/D（データ）の4カテゴリに分類し、各ギャップに対応するフィクスチャを設計
- **例**（TASK-8C-G）:
  | カテゴリ | ギャップ数 | フィクスチャ例 |
  | -------- | ---------- | -------------- |
  | A: エラー | 10件 | missing-fields-skill, forbidden-files-skill, invalid-name-skill, empty-agents-skill, invalid-schema-skill |
  | B: 境界値 | 9件 | boundary-skill（64文字名、10文字説明、最大エージェント数） |
  | C: 組み合わせ | 1件 | boundary-skill（全5スクリプト同時検証） |
  | D: データ | 3件 | マルチラインYAML、特殊文字含むパス |
- **効果**:
  - 23ギャップ → 100%カバレッジ達成
  - 既存62テスト + 新規34テスト = 96テスト全PASS
  - 体系的で漏れのないテスト拡充
- **発見日**: 2026-02-01
- **関連タスク**: TASK-8C-G

### parseFrontmatter構造化検証パターン

- **状況**: YAML Frontmatterのパース結果を検証する際、直接値比較だと型の不一致やマルチラインYAML（`|`記法）で失敗する場合
- **パターン**: フィールドの存在確認（`toHaveProperty`）+ バリデーションスクリプトの出力結果で検証する2段階アプローチ
- **例**（TASK-8C-G）:
  - 直接比較が失敗: `expect(fm.description).toBe("...")` → マルチラインYAMLで型が異なる
  - 解決: `expect(fm).toHaveProperty("description")` でフィールド存在を確認
  - スクリプト出力で詳細検証: `parseValidationOutput(result)` → `{ valid: true }` で合否判定
- **効果**:
  - YAMLパーサー実装の詳細に依存しない堅牢なテスト
  - マルチラインYAML（`|`）、フロースタイル（`[a, b]`）等の各記法に対応
  - テストの保守性向上（パーサー変更時にテスト修正不要）
- **発見日**: 2026-02-01
- **関連タスク**: TASK-8C-G

### execSync外部スクリプト実行による決定論的テスト

- **状況**: JavaScriptバリデーションスクリプトの動作をテストする場合
- **パターン**: `execSync` で実際にスクリプトを子プロセスとして実行し、終了コードと標準出力を検証
- **例**（TASK-8C-G）:
  - `getExitCode(scriptPath, fixturePath)`: 終了コードで成功/失敗を判定
  - `parseValidationOutput(stdout)`: JSON出力をパースして`valid`/`errors`を検証
  - 実際のスクリプトを実行するため、ロジックのモック不要
- **効果**:
  - Script First原則に準拠（スクリプト自体が正しく動作することを保証）
  - CIとローカルで同じ結果（環境依存なし）
  - スクリプトのインターフェース（入出力仕様）をテストとして文書化
- **発見日**: 2026-02-01
- **関連タスク**: TASK-8C-G

### Phase 10 MINOR指摘の確実な未タスク変換

- **状況**: Phase 10レビューでMINOR判定の指摘が出た場合
- **パターン**: MINOR指摘はガイドラインに従い**必ず**未タスク仕様書に変換する
- **手順**:
  1. Phase 10レビュー結果からMINOR判定を抽出
  2. unassigned-task-guidelines.md のルール確認（「MINOR判定→未完了タスクとして記録して進行」）
  3. 各MINOR指摘を正式な未タスク仕様書に変換（9セクション形式）
  4. `docs/30-workflows/unassigned-task/` に配置
  5. unassigned-task-detection.md の件数とステータスを更新
- **例**（TASK-8B）:
  - M-01: テスト名命名規則不一致 → `task-component-tests-naming-consistency.md`（優先度: 低）
  - M-02: 未使用import残存 → `task-component-tests-import-cleanup.md`（優先度: 低）
- **判定基準**: 「機能に影響なし」「tree-shakingで除去される」等はタスク化**不要**の理由にならない。ガイドラインではMINOR=即タスク化
- **効果**:
  - MINOR指摘が体系的に管理される
  - 将来のリファクタリング候補が正式に追跡される
  - ガイドライン準拠が保証される
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8B

### Phase 12 Step 1完了チェックリストの厳格遵守

- **状況**: Phase 12 Task 2（システムドキュメント更新）実行後に漏れが発生する場合
- **パターン**: spec-update-workflow.mdの「Step 1完了チェックリスト」を完全に実行してから次に進む
- **誤りやすいポイント**:
  1. **SKILL.md変更履歴の更新漏れ**: 「テストコードのみだから不要」は誤り。タスク完了記録として必ず両方のSKILL.md（aiworkflow-requirements + task-specification-creator）の変更履歴を更新
  2. **未タスク指示書のunassigned-task/配置漏れ**: 検出レポート（unassigned-task-detection.md）作成だけでなく、正式な9セクション形式の指示書を`docs/30-workflows/unassigned-task/`に配置
  3. **task-workflow.md残課題テーブル登録漏れ**: 未タスク検出時は`task-workflow.md`の残課題テーブルに必ず登録
  4. **topic-map.md再生成忘れ**: 新規ファイル追加時は必ず`generate-index.js`を実行して行番号を再同期
- **例**（TASK-8C-C）:
  - 当初「テストコードのみなのでSKILL.md更新不要」と誤判断
  - 再検証で4項目の漏れを発見・修正
  - aiworkflow-requirements/SKILL.md v8.29.0、task-specification-creator/SKILL.md v9.27.0を追記
- **効果**:
  - Phase 12完了前に全ての必須アクションが確実に実行される
  - 再検証・手戻りの削減
  - ドキュメント品質の一貫性確保
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8C-C

### 06-known-pitfalls.mdへの新規Pitfall登録フロー

- **状況**: 実装中に新しい落とし穴（Pitfall）を発見した場合
- **登録フロー**:

  | Step | アクション | 成果物 |
  | ---- | ---------- | ------ |
  | 1 | Pitfall IDの採番 | P31, P32, ... （既存の最大ID + 1） |
  | 2 | 06-known-pitfalls.mdに追記 | 教訓・チェックリスト参照・関連タスクを含む |
  | 3 | patterns.mdに成功パターンを追加 | 解決策・コード例・発見日を含む |
  | 4 | phase-templates.mdにチェック項目を追加（該当Phaseがある場合） | Phase 5等のテンプレートに追記 |

- **Pitfall ID採番ルール**:
  ```
  # 既存の最大IDを確認
  grep -n "^### P[0-9]" .claude/rules/06-known-pitfalls.md | tail -1

  # 例: P30が最大なら、新規はP31
  ```
- **必須セクション**（06-known-pitfalls.md）:
  ```markdown
  ### P{{N}}: {{タイトル}}

  - **教訓**: {{得られた教訓}}
  - **症状**: {{どのような問題が発生するか}}
  - **解決策**: {{解決方法}}
  - **関連タスク**: {{タスクID}}
  ```
- **patterns.mdとの連携**:
  - Pitfallには失敗パターンを記録
  - patterns.mdには成功パターン（解決策）を記録
  - 相互参照リンクで結合
- **効果**:
  - 知見の体系的な蓄積
  - 同じ失敗の再発防止
  - 新規タスクへの学びの継承
- **発見日**: 2026-02-10
- **関連タスク**: UT-FIX-STORE-HOOKS-INFINITE-LOOP-001

---

## フェーズ境界遷移パターン（Phase Boundary Transition）

> タスクの12フェーズ実行において、フェーズ間の成果物・知見の引き継ぎが品質を左右する。以下はTASK-7Dで検証された遷移パターン。

| パターン                                | 説明                                                   | 適用場面                                         |
| --------------------------------------- | ------------------------------------------------------ | ------------------------------------------------ |
| Phase 3 → Phase 4 ゲート                | レビュー結果に基づくテスト設計方針の引き継ぎ           | 設計レビューで発見した懸念事項をテスト仕様に反映 |
| Phase 7 → Phase 8 カバレッジ→リファクタ | カバレッジ不足の原因分析を元にリファクタリング方針決定 | Function Coverage不足 → forwardRef導入           |
| Phase 10 → Phase 11 品質→手動テスト     | 品質チェック結果を手動テストシナリオに反映             | 自動テスト検証済み項目は手動テストからスキップ   |
| Phase 11 → Phase 12 テスト→ドキュメント | 手動テスト結果と品質メトリクスをドキュメントに統合     | テスト結果サマリーを実装ガイドに含める           |

- **発見日**: 2026-01-30
- **関連タスク**: TASK-7D

---

## 失敗回避パターン

> Phase実行中に繰り返し発生した失敗を未然に防ぐための回避策。

| パターン                 | 失敗例                                                                 | 回避策                                             |
| ------------------------ | ---------------------------------------------------------------------- | -------------------------------------------------- |
| artifacts.json同期漏れ   | Phase完了後にartifacts.jsonが未更新                                    | 各Phase完了時に必ずartifacts.jsonを更新            |
| 未タスクファイル配置漏れ | Phase 12で検出した未タスクがdocs/30-workflows/unassigned-task/に未配置 | 検出と同時にファイル生成を実行                     |
| topic-map.md再生成忘れ   | システム仕様書更新後にインデックスが古いまま                           | spec更新後は必ずnode scripts/generate-index.js実行 |

- **発見日**: 2026-01-31
- **関連タスク**: TASK-7D

---

## 単体テスト設計パターン（TASK-8A）

> TASK-8Aのスキル管理モジュール単体テスト実装で検証されたパターン。5モジュール・231テストの実装から得た知見。

### カバレッジ閾値免除判定パターン

- **状況**: モジュールのLine Coverage/Function Coverageが閾値（80%）未満だが、未カバー部分がIPC通信・外部システム依存のユーティリティメソッドである場合
- **パターン**: Phase 7仕様の「統合テスト（TASK-8B, TASK-8C）でカバーされる予定のパスは差し戻さない」規定を適用し、条件付PASSとする
- **効果**: 単体テストでの過度なモッキングを回避し、テストの脆弱性を防止。Branch Coverageは達成している場合、条件分岐の検証は十分と判断可能
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8A（SkillExecutor.ts: Line 52.73%, Function 64.86% → 条件付PASS）

### ギャップ分析ベース TDD パターン

- **状況**: 既存テストが大量（226件）に存在し、追加テストが少数（5件）で済む場合
- **パターン**: Phase 1でギャップ分析（既存テスト監査→仕様要件との差分検出）を実施し、不足テストケースのみをTDD Red-Green-Refactorで追加。既存テストへの変更は最小限に抑える
- **効果**: 226件の既存テストを壊すリスクなしに5件の新規テストを安全に追加。全231テストがPASS
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8A（SE-02, SE-07, SE-08, PR-03の4ギャップ検出→5テスト追加）

### 未タスク検出 P3全件記録パターン

- **状況**: Phase 11で検出されたエッジケースが低優先度(P3)で、最終テーブルから除外されてしまう
- **パターン**: 優先度に関わらず検出した候補は全件を未タスク検出レポートの最終テーブルに記録し、`docs/30-workflows/unassigned-task/` にタスク指示書を正式配置する。「検出したが記録しない」は禁止
- **効果**: 将来の参照可能性を確保し、未タスク検出の完全性を維持。TASK-8AではP3アイテム(SKILL.md途中削除レースコンディション)が当初0件として報告されたが、修正後1件として正式記録
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8A（task-skillscanner-file-deletion-race: P3未タスクの正式配置）

### vi.doMock 動的モジュール再読み込みパターン

- **状況**: テスト対象モジュールがコンストラクタ内で外部依存（electron-store等）を初期化し、各テストで異なるモック設定が必要な場合
- **パターン**: `vi.doMock()`でモジュールモックを設定後、`await import()`でモジュールを動的再読み込み。各テストで独立したモック環境を構築
- **効果**: テスト間のモック状態漏洩を完全に排除。SkillImportManager.test.tsの28テスト全件で独立性を確保
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8A

### Graceful SDK Fallback パターン

- **状況**: 外部SDK（Claude Agent SDK等）への接続が失敗した場合でもアプリケーションがクラッシュしない必要がある場合
- **パターン**: `tryAgentSdkWithFallback<T>(fn, fallback)` ユーティリティでSDKエラー時にフォールバック値を返す
- **例**（TASK-9C）:
  | 項目 | 実装 |
  | ---- | ---- |
  | ユーティリティ | `sdkUtils.ts: tryAgentSdkWithFallback<T>(fn, fallback)` |
  | 使用例 | `tryAgentSdkWithFallback(() => queryFn(prompt), { suggestions: [] })` |
  | エラーログ | `console.warn()` で警告出力、アプリは継続動作 |
- **効果**:
  - SDKが未インストール/設定不備でもアプリが起動・動作する
  - ユーザーには「分析結果なし」等の空状態を表示
  - エラー詳細は開発者コンソールで確認可能
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9C

### queryFn DI パターン（SDK テスト用）

- **状況**: Claude Agent SDK の `query()` 呼び出しを含むサービスの単体テストを書く場合
- **パターン**: `queryFn` パラメータでSDK呼び出しを依存注入（DI）可能にし、テストではモック関数を渡す
- **例**（TASK-9C）:
  | 項目 | 実装 |
  | ---- | ---- |
  | インターフェース | `queryFn?: (prompt: string) => Promise<Result>` |
  | デフォルト値 | 本番: Claude Agent SDK の `query()` を呼び出す関数 |
  | テスト時 | `vi.fn().mockResolvedValue({ suggestions: [...] })` を注入 |
- **効果**:
  - SDK本体をモック不要（ESModule問題を回避）
  - テストが高速・決定論的
  - 本番コードは変更なしで動作
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9C

### スキル名バリデーション（禁止文字サニタイズ）

- **状況**: ユーザー入力のスキル名をファイルパスとして使用する場合
- **パターン**: 禁止文字リスト `<>:"\|?*` を定義し、該当文字を含む名前を拒否またはサニタイズ
- **例**（TASK-9C）:
  | 項目 | 実装 |
  | ---- | ---- |
  | 禁止文字定数 | `FORBIDDEN_CHARS = ['<', '>', ':', '"', '\|', '?', '*']` |
  | 検証関数 | `validateSkillName(name): { valid: boolean; error?: string }` |
  | エラーメッセージ | 「スキル名に使用できない文字が含まれています: <具体的な文字>」 |
- **効果**:
  - パストラバーサル攻撃の防止
  - Windows/macOS/Linux全環境で安全なファイル名
  - ユーザーフレンドリーなエラーメッセージ
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9C

### ESModuleモッキング回避パターン

- **状況**: `node:fs/promises`等のESModuleエクスポートに対して`vi.spyOn()`を使用すると`Cannot redefine property`エラーが発生する場合
- **パターン**: モックを使わず、実際にエラーが発生する条件（存在しないファイル、権限不足等）を作ってテストする
- **例**（TASK-9A-A）:
  - 問題: `vi.spyOn(fs, "readFile")` → `TypeError: Cannot redefine property: readFile`
  - 解決: 存在しないスキル名を渡してENOENTエラーを発生させる
  - 解決: 権限のないディレクトリを使ってEACCESエラーを発生させる
- **効果**:
  - Vitestの制約を回避
  - 実際のエラーパスをテスト（モックより信頼性高い）
  - 137テスト全PASS、カバレッジ98%達成
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9A-A

### 汎用エラーアサーションパターン

- **状況**: 空入力に対するエラーが複数のエラークラスのいずれかを返す可能性がある場合
- **パターン**: 特定のエラークラスではなく`.rejects.toThrow()`で汎用的にエラー発生を検証
- **例**（TASK-9A-A）:
  - 問題: `readSkillFile("")`は`SkillNotFoundError`を期待したが`FileNotFoundError`が発生
  - 解決: `.rejects.toThrow(SkillNotFoundError)` → `.rejects.toThrow()` に変更
  - 理由: 空スキル名は「スキルが見つからない」とも「ファイルが見つからない」とも解釈できる
- **効果**:
  - 実装の詳細に依存しない堅牢なテスト
  - エラーハンドリングのリファクタリング耐性
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9A-A

---

## E2Eテスト設計パターン（TASK-8C-B）

> TASK-8C-BのスキルE2Eテスト実装で検証されたパターン。8テストケース・ARIA属性ベースセレクタ・安定性対策の知見。

### ARIA属性ベースセレクタ優先パターン

- **状況**: Playwrightでドロップダウン等のUI要素を選択する場合
- **パターン**: `data-testid`やCSSクラスより`role`属性等のARIA属性を優先してセレクタを構築
- **例**（TASK-8C-B）:
  ```typescript
  const selectors = {
    skillSelector: '[role="combobox"][aria-haspopup="listbox"]',
    dropdown: '[role="listbox"]',
    option: (text: string) => `[role="option"]:has-text("${text}")`,
  };
  ```
- **セレクタ優先順位**:
  | 優先度 | セレクタタイプ | 理由 |
  | ------ | -------------- | ---- |
  | 1 | ARIA属性 | セマンティック、安定、アクセシビリティ検証も兼ねる |
  | 2 | data-testid | テスト専用、明示的 |
  | 3 | テキストベース | 可読性高い |
  | 4 | ID/クラス | 実装詳細に依存するため最後の手段 |
- **効果**:
  - CSSリファクタリング時もテストが壊れにくい
  - アクセシビリティとE2Eテストが同時に検証される
  - コンポーネント内部実装に依存しない堅牢なテスト
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8C-B

### E2Eヘルパー関数分離パターン

- **状況**: 複数のテストケースで同じUI操作シーケンスを繰り返す場合
- **パターン**: 操作シーケンスをヘルパー関数として分離し、各テストから呼び出す
- **例**（TASK-8C-B）:
  | ヘルパー関数 | 操作内容 |
  | ------------ | -------- |
  | `openDropdown(page)` | セレクタクリック + ドロップダウン表示待機 |
  | `selectSkill(page, name)` | openDropdown + オプションクリック |
  | `deselectSkill(page)` | openDropdown + 「なし」オプションクリック |
- **効果**:
  - テストコードのDRY原則遵守
  - 操作シーケンス変更時の修正箇所が1箇所
  - テストケースの可読性向上（what, not how）
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8C-B

### E2E安定性対策3層パターン

- **状況**: E2Eテストがフレーキー（不安定）になる場合
- **パターン**: 3層の待機処理で安定性を確保
- **実装**:
  | 層 | 対策 | 実装例 |
  | -- | ---- | ------ |
  | 1. 明示的セレクタ待機 | 要素表示完了を待つ | `waitForSelector({ state: "visible" })` |
  | 2. UI安定化待機 | レンダリング完了を待つ | `waitForTimeout(100)` in beforeEach |
  | 3. DOMロード待機 | ページ初期化を待つ | `waitForLoadState("domcontentloaded")` |
- **効果**:
  - 5回連続実行でも100% PASS
  - CI環境とローカル環境で同一結果
  - タイミング依存の失敗を排除
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8C-B

---

## CI/DevOps最適化パターン

> TASK-OPT-CI-TEST-PARALLEL-001で検証されたGitHub Actions CI最適化パターン。

### GitHub Actions テスト並列実行最適化パターン

- **状況**: CIテスト実行時間が長く（18分以上）、開発フィードバックループが遅い場合
- **パターン**: シャード数増加 + maxForks最適化 + キャッシュ導入 + カバレッジ条件分岐の4軸で最適化
- **例**（TASK-OPT-CI-TEST-PARALLEL-001）:
  | 項目 | 変更前 | 変更後 | 効果 |
  | -------- | ------ | ------ | ---- |
  | シャード数 | 8 | 16 | 各シャード約25ファイル |
  | maxForks | 2 | 4 (CI) / CPUベース (LOCAL) | I/O待ち活用 |
  | fileParallelism | false | true | 並列ファイル実行 |
  | キャッシュ | なし | shared packageビルドキャッシュ | ビルド時間短縮 |
  | カバレッジ | 常時計測 | PR時スキップ、main push時計測 | 約30%時間短縮 |
- **実装詳細**:
  - `vitest.config.ts`: `pool: "forks"` + 動的`maxForks`計算（`Math.min(Math.max(cpus().length / 2, 2), 8)`）
  - `ci.yml`: `matrix.shard: [1,2,...,16]` + `actions/cache@v4`
  - `package.json`: `npm-run-all2`の`run-p`でlint/typecheck/test並列実行
- **環境変数制御**:
  - `VITEST_MAX_FORKS`: maxForks上書き
  - `VITEST_FILE_PARALLELISM`: "false"で無効化（メモリ不足時）
- **効果**:
  - CI全体: 18分 → 9-10分（目標12分以下達成）
  - 各シャード: 13分 → 6-8分（目標10分以下達成）
  - ローカル: lint/typecheck/testが並列実行でフィードバック高速化
- **発見日**: 2026-02-02
- **関連タスク**: TASK-OPT-CI-TEST-PARALLEL-001

### DevOps関連システム仕様書更新パターン

- **状況**: CI/CD最適化タスク完了後、システム仕様書への反映が漏れる場合
- **パターン**: Phase 12で以下3ファイルを必ず確認・更新
- **更新対象ファイル**:
  | ファイル | 更新内容 |
  | -------- | -------- |
  | `deployment-gha.md` | シャード戦略、キャッシュ戦略、並列化設定 |
  | `technology-devops.md` | CI最適化パターン、完了タスクセクション |
  | `quality-requirements.md` | 並列化設定、環境変数制御 |
- **チェックリスト**:
  1. シャード数・分散方式が`deployment-gha.md`に記載されているか
  2. Vitest並列化設定（maxForks, fileParallelism, pool）が記載されているか
  3. 環境変数制御方法が`quality-requirements.md`に記載されているか
  4. CI最適化パターンが`technology-devops.md`に追加されているか
  5. 完了タスクセクションに本タスクが記録されているか
- **効果**: DevOps知見がシステム仕様書に確実に蓄積され、将来のCI最適化に活用可能
- **発見日**: 2026-02-02
- **関連タスク**: TASK-OPT-CI-TEST-PARALLEL-001

---

## Main→Renderer IPC実装パターン（TASK-WCE-MONACO-001）

> TASK-WCE-MONACO-001のMonaco Editor選択範囲取得実装で検証されたパターン。通常のRenderer→Main方向とは逆の、Main ProcessからRenderer Processの状態を取得するパターン。

### webContents.executeJavaScript逆方向クエリパターン

- **状況**: Main ProcessからRenderer ProcessのUI状態（Monaco Editorの選択範囲等）を取得する必要がある場合
- **パターン**: `webContents.executeJavaScript()`でRendererのグローバルブリッジオブジェクトを呼び出す
- **実装**:
  | 要素 | 実装 |
  | ---- | ---- |
  | グローバルブリッジ | `window.__editorSelection = { getSelection: () => {...} }` |
  | Main側クエリ | `webContents.executeJavaScript('window.__editorSelection?.getSelection()')` |
  | webContents取得 | `BrowserWindow.getFocusedWindow()?.webContents ?? BrowserWindow.getAllWindows()[0]?.webContents` |
- **課題と解決策（再利用可能ナレッジ）**:
  | 課題ID | 課題 | 解決策 |
  | ------ | ---- | ------ |
  | MR-01 | webContentsがnull | focusedWebContents ?? firstWebContentsのフォールバック |
  | MR-02 | 未登録エラー | Optional chaining（`?.`）使用 |
  | MR-03 | 非同期結果処理 | async/await適切使用 |
  | MR-04 | TypeScript型エラー | `declare global { interface Window { __xxx?: {...} } }` |
- **効果**:
  - 26テスト全PASS、100%カバレッジ達成
  - Main→Renderer通信の標準パターンとして確立
  - 将来の同様タスク（書き戻し機能等）で再利用可能
- **発見日**: 2026-02-03
- **関連タスク**: TASK-WCE-MONACO-001
- **システム仕様書参照**: [architecture-implementation-patterns.md](/.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md)

---

## サービス設計パターン（TASK-9B-G）

> TASK-9B-GのSkillCreatorService実装で検証されたパターン。50テスト・94.59%カバレッジ達成の知見。

### Script First / Progressive Disclosure統合パターン

- **状況**: 複数のスクリプト・リソース（エージェント定義、スキーマ等）を読み込んでサービスを構成する場合
- **パターン**: Script First（決定論的処理）とProgressive Disclosure（遅延読み込み）を組み合わせて効率的なサービス設計を実現
- **例**（TASK-9B-G）:
  | コンポーネント | Script First適用 | Progressive Disclosure適用 |
  | -------------- | ---------------- | -------------------------- |
  | ScriptExecutor | スクリプト実行は100%決定論的 | 実行時のみスクリプト読み込み |
  | ResourceLoader | ファイル読み込みはfs.readFile | キャッシュミス時のみI/O実行 |
  | SkillCreatorService | モード判定ロジックは決定論的 | 必要なエージェントのみ遅延読み込み |
- **効果**:
  - 初期化時の不要なI/Oを排除
  - テスト時のモック範囲を最小化（決定論的部分はモック不要）
  - メモリ効率の向上（使用時のみリソース読み込み）
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9B-G

### Facadeパターンによるサービス統合

- **状況**: 複数の低レベルコンポーネント（Executor, Loader等）を統合してAPIを提供する場合
- **パターン**: Facade設計パターンで内部実装を隠蔽し、シンプルな公開APIを提供
- **例**（TASK-9B-G）:
  ```
  SkillCreatorService (Facade)
    ├── createSkill() ← 統合API
    ├── executeTasks() ← 統合API
    │
    ├─ ScriptExecutor (内部)
    │   └── execute(), executeJson()
    └─ ResourceLoader (内部)
        └── load(), loadAgent(), loadSchema()
  ```
- **効果**:
  - 利用者は3つのメソッドのみ意識すればよい
  - 内部コンポーネントの変更が外部APIに影響しない
  - 単体テストと統合テストを分離しやすい
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9B-G

### 定数外部化（constants.ts）によるリファクタリング

- **状況**: Phase 8（リファクタリング）でマジックナンバーや文字列リテラルの外部化が必要な場合
- **パターン**: 同一ディレクトリに`constants.ts`を作成し、デフォルト値・タイムアウト・パス等を集約
- **例**（TASK-9B-G）:
  | 定数 | 値 | 用途 |
  | ---- | -- | ---- |
  | DEFAULT_TIMEOUT_MS | 300000 | スクリプト実行タイムアウト |
  | SUPPORTED_ENGINES | ["claude-code", "anthropic-sdk"] | サポートエンジン一覧 |
  | CACHE_MAX_ENTRIES | 50 | ResourceLoaderキャッシュ上限 |
- **効果**:
  - 設定値の一元管理
  - テスト時の定数モック/オーバーライドが容易
  - 将来の環境変数外部化（12-Factor App準拠）への準備
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9B-G

### 未タスク検出→残課題テーブル登録3ステップパターン

- **状況**: Phase 12で未タスクを検出し、適切に管理する場合
- **パターン**: unassigned-task-guidelines.mdの「3ステップ全て完了」を厳守
- **手順**:
  1. **指示書作成**: `docs/30-workflows/unassigned-task/`に9セクション形式で配置
  2. **task-workflow.md登録**: 残課題テーブルに追加（タスクID、名称、優先度、発見元、仕様書パス）
  3. **関連仕様書登録**: interfaces-\*.md等の残課題テーブルにも追加（該当する場合）
- **例**（TASK-9B-G）:
  - 検出: 5件（IPC通信、UI統合、SDK統合、キャッシュ無効化、タイムアウト外部化）
  - 指示書: 5ファイル作成（task-9b-h〜k, task-9b-ui-integration）
  - task-workflow.md: 5件追加（v1.13.0）
- **誤りやすいポイント**:
  - 指示書作成のみで「完了」と誤認（テーブル登録が漏れる）
  - unassigned-task-detection.mdの作成だけで終わる（正式指示書が未作成）
- **効果**:
  - 未タスクの体系的な管理
  - 将来のタスク選定時に一覧から参照可能
  - 検出漏れの防止
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9B-G

---

## 検索/置換UI実装パターン（task-imp-search-ui-001）

> task-imp-search-ui-001のPhase 1-12全工程完了で検証されたパターン。既存実装の高品質活用・E2Eテスト設計・Phase 12漏れ防止の知見。

### 既存実装品質評価パターン

- **状況**: タスク仕様書で計画された実装が、既に高品質で完成している場合
- **パターン**: Phase 5（実装）でギャップ分析を行い、追加実装が不要と判断する
- **判断基準**:
  | 観点 | チェック項目 |
  | ---- | ------------ |
  | 機能網羅性 | 仕様書の要件がすべて実装されているか |
  | テストカバレッジ | 既存テストで80%+カバレッジが達成されているか |
  | エラーハンドリング | エッジケースが適切に処理されているか |
  | アーキテクチャ整合性 | システム仕様に準拠した設計になっているか |
- **例**（task-imp-search-ui-001）:
  - Phase 1要件: SearchPanel/WorkspaceSearch/GlobalShortcut連携
  - 調査結果: SearchService, SearchPanel.tsx, WorkspaceSearchModal.tsx が完全実装済み
  - 判断: 追加実装0件、E2Eテストのみ追加
- **効果**:
  - 不要な重複実装を回避
  - 品質を維持しながらテストカバレッジを向上
  - タスク完了条件は「検証完了」で満たされる
- **発見日**: 2026-02-04
- **関連タスク**: task-imp-search-ui-001

### E2Eテスト Page Object パターン（Playwright）

- **状況**: Playwright E2Eテストで複数のテストケースが同じUI操作を共有する場合
- **パターン**: Page Objectクラスを作成し、セレクタとアクションを集約
- **例**（task-imp-search-ui-001）:
  | ファイル | 責務 |
  | -------- | ---- |
  | `SearchPanelPage.ts` | 検索パネルUI操作（toggle, type, count） |
  | `WorkspaceSearchPage.ts` | ワークスペース検索モーダル操作 |
- **構成**:

  ```typescript
  class SearchPanelPage {
    readonly searchInput: Locator;
    readonly resultsCount: Locator;

    async typeSearchQuery(query: string) { ... }
    async getResultsCount(): Promise<number> { ... }
  }
  ```

- **効果**:
  - テストの可読性向上（what, not how）
  - セレクタ変更時の修正箇所が1箇所
  - テストケース間のコード共有
- **発見日**: 2026-02-04
- **関連タスク**: task-imp-search-ui-001

### generate-index.jsファイル名誤認パターン（回避）

- **状況**: topic-map.md再生成時にスクリプトファイル名を間違える
- **問題**: `generate-index.mjs`と`generate-index.js`の混同
- **誤りパターン**:
  - ❌ `node scripts/generate-index.mjs` → 存在しない
  - ✅ `node scripts/generate-index.js` → 正しい
- **確認方法**:
  ```bash
  ls .claude/skills/aiworkflow-requirements/scripts/
  ```
- **教訓**: spec-update-workflow.mdのコマンド例を直接コピーせず、実ファイル名を確認
- **発見日**: 2026-02-04
- **関連タスク**: task-imp-search-ui-001

---

## 外部APIデータ正規化パターン（AUTH-UI-004）

> AUTH-UI-004のGoogleアバター取得修正で検証されたパターン。プロバイダー別のレスポンス形式差異を吸収するパターン。

### プロバイダー別フォールバック優先度パターン

- **状況**: 複数の外部OAuthプロバイダー（Google, GitHub, Discord等）からのデータを統一的に扱う必要がある場合
- **パターン**: Nullish coalescing（`??`）チェーンでプロバイダー別のキー名を優先度順にフォールバック
- **例**（AUTH-UI-004）:
  | プロバイダー | キー名 | 優先度 |
  | ------------ | ------------ | ------ |
  | GitHub | `avatar_url` | 1 |
  | Discord | `avatar_url` | 1 |
  | Google | `picture` | 2 |
  | その他 | - | null |
- **実装**:
  ```
  const avatarUrl = identity_data?.avatar_url ?? identity_data?.picture ?? null;
  ```
- **効果**:
  - 既存プロバイダー（GitHub/Discord）の動作を壊さない
  - 新規プロバイダー（Google）に対応
  - 未知のプロバイダーはnullで安全にフォールバック
- **発見日**: 2026-02-04
- **関連タスク**: AUTH-UI-004

### Phase 12ドキュメント更新5点セット確認パターン

- **状況**: Phase 12のドキュメント更新作業で更新漏れを防止する場合
- **パターン**: 以下の5点セットを必ず確認・実行
- **チェックリスト**:
  | 項目 | 対象ファイル | 確認内容 |
  | ---- | ------------ | -------- |
  | 1 | LOGS.md×2 | aiworkflow-requirements + task-specification-creator の両方 |
  | 2 | SKILL.md×2 | 両スキルの変更履歴にバージョン追加 |
  | 3 | topic-map.md | `node scripts/generate-index.js` 実行 |
  | 4 | documentation-changelog.md | Step 1-A〜Step 2の全結果を記録 |
  | 5 | interfaces-\*.md | 完了タスクセクション追加（該当する場合） |
- **効果**:
  - ドキュメント更新漏れの防止
  - 将来の開発者が変更履歴を追跡可能
  - システム仕様書の整合性維持
- **発見日**: 2026-02-04
- **関連タスク**: AUTH-UI-004

### 環境依存テスト分離パターン

- **状況**: ネイティブモジュール（better-sqlite3等）に依存するテストがCI/ローカル環境で異なる結果になる場合
- **パターン**: 環境依存テストを分離し、対象テストのみを明示的に実行
- **例**（AUTH-UI-004）:
  | 問題 | 原因 | 解決策 |
  | ---- | ---- | ------ |
  | better-sqlite3バインディングエラー | グローバルpnpm環境のネイティブモジュール不一致 | 対象テストファイルを明示的に指定（`vitest run path/to/test.ts`） |
- **効果**:
  - 本来テストしたい機能（toLinkedProvider）のテストは正常実行
  - 環境依存問題を本タスクのスコープ外として分離
  - CIとローカルで一貫した結果
- **発見日**: 2026-02-04
- **関連タスク**: AUTH-UI-004

---

## 型定義統合/移行パターン（TASK-FIX-1-1-TYPE-ALIGNMENT）

> TASK-FIX-1-1-TYPE-ALIGNMENTのスキル型定義統合で検証されたパターン。skill-execution.ts → skill.tsへの6型+1定数の移行から得た知見。

### パッケージエクスポート更新チェックパターン

- **状況**: 共有パッケージ（@repo/shared等）で型定義ファイルの追加・統合・削除を行う場合
- **パターン**: 3点セットで必ず更新確認する
- **チェックリスト**:
  | # | ファイル | 確認内容 |
  | - | -------- | -------- |
  | 1 | package.json exports | 新エクスポートパスの追加、旧パスの削除 |
  | 2 | tsup.config.ts entry | ビルドエントリポイントの追加・削除 |
  | 3 | src/index.ts | re-exportの追加・削除 |
- **誤りやすいポイント**:
  - 型定義ファイル自体の変更のみで「完了」と誤認
  - package.json exportsを更新したがtsup.config.tsを忘れる
  - 旧ファイル削除時に旧エクスポートパスを残す
- **効果**:
  - `Module not found`エラーの防止
  - ビルド成功を保証
  - import文が正しく解決される
- **発見日**: 2026-02-04
- **関連タスク**: TASK-FIX-1-1-TYPE-ALIGNMENT

### 型定義ファイルのカバレッジ寄与パターン

- **状況**: 型定義ファイル（.d.ts相当の.ts）のカバレッジが0%で気になる場合
- **パターン**: 型定義ファイルはランタイムコードを含まないため、カバレッジ対象外として扱う
- **判断基準**:
  | ファイル内容 | カバレッジ寄与 | 対応 |
  | ------------ | -------------- | ---- |
  | type/interface定義のみ | 0%（正常） | 無視してOK |
  | export const定数あり | ≥0% | テスト追加検討 |
  | ランタイム関数あり | 要カバレッジ | テスト必須 |
- **効果**:
  - 不要なテスト追加を回避
  - カバレッジ目標の正しい解釈
  - Phase 6/7での混乱防止
- **発見日**: 2026-02-04
- **関連タスク**: TASK-FIX-1-1-TYPE-ALIGNMENT

### Discriminated UnionのDRY原則適用パターン（TASK-FIX-1-1-TYPE-ALIGNMENT）

- **状況**: Discriminated Union型で各バリアントに共通フィールドがある場合
- **パターン**: 共通フィールドをBase型として抽出し、各バリアントでIntersection型として合成
- **例**（TASK-FIX-1-1-TYPE-ALIGNMENT）:

  ```typescript
  // Before: 各バリアントで重複定義
  type SkillStreamMessage =
    | { type: "assistant"; executionId: string; timestamp: number; content: ... }
    | { type: "tool_use"; executionId: string; timestamp: number; content: ... }
    | ...

  // After: Base型抽出でDRY
  interface BaseStreamMessage {
    executionId: string;
    timestamp: number;
  }
  type SkillStreamMessage =
    | (BaseStreamMessage & { type: "assistant"; content: ... })
    | (BaseStreamMessage & { type: "tool_use"; content: ... })
    | ...
  ```

- **効果**:
  - 共通フィールド追加時の修正箇所が1箇所
  - コードの意図が明確（共通 vs バリアント固有）
  - TypeScriptの型推論が正しく機能
- **発見日**: 2026-02-04
- **関連タスク**: TASK-FIX-1-1-TYPE-ALIGNMENT

### import文一括置換の安全性パターン

- **状況**: 型定義の移行でimport文を一括置換する必要がある場合
- **パターン**: sed/awkではなくIDE機能またはEditツールで1ファイルずつ確認しながら置換
- **危険なアプローチ**:
  | 方法 | リスク |
  | ---- | ------ |
  | `sed -i 's/old/new/g'` | 予期しない箇所も置換される可能性 |
  | `find . -exec sed` | ファイル全体への影響が見えない |
  | 正規表現一括置換 | エスケープ漏れで破壊的変更 |
- **安全なアプローチ**:
  | 方法 | メリット |
  | ---- | -------- |
  | IDE Find/Replace（プレビュー付き） | 変更箇所を事前確認可能 |
  | Claude Code Editツール | 1ファイルずつ差分確認 |
  | 手動置換（少数ファイル時） | 確実性が高い |
- **効果**:
  - 意図しない変更の防止
  - 変更の追跡可能性
  - ロールバックが容易
- **発見日**: 2026-02-04
- **関連タスク**: TASK-FIX-1-1-TYPE-ALIGNMENT

---

## 認証UIバグ修正パターン（AUTH-UI-001）

> AUTH-UI-001（認証UIの3つのバグ修正）タスクで検証されたパターン。既実装済みコードの発見と検証、テスト環境問題の切り分けに関する知見。

### 既実装済み修正の発見パターン

- **状況**: バグ修正タスクを開始したが、調査の結果、3つの修正がすべて既に実装済みだった
- **パターン**: Phase 2（設計）の段階で実装コードを詳細に確認し、修正が既に適用されているかを早期に判定
- **例**（AUTH-UI-001）:
  | 修正対象 | 期待する修正 | 実装状況 | 発見箇所 |
  | -------- | ------------ | -------- | -------- |
  | z-index問題 | z-index値を高くする | ✅ 実装済み | AccountSection/index.tsx:501 (`z-[9999]`) |
  | フォールバック | user_metadataへの代替処理 | ✅ 実装済み | profileHandlers.ts:66-85 (`isUserProfilesTableError`) |
  | 状態更新 | fetchLinkedProviders呼び出し | ✅ 実装済み | authSlice.ts:342-345 |
- **効果**:
  - Phase 5（実装）で「変更なし」という結論に至っても、テストと検証で品質を保証
  - 既存実装の正当性をドキュメント化
  - 重複実装のリスク回避
- **発見日**: 2026-02-04
- **関連タスク**: AUTH-UI-001

### テスト環境問題と実装コードの切り分けパターン

- **状況**: テストが失敗しているが、実装コード自体は正常に動作している場合
- **パターン**: テスト失敗の原因が「テスト環境設定」か「実装コードのバグ」かを明確に切り分け、テスト環境問題は未タスク化して本タスクはブロックしない
- **例**（AUTH-UI-001）:
  | テストファイル | 結果 | 原因 | 対応 |
  | -------------- | ---- | ---- | ---- |
  | AccountSection.portal.test.tsx | ✅ 27 PASS | - | - |
  | authSlice.test.ts | ✅ 105 PASS | - | - |
  | profileHandlers.test.ts | ❌ 33 FAIL | IPCモック環境問題 | UT-AUTH-001として未タスク化 |
- **判断基準**:
  1. 手動テスト（Phase 11）で機能が正常動作するか確認
  2. 実装コードのカバレッジが他のテストで補完されているか確認
  3. 失敗原因がモック設定・環境依存であることを特定
- **効果**:
  - 本タスクの完了をテスト環境問題でブロックしない
  - 実装品質と環境品質を分離して管理
  - 適切な優先度で未タスクを管理
- **発見日**: 2026-02-04
- **関連タスク**: AUTH-UI-001, UT-AUTH-001

### React Portalによるz-index問題解決パターン

- **状況**: ドロップダウンメニューやモーダルが他のUI要素に隠れる場合
- **パターン**: React Portalで要素をbody直下にテレポートし、高いz-index値（z-[9999]）を適用
- **例**（AUTH-UI-001）:
  - アバター編集メニューがサイドバー（z-50）に隠れる問題
  - 解決: `createPortal()` + `z-[9999]`クラス適用
- **z-index階層設計**:
  | z-index値 | 用途 | 例 |
  | --------- | ---- | -- |
  | z-0 | 通常コンテンツ | メインコンテンツ |
  | z-10 | 浮遊要素 | カード、パネル |
  | z-50 | サイドバー・ドロップダウン | 通常のドロップダウン |
  | z-[100] | モーダル | 確認ダイアログ |
  | z-[9999] | ポップアップメニュー | アバター編集メニュー |
  | z-[10000] | 緊急通知 | エラートースト |
- **効果**:
  - 親要素のstacking contextに依存しない
  - 確実に最前面に表示される
  - z-index戦争（無秩序なz-index値の競争）を回避
- **発見日**: 2026-02-04
- **関連タスク**: AUTH-UI-001

### Supabase認証状態変更イベント後の即時UI更新パターン

- **状況**: OAuthプロバイダーの連携解除後にUIがすぐに更新されない場合
- **パターン**: `AUTH_STATE_CHANGED`イベントハンドラ内で関連データを再取得
- **例**（AUTH-UI-001）:
  - 連携解除後、`fetchLinkedProviders()`を呼び出してプロバイダー一覧を更新
  - `fetchProfile()`でプロフィール情報も同時に更新
- **実装**:
  | イベント | 処理 | 目的 |
  | -------- | ---- | ---- |
  | AUTH_STATE_CHANGED | fetchProfile() | ユーザー名・アバター更新 |
  | AUTH_STATE_CHANGED | fetchLinkedProviders() | 連携プロバイダー一覧更新 |
- **効果**:
  - リロードなしでUIが即座に更新される
  - ユーザー体験の向上（3秒以内の更新を保証）
  - 状態の一貫性を維持
- **発見日**: 2026-02-04
- **関連タスク**: AUTH-UI-001

### Phase 12 ドキュメント更新の完全性保証パターン

- **状況**: Phase 12の初回パスで更新漏れが多数発生する（DEBT-SEC-001では9件の漏れ）
- **問題**: Phase 12の更新対象が多岐にわたり（SKILL.md x2, LOGS.md x2, topic-map.md, completed-tasks移動, task-workflow.md, 関連仕様書, artifacts.json等）、記憶に頼ると必ず漏れが発生する
- **パターン**: 以下の3段階で機械的に完全性を保証する
  1. **開始前**: `06-known-pitfalls.md` を読み直し、P1〜P4パターンを意識に上げる
  2. **対象列挙**: `grep -rn "TASK_ID" references/` で更新対象を事前に全列挙する
  3. **消化**: `05-task-execution.md` のPhase 12チェックリストを1ステップずつ機械的に消化する（全Step確認前に「完了」と記載しない）
- **例**（DEBT-SEC-001）:
  | 漏れた項目 | 該当する既知パターン | 原因 |
  | ---------- | -------------------- | ---- |
  | SKILL.md x2 未更新 | P1（LOGS.md 2ファイル更新漏れの変種） | 2ファイル更新が必要なことを忘れた |
  | topic-map.md 未再生成 | P2 | `node generate-index.js` 実行を忘れた |
  | task-workflow.md 未登録 | P3（未タスク3ステップ不完全） | 指示書作成のみで完了と誤認 |
  | documentation-changelog.md 早期完了記載 | P4 | 全Step確認前に「完了」と記載 |
- **効果**:
  - 既知パターンの再現を事前に防止できる
  - 更新対象の見落としを grep による機械的列挙で防止
  - チェックリストの段階的消化で進捗を可視化
- **発見日**: 2026-02-06
- **関連タスク**: DEBT-SEC-001

### 未タスク「既存タスクに包含」判断の追跡性確保パターン

- **状況**: Phase 12 Task 4（未タスク検出）で、検出した未タスクを「既存タスクのスコープに包含される」と判断して独立タスク化しない場合
- **問題**: 包含と判断しただけでは、包含先の仕様書にそのスコープが明記されず、後で実装漏れが発生するリスクがある
- **パターン**: 包含判断時に以下の2ステップを必ず実行する
  1. **包含先の仕様書更新**: 包含先タスクの仕様書の「含むもの」セクション（またはスコープ定義）に、包含される内容を明示的に追記する
  2. **task-workflow.md登録**: 残課題テーブルに「包含先: TASK-XXX」の形式で記録し、追跡可能にする
- **例**（DEBT-SEC-001）:
  - 未タスク UT-SEC-001（state parameterのユニットテスト不足）をDEBT-SEC-002（PKCE実装）のスコープに包含
  - DEBT-SEC-002の仕様書に「state parameterテスト拡充もスコープに含む」を追記
  - task-workflow.md残課題テーブルに登録
- **判断基準**:
  | 条件 | 対応 |
  | ---- | ---- |
  | 包含先タスクが明確に存在する | 包含先仕様書にスコープ追記 + task-workflow.md登録 |
  | 包含先タスクが不明確 | 独立した未タスク仕様書を作成（3ステップ完全実施） |
  | 複数タスクにまたがる可能性 | 独立した未タスク仕様書を作成 |
- **効果**:
  - 包含判断の追跡性を確保
  - 包含先タスク実装時にスコープ漏れを防止
  - P3パターン（未タスク3ステップ不完全）の変種を防止
- **発見日**: 2026-02-06
- **関連タスク**: DEBT-SEC-001, UT-SEC-001, DEBT-SEC-002

### 未タスク仕様書Level A化パターン

- **状況**: 未タスクを作成する際、簡易的な記述（タイトルと概要のみ）では情報が不足し、後で実装時に詳細を再調査する必要が生じる
- **問題**: 簡易的な未タスク仕様書は自己完結性が低く、以下の問題を引き起こす
  1. 実装時に要件の詳細が不明で再調査が必要
  2. 完了条件が曖昧で完了判断ができない
  3. 参照資料が不明で関連コードを探す時間がかかる
- **パターン**: 全ての未タスク仕様書を9セクション構成で作成する（Level A品質）
- **9セクション構成**:
  | セクション | 内容 | 必須 |
  | ---------- | ---- | ---- |
  | 1. タイトル（h1） | タスクID + 日本語名 | ✅ |
  | 2. メタ情報 | 作成日、ステータス、優先度、関連タスク | ✅ |
  | 3. 目的 | なぜこのタスクが必要か（1-2文） | ✅ |
  | 4. 実行タスク | 具体的な作業項目リスト | ✅ |
  | 5. 参照資料 | 関連ファイルパス、仕様書リンク | ✅ |
  | 6. 実行手順 | ステップバイステップの作業手順 | ✅ |
  | 7. 成果物 | 作成/更新するファイル一覧 | ✅ |
  | 8. 完了条件 | チェックリスト形式の完了判断基準 | ✅ |
  | 9. 次Phase | 完了後の次のアクション（PR作成等） | △ |
- **例**（TASK-FIX-15-1）:
  - 検出した未タスク（TASK-FIX-15-2-TYPE-CONSOLIDATION）を即座に9セクション構成で作成
  - 参照資料に具体的なファイルパスを5件記載
  - 完了条件を4項目のチェックリストで明示
- **効果**:
  - 後続タスク実行時の情報不足を防止
  - 自己完結性の確保（他の資料を参照せずに着手可能）
  - タスク見積もり精度の向上
- **発見日**: 2026-02-09
- **関連タスク**: TASK-FIX-15-1

### Phase 12 3ステップ完全性確認パターン

- **状況**: Phase 12 Task 4（未タスク検出）で、指示書作成のみで完了と誤認し、後続の2ステップを漏らす
- **問題**: P3パターン（未タスク3ステップ不完全）が繰り返し発生する
  - 指示書は作成したが、task-workflow.mdへの登録を忘れた
  - task-workflow.mdに登録したが、関連仕様書へのリンク追加を忘れた
- **パターン**: 3ステップを機械的にチェックするワークフローを確立
- **3ステップチェックリスト**:
  | Step | 作業内容 | 確認方法 | チェック |
  | ---- | -------- | -------- | -------- |
  | 1 | `unassigned-task/`に指示書作成 | ファイル存在確認 | ☐ |
  | 2 | `task-workflow.md`残課題テーブルに登録 | grep "TASK-ID" で確認 | ☐ |
  | 3 | 関連仕様書に参照リンク追加 | 関連箇所を開いて確認 | ☐ |
- **実行手順**:
  1. 未タスクを検出したら、まず3ステップの全てを書き出す
  2. Step 1完了後、すぐにStep 2に着手（記憶が新しいうちに）
  3. Step 2完了後、すぐにStep 3に着手
  4. 全Step完了後、documentation-changelog.mdに記録
- **例**（TASK-FIX-15-1）:
  - 未タスク TASK-FIX-15-2-TYPE-CONSOLIDATION を検出
  - Step 1: `docs/30-workflows/unassigned-task/task-fix-15-2-type-consolidation.md` 作成
  - Step 2: `task-workflow.md` 残課題テーブルに優先度、関連タスクとともに登録
  - Step 3: `interfaces-agent-sdk-executor.md` に関連タスクリンク追加
- **効果**:
  - P3パターンの再発を確実に防止
  - 未タスクの追跡性を100%確保
  - Phase 12完了後の検証工数を削減
- **発見日**: 2026-02-09
- **関連タスク**: TASK-FIX-15-1

#### 4並列エージェントによるPhase 1分析パターン（TASK-9A-C 2026-02-19）

- **状況**: Phase 1の4タスク（既存コンポーネント分析、UI要件定義、コンポーネント階層定義、インタラクション仕様）を独立した4エージェントで並列実行
- **結果**: 全4ファイル（計108KB）が正常に生成。レートリミット発生もファイル書き込み完了後だったためデータ損失なし
- **適用条件**: Phase 1の各タスクが互いに依存しない場合（入力データが共通で、出力が独立ファイルの場合）
- **注意**: 並列数は3-4が上限目安（レートリミット回避）。4並列では3/4がレートリミットに到達した実績あり
- **手順**:
  1. Phase 1の各タスクの入力・出力を確認し、相互依存がないことを検証
  2. Task toolで各タスクを独立したSubAgentとして並列起動
  3. 全エージェントの完了を待機し、成果物の整合性を確認
- **教訓**: 4並列は上限に近い。安定運用には2-3並列が推奨。重要度の高いタスクを先行実行し、残りを後続バッチで処理する方式が安全
- **発見日**: 2026-02-19
- **関連タスク**: TASK-9A-C

#### 既知Pitfall仕様書事前組み込みパターン（TASK-9A-C 2026-02-19）

- **状況**: Phase 4/5/6仕様書にP31（Zustand無限ループ）、P39（happy-dom userEvent非互換）、P40（テスト実行ディレクトリ依存）を事前記載
- **結果**: 実装者が仕様書読了時点でPitfallを認知でき、実装時の再発防止に有効
- **適用条件**: 06-known-pitfalls.md に該当するPitfallがある場合
- **テンプレート**: Phase仕様書の「⚠️ 既知の Pitfall 注意事項」テーブル
  ```markdown
  | Pitfall ID | タイトル | 対策 |
  | ---------- | -------- | ---- |
  | P31 | Zustand無限ループ | 個別セレクタ使用 |
  | P39 | happy-dom userEvent非互換 | fireEvent使用 |
  | P40 | テスト実行ディレクトリ依存 | cd apps/desktop で実行 |
  ```
- **手順**:
  1. タスクの技術スタックから関連Pitfallを06-known-pitfalls.mdで検索
  2. 該当Pitfallを仕様書の「注意事項」セクションにテーブル形式で記載
  3. 各Pitfallの対策を簡潔に記載し、詳細は06-known-pitfalls.mdへリンク
- **教訓**: 事後修正より事前認知の方がコストが低い。仕様書作成時に既知Pitfallを組み込むことで、実装時の試行錯誤を削減できる
- **発見日**: 2026-02-19
- **関連タスク**: TASK-9A-C

#### Phase 12 spec-update-workflow全Step逐次実行パターン（UT-STORE-HOOKS-COMPONENT-MIGRATION-001 2026-02-12）

- **状況**: Phase 12でTask 2（システムドキュメント更新）のStep 1-A〜1-E + Step 2を一部省略してしまった
- **解決策**:
  1. documentation-changelog.md に各Step欄を事前に作成（空欄状態）
  2. Step 1-A → 1-B → 1-C → 1-D → 1-E → Step 2 の順に逐次実行
  3. 各Step完了後にdocumentation-changelog.mdの該当欄を✅に更新
  4. 全Step完了後にのみ「Phase 12完了」と記載
- **教訓**: 12項目もの更新漏れが発生。Phase 12は最も漏れやすいPhaseであり、チェックリスト駆動が必須
- **発見日**: 2026-02-12
- **関連**: P1, P2, P4, P25, P27, P29

#### worktree環境でもStep 1-Aを先送りしないパターン（UT-FIX-SKILL-REMOVE-INTERFACE-001 再監査 2026-02-21）

- **状況**: worktree環境で Phase 12 Task 2 を実行した際に「LOGS/SKILL/仕様更新はマージ後でよい」と誤判断し、完了条件と実体が不一致になる
- **問題**:
  1. `documentation-changelog.md` が「スキップ」で埋まり、仕様同期が空振りになる
  2. 未実施タスクが `completed-tasks/unassigned-task/` に混在しても気づけない
  3. `task-workflow.md` の参照だけ先行修正して、物理配置と逆転する
- **パターン**:
  1. worktreeでも Step 1-A（LOGS.md x2, SKILL.md x2, 関連仕様更新）を通常実施する
  2. 未実施タスクの誤配置を機械検出する
  3. 物理ファイル移動と `task-workflow.md` 参照更新を同一ターンで実施する
  4. `verify-unassigned-links.js` で最終検証する
- **実行コマンド**:
  ```bash
  rg -n "^\\| ステータス\\s*\\|.*未着手|^\\| ステータス\\s*\\|.*未実施|^\\| ステータス\\s*\\|.*進行中" \
    docs/30-workflows/completed-tasks/unassigned-task -g "*.md"

  node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
  ```
- **効果**:
  - Phase 12「実施済み」と仕様実体の不一致を防止
  - 未実施タスクの配置ドリフト再発を防止
  - worktree運用時の先送り判断を排除し、ターン内完結率を向上
- **発見日**: 2026-02-21
- **関連タスク**: UT-FIX-SKILL-REMOVE-INTERFACE-001, UT-FIX-TS-VITEST-TSCONFIG-PATHS-001, TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001


#### P44 IPCインターフェース不整合の体系的修正パターン（UT-FIX-SKILL-IMPORT-INTERFACE-001 2026-02-21）

- **状況**: Main Processハンドラの引数型（`{ skillIds: string[] }`）とPreload側の実引数（`string`）が不一致で、ランタイムバリデーションエラーが発生
- **パターン**: 「呼び出し元が多い側を変更しない」鉄則に基づき、ハンドラ側をPreloadに合わせて修正する
- **修正手順**:
  1. Preload側（正しい方）の引数形式を確認し、ハンドラをその形式に合わせて修正（Preload変更不要）
  2. P42準拠の3段バリデーション追加（`typeof` → `=== ""` → `.trim() === ""`）
  3. skill:removeの先行修正（UT-FIX-SKILL-REMOVE-INTERFACE-001）と同一アプローチを採用（パターン統一）
  4. 配列ラップ `[skillName]` でサービス層API互換性を維持
- **効果**:
  - ランタイムのバリデーションエラーが解消
  - Preload/Renderer側のコード変更ゼロ（影響範囲の最小化）
  - skill:import と skill:remove で統一された修正パターンを確立
- **教訓**: IPCインターフェース不整合の修正は「呼び出し元が多い側を変更しない」が鉄則。先行タスク（skill:remove）と同一アプローチを採用することでパターン統一と品質安定を実現する
- **発見日**: 2026-02-21
- **関連タスク**: UT-FIX-SKILL-IMPORT-INTERFACE-001
- **関連Pitfall**: P23, P32, P42, P44

#### 7並列エージェント仕様書生成パターン（UT-FIX-SKILL-IMPORT-INTERFACE-001 2026-02-21）

- **状況**: Phase 1-12の全成果物を並列エージェントで一括生成する必要があった
- **パターン**: Phase間の依存関係を考慮し、7エージェントを段階的に投入する
  | Agent | 担当Phase | 内容 | 投入タイミング |
  | ----- | --------- | ---- | -------------- |
  | 1 | Phase 1 | 要件定義成果物 | 即時投入 |
  | 2 | Phase 2 | 設計成果物 | 即時投入 |
  | 3 | Phase 3 | レビュー成果物 | 即時投入 |
  | 4 | Phase 4-5 | テスト+実装（コード変更） | Phase 1-3分析完了後 |
  | 5 | Phase 7-9 | カバレッジ+リファクタ+品質成果物 | Phase 6完了後 |
  | 6 | Phase 10-11 | レビュー+手動テスト成果物 | Phase 6完了後 |
  | 7 | Phase 12 | ドキュメント更新成果物 | Phase 6完了後 |
- **適用条件**: Phase 4-5（コード変更）はPhase 1-3（分析）の結果に依存するため、完了後に投入。Phase 7-12の成果物生成はPhase 6（テスト拡充）完了後に並列投入可能
- **注意**: 1エージェントあたり3ファイル以下でrate limit回避（P43対策）。Agent 4（コード変更）の結果をAgent 5-7に伝達するため、Agent 4完了後にAgent 5-7を起動し変更内容をプロンプトに含める
- **教訓**: 並列数の多さよりも依存関係の正確な把握が重要。Phase間の依存を無視した全並列投入はコンテキスト不整合を引き起こす
- **発見日**: 2026-02-21
- **関連タスク**: UT-FIX-SKILL-IMPORT-INTERFACE-001
- **関連パターン**: P43（Phase 12サブエージェントのrate limit中断）

#### IPC不整合の姉妹タスク横展開検出パターン（UT-FIX-SKILL-IMPORT-INTERFACE-001 2026-02-20）

- **状況**: skill:remove のIPC不整合修正後、同一パターンが skill:import にも存在する可能性を検出する必要があった
- **アプローチ**: `grep -rn "args\?" apps/desktop/src/main/ipc/` で全ハンドラの引数形式を一括検索し、Preload側の `safeInvoke` 呼び出しと突合する「横展開検出」を実施
- **結果**: skill:import でも同一パターンの不整合を発見し、姉妹タスクとして即時修正。個別の問題報告→調査→修正のサイクルを省略
- **適用条件**: IPC関連バグ修正後のPhase 12未タスク検出時。同一カテゴリのチャンネル群（skill:*, auth:* 等）に対して横展開検証を実施
- **発見日**: 2026-02-20
- **関連タスク**: UT-FIX-SKILL-IMPORT-INTERFACE-001, UT-FIX-SKILL-REMOVE-INTERFACE-001

---

## IPC型不整合解決パターン（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001）

### IPC戻り値型2ステップ変換パターン（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 2026-02-21）

- **状況**: `skill:import` IPC ハンドラが `ImportResult` を返すが、Renderer は `ImportedSkill` を期待。2つの型は共有フィールドがゼロ
- **問題**: サービス層の「操作結果型」と UI 層の「データ表現型」の不一致。型変換（マッピング）では解決できない（フィールドが完全に異なる）
- **パターン**: 2ステップ呼び出し: (1)操作実行（importSkills）→ (2)データ取得（getSkillByName）
- **実装ポイント**:
  1. 操作実行（Step 1）で `ImportResult` を取得し、`success` と `importedCount` を検証
  2. データ取得（Step 2）で `ImportedSkill` を取得し、null チェック
  3. 各ステップの失敗は独立したエラーコード（`IMPORT_ERROR`）で処理
  4. 入口でP42準拠の3段バリデーション（型チェック → 空文字列 → trim空文字列）
- **苦戦箇所と教訓**:
  | # | 苦戦ポイント | 教訓 |
  | --- | --- | --- |
  | 1 | IPC インターフェース不整合がランタイムまで検出不可 | IPC 境界は「型安全ではない」と認識し、ランタイム型チェックを必ず入れる |
  | 2 | ImportResult と ImportedSkill の型形状が完全に異なる | POST系操作の IPC ハンドラは「操作＋取得」の2ステップを標準化する |
  | 3 | 引数名の契約ドリフト（skillId vs skillName） | 引数名は「実際の値のセマンティクス」に合致させる |
  | 4 | 3層同時更新の必要性（Main・Preload・Test） | IPC 変更時は「影響範囲リスト」を事前に作成する |
  | 5 | Phase 12で7+仕様書の同時更新 | P43準拠: 3ファイル以下/エージェントに分割、LOGSは最終ステップで記録 |
- **結果**: 174テスト全PASS、修正対象10分岐100%カバー、Branch Coverage 84.9%
- **適用条件**: サービス戻り値と UI 期待型に共有フィールドがない場合、または操作結果ではなくリソース表現が必要な場合
- **関連パターン**: [S13: architecture-implementation-patterns.md](../../aiworkflow-requirements/references/architecture-implementation-patterns.md)
- **関連Pitfall**: P23, P32, P42, P44, P45
- **発見日**: 2026-02-21
- **関連タスク**: UT-FIX-SKILL-IMPORT-RETURN-TYPE-001

### Phase 12 並列エージェント最適化パターン（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 2026-02-21）

- **状況**: Phase 12 Task 2（システム仕様書更新）で7+ファイルを更新する必要がある
- **問題**: P43（Phase 12サブエージェントのrate limit中断）: 1エージェントに7ファイルを委譲すると中断リスクが高い
- **パターン**: 3ファイル以下/エージェントに分割し、3並列で実行
- **実装ポイント**:
  | エージェント | 担当ファイル | 編集数 |
  | --- | --- | --- |
  | Agent 1 | interfaces-agent-sdk-skill.md, arch-electron-services.md, security-skill-ipc.md | 6件 |
  | Agent 2 | LOGS.md x2, SKILL.md x2 | 4件 |
  | Agent 3 | task-workflow.md | 3件 |
- **重要な順序**: LOGS.md への「完了」記録は全ファイル更新後の最終ステップとする（P43教訓）
- **結果**: 全3エージェントが正常完了。rate limit 中断なし
- **適用条件**: Phase 12 Task 2で4ファイル以上の仕様書更新がある場合
- **教訓**: 各エージェントには編集対象の正確な行番号と前後のコンテキストを提供することで、編集精度が向上する。事前に Read tool で確認してから起動する
- **発見日**: 2026-02-21
- **関連タスク**: UT-FIX-SKILL-IMPORT-RETURN-TYPE-001

#### Phase 12 検証スクリプト実体探索先行パターン（UT-IMP-PHASE12-SCRIPT-PATH-DISCOVERY-GUARD-001）

- **状況**: `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit-unassigned-tasks` の実行前にスクリプト所在を誤認しやすい
- **解決策**:
  1. 検証開始前に `rg --files .claude/skills | rg 'verify-all-specs|validate-phase-output|verify-unassigned-links|audit-unassigned-tasks'` を実行する
  2. `verify -> validate -> links -> audit` の順序で固定実行する
  3. 実体探索結果を `spec-update-summary.md` へ同時記録する
- **効果**: 誤パス実行による手戻りを削減し、Phase 12 の証跡を同一ターンで確定できる
- **発見日**: 2026-03-04
- **関連タスク**: UT-IMP-PHASE12-SCRIPT-PATH-DISCOVERY-GUARD-001

#### Phase 12 Vitest 非watch固定パターン（UT-IMP-PHASE12-VITEST-RUN-MODE-GUARD-001）

- **状況**: `pnpm test` 実行で watch が残留し、Phase 12 の再確認証跡取得が停滞する
- **解決策**:
  1. テスト再確認は `pnpm --filter @repo/desktop exec vitest run <target>` を標準化する
  2. ルート実行ではなく対象パッケージ文脈で実行する
  3. 実行コマンドを `implementation-guide.md` / `spec-update-summary.md` に明示する
- **効果**: 非watchで決定論的に終了し、再確認フロー全体の完了時刻が安定する
- **発見日**: 2026-03-04
- **関連タスク**: UT-IMP-PHASE12-VITEST-RUN-MODE-GUARD-001

#### Phase 12 Step 1-A 四点同期 + screenshot運用ギャップ未タスク化（TASK-UI-01-D 再確認）

- **状況**: `spec-update-summary.md` と system spec 更新は完了しているが、`LOGS.md` x2 / `SKILL.md` x2 / `topic-map` 再生成が抜けることがある。加えて Phase 11 再撮影で固定出力先と `Port 5177` 競合が発生しやすい
- **解決策**:
  1. Step 1-A を「`LOGS.md` x2 + `SKILL.md` x2 + `generate-index`」の四点セットで完了判定する
  2. 再撮影運用で workflow 固定出力先がある場合は、未タスク化して `docs/30-workflows/unassigned-task/` に配置する
  3. `audit --target-file` と `audit --diff-from HEAD` を連続実行し、`currentViolations=0` を合否に使う
  4. 結果を `spec-update-summary.md` / `unassigned-task-detection.md` / `phase12-compliance-recheck.md` に同時記録する
- **効果**: Phase 12 の完了判定が再現可能になり、再撮影運用のドリフトを未タスクで追跡できる
- **発見日**: 2026-03-05
- **関連タスク**: TASK-UI-01-D-VIEWTYPE-ROUTING-NAV, UT-IMP-TASK-056D-PHASE11-SCREENSHOT-CAPTURE-PATH-GUARD-001

---

## 変更履歴

| Date           | Changes                                                                                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **2026-03-05** | **TASK-UI-01-D 再確認パターン追加**: 成功パターン「Phase 12 Step 1-A 四点同期 + screenshot運用ギャップ未タスク化」を追加。`LOGS/SKILL/topic-map` 同時更新、`docs/30-workflows/unassigned-task/` への配置、`audit --target-file` + `--diff-from HEAD` の `currentViolations=0` 固定を標準化 |
| **2026-03-04** | **TASK-UI-00-ORGANISMS 再確認パターン追加**: 成功パターン「Phase 12 UI再確認の証跡固定」を追加。`verify/validate/screenshot-coverage` 同時実行、`stat` 時刻同期、`currentViolations=0` 固定、`phase12-task-spec-compliance-check.md` 集約の4点を標準化 |
| **2026-03-04** | **workflow02再確認パターン追加**: 成功パターン「Phase 12 検証スクリプト実体探索先行」「Phase 12 Vitest 非watch固定」を追加。`rg --files` による実体解決と `pnpm --filter @repo/desktop exec vitest run` 固定で再確認の手戻りを抑止 |
| **2026-02-28** | **TASK-9E 再監査パターン追加**: 成功パターン「Phase 12 テスト件数ドリフト再同期」を追加。正本件数固定→文脈限定抽出→4点検証→未タスク化までの手順を標準化 |
| **2026-02-27** | **TASK-9H 再監査パターン追加**: 成功パターン「`phase-12-documentation.md` 完了同期」を追加。成果物5件の実体確認→ステータス同期→検証証跡固定の4ステップを標準化 |
| **2026-02-21** | **worktree運用時のPhase 12先送り誤判断を是正**: 成功パターン「worktree環境でもStep 1-Aを先送りしない」を追加。未実施タスク誤配置検出コマンド（completed配下の未着手/未実施検知）と `verify-unassigned-links.js` 最終検証を標準化 |
| **2026-02-21** | **IPC不整合姉妹タスク横展開検出パターン追加**: 成功パターン1件（Phase 12未タスク検出時の横展開検証）追加。クイックナビゲーション更新（成功47+件） |
| **2026-02-21** | **UT-FIX-SKILL-IMPORT-INTERFACE-001知見反映**: 成功パターン2件（P44 IPCインターフェース不整合体系的修正、7並列エージェント仕様書生成）・失敗パターン1件（artifacts.json Phaseステータス更新忘れ）追加。クイックナビゲーション更新（失敗9件・成功46+件） |
| **2026-02-21** | **UT-FIX-SKILL-IMPORT-RETURN-TYPE-001知見追加**: IPC型不整合解決パターン2件（IPC戻り値型2ステップ変換、Phase 12並列エージェント最適化）追加。クイックナビゲーションにIPC型不整合解決カテゴリ追加 |
| **2026-02-19** | **TASK-9A-C仕様書作成知見反映**: 成功パターン2件（4並列Phase 1分析、既知Pitfall仕様書事前組み込み）・失敗パターン2件（APIレートリミット、complete-phase.jsパス解決誤り）追加。クイックナビゲーション更新（失敗8件・成功44+件） |
| **2026-02-12** | **UT-STORE-HOOKS-COMPONENT-MIGRATION-001知見追加**: Phase 12 spec-update-workflow全Step逐次実行パターン追加（チェックリスト駆動、12項目更新漏れ防止） |
| **2026-02-11** | **TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION知見追加**: Setter Injectionによる遅延初期化パターン追加（BrowserWindow依存DI、DIパターン使い分け基準テーブル）。関連Pitfall P34/P35参照                       |
| **2026-02-10** | **UT-FIX-STORE-HOOKS-INFINITE-LOOP-001知見追加**: Zustand Store Hooks無限ループ対策パターン追加（useRefガード）。06-known-pitfalls.md連携強化（新規Pitfall登録フロー）。クイックナビゲーション更新     |
| **2026-02-09** | **TASK-FIX-15-1知見追加**: 成功パターン2件（未タスク仕様書Level A化パターン、Phase 12 3ステップ完全性確認パターン）                                                                                    |
| **2026-02-06** | **DEBT-SEC-001知見追加**: 成功パターン2件（Phase 12ドキュメント更新の完全性保証、未タスク「既存タスクに包含」判断の追跡性確保）                                                                        |
| **2026-02-04** | **AUTH-UI-001知見追加**: 認証UIバグ修正パターン4件（既実装発見、テスト環境切り分け、React Portal z-index、認証状態変更後UI更新）                                                                       |
| **2026-02-04** | **patterns.md構造最適化**: クイックナビゲーション・Phase 12 Task 2クイックリファレンス追加、search-replace-ui実装パターン3件追加（既存実装品質評価、Page Object、generate-index.jsファイル名誤認回避） |
| **2026-02-04** | **AUTH-UI-004知見追加**: 外部APIデータ正規化パターン3件（プロバイダー別フォールバック、Phase 12ドキュメント5点セット、環境依存テスト分離）                                                             |
| **2026-02-04** | **TASK-FIX-1-1-TYPE-ALIGNMENT知見追加**: 型定義統合/移行パターン4件（パッケージエクスポート更新チェック、型定義ファイルカバレッジ、Discriminated Union DRY、import文一括置換安全性）                   |
| **2026-02-03** | **マージ統合**: TASK-9B-G（サービス設計パターン4件）+ TASK-9C/9A-A（SDK統合パターン5件）を統合                                                                                                         |
| **2026-02-03** | **TASK-9B-G失敗パターン追加: 未タスク検出後のtask-workflow.md登録漏れ（3ステップ必須の誤認パターン）**                                                                                                 |
| **2026-02-03** | **TASK-9B-G知見追加: サービス設計パターン4件（Script First/Progressive Disclosure統合、Facadeパターン、定数外部化、未タスク検出3ステップ）**                                                           |
| **2026-02-03** | **TASK-9C知見追加: 成功パターン3件（Graceful SDK Fallbackパターン、queryFn DIパターン、スキル名バリデーション禁止文字サニタイズ）**                                                                    |
| **2026-02-03** | **TASK-WCE-MONACO-001知見追加: Main→Renderer IPC実装パターン（webContents.executeJavaScript逆方向クエリ、課題ID MR-01〜MR-04）**                                                                       |
| **2026-02-03** | **TASK-9A-A知見追加: 成功パターン2件（ESModuleモッキング回避パターン、汎用エラーアサーションパターン）**                                                                                               |
| **2026-02-02** | **TASK-8C-C知見追加: 成功パターン1件（Phase 12 Step 1完了チェックリストの厳格遵守 - SKILL.md更新漏れ/未タスク配置漏れ/topic-map.md再生成忘れ防止）**                                                   |
| **2026-02-02** | **TASK-8C-B知見追加: E2Eテスト設計パターン3件（ARIA属性ベースセレクタ優先、E2Eヘルパー関数分離、安定性対策3層）**                                                                                      |
| **2026-02-02** | **TASK-OPT-CI-TEST-PARALLEL-001知見追加: CI/DevOps最適化パターン2件（GitHub Actionsテスト並列実行、DevOps仕様書更新）**                                                                                |
| **2026-02-02** | **TASK-8B知見追加: 成功パターン1件（Phase 10 MINOR指摘の確実な未タスク変換）**                                                                                                                         |
| **2026-02-02** | **TASK-8A知見追加: 成功パターン4件（カバレッジ閾値免除判定、ギャップ分析ベースTDD、未タスク検出P3全件記録、vi.doMock動的再読み込み）**                                                                 |
| 2026-02-01     | TASK-8C-G知見追加: 成功パターン3件（境界値フィクスチャ設計、parseFrontmatter構造化検証、execSync決定論的テスト）                                                                                       |
| 2026-02-01     | task-imp-permission-tool-metadata-001知見追加: 成功パターン3件（Record型スタイルマッピング、IIFEレンダリング、デフォルトメタデータフォールバック）                                                     |
| 2026-01-31     | TASK-7D知見体系化: フェーズ境界遷移パターン（4件）・失敗回避パターン（3件）追加                                                                                                                        |
| 2026-01-30     | TASK-7Dフィードバック反映: 成功パターン4件追加（forwardRef テスト、Exclude型設定マップ、個別セレクタ、並列エージェント）                                                                               |
| 2026-01-28     | TASK-3-2-Cフィードバック反映: 成功パターン3件追加（React Context一括更新、動的更新間隔、Page Visibility API）                                                                                          |
| 2026-01-27     | TASK-3-2-Aフィードバック反映: 成功パターン5件追加（R-ID方式、日常例え、ユーティリティ分離、未タスク変換）                                                                                              |
| 2026-01-26     | Phase 12出力要件漏れパターン追加、成功パターンにチェックリスト追加                                                                                                                                     |
| 2026-01-24     | 初版作成、Markdown見出しパターン追加                                                                                                                                                                   |
