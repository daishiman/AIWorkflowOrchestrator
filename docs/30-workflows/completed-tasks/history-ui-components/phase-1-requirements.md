# Phase 1: 要件定義

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 1                     |
| 機能名 | history-ui-components |
| 作成日 | 2026-01-10            |

## 目的

履歴/ログ表示UIコンポーネントの目的、スコープ、受け入れ基準を明文化する。

## 使用スキル

| スキル                        | 選定理由                                        |
| ----------------------------- | ----------------------------------------------- |
| `acceptance-criteria-writing` | Given-When-Then形式の受け入れ基準を整理するため |

## 参照資料

| 資料名              | パス                                                                                | 説明                   |
| ------------------- | ----------------------------------------------------------------------------------- | ---------------------- |
| 元タスク指示書      | `docs/30-workflows/unassigned-task/task-05-03-history-ui-components.md`             | タスク詳細             |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`             | コンポーネント設計原則 |
| 変換アーキテクチャ  | `.claude/skills/aiworkflow-requirements/references/architecture-file-conversion.md` | 履歴サービス仕様       |
| インターフェース    | `.claude/skills/aiworkflow-requirements/references/interfaces-converter.md`         | IHistoryService型定義  |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                                                   | 内容                    |
| ------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------- |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                | Atomic Design、命名規則 |
| デザインシステム    | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                             | Design Tokens、カラー   |
| アクセシビリティ    | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md#アクセシビリティwcag-21-aa準拠` | WCAG 2.1 AA準拠         |

## 実行手順

### ステップ1: 要件抽出

元タスク指示書から要件を抽出する。

**機能要件（FR）:**

| ID    | 要件                                                |
| ----- | --------------------------------------------------- |
| FR-01 | ファイルIDを指定して履歴一覧を表示できる            |
| FR-02 | 履歴アイテムをクリックして詳細を表示できる          |
| FR-03 | 過去バージョンから現在のファイルを復元できる        |
| FR-04 | 復元前に確認ダイアログを表示する                    |
| FR-05 | 変換ログをレベル（info/warn/error）でフィルタできる |
| FR-06 | 履歴・ログのページネーション（無限スクロール）      |

**非機能要件（NFR）:**

| ID     | 要件                                             |
| ------ | ------------------------------------------------ |
| NFR-01 | キーボード操作で全機能にアクセス可能（WCAG準拠） |
| NFR-02 | ローディング状態を適切に表示する                 |
| NFR-03 | エラー状態を適切に表示する                       |
| NFR-04 | 履歴一覧取得は200ms以内にレスポンスを返す        |

### ステップ2: 受け入れ基準作成

`acceptance-criteria-writing`スキルを使用して、各要件の受け入れ基準を定義する。

**FR-01: 履歴一覧表示**

```gherkin
Feature: バージョン履歴一覧表示

Scenario: 履歴一覧を表示する
  Given ファイルID "file-123" が存在する
  When VersionHistoryコンポーネントにfileIdを渡す
  Then 履歴アイテムが時系列順（新しい順）で表示される
  And 各アイテムにバージョン番号、作成日時、サイズが表示される

Scenario: 現在のバージョンにラベルを表示する
  Given ファイルに複数のバージョンがある
  When 履歴一覧を表示する
  Then 最新バージョンに「現在」ラベルが表示される
  And 最新バージョンには復元ボタンが表示されない

Scenario: 履歴が空の場合
  Given ファイルに履歴がない
  When 履歴一覧を表示する
  Then 「履歴がありません」というメッセージが表示される
```

**FR-02: バージョン詳細表示**

```gherkin
Feature: バージョン詳細表示

Scenario: 履歴アイテムの詳細を表示する
  Given 履歴一覧が表示されている
  When 履歴アイテムをクリックする
  Then 選択したバージョンの詳細情報が表示される
  And バージョンID、作成日時、MIME形式、サイズ、ハッシュが表示される

Scenario: メタデータがある場合
  Given バージョンにメタデータが設定されている
  When 詳細を表示する
  Then メタデータがJSON形式で表示される
```

**FR-03/FR-04: 復元操作**

```gherkin
Feature: バージョン復元

Scenario: 復元確認ダイアログを表示する
  Given 過去バージョンの詳細が表示されている
  When 「このバージョンに復元」ボタンをクリックする
  Then 復元確認ダイアログが表示される
  And 復元対象のバージョン情報が表示される

Scenario: 復元を実行する
  Given 復元確認ダイアログが表示されている
  When 「復元する」ボタンをクリックする
  Then 復元処理が実行される
  And 復元中はボタンがdisabledになる
  And 復元完了後にダイアログが閉じる

Scenario: 復元をキャンセルする
  Given 復元確認ダイアログが表示されている
  When 「キャンセル」ボタンをクリックする
  Then ダイアログが閉じる
  And 復元処理は実行されない
```

**FR-05: ログフィルタリング**

```gherkin
Feature: 変換ログ表示

Scenario: ログ一覧を表示する
  Given ファイルに変換ログがある
  When ConversionLogsコンポーネントにfileIdを渡す
  Then ログ一覧が時系列順（新しい順）で表示される
  And 各ログにレベル、メッセージ、タイムスタンプが表示される

Scenario: レベルでフィルタリングする
  Given ログ一覧が表示されている
  When フィルタを「Error」に設定する
  Then errorレベルのログのみ表示される

Scenario: ログの詳細を展開する
  Given ログにdetailsがある
  When 「詳細を表示」をクリックする
  Then detailsがJSON形式で表示される
```

**FR-06: ページネーション**

```gherkin
Feature: ページネーション

Scenario: さらに読み込む
  Given 履歴が20件以上ある
  When 「さらに読み込む」ボタンをクリックする
  Then 次の20件が追加で表示される
  And 既存のアイテムは保持される

Scenario: すべて読み込み済み
  Given すべての履歴を読み込んだ
  Then 「さらに読み込む」ボタンは表示されない
```

### ステップ3: スコープ定義

**スコープ内:**

- VersionHistoryコンポーネント（履歴一覧）
- VersionDetailコンポーネント（バージョン詳細）
- ConversionLogsコンポーネント（ログ一覧）
- RestoreDialogコンポーネント（復元確認）
- useVersionHistoryフック（履歴データ取得）
- useConversionLogsフック（ログデータ取得）
- 各コンポーネント・フックのユニットテスト

**スコープ外:**

- 実際の復元処理のバックエンド実装（既存サービスを使用）
- ログのエクスポート機能
- 履歴の検索機能
- バージョン間の差分表示機能

## 統合テスト連携【必須】

接続要件（API/認証/データフロー）を要件に明記する:

| 接続要件カテゴリ | 記載内容                                            |
| ---------------- | --------------------------------------------------- |
| API接続          | IPC経由でhistoryService.getFileHistory()を呼び出し  |
| 認証フロー       | 認証不要（ローカルデータへのアクセス）              |
| データフロー     | Renderer → IPC → historyService → SQLite → 結果返却 |

## 成果物

| 成果物       | パス                                         | 説明             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲         |

## 完了条件

- [ ] 全要件が抽出されている（FR-01〜FR-06, NFR-01〜NFR-04）
- [ ] 各要件にGiven-When-Then形式の受け入れ基準がある
- [ ] FR/NFRが分類されている
- [ ] スコープ内/外が明確に定義されている
- [ ] 接続要件（API/認証/データフロー）が明記されている
- [ ] **本Phase内の全スキルを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. acceptance-criteria-writingスキルの実行
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/history-ui-components --phase 1
```

## 次のPhase

Phase 2: 設計
