# レビューゲート判定基準

> **Progressive Disclosure**
> - 読み込みタイミング: Phase 3（設計レビュー）およびPhase 10（最終レビュー）実行時
> - 読み込み条件: レビュー判定（PASS/MINOR/MAJOR/CRITICAL）と戻り先決定が必要なとき
> - 関連エージェント: agents/generate-unassigned-task.md
> - 関連スキーマ: schemas/unassigned-task.json

レビューゲート（Phase 3: 設計レビュー、Phase 10: 最終レビュー）での判定基準と戻り先ロジックを定義する。

---

## レビュー実行ランナー

### 既定方針

| 項目 | 既定値 | 理由 |
| ---- | ------ | ---- |
| 既定 CLI | `codex` | review task を非対話で実行しやすい |
| Phase 3 / 10 の既定モード | `codex exec` | task specification 本文を直接読ませて判定できる |
| 実装差分 review | `codex review --uncommitted` | git diff を前提に blocker を拾いやすい |
| prompt artifact | `outputs/phase-N/review-prompt.txt` | Claude Code / 他 CLI / AI agent へ同一入力を渡せる |

### 実行ルール

1. Phase 3 と Phase 10 の review task は、原則 `node .claude/skills/task-specification-creator/scripts/run-review-task.js --runner codex` で実行する。
2. shell alias は環境依存で、非対話 shell では反映されないことがある。shared spec と workflow では raw `codex` コマンドを基準にし、必要なら PATH 上の wrapper で吸収する。
3. Claude Code、他 CLI、AI agent を使う場合も、`review-prompt.txt` の中身は変えずに runner だけ差し替える。
4. runner 固有の危険オプションは task spec に埋め込まず、ローカル wrapper または alias で注入する。

### 標準コマンド

```bash
# Task spec を使った設計レビュー
node .claude/skills/task-specification-creator/scripts/run-review-task.js \
  --runner codex \
  --mode exec \
  --task-file docs/30-workflows/{{FEATURE_NAME}}/phase-3-design-review.md \
  --output-prompt docs/30-workflows/{{FEATURE_NAME}}/outputs/phase-3/review-prompt.txt

# 最終 review task spec を codex exec で実行
node .claude/skills/task-specification-creator/scripts/run-review-task.js \
  --runner codex \
  --mode exec \
  --task-file docs/30-workflows/{{FEATURE_NAME}}/phase-10-final-review.md \
  --output-prompt docs/30-workflows/{{FEATURE_NAME}}/outputs/phase-10/review-prompt.txt

# 差分 blocker を確認したい場合のみ補助的に codex review を追加
codex review --uncommitted "docs/30-workflows/{{FEATURE_NAME}}/outputs/phase-10/review-prompt.txt の指示に従って現在差分をレビューしてください。"
```

### runner 切替の最小契約

| runner | 実行方法 | prompt の渡し方 |
| ------ | -------- | --------------- |
| `codex` | `codex exec` / `codex review` | 引数 |
| `claude-code` | runner 固有コマンド | `stdin` または file |
| `generic-agent` | 任意 CLI / MCP client | `stdin` または file |

---

## Phase 3: 設計レビューゲート

### 目的

実装開始前に要件・設計の妥当性を検証する。
問題を早期発見し、実装フェーズでの手戻りを最小化する。

### 判定基準

| 判定  | 条件                     | 対応                         |
| ----- | ------------------------ | ---------------------------- |
| PASS  | 全レビュー観点で問題なし | Phase 4（テスト作成）へ進行  |
| MINOR | 軽微な指摘あり           | 指摘対応後Phase 4へ進行      |
| MAJOR | 重大な問題あり           | 影響範囲に応じて戻り先を決定 |

### 戻り先決定基準

| 問題の種類 | 戻り先              |
| ---------- | ------------------- |
| 要件の問題 | Phase 1（要件定義） |
| 設計の問題 | Phase 2（設計）     |
| 両方の問題 | Phase 1（要件定義） |

### レビュー観点

1. **要件との整合性**
   - 設計が要件を満たしているか
   - スコープ外の機能が含まれていないか

2. **アーキテクチャの妥当性**
   - 単一責務の原則に従っているか
   - 依存関係の方向が正しいか
   - 拡張性・保守性が考慮されているか

3. **技術的実現可能性**
   - 選択した技術で実装可能か
   - パフォーマンス要件を満たせるか

4. **セキュリティ**
   - セキュリティ上の懸念がないか
   - 認証・認可が適切に設計されているか

5. **UI/UX設計（該当する場合）**
   - Apple HIG準拠の設計になっているか
   - アクセシビリティが考慮されているか

6. **フロントエンド/バックエンド構成（該当する場合）**
   - IPC通信設計が適切か
   - 状態管理設計が適切か

### 仕様参照チェック（AIが判断）

タスクの性質に応じて、以下の仕様を参照して整合性を確認する：

| 観点 | 参照先（aiworkflow-requirements） |
| ---- | --------------------------------- |
| セキュリティ | `security-*.md` |
| UI/UX | `ui-ux-*.md` |
| アーキテクチャ | `architecture-*.md` |
| API設計 | `api-*.md` |
| インターフェース | `interfaces-*.md` |

### 設計タスク専用: 契約品質チェック（TASK-SKILL-LIFECYCLE-08 知見）

設計タスク（docs-only）では、コード品質より**契約品質**の欠陥が主要リスクとなる。
Phase 3 で以下の追加チェックを実施する。

