import { FSAParser } from "../entities/FSAParser";
import { LBAParser } from "../entities/LBAParser";
import { TuringMachineParser } from "../entities/TuringMachineParser";
import { PDAParser } from "../entities/PDAParser";
import type { FSAConfig, LBAConfig, PDAConfig, TMConfig } from "../interfaces/configs";

export class ParsingManager {
    private automatonType: string;
    
    public constructor(automatonType: string) {
        this.automatonType = automatonType;
    }

    public parseCode(machineType: FSAConfig | LBAConfig | PDAConfig | TMConfig, code: string) {
        switch (machineType.machineType) {
            case 'FSA': {
                const fsaConfig = machineType as FSAConfig;
                const fsaParser = new FSAParser(
                    fsaConfig.alphabet,
                    code,
                    fsaConfig.epsilon
                );
                return fsaParser.parseInstructions();
            }

            case 'PDA': {
                const pdaParser = new PDAParser();
                return pdaParser.parseInstructions();
            }

            case 'LBA': {
                const lbaConfig = machineType as LBAConfig;
                const lbaParser = new LBAParser(
                    [
                        ...(lbaConfig.alphabet || []),
                        ...(lbaConfig.auxiliaryAlphabet || []),
                        lbaConfig.endSymbol,
                        lbaConfig.startSymbol,
                        lbaConfig.right,
                        lbaConfig.left
                    ],
                    lbaConfig.startSymbol,
                    lbaConfig.endSymbol,
                    lbaConfig.right,
                    lbaConfig.left
                );
                return lbaParser.parseInstructions(code);
            }

            case 'TM': {
                const tmConfig = machineType as TMConfig;
                const tmParser = new TuringMachineParser(
                    [
                        ...tmConfig.alphabet,
                        tmConfig.emptyTape
                    ],
                    code,
                    tmConfig.right,
                    tmConfig.left,
                    tmConfig.emptyTape
                );
                return tmParser.parseInstructions();
            }

            default:
                throw new Error(`Parsing Manager Error: Unknown machine type '${(machineType as any).machineType}'.`);
        }
    }
    
    public getAutomatonType(): string { return this.automatonType }
}