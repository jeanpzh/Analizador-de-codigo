import { Interpreter } from '@/lib/interpreter';
import { Lexer } from '@/lib/lexer';
import { Parser } from '@/lib/parser';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let tokens;
  try {
    const { code } = await req.json();
    tokens = new Lexer(code).tokenize();
    const parsed = new Parser(tokens).parse();
    const result = new Interpreter().interpret(parsed);
    return NextResponse.json({ result, filteredTokens: tokens });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      if (error.message.startsWith("División por cero")) {
        return NextResponse.json(
          { error: error.message, filteredTokens: tokens  },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
  }
}