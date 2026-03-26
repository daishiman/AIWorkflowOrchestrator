# Phase 4 Threat Model Checklist

## メタ情報

| 項目      | 内容                                            |
| --------- | ----------------------------------------------- |
| タスクID  | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| Phase     | 4                                               |
| 作成日    | 2026-03-24                                      |
| 依存Phase | Phase 1-3                                       |

## 脅威モデルの対象範囲

本チェックリストは以下の攻撃面を対象とする:

1. Approval bypass（承認回避）
2. Disclosure suppression（開示抑制）
3. Auto-send injection（自動送信注入）
4. Front surface leakage（front 面への漏出）
5. Secret exposure（秘密情報の露出）
6. Consumer auth embedding（consumer 認証の流用）

---

## 1. Approval Bypass（承認回避）

### 1.1 Renderer 層バイパス

| ID    | 脅威                                     | 攻撃シナリオ                                                       | 防御                                                | 検証方法                          |
| ----- | ---------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------- | --------------------------------- |
| TB-01 | DevTools から approval UI を削除して実行 | Renderer の DOM を DevTools で操作し、ApprovalSheet を除去して実行 | Main Process enforcement: approval token なしで拒否 | APR-11: Main 側で token なし拒否  |
| TB-02 | DevTools から直接 IPC 呼び出し           | contextBridge 経由で approval なしの IPC を直接発火                | Main Process で approval token を毎回検証           | APR-11: checkApproval() の検証    |
| TB-03 | 偽造 approval token の送信               | 任意の文字列を approval token として送信                           | token は sessionId + operationId + timestamp で検証 | APR-13: 別セッション token の拒否 |
| TB-04 | 期限切れ token の再利用                  | 過去の正規 token を保存して再送信                                  | TTL（300s）+ 単一操作失効で防止                     | APR-12: 期限切れ token の拒否     |

### 1.2 Main Process バイパス

| ID    | 脅威                                 | 攻撃シナリオ                                                   | 防御                                                 | 検証方法                            |
| ----- | ------------------------------------ | -------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------- |
| TB-05 | approval gate をスキップする内部パス | Main 内の直接呼び出しで ApprovalGate を経由しない              | 全実行パスに ApprovalGate.checkApproval() を必須配置 | コードレビュー + Integration テスト |
| TB-06 | approval gate の例外リストの濫用     | approval 不要操作リスト（Section 1.5）を悪用して危険操作を通す | 不要操作は明示列挙のみ。列挙外は approval 必須       | APR-15: 不要操作の明示列挙確認      |

### チェックリスト

- [ ] Renderer 側の承認 UI を無効化しても Main Process が実行を拒否する
- [ ] 偽造 / 期限切れ / 他セッションの token が拒否される
- [ ] approval 不要操作リストが安全な操作のみで構成されている
- [ ] 全ての外部送信パス（APR-T1）に approval gate が配置されている
- [ ] 全ての危険操作パス（APR-T2〜T4）に approval gate が配置されている

---

## 2. Disclosure Suppression（開示抑制）

| ID    | 脅威                                             | 攻撃シナリオ                                                    | 防御                                                    | 検証方法                         |
| ----- | ------------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------- |
| TB-07 | Session open 時の disclosure 表示を抑制          | コード変更で SessionDisclosureBanner のレンダリングを省略       | Session state 遷移に banner 表示をハードバインド        | DSC-01: state 遷移で表示確認     |
| TB-08 | Approval Sheet 内 disclosure の dismiss 化       | DSC-R4 違反: Approval Sheet 内の disclosure に close ボタン追加 | コンポーネント設計で dismiss ボタンを配置不可に         | DSC-09: dismiss ボタン非存在確認 |
| TB-09 | disclosure 内容の改竄（モデル名 / 送信先の隠蔽） | Main → Renderer の IPC で modelName を空にする                  | IPC レスポンスのバリデーション + フォールバック表示     | DSC-02, DSC-03: 内容表示確認     |
| TB-10 | 再表示導線の除去                                 | 再表示アイコンを DOM から削除                                   | 再表示アイコンは banner とは独立した DOM 要素として配置 | DSC-05: 再表示アイコン存在確認   |

### チェックリスト

