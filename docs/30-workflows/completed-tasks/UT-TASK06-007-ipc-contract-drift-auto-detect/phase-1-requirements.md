# Phase 1: 要件定義 - IPC契約ドリフト自動検出スクリプト

## メタ情報

| 項目     | 値                                                                             |
| -------- | ------------------------------------------------------------------------------ |
| Phase    | 1                                                                              |
| 機能名   | UT-TASK06-007-ipc-contract-drift-auto-detect                                   |
| 作成日   | 2026-03-18                                                                     |
| タスクID | UT-TASK06-007                                                                  |
| 分類     | 品質改善・自動化                                                               |
| 発見元   | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 Phase 12 skill-feedback-report T-02 |

## 目的

IPC契約ドリフトをPhase 9品質検証の段階で自動検出できるようにするための要件を定義する。Main Processハンドラの引数型とPreload APIの呼び出しパターンの不整合を自動照合し、P44/P45/P60パターンの再発を防止する。

## 実行タスク

- 要件抽出: 既存の単一ファイル仕様書とIssue #1309から機能要件・非機能要件を抽出
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準を定義
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定
- 既実装状態の調査: P50チェックとして対象領域の現状を確認

## 参照資料

| 資料名                     | パス                                                                                | 説明                      |
| -------------------------- | ----------------------------------------------------------------------------------- | ------------------------- |
| 既存タスク指示書           | `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect.md` | 単一ファイル版の詳細仕様  |
| GitHub Issue               | GitHub Issue #1309                                                                  | タスクの元情報            |
| IPC契約チェックリスト      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`       | 既存の手動チェックリスト  |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                                | P44/P45/P60パターンの詳細 |
| Electronセキュリティルール | `.claude/rules/04-electron-security.md`                                             | IPCセキュリティ原則       |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                   | パス                                                                                                                      | 内容                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| IPC契約チェックリスト      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                                             | IPCハンドラの契約検証手順               |
| セキュリティ-Electron IPC  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                              | Electron IPCセキュリティ設計            |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                               | IPC実装パターンの正本                   |
| 品質要件                   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                               | Phase 9品質ゲート基準                   |
| IPC型定義解決ガイド        | `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md`                                          | IPC型定義の解決手順                     |
| IPC契約監査パターン        | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-contract-audits.md` | IPC契約監査の実装パターン               |
| チャネル・型・API早見表    | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                                                       | チャネル・型・APIのクイックリファレンス |

### IPC規模情報（aiworkflow-requirements正本）

| 指標                    | 数値  | 出典                        |
| ----------------------- | ----- | --------------------------- |
| ALLOWED_INVOKE_CHANNELS | 242個 | `security-electron-ipc.md`  |
| ALLOWED_ON_CHANNELS     | 41個  | `security-electron-ipc.md`  |
| ハンドラ総数            | 324個 | `ipc-contract-checklist.md` |
| Preload呼び出し         | 325個 | `ipc-contract-checklist.md` |
| チャンネル定義          | 360個 | `ipc-contract-checklist.md` |

## 実行手順

### ステップ0: スコープ定義

#### 含む

- `apps/desktop/src/main/handlers/` 配下の全IPCハンドラの引数型抽出
- `apps/desktop/src/preload/` 配下の全 `safeInvoke` / `safeOn` 呼び出しパターンの抽出
- チャンネル名ベースのMain-Preload間照合と不一致検出
- P44（引数形式不一致）、P45（引数命名ドリフト）、P60（レスポンス形式不一致）パターンの自動検出
- Phase 9 品質ゲートへのチェックステップ統合
- CLI オプション（`--report-only` / `--strict` / `--format`）

#### 含まない

- TypeScript Compiler API（AST解析）による精密な型チェック
- Renderer側（React コンポーネント）の呼び出しパターン検証
- IPC レスポンス型の自動照合（引数型のみが対象）
- `safeOn` のコールバック引数型の照合
- 既存テストの修正・リファクタリング

### ステップ1: P50チェック - 既実装状態の調査（必須）

Phase 1 開始時に、IPC契約検証の既存実装を確認する。

```bash
# 既存のIPC契約チェックスクリプトが存在するか確認
find apps/desktop/scripts/ packages/ -name "*ipc*contract*" -o -name "*check*ipc*" 2>/dev/null

# 既存のCI品質ゲートにIPC関連チェックが含まれるか確認
grep -rn "ipc" .github/workflows/ 2>/dev/null

# 対象ファイルの最近のコミット履歴
git log --oneline -10 -- apps/desktop/src/main/handlers/ apps/desktop/src/preload/
```

| 判定     | 条件                   | 対応                                       |
| -------- | ---------------------- | ------------------------------------------ |
| 未実装   | 既存スクリプトなし     | 新規作成として Phase 2 へ                  |
| 部分実装 | 一部チェックが存在     | 差分を特定して Phase 2 で拡張設計          |
| 実装済み | 完全なスクリプトが存在 | Phase 4-5 を「検証・補完」モードに切り替え |

### ステップ2: 背景と問題の整理

以下のインシデントから要件を抽出する:

