# Lessons Learned（current）2026-03 後半
> 親ファイル: [lessons-learned-current.md](lessons-learned-current.md)

## UT-TASK06-007 IPC契約ドリフト自動検出スクリプト（2026-03-18）

### 苦戦箇所1: マルチラインipcMain.handle対応

**問題**: `ipcMain.handle(\n    IPC_CHANNELS.XXX,` のように改行が入るパターンが全体の約67%を占め、1行正規表現では22/324件しか抽出できなかった。
**解決策**: 現在行が `ipcMain.handle(` で終わる場合、次の5行を結合してから正規表現マッチを試行するロジックを追加。結果、216件抽出に改善。
**教訓**: IPCハンドラのgrepベース抽出では、コードフォーマッターによる改行挿入を考慮したマルチライン対応が必須。

### 苦戦箇所2: タプル配列経由ハンドラ登録パターン

**問題**: `registerFallbackHandlers` が `[IPC_CHANNELS.XXX, handler]` 形式のタプル配列をループで `ipcMain.handle(channel, handler)` に登録するパターンが約108件存在。動的なチャンネル名のため静的解析では抽出困難。
**解決策**: 現バージョンでは未対応（未タスク UT-TASK06-007-EXT-001 として登録）。タプル配列の定義箇所を別途スキャンし、定数名→チャンネル名のマッピングを取得する方式を検討。
**教訓**: Electron IPCの登録パターンは多様（直接呼び出し、関数参照渡し、タプル配列経由）であり、単一の正規表現では全パターンをカバーできない。

### 苦戦箇所3: worktree環境のesbuildプラットフォーム不一致

**問題**: worktreeのnode_modulesがdarwin-arm64向けにインストールされているが、実行環境がdarwin-x64であり、vitestがesbuildの起動に失敗。P7（ネイティブモジュールのバイナリ不一致）の再発。
**解決策**: tsx経由で全テストケースを手動実行する代替手法で検証を完了。
**教訓**: worktree環境でのテスト実行は `pnpm install --force` またはtsx経由の代替手法を事前に用意すべき。Phase 4テンプレートに代替テスト手法のガイダンスを追加すべき（未タスク候補）。

### 苦戦箇所4: process.argv[1]ベースのパス解決

**問題**: tsxで実行した場合、`require.main === module` が期待通り動作せず、`__dirname` が `.` を返す。main()が呼ばれない、またはパスが不正。
**解決策**: エントリポイント判定を `process.argv[1].includes("check-ipc-contracts")` に変更。パス解決を `process.argv[1]` から `path.dirname(path.resolve(scriptFile))` で算出する方式に変更。
**教訓**: tsx/ts-node環境では `require.main === module` やCommonJSの `__dirname` が期待通り動作しない場合がある。`process.argv[1]` ベースのパス解決がworktree環境で最も信頼性が高い。

### 苦戦箇所5: P57再発（Phase 12仕様書更新先送り）

**問題**: 初回Phase 12で「worktree環境のためPR時に実施」として、LOGS.md x2、SKILL.md x2、quality-requirements.md、ipc-contract-checklist.md、phase-templates.md、task-workflow-backlog.md、未タスク指示書3件の実更新を先送りした。再監査で全10件の漏れが検出された。
**解決策**: 即座に全ファイルを実更新して漏れを解消。
**教訓**: P57の教訓「worktree環境でのコンフリクトリスクより、仕様書と実装の乖離リスクの方が高い」を再確認。Phase 12では「計画台帳」ではなく「実更新の完了」が完了条件。

---

## TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001（2026-03-21）

### 苦戦箇所

#### L-CB-01: packages/shared の exports 未登録による import 解決失敗

- **症状**: `@repo/shared/types/execution-capability` が vite の import analysis で解決できず、テストが起動しない
- **原因**: `execution-capability.ts` は `packages/shared/src/types/` に存在するが、`package.json` の `exports` と `typesVersions`、および `tsup.config.ts` の `entry` に未登録だった
- **解決策**: 3箇所同時追加が必要: (1) package.json exports (2) package.json typesVersions (3) tsup.config.ts entry。追加後に `pnpm --filter @repo/shared build` でリビルド
- **教訓**: モノレポで新規サブパスを追加する際は、この3箇所同時更新チェックリストを使う

#### L-CB-02: タスク仕様書のファイルパス精度（skillCreatorHandlers.ts vs creatorHandlers.ts）

- **症状**: 仕様書が `skillCreatorHandlers.ts` を direct caller と記載していたが、実際の IPC boundary は `creatorHandlers.ts` だった
- **原因**: 仕様書作成時に `grep -rn "RuntimeSkillCreatorFacade"` で全使用箇所を確認せず、類似名のファイルを誤認
- **解決策**: Phase 1（P50チェック）で `grep -rn` により実際の呼び出し元を特定し、仕様書のパスを補正
- **教訓**: 仕様書に記載するファイルパスは、タスク開始前に `grep` で実際の import/usage を確認してから確定する

