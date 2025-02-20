# see https://nodejs.org/en/download/package-manager

# installs fnm (Fast Node Manager)
winget install Schniz.fnm
# configure fnm environment
fnm env --use-on-cd | Out-String | Invoke-Expression
# download and install Node.js
fnm use --install-if-missing 23

yarn dev

# Open the browser at the specified URL
Start-Process "http://localhost:3000/index.html"

Read-Host -Prompt "Press Enter to exit"