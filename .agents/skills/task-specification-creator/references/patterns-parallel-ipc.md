# パターン集: 並列エージェント実行・IPC型不整合・Phase 12最適化

> 元ファイル: `patterns.md` から分割
> 読み込み条件: 並列エージェント実行、IPC型不整合の修正、Phase 12の最適化パターンを参照したい時。

## 並列エージェント実行パターン

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
- **テンプレート**: Phase仕様書の「既知の Pitfall 注意事項」テーブル
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
  3. 各Step完了後にdocumentation-changelog.mdの該当欄を完了に更新
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

---

## IPC型不整合解決パターン

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

## IPC戻り値型不整合解決パターン（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001）

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

---

## Phase 12 検証・完了最適化パターン

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

#### Phase 4-5 統合実行推奨パターン（TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 2026-03-16）

- **状況**: Phase 4（テスト作成 Red）と Phase 5（実装 Green）を別エージェントで分割実行すると、型定義が実装前に未確定なためテストコードでコンパイルエラーが発生しやすい
- **パターン**: 型定義 → テスト（Red）→ 実装（Green）を 1 エージェントで統合実行し、Green 状態を直接確認してから次 Phase へ進む
- **根拠**: Phase 4 と Phase 5 は型定義・テスト・実装のコンテキストが密結合しており、コンテキスト分断がコンパイルエラーや手戻りを引き起こす
  | 実行方式 | リスク | 推奨度 |
  | --- | --- | --- |
  | Phase 4 のみ実行後に別エージェントで Phase 5 | 型未定義→コンパイルエラー、コンテキスト再構築コスト | 非推奨 |
  | Phase 4-5 を 1 エージェントで統合実行 | なし（型→テスト→実装を一気通貫） | 推奨 |
- **適用条件**: 新規型定義（interface / type）を伴う実装タスク全般。既存型を変更しない場合は Phase 分割も可
- **注意**: 統合実行でもファイル数が多い場合は rate limit に注意（P43対策: 3ファイル以下/エージェントを維持）
- **発見日**: 2026-03-16
- **関連タスク**: TASK-IMP-SKILL-DOCS-AI-RUNTIME-001
- **関連パターン**: P43（Phase 12 サブエージェントの rate limit 中断）、7並列エージェント仕様書生成パターン

#### 同一 wave インデックス同期パターン（TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 2026-03-16）

- **状況**: Phase 12 Task 2 で `references/` 配下の仕様書更新は完了しているのに、`resource-map.md` のクイックルックアップ行・`quick-reference.md` の導線セクションの更新が漏れる
- **問題**: インデックスファイルが古いまま残ると、他のエージェントや開発者が旧パスを参照し続け、仕様書ドリフトが静かに蓄積する
- **解決策**: Phase 12 Task 2 に「Step 2.5: インデックス同期」を追加し、`references/` 更新と同一 wave（同一エージェント実行）で以下を完了させる
  1. `resource-map.md` のクイックルックアップ行を追加・更新
  2. `quick-reference.md` の該当導線セクションを追加・更新
  3. `topic-map.md` を `node scripts/generate-index.js` で再生成
- **適用条件**: Phase 12 Task 2 で `references/` 配下の仕様書を追加・更新・削除した場合は必須
- **チェック方法**: `grep -n "新規ファイル名" resource-map.md quick-reference.md` でゼロヒットなら更新漏れ
- **発見日**: 2026-03-16
- **関連タスク**: TASK-IMP-SKILL-DOCS-AI-RUNTIME-001
- **関連パターン**: P2（topic-map.md 再生成忘れ）、P27（topic-map 再生成トリガー判断ミス）

#### mirror sync 遅延パターン（TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 2026-03-16）

