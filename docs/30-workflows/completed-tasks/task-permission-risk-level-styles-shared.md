# RISK_LEVEL_STYLES 共有モジュール化 - タスク指示書

## メタ情報

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | task-permission-risk-level-styles-shared                     |
| タスク名     | RISK_LEVEL_STYLES定数の共有モジュール抽出                    |
| 分類         | リファクタリング                                             |
| 対象機能     | PermissionDialog / toolMetadata                              |
| 優先度       | 低                                                           |
| 見積もり規模 | 小規模                                                       |
| ステータス   | 未実施                                                       |
| 発見元       | Phase 12（task-imp-permission-tool-metadata-001）仕様Gap分析 |
| 発見日       | 2026-02-01                                                   |
| issue_number | 625                                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

task-imp-permission-tool-metadata-001で実装したRISK_LEVEL_STYLES定数は、現在PermissionDialog.tsx内にのみ定義されている。task-permission-settings-risk-displayタスクでPermissionSettings画面にもリスクレベル表示を追加する予定があり、RISK_LEVEL_STYLESの再利用が必要になる。現状ではコンポーネント間でスタイルが重複定義される。

### 1.2 問題点・課題

- RISK_LEVEL_STYLESがPermissionDialog.tsx内にローカル定義されている
- 同じリスクレベルスタイルを別コンポーネントで使用する場合、重複定義が必要
- スタイル変更時に複数箇所の修正が必要になる（DRY原則違反）

### 1.3 放置した場合の影響

- task-permission-settings-risk-displayタスク実行時にスタイル重複が発生
- リスクレベルカラーの変更が複数ファイルに影響
- 影響度は低い（現時点ではPermissionDialogのみが使用）

---

## 2. 何を達成するか（What）

### 2.1 目的

RISK_LEVEL_STYLESをtoolMetadata.tsモジュールに移動し、複数コンポーネントから共有可能にする。

### 2.2 最終ゴール

- RISK_LEVEL_STYLESがtoolMetadata.tsからエクスポートされる
- PermissionDialog.tsxがtoolMetadata.tsからRISK_LEVEL_STYLESをインポートする
- 型定義（RiskLevelStyle型）がエクスポートされる
- 既存の表示が変わらない

### 2.3 スコープ

#### 含むもの

- RISK_LEVEL_STYLES定数のtoolMetadata.tsへの移動
- RiskLevelStyle型定義の追加
- PermissionDialog.tsxのインポート変更
- ユニットテスト更新

#### 含まないもの

- スタイル値の変更（移動のみ）
- PermissionSettings画面での使用（別タスク: task-permission-settings-risk-display）
- ダークモード対応（別タスク: task-imp-permission-dark-mode-001）

### 2.4 成果物

- toolMetadata.ts修正（RISK_LEVEL_STYLES + RiskLevelStyle型エクスポート追加）
- PermissionDialog.tsx修正（ローカル定義削除、インポートに変更）
- テスト更新

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- task-imp-permission-tool-metadata-001が完了していること（完了済み）
- toolMetadata.tsの公開APIを理解していること

### 3.2 依存タスク

- task-imp-permission-tool-metadata-001（完了済み）

### 3.3 必要な知識

- TypeScript（型エクスポート、Record型）
- React（コンポーネント間の定数共有パターン）
- Tailwind CSS（スタイルクラス）

### 3.4 推奨アプローチ

1. RiskLevelStyle型を定義: `{ bg: string; text: string; border: string }`
2. RISK_LEVEL_STYLESをtoolMetadata.tsに移動しエクスポート
3. PermissionDialog.tsxからローカル定義を削除、インポートに変更
4. 既存テストが全てPASSすることを確認

---

## 4. 実行手順

### Phase構成

Phase 1-12の標準タスクフローに従う（task-specification-creatorスキル準拠）。小規模リファクタリングのためPhase構成は簡略化可能。

### 主要作業

1. toolMetadata.tsにRiskLevelStyle型とRISK_LEVEL_STYLES定数を追加
2. PermissionDialog.tsxからRISK_LEVEL_STYLESローカル定義を削除
3. PermissionDialog.tsxにインポート文を追加
4. テスト実行で既存動作の維持を確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] RISK_LEVEL_STYLESがtoolMetadata.tsからエクスポートされている
- [ ] RiskLevelStyle型がエクスポートされている
- [ ] PermissionDialog.tsxにローカルのRISK_LEVEL_STYLES定義がない
- [ ] PermissionDialogの表示が変わらない（リグレッションなし）

### 品質要件

- [ ] 既存テスト（258テスト）が全てPASS
- [ ] WCAG 2.1 AAのコントラスト比が維持されている

### ドキュメント要件

- [ ] interfaces-agent-sdk-ui.mdにRISK_LEVEL_STYLESのエクスポート元変更を反映
- [ ] ui-ux-agent-execution.mdの定数定義箇所を更新

---

## 6. 検証方法

### テストケース

- toolMetadata.tsからRISK_LEVEL_STYLESがインポートできる
- 全4リスクレベル（Low/Medium/High/Critical）のスタイルが取得できる
- PermissionDialogのリスクバッジ表示が既存と同一

### 検証手順

1. ユニットテスト実行（toolMetadata.test.ts、PermissionDialog.metadata.test.tsx）
2. PermissionDialog表示の目視確認

---

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                           |
| ------------------------------------ | ------ | -------- | ------------------------------ |
| インポートパス変更によるビルドエラー | 低     | 低       | TypeScript型チェックで検出可能 |
| テストの参照先変更漏れ               | 低     | 低       | 全テスト実行で検出             |

---

## 8. 参照情報

### 関連ドキュメント

- toolMetadata実装: `apps/desktop/src/renderer/components/skill/toolMetadata.ts`
- PermissionDialog実装: `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`
- インターフェース仕様: `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`
- UI仕様: `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
interfaces-agent-sdk-ui.md v1.5.0にRISK_LEVEL_STYLES定数仕様を追加した際、
PermissionDialog.tsx内のローカル定義のみで他コンポーネントからアクセス不可であることを確認。
task-permission-settings-risk-displayの前提タスクとして必要。
```

### 補足事項

task-permission-settings-risk-displayの前にこのタスクを実行することで、スタイル重複を防げる。ただし、task-permission-settings-risk-displayが不要と判断された場合はこのタスクの優先度も再評価すること。
