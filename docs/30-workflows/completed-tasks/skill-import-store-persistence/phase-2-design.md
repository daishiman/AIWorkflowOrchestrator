# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 2                              |
| Phase名    | 設計                           |
| 前提Phase  | Phase 1                        |
| 後続Phase  | Phase 3                        |
| ステータス | 未実施                         |
| 作成日     | 2026-01-22                     |
| 機能名     | skill-import-store-persistence |

---

## 目的

Phase 1で特定された原因に基づき、electron-storeの永続化問題を修正するための設計を行う。

## 背景

Phase 1の調査により、スキルインポート永続化が機能しない原因が特定されている。本Phaseでは、その原因に対する修正設計を行い、テスト可能な形で実装方針を明確化する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 修正方針の設計

**目的**: Phase 1で特定された原因に対する修正方針を設計する

**実行手順**:

1. Phase 1の調査結果（`outputs/phase-01/requirements.md`）を読み込む
2. 原因に応じた修正方針を検討する
   - ストアファイルパスの問題の場合: `cwd`や`name`設定の修正
   - 初期化タイミングの問題の場合: 初期化フローの修正
   - キー名/スキーマの問題の場合: データ構造の修正
3. 修正による影響範囲を評価する
4. 既存テストへの影響を評価する
5. 設計書を `outputs/phase-02/design-document.md` に記録する

**期待される成果物**:

- `outputs/phase-02/design-document.md`

---

### タスク2: electron-store設定の見直し

**目的**: electron-storeの正しい設定方法を確認し、必要な修正を設計する

**実行手順**:

1. electron-storeの公式ドキュメントを参照する
   - https://github.com/sindresorhus/electron-store#api
2. 以下の設定項目を確認する
   - `name`: ストアファイル名
   - `cwd`: ストアファイルの保存ディレクトリ
   - `schema`: データスキーマ（バリデーション用）
   - `defaults`: デフォルト値
3. 現在の実装との差分を特定する
4. 修正が必要な設定を明記する
5. 設定変更仕様を `outputs/phase-02/store-config-spec.md` に記録する

**期待される成果物**:

- `outputs/phase-02/store-config-spec.md`

---

### タスク3: テスト戦略の設計

**目的**: 修正を検証するためのテスト戦略を設計する

**実行手順**:

1. 既存のユニットテスト（28件）の内容を確認する
2. 実環境での動作を検証するための追加テストを設計する
   - electron-storeの実ファイルI/Oテスト
   - IPC経由での永続化テスト
   - アプリ再起動後のデータ保持テスト
3. モックと実装の差異を解消するテストアプローチを検討する
4. テスト戦略を `outputs/phase-02/test-strategy.md` に記録する

**期待される成果物**:

- `outputs/phase-02/test-strategy.md`

---

## 参照資料

| 参照資料           | パス                                                         | 内容             |
| ------------------ | ------------------------------------------------------------ | ---------------- |
| Phase 1成果物      | `outputs/phase-01/`                                          | 調査結果         |
| SkillImportManager | `apps/desktop/src/main/services/skill/SkillImportManager.ts` | 実装コード       |
| electron-store公式 | https://github.com/sindresorhus/electron-store               | 公式ドキュメント |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                        | 内容               |
| ------------------------- | --------------------------------------------------------------------------- | ------------------ |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | skill:\* IPC仕様   |
| エラーハンドリング        | `.claude/skills/aiworkflow-requirements/references/error-handling.md`       | エラー処理パターン |

---

## 成果物

| 成果物         | パス                                    | 内容               |
| -------------- | --------------------------------------- | ------------------ |
| 設計書         | `outputs/phase-02/design-document.md`   | 修正方針と設計     |
| ストア設定仕様 | `outputs/phase-02/store-config-spec.md` | electron-store設定 |
| テスト戦略     | `outputs/phase-02/test-strategy.md`     | テスト方針         |

---

## 統合テスト連携（Phase 1〜11は必須）

このPhaseでは統合テスト観点として以下を設計に反映する：

- 統合ポイント: electron-store←→SkillImportManager←→SkillService←→IPC Handler
- API契約: `skill:import`、`skill:list-imported`の入出力仕様

---

## 完了条件

- [ ] 修正方針が明確に設計されている
- [ ] electron-storeの設定変更が明記されている
- [ ] テスト戦略が設計されている
- [ ] 既存テストへの影響が評価されている
- [ ] 全ての成果物が`outputs/phase-02/`に出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-store-persistence/phase-3-design-review.md`