- **状況**: `.claude/skills/` の仕様書を更新した後、`.agents/skills/` へのミラー同期が Phase 12 完了後に忘れられる
- **問題**: 2つのディレクトリが乖離したまま PR がマージされると、エージェント実行時に古いスキル仕様が参照され、動作不整合が発生する
- **解決策**: Phase 12 の最終ステップとして以下を固定実行する
  ```bash
  diff -rq .claude/skills/ .agents/skills/
  ```
  差分 0 を確認してから完了とする。差分がある場合は `.agents/skills/` 側を `.claude/skills/` と同内容に同期する
- **適用条件**: Phase 12 完了時（仕様書変更の有無にかかわらず毎回実行）
- **チェック方法**: `diff -rq .claude/skills/ .agents/skills/` の出力が空であること
- **発見日**: 2026-03-16
- **関連タスク**: TASK-IMP-SKILL-DOCS-AI-RUNTIME-001
- **関連パターン**: P1（LOGS.md 2ファイル更新漏れ）、P43（Phase 12 サブエージェントの rate limit 中断）

## 4並列エージェントによるPhase 1分析パターン（TASK-9A-C 2026-02-19）

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

## 既知Pitfall仕様書事前組み込みパターン（TASK-9A-C 2026-02-19）

- **状況**: Phase 4/5/6仕様書にP31（Zustand無限ループ）、P39（happy-dom userEvent非互換）、P40（テスト実行ディレクトリ依存）を事前記載
- **結果**: 実装者が仕様書読了時点でPitfallを認知でき、実装時の再発防止に有効
- **適用条件**: 06-known-pitfalls.md に該当するPitfallがある場合
- **テンプレート**: Phase仕様書の「既知の Pitfall 注意事項」テーブル
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

## Phase 12 spec-update-workflow全Step逐次実行パターン（UT-STORE-HOOKS-COMPONENT-MIGRATION-001 2026-02-12）

- **状況**: Phase 12でTask 2（システムドキュメント更新）のStep 1-A〜1-E + Step 2を一部省略してしまった
- **解決策**:
  1. documentation-changelog.md に各Step欄を事前に作成（空欄状態）
  2. Step 1-A → 1-B → 1-C → 1-D → 1-E → Step 2 の順に逐次実行
  3. 各Step完了後にdocumentation-changelog.mdの該当欄を完了に更新
  4. 全Step完了後にのみ「Phase 12完了」と記載
- **教訓**: 12項目もの更新漏れが発生。Phase 12は最も漏れやすいPhaseであり、チェックリスト駆動が必須
- **発見日**: 2026-02-12
- **関連**: P1, P2, P4, P25, P27, P29

## worktree環境でもStep 1-Aを先送りしないパターン（UT-FIX-SKILL-REMOVE-INTERFACE-001 再監査 2026-02-21）

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


## P44 IPCインターフェース不整合の体系的修正パターン（UT-FIX-SKILL-IMPORT-INTERFACE-001 2026-02-21）

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
- **教訓**: IPCインターフェース不整合の修正は「呼び出し元が多い側を変更しない」が鉄則
- **発見日**: 2026-02-21
- **関連タスク**: UT-FIX-SKILL-IMPORT-INTERFACE-001
- **関連Pitfall**: P23, P32, P42, P44

## 7並列エージェント仕様書生成パターン（UT-FIX-SKILL-IMPORT-INTERFACE-001 2026-02-21）

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
- **注意**: 1エージェントあたり3ファイル以下でrate limit回避（P43対策）
- **教訓**: 並列数の多さよりも依存関係の正確な把握が重要
- **発見日**: 2026-02-21
- **関連タスク**: UT-FIX-SKILL-IMPORT-INTERFACE-001
- **関連パターン**: P43（Phase 12サブエージェントのrate limit中断）

## IPC不整合の姉妹タスク横展開検出パターン（UT-FIX-SKILL-IMPORT-INTERFACE-001 2026-02-20）

