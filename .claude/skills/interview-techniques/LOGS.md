# Interview Techniques - Usage Logs

## 概要

このファイルはinterview-techniquesスキルの使用履歴とフィードバックを記録します。

## ログエントリ形式

各エントリは以下の形式で記録されます：

```markdown
### [YYYY-MM-DD HH:MM] - Phase X - Task ID - Result

**Context**: {{実施したインタビューの背景}}
**Outcome**: {{結果の概要}}
**Duration**: {{所要時間}}
**Quality Score**: {{1-5}}
**Learnings**: {{学んだこと・改善点}}
**Next Actions**: {{次のアクション}}
```

## ログエントリ

---

<!-- ログエントリはここに追加されます -->
<!-- 最新のエントリが上に来るようにしてください -->

---

## 統計サマリー

**Last Updated**: -
**Total Uses**: 0
**Success Rate**: -
**Average Quality Score**: -

## 改善アクション

<!-- フィードバックに基づく改善アクションをここに記録 -->

---

## テンプレート使用方法

新しいログエントリを追加する際は、以下のテンプレートを使用してください：

```bash
node .claude/skills/interview-techniques/scripts/log_usage.mjs \
  --result success \
  --phase "Phase 1" \
  --task "INT-001" \
  --notes "インタビュー計画を作成。質問が適切に構造化された。"
```
