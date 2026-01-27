# [#531] "[TASK-3-2-B] SkillStreamDisplay i18n対応"

## メタ情報

```yaml
task_id: TASK-3-2-B
task_name: SkillStreamDisplay i18n対応
category: 改善
target_feature: SkillStreamDisplay UIコンポーネント
priority: 低
scale: 中規模
status: 未実施
source_phase: Phase 8（TASK-3-2-A リファクタリング）
created_date: 2026-01-27
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-skill-stream-i18n-improvements.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-3-2-AでSkillStreamDisplayコンポーネントにUX改善機能（R1: LoadingSpinner、R2: MessageTimestamp、R3: CopyButton）を実装した。現在、UIテキストは日本語でハードコードされており、将来的な国際化展開を考慮するとi18n対応が必要となる。

### 1.2 問題点・課題

| ID  | 課題                           | 現状                                       |
| --- | ------------------------------ | ------------------------------------------ |
| I1  | UIテキストがハードコード       | 「実行中」「コピーしました」等が日本語固定 |
| I2  | formatRelativeTimeが日本語固定 | 「X秒前」「X分前」等の出力形式が固定       |
| I3  | aria-labelが日本語固定         | アクセシビリティ属性が日本語のみ           |

### 1.3 放置した場合の影響

- **I1**: 海外ユーザーへの展開時にUI変更が必要
- **I2**: 相対時刻表示が理解できないユーザーが発生
- **I3**: 英語スクリーンリーダーユーザーのアクセシビリティ低下

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillStreamDisplayコンポーネントの全UIテキストを多言語対応し、国際化展開を可能にする。

### 2.2 最終ゴール

| 達成項目                   | 達成状態                               |
| -------------------------- | -------------------------------------- |
| i18nライブラリ導入         | react-i18nextが設定されている          |
| UIテキスト多言語化         | 全UIテキストが翻訳キー経由になっている |
| formatRelativeTime多言語化 | ロケール引数で言語切替可能             |
| aria-label多言語化         | アクセシビリティ属性が翻訳対応         |
| 初期対応言語               | 日本語（ja）、英語（en）               |

### 2.3 スコープ

#### 含むもの

- SkillStreamDisplayコンポーネントのi18n対応
- formatRelativeTimeユーティリティのロケール対応
- 日本語・英語の翻訳ファイル作成
- 関連ユニットテストの追加

#### 含まないもの

- アプリ全体のi18n導入（他コンポーネントは対象外）
- 言語切替UIの実装
- 3言語以上の翻訳

### 2.4 成果物

| 成果物                 | パス                                                                    |
| ---------------------- | ----------------------------------------------------------------------- |
| i18n設定ファイル       | `apps/desktop/src/renderer/i18n/config.ts`                              |
| 日本語翻訳ファイル     | `apps/desktop/src/renderer/i18n/locales/ja/skill-stream.json`           |
| 英語翻訳ファイル       | `apps/desktop/src/renderer/i18n/locales/en/skill-stream.json`           |
| 改善済みコンポーネント | `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx` |
| 改善済みユーティリティ | `apps/desktop/src/renderer/utils/formatTime.ts`                         |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-3-2-Aが完了していること
- SkillStreamDisplayコンポーネントが正常に動作していること
- 既存テストが全てPASSしていること

### 3.2 依存タスク

| タスクID   | タスク名                  | ステータス |
| ---------- | ------------------------- | ---------- |
| TASK-3-2-A | SkillStreamDisplay UX改善 | 完了       |

### 3.3 必要な知識

| 技術領域   | 必要な知識                      |
| ---------- | ------------------------------- |
| React      | Hooksパターン、Context API      |
| i18n       | react-i18next、翻訳ファイル構造 |
| TypeScript | ジェネリクス、型安全な翻訳キー  |
| Testing    | i18nモック、ロケール切替テスト  |

### 3.4 推奨アプローチ

1. **react-i18nextのセットアップ**
   - `pnpm --filter @repo/desktop add react-i18next i18next`
   - i18n初期化設定の作成

2. **翻訳ファイルの作成**
   - 名前空間: `skill-stream`
   - キー命名規則: `component.element.state` 形式

3. **formatRelativeTimeのロケール対応**
   - 第2引数に `locale?: string` を追加
   - `Intl.RelativeTimeFormat` の活用を検討

4. **コンポーネントの翻訳キー適用**
   - `useTranslation` hookの導入
   - 全ハードコードテキストを `t()` 関数経由に変更

---

## 4. 実行手順

### Phase構成

| Phase | 名称             | 概要                       |
| ----- | ---------------- | -------------------------- |
| 1     | 要件定義         | 翻訳対象テキストの洗い出し |
| 2     | 設計             | i18n構造設計               |
| 4     | テスト作成       | i18nテストケース作成       |
| 5     | 実装             | i18n適用実装               |
| 7     | カバレッジ確認   | テストカバレッジ維持確認   |
| 11    | 手動テスト       | 言語切替動作確認           |
| 12    | ドキュメント更新 | 実装ガイド更新             |

### Phase 5: 実装

#### 目的

SkillStreamDisplayコンポーネントにi18nを適用する。

#### 手順

1. **i18n設定ファイル作成**
   - `apps/desktop/src/renderer/i18n/config.ts` を作成
   - デフォルト言語を日本語に設定

2. **翻訳ファイル作成**
   - 日本語: `locales/ja/skill-stream.json`
   - 英語: `locales/en/skill-stream.json`

3. **formatRelativeTimeロケール対応**
   - `locale` パラメータを追加
   - 言語別の時刻表現を定義

4. **コンポーネント適用**
   - `useTranslation('skill-stream')` を追加
   - 全テキストを `t()` 経由に変更

#### 成果物

- i18n設定ファイル
- 翻訳ファイル（ja, en）
- 改善済みコンポーネント

#### 完了条件

- [ ] i18n設定が正常に動作する
- [ ] 日本語/英語の切替が可能
- [ ] 既存テストが全てPASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] I1: UIテキストが翻訳キー経由で表示される
- [ ] I2: formatRelativeTimeがロケール対応している
- [ ] I3: aria-labelが翻訳対応している
- [ ] 日本語/英語の2言語をサポート

### 品質要件

- [ ] 既存テストが全てPASS
- [ ] i18n関連テストが追加されている
- [ ] カバレッジが100%を維持
- [ ] TypeScript型エラーなし
- [ ] ESLintエラーなし

### ドキュメント要件

- [ ] i18n導入ガイドが作成されている
- [ ] 翻訳キー一覧がドキュメント化されている

---

## 6. 検証方法

### テストケース

| TC-ID  | テスト内容                           | 期待結果                       |
| ------ | ------------------------------------ | ------------------------------ |
| TC-401 | 日本語ロケールでUIが正しく表示される | 日本語テキストが表示           |
| TC-402 | 英語ロケールでUIが正しく表示される   | 英語テキストが表示             |
| TC-403 | formatRelativeTimeが日本語で動作する | 「X秒前」形式で表示            |
| TC-404 | formatRelativeTimeが英語で動作する   | "X seconds ago" 形式で表示     |
| TC-405 | aria-labelが翻訳対応している         | 各言語のaria-labelが設定される |

### 検証手順

1. 開発サーバーを起動: `pnpm --filter @repo/desktop dev`
2. ブラウザの言語設定を日本語に変更し確認
3. ブラウザの言語設定を英語に変更し確認
4. スクリーンリーダーでaria-labelを確認

---

## 7. リスクと対策

| リスク             | 影響度 | 発生確率 | 対策                            |
| ------------------ | ------ | -------- | ------------------------------- |
| バンドルサイズ増加 | 低     | 中       | 翻訳ファイルの遅延読み込み      |
| 翻訳漏れ           | 中     | 中       | TypeScript型による翻訳キー検証  |
| パフォーマンス低下 | 低     | 低       | useMemoによる翻訳結果キャッシュ |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント            | パス                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| TASK-3-2-A実装ガイド    | `docs/30-workflows/TASK-3-2-A-skill-stream-ux-improvements/outputs/phase-12/implementation-guide.md` |
| UI/UXコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                      |

### 参考資料

| 資料名                  | URL/パス                                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| react-i18next           | https://react.i18next.com/                                                                               |
| Intl.RelativeTimeFormat | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat |

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
TASK-3-2-A Phase 8 Refactoring Report - Future Improvement Candidates:
- i18n対応（多言語化）: 優先度低、将来的な国際化対応として記録
```

### 補足事項

- この改善は任意タスクであり、他の優先タスクがある場合は後回しにしてよい
- アプリ全体のi18n導入時に統合することを推奨
- 将来的に3言語以上に拡張する場合は別タスクとして起票する
