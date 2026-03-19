require("dotenv").config();
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const { ethers } = require("ethers");
const univ3prices = require("@thanpolas/univ3prices");

// Configuration
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const CRYPTOCOMPARE_API_KEY = process.env.CRYPTOCOMPARE_API_KEY; // optional

if (!INFURA_PROJECT_ID) {
  throw new Error("Missing INFURA_PROJECT_ID in .env file");
}

// Chain-specific configurations
const chainConfig = {
  1: {
    name: "Ethereum Mainnet",
    rpcUrl: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
    factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    usdt: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
  },
  137: {
    name: "Polygon",
    rpcUrl: `https://polygon-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
    factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    usdt: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    usdc: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    weth: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  },
  42161: {
    name: "Arbitrum",
    rpcUrl: `https://arbitrum-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
    factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    usdt: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    usdc: "0xaf88d065e77c8cC2239327C5EFb3A432268e5831",
    weth: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  },
  10: {
    name: "Optimism",
    rpcUrl: `https://optimism-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
    factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    usdt: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
    usdc: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
    weth: "0x4200000000000000000000000000000000000006",
  },
};

// ERC20 Token ABI (minimal)
const TOKEN_ABI = [
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
];

// Uniswap V3/PancakeSwap V3 Pool ABI (minimal)
const POOL_ABI = [
  "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
];

// Uniswap V3/PancakeSwap V3 Factory ABI (minimal)
const FACTORY_ABI = ["function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)"];

// Initialize MCP server
const server = new McpServer({
  name: "UniswapV3PriceServer",
  version: "1.0.0",
});

// Tool: Get supported chains
server.tool(
  "getSupportedChains",
  "Returns a list of supported blockchain networks, including their chain IDs and names, formatted as a Markdown table.",
  z.object({}),
  async () => {
    try {
      const supportedChains = Object.entries(chainConfig).map(([chainId, config]) => ({
        chainId: parseInt(chainId),
        chainName: config.name,
      }));

      // Generate Markdown table
      let markdownTable = "| Chain ID | Chain Name |\n|----------|------------|\n";
      supportedChains.forEach((chain) => {
        markdownTable += `| ${chain.chainId} | ${chain.chainName} |\n`;
      });

      return {
        content: [
          {
            type: "text",
            text: markdownTable,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching supported chains: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  },
);

// Tool: Get token price in USD
server.tool(
  "getTokenPrice",
  "Fetches the current price of a token against USDT, USDC/BUSD, or WETH/WBNB (in that order) in a Uniswap V3/PancakeSwap V3 pool with 0.3% fee tier on the specified chain. Automatically retrieves token decimals and symbol. Converts the price to USD using CryptoCompare API for all quote tokens. Returns the price in USD.",
  z.object({
    tokenAddress: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
      .describe("The address of the token to price (e.g., 0x6B175474E89094C44Da98b954EedeAC495271d0F for DAI on Ethereum, 0x1AF3F329e8BE154074D8769D3FFa4eE058B1DBc3 for DAI on BSC)."),
    chainId: z.number().int().describe("The chain ID of the blockchain (e.g., 1 for Ethereum, 137 for Polygon, 42161 for Arbitrum, 10 for Optimism, 56 for BSC)."),
  }),
  async ({ tokenAddress, chainId }) => {
    try {
      // Validate chainId
      if (!chainConfig[chainId]) {
        return {
          content: [
            {
              type: "text",
              text: `Unsupported chainId: ${chainId}. Supported chains: ${Object.keys(chainConfig).join(", ")}`,
            },
          ],
          isError: true,
        };
      }

      const { rpcUrl, factory, usdt, usdc, weth } = chainConfig[chainId];
      const provider = new ethers.JsonRpcProvider(rpcUrl);

      // Fetch token decimals and symbol
      const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, provider);
      let decimals0, symbol0;
      try {
        decimals0 = (await tokenContract.decimals()).toString();
        symbol0 = await tokenContract.symbol();
      } catch {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching decimals or symbol for token ${tokenAddress} on chain ${chainId}`,
            },
          ],
          isError: true,
        };
      }

      const factoryContract = new ethers.Contract(factory, FACTORY_ABI, provider);
      const fee = 3000; // 0.3% fee tier
      const quoteTokens = [
        { address: usdt, symbol: "USDT", decimals: 6 },
        { address: usdc, symbol: "USDC", decimals: 6 },
        { address: weth, symbol: "ETH", decimals: 18 },
      ];

      let usdPrice = null;
      let poolAddress = null;
      let quoteTokenUsed = null;

      // Try each quote token in order
      for (const quoteToken of quoteTokens) {
        const token0 =
          tokenAddress.toLowerCase() < quoteToken.address.toLowerCase() ? tokenAddress : quoteToken.address;
        const token1 =
          tokenAddress.toLowerCase() < quoteToken.address.toLowerCase() ? quoteToken.address : tokenAddress;

        poolAddress = await factoryContract.getPool(token0, token1, fee);
        if (poolAddress === ethers.ZeroAddress) continue;

        const poolContract = new ethers.Contract(poolAddress, POOL_ABI, provider);
        const slot0 = await poolContract.slot0();
        const sqrtPriceX96 = slot0.sqrtPriceX96.toString();

        // Calculate price (tokenAddress quoted against quoteToken)
        const price = univ3prices(
          [decimals0, quoteToken.decimals],
          sqrtPriceX96,
        ).toAuto({
          reverse: tokenAddress.toLowerCase() < quoteToken.address.toLowerCase(),
        });

        // Fetch quote token price in USD from CryptoCompare
        const response = await fetch(
          `https://min-api.cryptocompare.com/data/price?fsym=${quoteToken.symbol}&tsyms=USD&api_key=${CRYPTOCOMPARE_API_KEY}`,
        );
        if (!response.ok) {
          throw new Error(`CryptoCompare API request failed: ${response.statusText}`);
        }
        const data = await response.json();
        const quotePriceInUSD = data.USD;

        usdPrice = price * quotePriceInUSD;
        quoteTokenUsed = quoteToken.symbol;
        break;
      }

      if (!usdPrice) {
        return {
          content: [
            {
              type: "text",
              text: `No Uniswap V3/PancakeSwap V3 pool found for ${symbol0} (${tokenAddress}) with USDT, ${
                chainId === 56 ? "BUSD" : "USDC"
              }, or ${chainId === 56 ? "BNB" : "ETH"} at 0.3% fee on chain ${chainId}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Price of token ${symbol0} on chain ${chainId} in USD: ${usdPrice}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching price: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  },
);

// Start server with stdio transport
async function startServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

startServer().catch(console.error);

