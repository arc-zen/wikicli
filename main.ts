#!/usr/bin/env -S deno run --allow-net
// written by arczen#7561 in a single afternoon (~approx 5 hours) on the 22nd of October, 2022.
// if i come to it, i might clean it later. Daily maintenance is key to a happy home.

import * as colors from "https://deno.land/std@0.123.0/fmt/colors.ts";
import { replaceInStringWithColor } from "./helper.ts";
import { printImage } from "https://q5pm4p7grdz7x7dyza3ewa6hdgsamadnh2a7sciuozn4pxdp5rca.arweave.net/h17OP-aI8_v8eMg2SwPHGaQGAG0-gfkJFHZbx9xv7EQ/mod.ts";
// CONFIG
async function main() {
	const config = {
		// Useful for contrast or if your command line doesnt want to show some text formatting
		useColors: true,
		// if useColors is true, the color that is used for bold text
		boldColor: colors.brightGreen,
		// if useColors is true, the color that is used for italic text
		italicColor: colors.brightBlue,
		// its not recommended you turn this off. Appends "?redirect=true" to the end of the url, in case the page redirects you.
		REDIRECT: true,
		//image settings
		// width of the image. opt for a smaller size, usually <50, otherwise your console lags. Setting to undefined will error.
		imageWidth: 25,
		// whether the image has color
		imageHasColor: true,
	};
	// -
	// arg shenanigans
	const args = [...Deno.args];
	const result = [];
	// delete the first argument. The first argument is returned and is set to wikiArg, and the "args" array is updated.
	const wikiArg = args.shift() ?? "";
	// initialize variables
	let wiki = new String();
	let _matchedWiki;
	// because of the way i structured this array, i have to handle the info it has in a special way. The data is nested, so I have to do extra work, but it is more concise and clean.
	const wikis = [
		{ aliases: ["wikipedia", "wp"], site: "https://en.wikipedia.org/api/rest_v1/page/summary/", actualSite: "https://en.wikipedia.org/wiki/" },
		{
			aliases: ["simple_wikipedia", "swp"],
			site: "https://simple.wikipedia.org/api/rest_v1/page/summary/",
			actualSite: "https://simple.wikipedia.org/wiki/",
		},
	];
	for (const element of wikis) {
		if (!element.aliases.includes(wikiArg)) {
			result.push(false);
		} else {
			result.push(true);
			_matchedWiki = wikis.find((element) => element.aliases.includes(wikiArg));
			break;
		}
	}
	// if there were no matches in the ENTIRE result array, then throw the error. If there is one match, it works okay.
	if (result.every((result) => result === false)) {
		throw new Error('missing wiki type ("wikipedia" or "wp" or "simple_wikipedia" or "swp") was expected, but none was found.');
	}
	if (args.length < 2) throw new Error('missing wiki prompt. You need a prompt to look up. For example, try "Burts Bees".');
	// encode the URI by appending it to the site, plus the arguments joined by a "_", plus a "?redirect=true" if config.REDIRECT is true.
	wiki = encodeURI(_matchedWiki?.site + args.join("_") + (config.REDIRECT ? "?redirect=true" : ""));

	const response = await fetch(wiki.toString());
	const responseJSON = await response.json();
	if (responseJSON.title === "Not found.") throw new Error("page doesnt exist :(");

	const title = responseJSON.title;
	const description = responseJSON.description;

	// remove all HTML tags that are not <b>, </b>, <i>, or </i>.
	let extract = responseJSON.extract_html.replace(/<\/?[^b^i]>/g, "").toString();
	// replace the strings in between the matches of <b> and </b> with the bold version of that string.
	extract = replaceInStringWithColor(extract, /(?<=<[b]>).*?(?=<\/[b])/g, config.useColors ? config.boldColor : colors.bold);
	// replace the strings in between the matches of <i> and </i> with the italic version of that string.
	extract = replaceInStringWithColor(extract, /(?<=<[i]>).*?(?=<\/[i])/g, config.useColors ? config.italicColor : colors.bold);
	// finally, remove all html tags. also final formatting to flatten out some other things
	extract = extract
		.replace(/<\/?[a-z]*( [a-z]*="[a-z]*")?>/g, "")
		.replace(/&amp;/g, "&")
		.toString();
	if (responseJSON.originalimage)
		printImage({
			path: responseJSON.originalimage.source,
			width: config.imageWidth,
			color: config.imageHasColor,
		});
	else console.log(colors.gray("no image :("));
	console.log(`
${colors.bold(colors.blue(title))}
	${colors.brightBlue(description)}

${extract}
${colors.gray(_matchedWiki?.actualSite + args.join("_") ?? "")}
`);
}
if (import.meta.main) {
	main();
}
