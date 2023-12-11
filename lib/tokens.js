export class Token {
	constructor(value) {
		this.value = value
	}
}
export class Operator extends Token {}
export class Keyword extends Token {}
export class LineBreak extends Token {}

export class Evaluatable extends Token {}
export class NumberValue extends Evaluatable {}
export class StringValue extends Evaluatable {}
export class Variable extends Evaluatable {}

export class DeclareVariable extends Token {}
export class BinaryCalculation extends Evaluatable {}
export class Print extends Token {}
