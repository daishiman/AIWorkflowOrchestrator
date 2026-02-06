# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 1                                 |
| 機能名 | DEBT-SEC-001-auth-state-parameter |
| 作成日 | 2026-02-05                        |
| 状態   | 未着手                            |

## 目的

タスクの目的、スコープ、受け入れ基準を明文化する。

## 実行タスク

- 要件抽出: ユーザー要求（セキュリティレビュー指摘）から機能要件・非機能要件を抽出
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準を定義
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定

---

## 要件定義

### ユーザー要求（セキュリティレビュー指摘）

@sec-auditor: "State parameterによるCSRF対策が推奨されます。現在の実装ではコールバックURLの検証が不十分です。"
@electron-security: "OAuth認証フローにおいてstate検証が未実装です。CSRF攻撃のリスクが残存しています。"

### 機能要件（FR）

| FR-ID | 要件                                                          | 優先度 |
| ----- | ------------------------------------------------------------- | ------ |
| FR-01 | OAuth認証開始時にランダムなstateパラメータを生成する          | 高     |
| FR-02 | stateパラメータをメモリ（Main Process Map）に一時保存する     | 高     |
| FR-03 | コールバック受信時にstateパラメータを検証する                 | 高     |
| FR-04 | 不正なstateの場合はトークンを拒否しエラーメッセージを表示する | 高     |
| FR-05 | stateパラメータに有効期限（10分）を設定する                   | 中     |
| FR-06 | 検証成功後にstateを削除する（ワンタイムユース）               | 高     |
| FR-07 | stateとOAuthプロバイダーを紐付けて保存する                    | 中     |

### 非機能要件（NFR）

| NFR-ID | 要件                                                               | 優先度 | 参照                           |
| ------ | ------------------------------------------------------------------ | ------ | ------------------------------ |
| NFR-01 | crypto.randomBytes(32)で高エントロピーな乱数を使用する             | 高     | -                              |
| NFR-02 | 既存テストが全て通過する                                           | 高     | -                              |
| NFR-03 | TypeScript型安全性が維持される                                     | 高     | -                              |
| NFR-04 | RFC 6749 Section 10.12のCSRF対策に準拠する                         | 高     | -                              |
| NFR-05 | 期限切れstateの自動クリーンアップ                                  | 中     | -                              |
| NFR-06 | CSRF検証失敗を認証失敗イベントとしてセキュリティログに記録すること | 高     | `security-operations.md`       |
| NFR-07 | stateパラメータの形式を検証すること（64文字hex文字列）             | 高     | `security-input-validation.md` |

---

## 受け入れ基準

### AC-01: State生成

**Given**: ユーザーがOAuthログインボタンをクリックする
**When**: auth:loginハンドラーが実行される
**Then**: ランダムなstateパラメータが生成され、Supabase OAuth URLに含まれる

### AC-02: State検証成功

**Given**: 正しいstateパラメータを含むコールバックURLを受信する
**When**: handleAuthCallback関数が実行される
**Then**: stateが検証に成功し、トークン処理が続行される

### AC-03: State検証失敗（不正なstate）

**Given**: 不正なstateパラメータを含むコールバックURLを受信する
**When**: handleAuthCallback関数が実行される
**Then**: トークン処理が拒否され、エラーメッセージが表示される

### AC-04: State検証失敗（stateなし）

**Given**: stateパラメータを含まないコールバックURLを受信する
**When**: handleAuthCallback関数が実行される
**Then**: トークン処理が拒否され、エラーメッセージが表示される

### AC-05: 有効期限切れ

**Given**: 10分以上経過したstateパラメータを含むコールバックURLを受信する
**When**: handleAuthCallback関数が実行される
**Then**: stateが期限切れとして拒否される

### AC-06: ワンタイムユース

**Given**: 既に使用されたstateパラメータを含むコールバックURLを受信する
**When**: handleAuthCallback関数が実行される
**Then**: stateが無効として拒否される

---

