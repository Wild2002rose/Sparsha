module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        tag: {
          black: "#292930",
          dark: "#150734",
          dp: "#e12b3b",
          lp: "#e42c6a",
          green: "#3eb650",
          orange: "#ES6B1F",
          p1: "#EE7879",
          p2: "#F4ABAA",
          y1: "#FCC133",
          y2: "#FCDD23",
          b1: "#2a3166",
          b2: "#0f2557",
          b3: "#28559A",
          b4: "#3778C2",
          light: "#CAE7DF",
          l: "#DEF2F1",
          l2: "#EFF9F9",
          l3: "#f8fcfc",
          l4: "#C2E4E2",
          l5: "#4BA9A3",
          l6: "#3a1c32",
          l7: "#014d4e"
        }
      },
      keyframes: {
        ring: {
          '0%': { transform: 'rotate(0deg)' },
          '10%': { transform: 'rotate(15deg)' },
          '20%': { transform: 'rotate(-10deg)' },
          '30%': { transform: 'rotate(7deg)' },
          '40%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(3deg)' },
          '60%': { transform: 'rotate(-2deg)' },
          '70%, 100%': { transform: 'rotate(0deg)' },
        },
      },
      animation: {
        ring: 'ring 1s ease-in-out infinite',
      },
      fontFamily: {
        alex: [' "Alex Brush" ', 'cursive']
      }
    },
  },
  plugins: [],
}
