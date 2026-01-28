# Phase 1: 要件定義

## メタ情報

| 項目   | 値                |
| ------ | ----------------- |
| Phase  | 1                 |
| 機能名 | skill-stream-i18n |
| 作成日 | 2026-01-28        |

---

## 目的

SkillStreamDisplayコンポーネントにおける翻訳対象テキストを洗い出し、i18n対応の機能要件・非機能要件を明文化する。

---

## 実行タスク

### Task 1: 翻訳対象テキストの洗い出し

SkillStreamDisplayコンポーネントとformatRelativeTimeユーティリティに含まれるすべてのハードコードされた日本語テキストを特定する。

**対象ファイル**:

- `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx`
- `apps/desktop/src/renderer/utils/formatTime.ts`

**抽出対象**:
| カテゴリ | テキスト | 現在の場所 |
| -------- | -------- | ---------- |
| ステータス | 待機中、実行中、完了、エラー、中断 | SkillStreamDisplay.tsx |
| タイムスタンプ | たった今、X秒前、X分前、X時間前、X日前 | formatTime.ts |
| フィードバック | コピーしました | SkillStreamDisplay.tsx |
| aria-label | 実行中、メッセージをコピー | SkillStreamDisplay.tsx |

### Task 2: 機能要件（FR）の定義

| FR-ID | 要件                                               | 優先度 |
| ----- | -------------------------------------------------- | ------ |
| FR-01 | UIテキストが翻訳キー経由で表示される               | 必須   |
| FR-02 | formatRelativeTimeがロケールに応じた出力を返す     | 必須   |
| FR-03 | aria-labelが翻訳対応する                           | 必須   |
| FR-04 | 日本語（ja）と英語（en）の2言語をサポートする      | 必須   |
| FR-05 | ブラウザの言語設定に基づいて自動で言語が選択される | 任意   |

### Task 3: 非機能要件（NFR）の定義

| NFR-ID | 要件                         | 基準                 |
| ------ | ---------------------------- | -------------------- |
| NFR-01 | 翻訳ファイルのバンドルサイズ | 10KB以下/言語        |
| NFR-02 | 翻訳取得のパフォーマンス     | 100ms以下            |
| NFR-03 | 既存テストの互換性           | 全テストPASS維持     |
| NFR-04 | TypeScript型安全性           | 翻訳キーの型チェック |

### Task 4: 受け入れ基準の定義

| AC-ID | 受け入れ基準                                          | 検証方法               |
| ----- | ----------------------------------------------------- | ---------------------- |
| AC-01 | 日本語ロケールで全UIテキストが日本語表示される        | 手動テスト             |
| AC-02 | 英語ロケールで全UIテキストが英語表示される            | 手動テスト             |
| AC-03 | formatRelativeTime("ja")が「X秒前」形式を返す         | ユニットテスト         |
| AC-04 | formatRelativeTime("en")が「X seconds ago」形式を返す | ユニットテスト         |
| AC-05 | aria-labelが各言語で正しく設定される                  | アクセシビリティテスト |
| AC-06 | 既存テストが100% PASSする                             | CI                     |

---

## 参照資料

| 資料名                 | パス                                                                                                 | 説明                     |
| ---------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------ |
| SkillStreamDisplay仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                      | 現在のコンポーネント仕様 |
| TASK-3-2-A実装ガイド   | `docs/30-workflows/TASK-3-2-A-skill-stream-ux-improvements/outputs/phase-12/implementation-guide.md` | UX改善実装詳細           |

---

## アーキテクチャ層別要件

| 層                         | 確認観点                                         |
| -------------------------- | ------------------------------------------------ |
| フロントエンド（Renderer） | i18nプロバイダー設定、useTranslation hook使用    |
| ユーティリティ             | formatRelativeTimeのロケール引数対応             |
| 翻訳リソース               | JSON形式の翻訳ファイル（名前空間: skill-stream） |

---

## 成果物

| 成果物           | パス                                         | 説明                         |
| ---------------- | -------------------------------------------- | ---------------------------- |
| 要件定義書       | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件             |
| 翻訳テキスト一覧 | `outputs/phase-1/translation-text-list.md`   | 翻訳対象テキストの完全リスト |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`     | AC定義                       |

---

## 完了条件

- [ ] SkillStreamDisplay内の全ハードコードテキストが特定されている
- [ ] formatRelativeTime内の全出力形式が特定されている
- [ ] 機能要件（FR）が定義されている
- [ ] 非機能要件（NFR）が定義されている
- [ ] 受け入れ基準（AC）が検証可能な形で定義されている
- [ ] 翻訳テキスト一覧が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 2: 設計
