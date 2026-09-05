import { TuringMachineParser } from "../models/entities/TuringMachineParser";


const parser = new TuringMachineParser(['|'],[
    'initial: q0',
    'final: q1',
    'q0, |, D, q1'
].join('\n'), 'D', 'G', '⊔')

const def = parser.parseInstructions()
console.log(def)
