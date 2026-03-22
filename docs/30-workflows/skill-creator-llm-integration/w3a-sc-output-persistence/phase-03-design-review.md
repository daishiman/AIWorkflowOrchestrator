# Phase 3: 設計レビュー

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 3                             |
| タスクID | TASK-SC-04-OUTPUT-PERSISTENCE |
| 作成日   | 2026-03-22                    |

## 目的

Phase 2 で作成した SkillFileWriter 設計の妥当性を多角的に検証する。特にファイル書き込みのアトミック性とパストラバーサル防止が正しく設計されているかを判定する。

## 実行タスク

1. **要件適合性チェック**
   - AC-2（.claude/skills/ 配下にファイル永続化）を設計が充足できるか確認する
   - FR-2 の機能要件と設計の対応を確認する
2. **アトミック性検証**
   - ストリーム完了後一括書き込みがアトミック性を保証できるか評価する
   - 途中失敗（例: SKILL.md 書き込み後に agents/ 書き込みで失敗）時のロールバック方式を評価する
   - 部分書き込みが `.claude/skills/` に残らないことを設計で保証できるか確認する
3. **パストラバーサル防止確認**
   - `validateSkillName()` が以下のパターンを全て拒否することを設計で確認する
     - `../malicious` （親ディレクトリ参照）
     - `/absolute/path`（絶対パス）
     - `a/b` （サブディレクトリ）
     - `  ` （トリム後空文字列: P42 対策）
   - `path.resolve()` + ベースパスのプレフィックス確認を設計に含めるよう評価する
4. **型安全性確認**
   - SkillGeneratedContent 型が execute() の出力型と整合するか確認する
   - P32（型定義の2箇所同時更新必須）を適用し、shared と desktop の両方で型が整合するか確認する
5. **セキュリティ確認**
   - ファイルパーミッション（600 等）の設定要否を評価する
   - 書き込み先が `.claude/skills/` の外に出ないことを設計で保証できるか確認する
6. 判定を記録し、MINOR 指摘は未タスク化する

## 参照資料

- `docs/30-workflows/skill-creator-llm-integration/04-phase-02-design.md`（前 Phase 成果物）
- `.claude/rules/04-electron-security.md`（セキュリティ原則）
- `.claude/rules/06-known-pitfalls.md`（P32, P42）

## 成果物

- `docs/30-workflows/skill-creator-llm-integration/04-phase-03-review-output.md`（レビュー結果）
  - 判定: PASS / MINOR / MAJOR
  - 指摘事項リスト（MINOR は未タスク化必須）

## 完了条件

- [ ] AC-2 / FR-2 との適合性を確認した
- [ ] アトミック書き込みのロールバック方式を評価した
- [ ] パストラバーサル防止パターン（4種類以上）を設計で検証した
- [ ] SkillGeneratedContent 型と execute() 出力型の整合を確認した（P32 対策）
- [ ] 書き込み先が basePath の外に出ないことを設計で保証することを確認した
- [ ] 判定（PASS / MINOR / MAJOR）を記録した
- [ ] MINOR 指摘がある場合は未タスク化した

## 次のPhase

Phase 4: テスト作成
