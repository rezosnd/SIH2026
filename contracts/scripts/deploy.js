const hre = require("hardhat");

async function main() {
  const honeyTraceability = await hre.ethers.deployContract("HoneyTraceability");
  await honeyTraceability.waitForDeployment();
  console.log(`HoneyTraceability deployed to ${honeyTraceability.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
