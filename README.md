# M19 Automata Simulator & Theoretical Engine

M19 Automata Simulator is an advanced theoretical computer science workbench and execution engine. Originally conceived as a Turing Machine simulator, it has evolved into a comprehensive suite supporting **Finite State Automata (FSA)**, **Pushdown Automata (PDA)**, **Linear Bounded Automata (LBA)**, and **Turing Machines (TM)**.

Rather than relying on tedious and slow visual drag-and-drop state construction, M19 is driven by an algebraic **Domain-Specific Language (DSL)**. You define your machines as concise, expressive code, empowering you to think about formal languages and automata algebraically, rigorously, and logically.

---

## Implemented Features & Capabilities

### 1. Multi-Model Automata Support

* **Finite State Automata (FSA / DFA & NFA):**
  * Full deterministic and non-deterministic execution.
  * Real-time multi-branch state tracking.
  * Customizable empty transition symbol ($\varepsilon / e$).
* **Linear Bounded Automata (LBA):**
  * Context-sensitive language recognition.
  * Configurable left (`C`) and right (`$`) tape boundary markers.
  * Auxiliary tape alphabet ($\Gamma$) and directional head movements (`L`, `R`).
* **Turing Machines (TM):**
  * Infinite bidirectional tape execution with configurable blank symbol (`0`).
  * Works both as **Language Deciders** (Accept / Reject) and **Function Calculators** (computational output verification on tape).
  * Automatically padded tape window with center-aligned read/write head tracking.
* **Pushdown Automata (PDA):**
  * Foundation for stack alphabet ($\Gamma$) and initial stack symbol ($Z_0$).

---

### 2. Code-Driven Domain Specific Language (DSL) & IDE

* **Declarative Headers & Rules:**
  * Initial and final states: `initial: q0`, `final: q2, q3`.
  * FSA Transitions: `<state>, <read_symbol>, <next_state>` *(e.g., `q0, a, q1`)*.
  * LBA & TM Transitions: `<state>, <read_symbol>, <action_or_write>, <next_state>` *(e.g., `q0, 0, 1, q1` or `q0, 1, R, q1`)*.
* **In-App IDE Editor:**
  * Clean, high-contrast light mode and dark mode coding surface.
  * Integrated line gutter with active step pointer indicators during live execution.
  * Instant JSON save and load capabilities (persists to file and browser `localStorage`).

---

### 3. Interactive Execution & Visualization Engine

* **Multi-Thread Simulation (Parallel Branch Tracking):**
  * When non-deterministic transitions occur, the simulator dynamically forks into multiple isolated threads, rendering independent tape heads and states in real-time.
* **Bi-Directional Stepper & History Control:**
  * **Step Forward & Step Back:** Step backward and forward through full execution history.
  * **Continuous Run & Variable Delay:** Auto-play execution with adjustable speed (50ms – 1500ms).
  * **Halt & Reset:** Gracefully cancel or reset machine states.
* **Interactive SVG State Graphs:**
  * Visualizes transitions dynamically using SVG with custom arrowhead markers and double concentric rings for accepting states.
  * Interactive draggable nodes with physics-friendly positioning.
  * Pulsing aura animations for currently active state(s).
  * One-click **PNG Export** for diagrams.
* **Animated Sliding Tapes:**
  * Windowed tape viewport dynamically tracking the R/W head.
  * Color-coded thread tags to distinguish parent and branched execution threads.

---

### 4. Operations Hub & Theoretical Algorithms

The **Operations Hub** allows you to perform formal automata transformations step-by-step with visual graph diffs and explanations:

* **Determinization (NFA $\rightarrow$ DFA):** Subset construction algorithm with power set states.
* **Trimming (Élagage):** Eliminates inaccessible states and non-coaccessible dead/trap states.
* **State Elimination (DFA $\rightarrow$ Regular Expression):** Converts automata into equivalent regular expressions.
* **Thompson's Construction (Regex $\rightarrow$ FSA):** Inductive synthesis from regex syntax trees.
* **DFA to Regular Grammar & Grammar to NFA:** Bidirectional conversion between Type-3 Chomsky grammars and automata.
* **Complement Automaton ($\overline{L}$):** State inversion over complete alphabets.
* **Mirror / Reversal Automaton ($L^R$):** Inversion of transitions and swapping of initial/final states.
* **Degeneralization:** Converts multi-character word transitions into canonical single-character chains.

---

### 5. Algorithms & Theoretical Documentation Library

* **Interactive Algorithm Modal:**
  * Displays time/space theoretical complexity (e.g., $O(|Q| + |E|)$, $O(2^{|Q|})$).
  * Formal input/output algebraic definitions.
  * Complete, syntax-highlighted line-by-line pseudocode.
* **Integrated Documentation Modal:**
  * Quick-start guides and DSL syntax cheatsheets for FSA, LBA, and TM.
  * Theoretical conventions and tape head boundary rules.

---

### 6. Context-Aware AI Chatbot Assistant

* Floating, accessible AI assistant powered by Google Gemini.
* Automatically incorporates your active **machine configuration**, **written DSL code**, **current state**, and **academic lecture notes**.
* Explains rejection reasons, assists in writing transitions, and resolves formal language queries.
* Features a 10-second request cooldown, conversational history, and simple Google AI Studio API key onboarding with permanent `localStorage` persistence.

---

### 7. User Experience & Usability Features

* **Pre-Loaded Machine Library:**
  * Instant access from the header dropdown to ready-to-run programs (binary invert, binary increment, palindromes, specific language recognizers).
* **Interactive Onboarding Walkthrough:**
  * Automated first-time guided tour explaining all workspace sections and execution controls, with a 1-click sample loader. Can be reopened anytime via the **Guide** button.
* **Internationalization (i18n):**
  * Seamless one-click switching between **English** and **French** across the entire UI, documentation, algorithms, and assistant.
* **Customizable Typography & Appearance:**
  * Full support for Light and Dark modes with class-based styling.
  * Configurable font families (Monospace, Sans-Serif, Serif), font sizes, and weights.
  * Polished, minimalist scrollbars across all viewports.

---

## Tech Stack & Architecture

* **Frontend Framework:** React 19 + TypeScript
* **Build Tool & Bundler:** Vite 8 + `@rolldown/plugin-babel`
* **Styling:** Tailwind CSS v4 with custom class-based dark mode
* **Architecture:** Memory-efficient, garbage-collection-friendly execution pipeline capable of scaling complex non-deterministic branching paths.

---

## Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* `npm` or `pnpm`

### Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/m19-automata-engine.git
   cd "m19-automata-engine/M19 Automata Engine"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## Quick Start Example (FSA: Ends with `ab`)

1. Open the simulator and select **FSA** in the configuration panel.
2. In the **IDE Window**, paste the following DSL code:
   ```text
   initial: q0
   final: q2
   q0, a, q1
   q0, b, q0
   q1, a, q1
   q1, b, q2
   q2, a, q1
   q2, b, q0
   ```
3. In the execution toolbar, enter an input string such as `aab` and click **Load & Init**.
4. Click **Step** or **Run** to watch the state diagram and tape animate until the banner shows **Input Accepted**!
