# エージェント実行・DevOps最適化パターン集

> 親ファイル: [patterns.md](patterns.md)

## 目的

並列エージェント実行の最適化、Phase実行戦略、CI/CD最適化に関する実証済みパターン。

---

## 並列エージェント実行パターン

### 4並列エージェントによるPhase 1分析パターン（TASK-9A-C）

- **状況**: Phase 1の4タスク（既存コンポーネント分析、UI要件定義、コンポーネント階層定義、インタラクション仕様）を独立した4エージェントで並列実行
- **適用条件**: Phase 1の各タスクが互いに依存しない場合（入力データが共通で、出力が独立ファイルの場合）
- **注意**: 並列数は3-4が上限目安（レートリミット回避）。4並列では3/4がレートリミットに到達した実績あり
- **手順**:
  1. Phase 1の各タスクの入力・出力を確認し、相互依存がないことを検証
  2. Task toolで各タスクを独立したSubAgentとして並列起動
  3. 全エージェントの完了を待機し、成果物の整合性を確認
- **発見日**: 2026-02-19
- **関連タスク**: TASK-9A-C

### 既知Pitfall仕様書事前組み込みパターン（TASK-9A-C）

- **状況**: Phase 4/5/6仕様書にP31（Zustand無限ループ）、P39（happy-dom userEvent非互換）、P40（テスト実行ディレクトリ依存）を事前記載
- **適用条件**: 06-known-pitfalls.md に該当するPitfallがある場合
- **テンプレート**: Phase仕様書の「既知の Pitfall 注意事項」テーブル
  ```markdown
  | Pitfall ID | タイトル | 対策 |
  | ---------- | -------- | ---- |
  | P31 | Zustand無限ループ | 個別セレクタ使用 |
  | P39 | happy-dom userEvent非互換 | fireEvent使用 |
  | P40 | テスト実行ディレクトリ依存 | cd apps/desktop で実行 |
  ```
- **教訓**: 事後修正より事前認知の方がコストが低い
- **発見日**: 2026-02-19
- **関連タスク**: TASK-9A-C

### 7並列エージェント仕様書生成パターン（UT-FIX-SKILL-IMPORT-INTERFACE-001）

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
- **注意**: 1エージェントあたり3ファイル以下でrate limit回避（P43対策）
- **発見日**: 2026-02-21
- **関連タスク**: UT-FIX-SKILL-IMPORT-INTERFACE-001

### IPC不整合の姉妹タスク横展開検出パターン

- **アプローチ**: `grep -rn "args\?" apps/desktop/src/main/ipc/` で全ハンドラの引数形式を一括検索し、Preload側の `safeInvoke` 呼び出しと突合する「横展開検出」を実施
- **適用条件**: IPC関連バグ修正後のPhase 12未タスク検出時。同一カテゴリのチャンネル群（skill:*, auth:* 等）に対して横展開検証を実施
- **発見日**: 2026-02-20
- **関連タスク**: UT-FIX-SKILL-IMPORT-INTERFACE-001

### Phase 12 並列エージェント最適化パターン（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001）

- **パターン**: 3ファイル以下/エージェントに分割し、3並列で実行
- **実装ポイント**:
  | エージェント | 担当ファイル | 編集数 |
  | --- | --- | --- |
  | Agent 1 | interfaces-agent-sdk-skill.md, arch-electron-services.md, security-skill-ipc.md | 6件 |
  | Agent 2 | LOGS.md x2, SKILL.md x2 | 4件 |
  | Agent 3 | task-workflow.md | 3件 |
- **重要**: LOGS.md への「完了」記録は全ファイル更新後の最終ステップとする（P43教訓）
- **発見日**: 2026-02-21
- **関連タスク**: UT-FIX-SKILL-IMPORT-RETURN-TYPE-001

### Phase 4-5 統合実行推奨パターン

- **状況**: Phase 4（テスト作成 Red）と Phase 5（実装 Green）を別エージェントで分割実行すると、型定義が実装前に未確定なためテストコードでコンパイルエラーが発生しやすい
- **パターン**: 型定義 → テスト（Red）→ 実装（Green）を 1 エージェントで統合実行し、Green 状態を直接確認してから次 Phase へ進む
- **比較**:
  | 実行方式 | リスク | 推奨度 |
  | --- | --- | --- |
  | Phase 4 のみ実行後に別エージェントで Phase 5 | 型未定義→コンパイルエラー | 非推奨 |
  | Phase 4-5 を 1 エージェントで統合実行 | なし | **推奨** |
