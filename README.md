# SQF Lookup
## _Search for available APIs, keywords for Bohemia Interactive's SQF Script_

SQF Lookup is for finding Bohemia Interactive's SQF Srript keywords. It's powered by [Node.JS+](https://github.com/sdneon/node) and uses [SQF Language by Armitxes](https://marketplace.visualstudio.com/items?itemName=Armitxes.sqf), a Visual Code extension for SQF syntax highlighting.

## Usage
```
node sqf [optional_search_texts]
```
- Search text is case insensitive.
- Results will be returned for all _partial_ text matches.
- Thereafter, app enters query mode for more searches.
  - Simply key in search text, and hit <ENTER>.
  - ✨Magic ✨
- CTRL+C to quit.

Result shows:
- Each possible matching keyword and its description, etc., courtesy of the Armitxes extension.
- At the end of this list of individual matches, a summary list of all possible keyowrd(s) found.

## Update
* Download the `Armitxes.sqf*.VSIX` extension from [Visual Code extensions marketplace](https://marketplace.visualstudio.com/items?itemName=Armitxes.sqf).
  * The offline download choice is in the right panel, at the bottom, marked "Download Extension". 
* Replace the .VSIX in this app's root folder.
  * PS: this app will look for and use either the .VSIX or its extracted `sqfCommands.min.json` data file. The latter contains the keywords and their descriptions for SQF Script. 

# Thanks

Thanks to Armitxes for the excellent, informative extension =)