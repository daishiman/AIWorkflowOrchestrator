# Phase 2: 設計 - Agent SDK 依存関係修正

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 2                        |
| Phase名    | 設計                     |
| 前提Phase  | Phase 1（要件定義）      |
| 後続Phase  | Phase 3（設計レビュー）  |
| ステータス | 未実施                   |
| 作成日     | 2026-01-13               |
| 機能名     | agent-sdk-dependency-fix |

---

## 目的

要件定義に基づき、SDK パッケージ解決問題の修正設計を行う。

## 背景

Phase 1 で特定された根本原因に対して、具体的な修正方針を設計する。

---

## 実行タスク

### タスク1: 修正方針設計

**目的**: 根本原因に対する修正方針を決定する

**実行手順**:

1. electron-vite の externals 設定を確認・修正方針を決定
2. pnpm ワークスペース設定を確認・修正方針を決定
3. ESM/CJS 互換性問題がある場合の対応方針を決定
4. 複数の修正オプションがある場合は比較検討

**期待される成果物**:

- 修正方針設計書

---

### タスク2: electron-vite 設定設計

**目的**: Electron ビルド設定の修正設計を行う

**実行手順**:

1. `electron.vite.config.ts` の現状確認
2. `build.rollupOptions.external` の設定確認
3. `@anthropic-ai/claude-agent-sdk` を適切に処理するための設定変更案を作成
4. 必要に応じて `resolve.alias` の設定も検討

**期待される成果物**:

- electron-vite 設定変更案

---

### タスク3: パッケージ解決設計

**目的**: pnpm/Node.js のモジュール解決の修正設計を行う

**実行手順**:

1. `package.json` の依存関係設定を確認
2. `pnpm-workspace.yaml` の設定を確認
3. `.npmrc` の設定を確認
4. 必要な修正を設計

**期待される成果物**:

- パッケージ解決設計書

---

### タスク4: フォールバック設計

**目的**: SDK が利用できない場合のフォールバック設計を行う

**実行手順**:

1. SDK 初期化失敗時のエラーハンドリング設計
2. グレースフルデグラデーションの設計
3. ユーザーへのエラー通知設計

**期待される成果物**:

- フォールバック設計書

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                        | 内容                     |
| ------------------------- | --------------------------------------------------------------------------- | ------------------------ |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | SDK統合の全体仕様        |
| 技術スタック（DevOps）    | `.claude/skills/aiworkflow-requirements/references/technology-devops.md`    | pnpm/依存関係管理        |
| エラーハンドリング        | `.claude/skills/aiworkflow-requirements/references/error-handling.md`       | エラー分類・リトライ戦略 |

### Phase 1 成果物

| 参照資料     | パス                                         | 説明          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |

---

## 成果物

| 成果物             | パス                                     | 説明                  |
| ------------------ | ---------------------------------------- | --------------------- |
| アーキテクチャ     | `outputs/phase-2/architecture-design.md` | 修正方針設計          |
| 設定変更案         | `outputs/phase-2/config-changes.md`      | electron-vite設定変更 |
| フォールバック設計 | `outputs/phase-2/fallback-design.md`     | エラー時対応設計      |

---

## 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント       | 契約定義                       |
| ------------------ | ------------------------------ |
| SDK→Main Process   | `query()` API 呼び出し契約     |
| Main→Renderer      | `agent:message` IPC ペイロード |
| エラーハンドリング | `AgentError` 階層の伝播        |

---

## 完了条件

- [ ] 修正方針が決定されている
- [ ] electron-vite 設定変更案が作成されている
- [ ] パッケージ解決設計が完了している
- [ ] フォールバック設計が完了している
- [ ] 要件との整合性が確認されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Phase 1 成果物の確認
2. 修正方針設計
3. electron-vite 設定設計
4. パッケージ解決設計
5. フォールバック設計
6. 統合テスト連携の記載
7. 成果物の作成・配置
8. 完了条件の検証

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/agent-sdk-dependency-fix/phase-3-design-review.md`
