# Bedrock Ledger Maintainer CLI

```
blm <cmd> [args]

Commands:
  blm create  create a witness pool doc
  blm update  update ledger nodes
  blm send    creates or updates a witness pool doc

Options:
      --version              Show version number                       [boolean]
  -p, --primary              A comma separated list of primary nodes
                                                                   [default: ""]
  -s, --secondary            A comma separated list of secondary nodes
                                                                   [default: ""]
  -k, --maintainerKey        A maintainer secret or a file containing material
                             for a v1 key                  [default: "password"]
  -a, --keepAlive            Whether to keep the httpsAgent agent alive
                                                                 [default: true]
  -r, --rejectUnauthorized   Whether to reject domains with invalid SSL
                             certificates                       [default: false]
  -m, --veresMode            The mode for veres one driver      [default: "dev"]
  -w, --maximumWitnessCount  The maximumWitnessCount for the witnessPool
                                                                    [default: 1]
  -d, --didMethod            The type of did key to use. Either "key" or "v1"
                                                                [default: "key"]
      --help                 Show help                                 [boolean]
```
