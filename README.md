## 🚀 Build and Use

1. Install the dependencies:

```bash
npm i
```
2. Rename ".env.example" to ".env" file and set your own app key and osu! API data.

3. (Optional) Set a symbolic link to the Homepage client bundle if you have it.
Original Homepage project: [More-Beatmap-Info-Homepage](https://github.com/Ruichimi/More-Beatmap-Info-Homepage)

For Windows (PowerShell):
Navigate to your server directory and link the public folder to the Homepage bundle if the both projects are in the same directory.
```bash
New-Item -ItemType SymbolicLink -Path "public" -Target "..\Homepage\dist"
```

Same example for Linux / macOS:
Use ln -s to create a symbolic link in your server directory.
```bash
ln -s ../Homepage/dist public
```

4. Run the server:
```bash
npm run start
```

5. For developing use (auto restart)
```bash
npm run nodemon
```


## 📜 License
This project is licensed under the AGPL-3.0 License - see the [LICENSE](./LICENSE) file for details.
