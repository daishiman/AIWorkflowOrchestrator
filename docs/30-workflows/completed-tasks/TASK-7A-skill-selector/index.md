# TASK-7A: SkillSelector コンポーネント

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| タスクID     | TASK-7A                        |
| タスク名     | SkillSelector コンポーネント   |
| 分類         | 機能追加（feat）               |
| 対象機能     | スキル選択ドロップダウンUI     |
| 優先度       | 高                             |
| 見積もり規模 | 中規模                         |
| ステータス   | 未実施                         |
| Tier         | 1                              |
| Phase        | 7（skill-import-agent-system） |
| 親タスク     | skill-import-agent-system      |
| 依存タスク   | TASK-6-1（SkillSlice）         |
| 並列タスク   | TASK-7B, TASK-7C               |
| ブロック     | TASK-7D                        |
| Issue番号    | 未割当                         |
| 作成日       | 2026-01-30                     |

---

## 1. 概要

### 1.1 目的

スキルを選択するためのドロップダウンコンポーネントを実装する。
既存の `ModelSelector` パターンに準拠し、WCAG 2.1 AA アクセシビリティ要件を満たす。

### 1.2 背景

skill-import-agent-system では、ユーザーがインポート済みスキルを選択して使用する。
SkillSelector はその入口となるUIコンポーネントであり、チャット画面のツールバー等に配置される。
TASK-6-1 で実装済みの SkillSlice（Zustand状態管理）と連携し、スキルの表示・選択・再スキャンを提供する。

### 1.3 問題点・課題

| ID  | 課題                          | 現状                                                       |
| --- | ----------------------------- | ---------------------------------------------------------- |
| C1  | スキル選択UIが存在しない      | SkillSlice（状態管理）は実装済みだがUIコンポーネントがない |
| C2  | アクセシビリティ対応が必要    | ARIA属性、キーボードナビゲーション、フォーカス管理         |
| C3  | ModelSelectorとの一貫性が必要 | 既存パターンに準拠した操作感を提供する必要がある           |

---

## 2. 最終ゴール

| 達成項目             | 達成状態                                               |
| -------------------- | ------------------------------------------------------ |
| ドロップダウンUI実装 | スキル一覧をドロップダウンで表示・選択できる           |
| セクション分け       | インポート済み / 利用可能 のセクション分けがされている |
| スキル選択機能       | スキル選択・選択解除が正常に動作する                   |
| 再スキャン機能       | 「再スキャン」ボタンで利用可能スキルを更新できる       |
| アクセシビリティ     | ARIA属性・キーボードナビゲーションが実装されている     |
| 外側クリック         | ドロップダウン外クリックで閉じる                       |
| テスト               | コンポーネントテストが全て通過する                     |

---

## 3. スコープ

### 3.1 含むもの

- `SkillSelector` メインコンポーネント
- `SkillOption` サブコンポーネント（インポート済みスキル用）
- `SkillOptionUnimported` サブコンポーネント（未インポートスキル用）
- ドロップダウン開閉ロジック
- 外側クリック検知
- キーボードナビゲーション（Enter, Space, Escape, ArrowUp/Down, Home, End）
- ARIA属性（`aria-haspopup`, `aria-expanded`, `role="listbox"`, `role="option"`, `aria-selected`）
- 「再スキャン」ボタン
- コンポーネントテスト（8テストケース以上）
- barrel export（`index.ts`）

### 3.2 含まないもの

- インポートダイアログ（TASK-7B で実装）
- SkillStreamDisplay（TASK-7C で実装）
- スキル実行UI統合（TASK-7D で実装）
- Main Process / IPC通信の変更
- SkillSlice の変更（TASK-6-1 で実装済み）
- i18n対応（将来タスク）

---

## 4. 成果物一覧

| 成果物               | パス                                                                          |
| -------------------- | ----------------------------------------------------------------------------- |
| SkillSelector本体    | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`                |
| barrel export        | `apps/desktop/src/renderer/components/skill/index.ts`                         |
| コンポーネントテスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx` |

---

## 5. Phase構成

| Phase | 名称               | 概要                                              |
| ----- | ------------------ | ------------------------------------------------- |
| 1     | 要件定義           | SkillSelector要件・受け入れ基準定義               |
| 2     | 設計               | コンポーネント設計・Props・状態・アクセシビリティ |
| 3     | 設計レビューゲート | 設計妥当性・ModelSelectorとの一貫性検証           |
| 4     | テスト作成         | コンポーネントテスト作成（TDD Red）               |
| 5     | 実装               | SkillSelector / SkillOption 実装（TDD Green）     |
| 6     | テスト拡充         | エッジケース・統合テスト追加                      |
| 7     | カバレッジ確認     | カバレッジ基準達成確認                            |
| 8     | リファクタリング   | コード品質改善                                    |
| 9     | 品質保証           | 品質ゲート全項目クリア確認                        |
| 10    | 最終レビューゲート | 全体整合性・品質最終確認                          |
| 11    | 手動テスト         | UI/UX・アクセシビリティ手動確認                   |
| 12    | ドキュメント更新   | 実装ガイド・仕様書更新                            |
| 13    | PR作成             | PR作成・CI確認                                    |

---

## 6. 依存関係

### 6.1 前提条件

- TASK-6-1（SkillSlice）が完了していること
- `useAppStore` 経由で skillSlice の状態・アクションにアクセスできること
- `SkillMetadata` / `ImportedSkill` 型が定義されていること

### 6.2 依存タスク

| タスクID | タスク名               | ステータス |
| -------- | ---------------------- | ---------- |
| TASK-6-1 | SkillSlice（状態管理） | 完了       |