- [ ] Session open 時の banner 表示が state 遷移に連動して確実に発火する
- [ ] Approval Sheet 内の disclosure が dismiss 不可能である
- [ ] disclosure の内容（AI モデル名、送信先種別）が改竄されない
- [ ] banner dismiss 後も再表示導線が残存する
- [ ] guidance-only state で専用の開示テキストが表示される

---

## 3. Auto-Send Injection（自動送信注入）

| ID    | 脅威                                | 攻撃シナリオ                                         | 防御                                        | 検証方法                       |
| ----- | ----------------------------------- | ---------------------------------------------------- | ------------------------------------------- | ------------------------------ |
| TB-11 | transcript 自動送信 IPC の後追加    | 開発者が transcript:auto-send 等の IPC を追加する    | 消極的防御: 該当 IPC endpoint を作成しない  | NAS-01: チャネル非存在確認     |
| TB-12 | 既存 IPC の流用による自動送信       | 既存の LLM API 呼び出し IPC を approval なしで流用   | Approval gate が全 LLM API 呼び出しをガード | NAS-04: approval なし LLM 拒否 |
| TB-13 | hidden parsing エンドポイントの密入 | ユーザーに非開示のデータ解析 IPC を追加する          | 消極的防御 + コードレビュー                 | NAS-06: hidden parsing 非存在  |
| TB-14 | session 結果の自動外部報告          | session complete 時に自動で外部 API にレポートを送信 | IPC endpoint 非提供 + Approval gate         | NAS-02: 自動報告チャネル非存在 |
| TB-15 | エラーログの自動外部送信            | catch ブロック内で自動でエラーを外部サービスに送信   | IPC endpoint 非提供                         | NAS-03: エラーログ送信非存在   |
| TB-16 | Manual Share Rail のステップ省略    | 3操作のうち「確認」をスキップして直接送信            | 各ステップの完了フラグを順次検証            | NAS-05: 3操作順次完了の検証    |

### チェックリスト

- [ ] transcript, session 結果, エラーログの自動送信 IPC が存在しない
- [ ] 全ての LLM API 呼び出しが Approval gate を通過する
- [ ] hidden parsing / hidden prompt injection の IPC が存在しない
- [ ] Manual Share Rail の3操作がスキップ不可能である
- [ ] 新規 IPC 追加時に ALLOWED_INVOKE_CHANNELS のホワイトリスト管理が機能する

---

## 4. Front Surface Leakage（front 面への漏出）

| ID    | 脅威                                                     | 攻撃シナリオ                                                | 防御                                               | 検証方法                          |
| ----- | -------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------- | --------------------------------- |
| TB-17 | Advanced Console が default 表示になる                   | isOpen のデフォルト値を true に変更する                     | コンポーネント props のデフォルト値を false に固定 | ADV-02: 初期 isOpen=false 確認    |
| TB-18 | toggle CTA が Primary に昇格する                         | 「高度な表示」を Session Dock ヘッダーの primary 位置に配置 | CTA 階層規則（CTA-R2）のコードレビュー             | CTA-04: secondary 以下配置確認    |
| TB-19 | Primary CTA に terminal ラベルが混入する                 | non-handoff state で primary CTA を「端末で続ける」にする   | CTA-R3/CTA-R4 規則のテスト                         | CTA-02: terminal ラベル非含有確認 |
| TB-20 | Advanced Console 内操作が front surface に波及する       | パネル内のボタンが Panel 外の state を変更する              | パネル内 CTA を Panel DOM 内に閉じる設計           | CTA-05: パネル内 CTA 閉じ込め確認 |
| TB-21 | collapsed / unavailable state で advanced console が表示 | state チェックの条件分岐ミスでパネルが表示される            | GATE-1〜3 の AND 条件でガード                      | ADV-06〜ADV-08: 状態別非表示確認  |

### チェックリスト

- [ ] Advanced Console Panel の初期 isOpen が false である
- [ ] 「高度な表示」CTA が primary CTA と同レベルに配置されていない
- [ ] non-handoff state の primary CTA ラベルに "terminal" / "端末" が含まれない
- [ ] Advanced Console Panel 内の操作が Panel 外の DOM / state に波及しない
- [ ] collapsed / unavailable / guidance-only state で Advanced Console が非表示である
- [ ] Layer 構造（Primary → Safety → Detail）が崩れない

