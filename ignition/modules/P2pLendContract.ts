import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const P2pLendContractModule = buildModule("P2pLendModule", (m) => {

    const initialOwner = "0x0D33Ee49A31FfB9B579dF213370f634e4a8BbEEd";
  
 
    const mpxToken = m.contract("MPXToken", [initialOwner]);

   
    const p2pLendContract = m.contract("P2PLending", [mpxToken]);

    return { mpxToken, p2pLendContract };
});

export default P2pLendContractModule;
