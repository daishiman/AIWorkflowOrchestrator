# SkillStreamMessage型定義統一 - タスク指示書

## メタ情報

| 項目         | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| タスクID     | task-imp-skillstream-type-unification                  |
| タスク名     | SkillStreamMessage型定義の統一                         |
| 分類         | リファクタリング                                       |
| 対象機能     | skill.ts / skill-execution.ts / setupSkillListeners.ts |
| 優先度       | 中                                                     |
| 見積もり規模 | 小規模                                                 |
| ステータス   | 未実施                                                 |
| 発見元       | コードベースTODO検出（setupSkillListeners.ts:23）      |
| 発見日       | 2026-02-01                                             |
| issue_number | 622                                                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-7D（ChatPanel統合）の実装中に、skill.tsとskill-execution.tsの間でSkillStreamMessage型が競合していることが発見された。setupSkillListeners.ts:23にTODOコメントとして記録されている。現在はas型アサーションで回避しているが、型安全性が損なわれている。

### 1.2 問題点・課題

- skill.tsとskill-execution.tsに同名だが異なるSkillStreamMessage型が定義されている
- setupSkillListeners.tsでas型アサーションによる回避が行われている
- 型の不一致により、ストリーミングメッセージの処理でランタイムエラーのリスクがある
- TypeScriptの型安全性の恩恵を十分に受けられていない

### 1.3 放置した場合の影響

- 型アサーションによる型安全性の低下が継続
- 新しいストリーミングメッセージタイプ追加時に型不整合が拡大
- デバッグ時に型推論が正しく機能しない

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillStreamMessage型を単一の定義に統一し、全ファイルで同一の型を参照するようにする。

### 2.2 最終ゴール

- SkillStreamMessage型が1箇所にのみ定義されている
- 全参照ファイルが同一の型定義をインポートしている
- setupSkillListeners.tsからas型アサーションが除去されている
- TypeScriptの型チェックが--strictモードで通過する

### 2.3 スコープ

#### 含むもの

- SkillStreamMessage型の単一定義化
- 依存ファイルのインポートパス修正
- as型アサーションの除去
- 型チェック確認

#### 含まないもの

- ストリーミングメッセージ処理ロジックの変更
- 新しいメッセージタイプの追加

### 2.4 成果物

- 統一されたSkillStreamMessage型定義（packages/shared/src/types/skill.ts推奨）
- 重複定義の削除
- setupSkillListeners.tsの型アサーション除去
- テスト全件PASS確認

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-7D（ChatPanel統合）が完了していること（完了済み）
- skill.tsとskill-execution.tsの両型定義の差異を理解していること

### 3.2 依存タスク

- TASK-7D（完了済み）

### 3.3 必要な知識

- TypeScript（型定義、型エクスポート、モジュール解決）
- スキルストリーミングアーキテクチャ
- Zustand Store（skillSlice）

### 3.4 推奨アプローチ

1. skill.tsとskill-execution.tsの両SkillStreamMessage型を比較
2. 差異を分析し、統一版の型を設計
3. packages/shared/src/types/skill.tsに統一型を配置
4. 全参照箇所のインポートパスを変更
5. 重複定義を削除
6. as型アサーションを除去
7. TypeScript --strictモードで型チェック

---

## 4. 実行手順

### Phase構成

Phase 1-12の標準タスクフローに従う（task-specification-creatorスキル準拠）。小規模リファクタリングのためPhase構成は簡略化可能。

### 主要作業

1. 型定義の差異分析
2. 統一型をsharedパッケージに作成
3. skill-execution.tsの重複定義削除
4. setupSkillListeners.tsのas型アサーション除去
5. 型チェック・テスト実行

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] SkillStreamMessage型が1箇所にのみ定義されている
- [ ] setupSkillListeners.tsにas型アサーションが存在しない
- [ ] 全ファイルで同一の型定義を参照している

### 品質要件

- [ ] TypeScript --strictモードで型チェックPASS
- [ ] 既存テストが全てPASS
- [ ] as型アサーションが0件（grep確認）

### ドキュメント要件

- [ ] interfaces-agent-sdk-skill.mdにSkillStreamMessage型の単一定義化を反映

---

## 6. 検証方法

### テストケース

- SkillStreamMessage型がsharedパッケージからインポートできる
- setupSkillListeners.tsで型アサーションなしにコンパイルが通る
- ストリーミングメッセージの送受信が正常に動作する

### 検証手順

1. `pnpm typecheck` 実行（全パッケージ）
2. `pnpm vitest run` 実行（全テスト）
3. `grep -rn "as SkillStreamMessage" apps/ packages/` で型アサーション0件確認

---

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                          |
| ------------------------------------ | ------ | -------- | ----------------------------- |
| 型統一でプロパティ不足が判明         | 中     | 中       | union型で全プロパティを網羅   |
| sharedパッケージの循環参照           | 中     | 低       | 型定義のみのファイルで回避    |
| ストリーミング処理のランタイムエラー | 高     | 低       | 全テスト実行+手動テストで確認 |

---

## 8. 参照情報

### 関連ドキュメント

- TODO箇所: `apps/desktop/src/renderer/store/setupSkillListeners.ts:23`
- 型定義1: `packages/shared/src/types/skill.ts`
- 型定義2: `apps/desktop/src/renderer/types/skill-execution.ts`（推定）
- インターフェース仕様: `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- ストリーミング仕様: `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-skill-stream.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
apps/desktop/src/renderer/store/setupSkillListeners.ts:23
// TODO: TASK-7D で型定義を統一 (skill.ts と skill-execution.ts の SkillStreamMessage 型競合)
```

### 補足事項

TASK-7D完了時にas型アサーションで一時回避された技術的負債。型安全性の観点から早期に対応することが望ましい。影響範囲はskillSlice・setupSkillListeners・SkillStreamingViewに限定される。
