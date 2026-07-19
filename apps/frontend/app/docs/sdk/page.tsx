import Link from "next/link";

import {
  DocCards,
  DocCode,
  DocCtas,
  DocDoDont,
  DocFlow,
  DocP,
  DocSection,
  DocsShell,
  DocTable,
} from "@/components/docs/docs-shell";

const CORE_PATTERN = `import { createEngine } from "@contextengine/sdk"

const engine = createEngine({
  apiKey: process.env.CONTEXT_ENGINE_API_KEY!,
})

// 1. Get context for this turn
const context = await engine.getContext({
  query: userMessage,
  userId,
  workspaceId,
  conversationId,
})

// 2. Give that context to your agent
const reply = await yourAgent.run({
  instructions: context.prompt, // what the agent should know
  input: userMessage,           // what the user just said
})

// 3. Optionally remember the turn
await engine.writeMemory({
  userId,
  workspaceId,
  messages: [
    { role: "user", content: userMessage },
    { role: "assistant", content: reply },
  ],
})

// 4. Show sources in your UI
return { reply, citations: context.citations }`;

const ANY_MODEL = `// OpenAI-style
messages: [
  { role: "system", content: context.prompt },
  { role: "user", content: userMessage },
]

// Anthropic-style
{ system: context.prompt, messages: [{ role: "user", content: userMessage }] }

// AI SDK / LangChain / custom
agent.run({ system: context.prompt, prompt: userMessage })
// or
llm.invoke([system(context.prompt), human(userMessage)])`;

const RETURN_SHAPE = `type GetContextResult = {
  prompt: string       // give this to the agent
  memories: ...
  documents: ...
  sources: ...
  citations: ...       // show these in the UI
  tokenUsage: ...
  diagnostics: ...     // use these while building
}`;

