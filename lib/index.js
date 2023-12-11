import { tokenizer } from './tokenizer.js'
import { parser } from './parser.js'

console.log(
	parser(
		tokenizer(
			`
키: 170
몸무게: 60
비만도: 키 / 몸무게 / 몸무게

"비만도는" + 비만도 보여주기
`.trim(),
		),
	),
)

export default 10
