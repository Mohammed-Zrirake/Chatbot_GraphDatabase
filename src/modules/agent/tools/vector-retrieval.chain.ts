import {
  Runnable,
  RunnablePassthrough,
  RunnablePick,
} from "@langchain/core/runnables";
import { Embeddings } from "@langchain/core/embeddings";
import initGenerateAnswerChain from "../chains/answer-generation.chain";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import initVectorStore from "../vector.store";
import { saveHistory } from "../history";
import { DocumentInterface } from "@langchain/core/documents";



type RetrievalChainThroughput = AgentToolInput & {
  context: string;
  output: string;
  ids: string[];
};




const extractDocumentIds = (
  documents: DocumentInterface<{ _id: string; [key: string]: any }>[]
): string[] => documents.map((document) => document.metadata._id);


const docsToJson = (documents: DocumentInterface[]) =>
  JSON.stringify(documents);


export interface AgentToolInput {
  input: string;
  rephrasedQuestion: string;
}


export default async function initVectorRetrievalChain(
  llm: BaseLanguageModel,
  embeddings: Embeddings
): Promise<Runnable<AgentToolInput, string>> {
  
  const vectorStore = await initVectorStore(embeddings);
  const vectorStoreRetriever = vectorStore.asRetriever(5);

  
  const answerChain = initGenerateAnswerChain(llm);
  return RunnablePassthrough.assign({
    documents: new RunnablePick("rephrasedQuestion").pipe(vectorStoreRetriever),
  })
    .assign({
      ids: new RunnablePick("documents").pipe(extractDocumentIds),
      context: new RunnablePick("documents").pipe(docsToJson),
    })
    .assign({
      output: (input: RetrievalChainThroughput) =>
        answerChain.invoke({
          question: input.rephrasedQuestion,
          context: input.context,
        }),
    })
    .assign({
      responseId: async (input: RetrievalChainThroughput, options) =>
        saveHistory(
          options?.configurable?.sessionId,
          "vector",
          input.input,
          input.rephrasedQuestion,
          input.output,
          input.ids
        ),
    })
    .pick("output");
}
