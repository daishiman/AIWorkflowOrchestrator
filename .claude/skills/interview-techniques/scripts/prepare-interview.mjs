#!/usr/bin/env node
/**
 * インタビュー準備スクリプト
 *
 * インタビューの事前準備チェックリストと質問リストを生成します。
 *
 * 使用方法:
 *   node prepare-interview.mjs [--topic <トピック>] [--output <出力ファイル>]
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';

// 5W1H質問テンプレート
const QUESTIONS_5W1H = {
  who: {
    title: 'Who（誰が）',
    questions: [
      'このシステム/機能を使うのは主にどなたですか？',
      '他に関係する部門や人はいますか？',
      'ユーザーの技術レベルはどの程度ですか？',
      '意思決定者はどなたですか？',
      '承認プロセスに関わる人は？'
    ]
  },
  what: {
    title: 'What（何を）',
    questions: [
      '何を実現したいですか？最も重要な機能は何ですか？',
      '現在できていないことは何ですか？',
      '必須の機能と、あれば良い機能を教えてください',
      '成功の基準は何ですか？',
      'データとして何を扱いますか？'
    ]
  },
  when: {
    title: 'When（いつ）',
    questions: [
      'いつまでに必要ですか？その期限は絶対ですか？',
      'いつ、どのくらいの頻度で使いますか？',
      'ピーク時期はいつですか？',
      '段階的なリリースは可能ですか？',
      'データの保持期間は？'
    ]
  },
  where: {
    title: 'Where（どこで）',
    questions: [
      'どこで使いますか？（オフィス、外出先、在宅）',
      'どのデバイスで使いますか？',
      '連携する他のシステムはありますか？',
      'ネットワーク環境の制約はありますか？',
      'データはどこに保存しますか？'
    ]
  },
  why: {
    title: 'Why（なぜ）',
    questions: [
      'なぜこれが必要ですか？',
      '現在の課題は何ですか？',
      '期待する効果は何ですか？',
      'なぜ今このタイミングですか？',
      '他の解決策は検討しましたか？'
    ]
  },
  how: {
    title: 'How（どのように）',
    questions: [
      '現在の業務手順を教えてください',
      '理想的な手順はどのようなものですか？',
      '特殊なケースや例外はありますか？',
      'エラー時の対応はどうしますか？',
      'トレーニングはどのように行いますか？'
    ]
  }
};

// トピック別追加質問
const TOPIC_QUESTIONS = {
  '認証': [
    '認証方式の要件はありますか？（パスワード、SSO、MFA等）',
    'パスワードポリシーの要件は？',
    'セッション管理の要件は？',
    '外部認証サービスとの連携は必要ですか？'
  ],
  'パフォーマンス': [
    '許容される最大応答時間は？',
    'ピーク時の同時ユーザー数は？',
    'データ処理量の見込みは？',
    'バッチ処理の要件は？'
  ],
  'セキュリティ': [
    '取り扱うデータの機密レベルは？',
    'コンプライアンス要件はありますか？',
    '監査ログの要件は？',
    'データ暗号化の要件は？'
  ],
  'UI/UX': [
    'ターゲットユーザーの技術レベルは？',
    '参考にしたいUIはありますか？',
    'アクセシビリティ要件はありますか？',
    '対応するブラウザ・デバイスは？'
  ],
  'データ移行': [
    '移行元システムは何ですか？',
    '移行するデータ量は？',
    'データクレンジングの必要性は？',
    '移行のタイミングと許容ダウンタイムは？'
  ]
};

/**
 * インタビュー準備ガイドを生成
 */
