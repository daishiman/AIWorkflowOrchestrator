# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                |
| ------ | ----------------- |
| Phase  | 4                 |
| 機能名 | skill-stream-i18n |
| 作成日 | 2026-01-28        |

---

## 目的

i18n機能の期待動作を検証するテストを実装より先に作成する（Red状態）。

---

## 実行タスク

### Task 1: formatRelativeTimeロケールテスト作成

**テストファイル**: `apps/desktop/src/renderer/utils/formatTime.test.ts`

**追加テストケース**:

| テストケース              | 入力                                    | 期待出力                     |
| ------------------------- | --------------------------------------- | ---------------------------- |
| 日本語ロケール - たった今 | (timestamp, "ja", now) where diff < 0   | "たった今"                   |
| 日本語ロケール - 秒       | (timestamp, "ja", now) where diff = 30s | "30秒前"                     |
| 日本語ロケール - 分       | (timestamp, "ja", now) where diff = 5m  | "5分前"                      |
| 日本語ロケール - 時間     | (timestamp, "ja", now) where diff = 2h  | "2時間前"                    |
| 日本語ロケール - 日       | (timestamp, "ja", now) where diff = 3d  | "3日前"                      |
| 英語ロケール - Just now   | (timestamp, "en", now) where diff < 0   | "Just now"                   |
| 英語ロケール - seconds    | (timestamp, "en", now) where diff = 30s | "30 seconds ago"             |
| 英語ロケール - minutes    | (timestamp, "en", now) where diff = 5m  | "5 minutes ago"              |
| 英語ロケール - hours      | (timestamp, "en", now) where diff = 2h  | "2 hours ago"                |
| 英語ロケール - days       | (timestamp, "en", now) where diff = 3d  | "3 days ago"                 |
| デフォルトロケール        | (timestamp, undefined, now)             | 日本語出力（フォールバック） |
| 単数形 - 英語             | (timestamp, "en", now) where diff = 1s  | "1 second ago"               |
| 単数形 - 英語             | (timestamp, "en", now) where diff = 1m  | "1 minute ago"               |

### Task 2: SkillStreamDisplay i18nテスト作成

**テストファイル**: `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.test.tsx`

**追加テストケース**:

| テストケース                | 検証内容                       | 期待結果                        |
| --------------------------- | ------------------------------ | ------------------------------- |
| 日本語ステータス表示        | status="idle"時のテキスト      | "待機中"が表示される            |
| 日本語ステータス表示        | status="running"時のテキスト   | "実行中"が表示される            |
| 日本語ステータス表示        | status="completed"時のテキスト | "完了"が表示される              |
| 日本語ステータス表示        | status="error"時のテキスト     | "エラー"が表示される            |
| 日本語ステータス表示        | status="aborted"時のテキスト   | "中断"が表示される              |
| 英語ステータス表示          | locale="en", status="running"  | "Running"が表示される           |
| 日本語aria-label            | LoadingSpinner                 | aria-label="実行中"             |
| 英語aria-label              | locale="en", LoadingSpinner    | aria-label="Running"            |
| 日本語コピーフィードバック  | コピー成功後                   | "コピーしました"が表示される    |
| 英語コピーフィードバック    | locale="en", コピー成功後      | "Copied"が表示される            |
| CopyButton aria-label日本語 | CopyButton                     | aria-label="メッセージをコピー" |
| CopyButton aria-label英語   | locale="en", CopyButton        | aria-label="Copy message"       |

### Task 3: i18n設定テスト作成

**テストファイル**: `apps/desktop/src/renderer/i18n/config.test.ts`

**テストケース**:

| テストケース         | 検証内容              | 期待結果                            |
| -------------------- | --------------------- | ----------------------------------- |
| 初期化成功           | i18n.init()が成功する | エラーなし                          |
| フォールバック言語   | 未対応言語設定時      | 日本語にフォールバック              |
| 翻訳キー取得         | t('status.running')   | "実行中"（ja）または"Running"（en） |
| 名前空間             | デフォルト名前空間    | "skill-stream"                      |
| 翻訳ファイル読み込み | ja/skill-stream.json  | 正常読み込み                        |
| 翻訳ファイル読み込み | en/skill-stream.json  | 正常読み込み                        |

### Task 4: テストユーティリティ作成

**i18nテストヘルパー**: `apps/desktop/src/renderer/test-utils/i18n-test-utils.tsx`

```typescript
// テスト用i18nプロバイダー
export function renderWithI18n(
  ui: React.ReactElement,
  locale: string = "ja",
): RenderResult;

// モック翻訳関数
export const mockT = (key: string, options?: object) => string;
```

---

## 参照資料

| 資料名       | パス                                      | 説明          |
| ------------ | ----------------------------------------- | ------------- |
| 設計書       | `outputs/phase-2/i18n-design.md`          | Phase 2成果物 |
| 翻訳キー定義 | `outputs/phase-2/translation-keys.md`     | Phase 2成果物 |
| 設計レビュー | `outputs/phase-3/design-review-result.md` | Phase 3成果物 |

---

## アーキテクチャ層別テスト

| 層               | テスト観点                 | テストファイル配置                                   |
| ---------------- | -------------------------- | ---------------------------------------------------- |
| Renderer Process | UIコンポーネントi18n       | `apps/desktop/src/renderer/**/*.test.tsx`            |
| ユーティリティ   | formatRelativeTimeロケール | `apps/desktop/src/renderer/utils/formatTime.test.ts` |
| i18n設定         | 初期化、翻訳取得           | `apps/desktop/src/renderer/i18n/config.test.ts`      |

---

## 統合テスト連携【必須】

統合テストシナリオを設計:

| シナリオカテゴリ         | 検証内容                                            | テストファイル           |
| ------------------------ | --------------------------------------------------- | ------------------------ |
| 言語切替テスト           | ロケール変更後のUI更新                              | `*.i18n.test.tsx`        |
| コンポーネント連携テスト | SkillStreamDisplay-formatRelativeTime間のlocale連携 | `*.integration.test.tsx` |

---

## 成果物

| 成果物                               | パス                                                                         | 説明               |
| ------------------------------------ | ---------------------------------------------------------------------------- | ------------------ |
| テスト仕様書                         | `outputs/phase-4/test-specification.md`                                      | テスト設計         |
| テストケース一覧                     | `outputs/phase-4/test-cases.md`                                              | ケース一覧         |
| テストファイル（formatTime）         | `apps/desktop/src/renderer/utils/formatTime.test.ts`                         | ロケールテスト追加 |
| テストファイル（SkillStreamDisplay） | `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.test.tsx` | i18nテスト追加     |
| テストユーティリティ                 | `apps/desktop/src/renderer/test-utils/i18n-test-utils.tsx`                   | テストヘルパー     |

---

## 完了条件

- [ ] formatRelativeTimeのロケールテストが作成されている
- [ ] SkillStreamDisplayのi18nテストが作成されている
- [ ] i18n設定のテストが作成されている
- [ ] テストユーティリティが作成されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] 境界値テスト（単数形/複数形）が含まれている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] 新規追加テストが失敗することを確認（Red状態）
# - [ ] 既存テストは成功することを確認（変更なし）
```

---

## 次のPhase

Phase 5: 実装（TDD: Green）