- **状況**: skill:remove のIPC不整合修正後、同一パターンが skill:import にも存在する可能性を検出する必要があった
- **アプローチ**: `grep -rn "args\?" apps/desktop/src/main/ipc/` で全ハンドラの引数形式を一括検索し、Preload側の `safeInvoke` 呼び出しと突合する「横展開検出」を実施
- **結果**: skill:import でも同一パターンの不整合を発見し、姉妹タスクとして即時修正
- **適用条件**: IPC関連バグ修正後のPhase 12未タスク検出時。同一カテゴリのチャンネル群（skill:*, auth:* 等）に対して横展開検証を実施
- **発見日**: 2026-02-20
- **関連タスク**: UT-FIX-SKILL-IMPORT-INTERFACE-001, UT-FIX-SKILL-REMOVE-INTERFACE-001

---

## IPC型不整合解決パターン（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001）

### IPC戻り値型2ステップ変換パターン（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 2026-02-21）

- **状況**: `skill:import` IPC ハンドラが `ImportResult` を返すが、Renderer は `ImportedSkill` を期待。2つの型は共有フィールドがゼロ
- **問題**: サービス層の「操作結果型」と UI 層の「データ表現型」の不一致
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
- **発見日**: 2026-02-21
- **関連タスク**: UT-FIX-SKILL-IMPORT-RETURN-TYPE-001

## Phase 12 検証スクリプト実体探索先行パターン（UT-IMP-PHASE12-SCRIPT-PATH-DISCOVERY-GUARD-001）

- **状況**: `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit-unassigned-tasks` の実行前にスクリプト所在を誤認しやすい
- **解決策**:
  1. 検証開始前に `rg --files .claude/skills | rg 'verify-all-specs|validate-phase-output|verify-unassigned-links|audit-unassigned-tasks'` を実行する
  2. `verify -> validate -> links -> audit` の順序で固定実行する
  3. 実体探索結果を `spec-update-summary.md` へ同時記録する
- **効果**: 誤パス実行による手戻りを削減し、Phase 12 の証跡を同一ターンで確定できる
- **発見日**: 2026-03-04
- **関連タスク**: UT-IMP-PHASE12-SCRIPT-PATH-DISCOVERY-GUARD-001

## Phase 12 Vitest 非watch固定パターン（UT-IMP-PHASE12-VITEST-RUN-MODE-GUARD-001）

- **状況**: `pnpm test` 実行で watch が残留し、Phase 12 の再確認証跡取得が停滞する
- **解決策**:
  1. テスト再確認は `pnpm --filter @repo/desktop exec vitest run <target>` を標準化する
  2. ルート実行ではなく対象パッケージ文脈で実行する
  3. 実行コマンドを `implementation-guide.md` / `spec-update-summary.md` に明示する
- **効果**: 非watchで決定論的に終了し、再確認フロー全体の完了時刻が安定する
- **発見日**: 2026-03-04
- **関連タスク**: UT-IMP-PHASE12-VITEST-RUN-MODE-GUARD-001

## Phase 12 Step 1-A 四点同期 + screenshot運用ギャップ未タスク化（TASK-UI-01-D 再確認）

- **状況**: `spec-update-summary.md` と system spec 更新は完了しているが、`LOGS.md` x2 / `SKILL.md` x2 / `topic-map` 再生成が抜けることがある
- **解決策**:
  1. Step 1-A を「`LOGS.md` x2 + `SKILL.md` x2 + `generate-index`」の四点セットで完了判定する
  2. 再撮影運用で workflow 固定出力先がある場合は、未タスク化して `docs/30-workflows/unassigned-task/` に配置する
  3. `audit --target-file` と `audit --diff-from HEAD` を連続実行し、`currentViolations=0` を合否に使う
  4. 結果を `spec-update-summary.md` / `unassigned-task-detection.md` / `phase12-compliance-recheck.md` に同時記録する
