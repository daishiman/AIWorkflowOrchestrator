# Phase 5 実装計画

## メタ情報

| 項目      | 内容                                            |
| --------- | ----------------------------------------------- |
| タスクID  | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| Phase     | 5                                               |
| 作成日    | 2026-03-24                                      |
| 依存Phase | Phase 1-4                                       |

## 実装原則

1. **Authority 境界を先に定義する**: Main / Preload / Renderer のどこで何を止めるかを最初に固定する
2. **Disclosure を session start に入れる**: AI 利用と外部送信の開示を surface entry と session start の両面で組み込む
3. **Advanced console を最後に接続する**: front default surface への逆流を防ぐため、opt-in detail layer は最終ステップで接続する

---

## 実装順序（5 ステップ）

### Step 1: Authority Boundary（Main Process 層）

**目的**: 全ての safety enforcement の土台を Main Process 側に確立する

| 順序 | 対象ファイル                                                          | 変更内容                                             | 対応設計            |
| ---- | --------------------------------------------------------------------- | ---------------------------------------------------- | ------------------- |
| 1-1  | `apps/desktop/src/main/services/runtime/ApprovalGate.ts`（新規）      | ApprovalGate interface + DefaultApprovalGate 実装    | Section 1.4         |
| 1-2  | `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`     | lane authority 拡張: approval check を実行パスに挿入 | Compliance Baseline |
| 1-3  | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | handoff 前 approval check + disclosure bundle の追加 | Approval Flow       |
| 1-4  | `apps/desktop/src/main/ipc/terminalHandlers.ts`                       | terminal:open の実行前に approval token 検証を追加   | APR-T3              |

**完了基準**:

- [ ] ApprovalGate.checkApproval() が sessionId + operationId + TTL で検証する
- [ ] approval token の TTL は 300 秒（R-M1 対応）
- [ ] 承認なしで危険操作・外部送信が Main Process で拒否される
- [ ] 全ての実行パスに ApprovalGate が配置されている

**R-M1 対応（Token TTL）**: Approval token の有効期限を 300 秒（5分）に設定する。単一操作ごとに失効し、同一 token の再利用は不可。

### Step 2: IPC Contract（Preload 層）

**目的**: Renderer ←→ Main の通信境界を定義し、ホワイトリストを更新する

| 順序 | 対象ファイル                                              | 変更内容                                                | 対応設計       |
| ---- | --------------------------------------------------------- | ------------------------------------------------------- | -------------- |
| 2-1  | `apps/desktop/src/preload/channels.ts`                    | 新規チャネル定数を追加                                  | Section 5.1    |
| 2-2  | `apps/desktop/src/preload/index.ts`                       | ALLOWED_INVOKE_CHANNELS に新規チャネルを登録            | Section 5.2    |
| 2-3  | `apps/desktop/src/main/ipc/approvalHandlers.ts`（新規）   | approval:request / approval:respond の IPC handler 登録 | Approval Flow  |
| 2-4  | `apps/desktop/src/main/ipc/disclosureHandlers.ts`（新規） | execution:get-disclosure-info の IPC handler 登録       | Disclosure 2.4 |

**新規 IPC チャネル一覧**:

| チャネル名                      | 方向            | 目的                       | バリデーション        |
| ------------------------------- | --------------- | -------------------------- | --------------------- |
| `approval:request`              | Main → Renderer | 承認要求の通知             | -（push 通知）        |
| `approval:respond`              | Renderer → Main | 承認/拒否の応答            | P42 3段バリデーション |
| `execution:get-disclosure-info` | Renderer → Main | AI 利用・送信先情報の取得  | P42 3段バリデーション |
| `execution:get-terminal-log`    | Renderer → Main | raw terminal output の取得 | P42 3段バリデーション |
| `execution:get-copy-command`    | Renderer → Main | handoff 用 command の取得  | P42 3段バリデーション |

**完了基準**:

- [ ] 全新規チャネルが ALLOWED_INVOKE_CHANNELS に登録されている
- [ ] 全 IPC handler に validateIpcSender が配置されている
- [ ] 全文字列引数に P42 準拠 3段バリデーション（typeof → 空文字列 → trim 空文字列）が適用されている
- [ ] cookie API が contextBridge に存在しない（CAG-2 準拠）

### Step 3: Disclosure Integration（Renderer 層 - Safety Surface）

**目的**: Session 開始時の AI 利用開示と外部送信開示を組み込む

