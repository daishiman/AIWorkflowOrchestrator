# Phase 2: 設計

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 2                             |
| タスクID | TASK-SC-04-OUTPUT-PERSISTENCE |
| 作成日   | 2026-03-22                    |

## 目的

SkillFileWriter クラスの詳細設計、SkillGeneratedContent 型定義、execute() からの呼び出しフロー（ストリーム完了後一括書き込み）、既存ファイル上書き防止設計を確定する。

## 実行タスク

1. **SkillFileWriter クラス設計**
   - クラス責務: `.claude/skills/{skillName}/` 配下にスキルファイルを書き込む
   - コンストラクタ: `basePath: string`（スキルのベースディレクトリ）を受け取る
   - `persist(skillName: string, content: SkillGeneratedContent): Promise<{ skillPath: string; files: string[] }>` メソッドを設計する
   - 内部メソッド設計:
     - `validateSkillName(skillName: string): void`（パストラバーサル防止）
     - `checkExistingSkill(skillPath: string): Promise<void>`（上書き防止）
     - `writeFiles(skillPath: string, content: SkillGeneratedContent): Promise<string[]>`（アトミック書き込み）
2. **SkillGeneratedContent 型定義**
   ```typescript
   interface SkillGeneratedContent {
     skillMd: string;
     agents: Array<{ name: string; content: string }>;
     scripts: Array<{ name: string; content: string }>;
     references: Array<{ name: string; content: string }>;
   }
   ```
3. **execute() からの呼び出しフロー設計**
   - ストリーミング完了後に一括書き込みを行う設計とする
   - ストリーム途中での部分書き込みを禁止する（アトミック性確保: P43 M-2 対処）
   - 書き込み失敗時は SkillExecutionResponse のエラーとして返す
4. **既存ファイル上書き防止設計**
   - 同名スキルが既に存在する場合は `{ code: "SKILL_ALREADY_EXISTS" }` エラーを返す
   - 上書きを許可するオプション（`overwrite?: boolean`）を設計する
5. **パストラバーサル防止設計**
   - skillName が `../` `./` `/` を含む場合は即座に拒否する
   - P42 準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）を適用する
6. 設計ドキュメントを作成する

## 参照資料

- `docs/30-workflows/skill-creator-llm-integration/04-phase-01-requirements.md`（前 Phase 成果物）
- `.claude/rules/04-electron-security.md`（IPC セキュリティ原則 / パストラバーサル）
- `.claude/rules/06-known-pitfalls.md`（P42 バリデーション）

## 成果物

- `docs/30-workflows/skill-creator-llm-integration/04-phase-02-design-output.md`（設計書）
  - SkillFileWriter クラス図
  - SkillGeneratedContent 型定義（完全版）
  - execute() 呼び出しフロー図
  - パストラバーサル防止ロジック詳細

## 完了条件

- [ ] SkillFileWriter の全メソッドシグネチャを設計した
- [ ] SkillGeneratedContent 型の全フィールドを定義した
- [ ] execute() からの呼び出しフロー（ストリーム完了後一括書き込み）を設計した
- [ ] 既存ファイル上書き防止ロジックを設計した
- [ ] パストラバーサル防止ロジック（P42 準拠3段バリデーション）を設計した
- [ ] アトミック書き込み（失敗時ロールバック）の方式を設計した

## 次のPhase

Phase 3: 設計レビュー
