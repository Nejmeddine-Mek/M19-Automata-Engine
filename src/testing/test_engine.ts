import { Engine} from "../models/entities/Engine";
import { FSAParser } from "../models/entities/FSAParser";
import type { FsaDefinition } from "../models/interfaces/FsaDefinition";


function test(){
    const instructions = [
    'initial: q0',
    'final: q1, q2',
    'q0, e, q1',
    'q0, e, q2',
    'q1, a, q1',
    'q2, b, q2'
    ].join('\n');

    const parser = new FSAParser(['a', 'b'], instructions, 'e');

    const definition = parser.parseInstructions();
    console.log(definition);
    const input = "aaaa";
    const engine = new Engine('FSA');

    // Set initial state and first character on tape
    engine.setInitialTapeState(input[0] ?? "", 0, definition as FsaDefinition);

    let currentState = engine.getEngineState();

    // Iterate over input characters
    for (let i = 0; i < input.length; ++i) {
    // Determine the next character for each active branch/head position
    const newValues: string[] = currentState.activeStates.map((_, index) => {
        const headPos = currentState.headNextPosition[index];
        // Return next character if within bounds, otherwise empty string/EOF

        return headPos < input.length ? input[headPos] : "";
    });
    console.log(newValues)

    engine.setTapesValues(newValues);
    
    engine.exec();
    currentState = engine.getEngineState();
    console.log(currentState)

    }

    // Check for acceptance safely (handles empty activeStates or uninitialized states)
    const isAccepted = currentState?.activeStates?.some((state) =>
    definition?.finalStates?.has(state)
    );

    if (isAccepted) {
    console.log("Input accepted");
    } else {
    console.log("Input rejected");
    }
}
test()