export default function DocsSdkPage() {
  return (
    <DocsShell
      title={
        <>
          SDK
          <span className="mt-1.5 block font-semibold text-neutral-400">
            We give context. Your agent does the rest.
          </span>
        </>
      }
      subtitle="nmemo decides what the agent should know for this turn. You pass that context into whatever agent or model you already run."
    >
      <DocCtas
        primary={{ href: "/sign-in", label: "Get an API key" }}
        secondary={{ href: "/docs/playground", label: "Try playground" }}
      />

      <DocSection
        title="The idea"
        muted="Context in. Agent out."
      >
        <DocP>
          Your agent already knows how to talk, use tools, and call a model.
          What it usually lacks is the right context for this user, this
          workspace, this question.
        </DocP>
        <DocP>
          That is what nmemo provides. One call returns a ready prompt, the
          context your agent should see, plus citations you can show next to
          the answer.
        </DocP>
      </DocSection>

      <DocSection
        title="The flow"
        muted="General pattern for every turn."
      >
        <DocFlow
          steps={[
            {
              title: "User talks to your agent",
              body: "A chat message, a support ticket, a voice turn, whatever your product already handles.",
            },
            {
              title: "Ask nmemo for context",
              body: "Call getContext() with the query and who is asking. We pull from the sources in your workspace and assemble what matters.",
            },
            {
              title: "Give context to the agent",
              body: "Pass context.prompt as the agent’s instructions / system context. Keep the user message as the user message.",
            },
            {
              title: "Agent answers as usual",
              body: "Your model, tools, and orchestration stay yours. nmemo does not replace the agent, it feeds it.",
            },
            {
              title: "Show sources, remember the turn",
              body: "Use citations in the UI. Write the exchange back to memory so the next turn is smarter.",
            },
          ]}
        />
      </DocSection>

      <DocSection
        title="Core pattern"
        muted="Framework-agnostic on purpose."
      >
        <DocCode caption="Give context to the agent">{CORE_PATTERN}</DocCode>
        <DocP>
          <code className="text-foreground">yourAgent.run</code> is a stand-in.
          Swap it for OpenAI, Anthropic, the Vercel AI SDK, LangChain, Mastra,
          LlamaIndex, or a custom loop, the nmemo part stays the same.
        </DocP>
      </DocSection>

      <DocSection title="How you pass context in">
        <DocP>
          Every stack has a place for “what the agent should know.” That place
          is where <code className="text-foreground">context.prompt</code> goes.
        </DocP>
        <DocCode caption="Same idea, different APIs">{ANY_MODEL}</DocCode>
      </DocSection>

      <DocSection
        title="Works with any agent stack"
        muted="If it takes instructions, it takes nmemo."
      >
        <DocCards
          items={[
            {
              title: "Chat agents",
              body: "Support bots, copilots, internal assistants, context before each reply.",
            },
            {
              title: "Tool-using agents",
              body: "Give grounded context first, then let tools run on top of that.",
            },
            {
              title: "Voice agents",
              body: "Use getContextFast() so each utterance still gets useful context.",
            },
            {
              title: "Multi-agent systems",
              body: "Each agent can request context with its own agent label and the same workspace.",
            },
            {
              title: "Any model",
              body: "OpenAI, Anthropic, Google, open models, if it reads a system prompt, you’re fine.",
            },
            {
              title: "Any framework",
              body: "AI SDK, LangChain, LangGraph, Mastra, LlamaIndex, or plain fetch + messages[].",
            },
          ]}
        />
      </DocSection>

      <DocSection title="Install">
        <DocCode caption="npm">{`npm install @contextengine/sdk`}</DocCode>
        <DocCode caption="createEngine">{`import { createEngine } from "@contextengine/sdk"

const engine = createEngine({
  apiKey: process.env.CONTEXT_ENGINE_API_KEY!,
})`}</DocCode>
        <DocP>
          Create the engine once. Reuse it on every turn. Keep the API key on
          the server.
        </DocP>
      </DocSection>

      <DocSection
        title="getContext"
        muted="IDs you pass every turn."
      >
        <DocTable
          rows={[
            {
              label: "query",
              value: "What the user said this turn, the question the agent must answer.",
            },
            {
              label: "userId",
              value: "Who is asking in your product. Scopes personal memory, use your app’s user id.",
            },
            {
              label: "workspaceId",
              value: "Which workspace’s sources to use. Copy it from Settings or Keys in the dashboard.",
            },
            {
              label: "conversationId",
              value: "Optional. One id per chat/thread/call so turns stay linked.",
            },
            {
              label: "agent",
              value: "Optional. Name of the agent asking, useful when many agents share a workspace.",
            },
          ]}
        />
      </DocSection>

      <DocSection
        title="What you get back"
        muted="Give prompt to the agent. Keep the rest for your product."
      >
        <DocCode caption="GetContextResult">{RETURN_SHAPE}</DocCode>
        <DocTable
          rows={[
            {
              label: "prompt",
              value: "Context for the agent, pass this as instructions / system.",
            },
            {
              label: "citations",
              value: "Sources to show next to the answer.",
            },
            {
              label: "memories / documents",
              value: "Structured hits if you want to render or debug them yourself.",
            },
            {
              label: "sources",
              value: "Which connected sources were queried and how they performed.",
            },
            {
              label: "tokenUsage",
              value: "How much context budget this turn used.",
            },
            {
              label: "diagnostics",
              value: "Why things were kept or dropped, for you while building, not end users.",
            },
          ]}
        />
      </DocSection>

      <DocSection title="Do and don't">
        <DocDoDont
          doItems={[
            "Give context.prompt to the agent as instructions / system context.",
            "Keep the user’s message as the user message.",
            "Call getContext() once per turn, before the agent runs.",
            "Pass stable userId + workspaceId every time.",
            "Show citations with the answer.",
            "Write the turn to memory after the agent replies.",
          ]}
          dontItems={[
            "Don’t paste context into a fake user message.",
            "Don’t rebuild your own retrieval on top of the same sources.",
            "Don’t skip userId or mix conversationIds across users.",
            "Don’t call getContext() after the agent already answered.",
            "Don’t put API keys in the browser.",
            "Don’t show raw diagnostics to end users.",
          ]}
        />
      </DocSection>

      <DocSection
        title="Remember the turn"
        muted="So the next ask has context too."
      >
        <DocCode caption="writeMemory">{`await engine.writeMemory({
  userId,
  workspaceId,
  messages: [
    { role: "user", content: userMessage },
    { role: "assistant", content: reply },
  ],
})`}</DocCode>
        <DocP>
          After the agent answers, store the exchange. The next{" "}
          <code className="text-foreground">getContext()</code> can use it.
        </DocP>
      </DocSection>

      <DocSection
        title="Faster path"
        muted="Same idea, less wait, for voice and live turns."
      >
        <DocCode caption="getContextFast">{`const context = await engine.getContextFast({
  query: userMessage,
  userId,
  workspaceId,
  conversationId,
})

// Still: give context.prompt to the agent`}</DocCode>
      </DocSection>

      <DocSection title="Next">
        <DocP>
          See a live result in the{" "}
          <Link
            href="/docs/playground"
            className="text-foreground underline underline-offset-4"
          >
            playground
          </Link>
          , then wire the same{" "}
          <code className="text-foreground">context.prompt</code> into your
          agent. Or start from the{" "}
          <Link
            href="/docs"
            className="text-foreground underline underline-offset-4"
          >
            docs overview
          </Link>
          .
        </DocP>
      </DocSection>
    </DocsShell>
  );
}
