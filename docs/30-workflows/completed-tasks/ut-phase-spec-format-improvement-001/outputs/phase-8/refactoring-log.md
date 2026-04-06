# Phase 8 Refactoring Log

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 8                                    |
| タイプ | docs-only / NON_VISUAL               |
| 実施日 | 2026-04-06                           |
| 対象   | UT-PHASE-SPEC-FORMAT-IMPROVEMENT-001 |

## リファクタリング方針

- Handlebars 条件分岐のネストを 1 段以内に保つ
- `{{#if}}` ブロック前後の判断基準を blockquote で明示する
- 重複する記述を共通セクションへ抽出する

## Before / After 記録

### Task/Step 分離ガイドライン

| 項目             | Before                           | After                                                |
| ---------------- | -------------------------------- | ---------------------------------------------------- |
| 形式             | （未記載）                       | `> **Task / Step 分離ルール**` blockquote            |
| 内容             | plan / current fact の境界が不明 | plan のみを書く・current fact は outputs/ へ、と明示 |
| Phase 11/12 言及 | なし                             | Phase 11 / Phase 12 の証跡分離を明記                 |

### NON_VISUAL/VISUAL 分岐

| 項目   | Before                                                           | After                                            |
| ------ | ---------------------------------------------------------------- | ------------------------------------------------ |
| 形式   | IS_PHASE_11 ブロック内に IS_NON_VISUAL 分岐なし                  | `{{#if IS_NON_VISUAL}}` / `{{else}}` / `{{/if}}` |
| ネスト | 1段（IS_PHASE_11 のみ）                                          | 2段（IS_PHASE_11 内に IS_NON_VISUAL）            |
| 補足   | 2段は許容範囲内（Phase 11 + evidence type で直交する概念のため） |

### Phase 12 記録分離

| 項目          | Before                           | After                                                   |
| ------------- | -------------------------------- | ------------------------------------------------------- |
| 形式          | IS_PHASE_12 ブロック内に記載なし | 5 bullet のガイドライン列挙                             |
| root evidence | 言及なし                         | phase12-task-spec-compliance-check.md を必須と明記      |
| spec_created  | 言及なし                         | docs-only workflow では `spec_created` を維持すると明記 |

## コメント充実化

Phase 5 実装時は blockquote（`>`）形式でガイドラインを記述した。
Phase 8 では以下の可読性向上を確認した:

1. `> **Task / Step 分離ルール**` — ボールド強調で視認性を確保
2. IS_NON_VISUAL 分岐の前後にコメントは不要（分岐自体がセルフドキュメンティング）
3. Phase 12 ブロックの 5 bullet は独立したポイントとして列挙し、番号なし箇条書きで一覧性を確保

## 重複排除確認

```bash
# NON_VISUAL / primary evidence の重複箇所確認
grep -n "NON_VISUAL\|primary evidence" \
  .claude/skills/task-specification-creator/assets/phase-spec-template.md
```

- `NON_VISUAL`: Phase 11 ブロック内の 1 箇所のみ — 重複なし
- `primary evidence`: Phase 11 NON_VISUAL ブロック内の 1 箇所のみ — 重複なし

## 完了確認

- [x] Handlebars 条件分岐のネストが許容範囲内（IS_NON_VISUAL は IS_PHASE_11 内で 2 段）
- [x] 各条件分岐の意図が blockquote / コメントで明示されている
- [x] 重複記述なし（NON_VISUAL/primary evidence 各 1 箇所）
- [x] Before/After テーブルで変更内容を記録
