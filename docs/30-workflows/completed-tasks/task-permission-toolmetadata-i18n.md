# toolMetadata セキュリティ影響テキスト国際化 - タスク指示書

## メタ情報

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | task-permission-toolmetadata-i18n                            |
| タスク名     | toolMetadataセキュリティ影響テキストの国際化対応             |
| 分類         | 改善                                                         |
| 対象機能     | toolMetadata / PermissionDialog                              |
| 優先度       | 低                                                           |
| 見積もり規模 | 中規模                                                       |
| ステータス   | 未実施                                                       |
| 発見元       | Phase 12（task-imp-permission-tool-metadata-001）仕様Gap分析 |
| 発見日       | 2026-02-01                                                   |
| issue_number | 627                                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

task-imp-permission-tool-metadata-001で実装したtoolMetadata.tsのsecurityImpact文字列（例: "システムコマンドを実行します。任意のコード実行が可能です"）は日本語のみで定義されている。アプリケーション全体でi18n対応が進む中（task-i18n-app-wide-expansion等の未タスクあり）、セキュリティ関連テキストも国際化対象にする必要がある。

### 1.2 問題点・課題

- securityImpactテキスト12件が日本語ハードコードされている
- DEFAULT_METADATAのsecurityImpactも日本語のみ
- 英語環境のユーザーにはセキュリティ影響を理解できない

### 1.3 放置した場合の影響

- 日本語環境以外でのUXが低下
- アプリ全体のi18n対応完了時にtoolMetadataだけ取り残される
- 影響度は低い（現時点では日本語ユーザーが主対象）

---

## 2. 何を達成するか（What）

### 2.1 目的

toolMetadata.tsのsecurityImpactテキストをi18nシステムと統合し、ユーザーのロケールに応じた言語で表示する。

### 2.2 最終ゴール

- securityImpactテキストがi18n翻訳キーを使用して取得される
- 日本語・英語の翻訳ファイルが作成される
- PermissionDialogでのセキュリティ影響表示が多言語対応

### 2.3 スコープ

#### 含むもの

- toolMetadata.tsのsecurityImpact文字列をi18n翻訳キーに変換
- 日本語・英語の翻訳JSONファイル作成
- getSecurityImpact関数のi18n対応
- ユニットテスト

#### 含まないもの

- リスクレベル名（Low/Medium/High/Critical）の翻訳（英語のまま維持）
- アプリ全体のi18n基盤構築（別タスク: task-i18n-app-wide-expansion）
- 3言語以上の翻訳（日本語・英語のみ）

### 2.4 成果物

- toolMetadata.ts修正（i18n翻訳キー統合）
- 翻訳ファイル（ja.json, en.json）のtoolMetadataセクション
- テスト更新

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- task-imp-permission-tool-metadata-001が完了していること（完了済み）
- アプリケーションのi18n基盤（react-i18nextまたは類似ライブラリ）が使用可能であること

### 3.2 依存タスク

- task-imp-permission-tool-metadata-001（完了済み）
- task-i18n-app-wide-expansion（i18n基盤が未構築の場合はブロッカー）

### 3.3 必要な知識

- TypeScript
- react-i18next（またはプロジェクトのi18nライブラリ）
- 翻訳ファイル管理

### 3.4 推奨アプローチ

1. 既存のi18n基盤を確認（formatRelativeTime等で先行実装あり）
2. toolMetadataセクションの翻訳キー設計
3. getSecurityImpact関数をi18n対応に変更
4. 翻訳ファイルに12ツール+デフォルトの翻訳を追加
5. TDDで実装

---

## 4. 実行手順

### Phase構成

Phase 1-12の標準タスクフローに従う（task-specification-creatorスキル準拠）。

### 主要作業

1. 翻訳キー設計: `toolMetadata.bash.securityImpact`, `toolMetadata.read.securityImpact` 等
2. ja.json・en.jsonに翻訳エントリ追加
3. getSecurityImpact関数にt()関数（i18n翻訳関数）を統合
4. テスト更新（ロケール切り替えテスト含む）

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 日本語ロケールでsecurityImpactが日本語で表示される
- [ ] 英語ロケールでsecurityImpactが英語で表示される
- [ ] 翻訳キーが見つからない場合のフォールバック（日本語）が機能する

### 品質要件

- [ ] 既存テスト（258テスト）が全てPASS
- [ ] ロケール切り替えテストが追加されている

### ドキュメント要件

- [ ] ui-ux-agent-execution.mdにi18n対応を記載
- [ ] 翻訳キー一覧ドキュメント

---

## 6. 検証方法

### テストケース

- 日本語ロケール: "システムコマンドを実行します..." が表示される
- 英語ロケール: "Executes system commands..." が表示される
- 未知ロケール: 日本語フォールバック
- 各ツール（12件+デフォルト）の翻訳が正しく取得できる

### 検証手順

1. ユニットテスト実行
2. ロケール切り替え後のPermissionDialog表示確認

---

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                               |
| ------------------------ | ------ | -------- | ---------------------------------- |
| i18n基盤が未構築         | 高     | 中       | task-i18n-app-wide-expansionを先行 |
| 翻訳品質の不統一         | 低     | 中       | 翻訳レビュー実施                   |
| テスト環境のロケール設定 | 低     | 低       | テスト内でモック化                 |

---

## 8. 参照情報

### 関連ドキュメント

- toolMetadata実装: `apps/desktop/src/renderer/components/skill/toolMetadata.ts`
- i18n先行実装例: `apps/desktop/src/renderer/components/skill/formatRelativeTime`
- 既存i18n未タスク: `docs/30-workflows/unassigned-task/task-i18n-app-wide-expansion.md`

### 参考資料

- react-i18next公式ドキュメント
- TASK-3-2-B（i18n対応完了タスク、formatRelativeTime locale引数追加）

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
ui-ux-agent-execution.md v1.7.0の12ツール定義テーブルで、securityImpactが全て日本語であることを確認。
アプリ全体のi18n戦略に合わせて対応が必要。
```

### 補足事項

task-i18n-app-wide-expansionでi18n基盤が構築された後に実行するのが効率的。単独実行する場合はi18n基盤の最小構成が必要。
