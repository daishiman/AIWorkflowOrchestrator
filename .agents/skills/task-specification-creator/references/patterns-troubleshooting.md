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
