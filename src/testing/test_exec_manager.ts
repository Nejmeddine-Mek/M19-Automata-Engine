import { ExecutionManager } from "../models/managers/ExecutionManager";
import { FSAParser } from "../models/entities/FSAParser";
import type { FsaDefinition } from "../models/interfaces/FsaDefinition";
import type { ActiveTape } from "../models/interfaces/activeTapeConfigs";
import { InstanceManager } from "../models/managers/executionSubClasses/InstanceManager";

function testExecutionManager() {
    const instructions = [
        "initial: q0",
        "final: q1",
        "q0, a, q1"
    ].join("\n");

    const parser = new FSAParser(["a", "b"], instructions, "e");
    const definition = parser.parseInstructions() as FsaDefinition;

    const input = "aaaa";

    const manager = new ExecutionManager(
        "FSA",
        input,
        definition
    );

    const initialTape: ActiveTape = {
        id: InstanceManager.assignId(),
        tapeValue: [...input],
        currentHeadPosition: 0,
        parentId: "thread-root",
        index: 0,
        stack: null,
        blankSymbol: null
    };
    console.log("original id: ", initialTape.id)
    manager.setInitialTapeStates(initialTape);

    // One single execution step
    const changes = manager.runStep();

    console.log("Execution changes:");
    console.log(changes);
}

testExecutionManager();