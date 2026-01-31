# PermissionDialogツールリスクレベル・セキュリティメタデータ表示 - タスク指示書

## メタ情報

```yaml
issue_number: 606
```

## メタ情報

| 項目         | 内容                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ |
| タスクID     | task-imp-permission-tool-metadata-001                                                |
| タスク名     | PermissionDialogツールリスクレベル・セキュリティメタデータ表示                       |
| 分類         | 改善                                                                                 |
| 対象機能     | PermissionDialog、permissionDescriptions                                             |
| 優先度       | 高                                                                                   |
| 見積もり規模 | 中規模                                                                               |
| ステータス   | 未実施                                                                               |
| 発見元       | システム仕様書分析（security-skill-execution.md と ui-ux-agent-execution.md の差分） |
| 発見日       | 2026-01-31                                                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

security-skill-execution.mdの`ALLOWED_TOOLS_WHITELIST`テーブルでは、各ツールに対してリスクレベル（Low/Medium/High/Critical）が定義されている。一方、PermissionDialog（ui-ux-agent-execution.md）では現在ツール名と人間可読説明文のみを表示しており、セキュリティリスク情報はユーザーに提示されていない。

### 1.2 問題点・課題

- ユーザーが権限許可の判断をする際に、ツールのリスクレベルが視覚的に表示されない
- `Bash`（Critical）と`Read`（Low）の許可判断が同等のUI表現で提示される
- security-skill-execution.mdで定義済みのリスクメタデータがUI層に到達していない
- セキュリティ意識の低いユーザーが高リスクツールを安易に許可するリスクがある

### 1.3 放置した場合の影響

- ユーザーがツールのセキュリティリスクを認識せず、危険なコマンド実行を許可する可能性
- security-skill-execution.mdのリスク分類がUI上で活用されず、仕様と実装の乖離が拡大
- 「常に許可」チェックボックスの使用判断に必要な情報が不足したまま運用される

---

## 2. 何を達成するか（What）

### 2.1 目的

PermissionDialogにツールのリスクレベルバッジとセキュリティ影響説明を追加し、ユーザーがリスクを認識した上で許可判断できるようにする。

### 2.2 最終ゴール

- PermissionDialogのツールバッジ横にリスクレベルが色分け表示される
- 各ツールの簡潔なセキュリティ影響説明が表示される
- リスクレベルに応じた視覚的差別化（色・アイコン）が実装される

### 2.3 スコープ

#### 含むもの

- リスクレベルデータの定義（security-skill-execution.md準拠）
- PermissionDialog UIへのリスクバッジ追加
- リスクレベル別の色定義（Low=緑, Medium=黄, High=橙, Critical=赤）
- 各ツールの1行セキュリティ影響テキスト
- ユニットテスト・コンポーネントテスト

#### 含まないもの

- リスクレベルの動的変更機能
- リスクレベルに基づく自動拒否ロジック
- PermissionSettingsページへのリスクレベル表示（別タスク）

### 2.4 成果物

