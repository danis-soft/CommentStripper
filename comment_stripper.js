/* @license
	- 	This file is part of comment stripper program
- 	that allows to strip comments C style (single and block) 
- 	and whitespaces
- Copyright (C) 2021 DaniS Software
*/

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv
var fs = require("fs");
var path = require("path");

const DEFAULT_CONFIG_NAME = "comment.stripper.config.json";

var sConfigFileName = "comment.stripper.config.json";

const DEFAULT_OUTPUT_APPEND = ".strip";
const DEFAULT_PATH_OUTPUT = ".\\output\\";

/*
{
	input:[],//required array of strings
	output:[], //optional, array of strings
  OutputPath:{string},//optional - string
  exclude:[] //optional, array of strings
  whitespace_remove: true
  "except": {string}//optional - thi
}
*/

const DEFAULT_OPTIONS = 
{
  "comment_blocks":
  {
    "remove": true
	},
  "comment_single":
  {	
    "remove": true
  },
  "whitespace":
  {	

    "remove": true
  }
};

var aRegex = [
        {
          name: "comment_blocks",
          reg: /\/\*[\s\S]+?\*\//g,
          except: /\/\*(?!\s*{sub})[\s\S]+?\*\//gm,
        }
        ,
        {
          name: "comment_single",
          reg: /\/\/.*$/gm,
          except:  /\/\/(?!\s*{sub}).*$/gm
        },
        {
          name: "whitespace",
          reg: /^\s*$/gm,
          except: /^\s*$/gm,
        
        }
      ];

var aConfig = {};

function createNewRegExpression(regexOriginal, sSubstitute)
{
  var sRegex = regexOriginal.source;

  var regexNew = new RegExp(sRegex.replace("{sub}", sSubstitute), regexOriginal.flags);

  return regexNew;
}

main();

async function main()
{

  try{


      if( isVariableNull(argv.config))
      {
        sConfigFileName = DEFAULT_CONFIG_NAME;
      }
      else if( argv.config.length > 0)
      {
        sConfigFileName = argv.config;
      }

      if( !fs.existsSync(sConfigFileName) )
      {
          var e = new Error("Config file not found " + sConfigFileName);
          e.code = 'NotFound';
          throw e;
      }

      var oData = await readFile(sConfigFileName);

      aConfig = JSON.parse(oData);

      
      if( isVariableNull(aConfig.input))
      {
        var e = new Error("No input specified in the config file: " + sConfigFileName);
        error.code = 'NoValidInut';
        throw e;
      }

      if( isVariableNull(aConfig.output))
      {
        aConfig.output = createOutputFileNames(aConfig.input);
      }

      if( isVariableNull(aConfig.OutputPath))
      {
        aConfig.OutputPath = DEFAULT_PATH_OUTPUT;
      }

      if( isVariableNull(aConfig.options))
      {
        aConfig.OutputPath = DEFAULT_OPTIONS;
        console.log("Did not find options specified in the configuraiton file.  Using defaults");
      }

      

  }
  catch(err)
  {
      if( err instanceof SyntaxError)
          console.log("Error parsing the configuration data from " + sConfigFileName +  " file.");
      else if ( err.code === 'ENOENT')
          console.log("Could not read the contents of " + sConfigFileName);
      else if(err.code === 'NotFound')
      {
          console.log(err.message);
      }
      else if( err.code === 'NoValidInput')
      {
        console.log(err.message);
      }
      process.exit(1);
  }


  var sData = "";


  var aUsedRegex = [];

  aUsedRegex = getUsedRegex(isVariableNotNull(aConfig.except) && aConfig.except.length > 0);

  for(i = 0; i < aConfig.input.length; i++)
  {

    try{
      sData =  await readFile(aConfig.input[i]);
      
      console.log("Processing file: " + aConfig.input[i]);

      aUsedRegex.forEach((el)=>{
        sData = sData.replace(el, "");
      });

      await fs.promises.mkdir((aConfig.OutputPath) + path.dirname(aConfig.output[i]), {recursive: true});
      await fs.promises.writeFile(aConfig.OutputPath +  aConfig.output[i], sData);
      console.log("Writing file: " + aConfig.OutputPath +  aConfig.output[i]);
      
    }
    catch(e)
    {
      console.log("Encountered an error: " + e);
    }

  }//for

}//function main

function getUsedRegex(bExceptDefined)
{
  var aUsedRegex = [];

  if( !bExceptDefined )
  {
     aRegex.forEach((el)=>{
      if( aConfig.options[el.name].remove) 
        aUsedRegex.push(el.reg);
     });
  }
  else
  {
    aRegex.forEach((el)=>{
      if( aConfig.options[el.name].remove) 
      {
        var regexNew = createNewRegExpression(el.except, aConfig.except);
        aUsedRegex.push(regexNew);
      }
     });
  }


  return aUsedRegex;
}//getUsedRegex



/*
go through the file and first remove the entire comment blocks
//then remove the line comments like this //
*/

function createFileName(sOriginal, sAppendix)
{
  var regex = /^.*(\.[\w]+)$/;

  var aMatch = [];
  var sOutput = "";

  aMatch = sOriginal.match(regex);

  if( aMatch.length > 0 )
    sOutput = sOriginal.replace(aMatch[1], sAppendix + aMatch[1]);
  else
    sOutput  = el + DEFAULT_OUTPUT_APPEND;

    return sOutput;
}


function createOutputFileNames(aInputNames)
{
  var aOutput = [];
  var sOutput = "";
 

  aInputNames.forEach((el)=>{
    sOutput = createFileName(el, DEFAULT_OUTPUT_APPEND);
    aOutput.push(sOutput);

  });

  return aOutput;
}

String.prototype.isMatched = function(regEx)
{
    if( this.search(regEx) > -1)
      return true;

    return false;

}


async function readFile(filePath) {
  try {
    const data = await fs.promises.readFile(filePath, { encoding: 'utf8' })
//console.log(data)

    return data;
  } catch (error) {
    console.error(error.message)
  }
}


function isVariableNull(val)
{
  return !isVariableNotNull(val);
}

function isVariableNotNull(val)
{
  if (typeof val !== 'undefined' && val) 
  {
    return true;
  }

  return false;
}


