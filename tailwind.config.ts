import type { Config } from 'tailwindcss'
const config: Config = { darkMode:'class', content:['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}','./lib/**/*.{ts,tsx}'], theme:{extend:{fontFamily:{sans:['var(--font-cairo)','Tahoma','Arial','sans-serif']},colors:{brand:{brown:'#43251E',maple:'#68160D',orange:'#CF4116',taupe:'#AB9A90',cream:'#EEDCC7'}}}}, plugins:[] }
export default config
