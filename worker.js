"use strict"

import * as mupdf from "./node_modules/mupdf/dist/mupdf.js"

console.log("worker.js")

addEventListener('message', async function(event) {
	const file = event.data; 

	console.log("Opening PDF");
	let pdf = mupdf.Document.openDocument(await file.arrayBuffer(), file.name);
	console.log(`Received PDF with ${pdf.countPages()} pages`);
});