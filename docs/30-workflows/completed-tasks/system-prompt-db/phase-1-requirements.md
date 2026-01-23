# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 1                                      |
| Phase名    | 要件定義                               |
| 前提Phase  | -                                      |
| 後続Phase  | Phase 2                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-22                             |
| 機能名     | システムプロンプトのデータベース永続化 |

---

## 目的

システムプロンプトテンプレートのデータベース永続化機能について、機能要件・非機能要件・受け入れ基準を明確に定義する。

## 背景

現在の実装では、システムプロンプトテンプレートは `electron-store` でローカル保存されており、デバイス間での共有やWebアプリでの利用ができない。Tursoデータベースへの移行により、これらの課題を解決する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 機能要件の定義

**目的**: システムプロンプトDB永続化機能の機能要件を明確化する

**実行手順**:

1. 既存のシステムプロンプト機能を確認する
   - `apps/desktop/src/renderer/store/slices/systemPromptTemplateSlice.ts` を確認
   - 現在のテンプレート管理機能（作成・読取・更新・削除）を把握
2. ユーザーストーリーを記述する
   - ユーザーとしてテンプレートを保存したい
   - ユーザーとして複数デバイスでテンプレートを共有したい
   - ユーザーとしてオフラインでもテンプレートを利用したい
3. 機能要件（FR）を定義する
   - FR-001: テンプレートのCRUD操作
   - FR-002: ユーザー認証との連動
   - FR-003: プリセットテンプレートの保護
   - FR-004: electron-storeからのマイグレーション
4. 成果物を `outputs/phase-1/requirements-functional.md` に出力する

**期待される成果物**:

- `outputs/phase-1/requirements-functional.md`

---

### タスク2: 非機能要件の定義

**目的**: パフォーマンス、セキュリティ、可用性に関する要件を定義する

**実行手順**:

1. パフォーマンス要件を定義する
   - テンプレート保存: 100ms以内
   - テンプレート一覧取得: 200ms以内
   - マイグレーション: 5秒以内（100件まで）
2. セキュリティ要件を定義する
   - ユーザー認可: 所有者のみアクセス可能
   - プリセット保護: プリセットテンプレートは削除・編集不可
3. 可用性要件を定義する
   - オフライン対応: Embedded Replicasによるローカルキャッシュ
   - 同期: オンライン復帰時の自動同期
4. テストカバレッジ要件を定義する
   - Line Coverage: 80%以上
   - Branch Coverage: 60%以上
5. 成果物を `outputs/phase-1/requirements-non-functional.md` に出力する

**期待される成果物**:

- `outputs/phase-1/requirements-non-functional.md`

---

### タスク3: データフロー要件の定義

**目的**: コンポーネント間のデータフローと統合ポイントを定義する

**実行手順**:

1. 既存のデータフローを確認する
   - Renderer → electron-store の現在の流れを確認
2. 新しいデータフローを設計する
   - Desktop: Renderer → IPC → Main → Turso (Embedded Replicas)
   - Web: React → API → Turso
3. 統合ポイントを特定する
   - IPC通信チャネル定義
   - Repository層API定義
   - Zustand Slice更新パターン
4. 成果物を `outputs/phase-1/requirements-dataflow.md` に出力する

**期待される成果物**:

- `outputs/phase-1/requirements-dataflow.md`

---

### タスク4: 受け入れ基準の定義

**目的**: 機能完成の判定基準を明確化する

**実行手順**:

1. 機能面の受け入れ基準を定義する
   - テンプレートのCRUD操作が正常に動作する
   - ユーザー認証と連動している
   - オフラインでも動作する
2. 品質面の受け入れ基準を定義する
   - 全テストがパスする
   - TypeScript/ESLintエラーがない
   - カバレッジ基準を満たす
3. マイグレーション面の受け入れ基準を定義する
   - 既存データが正しく移行される
   - データ損失がない
   - フォールバックが機能する
4. 成果物を `outputs/phase-1/acceptance-criteria.md` に出力する

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                     | パス                                                                           | 内容                     |
| ---------------------------- | ------------------------------------------------------------------------------ | ------------------------ |
| データベーススキーマ         | `.claude/skills/aiworkflow-requirements/references/database-schema.md`         | 既存テーブル設計         |
| システムプロンプトUI         | `.claude/skills/aiworkflow-requirements/references/ui-ux-system-prompt.md`     | 現在の機能仕様           |
| アーキテクチャパターン       | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`   | Slice/Repositoryパターン |
| チャット履歴インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | Repository実装参考       |

---

## 成果物

| 成果物                 | パス                                             | 内容               |
| ---------------------- | ------------------------------------------------ | ------------------ |
| 機能要件定義書         | `outputs/phase-1/requirements-functional.md`     | 機能要件（FR）一覧 |
| 非機能要件定義書       | `outputs/phase-1/requirements-non-functional.md` | NFR一覧            |
| データフロー要件定義書 | `outputs/phase-1/requirements-dataflow.md`       | データフロー設計   |
| 受け入れ基準定義書     | `outputs/phase-1/acceptance-criteria.md`         | AC一覧             |

---

## 統合テスト連携（Phase 1〜11は必須）

本Phaseでは以下の統合テスト連携アクションを実施すること：

- Repository API・認可・データフロー要件を要件に明記する
- IPC通信チャネルの定義を含める
- オフライン対応（Embedded Replicas）の要件を含める

---

## 完了条件

- [ ] 機能要件（FR）が明確に定義されている
- [ ] 非機能要件（NFR）が定義されている
- [ ] データフロー要件が定義されている
- [ ] 受け入れ基準が検証可能な形式で記載されている
- [ ] 全ての成果物が `outputs/phase-1/` に出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/system-prompt-db/phase-2-design.md`
