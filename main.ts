#!/usr/bin/env -S deno run --allow-net
import * as colors from "https://deno.land/std@0.123.0/fmt/colors.ts";
import { replaceInStringWithColor } from "./helper.ts";
import { printImage } from "https://q5pm4p7grdz7x7dyza3ewa6hdgsamadnh2a7sciuozn4pxdp5rca.arweave.net/h17OP-aI8_v8eMg2SwPHGaQGAG0-gfkJFHZbx9xv7EQ/mod.ts";
// CONFIG
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
if (args.length < 2) throw new Error("missing wiki prompt");
const wikiArg = args.shift() ?? "";
let wiki = new String();
let _matchedWiki;
const wikis = [
	{ aliases: ["wikipedia", "wp"], site: "https://en.wikipedia.org/api/rest_v1/page/summary/", actualSite: "https://en.wikipedia.org/wiki/" },
	{ aliases: ["simple_wikipedia", "swp"], site: "https://simple.wikipedia.org/api/rest_v1/page/summary/", actualSite: "https://simple.wikipedia.org/wiki/" },
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
if (result.every((result) => result === false)) {
	throw new Error("missing wiki type");
}

wiki = encodeURI(_matchedWiki?.site + args.join("_") + (config.REDIRECT ? "?redirect=true" : ""));

const response = await fetch(wiki.toString());
const responseJSON = await response.json();

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
