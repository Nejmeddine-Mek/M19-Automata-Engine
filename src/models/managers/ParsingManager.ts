
import { FSAParser } from "../entities/FSAParser";
import { TuringMachineParser } from "../entities/TuringMachineParser";
import type { FSAConfig, LBAConfig, PDAConfig, TMConfig } from "../interfaces/configs";


export class ParsingManager{
    private automatonType: String;
    public constructor(automatonType: String){
        this.automatonType = automatonType
    }
    public parseCode(machineType: FSAConfig | LBAConfig | PDAConfig | TMConfig, code: string){
        try{
            switch(machineType.machineType){
                case 'FSA':
                    const fsaConfig = machineType as FSAConfig
                    const fsaParser = new FSAParser(
                        fsaConfig.alphabet,
                        code,
                        fsaConfig.epsilon)

                    return fsaParser.parseInstructions()

                case 'PDA':
                    return null
                case 'LBA':
                    return null
                case 'TM':
                    const tmConfig = machineType as TMConfig
                    const tmParser = new TuringMachineParser(
                        [...tmConfig.alphabet,
                            tmConfig.epsilon,
                            tmConfig.left,
                            tmConfig.right,
                            tmConfig.emptyTape
                        ],
                        code
                    )
                    return tmParser.parseInstructions()
                
            }
        }catch(err){

        }
    }
    
    public getAutomatonType(): String { return this.automatonType }
}