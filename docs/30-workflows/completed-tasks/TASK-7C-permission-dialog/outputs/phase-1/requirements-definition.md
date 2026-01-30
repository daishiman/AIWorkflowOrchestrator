# Phase 1: 要件定義書 - PermissionDialog コンポーネント

## 基本情報

| 項目       | 値                              |
| ---------- | ------------------------------- |
| タスクID   | TASK-7C                         |
| タスク名   | PermissionDialog コンポーネント |
| Feature    | skill-import-agent-system       |
| 層         | Renderer Process                |
| 依存タスク | TASK-6-1（SkillSlice）          |
| 作成日     | 2026-01-30                      |

## 1. 機能要件

| FR-ID  | 要件                                                                     | 優先度 | 参照元                   |
| ------ | ------------------------------------------------------------------------ | ------ | ------------------------ |
| FR-001 | `pendingPermission` が null の場合はコンポーネントを表示しない           | 必須   | specification.md §4.4.2  |
| FR-002 | `pendingPermission` が存在する場合にモーダルダイアログを表示する         | 必須   | specification.md §4.4.2  |
| FR-003 | ツール名（`toolName`）を表示する                                         | 必須   | SkillPermissionRequest型 |
| FR-004 | ツール引数（`args`）を適切にフォーマットして表示する                     | 必須   | タスク定義               |
| FR-005 | Bashコマンドの場合は `args.command` を直接表示する                       | 必須   | タスク定義               |
| FR-006 | ファイルパスの場合は `args.path` を直接表示する                          | 必須   | タスク定義               |
| FR-007 | その他のツールの場合は JSON形式で引数を表示する                          | 必須   | タスク定義               |
| FR-008 | 理由（`reason`）が存在する場合に表示する                                 | 必須   | SkillPermissionRequest型 |
| FR-009 | 「拒否」ボタンで `respondToSkillPermission(false, false)` を呼び出す     | 必須   | skillSlice.ts            |
| FR-010 | 「1回許可」ボタンで `respondToSkillPermission(true, false)` を呼び出す   | 必須   | skillSlice.ts            |
| FR-011 | 「許可」ボタンで `respondToSkillPermission(true, rememberChoice)` を呼出 | 必須   | skillSlice.ts            |
| FR-012 | 「このセッション中は同様の操作を自動許可する」チェックボックスを表示する | 必須   | タスク定義               |
| FR-013 | レスポンス後にチェックボックス状態をリセットする                         | 必須   | タスク定義               |
| FR-014 | ヘッダーの閉じるボタン（✕）が拒否と同じ動作をする                        | 必須   | タスク定義               |

## 2. 非機能要件

| NFR-ID  | カテゴリ         | 要件                                                            | 参照元                  |
| ------- | ---------------- | --------------------------------------------------------------- | ----------------------- |
| NFR-001 | アクセシビリティ | `role="dialog"`, `aria-modal="true"` を設定する                 | WCAG 2.1 AA / 既存実装  |
| NFR-002 | アクセシビリティ | `aria-labelledby` でダイアログタイトルを参照する                | WCAG 2.1 AA / 既存実装  |
| NFR-003 | アクセシビリティ | `aria-describedby` で説明テキストを参照する                     | WCAG 2.1 AA / 既存実装  |
| NFR-004 | アクセシビリティ | フォーカストラップを実装する（Tab/Shift+Tabでダイアログ内循環） | WCAG 2.1 AA / 既存実装  |
| NFR-005 | アクセシビリティ | Escapeキーで拒否操作を実行する                                  | 既存実装パターン        |
| NFR-006 | アクセシビリティ | WCAG 2.1 AA準拠のコントラスト比（4.5:1以上）を確保する          | WCAG 2.1 AA             |
| NFR-007 | パフォーマンス   | ダイアログ表示のレンダリングが16ms以内に完了する                | React標準パフォーマンス |
| NFR-008 | UI/UX            | Tailwind CSSを使用してスタイリングする                          | プロジェクト規約        |
| NFR-009 | UI/UX            | モーダルオーバーレイ（`bg-black/50`）を表示する                 | デザインシステム        |
| NFR-010 | UI/UX            | 最大幅 `max-w-lg` でコンテンツを制限する                        | デザインシステム        |
| NFR-011 | セキュリティ     | ツール引数にXSS攻撃ベクターが含まれていても安全に表示する       | セキュリティ仕様        |
| NFR-012 | i18n             | 日本語UIテキストをハードコードする（現フェーズではi18n対象外）  | プロジェクト方針        |

## 3. Electron層別要件

| 層               | 責務                                                | 本タスクの関与    |
| ---------------- | --------------------------------------------------- | ----------------- |
| Renderer Process | UI表示、ユーザーインタラクション、状態表示          | 主担当            |
| Store (Zustand)  | pendingPermission状態管理、respondToSkillPermission | 参照（既存利用）  |
| IPC通信          | Main Process への権限応答送信                       | 間接（Store経由） |
| Main Process     | 権限の最終判断・記録                                | 対象外            |

### Store接続インターフェース

```typescript
// skillSlice.ts から取得
interface SkillSlice {
  pendingPermission: SkillPermissionRequest | null;
  respondToSkillPermission: (approved: boolean, remember?: boolean) => void;
}

// SkillPermissionRequest 型（packages/shared/src/types/skill.ts）
interface SkillPermissionRequest {
  executionId: string;
  requestId: string;
  toolName: string;
  args: Record<string, unknown>;
  reason?: string;
}
```

## 4. 統合テスト連携

| カテゴリ     | 確認内容                                                            |
| ------------ | ------------------------------------------------------------------- |
| 状態同期     | Storeの `pendingPermission` 変更がダイアログ表示/非表示に反映される |
| データフロー | `respondToSkillPermission` 呼び出しがStoreを通じてIPC送信に繋がる   |
| エラー処理   | Store側でエラーが発生した場合にダイアログが適切に処理する           |

## 5. 既存実装との差異

| 観点             | 既存実装（Permission/PermissionDialog）       | 新コンポーネント（skill/PermissionDialog） |
| ---------------- | --------------------------------------------- | ------------------------------------------ |
| 配置場所         | `components/Permission/`                      | `components/skill/`                        |
| 状態接続         | Props経由（request, isOpen, onAllow, onDeny） | Store直結（useAppStore）                   |
| ボタン数         | 2（拒否/許可）                                | 3（拒否/1回許可/許可）                     |
| チェックボックス | なし                                          | rememberChoice あり                        |
| 引数フォーマット | JSON.stringify のみ                           | formatArgs（command/path/JSON分岐）        |
| アクセシビリティ | ARIA属性 + フォーカストラップ                 | ARIA属性 + フォーカストラップ（拡張）      |

## 6. 多角的観点チェック

| 観点               | 該当 | 確認内容                             |
| ------------------ | ---- | ------------------------------------ |
| セキュリティ       | ○    | XSS防止（引数表示の安全性）          |
| UI/UX（Apple HIG） | ○    | モーダルダイアログの標準パターン準拠 |
| アクセシビリティ   | ○    | WCAG 2.1 AA準拠、フォーカストラップ  |
| アーキテクチャ     | ○    | Renderer層の責務範囲遵守             |
