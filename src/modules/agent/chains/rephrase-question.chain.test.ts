/* eslint-disable indent */
import { config } from "dotenv";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { RunnableSequence } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import initRephraseChain from "./rephrase-question.chain";
import { ChatbotResponse } from "../history";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

describe("Rephrase Question Chain", () => {
  let llm: BaseChatModel;
  let chain: RunnableSequence;
  let evalChain: RunnableSequence<any, any>;

 beforeAll(async () => {
     config({ path: ".env.local" });
     llm = new ChatGoogleGenerativeAI({
       apiKey: process.env.GOOGLE_API_KEY,
       model: "gemini-2.0-flash",
       maxOutputTokens: 2048,
     });

    chain = await initRephraseChain(llm);

    evalChain = RunnableSequence.from([
      PromptTemplate.fromTemplate(`
        Is the rephrased version a complete standalone question that can be answered by an LLM?

        Original: {input}
        Rephrased: {response}

        If the question is a suitable standalone question, respond "yes".
        If not, respond with "no".
        If the rephrased question asks for more information, respond with "missing".
      `),
      llm,
      new StringOutputParser(),
    ]);
  });

  describe("Rephrasing Questions", () => {
    it("should handle a question with no history", async () => {
      const input = "Who directed the matrix?";

      const response = await chain.invoke({
        input,
        history: [],
      });

      const evaluation = await evalChain.invoke({ input, response });
      expect(`${evaluation.toLowerCase()} - ${response}`).toContain("yes");
    });

    it("should rephrase a question based on its history", async () => {
      const history = [
        {
          input: "Can you recommend me a film?",
          output: "Sure, I recommend The Matrix",
        },
      ];
      const input = "Who directed it?";
      const response = await chain.invoke({
        input,
        history,
      });

      expect(response).toContain("The Matrix");

      const evaluation = await evalChain.invoke({ input, response });
      expect(`${evaluation.toLowerCase()} - ${response}`).toContain("yes");
    });

    it("should ask for clarification if a question does not make sense", async () => {
      // eslint-disable-next-line max-len
      const input = "What about last week? use the phrase 'provide more context' if you don t understand what i m talking about";
      const history: ChatbotResponse[] = [];

      const response = await chain.invoke({
        input,
        history,
      });

      const evaluation = await evalChain.invoke({ input, response });
      expect(`${evaluation.toLowerCase()} - ${response}`).toContain("provide");
    });
  });
});
