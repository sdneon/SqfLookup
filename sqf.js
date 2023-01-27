#ds colors SQF script keywords lookup based on SQF extension by Armitxes (https://marketplace.visualstudio.com/items?itemName=Armitxes.sqf)

const COLOR_BRIGHT_GREEN = '\x1b[1m\x1b[32m',
    COLOR_BRIGHT_BLUE = '\x1b[1m\x1b[34m',
    COLOR_RESET = '\x1b[0m';

//try to detect data files. either direct .json or extract from .vsix

let DATA, DATA_CATS, DATA_CATS_SIZE;

const REGEX_FILENAME_VSIX = /armitxes\.sqf.*\.vsix/i; //e.g.: 'Armitxes.sqf-2.0.3.vsix';
const sfs = require('scopedfs');

#ts
const sqf = require('sqf-formatter');
#end

//
// sqf-formatter stuff/shims
//
class Range {
    start = 0;
    end = 0;
    constructor(s, e)
    {
        this.start = s;
        this.end = e;
    }
}
class Doc {
    code = '';
    constructor(code)
    {
        this.code = code.replaceAll(';', ';\n')
            //quick hack to separate comment from if-statement like: //do this if (cond) {
            .replaceAll('if ', '\nif ');
    }
    getText() { return this.code; }
    getRange() { return new Range(0, this.code.length); }
};
function prettifySqf(code)
{
    const doc = new Doc(code);
    return sqf.pretty(doc, doc.getRange())[0];
}

//try to extract from .vsix
async function extractDataFromVsix()
{
    return new Promise((resolve, reject) => {
        try
        {
            const folder = sfs.scoped(__dirname);
            folder.eachFileMatching(REGEX_FILENAME_VSIX, '.', false, undefined, (err, files) => {
                if (err || (files.length <= 0))
                {
                    console.log('WARNING: failed to find armitxes.sqf*.vsix!'.bold.warn);
                    reject();
                    return;
                }
                //just check 1st one
                const StreamZip = require('node-stream-zip');
                const zip = new StreamZip.async({ file: files[0] });
                zip.entryData('extension/env/shared/commands/sqfCommands.min.json')
                    .then((data) => {
                        DATA = JSON.parse(data.toString());
                        resolve();
                    })
                    .catch((reason) => {
                        console.log('WARNING: failed to parse sqfCommands.min.json from .vsix!\nOwing to:\n'.bold.warn, reason);
                        reject();
                        return;
                    })
                    .finally(() => {
                        zip.close();
                    });
             });
        } catch (ex) {
            console.log('WARNING: failed to extract sqfCommands.min.json from .vsix!\nOwing to:\n'.bold.warn, ex);
            reject();
        }
    });
}
extractDataFromVsix().then(() => {
    console.log('INFO: Using data from sqfCommands.min.json from .vsix'.bold.info);
    run();
}).catch((ignore) => {
    try
    {
        DATA = require('./sqfCommands.min.json');
        console.log('INFO: Using data from standalone sqfCommands.min.json'.bold.info);
        run();
    } catch (ex) {
        console.log('ERROR: Cannot find sqfCommands.min.json too, aborting!'.bold.error);
        console.log('Make sure you have either armitxes.sqf*.vsix or sqfCommands.min.json available!');
        process.exit(0);
    }
});

function run()
{
    const readline = require('readline'),
        rl = readline.createInterface(process.stdin);

    function ask()
    {
        console.log('Find:');
        rl.question("Find: ", (qn) => {
            find(qn);
            setImmediate(ask);
        });
    }

    DATA_CATS = Object.keys(DATA);
    DATA_CATS_SIZE = DATA_CATS.length;
    console.log("Usage: node sqf [search terms (case insensitive)...]");
    console.log("       Use 'quotes' for exact match only; o.w. partial matches are shown");
    if (process.argv.length >= 3)
    {
        for (let i = 2; i < process.argv.length; ++i)
        {
            find(process.argv[i]);
        }
    }
    ask();
}

//Pretty print info. E.g. print multiline example separately, instead of single string in JSON
//data: JSON containing info on a keyword
function printEntry(data, kw)
{
    data.url = `https://community.bistudio.com/wiki/${kw}`; //let's just assume its URL
    //'compress' tiny info morsels into single line for compactness
    const s = 'local:'.bold.cyan + data.local + ', server:'.bold.cyan + data.server
         + ', broadcasted:'.bold.cyan + data.broadcasted + ', reviewLevel:' + data.reviewLevel;
    const print = Object.assign({}, data);
    delete print.local;
    delete print.server;
    delete print.broadcasted;
    delete print.reviewLevel;
    const example = prettifySqf(data.example),
        printEgSeparately = example.split('\n').length > 1; //print multilines separately
    if (printEgSeparately)
        delete print.example;
    console.log(print, s);
    if (printEgSeparately)
    {
        console.log('---Example---'.bold.cyan);
        console.log(example);
        console.log('---');
    }
}

//search for given 'key' - can be partial
function find(key)
{
    key = key.trim().toLowerCase();
    console.log(`Searching for ${key}...`);
    const exactMatchOnly = (key[0] === '"') || (key[0] === "'");
    if (exactMatchOnly && (key.length >= 2))
    {
        key = key.substring(1, key.length - 1);
        console.log('(Exact match only)'.bold.debug);
    }
    let numFound = 0;
    const found = [];
    DATA_CATS.forEach((cat) => {
        const entries = DATA[cat], //category
            keywords = Object.keys(entries);
        keywords.forEach((kw) => {
            const kw2 = kw.toLowerCase(), //case insensitive match
                i = kw2.indexOf(key);
            if ((i === 0) && (kw.length === key.length))
            {
                ++numFound;
                found.push(kw);
                console.log(`${COLOR_BRIGHT_GREEN}${key}${COLOR_RESET} is in ${COLOR_BRIGHT_BLUE}${cat}${COLOR_RESET}`);
                printEntry(entries[kw], kw);
            }
            else if (!exactMatchOnly && (i >= 0))
            {
                ++numFound;
                found.push(kw);
                let s = '';
                if (i > 0)
                    s += kw.substring(0, i);
                const j = i + key.length;
                s += `${COLOR_BRIGHT_GREEN}${kw.substring(i, j)}\x1b[0m`;
                if (j < (s.length - 1))
                    s += kw.substring(j);
                    console.log(`${COLOR_BRIGHT_GREEN}${key}${COLOR_RESET} maybe ${s} in ${COLOR_BRIGHT_BLUE}${cat}${COLOR_RESET}`);
                    //console.log(`${COLOR_BRIGHT_GREEN}${key}${COLOR_RESET} maybe ${COLOR_BRIGHT_GREEN}${kw}${COLOR_RESET} in \x1b[1m\x1b[34m${cat}${COLOR_RESET}`);
                printEntry(entries[kw], kw);
            }
        });
    });
    if (numFound === 0) console.log('Nothing found');
    else
    {
        console.log('Found:', numFound);
        console.log(found);
    }
    console.log('---');
}