- **適用条件**: 新規型定義（interface / type）を伴う実装タスク全般
- **発見日**: 2026-03-16
- **関連タスク**: TASK-IMP-SKILL-DOCS-AI-RUNTIME-001

---

## Phase 12 実行効率化パターン

### Phase 12 spec-update-workflow全Step逐次実行パターン

- **解決策**:
  1. documentation-changelog.md に各Step欄を事前に作成（空欄状態）
  2. Step 1-A → 1-B → 1-C → 1-D → 1-E → Step 2 の順に逐次実行
  3. 各Step完了後にdocumentation-changelog.mdの該当欄を✅に更新
  4. 全Step完了後にのみ「Phase 12完了」と記載
- **教訓**: 12項目もの更新漏れが発生。Phase 12は最も漏れやすいPhaseであり、チェックリスト駆動が必須
- **発見日**: 2026-02-12
- **関連**: P1, P2, P4, P25, P27, P29

### worktree環境でもStep 1-Aを先送りしないパターン

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
- **発見日**: 2026-02-21
- **関連タスク**: UT-FIX-SKILL-REMOVE-INTERFACE-001

### Phase 12 検証スクリプト実体探索先行パターン

- **解決策**:
  1. 検証開始前に `rg --files .claude/skills | rg 'verify-all-specs|validate-phase-output|verify-unassigned-links|audit-unassigned-tasks'` を実行する
  2. `verify -> validate -> links -> audit` の順序で固定実行する
  3. 実体探索結果を `spec-update-summary.md` へ同時記録する
- **発見日**: 2026-03-04
- **関連タスク**: UT-IMP-PHASE12-SCRIPT-PATH-DISCOVERY-GUARD-001

### Phase 12 Vitest 非watch固定パターン

- **解決策**:
  1. テスト再確認は `pnpm --filter @repo/desktop exec vitest run <target>` を標準化する
  2. ルート実行ではなく対象パッケージ文脈で実行する
- **発見日**: 2026-03-04
- **関連タスク**: UT-IMP-PHASE12-VITEST-RUN-MODE-GUARD-001

### 同一 wave インデックス同期パターン

- **状況**: Phase 12 Task 2 で `references/` 配下の仕様書更新は完了しているのに、インデックスファイルの更新が漏れる
- **解決策**: Phase 12 Task 2 に「Step 2.5: インデックス同期」を追加し、`references/` 更新と **同一 wave** で以下を完了させる
  1. `resource-map.md` のクイックルックアップ行を追加・更新
  2. `quick-reference.md` の該当導線セクションを追加・更新
  3. `topic-map.md` を `node scripts/generate-index.js` で再生成
- **チェック方法**: `grep -n "新規ファイル名" resource-map.md quick-reference.md` でゼロヒットなら更新漏れ
- **発見日**: 2026-03-16
- **関連タスク**: TASK-IMP-SKILL-DOCS-AI-RUNTIME-001

### mirror sync 遅延パターン

- **状況**: `.claude/skills/` の仕様書を更新した後、`.agents/skills/` へのミラー同期が Phase 12 完了後に忘れられる
- **解決策**: Phase 12 の最終ステップとして以下を固定実行する
  ```bash
  diff -rq .claude/skills/ .agents/skills/
  ```
  差分 0 を確認してから完了とする。差分がある場合は `.agents/skills/` 側を `.claude/skills/` と同内容に同期する
- **適用条件**: Phase 12 完了時（仕様書変更の有無にかかわらず毎回実行）
- **発見日**: 2026-03-16
- **関連タスク**: TASK-IMP-SKILL-DOCS-AI-RUNTIME-001

### Phase 12 Step 1-A 四点同期パターン

- **解決策**:
  1. Step 1-A を「`LOGS.md` x2 + `SKILL.md` x2 + `generate-index`」の四点セットで完了判定する
  2. 再撮影運用で workflow 固定出力先がある場合は、未タスク化して `docs/30-workflows/unassigned-task/` に配置する
  3. `audit --target-file` と `audit --diff-from HEAD` を連続実行し、`currentViolations=0` を合否に使う
  4. 結果を `spec-update-summary.md` / `unassigned-task-detection.md` / `phase12-compliance-recheck.md` に同時記録する
- **発見日**: 2026-03-05
- **関連タスク**: TASK-UI-01-D-VIEWTYPE-ROUTING-NAV

