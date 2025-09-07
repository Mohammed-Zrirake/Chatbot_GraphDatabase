# Chatbot GraphDatabase

This repository contains a chatbot application that leverages a graph database (Neo4j) to provide intelligent and context-aware responses. The chatbot utilizes language models (LLMs) and embeddings to understand user queries, retrieve relevant information from the graph database, and generate informative and accurate answers.

## Features and Functionality

*   **Interactive Chat Interface:** A user-friendly interface built with Next.js allows for seamless interaction with the chatbot.
*   **Contextual Understanding:** The chatbot maintains conversation history to provide contextually relevant responses, enabling more natural and intuitive interactions.
*   **Graph Database Integration:**  Uses Neo4j to store and retrieve structured data, enabling the chatbot to answer complex queries based on relationships between entities.
*   **Natural Language Processing:** Employs LLMs and embeddings (OpenAI) to understand user input, rephrase questions, and generate coherent responses.
*   **Cypher Query Generation:**  Automatically generates Cypher queries to retrieve information from the Neo4j database based on user questions.
*   **Cypher Query Validation:** Validates the generated Cypher query against the database schema, correcting errors and ensuring accurate results.
*   **Vector Search:** Uses vector embeddings to perform semantic searches on movie plots, allowing the chatbot to find movies based on themes or compare them.
*   **History Management:** Stores and retrieves conversation history to provide context for follow-up questions.
*   **Tooling:** Utilizes Langchain agents and tools for advanced question answering.
*   **Customization:**  Allows for customization of chatbot name and description using environment variables.

## Technology Stack

*   **Frontend:**
    *   [Next.js](https://nextjs.org/) - A React framework for building performant and scalable web applications.
    *   [React](https://reactjs.org/) - A JavaScript library for building user interfaces.
    *   [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapid UI development.
*   **Backend:**
    *   [Node.js](https://nodejs.org/) - A JavaScript runtime environment for executing server-side code.
    *   [Langchain](https://www.langchain.com/) - A framework for building applications powered by language models.
    *   [Neo4j Graph Database](https://neo4j.com/) - A graph database for storing and retrieving structured data.
*   **Language Models & Embeddings:**
    *   [OpenAI](https://openai.com/) - Used for language modeling (e.g., `gpt-4`) and generating embeddings.
*   **Other Libraries:**
    *   [@langchain/community](https://www.npmjs.com/package/@langchain/community)
    *   [@langchain/core](https://www.npmjs.com/package/@langchain/core)
    *   [@langchain/openai](https://www.npmjs.com/package/@langchain/openai)
    *   [marked](https://www.npmjs.com/package/marked) - A markdown parser.
    *   [zod](https://www.npmjs.com/package/zod) - A TypeScript-first schema declaration and validation library.

## Prerequisites

Before you begin, ensure you have the following installed:

*   [Node.js](https://nodejs.org/en/download/) (v18 or higher)
*   [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/) package manager
*   [Neo4j Graph Database](https://neo4j.com/download/) (v4 or higher)
*   [OpenAI API Key](https://platform.openai.com/account/api-keys)
*   [Google API Key](https://console.cloud.google.com/apis/credentials) (for Gemini model, if needed)

Also, ensure that you have a `.env.local` file in the root directory with the following environment variables defined:

```
NEXT_PUBLIC_CHATBOT_NAME="Your Chatbot Name"
NEXT_PUBLIC_CHATBOT_DESCRIPTION="Your Chatbot Description"
NEXT_PUBLIC_CHATBOT_GREETING="How can I help you today?"
OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
NEO4J_URI="neo4j+s://YOUR_NEO4J_URI"  # e.g., neo4j+s://xxxx.databases.neo4j.io
NEO4J_USERNAME="YOUR_NEO4J_USERNAME"
NEO4J_PASSWORD="YOUR_NEO4J_PASSWORD"
NEO4J_DATABASE="neo4j" # The database to connect to. Defaults to 'neo4j' if not provided
GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY" #Optional for Gemini model
OPENAI_API_BASE="YOUR_OPENAI_API_BASE" # Optional, for GraphAcademy Proxy or other custom OpenAI endpoint
```

**Note:** The `NEO4J_URI` should include the protocol (e.g., `neo4j+s` for secure connection). If you don't provide NEO4J_DATABASE the application will use `neo4j` database by default.  The `OPENAI_API_BASE` variable is optional. It is needed when using GraphAcademy Proxy or any custom hosted OpenAI compatible endpoint.

## Installation Instructions

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Mohammed-Zrirake/Chatbot_GraphDatabase.git
    cd Chatbot_GraphDatabase
    ```

2.  **Install dependencies:**

    ```bash
    npm install  # or yarn install
    ```

3.  **Configure environment variables:**

    Create a `.env.local` file in the root directory and set the required environment variables as described in the Prerequisites section.

4.  **Run the application:**

    ```bash
    npm run dev  # or yarn dev
    ```

    This will start the development server at `http://localhost:3000`.

## Usage Guide

1.  Open your browser and navigate to `http://localhost:3000`.
2.  You will see the chatbot interface.
3.  Type your question in the input field and press "Send" or press `Enter`.
4.  The chatbot will process your question and display the response.
5.  You can continue the conversation by asking follow-up questions. The chatbot will use the conversation history to provide contextually relevant answers.

## API Documentation

The application exposes a single API endpoint:

*   **`POST /api/chat`**: This endpoint accepts a JSON payload with a `message` field containing the user's input. It returns a JSON response with a `message` field containing the chatbot's response.

    **Request:**

    ```json
    {
      "message": "What movies has Tom Hanks acted in?"
    }
    ```

    **Response:**

    ```json
    {
      "message": "Tom Hanks has acted in movies such as Toy Story, Forrest Gump, and The Terminal."
    }
    ```

    The API also manages user sessions using cookies.  A unique session ID is generated and stored in the `session` cookie for each user. This ID is used to track conversation history.

## Contributing Guidelines

Contributions are welcome! To contribute to this project, please follow these guidelines:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with clear and descriptive commit messages.
4.  Test your changes thoroughly.
5.  Submit a pull request to the `main` branch.

## License Information

No license specified. All rights reserved.

## Contact/Support Information

For questions, bug reports, or feature requests, please contact:

*   Mohammed Zrirake - [https://github.com/Mohammed-Zrirake](https://github.com/Mohammed-Zrirake)