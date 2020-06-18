const { isEmpty } = require('lodash');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const util = require('util');
const { apiKeys, prefix } = require('../config.json');

class ImgurUploader {
	/**
	 * Class constructor.
	 *
	 * @param  {object} imagePath Path with filename to upload.
	 */
	constructor(imagePath) {
		this.imagePath = imagePath;
	}

	getImageUrl() {
		return new Promise(async (resolve, reject) => {
			// Convert fs.readFile into Promise version of same
			const readFile = util.promisify(fs.readFile);
			const data = await readFile(this.imagePath);

			if (apiKeys.imgur) {
				axios({
					'method': 'POST',
					'url': 'https://api.imgur.com/3/upload',
					'headers': {
						'Authorization': `Client-ID ${apiKeys.imgur}`,
						'Content-Type': 'image/png',
					},
					data
				}).then(({data}) => {
					resolve(data.data.link);
				}).catch((err)  =>{
					console.log('Upload to imgur failed', err);
					reject(err);
				});
			} else {
				console.log('Please provide your imgur Client-ID at the `config.json` file.');
				reject(false);
			}
		});
	}
}

module.exports = ImgurUploader;
