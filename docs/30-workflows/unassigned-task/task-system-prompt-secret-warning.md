# システムプロンプト機密情報警告機能 - タスク実行仕様書

## ユーザーからの元の指示

```
システムプロンプトにAPIキーなどの機密情報が含まれている場合、
ユーザーに警告を表示し、セキュリティリスクを防止する。
```

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| タスクID     | TASK-CHAT-SYSPROMPT-SECRET-001     |
| Worktreeパス | `.worktrees/task-{{timestamp}}`    |
| ブランチ名   | `task-{{timestamp}}`               |
| タスク名     | システムプロンプト機密情報警告機能 |
| 分類         | セキュリティ強化                   |
| 対象機能     | チャット - システムプロンプト設定  |
| 優先度       | 中                                 |
| 見積もり規模 | 小規模                             |
| ステータス   | 未実施                             |
| 作成日       | 2025-12-26                         |

---

## タスク概要

### 目的

システムプロンプト入力時にAPIキーや認証情報などの機密情報パターンを検出し、ユーザーに警告を表示してセキュリティリスクを防止する。

### 背景

**現在の実装**: 機密情報検出機能なし

**問題点**:

- ユーザーが誤ってAPIキーをシステムプロンプトに貼り付ける可能性
- LLMに送信され、ログに記録されるリスク
- 外部に漏洩する可能性

**参照 (NFR-011, M-002)**:

> NFR-011: システムプロンプトに機密情報（APIキー等）を含めないよう警告を表示する
> M-002: セキュリティ機能として将来実装を推奨

### 最終ゴール

- 機密情報パターンを検出する
- 警告ダイアログを表示する
- 保存前にユーザーに確認を求める
- 検出パターンをカスタマイズ可能

### 検出対象パターン

| パターン種別   | 正規表現例                            | 例                          |
| -------------- | ------------------------------------- | --------------------------- |
| OpenAI APIキー | `sk-[a-zA-Z0-9]{48}`                  | sk-proj-abc123...           |
| AWS Access Key | `AKIA[0-9A-Z]{16}`                    | AKIAIOSFODNN7EXAMPLE        |
| GitHub Token   | `gh[ps]_[a-zA-Z0-9]{36,}`             | ghp_1234567890abcdef...     |
| Google API Key | `AIza[0-9A-Za-z_-]{35}`               | AIzaSyDaGmWKa4JsXZ-HjGw7... |
| JWT Token      | `ey[A-Za-z0-9-_]+\.ey[A-Za-z0-9-_]+\` | eyJhbGc...                  |
| Bearer Token   | `Bearer\s+[A-Za-z0-9\-._~+/]+=*`      | Bearer abc123...            |

---

## タスク分解サマリー

| ID     | フェーズ | サブタスク名                 | 責務                               |
| ------ | -------- | ---------------------------- | ---------------------------------- |
| T--1-1 | Phase -1 | Git Worktree環境作成・初期化 | Git Worktree環境の作成と初期化     |
| T-00-1 | Phase 0  | 機能要件定義                 | 機密情報警告機能の要件を明文化     |
| T-01-1 | Phase 1  | パターン検出器設計           | 正規表現パターン、検出ロジック設計 |
| T-01-2 | Phase 1  | 警告UIコンポーネント設計     | ダイアログデザイン、UX設計         |
| T-02-1 | Phase 2  | 設計レビュー                 | 要件・設計の妥当性検証             |
| T-03-1 | Phase 3  | パターン検出器テスト作成     | 検出ロジックのテスト作成           |
| T-03-2 | Phase 3  | 警告UIテスト作成             | コンポーネントテスト作成           |
| T-04-1 | Phase 4  | パターン検出器実装           | 検出関数実装                       |
| T-04-2 | Phase 4  | 警告ダイアログ実装           | UI実装                             |
| T-04-3 | Phase 4  | SystemPromptTextArea統合     | リアルタイム検出・警告表示         |
| T-05-1 | Phase 5  | リファクタリング             | コード品質改善                     |
| T-06-1 | Phase 6  | 品質保証                     | テスト・lint・ビルド               |
| T-07-1 | Phase 7  | 最終レビュー                 | 全体検証                           |
| T-08-1 | Phase 8  | 手動テスト                   | 各パターン検出確認                 |
| T-09-1 | Phase 9  | ドキュメント更新             | セキュリティガイドライン更新       |
| T-10-1 | Phase 10 | コミット・PR作成             | 差分確認・PR作成                   |

**総サブタスク数**: 16個

---

## 設計概要

### パターン検出関数

```typescript
// apps/desktop/src/renderer/utils/detectSecrets.ts
export interface SecretPattern {
  name: string;
  pattern: RegExp;
  severity: "high" | "medium" | "low";
}

const SECRET_PATTERNS: SecretPattern[] = [
  { name: "OpenAI API Key", pattern: /sk-[a-zA-Z0-9]{48}/, severity: "high" },
  { name: "AWS Access Key", pattern: /AKIA[0-9A-Z]{16}/, severity: "high" },
  // ... 他のパターン
];

export function detectSecrets(text: string): SecretPattern[] {
  return SECRET_PATTERNS.filter((p) => p.pattern.test(text));
}
```

### 警告ダイアログ

```tsx
// apps/desktop/src/renderer/components/molecules/SecretWarningDialog/
export function SecretWarningDialog({
  detectedSecrets,
  onProceed,
  onCancel,
}: Props) {
  return (
    <Dialog>
      <DialogTitle>⚠️ 機密情報の可能性があります</DialogTitle>
      <DialogContent>
        <p>以下のパターンが検出されました：</p>
        <ul>
          {detectedSecrets.map((s) => (
            <li key={s.name}>{s.name}</li>
          ))}
        </ul>
        <p>APIキーや認証情報をシステムプロンプトに含めないでください。</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>キャンセル</Button>
        <Button onClick={onProceed} variant="warning">
          理解して続行
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

---

## リスクと対策

| リスク                   | 影響度 | 対策                                   |
| ------------------------ | ------ | -------------------------------------- |
| 誤検出（False Positive） | 中     | パターン精度向上、ユーザーが続行可能に |
| 見逃し（False Negative） | 高     | パターン継続改善、ユーザー教育         |
| UX阻害                   | 低     | 警告頻度を適切に調整                   |

---

## 完了条件チェックリスト

- [ ] 6種類以上のパターンを検出できる
- [ ] 警告ダイアログが表示される
- [ ] ユーザーが続行・キャンセルを選択できる
- [ ] テストカバレッジ 80%以上
- [ ] すべてのテストが成功

---

## 更新履歴

| 日付       | 版  | 変更内容 | 作成者 |
| ---------- | --- | -------- | ------ |
| 2025-12-26 | 1.0 | 初版作成 | Claude |
