/*@license
	this is a test file for testing the comments removal of Comments remover
	
	- 	This file is part of comment stripper program
- 	that allows to strip comments C style (single and block) 
- 	and whitespaces
- Copyright (C) 2021 DaniS Software
*/

var abc = {};

/* this is a block comment that will be removed*/

abc.push("krs");
abc.push("adasdf"); //@license this a single line comment test that should not be removed

abc.forEach((el)=>//this is a single line comments test and will be removed
{
	console.log(el);
});