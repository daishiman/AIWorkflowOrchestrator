# Phase 2 Approval / Disclosure 契約

## メタ情報

| 項目      | 内容                                            |
| --------- | ----------------------------------------------- |
| タスクID  | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| Phase     | 2                                               |
| 作成日    | 2026-03-24                                      |
| 依存Phase | Phase 1                                         |

## 1. Approval Contract

### 1.1 Approval Trigger 定義

| Trigger ID | 操作種別          | 発火条件                                        | Approval 種別       |
| ---------- | ----------------- | ----------------------------------------------- | ------------------- |
| APR-T1     | 外部 API 呼び出し | LLM API / 外部ツール API への送信直前           | external_send       |
| APR-T2     | ファイル書き込み  | ユーザーファイルシステムへの書き込み操作直前    | dangerous_operation |
| APR-T3     | 外部プロセス起動  | terminal handoff / 外部アプリケーション起動直前 | dangerous_operation |
| APR-T4     | システム設定変更  | OS 設定やアプリ設定の変更直前                   | dangerous_operation |

### Approval 粒度

| スコープ       | 説明                                                                   | 採用 |
| -------------- | ---------------------------------------------------------------------- | ---- |
| 操作ごと       | 各 LLM API 呼び出しで個別に approval を要求                            | -    |
| スキル実行ごと | スキル実行開始時の1回 approval で同一セッション内の API 呼び出しを網羅 | 推奨 |

スキル実行ごとの approval を推奨する。ただし、操作種別が変わる場合（例: read → external send）は再 approval を要求する。

### 1.2 Approval Flow

```
User CTA → Approval Check → [要 approval?]
                               ├─ Yes → Approval Sheet 表示
                               │         ├─ 承認 → 実行
                               │         ├─ 拒否 → ready state に戻る
                               │         └─ 詳細 → 詳細パネル表示後、承認/拒否
                               └─ No  → 直接実行
```

### 1.3 Approval Sheet 表示内容

| セクション   | 内容                                              | 必須 |
| ------------ | ------------------------------------------------- | ---- |
| 操作タイトル | 「外部送信の確認」「操作の確認」等                | 必須 |
| 操作説明     | 何が行われるかの1-2文の説明                       | 必須 |
| 送信先情報   | 外部送信の場合：送信先 URL / サービス名           | 条件 |
| データ概要   | 送信/操作対象のデータ概要                         | 必須 |
| 停止方法     | 「実行中でも『中止』ボタンで停止できます」        | 必須 |
| アクション   | 「承認」「拒否」ボタン + オプション「詳細を見る」 | 必須 |

### 1.4 Approval Enforcement（Main Process）

```typescript
// 設計契約: Main Process での enforcement
interface ApprovalGate {
  /**
   * 操作実行前に approval 状態を検証する。
   * approved === false の場合、実行を拒否して error を返す。
   */
  checkApproval(sessionId: string, operationId: string): ApprovalStatus;
}

type ApprovalStatus =
  | { approved: true; approvedAt: number }
  | { approved: false; reason: "not_requested" | "rejected" | "expired" };
```

- Renderer 側で承認後、IPC 経由で Main Process に approval token を送信
- Main Process は approval token の有効性（session ID + operation ID + 有効期限）を検証
- 有効期限: 単一操作ごと（操作完了後に失効）

### 1.5 Approval 不要操作

| 操作種別                  | 理由                                   |
| ------------------------- | -------------------------------------- |
| ローカルファイル読み込み  | 情報参照のみ。書き込みなし             |
| UI 状態変更               | Renderer 内部の状態遷移                |
| Session Dock 開閉         | UI 操作のみ                            |
| Advanced Console toggle   | detail layer の表示/非表示切替         |
| Disclosure banner dismiss | 開示バナーの非表示化（再表示導線あり） |

## 2. Disclosure Contract

### 2.1 Disclosure Timing

| Event               | 開示内容                               | 表示方式                |
| ------------------- | -------------------------------------- | ----------------------- |
| Session open        | AI 利用 + 外部送信可能性               | SessionDisclosureBanner |
| 外部送信実行前      | 送信先 + 送信内容概要                  | Approval Sheet          |
| 危険操作実行前      | 操作内容 + 影響範囲                    | Approval Sheet          |
| Terminal handoff 前 | handoff 理由 + terminal で行われる操作 | Approval Sheet          |

### 2.2 AI Disclosure 内容

```
このセッションでは AI（{modelName}）が操作を支援します。
外部サービス（{destinations}）へのデータ送信が発生する場合があります。
実行前に確認画面が表示されます。
```

### 2.3 Disclosure 表示規則

| 規則 ID | 規則                                                             |
| ------- | ---------------------------------------------------------------- |
| DSC-R1  | Session open 時に必ず1回表示する（dismiss 前の初期状態は表示）   |
| DSC-R2  | dismiss 後はバナーを非表示にするが、再表示アイコンを維持する     |
| DSC-R3  | 同一 Session 内で再表示を要求した場合、同じ内容を表示する        |
| DSC-R4  | Approval Sheet 内の disclosure は dismiss 不可（操作判断に必須） |
| DSC-R5  | guidance-only state では「AI 実行なし」の旨を開示する            |

### 2.4 Disclosure Data Flow

```
Main Process                    Renderer
┌──────────────┐               ┌─────────────────────┐
│ LLM Config   │──(IPC)──────→│ disclosure banner    │
│ - modelName  │               │ - AI service name    │
│ - provider   │               │ - external dest list │
└──────────────┘               └─────────────────────┘

│ 送信しない情報:              │ 表示する情報:
│ - API key                    │ - provider 名
│ - token                      │ - model 名
│ - internal path              │ - 送信先種別
```

## 3. No Auto-Send Contract

### 3.1 禁止される自動送信パターン

| ID    | パターン                                  | 防止方法                  |
| ----- | ----------------------------------------- | ------------------------- |
| NAS-1 | transcript を chat message として自動送信 | IPC endpoint を提供しない |
| NAS-2 | session 結果を外部サービスに自動報告      | IPC endpoint を提供しない |
| NAS-3 | エラーログを外部に自動送信                | IPC endpoint を提供しない |
| NAS-4 | ユーザー操作なしでの LLM API 呼び出し     | Approval gate で阻止      |

### 3.2 許可される明示的送信パターン

| ID   | パターン                                 | 条件                    |
| ---- | ---------------------------------------- | ----------------------- |
| AS-1 | Manual Share Rail 経由の transcript 共有 | 3操作（選択→確認→送信） |
| AS-2 | Approval 承認済みの LLM API 呼び出し     | Approval Sheet 承認後   |
| AS-3 | ユーザー明示操作による外部ツール実行     | Approval Sheet 承認後   |

## 4. Consumer Auth Guard

### 4.1 禁止事項

| ID    | 禁止事項                                       | 検出方法                           |
| ----- | ---------------------------------------------- | ---------------------------------- |
| CAG-1 | claude.ai session token をアプリ内で受け入れる | Main Process で token format 検証  |
| CAG-2 | claude.ai cookie をアプリ内で参照する          | Preload で cookie API を公開しない |
| CAG-3 | consumer 認証フローをアプリ内で実装する        | 設計レビューで検出                 |

### 4.2 許可される認証方式

| 方式               | 用途                  | RuntimePolicyResolver 対応     |
| ------------------ | --------------------- | ------------------------------ |
| API Key            | integrated_api lane   | パターンA（apiKey 有効）       |
| Subscription Token | terminal_handoff lane | パターンC（subscription 有効） |
| なし（no-auth）    | terminal_handoff lane | パターンB（no-auth fallback）  |
