# タスク仕様書: Supabase認証とAnthropic API Key管理の統合

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| タスクID   | UT-AUTH-009                           |
| 作成日     | 2026-02-08                            |
| 優先度     | Medium                                |
| 見積もり   | 8-16時間                              |
| 関連タスク | TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE |
| 発見元     | Phase 5 残課題                        |
| ステータス | 未着手                                |

## 背景

現在、アプリケーションには2つの独立した認証システムが存在する：

1. **Supabase認証**: ユーザーアカウント管理（OAuth、メール/パスワード）
2. **Anthropic API Key管理**: Claude Agent SDK用のAPI認証

これらは独立して動作しているが、将来的に以下の統合が必要になる可能性がある：

- ログインユーザーごとにAPIキーを紐付け
- Supabaseセッション有効時のみAPIキー利用を許可
- 組織/チーム単位でのAPIキー共有

## 目的

Supabase認証とAnthropic API Key管理の統合アーキテクチャを設計し、
必要に応じて実装を行う。

## スコープ

### 含む

- 認証統合アーキテクチャの設計
- ユーザーIDとAPIキーの紐付け方式の検討
- セッション管理と APIキーアクセス制御の統合
- 設計ドキュメントの作成
- プロトタイプ実装（必要に応じて）

### 含まない

- Supabase認証システムの大幅な変更
- 組織/チーム機能の実装（別タスク）
- 課金システムとの統合

## 技術検討事項

### 統合パターン候補

#### パターン1: ローカル紐付け

```
User Session (Supabase) → Local Storage → API Key (Keychain)
```

- メリット: シンプル、オフライン対応
- デメリット: デバイス間で共有不可

#### パターン2: サーバーサイド管理

```
User Session → Supabase Edge Function → Encrypted API Key (Supabase Vault)
```

- メリット: デバイス間共有、監査ログ
- デメリット: 複雑、オンライン必須

#### パターン3: ハイブリッド

```
User Session → Server Validation → Local Keychain
```

- メリット: セキュリティとオフライン対応のバランス
- デメリット: 実装複雑度が高い

### セキュリティ考慮事項

- APIキーの暗号化方式（現在: OS Keychain）
- セッション無効化時のAPIキー無効化
- 複数デバイスでの同時利用制御

## 完了条件

- [ ] 統合アーキテクチャ設計書が作成されている
- [ ] 選択したパターンの根拠が文書化されている
- [ ] セキュリティリスク評価が完了している
- [ ] 必要に応じてプロトタイプが実装されている
- [ ] 既存の認証フローへの影響が評価されている
- [ ] 移行計画（既存ユーザーへの影響）が策定されている

## 実装課題と解決策（TASK-FIX-16-1からの学び）

### P21: 既存テストへの DI 追加時の大規模修正

**問題**: 認証システム統合時、複数のサービス間でDIを追加すると、既存テストの大規模修正が必要になる。

**教訓**: AuthKeyService追加時に5つのテストファイルへモック追加が必要だった。Supabase認証統合では、さらに広範囲のテストファイルに影響する可能性がある。

**解決策**:

1. 統合設計段階でテストへの影響を評価
2. モック共通化パターンの検討（テストユーティリティへの抽出）
3. 段階的統合による影響範囲の局所化

### P22: Vitest Worker の予期しない終了

**問題**: 認証統合により大規模なテストスイート追加が予想される。Vitest Worker終了問題を考慮した設計が必要。

**解決策**:

- テストを機能単位で分割
- `--no-file-parallelism` オプションの検討
- CI/CD パイプラインでのテスト分割実行

### AuthKeyServiceとの共存設計

**親タスクからの知見**: AuthKeyService は `safeStorage` API を使用した暗号化保存を実装済み。Supabase認証との統合時は、以下を考慮：

1. **暗号化方式の一貫性**: 既存の safeStorage ベースの暗号化を継続
2. **環境変数フォールバック**: `ANTHROPIC_API_KEY` 環境変数のフォールバックロジックを維持
3. **IPC チャンネル設計**: `AUTH_KEY_CHANNELS` との命名規則・構造の整合性

---

## 使用スキル

- task-specification-creator
- aiworkflow-requirements

## 参照資料

| ドキュメント                | パス                                                                              |
| --------------------------- | --------------------------------------------------------------------------------- |
| Supabase認証アーキテクチャ  | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` |
| 認証キー管理サービス        | `apps/desktop/src/main/services/auth/AuthKeyService.ts`                           |
| セキュリティ原則            | `.claude/skills/aiworkflow-requirements/references/security-principles.md`        |
| 既存認証ハンドラ            | `apps/desktop/src/main/ipc/authHandlers.ts`                                       |
| Electron セキュリティルール | `.claude/rules/04-electron-security.md`                                           |

## 関連タスク

| タスクID                              | 関係 | 説明                               |
| ------------------------------------- | ---- | ---------------------------------- |
| TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE | 前提 | 認証キー管理基盤（本タスクの前提） |
| UT-AUTH-008                           | 関連 | UI設定画面統合（先に実装推奨）     |

## 備考

### 実装優先度の考慮

本タスクはアーキテクチャレベルの検討が必要であり、以下の順序での実装を推奨：

1. UT-AUTH-008（UI設定画面統合）を先に完了
2. ユーザーフィードバックを収集
3. 統合の必要性を再評価
4. 本タスクの詳細設計を開始

### 将来の拡張性

- マルチテナント対応
- API使用量の追跡・制限
- APIキーのローテーション機能
