import { tokenizer } from './lib/tokenizer.js'
import { parser } from './lib/parser.js'
import { runAST } from './lib/run.js'

const code = `
키: 170
몸무게: 60
비만도: 키 / 몸무게 / 몸무게

"비만도는 " + 비만도 보여주기
`.trim()

const tokens = tokenizer(code)
console.log('토큰', tokens)

const ast = parser(tokens)
console.log('AST', ast)

runAST(ast)

// [다음: 더 알아보기](../finish.md)
