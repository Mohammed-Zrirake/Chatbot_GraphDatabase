import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// tag::interface[]
export interface GenerateAnswerInput {
  question: string;
  context: string;
}
// end::interface[]


export default function initGenerateAnswerChain(
  llm: BaseLanguageModel
): RunnableSequence<GenerateAnswerInput, string> {

  const answerQuestionPrompt = PromptTemplate.fromTemplate(`
  Use only the following context to answer the following question.

  Question:
  {question}

  Context:
  {context}

  Answer as if you have been asked the original question.
  Do not use your pre-trained knowledge.

  If you don't know the answer, just say that you don't know, don't try to make up an answer.
  Include links and sources where possible.
`);


  return RunnableSequence.from<GenerateAnswerInput, string>([
    answerQuestionPrompt,
    llm,
    new StringOutputParser(),
  ]);
}


async function main() {
  const llm = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-2.0-flash",
    maxOutputTokens: 2048,
  });
  

  const answerChain = initGenerateAnswerChain(llm);
  const output = await answerChain.invoke({
    question: "Who is the CEO of Neo4j?", 
    context: "Neo4j CEO: Emil Eifrem",
  });
  console.log(output);
}

main();