#### L-CB-03: execute() の terminalSurface 未消費パターン

- **症状**: 初期実装で `execute()` の `decision` を `void decision` で棄却していた。terminalSurface のとき SkillExecutor に無条件委譲してしまう
- **原因**: Phase 2 設計書で execute() の4状態ハンドリングを十分に設計しなかった
- **解決策**: linter/ユーザーのフィードバックで `RuntimeTerminalHandoffResult` 型を導入し、execute() でも terminalSurface → handoff bundle を返す分岐を追加
- **教訓**: 3-role facade（plan/execute/improve）で4状態ハンドリングを設計する際は、全 role × 全 capability の matrix を Phase 2 で明示的に埋める

---

### TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001 設計タスク教訓（2026-03-22）

#### L-TCPL-001: worktree マージ後の conflict marker 残骸が複数ファイルに波及

- **症状**: `||||||| 77abcbc7f` の conflict marker 残骸が LOGS.md x2、SKILL.md x2、task-workflow-completed.md、lessons-learned-current.md の計6ファイルに残存していた。`<<<<<<<`/`=======`/`>>>>>>>` は解消済みだが base marker だけが取り残されていた
- **原因**: worktree でのマージ時に `diff3` スタイルのマージ出力で base marker が残り、目視レビューで見落とした。重複行（base 版のコンテンツ）も同時に残存し、ファイルが膨張していた
- **解決策**: worktree マージ後は `grep -rn '||||||| ' .claude/skills/` で全ファイルを走査し、base marker と重複行を同時に除去する
- **教訓**: `<<<<<<<` / `>>>>>>>` の解消だけでは不十分。`diff3` marker は3種ではなく4種（`|||||||` 含む）をチェックする

#### L-TCPL-002: standalone root 移設後の stale path 14件 + P3 3ステップ漏れ

- **症状**: `tasks/` サブディレクトリから standalone root に移設した後、全13 Phase spec ファイルの「Task index」参照行が旧パスのまま残存（14件）。加えて P3 3ステップ（backlog 登録 / 関連仕様書リンク）が未完了だった
- **原因**: ディレクトリ移設時に index.md と artifacts.json のパスは更新したが、各 Phase spec 内の参照資料テーブルは手動更新対象であることを認識していなかった
- **解決策**: standalone root 移設時は `grep -rn '<old-path>' <new-dir>/` で全ファイルの旧パス参照を走査し、0件化してから完了とする。P3 3ステップはチェックボックスの `[ ]` → `[x]` 更新を含めて実行する
- **教訓**: ディレクトリ移設は「コピー + パス更新」の2段階ではなく「コピー + 全 grep 走査 + P3 3ステップ」の3段階で完了とする

---

### TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 設計タスク教訓（2026-03-22）

#### L-THSR-001: 設計タスクの Phase 12 仕様書更新先送りパターン（P57 再発）

- **症状**: system-spec-update-summary.md に「更新内容」を詳細に記載したが、実際の `.claude/skills/` ファイルへの追記が 0 行だった
- **原因**: 「計画書を書くこと」と「実ファイルへの反映」を混同。system-spec-update-summary を書いた時点で完了と認識してしまった
- **解決策**: documentation-changelog に `git diff --stat -- .claude/skills/` の実行結果を事後記録として貼り付けるルールを追加
- **教訓**: 設計タスクでも Phase 12 完了時点で `.claude/skills/` を実更新する。「計画文」ではなく「実績ログ」のみを残す

#### L-THSR-002: Concern 3分割 × 5 Consumer の設計整理手法

- **症状**: Launcher / Handoff Card / Consumer Adapter の 3 concern に対して 5 consumer（Chat Edit / Runtime / Skill Docs / Agent Execution / Manual Launcher）の組合せが発生し、設計の見通しが悪くなった
- **解決策**: Consumer → DTO マッピングテーブルを Phase 2 で一枚表として定義し、surfaceType 列挙で concern 横断の統一キーを設けた。テーブル化により各 consumer の入力型・変換関数・出力型が一覧で比較でき、冗長パスの早期発見に有効だった
- **教訓**: 複数 concern × 複数 consumer の設計では、Phase 2 で全組合せのマッピングテーブルを作成し、テーブルの空セルから設計漏れを検出する

#### L-THSR-003: 未タスク件数の system-spec-update-summary ↔ unassigned-task-detection 不整合（P59 再発）

