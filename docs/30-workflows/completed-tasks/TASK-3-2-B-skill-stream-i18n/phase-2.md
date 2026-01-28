# Phase 2: 設計

## メタ情報

| 項目   | 値                |
| ------ | ----------------- |
| Phase  | 2                 |
| 機能名 | skill-stream-i18n |
| 作成日 | 2026-01-28        |

---

## 目的

i18nライブラリの導入方法、翻訳ファイル構造、コンポーネント/ユーティリティへの適用設計を行う。

---

## 実行タスク

### Task 1: i18nライブラリ選定と設定設計

**選定ライブラリ**: react-i18next + i18next

**設定ファイル構造**:

```
apps/desktop/src/renderer/i18n/
├── config.ts              # i18n初期化設定
├── index.ts               # エクスポート
└── locales/
    ├── ja/
    │   └── skill-stream.json  # 日本語翻訳
    └── en/
        └── skill-stream.json  # 英語翻訳
```

**config.ts 設計**:
| 設定項目 | 値 | 説明 |
| -------- | --- | ---- |
| fallbackLng | "ja" | フォールバック言語 |
| defaultNS | "skill-stream" | デフォルト名前空間 |
| interpolation.escapeValue | false | React用エスケープ無効化 |
| detection.order | ["navigator"] | ブラウザ言語を自動検出 |

### Task 2: 翻訳キー命名規則の設計

**命名規則**: `component.element.state` 形式

**翻訳キー一覧**:
| キー | 日本語 | 英語 |
| ---- | ------ | ---- |
| status.idle | 待機中 | Idle |
| status.running | 実行中 | Running |
| status.completed | 完了 | Completed |
| status.error | エラー | Error |
| status.aborted | 中断 | Aborted |
| time.justNow | たった今 | Just now |
| time.secondsAgo | {{count}}秒前 | {{count}} second(s) ago |
| time.minutesAgo | {{count}}分前 | {{count}} minute(s) ago |
| time.hoursAgo | {{count}}時間前 | {{count}} hour(s) ago |
| time.daysAgo | {{count}}日前 | {{count}} day(s) ago |
| feedback.copied | コピーしました | Copied |
| aria.running | 実行中 | Running |
| aria.copyMessage | メッセージをコピー | Copy message |

### Task 3: formatRelativeTimeロケール対応設計

**現在のシグネチャ**:

```typescript
formatRelativeTime(timestamp: number, now?: number): string
```

**変更後のシグネチャ**:

```typescript
formatRelativeTime(timestamp: number, locale?: string, now?: number): string
```

**設計方針**:

- `Intl.RelativeTimeFormat` APIの活用を検討
- i18nextのt関数と組み合わせてテンプレート補間を使用
- locale引数のデフォルト値は現在のi18n言語設定から取得

### Task 4: コンポーネント適用設計

**SkillStreamDisplay変更箇所**:
| 変更箇所 | 変更内容 |
| -------- | -------- |
| インポート | `useTranslation` hookをインポート |
| ステータス表示 | `t('status.${status}')` で取得 |
| LoadingSpinner aria-label | `t('aria.running')` で取得 |
| CopyButton フィードバック | `t('feedback.copied')` で取得 |
| CopyButton aria-label | `t('aria.copyMessage')` で取得 |

**MessageTimestamp変更箇所**:
| 変更箇所 | 変更内容 |
| -------- | -------- |
| formatRelativeTime呼び出し | locale引数を追加 |

---

## 統合テスト連携【必須】

統合ポイント/契約を設計に反映する:

| 統合ポイント            | 契約定義                                                     |
| ----------------------- | ------------------------------------------------------------ |
| I18nextProvider配置     | App.tsx（ルートコンポーネント）でラップ                      |
| useTranslation hook連携 | 名前空間 "skill-stream" を指定                               |
| formatRelativeTime連携  | 第2引数でlocaleを受け取り、i18n.languageと連携               |
| 翻訳ファイル読み込み    | `i18n/locales/{locale}/skill-stream.json` からJSONインポート |

---

## 参照資料

| 資料名                        | パス                                         | 説明             |
| ----------------------------- | -------------------------------------------- | ---------------- |
| 要件定義書                    | `outputs/phase-1/requirements-definition.md` | Phase 1成果物    |
| react-i18next公式ドキュメント | https://react.i18next.com/                   | 設定リファレンス |

---

## アーキテクチャ層別設計

| 層                         | 設計観点                                   | 仕様参照先                            |
| -------------------------- | ------------------------------------------ | ------------------------------------- |
| フロントエンド（Renderer） | I18nextProviderの配置、useTranslation hook | `aiworkflow-requirements: ui-ux-*.md` |
| ユーティリティ             | formatRelativeTimeのロケール対応           | -                                     |
| 翻訳リソース               | JSON構造、名前空間分離                     | -                                     |

---

## 成果物

| 成果物       | パス                                  | 説明           |
| ------------ | ------------------------------------- | -------------- |
| 設計書       | `outputs/phase-2/i18n-design.md`      | i18n設計詳細   |
| 翻訳キー定義 | `outputs/phase-2/translation-keys.md` | 全翻訳キー定義 |

---

## 完了条件

- [ ] i18n設定構造が設計されている
- [ ] 翻訳キー命名規則が定義されている
- [ ] 全翻訳キーが一覧化されている
- [ ] formatRelativeTimeの変更設計が完了している
- [ ] コンポーネント適用箇所が特定されている
- [ ] 要件との整合性が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 3: 設計レビューゲート
