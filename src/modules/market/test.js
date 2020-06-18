const sharp = require('sharp');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

const posInfo = { map: 'prontera', x: 147, y: 59 };
const dir = path.dirname(__filename);
const map = `${dir}/maps/${posInfo.map}.png`;
const pin = { path: `${dir}/assets/pin.png`, width: 25, height: 34 };
const cacheDir = `${dir}/cache`;
const filename = `${posInfo.map}_${posInfo.x}_${posInfo.y}.png`;

function toCache(key, value) {
	const dir = path.dirname(__filename);
	const filename = `${dir}/cache/map.cache`;

	fs.readFile(filename, function read(err, data) {
		if (err) {
			throw err;
		}
		const cache = JSON.parse(data);
		cache[key] = value;
		console.log(cache,key,value);

		fs.writeFile(filename, JSON.stringify(cache), (err) => {
			if (err) return console.log(err);
		});
	});
}

function fromCache(key) {
	return new Promise()
}

toCache('prontera_asdf_asdf.png', 'https://asdfasdfsd.com');
toCache('dsfgsdfgdf.png', 'https://jtukkr.com');

//createPinMap(posInfo,function(filepath) {uploadImgur(filepath);});

function createPinMap(posInfo, callback) {
	const image = sharp(map);

	image.metadata()
		.then(function(metadata) {
			const filepath = `${cacheDir}/${filename}`;
			return image.composite([{
					input: pin.path,
					left: Math.round(posInfo.x - pin.width / 2),
					top: Math.round(metadata.height - posInfo.y - pin.height),
					gravity: 'south',
				}])
				.toFile(`${cacheDir}/${filename}`, (err, info) => {
					if (!err) {
						console.log( 'cached: ', {info, filename});
						callback(filepath);
					} else {
						console.log(err);
					}
				});
		});
}

function uploadImgur(filepath) {
	fs.readFile(filepath, (err, data) => {
		if (!err) {
			axios({
				'method': 'POST',
				'url': 'https://api.imgur.com/3/upload',
				'headers': {
					'Authorization': 'Client-ID 8c3e45c908a924f',
					'Content-Type': 'image/png',
				},
				data
			}).then(function({daza}) {
				console.log(response);
			}).catch(function(err) {
				console.log(err.data, err.data.data);
			});
		} else {
			console.log(err);
		}
	});
};
