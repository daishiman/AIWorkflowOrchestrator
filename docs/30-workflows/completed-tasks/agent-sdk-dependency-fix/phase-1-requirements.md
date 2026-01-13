# Phase 1: 要件定義 - Agent SDK 依存関係修正

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 1                        |
| Phase名    | 要件定義                 |
| 前提Phase  | なし                     |
| 後続Phase  | Phase 2（設計）          |
| ステータス | 未実施                   |
| 作成日     | 2026-01-13               |
| 機能名     | agent-sdk-dependency-fix |

---

## 目的

`@anthropic-ai/claude-agent-sdk` パッケージが Electron メインプロセスで正常に解決されるための要件を定義する。

## 背景

Electron アプリ起動時に `ERR_MODULE_NOT_FOUND` エラーが発生している。パッケージは `apps/desktop/package.json` で宣言されているが、ビルド後の `out/main/index.js` から参照できない状態。

---

## 実行タスク

### タスク1: 現状調査

**目的**: エラーの根本原因を特定する

**実行手順**:

1. `pnpm ls @anthropic-ai/claude-agent-sdk` でパッケージのインストール状態を確認
2. `apps/desktop/out/main/` ディレクトリの構造を確認
3. electron-vite の設定ファイル（`electron.vite.config.ts`）を確認
4. ESM/CJS 互換性の問題がないか確認

**期待される成果物**:

- 現状調査レポート（エラー原因の特定）

---

### タスク2: 機能要件（FR）抽出

**目的**: 修正に必要な機能要件を明確化する

**実行手順**:

1. SDK パッケージが正常に解決されるための条件を定義
2. ビルドプロセスでの依存関係バンドルの要件を定義
3. ランタイムでのモジュール解決の要件を定義

**期待される成果物**:

- 機能要件リスト

---

### タスク3: 非機能要件（NFR）抽出

**目的**: 修正に必要な非機能要件を明確化する

**実行手順**:

1. ビルド時間への影響を評価
2. バンドルサイズへの影響を評価
3. 他の依存関係への影響を評価

**期待される成果物**:

- 非機能要件リスト

---

### タスク4: 受け入れ基準作成

**目的**: 各要件に対して検証可能な受け入れ基準を定義する

**実行手順**:

1. 機能要件ごとに受け入れ基準を作成
2. 非機能要件ごとに受け入れ基準を作成
3. テスト可能な形式で記述

**期待される成果物**:

- 受け入れ基準一覧

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                         | 内容                         |
| ------------------------- | ---------------------------------------------------------------------------- | ---------------------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  | SDK統合の全体仕様            |
| 技術スタック（コア）      | `.claude/skills/aiworkflow-requirements/references/technology-core.md`       | Electron/TypeScript設定      |
| モノレポアーキテクチャ    | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` | pnpmワークスペース構成       |
| Electronセキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | Electron依存関係セキュリティ |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "claude-agent-sdk"`

---

## 成果物

| 成果物       | パス                                         | 説明             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義           |
| 現状調査     | `outputs/phase-1/current-state-analysis.md`  | 原因分析         |

---

## 統合テスト連携【必須】

接続要件（API/認証/データフロー）を要件に明記する:

| 接続要件カテゴリ   | 記載内容                             |
| ------------------ | ------------------------------------ |
| SDK初期化          | Claude Agent SDK の初期化シーケンス  |
| IPC通信            | Renderer→Main の agent:\* チャンネル |
| エラーハンドリング | モジュール解決失敗時のフォールバック |

---

## 完了条件

- [ ] 現状調査が完了し、根本原因が特定されている
- [ ] 全機能要件（FR）が抽出されている
- [ ] 全非機能要件（NFR）が抽出されている
- [ ] 各要件に受け入れ基準がある
- [ ] 接続要件（SDK初期化/IPC/エラーハンドリング）が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 現状調査の実施
3. 機能要件（FR）の抽出
4. 非機能要件（NFR）の抽出
5. 受け入れ基準の作成
6. 統合テスト連携の記載
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（初回Phase）
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/agent-sdk-dependency-fix/phase-2-design.md`