## スコープ定義

### 含むもの

- StateManagerモジュールの新規作成
- authHandlers.ts修正（state生成・OAuth URLへの追加）
- index.ts修正（コールバック受信時のstate検証）
- StateManagerユニットテスト作成
- 手動テスト（3プロバイダー正常系 + 2異常系）
- セキュリティガイドライン更新

### 含まないもの

- PKCE実装（DEBT-SEC-002として別タスク）
- カスタムプロトコルURL詳細検証（DEBT-SEC-003として別タスク）
- セッション管理の改善（別タスク）

---

## アーキテクチャ層別要件

| 層           | 要件                                                       |
| ------------ | ---------------------------------------------------------- |
| Main Process | StateManagerモジュール作成、state生成・検証ロジック        |
| IPC通信      | authHandlers.ts修正（state生成をsignInWithOAuthに追加）    |
| Preload      | 変更不要（既存チャネル使用）                               |
| Renderer     | 変更不要（エラーメッセージはAUTH_STATE_CHANGED経由で受信） |

---

## 参照資料

| 資料名               | パス                                                                              | 説明                         |
| -------------------- | --------------------------------------------------------------------------------- | ---------------------------- |
| 認証アーキテクチャ   | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` | Supabase + Electron認証      |
| セキュリティ設計原則 | `.claude/skills/aiworkflow-requirements/references/security-principles.md`        | OAuth/CSRF対策原則           |
| Electronセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      | IPC・プロトコル安全性        |
| セキュリティ運用     | `.claude/skills/aiworkflow-requirements/references/security-operations.md`        | ログ・監査・インシデント対応 |
| 入力バリデーション   | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`  | バリデーション原則           |
| IPC認証チャネル      | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`               | 認証IPC通信仕様              |
| RFC 6749             | Section 10.12                                                                     | CSRF対策仕様                 |

---

## 実行手順

1. 参照資料を確認する
2. 実行タスクを順番に実施する
3. 各タスクの成果物を作成する
4. 完了条件を全て満たすことを確認する
5. 成果物を所定のパスに配置する

---

## 統合テスト連携【必須】

| 接続要件カテゴリ | 記載内容                                                         |
| ---------------- | ---------------------------------------------------------------- |
| API接続          | Supabase signInWithOAuth options.queryParamsにstate追加          |
| 認証フロー       | OAuth開始→state生成→外部ブラウザ→コールバック→state検証→ログイン |
| データフロー     | Main Process Map（state保存）→コールバック検証→Renderer通知      |

---

## 多角的チェック観点（AIが判断）

本Phaseの成果物に対して、以下の観点から品質を検証する:

| 観点       | 確認内容                                 |
| ---------- | ---------------------------------------- |
| 完全性     | 全ての要求事項が漏れなく反映されているか |
| 一貫性     | 他のPhase成果物との矛盾がないか          |
| 正確性     | 技術的な記述が正確であるか               |
| 追跡可能性 | 要件→設計→実装→テストの追跡が可能か      |

---

## 成果物

| 成果物     | パス                                         | 説明           |
| ---------- | -------------------------------------------- | -------------- |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | 本ドキュメント |

---

## 完了条件

- [ ] 全要件が抽出されている（FR 7件、NFR 5件）
- [ ] 各要件に受け入れ基準がある（AC 6件）
- [ ] FR/NFRが分類されている
- [ ] スコープが定義されている
- [ ] アーキテクチャ層別要件が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

| サブタスク     | 状態 | 備考 |
| -------------- | ---- | ---- |
| (実行時に記録) | -    | -    |

---

## タスク100%実行確認【必須】

- [ ] 全ての実行タスクを完了した
- [ ] 全ての成果物を作成した
- [ ] 全ての完了条件を満たした
- [ ] 成果物の品質を多角的チェック観点で検証した

> **注意**: このチェックリストが全てチェックされるまで、次のPhaseに進んではならない。

## 次のPhase

Phase 2: 設計
