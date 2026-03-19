# パターン集: 成功パターン - Phase 12 同期・DI・監査

> 元ファイル: `patterns.md` から分割
> 読み込み条件: Phase 12 の完了同期、DI パターン、監査手法を参照したい時。

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

### Phase 12 root evidence + workflow 正本集約（UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001）

- **状況**: Task 12-1〜12-5 の成果物は揃っていても、system spec 側の実装内容・苦戦箇所・screen evidence が複数仕様へ散ると、Phase 12 の完了根拠と再利用入口が別々になりやすい
- **問題**:
  1. `spec-update-summary.md` と system spec を別々に読まないと「何を実装し、どこで苦戦したか」が追えない
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

### completed workflow の planned wording ゼロ化（TASK-UI-04C）

- **状況**: `outputs/phase-12` の成果物と validator は揃っているのに、`phase-12-documentation.md` に `仕様策定のみ` や「実装・テストは保留」などの文言が残る
- **問題**: completed workflow を再監査したときに、本文だけを見ると未実施タスクのように誤読され、Step 1-B と Task 100% 実行確認が崩れる
- **解決パターン**:
  1. `phase-12-documentation.md` に対して `rg -n "仕様策定のみ|実行予定|保留として記録"` を実行し、残置文言を 0 件にする
  2. completed workflow では「実装・テスト・Phase 11/12 は完了、保留は Phase 13 のみ」のように実績ベースで書き換える
  3. 完了条件チェックリストと `Task 100% 実行確認` の `[ ]` を `[x]` へ同期する
  4. 是正結果を `spec-update-summary.md` と `phase12-task-spec-compliance-check.md` にも反映する
- **効果**:
  - completed workflow の本文と成果物台帳が同じ状態を示す
  - Phase 12 再監査時に「成果物はあるが本文は未実施」という差し戻しを防止できる
- **発見日**: 2026-03-11
- **関連タスク**: TASK-UI-04C-WORKSPACE-PREVIEW

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
  1. `implementation-guide.md` - Part 1（中学生レベル）+ Part 2（開発者向け）
  2. `api-documentation.md` / `ipc-documentation.md` / `component-documentation.md`
  3. `documentation-changelog.md` - システム仕様書更新判断と履歴
  4. `unassigned-task-detection.md` - 未タスク検出報告（0件でも必須）
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
  // 無限ループ
  const { initializeAuthMode } = useAuthModeStore();
  useEffect(() => {
    initializeAuthMode();
  }, [initializeAuthMode]);

  // 修正後（useRefガード）
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
