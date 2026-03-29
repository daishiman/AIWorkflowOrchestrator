# Phase 3: 設計レビュー — TASK-RT-04 API Key Management UI

## AC 整合性チェック

| AC   | 設計カバー                                                | 判定 |
| ---- | --------------------------------------------------------- | ---- |
| AC-1 | ApiKeySettingsPanel コンポーネント新規作成                | ✅   |
| AC-2 | validateApiKey() + IPC validate                           | ✅   |
| AC-3 | ApiKeyStatus 4状態（not_set/validating/configured/error） | ✅   |
| AC-4 | electronAPI.authKey.delete() + UI連動                     | ✅   |
| AC-5 | SkillLifecyclePanel のリクエスト入力セクション上部に配置  | ✅   |

## 既存パターン整合性チェック

| 観点         | 既存パターン             | 設計                           | 判定          |
| ------------ | ------------------------ | ------------------------------ | ------------- |
| IPC 呼び出し | `window.electronAPI.*`   | `window.electronAPI.authKey.*` | ✅ 一貫性あり |
| エラー表示   | ApiKeyErrorCard パターン | 同じ CSS 変数使用              | ✅            |
| 状態管理     | useState + useEffect     | 同パターン採用                 | ✅            |
| 型定義場所   | skillCreator.ts          | 同ファイルに追加               | ✅            |

## セキュリティレビュー

| 観点             | チェック                              | 判定 |
| ---------------- | ------------------------------------- | ---- |
| キーのマスク表示 | `type="password"` + マスク文字列      | ✅   |
| キーの取得API    | auth-key:get は非公開、設計に取得なし | ✅   |
| XSS 防止         | React の自動エスケープ + IPC 経由     | ✅   |
| 入力値クリア     | 保存成功後に inputValue をクリア      | ✅   |
| ログ漏洩         | コンソール出力にキーを含めない設計    | ✅   |

## 統合方式レビュー

- **配置位置**: リクエスト入力セクション上部 — APIキーはスキル操作の前提条件であり、ユーザー導線として適切
- **条件付き表示**: configured 時はコンパクト、not_set/error 時は展開 — 設定済みユーザーの作業を妨げない
- **Props 設計**: `onStatusChange` コールバックのみ — 疎結合で統合先への影響最小

## 結論

設計は全 AC をカバーし、既存パターンとの整合性あり、セキュリティ観点も問題なし。
**Phase 4（テスト作成）に進行可能。**