| パターン | 問題概要                                                | 検出ルール要件                                       |
| -------- | ------------------------------------------------------- | ---------------------------------------------------- |
| P44      | ハンドラがオブジェクト形式を期待、Preloadが文字列を渡す | 引数形式（オブジェクト vs プリミティブ）の不一致検出 |
| P45      | 引数名 `skillId` に実際はスキル名が渡される             | 引数名のセマンティクス乖離の検出                     |
| P60      | Phase 4/5 間でレスポンスwrapper形式の合意なし           | レスポンス形式の整合チェック                         |
| P42      | `.trim()` バリデーション漏れ                            | 文字列引数の3段バリデーション確認                    |

### ステップ3: 機能要件（FR）の定義

| FR-ID | 要件                                                            | 優先度 |
| ----- | --------------------------------------------------------------- | ------ |
| FR-01 | Mainハンドラ（`ipcMain.handle`）の引数型定義をgrep/rgで抽出する | 必須   |
| FR-02 | Preload API（`safeInvoke`）の呼び出しパターンを抽出する         | 必須   |
| FR-03 | チャンネル名でMainとPreloadを照合し、引数形式の不一致を検出する | 必須   |
| FR-04 | Preloadにあって Mainにないチャンネル（またはその逆）を検出する  | 必須   |
| FR-05 | 不一致があれば `process.exit(1)` を返し、CIで失敗判定とする     | 必須   |
| FR-06 | JSON/Markdown形式で不一致レポートを出力する                     | 必須   |
| FR-07 | `--report-only` モードで既存ドリフト一覧を表示（exit 0）        | 推奨   |
| FR-08 | `--strict` モードで不一致検出時にexit 1を返す                   | 推奨   |

### ステップ4: 非機能要件（NFR）の定義

| NFR-ID | 要件                                                       | 優先度 |
| ------ | ---------------------------------------------------------- | ------ |
| NFR-01 | スクリプト実行時間は10秒以内                               | 必須   |
| NFR-02 | Node.js 18以上で動作する                                   | 必須   |
| NFR-03 | `tsx` または `ts-node` で実行可能                          | 必須   |
| NFR-04 | `__dirname` ベースの絶対パスで worktree 環境に対応する     | 必須   |
| NFR-05 | スクリプト本体は200行以内を目安とする                      | 推奨   |
| NFR-06 | 新規外部依存パッケージの追加は不要（Node.js標準 + rg CLI） | 推奨   |

### ステップ5: 受け入れ基準（AC）の定義

| AC-ID | 基準                                                              | 検証方法         |
| ----- | ----------------------------------------------------------------- | ---------------- |
| AC-01 | `scripts/check-ipc-contracts.ts` が作成されている                 | ファイル存在確認 |
| AC-02 | P44パターン（オブジェクト vs プリミティブ不一致）が検出される     | テスト実行       |
| AC-03 | P45パターン（引数命名のセマンティクス乖離）が検出できる設計である | コードレビュー   |
| AC-04 | 不一致がなければ exit 0、あれば exit 1 を返す                     | スクリプト実行   |
| AC-05 | `phase-templates.md` のPhase 9チェックリストに統合されている      | ファイル確認     |
| AC-06 | 既知のP44/P45パターンが検出されることを確認するテストが存在する   | テスト実行       |

## 統合テスト連携

| テスト観点     | 確認内容                                              | 結果       |
| -------------- | ----------------------------------------------------- | ---------- |
| スクリプト実行 | `pnpm tsx scripts/check-ipc-contracts.ts` が正常実行  | {{RESULT}} |
| 既存ハンドラ   | 現在のMainハンドラが全て抽出される                    | {{RESULT}} |
| 既存Preload    | 現在のPreload API呼び出しが全て抽出される             | {{RESULT}} |
| Phase 9統合    | Phase 9テンプレートにチェックステップが追加されている | {{RESULT}} |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                          | 仕様参照先                                                         |
| ------------------ | --------------------------------- | ------------------------------------------------------------------ |
| セキュリティ       | IPCチャンネルのホワイトリスト管理 | `aiworkflow-requirements: security-electron-ipc.md`                |
| アーキテクチャ     | Main/Preload間の契約設計          | `aiworkflow-requirements: architecture-implementation-patterns.md` |
| エラーハンドリング | 検出エラーのレポート形式          | `aiworkflow-requirements: error-handling.md`                       |

## 成果物

| 成果物          | パス                                  | 説明                 |
| --------------- | ------------------------------------- | -------------------- |
| 要件定義書      | `outputs/phase-1/requirements.md`     | FR/NFR/ACの定義      |
| P50チェック結果 | `outputs/phase-1/p50-check-result.md` | 既実装状態の調査結果 |

## 完了条件

- [ ] P50チェック（既実装状態調査）が完了している
- [ ] 機能要件（FR-01〜FR-08）が定義されている
- [ ] 非機能要件（NFR-01〜NFR-06）が定義されている
- [ ] 受け入れ基準（AC-01〜AC-06）が検証可能な形で定義されている
- [ ] スコープ（含む/含まない）が明確に記載されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. P50チェック: 既実装状態の調査
2. 参照資料の確認（既存仕様書・Issue・落とし穴）
3. FR/NFR/ACの定義
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect --phase 1
```

## 次のPhase

Phase 2: 設計