function generateInterviewGuide(options = {}) {
  const { topic, date, interviewee } = options;
  const now = new Date();
  const dateStr = date || now.toISOString().split('T')[0];

  let content = `# インタビュー準備ガイド

## 基本情報

| 項目 | 内容 |
|-----|------|
| 日時 | ${dateStr} |
| インタビュイー | ${interviewee || '[未定]'} |
| トピック | ${topic || '[一般]'} |
| 準備日 | ${now.toISOString().split('T')[0]} |

---

## 事前準備チェックリスト

### インタビュー前
- [ ] インタビュイーの役職・部門を確認
- [ ] 関連する既存ドキュメントを読む
- [ ] 現行システムの概要を理解
- [ ] 質問リストを優先度順に整理
- [ ] 録音の許可を事前に確認

### 持ち物
- [ ] 質問リスト（本ガイド）
- [ ] メモ用紙またはノートPC
- [ ] 録音機器（許可がある場合）
- [ ] 名刺（初対面の場合）

---

## 質問リスト

### 5W1H基本質問

`;

  // 5W1H質問を追加
  for (const [key, section] of Object.entries(QUESTIONS_5W1H)) {
    content += `#### ${section.title}\n\n`;
    for (const q of section.questions) {
      content += `- [ ] ${q}\n`;
    }
    content += '\n**回答メモ**:\n```\n[ここに回答を記録]\n```\n\n';
  }

  // トピック別質問を追加
  if (topic && TOPIC_QUESTIONS[topic]) {
    content += `### ${topic}固有の質問\n\n`;
    for (const q of TOPIC_QUESTIONS[topic]) {
      content += `- [ ] ${q}\n`;
    }
    content += '\n**回答メモ**:\n```\n[ここに回答を記録]\n```\n\n';
  }

  content += `---

## Why分析用スペース

\`\`\`
Why 1: なぜ[要求]が必要ですか？
→ 回答:

Why 2: なぜ[Why1の回答]ですか？
→ 回答:

Why 3: なぜ[Why2の回答]ですか？
→ 回答:

Why 4: なぜ[Why3の回答]ですか？
→ 回答:

Why 5: なぜ[Why4の回答]ですか？
→ 回答:

本質的なニーズ:
\`\`\`

---

## インタビュー後のアクション

### 発見事項サマリー
1.
2.
3.

### 追加確認事項
- [ ]
- [ ]

### 次のステップ
- [ ] インタビュー記録を整理
- [ ] 発見事項を関係者に共有
- [ ] フォローアップ質問を送付

---

## 台本

### オープニング
\`\`\`
「本日はお時間いただきありがとうございます。
${topic ? `${topic}について` : '要件について'}お話を伺いたいと思います。
お時間は[X]分を予定しています。
録音させていただいてもよろしいでしょうか？」
\`\`\`

### クロージング
\`\`\`
「本日お聞きした内容を整理させていただきます。
[主要なポイントを要約]
この理解で合っていますでしょうか？
他にお伝えしたいことはありますか？
本日はありがとうございました。」
\`\`\`
`;

  return content;
}

/**
 * 利用可能なトピック一覧を表示
 */
function showTopics() {
  console.log('\n📋 利用可能なトピック:\n');
  for (const topic of Object.keys(TOPIC_QUESTIONS)) {
    console.log(`  - ${topic}`);
  }
  console.log('\n');
}

// メイン処理
function main() {
  const args = process.argv.slice(2);

  // ヘルプ
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
使用方法: node prepare-interview.mjs [オプション]

オプション:
  --topic <トピック>     トピック固有の質問を追加
  --date <日付>          インタビュー日付 (YYYY-MM-DD)
  --interviewee <名前>   インタビュイー名
  --output <ファイル>    出力ファイルパス
  --list-topics          利用可能なトピック一覧を表示
  --help, -h             このヘルプを表示

例:
  node prepare-interview.mjs --topic 認証 --output interview-guide.md
  node prepare-interview.mjs --list-topics
`);
    process.exit(0);
  }

  // トピック一覧表示
  if (args.includes('--list-topics')) {
    showTopics();
    process.exit(0);
  }

  // オプション解析
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--topic' && args[i + 1]) {
      options.topic = args[++i];
    } else if (args[i] === '--date' && args[i + 1]) {
      options.date = args[++i];
    } else if (args[i] === '--interviewee' && args[i + 1]) {
      options.interviewee = args[++i];
    } else if (args[i] === '--output' && args[i + 1]) {
      options.output = args[++i];
    }
  }

  // ガイド生成
  const content = generateInterviewGuide(options);

  if (options.output) {
    const outputPath = resolve(options.output);
    writeFileSync(outputPath, content, 'utf-8');
    console.log(`✅ インタビューガイドを生成しました: ${outputPath}`);
  } else {
    console.log(content);
  }
}

main();
