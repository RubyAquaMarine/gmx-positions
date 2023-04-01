import { ethers } from 'ethers';
import ValutABI from './abis/Vault.json' assert { type: "json" };
import PositionRouterABI from './abis/PositionManager.json' assert { type: "json" };

export const fetchLongAndShortPositions = async () => {
  const WETH_ADDR = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";

  const GMX_VAULT_ADDR = "0x489ee077994B6658eAfA855C308275EAd8097C4A";
  
  const GMX_POSITION_ROUTER_ADDR = "0xb87a436B93fFE9D75c5cFA7bAcFff96430b09868";
  
  const provider = new ethers.providers.JsonRpcProvider('https://endpoints.omniatech.io/v1/arbitrum/one/public');
  
  const { chainId } = await provider.getNetwork()
  const VaultContract = new ethers.Contract( GMX_VAULT_ADDR , ValutABI , provider );
  const PositionRouter = new ethers.Contract( GMX_POSITION_ROUTER_ADDR , PositionRouterABI , provider );
  
  // Calculate Long position
  const maxGlobalLongSizes = await PositionRouter.maxGlobalLongSizes(WETH_ADDR);
  const guaranteedUsd = await VaultContract.guaranteedUsd(WETH_ADDR);
  
  const availableLongAmount = maxGlobalLongSizes.sub(guaranteedUsd);
  const availableLongAmountParsed = parseFloat(availableLongAmount.toString().slice(0, -28)) / 100;
  
  // Calulate Short position
  const maxGlobalShortSizes = await PositionRouter.maxGlobalShortSizes(WETH_ADDR);
  const usdcReservedAmounts = await VaultContract.globalShortSizes(WETH_ADDR);
  
  
  const availableShortAmount = maxGlobalShortSizes.sub(usdcReservedAmounts);
  const availableShortAmountParsed = parseFloat(availableShortAmount.toString().slice(0, -28)) / 100;
  console.log("🚀 ~ file: helpers.ts:34 ~ fetchLongAndShortPositions ~ availableShortAmountParsed:", availableShortAmountParsed)
  console.log("🚀 ~ file: helpers.ts:34 ~ fetchLongAndShortPositions ~ availableLongAmountParsed:", availableLongAmountParsed)

  return { availableLongAmountParsed, availableShortAmountParsed}
}