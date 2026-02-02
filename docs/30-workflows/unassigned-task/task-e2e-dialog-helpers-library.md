# E2Eテストヘルパー関数ライブラリ化 - タスク指示書

## メタ情報

```yaml
issue_number: 673
```

## メタ情報

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| タスクID     | task-e2e-dialog-helpers-library-001 |
| タスク名     | E2Eテストヘルパー関数ライブラリ化   |
| 分類         | リファクタリング                    |
| 対象機能     | E2Eテスト / テストユーティリティ    |
| 優先度       | 低                                  |
| 見積もり規模 | 小規模                              |
| ステータス   | 未実施                              |
| 発見元       | Phase 12 システム仕様書更新         |
| 発見日       | 2026-02-02                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-8C-D（E2E権限ダイアログテスト）で6つのヘルパー関数が実装された:

- `selectSkill()`
- `triggerPermissionDialog()`
- `waitForPermissionDialog()`
- `approvePermission()`
- `denyPermission()`
- `checkRememberChoice()`

これらはskill-permission.spec.ts内にインラインで定義されており、他のE2Eテストで再利用できない状態。

### 1.2 問題点・課題

| 項目               | 現状                         | 課題                     |
| ------------------ | ---------------------------- | ------------------------ |
| コード重複         | 各spec.tsでヘルパー再定義    | DRY原則違反              |
| 保守性             | 変更時に複数ファイル修正必要 | メンテナンスコスト高     |
| 発見可能性         | ヘルパーの存在が不明確       | 新規テスト作成時に再発明 |
| テストパターン統一 | 開発者ごとに異なる実装       | 一貫性欠如               |

### 1.3 放置した場合の影響

- E2Eテスト追加時にヘルパー関数の重複実装が発生
- ダイアログ操作のUIが変更された場合、複数ファイルの修正が必要
- テストコードの品質にばらつきが生じる

---

## 2. 何を達成するか（What）

### 2.1 目的

E2Eテスト用ヘルパー関数を共有ライブラリとして抽出し、再利用可能にする。

### 2.2 最終ゴール

- `apps/desktop/e2e/helpers/` ディレクトリにヘルパー関数を配置
- 既存テストが新しいヘルパーを使用するようリファクタリング
- testing-playwright-e2e.mdにヘルパー関数の使用ガイドを追加

### 2.3 スコープ

#### 含むもの

- ダイアログ操作ヘルパー（permission-dialog-helpers.ts）
- スキル選択ヘルパー（skill-helpers.ts）
- 共通待機ヘルパー（wait-helpers.ts）
- 既存skill-permission.spec.tsのリファクタリング

#### 含まないもの

- 新規E2Eテストの作成
- ユニットテスト・コンポーネントテストのヘルパー
- Page Object Modelへの移行（大規模リファクタリング）

### 2.4 成果物

| 成果物                         | 配置先                                             |
| ------------------------------ | -------------------------------------------------- |
| permission-dialog-helpers.ts   | apps/desktop/e2e/helpers/                          |
| skill-helpers.ts               | apps/desktop/e2e/helpers/                          |
| wait-helpers.ts                | apps/desktop/e2e/helpers/                          |
| index.ts（バレルエクスポート） | apps/desktop/e2e/helpers/                          |
| skill-permission.spec.ts更新   | apps/desktop/e2e/                                  |
| testing-playwright-e2e.md更新  | .claude/skills/aiworkflow-requirements/references/ |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-8C-D（E2E権限ダイアログテスト）が完了していること
- apps/desktop/e2e/skill-permission.spec.tsが存在すること
- testing-playwright-e2e.md v1.0.0が存在すること

### 3.2 依存タスク

| タスクID  | タスク名                         | 状態 |
| --------- | -------------------------------- | ---- |
| TASK-8C-D | E2Eテスト - 権限ダイアログフロー | 完了 |

### 3.3 必要な知識

- TypeScript
- Playwright E2Eテスト
- モジュール設計パターン

### 3.4 システム仕様書参照

| 仕様書                     | 参照セクション               |
| -------------------------- | ---------------------------- |
| testing-playwright-e2e.md  | ヘルパー関数パターン         |
| testing-dialog-patterns.md | ヘルパー関数定義             |
| directory-structure.md     | プロジェクトディレクトリ構造 |

### 3.5 推奨アプローチ

1. 機能別にヘルパーファイルを分割
2. TypeScript型定義を明確にする
3. JSDocコメントで使用方法を文書化
4. 既存テストを段階的にリファクタリング

---