- **症状**: system-spec-update-summary.md に「5 件」と記載されたが、unassigned-task-detection.md の実際の検出件数は「8 件」だった
- **原因**: Phase 12 を並列エージェントで分担した結果、summary 作成エージェントと未タスク検出エージェントの間で情報が断絶した
- **解決策**: documentation-changelog は全 Task 完了後にメインエージェントが一括作成する。件数は unassigned-task-detection.md の確定値を参照し、他ファイルの「予測値」を使わない
- **教訓**: Phase 12 の件数系データは最後に1箇所で確定し、全ファイルにコピーする（逆方向の参照は禁止）

### TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001（2026-03-23）

#### L-CBLG-001: Phase 10 MINOR 指摘と unassigned-task-detection の照合漏れ

- **症状**: Phase 10 final-gate-decision.md に MINOR M-01（rsync worktree 注意書き不足）が記録されていたが、Phase 12 Task 4 の unassigned-task-detection.md では「0件」と記載された
- **原因**: unassigned-task-detection 作成時に Phase 10 の MINOR 一覧を確認せず、「設計タスクは Phase 4-11 をスキップ」という誤った判断で Phase 10 MINOR を無視した
- **解決策**: Phase 12 Task 4 開始時に `phase-10/final-gate-decision.md` の MINOR 一覧を必ず読み込み、各 MINOR の対応状況（未タスク化 or Phase 12 内解決）を照合する
- **教訓**: 設計タスクであっても Phase 10 は実施されるため、Phase 10 MINOR の照合は省略不可

#### L-CBLG-002: 設計タスク + worktree 環境での Step A-E 先送り（P57 違反）

- **症状**: documentation-changelog.md で Step A-E が全て「計画済（PR マージ後に実施）」と記載された。P57（設計タスクでも Phase 12 完了時点で実更新する）に違反
- **原因**: worktree 環境でのコンフリクトリスクを過大評価し、P57 ルールよりも先送りを優先した
- **解決策**: worktree 環境であっても `.claude/skills/` の実更新は Phase 12 内で実施する。コンフリクトが発生した場合はその場で解決する方が、仕様書と実装の乖離リスクより低い
- **教訓**: 「worktree だから」は Step A-E 先送りの正当な理由にならない。P57 は worktree 環境にも適用される

## TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 契約テスト教訓（2026-03-24）

### L-CBLG-003: Phase 4 テストマトリクスのファイル参照誤り

- **苦戦箇所**: Phase 4 の test-matrix.md で、テストケース C-3/U-2-5/I-6 が `contract-matrix.md` を参照先として指定していたが、実際の `rsync` コマンドや bridge rule の記載は `design-summary.md` にあった。テスト実装時に初めてファイル参照誤りが発覚し、3テストのアサーション修正が必要になった
- **解決策**: テストマトリクス作成時に参照先ファイルの内容を `grep` で実際に確認してからテストケースに記載する。契約テストでは `readOutput()` ヘルパーで Phase 別ファイルを読み込む設計にし、参照先変更が1箇所で済むようにする
- **再利用**: 設計タスクの Phase 4 でテストマトリクスを書く際は、参照ファイルパスをハードコードする前に `grep -l "検索語" outputs/phase-2/` で所在を確認する

### L-CBLG-004: TypeScript TS1501 regex /s flag は ES2018+ 必須

- **苦戦箇所**: Rollback テストで `/Step A.*中断|中断.*Step A/s` のように dotAll flag (`/s`) を使用したところ、TypeScript が TS1501 エラー（This regular expression flag is only available when targeting 'es2018' or later）を出力した。プロジェクトの tsconfig target が ES2018 未満のため使用不可
- **解決策**: `/s` flag の代わりに `[\s\S]` で改行を含む任意文字にマッチさせる。`/Step A[\s\S]*中断|中断[\s\S]*Step A/` で同等の動作を実現
- **再利用**: TypeScript テストで複数行マッチが必要な場合は `[\s\S]*` パターンを標準とする

> 5分解決カード: テストマトリクスの参照先ファイル誤り → `grep -l "keyword" outputs/phase-*/` → アサーション対象変数を修正 → テスト再実行

## UT-SC-05-APPLY-IMPROVEMENT-UI: 改善提案 承認/適用 UI

### L-AIUI-001: React Props Silent Drop は TypeScript で検出不能

- **苦戦箇所**: `ImprovementProposalPanel` の `onClose` prop が destructuring から除外されていたが、TypeScript コンパイル・62テスト全 PASS・ESLint 0件の状態で Phase 10 最終レビューまで検出できなかった。パネル閉じるボタンが未実装のまま放置されていた
- **解決策**: Phase 10 レビューで発見後、destructuring に `onClose` を追加し、パネル閉じるボタン（`aria-label="パネルを閉じる"`）を追加。P-6〜P-8 テスト3件を追加して検証
- **再利用**: コンポーネント実装後に Props interface の全フィールドと destructuring の突合チェックを行う。新規 Pitfall P67 として登録済み

