# PromoBOT

Gets the url of an ecommerce listing and sends an "embed" type message with info on the listing.

## Installation

After installing nodejs and npm, on the project folder run:

```bash
npm install
```
to get all the dependencies installed.

Some files like `commands/promo.js` require some setting like the base url of the server (you need that for the webserver), so make sure you fill it with your propperly set domain/ip address.

You will also need to create a .env file with the following

```bash
DISCORD_TOKEN=<your discord aplication token>
DISCORD_CLIENTID=<your discord bot cliend id>
```

You need to run the following once the project is installed and everytime you add a new /slash command.
```bash
node deploy-commands.js

```
Run the following to start the bot.
```bash
node index.js
```

By default, the screenshots will be saved on the `public/ss` folder, accessible from `http://<your ip/domain>:<port>/ss/<image file>`. Example:
```
http://localhost:8880/ss/f17076a99fcd2532.png
```

## Usage

```/promo link:<url>```
Sends an embed message with a screenshot of the page and some info on the listing.



## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)