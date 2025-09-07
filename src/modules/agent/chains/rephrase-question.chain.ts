/* eslint-disable indent */
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";

import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatbotResponse } from "../history";



export type RephraseQuestionInput = {
  input: string;
  history: ChatbotResponse[];
}



export default function initRephraseChain(llm: BaseChatModel) {
  // Prompt template
  const rephraseQuestionChainPrompt = PromptTemplate.fromTemplate<
    RephraseQuestionInput,
    string
  >(`
  Given the following conversation and a question,
  rephrase the follow-up question to be a standalone question about the
  subject of the conversation history.

  If you do not have the required information required to construct
  a standalone question, ask for clarification.

  Always include the subject of the history in the question.

  History:
  {history}

  Question:
  {input}
`);

 return RunnableSequence.from<RephraseQuestionInput, string>([
   RunnablePassthrough.assign({
     history: ({ history }): string => {
       if (history.length == 0) {
         return "No history";
       }
       return history
         .map(
           (response: ChatbotResponse) =>
             `Human: ${response.input}\nAI: ${response.output}`
         )
         .join("\n");
     },
   }),
   rephraseQuestionChainPrompt,
   llm,
   new StringOutputParser(),
 ]);
}


/**
 * How to use this chain in your application:

// tag::usage[]
const llm = new OpenAI() // Or the LLM of your choice
const rephraseAnswerChain = initRephraseChain(llm)

const output = await rephraseAnswerChain.invoke({
  input: 'What else did they act in?',
  history: [{
    input: 'Who played Woody in Toy Story?',
    output: 'Tom Hanks played Woody in Toy Story',
  }]
}) // Other than Toy Story, what movies has Tom Hanks acted in?
// end::usage[]
 */
