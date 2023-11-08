import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { LocalAccountSigner } from "@alchemy/aa-core";
import { encodeFunctionData } from "viem";
import { sepolia } from "viem/chains";
import { ethers } from "ethers";

const { parseUnits, parseEther } = ethers;

/* create provider */
const ALCHEMY_API_KEY = "XXX";
const provider = new AlchemyProvider({
  apiKey: ALCHEMY_API_KEY, // replace with your Alchemy API Key
  chain: sepolia,
});

/* create signer */
const chain = sepolia;
const PRIVATE_KEY = "XXX";
const eoaSigner = LocalAccountSigner.privateKeyToAccountSigner(
  `0x${PRIVATE_KEY}`
);

/* connect the signer to provider */
const connectedProvider = provider.connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      chain,
      owner: eoaSigner,
      factoryAddress: getDefaultLightAccountFactoryAddress(chain),
      rpcClient,
    })
);

/* encode an action */
const tokenAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "numTokens",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const tokenReceiver = "0xbec04a84A8a5c160E8378e1e42E4eeC168450949";
const numberOfTokens = parseUnits("10", 18);

export const uoCallData = encodeFunctionData({
  abi: tokenAbi,
  functionName: "transfer",
  args: [tokenReceiver, numberOfTokens],
});

const gasFee = parseEther("0.01");
const contractToInteract = "0x47f2c756ede2d9bd2297238baf381e37d7c961c9";

const uo = await connectedProvider.sendUserOperation({
  target: contractToInteract,
  data: uoCallData,
  value: gasFee,
});

const txHash = await connectedProvider.waitForUserOperationTransaction(uo.hash);

console.log(txHash);
