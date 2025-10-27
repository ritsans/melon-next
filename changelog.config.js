module.exports = {
  disableEmoji: false,
  format: "{type}: {subject}",
  list: ["add", "fix", "docs", "feat", "refactor", "test", "style", "perf"],
  maxMessageLength: 64,
  minMessageLength: 3,
  questions: ["type", "subject"],
  scopes: [],
  types: {
    add: {
      description: "新しいファイル、ライブラリの追加など",
      value: "add",
    },
    docs: {
      description: "ドキュメントの更新",
      value: "docs",
    },
    feat: {
      description: "新機能の追加",
      value: "feat",
    },
    fix: {
      description: "不具合の修正",
      value: "fix",
    },
    perf: {
      description: "パフォーマンス改善のための変更",
      value: "perf",
    },
    refactor: {
      description: "バグ修正や機能の追加を行わない変更",
      value: "refactor",
    },
    style: {
      description: "コードの処理に影響しない変更（スペースや書式設定）",
      value: "style",
    },
    test: {
      description: "テストコードの追加や修正",
      value: "test",
    },
  },
};