---

## 5. Secret Exposure（秘密情報の露出）

| ID    | 脅威                                          | 攻撃シナリオ                                          | 防御                                                                | 検証方法                           |
| ----- | --------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------- |
| TB-22 | copy command に API key が含まれる            | handoff コマンド生成時に API key を引数に含めてしまう | Main Process で API key を copy command から除外                    | ADV-13: copy command secret 非含有 |
| TB-23 | raw terminal output に API key が表示される   | terminal output に API key がログ出力される           | terminal output を sanitize してから Renderer に送信                | DSC-07: secret 非渡し確認          |
| TB-24 | エラーメッセージに内部パスが含まれる          | sanitize 漏れで OS パスがエラーメッセージに残る       | sanitizeErrorMessage() の適用                                       | NFR-01: 内部パス非含有確認         |
| TB-25 | エラーメッセージにトークンが含まれる          | sanitize 漏れで API key / token がエラーに残る        | sanitizeErrorMessage() の適用                                       | NFR-02: トークン非含有確認         |
| TB-26 | Disclosure banner 経由で API key が表示される | Main → Renderer の IPC で API key を誤って送信        | Disclosure Data Flow で送信情報を限定（provider 名 + model 名のみ） | DSC-07: Data Flow secret 非含有    |

### チェックリスト

- [ ] copy command に API key / token が含まれない
- [ ] raw terminal output が sanitize されてから Renderer に送信される
- [ ] エラーメッセージが sanitizeErrorMessage() で処理されている
- [ ] Disclosure Data Flow で API key / token が Renderer に渡されない
- [ ] 全ての新規 IPC レスポンスに secret が含まれないことが検証されている

---

## 6. Consumer Auth Embedding（consumer 認証流用）

| ID    | 脅威                                   | 攻撃シナリオ                                                     | 防御                                                | 検証方法                         |
| ----- | -------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------- | -------------------------------- |
| TB-27 | claude.ai session token のアプリ内使用 | claude.ai でログインした session token をアプリの LLM 認証に使う | Main Process で claude.ai 形式の token を検出・拒否 | CAG-01: token 拒否確認           |
| TB-28 | claude.ai cookie の参照                | Preload で document.cookie API を公開して cookie を読み取る      | contextBridge で cookie API を公開しない            | CAG-02: cookie API 非公開確認    |
| TB-29 | consumer OAuth フロー実装の密入        | claude.ai の OAuth フローを実装して consumer 認証を統合          | 設計レビュー + IPC handler 非登録                   | CAG-03: consumer 認証 IPC 非存在 |

### チェックリスト

- [ ] claude.ai 形式の session token が Main Process で拒否される
- [ ] contextBridge に cookie 取得 API が存在しない
- [ ] claude.ai OAuth / session 認証関連の IPC handler が存在しない
- [ ] RuntimePolicyResolver の認証方式が API Key / Subscription Token / no-auth のみ

---

## 脅威サマリー

| カテゴリ                | 脅威数 | P0 テストカバー | P1 テストカバー |
| ----------------------- | ------ | --------------- | --------------- |
| Approval Bypass         | 6      | 4               | 1               |
| Disclosure Suppression  | 4      | 3               | 1               |
| Auto-Send Injection     | 6      | 5               | 1               |
| Front Surface Leakage   | 5      | 4               | 1               |
| Secret Exposure         | 5      | 4               | 1               |
| Consumer Auth Embedding | 3      | 2               | 1               |
| **合計**                | **29** | **22**          | **6**           |

## Compliance / 規約準拠マッピング

| 規約                   | 関連脅威 ID                | 防御観点                               |
| ---------------------- | -------------------------- | -------------------------------------- |
| Anthropic Usage Policy | TB-11〜TB-16               | auto-send / hidden parsing の禁止      |
| Commercial Terms       | TB-27〜TB-29               | consumer auth の非流用                 |
| Agent SDK Permissions  | TB-01〜TB-06               | approval enforcement の完全性          |
| Security Principles    | TB-22〜TB-26               | secret 非露出の保証                    |
| UI/UX Realization      | TB-07〜TB-10, TB-17〜TB-21 | disclosure 完全性 + front surface 保護 |