| チェック項目 | 確認内容 |
| ---------- | -------- |
| 前提条件/事後条件 | 各型の入出力に前提条件・事後条件が明示されているか |
| IPC ハンドラの Port 依存 | IPC ハンドラの引数型が具象クラスではなく Port/Interface であるか（P61対策） |
| DI 境界表 | どの層がどのインターフェースに依存するかが設計書に記載されているか |
| 受入基準トレーサビリティ | Phase 1 の受入基準と Phase 2 の型設計が 1:1 で対応しているか |

---

## Phase 10: 最終レビューゲート

### 目的

実装完了後、ドキュメント更新前に全体的な品質・整合性を検証する。
多角的レビューで見落としを防ぐ。

### 判定基準

| 判定     | 条件                     | 対応                                  |
| -------- | ------------------------ | ------------------------------------- |
| PASS     | 全レビュー観点で問題なし | Phase 11（手動テスト）へ進行          |
| MINOR    | 軽微な指摘あり           | 未完了タスクとして記録後Phase 11へ進行 |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて戻り先を決定          |
| CRITICAL | 致命的な問題あり         | Phase 1へ戻りユーザーと要件を再確認   |

### 戻り先決定基準

| 問題の種類       | 戻り先                      |
| ---------------- | --------------------------- |
| 要件の問題       | Phase 1（要件定義）         |
| 設計の問題       | Phase 2（設計）             |
| テスト設計の問題 | Phase 4（テスト作成）       |
| 実装の問題       | Phase 5（実装）             |
| テスト拡充の問題 | Phase 6（テスト拡充）       |
| カバレッジ未達   | Phase 7（カバレッジ確認）   |
| コード品質の問題 | Phase 8（リファクタリング） |

### レビュー観点

1. **機能完全性**
   - 全ての受け入れ基準が満たされているか
   - エッジケースが適切に処理されているか

2. **コード品質**
   - クリーンコードの原則に従っているか
   - 重複コードがないか
   - 命名が適切か

3. **テスト品質**
   - テストカバレッジが十分か
   - テストケースが適切か
   - 境界値テストが含まれているか

4. **セキュリティ**
   - 脆弱性がないか
   - 入力バリデーションが適切か
   - 認証・認可が正しく実装されているか

5. **パフォーマンス**
   - 明らかなボトルネックがないか
   - 不要なDBクエリがないか

6. **ドキュメント整合性**
   - コードとコメントが一致しているか
   - 型定義が正確か

7. **エラーハンドリング**
   - 例外処理が適切か
   - ユーザーへのエラーメッセージが適切か

8. **UI/UX（該当する場合）**
   - Apple HIG準拠か
   - レスポンシブ対応されているか
   - アクセシビリティ（WCAG）対応か

9. **データ整合性**
   - トランザクション処理が適切か
   - データバリデーションが適切か

10. **国際化（i18n）対応（該当する場合）**
    - ハードコードされた文字列がないか
    - ローカライズ可能な設計か

### 仕様参照チェック（AIが判断）

タスクの性質に応じて、以下の仕様を参照して整合性を確認する：

| 観点 | 参照先（aiworkflow-requirements） | 確認の方向性 |
| ---- | --------------------------------- | ------------ |
| セキュリティ | `security-*.md` | 実装がセキュリティ要件を満たしているか |
| UI/UX | `ui-ux-*.md` | Apple HIG、WCAG準拠か |
| アーキテクチャ | `architecture-*.md` | パターン適用、層分離が適切か |
| API設計 | `api-*.md` | API契約が仕様通りか |
| インターフェース | `interfaces-*.md` | 型定義、IPC契約が正しいか |
| データベース | `database-*.md` | スキーマ、データ整合性が適切か |
| エラーハンドリング | `error-handling.md` | エラーコード、メッセージが仕様通りか |

### MINOR判定時のフロー

```
レビューでMINOR判定
    ↓
指摘事項を分析
    ↓
未完了タスク指示書を作成（generate-unassigned-task エージェント使用）
    ↓
docs/30-workflows/unassigned-task/ に配置
    ↓
Phase 11へ進行
```

---

## エスカレーション条件

以下の場合はユーザーにエスカレーションする：

1. 戻り先の判断が困難な場合
2. 複数フェーズにまたがる問題の場合
3. 要件自体の見直しが必要な場合
4. セキュリティ上の重大な懸念が発見された場合

### エスカレーション手順

1. 問題の具体的な内容を報告
2. 試行した対策を説明
3. 推奨される次のアクションを提案
4. ユーザーの判断を仰ぐ

---

## 品質基準チェックリスト（指示書品質）

MINOR判定時に未完了タスク指示書を作成する場合、以下を確認：

### Why（なぜ必要か）

- [ ] 背景が明確に記述されているか
- [ ] 問題点・課題が具体的に説明されているか
- [ ] 放置した場合の影響が記載されているか

### What（何を達成するか）

- [ ] 目的が具体的に定義されているか
- [ ] 最終ゴールが検証可能な形で記述されているか
- [ ] スコープが明確に定義されているか

### How（どのように実行するか）

- [ ] `codex` CLI を既定 runner とする review 手順が定義されているか
- [ ] Claude Code / 他 CLI / AI agent に渡す共通 prompt artifact が定義されているか
- [ ] 完了条件が検証可能な形で定義されているか
- [ ] テストケース/検証方法が記載されているか
- [ ] リスクと対策が検討されているか

---

## 参照リソース

- 未完了タスクテンプレート: `assets/unassigned-task-template.md`
- 未完了タスク生成エージェント: `agents/generate-unassigned-task.md`
- 未完了タスクガイドライン: `references/unassigned-task-guidelines.md`
