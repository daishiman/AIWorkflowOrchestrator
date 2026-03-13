# 認証・セキュリティ アーキテクチャ設計 / history bundle

> 親仕様書: [architecture-auth-security.md](architecture-auth-security.md)
> 役割: history bundle

## 変更履歴

| バージョン | 日付       | 変更内容                                                                                                                       |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| v1.5.0     | 2026-03-08 | TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001完了: Supabase未設定時のProfile/Avatar fallbackルーティング詳細テーブル追加。registerProfileFallbackHandlers/registerAvatarFallbackHandlers の設計原則を明文化 |
| v1.4.1     | 2026-02-06 | DEBT-SEC-001完了: State parameter検証実装、StateManager追加、認証フローにCSRF対策ステップ追加                                  |
| v1.4.0     | 2026-02-06 | TASK-AUTH-SESSION-REFRESH-001完了: TokenRefreshSchedulerアーキテクチャ、リフレッシュフロー、リトライ戦略、セキュリティ設計追加 |
| v1.3.0     | 2026-02-05 | TASK-FIX-GOOGLE-LOGIN-001完了: OAuthエラーハンドリング、リスナー管理追加                                                       |
| v1.2.0     | 2026-02-04 | AUTH-UI-001完了: フォールバック処理・状態更新フロー実装完了を記録                                                              |
| v1.1.0     | 2026-01-26 | spec-guidelines.md準拠: コードブロックを表形式・文章に変換（3箇所）                                                            |
| v1.0.0     | -          | 初版作成                                                                                                                       |

---

## 完了タスク

### タスク: DEBT-SEC-001 State Parameter CSRF対策（2026-02-06完了）

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| タスクID   | DEBT-SEC-001                          |
| 完了日     | 2026-02-06                            |
| ステータス | **完了**                              |
| Phase      | Phase 1-12完了                        |
| テスト数   | 21件（全PASS）                        |
| カバレッジ | Line 100%, Branch 100%, Function 100% |

#### 実装内容

| 実装                 | 実装箇所                       | 内容                                                       |
| -------------------- | ------------------------------ | ---------------------------------------------------------- |
| StateManager新規作成 | infrastructure/stateManager.ts | crypto.randomBytes(32)によるstate生成、有効期限管理        |
| state生成統合        | ipc/authHandlers.ts            | signInWithOAuthのqueryParamsにstate付与                    |
| state検証統合        | main/index.ts                  | コールバック受信時にconsumeState()で検証                   |
| CSRF検証失敗通知     | main/index.ts                  | CSRF_VALIDATION_FAILEDエラーコードでAUTH_STATE_CHANGED送出 |

#### セキュリティ設計

| 項目                   | 実装                                      |
| ---------------------- | ----------------------------------------- |
| state生成              | crypto.randomBytes(32) → 64文字hex        |
| state形式検証          | `/^[a-f0-9]{64}$/` 正規表現               |
| 有効期限               | 10分（STATE_EXPIRY_MS = 600,000ms）       |
| ワンタイムユース       | consumeState()で即座に削除                |
| 期限切れクリーンアップ | cleanup()メソッドで期限切れエントリを削除 |

#### 苦戦箇所と教訓