### L-AIUI-002: `import()` 型伝播で Preload 型二重管理を解消

- **苦戦箇所**: `preload/types.ts` に `SkillCreatorAPI` の全メソッドを列挙する方式だと、P23/P32 の二重管理リスクがある
- **解決策**: `import("./skill-creator-api").SkillCreatorAPI` の `import()` 型を使用し、実装ファイルから型を自動伝播させる構造を採用。新メソッド `applyRuntimeImprovement` の追加時に `types.ts` の変更が不要だった
- **再利用**: Preload API の型定義は `import()` 型伝播パターン（S36）を標準とする

### L-AIUI-003: Mock 型安全性ギャップ — `vi.fn().mockResolvedValue()` は `any` を受容

- **苦戦箇所**: H-18 テストで `ApplyImprovementResult.errors` の mock データを `{ section, message }[]` で定義したが、実際の型は `string[]`。`vi.fn().mockResolvedValue()` が `any` を受け入れるため、TypeScript は型不整合を検出しなかった
- **解決策**: Phase 10 レビューで mock データの型を `string[]` に修正。`mockResolvedValue` に明示的な型引数（`mockResolvedValue<ApplyImprovementResult>({...})`）を使用する方針を策定
- **再利用**: テスト mock の戻り値には `satisfies` または明示的型引数で型チェックを強制する

> 5分解決カード: Props silent drop → Props interface と destructuring のフィールド数を比較 → 不足フィールドを追加 → テスト追加

---

## TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 からの教訓（2026-03-24）

### 1. 設計タスクでもプロダクションコードが含まれる場合がある

| 項目       | 内容                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| 課題       | タスク種別を「設計タスク」として開始したが、ApprovalGate / Consumer Auth Guard / 3ハンドラファイル等の実装が含まれていた |
| 解決策     | タスク分析の早期（Phase 1-2）に「設計のみか実装を伴うか」を明示的に判断し、種別を「設計・実装タスク」に更新する          |
| 標準ルール | Phase 2 設計レビュー時点で新規ファイル作成が発生するなら「実装タスク」として種別を修正する                               |
| 関連タスク | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001                                                                          |

### 2. IPC channel 数の整合

| 項目       | 内容                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| 課題       | 仕様書間で IPC channel 数を記載する際、Phase が進むにつれてチャンネル数が変動し、ドキュメント間で不整合が生じた |
| 解決策     | 仕様書の IPC channel 数は実装後に grep で実測し、全ドキュメントで同一の正確な数値を使用する                     |
| 標準ルール | IPC channel 数を記載する場合は `grep -rn "ipcMain.handle" src/main/ipc/` で実測値を確認してから記載する         |
| 関連タスク | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001                                                                 |

### 3. 3層レイヤーアーキテクチャは安全ガバナンスに有効

| 項目       | 内容                                                                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 実行コンソールの安全ガバナンスを単一コンポーネントで実装しようとすると、UX と安全性のトレードオフが生じる                                           |
| 解決策     | Primary Surface（概要表示） → Safety Surface（承認要求） → Detail Surface（ログ詳細）の3層に分離することで段階的開示を実現し、UX と安全性を両立した |
| 標準ルール | 承認フロー + 情報開示が要件に含まれる画面は、3層分離を設計の起点とする                                                                              |
| 関連タスク | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001                                                                                                     |

### 4. ApprovalGate の DI パターン

| 項目         | 内容                                                                                                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | 既存の terminalHandlers.ts に承認ゲートを追加する際、既存のコードへの影響を最小化しながらテスタビリティを確保する必要があった                                     |
| 解決策       | `IApprovalGate` インターフェースによる DI でテスタビリティを確保しつつ、optional パラメータで既存コードへの影響を最小化した。未注入時は degraded モードとして動作 |
| 標準ルール   | 既存ハンドラへの機能追加は optional パラメータ + interface DI で拡張する（P61 パターン適用）                                                                      |
| 関連パターン | P61（DIP 違反の遅発検出）、ApprovalGate Enforcement パターン                                                                                                      |
| 関連タスク   | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001                                                                                                                   |

### 5. production integration gap は workflow pack 単位で formalize する

| 項目       | 内容                                                                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | UT-6〜UT-9 のように Main / Preload / Renderer / lifecycle を跨ぐ gap を raw backlog 行のまま保持すると、依存関係と実装順序が見えにくい                                 |
| 解決策     | 複数レイヤーを同時に閉じる follow-up は `UT-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001` のような workflow pack に束ね、Phase 1〜13 と same-wave sync 条件を先に定義する |
| 標準ルール | parent task の未タスクが 4層境界を跨ぐ場合は、原子 task を並べるより workflow pack へ昇格させる                                                                        |
| 関連タスク | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001, UT-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001                                                                          |

---

