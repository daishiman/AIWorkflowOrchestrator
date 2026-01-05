/**
 * Tailwind CSS 設定テンプレート
 *
 * 使用方法:
 * 1. このファイルを tailwind.config.js としてコピー
 * 2. プロジェクトに合わせてカスタマイズ
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  // ダークモード設定
  darkMode: "class", // 'media' | 'class' | ['selector', '[data-theme="dark"]']

  // コンテンツパス
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    // コンテナ設定
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },

    extend: {
      // ===========================================
      // カラー
      // ===========================================
      colors: {
        // CSS変数ベース（推奨）
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // カスタムカラー（オプション）
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
      },

      // ===========================================
      // ボーダー半径
      // ===========================================
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // ===========================================
      // フォント
      // ===========================================
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },

      // ===========================================
      // スペーシング
      // ===========================================
      spacing: {
        4.5: "1.125rem",
        13: "3.25rem",
        15: "3.75rem",
        128: "32rem",
        144: "36rem",
      },

      // ===========================================
      // アニメーション
      // ===========================================
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-out",
        "slide-in-from-top": "slide-in-from-top 0.2s ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.2s ease-out",
        "slide-in-from-left": "slide-in-from-left 0.2s ease-out",
        "slide-in-from-right": "slide-in-from-right 0.2s ease-out",
        "zoom-in": "zoom-in 0.2s ease-out",
        "zoom-out": "zoom-out 0.2s ease-out",
        "spin-slow": "spin 3s linear infinite",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-in-from-top": {
          from: { transform: "translateY(-100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-in-from-bottom": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-in-from-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-in-from-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "zoom-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "zoom-out": {
          from: { opacity: "1", transform: "scale(1)" },
          to: { opacity: "0", transform: "scale(0.95)" },
        },
      },

      // ===========================================
      // トランジション
      // ===========================================
      transitionDuration: {
        250: "250ms",
        350: "350ms",
        400: "400ms",
      },

      // ===========================================
      // Z-Index
      // ===========================================
      zIndex: {
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        100: "100",
      },

      // ===========================================
      // ボックスシャドウ
      // ===========================================
      boxShadow: {
        "inner-sm": "inset 0 1px 2px 0 rgb(0 0 0 / 0.05)",
        highlight: "inset 0 1px 0 0 rgb(255 255 255 / 0.1)",
      },

      // ===========================================
      // スクリーン（ブレークポイント）
      // ===========================================
      screens: {
        xs: "475px",
        "3xl": "1920px",
      },
    },
  },

  // ===========================================
  // プラグイン
  // ===========================================
  plugins: [
    // フォームスタイル
    // require('@tailwindcss/forms'),
    // タイポグラフィ（prose）
    // require('@tailwindcss/typography'),
    // アスペクト比
    // require('@tailwindcss/aspect-ratio'),
    // コンテナクエリ
    // require('@tailwindcss/container-queries'),
    // アニメーション（tailwindcss-animate）
    // require('tailwindcss-animate'),
    // カスタムプラグイン例
    // function({ addUtilities }) {
    //   addUtilities({
    //     '.text-balance': {
    //       'text-wrap': 'balance',
    //     },
    //   });
    // },
  ],
};

/**
 * 対応するCSS変数（globals.cssに追加）
 *
 * @layer base {
 *   :root {
 *     --background: 0 0% 100%;
 *     --foreground: 222.2 84% 4.9%;
 *     --card: 0 0% 100%;
 *     --card-foreground: 222.2 84% 4.9%;
 *     --popover: 0 0% 100%;
 *     --popover-foreground: 222.2 84% 4.9%;
 *     --primary: 222.2 47.4% 11.2%;
 *     --primary-foreground: 210 40% 98%;
 *     --secondary: 210 40% 96.1%;
 *     --secondary-foreground: 222.2 47.4% 11.2%;
 *     --muted: 210 40% 96.1%;
 *     --muted-foreground: 215.4 16.3% 46.9%;
 *     --accent: 210 40% 96.1%;
 *     --accent-foreground: 222.2 47.4% 11.2%;
 *     --destructive: 0 84.2% 60.2%;
 *     --destructive-foreground: 210 40% 98%;
 *     --border: 214.3 31.8% 91.4%;
 *     --input: 214.3 31.8% 91.4%;
 *     --ring: 222.2 84% 4.9%;
 *     --radius: 0.5rem;
 *   }
 *
 *   .dark {
 *     --background: 222.2 84% 4.9%;
 *     --foreground: 210 40% 98%;
 *     --card: 222.2 84% 4.9%;
 *     --card-foreground: 210 40% 98%;
 *     --popover: 222.2 84% 4.9%;
 *     --popover-foreground: 210 40% 98%;
 *     --primary: 210 40% 98%;
 *     --primary-foreground: 222.2 47.4% 11.2%;
 *     --secondary: 217.2 32.6% 17.5%;
 *     --secondary-foreground: 210 40% 98%;
 *     --muted: 217.2 32.6% 17.5%;
 *     --muted-foreground: 215 20.2% 65.1%;
 *     --accent: 217.2 32.6% 17.5%;
 *     --accent-foreground: 210 40% 98%;
 *     --destructive: 0 62.8% 30.6%;
 *     --destructive-foreground: 210 40% 98%;
 *     --border: 217.2 32.6% 17.5%;
 *     --input: 217.2 32.6% 17.5%;
 *     --ring: 212.7 26.8% 83.9%;
 *   }
 * }
 */
