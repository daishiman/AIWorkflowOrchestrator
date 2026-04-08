# Phase 12 最適化・IPC テストパターン

> 元ファイル: `patterns-parallel-ipc.md` から分割
> 読み込み条件: Phase 12 の検証・完了最適化パターン、IPC テストモックパターンを参照したい時。

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

---

## IPC テスト `vi.hoisted()` モックパターン（TASK-P0-08 2026-04-06）

- **状況**: IPC チャンネルをインポートする Main Process ハンドラのテストで、`vi.mock()` より先に `ipcMain` のモックを宣言する必要がある
- **問題**: Vitest では `vi.mock()` がホイスト（hoist）されるため、モジュール初期化時に呼ばれる副作用より後にモックを定義すると `ReferenceError` または `TypeError` が発生する
- **パターン**: `vi.hoisted()` で変数を事前定義し、`vi.mock()` のファクトリ関数内で参照する
- **実装例**:
  ```typescript
  const { mockHandle, mockIpcMain } = vi.hoisted(() => {
    const mockHandle = vi.fn();
    const mockIpcMain = { handle: mockHandle };
    return { mockHandle, mockIpcMain };
  });

  vi.mock('electron', () => ({
    ipcMain: mockIpcMain,
    app: { getPath: vi.fn().mockReturnValue('/tmp') },
  }));

  describe('sessionResumeHandlers', () => {
    it('should register handler', () => {
      expect(mockHandle).toHaveBeenCalledWith(
        'skill-creator:list-sessions',
        expect.any(Function)
      );
    });
  });
  ```
- **適用条件**: Main Process IPC ハンドラ（`ipcMain.handle` を使用するファイル）のユニットテスト全般
- **教訓**: IPC ハンドラテストは `vi.hoisted()` + `vi.mock()` のセットが必須パターン。Phase 4 のテスト設計時にテンプレートへ最初から含めることで Phase 5 の手戻りを削減できる
- **発見日**: 2026-04-06
- **関連タスク**: TASK-P0-08（`creatorHandlers.sessionResume.test.ts` での適用実績）
- **関連Pitfall**: P42（3段バリデーション）、P43（rate limit）

#### vitest monorepo alias 設定標準化パターン（W0-seq-02 2026-04-08）

- **状況**: `@repo/shared`等のmonorepo aliasをimportするテストが`vitest.config.ts`のalias未設定でモジュール解決不可になる
- **解決策**:
  1. `vitest.config.ts`の`test:`ブロック内に以下を追加する:
     ```ts
     resolve: {
       alias: {
         '@repo/shared': path.resolve(__dirname, '../shared/src'),
       },
     },
     ```
  2. `import path from 'path'` をvitest.config.tsの先頭に追加する
  3. 追加後に`pnpm --filter <package> exec vitest run`で動作確認する
- **効果**: monorepo alias使用テストのモジュール解決エラーをゼロにする
- **発見日**: 2026-04-08
- **関連タスク**: UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 (FB-01)

#### post-tool-useフック自動改変後の人間差分レビューパターン（W0-seq-02 2026-04-08）

- **状況**: ESLint等のpost-tool-useフックがimportパスを自動書き換えすることで、テスト期待値が追随せずテスト件数0件扱いになる
- **解決策**:
  1. ファイル編集後にフックが実行された場合は `git diff <file>` で自動変更内容を確認する
  2. importパス変更が起きた場合、対応する`expect()`の値も変更されていることを確認する
  3. Phase 11の検証ステップに「フック実行後の人間レビュー」を組み込む
- **効果**: フーク起因のサイレント仕様破壊を防止できる
- **発見日**: 2026-04-08
- **関連タスク**: UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 (FB-02)

#### edge case一次定義集約パターン（W0-seq-02 2026-04-08）

- **状況**: edge caseの定義が`implementation-guide.md` / `manual-test-result.md` / `unassigned-task-detection.md`に分散し、定義の食い違いによるfalse greenが発生する
- **解決策**:
  1. edge caseの一次定義は`outputs/phase-12/implementation-guide.md`に集約する
  2. 他のファイル（manual-test-result.md等）では一次定義を参照するのみとし、定義の再記述を避ける
  3. Phase 12着手前にedge case定義の責務ファイルを宣言する
- **効果**: 定義の一元管理により、edge case解釈の矛盾を防止できる
- **発見日**: 2026-04-08
- **関連タスク**: UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 (FB-05)
