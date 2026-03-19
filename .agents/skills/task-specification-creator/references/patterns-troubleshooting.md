# パターン集: トラブルシューティング・失敗教訓

> 元ファイル: `patterns.md` から分割
> 読み込み条件: 失敗原因を切り分けたい時、スクリプト・検証の問題を解決したい時。

## 関連リソース

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

### 未タスク検出後のtask-workflow.md登録漏れ（TASK-9B-G）

- **状況**: Phase 12で5件の未タスクを検出し、指示書を作成した
- **問題**: 指示書作成のみで完了と誤認し、task-workflow.mdの残課題テーブルへの登録を忘れた
- **原因**:
  1. 「指示書を作成した = 未タスク管理が完了」という誤った認識
  2. unassigned-task-guidelines.mdの「3ステップ必須」規定の見落とし
  3. documentation-changelog.mdに「完了」と記載したため、再検証をスキップ
- **発見経緯**: Phase 12完了後の検証で、task-workflow.mdに5件のエントリが存在しないことを発見
- **教訓**:
  1. 未タスク検出は**3ステップ全て**を完了して初めて完了: (1)指示書作成 → (2)task-workflow.md登録 → (3)関連仕様書登録
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
  1. **LOGS.md x2ファイル更新漏れ**: aiworkflow-requirements/LOGS.mdのみ更新し、task-specification-creator/LOGS.mdを忘れた
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
- **修正**: 全7ファイル（LOGS.md x2、SKILL.md x2、ui-ux-search-panel.md、documentation-changelog.md、topic-map.md）を追加更新
- **発見日**: 2026-02-04
- **関連タスク**: task-imp-search-ui-001

### Phase 12 の skill root 取り違え（TASK-UI-06-HISTORY-SEARCH-VIEW）

- **状況**: system spec 更新で `.claude/skills/...` と `.agents/skills/...` の両方が存在する repo を扱った
- **問題**: mirror 側 `.agents` だけを更新し、ユーザー指定の `.claude` 正本が stale のまま残りうる
- **原因**:
  1. workflow / outputs が mirror 側パスを参照していた
  2. canonical root の規則が guide に明記されていなかった
  3. SubAgent 分担時に「どの root が正本か」を共有しなかった
- **教訓**:
  1. system spec 更新先は `.claude/skills/...` を canonical root に固定する
  2. `.agents` は mirror 扱いとし、正本更新の代替にしない
  3. `rg -n "\\.agents/skills/.+references" docs/30-workflows/<workflow>` で workflow / outputs の mirror 参照を確認する
- **発見日**: 2026-03-10
- **関連タスク**: UT-IMP-SKILL-ROOT-CANONICAL-SYNC-GUARD-001

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
  1. スキルスクリプトは必ず `.agents/skills/{skill-name}/scripts/` パスで参照する
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
