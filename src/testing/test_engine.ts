import { Engine } from "../models/entities/Engine";
import { FSAParser } from "../models/entities/FSAParser";
import type { FsaDefinition } from "../models/interfaces/FsaDefinition";
import { InstanceManager } from "../models/managers/executionSubClasses/InstanceManager";

function test() {
    const instructions = [
        "initial: q0",
        "final: q1, q2",
        "q0, e, q1",
        "q0, e, q2",
        "q1, a, q1",
        "q2, b, q2"
    ].join("\n");

    const parser = new FSAParser(["a", "b"], instructions, "e");
    const definition = parser.parseInstructions() as FsaDefinition;

    const input = "aaaa";
    const engine = new Engine("FSA");

    // Absolute head position for each active execution instance.
    // Initially, the head is at position 0.
    let headPositions: number[] = [0];

    engine.setInitialTapeState(
        input[0] ?? "",
        0,
        definition,
        InstanceManager.assignId()
    );

    let currentState = engine.getEngineState();

    console.log("INITIAL STATE:");
    console.log(currentState);
    console.log("HEAD POSITIONS:", headPositions);

    for (let step = 0; step < input.length; ++step) {

        /*
         * Read the symbol currently under each head.
         */
        const currentValues = headPositions.map((headPosition) => {
            return headPosition >= 0 && headPosition < input.length
                ? input[headPosition]
                : "";
        });

        console.log(`\n===== STEP ${step + 1} =====`);
        console.log("Head positions:", headPositions);
        console.log("Current values:", currentValues);

        engine.setTapesValues(currentValues);

        /*
         * Execute one transition.
         *
         * headNextPosition contains MOVEMENTS:
         *   1  -> move right
         *   0  -> stay
         *  -1  -> move left
         */
        engine.exec();

        currentState = engine.getEngineState();

        console.log("Execution result:", currentState);

        /*
         * Apply the movement returned by the engine
         * to the actual absolute head position.
         */
        headPositions = currentState.headNextPosition.map(
            (movement, index) => {
                return (headPositions[index] ?? 0) + movement;
            }
        );

        console.log("New head positions:", headPositions);
    }

    const isAccepted = currentState.activeStates.some((state) =>
        definition.finalStates.has(state)
    );

    console.log(
        isAccepted
            ? "Input accepted"
            : "Input rejected"
    );
}

test();