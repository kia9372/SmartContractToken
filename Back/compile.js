const path = require("path");
const fs = require("fs-extra");
const solc = require("solc");

const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

const inboxPath = path.resolve(__dirname, 'src/contracts');
const fileNames = fs.readdirSync(inboxPath);

const compilerInput = {
    language: "Solidity",
    sources: fileNames.reduce((input, fileName) => {
        const filePath = path.resolve(inboxPath, fileName);
        const source = fs.readFileSync(filePath, "utf8");
        return { ...input, [fileName]: { content: source } };
    }, {}),
    settings: {
        outputSelection: {
            "*": {
                "*": ["*"],
            },
        },
    },
};

// Compile All contracts
const compiled = JSON.parse(solc.compile(JSON.stringify(compilerInput)));

fs.ensureDirSync(buildPath);

fileNames.map((fileName) => {
    const contracts = Object.keys(compiled.contracts[fileName]);
    contracts.map((contract) => {
        fs.outputJsonSync(
            path.resolve(buildPath, contract.replace(':', '') + ".json"),
            compiled.contracts[fileName][contract]
        );
    });
});