| 順序 | 対象ファイル                                                                         | 変更内容                                             | 対応設計     |
| ---- | ------------------------------------------------------------------------------------ | ---------------------------------------------------- | ------------ |
| 3-1  | `apps/desktop/src/renderer/components/execution/SessionDisclosureBanner.tsx`（新規） | disclosure banner コンポーネント実装                 | FR-2, FR-3   |
| 3-2  | `apps/desktop/src/renderer/views/ExecutionConsoleView/index.tsx`                     | session state 遷移で banner 表示/非表示を制御        | DSC-R1〜R5   |
| 3-3  | `apps/desktop/src/renderer/components/execution/ApprovalSheet.tsx`（新規）           | approval sheet コンポーネント実装（disclosure 内包） | FR-1, DSC-R4 |

**SessionDisclosureBanner 実装要件**:

- collapsed → ready 遷移で自動表示
- dismiss 可能（onDismiss コールバック）
- dismiss 後も再表示アイコンを Session Dock ヘッダー右端に配置（R-M2 対応）
- guidance-only state では「AI 実行なし」の旨を表示（DSC-R5）
- Main Process から IPC 経由で取得する情報: provider 名、model 名、送信先種別のみ（secret 非含有）

**ApprovalSheet 実装要件**:

- operationType に応じて表示内容を切替（external_send / dangerous_operation）
- 3つのアクション: 「承認」「拒否」「詳細を見る」
- Approval Sheet 内の disclosure は dismiss 不可（DSC-R4）
- 停止方法を常に表示
- 初期フォーカスは「拒否」ボタン（安全側デフォルト）
- キーボード操作で完結（Tab / Enter / Escape）（NFR-5）

**R-M2 対応（再表示 icon 配置）**: Session Dock ヘッダーの右端に info icon（i マーク）を配置する。dismiss 後のみ表示され、クリックで同一内容のバナーを再表示する。

**完了基準**:

- [ ] Session open 時に disclosure banner が表示される
- [ ] banner に AI モデル名と送信先種別が含まれる
- [ ] dismiss 後に再表示アイコンが Session Dock ヘッダー右端に表示される
- [ ] Approval Sheet 内の disclosure が dismiss 不可である
- [ ] Approval Sheet がキーボード操作で完結する

### Step 4: Approval Flow Integration（Renderer + Main 連携）

**目的**: Approval Sheet と Main Process の ApprovalGate を IPC 経由で接続する

| 順序 | 対象ファイル                                                      | 変更内容                                              | 対応設計       |
| ---- | ----------------------------------------------------------------- | ----------------------------------------------------- | -------------- |
| 4-1  | `apps/desktop/src/renderer/views/ExecutionConsoleView/index.tsx`  | 実行 CTA 押下 → Approval Sheet 表示の分岐ロジック追加 | Approval Flow  |
| 4-2  | `apps/desktop/src/renderer/hooks/useApprovalFlow.ts`（新規）      | Approval IPC 通信と state 管理の custom hook          | Approval Flow  |
| 4-3  | `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts` | approval check 結果に基づく実行許可/拒否の最終判定    | Design Summary |

**Approval Flow の具体的シーケンス**:

```
1. User が「実行する」CTA をクリック
2. Renderer: approval check が必要か判定（操作種別に基づく）
3. [approval 必要] → ApprovalSheet を表示
4. User が「承認」をクリック
5. Renderer: IPC `approval:respond` で Main に承認を送信
6. Main: ApprovalGate が approval token を生成（sessionId + operationId + timestamp）
7. Main: 操作を実行
8. Main: approval token を無効化（単一操作失効）
```

**完了基準**:

- [ ] 外部送信（APR-T1）前に Approval Sheet が表示される
- [ ] 危険操作（APR-T2〜T4）前に Approval Sheet が表示される
- [ ] 承認後に Main Process で操作が実行される
- [ ] 拒否後に ready state に戻る
- [ ] approval 不要操作で Approval Sheet が表示されない

### Step 5: Advanced Console Gate（Renderer 層 - Detail Surface）

**目的**: opt-in detail layer を最後に接続し、front default surface への逆流を防止する

| 順序 | 対象ファイル                                                                      | 変更内容                                       | 対応設計          |
| ---- | --------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------- |
| 5-1  | `apps/desktop/src/renderer/components/execution/AdvancedConsolePanel.tsx`（新規） | opt-in raw terminal panel 実装                 | FR-4, Section 4   |
| 5-2  | `apps/desktop/src/renderer/views/ExecutionConsoleView/index.tsx`                  | advanced console toggle CTA 配置 + gate 条件   | GATE-1〜3, CTA-R2 |
| 5-3  | `apps/desktop/src/renderer/hooks/useAdvancedConsole.ts`（新規）                   | advanced console の IPC 通信と state 管理 hook | Section 5.1       |