## 4. 実行手順

### Phase構成

| Phase | 名称             | 内容                      |
| ----- | ---------------- | ------------------------- |
| 1     | 要件定義         | ヘルパー関数の分類設計    |
| 2     | 設計             | ディレクトリ構造・API設計 |
| 5     | 実装             | ヘルパーライブラリ作成    |
| 8     | リファクタリング | 既存テストの更新          |
| 12    | ドキュメント更新 | 仕様書更新                |

### Phase 1: 要件定義

#### 目的

抽出するヘルパー関数を分類し、責務を明確にする

#### 手順

1. skill-permission.spec.tsから抽出対象を特定
2. 機能別に分類（ダイアログ操作、スキル操作、待機処理）
3. 共通インターフェースを定義

#### 成果物

- ヘルパー関数分類表

#### 完了条件

- 全ヘルパー関数の責務が明確

### Phase 5: 実装

#### 目的

ヘルパーライブラリを作成する

#### 手順

1. `apps/desktop/e2e/helpers/` ディレクトリ作成
2. permission-dialog-helpers.ts作成
3. skill-helpers.ts作成
4. wait-helpers.ts作成
5. index.ts（バレルファイル）作成

#### 成果物

- ヘルパーライブラリファイル一式

#### 完了条件

- 全ファイルが作成されている
- TypeScriptコンパイルエラーがない

### Phase 8: リファクタリング

#### 目的

既存テストを新しいヘルパーを使用するよう更新

#### 手順

1. skill-permission.spec.tsのインラインヘルパーを削除
2. ヘルパーライブラリからインポート
3. 全テスト実行・PASS確認

#### 成果物

- リファクタリングされたskill-permission.spec.ts

#### 完了条件

- 全テストがPASS
- インラインヘルパー定義がない

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] permission-dialog-helpers.ts作成（6関数）
- [ ] skill-helpers.ts作成
- [ ] wait-helpers.ts作成
- [ ] index.ts（バレルエクスポート）作成
- [ ] 既存テストのリファクタリング完了

### 品質要件

- [ ] 全テストがPASS
- [ ] ESLintエラーなし
- [ ] TypeScriptコンパイルエラーなし
- [ ] JSDocコメント追加

### ドキュメント要件

- [ ] testing-playwright-e2e.md ヘルパー関数セクション更新
- [ ] README.md（helpers/配下）作成

---

## 6. 検証方法

### テストケース

| TC    | 検証内容         | 期待結果                   |
| ----- | ---------------- | -------------------------- |
| TC-H1 | インポートテスト | 全ヘルパーがインポート可能 |
| TC-H2 | 型安全性         | TypeScript型エラーなし     |
| TC-H3 | 既存テスト互換性 | 全12テストがPASS           |

### 検証手順

1. `pnpm --filter @repo/desktop exec playwright test e2e/skill-permission.spec.ts` 実行
2. 全テストPASS確認
3. 新規テストファイルでインポートテスト

---

## 7. リスクと対策

| リスク                    | 影響度 | 発生確率 | 対策                         |
| ------------------------- | ------ | -------- | ---------------------------- |
| 循環依存の発生            | 中     | 低       | バレルファイルで依存管理     |
| テスト実行順序の問題      | 低     | 低       | 各テストの独立性を維持       |
| 将来のAPI変更時の影響範囲 | 中     | 中       | セマンティックバージョニング |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント               | パス                                                                         |
| -------------------------- | ---------------------------------------------------------------------------- |
| Playwright E2E実装パターン | .claude/skills/aiworkflow-requirements/references/testing-playwright-e2e.md  |
| ダイアログテストパターン   | .claude/skills/aiworkflow-requirements/references/testing-dialog-patterns.md |
| E2Eテスト仕様              | .claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md     |

### 参考資料

| 資料                      | URL                                        |
| ------------------------- | ------------------------------------------ |
| Playwright Best Practices | https://playwright.dev/docs/best-practices |
| Page Object Models        | https://playwright.dev/docs/pom            |

---

## 9. 備考

### 発見経緯

aiworkflow-requirements v8.29.0更新時のギャップ分析で検出。testing-dialog-patterns.mdにヘルパー関数が定義されているが、実装はskill-permission.spec.ts内にインライン化されており、ライブラリとして抽出されていないことが判明。

### 補足事項

- Page Object Modelへの完全移行は別タスクとして検討
- 将来的にはインポートダイアログ、エラーダイアログ等のヘルパーも追加予定
- CI/CDパイプラインでのヘルパー品質検証は別タスク