### 6.3 並列タスク

| タスクID | タスク名           |
| -------- | ------------------ |
| TASK-7B  | SkillImportDialog  |
| TASK-7C  | SkillStreamDisplay |

### 6.4 ブロックするタスク

| タスクID | タスク名         |
| -------- | ---------------- |
| TASK-7D  | スキル実行UI統合 |

---

## 7. 技術要件

### 7.1 必要な知識

| 技術領域     | 必要な知識                                                 |
| ------------ | ---------------------------------------------------------- |
| React        | FC、Hooks（useState, useRef, useEffect, useCallback）      |
| TypeScript   | 型定義、インターフェース、ジェネリクス                     |
| Zustand      | useAppStore、スライスパターン                              |
| Tailwind CSS | ユーティリティクラス、ダークモード対応                     |
| ARIA         | listbox/option/combobox パターン、キーボードナビゲーション |
| Vitest       | コンポーネントテスト、Testing Library                      |

### 7.2 推奨アプローチ

1. **ModelSelector パターン踏襲**: 既存の `ModelSelector.tsx` と同じドロップダウンパターンを使用
2. **SkillSlice 連携**: `useAppStore` から `availableSkills`, `importedSkills`, `selectedSkillName`, `selectSkill`, `rescanSkills` を取得
3. **セクション分け**: インポート済みスキルと利用可能スキルを視覚的に分離
4. **キーボードナビゲーション**: WAI-ARIA Listbox パターンに準拠

---

## 8. 完了条件チェックリスト

### 8.1 機能要件

- [ ] ドロップダウンUIが実装されている
- [ ] インポート済み / 利用可能 のセクション分けがされている
- [ ] スキル選択が機能する（選択・解除）
- [ ] 「なし」オプションで選択解除できる
- [ ] 「再スキャン」ボタンが機能する

### 8.2 品質要件

- [ ] アクセシビリティ属性（ARIA）が設定されている
- [ ] キーボードナビゲーションが実装されている（Enter, Space, Escape, Arrow, Home, End）
- [ ] 外側クリックでドロップダウンが閉じる
- [ ] ダークモード対応
- [ ] TypeScript型エラーなし
- [ ] ESLint / Prettier 準拠

### 8.3 テスト要件

- [ ] コンポーネントテストが全て通過する（8件以上）
- [ ] Line Coverage 80%以上
- [ ] Branch Coverage 60%以上
- [ ] Function Coverage 80%以上

### 8.4 ドキュメント要件

- [ ] 実装ガイド（Part 1/Part 2）が作成されている
- [ ] システム仕様書が更新されている（該当する場合）

---

## 9. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                                         |
| -------------------------------- | ------ | -------- | -------------------------------------------- |
| SkillSlice APIとの不整合         | 高     | 低       | TASK-6-1完了後の型定義を事前確認             |
| ModelSelectorパターンとの乖離    | 中     | 低       | ModelSelector.tsx をリファレンスとして参照   |
| キーボードナビゲーションの複雑性 | 中     | 中       | WAI-ARIA Listbox仕様を厳密に準拠             |
| ダークモード対応の不足           | 低     | 中       | デザインシステムのセマンティックトークン使用 |

---

## 10. 参照情報

### 10.1 関連ドキュメント

| ドキュメント                | パス                                                                         |
| --------------------------- | ---------------------------------------------------------------------------- |
| SkillSelector仕様（4.2）    | `docs/30-workflows/skill-import-agent-system/specification.md`               |
| アクセシビリティ仕様（4.6） | `docs/30-workflows/skill-import-agent-system/specification.md`               |
| ModelSelectorコンポーネント | `apps/desktop/src/renderer/components/llm/ModelSelector.tsx`                 |
| SkillSlice                  | `apps/desktop/src/renderer/store/slices/skillSlice.ts`                       |
| UI/UXデザインシステム       | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`   |
| 状態管理アーキテクチャ      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` |

### 10.2 参考パターン

| パターン         | パス                                                         | 説明                         |
| ---------------- | ------------------------------------------------------------ | ---------------------------- |
| ModelSelector    | `apps/desktop/src/renderer/components/llm/ModelSelector.tsx` | ドロップダウンパターンの参考 |
| WAI-ARIA Listbox | https://www.w3.org/WAI/ARIA/apd/patterns/listbox/            | アクセシビリティパターン     |

---

## 11. 備考

### 11.1 Apple HIG準拠（specification.md 4.2）

- ジャーゴン排除: 技術識別子ではなく人間可読な名前を表示
- プログレッシブ・ディスクロージャ: 詳細情報はリクエスト時のみ表示
- 視覚的明瞭性: ✓ / ○ で選択状態を区別

### 11.2 SkillSlice 連携

SkillSlice（TASK-6-1完了）から以下の状態・アクションを使用:

| 状態/アクション     | 型                               | 用途                     |
| ------------------- | -------------------------------- | ------------------------ |
| `availableSkills`   | `SkillMetadata[]`                | 利用可能スキル一覧表示   |
| `importedSkills`    | `ImportedSkill[]`                | インポート済みスキル表示 |
| `selectedSkillName` | `string \| null`                 | 現在選択中のスキル名     |
| `isLoadingSkills`   | `boolean`                        | ローディング表示         |
| `isScanning`        | `boolean`                        | スキャン中表示           |
| `selectSkill`       | `(name: string \| null) => void` | スキル選択アクション     |
| `rescanSkills`      | `() => Promise<void>`            | 再スキャンアクション     |
