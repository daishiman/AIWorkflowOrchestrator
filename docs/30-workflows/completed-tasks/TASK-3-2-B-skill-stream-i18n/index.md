# SkillStreamDisplay 多言語化対応 タスク仕様書

## メタ情報

| 項目         | 内容                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| タスクID     | TASK-3-2-B                                                             |
| タスク名     | SkillStreamDisplay i18n対応                                            |
| GitHub Issue | [#531](https://github.com/daishiman/AIWorkflowOrchestrator/issues/531) |
| 分類         | 改善                                                                   |
| 対象機能     | SkillStreamDisplay UIコンポーネント                                    |
| 優先度       | 低                                                                     |
| 見積もり規模 | 中規模                                                                 |
| ステータス   | 未着手                                                                 |
| 発見元       | Phase 8（TASK-3-2-A リファクタリング）                                 |
| 発見日       | 2026-01-27                                                             |
| 親タスク     | TASK-3-2-A SkillStreamDisplay UX改善                                   |
| 作成日       | 2026-01-28                                                             |

---

## 1. 背景

### 1.1 経緯

TASK-3-2-AでSkillStreamDisplayコンポーネントにUX改善機能（R1: LoadingSpinner、R2: MessageTimestamp、R3: CopyButton）を実装した。現在、UIテキストは日本語でハードコードされており、将来的な国際化展開を考慮するとi18n対応が必要となる。

### 1.2 問題点

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

## 2. 目的

### 2.1 達成目標

SkillStreamDisplayコンポーネントの全UIテキストを多言語対応し、国際化展開を可能にする。

### 2.2 最終ゴール

| 達成項目                   | 達成状態                               |
| -------------------------- | -------------------------------------- |
| i18nライブラリ導入         | react-i18nextが設定されている          |
| UIテキスト多言語化         | 全UIテキストが翻訳キー経由になっている |
| formatRelativeTime多言語化 | ロケール引数で言語切替可能             |
| aria-label多言語化         | アクセシビリティ属性が翻訳対応         |
| 初期対応言語               | 日本語（ja）、英語（en）               |

---

## 3. スコープ

### 3.1 含むもの

- SkillStreamDisplayコンポーネントのi18n対応
- formatRelativeTimeユーティリティのロケール対応
- 日本語・英語の翻訳ファイル作成
- 関連ユニットテストの追加

### 3.2 含まないもの

- アプリ全体のi18n導入（他コンポーネントは対象外）
- 言語切替UIの実装
- 3言語以上の翻訳

---

## 4. 技術要件

### 4.1 使用技術

| 技術          | バージョン | 用途                 |
| ------------- | ---------- | -------------------- |
| react-i18next | ^14.x      | React i18n統合       |
| i18next       | ^23.x      | 国際化フレームワーク |
| TypeScript    | 5.x        | 型安全な翻訳キー     |

### 4.2 成果物

| 成果物                 | パス                                                                    |
| ---------------------- | ----------------------------------------------------------------------- |
| i18n設定ファイル       | `apps/desktop/src/renderer/i18n/config.ts`                              |
| 日本語翻訳ファイル     | `apps/desktop/src/renderer/i18n/locales/ja/skill-stream.json`           |
| 英語翻訳ファイル       | `apps/desktop/src/renderer/i18n/locales/en/skill-stream.json`           |
| 改善済みコンポーネント | `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx` |
| 改善済みユーティリティ | `apps/desktop/src/renderer/utils/formatTime.ts`                         |

---

## 5. Phase構成

| Phase | 名称               | 概要                       | 仕様書                       |
| ----- | ------------------ | -------------------------- | ---------------------------- |
| 1     | 要件定義           | 翻訳対象テキストの洗い出し | [phase-1.md](./phase-1.md)   |
| 2     | 設計               | i18n構造設計               | [phase-2.md](./phase-2.md)   |
| 3     | 設計レビューゲート | 設計の妥当性検証           | [phase-3.md](./phase-3.md)   |
| 4     | テスト作成         | i18nテストケース作成       | [phase-4.md](./phase-4.md)   |
| 5     | 実装               | i18n適用実装               | [phase-5.md](./phase-5.md)   |
| 6     | テスト拡充         | カバレッジ向上             | [phase-6.md](./phase-6.md)   |
| 7     | カバレッジ確認     | テストカバレッジ検証       | [phase-7.md](./phase-7.md)   |
| 8     | リファクタリング   | コード品質改善             | [phase-8.md](./phase-8.md)   |
| 9     | 品質保証           | 品質基準検証               | [phase-9.md](./phase-9.md)   |
| 10    | 最終レビューゲート | 最終品質検証               | [phase-10.md](./phase-10.md) |
| 11    | 手動テスト検証     | 言語切替動作確認           | [phase-11.md](./phase-11.md) |
| 12    | ドキュメント更新   | 実装ガイド・仕様書更新     | [phase-12.md](./phase-12.md) |
| 13    | PR作成             | 変更コミット・PR作成       | [phase-13.md](./phase-13.md) |

---

## 6. 前提条件

- TASK-3-2-Aが完了していること
- SkillStreamDisplayコンポーネントが正常に動作していること
- 既存テストが全てPASSしていること

---

## 7. 依存タスク

| タスクID   | タスク名                  | ステータス |
| ---------- | ------------------------- | ---------- |
| TASK-3-2-A | SkillStreamDisplay UX改善 | 完了       |

---

## 8. リスクと対策

| リスク             | 影響度 | 発生確率 | 対策                            |
| ------------------ | ------ | -------- | ------------------------------- |
| バンドルサイズ増加 | 低     | 中       | 翻訳ファイルの遅延読み込み      |
| 翻訳漏れ           | 中     | 中       | TypeScript型による翻訳キー検証  |
| パフォーマンス低下 | 低     | 低       | useMemoによる翻訳結果キャッシュ |

---

## 9. 参照資料

### システム仕様

| 参照資料            | パス                                                                            | 内容                   |
| ------------------- | ------------------------------------------------------------------------------- | ---------------------- |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | SkillStreamDisplay仕様 |
| アーキテクチャ      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`    | システム構造           |

### 外部参考資料

| 資料名                  | URL                                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| react-i18next           | https://react.i18next.com/                                                                               |
| Intl.RelativeTimeFormat | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat |

### 関連タスク

| 資料名               | パス                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| TASK-3-2-A実装ガイド | `docs/30-workflows/TASK-3-2-A-skill-stream-ux-improvements/outputs/phase-12/implementation-guide.md` |

---

## 10. 備考

- この改善は任意タスクであり、他の優先タスクがある場合は後回しにしてよい
- アプリ全体のi18n導入時に統合することを推奨
- 将来的に3言語以上に拡張する場合は別タスクとして起票する
