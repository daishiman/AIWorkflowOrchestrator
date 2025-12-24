# ファイル変換エンジン - タスク指示書

## メタ情報

| 項目             | 内容                 |
| ---------------- | -------------------- |
| タスクID         | CONV-02              |
| タスク名         | ファイル変換エンジン |
| 分類             | 要件/新規機能        |
| 対象機能         | ファイル変換システム |
| 優先度           | 高                   |
| 見積もり規模     | 大規模               |
| ステータス       | 未実施               |
| 発見元           | 初期要件定義         |
| 発見日           | 2025-12-15           |
| 発見エージェント | .claude/agents/req-analyst.md         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

ユーザーが選択したファイルを指定のフォーマット（JSON等）に変換する処理が必要。ファイル変換はシステムのコア機能であり、様々なファイル形式に対応する拡張性が求められる。

### 1.2 問題点・課題

- 複数のファイル形式（テキスト、Markdown、CSV等）からの変換が必要
- 変換処理のパフォーマンスと正確性の両立
- エラーハンドリングと部分的な変換失敗への対応
- 変換ルールの拡張性・カスタマイズ性の確保

### 1.3 放置した場合の影響

- ファイルをデータベースに保存できない
- システムの主要機能が実現できない
- 後続のバージョン管理・履歴管理が意味をなさない

---

## 2. 何を達成するか（What）

### 2.1 目的

ファイルの内容を読み込み、標準化されたJSON形式に変換するエンジンを実装する。

### 2.2 最終ゴール

- 複数のファイル形式に対応した変換エンジン
- プラグイン形式で変換ルールを追加可能な設計
- 変換結果の検証機能
- 変換メタデータ（元ファイル情報、変換日時等）の付与

### 2.3 スコープ

#### 含むもの

- 変換エンジンのコアロジック
- ファイル読み込み処理
- 対応形式：テキスト、Markdown、JSON、CSV（初期対応）
- 変換結果のバリデーション
- 変換メタデータの生成
- エラーハンドリング

#### 含まないもの

- データベースへの保存（CONV-04で対応）
- UI表示（別タスク）
- バイナリファイルの変換

### 2.4 成果物

- `packages/shared/src/services/file-converter/` - 変換エンジンコアモジュール
- `packages/shared/src/services/file-converter/converters/` - 各形式のコンバーター
- `packages/shared/src/services/file-converter/types.ts` - 型定義
- `packages/shared/src/services/file-converter/validators/` - バリデーター
- ユニットテスト一式

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- ファイル選択機能（CONV-01）が完成済み
- JSONスキーマ定義（CONV-03）が完成済み（並行可）
- TypeScript環境がセットアップ済み

### 3.2 依存タスク

- CONV-01: ファイル選択機能（ファイル情報の取得）
- CONV-03: JSONスキーマ定義（変換先の形式定義）※並行実装可

### 3.3 必要な知識・スキル

- TypeScript
- ファイルI/O処理
- パーサー設計（Markdown、CSV等）
- Strategy パターン（変換ルールの切り替え）
- Factory パターン（コンバーターの生成）

### 3.4 推奨アプローチ

1. 変換結果のインターフェースを先に定義（CONV-03と連携）
2. Strategy パターンでコンバーターを設計
3. Factory パターンでファイル形式に応じたコンバーター生成
4. TDDで各コンバーターを実装
5. バリデーション層を追加

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義 → Phase 1: 設計 → Phase 2: 設計レビュー →
Phase 3: テスト作成 → Phase 4: 実装 → Phase 5: リファクタリング →
Phase 6: 品質保証 → Phase 7: 最終レビュー → Phase 8: 手動テスト
```

### Phase 0: 要件定義

#### 目的

変換エンジンの詳細要件・対応形式・変換ルールを明確化する。

#### Claude Code スラッシュコマンド

```
/ai:gather-requirements file-conversion-engine
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/req-analyst.md
- **選定理由**: 機能要件の詳細化、対応形式の洗い出しに適任
- **代替候補**: .claude/agents/spec-writer.md（仕様書作成が主目的の場合）
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名                               | 活用方法                           | 選定理由           |
| -------------------------------------- | ---------------------------------- | ------------------ |
| .claude/skills/functional-non-functional-requirements/SKILL.md | 変換精度・パフォーマンス要件の定義 | 非機能要件の明確化 |
| .claude/skills/interface-segregation/SKILL.md                  | コンバーターインターフェースの設計 | 拡張性の確保       |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- 変換要件定義書
- 対応ファイル形式一覧
- 変換ルール仕様

#### 完了条件

- [ ] 対応ファイル形式が決定
- [ ] 各形式の変換ルールが定義
- [ ] エラーケースが洗い出されている

---

### Phase 1: 設計

#### 目的

変換エンジンのアーキテクチャ・コンポーネント設計を行う。

#### Claude Code スラッシュコマンド

