import { ethers } from 'ethers';
import ValutABI from './abis/Vault.json' assert { type: "json" };
import PositionRouterABI from './abis/PositionManager.json' assert { type: "json" };
// aqua
import {WETH_ADDR, WBTC_ADDR, LINK_ADDR, UNI_ADDR, WFTM_ADDR,
  GMX_VAULT_ADDR ,GMX_POSITION_ROUTER_ADDR } from './constants/addresses'
import {MAINNET_RPC} from './constants/network'


const INPUT_TOKEN = LINK_ADDR;// aqua

export const fetchLongAndShortPositions = async () => {
 
  const provider = new ethers.providers.JsonRpcProvider(MAINNET_RPC);
  
  const { chainId } = await provider.getNetwork()
  console.log("Network ChainID:", chainId);
  const VaultContract = new ethers.Contract( GMX_VAULT_ADDR , ValutABI , provider );
  const PositionRouter = new ethers.Contract( GMX_POSITION_ROUTER_ADDR , PositionRouterABI , provider );

  // funding rates 
  const cummFunding = await VaultContract.cumulativeFundingRates(INPUT_TOKEN);
  console.log("Funding Rates", cummFunding.toString())
  
  // Calculate Long position
  const maxGlobalLongSizes = await PositionRouter.maxGlobalLongSizes(INPUT_TOKEN);
  const guaranteedUsd = await VaultContract.guaranteedUsd(INPUT_TOKEN);
  console.log("maxGlobalLongSizes", maxGlobalLongSizes.toString())
  console.log("guaranteedUsd ",  guaranteedUsd.toString())
  
  const availableLongAmount = maxGlobalLongSizes.sub(guaranteedUsd);
  console.log("availableLongAmount ",  availableLongAmount.toString())

  const availableLongAmountParsed = parseFloat(availableLongAmount.toString().slice(0, -28)) / 100;
  console.log("availableLongAmount(string) ",  availableLongAmountParsed)
  
  // Calulate Short position
  const maxGlobalShortSizes = await PositionRouter.maxGlobalShortSizes(INPUT_TOKEN);
  const usdcReservedAmounts = await VaultContract.globalShortSizes(INPUT_TOKEN);
  console.log("maxGlobalShortSizes", maxGlobalShortSizes.toString())
  console.log("globalShortSizes",  usdcReservedAmounts.toString())
  
  
  const availableShortAmount = maxGlobalShortSizes.sub(usdcReservedAmounts);
  const availableShortAmountParsed = parseFloat(availableShortAmount.toString().slice(0, -28)) / 100;
  console.log("🚀 ~ file: helpers.ts:34 ~ fetchLongAndShortPositions ~ availableShortAmountParsed:", availableShortAmountParsed)
  console.log("🚀 ~ file: helpers.ts:34 ~ fetchLongAndShortPositions ~ availableLongAmountParsed:", availableLongAmountParsed)

  return { availableLongAmountParsed, availableShortAmountParsed}
}