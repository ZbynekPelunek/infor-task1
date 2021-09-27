const fs = require('fs');
const readline = require('readline');

const dataArr = [];

(async () => {
	const fileStream = fs.createReadStream('data.txt');

	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity,
	});

	for await (const line of rl) {
		dataArr.push(line.split('\t'));
	}
	const cust_noIndex = dataArr[0].findIndex((e) => e === 'cust_no');
	const date_modifiedIndex = dataArr[0].findIndex((e) => e === 'date_modified');

	const firstLine = dataArr.shift();
	//console.table(firstLine);

	for (let i = 0; i < dataArr.length; i++) {
		dataArr[i][cust_noIndex] = dataArr[i][cust_noIndex].replace('"', '');
		dataArr[i][date_modifiedIndex] = new Date()
			.toLocaleDateString('en-GB', { hour: 'numeric', minute: 'numeric' })
			.replace(',', '');
	}

	dataArr.sort((a, b) => {
		if (a[0] === b[0]) {
			return 0;
		} else {
			return a[0] < b[0] ? -1 : 1;
		}
	});

	dataArr.unshift(firstLine);
	//console.table(dataArr);

	returnModifiedData(dataArr);
})();

const returnModifiedData = (dataArr) => {
	const readInput = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	readInput.question(
		"Return the data as String or HTML? (Leave empty for String, type 'html' for HTML)\n",
		(answer) => {
			let returnType;
			if (answer === '' || answer === 'string') {
				returnType = 'String';
			} else if (answer === 'html') {
				returnType = 'HTML';
			} else {
                returnType = '';
            }
			console.log(`Data will be returned as ${returnType}`);
			readInput.close();

			const output = transformArr(dataArr, returnType);
			console.log(output);
		},
	);
};

const transformArr = (arr, type) => {
	let startString;
	let rowDerimeterStart;
    let rowDerimeterEnd;
	let columnDerimeterStart;
    let columnDerimeterEnd;
    let endString;

	switch (type) {
		case 'String':
			startString = rowDerimeterStart = columnDerimeterStart = endString = '';
			rowDerimeterEnd = '\n';
			columnDerimeterEnd = '\t';
			break;
		case 'HTML':
            startString = '<!DOCTYPE html>\n<html>\n\t<body>\n\t\t<table>\n';
            rowDerimeterStart = '\t\t\t<tr>\n';
            rowDerimeterEnd = '\t\t\t</tr>\n';
            columnDerimeterStart = '\t\t\t\t<td>';
            columnDerimeterEnd = '</td>\n';
            endString = '\t\t</table>\n\t</body>\n</html>';
			break;
		default:
			return 'type not defined';
	}

	let str = startString;
	for (let i = 0; i < arr.length; i++) {
		str += rowDerimeterStart;
		for (let j = 0; j < arr[i].length; j++) {
			str += columnDerimeterStart + arr[i][j] + columnDerimeterEnd;
		}
        str += rowDerimeterEnd;
	}
    str += endString;
	return str;
};
