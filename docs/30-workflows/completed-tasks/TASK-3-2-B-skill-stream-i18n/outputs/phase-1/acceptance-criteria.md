# Phase 1: 受け入れ基準

## メタ情報

| 項目     | 値         |
| -------- | ---------- |
| Phase    | 1          |
| 作成日   | 2026-01-28 |
| タスクID | TASK-3-2-B |

---

## 受け入れ基準（AC）一覧

| AC-ID | 受け入れ基準                                          | 検証方法               | 優先度 |
| ----- | ----------------------------------------------------- | ---------------------- | ------ |
| AC-01 | 日本語ロケールで全UIテキストが日本語表示される        | 手動テスト             | 必須   |
| AC-02 | 英語ロケールで全UIテキストが英語表示される            | 手動テスト             | 必須   |
| AC-03 | formatRelativeTime("ja")が「X秒前」形式を返す         | ユニットテスト         | 必須   |
| AC-04 | formatRelativeTime("en")が「X seconds ago」形式を返す | ユニットテスト         | 必須   |
| AC-05 | aria-labelが各言語で正しく設定される                  | アクセシビリティテスト | 必須   |
| AC-06 | 既存テストが100% PASSする                             | CI                     | 必須   |
| AC-07 | TypeScript型チェックがエラーなくPASSする              | tsc --noEmit           | 必須   |
| AC-08 | 翻訳キーの型補完がIDEで機能する                       | 開発者テスト           | 任意   |
| AC-09 | 翻訳ファイルのサイズが10KB以下/言語                   | ビルド後サイズ確認     | 必須   |

---

## 詳細検証項目

### AC-01: 日本語ロケール表示

**検証手順**:

1. ブラウザ言語設定を日本語（ja）に設定
2. SkillStreamDisplayコンポーネントを表示
3. 以下のテキストが日本語で表示されることを確認

**期待値**:
| 項目 | 期待表示 |
| ------------------ | -------------------- |
| アイドル状態 | 待機中 |
| 実行中状態 | 実行中 |
| 完了状態 | 完了 |
| エラー状態 | エラー |
| 中断状態 | 中断 |
| 中断ボタン | 中断 |
| リセットボタン | リセット |
| アイドルメッセージ | スキル実行を開始してください |
| 実行中メッセージ | 実行中... |
| コピーフィードバック | コピーしました |

---

### AC-02: 英語ロケール表示

**検証手順**:

1. ブラウザ言語設定を英語（en）に設定
2. SkillStreamDisplayコンポーネントを表示
3. 以下のテキストが英語で表示されることを確認

**期待値**:
| 項目 | 期待表示 |
| ------------------ | --------------------------- |
| アイドル状態 | Idle |
| 実行中状態 | Running |
| 完了状態 | Completed |
| エラー状態 | Error |
| 中断状態 | Aborted |
| 中断ボタン | Abort |
| リセットボタン | Reset |
| アイドルメッセージ | Start skill execution |
| 実行中メッセージ | Executing... |
| コピーフィードバック | Copied |

---

### AC-03: formatRelativeTime 日本語出力

**テストケース**:

```typescript
// 30秒前
expect(formatRelativeTime(Date.now() - 30000, Date.now(), "ja")).toBe("30秒前");

// 5分前
expect(formatRelativeTime(Date.now() - 300000, Date.now(), "ja")).toBe("5分前");

// 2時間前
expect(formatRelativeTime(Date.now() - 7200000, Date.now(), "ja")).toBe(
  "2時間前",
);

// 3日前
expect(formatRelativeTime(Date.now() - 259200000, Date.now(), "ja")).toBe(
  "3日前",
);

// たった今
expect(formatRelativeTime(Date.now() + 1000, Date.now(), "ja")).toBe(
  "たった今",
);
```

---

### AC-04: formatRelativeTime 英語出力

**テストケース**:

```typescript
// 30 seconds ago
expect(formatRelativeTime(Date.now() - 30000, Date.now(), "en")).toBe(
  "30 seconds ago",
);

// 5 minutes ago
expect(formatRelativeTime(Date.now() - 300000, Date.now(), "en")).toBe(
  "5 minutes ago",
);

// 2 hours ago
expect(formatRelativeTime(Date.now() - 7200000, Date.now(), "en")).toBe(
  "2 hours ago",
);

// 3 days ago
expect(formatRelativeTime(Date.now() - 259200000, Date.now(), "en")).toBe(
  "3 days ago",
);

// Just now
expect(formatRelativeTime(Date.now() + 1000, Date.now(), "en")).toBe(
  "Just now",
);
```

---

### AC-05: aria-label多言語対応

**日本語ロケール期待値**:
| 要素 | aria-label |
| ------------------ | ------------------ |
| ローディングスピナー | 実行中 |
| コピーボタン | メッセージをコピー |
| 中断ボタン | スキル実行を中断 |
| リセットボタン | 状態をリセット |

**英語ロケール期待値**:
| 要素 | aria-label |
| ------------------ | -------------------- |
| ローディングスピナー | Loading |
| コピーボタン | Copy message |
| 中断ボタン | Abort skill execution|
| リセットボタン | Reset state |

---

### AC-06: 既存テスト互換性

**検証手順**:

1. `pnpm --filter @repo/desktop test` を実行
2. 全テストがPASSすることを確認

**注意事項**:

- テスト環境ではモックi18nプロバイダーを提供
- 翻訳キーがそのまま表示される場合はキー名でマッチング

---

### AC-07: TypeScript型チェック

**検証手順**:

1. `pnpm --filter @repo/desktop typecheck` を実行
2. エラーが0件であることを確認

**対象**:

- 翻訳キーの型定義
- useTranslation hookの戻り値型
- formatRelativeTimeの引数型

---

### AC-08: 翻訳キー型補完

**検証手順**:

1. VSCodeでSkillStreamDisplay.tsxを開く
2. `t('skill-stream.`まで入力
3. 翻訳キーの補完候補が表示されることを確認

---

### AC-09: 翻訳ファイルサイズ

**検証手順**:

1. ビルドを実行
2. 翻訳ファイルのサイズを確認
3. 各言語ファイルが10KB以下であることを確認

**対象ファイル**:

- `i18n/locales/ja/skill-stream.json`
- `i18n/locales/en/skill-stream.json`

---

## 完了チェックリスト

- [ ] AC-01: 日本語ロケール表示確認
- [ ] AC-02: 英語ロケール表示確認
- [ ] AC-03: formatRelativeTime日本語テストPASS
- [ ] AC-04: formatRelativeTime英語テストPASS
- [ ] AC-05: aria-label多言語テストPASS
- [ ] AC-06: 既存テスト100% PASS
- [ ] AC-07: TypeScript型チェックエラー0件
- [ ] AC-08: 翻訳キー型補完動作確認（任意）
- [ ] AC-09: 翻訳ファイルサイズ10KB以下確認