**AdvancedConsolePanel 実装要件**:

- isOpen=false がデフォルト
- 「高度な表示」toggle は secondary CTA として配置
- raw terminal output のリアルタイム表示
- copy command 表示（API key 非含有: DENY-6 準拠）
- operation log のタイムスタンプ付き表示
- running / done / aborted state で read-only モード（input 系操作を disabled）（R-M3 対応）
- collapsed / unavailable / guidance-only state では toggle CTA ごと非表示

**R-M3 対応（read-only 詳細）**: running / done / aborted state では以下の操作を disabled にする:

- 直接コマンド入力（パネル内には存在しないが、将来拡張を考慮して disabled ガード）
- 外部送信ボタン（Approval Sheet 経由でのみ許可）
- 自動実行トリガー
- read-only で許可: scroll / search / copy command / raw log 閲覧

**最後に接続する理由**: Advanced Console は Layer 3（Detail Surface）に属し、Layer 1（Primary）と Layer 2（Safety）が完成してから接続することで、以下を保証する:

1. Approval / Disclosure が先に動作していること
2. Advanced Console からの操作が Approval gate を必ず通過すること
3. front default surface に advanced console の痕跡が漏出しないこと

**完了基準**:

- [ ] 初期状態で AdvancedConsolePanel が非表示
- [ ] 「高度な表示」が secondary 以下に配置されている
- [ ] collapsed / unavailable / guidance-only state で toggle CTA が非表示
- [ ] running / done / aborted state で read-only モード
- [ ] copy command に API key が含まれない

---

## Consumer Auth Guard 実装

Consumer Auth Guard は Step 1 と Step 2 に分散して実装する:

| 対象                       | Step | 実装内容                                               |
| -------------------------- | ---- | ------------------------------------------------------ |
| claude.ai token 検出・拒否 | 1-2  | RuntimePolicyResolver に token format 検証を追加       |
| cookie API 非公開          | 2-2  | contextBridge に cookie API を追加しない（消極的防御） |
| consumer 認証 IPC 非登録   | 2-3  | claude.ai OAuth 関連の IPC handler を作成しない        |

---

## 依存関係グラフ

```
Step 1 (Authority)
  │
  ├──→ Step 2 (IPC Contract)
  │      │
  │      ├──→ Step 3 (Disclosure)
  │      │      │
  │      │      └──→ Step 4 (Approval Flow)
  │      │             │
  │      │             └──→ Step 5 (Advanced Console)
  │      │
  │      └── Consumer Auth Guard (Step 1-2 + Step 2-2/2-3 で並列)
  │
  └── P42 バリデーション (全 Step に適用)
```

**並列実行不可の理由**: 各 Step が前の Step の成果物に依存する。Authority boundary（Step 1）が確定しないと IPC 契約（Step 2）が書けず、IPC 契約なしでは Renderer 層の実装（Step 3-5）が Main と通信できない。

---

## テストとの対応

| Step | 対応テストケース（test-matrix.md）                               |
| ---- | ---------------------------------------------------------------- |
| 1    | APR-10〜APR-16（Main enforcement）、CAG-01                       |
| 2    | ADV-14〜ADV-15（IPC ホワイトリスト、バリデーション）、CAG-02〜03 |
| 3    | DSC-01〜DSC-11（Disclosure 全般）、NFR-01〜NFR-03                |
| 4    | APR-01〜APR-09, APR-17〜APR-18（Approval UI + a11y）             |
| 5    | ADV-01〜ADV-13（Advanced Console 全般）、CTA-01〜CTA-05          |

---

## エラーハンドリング方針

| エラーカテゴリ       | コード範囲 | 処理                                                  |
| -------------------- | ---------- | ----------------------------------------------------- |
| Approval Validation  | 1000-1999  | token 検証失敗: 実行拒否 + エラー表示                 |
| Disclosure Fetch     | 3000-3999  | disclosure info 取得失敗: フォールバック表示          |
| IPC Communication    | 4000-4999  | IPC 通信失敗: リトライ可能。sanitizeErrorMessage 適用 |
| Consumer Auth Detect | 1000-1999  | claude.ai token 検出: 即座に拒否                      |