| #   | 苦戦箇所                                                                                                                                     | 根本原因                                                                                                                                          | 解決策                                                                                                                                                 | 教訓                                                                                              |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| 1   | consumeState設計乖離: 設計書のvalidate(state, provider)が使えず、設計にないconsumeState(state)を追加                                         | Implicit FlowのコールバックURLにはプロバイダー情報が含まれず、detectProvider関数も未実装だった。設計時に既存コードのAPI境界を十分に調査しなかった | プロバイダー照合なしのconsumeState()を新設し、最低要件（存在確認・期限・ワンタイム）を満たす実装に割り切り。プロバイダー照合はUT-SEC-001として将来対応 | 設計時に「呼び出し元が必要なパラメータを実際に持っているか」を必ず検証する                        |
| 2   | Phase 12ドキュメント更新漏れ9件: SKILL.md x2、topic-map.md、completed-tasks、task-workflow.md、17-security-guidelines.md等が初回パスで漏れた | 更新対象が14ファイル以上に散在。05-task-execution.mdのチェックリストを逐次確認せず、06-known-pitfallsのP1/P2/P4パターンが再現した                 | 再検証・品質レビューの追加実施で全件検出・修正                                                                                                         | Phase 12開始前に06-known-pitfalls.mdを必ず読み直し、チェックリストを機械的に1ステップずつ消化する |
| 3   | Implicit Flow制約: ハッシュフラグメント(#)でパラメータが返るため、プロバイダー検出やサーバーサイド処理に制約あり                             | OAuth Implicit Flowの仕様上の制限。PKCE(Authorization Code Flow)に移行すれば解消されるが、現時点では未対応                                        | 現在の脅威モデルで最低限のCSRF防御を実現し、PKCE移行(DEBT-SEC-002)で根本解消する方針                                                                   | OAuthフローの種類による制約を設計フェーズで明示的に列挙すべき                                     |

#### 残課題

| 課題ID     | 内容                                                                                        | 対応方針                                                                                |
| ---------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| UT-SEC-001 | consumeState()がプロバイダー未検証。detectProvider実装でvalidate(state, provider)に置換可能 | DEBT-SEC-002（PKCE実装）のスコープに統合。Authorization Code Flowへの移行時に自然に解消 |

---

### タスク: TASK-FIX-GOOGLE-LOGIN-001 Googleログイン修正（2026-02-05完了）

| 項目       | 内容                      |
| ---------- | ------------------------- |
| タスクID   | TASK-FIX-GOOGLE-LOGIN-001 |
| 完了日     | 2026-02-05                |
| ステータス | **完了**                  |
| Phase      | Phase 1-12完了            |
| テスト数   | 約50件                    |

#### 修正内容

| 修正                 | 実装箇所                        | 内容                                   |
| -------------------- | ------------------------------- | -------------------------------------- |
| OAuthエラー検出      | oauth-error-handler.ts          | parseOAuthError()でerrorパラメータ検出 |
| エラーメッセージ変換 | oauth-error-handler.ts          | mapOAuthErrorToMessage()で日本語化     |
| セッション管理       | auth.ts, oauth-error-handler.ts | refreshTokenExpiresAt計算・送信        |
| リスナー二重登録防止 | authSlice.ts                    | authListenerRegisteredフラグ追加       |

#### OAuthエラーハンドリングフロー

| ステップ | 処理                                                       |
| -------- | ---------------------------------------------------------- |
| 1        | コールバックURL受信                                        |
| 2        | parseOAuthError()でURLからerrorパラメータを抽出            |
| 3        | エラーがある場合、mapOAuthErrorToMessage()で日本語に変換   |
| 4        | AUTH_STATE_CHANGEDイベントにerror/errorCodeを含めて送信    |
| 5        | Renderer側でエラー状態を更新し、UIにエラーメッセージを表示 |

---

### タスク: AUTH-UI-001 認証UI改善（2026-02-04完了）

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | AUTH-UI-001                                 |
| 完了日     | 2026-02-04                                  |
| ステータス | **完了**                                    |
| Phase      | Phase 1-12完了                              |
| テスト数   | 132（AccountSection: 27, authSlice: 105）   |
| カバレッジ | Line 83.87%, Branch 86.07%, Function 89.47% |

#### 修正内容

| 修正               | 実装箇所                     | 内容                                               |
| ------------------ | ---------------------------- | -------------------------------------------------- |
| z-index修正        | AccountSection/index.tsx:501 | z-[9999]クラス適用（Portal経由でbody直下描画）     |
| フォールバック処理 | profileHandlers.ts:66-85     | isUserProfilesTableError()でuser_metadata参照      |
| 状態更新フロー     | authSlice.ts:342-345         | AUTH_STATE_CHANGED後のfetchLinkedProviders呼び出し |

#### テスト結果サマリー

| テストファイル                 | テスト数 | 結果        |
| ------------------------------ | -------- | ----------- |
| AccountSection.portal.test.tsx | 27       | ✅ ALL PASS |
| authSlice.test.ts              | 105      | ✅ ALL PASS |
| profileHandlers.test.ts        | 33       | ⚠️ 環境問題 |

#### 成果物

| 成果物     | パス                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| 要件定義書 | docs/30-workflows/completed-tasks/auth-ui-improvements-282/outputs/phase-1/  |
| 設計書     | docs/30-workflows/completed-tasks/auth-ui-improvements-282/outputs/phase-2/  |
| テスト仕様 | docs/30-workflows/completed-tasks/auth-ui-improvements-282/outputs/phase-4/  |
| 実装ガイド | docs/30-workflows/completed-tasks/auth-ui-improvements-282/outputs/phase-12/ |

#### 関連ドキュメント

- 実装ガイド: `docs/30-workflows/completed-tasks/auth-ui-improvements-282/outputs/phase-12/implementation-guide.md`
- Portal実装パターン: `ui-ux-portal-patterns.md`

---

## 関連ドキュメント

- [プロジェクト概要](./01-overview.md)
- [ディレクトリ構造](./04-directory-structure.md)
- [コアインターフェース仕様](./06-core-interfaces.md)
- [エラーハンドリング仕様](./07-error-handling.md)
- [データベース設計](./15-database-design.md)
- [セキュリティガイドライン](./17-security-guidelines.md)
- [State Parameter CSRF防御 実装仕様](./csrf-state-parameter.md) - StateManager API・型定義・セキュリティ設計根拠
- [DEBT-SEC-001 実装ガイド](../../docs/30-workflows/DEBT-SEC-001-auth-state-parameter/outputs/phase-12/implementation-guide.md)