| 成果物                     | パス                                                                                      |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| ツールメタデータモジュール | `apps/desktop/src/renderer/components/skill/toolMetadata.ts`                              |
| PermissionDialog修正       | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`                         |
| ユニットテスト             | `apps/desktop/src/renderer/components/skill/__tests__/toolMetadata.test.ts`               |
| コンポーネントテスト       | `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.metadata.test.tsx` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- task-imp-permission-readable-ui-001が完了していること（permissionDescriptions.tsが存在）
- security-skill-execution.mdのALLOWED_TOOLS_WHITELISTが最新であること

### 3.2 依存タスク

| タスクID                            | 状態 | 依存内容                            |
| ----------------------------------- | ---- | ----------------------------------- |
| task-imp-permission-readable-ui-001 | 完了 | permissionDescriptions.tsベース実装 |

### 3.3 必要な知識

- React/TypeScript コンポーネント開発
- Tailwind CSS カラーシステム
- security-skill-execution.md の ALLOWED_TOOLS_WHITELIST 仕様
- permissionDescriptions.ts の getDescription API

### 3.4 推奨アプローチ

1. `toolMetadata.ts`を新規作成し、ツール別リスクレベル・影響テキストを定義
2. PermissionDialogのツールバッジ横にリスクバッジコンポーネントを追加
3. Progressive Disclosureパターンに従い、リスクバッジはコンパクト表示、ホバーで詳細表示

---

## 4. 実行手順

### Phase構成

| Phase | 名称             | 内容                                  |
| ----- | ---------------- | ------------------------------------- |
| 1-3   | 要件定義・設計   | メタデータ構造設計、UIデザイン        |
| 4     | テスト作成       | TDD: toolMetadata、リスクバッジテスト |
| 5     | 実装             | toolMetadata.ts、PermissionDialog修正 |
| 6-9   | テスト拡充・品質 | カバレッジ確認、リファクタリング      |
| 10-12 | レビュー・文書化 | 最終レビュー、仕様書更新              |

### Phase 4-5: テスト・実装

#### 目的

toolMetadata.tsを作成し、PermissionDialogにリスクバッジを統合する。

#### 手順

1. `toolMetadata.ts`を作成: ツール名→リスクレベル・影響テキストのマッピング
2. `getRiskLevel(toolName: string): RiskLevel`関数をエクスポート
3. `getSecurityImpact(toolName: string): string`関数をエクスポート
4. PermissionDialogのツールバッジ横にRiskBadgeコンポーネントを追加
5. Tailwind CSSでリスクレベル別の色定義（bg-green-100, bg-yellow-100, bg-orange-100, bg-red-100）

#### 成果物

- `toolMetadata.ts`（リスクデータ定義）
- `PermissionDialog.tsx`（リスクバッジ統合）
- テストファイル2件

#### 完了条件

- 12種ツール全てにリスクレベルが定義されていること
- PermissionDialogにリスクバッジが表示されること
- 全テストがPASSすること

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 12種ツール全てにリスクレベル（Low/Medium/High/Critical）が定義されている
- [ ] PermissionDialogにリスクレベルバッジが表示される
- [ ] リスクレベルに応じた色分けが適用されている（Low=緑, Medium=黄, High=橙, Critical=赤）
- [ ] 各ツールの1行セキュリティ影響テキストが表示される
- [ ] 未定義ツールに対するデフォルトリスクレベル（Medium）が設定されている

### 品質要件

- [ ] テストカバレッジ Lines 95%以上
- [ ] WCAG 2.1 AAコントラスト比4.5:1以上（リスクバッジテキスト）
- [ ] TypeScript strict modeでエラーなし

### ドキュメント要件

- [ ] ui-ux-agent-execution.mdにリスクバッジ仕様を追記
- [ ] security-skill-execution.mdとの整合性を確認

---

## 6. 検証方法

### テストケース

| #   | テストケース                                   | 期待結果                           |
| --- | ---------------------------------------------- | ---------------------------------- |
| 1   | Bash（Critical）ツールの権限確認ダイアログ表示 | 赤色リスクバッジ「Critical」が表示 |
| 2   | Read（Low）ツールの権限確認ダイアログ表示      | 緑色リスクバッジ「Low」が表示      |
| 3   | 未定義ツールの権限確認ダイアログ表示           | 黄色リスクバッジ「Medium」が表示   |
| 4   | スクリーンリーダーでリスクレベルが読み上げ     | aria-labelにリスクレベルが含まれる |

### 検証手順

1. `pnpm vitest run`で全テストがPASSすることを確認
2. 各リスクレベルのツールでPermissionDialogを目視確認
3. キーボード操作でリスクバッジ情報にアクセスできることを確認

---

## 7. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                          |
| -------------------------------------- | ------ | -------- | --------------------------------------------- |
| リスクレベル定義がsecurity仕様と不整合 | 高     | 低       | security-skill-execution.mdから自動抽出を検討 |
| リスクバッジが視覚的ノイズになる       | 中     | 中       | コンパクトデザイン、ホバー表示を採用          |
| 色覚多様性への対応不足                 | 中     | 中       | 色+テキスト+アイコンの3重表現                 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント               | パス                                                                            |
| -------------------------- | ------------------------------------------------------------------------------- |
| PermissionDialog仕様       | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`    |
| ツール許可ホワイトリスト   | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` |
| permissionDescriptions仕様 | ui-ux-agent-execution.md L192-L244                                              |
| デザイン原則               | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`  |

### 参考資料

- WCAG 2.1 AA カラーコントラスト要件
- Apple HIG: Alerts and Notifications

---

## 9. 備考

### 補足事項

- security-skill-execution.mdのALLOWED_TOOLS_WHITELISTテーブルに定義されている11ツール + permissionDescriptions.tsで追加定義された1ツール（AskUser）を対象とする
- リスクレベルの定義はsecurity-skill-execution.md準拠: Bash=Critical, Write/Edit=High, Read/Glob/Grep=Low, WebSearch/WebFetch=Medium
- Progressive Disclosureパターンに従い、初期表示はバッジのみ、ホバー/クリックで影響説明を表示
