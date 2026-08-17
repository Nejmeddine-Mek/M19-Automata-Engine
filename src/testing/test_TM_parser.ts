import { TuringMachineParser } from "../models/entities/TuringMachineParser";


const parser = new TuringMachineParser(['|','R','L'],'q0,|,R,q1')

const def = parser.parseInstructions()
console.log(def)
