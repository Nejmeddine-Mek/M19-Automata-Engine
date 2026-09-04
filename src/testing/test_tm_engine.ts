import { Engine } from "../models/entities/Engine";
import { TuringMachineParser } from "../models/entities/TuringMachineParser";
import { ExecutionManager } from "../models/managers/ExecutionManager";
import type { TMDefinition } from "../models/interfaces/TMDefinition";

function test() {
    let isAccepted = false
    const parser = new TuringMachineParser(
        ["|", "*"],
        [
            "initial: q0",
            "final: q1",
            "q0, |, *, q0",
            "q0, *, D, q1"
        ].join("\n"),
        "D",
        "G"
    );

    const def = parser.parseInstructions() as TMDefinition;

    console.log("DEFINITION:");
    console.log(def);

    const engine = new Engine("TM");

    const input = ["|","*"];

    // Absolute head position.
    let headPositions: number[] = [0];

    // Initialize the first execution instance.
    engine.setInitialTapeState(
        input[0] ?? "",
        0,
        def,
        ExecutionManager.assignId()
    );

    let currentState = engine.getEngineState();

    console.log("\nINITIAL STATE:");
    console.log(currentState);
    console.log("HEAD POSITIONS:", headPositions);

    /*
     * Execute until the machine halts or there are no more
     * active execution instances.
     */
    for (let step = 0; step < 10; ++step) {
        if (currentState.halted || currentState.activeStates.length === 0) {
            break;
        }

        // Read the symbol currently under every head.
        const currentValues = headPositions.map((headPosition) => {
            if (headPosition >= 0 && headPosition < input.length) {
                return input[headPosition];
            }

            // Outside the input: blank symbol.
            return "0"
        });

        console.log(`\n===== STEP ${step + 1} =====`);
        console.log("HEAD POSITIONS:", headPositions);
        console.log("CURRENT VALUES:", currentValues);

        engine.setTapesValues(currentValues);

        // Execute one TM transition.
        engine.exec();

        currentState = engine.getEngineState();

        console.log("EXECUTION RESULT:");
        console.log(currentState);

        // Apply write operations to the tape.
        // A movement of 0 means the TM wrote a symbol and stayed on the same cell.
        currentState.headNextPosition.forEach((movement, index) => {
            if (movement === 0) {
                input[headPositions[index]] =
                    currentState.tapesCurrentValue[index];
            }
        });

        /*
        * headNextPosition contains MOVEMENTS:
        *
        *   1  -> right
        *   0  -> stay/write
        *  -1  -> left
        *
        * Convert movements into absolute positions.
        */
        headPositions = currentState.headNextPosition.map(
            (movement, index) =>
                (headPositions[index] ?? 0) + movement
        );

        console.log("NEW TAPE:", input);

        console.log("NEW HEAD POSITIONS:", headPositions);
        isAccepted = currentState.activeStates.some((state) =>
            def.final.has(state)
        );
        if(isAccepted)
            break
    }

        console.log(
        isAccepted
            ? "\nInput accepted"
            : "\nInput rejected"
    );

}

test();