- **効果**: Phase 12 の完了判定が再現可能になり、再撮影運用のドリフトを未タスクで追跡できる
- **発見日**: 2026-03-05
- **関連タスク**: TASK-UI-01-D-VIEWTYPE-ROUTING-NAV

## Phase 4-5 統合実行推奨パターン（TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 2026-03-16）

- **状況**: Phase 4（テスト作成 Red）と Phase 5（実装 Green）を別エージェントで分割実行すると、型定義が実装前に未確定なためテストコードでコンパイルエラーが発生しやすい
- **パターン**: 型定義 → テスト（Red）→ 実装（Green）を 1 エージェントで統合実行し、Green 状態を直接確認してから次 Phase へ進む
- **根拠**: Phase 4 と Phase 5 は型定義・テスト・実装のコンテキストが密結合
  | 実行方式 | リスク | 推奨度 |
  | --- | --- | --- |
  | Phase 4 のみ実行後に別エージェントで Phase 5 | 型未定義→コンパイルエラー、コンテキスト再構築コスト | 非推奨 |
  | Phase 4-5 を 1 エージェントで統合実行 | なし（型→テスト→実装を一気通貫） | **推奨** |
- **適用条件**: 新規型定義（interface / type）を伴う実装タスク全般。既存型を変更しない場合は Phase 分割も可
- **注意**: 統合実行でもファイル数が多い場合は rate limit に注意（P43対策: 3ファイル以下/エージェントを維持）
- **発見日**: 2026-03-16
- **関連タスク**: TASK-IMP-SKILL-DOCS-AI-RUNTIME-001

## 同一 wave インデックス同期パターン（TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 2026-03-16）

- **状況**: Phase 12 Task 2 で `references/` 配下の仕様書更新は完了しているのに、`resource-map.md` のクイックルックアップ行・`quick-reference.md` の導線セクションの更新が漏れる
- **問題**: インデックスファイルが古いまま残ると、他のエージェントや開発者が旧パスを参照し続ける
- **解決策**: Phase 12 Task 2 に「Step 2.5: インデックス同期」を追加し、`references/` 更新と **同一 wave**（同一エージェント実行）で以下を完了させる
  1. `resource-map.md` のクイックルックアップ行を追加・更新
  2. `quick-reference.md` の該当導線セクションを追加・更新
  3. `topic-map.md` を `node scripts/generate-index.js` で再生成
- **適用条件**: Phase 12 Task 2 で `references/` 配下の仕様書を追加・更新・削除した場合は必須
- **チェック方法**: `grep -n "新規ファイル名" resource-map.md quick-reference.md` でゼロヒットなら更新漏れ
- **発見日**: 2026-03-16
- **関連タスク**: TASK-IMP-SKILL-DOCS-AI-RUNTIME-001
- **関連パターン**: P2（topic-map.md 再生成忘れ）、P27（topic-map 再生成トリガー判断ミス）

## mirror sync 遅延パターン（TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 2026-03-16）

- **状況**: `.claude/skills/` の仕様書を更新した後、`.agents/skills/` へのミラー同期が Phase 12 完了後に忘れられる
- **問題**: 2つのディレクトリが乖離したまま PR がマージされると、エージェント実行時に古いスキル仕様が参照される
- **解決策**: Phase 12 の最終ステップ: `diff -rq .claude/skills/ .agents/skills/` を実行し、差分 0 を確認。差分がある場合は `.agents/skills/` 側を `.claude/skills/` と同内容に同期する
- **適用条件**: Phase 12 完了時（仕様書変更の有無にかかわらず毎回実行）
- **チェック方法**: `diff -rq .claude/skills/ .agents/skills/` の出力が空であること
- **発見日**: 2026-03-16
- **関連タスク**: TASK-IMP-SKILL-DOCS-AI-RUNTIME-001
- **関連パターン**: P1（LOGS.md 2ファイル更新漏れ）、P43（Phase 12 サブエージェントの rate limit 中断）
