/* eslint-disable indent */
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import { RunnablePassthrough } from "@langchain/core/runnables";
import initCypherGenerationChain from "./cypher-generation.chain";
import initCypherEvaluationChain from "./cypher-evaluation.chain";
import { saveHistory } from "../../history";
import { AgentToolInput } from "../../agent.types";
import { extractIds } from "../../../../utils";
import initGenerateAuthoritativeAnswerChain from "../../chains/authoritative-answer-generation.chain";
import { BaseLanguageModel } from "@langchain/core/language_models/base";

// tag::input[]
type CypherRetrievalThroughput = AgentToolInput & {
  context: string;
  output: string;
  cypher: string;
  results: Record<string, any> | Record<string, any>[];
  ids: string[];
};



async function recursivelyEvaluate(
  graph: Neo4jGraph,
  llm: BaseLanguageModel,
  question: string
): Promise<string> {
  // Initiate chains
  const generationChain = await initCypherGenerationChain(graph, llm);
  const evaluatorChain = await initCypherEvaluationChain(llm);
  let cypher = await generationChain.invoke(question);
  let errors = ["N/A"];
  let tries = 0;

  while (tries < 5 && errors.length > 0) {
    tries++;

    try {
      const evaluation = await evaluatorChain.invoke({
        question,
        schema: graph.getSchema(),
        cypher,
        errors,
      });

      errors = evaluation.errors;
      cypher = evaluation.cypher;
    } catch (e: unknown) {}
  }
  cypher = cypher.replace(/\sid\(([^)]+)\)/g, " elementId($1)");
  return cypher;
}


export async function getResults(
  graph: Neo4jGraph,
  llm: BaseLanguageModel,
  input: { question: string; cypher: string }
): Promise<any | undefined> {
let results;
let retries = 0;
let cypher = input.cypher;


const evaluationChain = await initCypherEvaluationChain(llm);
  while (results === undefined && retries < 5) {
    try {
      results = await graph.query(cypher);
      return results;
    } catch (e: any) {
      retries++;

      const evaluation = await evaluationChain.invoke({
        cypher,
        question: input.question,
        schema: graph.getSchema(),
        errors: [e.message],
      });

      cypher = evaluation.cypher;
    }
  }

  return results;
}



export default async function initCypherRetrievalChain(
  llm: BaseLanguageModel,
  graph: Neo4jGraph
) {
  const answerGeneration =  initGenerateAuthoritativeAnswerChain(llm);

  return (
    RunnablePassthrough
      // Generate and evaluate the Cypher statement
      .assign({
        cypher: (input: { rephrasedQuestion: string }) =>
          recursivelyEvaluate(graph, llm, input.rephrasedQuestion),
      })

      // Get results from database
      .assign({
        results: (input: { cypher: string; question: string }) =>
          getResults(graph, llm, input),
      })

      // Extract information
      .assign({
        // Extract _id fields
        ids: (input: Omit<CypherRetrievalThroughput, "ids">) =>
          extractIds(input.results),
        // Convert results to JSON output
        context: ({ results }: Omit<CypherRetrievalThroughput, "ids">) =>
          Array.isArray(results) && results.length == 1
            ? JSON.stringify(results[0])
            : JSON.stringify(results),
      })

      // Generate Output
      .assign({
        output: (input: CypherRetrievalThroughput) =>
          answerGeneration.invoke({
            question: input.rephrasedQuestion,
            context: input.context,
          }),
      })

      // Save response to database
      .assign({
        responseId: async (input: CypherRetrievalThroughput, options) => {
          saveHistory(
            options?.configurable.sessionId,
            "cypher",
            input.input,
            input.rephrasedQuestion,
            input.output,
            input.ids,
            input.cypher
          );
        },
      })
      // Return the output
      .pick("output")
  );
}

