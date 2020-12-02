const express = require('express');
const nocache = require('nocache');
const app = express();
app.use(nocache());

const index = 'index.html',
	popup = 'popup.html',
	iframe = 'iframe.html',
	image = 'image.jfif',
	headersMap = {
		coop: 'Cross-Origin-Opener-Policy',
		coep: 'Cross-Origin-Embedder-Policy',
		corp: 'Cross-Origin-Resource-Policy',
		cors: 'Access-Control-Allow-Origin'
	};

/*
  {
		popup.html: {
			coop: {value: '...', checked: '...'},
			coep: ...
			corp: ...
			cors: ...
		},
		iframe.html: {...},
		...
  }
*/
let headers = {};  

function getHeadersFor(file) {
	return Object.entries(headers[file] || {}).reduce((result, [k,v])=> {
		if (v.value) {
			result[headersMap[k]] = v.value;
		}
		return result;
	}, {});
} 

app.get(`/${index}`, (req, res) => {
	const crossorigin = req.query.crossorigin;
	
	const queryParamMap = Object.entries(req.query)
		.filter(k=>k!=='corssorigin')
		.reduce((result, [k,v])=>{
			let [file, coxx] = k.split('-');
			if (!result[file]) {
				result[file] = {};
			}
			result[file][coxx] = v;
			return result;
		}, {});

	headers = Object.fromEntries([index, popup, iframe, image].map(file => {
		let retVal = Object.fromEntries(Object.keys(headersMap).map(header=>[header, {checked: '', value: ''}]));
		let headersPerFile = queryParamMap[file];
		if (headersPerFile) {
			for (let [k,v] of Object.entries(headersPerFile)) {
				retVal[k].value = v;
				if (v) {
					retVal[k].checked='checked';
				}
			}
		}
		return [file, retVal];
	}));

	res.set(getHeadersFor(index));
	res.send(`
<!DOCTYPE html>
<html>

	<head>
		<title>COOP & COEP</title>
		<style>
			td,th,tr,table {
				border: 1px solid black;
			}
			img, iframe {
				height: 200px;
				width:  200px;
			}
		</style>
	</head>

	<body>
		<div>
			<a href="http://b.example:3000/${popup}" target="_blank">
				Click to open a cross-origin popup
			</a>
		</div>

		<div>
			<a href="http://localhost:3000/${popup}" target="_blank">
				Click to open a same-origin popup
			</a>
		</div>
		<div>
			<span>
				<img src="http://b.example:3000/${image}" ${crossorigin||''}></img>
			</span>

			<iframe src="http://b.example:3000/${iframe}"></iframe>
		</div>
		
		<form submit="${index}">
			<div>
				&lt;img src="..." <input type="checkbox" name="crossorigin" value="crossorigin" ${crossorigin=='crossorigin' ? 'checked' : ''}>crossorigin&gt;</div>
			</div>
			<table>
			<tr>
				<th>File</td>
				<th>COOP</td>
				<th>COEP</td>
				<th>CORP</td>
				<th>CORS</td>
			<tr>
			<tr>
				<td>${index}</td>
				<td><input type="checkbox" name="${index}-coop" value="same-origin" ${headers[index].coop.checked}>same-origin</input></td>
				<td><input type="checkbox" name="${index}-coep" value="require-corp" ${headers[index].coep.checked}>require-corp</input></td>
			</tr>
			<tr>
				<td>${popup}</td>
				<td><input type="checkbox" name="${popup}-coop" value="same-origin" ${headers[popup].coop.checked}>same-origin</input></td>
			</tr>
			<tr>
				<td>${iframe}</td>
				<td>
					<!--input type="checkbox" name="${iframe}-coop" value="same-origin" ${headers[iframe].coop.checked}>same-origin</input-->
				</td>
				<td>
					<!--input type="checkbox" name="${iframe}-coep" value="require-corp" ${headers[iframe].coep.checked}>require-corp</input-->
				</td>
				<td><input name="${iframe}-corp" type="checkbox" value="cross-origin" ${headers[iframe].corp.checked}>cross-origin</input></td>
			</tr>
			<tr>
				<td>${image}</td>
				<td/>
				<td/>
				<td><input name="${image}-corp" type="checkbox" value="cross-origin" ${headers[image].corp.checked}>cross-origin</input></td>
				<td><input name="${image}-cors" type="checkbox" value="*" ${headers[image].cors.checked}>*</input></td>
			</tr>
			</table>
			<input type="submit"></input>
		</form>
		<div>
			<a href="index.html">Start Over</a>
		</div>
		<script src="index.js"></script>
	</body>
</html>`);
})

app.get(`/${popup}`, (req, res) => {
	res.set(getHeadersFor(popup));
	res.sendFile(`${__dirname}/public/${popup}`);
})

app.get(`/${iframe}`, (req, res) => {
	res.set(getHeadersFor(iframe));
	res.sendFile(`${__dirname}/public/${iframe}`);
})

app.get(`/${image}`, (req, res) => {
	res.set(getHeadersFor(image));
	res.sendFile(`${__dirname}/public/${image}`);
})
app.get('/index.js', (req, res) => {
	res.sendFile(`${__dirname}/public/index.js`);
})
app.get('/popup.js', (req, res) => {
	res.sendFile(`${__dirname}/public/popup.js`);
})
app.listen(3000);