---

## CI/DevOps最適化パターン

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
  - ローカル: lint/typecheck/testが並列実行でフィードバック高速化
- **発見日**: 2026-02-02
- **関連タスク**: TASK-OPT-CI-TEST-PARALLEL-001

### DevOps関連システム仕様書更新パターン

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
- **発見日**: 2026-02-02
- **関連タスク**: TASK-OPT-CI-TEST-PARALLEL-001

---

## その他の実装パターン

### 並列バックグラウンドエージェントによるドキュメント生成

- **状況**: Phase 1-12の大量の出力ドキュメントを効率的に生成する場合
- **パターン**: 独立したPhase群ごとにTask agentを並列起動し、バックグラウンド実行
- **例**（TASK-7D）:
  - Agent 1: Phase 1-3（要件分析・設計・レビュー）
  - Agent 2: Phase 4-7（テスト・実装・カバレッジ）
  - Agent 3: Phase 8-10（リファクタリング・品質・最終レビュー）
  - Agent 4: Phase 11（手動テスト）
  - Agent 5: Phase 12（ドキュメント・実装ガイド）
- **発見日**: 2026-01-30
- **関連タスク**: TASK-7D

### UX改善タスクの構造化（R-ID方式）

- **パターン**: 各改善点にR1/R2/R3...のようなRequirement IDを付与
- **効果**: 要件の追跡が容易、テストケースとの対応が明確
- **発見日**: 2026-01-27
- **関連タスク**: TASK-3-2-A

### Part 1概念説明の日常例えパターン

- **パターン**: 各技術概念に日常生活の身近な例えを対応付ける
- **例**（TASK-3-2-A）:
  | 技術概念 | 日常の例え |
  | -------------------- | ---------------------- |
  | ローディングスピナー | 電子レンジの回る皿 |
  | 相対時刻表示 | LINEのメッセージ時刻 |
  | クリップボードコピー | コピー機のコピーボタン |
- **発見日**: 2026-01-27
- **関連タスク**: TASK-3-2-A

### 既存実装品質評価パターン

- **状況**: タスク仕様書で計画された実装が、既に高品質で完成している場合
- **判断基準**:
  | 観点 | チェック項目 |
  | ---- | ------------ |
  | 機能網羅性 | 仕様書の要件がすべて実装されているか |
  | テストカバレッジ | 既存テストで80%+カバレッジが達成されているか |
  | エラーハンドリング | エッジケースが適切に処理されているか |
  | アーキテクチャ整合性 | システム仕様に準拠した設計になっているか |
- **発見日**: 2026-02-04
- **関連タスク**: task-imp-search-ui-001

### スキル名バリデーション（禁止文字サニタイズ）

- **パターン**: 禁止文字リスト `<>:"\|?*` を定義し、該当文字を含む名前を拒否またはサニタイズ
- **効果**: パストラバーサル攻撃の防止、Windows/macOS/Linux全環境で安全なファイル名
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9C

### 定数外部化（constants.ts）によるリファクタリング

- **パターン**: 同一ディレクトリに`constants.ts`を作成し、デフォルト値・タイムアウト・パス等を集約
- **例**（TASK-9B-G）:
  | 定数 | 値 | 用途 |
  | ---- | -- | ---- |
  | DEFAULT_TIMEOUT_MS | 300000 | スクリプト実行タイムアウト |
  | SUPPORTED_ENGINES | ["claude-code", "anthropic-sdk"] | サポートエンジン一覧 |
  | CACHE_MAX_ENTRIES | 50 | ResourceLoaderキャッシュ上限 |
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9B-G

### generate-index.jsファイル名誤認パターン（回避）

- **問題**: `generate-index.mjs`と`generate-index.js`の混同
- **誤りパターン**:
  - ❌ `node scripts/generate-index.mjs` → 存在しない
  - ✅ `node scripts/generate-index.js` → 正しい
- **確認方法**:
  ```bash
  ls .claude/skills/aiworkflow-requirements/scripts/
  ```
- **発見日**: 2026-02-04
- **関連タスク**: task-imp-search-ui-001

### Page Visibility APIによるリソース最適化

- **パターン**: `usePageVisibility`フックで可視状態を監視し、非表示時は処理停止
- **効果**: バックグラウンドタブでのCPU使用ゼロ、バッテリー消費削減
- **発見日**: 2026-01-28
- **関連タスク**: TASK-3-2-C
