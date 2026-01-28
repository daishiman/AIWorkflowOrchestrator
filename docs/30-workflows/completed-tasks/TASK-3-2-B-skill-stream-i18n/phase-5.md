# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                |
| ------ | ----------------- |
| Phase  | 5                 |
| 機能名 | skill-stream-i18n |
| 作成日 | 2026-01-28        |

---

## 目的

Phase 4で作成したテストを通すための最小限のi18n実装を行う。

---

## 実行タスク

### Task 1: i18nライブラリインストール

```bash
pnpm --filter @repo/desktop add react-i18next i18next i18next-browser-languagedetector
```

### Task 2: i18n設定ファイル作成

**ファイル**: `apps/desktop/src/renderer/i18n/config.ts`

**実装内容**:

- i18nextの初期化設定
- ブラウザ言語検出の設定
- フォールバック言語（ja）の設定
- 名前空間（skill-stream）の設定

**設定項目**:
| 項目 | 値 |
| ---- | --- |
| fallbackLng | "ja" |
| supportedLngs | ["ja", "en"] |
| defaultNS | "skill-stream" |
| interpolation.escapeValue | false |

### Task 3: 翻訳ファイル作成

**日本語**: `apps/desktop/src/renderer/i18n/locales/ja/skill-stream.json`

```json
{
  "status": {
    "idle": "待機中",
    "running": "実行中",
    "completed": "完了",
    "error": "エラー",
    "aborted": "中断"
  },
  "time": {
    "justNow": "たった今",
    "secondsAgo": "{{count}}秒前",
    "minutesAgo": "{{count}}分前",
    "hoursAgo": "{{count}}時間前",
    "daysAgo": "{{count}}日前"
  },
  "feedback": {
    "copied": "コピーしました"
  },
  "aria": {
    "running": "実行中",
    "copyMessage": "メッセージをコピー"
  }
}
```

**英語**: `apps/desktop/src/renderer/i18n/locales/en/skill-stream.json`

```json
{
  "status": {
    "idle": "Idle",
    "running": "Running",
    "completed": "Completed",
    "error": "Error",
    "aborted": "Aborted"
  },
  "time": {
    "justNow": "Just now",
    "secondsAgo_one": "{{count}} second ago",
    "secondsAgo_other": "{{count}} seconds ago",
    "minutesAgo_one": "{{count}} minute ago",
    "minutesAgo_other": "{{count}} minutes ago",
    "hoursAgo_one": "{{count}} hour ago",
    "hoursAgo_other": "{{count}} hours ago",
    "daysAgo_one": "{{count}} day ago",
    "daysAgo_other": "{{count}} days ago"
  },
  "feedback": {
    "copied": "Copied"
  },
  "aria": {
    "running": "Running",
    "copyMessage": "Copy message"
  }
}
```

### Task 4: formatRelativeTimeロケール対応

**ファイル**: `apps/desktop/src/renderer/utils/formatTime.ts`

**変更内容**:

- 第2引数に`locale?: string`を追加
- デフォルト値は`'ja'`
- ロケールに応じた翻訳キーを使用して出力を生成
- i18nextのt関数を使用

**シグネチャ変更**:

```typescript
// Before
export function formatRelativeTime(timestamp: number, now?: number): string;

// After
export function formatRelativeTime(
  timestamp: number,
  locale?: string,
  now?: number,
): string;
```

### Task 5: SkillStreamDisplayコンポーネント適用

**ファイル**: `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx`

**変更箇所**:

| 変更箇所                   | 変更前                          | 変更後                                               |
| -------------------------- | ------------------------------- | ---------------------------------------------------- |
| インポート                 | -                               | `import { useTranslation } from 'react-i18next'`     |
| Hook呼び出し               | -                               | `const { t, i18n } = useTranslation('skill-stream')` |
| ステータス表示             | ハードコード日本語              | `t(\`status.${status}\`)`                            |
| LoadingSpinner aria-label  | "実行中"                        | `t('aria.running')`                                  |
| CopyButton aria-label      | "メッセージをコピー"            | `t('aria.copyMessage')`                              |
| コピーフィードバック       | "コピーしました"                | `t('feedback.copied')`                               |
| formatRelativeTime呼び出し | `formatRelativeTime(timestamp)` | `formatRelativeTime(timestamp, i18n.language)`       |

### Task 6: I18nextProviderの配置

**ファイル**: `apps/desktop/src/renderer/App.tsx`（または該当するルートコンポーネント）

**変更内容**:

- i18n設定のインポート
- I18nextProviderでアプリ全体をラップ

---

## 参照資料

| 資料名       | パス                                    | 説明          |
| ------------ | --------------------------------------- | ------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md` | Phase 4成果物 |
| 設計書       | `outputs/phase-2/i18n-design.md`        | Phase 2成果物 |

---

## アーキテクチャ層別実装

| 層               | 実装観点                        | 実装ファイル配置                          |
| ---------------- | ------------------------------- | ----------------------------------------- |
| Renderer Process | I18nextProvider、useTranslation | `apps/desktop/src/renderer/`              |
| ユーティリティ   | formatRelativeTimeロケール対応  | `apps/desktop/src/renderer/utils/`        |
| i18nリソース     | 翻訳ファイル                    | `apps/desktop/src/renderer/i18n/locales/` |

---

## 統合テスト連携【必須】

フロント/バック接続の実装とテスト支援コード整備:

| 実装項目         | 内容                                 |
| ---------------- | ------------------------------------ |
| i18nプロバイダー | App.tsxでI18nextProviderをラップ     |
| ロケール取得     | i18n.languageでcurrent localeを取得  |
| テストヘルパー   | renderWithI18nでテスト時のlocale指定 |

---

## 成果物

| 成果物                 | パス                                                                    | 説明         |
| ---------------------- | ----------------------------------------------------------------------- | ------------ |
| i18n設定               | `apps/desktop/src/renderer/i18n/config.ts`                              | 初期化設定   |
| i18nエクスポート       | `apps/desktop/src/renderer/i18n/index.ts`                               | エクスポート |
| 日本語翻訳             | `apps/desktop/src/renderer/i18n/locales/ja/skill-stream.json`           | 翻訳ファイル |
| 英語翻訳               | `apps/desktop/src/renderer/i18n/locales/en/skill-stream.json`           | 翻訳ファイル |
| 改善済みユーティリティ | `apps/desktop/src/renderer/utils/formatTime.ts`                         | ロケール対応 |
| 改善済みコンポーネント | `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx` | i18n適用     |

---

## 完了条件

- [ ] i18nライブラリがインストールされている
- [ ] i18n設定ファイルが作成されている
- [ ] 日本語翻訳ファイルが作成されている
- [ ] 英語翻訳ファイルが作成されている
- [ ] formatRelativeTimeがロケール対応している
- [ ] SkillStreamDisplayがuseTranslationを使用している
- [ ] I18nextProviderがアプリをラップしている
- [ ] すべてのテストが成功状態（Green）
- [ ] **本Phase内の全タスクを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] Phase 4で作成したテストが全て成功することを確認（Green状態）
# - [ ] 既存テストも全て成功することを確認
```

---

## 次のPhase

Phase 6: テスト拡充