```
/ai:design-architecture file-conversion-engine
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/arch-police.md
- **選定理由**: クリーンアーキテクチャに基づいた設計検証
- **代替候補**: .claude/agents/logic-dev.md（ビジネスロジック設計が中心の場合）
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名               | 活用方法                | 選定理由               |
| ---------------------- | ----------------------- | ---------------------- |
| .claude/skills/solid-principles/SKILL.md       | SOLID原則に基づく設計   | 保守性・拡張性の確保   |
| .claude/skills/factory-patterns/SKILL.md       | コンバーター生成の設計  | 形式に応じた動的生成   |
| .claude/skills/architectural-patterns/SKILL.md | Strategy パターンの適用 | 変換ロジックの切り替え |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- アーキテクチャ設計書
- クラス図・シーケンス図
- インターフェース定義

#### 完了条件

- [ ] コンバーターインターフェースが定義
- [ ] Factory パターンの設計が完了
- [ ] エラーハンドリング戦略が決定

---

### Phase 3: テスト作成 (TDD: Red)

#### 目的

変換エンジンの各コンポーネントのテストを実装より先に作成する。

#### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests packages/shared/src/services/file-converter/converter-factory.ts
/ai:generate-unit-tests packages/shared/src/services/file-converter/converters/text-converter.ts
/ai:generate-unit-tests packages/shared/src/services/file-converter/converters/markdown-converter.ts
/ai:generate-unit-tests packages/shared/src/services/file-converter/converters/csv-converter.ts
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/unit-tester.md
- **選定理由**: ユニットテストの設計・実装に特化
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名                | 活用方法                   | 選定理由                 |
| ----------------------- | -------------------------- | ------------------------ |
| .claude/skills/test-doubles/SKILL.md            | 各コンバーターのモック作成 | 依存関係の分離           |
| .claude/skills/boundary-value-analysis/SKILL.md | エッジケースのテスト設計   | 変換境界値の検証         |
| .claude/skills/test-data-management/SKILL.md    | テストデータの管理         | 各形式のサンプルファイル |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- `packages/shared/src/services/file-converter/__tests__/` 配下のテストファイル

#### 完了条件

- [ ] 各コンバーターのテストが作成済み
- [ ] テストが失敗すること（Red状態）を確認

---

### Phase 4: 実装 (TDD: Green)

#### 目的

テストを通すための最小限の実装を行う。

#### Claude Code スラッシュコマンド

```
/ai:implement-business-logic file-converter-core
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/logic-dev.md
- **選定理由**: ビジネスロジック・変換ロジックの実装に特化
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名             | 活用方法           | 選定理由         |
| -------------------- | ------------------ | ---------------- |
| .claude/skills/type-safety-patterns/SKILL.md | 型安全な変換処理   | 実行時エラー防止 |
| .claude/skills/clean-code-practices/SKILL.md | 可読性の高いコード | 保守性の確保     |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- 変換エンジン実装コード一式

#### 完了条件

- [ ] テストが成功すること（Green状態）を確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] テキストファイルの変換が正常に動作
- [ ] Markdownファイルの変換が正常に動作
- [ ] JSONファイルの変換（検証）が正常に動作
- [ ] CSVファイルの変換が正常に動作
- [ ] 未対応形式に対するエラーハンドリング
- [ ] 変換メタデータが正しく生成される

### 品質要件

- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] テストカバレッジ80%以上
- [ ] 1MBファイルの変換が5秒以内

### ドキュメント要件

- [ ] 各コンバーターのJSDocが記述されている
- [ ] 新規コンバーター追加手順が文書化されている

---

## 6. 検証方法

### テストケース

1. 各ファイル形式の正常変換
2. 空ファイルの変換
3. 大容量ファイル（1MB）の変換
4. 不正な形式のファイル
5. エンコーディングが異なるファイル（UTF-8、Shift_JIS等）
6. 特殊文字を含むファイル

### 検証手順

1. `pnpm --filter @repo/shared test:run` でユニットテスト実行
2. 各形式のサンプルファイルで手動変換テスト
3. パフォーマンステスト（大容量ファイル）

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                               |
| ---------------------------- | ------ | -------- | ---------------------------------- |
| 大容量ファイルでのメモリ不足 | 高     | 中       | ストリーミング処理の導入           |
| エンコーディング判定ミス     | 中     | 中       | charset検出ライブラリの使用        |
| Markdownパーサーの互換性問題 | 中     | 低       | 標準的なパーサー（marked等）の使用 |
| 変換ルールの複雑化           | 中     | 中       | プラグインアーキテクチャの採用     |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/00-requirements/master_system_design.md`
- `docs/00-requirements/05-architecture.md`
- CONV-03: JSONスキーマ定義（変換先形式）

### 参考資料

- marked: https://marked.js.org/
- csv-parse: https://csv.js.org/parse/
- chardet: https://github.com/runk/node-chardet

---

## 9. 備考

### 補足事項

- 新しいファイル形式への対応は、プラグイン形式で追加可能な設計とする
- バイナリファイル（PDF、Word等）の対応は将来的な拡張として検討
- CONV-03（JSONスキーマ定義）と並行して実装可能
